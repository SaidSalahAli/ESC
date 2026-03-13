import React from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import useConfig from 'hooks/useConfig';
import { Box, Container, Typography, Stack, Card, CardContent, Divider } from '@mui/material';
import { Call, Send } from 'iconsax-react';
import './policy.css';
import img from 'assets/images/homepage/1.jpg';
export default function ReturnsPolicy() {
  const { i18n } = useConfig();
  const intl = useIntl();

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f5f5f5' }}>
      {/* Hero Section */}
      <Box
        sx={{
          bgcolor: '#000',
          color: '#fff',
          mt: 10,
          py: { xs: 6, md: 10 },
          textAlign: 'center',
          backgroundImage: `url(${img})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundAttachment: 'fixed'
        }}
      >
        <Container maxWidth="lg">
          <Typography variant="h3" sx={{ fontWeight: 700, mb: 2, fontSize: { xs: '1.8rem', md: '2.8rem' } }}>
            <FormattedMessage id="returns-policy-title" />
          </Typography>
          <Typography variant="h6" sx={{ color: '#bbb', fontWeight: 400 }}>
            <FormattedMessage id="returns-policy-subtitle" />
          </Typography>
        </Container>
      </Box>

      {/* Main Content */}
      <Container maxWidth="lg" sx={{ py: { xs: 4, md: 8 } }}>
        <Stack spacing={4}>
          {/* Introduction */}
          <Card sx={{ boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
            <CardContent sx={{ p: { xs: 3, md: 4 } }}>
              <Typography variant="body1" sx={{ lineHeight: 1.8, color: '#333', fontSize: { xs: '0.95rem', md: '1rem' } }}>
                <FormattedMessage id="returns-intro" />
              </Typography>
            </CardContent>
          </Card>

          {/* Exchanges Section */}
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 3, color: '#000', fontSize: { xs: '1.5rem', md: '2rem' } }}>
              <FormattedMessage id="exchanges-title" />
            </Typography>

            <Card sx={{ boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
              <CardContent sx={{ p: { xs: 3, md: 4 } }}>
                <Stack spacing={2}>
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Box sx={{ minWidth: 24, pt: 0.5 }}>
                      <Box
                        sx={{
                          width: 24,
                          height: 24,
                          bgcolor: '#e91e63',
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#fff',
                          fontSize: '14px',
                          fontWeight: 700
                        }}
                      >
                        ✓
                      </Box>
                    </Box>
                    <Typography sx={{ color: '#333', lineHeight: 1.8 }}>
                      <FormattedMessage id="exchanges-point-1" />
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Box sx={{ minWidth: 24, pt: 0.5 }}>
                      <Box
                        sx={{
                          width: 24,
                          height: 24,
                          bgcolor: '#e91e63',
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#fff',
                          fontSize: '14px',
                          fontWeight: 700
                        }}
                      >
                        ✓
                      </Box>
                    </Box>
                    <Typography sx={{ color: '#333', lineHeight: 1.8 }}>
                      <FormattedMessage id="exchanges-point-2" />
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Box sx={{ minWidth: 24, pt: 0.5 }}>
                      <Box
                        sx={{
                          width: 24,
                          height: 24,
                          bgcolor: '#e91e63',
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#fff',
                          fontSize: '14px',
                          fontWeight: 700
                        }}
                      >
                        ✓
                      </Box>
                    </Box>
                    <Typography sx={{ color: '#333', lineHeight: 1.8 }}>
                      <FormattedMessage id="exchanges-point-3" />
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Box sx={{ minWidth: 24, pt: 0.5 }}>
                      <Box
                        sx={{
                          width: 24,
                          height: 24,
                          bgcolor: '#e91e63',
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#fff',
                          fontSize: '14px',
                          fontWeight: 700
                        }}
                      >
                        ✓
                      </Box>
                    </Box>
                    <Typography sx={{ color: '#333', lineHeight: 1.8 }}>
                      <FormattedMessage id="exchanges-point-4" />
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Box>

          {/* Refunds Section */}
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 3, color: '#000', fontSize: { xs: '1.5rem', md: '2rem' } }}>
              <FormattedMessage id="refunds-title" />
            </Typography>

            <Card sx={{ boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
              <CardContent sx={{ p: { xs: 3, md: 4 } }}>
                <Typography sx={{ mb: 2, fontWeight: 600, color: '#333' }}>
                  <FormattedMessage id="refunds-subtitle" />
                </Typography>

                <Stack spacing={2} sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Box sx={{ minWidth: 24, pt: 0.5 }}>
                      <Box
                        sx={{
                          width: 24,
                          height: 24,
                          bgcolor: '#e91e63',
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#fff',
                          fontSize: '14px',
                          fontWeight: 700
                        }}
                      >
                        ✓
                      </Box>
                    </Box>
                    <Typography sx={{ color: '#333', lineHeight: 1.8 }}>
                      <FormattedMessage id="refunds-point-1" />
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Box sx={{ minWidth: 24, pt: 0.5 }}>
                      <Box
                        sx={{
                          width: 24,
                          height: 24,
                          bgcolor: '#e91e63',
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#fff',
                          fontSize: '14px',
                          fontWeight: 700
                        }}
                      >
                        ✓
                      </Box>
                    </Box>
                    <Typography sx={{ color: '#333', lineHeight: 1.8 }}>
                      <FormattedMessage id="refunds-point-2" />
                    </Typography>
                  </Box>
                </Stack>

                <Divider sx={{ my: 2 }} />

                <Stack spacing={1.5}>
                  <Typography sx={{ color: '#666', lineHeight: 1.8 }}>
                    <strong>
                      <FormattedMessage id="refunds-point-3" />
                    </strong>
                  </Typography>
                  <Typography sx={{ color: '#666', lineHeight: 1.8 }}>
                    <FormattedMessage id="refunds-point-4" />
                  </Typography>
                </Stack>
              </CardContent>
            </Card>
          </Box>

          {/* Non-Returnable Items */}
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 3, color: '#000', fontSize: { xs: '1.5rem', md: '2rem' } }}>
              <FormattedMessage id="non-returnable-title" />
            </Typography>

            <Card sx={{ boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
              <CardContent sx={{ p: { xs: 3, md: 4 } }}>
                <Typography sx={{ mb: 2, fontWeight: 600, color: '#333' }}>
                  <FormattedMessage id="non-returnable-subtitle" />
                </Typography>

                <Stack spacing={2}>
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Box sx={{ minWidth: 24, pt: 0.5 }}>
                      <Box
                        sx={{
                          width: 24,
                          height: 24,
                          bgcolor: '#d32f2f',
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#fff',
                          fontSize: '14px',
                          fontWeight: 700
                        }}
                      >
                        ✗
                      </Box>
                    </Box>
                    <Typography sx={{ color: '#333', lineHeight: 1.8 }}>
                      <FormattedMessage id="non-returnable-point-1" />
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Box sx={{ minWidth: 24, pt: 0.5 }}>
                      <Box
                        sx={{
                          width: 24,
                          height: 24,
                          bgcolor: '#d32f2f',
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#fff',
                          fontSize: '14px',
                          fontWeight: 700
                        }}
                      >
                        ✗
                      </Box>
                    </Box>
                    <Typography sx={{ color: '#333', lineHeight: 1.8 }}>
                      <FormattedMessage id="non-returnable-point-2" />
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Box sx={{ minWidth: 24, pt: 0.5 }}>
                      <Box
                        sx={{
                          width: 24,
                          height: 24,
                          bgcolor: '#d32f2f',
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#fff',
                          fontSize: '14px',
                          fontWeight: 700
                        }}
                      >
                        ✗
                      </Box>
                    </Box>
                    <Typography sx={{ color: '#333', lineHeight: 1.8 }}>
                      <FormattedMessage id="non-returnable-point-3" />
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Box>

          {/* Contact Section */}
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 3, color: '#000', fontSize: { xs: '1.5rem', md: '2rem' } }}>
              <FormattedMessage id="need-assistance" />
            </Typography>

            <Card sx={{ boxShadow: '0 2px 8px rgba(0,0,0,0.1)', bgcolor: '#fafafa' }}>
              <CardContent sx={{ p: { xs: 3, md: 4 } }}>
                <Typography sx={{ mb: 3, color: '#666' }}>
                  <FormattedMessage id="assistance-intro" />
                </Typography>

                <Stack spacing={2.5}>
                  {/* Order Number */}
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Box sx={{ color: '#e91e63', pt: 0.5 }}></Box>
                    <Box>
                      <Typography sx={{ fontWeight: 600, color: '#333', mb: 0.5 }}>
                        <FormattedMessage id="your-order-number" />
                      </Typography>
                      <Typography sx={{ color: '#666', fontSize: '0.9rem' }}>
                        <FormattedMessage id="order-number-info" />
                      </Typography>
                    </Box>
                  </Box>

                  {/* Photos */}
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Box sx={{ color: '#e91e63', pt: 0.5 }}></Box>
                    <Box>
                      <Typography sx={{ fontWeight: 600, color: '#333', mb: 0.5 }}>
                        <FormattedMessage id="clear-photos" />
                      </Typography>
                      <Typography sx={{ color: '#666', fontSize: '0.9rem' }}>
                        <FormattedMessage id="photos-info" />
                      </Typography>
                    </Box>
                  </Box>

                  {/* Explanation */}
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Box sx={{ color: '#e91e63', pt: 0.5 }}></Box>
                    <Box>
                      <Typography sx={{ fontWeight: 600, color: '#333', mb: 0.5 }}>
                        <FormattedMessage id="brief-explanation" />
                      </Typography>
                      <Typography sx={{ color: '#666', fontSize: '0.9rem' }}>
                        <FormattedMessage id="explanation-info" />
                      </Typography>
                    </Box>
                  </Box>

                  <Divider sx={{ my: 1 }} />
                </Stack>
              </CardContent>
            </Card>
          </Box>
        </Stack>
      </Container>
    </Box>
  );
}
