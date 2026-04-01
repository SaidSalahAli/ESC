import { createRoot } from 'react-dom/client';

// styles
import './index.css';

// project-imports
import App from './App';
import { ConfigProvider } from 'contexts/ConfigContext';
import reportWebVitals from './reportWebVitals';

const container = document.getElementById('root');
const root = createRoot(container);

// ==============================|| MAIN - REACT DOM RENDER  ||============================== //

root.render(
  <ConfigProvider>
    <App />
  </ConfigProvider>
);

// ==============================|| SERVICE WORKER REGISTRATION ||============================== //

/**
 * Register Service Worker for caching static assets (Phase 1)
 * - Only in production/build mode
 * - Only if browser supports Service Workers
 * - Logs success and errors for debugging
 */
if (import.meta.env.MODE === 'production' && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/service-worker.js')
      .then((registration) => {
        console.log('[PWA] Service Worker registered successfully:', registration);
      })
      .catch((error) => {
        console.error('[PWA] Service Worker registration failed:', error);
      });
  });
}

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
