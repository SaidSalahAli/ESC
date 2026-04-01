import React, { useEffect, useState } from 'react';
import { Box, Container, Typography, Button, Stack } from '@mui/material';
import { FormattedMessage } from 'react-intl';
import { Link as RouterLink } from 'react-router';
import { useLazyVideo } from 'hooks/useLazyVideo';
import videoSrc from 'assets/vid/1.mp4';

function Hero() {
  const { videoRef, isVisible } = useLazyVideo({
    threshold: 0.12,
    rootMargin: '140px'
  });

  const [videoLoaded, setVideoLoaded] = useState(false);
  const [contentVisible, setContentVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setContentVisible(true), 120);
    return () => clearTimeout(timer);
  }, []);

  return (
    <Box
      component="section"
      sx={{
        position: 'relative',
        minHeight: { xs: '88vh', md: '100vh' },
        display: 'flex',
        alignItems: 'center',
        overflow: 'hidden',
        backgroundColor: '#0b1213'
      }}
    >
      {/* Background Layer */}
      <Box
        ref={videoRef}
        sx={{
          position: 'absolute',
          inset: 0,
          zIndex: 0,
          background: `
      linear-gradient(
165deg, rgba(7, 12, 14, 0.88) 0%, rgba(7, 12, 14, 0.70) 34%, rgba(7, 12, 14, 0.28) 62%, rgba(7, 12, 14, 0.08) 100%), linear-gradient(180deg, rgba(7, 12, 14, 0.18) 0%, rgba(7, 12, 14, 0.08) 36%, rgba(7, 12, 14, 0.56) 100%)
          `
        }}
      >
        {isVisible && (
          <Box
            component="video"
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            onCanPlay={() => setVideoLoaded(true)}
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              width: '100%',
              height: '100%',
              minWidth: '100%',
              minHeight: '100%',
              objectFit: 'cover',
              transform: videoLoaded ? 'translate(-50%, -50%) scale(1.04)' : 'translate(-50%, -50%) scale(1)',
              opacity: videoLoaded ? 1 : 0,
              transition: 'opacity 0.9s ease, transform 3s ease'
            }}
          >
            <source src={videoSrc} type="video/mp4" />
          </Box>
        )}
      </Box>

      {/* Strong overlay */}
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          zIndex: 1,
          background: `
            linear-gradient(90deg, rgba(7,12,14,0.88) 0%, rgba(7,12,14,0.70) 34%, rgba(7,12,14,0.28) 62%, rgba(7,12,14,0.08) 100%),
            linear-gradient(180deg, rgba(7,12,14,0.18) 0%, rgba(7,12,14,0.08) 36%, rgba(7,12,14,0.56) 100%)
          `
        }}
      />

      {/* Soft bottom fade */}
      <Box
        sx={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          height: '24%',
          zIndex: 1,
          pointerEvents: 'none',
          background: 'linear-gradient(to top, rgba(11,18,19,0.92), rgba(11,18,19,0))'
        }}
      />

      {/* Subtle side accent */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          bottom: 0,
          left: 0,
          width: { xs: 0, md: '38%' },
          zIndex: 1,
          pointerEvents: 'none',
          background: 'linear-gradient(90deg, rgba(255,255,255,0.04), rgba(255,255,255,0))'
        }}
      />

      {/* Content */}
      <Container
        maxWidth="lg"
        sx={{
          position: 'relative',
          zIndex: 2,
          py: { xs: 8, md: 10 }
        }}
      >
        <Box
          sx={{
            maxWidth: { xs: '100%', md: 760 },
            mx: { xs: 'auto', md: 0 },
            textAlign: { xs: 'center', md: 'left' },
            color: '#fff',
            opacity: contentVisible ? 1 : 0,
            transform: contentVisible ? 'translateY(0)' : 'translateY(26px)',
            transition: 'opacity 0.85s ease, transform 0.85s ease'
          }}
        >
          {/* Eyebrow */}
          <Typography
            sx={{
              mb: 2,
              fontSize: { xs: '0.76rem', md: '0.9rem' },
              fontWeight: 700,
              color: '#d9c59b',
              textTransform: 'uppercase',
              letterSpacing: '0.28em',
              textShadow: '0 2px 14px rgba(0,0,0,0.35)'
            }}
          >
            <FormattedMessage id="new-collection-available" />
          </Typography>

          {/* Main title */}
          <Typography
            variant="h1"
            sx={{
              mb: 2.2,
              fontWeight: 800,
              lineHeight: 1.02,
              letterSpacing: '-0.04em',
              fontSize: {
                xs: '2.3rem',
                sm: '3rem',
                md: '4.3rem',
                lg: '5rem'
              },
              textShadow: '0 10px 30px rgba(0,0,0,0.30)'
            }}
          >
            <FormattedMessage id="hero-title" />
          </Typography>

          {/* Description */}
          <Typography
            sx={{
              mb: 3.5,
              maxWidth: { xs: '100%', md: 560 },
              mx: { xs: 'auto', md: 0 },
              color: 'rgba(255,255,255,0.88)',
              lineHeight: 1.75,
              fontSize: {
                xs: '1rem',
                md: '1.1rem'
              },
              textShadow: '0 4px 16px rgba(0,0,0,0.25)'
            }}
          >
            <FormattedMessage id="hero-description" />
          </Typography>

          {/* Trust strip */}
          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: { xs: 'center', md: 'flex-start' },
              gap: 1.25,
              mb: 4
            }}
          >
            {['trust_realMovement', 'trust_coverage', 'trust_easyReturns'].map((id) => (
              <Box
                key={id}
                sx={{
                  px: 1.6,
                  py: 1,
                  border: '1px solid rgba(255,255,255,0.12)',
                  background: 'rgba(255,255,255,0.06)',
                  backdropFilter: 'blur(6px)',
                  color: 'rgba(255,255,255,0.92)',
                  fontSize: '0.88rem',
                  fontWeight: 500,
                  lineHeight: 1,
                  whiteSpace: 'nowrap'
                }}
              >
                ✓ <FormattedMessage id={id} />
              </Box>
            ))}
          </Box>

          {/* CTAs */}
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent={{ xs: 'center', md: 'flex-start' }}>
            <Button
              component={RouterLink}
              to="/collections"
              variant="contained"
              size="large"
              sx={{
                minWidth: 190,
                px: 4.5,
                py: 1.45,
                borderRadius: 0,
                fontWeight: 700,
                fontSize: '0.98rem',
                background: '#ffffff',
                color: '#0b1213',
                boxShadow: '0 16px 36px rgba(0,0,0,0.22)',
                '&:hover': {
                  background: '#f3f3f3',
                  transform: 'translateY(-1px)'
                },
                transition: 'all 0.25s ease'
              }}
            >
              <FormattedMessage id="shop-collection" />
            </Button>

            <Button
              component={RouterLink}
              to="/about"
              variant="outlined"
              size="large"
              sx={{
                minWidth: 170,
                px: 4.5,
                py: 1.45,
                borderRadius: 0,
                fontWeight: 600,
                color: '#fff',
                borderColor: 'rgba(255,255,255,0.26)',
                background: 'rgba(255,255,255,0.04)',
                '&:hover': {
                  borderColor: 'rgba(255,255,255,0.42)',
                  background: 'rgba(255,255,255,0.08)'
                }
              }}
            >
              <FormattedMessage id="learn-more" defaultMessage="Learn More" />
            </Button>
          </Stack>
        </Box>
      </Container>

      {/* Scroll cue */}
      <Box
        sx={{
          position: 'absolute',
          bottom: 24,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 3,
          display: { xs: 'none', md: 'flex' },
          flexDirection: 'column',
          alignItems: 'center',
          color: 'rgba(255,255,255,0.72)'
        }}
      >
        <Typography
          sx={{
            mb: 1,
            fontSize: '0.72rem',
            textTransform: 'uppercase',
            letterSpacing: '0.22em'
          }}
        >
          Scroll
        </Typography>

        <Box
          sx={{
            width: 22,
            height: 38,
            border: '1px solid rgba(255,255,255,0.34)',
            borderRadius: '20px',
            display: 'flex',
            justifyContent: 'center',
            pt: 0.8
          }}
        >
          <Box
            sx={{
              width: 4,
              height: 8,
              borderRadius: 999,
              background: 'rgba(255,255,255,0.85)',
              animation: 'heroDot 1.8s infinite'
            }}
          />
        </Box>
      </Box>

      <Box
        sx={{
          '@keyframes heroDot': {
            '0%': { opacity: 0, transform: 'translateY(0)' },
            '30%': { opacity: 1, transform: 'translateY(0)' },
            '100%': { opacity: 0, transform: 'translateY(12px)' }
          }
        }}
      />
    </Box>
  );
}

export default Hero;
