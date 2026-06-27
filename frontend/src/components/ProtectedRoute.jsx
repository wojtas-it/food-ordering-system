import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, requireAdmin = false, requireKucharz = false }) => {
  const { user, loading, isAdmin, isKucharz } = useAuth();

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f5f5f5'
      }}>
        <div style={{
          fontSize: '18px',
          color: '#6b7280'
        }}>
          Ładowanie...
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requireAdmin && !isAdmin()) {
    return <Navigate to="/kitchen" replace />;
  }

  if (requireKucharz && !isKucharz() && !isAdmin()) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
