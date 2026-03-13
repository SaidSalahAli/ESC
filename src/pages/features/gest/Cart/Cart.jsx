// src/pages/Cart.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FormattedMessage, useIntl } from 'react-intl';
import { Box, Container, Typography, CircularProgress, Button, Stack, TextField, Alert } from '@mui/material';

import CardItem from 'components/CardItem';
import { cartService } from 'api/cart';
import { ordersService } from 'api/orders';
import useAuth from 'hooks/useAuth';
import { openSnackbar } from 'api/snackbar';
import { getImageUrl } from 'utils/imageHelper';
import { getGuestCart, updateGuestCartItem, removeFromGuestCart, clearGuestCart, mergeGuestCartWithUserCart } from 'utils/guestCart';

export default function Cart() {
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();
  const intl = useIntl();

  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [promo, setPromo] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);
  const [notif, setNotif] = useState('');
  const [shippingCost, setShippingCost] = useState(0);
  const [summary, setSummary] = useState({
    subtotal: 0,
    item_count: 0,
    total_items: 0
  });

  /* ================= Fetch Cart ================= */

  const fetchCart = async () => {
    try {
      setLoading(true);
      const response = await cartService.getCart();
      if (response.success) {
        setCartItems(response.data?.items || []);
        setSummary(
          response.data?.summary || {
            subtotal: 0,
            item_count: 0,
            total_items: 0
          }
        );
      }
    } catch (err) {
      openSnackbar({
        open: true,
        message: intl.formatMessage({ id: 'failed-load-cart' }),
        variant: 'alert',
        alert: { color: 'error' }
      });
    } finally {
      setLoading(false);
    }
  };

  /* ================= Guest Cart ================= */

  const loadGuestCart = () => {
    try {
      setLoading(true);
      const guestCart = getGuestCart();
      setCartItems(guestCart);

      const subtotal = guestCart.reduce((sum, item) => {
        const price = item.sale_price || item.product_price || item.price || 0;
        return sum + price * item.quantity;
      }, 0);

      setSummary({
        subtotal,
        item_count: guestCart.length,
        total_items: guestCart.reduce((sum, item) => sum + item.quantity, 0)
      });
    } finally {
      setLoading(false);
    }
  };

  /* ================= Init ================= */

  useEffect(() => {
    if (isLoggedIn) {
      mergeGuestCartWithUserCart(cartService).then(fetchCart);
    } else {
      loadGuestCart();
    }
    // Fetch shipping cost
    fetchShippingCost();

    // Refresh shipping cost every 5 seconds
    const interval = setInterval(() => {
      fetchShippingCost();
    }, 5000);

    return () => clearInterval(interval);
    // eslint-disable-next-line
  }, [isLoggedIn]);

  const fetchShippingCost = async () => {
    try {
      const response = await ordersService.getShippingCost();
      console.log('Cart - Shipping cost response:', response);

      // Response structure: { success: true, message: "...", data: { shipping_cost: 50 } }
      let cost = 50;
      if (response?.data?.shipping_cost) {
        cost = response.data.shipping_cost;
      } else if (response?.data?.data?.shipping_cost) {
        cost = response.data.data.shipping_cost;
      }
      console.log('Cart - Parsed shipping cost:', cost);
      setShippingCost(parseFloat(cost));
    } catch (err) {
      setShippingCost(50); // Default fallback on error
      console.error('Failed to fetch shipping cost:', err);
    }
  };

  useEffect(() => {
    const handler = () => (isLoggedIn ? fetchCart() : loadGuestCart());

    window.addEventListener('cartUpdated', handler);
    return () => window.removeEventListener('cartUpdated', handler);
  }, [isLoggedIn]);

  /* ================= Calculations ================= */

  const subtotal = summary.subtotal || 0;
  const discountAmount = (subtotal * discountPercent) / 100;
  const total = subtotal - discountAmount + shippingCost;

  /* ================= Actions ================= */

  async function changeQty(itemId, qty) {
    if (!isLoggedIn) {
      updateGuestCartItem(itemId, qty);
      loadGuestCart();
      window.dispatchEvent(new Event('cartUpdated'));
      return;
    }

    const res = await cartService.updateCartItem(itemId, qty);
    if (res.success) fetchCart();
  }

  async function removeItem(itemId) {
    if (!isLoggedIn) {
      removeFromGuestCart(itemId);
      loadGuestCart();
      window.dispatchEvent(new Event('cartUpdated'));
      return;
    }

    const res = await cartService.removeFromCart(itemId);
    if (res.success) fetchCart();
  }

  function applyPromoCode() {
    const code = promo.trim().toUpperCase();
    if (code === 'ESC10') {
      setDiscountPercent(10);
      setNotif('10% discount applied!');
    } else if (!code) {
      setNotif('Enter a promo code');
    } else {
      setDiscountPercent(0);
      setNotif('Invalid promo code');
    }
    setTimeout(() => setNotif(''), 2500);
  }

  async function clearCart() {
    if (!isLoggedIn) {
      clearGuestCart();
      loadGuestCart();
      return;
    }

    const res = await cartService.clearCart();
    if (res.success) fetchCart();
  }

  async function proceedToCheckout() {
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }

    if (!cartItems.length) return;

    const validate = await cartService.validateCart();
    if (validate.success) navigate('/checkout');
  }

  /* ================= Render ================= */

  return (
    <Box sx={{ py: { xs: 4, md: 6 }, bgcolor: '#f9f9f9' }}>
      <Container maxWidth="lg">
        {/* Title */}
        <Typography variant="h4" fontWeight={700} mb={4}>
          <FormattedMessage id="shopping-cart" />
        </Typography>

        {loading ? (
          <Box textAlign="center" py={6}>
            <CircularProgress />
          </Box>
        ) : (
          <Box
            sx={{
              display: 'grid',
              gap: 3,
              gridTemplateColumns: {
                xs: '1fr',
                md: '1fr 340px'
              }
            }}
          >
            {/* ===== LEFT ===== */}
            <Box
              sx={{
                bgcolor: '#fff',
                borderRadius: 3,
                p: { xs: 2, md: 3 },
                boxShadow: 1
              }}
            >
              {!cartItems.length ? (
                <Box textAlign="center" py={6}>
                  <Typography mb={2}>
                    <FormattedMessage id="your-cart-is-empty" />
                  </Typography>
                  <Button variant="contained" onClick={() => navigate('/collections')}>
                    <FormattedMessage id="continue-shopping" />
                  </Button>
                </Box>
              ) : (
                cartItems.map((item) => {
                  let imageUrl = item.main_image && getImageUrl(item.main_image);
                  if (!imageUrl && item.image) imageUrl = item.image;

                  const mappedItem = {
                    id: isLoggedIn ? item.id : item.key,
                    productId: item.product_id || item.productId,
                    name: item.product_name || item.name,
                    price: item.product_price || item.sale_price || item.price || 0,
                    quantity: item.quantity,
                    image: imageUrl,
                    size: item.size,
                    color: item.color
                  };

                  return (
                    <Box key={mappedItem.id} mb={2}>
                      <CardItem item={mappedItem} onChangeQty={changeQty} onRemove={removeItem} />
                    </Box>
                  );
                })
              )}
            </Box>

            {/* ===== RIGHT SUMMARY ===== */}
            <Box
              sx={{
                bgcolor: '#fff',
                borderRadius: 3,
                p: 3,
                boxShadow: 1,
                height: 'fit-content',
                position: { md: 'sticky' },
                top: { md: 100 }
              }}
            >
              <Typography variant="h6" fontWeight={700} mb={2}>
                <FormattedMessage id="order-summary" />
              </Typography>

              <SummaryRow label={<FormattedMessage id="subtotal" />} value={`EGP ${Math.round(subtotal).toLocaleString()}`} />

              <SummaryRow label={<FormattedMessage id="discount" />} value={`- EGP ${Math.round(discountAmount).toLocaleString()}`} />

              <SummaryRow label="Shipping" value={`EGP ${parseFloat(shippingCost).toFixed(2)}`} />

              <SummaryRow bold label={<FormattedMessage id="total" />} value={`EGP ${Math.round(total).toLocaleString()}`} />

              <Stack direction="row" spacing={1} mt={3}>
                <TextField
                  fullWidth
                  size="small"
                  value={promo}
                  onChange={(e) => setPromo(e.target.value)}
                  placeholder={intl.formatMessage({
                    id: 'enter-promo-code'
                  })}
                />
                <Button variant="outlined" onClick={applyPromoCode}>
                  <FormattedMessage id="apply" />
                </Button>
              </Stack>

              {notif && (
                <Alert sx={{ mt: 2 }} severity="info">
                  {notif}
                </Alert>
              )}

              <Button fullWidth variant="contained" size="large" sx={{ mt: 3 }} disabled={!cartItems.length} onClick={proceedToCheckout}>
                {!isLoggedIn ? <FormattedMessage id="login-to-checkout" /> : <FormattedMessage id="proceed-to-checkout" />}
              </Button>

              <Button fullWidth variant="outlined" sx={{ mt: 1.5 }} onClick={clearCart}>
                <FormattedMessage id="clear-cart" />
              </Button>
            </Box>
          </Box>
        )}
      </Container>
    </Box>
  );
}

/* ===== Helper ===== */

function SummaryRow({ label, value, bold }) {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        mt: 1,
        fontWeight: bold ? 700 : 400
      }}
    >
      <span>{label}</span>
      <span>{value}</span>
    </Box>
  );
}
