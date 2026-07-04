import 'bootstrap/dist/css/bootstrap.min.css';

import { useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router';
import { AuthContext, CartContext } from './contexts.js';
import { GenericLayout } from './components/GenericLayout.jsx';
import { LoginPage } from './pages/LoginPage.jsx';
import { SandwichConfiguratorPage } from './pages/SandwichConfiguratorPage.jsx';
import { OrdersPage } from './pages/OrdersPage.jsx';
import { SandwichOptionsPage } from './pages/SandwichOptionsPage.jsx';
import { fetchCurrentuser, loginAPI, loginTotp, logout } from './API.js';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isTotpAuthenticated, setIsTotpAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [cart, setCart] = useState([]);

  const handleRefreshUser = async () => {
    const userFromAPI = await fetchCurrentuser();
    setIsLoggedIn(true);
    setIsTotpAuthenticated(userFromAPI.isTotp);
    setUser(userFromAPI);
  };

  useEffect(() => {
    const checkAuth = async () => {
      try {
        await handleRefreshUser();
      } catch {
        // user is simply not yet authenticated
      }
    };
    checkAuth();
  }, []);

  const handleLogin = async (email, password) => {
    const userFromAPI = await loginAPI(email, password);
    setIsLoggedIn(true);
    setIsTotpAuthenticated(userFromAPI.isTotp);
    setUser(userFromAPI);
  };

  const handleLoginTotp = async (totpCode) => {
    await loginTotp(totpCode);
    await handleRefreshUser();
  };

  const handleCartChange = (newCart) => {
    setCart(newCart);
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch {
      // Cannot do anything more if logout fails
    } finally {
      setIsLoggedIn(false);
      setIsTotpAuthenticated(false);
      setUser(null);
      setCart([]);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn,
        isTotpAuthenticated,
        user,
        handleLogin,
        handleLoginTotp,
        handleLogout,
        handleRefreshUser,
      }}
    >
      <CartContext.Provider value={{ cart, handleCartChange }}>
        <Routes>
          <Route path='/login' element={<LoginPage />} />
          <Route
            path='/'
            element={
              <GenericLayout>
                <SandwichOptionsPage />
              </GenericLayout>
            }
          />
          <Route
            path='/order/new'
            element={
              isLoggedIn ? (
                <GenericLayout>
                  <SandwichConfiguratorPage />
                </GenericLayout>
              ) : (
                <Navigate replace to='/login' />
              )
            }
          />
          <Route
            path='/orders'
            element={
              isLoggedIn ? (
                <GenericLayout>
                  <OrdersPage />
                </GenericLayout>
              ) : (
                <Navigate replace to='/login' />
              )
            }
          />
        </Routes>
        <br></br>
        <br></br>
      </CartContext.Provider>
    </AuthContext.Provider>
  );
}

export default App;
