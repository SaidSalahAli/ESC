import React, { useState, useEffect } from 'react';
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
  Switch,
  FormControlLabel,
  Chip,
  IconButton,
  Tooltip,
  Paper
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import RefreshIcon from '@mui/icons-material/Refresh';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import axiosServices from 'utils/axios';

const DEFAULT_NAV_LINKS = [
  { label_en: 'Home', label_ar: 'الرئيسية', url: '/' },
  { label_en: 'Collections', label_ar: 'المجموعات', url: '/collections' },
  { label_en: 'About', label_ar: 'من نحن', url: '/about' },
  { label_en: 'Contact', label_ar: 'تواصل معنا', url: '/contact' }
];

const HeaderSettingsPage = () => {
  const [settings, setSettings] = useState({
    announcement_text_en: '',
    announcement_text_ar: '',
    announcement_enabled: true,
    countdown_target_date: '',
    countdown_enabled: true,
    nav_links: DEFAULT_NAV_LINKS
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
      const data = response.data?.data || response.data || {};

      let navLinks = DEFAULT_NAV_LINKS;
      if (data.header_nav_links) {
        try {
          navLinks = JSON.parse(data.header_nav_links);
        } catch {
          navLinks = DEFAULT_NAV_LINKS;
        }
      }

      const loaded = {
        announcement_text_en: data.announcement_text_en || 'FREE SHIPPING ON ORDERS OVER 500 EGP | SUMMER SALE UP TO 50% OFF',
        announcement_text_ar: data.announcement_text_ar || 'شحن مجاني على الطلبات فوق 500 جنيه | خصومات الصيف حتى 50%',
        announcement_enabled: data.announcement_enabled !== 'false' && data.announcement_enabled !== '0',
        countdown_target_date: data.countdown_target_date || 'August 31, 2026 23:59:59',
        countdown_enabled: data.countdown_enabled !== 'false' && data.countdown_enabled !== '0',
        nav_links: navLinks
      };

      setSettings(loaded);
      setOriginalSettings(loaded);
    } catch (error) {
      console.error('Failed to fetch settings:', error);
      setMessage({ type: 'error', text: 'Failed to load settings.' });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setSettings((prev) => ({ ...prev, [field]: value }));
  };

  const handleNavLinkChange = (index, field, value) => {
    setSettings((prev) => {
      const links = [...prev.nav_links];
      links[index] = { ...links[index], [field]: value };
      return { ...prev, nav_links: links };
    });
  };

  const addNavLink = () => {
    setSettings((prev) => ({
      ...prev,
      nav_links: [...prev.nav_links, { label_en: '', label_ar: '', url: '' }]
    }));
  };

  const removeNavLink = (index) => {
    setSettings((prev) => ({
      ...prev,
      nav_links: prev.nav_links.filter((_, i) => i !== index)
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      const payload = {
        announcement_text_en: settings.announcement_text_en,
        announcement_text_ar: settings.announcement_text_ar,
        announcement_enabled: settings.announcement_enabled ? 'true' : 'false',
        countdown_target_date: settings.countdown_target_date,
        countdown_enabled: settings.countdown_enabled ? 'true' : 'false',
        header_nav_links: JSON.stringify(settings.nav_links)
      };

      await axiosServices.put('/api/admin/header-settings', payload);

      setOriginalSettings({ ...settings });
      setMessage({ type: 'success', text: '✅ Header settings saved successfully! Reload the homepage to see the changes.' });

      setTimeout(() => setMessage({ type: '', text: '' }), 5000);
    } catch (error) {
      console.error('Failed to save header settings:', error);
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to save settings.'
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
      {/* Page Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 700, mb: 1 }}>
          Header Settings
        </Typography>
        <Typography variant="body2" color="textSecondary">
          Manage the announcement bar, countdown timer, and navigation links shown in the header.
        </Typography>
      </Box>

      {message.text && (
        <Alert severity={message.type} sx={{ mb: 3, borderRadius: 1 }} onClose={() => setMessage({ type: '', text: '' })}>
          {message.text}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* ===== Announcement Bar ===== */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  Announcement Bar
                </Typography>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.announcement_enabled}
                      onChange={(e) => handleChange('announcement_enabled', e.target.checked)}
                      color="primary"
                    />
                  }
                  label={settings.announcement_enabled ? 'Enabled' : 'Disabled'}
                  labelPlacement="start"
                />
              </Box>
              <Divider sx={{ mb: 2.5 }} />

              <Stack spacing={2}>
                <TextField
                  fullWidth
                  label="Announcement Text (English)"
                  value={settings.announcement_text_en}
                  onChange={(e) => handleChange('announcement_text_en', e.target.value)}
                  multiline
                  rows={2}
                  variant="outlined"
                  size="small"
                  disabled={!settings.announcement_enabled}
                  helperText="Text shown in the announcement bar in English"
                />
                <TextField
                  fullWidth
                  label="Announcement Text (Arabic)"
                  value={settings.announcement_text_ar}
                  onChange={(e) => handleChange('announcement_text_ar', e.target.value)}
                  multiline
                  rows={2}
                  variant="outlined"
                  size="small"
                  disabled={!settings.announcement_enabled}
                  inputProps={{ dir: 'rtl' }}
                  helperText="Text shown in the announcement bar in Arabic"
                />
              </Stack>

              {/* Preview */}
              {settings.announcement_enabled && (
                <Paper
                  sx={{
                    mt: 2,
                    p: 1.5,
                    bgcolor: '#1a1a1a',
                    borderRadius: 1,
                    textAlign: 'center'
                  }}
                >
                  <Typography variant="caption" sx={{ color: '#fff', fontSize: '11px' }}>
                    Preview: {settings.announcement_text_en || '...'}
                  </Typography>
                </Paper>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* ===== Countdown Timer ===== */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  Countdown Timer
                </Typography>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.countdown_enabled}
                      onChange={(e) => handleChange('countdown_enabled', e.target.checked)}
                      color="primary"
                    />
                  }
                  label={settings.countdown_enabled ? 'Enabled' : 'Disabled'}
                  labelPlacement="start"
                />
              </Box>
              <Divider sx={{ mb: 2.5 }} />

              <Stack spacing={2}>
                <TextField
                  fullWidth
                  label="Offer End Date & Time"
                  type="datetime-local"
                  value={(() => {
                    if (!settings.countdown_target_date) return '';
                    const d = new Date(settings.countdown_target_date);
                    if (isNaN(d.getTime())) return '';
                    const year = d.getFullYear();
                    const month = String(d.getMonth() + 1).padStart(2, '0');
                    const day = String(d.getDate()).padStart(2, '0');
                    const hours = String(d.getHours()).padStart(2, '0');
                    const minutes = String(d.getMinutes()).padStart(2, '0');
                    return `${year}-${month}-${day}T${hours}:${minutes}`;
                  })()}
                  onChange={(e) => handleChange('countdown_target_date', e.target.value)}
                  variant="outlined"
                  size="small"
                  disabled={!settings.countdown_enabled}
                  InputLabelProps={{ shrink: true }}
                  helperText="Click the calendar/clock icon to choose date & time"
                />

                {/* Live preview */}
                {settings.countdown_enabled && settings.countdown_target_date && (
                  <Paper sx={{ p: 1.5, bgcolor: '#1a1a1a', borderRadius: 1 }}>
                    <Typography variant="caption" sx={{ color: '#aaa', display: 'block', mb: 0.5 }}>
                      Countdown Preview ({settings.countdown_target_date}):
                    </Typography>
                    {(() => {
                      const target = new Date(settings.countdown_target_date).getTime();
                      const now = Date.now();
                      const diff = Math.max(0, target - now);
                      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
                      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
                      const minutes = Math.floor((diff / (1000 * 60)) % 60);
                      const seconds = Math.floor((diff / 1000) % 60);

                      return (
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          {[
                            { label: 'Days', val: days },
                            { label: 'Hours', val: hours },
                            { label: 'Minutes', val: minutes },
                            { label: 'Seconds', val: seconds }
                          ].map((item) => (
                            <Box key={item.label} sx={{ textAlign: 'center', bgcolor: '#333', p: 0.5, borderRadius: 0.5, minWidth: 50 }}>
                              <Typography sx={{ color: '#fff', fontWeight: 700, fontSize: '14px' }}>
                                {String(item.val).padStart(2, '0')}
                              </Typography>
                              <Typography sx={{ color: '#aaa', fontSize: '9px' }}>{item.label}</Typography>
                            </Box>
                          ))}
                        </Box>
                      );
                    })()}
                  </Paper>
                )}
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* ===== Navigation Links ===== */}
        <Grid item xs={12}>
          <Card sx={{ boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  Navigation Links
                </Typography>
                <Tooltip title="Add new link">
                  <Button variant="outlined" size="small" startIcon={<AddIcon />} onClick={addNavLink}>
                    Add Link
                  </Button>
                </Tooltip>
              </Box>
              <Divider sx={{ mb: 2.5 }} />

              <Stack spacing={2}>
                {settings.nav_links.map((link, index) => (
                  <Paper key={index} elevation={0} sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <Chip label={`Link ${index + 1}`} size="small" color="primary" variant="outlined" />
                      <Box sx={{ flex: 1 }} />
                      <Tooltip title="Remove link">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => removeNavLink(index)}
                          disabled={settings.nav_links.length <= 1}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                    <Grid container spacing={1.5}>
                      <Grid item xs={12} sm={4}>
                        <TextField
                          fullWidth
                          label="Label (English)"
                          value={link.label_en}
                          onChange={(e) => handleNavLinkChange(index, 'label_en', e.target.value)}
                          size="small"
                          placeholder="e.g. Home"
                        />
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <TextField
                          fullWidth
                          label="Label (Arabic)"
                          value={link.label_ar}
                          onChange={(e) => handleNavLinkChange(index, 'label_ar', e.target.value)}
                          size="small"
                          placeholder="e.g. الرئيسية"
                          inputProps={{ dir: 'rtl' }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <TextField
                          fullWidth
                          label="URL"
                          value={link.url}
                          onChange={(e) => handleNavLinkChange(index, 'url', e.target.value)}
                          size="small"
                          placeholder="/collections"
                        />
                      </Grid>
                    </Grid>
                  </Paper>
                ))}
              </Stack>

              <Box sx={{ mt: 2, p: 1.5, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                <Typography variant="caption" color="textSecondary">
                  Changes to navigation links take effect after reloading the page.
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* ===== Action Buttons ===== */}
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
            <Button variant="outlined" startIcon={<RefreshIcon />} onClick={handleReset} disabled={saving} sx={{ px: 3 }}>
              Discard Changes
            </Button>
            <Button
              variant="contained"
              color="primary"
              startIcon={<SaveIcon />}
              onClick={handleSave}
              disabled={saving}
              sx={{ px: 4 }}
            >
              {saving ? 'Saving...' : 'Save Header Settings'}
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Container>
  );
};

export default HeaderSettingsPage;
