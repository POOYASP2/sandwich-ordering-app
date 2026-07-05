import { useContext, useEffect, useState } from 'react';
import { Alert, Button, Card, ListGroup, Spinner, Stack } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router';
import { cancelOrder, getOrders, getSandwichOptions } from '../API.js';
import { OrderTable } from '../components/OrderTable.jsx';
import { AuthContext, CartContext } from '../contexts.js';

function OrdersPage() {
  const { isTotpAuthenticated, handleRefreshUser, handleLogout } = useContext(AuthContext);
  const { handleCartChange } = useContext(CartContext);
  const navigate = useNavigate();
  const [isWaiting, setIsWaiting] = useState(true);
  const [deletingOrderId, setDeletingOrderId] = useState(null);
  const [orders, setOrders] = useState([]);
  const [errors, setErrors] = useState([]);
  const [message, setMessage] = useState('');

  const loadOrders = () => {
    setIsWaiting(true);
    getOrders()
      .then((orders) => {
        setOrders(orders);
        setErrors([]);
      })
      .catch((err) => {
        if (err[0] === 'Not authenticated') handleLogout();
        else setErrors(err);
      })
      .finally(() => setIsWaiting(false));
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleDeleteOrder = (orderId) => {
    setDeletingOrderId(orderId);
    cancelOrder(orderId)
      .then((result) => {
        setErrors([]);
        setMessage('Order deleted. Refunded: ' + result.refund + ' euro');
        handleRefreshUser();
        loadOrders();
      })
      .catch((err) => {
        setMessage('');
        if (err[0] === 'Not authenticated') handleLogout();
        else setErrors(err);
      })
      .finally(() => setDeletingOrderId(null));
  };

  const handleDuplicateOrder = (order) => {
    getSandwichOptions()
      .then((options) => {
        const errors = [];
        const requestedBySize = {};

        for (const sandwich of order.sandwiches)
          requestedBySize[sandwich.sizeId] = (requestedBySize[sandwich.sizeId] || 0) + sandwich.quantity;

        for (const size of options.sizes) {
          if ((requestedBySize[size.id] || 0) > size.available)
            errors.push('Not enough ' + size.id + ' sandwiches');
        }

        if (errors.length > 0) {
          setMessage('');
          setErrors(errors);
          return;
        }

        const sandwiches = order.sandwiches.map((sandwich) => ({
          size: { id: sandwich.sizeId, name: sandwich.size, price: sandwich.sizePrice, includedIngredients: sandwich.includedIngredients, maxDressings: sandwich.maxDressings },
          mainIngredient: { id: sandwich.mainIngredientId, name: sandwich.mainIngredient },
          bread: { id: sandwich.breadId, name: sandwich.bread },
          ingredients: sandwich.ingredients,
          dressings: sandwich.dressings,
          quantity: sandwich.quantity,
          unitPrice: sandwich.unitPrice,
          totalPrice: sandwich.unitPrice * sandwich.quantity,
        }));

        handleCartChange(sandwiches);
        navigate('/order/new');
      })
      .catch((err) => {
        setMessage('');
        if (err[0] === 'Not authenticated') handleLogout();
        else setErrors(err);
      });
  };

  if (isWaiting) {
    return (
      <Stack className='my-3'>
        <Spinner animation='border' role='status' />
      </Stack>
    );
  }

  return (
    <>
      <Stack direction='horizontal' className='my-3'>
        <Card.Title as='h2' className='mb-0'>My orders</Card.Title>
      </Stack>
      {errors.length > 0 ? (
        <Alert variant='danger'>
          {errors.length === 1 ? errors[0] : 'Cannot load orders'}
          {errors[0] === 'Missing TOTP authentication' ? (
            <Button as={Link} to='/login' variant='warning' className='mx-2'>Go to TOTP</Button>
          ) : null}
        </Alert>
      ) : null}
      {message ? <Alert variant='success'>{message}</Alert> : null}
      {orders.length === 0 && errors.length === 0 ? (
        <Alert variant='info'>No orders yet</Alert>
      ) : null}
      {orders.map((order) => (
        <OrderTable
          key={order.id}
          order={order}
          isTotpAuthenticated={isTotpAuthenticated}
          deletingOrderId={deletingOrderId}
          onDeleteOrder={handleDeleteOrder}
          onDuplicateOrder={handleDuplicateOrder}
        />
      ))}
    </>
  );
}

export { OrdersPage };
