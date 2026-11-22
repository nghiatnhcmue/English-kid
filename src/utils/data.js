import units from '../data/units.json';
import { store } from './storage.js';
import { prepareUnitForPractice } from './quiz.js';

// Tự nạp mọi file unitN.json (Lớp 6 chuẩn)
const modules = import.meta.glob('../data/unit*.json', { eager: true, import: 'default' });
// Tự nạp toàn bộ học liệu 12 khối lớp chuẩn SGK GDPT 2018
const gradeModules = import.meta.glob('../data/grades/grade*.json', { eager: true, import: 'default' });

const baseUnitData = {};
for (const mod of Object.values(modules)) {
  if (mod && typeof mod.unitId === 'number') baseUnitData[mod.unitId] = mod;
}

const allGradesData = {};
const allUnitsMap = {};

for (const mod of Object.values(gradeModules)) {
  if (mod && typeof mod.grade === 'number') {
    allGradesData[mod.grade] = mod;
    for (const u of mod.units || []) {
      const uId = u.unitId || `g${mod.grade}_u${u.unit}`;
      allUnitsMap[uId] = u;
      if (mod.grade === 6) {
        allUnitsMap[u.unit] = u;
        allUnitsMap[String(u.unit)] = u;
      }
    }
  }
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

export function listUnits(grade = null) {
  let targetGrade = grade;
  if (!targetGrade) {
    try {
      targetGrade = store().getSettings()?.selectedGrade || 6;
    } catch {
      targetGrade = 6;
    }
  }

  // Nếu người dùng chọn một khối lớp khác Lớp 6 và có dữ liệu trong allGradesData
  if (targetGrade !== 6 && allGradesData[targetGrade]) {
    const gData = allGradesData[targetGrade];
    return (gData.units || []).map((u) => ({
      unitId: u.unitId || `g${targetGrade}_u${u.unit}`,
      unit: u.unit,
      grade: targetGrade,
      title: u.unitTitle?.replace(/^Unit \d+:\s*/, '') || u.title || `Unit ${u.unit}`,
      titleEn: u.unitTitle?.replace(/^Unit \d+:\s*/, '') || u.title || `Unit ${u.unit}`,
      titleVi: u.unitNameVi || u.titleVi || '',
      emoji: '📘',
      color: '#FFC83D',
      available: true,
    }));
  }

  // Mặc định cho Lớp 6
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
  if (!unitId && unitId !== 0) return null;
  const strId = String(unitId).trim();
  const numId = Number(unitId);

  // 1. Kiểm tra trực tiếp trong allUnitsMap (ví dụ 'g7_u1' hoặc 'g10_u2')
  if (allUnitsMap[strId]) {
    const isGrade6 = allUnitsMap[strId].grade === 6 || !allUnitsMap[strId].grade;
    const key = isGrade6 ? (allUnitsMap[strId].unit || (Number.isFinite(numId) ? numId : 1)) : (allUnitsMap[strId].unitId || strId);
    // Gộp phần giáo viên đã sửa (lưu theo cùng ID) lên dữ liệu SGK
    let custom = null;
    try {
      custom = store().getCustomUnit(key);
    } catch {
      custom = null;
    }
    const raw = mergeUnitData(allUnitsMap[strId], custom);
    return {
      ...raw,
      unitId: key,
      titleEn: raw.unitTitle?.replace(/^Unit \d+:\s*/, '') || raw.title || `Unit ${raw.unit}`,
      title: raw.unitTitle?.replace(/^Unit \d+:\s*/, '') || raw.title || `Unit ${raw.unit}`,
      titleVi: raw.unitNameVi || raw.titleVi || '',
      emoji: raw.emoji || '📘',
      color: raw.color || '#FFC83D',
      available: true,
    };
  }

  // 2. Nếu là dạng số (ví dụ unitId = 1):
  // Xem học sinh / giáo viên đang chọn Lớp mấy trong settings
  let currentGrade = 6;
  try {
    currentGrade = store().getSettings()?.selectedGrade || 6;
  } catch {}

  const gradeUnitKey = `g${currentGrade}_u${numId}`;
  if (currentGrade !== 6 && allUnitsMap[gradeUnitKey]) {
    let custom = null;
    try {
      custom = store().getCustomUnit(gradeUnitKey);
    } catch {
      custom = null;
    }
    const raw = mergeUnitData(allUnitsMap[gradeUnitKey], custom);
    return {
      ...raw,
      unitId: raw.unitId || gradeUnitKey,
      titleEn: raw.unitTitle?.replace(/^Unit \d+:\s*/, '') || raw.title || `Unit ${raw.unit}`,
      title: raw.unitTitle?.replace(/^Unit \d+:\s*/, '') || raw.title || `Unit ${raw.unit}`,
      titleVi: raw.unitNameVi || raw.titleVi || '',
      emoji: '📘',
      color: '#FFC83D',
      available: true,
    };
  }

  // 3. Fallback về Lớp 6 chuẩn (baseUnitData) và custom units của giáo viên
  const all = listUnits(6);
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
