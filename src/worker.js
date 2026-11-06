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
      return env.ASSETS.fetch(request);
    }

    return new Response('Not Found', { status: 404 });
  },
};

