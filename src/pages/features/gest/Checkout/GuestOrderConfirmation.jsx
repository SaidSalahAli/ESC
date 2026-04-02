import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { FormattedMessage, useIntl } from 'react-intl';
import { guestCheckoutService } from 'api/guestCheckout';
import { getImageUrl } from 'utils/imageHelper';
import {
  Container,
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Button,
  CircularProgress,
  Alert,
  Stack,
  Divider,
  Card,
  CardContent,
  Grid,
  Chip
} from '@mui/material';
import { CheckCircle, LocalShipping, Email, Phone, LocationOn, FileDownload } from '@mui/icons-material';

export default function GuestOrderConfirmation() {
  const { orderNumber } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const intl = useIntl();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Get view token from navigation state or URL params
  const viewToken = location.state?.viewToken || new URLSearchParams(location.search).get('view_token');

  useEffect(() => {
    fetchGuestOrder();
  }, [orderNumber, viewToken]);

  const fetchGuestOrder = async () => {
    try {
      setLoading(true);
      if (!viewToken) {
        setError('Invalid order access - missing view token');
        return;
      }

      const response = await guestCheckoutService.getGuestOrder(orderNumber, viewToken);
      if (response.success && response.data) {
        setOrder(response.data.order || response.data);
      } else {
        setError(response.message || 'Order not found');
      }
    } catch (err) {
      console.error('Failed to load guest order:', err);
      setError(err.message || 'Failed to load order');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error || !order) {
    return (
      <Container maxWidth="md" sx={{ py: 6 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error || 'Order not found'}
        </Alert>
        <Button variant="outlined" onClick={() => navigate('/')}>
          <FormattedMessage id="back-to-home" defaultMessage="Back to Home" />
        </Button>
      </Container>
    );
  }

  const subtotal = parseFloat(order.subtotal || 0);
  const shipping = parseFloat(order.shipping_cost || 0);
  const total = parseFloat(order.total || subtotal + shipping);

  return (
    <Box sx={{ bgcolor: '#f3f3f3', minHeight: '100vh', py: 4, mt: 10 }}>
      <Container maxWidth="md">
        {/* ════ Success Header ════ */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <CheckCircle sx={{ fontSize: 80, color: '#4caf50', mb: 2 }} />
          <Typography variant="h4" fontWeight={700} color="#0f1111" mb={1}>
            <FormattedMessage id="order-confirmed" defaultMessage="Order Confirmed!" />
          </Typography>
          <Typography variant="body1" color="text.secondary">
            <FormattedMessage
              id="order-confirmation-message"
              defaultMessage="Thank you for your order. We've sent a confirmation email with your order details."
            />
          </Typography>
        </Box>

        {/* ════ Order Number & Status ════ */}
        <Paper elevation={0} sx={{ border: '1px solid #ddd', borderRadius: 2, p: 3, mb: 3 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <Box>
                <Typography variant="caption" color="text.secondary" fontWeight={600}>
                  <FormattedMessage id="order-number" defaultMessage="Order Number" />
                </Typography>
                <Typography variant="h6" fontWeight={700} color="#0f1111">
                  {order.order_number}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Box>
                <Typography variant="caption" color="text.secondary" fontWeight={600}>
                  <FormattedMessage id="order-date" defaultMessage="Order Date" />
                </Typography>
                <Typography variant="h6" fontWeight={700} color="#0f1111">
                  {new Date(order.created_at).toLocaleDateString()}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Box>
                <Typography variant="caption" color="text.secondary" fontWeight={600}>
                  <FormattedMessage id="status" defaultMessage="Status" />
                </Typography>
                <Chip label={order.status || 'Pending'} color={order.status === 'confirmed' ? 'success' : 'default'} sx={{ mt: 0.5 }} />
              </Box>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Box>
                <Typography variant="caption" color="text.secondary" fontWeight={600}>
                  <FormattedMessage id="payment-method" defaultMessage="Payment Method" />
                </Typography>
                <Typography variant="body2" color="#0f1111" sx={{ mt: 0.5 }}>
                  {order.payment_method === 'cash_on_delivery' ? 'Cash on Delivery' : 'Card Payment'}
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Paper>

        {/* ════ What's Next ════ */}
        <Alert icon={<LocalShipping />} severity="info" sx={{ mb: 3, bgcolor: '#e3f2fd' }}>
          <Typography variant="body2">
            <FormattedMessage
              id="order-next-step"
              defaultMessage="We'll send you shipping updates via email. Your order will be processed and shipped soon."
            />
          </Typography>
        </Alert>

        {/* ════ Contact Information ════ */}
        <Paper elevation={0} sx={{ border: '1px solid #ddd', borderRadius: 2, p: 3, mb: 3 }}>
          <Typography variant="h6" fontWeight={700} color="#0f1111" mb={2}>
            <FormattedMessage id="contact-information" defaultMessage="Contact Information" />
          </Typography>
          <Divider sx={{ mb: 2 }} />

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Stack direction="row" spacing={1.5} alignItems="flex-start">
                <Email sx={{ color: '#0a4834', mt: 0.5 }} />
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    <FormattedMessage id="email" defaultMessage="Email" />
                  </Typography>
                  <Typography variant="body2" color="#0f1111">
                    {order.guest_email || 'N/A'}
                  </Typography>
                </Box>
              </Stack>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Stack direction="row" spacing={1.5} alignItems="flex-start">
                <Phone sx={{ color: '#0a4834', mt: 0.5 }} />
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    <FormattedMessage id="phone-number" defaultMessage="Phone" />
                  </Typography>
                  <Typography variant="body2" color="#0f1111">
                    {order.shipping_address?.phone || 'N/A'}
                  </Typography>
                </Box>
              </Stack>
            </Grid>
          </Grid>
        </Paper>

        {/* ════ Shipping Address ════ */}
        <Paper elevation={0} sx={{ border: '1px solid #ddd', borderRadius: 2, p: 3, mb: 3 }}>
          <Stack direction="row" alignItems="center" spacing={1} mb={2}>
            <LocationOn sx={{ color: '#0a4834' }} />
            <Typography variant="h6" fontWeight={700} color="#0f1111">
              <FormattedMessage id="shipping-address" defaultMessage="Shipping Address" />
            </Typography>
          </Stack>
          <Divider sx={{ mb: 2 }} />

          {order.shipping_address ? (
            <Box sx={{ bgcolor: '#f9f9f9', p: 2, borderRadius: 1 }}>
              <Typography variant="body2" fontWeight={600} color="#0f1111">
                {order.shipping_address.first_name} {order.shipping_address.last_name}
              </Typography>
              <Typography variant="body2" color="#0f1111" sx={{ mt: 0.5 }}>
                {order.shipping_address.address_line1}
              </Typography>
              {order.shipping_address.address_line2 && (
                <Typography variant="body2" color="#0f1111">
                  {order.shipping_address.address_line2}
                </Typography>
              )}
              <Typography variant="body2" color="#0f1111" sx={{ mt: 0.5 }}>
                {order.shipping_address.city}, {order.shipping_address.governorate} {order.shipping_address.postal_code}
              </Typography>
              <Typography variant="body2" color="#0f1111">
                {order.shipping_address.country}
              </Typography>
            </Box>
          ) : (
            <Typography color="text.secondary">No shipping address available</Typography>
          )}
        </Paper>

        {/* ════ Order Items ════ */}
        <Paper elevation={0} sx={{ border: '1px solid #ddd', borderRadius: 2, p: 3, mb: 3 }}>
          <Typography variant="h6" fontWeight={700} color="#0f1111" mb={2}>
            <FormattedMessage id="order-items" defaultMessage="Order Items" />
          </Typography>
          <Divider sx={{ mb: 2 }} />

          <Box sx={{ overflowX: 'auto' }}>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                  <TableCell fontWeight={700}>
                    <FormattedMessage id="product" defaultMessage="Product" />
                  </TableCell>
                  <TableCell align="center">
                    <FormattedMessage id="quantity" defaultMessage="Quantity" />
                  </TableCell>
                  <TableCell align="right">
                    <FormattedMessage id="price" defaultMessage="Price" />
                  </TableCell>
                  <TableCell align="right">
                    <FormattedMessage id="total" defaultMessage="Total" />
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {order.items && order.items.length > 0 ? (
                  order.items.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <Stack direction="row" spacing={2} alignItems="center">
                          {item.main_image && (
                            <Box
                              component="img"
                              src={getImageUrl(item.main_image)}
                              alt={item.product_name}
                              onError={(e) => {
                                e.currentTarget.src = 'https://via.placeholder.com/50';
                              }}
                              sx={{
                                width: 50,
                                height: 50,
                                objectFit: 'cover',
                                borderRadius: 1,
                                border: '1px solid #eee'
                              }}
                            />
                          )}
                          <Box>
                            <Typography variant="body2" fontWeight={600}>
                              {item.product_name}
                            </Typography>
                            {item.variant_name && (
                              <Typography variant="caption" color="text.secondary">
                                {item.variant_name}
                              </Typography>
                            )}
                          </Box>
                        </Stack>
                      </TableCell>
                      <TableCell align="center">
                        <Typography variant="body2">{item.quantity}</Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2">EGP {parseFloat(item.price || 0).toFixed(2)}</Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" fontWeight={600}>
                          EGP {(parseFloat(item.price || 0) * item.quantity).toFixed(2)}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} align="center" sx={{ py: 3 }}>
                      <Typography color="text.secondary">
                        <FormattedMessage id="no-items" defaultMessage="No items in this order" />
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Box>
        </Paper>

        {/* ════ Order Summary ════ */}
        <Paper elevation={0} sx={{ border: '1px solid #ddd', borderRadius: 2, p: 3, mb: 3, maxWidth: 400, ml: 'auto' }}>
          <Typography variant="h6" fontWeight={700} color="#0f1111" mb={2}>
            <FormattedMessage id="order-summary" defaultMessage="Order Summary" />
          </Typography>
          <Divider sx={{ mb: 2 }} />

          <Stack spacing={1.5}>
            <Stack direction="row" justifyContent="space-between">
              <Typography variant="body2" color="text.secondary">
                <FormattedMessage id="subtotal" defaultMessage="Subtotal" />
              </Typography>
              <Typography variant="body2">EGP {subtotal.toFixed(2)}</Typography>
            </Stack>

            <Stack direction="row" justifyContent="space-between">
              <Typography variant="body2" color="text.secondary">
                <FormattedMessage id="shipping" defaultMessage="Shipping" />
              </Typography>
              <Typography variant="body2" fontWeight={600} color="#0f1111">
                EGP {shipping.toFixed(2)}
              </Typography>
            </Stack>

            <Divider />

            <Stack direction="row" justifyContent="space-between">
              <Typography fontWeight={700} color="#0f1111">
                <FormattedMessage id="total" defaultMessage="Total" />
              </Typography>
              <Typography fontWeight={700} fontSize="1.1rem" color="#B12704">
                EGP {total.toFixed(2)}
              </Typography>
            </Stack>
          </Stack>
        </Paper>

        {/* ════ Action Buttons ════ */}
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Button
            variant="contained"
            onClick={() => navigate('/')}
            sx={{
              bgcolor: '#ffd814',
              color: '#0f1111',
              fontWeight: 700,
              px: 4,
              py: 1.2,
              borderRadius: 1,
              '&:hover': { bgcolor: '#f7ca00' }
            }}
          >
            <FormattedMessage id="continue-shopping" defaultMessage="Continue Shopping" />
          </Button>
          
        </Box>

        {/* ════ Help Text ════ */}
        <Box sx={{ textAlign: 'center', mt: 4, p: 2, bgcolor: '#f9f9f9', borderRadius: 2 }}>
          <Typography variant="body2" color="text.secondary">
            <FormattedMessage
              id="order-help-text"
              defaultMessage="Questions about your order? Check your email for more details or contact our support team."
            />
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}
