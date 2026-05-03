import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout } from '../features/auth/authSlice';
import { toast } from 'react-toastify';

const useAuth = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, token, isAuthenticated, role } = useSelector((s) => s.auth);

  const handleLogout = () => {
    dispatch(logout());
    toast.info('You have been logged out.');
    navigate('/');
  };

  return { user, token, isAuthenticated, role, handleLogout };
};

export default useAuth;