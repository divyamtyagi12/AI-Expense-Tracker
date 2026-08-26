// frontend/src/context/AuthContext.jsx
// Provides `user`, `loading`, and auth actions to the whole app via
// React Context, so any component can call useAuth() instead of
// prop-drilling auth state down through the tree.

import { createContext, useContext, useState, useEffect } from 'react';
import { registerUser, loginUser, getCurrentUser } from '../api/authApi';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // true while we check for an existing session

  // On first load, if a token exists, verify it's still valid and
  // fetch the user's profile — this keeps a user logged in across
  // page refreshes.
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }

    getCurrentUser()
      .then((res) => setUser(res.data.data.user))
      .catch(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      })
      .finally(() => setLoading(false));
  }, []);

  async function login({ email, password }) {
    const res = await loginUser({ email, password });
    const { user: loggedInUser, token } = res.data.data;
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(loggedInUser));
    setUser(loggedInUser);
    return loggedInUser;
  }

  async function register({ name, email, password }) {
    const res = await registerUser({ name, email, password });
    const { user: newUser, token } = res.data.data;
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(newUser));
    setUser(newUser);
    return newUser;
  }

  function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  }

  const value = { user, loading, login, register, logout, isAuthenticated: !!user };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Custom hook for easy access: const { user, login, logout } = useAuth();
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
