import { useContext } from 'react';
import { Navigate } from 'react-router';
import { AuthContext } from '../contexts.js';
import { LoginForm } from '../components/LoginForm.jsx';
import { TotpForm } from '../components/TotpForm.jsx';

function LoginPage() {
  const { isLoggedIn, isTotpAuthenticated, user, handleLogin, handleLoginTotp } = useContext(AuthContext);

  if (isLoggedIn) {
    if (user.canDoTotp) {
      if (isTotpAuthenticated) return <Navigate replace to='/' />;
      else return <TotpForm onLoginTotp={handleLoginTotp} />;
    } else {
      return <Navigate replace to='/' />;
    }
  }
  return <LoginForm onLogin={handleLogin} />;
}

export { LoginPage };
