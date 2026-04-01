import React from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import { ExpandMore, CheckCircle } from '@mui/icons-material';
import { seoPages } from 'utils/seoPages';
import SEOMeta from 'components/SEOMeta';

/**
 * Generic SEO Landing Page Component
 * Renders landing pages with optimized structure for SEO
 */
export default function SEOLandingPage({ pageKey = 'modestGymWear' }) {
  const page = seoPages[pageKey];

  if (!page) {
    return <Typography color="error">Page not found</Typography>;
  }

  return (
    <SEOMeta
      title={page.title}
      description={page.description}
      canonical={`https://escwear.com${page.path}`}
      keywords={page.keywords.join(', ')}
      ogImage="https://escwear.com/assets/ESC-Icon-Black-Trans.png"
    >
      <Container maxWidth="lg" sx={{ py: 6 }}>
        {/* H1 - Main Heading */}
        <Typography
          variant="h1"
          component="h1"
          sx={{
            fontSize: { xs: '2rem', md: '3rem' },
            fontWeight: 700,
            mb: 2,
            color: 'primary.main'
          }}
        >
          {page.h1}
        </Typography>

        {/* Render sections */}
        {page.sections?.map((section, idx) => {
          switch (section.type) {
            case 'hero':
              return (
                <Box key={idx} sx={{ mb: 6, py: 4, bgcolor: 'background.light', borderRadius: 2, p: 4 }}>
                  <Typography variant="h2" sx={{ fontSize: { xs: '1.5rem', md: '2rem' }, mb: 2 }}>
                    {section.title}
                  </Typography>
                  <Typography variant="body1" sx={{ fontSize: '1.1rem', color: 'text.secondary', mb: 3 }}>
                    {section.subtitle}
                  </Typography>
                </Box>
              );

            case 'features':
              return (
                <Box key={idx} sx={{ mb: 6 }}>
                  <Typography variant="h2" sx={{ fontSize: '1.8rem', mb: 4, fontWeight: 600 }}>
                    Why Choose Our Modest Sportswear?
                  </Typography>
                  <Grid container spacing={3}>
                    {section.items?.map((item, i) => (
                      <Grid item xs={12} sm={6} md={3} key={i}>
                        <Card sx={{ height: '100%', textAlign: 'center', p: 3 }}>
                          <CheckCircle sx={{ fontSize: 40, color: 'success.main', mb: 2 }} />
                          <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                            {item.title}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {item.description}
                          </Typography>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              );

            case 'benefits':
              return (
                <Box key={idx} sx={{ mb: 6 }}>
                  <Typography variant="h2" sx={{ fontSize: '1.8rem', mb: 4, fontWeight: 600 }}>
                    {section.title}
                  </Typography>
                  <List sx={{ bgcolor: 'background.paper', borderRadius: 1 }}>
                    {section.items?.map((item, i) => (
                      <ListItem key={i} sx={{ py: 2 }}>
                        <ListItemIcon>
                          <CheckCircle sx={{ color: 'success.main' }} />
                        </ListItemIcon>
                        <ListItemText primary={item} />
                      </ListItem>
                    ))}
                  </List>
                </Box>
              );

            case 'faq':
              return (
                <Box key={idx} sx={{ mb: 6 }}>
                  <Typography variant="h2" sx={{ fontSize: '1.8rem', mb: 4, fontWeight: 600 }}>
                    Frequently Asked Questions
                  </Typography>
                  {section.items?.map((item, i) => (
                    <Accordion key={i} sx={{ mb: 1 }}>
                      <AccordionSummary expandIcon={<ExpandMore />}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                          {item.q}
                        </Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Typography variant="body2" color="text.secondary">
                          {item.a}
                        </Typography>
                      </AccordionDetails>
                    </Accordion>
                  ))}
                </Box>
              );

            case 'content':
              return (
                <Box key={idx} sx={{ mb: 6 }}>
                  <Typography variant="h2" sx={{ fontSize: '1.8rem', mb: 2, fontWeight: 600 }}>
                    {section.title}
                  </Typography>
                  <Typography variant="body1" sx={{ lineHeight: 1.8, color: 'text.secondary' }}>
                    {section.body}
                  </Typography>
                </Box>
              );

            default:
              return null;
          }
        })}

        {/* Call to Action */}
        <Box sx={{ mt: 8, p: 4, bgcolor: 'primary.main', color: 'white', borderRadius: 2, textAlign: 'center' }}>
          <Typography variant="h2" sx={{ fontSize: '1.8rem', mb: 2, fontWeight: 600 }}>
            Ready to Shop?
          </Typography>
          <Typography variant="body1" sx={{ fontSize: '1.1rem', mb: 3 }}>
            Explore our complete collection of premium modest sportswear. Free delivery across Egypt.
          </Typography>
        </Box>
      </Container>
    </SEOMeta>
  );
}
