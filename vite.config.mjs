import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import jsconfigPaths from 'vite-jsconfig-paths';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const API_URL = `${env.VITE_APP_BASE_NAME}`;
  const PORT = 3000;

  return {
    server: {
      open: true,
      port: PORT,
      host: true
    },
    preview: {
      open: true,
      host: true
    },
    define: {
      global: 'window'
    },
    base: API_URL,
    plugins: [react(), jsconfigPaths()],
    build: {
      target: 'es2015',
      cssCodeSplit: true,
      sourcemap: false,
      chunkSizeWarningLimit: 1000,
      rollupOptions: {
        output: {
          manualChunks: {
            'react-vendor': ['react', 'react-dom', 'react-router-dom', 'react-router'],
            'mui-core': ['@mui/material', '@mui/system', '@mui/base', '@emotion/react', '@emotion/styled'],
            'mui-icons': ['@mui/icons-material'], // ← منفصل عشان ضخم
            'mui-lab': ['@mui/lab'],
            'utils-vendor': ['axios', 'lodash-es', 'formik', 'yup', 'framer-motion'],
            'i18n-vendor': ['react-intl'],
            'ui-vendor': ['iconsax-react', 'simplebar', 'simplebar-react', 'slick-carousel']
          }
        }
      }
    }
  };
});
