import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import jsconfigPaths from 'vite-jsconfig-paths';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const API_URL = `${env.VITE_APP_BASE_NAME}`;
  const PORT = 3000;

  return {
    server: {
      // this ensures that the browser opens upon server start
      open: true,
      // this sets a default port to 3000
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
    resolve: {
      alias: [
        // { find: '', replacement: path.resolve(__dirname, 'src') },
        // {
        //   find: /^~(.+)/,
        //   replacement: path.join(process.cwd(), 'node_modules/$1')
        // },
        // {
        //   find: /^src(.+)/,
        //   replacement: path.join(process.cwd(), 'src/$1')
        // }
        // {
        //   find: 'assets',
        //   replacement: path.join(process.cwd(), 'src/assets')
        // },
      ]
    },
    base: API_URL,
    plugins: [react(), jsconfigPaths()],
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            // React core
            'react-vendor': ['react', 'react-dom', 'react-router-dom', 'react-router'],
            // Material-UI
            'mui-vendor': [
              '@mui/material',
              '@mui/system',
              '@mui/base',
              '@mui/lab',
              '@emotion/react',
              '@emotion/styled'
            ],
            // Large libraries
            'utils-vendor': [
              'axios',
              'lodash-es',
              'formik',
              'yup',
              'framer-motion'
            ],
            // Internationalization
            'i18n-vendor': ['react-intl'],
            // Icons and UI components
            'ui-vendor': [
              'iconsax-react',
              'simplebar',
              'simplebar-react',
              'slick-carousel'
            ]
          }
        },
        // Increase chunk size warning limit to 1000 KB
        chunkSizeWarningLimit: 1000
      }
    }
  };
});