import { useState, useEffect } from 'react';
import { AlertCircle, Code2, Save } from 'lucide-react';
import { store } from '../../../utils/storage.js';

export default function RawJsonEditorTab({ unitId, currentUnit, onReload, onNotify }) {
  const [rawJsonText, setRawJsonText] = useState(() => JSON.stringify(currentUnit, null, 2));
  const [jsonError, setJsonError] = useState(null);
  const [jsonSuccess, setJsonSuccess] = useState(false);

  useEffect(() => {
    setRawJsonText(JSON.stringify(currentUnit, null, 2));
    setJsonError(null);
  }, [unitId, currentUnit]);

  const handleSave = () => {
    try {
      const parsed = JSON.parse(rawJsonText);
      if (!parsed || typeof parsed !== 'object') {
        throw new Error('Dữ liệu JSON phải là một đối tượng hợp lệ.');
      }
      store().saveCustomUnit(unitId, parsed);
      setJsonError(null);
      setJsonSuccess(true);
      setTimeout(() => setJsonSuccess(false), 2500);
      onReload?.();
      onNotify?.('Đã lưu cấu trúc JSON tùy biến thành công!');
    } catch (err) {
      setJsonError(`Lỗi cú pháp JSON: ${err.message}`);
    }
  };

  return (
    <div className="rounded-3xl bg-white p-6 shadow-xs border-2 border-banana-soft flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-banana-soft pb-3">
        <div>
          <h3 className="text-xl font-black text-ink flex items-center gap-2">
            <Code2 className="h-5 w-5 text-peach" /> Chế độ Chuyên gia: Chỉnh sửa JSON Thô Unit {unitId}
          </h3>
          <p className="text-xs font-bold text-ink-soft">
            Thầy cô có thể copy toàn bộ dữ liệu, chỉnh sửa trực tiếp và dán vào đây để cập nhật.
          </p>
        </div>
        <button
          type="button"
          onClick={handleSave}
          className="inline-flex items-center gap-2 rounded-2xl bg-peach px-6 py-2.5 text-sm font-black text-white shadow-[0_3px_0_var(--color-peach-dark)] hover:-translate-y-0.5 active:translate-y-0.5 transition-all cursor-pointer"
        >
          <Save className="h-4 w-4" />
          <span>Lưu thay đổi JSON</span>
        </button>
      </div>

      {jsonError && (
        <div className="rounded-2xl bg-peach-soft p-4 text-xs font-black text-peach-dark border border-peach/30 flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{jsonError}</span>
        </div>
      )}

      {jsonSuccess && (
        <div className="rounded-2xl bg-mint-soft p-3 text-xs font-black text-mint-dark">
          ✓ Cú pháp JSON hợp lệ! Dữ liệu đã được áp dụng trực tiếp cho Unit {unitId}.
        </div>
      )}

      <textarea
        rows={18}
        value={rawJsonText}
        onChange={(e) => {
          setRawJsonText(e.target.value);
          setJsonError(null);
        }}
        spellCheck={false}
        className="w-full rounded-2xl bg-ink p-4 font-mono text-xs text-mint leading-relaxed border-2 border-banana-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-banana"
      />
    </div>
  );
}
