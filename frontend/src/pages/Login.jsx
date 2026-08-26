// frontend/src/pages/Login.jsx

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getErrorMessage } from '../utils/getErrorMessage';
import ErrorBanner from '../components/ErrorBanner';

function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login(form);
      navigate('/dashboard');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={handleSubmit} noValidate>
        <p className="auth-card__logo">💰 AI Expense Tracker</p>
        <h1 className="auth-card__title">Welcome back</h1>
        <p className="auth-card__subtitle">Log in to your account to continue</p>

        <ErrorBanner message={error} />

        <div className="form-group">
          <label className="form-label" htmlFor="email">Email address</label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={form.email}
            onChange={handleChange}
            className="input"
            placeholder="you@example.com"
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="password">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            value={form.password}
            onChange={handleChange}
            className="input"
            placeholder="••••••••"
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="btn btn--primary auth-card__submit"
        >
          {submitting ? 'Logging in…' : 'Log In'}
        </button>

        <p className="auth-card__footer">
          Don't have an account?{' '}
          <Link to="/register">Create one free</Link>
        </p>
      </form>
    </div>
  );
}

export default Login;
