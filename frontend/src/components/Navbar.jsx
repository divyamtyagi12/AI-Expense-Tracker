// frontend/src/components/Navbar.jsx

import { useNavigate, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <nav className="navbar">
      <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
        <span className="navbar__brand">💰 AI Expense Tracker</span>
        <ul className="navbar__links">
          <li>
            <NavLink
              to="/dashboard"
              className={({ isActive }) => isActive ? 'active' : ''}
            >
              Dashboard
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/expenses"
              className={({ isActive }) => isActive ? 'active' : ''}
            >
              Expenses
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/categories"
              className={({ isActive }) => isActive ? 'active' : ''}
            >
              Categories
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/ai"
              className={({ isActive }) => isActive ? 'active' : ''}
            >
              ✨ AI Insights
            </NavLink>
          </li>
        </ul>
      </div>
      <div className="navbar__user">
        {user && <span className="navbar__name">Hi, {user.name?.split(' ')[0]}</span>}
        <button
          id="navbar-logout-btn"
          onClick={handleLogout}
          className="navbar__logout"
        >
          Log out
        </button>
      </div>
    </nav>
  );
}

export default Navbar;
