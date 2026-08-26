// frontend/src/api/authApi.js
// Thin wrapper functions around the auth endpoints — keeps raw Axios
// calls out of components/pages.

import api from './axios';

export function registerUser({ name, email, password }) {
  return api.post('/auth/register', { name, email, password });
}

export function loginUser({ email, password }) {
  return api.post('/auth/login', { email, password });
}

export function getCurrentUser() {
  return api.get('/auth/me');
}
