import React from 'react';
import { Box, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { FormattedMessage } from 'react-intl';

import img4 from 'assets/images/homepage/1.jpg';
import img2 from 'assets/images/homepage/2.jpg';
import img3 from 'assets/images/homepage/3.jpg';
import img1 from 'assets/images/homepage/4.jpg';

function HomeCategoriesSection() {
  const navigate = useNavigate();

  return (
    <Box>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '2fr 1fr 1fr' },
          gap: 3
        }}
      >
        {/* LEFT BIG */}
        <CategoryCard title="category_aqua" image={img4} height={{ xs: 400, md: 600 }} onClick={() => navigate('/collections')} />

        {/* MIDDLE COLUMN */}
        <Box
          sx={{
            display: 'grid',
            gap: 3
          }}
        >
          <CategoryCard title="category_headwear" image={img2} height={290} onClick={() => navigate('/collections')} />

          <CategoryCard title="category_accessories" image={img3} height={290} onClick={() => navigate('/collections')} />
        </Box>

        {/* RIGHT TALL */}
        <CategoryCard title="category_active" image={img1} height={{ xs: 400, md: 600 }} onClick={() => navigate('/collections')} />
      </Box>
    </Box>
  );
}

const CategoryCard = ({ title, image, height, onClick }) => {
  return (
    <Box
      onClick={onClick}
      sx={{
        position: 'relative',
        height,
        overflow: 'hidden',
        cursor: 'pointer',
        '&:hover img': {
          transform: 'scale(1.08)'
        },
        '&:hover .overlay': {
          background: 'linear-gradient(to top, rgba(0,0,0,0.65), rgba(0,0,0,0.2))'
        }
      }}
    >
      <Box
        component="img"
        src={image}
        alt={title}
        sx={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          transition: '0.5s ease'
        }}
      />

      {/* Overlay */}
      <Box
        className="overlay"
        sx={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to top, rgba(0,0,0,0.5), rgba(0,0,0,0.1))',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: '0.3s ease'
        }}
      >
        <Typography
          variant="h4"
          sx={{
            color: '#fff',
            fontWeight: 600,
            letterSpacing: 1,
            textAlign: 'center'
          }}
        >
          <FormattedMessage id={title} />
        </Typography>
      </Box>
    </Box>
  );
};

export default HomeCategoriesSection;
