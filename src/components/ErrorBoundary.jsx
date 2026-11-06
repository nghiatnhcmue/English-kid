import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReload = async () => {
    try {
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        for (const reg of registrations) {
          await reg.unregister();
        }
      }
      if ('caches' in window) {
        const keys = await caches.keys();
        for (const key of keys) {
          await caches.delete(key);
        }
      }
    } catch {
      /* ignore */
    }
    window.location.href = window.location.origin + window.location.pathname;
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#FFF8E7] flex flex-col items-center justify-center p-6 text-center font-sans text-[#2B2D42]">
          <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-[0_6px_0_#d8b13c] border-2 border-[#FFC83D] flex flex-col items-center gap-4">
            <span className="text-6xl animate-bounce select-none" aria-hidden>
              🦊
            </span>
            <h1 className="text-2xl font-black text-[#2B2D42]">
              Úi! Trang cần được làm mới
            </h1>
            <p className="text-sm font-bold text-[#6C757D] leading-relaxed">
              Hệ thống vừa cập nhật phiên bản mới nhất hoặc có dữ liệu cũ cần dọn dẹp. Em bấm nút bên dưới để tải lại bài học nhé!
            </p>
            <button
              type="button"
              onClick={this.handleReload}
              className="mt-3 w-full py-3.5 px-6 rounded-2xl bg-[#FF7A59] text-white font-black text-base shadow-[0_4px_0_#d95333] hover:-translate-y-0.5 active:translate-y-1 active:shadow-none transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <span>🔄</span>
              <span>Làm mới & Vào học ngay</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

