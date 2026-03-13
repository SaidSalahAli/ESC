import { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Grid,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Alert,
  TablePagination,
  Tabs,
  Tab,
  Checkbox,
  FormControlLabel
} from '@mui/material';
import { Eye, Edit, Scan, Printer, ArrowLeft2, DocumentText } from 'iconsax-react';
import { adminService } from 'api';
import { useNavigate, useLocation } from 'react-router-dom';
import OrderBarcodePrint from 'components/OrderBarcodePrint';
import OrderInvoicePrint from './OrderInvoicePrint';

const statusColors = {
  pending: 'warning',
  processing: 'info',
  shipped: 'primary',
  delivered: 'success',
  cancelled: 'error',
  refunded: 'default'
};

const paymentStatusColors = {
  pending: 'warning',
  paid: 'success',
  failed: 'error',
  refunded: 'default'
};

export default function OrdersList() {
  const navigate = useNavigate();
  const location = useLocation();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalOrders, setTotalOrders] = useState(0);
  const [statusFilter, setStatusFilter] = useState('all');

  // Dialog states
  const [openDialog, setOpenDialog] = useState(false);
  const [openDetailsDialog, setOpenDetailsDialog] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderDetails, setOrderDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [orderStatus, setOrderStatus] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [openOrderBarcodeDialog, setOpenOrderBarcodeDialog] = useState(false);
  const [selectedOrderForBarcode, setSelectedOrderForBarcode] = useState(null);
  const [orderReturns, setOrderReturns] = useState([]);
  const [loadingReturns, setLoadingReturns] = useState(false);
  const [openReturnDialog, setOpenReturnDialog] = useState(false);
  const [returnItems, setReturnItems] = useState({}); // { itemId: { selected: true, quantity: 2 } }
  const [returnReason, setReturnReason] = useState('');
  const [creatingReturn, setCreatingReturn] = useState(false);
  const [openInvoiceDialog, setOpenInvoiceDialog] = useState(false);
  const [selectedOrderForInvoice, setSelectedOrderForInvoice] = useState(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params = {
        page: page + 1,
        limit: rowsPerPage
      };

      if (statusFilter !== 'all') {
        params.status = statusFilter;
      }

      const response = await adminService.getOrders(params);

      if (response.success) {
        setOrders(response.data.orders || []);
        setTotalOrders(response.data.pagination?.total || 0);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [page, rowsPerPage, statusFilter]);

  // Open order details when ?orderId= is present (e.g., from notifications)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const orderId = params.get('orderId');
    if (orderId) {
      (async () => {
        try {
          setLoadingDetails(true);
          setOpenDetailsDialog(true);
          const response = await adminService.getOrderDetails(orderId);
          if (response.success) {
            setOrderDetails(response.data);
            setSelectedOrder({
              id: response.data.id || parseInt(orderId, 10),
              order_number: response.data.order_number,
              total: response.data.total
            });

            // Fetch order returns
            try {
              setLoadingReturns(true);
              const returnsResponse = await adminService.getOrderReturns(orderId);
              if (returnsResponse.success) {
                setOrderReturns(returnsResponse.data || []);
              } else {
                setOrderReturns([]);
              }
            } catch (err) {
              console.error('Error loading returns:', err);
              setOrderReturns([]);
            } finally {
              setLoadingReturns(false);
            }
          } else {
            alert('Order not found');
            setOpenDetailsDialog(false);
          }
        } catch (err) {
          alert('Error loading order details: ' + err.message);
          setOpenDetailsDialog(false);
        } finally {
          setLoadingDetails(false);
        }
      })();
    }
  }, [location.search]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleStatusFilterChange = (event, newValue) => {
    setStatusFilter(newValue);
    setPage(0);
  };

  const handleOpenDialog = (order) => {
    setSelectedOrder(order);
    setOrderStatus(order.status);
    setPaymentStatus(order.payment_status || 'pending');
    setTrackingNumber(order.tracking_number || '');
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedOrder(null);
  };

  const handleViewDetails = async (order) => {
    try {
      setLoadingDetails(true);
      setOpenDetailsDialog(true);
      const response = await adminService.getOrderDetails(order.id);
      if (response.success) {
        setOrderDetails(response.data);
        setSelectedOrder(order);
      }

      // Fetch order returns
      try {
        setLoadingReturns(true);
        const returnsResponse = await adminService.getOrderReturns(order.id);
        if (returnsResponse.success) {
          setOrderReturns(returnsResponse.data || []);
        } else {
          setOrderReturns([]);
        }
      } catch (err) {
        console.error('Error loading returns:', err);
        setOrderReturns([]);
      } finally {
        setLoadingReturns(false);
      }
    } catch (err) {
      alert('Error loading order details: ' + err.message);
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleCloseDetailsDialog = () => {
    setOpenDetailsDialog(false);
    setOrderDetails(null);
    setSelectedOrder(null);
    setOrderReturns([]);
  };

  const handleUpdateStatus = async () => {
    try {
      await adminService.updateOrderStatus(selectedOrder.id, {
        status: orderStatus,
        payment_status: paymentStatus,
        tracking_number: trackingNumber
      });

      handleCloseDialog();
      fetchOrders();
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  const handlePrintInvoice = async (order) => {
    try {
      setLoadingDetails(true);
      const response = await adminService.getOrderDetails(order.id);
      if (response.success) {
        setSelectedOrderForInvoice(response.data);
        setOpenInvoiceDialog(true);
      }
    } catch (err) {
      alert('Error loading order details: ' + err.message);
    } finally {
      setLoadingDetails(false);
    }
  };

  if (loading && orders.length === 0) {
    return <Typography>Loading...</Typography>;
  }

  return (
    <Box>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h2">Orders Management</Typography>
            <Button variant="contained" startIcon={<Scan />} onClick={() => navigate('/dashboard/orders/scan-barcode')} sx={{ ml: 2 }}>
              Scan Order Barcode
            </Button>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Card>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs value={statusFilter} onChange={handleStatusFilterChange}>
                <Tab label="All" value="all" />
                <Tab label="Pending" value="pending" />
                <Tab label="Processing" value="processing" />
                <Tab label="Shipped" value="shipped" />
                <Tab label="Delivered" value="delivered" />
                <Tab label="Cancelled" value="cancelled" />
              </Tabs>
            </Box>

            <CardContent>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Order #</TableCell>
                      <TableCell>Customer</TableCell>
                      <TableCell>Total</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Payment</TableCell>
                      <TableCell>Date</TableCell>
                      <TableCell align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {orders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell>
                          <Typography variant="subtitle2">{order.order_number}</Typography>
                        </TableCell>
                        <TableCell>{order.user_id}</TableCell>
                        <TableCell>
                          <Typography variant="subtitle2">{order.total} EGP</Typography>
                        </TableCell>
                        <TableCell>
                          <Chip label={order.status} color={statusColors[order.status] || 'default'} size="small" />
                        </TableCell>
                        <TableCell>
                          <Chip label={order.payment_status} color={paymentStatusColors[order.payment_status] || 'default'} size="small" />
                          {order.payment_method === 'cib_bank' && order.payment_status === 'pending' && (
                            <Typography variant="caption" display="block" sx={{ color: 'text.secondary', mt: 0.5, fontSize: '0.7rem' }}>
                              Should update automatically after payment
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell>{new Date(order.created_at).toLocaleDateString()}</TableCell>
                        <TableCell align="right">
                          <IconButton
                            size="small"
                            onClick={() => handlePrintInvoice(order)}
                            title="Print Invoice"
                            color="success"
                            sx={{ mr: 1 }}
                          >
                            <DocumentText />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => {
                              setSelectedOrderForBarcode(order);
                              setOpenOrderBarcodeDialog(true);
                            }}
                            title="Print Order Barcode"
                            color="primary"
                            sx={{ mr: 1 }}
                          >
                            <Printer />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => navigate('/dashboard/orders/scan-barcode')}
                            title="Scan Order Barcode"
                            color="info"
                            sx={{ mr: 1 }}
                          >
                            <Scan />
                          </IconButton>
                          <IconButton size="small" onClick={() => handleViewDetails(order)} title="View Details" sx={{ mr: 1 }}>
                            <Eye />
                          </IconButton>
                          <IconButton size="small" onClick={() => handleOpenDialog(order)} title="Update Status">
                            <Edit />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              <TablePagination
                component="div"
                count={totalOrders}
                page={page}
                onPageChange={handleChangePage}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                rowsPerPageOptions={[5, 10, 25, 50]}
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Update Status Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Update Order Status</DialogTitle>
        <DialogContent>
          {selectedOrder && (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <Typography variant="body2" color="textSecondary">
                  Order: {selectedOrder.order_number}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Total: {selectedOrder.total} EGP
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Payment Method: {selectedOrder.payment_method === 'cib_bank' ? 'CIB Bank (Card)' : 'Cash on Delivery'}
                </Typography>
                {selectedOrder.payment_method === 'cib_bank' && selectedOrder.payment_status === 'pending' && (
                  <Typography variant="caption" color="warning.main" display="block" sx={{ mt: 1 }}>
                    Note: Payment status should update automatically after successful payment. If it remains pending, verify payment with
                    bank and update manually.
                  </Typography>
                )}
              </Grid>
              <Grid item xs={12}>
                <TextField select fullWidth label="Order Status" value={orderStatus} onChange={(e) => setOrderStatus(e.target.value)}>
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="processing">Processing</MenuItem>
                  <MenuItem value="shipped">Shipped</MenuItem>
                  <MenuItem value="delivered">Delivered</MenuItem>
                  <MenuItem value="cancelled">Cancelled</MenuItem>
                  <MenuItem value="refunded">Refunded</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  select
                  fullWidth
                  label="Payment Status"
                  value={paymentStatus}
                  onChange={(e) => setPaymentStatus(e.target.value)}
                  helperText="Update payment status for this order"
                >
                  <MenuItem value="pending">Pending (Cash on Delivery)</MenuItem>
                  <MenuItem value="paid">Paid</MenuItem>
                  <MenuItem value="failed">Failed</MenuItem>
                  <MenuItem value="refunded">Refunded</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Tracking Number"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  placeholder="Enter tracking number (required when shipping)"
                  helperText={orderStatus === 'shipped' && !trackingNumber ? 'Tracking number is recommended when shipping' : ''}
                  required={orderStatus === 'shipped'}
                />
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleUpdateStatus} variant="contained">
            Update Status
          </Button>
        </DialogActions>
      </Dialog>

      {/* Order Details Dialog */}
      <Dialog open={openDetailsDialog} onClose={handleCloseDetailsDialog} maxWidth="md" fullWidth>
        <DialogTitle>Order Details - {selectedOrder?.order_number}</DialogTitle>
        <DialogContent>
          {loadingDetails ? (
            <Typography>Loading order details...</Typography>
          ) : orderDetails ? (
            <Box sx={{ mt: 2 }}>
              {/* Order Summary */}
              <Card sx={{ mb: 2, p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Order Summary
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="textSecondary">
                      Status:
                    </Typography>
                    <Chip
                      label={orderDetails.status}
                      color={statusColors[orderDetails.status] || 'default'}
                      size="small"
                      sx={{ mt: 0.5 }}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="textSecondary">
                      Payment Status:
                    </Typography>
                    <Chip
                      label={orderDetails.payment_status}
                      color={paymentStatusColors[orderDetails.payment_status] || 'default'}
                      size="small"
                      sx={{ mt: 0.5 }}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="textSecondary">
                      Payment Method:
                    </Typography>
                    <Typography variant="body1">
                      {orderDetails.payment_method === 'cib_bank' ? 'CIB Bank (Card)' : 'Cash on Delivery'}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="textSecondary">
                      Order Date:
                    </Typography>
                    <Typography variant="body1">{new Date(orderDetails.created_at).toLocaleString()}</Typography>
                  </Grid>
                  {orderDetails.tracking_number && (
                    <Grid item xs={12}>
                      <Typography variant="body2" color="textSecondary">
                        Tracking Number:
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>
                        {orderDetails.tracking_number}
                      </Typography>
                    </Grid>
                  )}
                </Grid>
              </Card>

              {/* Customer Information */}
              {orderDetails.user && (
                <Card sx={{ mb: 2, p: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    Customer Information
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="textSecondary">
                        Name:
                      </Typography>
                      <Typography variant="body1">
                        {orderDetails.user.first_name} {orderDetails.user.last_name}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="textSecondary">
                        Email:
                      </Typography>
                      <Typography variant="body1">{orderDetails.user.email}</Typography>
                    </Grid>
                    {orderDetails.user.phone && (
                      <Grid item xs={6}>
                        <Typography variant="body2" color="textSecondary">
                          Phone:
                        </Typography>
                        <Typography variant="body1">{orderDetails.user.phone}</Typography>
                      </Grid>
                    )}
                  </Grid>
                </Card>
              )}

              {/* Shipping Address */}
              {orderDetails.shipping_address && (
                <Card sx={{ mb: 2, p: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    Shipping Address
                  </Typography>
                  <Typography variant="body1">
                    {orderDetails.shipping_address.first_name} {orderDetails.shipping_address.last_name}
                  </Typography>
                  <Typography variant="body1">{orderDetails.shipping_address.street_address}</Typography>
                  {orderDetails.shipping_address.apartment && (
                    <Typography variant="body1">{orderDetails.shipping_address.apartment}</Typography>
                  )}
                  <Typography variant="body1">
                    {orderDetails.shipping_address.city}, {orderDetails.shipping_address.governorate}{' '}
                    {orderDetails.shipping_address.postal_code}
                  </Typography>
                  <Typography variant="body1">{orderDetails.shipping_address.country}</Typography>
                  {orderDetails.shipping_address.phone && (
                    <Typography variant="body1" sx={{ mt: 1 }}>
                      Phone: {orderDetails.shipping_address.phone}
                    </Typography>
                  )}
                </Card>
              )}

              {/* Order Items */}
              {orderDetails.items && orderDetails.items.length > 0 && (
                <Card sx={{ mb: 2, p: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6">Order Items</Typography>
                    <Button
                      variant="outlined"
                      color="secondary"
                      startIcon={<ArrowLeft2 />}
                      onClick={() => {
                        setReturnItems({});
                        setReturnReason('');
                        setOpenReturnDialog(true);
                      }}
                    >
                      Create Return
                    </Button>
                  </Box>
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Product</TableCell>
                          <TableCell align="right">Category</TableCell>
                          <TableCell align="right">Quantity</TableCell>
                          <TableCell align="right">Price</TableCell>
                          <TableCell align="right">Total</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {orderDetails.items.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell>
                              <Typography variant="body2">{item.product_name || `Product ID: ${item.product_id}`}</Typography>
                              <Typography variant="caption" color="textSecondary">
                                {item.variant_name}
                              </Typography>
                            </TableCell>
                            <TableCell align="right">{item.category_name}</TableCell>
                            <TableCell align="right">{item.quantity}</TableCell>
                            <TableCell align="right">{item.price} EGP</TableCell>
                            <TableCell align="right">{(item.price * item.quantity).toFixed(2)} EGP</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Card>
              )}

              {/* Order Totals */}
              <Card sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Order Totals
                </Typography>
                <Grid container spacing={1}>
                  <Grid item xs={6}>
                    <Typography variant="body2">Subtotal:</Typography>
                  </Grid>
                  <Grid item xs={6} align="right">
                    <Typography variant="body2">{orderDetails.subtotal} EGP</Typography>
                  </Grid>
                  {orderDetails.tax > 0 && (
                    <>
                      <Grid item xs={6}>
                        <Typography variant="body2">Tax:</Typography>
                      </Grid>
                      <Grid item xs={6} align="right">
                        <Typography variant="body2">{orderDetails.tax} EGP</Typography>
                      </Grid>
                    </>
                  )}
                  {orderDetails.shipping_cost > 0 && (
                    <>
                      <Grid item xs={6}>
                        <Typography variant="body2">Shipping:</Typography>
                      </Grid>
                      <Grid item xs={6} align="right">
                        <Typography variant="body2">{orderDetails.shipping_cost} EGP</Typography>
                      </Grid>
                    </>
                  )}
                  {orderDetails.discount > 0 && (
                    <>
                      <Grid item xs={6}>
                        <Typography variant="body2">Discount:</Typography>
                      </Grid>
                      <Grid item xs={6} align="right">
                        <Typography variant="body2" color="error">
                          -{orderDetails.discount} EGP
                        </Typography>
                      </Grid>
                    </>
                  )}
                  <Grid item xs={6}>
                    <Typography variant="h6">Total:</Typography>
                  </Grid>
                  <Grid item xs={6} align="right">
                    <Typography variant="h6">{orderDetails.total} EGP</Typography>
                  </Grid>
                </Grid>
              </Card>

              {orderDetails.notes && (
                <Card sx={{ mt: 2, p: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    Order Notes
                  </Typography>
                  <Typography variant="body2">{orderDetails.notes}</Typography>
                </Card>
              )}

              {/* Order Returns */}
              {loadingReturns ? (
                <Card sx={{ mt: 2, p: 2 }}>
                  <Typography>Loading returns...</Typography>
                </Card>
              ) : orderReturns && orderReturns.length > 0 ? (
                <Card sx={{ mt: 2, p: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    Order Returns ({orderReturns.length})
                  </Typography>
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Product</TableCell>
                          <TableCell>Variant</TableCell>
                          <TableCell align="right">Quantity</TableCell>
                          <TableCell>Status</TableCell>
                          <TableCell align="right">Refund Amount</TableCell>
                          <TableCell>Date</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {orderReturns.map((returnItem) => (
                          <TableRow key={returnItem.id}>
                            <TableCell>
                              <Typography variant="body2">{returnItem.product_name}</Typography>
                            </TableCell>
                            <TableCell>{returnItem.variant_name || '-'}</TableCell>
                            <TableCell align="right">{returnItem.quantity}</TableCell>
                            <TableCell>
                              <Chip
                                label={returnItem.status}
                                color={
                                  returnItem.status === 'approved'
                                    ? 'success'
                                    : returnItem.status === 'rejected'
                                      ? 'error'
                                      : returnItem.status === 'refunded'
                                        ? 'info'
                                        : 'warning'
                                }
                                size="small"
                              />
                            </TableCell>
                            <TableCell align="right">{returnItem.refund_amount ? `${returnItem.refund_amount} EGP` : '-'}</TableCell>
                            <TableCell>{new Date(returnItem.created_at).toLocaleDateString()}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Card>
              ) : null}
            </Box>
          ) : (
            <Typography>No order details available</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDetailsDialog}>Close</Button>
          {selectedOrder && (
            <>
              <Button
                onClick={() => {
                  handlePrintInvoice(selectedOrder);
                }}
                variant="outlined"
                startIcon={<DocumentText />}
              >
                Print Invoice
              </Button>
              <Button
                onClick={() => {
                  handleCloseDetailsDialog();
                  handleOpenDialog(selectedOrder);
                }}
                variant="contained"
              >
                Update Status
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>

      {/* Order Barcode Print Dialog */}
      <Dialog open={openOrderBarcodeDialog} onClose={() => setOpenOrderBarcodeDialog(false)} maxWidth="sm" fullWidth>
        <DialogContent>
          {selectedOrderForBarcode && (
            <OrderBarcodePrint order={selectedOrderForBarcode} onClose={() => setOpenOrderBarcodeDialog(false)} />
          )}
        </DialogContent>
      </Dialog>

      {/* Invoice Print Dialog */}
      <Dialog open={openInvoiceDialog} onClose={() => setOpenInvoiceDialog(false)} maxWidth="md" fullWidth>
        <DialogContent>
          {selectedOrderForInvoice && (
            <OrderInvoicePrint orderDetails={selectedOrderForInvoice} onClose={() => setOpenInvoiceDialog(false)} />
          )}
        </DialogContent>
      </Dialog>

      {/* Create Return Dialog */}
      <Dialog open={openReturnDialog} onClose={() => setOpenReturnDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Create Return - Order #{selectedOrder?.order_number}</DialogTitle>
        <DialogContent>
          {orderDetails && orderDetails.items && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                Select items to return and specify quantities:
              </Typography>

              <TableContainer sx={{ mt: 2, mb: 2 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell padding="checkbox">Select</TableCell>
                      <TableCell>Product</TableCell>
                      <TableCell>Variant</TableCell>
                      <TableCell align="right">Ordered Qty</TableCell>
                      <TableCell align="right">Already Returned</TableCell>
                      <TableCell align="right">Remaining</TableCell>
                      <TableCell align="right">Return Qty</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {orderDetails.items.map((item) => {
                      const isSelected = returnItems[item.id]?.selected || false;
                      const returnQty = returnItems[item.id]?.quantity || 1;

                      // Calculate already returned quantity for this item
                      const alreadyReturned = orderReturns
                        .filter((r) => r.order_item_id === item.id && (r.status === 'pending' || r.status === 'approved'))
                        .reduce((sum, r) => sum + (r.quantity || 0), 0);

                      const remainingQty = item.quantity - alreadyReturned;
                      const maxReturnQty = Math.max(0, remainingQty);

                      return (
                        <TableRow key={item.id}>
                          <TableCell padding="checkbox">
                            <Checkbox
                              checked={isSelected}
                              disabled={remainingQty <= 0}
                              onChange={(e) => {
                                const newReturnItems = { ...returnItems };
                                if (e.target.checked && remainingQty > 0) {
                                  newReturnItems[item.id] = {
                                    selected: true,
                                    quantity: Math.min(1, remainingQty)
                                  };
                                } else {
                                  delete newReturnItems[item.id];
                                }
                                setReturnItems(newReturnItems);
                              }}
                            />
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">{item.product_name}</Typography>
                          </TableCell>
                          <TableCell>{item.variant_name || '-'}</TableCell>
                          <TableCell align="right">{item.quantity}</TableCell>
                          <TableCell align="right">
                            <Typography variant="body2" color={alreadyReturned > 0 ? 'warning.main' : 'text.secondary'}>
                              {alreadyReturned}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Typography variant="body2" color={remainingQty <= 0 ? 'error.main' : 'success.main'} fontWeight="bold">
                              {remainingQty}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            {isSelected && remainingQty > 0 ? (
                              <TextField
                                type="number"
                                size="small"
                                value={returnQty}
                                onChange={(e) => {
                                  const qty = Math.max(1, Math.min(parseInt(e.target.value) || 1, maxReturnQty));
                                  setReturnItems({
                                    ...returnItems,
                                    [item.id]: {
                                      selected: true,
                                      quantity: qty
                                    }
                                  });
                                }}
                                inputProps={{ min: 1, max: maxReturnQty }}
                                sx={{ width: 80 }}
                                error={returnQty > maxReturnQty}
                                helperText={returnQty > maxReturnQty ? `Max: ${maxReturnQty}` : ''}
                              />
                            ) : remainingQty <= 0 ? (
                              <Typography variant="caption" color="error">
                                All returned
                              </Typography>
                            ) : (
                              '-'
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>

              <TextField
                fullWidth
                multiline
                rows={3}
                label="Return Reason (Optional)"
                value={returnReason}
                onChange={(e) => setReturnReason(e.target.value)}
                placeholder="Enter reason for return..."
                sx={{ mt: 2 }}
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setOpenReturnDialog(false);
              setReturnItems({});
              setReturnReason('');
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color="secondary"
            onClick={async () => {
              const selectedItems = Object.keys(returnItems).filter((itemId) => returnItems[itemId]?.selected);

              if (selectedItems.length === 0) {
                alert('Please select at least one item to return');
                return;
              }

              try {
                setCreatingReturn(true);

                // Create return for each selected item
                const returnPromises = selectedItems.map(async (itemId) => {
                  const returnData = {
                    order_item_id: parseInt(itemId),
                    quantity: returnItems[itemId].quantity,
                    reason: returnReason || null
                  };

                  const response = await adminService.createOrderReturn(selectedOrder.id, returnData);
                  if (!response.success) {
                    throw new Error(response.message || 'Failed to create return');
                  }
                  return response;
                });

                await Promise.all(returnPromises);

                // Refresh order details and returns
                await handleViewDetails(selectedOrder);

                setOpenReturnDialog(false);
                setReturnItems({});
                setReturnReason('');

                alert('Return request(s) created successfully');
              } catch (err) {
                alert('Error creating return: ' + err.message);
              } finally {
                setCreatingReturn(false);
              }
            }}
            disabled={creatingReturn || Object.keys(returnItems).filter((id) => returnItems[id]?.selected).length === 0}
          >
            {creatingReturn ? 'Creating...' : 'Create Return'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
