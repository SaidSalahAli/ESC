import { Box, Typography, TextField, Button, Alert, CircularProgress, Stack } from '@mui/material';
import React, { useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import img4 from 'assets/images/homepage/5.jpg';
import { newsletterService } from 'api/newsletter';

function Newsletter() {
  const intl = useIntl();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const submitHandler = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    try {
      const response = await newsletterService.subscribe(email.trim());

      if (response.success || response.message) {
        setMessage(intl.formatMessage({ id: 'thank-you-subscribing' }));
        setEmail('');
        setTimeout(() => setMessage(''), 5000);
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || intl.formatMessage({ id: 'subscription-failed' });
      setError(errorMsg);
      setTimeout(() => setError(''), 5000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        position: 'relative',
        backgroundImage: `url(${img4})`,
        backgroundPosition: 'center',
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed',
        color: 'white',
        py: 12,
        px: 2,
        overflow: 'hidden',
        my: 8,
        '&::before': {
          content: '""',
          position: 'absolute',
          inset: 0,
          background: 'rgba(0,0,0,0.55)',
          zIndex: 1
        }
      }}
    >
      {/* Content */}
      <Stack alignItems="center" spacing={3} sx={{ position: 'relative', zIndex: 2 }}>
        {/* Title */}
        <Typography variant="h1" fontWeight={700} textAlign="center" sx={{ color: 'white' }}>
          <FormattedMessage id="join-our-community" />
        </Typography>

        {/* Description */}
        <Typography variant="body1" textAlign="center" sx={{ color: 'rgba(255,255,255,0.8)', maxWidth: 500 }}>
          <FormattedMessage id="newsletter-description" />
        </Typography>

        {/* Alerts */}
        {message && (
          <Alert severity="success" sx={{ width: '100%', maxWidth: 500 }}>
            {message}
          </Alert>
        )}
        {error && (
          <Alert severity="error" sx={{ width: '100%', maxWidth: 500 }}>
            {error}
          </Alert>
        )}

        {/* Form */}
        <Stack
          component="form"
          onSubmit={submitHandler}
          direction={{ xs: 'column', sm: 'row' }}
          spacing={1.5}
          sx={{ width: '100%', maxWidth: 500 }}
        >
          <TextField
            type="email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={intl.formatMessage({ id: 'enter-your-email' })}
            required
            disabled={loading}
            fullWidth
            variant="outlined"
            size="medium"
            sx={{
              '& .MuiOutlinedInput-root': {
                bgcolor: 'rgba(255,255,255,0.1)',
                color: 'white',
                borderRadius: 0,
                '& fieldset': { borderColor: 'rgba(255,255,255,0.4)' },
                '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.7)' },
                '&.Mui-focused fieldset': { borderColor: 'white' }
              },
              '& input::placeholder': { color: 'rgba(255,255,255,0.5)' }
            }}
          />

          <Button
            type="submit"
            variant="contained"
            disabled={loading}
            sx={{
              bgcolor: 'white',
              color: 'black',
              px: 4,
              borderRadius: 0,
              whiteSpace: 'nowrap',
              minWidth: { sm: 120 },
              '&:hover': { bgcolor: 'rgba(255,255,255,0.9)' }
            }}
            startIcon={loading ? <CircularProgress size={16} color="inherit" /> : null}
          >
            <FormattedMessage id="Join" />
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
}

export default Newsletter;
