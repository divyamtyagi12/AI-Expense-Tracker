// frontend/src/components/ProtectedRoute.jsx
// Wraps pages that require login. While we're still checking for an
// existing session (loading), show nothing/a loader instead of
// flashing a redirect. Once resolved, either render the page or
// bounce to /login.

import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <p>Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default ProtectedRoute;
