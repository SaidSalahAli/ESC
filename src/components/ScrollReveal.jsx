import React, { useRef, useEffect, useState } from 'react';
import { Box, Fade, Slide } from '@mui/material';

function ScrollReveal({ children, direction = 'up', timeout = 800 }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.2 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <Box ref={ref}>
      <Fade in={visible} timeout={timeout}>
        <Slide in={visible} direction={direction} timeout={timeout}>
          <Box>{children}</Box>
        </Slide>
      </Fade>
    </Box>
  );
}

export default ScrollReveal;
