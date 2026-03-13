import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
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
  CircularProgress
} from '@mui/material';
import { ordersService } from 'api/orders';
import { DocumentDownload } from 'iconsax-react';

export default function OrderDetails() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const viewToken = query.get('view_token');
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchOrder();
  }, [orderId]);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const response = await ordersService.getOrderDetails(orderId, viewToken);
      if (response.success) {
        setOrder(response.data);
      } else {
        setError(response.message || 'Order not found');
      }
    } catch (err) {
      console.error('Failed to load order:', err);
      setError(err.message || 'Failed to load order');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Container sx={{ py: 6 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error || !order) {
    return (
      <Container sx={{ py: 6 }}>
        <Typography variant="h6" color="error">
          {error || 'Order not found'}
        </Typography>
        <Button sx={{ mt: 2 }} variant="outlined" onClick={() => navigate(-1)}>
          Go Back
        </Button>
      </Container>
    );
  }

  const invoiceUrl = ordersService.getInvoicePdfUrl(order.id, viewToken);

  return (
    <Container sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <div>
          <Typography variant="h4">Order #{order.order_number}</Typography>
          <Typography color="text.secondary">Placed on: {new Date(order.created_at).toLocaleString()}</Typography>
        </div>
        <div>
          <Typography variant="subtitle1">Status: {order.status}</Typography>
          <Typography variant="subtitle2">Payment: {order.payment_status}</Typography>
        </div>
      </Box>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 1 }}>
          Shipping Address
        </Typography>
        {order.shipping_address ? (
          <Box>
            <Typography>
              {order.shipping_address.first_name} {order.shipping_address.last_name}
            </Typography>
            <Typography>{order.shipping_address.address_line1}</Typography>
            {order.shipping_address.address_line2 && <Typography>{order.shipping_address.address_line2}</Typography>}
            <Typography>
              {order.shipping_address.city}, {order.shipping_address.governorate} {order.shipping_address.postal_code}
            </Typography>
            <Typography>{order.shipping_address.country}</Typography>
            <Typography>Phone: {order.shipping_address.phone || order.user?.phone}</Typography>
          </Box>
        ) : (
          <Typography>No shipping address</Typography>
        )}
      </Paper>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 1 }}>
          Items
        </Typography>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Product</TableCell>
              <TableCell>Variant</TableCell>
              <TableCell align="center">Qty</TableCell>
              <TableCell align="right">Price</TableCell>
              <TableCell align="right">Subtotal</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {Array.isArray(order.items) &&
              order.items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.product_name}</TableCell>
                  <TableCell>{item.variant_name || '-'}</TableCell>
                  <TableCell align="center">{item.quantity}</TableCell>
                  <TableCell align="right">
                    {Number(item.price || 0).toFixed(2)} {order.currency || 'EGP'}
                  </TableCell>
                  <TableCell align="right">
                    {Number(item.subtotal || 0).toFixed(2)} {order.currency || 'EGP'}
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2, gap: 2 }}>
          <Box sx={{ textAlign: 'right' }}>
            <Typography>
              Subtotal: {Number(order.subtotal || 0).toFixed(2)} {order.currency || 'EGP'}
            </Typography>
            <Typography>
              Shipping: {Number(order.shipping_cost || 0).toFixed(2)} {order.currency || 'EGP'}
            </Typography>
            <Typography variant="h6">
              Total: {Number(order.total || 0).toFixed(2)} {order.currency || 'EGP'}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3, gap: 2 }}>
          <Button variant="contained" color="primary" onClick={() => window.open(invoiceUrl, '_blank')} startIcon={<DocumentDownload />}>
            Download Invoice
          </Button>
          {/* Print disabled in UI per request */}
        </Box>
      </Paper>

      <Button variant="outlined" onClick={() => navigate(-1)}>
        Back
      </Button>
    </Container>
  );
}
