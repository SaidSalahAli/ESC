import React from 'react';
import { Box, Container, Typography, Button, Stack } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { FormattedMessage } from 'react-intl';
import { Link as RouterLink } from 'react-router';
import videoSrc from 'assets/vid/1.mp4';

function Hero() {
  const theme = useTheme();

  return (
    <Box
      component="section"
      sx={{
        position: 'relative',
        minHeight: { xs: '80vh', md: '100vh' },
        display: 'flex',
        alignItems: 'center',
        overflow: 'hidden'
      }}
    >
      {/* 🎥 Background Video */}
      <Box
        component="video"
        autoPlay
        loop
        muted
        playsInline
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          minWidth: '100%',
          minHeight: '100%',
          transform: 'translate(-50%, -50%)',
          objectFit: 'cover',
          zIndex: 0
        }}
      >
        <source src={videoSrc} type="video/mp4" />
      </Box>

      {/* 🌑 Overlay */}
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to right, rgba(11,18,19,0.6) 0%, rgba(11,18,19,0.3) 40%, rgba(11,18,19,0) 100%)',
          zIndex: 1
        }}
      />

      {/* 📦 Content */}
      <Container
        maxWidth="lg"
        sx={{
          position: 'relative',
          zIndex: 2,
          textAlign: 'center',
          py: { xs: 6, md: 10 }
        }}
      >
        <Box maxWidth={650} mx="auto" color="#fff">
          {/* Label */}
          <Typography
            className="hero-animate-1"
            sx={{
              fontSize: { xs: '0.85rem', md: '1rem' },
              fontWeight: 600,
              mb: 2,
              color: '#cbbfa4',
              textTransform: 'uppercase',
              letterSpacing: 1,
              textShadow: '2px 2px 8px rgba(0,0,0,0.8)'
            }}
          >
            <FormattedMessage id="new-collection-available" />
          </Typography>

          {/* Title */}
          <Typography
            variant="h1"
            className="hero-animate-2"
            sx={{
              fontWeight: 700,
              mb: 2,
              lineHeight: 1.2,
              fontSize: {
                xs: '2rem',
                sm: '2.5rem',
                md: '3.5rem'
              },
              textShadow: '2px 2px 8px rgba(0,0,0,0.8)'
            }}
          >
            <FormattedMessage id="hero-title" />
          </Typography>

          {/* Description */}
          <Typography
            className="hero-animate-3"
            sx={{
              mb: 2,
              lineHeight: 1.6,
              fontSize: {
                xs: '1rem',
                md: '1.2rem'
              },
              textShadow: '2px 2px 8px rgba(0,0,0,0.8)'
            }}
          >
            <FormattedMessage id="hero-description" />
          </Typography>
          <Box sx={{ mb: 3, display: 'flex', mx: 'auto', justifyContent: 'center', gap: 4 }}>
            <Typography sx={{ fontSize: '0.9rem', opacity: 0.9 }}>
              ✓ <FormattedMessage id="trust_realMovement" />
            </Typography>

            <Typography sx={{ fontSize: '0.9rem', opacity: 0.9 }}>
              ✓ <FormattedMessage id="trust_coverage" />
            </Typography>

            <Typography sx={{ fontSize: '0.9rem', opacity: 0.9 }}>
              ✓ <FormattedMessage id="trust_easyReturns" />
            </Typography>
          </Box>
          {/* Buttons */}
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center" className="hero-animate-4">
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
              <FormattedMessage id="shop-collection" /> →
            </Button>
          </Stack>
        </Box>
      </Container>
    </Box>
  );
}

export default Hero;
