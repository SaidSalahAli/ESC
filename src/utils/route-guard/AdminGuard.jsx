import PropTypes from 'prop-types';
import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

// project-imports
import useAuth from 'hooks/useAuth';

// ==============================|| ADMIN GUARD ||============================== //

export default function AdminGuard({ children }) {
  const { isLoggedIn, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/login', {
        state: {
          from: location.pathname
        },
        replace: true
      });
    } else if (user && user.role !== 'admin') {
      // User is logged in but not an admin
      navigate('/', {
        state: {
          from: location.pathname,
          message: 'Access denied. Admin privileges required.'
        },
        replace: true
      });
    }
  }, [isLoggedIn, user, navigate, location]);

  // Only render children if user is logged in and is admin
  if (!isLoggedIn || !user || user.role !== 'admin') {
    return null;
  }

  return children;
}

AdminGuard.propTypes = { children: PropTypes.any };

