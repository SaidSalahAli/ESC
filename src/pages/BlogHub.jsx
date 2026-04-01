import React, { useEffect } from 'react';
import { generatePageMeta } from 'utils/generateSEOMeta';
import { Box, Container, Typography, Grid, Card, CardContent, Button, Divider } from '@mui/material';
import { ArrowRight } from '@mui/icons-material';
import { Link } from 'react-router-dom';

/**
 * Blog Hub / Article Index Page
 * Central hub for all blog content - helps with blog SEO
 */
export default function BlogHub() {
  useEffect(() => {
    generatePageMeta({
      title: 'Blog | Modest Sportswear Tips & Trends - ESC Wear',
      description:
        'Read expert tips, style guides, and trends about modest activewear. Learn how to choose the right sportswear for your lifestyle.',
      canonical: 'https://escwear.com/blog',
      keywords: 'modest sportswear blog, activewear tips, gym wear guide, fashion trends'
    });
  }, []);

  const featuredArticles = [
    {
      title: 'Best Modest Gym Outfits in Egypt - Complete Guide',
      slug: 'best-modest-gym-outfits-egypt',
      excerpt:
        'Discover the perfect combinations of modest gym wear for your workouts. Learn how to layer, match, and style your activewear.',
      date: 'March 2026',
      readTime: '5 min read'
    },
    {
      title: 'How to Choose Modest Sportswear - A Complete Guide',
      slug: 'choose-modest-sportswear-guide',
      excerpt: 'Find the perfect modest activewear for your needs. Learn about fit, fabric, and quality indicators.',
      date: 'March 2026',
      readTime: '6 min read'
    },
    {
      title: 'Why Modest Activewear is Trending in 2024',
      slug: 'modest-activewear-trending',
      excerpt: 'Explore the growing trend of modest sportswear and why more women are choosing full-coverage athletic wear.',
      date: 'March 2026',
      readTime: '5 min read'
    }
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      {/* Page Header */}
      <Box sx={{ mb: 8, textAlign: 'center' }}>
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
          ESC Wear Blog
        </Typography>
        <Typography
          variant="subtitle1"
          sx={{
            fontSize: '1.1rem',
            color: 'text.secondary',
            maxWidth: 600,
            mx: 'auto'
          }}
        >
          Tips, guides, and trends for modest sportswear and active lifestyle
        </Typography>
      </Box>

      {/* Featured Articles */}
      <Box sx={{ mb: 8 }}>
        <Typography variant="h2" sx={{ fontSize: '1.8rem', mb: 4, fontWeight: 600 }}>
          Featured Articles
        </Typography>
        <Grid container spacing={4}>
          {featuredArticles.map((article, idx) => (
            <Grid item xs={12} md={4} key={idx}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', '&:hover': { boxShadow: 4 } }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h5" sx={{ mb: 1, fontWeight: 600 }}>
                    {article.title}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 2 }}>
                    {article.date} • {article.readTime}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
                    {article.excerpt}
                  </Typography>
                </CardContent>
                <Divider />
                <Box sx={{ p: 2 }}>
                  <Button component={Link} to={`/blog/${article.slug}`} endIcon={<ArrowRight />} sx={{ textTransform: 'none' }}>
                    Read Article
                  </Button>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* SEO Content Section */}
      <Box sx={{ my: 8, p: 4, bgcolor: 'background.light', borderRadius: 2 }}>
        <Typography variant="h2" sx={{ fontSize: '1.5rem', mb: 2, fontWeight: 600 }}>
          Welcome to the ESC Wear Blog
        </Typography>
        <Typography variant="body1" sx={{ lineHeight: 1.8, color: 'text.secondary', mb: 2 }}>
          We believe that being active and maintaining a modest lifestyle shouldn't mean compromising on comfort or style. Our blog is
          dedicated to helping you find the perfect modest sportswear, learn styling tips, and stay updated on the latest trends in
          activewear.
        </Typography>
        <Typography variant="body1" sx={{ lineHeight: 1.8, color: 'text.secondary' }}>
          Whether you're looking for advice on choosing the right gym wear, want to learn about different fabric types, or need inspiration
          for your next workout outfit, you'll find expert guides and tips here.
        </Typography>
      </Box>

      {/* Categories */}
      <Box sx={{ mb: 8 }}>
        <Typography variant="h2" sx={{ fontSize: '1.5rem', mb: 4, fontWeight: 600 }}>
          Browse by Category
        </Typography>
        <Grid container spacing={2}>
          {['Gym Wear', 'Activewear Trends', 'Style Guides', 'Fitness Tips', 'Product Reviews'].map((cat, idx) => (
            <Grid item xs={12} sm={6} md="auto" key={idx}>
              <Button
                variant="outlined"
                sx={{
                  textTransform: 'none',
                  py: 1.5,
                  px: 3,
                  width: '100%'
                }}
              >
                {cat}
              </Button>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Container>
  );
}
