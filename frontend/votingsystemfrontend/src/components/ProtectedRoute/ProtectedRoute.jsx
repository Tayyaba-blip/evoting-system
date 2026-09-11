import { Navigate, useLocation } from 'react-router-dom';

const getDashboardPath = (role) => {
  switch (role?.toLowerCase()) {
    case 'admin':
      return '/admin/dashboard';
    case 'candidate':
      return '/candidate/dashboard';
    case 'voter':
    default:
      return '/voter/dashboard';
  }
};

const ProtectedRoute = ({ children, allowedRoles }) => {
  const token = localStorage.getItem('token');
  const location = useLocation();

  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem('user'));
    } catch {
      return null;
    }
  })();

  const role = user?.role?.toLowerCase();

  if (!token || !user) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to={getDashboardPath(role)} replace />;
  }

  return children;
};

export default ProtectedRoute;