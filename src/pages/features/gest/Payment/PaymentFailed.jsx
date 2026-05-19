import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { FormattedMessage, useIntl } from 'react-intl';
import { CloseCircle } from 'iconsax-react';
import { ordersService } from 'api/orders';
import { guestCheckoutService } from 'api/guestCheckout';
import './PaymentPages.css';

export default function PaymentFailed() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const intl = useIntl();
  const orderNumber = searchParams.get('order');
  const viewToken = searchParams.get('view_token');
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
      let response;
      if (viewToken) {
        response = await guestCheckoutService.getGuestOrder(orderNumber, viewToken);
      } else {
        response = await ordersService.trackOrder(orderNumber);
      }
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
            onClick={() => {
              if (viewToken) {
                navigate(`/guest-checkout/orders/${orderNumber}`, { state: { viewToken } });
              } else {
                navigate('/profile');
              }
            }}
          >
            {viewToken ? 'Track Guest Order' : 'View My Orders'}
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









