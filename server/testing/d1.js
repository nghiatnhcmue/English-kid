// D1 giả cho test: cùng API prepare().bind().first()/all()/run() và batch(), chạy trên SQLite của Node (node:sqlite).
import { DatabaseSync } from 'node:sqlite';

export function createTestD1() {
  const db = new DatabaseSync(':memory:');
  const wrap = (sql, params = []) => ({
    bind: (...p) => wrap(sql, p),
    first: async () => db.prepare(sql).get(...params) ?? null,
    all: async () => ({ results: db.prepare(sql).all(...params) }),
    run: async () => {
      const r = db.prepare(sql).run(...params);
      return { success: true, meta: { changes: r.changes } };
    },
    _exec: () => db.prepare(sql).run(...params),
  });
  return {
    prepare: (sql) => wrap(sql),
    batch: async (stmts) => {
      db.exec('BEGIN');
      try {
        const out = stmts.map((s) => s._exec());
        db.exec('COMMIT');
        return out;
      } catch (e) {
        db.exec('ROLLBACK');
        throw e;
      }
    },
    raw: db,
  };
}
