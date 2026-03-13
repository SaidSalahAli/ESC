import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Alert,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  InputAdornment,
  Chip,
  Checkbox,
  Divider
} from '@mui/material';
import { Scan, ArrowLeft, Refresh, Printer, Add, Trash } from 'iconsax-react';
import { ordersService } from 'api/orders';
import { adminService } from 'api';
import { useNavigate } from 'react-router-dom';
import OrderBarcodePrint from 'components/OrderBarcodePrint';

export default function OrderBarcodeScanner() {
  const navigate = useNavigate();
  const [barcode, setBarcode] = useState('');
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [returnDialogOpen, setReturnDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [returnQuantity, setReturnQuantity] = useState(1);
  const [printDialogOpen, setPrintDialogOpen] = useState(false);
  const [productBarcode, setProductBarcode] = useState('');
  const [returningItems, setReturningItems] = useState({}); // For batch returns
  const [batchReturnDialogOpen, setBatchReturnDialogOpen] = useState(false);
  const barcodeInputRef = useRef(null);
  const productBarcodeInputRef = useRef(null);

  useEffect(() => {
    // Focus on barcode input when component mounts
    if (barcodeInputRef.current) {
      barcodeInputRef.current.focus();
    }
  }, []);

  const handleScan = async () => {
    if (!barcode.trim()) {
      setError('Please enter order barcode');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      const response = await ordersService.scanOrderBarcode(barcode.trim());

      if (response.success) {
        setOrder(response.data);
        setSuccess('Order found successfully');
        setBarcode(''); // Clear input after successful scan
      } else {
        setError(response.message || 'Order not found');
        setOrder(null);
      }
    } catch (err) {
      setError(err.message || 'Failed to scan barcode');
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleScan();
    }
  };

  const handleReturnItem = (item) => {
    setSelectedItem(item);
    setReturnQuantity(1);
    setReturnDialogOpen(true);
  };

  const handleConfirmReturn = async () => {
    if (!selectedItem || returnQuantity < 1) {
      return;
    }

    try {
      setLoading(true);
      const response = await adminService.returnOrderItemToStock(order.id, {
        order_item_id: selectedItem.id,
        quantity: returnQuantity
      });

      if (response.success) {
        const stockInfo = response.data?.new_stock_quantity !== null 
          ? ` (New stock: ${response.data.new_stock_quantity})`
          : '';
        setSuccess(`Successfully returned ${returnQuantity} item(s) of "${selectedItem.product_name}" to stock${stockInfo}`);
        setReturnDialogOpen(false);
        // Refresh order data
        const refreshResponse = await ordersService.scanOrderBarcode(order.order_number);
        if (refreshResponse.success) {
          setOrder(refreshResponse.data);
        }
      } else {
        setError(response.message || 'Failed to return item to stock');
      }
    } catch (err) {
      setError(err.message || 'Failed to return item to stock');
    } finally {
      setLoading(false);
    }
  };

  const handlePrintBarcode = () => {
    setPrintDialogOpen(true);
  };

  const handleQuickReturnByBarcode = async () => {
    if (!productBarcode.trim() || !order || !order.items) {
      setError('Please enter a product barcode');
      return;
    }

    // Find item by barcode
    const item = order.items.find((i) => i.barcode === productBarcode.trim());
    
    if (!item) {
      setError(`Product with barcode "${productBarcode}" not found in this order`);
      setProductBarcode('');
      return;
    }

    // Auto-return the full quantity
    try {
      setLoading(true);
      setError(null);
      
      const response = await adminService.returnOrderItemToStock(order.id, {
        order_item_id: item.id,
        quantity: item.quantity
      });

      if (response.success) {
        const stockInfo = response.data?.new_stock_quantity !== null 
          ? ` (New stock: ${response.data.new_stock_quantity})`
          : '';
        setSuccess(`Successfully returned ${item.quantity} item(s) of "${item.product_name}" to stock${stockInfo}`);
        setProductBarcode('');
        // Refresh order data
        const refreshResponse = await ordersService.scanOrderBarcode(order.order_number);
        if (refreshResponse.success) {
          setOrder(refreshResponse.data);
        }
        // Focus back on input
        if (productBarcodeInputRef.current) {
          productBarcodeInputRef.current.focus();
        }
      } else {
        setError(response.message || 'Failed to return item to stock');
      }
    } catch (err) {
      setError(err.message || 'Failed to return item to stock');
    } finally {
      setLoading(false);
    }
  };

  const handleBatchReturn = async () => {
    const selectedItems = Object.keys(returningItems).filter(
      (itemId) => returningItems[itemId]?.selected
    );

    if (selectedItems.length === 0) {
      setError('Please select at least one item to return');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      // Return all selected items
      const returnPromises = selectedItems.map(async (itemId) => {
        const item = order.items.find((i) => i.id === parseInt(itemId));
        const returnQty = returningItems[itemId].quantity || item.quantity;
        
        return adminService.returnOrderItemToStock(order.id, {
          order_item_id: parseInt(itemId),
          quantity: returnQty
        });
      });

      const results = await Promise.all(returnPromises);
      
      // Count successful returns
      const successfulReturns = results.filter(r => r.success).length;
      const totalQuantity = results
        .filter(r => r.success)
        .reduce((sum, r) => sum + (r.data?.quantity_returned || 0), 0);
      
      setSuccess(`Successfully returned ${totalQuantity} item(s) from ${successfulReturns} product(s) to stock`);
      setBatchReturnDialogOpen(false);
      setReturningItems({});
      
      // Refresh order data
      const refreshResponse = await ordersService.scanOrderBarcode(order.order_number);
      if (refreshResponse.success) {
        setOrder(refreshResponse.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to return items to stock');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
        <IconButton onClick={() => navigate('/dashboard/orders')}>
          <ArrowLeft />
        </IconButton>
        <Typography variant="h4">Scan Order Barcode</Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Scanner Input */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Enter Order Barcode
              </Typography>
              <TextField
                inputRef={barcodeInputRef}
                fullWidth
                label="Order Barcode"
                value={barcode}
                onChange={(e) => setBarcode(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Scan or enter order barcode"
                disabled={loading}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={handleScan} disabled={loading || !barcode.trim()}>
                        <Scan />
                      </IconButton>
                    </InputAdornment>
                  )
                }}
                sx={{ mb: 2 }}
              />
              <Button
                variant="contained"
                fullWidth
                onClick={handleScan}
                disabled={loading || !barcode.trim()}
                startIcon={<Scan />}
              >
                {loading ? 'Scanning...' : 'Scan Barcode'}
              </Button>

              {error && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  {error}
                </Alert>
              )}

              {success && (
                <Alert severity="success" sx={{ mt: 2 }}>
                  {success}
                </Alert>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Order Details */}
        {order && (
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">Order Details</Typography>
                  <Box>
                    <IconButton onClick={handlePrintBarcode} color="primary" title="Print Barcode">
                      <Printer />
                    </IconButton>
                    <IconButton
                      onClick={() => {
                        setBarcode(order.order_number);
                        handleScan();
                      }}
                      title="Refresh"
                    >
                      <Refresh />
                    </IconButton>
                  </Box>
                </Box>

                <Typography variant="body2" color="textSecondary">
                  <strong>Order Number:</strong> {order.order_number}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  <strong>Date:</strong> {new Date(order.created_at).toLocaleString()}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  <strong>Status:</strong> {order.status}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  <strong>Total:</strong> {order.total} {order.currency || 'EGP'}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Product Barcode Scanner for Quick Return */}
        {order && order.items && (
          <Grid item xs={12}>
            <Card sx={{ mb: 2 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Quick Return by Product Barcode
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                  <TextField
                    inputRef={productBarcodeInputRef}
                    fullWidth
                    label="Scan Product Barcode"
                    value={productBarcode}
                    onChange={(e) => setProductBarcode(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && productBarcode.trim()) {
                        handleQuickReturnByBarcode();
                      }
                    }}
                    placeholder="Scan product barcode to return"
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton 
                            onClick={handleQuickReturnByBarcode} 
                            disabled={!productBarcode.trim() || loading}
                          >
                            <Scan />
                          </IconButton>
                        </InputAdornment>
                      )
                    }}
                  />
                  <Button
                    variant="outlined"
                    startIcon={<Add />}
                    onClick={() => {
                      setReturningItems({});
                      setBatchReturnDialogOpen(true);
                    }}
                    disabled={!order || !order.items || order.items.length === 0}
                  >
                    Batch Return
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Order Items */}
        {order && order.items && (
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">
                    Order Items ({order.items.length})
                  </Typography>
                </Box>
                <TableContainer component={Paper} variant="outlined">
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Product</TableCell>
                        <TableCell>Variant</TableCell>
                        <TableCell>Quantity</TableCell>
                        <TableCell>Price</TableCell>
                        <TableCell>Subtotal</TableCell>
                        <TableCell align="right">Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {order.items.map((item) => (
                        <TableRow key={item.id} hover>
                          <TableCell>
                            <Typography variant="body2" fontWeight="medium">
                              {item.product_name}
                            </Typography>
                            {item.barcode && (
                              <Chip 
                                label={`Barcode: ${item.barcode}`} 
                                size="small" 
                                sx={{ mt: 0.5 }}
                                variant="outlined"
                              />
                            )}
                          </TableCell>
                          <TableCell>{item.variant_name || '-'}</TableCell>
                          <TableCell>
                            <Typography variant="body2" fontWeight="medium">
                              {item.quantity}
                            </Typography>
                          </TableCell>
                          <TableCell>{item.price} {order.currency || 'EGP'}</TableCell>
                          <TableCell>{item.subtotal} {order.currency || 'EGP'}</TableCell>
                          <TableCell align="right">
                            <Button
                              size="small"
                              variant="outlined"
                              color="secondary"
                              onClick={() => handleReturnItem(item)}
                              disabled={loading}
                            >
                              Return to Stock
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>

      {/* Return Item Dialog */}
      <Dialog open={returnDialogOpen} onClose={() => setReturnDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Return Item to Stock</DialogTitle>
        <DialogContent>
          {selectedItem && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                Product: <strong>{selectedItem.product_name}</strong>
              </Typography>
              {selectedItem.variant_name && (
                <Typography variant="body2" color="textSecondary" gutterBottom>
                  Variant: <strong>{selectedItem.variant_name}</strong>
                </Typography>
              )}
              <Typography variant="body2" color="textSecondary" gutterBottom>
                Ordered Quantity: <strong>{selectedItem.quantity}</strong>
              </Typography>
              <TextField
                fullWidth
                label="Quantity to Return"
                type="number"
                value={returnQuantity}
                onChange={(e) => {
                  const qty = parseInt(e.target.value) || 0;
                  setReturnQuantity(Math.min(Math.max(qty, 1), selectedItem.quantity));
                }}
                inputProps={{ min: 1, max: selectedItem.quantity }}
                sx={{ mt: 2 }}
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReturnDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleConfirmReturn} variant="contained" disabled={loading}>
            {loading ? 'Processing...' : 'Return to Stock'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Print Barcode Dialog */}
      <Dialog open={printDialogOpen} onClose={() => setPrintDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogContent>
          {order && <OrderBarcodePrint order={order} onClose={() => setPrintDialogOpen(false)} />}
        </DialogContent>
      </Dialog>

      {/* Batch Return Dialog */}
      <Dialog open={batchReturnDialogOpen} onClose={() => setBatchReturnDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Batch Return to Stock</DialogTitle>
        <DialogContent>
          {order && order.items && (
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
                      <TableCell align="right">Return Qty</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {order.items.map((item) => {
                      const isSelected = returningItems[item.id]?.selected || false;
                      const returnQty = returningItems[item.id]?.quantity || item.quantity;
                      
                      return (
                        <TableRow key={item.id}>
                          <TableCell padding="checkbox">
                            <Checkbox
                              checked={isSelected}
                              onChange={(e) => {
                                const newReturningItems = { ...returningItems };
                                if (e.target.checked) {
                                  newReturningItems[item.id] = {
                                    selected: true,
                                    quantity: item.quantity
                                  };
                                } else {
                                  delete newReturningItems[item.id];
                                }
                                setReturningItems(newReturningItems);
                              }}
                            />
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">{item.product_name}</Typography>
                            {item.barcode && (
                              <Typography variant="caption" color="textSecondary">
                                Barcode: {item.barcode}
                              </Typography>
                            )}
                          </TableCell>
                          <TableCell>{item.variant_name || '-'}</TableCell>
                          <TableCell align="right">{item.quantity}</TableCell>
                          <TableCell align="right">
                            {isSelected ? (
                              <TextField
                                type="number"
                                size="small"
                                value={returnQty}
                                onChange={(e) => {
                                  const qty = Math.max(1, Math.min(parseInt(e.target.value) || 1, item.quantity));
                                  setReturningItems({
                                    ...returningItems,
                                    [item.id]: {
                                      selected: true,
                                      quantity: qty
                                    }
                                  });
                                }}
                                inputProps={{ min: 1, max: item.quantity }}
                                sx={{ width: 80 }}
                              />
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
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setBatchReturnDialogOpen(false);
            setReturningItems({});
          }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="secondary"
            onClick={handleBatchReturn}
            disabled={loading || Object.keys(returningItems).filter(id => returningItems[id]?.selected).length === 0}
          >
            {loading ? 'Processing...' : 'Return Selected to Stock'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

