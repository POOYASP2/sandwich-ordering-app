import { useEffect, useState } from 'react';
import { Alert, Badge, Card, Row, Spinner, Stack, Table } from 'react-bootstrap';
import { getSandwichOptions } from '../API.js';
import { OptionList } from '../components/OptionList.jsx';

function SandwichOptionsPage() {
  const [isWaiting, setIsWaiting] = useState(true);
  const [options, setOptions] = useState(null);
  const [errors, setErrors] = useState([]);

  useEffect(() => {
    getSandwichOptions()
      .then((options) => {
        setOptions(options);
        setErrors([]);
      })
      .catch((err) => setErrors(err))
      .finally(() => setIsWaiting(false));
  }, []);

  if (isWaiting) {
    return (
      <Stack className='my-3'>
        <Spinner animation='border' role='status' />
      </Stack>
    );
  }

  if (errors.length > 0) {
    return (
      <Alert variant='danger' className='my-3'>
        {errors.length === 1 ? errors[0] : 'Cannot load sandwich data'}
      </Alert>
    );
  }

  return (
    <>
      <Card.Title as='h2' className='my-3'>Sandwiches</Card.Title>
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Size</th>
            <th>Price</th>
            <th>Available</th>
            <th>Included ingredients</th>
            <th>Max dressings</th>
          </tr>
        </thead>
        <tbody>
          {options.sizes.map((size) => (
            <tr key={size.id}>
              <td>
                <Badge bg='secondary'>{size.id}</Badge> {size.name}
              </td>
              <td>{size.price} euro</td>
              <td>
                {size.available > 0 ? size.available : <Badge bg='danger'>Sold out</Badge>}
              </td>
              <td>{size.includedIngredients}</td>
              <td>{size.maxDressings}</td>
            </tr>
          ))}
        </tbody>
      </Table>

      <Row>
        <OptionList title='Main ingredients' values={options.mainIngredients} />
        <OptionList title='Breads' values={options.breads} />
        <OptionList title='Optional ingredients' values={options.optionalIngredients} />
        <OptionList title='Dressings' values={options.dressings} />
      </Row>
    </>
  );
}

export { SandwichOptionsPage };
