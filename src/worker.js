import * as healthApi from '../functions/api/health.js';
import * as scoresApi from '../functions/api/scores.js';

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (url.pathname === '/api/health') {
      if (request.method === 'GET') {
        return healthApi.onRequestGet({ env, request });
      }
      return new Response('Method Not Allowed', { status: 405 });
    }

    if (url.pathname === '/api/scores') {
      if (request.method === 'OPTIONS') {
        return scoresApi.onRequestOptions();
      }
      if (request.method === 'GET') {
        return scoresApi.onRequestGet({ env, request });
      }
      if (request.method === 'POST') {
        return scoresApi.onRequestPost({ env, request });
      }
      if (request.method === 'DELETE' && scoresApi.onRequestDelete) {
        return scoresApi.onRequestDelete({ env, request });
      }
      return new Response('Method Not Allowed', { status: 405 });
    }

    if (env.ASSETS) {
      const response = await env.ASSETS.fetch(request);
      const contentType = response.headers.get('content-type') || '';
      
      // Chống lưu cache cứng cho HTML, manifest và service worker để F5/Ctrl+F5 luôn tải bản mới nhất
      if (
        url.pathname === '/' ||
        url.pathname.endsWith('.html') ||
        url.pathname.endsWith('sw.js') ||
        url.pathname.endsWith('.webmanifest') ||
        contentType.includes('text/html')
      ) {
        const newHeaders = new Headers(response.headers);
        newHeaders.set('Cache-Control', 'no-cache, no-store, must-revalidate, max-age=0');
        newHeaders.set('Pragma', 'no-cache');
        newHeaders.set('Expires', '0');
        return new Response(response.body, {
          status: response.status,
          statusText: response.statusText,
          headers: newHeaders,
        });
      }

      return response;
    }

    return new Response('Not Found', { status: 404 });
  },
};

