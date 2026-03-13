import React, { useState, useEffect } from 'react';
import { useIntl } from 'react-intl';
import {
  Container,
  TextField,
  Button,
  Typography,
  Box,
  Card,
  CardContent,
  Alert,
  CircularProgress,
  Grid,
  Divider,
  Stack,
  Paper
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import RefreshIcon from '@mui/icons-material/Refresh';
import axiosServices from 'utils/axios';

const SettingsPage = () => {
  const intl = useIntl();
  const [settings, setSettings] = useState({
    site_name: '',
    site_description: '',
    contact_email: '',
    contact_phone: '',
    shipping_cost: '50',
    currency: 'EGP'
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [originalSettings, setOriginalSettings] = useState({});

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await axiosServices.get('/api/settings');
      console.log('Settings API Response:', response);

      // Response structure: { success: true, message: "Success", data: { site_name: "...", site_description: "...", ... } }
      const data = response.data?.data || response.data || {};

      setSettings((prev) => ({
        ...prev,
        site_name: data.site_name || '',
        site_description: data.site_description || '',
        contact_email: data.contact_email || '',
        contact_phone: data.contact_phone || '',
        shipping_cost: (data.shipping_cost || '50').toString(),
        currency: data.currency || 'EGP'
      }));

      setOriginalSettings((prev) => ({
        ...prev,
        site_name: data.site_name || '',
        site_description: data.site_description || '',
        contact_email: data.contact_email || '',
        contact_phone: data.contact_phone || '',
        shipping_cost: (data.shipping_cost || '50').toString(),
        currency: data.currency || 'EGP'
      }));
    } catch (error) {
      console.error('Failed to fetch settings:', error);
      setMessage({
        type: 'error',
        text: 'فشل في جلب الإعدادات'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSettings((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      // Validate shipping cost
      const shippingCostValue = parseFloat(settings.shipping_cost);
      if (isNaN(shippingCostValue) || shippingCostValue < 0) {
        setMessage({
          type: 'error',
          text: 'سعر الشحن يجب أن يكون رقم موجب'
        });
        setSaving(false);
        return;
      }

      // Save shipping cost only if changed
      if (settings.shipping_cost !== originalSettings.shipping_cost) {
        console.log('Updating shipping cost to:', shippingCostValue);
        const response = await axiosServices.put('/api/admin/settings/shipping-cost', { shipping_cost: shippingCostValue });
        console.log('Update response:', response);
      }

      // Update original settings
      setOriginalSettings({ ...settings });

      setMessage({
        type: 'success',
        text: 'تم تحديث الإعدادات بنجاح'
      });

      setTimeout(() => {
        setMessage({ type: '', text: '' });
      }, 3000);
    } catch (error) {
      console.error('Failed to update settings:', error);
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'فشل في تحديث الإعدادات'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setSettings({ ...originalSettings });
  };

  if (loading) {
    return (
      <Container maxWidth="sm" sx={{ py: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 700, mb: 1 }}>
          إعدادات المتجر
        </Typography>
        <Typography variant="body2" color="textSecondary">
          إدارة إعدادات المتجر والإعدادات العامة
        </Typography>
      </Box>

      {message.text && (
        <Alert severity={message.type} sx={{ mb: 3, borderRadius: 1 }} onClose={() => setMessage({ type: '', text: '' })}>
          {message.text}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* معلومات المتجر */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 700, mb: 2 }}>
                ℹ️ معلومات المتجر
              </Typography>
              <Divider sx={{ mb: 2.5 }} />

              <Stack spacing={2}>
                <TextField
                  fullWidth
                  label="اسم المتجر"
                  name="site_name"
                  value={settings.site_name}
                  onChange={handleInputChange}
                  disabled
                  variant="outlined"
                  size="small"
                />

                <TextField
                  fullWidth
                  label="وصف المتجر"
                  name="site_description"
                  value={settings.site_description}
                  onChange={handleInputChange}
                  disabled
                  multiline
                  rows={2}
                  variant="outlined"
                  size="small"
                />

                <TextField
                  fullWidth
                  label="البريد الإلكتروني"
                  name="contact_email"
                  value={settings.contact_email}
                  onChange={handleInputChange}
                  disabled
                  type="email"
                  variant="outlined"
                  size="small"
                />

                <TextField
                  fullWidth
                  label="رقم الهاتف"
                  name="contact_phone"
                  value={settings.contact_phone}
                  onChange={handleInputChange}
                  disabled
                  variant="outlined"
                  size="small"
                />
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* الإعدادات المالية */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 700, mb: 2 }}>
                💰 الإعدادات المالية
              </Typography>
              <Divider sx={{ mb: 2.5 }} />

              <Stack spacing={2}>
                <Paper sx={{ p: 2, bgcolor: '#f5f5f5', borderLeft: '4px solid #ff9800' }}>
                  <TextField
                    fullWidth
                    label="سعر الشحن (بالجنيه المصري)"
                    name="shipping_cost"
                    value={settings.shipping_cost}
                    onChange={handleInputChange}
                    type="number"
                    inputProps={{
                      step: '0.01',
                      min: '0'
                    }}
                    variant="outlined"
                    size="small"
                  />
                  <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mt: 1 }}>
                    💡 سيتم إضافة هذا السعر إلى جميع الطلبات الجديدة
                  </Typography>
                </Paper>

                <Paper sx={{ p: 2, bgcolor: '#f5f5f5', borderLeft: '4px solid #2196f3' }}>
                  <TextField
                    fullWidth
                    label="العملة"
                    name="currency"
                    value={settings.currency}
                    onChange={handleInputChange}
                    disabled
                    variant="outlined"
                    size="small"
                  />
                  <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mt: 1 }}>
                    العملة المستخدمة في المتجر
                  </Typography>
                </Paper>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* الأزرار */}
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
            <Button variant="outlined" startIcon={<RefreshIcon />} onClick={handleReset} disabled={saving} sx={{ px: 3 }}>
              إلغاء التعديلات
            </Button>
            <Button variant="contained" color="primary" startIcon={<SaveIcon />} onClick={handleSave} disabled={saving} sx={{ px: 4 }}>
              {saving ? 'جاري الحفظ...' : 'حفظ التغييرات'}
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Container>
  );
};

export default SettingsPage;
