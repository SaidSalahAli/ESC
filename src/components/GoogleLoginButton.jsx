import { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import Button from '@mui/material/Button';

// ==============================|| GOOGLE LOGIN BUTTON ||============================== //

export default function GoogleLoginButton({ onSuccess, onError, disabled }) {
  const buttonRef = useRef(null);
  const googleScriptLoaded = useRef(false);

  useEffect(() => {
    // Load Google Identity Services script
    if (!googleScriptLoaded.current && !window.google) {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => {
        googleScriptLoaded.current = true;
        initializeGoogleSignIn();
      };
      document.head.appendChild(script);
    } else if (window.google) {
      initializeGoogleSignIn();
    }

    return () => {
      // Cleanup if needed
    };
  }, []);

  const initializeGoogleSignIn = () => {
    if (!window.google || !buttonRef.current) return;

    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

    if (!clientId) {
      console.warn('Google Client ID not configured. Please add VITE_GOOGLE_CLIENT_ID to your .env file.');
      // Don't show error to user, just hide the button
      if (buttonRef.current) {
        buttonRef.current.style.display = 'none';
      }
      return;
    }

    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: handleCredentialResponse
    });

    // Render button
    if (buttonRef.current && !buttonRef.current.hasChildNodes()) {
      window.google.accounts.id.renderButton(buttonRef.current, {
        theme: 'outline',
        size: 'large',
        width: '100%',
        text: 'signin_with',
        locale: 'en'
      });
    }
  };

  const handleCredentialResponse = (response) => {
    if (response.credential) {
      if (onSuccess) {
        onSuccess(response.credential);
      }
    } else {
      if (onError) {
        onError(new Error('Failed to get Google credentials'));
      }
    }
  };

  // Fallback button if Google script fails to load
  const handleFallbackClick = () => {
    if (onError) {
      onError(new Error('Google Sign-In is not available. Please check your internet connection.'));
    }
  };

  return (
    <div style={{ width: '100%' }}>
      <div ref={buttonRef} style={{ width: '100%', display: 'flex', justifyContent: 'center' }} />
    </div>
  );
}

GoogleLoginButton.propTypes = {
  onSuccess: PropTypes.func.isRequired,
  onError: PropTypes.func,
  disabled: PropTypes.bool
};
