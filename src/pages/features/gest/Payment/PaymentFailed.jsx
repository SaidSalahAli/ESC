import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { FormattedMessage, useIntl } from 'react-intl';
import { CloseCircle } from 'iconsax-react';
import { ordersService } from 'api/orders';
import './PaymentPages.css';

export default function PaymentFailed() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const intl = useIntl();
  const orderNumber = searchParams.get('order');
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (orderNumber) {
      fetchOrderDetails();
    } else {
      setLoading(false);
    }
  }, [orderNumber]);

  const fetchOrderDetails = async () => {
    try {
      const response = await ordersService.trackOrder(orderNumber);
      if (response.success) {
        setOrder(response.data);
      }
    } catch (err) {
      console.error('Error fetching order:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="payment-page">
        <div className="payment-container">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="payment-page">
      <div className="payment-container failed">
        <div className="payment-icon failed">
          <CloseCircle size="80" color="#f44336" variant="Bold" />
        </div>
        <h1>Payment Failed</h1>
        <p className="payment-message">
          Unfortunately, your payment could not be processed. Please try again or contact support.
        </p>
        
        {order && (
          <div className="order-info">
            <p><strong>Order Number:</strong> {order.order_number}</p>
            <p><strong>Status:</strong> {order.payment_status}</p>
          </div>
        )}
        
        <div className="payment-actions">
          <button 
            className="btn-primary" 
            onClick={() => navigate('/card')}
          >
            Try Again
          </button>
          <button 
            className="btn-secondary" 
            onClick={() => navigate('/profile')}
          >
            View My Orders
          </button>
        </div>
      </div>
    </div>
  );
}








