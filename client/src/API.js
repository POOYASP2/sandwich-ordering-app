const SERVER_URL = 'http://localhost:3001/api/';

const APICall = async (endpoint, method = 'GET', body = undefined, headers = undefined, expectResponse = true) => {
  let response;
  try {
    response = await fetch(SERVER_URL + endpoint, { method, body, headers, credentials: 'include' });
  } catch {
    throw ['Failed to contact the server'];
  }

  if (response.ok) {
    return expectResponse ? await response.json() : undefined;
  }

  const parsedResponse = await response.json().catch(() => null);
  if (!parsedResponse) throw ['Authorization error'];
  if (parsedResponse.errors) throw parsedResponse.errors;
  throw [parsedResponse.error || 'Unknown error'];
};

export const loginTotp = async (code) =>
  APICall('login-totp', 'POST', JSON.stringify({ code }), { 'Content-Type': 'application/json' });

export const loginAPI = async (email, password) =>
  APICall('sessions', 'POST', JSON.stringify({ username: email, password }), { 'Content-Type': 'application/json' });

export const logout = async () =>
  APICall('sessions/current', 'DELETE', undefined, undefined, false);

export const fetchCurrentuser = async () => APICall('sessions/current');

export const getSandwichOptions = async () => APICall('sandwich-options');

export const getOrders = async () => APICall('orders');

export const cancelOrder = async (id) => APICall('orders/' + id, 'DELETE');

export const submitOrder = async (sandwiches) =>
  APICall('orders', 'POST', JSON.stringify({ sandwiches }), { 'Content-Type': 'application/json' });
