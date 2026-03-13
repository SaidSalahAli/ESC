import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { FormattedMessage, useIntl } from 'react-intl';
import { CloseCircle } from 'iconsax-react';
import { ordersService } from 'api/orders';
import './PaymentPages.css';

export default function PaymentCancelled() {
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
      <div className="payment-container cancelled">
        <div className="payment-icon cancelled">
          <CloseCircle size="80" color="#ff9800" variant="Bold" />
        </div>
        <h1>Payment Cancelled</h1>
        <p className="payment-message">
          You cancelled the payment process. Your order is still pending. You can complete the payment later.
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
            onClick={() => navigate('/profile')}
          >
            View My Orders
          </button>
          <button 
            className="btn-secondary" 
            onClick={() => navigate('/')}
          >
            Continue Shopping
          </button>
        </div>
      </div>
    </div>
  );
}






