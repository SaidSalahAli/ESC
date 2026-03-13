import { useEffect, useState, useRef } from 'react';
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  TextField,
  Button,
  Chip,
  Alert,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  LinearProgress
} from '@mui/material';
import { Scan, TickCircle, CloseCircle, Refresh } from 'iconsax-react';
import { adminService } from 'api';
import { useParams, useNavigate } from 'react-router-dom';
import { getImageUrl } from 'utils/imageHelper';

export default function OrderFulfillment() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [fulfillmentStatus, setFulfillmentStatus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [barcodeInput, setBarcodeInput] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });
  const barcodeInputRef = useRef(null);

  useEffect(() => {
    fetchOrderDetails();
    fetchFulfillmentStatus();
    
    // Focus on barcode input
    if (barcodeInputRef.current) {
      barcodeInputRef.current.focus();
    }
  }, [orderId]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      const response = await adminService.getOrderDetails(orderId);
      if (response.success) {
        setOrder(response.data);
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  const fetchFulfillmentStatus = async () => {
    try {
      const response = await adminService.getFulfillmentStatus(orderId);
      if (response.success) {
        setFulfillmentStatus(response.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch fulfillment status:', err);
    }
  };

  const handleScanBarcode = async (barcode) => {
    if (!barcode || !barcode.trim()) {
      return;
    }

    try {
      setScanning(true);
      setMessage({ type: '', text: '' });
      
      const response = await adminService.scanBarcode(orderId, barcode.trim());
      
      if (response.success) {
        setMessage({ 
          type: 'success', 
          text: response.message || 'Product scanned successfully!' 
        });
        
        // Refresh data
        await fetchOrderDetails();
        await fetchFulfillmentStatus();
        
        // Clear input
        setBarcodeInput('');
        
        // If all items scanned, show completion message
        if (response.all_scanned) {
          setTimeout(() => {
            setMessage({ 
              type: 'success', 
              text: 'All items have been scanned! Order is ready for shipping.' 
            });
          }, 1000);
        }
      } else {
        setMessage({ type: 'error', text: response.message || 'Failed to scan barcode' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Failed to scan barcode' });
    } finally {
      setScanning(false);
      // Refocus on input
      setTimeout(() => {
        if (barcodeInputRef.current) {
          barcodeInputRef.current.focus();
        }
      }, 100);
    }
  };

  const handleBarcodeSubmit = (e) => {
    e.preventDefault();
    handleScanBarcode(barcodeInput);
  };

  const handleKeyPress = (e) => {
    // Auto-submit when Enter is pressed (common with barcode scanners)
    if (e.key === 'Enter') {
      e.preventDefault();
      handleScanBarcode(barcodeInput);
    }
  };

  const getItemStatus = (item) => {
    const scanned = item.scanned_quantity || 0;
    const required = item.quantity || 0;
    
    if (scanned >= required) {
      return { status: 'completed', color: 'success', label: 'Completed' };
    } else if (scanned > 0) {
      return { status: 'partial', color: 'warning', label: 'Partial' };
    } else {
      return { status: 'pending', color: 'default', label: 'Pending' };
    }
  };

  const calculateProgress = () => {
    if (fulfillmentStatus.length === 0) return 0;
    
    const totalItems = fulfillmentStatus.reduce((sum, item) => sum + (item.quantity || 0), 0);
    const scannedItems = fulfillmentStatus.reduce((sum, item) => sum + (item.scanned_quantity || 0), 0);
    
    return totalItems > 0 ? Math.round((scannedItems / totalItems) * 100) : 0;
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!order) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">Order not found</Alert>
      </Box>
    );
  }

  const progress = calculateProgress();
  const allScanned = fulfillmentStatus.every(item => 
    (item.scanned_quantity || 0) >= (item.quantity || 0)
  );

  return (
    <Box sx={{ p: 3 }}>
      <Grid container spacing={3}>
        {/* Header */}
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h4">
              Order Fulfillment - {order.order_number}
            </Typography>
            <Button
              variant="outlined"
              startIcon={<Refresh />}
              onClick={() => {
                fetchOrderDetails();
                fetchFulfillmentStatus();
              }}
            >
              Refresh
            </Button>
          </Box>
        </Grid>

        {/* Barcode Scanner Section */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Scan size="24" />
                Scan Barcode
              </Typography>
              
              <form onSubmit={handleBarcodeSubmit}>
                <TextField
                  inputRef={barcodeInputRef}
                  fullWidth
                  label="Barcode"
                  value={barcodeInput}
                  onChange={(e) => setBarcodeInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={scanning}
                  placeholder="Scan or enter barcode"
                  sx={{ mt: 2, mb: 2 }}
                  autoFocus
                />
                
                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  disabled={scanning || !barcodeInput.trim()}
                  startIcon={scanning ? <CircularProgress size={20} /> : <Scan />}
                >
                  {scanning ? 'Scanning...' : 'Scan Barcode'}
                </Button>
              </form>

              {message.text && (
                <Alert 
                  severity={message.type === 'error' ? 'error' : 'success'} 
                  sx={{ mt: 2 }}
                  onClose={() => setMessage({ type: '', text: '' })}
                >
                  {message.text}
                </Alert>
              )}

              {/* Progress */}
              <Box sx={{ mt: 3 }}>
                <Typography variant="body2" color="textSecondary" gutterBottom>
                  Fulfillment Progress
                </Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={progress} 
                  sx={{ height: 10, borderRadius: 5, mb: 1 }}
                />
                <Typography variant="body2" align="center">
                  {progress}% Complete
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Order Items Status */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Order Items Status
              </Typography>
              
              {allScanned && (
                <Alert severity="success" sx={{ mb: 2 }}>
                  All items have been scanned! Order is ready for shipping.
                </Alert>
              )}

              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Product</TableCell>
                      <TableCell align="center">Required</TableCell>
                      <TableCell align="center">Scanned</TableCell>
                      <TableCell align="center">Status</TableCell>
                      <TableCell align="center">Barcode</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {fulfillmentStatus.map((item) => {
                      const itemStatus = getItemStatus(item);
                      return (
                        <TableRow key={item.id}>
                          <TableCell>
                            <Typography variant="body2" fontWeight="medium">
                              {item.product_name}
                            </Typography>
                          </TableCell>
                          <TableCell align="center">
                            {item.quantity}
                          </TableCell>
                          <TableCell align="center">
                            <Typography 
                              variant="body2" 
                              fontWeight="bold"
                              color={itemStatus.color === 'success' ? 'success.main' : 'text.primary'}
                            >
                              {item.scanned_quantity || 0}
                            </Typography>
                          </TableCell>
                          <TableCell align="center">
                            <Chip 
                              label={itemStatus.label}
                              color={itemStatus.color}
                              size="small"
                              icon={itemStatus.status === 'completed' ? <TickCircle size="16" /> : null}
                            />
                          </TableCell>
                          <TableCell align="center">
                            <Typography variant="body2" fontFamily="monospace">
                              {item.barcode || 'N/A'}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Order Summary */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Order Summary
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6} md={3}>
                  <Typography variant="body2" color="textSecondary">Order Number</Typography>
                  <Typography variant="body1" fontWeight="medium">{order.order_number}</Typography>
                </Grid>
                <Grid item xs={6} md={3}>
                  <Typography variant="body2" color="textSecondary">Status</Typography>
                  <Chip 
                    label={order.status} 
                    color={order.status === 'processing' ? 'primary' : 'default'}
                    size="small"
                  />
                </Grid>
                <Grid item xs={6} md={3}>
                  <Typography variant="body2" color="textSecondary">Total Items</Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {fulfillmentStatus.reduce((sum, item) => sum + (item.quantity || 0), 0)}
                  </Typography>
                </Grid>
                <Grid item xs={6} md={3}>
                  <Typography variant="body2" color="textSecondary">Total Amount</Typography>
                  <Typography variant="body1" fontWeight="medium">{order.total} EGP</Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

