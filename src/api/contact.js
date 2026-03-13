import axios from 'utils/axios';

// ==============================|| CONTACT API SERVICES ||============================== //

export const contactService = {
  // Submit contact message (public)
  submitMessage: async (messageData) => {
    const response = await axios.post('/api/contact', messageData);
    return response.data;
  },

  // Get all messages (admin only)
  getAllMessages: async (params = {}) => {
    const response = await axios.get('/api/admin/contact', { params });
    return response.data;
  },

  // Get message by ID (admin only)
  getMessageById: async (id) => {
    const response = await axios.get(`/api/admin/contact/${id}`);
    return response.data;
  },

  // Update message status (admin only)
  updateStatus: async (id, status) => {
    const response = await axios.put(`/api/admin/contact/${id}/status`, { status });
    return response.data;
  },

  // Delete message (admin only)
  deleteMessage: async (id) => {
    const response = await axios.delete(`/api/admin/contact/${id}`);
    return response.data;
  },

  // Reply to message (admin only)
  reply: async (id, data) => {
    const response = await axios.post(`/api/admin/contact/${id}/reply`, data);
    return response.data;
  }
};
