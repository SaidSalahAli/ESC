import PropTypes from 'prop-types';
import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

// project-imports
import useAuth from 'hooks/useAuth';
import { saveRedirectUrl, getCheckoutData, saveCheckoutData } from 'utils/checkoutStorage';

// ==============================|| AUTH GUARD ||============================== //

export default function AuthGuard({ children }) {
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!isLoggedIn) {
      // Save the current location for redirect after login
      const redirectUrl = location.pathname + location.search;
      saveRedirectUrl(redirectUrl);

      // If user is on checkout page, preserve the form data from session storage
      // The checkout page will have local state, we'll sync it when needed

      navigate('login', {
        state: {
          from: location.pathname
        },
        replace: true
      });
    }
  }, [isLoggedIn, navigate, location]);

  return children;
}

AuthGuard.propTypes = { children: PropTypes.any };
