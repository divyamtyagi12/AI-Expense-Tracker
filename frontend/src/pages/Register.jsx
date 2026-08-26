// frontend/src/pages/Register.jsx

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getErrorMessage } from '../utils/getErrorMessage';
import ErrorBanner from '../components/ErrorBanner';

function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: '', email: '', password: '' });
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
      await register(form);
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
        <h1 className="auth-card__title">Create your account</h1>
        <p className="auth-card__subtitle">Start tracking expenses with AI-powered insights</p>

        <ErrorBanner message={error} />

        <div className="form-group">
          <label className="form-label" htmlFor="name">Full name</label>
          <input
            id="name"
            name="name"
            type="text"
            autoComplete="name"
            required
            value={form.name}
            onChange={handleChange}
            className="input"
            placeholder="Your name"
          />
        </div>

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
            autoComplete="new-password"
            required
            minLength={6}
            value={form.password}
            onChange={handleChange}
            className="input"
            placeholder="At least 6 characters"
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="btn btn--primary auth-card__submit"
        >
          {submitting ? 'Creating account…' : 'Create Account'}
        </button>

        <p className="auth-card__footer">
          Already have an account?{' '}
          <Link to="/login">Log in</Link>
        </p>
      </form>
    </div>
  );
}

export default Register;
