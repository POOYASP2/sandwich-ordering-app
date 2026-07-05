import { useContext } from 'react';
import { Navigate } from 'react-router';
import { AuthContext } from '../contexts.js';
import { LoginForm } from '../components/LoginForm.jsx';
import { TotpForm } from '../components/TotpForm.jsx';

function LoginPage() {
  const { isLoggedIn, isTotpAuthenticated, handleLogin, handleLoginTotp } = useContext(AuthContext);

  if (isLoggedIn) {
    if (isTotpAuthenticated) return <Navigate replace to='/' />;
    else return <TotpForm onLoginTotp={handleLoginTotp} />;
  }
  return <LoginForm onLogin={handleLogin} />;
}

export { LoginPage };
