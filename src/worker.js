import * as healthApi from '../functions/api/health.js';
import { HttpError, checkOrigin, ensureSchema, fail, requireDb } from '../server/lib.js';
import { handleAuth } from '../server/auth.js';
import { handleData } from '../server/data.js';

/** Router cho /api/*. Lỗi được trả về gọn bằng tiếng Việt, không lộ chi tiết nội bộ. */
export async function handleApi(request, env) {
  const url = new URL(request.url);
  const path = url.pathname.replace(/\/+$/, '');
  if (path === '/api/health') {
    return request.method === 'GET' ? healthApi.onRequestGet({ env, request }) : fail(405, 'Method Not Allowed');
  }
  try {
    checkOrigin(request);
    const db = requireDb(env);
    await ensureSchema(db);
    const res = (await handleAuth(path, request, env, db)) || (await handleData(path, request, env, db));
    return res || fail(404, 'Không tìm thấy API.');
  } catch (err) {
    if (err instanceof HttpError) return fail(err.status, err.message, err.status === 503 ? { hasD1: false } : {});
    console.error('API error', path, err);
    return fail(500, 'Máy chủ đang gặp lỗi, thử lại sau.');
  }
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname.startsWith('/api/')) return handleApi(request, env);

    if (env.ASSETS) {
      const response = await env.ASSETS.fetch(request);
      const contentType = response.headers.get('content-type') || '';
      // Không lưu cache cứng HTML, manifest và service worker để F5 luôn tải bản mới nhất
      if (
        url.pathname === '/' ||
        url.pathname.endsWith('.html') ||
        url.pathname.endsWith('sw.js') ||
        url.pathname.endsWith('.webmanifest') ||
        contentType.includes('text/html')
      ) {
        const headers = new Headers(response.headers);
        headers.set('Cache-Control', 'no-cache, no-store, must-revalidate, max-age=0');
        headers.set('X-Frame-Options', 'SAMEORIGIN');
        headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
        return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
      }
      return response;
    }
    return new Response('Not Found', { status: 404 });
  },
};
