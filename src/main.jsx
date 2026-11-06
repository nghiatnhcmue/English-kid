import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { registerSW } from 'virtual:pwa-register';
import App from './App.jsx';
import ErrorBoundary from './components/ErrorBoundary.jsx';
import './index.css';

// Tự động reload trang ngay khi Service Worker bản mới claims clients (F5 / cập nhật code)
if ('serviceWorker' in navigator) {
  let refreshing = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!refreshing) {
      refreshing = true;
      window.location.reload();
    }
  });
}

const updateSW = registerSW({
  immediate: true,
  onNeedRefresh() {
    updateSW(true);
  },
  onOfflineReady() {
    console.log('App ready offline');
  },
  onRegisteredSW(swUrl, r) {
    if (r) {
      // Kiểm tra bản mới ngay lập tức và mỗi khi học sinh focus lại tab
      r.update().catch(() => {});
      window.addEventListener('focus', () => {
        r.update().catch(() => {});
      });
      setInterval(() => {
        r.update().catch(() => {});
      }, 60000);
    }
  },
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);
