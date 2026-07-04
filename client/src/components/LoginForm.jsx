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

function LoginForm(props) {
  const { onLogin } = props;
  const [email, setEmail] = useState('pooya@good.com');
  const [password, setPassword] = useState('1234');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!email) {
      setErrorMessage('Email must not be empty');
    } else if (!password) {
      setErrorMessage('Password must not be empty');
    } else {
      onLogin(email, password).catch((err) =>
        setErrorMessage(err[0] || 'Login failed'),
      );
    }
  };

  return (
    <Container className='mt-5'>
      <Row className='justify-content-center'>
        <Col xs={12} md={6} lg={4}>
          <Card>
            <Card.Header as='h2'>Login</Card.Header>
            <Card.Body>
              <Form onSubmit={handleSubmit}>
                {errorMessage ? (
                  <Alert variant='danger'>{errorMessage}</Alert>
                ) : null}
                <Form.Group className='mb-3'>
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type='email'
                    placeholder='mail@provider.com'
                    value={email}
                    autoFocus
                    onChange={(ev) => {
                      setEmail(ev.target.value);
                      setErrorMessage('');
                    }}
                  />
                </Form.Group>
                <Form.Group className='mb-3'>
                  <Form.Label>Password</Form.Label>
                  <Form.Control
                    type='password'
                    value={password}
                    onChange={(ev) => {
                      setPassword(ev.target.value);
                      setErrorMessage('');
                    }}
                  />
                </Form.Group>
                <Button type='submit'>Login</Button>
                <Link to='/'>
                  <Button className='mx-2' variant='secondary'>
                    Back to home
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

export { LoginForm };
