// action - state management
import { REGISTER, LOGIN, LOGOUT, INIT_COMPLETE } from './actions';

// initial state
const initialState = {
  isLoggedIn: false,
  isInitialized: false,
  user: null
};

// ==============================|| AUTH REDUCER ||============================== //

const auth = (state = initialState, action) => {
  switch (action.type) {
    case REGISTER: {
      const { user } = action.payload;
      return {
        ...state,
        isLoggedIn: true,
        isInitialized: true,
        user
      };
    }
    case LOGIN: {
      const { user } = action.payload;
      return {
        ...state,
        isLoggedIn: true,
        isInitialized: true,
        user
      };
    }
    case LOGOUT: {
      return {
        ...state,
        isInitialized: true,
        isLoggedIn: false,
        user: null
      };
    }
    case INIT_COMPLETE: {
      // Guarantee initialization is complete when no other action applies
      return {
        ...state,
        isInitialized: true
      };
    }
    default: {
      return { ...state };
    }
  }
};

export default auth;
