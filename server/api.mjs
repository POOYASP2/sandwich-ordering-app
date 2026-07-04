import express from 'express';
import passport from 'passport';
import { check, validationResult } from 'express-validator';
import { TOTP } from 'otpauth';

import userDao from './dao-users.mjs';
import sandwichDao from './dao-sandwiches.mjs';

const router = express.Router();

/*** Middleware ***/

const isLoggedIn = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  return res.status(401).json({ error: 'Not authenticated' });
};

function isTotpDone(req, res, next) {
  if (req.session.method === 'totp') return next();
  return res.status(401).json({ error: 'Missing TOTP authentication' });
}

/*** Utility functions ***/

function verifyTotpToken(user, token) {
  const totp = new TOTP({
    algorithm: 'SHA1',
    digits: 6,
    period: 30,
    secret: user.secret,
  });

  const delta = totp.validate({ token, window: 1 });
  if (delta === null) return false;

  // actual_step = current_counter + delta
  const actualStep = totp.counter() + delta;
  if (actualStep <= user.lastTotpStep) return false; // Reject replay or older step

  user.lastTotpStep = actualStep;
  return true;
}

async function clientUserInfo(req) {
  const user = await userDao.getUserById(req.user.id);
  return {
    id: user.id,
    username: user.username,
    name: user.name,
    balance: user.balance,
    canDoTotp: !!user.secret,
    isTotp: req.session.method === 'totp',
  };
}

/*** Sandwiches APIs ***/

// GET /api/sandwich-options
router.get('/sandwich-options', async (req, res) => {
  try {
    const [sizes, mainIngredients, breads, optionalIngredients, dressings] = await Promise.all([
      sandwichDao.listSizes(),
      sandwichDao.listMainIngredients(),
      sandwichDao.listBreads(),
      sandwichDao.listOptionalIngredients(),
      sandwichDao.listDressings(),
    ]);
    res.json({ sizes, mainIngredients, breads, optionalIngredients, dressings });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Database error' });
  }
});

// GET /api/orders
router.get('/orders', isLoggedIn, async (req, res) => {
  try {
    const orders = await sandwichDao.listOrders(req.user.id);
    res.json(orders);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Database error' });
  }
});

// POST /api/orders
router.post('/orders', isLoggedIn,
  [
    check('sandwiches', 'The order must contain at least one sandwich').isArray({ min: 1 }),
    check('sandwiches.*.sizeId', 'Invalid sandwich size').isString().notEmpty(),
    check('sandwiches.*.mainIngredientId', 'Invalid main ingredient').isInt({ min: 1 }),
    check('sandwiches.*.breadId', 'Invalid bread').isInt({ min: 1 }),
    check('sandwiches.*.quantity', 'Invalid quantity').isInt({ min: 1 }),
    check('sandwiches.*.ingredientIds', 'Invalid ingredients').isArray(),
    check('sandwiches.*.ingredientIds.*', 'Invalid ingredient').isInt({ min: 1 }),
    check('sandwiches.*.dressingIds', 'Invalid dressings').isArray(),
    check('sandwiches.*.dressingIds.*', 'Invalid dressing').isInt({ min: 1 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(422).json({ errors: errors.array().map((error) => error.msg) });
    try {
      const result = await sandwichDao.createOrder(req.user.id, req.body.sandwiches);
      if (result.errors)
        return res.status(422).json({ errors: result.errors });
      res.status(201).json(result);
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: 'Database error' });
    }
  }
);

// DELETE /api/orders/:id
router.delete('/orders/:id', isLoggedIn, isTotpDone, async (req, res) => {
  try {
    const result = await sandwichDao.cancelOrder(req.user.id, req.params.id);
    if (result.error)
      return res.status(404).json({ error: result.error });
    res.status(200).json(result);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Database error' });
  }
});

/*** Users APIs ***/

// POST /api/sessions
router.post('/sessions', function (req, res, next) {
  passport.authenticate('local', (err, user, info) => {
    if (err) return next(err);
    if (!user) {
      return res.status(401).json({ error: info });
    }
    req.login(user, (err) => {
      if (err) return next(err);
      req.session.method = 'password';
      clientUserInfo(req)
        .then((user) => res.json(user))
        .catch((err) => next(err));
    });
  })(req, res, next);
});

// POST /api/login-totp
router.post('/login-totp', isLoggedIn, async (req, res) => {
  if (!req.user.secret) {
    return res.status(400).json({ error: 'Cannot authenticate with TOTP' });
  }
  const success = verifyTotpToken(req.user, req.body.code);
  if (success) {
    req.session.method = 'totp';
    try {
      await userDao.updateLastTotpStep(req.user.id, req.user.lastTotpStep);
    } catch (err) {
      console.log(err);
      return res.status(503).json({ error: 'Database error' });
    }
    return res.json({ otp: 'authorized' });
  } else {
    return res.status(401).json({ error: 'Cannot authenticate with TOTP' });
  }
});

// GET /api/sessions/current
router.get('/sessions/current', (req, res) => {
  if (req.isAuthenticated()) {
    clientUserInfo(req)
      .then((user) => res.status(200).json(user))
      .catch((err) => {
        console.log(err);
        res.status(500).json({ error: 'Database error' });
      });
  } else {
    res.status(401).json({ error: 'Not authenticated' });
  }
});

// DELETE /api/sessions/current
router.delete('/sessions/current', (req, res) => {
  req.logout(() => {
    res.status(200).json({});
  });
});

export default router;
