// Tải trước âm thanh + mô hình 3D của một Unit để học khi không có mạng.
// Mỗi file được fetch đầy đủ (status 200) đi qua service worker → lưu vào cache runtime (audio-v2, models-3d).

export function unitAssetUrls(unit) {
  const urls = new Set();
  const add = (u) => {
    if (typeof u === 'string' && u.startsWith('/assets/')) urls.add(u);
  };
  for (const v of unit?.vocabularies || []) {
    add(v.audio);
    add(v.audioExample);
    add(v.model3d);
    add(v.image);
  }
  add(unit?.listening?.audio);
  add(unit?.speaking?.audio);
  for (const c of unit?.speaking?.challenges || []) add(c.audio);
  return [...urls];
}

const KEY = 'app_tienganh_v1_offline_units';

export function isUnitOffline(unitId) {
  try {
    return (JSON.parse(localStorage.getItem(KEY) || '[]') || []).includes(Number(unitId));
  } catch {
    return false;
  }
}

function markOffline(unitId) {
  try {
    const list = new Set(JSON.parse(localStorage.getItem(KEY) || '[]') || []);
    list.add(Number(unitId));
    localStorage.setItem(KEY, JSON.stringify([...list]));
  } catch {
    /* bỏ qua */
  }
}

/**
 * Tải tất cả file của Unit, 4 file song song. onProgress(done, total).
 * Trả về { ok, failed } – failed là số file không tải được (mạng chập chờn).
 */
export async function downloadUnitOffline(unit, onProgress = () => {}) {
  const urls = unitAssetUrls(unit);
  let done = 0;
  let failed = 0;
  const queue = [...urls];
  const worker = async () => {
    while (queue.length) {
      const url = queue.shift();
      try {
        const res = await fetch(url, { cache: 'reload' });
        if (!res.ok) failed += 1;
        await res.arrayBuffer();
      } catch {
        failed += 1;
      }
      done += 1;
      onProgress(done, urls.length);
    }
  };
  await Promise.all(Array.from({ length: Math.min(4, urls.length) }, worker));
  if (failed === 0 && urls.length) markOffline(unit.unitId);
  return { ok: failed === 0, failed, total: urls.length };
}
