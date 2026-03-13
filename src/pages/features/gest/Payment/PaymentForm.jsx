import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { FormattedMessage, useIntl } from 'react-intl';
import { Lock, Calendar, User, Lock1 } from 'iconsax-react';
import { paymentService } from 'api/payment';
import { ordersService } from 'api/orders';
import { openSnackbar } from 'api/snackbar';
import AuthGuard from 'utils/route-guard/AuthGuard';
import './PaymentForm.css';

export default function PaymentForm() {
  const { orderId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const intl = useIntl();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [formData, setFormData] = useState({
    card_number: '',
    cardholder_name: '',
    expiry_month: '',
    expiry_year: '',
    cvv: ''
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (orderId) {
      fetchOrderDetails();
    } else {
      setLoading(false);
    }
  }, [orderId]);

  const fetchOrderDetails = async () => {
    try {
      const response = await ordersService.getOrderDetails(orderId);
      if (response.success) {
        setOrder(response.data);
      } else {
        throw new Error(response.message || 'Failed to load order');
      }
    } catch (err) {
      console.error('Error fetching order:', err);
      openSnackbar({
        open: true,
        message: 'Failed to load order details',
        variant: 'alert',
        alert: { color: 'error' }
      });
      navigate('/profile');
    } finally {
      setLoading(false);
    }
  };

  const formatCardNumber = (value) => {
    // Remove all non-digits
    const cleaned = value.replace(/\D/g, '');
    // Add spaces every 4 digits
    const formatted = cleaned.match(/.{1,4}/g)?.join(' ') || cleaned;
    return formatted.substring(0, 19); // Max 16 digits + 3 spaces
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    let processedValue = value;

    if (name === 'card_number') {
      processedValue = formatCardNumber(value);
    } else if (name === 'cvv') {
      processedValue = value.replace(/\D/g, '').substring(0, 4);
    } else if (name === 'expiry_month' || name === 'expiry_year') {
      processedValue = value.replace(/\D/g, '');
      if (name === 'expiry_month') {
        processedValue = processedValue.substring(0, 2);
        if (processedValue && parseInt(processedValue) > 12) {
          processedValue = '12';
        }
      } else if (name === 'expiry_year') {
        processedValue = processedValue.substring(0, 2);
      }
    } else if (name === 'cardholder_name') {
      processedValue = value.toUpperCase();
    }

    setFormData((prev) => ({
      ...prev,
      [name]: processedValue
    }));

    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Validate card number (16 digits)
    const cardNumber = formData.card_number.replace(/\s/g, '');
    if (!cardNumber || cardNumber.length !== 16) {
      newErrors.card_number = 'Card number must be 16 digits';
    } else if (!/^\d+$/.test(cardNumber)) {
      newErrors.card_number = 'Card number must contain only digits';
    }

    // Validate cardholder name
    if (!formData.cardholder_name || formData.cardholder_name.length < 3) {
      newErrors.cardholder_name = 'Please enter cardholder name';
    }

    // Validate expiry month
    if (!formData.expiry_month || formData.expiry_month.length !== 2) {
      newErrors.expiry_month = 'Invalid month';
    } else {
      const month = parseInt(formData.expiry_month);
      if (month < 1 || month > 12) {
        newErrors.expiry_month = 'Invalid month';
      }
    }

    // Validate expiry year
    if (!formData.expiry_year || formData.expiry_year.length !== 2) {
      newErrors.expiry_year = 'Invalid year';
    }

    // Validate CVV
    if (!formData.cvv || formData.cvv.length < 3) {
      newErrors.cvv = 'CVV must be 3-4 digits';
    }

    // Check if card is expired
    if (!newErrors.expiry_month && !newErrors.expiry_year) {
      const currentYear = new Date().getFullYear() % 100;
      const currentMonth = new Date().getMonth() + 1;
      const expiryYear = parseInt(formData.expiry_year);
      const expiryMonth = parseInt(formData.expiry_month);

      if (expiryYear < currentYear || (expiryYear === currentYear && expiryMonth < currentMonth)) {
        newErrors.expiry_month = 'Card has expired';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      openSnackbar({
        open: true,
        message: 'Please fix the errors in the form',
        variant: 'alert',
        alert: { color: 'error' }
      });
      return;
    }

    try {
      setProcessing(true);

      // Prepare payment data
      const paymentData = {
        order_id: orderId,
        card_number: formData.card_number.replace(/\s/g, ''),
        cardholder_name: formData.cardholder_name,
        expiry_month: formData.expiry_month,
        expiry_year: formData.expiry_year,
        cvv: formData.cvv
      };

      // Process payment through backend (which will send to CIB Bank)
      const response = await paymentService.processPayment(paymentData);

      if (response.success) {
        // Redirect to CIB Bank payment page
        if (response.data?.payment_url) {
          window.location.href = response.data.payment_url;
        } else {
          throw new Error('Payment URL not received');
        }
      } else {
        throw new Error(response.message || 'Payment processing failed');
      }
    } catch (err) {
      console.error('Error processing payment:', err);
      openSnackbar({
        open: true,
        message: err.message || 'Failed to process payment. Please try again.',
        variant: 'alert',
        alert: { color: 'error' }
      });
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="payment-form-page">
        <div className="payment-form-container">
          <p>Loading order details...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="payment-form-page">
        <div className="payment-form-container">
          <p>Order not found</p>
        </div>
      </div>
    );
  }

  // Generate current and future years for expiry
  const currentYear = new Date().getFullYear() % 100;
  const years = [];
  for (let i = 0; i < 10; i++) {
    years.push(currentYear + i);
  }

  return (
    <AuthGuard>
      <div className="payment-form-page">
        <div className="payment-form-container">
          <div className="payment-header">
            <div className="security-badge">
              <Lock size="20" color="#4caf50" variant="Bold" />
              <span>Secure Payment</span>
            </div>
            <h1>Payment Details</h1>
            <p className="order-info">
              Order: <strong>{order.order_number}</strong> | Amount:{' '}
              <strong>
                {order.total} {order.currency || 'EGP'}
              </strong>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="payment-form">
            {/* Card Number */}
            <div className="form-group">
              <label htmlFor="card_number">
                {/* <CreditCard size="18" /> */}
                Card Number <span className="required">*</span>
              </label>
              <input
                type="text"
                id="card_number"
                name="card_number"
                value={formData.card_number}
                onChange={handleInputChange}
                placeholder="1234 5678 9012 3456"
                maxLength="19"
                className={errors.card_number ? 'error' : ''}
                disabled={processing}
                autoComplete="cc-number"
              />
              {errors.card_number && <span className="error-message">{errors.card_number}</span>}
            </div>

            {/* Cardholder Name */}
            <div className="form-group">
              <label htmlFor="cardholder_name">
                <User size="18" />
                Cardholder Name <span className="required">*</span>
              </label>
              <input
                type="text"
                id="cardholder_name"
                name="cardholder_name"
                value={formData.cardholder_name}
                onChange={handleInputChange}
                placeholder="JOHN DOE"
                className={errors.cardholder_name ? 'error' : ''}
                disabled={processing}
                autoComplete="cc-name"
              />
              {errors.cardholder_name && <span className="error-message">{errors.cardholder_name}</span>}
            </div>

            {/* Expiry Date and CVV */}
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="expiry_month">
                  <Calendar size="18" />
                  Expiry Date <span className="required">*</span>
                </label>
                <div className="expiry-inputs">
                  <input
                    type="text"
                    id="expiry_month"
                    name="expiry_month"
                    value={formData.expiry_month}
                    onChange={handleInputChange}
                    placeholder="MM"
                    maxLength="2"
                    className={errors.expiry_month ? 'error' : ''}
                    disabled={processing}
                    autoComplete="cc-exp-month"
                  />
                  <span>/</span>
                  <input
                    type="text"
                    id="expiry_year"
                    name="expiry_year"
                    value={formData.expiry_year}
                    onChange={handleInputChange}
                    placeholder="YY"
                    maxLength="2"
                    className={errors.expiry_year ? 'error' : ''}
                    disabled={processing}
                    autoComplete="cc-exp-year"
                  />
                </div>
                {(errors.expiry_month || errors.expiry_year) && (
                  <span className="error-message">{errors.expiry_month || errors.expiry_year}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="cvv">
                  <Lock1 size="18" />
                  CVV <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id="cvv"
                  name="cvv"
                  value={formData.cvv}
                  onChange={handleInputChange}
                  placeholder="123"
                  maxLength="4"
                  className={errors.cvv ? 'error' : ''}
                  disabled={processing}
                  autoComplete="cc-csc"
                />
                {errors.cvv && <span className="error-message">{errors.cvv}</span>}
              </div>
            </div>

            {/* Security Notice */}
            <div className="security-notice">
              <Lock size="16" color="#4caf50" />
              <p>Your payment information is encrypted and securely processed by CIB Bank. We do not store your card details.</p>
            </div>

            {/* Submit Button */}
            <div className="form-actions">
              <button type="button" onClick={() => navigate(-1)} className="btn-cancel" disabled={processing}>
                Cancel
              </button>
              <button type="submit" className="btn-submit" disabled={processing}>
                {processing ? (
                  <>
                    <span className="spinner"></span>
                    Processing...
                  </>
                ) : (
                  <>
                    Pay {order.total} {order.currency || 'EGP'}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </AuthGuard>
  );
}
