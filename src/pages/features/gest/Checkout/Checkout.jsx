import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FormattedMessage, useIntl } from 'react-intl';
import axios from 'utils/axios';
import { cartService } from 'api/cart';
import { ordersService } from 'api/orders';
import { paymentService } from 'api/payment';
import useAuth from 'hooks/useAuth';
import { openSnackbar } from 'api/snackbar';
import { getGuestCart, clearGuestCart, mergeGuestCartWithUserCart } from 'utils/guestCart';
import { getImageUrl } from 'utils/imageHelper';
import { saveCheckoutData, getCheckoutData, clearCheckoutData } from 'utils/checkoutStorage';

import {
  Box,
  Container,
  Grid,
  Typography,
  TextField,
  Button,
  Paper,
  Divider,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  CircularProgress,
  Alert,
  Stack,
  Chip,
  MenuItem
} from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import PaymentsOutlinedIcon from '@mui/icons-material/PaymentsOutlined';
import { border, borderRadius } from '@mui/system';

function Checkout() {
  const navigate = useNavigate();
  const intl = useIntl();
  const { user } = useAuth();

  const [cartItems, setCartItems] = useState([]);
  const [summary, setSummary] = useState({ subtotal: 0, item_count: 0, total_items: 0 });
  const [loading, setLoading] = useState(true);
  const [shippingCost, setShippingCost] = useState(0);
  const [processing, setProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('cash_on_delivery');
  const [orderCreated, setOrderCreated] = useState(false);
  const [createdOrderId, setCreatedOrderId] = useState(null);
  const [paymentFormData, setPaymentFormData] = useState({
    card_number: '',
    cardholder_name: '',
    expiry_month: '',
    expiry_year: '',
    cvv: ''
  });
  const [paymentErrors, setPaymentErrors] = useState({});
  const [processingPayment, setProcessingPayment] = useState(false);
  const [governorates, setGovernorates] = useState([]);
  const [loadingGovernorates, setLoadingGovernorates] = useState(true);

  const [shippingAddress, setShippingAddress] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    phone: user?.phone || '',
    email: user?.email || '',
    address_line1: '',
    address_line2: '',
    city: '',
    state: '',
    postal_code: '',
    country: 'Egypt', // Set to Egypt by default
    governorate: '' // User must select this
  });

  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    // Only merge guest cart if user is logged in
    if (user) {
      mergeGuestCartWithUserCart(cartService).then(() => {
        fetchCart();
      });
    } else {
      // For guests, just fetch the cart directly
      fetchCart();
    }

    // Load saved checkout data if exists
    const savedCheckoutData = getCheckoutData();
    if (savedCheckoutData) {
      setShippingAddress((prev) => ({
        ...prev,
        ...savedCheckoutData
      }));
      // Clear the saved data after loading to avoid confusion
      clearCheckoutData();
    }

    // Fetch shipping governorates
    const fetchGovernorates = async () => {
      try {
        setLoadingGovernorates(true);
        const response = await ordersService.getShippingGovernorates();
        if (response.success && response.data?.governorates) {
          setGovernorates(response.data.governorates);
        }
      } catch (err) {
        console.error('Error fetching governorates:', err);
      } finally {
        setLoadingGovernorates(false);
      }
    };

    fetchGovernorates();
  }, [user]);

  // Auto-save checkout data when shipping address changes
  useEffect(() => {
    saveCheckoutData(shippingAddress);
  }, [shippingAddress]);

  // Update shipping cost when governorate changes
  useEffect(() => {
    if (shippingAddress.governorate && governorates.length > 0) {
      const selected = governorates.find((g) => g.name === shippingAddress.governorate);
      if (selected) {
        setShippingCost(parseFloat(selected.shipping_cost));
      }
    }
  }, [shippingAddress.governorate, governorates]);

  const fetchCart = async () => {
    try {
      setLoading(true);

      // For guests, load from localStorage
      if (!user) {
        const guestCart = getGuestCart();
        if (guestCart && guestCart.length > 0) {
          // Transform guest cart to the same format as API response
          setCartItems(guestCart);
          const subtotal = guestCart.reduce((total, item) => {
            return total + parseFloat(item.sale_price || item.product_price || 0) * item.quantity;
          }, 0);
          setSummary({
            subtotal: subtotal.toFixed(2),
            item_count: guestCart.length,
            total_items: guestCart.reduce((total, item) => total + item.quantity, 0)
          });
        } else {
          openSnackbar({ open: true, message: 'Cart is empty', variant: 'alert', alert: { color: 'warning' } });
          navigate('/collections');
        }
        return;
      }

      // For logged-in users, fetch from API
      const response = await cartService.getCart();
      if (response.success) {
        setCartItems(response.data?.items || []);
        setSummary(response.data?.summary || { subtotal: 0, item_count: 0, total_items: 0 });
        if (response.data?.items?.length === 0) navigate('/card');
      }
    } catch (err) {
      console.error('Error fetching cart:', err);
      openSnackbar({ open: true, message: 'Failed to load cart', variant: 'alert', alert: { color: 'error' } });
      navigate('/collections');
    } finally {
      setLoading(false);
    }
  };

  const subtotal = parseFloat(summary.subtotal) || 0;

  const total = parseFloat((subtotal + shippingCost).toFixed(2));

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setShippingAddress((prev) => ({ ...prev, [name]: value }));
    // Clear validation error for this field when user starts typing
    if (validationErrors[name]) {
      setValidationErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const formatCardNumber = (value) => {
    const cleaned = value.replace(/\D/g, '');
    const formatted = cleaned.match(/.{1,4}/g)?.join(' ') || cleaned;
    return formatted.substring(0, 19);
  };

  const handlePaymentInputChange = (e) => {
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
        if (processedValue && parseInt(processedValue) > 12) processedValue = '12';
      } else if (name === 'expiry_year') {
        processedValue = processedValue.substring(0, 2);
      }
    } else if (name === 'cardholder_name') {
      processedValue = value.toUpperCase();
    }

    setPaymentFormData((prev) => ({ ...prev, [name]: processedValue }));
    if (paymentErrors[name]) setPaymentErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validatePaymentForm = () => {
    const newErrors = {};
    const cardNumber = paymentFormData.card_number.replace(/\s/g, '');
    if (!cardNumber || cardNumber.length !== 16) newErrors.card_number = 'Card number must be 16 digits';
    if (!paymentFormData.cardholder_name || paymentFormData.cardholder_name.length < 3)
      newErrors.cardholder_name = 'Please enter cardholder name';
    if (!paymentFormData.expiry_month || paymentFormData.expiry_month.length !== 2) newErrors.expiry_month = 'Invalid month';
    else {
      const month = parseInt(paymentFormData.expiry_month);
      if (month < 1 || month > 12) newErrors.expiry_month = 'Invalid month';
    }
    if (!paymentFormData.expiry_year || paymentFormData.expiry_year.length !== 2) newErrors.expiry_year = 'Invalid year';
    if (!paymentFormData.cvv || paymentFormData.cvv.length < 3) newErrors.cvv = 'CVV must be 3-4 digits';
    if (!newErrors.expiry_month && !newErrors.expiry_year) {
      const currentYear = new Date().getFullYear() % 100;
      const currentMonth = new Date().getMonth() + 1;
      const expiryYear = parseInt(paymentFormData.expiry_year);
      const expiryMonth = parseInt(paymentFormData.expiry_month);
      if (expiryYear < currentYear || (expiryYear === currentYear && expiryMonth < currentMonth))
        newErrors.expiry_month = 'Card has expired';
    }
    setPaymentErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    if (!validatePaymentForm()) {
      openSnackbar({ open: true, message: 'Please fix the errors in the payment form', variant: 'alert', alert: { color: 'error' } });
      return;
    }
    try {
      setProcessingPayment(true);
      const paymentData = {
        order_id: createdOrderId,
        card_number: paymentFormData.card_number.replace(/\s/g, ''),
        cardholder_name: paymentFormData.cardholder_name,
        expiry_month: paymentFormData.expiry_month,
        expiry_year: paymentFormData.expiry_year,
        cvv: paymentFormData.cvv
      };
      const response = await paymentService.processPayment(paymentData);
      if (response.success) {
        if (response.data?.payment_url) window.location.href = response.data.payment_url;
        else throw new Error('Payment URL not received');
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
      setProcessingPayment(false);
    }
  };

  const validateShippingForm = () => {
    const errors = {};

    if (!shippingAddress.first_name || shippingAddress.first_name.trim() === '') {
      errors.first_name = intl.formatMessage({ id: 'first-name-required' }) || 'First name is required';
    }
    if (!shippingAddress.last_name || shippingAddress.last_name.trim() === '') {
      errors.last_name = intl.formatMessage({ id: 'last-name-required' }) || 'Last name is required';
    }
    if (!shippingAddress.phone || shippingAddress.phone.trim() === '') {
      errors.phone = intl.formatMessage({ id: 'phone-number-required' }) || 'Phone number is required';
    }
    // Email validation for guests
    if (!user && (!shippingAddress.email || shippingAddress.email.trim() === '')) {
      errors.email = 'Email is required for guest checkout';
    }
    if (!shippingAddress.address_line1 || shippingAddress.address_line1.trim() === '') {
      errors.address_line1 = intl.formatMessage({ id: 'address-line-1-required' }) || 'Address is required';
    }
    if (!shippingAddress.city || shippingAddress.city.trim() === '') {
      errors.city = intl.formatMessage({ id: 'city-required' }) || 'City is required';
    }
    // Validate governorate - MUST be selected
    if (!shippingAddress.governorate || shippingAddress.governorate.trim() === '') {
      errors.governorate = intl.formatMessage({ id: 'governorate-required' }) || 'Please select a governorate';
    } else {
      // Verify that selected governorate exists in the list
      const governorateExists = governorates.some((g) => g.name === shippingAddress.governorate);
      if (!governorateExists) {
        errors.governorate = 'Invalid governorate selected';
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handlePlaceOrder = async () => {
    // Validate form first
    if (!validateShippingForm()) {
      openSnackbar({
        open: true,
        message: intl.formatMessage({ id: 'please-fill-shipping' }) || 'Please fill in all required fields',
        variant: 'alert',
        alert: { color: 'error' }
      });
      return;
    }

    if (cartItems.length === 0) {
      openSnackbar({ open: true, message: 'Cart is empty', variant: 'alert', alert: { color: 'error' } });
      navigate('/collections');
      return;
    }
    try {
      setProcessing(true);

      // For guests, use guestCheckoutService
      if (!user) {
        const guestOrderData = {
          guest_email: shippingAddress.email || '',
          guest_name: `${shippingAddress.first_name} ${shippingAddress.last_name}`,
          guest_phone: shippingAddress.phone,
          shipping_address: shippingAddress,
          billing_address: shippingAddress,
          payment_method: paymentMethod,
          shipping_cost: shippingCost,
          subtotal: subtotal,
          cart_items: cartItems.map((item) => ({
            product_id: item.product_id,
            variant_id: item.variant_id,
            quantity: item.quantity,
            price: item.sale_price || item.product_price || 0
          }))
        };

        const orderResponse = await axios.post('/api/guest-checkout', guestOrderData);
        if (!orderResponse.data.success) throw new Error(orderResponse.data.message || 'Failed to create order');

        const order = orderResponse.data.data?.order || orderResponse.data.data;
        const orderId = order?.id;
        if (!orderId) throw new Error('Order ID not received');

        openSnackbar({
          open: true,
          message: 'Order placed successfully!',
          variant: 'alert',
          alert: { color: 'success' }
        });

        // Clear guest cart and checkout data
        clearGuestCart();
        clearCheckoutData();

        setTimeout(() => {
          navigate(`/guest-checkout/orders/${order.order_number}`, { state: { viewToken: order.view_token } });
        }, 1500);
        return;
      }

      // For logged-in users, use regular order endpoint
      const orderData = {
        shipping_address: shippingAddress,
        billing_address: shippingAddress,
        payment_method: paymentMethod,
        notes: '',
        shipping_cost: shippingCost,
        subtotal: subtotal
      };

      const orderResponse = await ordersService.createOrder(orderData);
      if (!orderResponse.success) throw new Error(orderResponse.message || 'Failed to create order');
      const order = orderResponse.data?.order || orderResponse.data;
      const orderId = order?.id;
      if (!orderId) throw new Error('Order ID not received');

      if (paymentMethod === 'cash_on_delivery') {
        openSnackbar({
          open: true,
          message: intl.formatMessage({ id: 'order-placed-cod' }),
          variant: 'alert',
          alert: { color: 'success' }
        });
        // Clear saved checkout data after successful order
        clearCheckoutData();
        setTimeout(() => navigate('/profile'), 2000);
      } else {
        setOrderCreated(true);
        setCreatedOrderId(orderId);
        openSnackbar({ open: true, message: 'Order created. Please complete payment below.', variant: 'alert', alert: { color: 'info' } });
      }
    } catch (err) {
      console.error('Error placing order:', err);
      openSnackbar({ open: true, message: err.message || 'Failed to place order', variant: 'alert', alert: { color: 'error' } });
      setProcessing(false);
    }
  };

  /* ─── Shared input styles ─── */
  const inputSx = {
    '& .MuiOutlinedInput-root': {
      borderRadius: 0,
      bgcolor: '#fff',
      '&:hover fieldset': { borderColor: '#0a4834' },
      '&.Mui-focused fieldset': { borderColor: '#0a4834', borderWidth: 2 }
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: '#ffff', minHeight: '100vh', py: 4, mt: 10 }}>
      <div className="container">
        {/* ── Header ── */}
        <Box sx={{ mb: 2, pb: 1.5, borderBottom: '1px solid #ddd' }}>
          <Typography variant="h5" fontWeight={400} color="#0f1111">
            <FormattedMessage id="checkout" />
          </Typography>
        </Box>

        <Grid container spacing={2} alignItems="flex-start">
          {/* ══════════════════════════════════
                LEFT — Shipping + Payment Method
            ══════════════════════════════════ */}
          <Grid item xs={12} md={8}>
            {/* ── Step 1: Shipping ── */}
            <Paper elevation={0} sx={{ border: '1px solid #ddd', borderRadius: 0, p: 3, mb: 2 }}>
              <Stack direction="row" alignItems="center" spacing={1} mb={2}>
                <LocalShippingOutlinedIcon sx={{ color: '#0a4834' }} />
                <Typography variant="h6" fontWeight={700} color="#0f1111">
                  <FormattedMessage id="shipping-information" />
                </Typography>
              </Stack>
              <Divider sx={{ mb: 2.5 }} />

              {/* Name row */}
              <Grid container spacing={2} mb={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label={
                      <>
                        <FormattedMessage id="first-name" /> *
                      </>
                    }
                    name="first_name"
                    value={shippingAddress.first_name}
                    onChange={handleInputChange}
                    size="small"
                    error={!!validationErrors.first_name}
                    helperText={validationErrors.first_name}
                    sx={inputSx}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label={
                      <>
                        <FormattedMessage id="last-name" /> *
                      </>
                    }
                    name="last_name"
                    value={shippingAddress.last_name}
                    onChange={handleInputChange}
                    size="small"
                    error={!!validationErrors.last_name}
                    helperText={validationErrors.last_name}
                    sx={inputSx}
                  />
                </Grid>
              </Grid>

              {/* Phone */}
              <TextField
                fullWidth
                label={
                  <>
                    <FormattedMessage id="phone-number" /> *
                  </>
                }
                name="phone"
                type="tel"
                value={shippingAddress.phone}
                onChange={handleInputChange}
                size="small"
                error={!!validationErrors.phone}
                helperText={validationErrors.phone}
                sx={{ ...inputSx, mb: 2 }}
              />

              {/* Email (for guests) */}
              {!user && (
                <TextField
                  fullWidth
                  label={
                    <>
                      <FormattedMessage id="email" /> *
                    </>
                  }
                  name="email"
                  type="email"
                  value={shippingAddress.email}
                  onChange={handleInputChange}
                  size="small"
                  error={!!validationErrors.email}
                  helperText={validationErrors.email}
                  sx={{ ...inputSx, mb: 2 }}
                />
              )}

              {/* Address 1 */}
              <TextField
                fullWidth
                label={
                  <>
                    <FormattedMessage id="address-line-1" /> *
                  </>
                }
                name="address_line1"
                value={shippingAddress.address_line1}
                onChange={handleInputChange}
                size="small"
                error={!!validationErrors.address_line1}
                helperText={validationErrors.address_line1}
                sx={{ ...inputSx, mb: 2 }}
              />

              {/* Address 2 */}
              <TextField
                fullWidth
                label={<FormattedMessage id="address-line-2" />}
                name="address_line2"
                value={shippingAddress.address_line2}
                onChange={handleInputChange}
                size="small"
                sx={{ ...inputSx, mb: 2 }}
              />

              {/* Governorate (Select) - REQUIRED */}
              <Box sx={{ mb: 2 }}>
                <TextField
                  select
                  fullWidth
                  label={
                    <>
                      <FormattedMessage id="governorate" /> *
                    </>
                  }
                  name="governorate"
                  value={shippingAddress.governorate}
                  onChange={handleInputChange}
                  size="small"
                  disabled={loadingGovernorates}
                  error={!!validationErrors.governorate}
                  helperText={validationErrors.governorate || (loadingGovernorates ? 'Loading governorates...' : 'This field is required')}
                  sx={inputSx}
                >
                  <MenuItem value="">
                    <em>
                      <FormattedMessage id="select-governorate" />
                    </em>
                  </MenuItem>
                  {governorates.map((gov) => (
                    <MenuItem key={gov.id} value={gov.name}>
                      {gov.name_ar} ({gov.name})
                    </MenuItem>
                  ))}
                </TextField>
              </Box>

              {/* City / Postal */}
              <Grid container spacing={2} mb={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label={
                      <>
                        <FormattedMessage id="city" /> *
                      </>
                    }
                    name="city"
                    value={shippingAddress.city}
                    onChange={handleInputChange}
                    size="small"
                    error={!!validationErrors.city}
                    helperText={validationErrors.city}
                    sx={inputSx}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label={<FormattedMessage id="postal-code" />}
                    name="postal_code"
                    value={shippingAddress.postal_code}
                    onChange={handleInputChange}
                    size="small"
                    sx={inputSx}
                  />
                </Grid>
              </Grid>

              {/* Country (Select) */}
              <TextField
                select
                fullWidth
                label={<FormattedMessage id="country" />}
                name="country"
                value={shippingAddress.country}
                onChange={handleInputChange}
                size="small"
                sx={inputSx}
              >
                <MenuItem value="Egypt">
                  <FormattedMessage id="egypt" />
                </MenuItem>
                <MenuItem value="Saudi Arabia">
                  <FormattedMessage id="saudi-arabia" />
                </MenuItem>
                <MenuItem value="UAE">
                  <FormattedMessage id="uae" />
                </MenuItem>
                <MenuItem value="Kuwait">
                  <FormattedMessage id="kuwait" />
                </MenuItem>
                <MenuItem value="Qatar">
                  <FormattedMessage id="qatar" />
                </MenuItem>
                <MenuItem value="Other">
                  <FormattedMessage id="other" />
                </MenuItem>
              </TextField>
            </Paper>

            {/* ── Step 2: Payment Method ── */}
            <Paper elevation={0} sx={{ border: '1px solid #ddd', borderRadius: 0, p: 3, mb: 2 }}>
              <Stack direction="row" alignItems="center" spacing={1} mb={2}>
                <CreditCardIcon sx={{ color: '#0a4834' }} />
                <Typography variant="h6" fontWeight={700} color="#0f1111">
                  <FormattedMessage id="payment-method" />
                </Typography>
              </Stack>
              <Divider sx={{ mb: 2.5 }} />

              <FormControl component="fieldset" fullWidth>
                <RadioGroup value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
                  {/* CIB Bank - CURRENTLY DISABLED/COMMENTED OUT */}
                  {/* <Box
                      onClick={() => setPaymentMethod('cib_bank')}
                      sx={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: 1.5,
                        p: 2,
                        mb: 1.5,
                        borderRadius: 1,
                        border: paymentMethod === 'cib_bank' ? '2px solid #0a4834' : '1px solid #ddd',
                        bgcolor: paymentMethod === 'cib_bank' ? '#fffbf0' : '#fff',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <Radio
                        value="cib_bank"
                        size="small"
                        sx={{ p: 0, mt: '2px', color: '#0a4834', '&.Mui-checked': { color: '#0a4834' } }}
                      />
                      <Box>
                        <Typography fontWeight={600} color="#0f1111" fontSize="0.95rem">
                          <FormattedMessage id="cib-bank" />
                        </Typography>
                        <Typography variant="body2" color="text.secondary" mt={0.25}>
                          <FormattedMessage id="payment-method-description-cib" />
                        </Typography>
                      </Box>
                    </Box> */}

                  {/* Cash on Delivery */}
                  <Box
                    onClick={() => setPaymentMethod('cash_on_delivery')}
                    sx={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 1.5,
                      p: 2,
                      borderRadius: 0,
                      border: paymentMethod === 'cash_on_delivery' ? '2px solid #4caf50' : '1px solid #ddd',
                      bgcolor: paymentMethod === 'cash_on_delivery' ? '#f1f8f1' : '#fff',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <Radio
                      value="cash_on_delivery"
                      size="small"
                      sx={{ p: 0, mt: '2px', color: '#4caf50', '&.Mui-checked': { color: '#4caf50' } }}
                    />
                    <Box>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Typography fontWeight={600} color="#0f1111" fontSize="0.95rem">
                          <FormattedMessage id="cash-on-delivery" />
                        </Typography>
                        <PaymentsOutlinedIcon sx={{ fontSize: 18, color: '#4caf50' }} />
                      </Stack>
                      <Typography variant="body2" color="text.secondary" mt={0.25}>
                        <FormattedMessage id="payment-method-description-cod" />
                      </Typography>
                    </Box>
                  </Box>
                </RadioGroup>
              </FormControl>
            </Paper>

            {/* ── Step 3: CIB Payment Form (shown after order creation) ── */}
            {/* CIB BANK PAYMENT FORM - CURRENTLY DISABLED */}
            {false && orderCreated && paymentMethod === 'cib_bank' && createdOrderId && (
              <Paper elevation={0} sx={{ border: '2px solid #1976d2', borderRadius: 1, p: 3 }}>
                <Stack direction="row" alignItems="center" spacing={1} mb={2}>
                  <LockIcon sx={{ color: '#1976d2' }} />
                  <Typography variant="h6" fontWeight={700} color="#0f1111">
                    Payment Details
                  </Typography>
                </Stack>
                <Divider sx={{ mb: 2.5 }} />

                <Box component="form" onSubmit={handlePaymentSubmit}>
                  <TextField
                    fullWidth
                    label="Card Number *"
                    name="card_number"
                    value={paymentFormData.card_number}
                    onChange={handlePaymentInputChange}
                    placeholder="1234 5678 9012 3456"
                    inputProps={{ maxLength: 19 }}
                    error={!!paymentErrors.card_number}
                    helperText={paymentErrors.card_number}
                    disabled={processingPayment}
                    size="small"
                    sx={{ ...inputSx, mb: 2 }}
                  />

                  <TextField
                    fullWidth
                    label="Cardholder Name *"
                    name="cardholder_name"
                    value={paymentFormData.cardholder_name}
                    onChange={handlePaymentInputChange}
                    placeholder="JOHN DOE"
                    error={!!paymentErrors.cardholder_name}
                    helperText={paymentErrors.cardholder_name}
                    disabled={processingPayment}
                    size="small"
                    sx={{ ...inputSx, mb: 2 }}
                  />

                  <Grid container spacing={2} mb={2}>
                    <Grid item xs={4}>
                      <TextField
                        fullWidth
                        label="Expiry Month *"
                        name="expiry_month"
                        value={paymentFormData.expiry_month}
                        onChange={handlePaymentInputChange}
                        placeholder="MM"
                        inputProps={{ maxLength: 2 }}
                        error={!!paymentErrors.expiry_month}
                        helperText={paymentErrors.expiry_month}
                        disabled={processingPayment}
                        size="small"
                        sx={inputSx}
                      />
                    </Grid>
                    <Grid item xs={4}>
                      <TextField
                        fullWidth
                        label="Expiry Year *"
                        name="expiry_year"
                        value={paymentFormData.expiry_year}
                        onChange={handlePaymentInputChange}
                        placeholder="YY"
                        inputProps={{ maxLength: 2 }}
                        error={!!paymentErrors.expiry_year}
                        helperText={paymentErrors.expiry_year}
                        disabled={processingPayment}
                        size="small"
                        sx={inputSx}
                      />
                    </Grid>
                    <Grid item xs={4}>
                      <TextField
                        fullWidth
                        label="CVV *"
                        name="cvv"
                        value={paymentFormData.cvv}
                        onChange={handlePaymentInputChange}
                        placeholder="123"
                        inputProps={{ maxLength: 4 }}
                        error={!!paymentErrors.cvv}
                        helperText={paymentErrors.cvv}
                        disabled={processingPayment}
                        size="small"
                        sx={inputSx}
                      />
                    </Grid>
                  </Grid>

                  <Alert severity="success" icon={<LockIcon fontSize="small" />} sx={{ mb: 2, fontSize: '0.8rem' }}>
                    Your payment information is encrypted and securely processed by CIB Bank. We do not store your card details.
                  </Alert>

                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    disabled={processingPayment}
                    startIcon={processingPayment ? <CircularProgress size={16} color="inherit" /> : <LockIcon />}
                    sx={{
                      bgcolor: '#ffd814',
                      color: '#0f1111',
                      fontWeight: 700,
                      py: 1.25,
                      borderRadius: 0,
                      boxShadow: 'none',
                      '&:hover': { bgcolor: '#f7ca00', boxShadow: 'none' },
                      '&:disabled': { bgcolor: '#e0e0e0', color: '#aaa' }
                    }}
                  >
                    {processingPayment ? 'Processing Payment...' : `Pay EGP ${parseFloat(total).toFixed(2)}`}
                  </Button>
                </Box>
              </Paper>
            )}
          </Grid>

          {/* ══════════════════════════════════
                RIGHT — Order Summary
            ══════════════════════════════════ */}
          <Grid item xs={12} md={4}>
            <Paper elevation={0} sx={{ border: '1px solid #ddd', borderRadius: 0, p: 2.5, position: 'sticky', top: 16 }}>
              {/* Title */}
              <Typography variant="h6" fontWeight={700} color="#0f1111" mb={1.5}>
                <FormattedMessage id="order-summary" />
              </Typography>

              {/* Cart Items */}
              <Box sx={{ maxHeight: 280, overflowY: 'auto', pr: 0.5, mb: 2 }}>
                {cartItems.map((item) => (
                  <Stack key={item.id} direction="row" spacing={1.5} mb={2}>
                    <Box
                      component="img"
                      src={item.main_image ? getImageUrl(item.main_image) : 'https://via.placeholder.com/80'}
                      alt={item.product_name}
                      onError={(e) => {
                        e.currentTarget.src = 'https://via.placeholder.com/80';
                      }}
                      sx={{ width: 72, height: 72, objectFit: 'cover', borderRadius: 1, border: '1px solid #eee', flexShrink: 0 }}
                    />
                    <Box flex={1}>
                      <Typography variant="body2" fontWeight={600} color="#0f1111" lineHeight={1.3} mb={0.5}>
                        {item.product_name}
                      </Typography>
                      {item.variant_name && (
                        <Typography variant="caption" color="text.secondary" display="block">
                          {item.variant_name}
                        </Typography>
                      )}
                      <Typography variant="body2" color="text.secondary">
                        Qty: {item.quantity} × EGP {parseFloat(item.product_price || item.sale_price || 0).toFixed(2)}
                      </Typography>
                    </Box>
                  </Stack>
                ))}
              </Box>

              <Divider sx={{ mb: 1.5 }} />

              {/* Subtotal */}
              <Stack direction="row" justifyContent="space-between" mb={0.75}>
                <Typography variant="body2" color="text.secondary">
                  <FormattedMessage id="subtotal" /> ({summary.total_items || cartItems.length} items)
                </Typography>
                <Typography variant="body2">EGP {parseFloat(subtotal).toFixed(2)}</Typography>
              </Stack>

              <Stack direction="row" justifyContent="space-between" mb={1.5}>
                <Typography variant="body2" color="text.secondary">
                  Shipping
                </Typography>
                <Typography variant="body2" fontWeight={600} color="#0f1111">
                  EGP {parseFloat(shippingCost).toFixed(2)}
                </Typography>
              </Stack>

              <Divider sx={{ mb: 1.5 }} />

              {/* Total */}
              <Stack direction="row" justifyContent="space-between" mb={2}>
                <Typography fontWeight={700} fontSize="1rem" color="#0f1111">
                  <FormattedMessage id="total" />
                </Typography>
                <Typography fontWeight={700} fontSize="1rem" color="#B12704">
                  EGP {parseFloat(total).toFixed(2)}
                </Typography>
              </Stack>
              <Divider sx={{ mb: 2 }} />

              {/* Place Order button (Amazon style — top of summary) */}
              <Button
                fullWidth
                variant="contained"
                onClick={handlePlaceOrder}
                disabled={processing || cartItems.length === 0}
                startIcon={processing ? <CircularProgress size={16} color="inherit" /> : null}
                sx={{
                  bgcolor: '#0a4834',
                  color: '#ffff',
                  fontWeight: 700,
                  py: 1.1,
                  mb: 2,
                  borderRadius: 0,
                  boxShadow: 'none',
                  borderRadius: '1px',
                  fontSize: '0.95rem',
                  '&:hover': { bgcolor: '#0b5751', boxShadow: 'none' },
                  '&:disabled': { bgcolor: '#e0e0e0', color: '#aaa' }
                }}
              >
                {processing ? (
                  <FormattedMessage id="processing" />
                ) : paymentMethod === 'cash_on_delivery' ? (
                  <FormattedMessage id="place-order-cod" />
                ) : (
                  <FormattedMessage id="place-order-pay" />
                )}
              </Button>

              {/* Security note */}
              <Stack direction="row" alignItems="center" justifyContent="center" spacing={0.5} mb={2}>
                <LockIcon sx={{ fontSize: 14, color: '#555' }} />
                <Typography variant="caption" color="text.secondary">
                  Secure checkout
                </Typography>
              </Stack>
            </Paper>
          </Grid>
        </Grid>
      </div>
    </Box>
  );
}

export default Checkout;
