import { Box, Typography, Button, Stack } from '@mui/material';
import React from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { Link as RouterLink } from 'react-router';
import img4 from 'assets/images/homepage/5.jpg';

function StorySection() {
  const intl = useIntl();

  const submitHandler = (e) => {
    e.preventDefault();
    alert(intl.formatMessage({ id: 'thank-you-subscribing' }));
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
        py: 5,
        px: 2,
        overflow: 'hidden',
        my: 8,
        textAlign: 'center',
        '&::before': {
          content: '""',
          position: 'absolute',
          inset: 0,
          background: 'rgba(0,0,0,0.5)',
          zIndex: 1
        }
      }}
    >
      <Box sx={{ position: 'relative', zIndex: 2, maxWidth: 800, mx: 'auto' }}>
        {/* Story Title */}
        <Typography
          sx={{
            fontStyle: 50,
            lineHeight: 1.6,
            fontSize: {
              xs: '1rem',
              md: '1.9rem'
            },
            textShadow: '2px 2px 8px rgba(0,0,0,0.8)'
          }}
        >
          <FormattedMessage id="story_title" />
        </Typography>

        {/* Story Text */}
        <Typography fontSize={16} sx={{ mb: 2 }}>
          <FormattedMessage id="story_line1" />
        </Typography>

        <Typography fontSize={16} sx={{ mb: 2 }}>
          <FormattedMessage id="story_line2" />
        </Typography>

        <Typography fontSize={16} sx={{ mb: 4 }}>
          <FormattedMessage id="story_line3" />
        </Typography>

        <Button
          component={RouterLink}
          to="/collections"
          variant="contained"
          size="large"
          sx={{
            px: 4,
            background: '#0b1213',
            borderRadius: 0
          }}
        >
          <FormattedMessage id="story_cta" />
        </Button>
      </Box>
    </Box>
  );
}

export default StorySection;
