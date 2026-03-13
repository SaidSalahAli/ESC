import React, { createContext, useEffect, useReducer } from 'react';

// third-party
import { Chance } from 'chance';
import { jwtDecode } from 'jwt-decode';

// reducer - state management
import { LOGIN, LOGOUT } from 'contexts/auth-reducer/actions';
import authReducer from 'contexts/auth-reducer/auth';

// project-imports
import Loader from 'components/Loader';
import axios from 'utils/axios';
import { getRedirectUrl, clearRedirectUrl } from 'utils/checkoutStorage';

const chance = new Chance();

// constant
const initialState = {
  isLoggedIn: false,
  isInitialized: false,
  user: null
};

const verifyToken = (serviceToken) => {
  if (!serviceToken) {
    return false;
  }
  try {
    const decoded = jwtDecode(serviceToken);
    const currentTime = Date.now() / 1000;
    // Add 5 minute buffer to refresh before expiration
    const bufferTime = 5 * 60;
    return decoded.exp > currentTime + bufferTime;
  } catch (error) {
    console.error('Token verification error:', error);
    return false;
  }
};

const setSession = (serviceToken) => {
  if (serviceToken) {
    localStorage.setItem('serviceToken', serviceToken);
    axios.defaults.headers.common.Authorization = `Bearer ${serviceToken}`;
  } else {
    localStorage.removeItem('serviceToken');
    localStorage.removeItem('refreshToken');
    delete axios.defaults.headers.common.Authorization;
  }
};

// Helper function to refresh the access token
const refreshAccessToken = async () => {
  try {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await axios.post('/api/auth/refresh', {
      refresh_token: refreshToken
    });

    const { data } = response.data;
    if (data && data.token) {
      setSession(data.token);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Token refresh failed:', error);
    setSession(null);
    return false;
  }
};

// Helper function to handle redirect after login
const handlePostLoginRedirect = () => {
  try {
    const redirectUrl = getRedirectUrl();
    if (redirectUrl) {
      clearRedirectUrl();
      // Use window.location to ensure full page navigation

      window.location.href = redirectUrl;
    }
  } catch (err) {
    console.error('Error handling post-login redirect:', err);
  }
};

// ==============================|| JWT CONTEXT & PROVIDER ||============================== //

const JWTContext = createContext(null);

export const JWTProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    const init = async () => {
      try {
        const serviceToken = window.localStorage.getItem('serviceToken');

        if (serviceToken) {
          // Check if token is valid
          if (verifyToken(serviceToken)) {
            setSession(serviceToken);
            const response = await axios.get('/api/auth/me');
            const { data } = response.data;
            dispatch({
              type: LOGIN,
              payload: {
                isLoggedIn: true,
                user: data
              }
            });
          } else {
            // Token expired, try to refresh
            const refreshSuccess = await refreshAccessToken();
            if (refreshSuccess) {
              // Retry getting user data
              const response = await axios.get('/api/auth/me');
              const { data } = response.data;
              dispatch({
                type: LOGIN,
                payload: {
                  isLoggedIn: true,
                  user: data
                }
              });
            } else {
              // Refresh failed, logout
              dispatch({
                type: LOGOUT
              });
            }
          }
        } else {
          dispatch({
            type: LOGOUT
          });
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
        dispatch({
          type: LOGOUT
        });
      }
    };

    init();
  }, []);

  const login = async (email, password) => {
    const response = await axios.post('/api/auth/login', { email, password });
    const { data } = response.data;
    const { token, refresh_token, user } = data;
    setSession(token);
    localStorage.setItem('refreshToken', refresh_token);
    dispatch({
      type: LOGIN,
      payload: {
        isLoggedIn: true,
        user
      }
    });

    // Merge guest cart with user cart after login
    try {
      const { mergeGuestCartWithUserCart } = await import('utils/guestCart');
      const { cartService } = await import('api/cart');
      await mergeGuestCartWithUserCart(cartService);
      // Trigger cart update event
      window.dispatchEvent(new Event('cartUpdated'));
    } catch (err) {
      console.error('Error merging guest cart:', err);
    }

    // Handle redirect after login
    setTimeout(() => {
      handlePostLoginRedirect();
    }, 100);
  };

  const register = async (email, password, firstName, lastName, phone) => {
    const response = await axios.post('/api/auth/register', {
      first_name: firstName,
      last_name: lastName,
      email,
      password,
      password_confirmation: password,
      phone: phone || ''
    });
    const { data } = response.data;
    const { token, refresh_token, user } = data;
    setSession(token);
    localStorage.setItem('refreshToken', refresh_token);
    dispatch({
      type: LOGIN,
      payload: {
        isLoggedIn: true,
        user
      }
    });

    // Merge guest cart with user cart after registration
    try {
      const { mergeGuestCartWithUserCart } = await import('utils/guestCart');
      const { cartService } = await import('api/cart');
      await mergeGuestCartWithUserCart(cartService);
      // Trigger cart update event
      window.dispatchEvent(new Event('cartUpdated'));
    } catch (err) {
      console.error('Error merging guest cart:', err);
    }

    // Handle redirect after registration
    setTimeout(() => {
      handlePostLoginRedirect();
    }, 100);
  };

  const logout = () => {
    setSession(null);
    dispatch({ type: LOGOUT });
  };

  const resetPassword = async (email) => {
    console.log('email - ', email);
  };

  const googleLogin = async (idToken) => {
    if (!idToken) {
      throw new Error('Google ID token is required');
    }

    try {
      const response = await axios.post('/api/auth/google', { id_token: idToken });

      if (!response.data || !response.data.success) {
        throw new Error(response.data?.message || 'Google authentication failed');
      }

      const { data } = response.data;
      const { token, refresh_token, user } = data;

      if (!token || !user) {
        throw new Error('Invalid response from server');
      }

      setSession(token);
      localStorage.setItem('refreshToken', refresh_token);
      dispatch({
        type: LOGIN,
        payload: {
          isLoggedIn: true,
          user
        }
      });

      // Merge guest cart with user cart after Google login
      try {
        const { mergeGuestCartWithUserCart } = await import('utils/guestCart');
        const { cartService } = await import('api/cart');
        await mergeGuestCartWithUserCart(cartService);
        // Trigger cart update event
        window.dispatchEvent(new Event('cartUpdated'));
      } catch (err) {
        console.error('Error merging guest cart:', err);
      }

      // Handle redirect after Google login
      setTimeout(() => {
        handlePostLoginRedirect();
      }, 100);
    } catch (error) {
      console.error('Google login error:', error);
      // Re-throw to let the component handle it
      throw error;
    }
  };

  const updateProfile = () => {};

  if (state.isInitialized !== undefined && !state.isInitialized) {
    return <Loader />;
  }

  return (
    <JWTContext.Provider value={{ ...state, login, logout, register, resetPassword, updateProfile, googleLogin }}>
      {children}
    </JWTContext.Provider>
  );
};

export default JWTContext;
