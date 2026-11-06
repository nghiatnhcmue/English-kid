// Kiểm tra dữ liệu các Unit: đủ trường, IPA, câu ví dụ chứa từ, không trùng id/emoji, file ảnh/model tồn tại.
// Chạy: npm run validate-data
import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dataDir = join(root, 'src', 'data');
const publicDir = join(root, 'public');

const REQUIRED = ['id', 'word', 'phonetic', 'wordType', 'meaning', 'hint', 'exampleEn', 'exampleVi'];
const WORD_TYPES = ['Danh từ', 'Động từ', 'Tính từ', 'Trạng từ', 'Giới từ', 'Cụm từ', 'Cụm động từ'];
const MAX_IMAGE = 50 * 1024;
const MAX_MODEL = 1024 * 1024;

const errors = [];
const warnings = [];
const allIds = new Set();

const units = JSON.parse(readFileSync(join(dataDir, 'units.json'), 'utf8'));
const creditsPath = join(dataDir, 'credits.json');
const credits = existsSync(creditsPath) ? JSON.parse(readFileSync(creditsPath, 'utf8')) : [];
const files = readdirSync(dataDir).filter((f) => /^unit\d+\.json$/.test(f));

for (const file of files) {
  let unit;
  try {
    unit = JSON.parse(readFileSync(join(dataDir, file), 'utf8'));
  } catch (e) {
    errors.push(`${file}: JSON không hợp lệ (${e.message})`);
    continue;
  }
  const where = (v, msg) => `${file} › ${v?.id ?? '?'} (${v?.word ?? ''}): ${msg}`;
  if (!units.some((u) => u.unitId === unit.unitId)) errors.push(`${file}: unitId ${unit.unitId} không có trong units.json`);
  if (!Array.isArray(unit.vocabularies) || unit.vocabularies.length < 4) {
    errors.push(`${file}: cần ít nhất 4 từ vựng`);
    continue;
  }

  const emojis = new Map();
  for (const v of unit.vocabularies) {
    for (const key of REQUIRED) if (!v[key] || typeof v[key] !== 'string') errors.push(where(v, `thiếu trường "${key}"`));
    if (allIds.has(v.id)) errors.push(where(v, 'id bị trùng'));
    allIds.add(v.id);
    if (v.phonetic && !/^\/.+\/$/.test(v.phonetic)) errors.push(where(v, 'IPA phải đặt trong dấu /.../'));
    if (v.phonetic && /ər|ɚ|ɝ/.test(v.phonetic)) warnings.push(where(v, 'IPA có vẻ là Anh–Mỹ (âm r); SGK dùng Anh–Anh'));
    if (v.wordType && !WORD_TYPES.includes(v.wordType)) warnings.push(where(v, `từ loại lạ "${v.wordType}"`));
    if (v.exampleEn && v.word && !v.exampleEn.toLowerCase().includes(v.word.toLowerCase()))
      errors.push(where(v, 'câu ví dụ không chứa đúng từ (cần cho câu hỏi điền từ)'));

    if (!v.image && !v.emoji) errors.push(where(v, 'cần "image" hoặc "emoji"'));
    if (v.emoji) {
      if (emojis.has(v.emoji)) errors.push(where(v, `emoji ${v.emoji} trùng với "${emojis.get(v.emoji)}" (gây nhầm ở câu chọn hình)`));
      emojis.set(v.emoji, v.word);
    }
    if (!v.image && !v.model3d) warnings.push(where(v, 'chưa có ảnh thật, đang dùng emoji'));

    for (const [key, max] of [
      ['image', MAX_IMAGE],
      ['model3d', MAX_MODEL],
      ['audio', Infinity],
    ]) {
      if (!v[key]) continue;
      const p = join(publicDir, v[key].replace(/^\.?\//, ''));
      if (!existsSync(p)) errors.push(where(v, `không tìm thấy file ${key}: ${v[key]}`));
      else if (statSync(p).size > max) warnings.push(where(v, `${key} nặng ${(statSync(p).size / 1024).toFixed(0)}KB (> ${max / 1024}KB)`));
    }
    if (v.model3d && !credits.some((c) => c.file === v.model3d))
      errors.push(where(v, `model ${v.model3d} chưa được ghi nguồn trong src/data/credits.json`));
  }

  // Bối cảnh Sân khấu 3D
  const ids = new Set(unit.vocabularies.map((v) => v.id));
  for (const scene of unit.scenes ?? []) {
    const at = (msg) => `${file} › scene "${scene.id}": ${msg}`;
    for (const key of ['id', 'titleVi', 'titleEn', 'bg']) if (!scene[key]) errors.push(at(`thiếu "${key}"`));
    const objects = new Set(scene.objects ?? []);
    if (objects.size < 2) errors.push(at('cần ít nhất 2 đồ vật'));
    for (const id of objects) if (!ids.has(id)) errors.push(at(`đồ vật "${id}" không có trong Unit`));
    if (!scene.challenges?.length) errors.push(at('cần ít nhất 1 thử thách'));
    for (const c of scene.challenges ?? []) {
      if (!c.id || !c.promptVi || !c.promptEn) errors.push(at(`thử thách "${c.id}" thiếu id/promptVi/promptEn`));
      if (!c.required?.length) errors.push(at(`thử thách "${c.id}" chưa có đáp án (required)`));
      for (const id of [...(c.required ?? []), ...(c.allowed ?? [])])
        if (!objects.has(id)) errors.push(at(`thử thách "${c.id}": "${id}" không nằm trong objects của bối cảnh`));
      const overlap = (c.required ?? []).filter((id) => (c.allowed ?? []).includes(id));
      if (overlap.length) warnings.push(at(`thử thách "${c.id}": ${overlap.join(', ')} vừa required vừa allowed`));
    }
    for (const p of scene.speakingPatterns ?? []) {
      if (!p.en?.includes('{0}') || !p.vi?.includes('{0}')) errors.push(at(`mẫu câu "${p.en}" phải có {0} ở cả en và vi`));
      if (p.en.includes('{1}') && objects.size < 2) errors.push(at(`mẫu câu "${p.en}" cần 2 đồ vật`));
    }
  }
}

// Mọi file model trong public/assets/models đều phải có nguồn và được dùng
const modelRoot = join(publicDir, 'assets', 'models');
if (existsSync(modelRoot)) {
  for (const dir of readdirSync(modelRoot)) {
    const full = join(modelRoot, dir);
    if (!statSync(full).isDirectory()) continue;
    for (const f of readdirSync(full).filter((x) => x.endsWith('.glb'))) {
      const path = `/assets/models/${dir}/${f}`;
      if (!credits.some((c) => c.file === path)) errors.push(`${path}: chưa ghi nguồn trong credits.json`);
    }
  }
}
for (const c of credits) {
  if (!existsSync(join(publicDir, c.file.replace(/^\//, '')))) errors.push(`credits.json: không tìm thấy file ${c.file}`);
  if (!c.author || !c.license || !c.source) errors.push(`credits.json: ${c.file} thiếu author/license/source`);
}

const imageWarnings = warnings.filter((w) => w.includes('chưa có ảnh thật')).length;
for (const w of warnings.filter((w) => !w.includes('chưa có ảnh thật'))) console.warn('⚠️ ', w);
if (imageWarnings) console.warn(`⚠️  ${imageWarnings} từ chưa có ảnh thật (đang dùng emoji tạm).`);
for (const e of errors) console.error('❌', e);

console.log(`\n${files.length} Unit · ${allIds.size} từ vựng · ${errors.length} lỗi · ${warnings.length} cảnh báo`);
process.exit(errors.length ? 1 : 0);
