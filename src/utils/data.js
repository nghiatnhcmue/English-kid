import units from '../data/units.json';

// Tự nạp mọi file unitN.json: thêm Unit mới chỉ cần thêm file dữ liệu.
const modules = import.meta.glob('../data/unit*.json', { eager: true, import: 'default' });

const unitData = {};
for (const mod of Object.values(modules)) {
  if (mod && typeof mod.unitId === 'number') unitData[mod.unitId] = mod;
}

export function listUnits() {
  return units.map((u) => ({ ...u, available: u.available && !!unitData[u.unitId] }));
}

export function getUnit(unitId) {
  const meta = units.find((u) => u.unitId === Number(unitId));
  const data = unitData[Number(unitId)];
  if (!meta || !data) return null;
  return { ...meta, ...data };
}

export function vocabOf(unitIds) {
  return unitIds.flatMap((id) => (unitData[id]?.vocabularies ?? []).map((v) => ({ ...v, unitId: id })));
}

const allVocab = Object.keys(unitData).flatMap((id) => vocabOf([Number(id)]));
const byId = new Map(allVocab.map((v) => [v.id, v]));

export function getWord(id) {
  return byId.get(id);
}

export function allWords() {
  return allVocab;
}
