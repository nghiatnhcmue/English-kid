import { useState, useMemo } from 'react';
import { Download, FileEdit, Plus, RotateCcw, Trash2 } from 'lucide-react';
import { getUnitRaw, listUnits } from '../utils/data.js';
import { store } from '../utils/storage.js';
import { normUnitId, unitNumberOf } from '../utils/unitId.js';
import UnitMetaModal from './teacher/editor/UnitMetaModal.jsx';
import VocabEditorTab from './teacher/editor/VocabEditorTab.jsx';
import VideoEditorTab from './teacher/editor/VideoEditorTab.jsx';
import GrammarEditorTab from './teacher/editor/GrammarEditorTab.jsx';
import ReadingEditorTab from './teacher/editor/ReadingEditorTab.jsx';
import WritingEditorTab from './teacher/editor/WritingEditorTab.jsx';
import RawJsonEditorTab from './teacher/editor/RawJsonEditorTab.jsx';

export default function TeacherDataEditor() {
  const [refreshKey, setRefreshKey] = useState(0);
  const units = useMemo(() => listUnits(), [refreshKey]);
  const [selectedUnitId, setSelectedUnitId] = useState(1);
  const [activeSubTab, setActiveSubTab] = useState('vocab');

  const currentUnit = useMemo(() => getUnitRaw(selectedUnitId), [selectedUnitId, refreshKey]);
  const isCustomized = useMemo(() => !!store().getCustomUnit(selectedUnitId), [selectedUnitId, refreshKey]);
  const writingData = useMemo(
    () => store().getUnitWriting(selectedUnitId, currentUnit?.writing),
    [selectedUnitId, currentUnit?.writing, refreshKey],
  );
  const writingItems = writingData?.items || [];

  const [unitModal, setUnitModal] = useState({ open: false, isEditing: false, form: null });
  const [notify, setNotify] = useState(null);

  const showNotification = (msg, tone = 'mint') => {
    setNotify({ msg, tone });
    setTimeout(() => setNotify(null), 3000);
  };

  const reloadData = () => setRefreshKey((k) => k + 1);

  const handleOpenCreateUnit = () => {
    const numericIds = units.map((u) => Number(u.unitId)).filter(Number.isFinite);
    const nextId = numericIds.length > 0 ? Math.max(...numericIds, 12) + 1 : 13;
    setUnitModal({
      open: true,
      isEditing: false,
      form: {
        unitId: nextId,
        titleEn: '',
        titleVi: '',
        topic: '',
        emoji: '🤖',
        color: '#FFC83D',
        description: '',
      },
    });
  };

  const handleOpenEditUnit = (unit) => {
    setUnitModal({
      open: true,
      isEditing: true,
      form: {
        unitId: unit.unitId,
        titleEn: unit.titleEn || unit.title || '',
        titleVi: unit.titleVi || '',
        topic: unit.topic || '',
        emoji: unit.emoji || '📘',
        color: unit.color || '#FFC83D',
        description: unit.description || '',
      },
    });
  };

  const handleSaveUnit = (form) => {
    if (!form.titleEn.trim() || !form.titleVi.trim()) {
      return showNotification('Vui lòng nhập đầy đủ tiêu đề Tiếng Anh và Tiếng Việt cho Unit!', 'peach');
    }
    const newId = Number(form.unitId);
    if (!unitModal.isEditing && (newId <= 12 || listUnits(6).some((u) => u.unitId === newId))) {
      return showNotification(`Unit ${newId} đã có. Hãy chọn số từ 13 trở lên và chưa dùng.`, 'peach');
    }
    const saved = store().saveCreatedUnit({ ...form, unitId: newId });
    setSelectedUnitId(saved.unitId);
    setUnitModal((prev) => ({ ...prev, open: false }));
    reloadData();
    showNotification(
      unitModal.isEditing
        ? `✅ Đã cập nhật thành công thông tin Unit ${saved.unitId}!`
        : `🎉 Đã tạo thành công Unit ${saved.unitId}: ${saved.titleEn}!`,
      'mint',
    );
  };

  const handleDeleteCustomUnit = (uId, unitTitle) => {
    if (
      !window.confirm(
        `Thầy cô có chắc chắn muốn xóa vĩnh viễn Unit ${uId} (${unitTitle || 'Tự tạo'}) không?`,
      )
    ) {
      return;
    }
    store().deleteCreatedUnit(uId);
    const remaining = listUnits();
    setSelectedUnitId(remaining[0]?.unitId || 1);
    reloadData();
    showNotification(`🗑️ Đã xóa thành công Unit ${uId}!`, 'mint');
  };

  const handleResetUnit = () => {
    if (
      window.confirm(
        `Thầy/Cô có chắc chắn muốn KHÔI PHỤC Unit ${selectedUnitId} về dữ liệu gốc SGK? Các từ và bài tập tự thêm ở Unit này sẽ được xóa.`,
      )
    ) {
      store().resetUnit(selectedUnitId);
      reloadData();
      showNotification(`Đã khôi phục Unit ${selectedUnitId} về nguyên bản SGK!`);
    }
  };

  const handleExportUnitJson = () => {
    const dataStr =
      'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(currentUnit, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `unit${selectedUnitId}_custom.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const SUB_TABS = [
    { id: 'vocab', label: `Từ vựng (${currentUnit?.vocabularies?.length || 0})`, icon: '📝' },
    { id: 'videos', label: `Video bài giảng (${currentUnit?.videos?.length || 0})`, icon: '🎬' },
    {
      id: 'grammar',
      label: `Ngữ pháp & Trắc nghiệm (${currentUnit?.grammar?.quiz?.length || 0})`,
      icon: '📐',
    },
    {
      id: 'reading',
      label: `Bài Đọc hiểu (${currentUnit?.reading?.questions?.length || 0} câu)`,
      icon: '📖',
    },
    { id: 'writing', label: `Bài Viết & Điền khuyết (${writingItems.length} câu)`, icon: '✍️' },
    { id: 'raw_json', label: 'Chuyên gia: Soạn JSON thô', icon: '💻' },
  ];

  return (
    <div className="flex flex-col gap-6">
      {notify && (
        <div
          className={`flex items-center justify-between rounded-2xl p-4 text-sm font-black shadow-md transition-all ${
            notify.tone === 'mint' ? 'bg-mint text-white' : 'bg-peach text-white'
          }`}
        >
          <span>✓ {notify.msg}</span>
          <button type="button" onClick={() => setNotify(null)} className="opacity-75 hover:opacity-100">
            ✕
          </button>
        </div>
      )}

      <div className="rounded-3xl bg-white p-6 shadow-xs border-2 border-banana-soft flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div className="flex flex-col md:flex-row md:items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 flex-wrap">
            <label className="text-base font-black text-ink whitespace-nowrap">
              Chọn Unit cần chỉnh sửa:
            </label>
            <select
              value={selectedUnitId}
              onChange={(e) => setSelectedUnitId(normUnitId(e.target.value))}
              className="rounded-2xl bg-cream px-4 py-2.5 text-base font-black text-ink border border-banana-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-banana cursor-pointer"
            >
              {units.map((u) => (
                <option key={u.unitId} value={u.unitId}>
                  Unit {unitNumberOf(u)}: {u.title || u.titleEn} ({u.titleVi}){' '}
                  {u.isCustomUnit ? '🌟 [Tự tạo]' : ''}
                </option>
              ))}
            </select>
          </div>

          <span
            className={`rounded-full px-3 py-1 text-xs font-black uppercase tracking-wider ${
              currentUnit?.isCustomUnit
                ? 'bg-purple-100 text-purple-700 border border-purple-200'
                : isCustomized
                ? 'bg-peach text-white shadow-xs'
                : 'bg-mint-soft text-mint-dark'
            }`}
          >
            {currentUnit?.isCustomUnit
              ? '🌟 Unit Thầy Cô tự tạo'
              : isCustomized
              ? '✏️ Đã có dữ liệu tùy biến riêng'
              : '📖 Dữ liệu gốc SGK'}
          </span>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={handleOpenCreateUnit}
              className="inline-flex items-center gap-1.5 rounded-2xl bg-mint px-3.5 py-2 text-xs sm:text-sm font-black text-white hover:bg-mint-dark transition-all cursor-pointer shadow-[0_3px_0_#58b292]"
            >
              <Plus className="h-4 w-4" />
              <span>Thêm Unit Mới</span>
            </button>

            {currentUnit?.isCustomUnit && (
              <>
                <button
                  type="button"
                  onClick={() => handleOpenEditUnit(currentUnit)}
                  className="inline-flex items-center gap-1.5 rounded-2xl bg-banana px-3 py-2 text-xs sm:text-sm font-black text-ink hover:bg-banana-dark transition-all cursor-pointer shadow-xs"
                >
                  <FileEdit className="h-4 w-4" />
                  <span>Sửa Unit</span>
                </button>
                <button
                  type="button"
                  onClick={() =>
                    handleDeleteCustomUnit(currentUnit.unitId, currentUnit.titleEn || currentUnit.title)
                  }
                  className="inline-flex items-center gap-1.5 rounded-2xl bg-rose-soft px-3 py-2 text-xs sm:text-sm font-black text-rose-700 hover:bg-rose-500 hover:text-white transition-all cursor-pointer border border-rose-200"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Xóa Unit</span>
                </button>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={handleExportUnitJson}
            className="inline-flex items-center gap-1.5 rounded-2xl bg-cream px-3.5 py-2 text-xs font-black text-ink hover:bg-banana-soft transition-all cursor-pointer border border-banana-soft"
          >
            <Download className="h-4 w-4 text-sky-dark" />
            <span>Tải JSON Unit</span>
          </button>

          {!currentUnit?.isCustomUnit && isCustomized && (
            <button
              type="button"
              onClick={handleResetUnit}
              className="inline-flex items-center gap-1.5 rounded-2xl bg-peach-soft px-3.5 py-2 text-xs font-black text-peach-dark hover:bg-peach hover:text-white transition-all cursor-pointer"
            >
              <RotateCcw className="h-4 w-4" />
              <span>Khôi phục SGK gốc</span>
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {SUB_TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveSubTab(tab.id)}
            className={`flex items-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-black transition-all cursor-pointer ${
              activeSubTab === tab.id
                ? 'bg-banana text-ink shadow-[0_3px_0_var(--color-banana-dark)] scale-[1.02]'
                : 'bg-white text-ink-soft hover:bg-cream border border-banana-soft/60'
            }`}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {activeSubTab === 'vocab' && (
        <VocabEditorTab
          unitId={selectedUnitId}
          vocabularies={currentUnit?.vocabularies || []}
          onReload={reloadData}
          onNotify={showNotification}
        />
      )}
      {activeSubTab === 'videos' && (
        <VideoEditorTab
          unitId={selectedUnitId}
          videos={currentUnit?.videos || []}
          onReload={reloadData}
          onNotify={showNotification}
        />
      )}
      {activeSubTab === 'grammar' && (
        <GrammarEditorTab
          unitId={selectedUnitId}
          grammar={currentUnit?.grammar}
          onReload={reloadData}
          onNotify={showNotification}
        />
      )}
      {activeSubTab === 'reading' && (
        <ReadingEditorTab
          unitId={selectedUnitId}
          reading={currentUnit?.reading}
          onReload={reloadData}
          onNotify={showNotification}
        />
      )}
      {activeSubTab === 'writing' && (
        <WritingEditorTab
          unitId={selectedUnitId}
          baseWriting={currentUnit?.writing}
          writingItems={writingItems}
          onReload={reloadData}
          onNotify={showNotification}
        />
      )}
      {activeSubTab === 'raw_json' && (
        <RawJsonEditorTab
          unitId={selectedUnitId}
          currentUnit={currentUnit}
          onReload={reloadData}
          onNotify={showNotification}
        />
      )}

      <UnitMetaModal
        isOpen={unitModal.open}
        isEditing={unitModal.isEditing}
        initialForm={unitModal.form}
        onClose={() => setUnitModal((prev) => ({ ...prev, open: false }))}
        onSave={handleSaveUnit}
      />
    </div>
  );
}
