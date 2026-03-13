import { Box } from '@mui/material';
import React, { useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import img4 from 'assets/images/homepage/5.jpg';
import { newsletterService } from 'api/newsletter';

function Newsletter() {
  const intl = useIntl();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const submitHandler = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    const emailInput = e.target.elements['email'];
    const email = emailInput.value.trim();

    try {
      const response = await newsletterService.subscribe(email);

      if (response.success || response.message) {
        setMessage(intl.formatMessage({ id: 'thank-you-subscribing' }));
        emailInput.value = ''; // Clear input

        // Clear message after 5 seconds
        setTimeout(() => setMessage(''), 5000);
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || intl.formatMessage({ id: 'subscription-failed' });
      setError(errorMsg);

      // Clear error after 5 seconds
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
          background: 'rgba(0,0,0,0.5)',
          zIndex: 1
        }
      }}
    >
      <Box sx={{ position: 'relative', zIndex: 2 }}>
        <div className="newsletter-content">
          <h2 className="newsletter-title">
            <FormattedMessage id="join-our-community" />
          </h2>

          <p className="newsletter-description">
            <FormattedMessage id="newsletter-description" />
          </p>

          {message && <div style={{ color: '#4caf50', marginBottom: '10px', textAlign: 'center' }}>{message}</div>}

          {error && <div style={{ color: '#f44336', marginBottom: '10px', textAlign: 'center' }}>{error}</div>}

          <form className="newsletter-form" onSubmit={submitHandler}>
            <input
              type="email"
              name="email"
              className="email-input"
              placeholder={intl.formatMessage({ id: 'enter-your-email' })}
              required
              disabled={loading}
            />
            <button type="submit" className="subscribe-btn" disabled={loading}>
              <FormattedMessage id="Join" />
            </button>
          </form>
        </div>
      </Box>
    </Box>
  );
}

export default Newsletter;
