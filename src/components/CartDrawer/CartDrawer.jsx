import React, { useState, useEffect, useMemo } from 'react';
import {
  Drawer,
  Box,
  Typography,
  Button,
  IconButton,
  Stack,
  TextField,
  Card,
  CardMedia,
  CardContent,
  Divider,
  Alert,
  CircularProgress,
  useMediaQuery,
  useTheme
} from '@mui/material';
import { Close as CloseIcon, Delete as DeleteIcon, Remove as MinusIcon, Add as PlusIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { FormattedMessage, useIntl } from 'react-intl';

import { cartService } from 'api/cart';
import { ordersService } from 'api/orders';
import useAuth from 'hooks/useAuth';
import { openSnackbar } from 'api/snackbar';
import { getImageUrl } from 'utils/imageHelper';
import { getGuestCart, updateGuestCartItem, removeFromGuestCart, clearGuestCart, mergeGuestCartWithUserCart } from 'utils/guestCart';

import './CartDrawer.css';

// ==============================|| CART DRAWER COMPONENT ||============================== //

export default function CartDrawer({ open, onClose }) {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { isLoggedIn } = useAuth();
  const intl = useIntl();

  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [shippingCost, setShippingCost] = useState(50);
  const [promo, setPromo] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);
  const [updatingItems, setUpdatingItems] = useState(new Set());
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [governorates, setGovernorates] = useState([]);
  const [loadingGovernorates, setLoadingGovernorates] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [shippingAddress, setShippingAddress] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    email: '',
    address_line1: '',
    address_line2: '',
    city: '',
    state: '',
    postal_code: '',
    country: 'Egypt',
    governorate: ''
  });

  // ==================== Calculations ====================

  const subtotal = useMemo(() => {
    return cartItems.reduce((sum, item) => {
      const price = item.sale_price || item.product_price || item.price || 0;
      return sum + price * item.quantity;
    }, 0);
  }, [cartItems]);

  const discountAmount = (subtotal * discountPercent) / 100;
  const total = subtotal - discountAmount + shippingCost;

  // ==================== Data Loading ====================

  const loadUserCart = async () => {
    try {
      const response = await cartService.getCart();
      if (response.success) {
        setCartItems(response.data?.items || []);
      }
    } catch (err) {
      console.error('Error loading cart:', err);
    }
  };

  const loadGuestCart = () => {
    const guestCart = getGuestCart();
    setCartItems(guestCart);
  };

  const fetchShippingCost = async () => {
    try {
      const response = await ordersService.getShippingCost();
      let cost = 50;
      if (response?.data?.shipping_cost) {
        cost = response.data.shipping_cost;
      } else if (response?.data?.data?.shipping_cost) {
        cost = response.data.data.shipping_cost;
      }
      setShippingCost(parseFloat(cost));
    } catch (err) {
      setShippingCost(50);
    }
  };

  // ==================== Effects ====================

  useEffect(() => {
    if (open) {
      setLoading(true);
      if (isLoggedIn) {
        mergeGuestCartWithUserCart(cartService).then(() => {
          loadUserCart();
          fetchShippingCost();
        });
      } else {
        loadGuestCart();
        fetchShippingCost();
      }
      setLoading(false);
    }
  }, [open, isLoggedIn]);

  // Listen for cart updates
  useEffect(() => {
    const handleCartUpdate = () => {
      if (open) {
        if (isLoggedIn) {
          loadUserCart();
        } else {
          loadGuestCart();
        }
      }
    };

    window.addEventListener('cartUpdated', handleCartUpdate);
    return () => window.removeEventListener('cartUpdated', handleCartUpdate);
  }, [open, isLoggedIn]);

  // ==================== Actions ====================

  async function updateQuantity(itemId, newQuantity) {
    if (newQuantity <= 0) return;

    setUpdatingItems((prev) => new Set(prev).add(itemId));

    try {
      if (!isLoggedIn) {
        updateGuestCartItem(itemId, newQuantity);
        loadGuestCart();
      } else {
        const res = await cartService.updateCartItem(itemId, newQuantity);
        if (res.success) {
          loadUserCart();
        }
      }
      window.dispatchEvent(new Event('cartUpdated'));
    } catch (err) {
      console.error('Error updating quantity:', err);
    } finally {
      setUpdatingItems((prev) => {
        const updated = new Set(prev);
        updated.delete(itemId);
        return updated;
      });
    }
  }

  async function removeItem(itemId) {
    setUpdatingItems((prev) => new Set(prev).add(itemId));

    try {
      if (!isLoggedIn) {
        removeFromGuestCart(itemId);
        loadGuestCart();
      } else {
        const res = await cartService.removeFromCart(itemId);
        if (res.success) {
          loadUserCart();
        }
      }
      window.dispatchEvent(new Event('cartUpdated'));
      openSnackbar({
        open: true,
        message: intl.formatMessage({ id: 'item-removed-cart' }),
        variant: 'alert',
        alert: { color: 'success' }
      });
    } catch (err) {
      console.error('Error removing item:', err);
    } finally {
      setUpdatingItems((prev) => {
        const updated = new Set(prev);
        updated.delete(itemId);
        return updated;
      });
    }
  }

  async function clearCartItems() {
    try {
      if (!isLoggedIn) {
        clearGuestCart();
        setCartItems([]);
      } else {
        const res = await cartService.clearCart();
        if (res.success) {
          setCartItems([]);
        }
      }
      window.dispatchEvent(new Event('cartUpdated'));
      openSnackbar({
        open: true,
        message: intl.formatMessage({ id: 'cart-cleared' }),
        variant: 'alert',
        alert: { color: 'success' }
      });
    } catch (err) {
      console.error('Error clearing cart:', err);
    }
  }

  function applyPromoCode() {
    const code = promo.trim().toUpperCase();
    if (code === 'ESC10') {
      setDiscountPercent(10);
      openSnackbar({
        open: true,
        message: '10% discount applied!',
        variant: 'alert',
        alert: { color: 'success' }
      });
    } else if (!code) {
      openSnackbar({
        open: true,
        message: 'Enter a promo code',
        variant: 'alert',
        alert: { color: 'warning' }
      });
    } else {
      setDiscountPercent(0);
      openSnackbar({
        open: true,
        message: 'Invalid promo code',
        variant: 'alert',
        alert: { color: 'error' }
      });
    }
    setPromo('');
  }

  async function proceedToCheckout() {
    if (!cartItems.length) return;

    onClose();

    if (!isLoggedIn) {
      navigate('/checkout');
      return;
    }

    try {
      const validate = await cartService.validateCart();
      if (validate.success) {
        navigate('/checkout');
      }
    } catch (err) {
      console.error('Error validating cart:', err);
    }
  }

  // ==================== Render ====================

  const drawerWidth = isMobile ? '100%' : '380px';
  const isEmpty = !loading && cartItems.length === 0;

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: drawerWidth,
          background: '#0a4834',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '-4px 0 20px rgba(0, 0, 0, 0.4)',
          animation: 'slideInRight 0.3s cubic-bezier(0.35, 0, 0.25, 1) forwards'
        }
      }}
      SlideProps={{
        timeout: 300
      }}
    >
      {/* ==================== HEADER ====================  */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          p: 2.5,
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          flexShrink: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.3)',
          backdropFilter: 'blur(8px)'
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 700, color: '#fff', letterSpacing: '0.5px' }}>
          <FormattedMessage id="shopping-cart" /> ({cartItems.length})
        </Typography>
        <IconButton
          onClick={onClose}
          sx={{
            color: '#fff',
            '&:hover': {
              background: 'rgba(255, 255, 255, 0.1)',
              transform: 'rotate(90deg)'
            },
            transition: 'all 0.2s'
          }}
          size="small"
        >
          <CloseIcon sx={{ fontSize: 20 }} />
        </IconButton>
      </Box>

      {/* ==================== CONTENT ====================  */}
      {loading ? (
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <CircularProgress sx={{ color: '#fff' }} />
        </Box>
      ) : isEmpty ? (
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            p: 3,
            textAlign: 'center'
          }}
        >
          <Box
            sx={{
              width: 80,
              height: 80,
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mb: 2
            }}
          >
            <CloseIcon sx={{ fontSize: 40, color: '#666' }} />
          </Box>
          <Typography sx={{ color: '#aaa', mb: 2, fontWeight: 500 }}>
            <FormattedMessage id="your-cart-is-empty" />
          </Typography>
          <Button
            variant="contained"
            onClick={() => {
              onClose();
              navigate('/collections');
            }}
            sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              borderRadius: '8px',
              px: 3,
              py: 1.2,
              fontWeight: 600,
              textTransform: 'none',
              fontSize: '0.95rem',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 12px 24px rgba(102, 126, 234, 0.3)'
              },
              transition: 'all 0.3s'
            }}
          >
            <FormattedMessage id="continue-shopping" />
          </Button>
        </Box>
      ) : (
        <>
          {/* Items Container */}
          <Box
            sx={{
              flex: 1,
              overflowY: 'auto',
              p: 2,
              '&::-webkit-scrollbar': {
                width: '6px'
              },
              '&::-webkit-scrollbar-track': {
                background: 'rgba(255, 255, 255, 0.05)',
                borderRadius: '3px'
              },
              '&::-webkit-scrollbar-thumb': {
                background: 'rgba(255, 255, 255, 0.2)',
                borderRadius: '3px',
                '&:hover': {
                  background: 'rgba(255, 255, 255, 0.3)'
                }
              }
            }}
          >
            <Stack spacing={2}>
              {cartItems.map((item) => {
                const itemId = isLoggedIn ? item.id : item.key;
                const imageUrl = item.main_image ? getImageUrl(item.main_image) : item.image;
                const price = item.product_price || item.sale_price || item.price || 0;
                const isUpdating = updatingItems.has(itemId);

                return (
                  <Card
                    key={itemId}
                    sx={{
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '12px',
                      overflow: 'hidden',
                      transition: 'all 0.3s',
                      '&:hover': {
                        background: 'rgba(255, 255, 255, 0.08)',
                        borderColor: 'rgba(255, 255, 255, 0.2)',
                        transform: 'translateY(-2px)'
                      }
                    }}
                  >
                    <Box sx={{ display: 'flex', gap: 1.5 }}>
                      {/* Image */}
                      <CardMedia
                        component="img"
                        image={imageUrl || 'https://via.placeholder.com/300x300?text=Product'}
                        alt={item.product_name || item.name}
                        sx={{
                          width: 100,
                          height: 100,
                          objectFit: 'cover',
                          flexShrink: 0,
                          borderRadius: '8px',
                          m: 1
                        }}
                        onError={(e) => {
                          e.currentTarget.src = 'https://via.placeholder.com/300x300?text=Product';
                        }}
                      />

                      {/* Info & Controls */}
                      <CardContent
                        sx={{ flex: 1, p: '12px 12px 12px 0', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
                      >
                        {/* Product Name & Variant */}
                        <Box>
                          <Typography
                            sx={{
                              color: '#fff',
                              fontWeight: 600,
                              fontSize: '0.95rem',
                              mb: 0.5,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical'
                            }}
                          >
                            {item.product_name || item.name}
                          </Typography>
                          {(item.size || item.color || item.variant_name) && (
                            <Typography sx={{ color: '#aaa', fontSize: '0.8rem', mb: 0.5 }}>
                              {item.variant_name ? item.variant_name : ''}
                              {item.size && !item.variant_name && `Size: ${item.size}`}
                              {item.size && item.color && !item.variant_name && ' · '}
                              {item.color && !item.variant_name && `Color: ${item.color}`}
                            </Typography>
                          )}
                        </Box>

                        {/* Price & Quantity Controls */}
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <Box>
                            <Typography sx={{ color: '#fff', fontWeight: 700, fontSize: '1rem' }}>
                              EGP {price.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                            </Typography>
                            <Typography sx={{ color: '#888', fontSize: '0.8rem' }}>x {item.quantity}</Typography>
                          </Box>

                          {/* Quantity & Remove */}
                          <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
                            <IconButton
                              size="small"
                              disabled={isUpdating || item.quantity === 1}
                              onClick={() => updateQuantity(itemId, item.quantity - 1)}
                              sx={{
                                color: '#aaa',
                                width: 28,
                                height: 28,
                                background: 'rgba(255, 255, 255, 0.05)',
                                '&:hover': {
                                  background: 'rgba(255, 255, 255, 0.1)',
                                  color: '#fff'
                                },
                                '&.Mui-disabled': {
                                  opacity: 0.5
                                }
                              }}
                            >
                              <MinusIcon sx={{ fontSize: 14 }} />
                            </IconButton>
                            <Typography sx={{ color: '#fff', fontWeight: 600, minWidth: '24px', textAlign: 'center', fontSize: '0.9rem' }}>
                              {item.quantity}
                            </Typography>
                            <IconButton
                              size="small"
                              disabled={isUpdating}
                              onClick={() => updateQuantity(itemId, item.quantity + 1)}
                              sx={{
                                color: '#aaa',
                                width: 28,
                                height: 28,
                                background: 'rgba(255, 255, 255, 0.05)',
                                '&:hover': {
                                  background: 'rgba(255, 255, 255, 0.1)',
                                  color: '#fff'
                                }
                              }}
                            >
                              <PlusIcon sx={{ fontSize: 14 }} />
                            </IconButton>
                            <IconButton
                              size="small"
                              disabled={isUpdating}
                              onClick={() => removeItem(itemId)}
                              sx={{
                                color: '#ff6b6b',
                                width: 28,
                                height: 28,
                                background: 'rgba(255, 107, 107, 0.1)',
                                ml: 0.5,
                                '&:hover': {
                                  background: 'rgba(255, 107, 107, 0.2)'
                                }
                              }}
                            >
                              <DeleteIcon sx={{ fontSize: 14 }} />
                            </IconButton>
                          </Stack>
                        </Box>
                      </CardContent>
                    </Box>
                  </Card>
                );
              })}
            </Stack>
          </Box>

          {/* ==================== FOOTER ====================  */}
          <Box
            sx={{
              p: 2.5,
              borderTop: '1px solid rgba(255, 255, 255, 0.08)',
              backgroundColor: 'rgba(0, 0, 0, 0.3)',
              backdropFilter: 'blur(8px)',
              flexShrink: 0
            }}
          >
            {/* Promo Code */}
            <Box sx={{ mb: 2 }}>
              <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
                <TextField
                  value={promo}
                  onChange={(e) => setPromo(e.target.value)}
                  placeholder="Promo code"
                  size="small"
                  onKeyPress={(e) => e.key === 'Enter' && applyPromoCode()}
                  sx={{
                    flex: 1,
                    '& .MuiOutlinedInput-root': {
                      color: '#fff',
                      fontSize: '0.9rem',
                      '& fieldset': {
                        borderColor: 'rgba(255, 255, 255, 0.2)'
                      },
                      '&:hover fieldset': {
                        borderColor: 'rgba(255, 255, 255, 0.3)'
                      }
                    },
                    '& .MuiOutlinedInput-input::placeholder': {
                      color: '#666',
                      opacity: 1
                    }
                  }}
                />
                <Button
                  variant="outlined"
                  onClick={applyPromoCode}
                  size="small"
                  sx={{
                    color: '#aaa',
                    borderColor: 'rgba(255, 255, 255, 0.2)',
                    '&:hover': {
                      borderColor: '#667eea',
                      color: '#667eea'
                    }
                  }}
                >
                  Apply
                </Button>
              </Stack>
            </Box>

            {/* Summary */}
            <Box sx={{ mb: 2 }}>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  mb: 1,
                  pb: 1,
                  borderBottom: '1px solid rgba(255, 255, 255, 0.05)'
                }}
              >
                <Typography sx={{ color: '#aaa', fontSize: '0.9rem' }}>
                  <FormattedMessage id="subtotal" />
                </Typography>
                <Typography sx={{ color: '#fff', fontWeight: 600 }}>EGP {Math.round(subtotal).toLocaleString()}</Typography>
              </Box>

              {discountPercent > 0 && (
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    mb: 1,
                    pb: 1,
                    borderBottom: '1px solid rgba(255, 255, 255, 0.05)'
                  }}
                >
                  <Typography sx={{ color: '#4ade80', fontSize: '0.9rem' }}>
                    <FormattedMessage id="discount" /> (-{discountPercent}%)
                  </Typography>
                  <Typography sx={{ color: '#4ade80', fontWeight: 600 }}>- EGP {Math.round(discountAmount).toLocaleString()}</Typography>
                </Box>
              )}

              <Box
                sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, pb: 1, borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}
              >
                <Typography sx={{ color: '#aaa', fontSize: '0.9rem' }}>Shipping</Typography>
                <Typography sx={{ color: '#fff', fontWeight: 600 }}>EGP {parseFloat(shippingCost).toFixed(2)}</Typography>
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography sx={{ color: '#fff', fontWeight: 700, fontSize: '1.1rem' }}>
                  <FormattedMessage id="total" />
                </Typography>
                <Typography sx={{ color: '#667eea', fontWeight: 700, fontSize: '1.1rem' }}>
                  EGP {Math.round(total).toLocaleString()}
                </Typography>
              </Box>
            </Box>

            {/* Buttons */}
            <Stack spacing={1.5}>
              <Button
                fullWidth
                variant="contained"
                onClick={proceedToCheckout}
                sx={{
                  background: '#ffff',
                  borderRadius: '8px',
                  py: 1.5,
                  fontWeight: 700,
                  textTransform: 'none',
                  color: '#0a4834',
                  fontSize: '1rem',
                  borderRadius: '0px',
                  boxShadow: '0 8px 16px rgba(102, 126, 234, 0.3)',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    background: '#fff ',
                    boxShadow: '0 12px 24px rgba(102, 126, 234, 0.4)'
                  },
                  transition: 'all 0.3s'
                }}
              >
                <FormattedMessage id="proceed-to-checkout" />
              </Button>
              <Button
                fullWidth
                variant="outlined"
                onClick={() => {
                  onClose();
                  navigate('/collections');
                }}
                sx={{
                  color: '#aaa',
                  borderColor: 'rgba(255, 255, 255, 0.2)',
                  py: 1.2,
                  fontWeight: 600,
                  borderRadius: '0px',
                  textTransform: 'none',
                  fontSize: '0.95rem',
                  '&:hover': {
                    borderColor: 'rgba(255, 255, 255, 0.4)',
                    background: 'rgba(255, 255, 255, 0.05)',
                    color: '#fff'
                  },
                  transition: 'all 0.3s'
                }}
              >
                <FormattedMessage id="continue-shopping" />
              </Button>
            </Stack>
          </Box>
        </>
      )}
    </Drawer>
  );
}
