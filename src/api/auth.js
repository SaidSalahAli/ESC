import axios from 'utils/axios';

// ==============================|| AUTH API SERVICES ||============================== //

export const authService = {
  // Login
  login: async (email, password) => {
    const response = await axios.post('/api/auth/login', { email, password });
    return response.data;
  },

  // Register
  register: async (userData) => {
    const response = await axios.post('/api/auth/register', userData);
    return response.data;
  },

  // Get current user
  getMe: async () => {
    const response = await axios.get('/api/auth/me');
    return response.data;
  },

  // Update profile
  updateProfile: async (userData) => {
    const response = await axios.put('/api/auth/profile', userData);
    return response.data;
  },

  // Change password
  changePassword: async (passwords) => {
    const response = await axios.post('/api/auth/change-password', passwords);
    return response.data;
  },

  // Logout
  logout: async () => {
    const response = await axios.post('/api/auth/logout');
    return response.data;
  },

  // Google OAuth
  googleAuth: async (idToken) => {
    const response = await axios.post('/api/auth/google', { id_token: idToken });
    return response.data;
  }
};

