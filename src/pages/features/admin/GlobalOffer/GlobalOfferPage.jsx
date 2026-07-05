import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  TextField,
  Button,
  Switch,
  FormControlLabel,
  Alert,
  CircularProgress,
  Divider,
  Stack,
  Paper,
  ToggleButton,
  ToggleButtonGroup,
  Chip,
  LinearProgress
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import PowerSettingsNewIcon from '@mui/icons-material/PowerSettingsNew';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import RefreshIcon from '@mui/icons-material/Refresh';
import { adminService } from 'api/admin';

const GlobalOfferPage = () => {
  const [offer, setOffer] = useState({
    global_offer_enabled: false,
    global_offer_type: 'percentage',
    global_offer_value: '',
    global_offer_label_en: '',
    global_offer_label_ar: '',
    global_offer_start_at: '',
    global_offer_end_at: ''
  });

  const [original, setOriginal] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchOffer();
  }, []);

  const fetchOffer = async () => {
    try {
      setLoading(true);
      const res = await adminService.getGlobalOffer();
      const data = res.data || {};
      const loaded = {
        global_offer_enabled: !!data.global_offer_enabled,
        global_offer_type: data.global_offer_type || 'percentage',
        global_offer_value: data.global_offer_value > 0 ? String(data.global_offer_value) : '',
        global_offer_label_en: data.global_offer_label_en || '',
        global_offer_label_ar: data.global_offer_label_ar || '',
        global_offer_start_at: data.global_offer_start_at || '',
        global_offer_end_at: data.global_offer_end_at || ''
      };
      setOffer(loaded);
      setOriginal(loaded);
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to load offer data.' });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setOffer((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      const payload = {
        ...offer,
        global_offer_value: parseFloat(offer.global_offer_value) || 0
      };

      const res = await adminService.updateGlobalOffer(payload);
      const data = res.data || {};

      const saved = {
        global_offer_enabled: !!data.global_offer_enabled,
        global_offer_type: data.global_offer_type || 'percentage',
        global_offer_value: data.global_offer_value > 0 ? String(data.global_offer_value) : '',
        global_offer_label_en: data.global_offer_label_en || '',
        global_offer_label_ar: data.global_offer_label_ar || '',
        global_offer_start_at: data.global_offer_start_at || '',
        global_offer_end_at: data.global_offer_end_at || ''
      };

      setOffer(saved);
      setOriginal(saved);

      setMessage({
        type: 'success',
        text: offer.global_offer_enabled
          ? `✅ Offer activated! ${offer.global_offer_value}${offer.global_offer_type === 'percentage' ? '%' : ' EGP'} off on all products.`
          : '✅ Global offer has been deactivated.'
      });
      setTimeout(() => setMessage({ type: '', text: '' }), 5000);
    } catch (err) {
      setMessage({
        type: 'error',
        text: err?.response?.data?.message || 'Failed to save offer settings.'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleQuickSet = (pct) => {
    setOffer((prev) => ({
      ...prev,
      global_offer_type: 'percentage',
      global_offer_value: String(pct),
      global_offer_label_en: `${pct}% OFF on all products`,
      global_offer_label_ar: `خصم ${pct}% على جميع المنتجات`,
      global_offer_enabled: true
    }));
  };

  const discountPreview = () => {
    const v = parseFloat(offer.global_offer_value) || 0;
    if (v <= 0) return null;
    const examplePrice = 500;
    if (offer.global_offer_type === 'percentage') {
      return `Example: product at 500 EGP → ${(examplePrice - (examplePrice * v) / 100).toFixed(0)} EGP`;
    }
    return `Example: product at 500 EGP → ${Math.max(examplePrice - v, 0).toFixed(0)} EGP`;
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  const isActive = offer.global_offer_enabled;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Page Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
            Global Offer — All Products
          </Typography>
          {isActive && (
            <Chip label="Active" color="error" size="small" sx={{ fontWeight: 700 }} />
          )}
        </Box>
        <Typography variant="body2" color="textSecondary">
          Activate a single discount that applies automatically to every product without an individual discount.
        </Typography>
      </Box>

      {message.text && (
        <Alert severity={message.type} sx={{ mb: 3, borderRadius: 1 }} onClose={() => setMessage({ type: '', text: '' })}>
          {message.text}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* ===== Status Card ===== */}
        <Grid item xs={12}>
          <Card
            sx={{
              boxShadow: isActive ? '0 0 0 3px #e53935' : '0 2px 8px rgba(0,0,0,0.1)',
              transition: 'box-shadow 0.3s',
              borderRadius: 2
            }}
          >
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <PowerSettingsNewIcon sx={{ fontSize: 36, color: isActive ? '#e53935' : '#9e9e9e' }} />
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                      {isActive ? 'Offer is Active' : 'Offer is Inactive'}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {isActive
                        ? `${offer.global_offer_value}${offer.global_offer_type === 'percentage' ? '%' : ' EGP'} off on all products`
                        : 'No global offer is currently running.'}
                    </Typography>
                  </Box>
                </Box>
                <FormControlLabel
                  control={
                    <Switch
                      checked={offer.global_offer_enabled}
                      onChange={(e) => handleChange('global_offer_enabled', e.target.checked)}
                      color="error"
                      size="medium"
                    />
                  }
                  label={offer.global_offer_enabled ? 'Deactivate' : 'Activate'}
                  labelPlacement="start"
                />
              </Box>

              {isActive && (
                <LinearProgress
                  color="error"
                  variant="indeterminate"
                  sx={{ mt: 2, borderRadius: 1 }}
                />
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* ===== Quick Presets ===== */}
        <Grid item xs={12}>
          <Card sx={{ boxShadow: '0 2px 8px rgba(0,0,0,0.1)', borderRadius: 2 }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                Quick Presets
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Stack direction="row" spacing={1.5} flexWrap="wrap" gap={1}>
                {[10, 15, 20, 25, 30, 40, 50].map((pct) => (
                  <Button
                    key={pct}
                    variant={offer.global_offer_value === String(pct) && offer.global_offer_type === 'percentage' ? 'contained' : 'outlined'}
                    color="error"
                    onClick={() => handleQuickSet(pct)}
                    sx={{ minWidth: 70, fontWeight: 700, borderRadius: 2 }}
                  >
                    {pct}% OFF
                  </Button>
                ))}
              </Stack>
              <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mt: 1.5 }}>
                Click a preset to apply it instantly, or enter a custom value below.
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* ===== Offer Details ===== */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', borderRadius: 2 }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                Discount Details
              </Typography>
              <Divider sx={{ mb: 2.5 }} />

              <Stack spacing={2.5}>
                {/* Discount Type */}
                <Box>
                  <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                    Discount Type
                  </Typography>
                  <ToggleButtonGroup
                    value={offer.global_offer_type}
                    exclusive
                    onChange={(_, v) => v && handleChange('global_offer_type', v)}
                    fullWidth
                    size="small"
                  >
                    <ToggleButton value="percentage" sx={{ fontWeight: 700 }}>
                      Percentage (%)
                    </ToggleButton>
                    <ToggleButton value="fixed" sx={{ fontWeight: 700 }}>
                      Fixed Amount (EGP)
                    </ToggleButton>
                  </ToggleButtonGroup>
                </Box>

                {/* Value */}
                <TextField
                  fullWidth
                  label={offer.global_offer_type === 'percentage' ? 'Discount Percentage (%)' : 'Discount Amount (EGP)'}
                  type="number"
                  value={offer.global_offer_value}
                  onChange={(e) => handleChange('global_offer_value', e.target.value)}
                  inputProps={{
                    min: 0,
                    max: offer.global_offer_type === 'percentage' ? 100 : undefined,
                    step: '0.01'
                  }}
                  size="small"
                  helperText={offer.global_offer_type === 'percentage' ? 'Between 1 and 100' : 'Fixed value in Egyptian Pounds'}
                />

                {/* Preview */}

              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* ===== Label & Schedule ===== */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', borderRadius: 2 }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                Offer Label & Schedule
              </Typography>
              <Divider sx={{ mb: 2.5 }} />

              <Stack spacing={2}>
                <TextField
                  fullWidth
                  label="Offer Label (English)"
                  value={offer.global_offer_label_en}
                  onChange={(e) => handleChange('global_offer_label_en', e.target.value)}
                  size="small"
                  placeholder="e.g. Summer Sale – 30% OFF"
                  helperText="Shown in the header announcement bar"
                />
                <TextField
                  fullWidth
                  label="Offer Label (Arabic)"
                  value={offer.global_offer_label_ar}
                  onChange={(e) => handleChange('global_offer_label_ar', e.target.value)}
                  size="small"
                  placeholder="e.g. تخفيضات الصيف – خصم 30%"
                  inputProps={{ dir: 'rtl' }}
                />

                <Box>
                  <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                    Schedule (optional)
                  </Typography>
                  <Stack spacing={1.5}>
                    <TextField
                      fullWidth
                      label="Start Date & Time"
                      type="datetime-local"
                      value={offer.global_offer_start_at}
                      onChange={(e) => handleChange('global_offer_start_at', e.target.value)}
                      size="small"
                      InputLabelProps={{ shrink: true }}
                    />
                    <TextField
                      fullWidth
                      label="End Date & Time"
                      type="datetime-local"
                      value={offer.global_offer_end_at}
                      onChange={(e) => handleChange('global_offer_end_at', e.target.value)}
                      size="small"
                      InputLabelProps={{ shrink: true }}
                    />
                  </Stack>
                  <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mt: 0.5 }}>
                    Leave empty to run the offer indefinitely.
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* ===== Info Box ===== */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2, bgcolor: '#e3f2fd', borderLeft: '4px solid #1976d2', borderRadius: 1 }}>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
              <InfoOutlinedIcon sx={{ color: '#1976d2', mt: 0.3 }} />
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1976d2' }}>
                  How does the Global Offer work?
                </Typography>
                <Typography variant="body2" color="textSecondary" sx={{ mt: 0.5 }}>
                  • The discount is applied automatically to every product <strong>that does not already have its own individual discount</strong>.
                  <br />
                  • Products with their own discount keep their original discount and are not affected.
                  <br />
                  • The discount appears immediately on product cards, detail pages, cart, and checkout.
                  <br />
                  • The offer label is shown in the header announcement bar automatically.
                  <br />
                  • You can deactivate the offer at any time using the toggle above.
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>

        {/* ===== Action Buttons ===== */}
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
            <Button variant="outlined" startIcon={<RefreshIcon />} onClick={fetchOffer} disabled={saving} sx={{ px: 3 }}>
              Discard Changes
            </Button>
            {isActive && (
              <Button
                variant="outlined"
                color="error"
                onClick={() => setOffer((prev) => ({ ...prev, global_offer_enabled: false }))}
                disabled={saving}
                sx={{ px: 3 }}
              >
                Deactivate Offer
              </Button>
            )}
            <Button
              variant="contained"
              color={isActive ? 'error' : 'primary'}
              startIcon={<SaveIcon />}
              onClick={handleSave}
              disabled={saving}
              sx={{ px: 4, fontWeight: 700 }}
            >
              {saving ? 'Saving...' : isActive ? 'Save & Activate Offer' : 'Save Settings'}
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Container>
  );
};

export default GlobalOfferPage;
