import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useIntl, FormattedMessage } from 'react-intl';
import { contactService } from 'api/contact';
import { openSnackbar } from 'api/snackbar';
import './ContactMessages.css';

export default function ContactMessages() {
  const navigate = useNavigate();
  const intl = useIntl();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [filters, setFilters] = useState({
    status: '',
    search: ''
  });
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetchMessages();
  }, [filters]);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filters.status) params.status = filters.status;
      if (filters.search) params.search = filters.search;

      const response = await contactService.getAllMessages(params);

      if (response.success) {
        setMessages(response.data?.messages || []);
        setUnreadCount(response.data?.unread_count || 0);
      }
    } catch (err) {
      console.error('Error fetching messages:', err);
      openSnackbar({
        open: true,
        message: 'Failed to load messages',
        variant: 'alert',
        alert: { color: 'error' }
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (messageId, newStatus) => {
    try {
      const response = await contactService.updateStatus(messageId, newStatus);

      if (response.success) {
        openSnackbar({
          open: true,
          message: 'Status updated successfully',
          variant: 'alert',
          alert: { color: 'success' }
        });

        // Update local state
        setMessages((prev) => prev.map((msg) => (msg.id === messageId ? { ...msg, status: newStatus } : msg)));

        if (selectedMessage?.id === messageId) {
          setSelectedMessage((prev) => ({ ...prev, status: newStatus }));
        }

        fetchMessages();
      }
    } catch (err) {
      console.error('Error updating status:', err);
      openSnackbar({
        open: true,
        message: 'Failed to update status',
        variant: 'alert',
        alert: { color: 'error' }
      });
    }
  };

  const handleDelete = async (messageId) => {
    if (!window.confirm('Are you sure you want to delete this message?')) {
      return;
    }

    try {
      const response = await contactService.deleteMessage(messageId);

      if (response.success) {
        openSnackbar({
          open: true,
          message: 'Message deleted successfully',
          variant: 'alert',
          alert: { color: 'success' }
        });

        if (selectedMessage?.id === messageId) {
          setSelectedMessage(null);
        }

        fetchMessages();
      }
    } catch (err) {
      console.error('Error deleting message:', err);
      openSnackbar({
        open: true,
        message: 'Failed to delete message',
        variant: 'alert',
        alert: { color: 'error' }
      });
    }
  };

  const handleViewMessage = async (messageId) => {
    // Navigate to detail page
    navigate(`/dashboard/contact-messages/${messageId}`);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      new: { label: 'New', color: '#1976d2', bg: '#e3f2fd' },
      read: { label: 'Read', color: '#666', bg: '#f5f5f5' },
      replied: { label: 'Replied', color: '#2e7d32', bg: '#e8f5e9' },
      archived: { label: 'Archived', color: '#757575', bg: '#fafafa' }
    };

    const config = statusConfig[status] || statusConfig.new;

    return (
      <span
        style={{
          padding: '4px 12px',
          borderRadius: '12px',
          fontSize: '12px',
          fontWeight: 500,
          color: config.color,
          backgroundColor: config.bg
        }}
      >
        {config.label}
      </span>
    );
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="contact-messages-page">
      <div className="messages-header">
        <h1>
          <FormattedMessage id="contact-messages" defaultMessage="Contact Messages" />
        </h1>
        {unreadCount > 0 && (
          <div className="unread-badge">
            {unreadCount} <FormattedMessage id="unread" defaultMessage="unread" />
          </div>
        )}
      </div>

      <div className="messages-filters">
        <input
          type="text"
          placeholder={intl.formatMessage({ id: 'search-messages' }) || 'Search messages...'}
          value={filters.search}
          onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
          className="search-input"
        />
        <select
          value={filters.status}
          onChange={(e) => setFilters((prev) => ({ ...prev, status: e.target.value }))}
          className="status-filter"
        >
          <option value="">All Status</option>
          <option value="new">New</option>
          <option value="read">Read</option>
          <option value="replied">Replied</option>
          <option value="archived">Archived</option>
        </select>
      </div>

      <div className="messages-container">
        <div className="messages-list">
          {loading ? (
            <div className="loading">Loading messages...</div>
          ) : messages.length === 0 ? (
            <div className="empty-state">No messages found</div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`message-item ${selectedMessage?.id === message.id ? 'selected' : ''} ${message.status === 'new' ? 'unread' : ''}`}
                onClick={() => handleViewMessage(message.id)}
              >
                <div className="message-header">
                  <div className="message-sender">
                    <strong>{message.name}</strong>
                    <span className="message-email">{message.email}</span>
                  </div>
                  {getStatusBadge(message.status)}
                </div>
                <div className="message-subject">{message.subject}</div>
                <div className="message-preview">
                  {message.message.substring(0, 100)}
                  {message.message.length > 100 ? '...' : ''}
                </div>
                <div className="message-date">{formatDate(message.created_at)}</div>
              </div>
            ))
          )}
        </div>

        {selectedMessage && (
          <div className="message-detail">
            <div className="detail-header">
              <h2>{selectedMessage.subject}</h2>
              <div className="detail-actions">
                <select
                  value={selectedMessage.status}
                  onChange={(e) => handleStatusChange(selectedMessage.id, e.target.value)}
                  className="status-select"
                >
                  <option value="new">New</option>
                  <option value="read">Read</option>
                  <option value="replied">Replied</option>
                  <option value="archived">Archived</option>
                </select>
                <button onClick={() => handleDelete(selectedMessage.id)} className="delete-btn">
                  Delete
                </button>
              </div>
            </div>

            <div className="detail-info">
              <div className="info-row">
                <strong>From:</strong>
                <span>
                  {selectedMessage.name} ({selectedMessage.email})
                </span>
              </div>
              {selectedMessage.phone && (
                <div className="info-row">
                  <strong>Phone:</strong>
                  <span>{selectedMessage.phone}</span>
                </div>
              )}
              <div className="info-row">
                <strong>Date:</strong>
                <span>{formatDate(selectedMessage.created_at)}</span>
              </div>
              {selectedMessage.user_id && (
                <div className="info-row">
                  <strong>User ID:</strong>
                  <span>{selectedMessage.user_id}</span>
                </div>
              )}
            </div>

            <div className="detail-message">
              <h3>Message:</h3>
              <p>{selectedMessage.message}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
