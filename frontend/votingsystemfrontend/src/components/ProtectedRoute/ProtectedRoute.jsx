import { Navigate, useLocation } from 'react-router-dom';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');
  const location = useLocation();

  if (!token) return <Navigate to="/" state={{ from: location }} replace />;
  if (allowedRoles && !allowedRoles.includes(role)) {
    const redirect = role === 'admin' ? '/admin/dashboard' : role === 'candidate' ? '/candidate/dashboard' : '/voter/dashboard';
    return <Navigate to={redirect} replace />;
  }
  return children;
};

export default ProtectedRoute;