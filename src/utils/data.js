import units from '../data/units.json';
import { store } from './storage.js';
import { prepareUnitForPractice } from './quiz.js';

// Tự nạp mọi file unitN.json: thêm Unit mới chỉ cần thêm file dữ liệu.
const modules = import.meta.glob('../data/unit*.json', { eager: true, import: 'default' });

const baseUnitData = {};
for (const mod of Object.values(modules)) {
  if (mod && typeof mod.unitId === 'number') baseUnitData[mod.unitId] = mod;
}

const isPlainObject = (v) => v && typeof v === 'object' && !Array.isArray(v);

// Gộp dữ liệu giáo viên lên dữ liệu gốc: các mục dạng object (grammar, reading…) gộp 1 cấp,
// để lưu riêng `grammar.quiz` không làm mất quy tắc/ví dụ ngữ pháp của SGK.
export function mergeUnitData(base, custom) {
  if (!custom) return base;
  const out = { ...base, ...custom };
  for (const key of Object.keys(custom)) {
    if (isPlainObject(base?.[key]) && isPlainObject(custom[key])) {
      out[key] = { ...base[key], ...custom[key] };
    }
  }
  return out;
}

function getMergedData(numId) {
  const base = baseUnitData[numId];
  try {
    const custom = store().getCustomUnit(numId);
    if (base) return mergeUnitData(base, custom);
    // Nếu không nằm trong baseUnitData, tìm trong createdUnits do giáo viên tạo
    const createdUnits = store().getCreatedUnits() || [];
    const createdMeta = createdUnits.find((u) => u.unitId === numId);
    if (!createdMeta && !custom) return null;
    const defaultTemplate = {
      unitId: numId,
      title: createdMeta?.titleEn || createdMeta?.title || `Unit ${numId}`,
      titleVi: createdMeta?.titleVi || '',
      vocabularies: [],
      grammar: { points: [], quiz: [] },
      pronunciation: { sounds: [], explanation: '' },
      listenPractice: { questions: [] },
      conversation: [],
      reading: { passage: '', translation: '', questions: [] },
      writing: { task: '', guide: '', hints: [] },
      videos: [],
      isCustomUnit: true,
    };
    return { ...defaultTemplate, ...(custom || {}) };
  } catch {
    return base || null;
  }
}

export function listUnits() {
  let customList = [];
  try {
    customList = store().getCreatedUnits() || [];
  } catch {
    customList = [];
  }

  const baseList = units.map((u) => ({
    ...u,
    title: u.titleEn || u.title,
    available: u.available && !!baseUnitData[u.unitId],
  }));

  const combined = [...baseList];
  for (const cu of customList) {
    if (!combined.some((u) => u.unitId === cu.unitId)) {
      combined.push({
        ...cu,
        title: cu.titleEn || cu.title || `Unit ${cu.unitId}`,
        available: true,
        isCustomUnit: true,
      });
    }
  }
  combined.sort((a, b) => a.unitId - b.unitId);
  return combined;
}

/** Unit để học: câu trắc nghiệm đã trộn đáp án, câu sắp xếp đã xáo từ. */
export function getUnit(unitId) {
  return prepareUnitForPractice(getUnitRaw(unitId));
}

/** Unit đúng như dữ liệu đã lưu (cho trình soạn của giáo viên – sửa/lưu không bị xáo trộn). */
export function getUnitRaw(unitId) {
  const numId = Number(unitId);
  const all = listUnits();
  const meta = all.find((u) => u.unitId === numId);
  const data = getMergedData(numId);
  if (!meta && !data) return null;
  const finalMeta = meta || {
    unitId: numId,
    titleEn: data?.title || `Unit ${numId}`,
    title: data?.title || `Unit ${numId}`,
    titleVi: data?.titleVi || '',
    emoji: '📘',
    color: '#FFC83D',
    available: true,
    isCustomUnit: true,
  };
  return { ...finalMeta, ...(data || {}) };
}

export function vocabOf(unitIds) {
  return unitIds.flatMap((id) => {
    const u = getUnit(id);
    return (u?.vocabularies ?? []).map((v) => ({ ...v, unitId: id }));
  });
}

export function allWords() {
  return listUnits().flatMap((u) => vocabOf([u.unitId]));
}

export function getWord(id) {
  return allWords().find((w) => w.id === id);
}
