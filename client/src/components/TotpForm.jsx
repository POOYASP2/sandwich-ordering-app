import { useState } from 'react';
import {
  Alert,
  Button,
  Card,
  Col,
  Container,
  Form,
  Row,
} from 'react-bootstrap';
import { Link } from 'react-router';

function TotpForm(props) {
  const { onLoginTotp } = props;
  const [totpCode, setTotpCode] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!totpCode || totpCode.length !== 6) {
      setErrorMessage('Code must be 6 digits');
      return;
    }
    onLoginTotp(totpCode).catch((err) =>
      setErrorMessage(err[0] || 'Wrong code, please try again'),
    );
  };

  return (
    <Container className='mt-5'>
      <Row className='justify-content-center'>
        <Col xs={12} md={6} lg={4}>
          <Card>
            <Card.Header as='h2'>Second Factor Authentication</Card.Header>
            <Card.Body>
              <Form onSubmit={handleSubmit}>
                {errorMessage ? (
                  <Alert variant='danger'>{errorMessage}</Alert>
                ) : null}
                <Form.Group className='mb-3'>
                  <Form.Label>Code from your device</Form.Label>
                  <Form.Control
                    type='text'
                    placeholder='------'
                    value={totpCode}
                    autoFocus
                    onChange={(ev) => {
                      setTotpCode(ev.target.value);
                      setErrorMessage('');
                    }}
                  />
                </Form.Group>
                <Button type='submit'>Validate</Button>
                <Link to='/'>
                  <Button className='mx-2' variant='secondary'>
                    Skip
                  </Button>
                </Link>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export { TotpForm };
