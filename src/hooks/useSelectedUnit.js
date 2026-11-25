import { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { listUnits, getUnit } from '../utils/data.js';
import { playSfx } from '../utils/sfx.js';
import { useSettings } from '../settings.jsx';

/**
 * Hook quản lý Unit đang chọn cho các trang kỹ năng (Ngữ pháp, Đọc, Viết, Nghe, Nói, Phát âm).
 * Đồng bộ hai chiều với query `?unit=...` và tự chuyển sang Unit đầu tiên khi đổi Khối lớp.
 */
export function useSelectedUnit() {
  const { settings } = useSettings();
  const activeGrade = settings?.selectedGrade || 6;
  const [searchParams, setSearchParams] = useSearchParams();
  const rawParam = searchParams.get('unit');

  const units = useMemo(() => listUnits(activeGrade), [activeGrade]);

  const resolveCanonicalId = useCallback(
    (candidate) => {
      if (candidate !== null && candidate !== undefined && candidate !== '') {
        const matchedInGrade = units.find((u) => String(u.unitId) === String(candidate));
        if (matchedInGrade) return matchedInGrade.unitId;
        if (getUnit(candidate)) return candidate;
      }
      return units[0]?.unitId ?? 1;
    },
    [units],
  );

  const [selectedUnitId, setSelectedUnitId] = useState(() => resolveCanonicalId(rawParam));

  // Đồng bộ khi URL ?unit= thay đổi
  useEffect(() => {
    if (rawParam) {
      const resolved = resolveCanonicalId(rawParam);
      if (String(resolved) !== String(selectedUnitId)) {
        setSelectedUnitId(resolved);
      }
    }
  }, [rawParam, resolveCanonicalId, selectedUnitId]);

  // Khi học sinh đổi Khối lớp trên thanh Header, chuyển về Unit 1 của khối mới
  useEffect(() => {
    const onGradeChanged = (e) => {
      const nextGrade = e?.detail?.grade || activeGrade;
      const nextUnits = listUnits(nextGrade);
      const firstId = nextUnits[0]?.unitId ?? 1;
      setSelectedUnitId(firstId);
      setSearchParams({ unit: String(firstId) }, { replace: true });
    };
    window.addEventListener('grade-changed', onGradeChanged);
    return () => window.removeEventListener('grade-changed', onGradeChanged);
  }, [activeGrade, setSearchParams]);

  const selectUnit = useCallback(
    (unitId) => {
      playSfx('click');
      setSelectedUnitId(unitId);
      setSearchParams({ unit: String(unitId) });
    },
    [setSearchParams],
  );

  const currentUnit = useMemo(() => getUnit(selectedUnitId), [selectedUnitId]);

  return {
    units,
    selectedUnitId,
    currentUnit,
    selectUnit,
  };
}
