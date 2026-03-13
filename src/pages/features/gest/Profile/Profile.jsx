import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FormattedMessage } from 'react-intl';
import {
  Profile,
  DocumentText,
  Logout,
  Location,
  InfoCircle,
  Sms,
  Calendar,
  Setting2,
  Printer,
  DocumentDownload,
  Global
} from 'iconsax-react';
import { authService } from 'api/auth';
import { ordersService } from 'api/orders';
import useAuth from 'hooks/useAuth';
import './profile.css';

function ProfilePage() {
  const navigate = useNavigate();
  const { user: authUser, logout: authLogout } = useAuth();
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('profile');

  // Invoice states
  const [downloadingInvoice, setDownloadingInvoice] = useState({});
  const [printingInvoice, setPrintingInvoice] = useState({});
  const [invoiceLanguage, setInvoiceLanguage] = useState({});

  useEffect(() => {
    fetchUserData();
    fetchOrders();
  }, []);

  const fetchUserData = async () => {
    try {
      const response = await authService.getMe();
      setUser(response.data);
    } catch (error) {
      console.error('Failed to fetch user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrders = async () => {
    try {
      const response = await ordersService.getMyOrders(1, 10);
      setOrders(response.data?.orders || []);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    }
  };

  const handleLogout = () => {
    authLogout();
    navigate('/login');
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getOrderStatusColor = (status) => {
    const statusColors = {
      pending: '#ff9800',
      processing: '#2196f3',
      shipped: '#9c27b0',
      delivered: '#4caf50',
      cancelled: '#f44336'
    };
    return statusColors[status] || '#757575';
  };

  // Get language for a specific order (default 'en')
  const getOrderLanguage = (orderId) => invoiceLanguage[orderId] || 'en';

  // Toggle language for a specific order
  const toggleInvoiceLanguage = (orderId) => {
    setInvoiceLanguage((prev) => ({
      ...prev,
      [orderId]: prev[orderId] === 'ar' ? 'en' : 'ar'
    }));
  };

  // Download invoice as PDF
  const handleDownloadInvoice = async (orderId) => {
    const lang = getOrderLanguage(orderId);
    setDownloadingInvoice((prev) => ({ ...prev, [orderId]: true }));
    try {
      await ordersService.downloadInvoicePdf(orderId, lang);
    } catch (error) {
      console.error('Failed to download invoice:', error);
      alert('Failed to download invoice. Please try again.');
    } finally {
      setDownloadingInvoice((prev) => ({ ...prev, [orderId]: false }));
    }
  };

  // Open invoice in new tab and trigger print
  const handlePrintInvoice = (orderId) => {
    const lang = getOrderLanguage(orderId);
    setPrintingInvoice((prev) => ({ ...prev, [orderId]: true }));

    const invoiceUrl = ordersService.getInvoicePdfUrl(orderId) + `?lang=${lang}`;
    const printWindow = window.open(invoiceUrl, '_blank');

    if (printWindow) {
      printWindow.onload = () => {
        setTimeout(() => {
          printWindow.print();
          setPrintingInvoice((prev) => ({ ...prev, [orderId]: false }));
        }, 500);
      };
    } else {
      setPrintingInvoice((prev) => ({ ...prev, [orderId]: false }));
    }
  };

  if (loading) {
    return (
      <div className="profile-loading">
        <div className="loading-spinner"></div>
        <p>Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <div className="profile-container">
        {/* Header Section */}
        <div className="profile-header">
          <div className="profile-avatar">
            {user?.avatar ? (
              <img src={user.avatar} alt={user.first_name} />
            ) : (
              <div className="avatar-placeholder">{user?.first_name?.[0]?.toUpperCase() || 'U'}</div>
            )}
          </div>
          <div className="profile-info">
            <h1>
              {user?.first_name} {user?.last_name}
            </h1>
            <p className="profile-email">{user?.email}</p>
            {user?.role === 'admin' && <span className="role-badge admin">Admin</span>}
            {user?.role === 'user' && <span className="role-badge user">User</span>}
          </div>
        </div>

        {/* Tabs */}
        <div className="profile-tabs">
          <button className={`tab-button ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => setActiveTab('profile')}>
            <Profile size="20" />
            <span>Profile</span>
          </button>
          <button className={`tab-button ${activeTab === 'orders' ? 'active' : ''}`} onClick={() => setActiveTab('orders')}>
            <DocumentText size="20" />
            <span>Orders ({orders.length})</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="profile-content">
          {activeTab === 'profile' && (
            <div className="profile-details">
              <div className="details-section">
                <h2>Personal Information</h2>
                <div className="info-grid">
                  <div className="info-item">
                    <div className="info-icon">
                      <Profile size="20" />
                    </div>
                    <div className="info-content">
                      <label>Full Name</label>
                      <p>
                        {user?.first_name} {user?.last_name}
                      </p>
                    </div>
                  </div>
                  <div className="info-item">
                    <div className="info-icon">
                      <Sms size="20" />
                    </div>
                    <div className="info-content">
                      <label>Email</label>
                      <p>{user?.email}</p>
                    </div>
                  </div>
                  <div className="info-item">
                    <div className="info-icon">
                      <InfoCircle size="20" />
                    </div>
                    <div className="info-content">
                      <label>Phone</label>
                      <p>{user?.phone || 'Not provided'}</p>
                    </div>
                  </div>
                  <div className="info-item">
                    <div className="info-icon">
                      <Calendar size="20" />
                    </div>
                    <div className="info-content">
                      <label>Member Since</label>
                      <p>{formatDate(user?.created_at)}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="details-section">
                <h2>Account Actions</h2>
                <div className="action-buttons">
                  {user?.role === 'admin' && (
                    <button className="action-btn dashboard" onClick={() => navigate('/dashboard')}>
                      <Setting2 size="20" />
                      <span>Go to Dashboard</span>
                    </button>
                  )}
                  <button className="action-btn logout" onClick={handleLogout}>
                    <Logout size="20" />
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'orders' && (
            <div className="orders-section">
              <h2>
                <FormattedMessage id="my-orders" />
              </h2>
              {orders.length === 0 ? (
                <div className="empty-orders">
                  <DocumentText size="48" />
                  <p>No orders yet</p>
                  <button className="shop-btn" onClick={() => navigate('/collections')}>
                    Start Shopping
                  </button>
                </div>
              ) : (
                <div className="orders-list">
                  {orders.map((order) => {
                    const lang = getOrderLanguage(order.id);
                    const isDownloading = downloadingInvoice[order.id];
                    const isPrinting = printingInvoice[order.id];

                    return (
                      <div key={order.id} className="order-card">
                        <div className="order-header">
                          <div className="order-info">
                            <h3>Order #{order.order_number}</h3>
                            <p className="order-date">{formatDate(order.created_at)}</p>
                          </div>
                          <div className="order-status">
                            <span className="status-badge" style={{ backgroundColor: getOrderStatusColor(order.status) }}>
                              {order.status?.toUpperCase()}
                            </span>
                          </div>
                        </div>

                        <div className="order-details">
                          <div className="order-item">
                            <span className="label">
                              <FormattedMessage id="total" />:
                            </span>
                            <span className="value">
                              {order.currency || 'EGP'} {parseFloat(order.total || 0).toFixed(2)}
                            </span>
                          </div>
                          <div className="order-item">
                            <span className="label">
                              <FormattedMessage id="items" />:
                            </span>
                            <span className="value">{order.items_count || 0}</span>
                          </div>
                          <div className="order-item">
                            <span className="label">
                              <FormattedMessage id="payment-status" />:
                            </span>
                            <span className="value">{order.payment_status || 'N/A'}</span>
                          </div>
                        </div>

                        <div className="order-actions" style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                          {/* View Details */}
                          <button className="view-order-btn" onClick={() => navigate(`/orders/${order.id}`)}>
                            <FormattedMessage id="view-details" />
                          </button>

                          {/* Language Toggle */}
                          <button
                            onClick={() => toggleInvoiceLanguage(order.id)}
                            title={lang === 'ar' ? 'Switch to English' : 'التبديل للعربية'}
                            style={{
                              padding: '8px 12px',
                              background: '#f0f0f0',
                              color: '#333',
                              border: '1px solid #ddd',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '5px',
                              fontSize: '12px',
                              fontWeight: '600'
                            }}
                          >
                            <Global size="15" />
                            {lang === 'ar' ? 'AR' : 'EN'}
                          </button>

                          {/* Download Invoice */}
                          <button
                            className="invoice-btn"
                            onClick={() => handleDownloadInvoice(order.id)}
                            disabled={isDownloading}
                            title={`Download invoice (${lang.toUpperCase()})`}
                            style={{
                              padding: '8px 16px',
                              background: isDownloading ? '#90caf9' : '#1976d2',
                              color: 'white',
                              border: 'none',
                              borderRadius: '6px',
                              cursor: isDownloading ? 'not-allowed' : 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              fontSize: '13px',
                              transition: 'background 0.2s'
                            }}
                          >
                            <DocumentDownload size="16" />
                            {isDownloading ? '...' : <FormattedMessage id="download-invoice" defaultMessage="Download Invoice" />}
                          </button>

                          {/* Print Invoice */}
                          <button
                            className="print-invoice-btn"
                            onClick={() => handlePrintInvoice(order.id)}
                            disabled={isPrinting}
                            title={`Print invoice (${lang.toUpperCase()})`}
                            style={{
                              padding: '8px 14px',
                              background: isPrinting ? '#a5d6a7' : '#4caf50',
                              color: 'white',
                              border: 'none',
                              borderRadius: '6px',
                              cursor: isPrinting ? 'not-allowed' : 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              fontSize: '13px',
                              transition: 'background 0.2s'
                            }}
                          >
                            <Printer size="16" />
                            {isPrinting ? '...' : null}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;
