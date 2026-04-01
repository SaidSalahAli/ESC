import axios from 'axios';

const axiosServices = axios.create({
  baseURL: import.meta.env.VITE_APP_API_URL || 'http://localhost/ESC_Wear/backend/public',
  headers: {
    'Content-Type': 'application/json'
  }
});

// ==============================|| AXIOS - FOR MOCK SERVICES ||============================== //

axiosServices.interceptors.request.use(
  async (config) => {
    const accessToken = localStorage.getItem('serviceToken');
    if (accessToken) {
      config.headers['Authorization'] = `Bearer ${accessToken}`;
    }

    // Get language from localStorage (from config)
    const configData = localStorage.getItem('able-pro-material-react-ts-config');
    let language = 'en'; // default
    if (configData) {
      try {
        const parsed = JSON.parse(configData);
        language = parsed.i18n || 'en';
      } catch (e) {
        // If parsing fails, use default
      }
    }

    // Add Accept-Language header
    config.headers['Accept-Language'] = language;

    // If sending FormData, remove Content-Type to let browser set it with boundary
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axiosServices.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 Unauthorized (but not for refresh endpoint itself)
    if (error.response?.status === 401 && !originalRequest.url.includes('/api/auth/refresh')) {
      // If this is a retry, don't retry again to avoid infinite loop
      if (originalRequest._retry) {
        localStorage.removeItem('serviceToken');
        localStorage.removeItem('refreshToken');
        if (!window.location.href.includes('/login')) {
          window.location.pathname = '/login';
        }
        return Promise.reject(error);
      }

      // Mark that we've retried this request
      originalRequest._retry = true;

      try {
        // Try to refresh token
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const response = await axiosServices.post('/api/auth/refresh', {
            refresh_token: refreshToken
          });

          const { data } = response.data;
          if (data && data.token) {
            localStorage.setItem('serviceToken', data.token);
            axiosServices.defaults.headers.common.Authorization = `Bearer ${data.token}`;
            originalRequest.headers.Authorization = `Bearer ${data.token}`;
            return axiosServices(originalRequest);
          }
        }

        // If refresh fails, logout
        localStorage.removeItem('serviceToken');
        localStorage.removeItem('refreshToken');
        if (!window.location.href.includes('/login')) {
          window.location.pathname = '/login';
        }
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
        localStorage.removeItem('serviceToken');
        localStorage.removeItem('refreshToken');
        if (!window.location.href.includes('/login')) {
          window.location.pathname = '/login';
        }
        return Promise.reject(error);
      }
    }

    // Handle 401 on refresh endpoint itself - just redirect to login
    if (error.response?.status === 401 && originalRequest.url.includes('/api/auth/refresh')) {
      localStorage.removeItem('serviceToken');
      localStorage.removeItem('refreshToken');
      if (!window.location.href.includes('/login')) {
        window.location.pathname = '/login';
      }
      return Promise.reject(error);
    }
    if (error.response?.status === 403) {
      console.error('Access forbidden:', error.response.data?.message);
    }

    // Create error object with message and errors
    const errorMessage = error.response?.data?.message || error.message || 'Network Error';
    const errorObj = new Error(errorMessage);
    errorObj.response = error.response;
    errorObj.errors = error.response?.data?.errors || null;
    errorObj.data = error.response?.data || null;
    return Promise.reject(errorObj);
  }
);

export default axiosServices;

export const fetcher = async (args) => {
  const [url, config] = Array.isArray(args) ? args : [args];

  const res = await axiosServices.get(url, { ...config });

  return res.data;
};
