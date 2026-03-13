import React, { useState } from 'react';
import { Box, Typography, Dialog } from '@mui/material';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Navigation, Autoplay } from 'swiper/modules';

import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

import img1 from 'assets/images/homepage/5.jpg';
import img2 from 'assets/images/homepage/6.jpg';
import img3 from 'assets/images/homepage/7.jpg';
import img4 from 'assets/images/homepage/8.jpg';
import img5 from 'assets/images/homepage/9.jpg';

import { Add } from 'iconsax-react';
import { FormattedMessage } from 'react-intl';

const images = [img4, img1, img2, img3, img1, img2, img3, img5];

function InstagramSection() {
  const [open, setOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  const handleOpen = (img) => {
    setSelectedImage(img);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <Box sx={{ py: 8 }}>
      {/* Header */}
      <Box sx={{ textAlign: 'center', mb: 6 }}>
        <Typography variant="h4" fontWeight={600}>
          <FormattedMessage id="ESC-moments" />
        </Typography>
      </Box>

      {/* Images Slider */}
      <Box
        sx={{
          '& .swiper-slide': {
            height: 'auto',
            display: 'flex'
          },

          '& .swiper-pagination': {
            position: 'static !important',
            mt: 3,
            textAlign: 'center'
          },

          '& .swiper-pagination-bullet': {
            width: 8,
            height: 8,
            backgroundColor: '#90A4AE',
            opacity: 1,
            mx: '4px'
          },

          '& .swiper-pagination-bullet-active': {
            width: 28,
            borderRadius: '6px',
            backgroundColor: '#FF6B35'
          }
        }}
      >
        <Swiper
          modules={[Pagination, Navigation, Autoplay]}
          spaceBetween={0}
          autoplay={{ delay: 4000, disableOnInteraction: false }}
          pagination={{ clickable: true }}
          breakpoints={{
            0: { slidesPerView: 2 },
            600: { slidesPerView: 3 },
            900: { slidesPerView: 4 },
            1200: { slidesPerView: 5 },
            1536: { slidesPerView: 6 }
          }}
        >
          {images.map((img, index) => (
            <SwiperSlide key={index}>
              <Box
                onClick={() => handleOpen(img)}
                sx={{
                  position: 'relative',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  height: 340,
                  width: '100%',
                  '&:hover img': {
                    transform: 'scale(1.08)'
                  },
                  '&:hover .overlay': {
                    opacity: 1
                  }
                }}
              >
                <Box
                  component="img"
                  src={img}
                  alt="instagram"
                  sx={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    transition: '0.4s ease'
                  }}
                />

                {/* Hover Overlay */}
                <Box
                  className="overlay"
                  sx={{
                    position: 'absolute',
                    inset: 0,
                    background: 'rgba(0,0,0,0.35)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    opacity: 0,
                    transition: '0.3s ease'
                  }}
                >
                  <Add size="32" color="#fff" />
                </Box>
              </Box>
            </SwiperSlide>
          ))}
        </Swiper>
      </Box>

      {/* Image Popup */}
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth={false}
        sx={{
          '& .MuiDialog-paper': {
            background: 'transparent',
            boxShadow: 'none',
            overflow: 'hidden'
          }
        }}
      >
        {selectedImage && (
          <Box
            component="img"
            src={selectedImage}
            sx={{
              maxWidth: '90vw',
              maxHeight: '90vh',
              width: 'auto',
              height: 'auto',
              objectFit: 'contain',
              display: 'block',
              margin: 'auto'
            }}
          />
        )}
      </Dialog>
    </Box>
  );
}

export default InstagramSection;
