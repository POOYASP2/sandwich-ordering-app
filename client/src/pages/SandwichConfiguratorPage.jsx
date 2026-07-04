import { useContext, useEffect, useState } from 'react';
import { Alert, Badge, Button, Card, Col, Form, ListGroup, Row, Spinner, Stack } from 'react-bootstrap';
import { getSandwichOptions, submitOrder } from '../API.js';
import { CartTable } from '../components/CartTable.jsx';
import { AuthContext, CartContext } from '../contexts.js';

function SandwichConfiguratorPage() {
  const { handleRefreshUser, handleLogout } = useContext(AuthContext);
  const { cart, handleCartChange } = useContext(CartContext);
  const [isWaiting, setIsWaiting] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [options, setOptions] = useState(null);
  const [errors, setErrors] = useState([]);
  const [message, setMessage] = useState('');

  const [sizeId, setSizeId] = useState('');
  const [mainIngredientId, setMainIngredientId] = useState('');
  const [breadId, setBreadId] = useState('');
  const [ingredientIds, setIngredientIds] = useState([]);
  const [dressingIds, setDressingIds] = useState([]);
  const [quantity, setQuantity] = useState(1);

  const loadOptions = () => {
    setIsWaiting(true);
    return getSandwichOptions()
      .then((options) => {
        setOptions(options);
        setSizeId((options.sizes.find((size) => size.available > 0) || options.sizes[0])?.id || '');
        setMainIngredientId(options.mainIngredients[0]?.id.toString() || '');
        setBreadId(options.breads[0]?.id.toString() || '');
        setErrors([]);
      })
      .catch((err) => {
        if (err[0] === 'Not authenticated') handleLogout();
        else setErrors(err);
      })
      .finally(() => setIsWaiting(false));
  };

  useEffect(() => {
    loadOptions();
  }, []);

  if (isWaiting) {
    return (
      <Stack className='my-3'>
        <Spinner animation='border' role='status' />
      </Stack>
    );
  }

  if (!options) {
    return (
      <Alert variant='danger' className='my-3'>
        Cannot load sandwich data
      </Alert>
    );
  }

  const getAvailableQuantity = (size) => {
    return size.available - cart
      .filter((sandwich) => sandwich.size.id === size.id)
      .reduce((sum, sandwich) => sum + sandwich.quantity, 0);
  };

  const availableSizes = options.sizes.filter((size) => getAvailableQuantity(size) > 0);
  const size = availableSizes.find((availableSize) => availableSize.id === sizeId) || availableSizes[0] || options.sizes[0];
  const mainIngredient = options.mainIngredients.find((ingredient) => ingredient.id === Number(mainIngredientId));
  const bread = options.breads.find((breadOption) => breadOption.id === Number(breadId));
  const selectedIngredients = options.optionalIngredients.filter((ingredient) => ingredientIds.includes(ingredient.id));
  const selectedDressings = options.dressings.filter((dressing) => dressingIds.includes(dressing.id));

  const extraIngredients = Math.max(0, ingredientIds.length - size.includedIngredients);
  const unitPrice = size.price * (1 + 0.3 * extraIngredients);
  const totalPrice = unitPrice * quantity;
  const maxQuantity = getAvailableQuantity(size);

  const toggleIngredient = (id) => {
    setIngredientIds((current) => {
      if (current.includes(id)) return current.filter((ingredientId) => ingredientId !== id);
      else return [...current, id];
    });
  };

  const toggleDressing = (id) => {
    setDressingIds((current) => {
      if (current.includes(id)) return current.filter((dressingId) => dressingId !== id);
      if (current.length >= size.maxDressings) return current;
      else return [...current, id];
    });
  };

  const handleAddSandwich = (event) => {
    event.preventDefault();
    const formErrors = [];
    if (availableSizes.length === 0) formErrors.push('No sandwich size is available now');
    if (quantity < 1) formErrors.push('Quantity must be at least 1');
    if (quantity > maxQuantity) formErrors.push('Not enough sandwiches of this size');
    if (dressingIds.length > size.maxDressings) formErrors.push('Too many dressings');

    if (formErrors.length > 0) {
      setErrors(formErrors);
      return;
    }

    handleCartChange((current) => [
      ...current,
      { size, mainIngredient, bread, ingredients: selectedIngredients, dressings: selectedDressings, quantity, unitPrice, totalPrice },
    ]);

    setErrors([]);
    setMessage('');
    setIngredientIds([]);
    setDressingIds([]);
    setQuantity(1);
  };

  const handleUpdateCartQuantity = (index, quantity) => {
    const sandwich = cart[index];
    const currentSize = options.sizes.find((size) => size.id === sandwich.size.id);
    const otherQuantity = cart
      .filter((otherSandwich, otherIndex) => otherIndex !== index && otherSandwich.size.id === sandwich.size.id)
      .reduce((sum, otherSandwich) => sum + otherSandwich.quantity, 0);
    const maxQuantity = currentSize.available - otherQuantity;

    if (!Number.isInteger(quantity) || quantity < 1) {
      setErrors(['Quantity must be at least 1']);
      return;
    }
    if (quantity > maxQuantity) {
      setErrors(['Not enough sandwiches of this size']);
      return;
    }

    handleCartChange((current) => current.map((cartSandwich, cartIndex) => {
      if (cartIndex !== index) return cartSandwich;
      else return { ...cartSandwich, quantity, totalPrice: cartSandwich.unitPrice * quantity };
    }));
    setErrors([]);
  };

  const handleRemoveCartSandwich = (index) => {
    handleCartChange((current) => current.filter((sandwich, sandwichIndex) => sandwichIndex !== index));
    setErrors([]);
  };

  // Load a cart sandwich back into the form to modify it, and remove it from the cart
  const handleEditCartSandwich = (index) => {
    const sandwich = cart[index];
    setSizeId(sandwich.size.id);
    setMainIngredientId(sandwich.mainIngredient.id.toString());
    setBreadId(sandwich.bread.id.toString());
    setIngredientIds(sandwich.ingredients.map((ingredient) => ingredient.id));
    setDressingIds(sandwich.dressings.map((dressing) => dressing.id));
    setQuantity(sandwich.quantity);
    handleCartChange((current) => current.filter((cartSandwich, cartIndex) => cartIndex !== index));
    setErrors([]);
    setMessage('');
  };

  const handleConfirmOrder = () => {
    if (cart.length === 0) {
      setErrors(['The order must contain at least one sandwich']);
      return;
    }

    const sandwiches = cart.map((sandwich) => ({
      sizeId: sandwich.size.id,
      mainIngredientId: sandwich.mainIngredient.id,
      breadId: sandwich.bread.id,
      ingredientIds: sandwich.ingredients.map((ingredient) => ingredient.id),
      dressingIds: sandwich.dressings.map((dressing) => dressing.id),
      quantity: sandwich.quantity,
    }));

    setIsSubmitting(true);
    submitOrder(sandwiches)
      .then((order) => {
        handleCartChange([]);
        handleRefreshUser();
        loadOptions();
        setErrors([]);
        setMessage('Order confirmed. Total paid: ' + order.totalPrice + ' euro');
      })
      .catch((err) => {
        setMessage('');
        if (err[0] === 'Not authenticated') handleLogout();
        else setErrors(err);
      })
      .finally(() => setIsSubmitting(false));
  };

  return (
    <>
      <Card.Title as='h2' className='my-3'>New order</Card.Title>
      {errors.length > 0 ? (
        <Alert variant='danger'>
          {errors.length === 1 ? errors[0] : (
            <ListGroup>
              {errors.map((error, index) => <ListGroup.Item key={index}>{error}</ListGroup.Item>)}
            </ListGroup>
          )}
        </Alert>
      ) : null}
      {message ? <Alert variant='success'>{message}</Alert> : null}

      {availableSizes.length === 0 ? (
        <Alert variant='warning'>No sandwich size is available now</Alert>
      ) : (
        <Form onSubmit={handleAddSandwich}>
          <Row>
            <Col>
              <Form.Group className='mb-3'>
                <Form.Label>Size</Form.Label>
                <Form.Select value={size.id} onChange={(event) => {
                  setSizeId(event.target.value);
                  setDressingIds([]);
                  setQuantity(1);
                }}>
                  {availableSizes.map((availableSize) => (
                    <option key={availableSize.id} value={availableSize.id}>
                      {availableSize.name} - {availableSize.price} euro - {getAvailableQuantity(availableSize)} available
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col>
              <Form.Group className='mb-3'>
                <Form.Label>Main ingredient</Form.Label>
                <Form.Select value={mainIngredientId} onChange={(event) => setMainIngredientId(event.target.value)}>
                  {options.mainIngredients.map((ingredient) => (
                    <option key={ingredient.id} value={ingredient.id}>{ingredient.name}</option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col>
              <Form.Group className='mb-3'>
                <Form.Label>Bread</Form.Label>
                <Form.Select value={breadId} onChange={(event) => setBreadId(event.target.value)}>
                  {options.breads.map((breadOption) => (
                    <option key={breadOption.id} value={breadOption.id}>{breadOption.name}</option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col>
              <Card.Title as='h4'>Optional ingredients</Card.Title>
              {options.optionalIngredients.map((ingredient) => (
                <Form.Check
                  key={ingredient.id}
                  type='checkbox'
                  label={ingredient.name}
                  checked={ingredientIds.includes(ingredient.id)}
                  onChange={() => toggleIngredient(ingredient.id)}
                />
              ))}
            </Col>
            <Col>
              <Card.Title as='h4'>Dressings <Badge bg='secondary'>{dressingIds.length}/{size.maxDressings}</Badge></Card.Title>
              {options.dressings.map((dressing) => (
                <Form.Check
                  key={dressing.id}
                  type='checkbox'
                  label={dressing.name}
                  checked={dressingIds.includes(dressing.id)}
                  disabled={!dressingIds.includes(dressing.id) && dressingIds.length >= size.maxDressings}
                  onChange={() => toggleDressing(dressing.id)}
                />
              ))}
            </Col>
          </Row>

          <Row className='my-3'>
            <Col>
              <Form.Group>
                <Form.Label>Quantity</Form.Label>
                <Form.Control
                  type='number'
                  min={1}
                  max={maxQuantity}
                  value={quantity}
                  isInvalid={quantity > maxQuantity}
                  onChange={(event) => setQuantity(Number(event.target.value))}
                />
                <Form.Control.Feedback type='invalid'>
                  Only {maxQuantity} sandwiches available
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col className='align-self-end'>
              <Card.Text>
                Unit price: {unitPrice.toFixed(2)} euro | Total: {totalPrice.toFixed(2)} euro
              </Card.Text>
            </Col>
          </Row>

          <Button type='submit'>Add sandwich</Button>
        </Form>
      )}

      <CartTable
        cart={cart}
        options={options}
        isSubmitting={isSubmitting}
        onUpdateQuantity={handleUpdateCartQuantity}
        onEditSandwich={handleEditCartSandwich}
        onRemoveSandwich={handleRemoveCartSandwich}
        onConfirmOrder={handleConfirmOrder}
      />
    </>
  );
}

export { SandwichConfiguratorPage };
