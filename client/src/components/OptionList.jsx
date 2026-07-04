import { Card, Col, ListGroup } from 'react-bootstrap';

function OptionList(props) {
  const { title, values } = props;
  return (
    <Col>
      <Card.Title as='h4'>{title}</Card.Title>
      <ListGroup>
        {values.map((value) => (
          <ListGroup.Item key={value.id}>{value.name}</ListGroup.Item>
        ))}
      </ListGroup>
    </Col>
  );
}

export { OptionList };
