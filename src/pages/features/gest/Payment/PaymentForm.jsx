import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { FormattedMessage, useIntl } from 'react-intl';
import { paymentService } from 'api/payment';
import { ordersService } from 'api/orders';
import { guestCheckoutService } from 'api/guestCheckout';
import { openSnackbar } from 'api/snackbar';
import { getImageUrl } from 'utils/imageHelper';

// MUI Imports for a beautiful, premium design
import {
  Box,
  Container,
  Paper,
  Typography,
  Stack,
  Divider,
  Button,
  CircularProgress,
  Grid,
  Alert
} from '@mui/material';

import LockIcon from '@mui/icons-material/Lock';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined';

export default function PaymentForm() {
  const { orderId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const intl = useIntl();

  const viewToken = searchParams.get('view_token') || searchParams.get('viewToken') || '';

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (orderId) {
      fetchOrderDetails();
    } else {
      setLoading(false);
    }
  }, [orderId]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      // Retrieve order using viewToken for guest checkouts, or standard method
      const response = await ordersService.getOrderDetails(orderId, viewToken || null);
      if (response.success) {
        setOrder(response.data);
      } else {
        throw new Error(response.message || 'Failed to load order');
      }
    } catch (err) {
      console.error('Error fetching order:', err);
      // Fallback try loading with guest Checkout service
      try {
        if (viewToken) {
          // In some contexts, orderId could be the order number in the URL
          const fallbackResponse = await guestCheckoutService.getGuestOrder(orderId, viewToken);
          if (fallbackResponse.success) {
            setOrder(fallbackResponse.data);
            setLoading(false);
            return;
          }
        }
      } catch (e) {
        console.error('Fallback guest fetch failed:', e);
      }

      openSnackbar({
        open: true,
        message: 'Failed to load order details. Please check the link or try again.',
        variant: 'alert',
        alert: { color: 'error' }
      });
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const handlePayNow = async () => {
    try {
      setProcessing(true);
      openSnackbar({
        open: true,
        message: 'Initializing secure transaction and redirecting...',
        variant: 'alert',
        alert: { color: 'info' }
      });

      const response = await paymentService.initializePayment(orderId, viewToken || null);

      if (response.success && response.data?.payment_url) {
        // Redirect to Paymob's hosted checkout page
        window.location.href = response.data.payment_url;
      } else {
        throw new Error(response.message || 'Failed to generate checkout URL');
      }
    } catch (err) {
      console.error('Payment initialization error:', err);
      openSnackbar({
        open: true,
        message: err.message || 'Failed to process payment. Please try again or pay from tracking page.',
        variant: 'alert',
        alert: { color: 'error' }
      });
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" minHeight="70vh" gap={2}>
        <CircularProgress size={45} sx={{ color: '#0a4834' }} />
        <Typography variant="body2" color="text.secondary">
          Loading order details...
        </Typography>
      </Box>
    );
  }

  if (!order) {
    return (
      <Container maxWidth="sm" sx={{ py: 8 }}>
        <Paper elevation={0} sx={{ p: 4, textAlign: 'center', border: '1px solid #eee', borderRadius: 2 }}>
          <Typography variant="h5" color="error" gutterBottom>
            Order Not Found
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={3}>
            We could not find details for the requested order. It may have expired or been deleted.
          </Typography>
          <Button variant="contained" onClick={() => navigate('/')} sx={{ bgcolor: '#0a4834', '&:hover': { bgcolor: '#0b5751' } }}>
            Go Home
          </Button>
        </Paper>
      </Container>
    );
  }

  const subtotal = parseFloat(order.subtotal || 0);
  const shippingCost = parseFloat(order.shipping_cost || 0);
  const discount = parseFloat(order.discount || 0);
  const total = parseFloat(order.total || 0);

  return (
    <Box sx={{ minHeight: '85vh', py: 6, bgcolor: '#fdfdfd' }}>
      <Container maxWidth="md">
        {/* Header */}
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={4}>
          <Box>
            <Typography variant="h4" fontWeight={800} color="#0a4834" sx={{ letterSpacing: '-0.5px' }}>
              ESC Wear
            </Typography>
            <Typography variant="caption" color="text.secondary">
              SECURE HOSTED CHECKOUT
            </Typography>
          </Box>
          <Stack direction="row" spacing={0.5} alignItems="center" sx={{ color: '#2e7d32', bgcolor: '#e8f5e9', py: 0.75, px: 1.5, borderRadius: '50px' }}>
            <ShieldOutlinedIcon sx={{ fontSize: 16 }} />
            <Typography variant="caption" fontWeight={600}>
              PCI-DSS Compliant
            </Typography>
          </Stack>
        </Stack>

        <Grid container spacing={4}>
          {/* LEFT - Order Details */}
          <Grid item xs={12} md={7}>
            <Paper elevation={0} sx={{ p: 3, border: '1px solid #eaeaea', borderRadius: '4px', mb: 3 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6" fontWeight={700} color="#0f1111">
                  Order Summary
                </Typography>
                <Typography variant="body2" color="text.secondary" fontWeight={600}>
                  #{order.order_number}
                </Typography>
              </Stack>
              
              <Divider sx={{ mb: 2 }} />

              {/* Items List */}
              <Stack spacing={2} sx={{ maxHeight: 320, overflowY: 'auto', pr: 1 }}>
                {order.items && order.items.map((item) => (
                  <Stack key={item.id} direction="row" spacing={2} alignItems="center">
                    <Box
                      component="img"
                      src={item.main_image ? getImageUrl(item.main_image) : 'https://via.placeholder.com/80'}
                      alt={item.product_name}
                      onError={(e) => {
                        e.currentTarget.src = 'https://via.placeholder.com/80';
                      }}
                      sx={{
                        width: 60,
                        height: 60,
                        objectFit: 'cover',
                        borderRadius: '4px',
                        border: '1px solid #f0f0f0',
                        flexShrink: 0
                      }}
                    />
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="body2" fontWeight={700} color="#333" lineHeight={1.2}>
                        {item.product_name}
                      </Typography>
                      {item.variant_name && (
                        <Typography variant="caption" color="text.secondary" display="block">
                          {item.variant_name}
                        </Typography>
                      )}
                      <Typography variant="caption" color="text.secondary">
                        Qty: {item.quantity} × EGP {parseFloat(item.price || 0).toFixed(2)}
                      </Typography>
                    </Box>
                    <Typography variant="body2" fontWeight={600} color="#0f1111" sx={{ ml: 'auto' }}>
                      EGP {parseFloat(item.subtotal || 0).toFixed(2)}
                    </Typography>
                  </Stack>
                ))}
              </Stack>
            </Paper>

            <Button
              startIcon={<ArrowBackIcon />}
              onClick={() => {
                if (viewToken) {
                  navigate(`/guest-checkout/orders/${order.order_number}`, { state: { viewToken } });
                } else {
                  navigate('/profile');
                }
              }}
              sx={{ color: '#0a4834', fontWeight: 600, '&:hover': { bgcolor: 'transparent', textDecoration: 'underline' } }}
            >
              Back to Order Tracking
            </Button>
          </Grid>

          {/* RIGHT - Payment Card */}
          <Grid item xs={12} md={5}>
            <Paper elevation={0} sx={{ p: 3, border: '1px solid #eaeaea', borderRadius: '4px', position: 'sticky', top: 20 }}>
              <Typography variant="h6" fontWeight={700} mb={2}>
                Payment Details
              </Typography>

              <Stack spacing={1.5} mb={3}>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">
                    Subtotal
                  </Typography>
                  <Typography variant="body2">EGP {subtotal.toFixed(2)}</Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">
                    Shipping
                  </Typography>
                  <Typography variant="body2">EGP {shippingCost.toFixed(2)}</Typography>
                </Stack>
                {discount > 0 && (
                  <Stack direction="row" justifyContent="space-between" sx={{ color: '#2e7d32' }}>
                    <Typography variant="body2">Discount</Typography>
                    <Typography variant="body2">- EGP {discount.toFixed(2)}</Typography>
                  </Stack>
                )}
                <Divider />
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography fontWeight={700} color="#0f1111">
                    Total Amount
                  </Typography>
                  <Typography fontWeight={800} color="#B12704" fontSize="1.15rem">
                    EGP {total.toFixed(2)}
                  </Typography>
                </Stack>
              </Stack>

              {/* Paymob Info */}
              <Alert 
                severity="info" 
                icon={<LockIcon sx={{ color: '#1976d2' }} />} 
                sx={{ 
                  borderRadius: '2px', 
                  mb: 3, 
                  bgcolor: '#f4f9fd', 
                  border: '1px solid #e1f0fa',
                  '& .MuiAlert-message': { fontSize: '0.825rem', color: '#1976d2', lineHeight: 1.4 }
                }}
              >
                You will be securely redirected to Paymob Payment Gateway to complete your payment with Credit Card, Mobile Wallets, or Installments.
              </Alert>

              <Button
                fullWidth
                variant="contained"
                onClick={handlePayNow}
                disabled={processing || order.payment_status === 'paid'}
                startIcon={processing ? <CircularProgress size={16} color="inherit" /> : <CreditCardIcon />}
                sx={{
                  bgcolor: '#0a4834',
                  color: '#fff',
                  fontWeight: 700,
                  py: 1.3,
                  boxShadow: 'none',
                  borderRadius: '2px',
                  fontSize: '0.95rem',
                  letterSpacing: '0.5px',
                  '&:hover': { bgcolor: '#0b5751', boxShadow: 'none' },
                  '&:disabled': { bgcolor: '#e0e0e0', color: '#aaa' }
                }}
              >
                {processing ? 'Processing...' : 'Pay Now via Paymob'}
              </Button>

              <Stack direction="row" justifyContent="center" alignItems="center" spacing={1} mt={3}>
                <LockIcon sx={{ fontSize: 14, color: '#666' }} />
                <Typography variant="caption" color="text.secondary" fontWeight={500}>
                  Secured & encrypted transactions
                </Typography>
              </Stack>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
