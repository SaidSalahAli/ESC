import PropTypes from 'prop-types';

// material-ui
import { styled } from '@mui/material/styles';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid2';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { Link as RouterLink } from 'react-router-dom';
import tiktokIcon from 'assets/images/homepage/tiktok_icon.svg';
// third-party
import { motion } from 'framer-motion';
import { FormattedMessage } from 'react-intl';

// project-imports
import Logo from 'components/logo';
import useConfig from 'hooks/useConfig';

// icons
import { Instagram, Facebook, MusicPlay, Whatsapp } from 'iconsax-react';

// ==============================|| CUSTOM LINK STYLE ||============================== //

const FooterLink = styled(Link)(({ theme }) => ({
  color: theme.palette.text.primary,
  '&:hover, &:active': {
    color: theme.palette.primary.main
  }
}));

// ==============================|| FOOTER ||============================== //

export default function FooterBlock({ isFull }) {
  const linkSX = {
    color: 'text.secondary',
    fontWeight: 400,
    opacity: '0.6',
    cursor: 'pointer',
    '&:hover': { opacity: '1' }
  };

  const { i18n } = useConfig();

  return (
    <>
      <Box sx={{ pt: isFull ? 5 : 10, pb: 10, bgcolor: 'secondary.200', borderColor: 'divider' }}>
        <Container>
          <Grid container spacing={2}>
            {/* LOGO + DESCRIPTION */}
            <Grid size={{ xs: 12, md: 4 }}>
              <motion.div
                initial={{ opacity: 0, translateY: 550 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{ type: 'spring', stiffness: 150, damping: 30 }}
              >
                <Grid container spacing={2}>
                  <Grid size={12}>
                    <Logo to="/" />
                  </Grid>

                  <Grid size={12}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 400, maxWidth: 320 }}>
                      <FormattedMessage id="footer-description" />
                    </Typography>
                  </Grid>
                </Grid>
              </motion.div>
            </Grid>

            {/* LINKS */}
            <Grid size={{ xs: 12, md: 8 }}>
              <Grid container spacing={{ xs: 5, md: 2 }}>
                {/* NAVIGATION */}
                <Grid size={{ xs: 6, sm: 4 }}>
                  <Stack sx={{ gap: 3 }}>
                    <Typography variant="h5">
                      <FormattedMessage id="navigation" />
                    </Typography>

                    <Stack sx={{ gap: { xs: 1.5, md: 2.5 } }}>
                      <FooterLink component={RouterLink} to="/" underline="none">
                        <FormattedMessage id="home" />
                      </FooterLink>

                      <FooterLink component={RouterLink} to="/collections" underline="none">
                        <FormattedMessage id="collections" />
                      </FooterLink>

                      <FooterLink component={RouterLink} to="/contact" underline="none">
                        <FormattedMessage id="contact" />
                      </FooterLink>
                    </Stack>
                  </Stack>
                </Grid>

                {/* SUPPORT */}
                <Grid size={{ xs: 6, sm: 4 }}>
           
                  <Stack sx={{ gap: 3 }}>
                    <Stack sx={{ gap: { xs: 1.5, md: 2.5 } }}>                  
                      <FooterLink component={RouterLink} to="/about" underline="none">
                        <FormattedMessage id="our-story" />
                      </FooterLink>
                      <FooterLink component={RouterLink} to="/returns-policy" underline="none">
                        <FormattedMessage id="returns-policy" />
                      </FooterLink>
                    </Stack>
                  </Stack>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* COPYRIGHT + SOCIAL */}
      <Box sx={{ py: 2.4, borderTop: '1px solid', borderColor: 'divider', bgcolor: 'secondary.200' }}>
        <Container>
          <Grid container spacing={2} sx={{ alignItems: 'center' }}>
            <Grid size={{ xs: 12, sm: 8 }}>
              <Typography>
                © {new Date().getFullYear()} ESC Wear. <FormattedMessage id="all-rights-reserved" />
              </Typography>
            </Grid>

            <Grid size={{ xs: 12, sm: 4 }}>
              <Grid container spacing={2} sx={{ alignItems: 'center', justifyContent: 'flex-end' }}>
                {/* Instagram */}
                <Grid>
                  <Tooltip title="Instagram">
                    <Link href="https://www.instagram.com/esc.wear_" underline="none" target="_blank" sx={linkSX}>
                      <Instagram size={20} variant="Bold" />
                    </Link>
                  </Tooltip>
                </Grid>

                {/* TikTok */}
                <Grid>
                  <Tooltip title="TikTok">
                    <Link href="https://www.tiktok.com/@esc.wear_" sx={linkSX}>
                      <img src={tiktokIcon} alt="TikTok" style={{ width: 20, height: 20 }} />
                    </Link>
                  </Tooltip>
                </Grid>

                {/* Facebook */}
                <Grid>
                  <Tooltip title="Facebook">
                    <Link href="https://www.facebook.com/share/1G7ZvnUBzP/?mibextid=wwXIfr" underline="none" target="_blank" sx={linkSX}>
                      <Facebook size={20} variant="Bold" />
                    </Link>
                  </Tooltip>
                </Grid>

                {/* WhatsApp */}
                <Grid>
                  <Tooltip title="WhatsApp">
                    <Link href="https://wa.me/201022123004" underline="none" target="_blank" sx={linkSX}>
                      <Whatsapp size={20} variant="Bold" />
                    </Link>
                  </Tooltip>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </>
  );
}

FooterBlock.propTypes = { isFull: PropTypes.bool };
