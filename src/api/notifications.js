import axios from 'utils/axios';

// ==============================|| NOTIFICATIONS API SERVICES ||============================== //

export const notificationService = {
  // Get all notifications
  getAll: async (params = {}) => {
    const response = await axios.get('/api/notifications', { params });
    return response.data;
  },

  // Get unread count
  getUnreadCount: async () => {
    const response = await axios.get('/api/notifications/unread-count');
    return response.data;
  },

  // Mark notification as read
  markAsRead: async (id) => {
    const response = await axios.put(`/api/notifications/${id}/read`);
    return response.data;
  },

  // Mark all notifications as read
  markAllAsRead: async () => {
    const response = await axios.put('/api/notifications/read-all');
    return response.data;
  },

  // Delete notification
  delete: async (id) => {
    const response = await axios.delete(`/api/notifications/${id}`);
    return response.data;
  }
};
