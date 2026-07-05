import { useContext } from 'react';
import { Badge, Button, Container, Nav, Navbar } from 'react-bootstrap';
import { Link } from 'react-router';
import { AuthContext } from '../contexts.js';

export function GenericLayout(props) {
  const { children } = props;
  const { isLoggedIn, isTotpAuthenticated, user, handleLogout } =
    useContext(AuthContext);

  return (
    <>
      <Navbar bg='light' className='mb-3'>
        <Container>
          <Navbar.Brand as={Link} to='/'>
            Sandwich
          </Navbar.Brand>
          <Nav className='me-auto'>
            {isLoggedIn ? (
              <>
                <Nav.Link as={Link} to='/order/new'>
                  New order
                </Nav.Link>
                <Nav.Link as={Link} to='/orders'>
                  Orders
                </Nav.Link>
              </>
            ) : null}
          </Nav>
          <Nav>
            {isLoggedIn ? (
              <>
                <Navbar.Text className='me-3'>
                  {user.name}{' '}
                  <Badge bg='secondary'>{user.balance.toFixed(2)} euro</Badge>{' '}
                  {isTotpAuthenticated ? <Badge bg='success'>2FA</Badge> : null}
                </Navbar.Text>
                {!isTotpAuthenticated ? (
                  <Button
                    as={Link}
                    to='/login'
                    variant='outline-primary'
                    className='me-2'
                  >
                    Complete 2FA
                  </Button>
                ) : null}
                <Button variant='outline-danger' onClick={handleLogout}>
                  Logout
                </Button>
              </>
            ) : (
              <Button as={Link} to='/login' variant='primary'>
                Login
              </Button>
            )}
          </Nav>
        </Container>
      </Navbar>
      <Container>{children}</Container>
    </>
  );
}
