/**
 * Cloudflare Pages Function: /api/health
 * Kiểm tra trạng thái máy chủ và kết nối D1 Database
 */
export async function onRequestGet(context) {
  const { env } = context;
  const hasD1 = !!env.DB;

  return new Response(
    JSON.stringify({
      online: true,
      hasD1,
      message: hasD1
        ? 'Cloudflare D1 Database đã được kết nối thành công!'
        : 'Chưa liên kết Cloudflare D1 Database (biến DB).',
      timestamp: new Date().toISOString(),
    }),
    {
      headers: {
        'Content-Type': 'application/json;charset=utf-8',
        'Access-Control-Allow-Origin': '*',
      },
    }
  );
}

