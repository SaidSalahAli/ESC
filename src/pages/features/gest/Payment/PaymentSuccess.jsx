import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { FormattedMessage, useIntl } from 'react-intl';
import { TickCircle } from 'iconsax-react';
import { ordersService } from 'api/orders';
import { openSnackbar } from 'api/snackbar';
import './PaymentPages.css';

export default function PaymentSuccess() {
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
      <div className="payment-container success">
        <div className="payment-icon success">
          <TickCircle size="80" color="#4caf50" variant="Bold" />
        </div>
        <h1>Payment Successful!</h1>
        <p className="payment-message">
          Your payment has been processed successfully. Your order is being prepared.
        </p>
        
        {order && (
          <div className="order-info">
            <p><strong>Order Number:</strong> {order.order_number}</p>
            <p><strong>Total:</strong> {order.total} {order.currency || 'EGP'}</p>
            <p><strong>Status:</strong> {order.status}</p>
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






