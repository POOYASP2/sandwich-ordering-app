import {
  Badge,
  Button,
  Card,
  ListGroup,
  Spinner,
  Stack,
  Table,
} from 'react-bootstrap';

function OrderTable(props) {
  const {
    order,
    isTotpAuthenticated,
    deletingOrderId,
    onDeleteOrder,
    onDuplicateOrder,
  } = props;
  return (
    <Card className='my-3'>
      <Card.Header>
        <Stack direction='horizontal' gap={3}>
          <Card.Title className='mb-0'>Order #{order.id}</Card.Title>
          <Badge bg='secondary'>{order.status}</Badge>
          <Stack className='ms-auto'>{order.totalPrice.toFixed(2)} euro</Stack>
          {order.status === 'confirmed' ? (
            <Button
              variant='primary'
              size='sm'
              onClick={() => onDuplicateOrder(order)}
            >
              Duplicate
            </Button>
          ) : null}
          {order.status === 'confirmed' ? (
            <Button
              variant='danger'
              size='sm'
              disabled={!isTotpAuthenticated || deletingOrderId === order.id}
              onClick={() => onDeleteOrder(order.id)}
            >
              {deletingOrderId === order.id ? (
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
              Delete
            </Button>
          ) : null}
        </Stack>
      </Card.Header>
      <Card.Body>
        <Table striped bordered hover className='mb-0'>
          <thead>
            <tr>
              <th>Sandwich</th>
              <th>Quantity</th>
              <th>Unit price</th>
            </tr>
          </thead>
          <tbody>
            {order.sandwiches.map((sandwich) => (
              <tr key={sandwich.id}>
                <td>
                  <Stack direction='horizontal' gap={2}>
                    <Badge bg='primary'>{sandwich.size}</Badge>
                    <Badge bg='light' text='dark'>
                      {sandwich.mainIngredient}
                    </Badge>
                    <Badge bg='light' text='dark'>
                      {sandwich.bread}
                    </Badge>
                  </Stack>
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
                <td>{sandwich.quantity}</td>
                <td>{sandwich.unitPrice.toFixed(2)} euro</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card.Body>
    </Card>
  );
}

export { OrderTable };
