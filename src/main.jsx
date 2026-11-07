import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { registerSW } from 'virtual:pwa-register';
import App from './App.jsx';
import ErrorBoundary from './components/ErrorBoundary.jsx';
import './index.css';

// Tự động reload trang ngay khi Service Worker bản mới claims clients (F5 / cập nhật code)
if ('serviceWorker' in navigator) {
  let refreshing = false;
  // Lần đầu mở app: SW mới cài cũng bắn 'controllerchange' → KHÔNG reload (nếu không trang tự tải lại
  // vài giây sau khi mở và xóa mất chữ em đang gõ). Chỉ reload khi đã có SW cũ, tức là có bản cập nhật.
  const hadController = !!navigator.serviceWorker.controller;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (hadController && !refreshing) {
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
