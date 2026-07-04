/* Data Access Object (DAO) module for accessing sandwiches data */
import db from './db.mjs';

import { dbAllAsync, dbGetAsync, dbRunAsync } from './helpers/index.mjs';

// This function returns the list of sandwich sizes with current availability.
const listSizes = async () => {
  const [allSandwich, confirmedOrders] = await Promise.all([
    dbAllAsync(db, 'SELECT * FROM sandwich_sizes ORDER BY price'),
    dbAllAsync(
      db,
      `
    SELECT order_sandwiches.sizeId, order_sandwiches.quantity FROM order_sandwiches
    JOIN orders ON orders.id = order_sandwiches.orderId
    WHERE orders.status = 'confirmed'
    `,
    ),
  ]);
  return allSandwich.map((sandwich) => ({
    ...sandwich,
    available:
      sandwich.dailyLimit -
      confirmedOrders
        .filter((confirmedOrder) => confirmedOrder.sizeId === sandwich.id)
        .reduce((sum, confirmedOrder) => sum + confirmedOrder.quantity, 0),
  }));
};

// This function returns the list of main ingredients.
const listMainIngredients = async () => {
  return await dbAllAsync(db, 'SELECT * FROM main_ingredients ORDER BY name');
};

// This function returns the list of breads.
const listBreads = async () => {
  return await dbAllAsync(db, 'SELECT * FROM breads ORDER BY name');
};

// This function returns the list of optional ingredients.
const listOptionalIngredients = async () => {
  return await dbAllAsync(
    db,
    'SELECT * FROM optional_ingredients ORDER BY name',
  );
};

// This function returns the list of dressings.
const listDressings = async () => {
  return await dbAllAsync(db, 'SELECT * FROM dressings ORDER BY name');
};

// This function returns an order of a user, given its id.
const getOrder = async (userId, orderId) => {
  return await dbGetAsync(
    db,
    'SELECT * FROM orders WHERE id = ? AND userId = ?',
    [orderId, userId],
  );
};

// This function inserts a new confirmed order and returns its id.
const insertOrder = async (userId, totalPrice) => {
  const result = await dbRunAsync(
    db,
    'INSERT INTO orders (userId, totalPrice, status) VALUES (?, ?, ?)',
    [userId, totalPrice, 'confirmed'],
  );
  return result.lastID;
};

// This function inserts a sandwich of an order, with its optional ingredients and dressings.
const insertOrderSandwich = async (orderId, sandwich) => {
  const result = await dbRunAsync(
    db,
    `INSERT INTO order_sandwiches
     (orderId, sizeId, mainIngredientId, breadId, quantity, unitPrice)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      orderId,
      sandwich.sizeId,
      sandwich.mainIngredientId,
      sandwich.breadId,
      sandwich.quantity,
      sandwich.unitPrice,
    ],
  );

  for (const ingredientId of sandwich.ingredientIds) {
    await dbRunAsync(
      db,
      'INSERT INTO order_sandwich_ingredients (sandwichId, ingredientId) VALUES (?, ?)',
      [result.lastID, ingredientId],
    );
  }

  for (const dressingId of sandwich.dressingIds) {
    await dbRunAsync(
      db,
      'INSERT INTO order_sandwich_dressings (sandwichId, dressingId) VALUES (?, ?)',
      [result.lastID, dressingId],
    );
  }
};

// This function adds a (possibly negative) amount to the balance of a user.
const updateBalance = async (userId, amount) => {
  await dbRunAsync(db, 'UPDATE users SET balance = balance + ? WHERE id = ?', [
    amount,
    userId,
  ]);
};

// This function returns all the orders of a user.
const listOrders = async (userId) => {
  const orders = await dbAllAsync(
    db,
    'SELECT * FROM orders WHERE userId = ? AND status = ? ORDER BY id DESC',
    [userId, 'confirmed'],
  );

  const [sizes, mainIngredients, breads, optionalIngredients, dressings] =
    await Promise.all([
      dbAllAsync(db, 'SELECT * FROM sandwich_sizes'),
      listMainIngredients(),
      listBreads(),
      listOptionalIngredients(),
      listDressings(),
    ]);

  for (const order of orders) {
    const sandwiches = await dbAllAsync(
      db,
      'SELECT * FROM order_sandwiches WHERE orderId = ? ORDER BY id',
      [order.id],
    );

    for (const sandwich of sandwiches) {
      const size = sizes.find((size) => size.id === sandwich.sizeId);
      sandwich.size = size.name;
      sandwich.sizePrice = size.price;
      sandwich.includedIngredients = size.includedIngredients;
      sandwich.maxDressings = size.maxDressings;
      sandwich.mainIngredient = mainIngredients.find(
        (ingredient) => ingredient.id === sandwich.mainIngredientId,
      ).name;
      sandwich.bread = breads.find((bread) => bread.id === sandwich.breadId).name;

      const ingredientLinks = await dbAllAsync(
        db,
        'SELECT * FROM order_sandwich_ingredients WHERE sandwichId = ?',
        [sandwich.id],
      );
      sandwich.ingredients = [];
      for (const link of ingredientLinks) {
        const ingredient = optionalIngredients.find(
          (optionalIngredient) => optionalIngredient.id === link.ingredientId,
        );
        sandwich.ingredients.push(ingredient);
      }

      const dressingLinks = await dbAllAsync(
        db,
        'SELECT * FROM order_sandwich_dressings WHERE sandwichId = ?',
        [sandwich.id],
      );
      sandwich.dressings = [];
      for (const link of dressingLinks) {
        const dressing = dressings.find(
          (orderDressing) => orderDressing.id === link.dressingId,
        );
        sandwich.dressings.push(dressing);
      }
    }

    order.sandwiches = sandwiches;
  }

  return orders;
};

// This function cancels an order of a user and refunds 90% of the price.
const cancelOrder = async (userId, orderId) => {
  const order = await getOrder(userId, orderId);

  if (!order) {
    return { error: 'Order not found' };
  }

  if (order.status !== 'confirmed') {
    return { error: 'Order already cancelled' };
  }

  await dbRunAsync(
    db,
    'UPDATE orders SET status = ? WHERE id = ? AND userId = ?',
    ['cancelled', orderId, userId],
  );

  const refund = Number((order.totalPrice * 0.9).toFixed(2));
  await updateBalance(userId, refund);

  return { refund };
};

const checkOrder = async (userId, sandwiches) => {
  const errors = [];

  const [sizes, mainIngredients, breads, optionalIngredients, dressings, user] =
    await Promise.all([
      listSizes(),
      listMainIngredients(),
      listBreads(),
      listOptionalIngredients(),
      listDressings(),
      dbGetAsync(db, 'SELECT balance FROM users WHERE id = ?', [userId]),
    ]);

  const checkedSandwiches = [];
  const requestedBySize = {};
  let totalPrice = 0;
  let totalQuantity = 0;

  for (const sandwich of sandwiches) {
    const size = sizes.find((size) => size.id === sandwich.sizeId);
    const ingredientIds = sandwich.ingredientIds;
    const dressingIds = sandwich.dressingIds;
    const quantity = sandwich.quantity;
    const mainIngredientId = sandwich.mainIngredientId;
    const breadId = sandwich.breadId;

    if (!size) errors.push('Invalid sandwich size');
    if (!mainIngredients.find((ingredient) => ingredient.id === mainIngredientId))
      errors.push('Invalid main ingredient');
    if (!breads.find((bread) => bread.id === breadId)) errors.push('Invalid bread');

    for (const id of ingredientIds) {
      if (!optionalIngredients.find((ingredient) => ingredient.id === id)) {
        errors.push('Invalid optional ingredient');
        break;
      }
    }

    for (const id of dressingIds) {
      if (!dressings.find((dressing) => dressing.id === id)) {
        errors.push('Invalid dressing');
        break;
      }
    }

    if (
      ingredientIds.some(
        (id) => ingredientIds.indexOf(id) !== ingredientIds.lastIndexOf(id),
      )
    )
      errors.push('Duplicate ingredient');
    if (
      dressingIds.some(
        (id) => dressingIds.indexOf(id) !== dressingIds.lastIndexOf(id),
      )
    )
      errors.push('Duplicate dressing');

    if (size && dressingIds.length > size.maxDressings)
      errors.push('Too many dressings');

    if (!size) continue;

    const extraIngredients = Math.max(
      0,
      ingredientIds.length - size.includedIngredients,
    );
    const unitPrice = size.price * (1 + 0.3 * extraIngredients);

    requestedBySize[size.id] = (requestedBySize[size.id] || 0) + quantity;
    totalQuantity += quantity;
    totalPrice += unitPrice * quantity;

    checkedSandwiches.push({
      sizeId: size.id,
      mainIngredientId,
      breadId,
      ingredientIds,
      dressingIds,
      quantity,
      unitPrice,
    });
  }

  if (totalQuantity >= 4) totalPrice = totalPrice * 0.8;
  totalPrice = Number(totalPrice.toFixed(2));

  for (const size of sizes) {
    if ((requestedBySize[size.id] || 0) > size.available)
      errors.push('Not enough ' + size.id + ' sandwiches');
  }

  if (user && user.balance < totalPrice) errors.push('Insufficient credit');

  return { errors, sandwiches: checkedSandwiches, totalPrice };
};

// This function checks and creates a new confirmed order.
const createOrder = async (userId, sandwiches) => {
  const checkedOrder = await checkOrder(userId, sandwiches);

  if (checkedOrder.errors.length > 0) {
    return { errors: checkedOrder.errors };
  }

  const orderId = await insertOrder(userId, checkedOrder.totalPrice);

  for (const sandwich of checkedOrder.sandwiches) {
    await insertOrderSandwich(orderId, sandwich);
  }

  await updateBalance(userId, -checkedOrder.totalPrice);

  return { id: orderId, totalPrice: checkedOrder.totalPrice };
};

export default {
  listSizes,
  listMainIngredients,
  listBreads,
  listOptionalIngredients,
  listDressings,
  listOrders,
  cancelOrder,
  createOrder,
};
