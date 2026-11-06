import units from '../data/units.json';
import { store } from './storage.js';

// Tự nạp mọi file unitN.json: thêm Unit mới chỉ cần thêm file dữ liệu.
const modules = import.meta.glob('../data/unit*.json', { eager: true, import: 'default' });

const baseUnitData = {};
for (const mod of Object.values(modules)) {
  if (mod && typeof mod.unitId === 'number') baseUnitData[mod.unitId] = mod;
}

function getMergedData(numId) {
  const base = baseUnitData[numId];
  if (!base) return null;
  try {
    const custom = store().getCustomUnit(numId);
    if (!custom) return base;
    return { ...base, ...custom };
  } catch {
    return base;
  }
}

export function listUnits() {
  return units.map((u) => ({ ...u, available: u.available && !!baseUnitData[u.unitId] }));
}

export function getUnit(unitId) {
  const numId = Number(unitId);
  const meta = units.find((u) => u.unitId === numId);
  const data = getMergedData(numId);
  if (!meta || !data) return null;
  return { ...meta, ...data };
}

export function vocabOf(unitIds) {
  return unitIds.flatMap((id) => {
    const u = getUnit(id);
    return (u?.vocabularies ?? []).map((v) => ({ ...v, unitId: id }));
  });
}

export function allWords() {
  return units.flatMap((u) => vocabOf([u.unitId]));
}

export function getWord(id) {
  return allWords().find((w) => w.id === id);
}
