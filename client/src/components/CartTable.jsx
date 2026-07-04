import {
  Alert,
  Badge,
  Button,
  Card,
  Form,
  ListGroup,
  Spinner,
  Table,
} from 'react-bootstrap';

function CartTable(props) {
  const {
    cart,
    options,
    isSubmitting,
    onUpdateQuantity,
    onEditSandwich,
    onRemoveSandwich,
    onConfirmOrder,
  } = props;
  if (cart.length === 0) return false;

  const subtotal = cart.reduce((sum, sandwich) => sum + sandwich.totalPrice, 0);
  const totalQuantity = cart.reduce((sum, sandwich) => sum + sandwich.quantity, 0);
  const discount = totalQuantity >= 4 ? subtotal * 0.2 : 0;
  const total = subtotal - discount;

  return (
    <>
      <Card.Title as='h3' className='my-3'>
        Draft order
      </Card.Title>
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Sandwich</th>
            <th>Quantity</th>
            <th>Total</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {cart.map((sandwich, index) => {
            const currentSize = options.sizes.find(
              (size) => size.id === sandwich.size.id,
            );
            const otherQuantity = cart
              .filter(
                (otherSandwich, otherIndex) =>
                  otherIndex !== index &&
                  otherSandwich.size.id === sandwich.size.id,
              )
              .reduce((sum, otherSandwich) => sum + otherSandwich.quantity, 0);
            const maxQuantity = currentSize.available - otherQuantity;

            return (
              <tr key={index}>
                <td>
                  <Badge bg='secondary'>{sandwich.size.name}</Badge>{' '}
                  {sandwich.mainIngredient.name}, {sandwich.bread.name}
                  <ListGroup className='mt-2'>
                    <ListGroup.Item>
                      Ingredients:{' '}
                      {sandwich.ingredients.map((ingredient) => ingredient.name).join(', ') || 'none'}
                    </ListGroup.Item>
                    <ListGroup.Item>
                      Dressings:{' '}
                      {sandwich.dressings.map((dressing) => dressing.name).join(', ') || 'none'}
                    </ListGroup.Item>
                  </ListGroup>
                </td>
                <td>
                  <Form.Control
                    type='number'
                    min={1}
                    max={maxQuantity}
                    value={sandwich.quantity}
                    onChange={(event) =>
                      onUpdateQuantity(index, Number(event.target.value))
                    }
                  />
                </td>
                <td>{sandwich.totalPrice.toFixed(2)} euro</td>
                <td>
                  <Button
                    variant='secondary'
                    size='sm'
                    className='me-2'
                    onClick={() => onEditSandwich(index)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant='danger'
                    size='sm'
                    onClick={() => onRemoveSandwich(index)}
                  >
                    Remove
                  </Button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </Table>
      <Card.Title as='h4'>Subtotal: {subtotal.toFixed(2)} euro</Card.Title>
      {discount > 0 ? (
        <Card.Title as='h4' className='text-success'>
          Discount (20%): -{discount.toFixed(2)} euro
        </Card.Title>
      ) : (
        <Alert variant='info' className='py-1 px-2 mt-2'>
          Add {4 - totalQuantity} more sandwich
          {4 - totalQuantity === 1 ? '' : 'es'} to get a 20% discount!
        </Alert>
      )}
      <Card.Title as='h4'>Total: {total.toFixed(2)} euro</Card.Title>
      <Button
        variant='success'
        disabled={isSubmitting}
        onClick={onConfirmOrder}
      >
        {isSubmitting ? (
          <>
            <Spinner
              as='span'
              animation='border'
              size='sm'
              role='status'
              aria-hidden='true'
            />{' '}
          </>
        ) : (
          false
        )}
        Confirm order
      </Button>
    </>
  );
}

export { CartTable };
