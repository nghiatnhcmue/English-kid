/**
 * Cloudflare Pages Function: /api/scores
 * Lưu và truy xuất kết quả bài test của học sinh qua Cloudflare D1 Database
 */

async function initDb(db) {
  await db
    .prepare(
      `CREATE TABLE IF NOT EXISTS test_results (
        id TEXT PRIMARY KEY,
        student_name TEXT NOT NULL,
        student_class TEXT NOT NULL,
        score REAL NOT NULL,
        stars INTEGER NOT NULL,
        correct INTEGER NOT NULL,
        total INTEGER NOT NULL,
        unit_ids TEXT NOT NULL,
        wrong_words TEXT,
        answers_json TEXT,
        created_at TEXT NOT NULL
      )`
    )
    .run();
}

const jsonHeaders = {
  'Content-Type': 'application/json;charset=utf-8',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export async function onRequestOptions() {
  return new Response(null, { headers: jsonHeaders });
}

export async function onRequestGet(context) {
  const { env, request } = context;
  const url = new URL(request.url);
  const classFilter = url.searchParams.get('class');

  if (!env.DB) {
    return new Response(
      JSON.stringify({
        success: false,
        hasD1: false,
        error: 'Chưa liên kết cơ sở dữ liệu Cloudflare D1 (biến binding: DB).',
        data: [],
      }),
      { status: 200, headers: jsonHeaders }
    );
  }

  try {
    await initDb(env.DB);

    let query = 'SELECT * FROM test_results ORDER BY created_at DESC LIMIT 500';
    let params = [];

    if (classFilter && classFilter !== 'all') {
      query = 'SELECT * FROM test_results WHERE student_class = ? ORDER BY created_at DESC LIMIT 500';
      params = [classFilter];
    }

    const { results } = await env.DB.prepare(query).bind(...params).all();

    const formatted = (results || []).map((row) => ({
      id: row.id,
      studentName: row.student_name,
      studentClass: row.student_class,
      score: row.score,
      stars: row.stars,
      correct: row.correct,
      total: row.total,
      unitIds: tryParseJson(row.unit_ids, []),
      wrongWords: tryParseJson(row.wrong_words, []),
      answers: tryParseJson(row.answers_json, []),
      createdAt: row.created_at,
    }));

    return new Response(JSON.stringify({ success: true, hasD1: true, data: formatted }), {
      headers: jsonHeaders,
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ success: false, error: err.message, data: [] }),
      { status: 500, headers: jsonHeaders }
    );
  }
}

export async function onRequestPost(context) {
  const { env, request } = context;

  if (!env.DB) {
    return new Response(
      JSON.stringify({
        success: false,
        hasD1: false,
        error: 'Chưa liên kết cơ sở dữ liệu Cloudflare D1. Vui lòng tạo D1 Database trong Cloudflare Dashboard.',
      }),
      { status: 200, headers: jsonHeaders }
    );
  }

  try {
    await initDb(env.DB);
    const body = await request.json();

    const id = body.id || `res_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const studentName = String(body.studentName || 'Học sinh').trim();
    const studentClass = String(body.studentClass || '6').trim();
    const score = Number(body.score) || 0;
    const stars = Number(body.stars) || 0;
    const correct = Number(body.correct) || 0;
    const total = Number(body.total) || 0;
    const unitIds = JSON.stringify(body.unitIds || []);
    const wrongWords = JSON.stringify(body.wrongWords || []);
    const answersJson = JSON.stringify(body.answers || []);
    const createdAt = body.createdAt || new Date().toISOString();

    await env.DB.prepare(
      `INSERT INTO test_results (id, student_name, student_class, score, stars, correct, total, unit_ids, wrong_words, answers_json, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
      .bind(
        id,
        studentName,
        studentClass,
        score,
        stars,
        correct,
        total,
        unitIds,
        wrongWords,
        answersJson,
        createdAt
      )
      .run();

    return new Response(JSON.stringify({ success: true, hasD1: true, id }), {
      headers: jsonHeaders,
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ success: false, error: err.message }),
      { status: 500, headers: jsonHeaders }
    );
  }
}

export async function onRequestDelete(context) {
  const { env, request } = context;

  if (!env.DB) {
    return new Response(
      JSON.stringify({ success: false, error: 'Chưa có kết nối D1.' }),
      { headers: jsonHeaders }
    );
  }

  try {
    await initDb(env.DB);
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    const all = url.searchParams.get('all');

    if (all === 'true') {
      await env.DB.prepare('DELETE FROM test_results').run();
      return new Response(
        JSON.stringify({ success: true, message: 'Đã xóa toàn bộ điểm học sinh.' }),
        { headers: jsonHeaders }
      );
    }

    if (id) {
      await env.DB.prepare('DELETE FROM test_results WHERE id = ?').bind(id).run();
      return new Response(
        JSON.stringify({ success: true, message: 'Đã xóa bản ghi thành công.' }),
        { headers: jsonHeaders }
      );
    }

    return new Response(
      JSON.stringify({ success: false, error: 'Thiếu id cần xóa.' }),
      { status: 400, headers: jsonHeaders }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ success: false, error: err.message }),
      { status: 500, headers: jsonHeaders }
    );
  }
}

function tryParseJson(str, fallback) {
  try {
    return JSON.parse(str) ?? fallback;
  } catch {
    return fallback;
  }
}
