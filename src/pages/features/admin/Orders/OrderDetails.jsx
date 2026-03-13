import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  CircularProgress,
  Container,
  Typography,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody
} from '@mui/material';
import { adminService } from 'api/admin';
import { DocumentDownload, Printer, ArrowLeft2 } from 'iconsax-react';

export default function OrderDetails() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchOrder();
  }, [orderId]);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const response = await adminService.getOrderDetails(orderId);
      if (response.success) {
        setOrder(response.data);
      } else {
        setError(response.message || 'Order not found');
      }
    } catch (err) {
      console.error('Failed to load admin order:', err);
      setError(err.message || 'Failed to load order');
    } finally {
      setLoading(false);
    }
  };

  if (loading)
    return (
      <Container sx={{ py: 6 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <CircularProgress />
        </Box>
      </Container>
    );

  if (error || !order)
    return (
      <Container sx={{ py: 6 }}>
        <Typography variant="h6" color="error">
          {error || 'Order not found'}
        </Typography>
        <Button sx={{ mt: 2 }} variant="outlined" onClick={() => navigate(-1)}>
          Back
        </Button>
      </Container>
    );

  const invoiceUrl = `/api/orders/${order.id}/invoice-pdf`;

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
          Customer
        </Typography>
        <Typography>
          {order.user?.first_name} {order.user?.last_name} ({order.user?.email})
        </Typography>
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
                    {(item.price || 0).toFixed(2)} {order.currency || 'EGP'}
                  </TableCell>
                  <TableCell align="right">
                    {(item.subtotal || 0).toFixed(2)} {order.currency || 'EGP'}
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
          <Box sx={{ textAlign: 'right' }}>
            <Typography>
              Subtotal: {(order.subtotal || 0).toFixed(2)} {order.currency || 'EGP'}
            </Typography>
            <Typography>
              Shipping: {(order.shipping_cost || 0).toFixed(2)} {order.currency || 'EGP'}
            </Typography>
            <Typography variant="h6">
              Total: {(order.total || 0).toFixed(2)} {order.currency || 'EGP'}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3, gap: 2 }}>
          <Button variant="contained" color="primary" onClick={() => window.open(invoiceUrl, '_blank')} startIcon={<DocumentDownload />}>
            Download Invoice
          </Button>
        </Box>
      </Paper>

      <Button variant="outlined" onClick={() => navigate(-1)} startIcon={<ArrowLeft2 />}>
        Back
      </Button>
    </Container>
  );
}
