import { normUnitId } from '../unitId.js';
import { KEYS } from './io.js';
import {
  cleanGrammarQuestion,
  cleanReadingQuestion,
  cleanWritingItem,
  normalizeWritingContainer,
  withLegacyWritingFields,
} from './normalizers.js';

function dispatchCurriculumUpdated(detail) {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('curriculum-updated', { detail }));
  }
}

export function createCurriculumSlice(ctx, api) {
  const { read, write } = ctx;

  const saveGrammarQuizList = (unitId, nextList) => {
    const customUnit = api.getCustomUnit(unitId) || {};
    const currentGrammar = { ...(customUnit.grammar || {}), quiz: nextList };
    api.saveCustomUnit(unitId, { grammar: currentGrammar });
    return nextList;
  };

  return {
    // ---- Dữ liệu bài học tùy biến của Giáo viên (Custom Units) ----
    getCustomUnits() {
      const units = read(KEYS.CUSTOM_UNITS, {});
      if (!units || typeof units !== 'object' || Array.isArray(units)) return {};
      const clean = {};
      for (const [k, v] of Object.entries(units)) {
        if (normUnitId(k) !== null && k !== 'NaN' && k !== 'null' && k !== 'undefined') {
          clean[k] = v;
        }
      }
      return clean;
    },

    getCustomUnit(unitId) {
      const all = api.getCustomUnits();
      return all[normUnitId(unitId)] || null;
    },

    saveCustomUnit(unitId, data) {
      const all = api.getCustomUnits();
      const numId = normUnitId(unitId);
      all[numId] = { ...(all[numId] || {}), ...data };
      write(KEYS.CUSTOM_UNITS, all);
      dispatchCurriculumUpdated({ unitId: numId });
      return all[numId];
    },

    resetUnit(unitId) {
      const all = api.getCustomUnits();
      const numId = normUnitId(unitId);
      delete all[numId];
      write(KEYS.CUSTOM_UNITS, all);
      dispatchCurriculumUpdated({ unitId: numId });
      return true;
    },

    resetAllUnits() {
      write(KEYS.CUSTOM_UNITS, {});
      dispatchCurriculumUpdated({ all: true });
      return true;
    },

    // ---- Quản lý Thêm/Sửa/Xóa Unit mới do Giáo viên tạo ----
    getCreatedUnits() {
      const list = read(KEYS.CREATED_UNITS, []);
      return Array.isArray(list) ? list : [];
    },

    saveCreatedUnit(unitMeta, initialData = {}) {
      const all = api.getCreatedUnits();
      const numId = Number(unitMeta.unitId);
      const cleanMeta = {
        unitId: numId,
        titleEn: String(unitMeta.titleEn || unitMeta.title || `Unit ${numId}`).trim(),
        title: String(unitMeta.titleEn || unitMeta.title || `Unit ${numId}`).trim(),
        titleVi: String(unitMeta.titleVi || '').trim(),
        topic: String(unitMeta.topic || 'Bài học tự chọn').trim(),
        emoji: String(unitMeta.emoji || '📘').trim(),
        color: String(unitMeta.color || '#FFC83D').trim(),
        description: String(unitMeta.description || 'Bài học bổ trợ do thầy cô biên soạn.').trim(),
        available: true,
        isCustomUnit: true,
        bookVolume: Number(unitMeta.bookVolume) || 2,
        bookPages: String(unitMeta.bookPages || 'Tự chọn').trim(),
        createdAt: unitMeta.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const existingIndex = all.findIndex((u) => u.unitId === numId);
      const updated = [...all];
      if (existingIndex >= 0) {
        updated[existingIndex] = { ...updated[existingIndex], ...cleanMeta };
      } else {
        updated.push(cleanMeta);
      }
      write(KEYS.CREATED_UNITS, updated);

      const currentCustom = api.getCustomUnit(numId) || {};
      api.saveCustomUnit(numId, {
        unitId: numId,
        title: cleanMeta.titleEn,
        titleVi: cleanMeta.titleVi,
        vocabularies: currentCustom.vocabularies || initialData.vocabularies || [],
        grammar: currentCustom.grammar || initialData.grammar || { points: [], quiz: [] },
        pronunciation: currentCustom.pronunciation || initialData.pronunciation || { sounds: [], explanation: '' },
        listenPractice: currentCustom.listenPractice || initialData.listenPractice || { questions: [] },
        reading: currentCustom.reading || initialData.reading || { passage: '', translation: '', questions: [] },
        writing: currentCustom.writing || initialData.writing || { task: '', guide: '', hints: [] },
        videos: currentCustom.videos || initialData.videos || [],
        isCustomUnit: true,
      });

      dispatchCurriculumUpdated({ unitId: numId });
      return cleanMeta;
    },

    deleteCreatedUnit(unitId) {
      const numId = Number(unitId);
      const updated = api.getCreatedUnits().filter((u) => u.unitId !== numId);
      write(KEYS.CREATED_UNITS, updated);
      api.resetUnit(numId);
      dispatchCurriculumUpdated({ unitId: numId, deleted: true });
      return true;
    },

    // ---- Ngân hàng Câu hỏi Trắc nghiệm của Unit ----
    getUnitQuestions(unitId, baseQuiz = []) {
      const customUnit = api.getCustomUnit(unitId);
      if (customUnit?.grammar?.quiz && Array.isArray(customUnit.grammar.quiz)) {
        return customUnit.grammar.quiz;
      }
      return Array.isArray(baseQuiz) ? baseQuiz : [];
    },

    saveUnitQuestion(unitId, questionData, indexToUpdate = -1, baseQuiz = []) {
      const currentList = [...api.getUnitQuestions(unitId, baseQuiz)];
      const cleanQ = cleanGrammarQuestion(questionData);
      if (indexToUpdate >= 0 && indexToUpdate < currentList.length) {
        currentList[indexToUpdate] = cleanQ;
      } else {
        currentList.push(cleanQ);
      }
      return saveGrammarQuizList(unitId, currentList);
    },

    deleteUnitQuestion(unitId, index, baseQuiz = []) {
      const currentList = [...api.getUnitQuestions(unitId, baseQuiz)];
      if (index >= 0 && index < currentList.length) {
        currentList.splice(index, 1);
        return saveGrammarQuizList(unitId, currentList);
      }
      return currentList;
    },

    batchAddUnitQuestions(unitId, questionsArray = [], baseQuiz = []) {
      const currentList = api.getUnitQuestions(unitId, baseQuiz);
      const cleaned = (questionsArray || []).map(cleanGrammarQuestion);
      return saveGrammarQuizList(unitId, [...currentList, ...cleaned]);
    },

    // ---- Quản lý Bài đọc hiểu & Câu hỏi Đọc hiểu của Unit ----
    getUnitReading(unitId, baseReading = null) {
      const customUnit = api.getCustomUnit(unitId);
      if (customUnit?.reading) return customUnit.reading;
      return baseReading || { passage: '', questions: [] };
    },

    saveUnitReadingPassage(unitId, passageData, baseReading = null) {
      const currentReading = api.getUnitReading(unitId, baseReading);
      const updatedReading = {
        ...currentReading,
        title: passageData.title !== undefined ? String(passageData.title).trim() : currentReading.title,
        passage: String(passageData.passage || '').trim(),
        translation:
          passageData.translation !== undefined
            ? String(passageData.translation).trim()
            : currentReading.translation || '',
      };
      api.saveCustomUnit(unitId, { reading: updatedReading });
      return updatedReading;
    },

    saveReadingQuestion(unitId, questionData, indexToUpdate = -1, baseReading = null) {
      const currentReading = api.getUnitReading(unitId, baseReading);
      const currentList = Array.isArray(currentReading.questions) ? [...currentReading.questions] : [];
      const cleanQ = cleanReadingQuestion(questionData, { autoDetectFill: false });
      if (indexToUpdate >= 0 && indexToUpdate < currentList.length) {
        currentList[indexToUpdate] = cleanQ;
      } else {
        currentList.push(cleanQ);
      }
      const updatedReading = { ...currentReading, questions: currentList };
      api.saveCustomUnit(unitId, { reading: updatedReading });
      return updatedReading;
    },

    deleteReadingQuestion(unitId, index, baseReading = null) {
      const currentReading = api.getUnitReading(unitId, baseReading);
      const currentList = Array.isArray(currentReading.questions) ? [...currentReading.questions] : [];
      if (index >= 0 && index < currentList.length) {
        currentList.splice(index, 1);
        const updatedReading = { ...currentReading, questions: currentList };
        api.saveCustomUnit(unitId, { reading: updatedReading });
        return updatedReading;
      }
      return currentReading;
    },

    batchAddReadingQuestions(unitId, questionsArray = [], baseReading = null) {
      const currentReading = api.getUnitReading(unitId, baseReading);
      const currentList = Array.isArray(currentReading.questions) ? [...currentReading.questions] : [];
      const cleaned = (questionsArray || []).map((q) => cleanReadingQuestion(q, { autoDetectFill: true }));
      const updatedReading = { ...currentReading, questions: [...currentList, ...cleaned] };
      api.saveCustomUnit(unitId, { reading: updatedReading });
      return updatedReading;
    },

    // ---- Quản lý Bài tập Viết câu & Điền khuyết (Writing & Cloze) ----
    getUnitWriting(unitId, baseWriting = null) {
      const customUnit = api.getCustomUnit(unitId);
      if (customUnit?.writing) {
        return normalizeWritingContainer(customUnit.writing, unitId);
      }
      if (baseWriting?.correctSentence) {
        return normalizeWritingContainer(baseWriting, unitId);
      }
      return baseWriting || { items: [] };
    },

    saveWritingItem(unitId, itemData, indexToUpdate = -1, baseWriting = null) {
      const currentWriting = api.getUnitWriting(unitId, baseWriting);
      const currentItems = Array.isArray(currentWriting.items) ? [...currentWriting.items] : [];
      const cleanItem = cleanWritingItem(itemData);

      if (indexToUpdate >= 0 && indexToUpdate < currentItems.length) {
        currentItems[indexToUpdate] = cleanItem;
      } else {
        currentItems.push(cleanItem);
      }

      const updatedWriting = withLegacyWritingFields(currentWriting, currentItems);
      api.saveCustomUnit(unitId, { writing: updatedWriting });
      return updatedWriting;
    },

    deleteWritingItem(unitId, index, baseWriting = null) {
      const currentWriting = api.getUnitWriting(unitId, baseWriting);
      const currentItems = Array.isArray(currentWriting.items) ? [...currentWriting.items] : [];
      if (index >= 0 && index < currentItems.length) {
        currentItems.splice(index, 1);
        const updatedWriting = withLegacyWritingFields(currentWriting, currentItems);
        api.saveCustomUnit(unitId, { writing: updatedWriting });
        return updatedWriting;
      }
      return currentWriting;
    },

    batchAddWritingItems(unitId, itemsArray = [], baseWriting = null) {
      const currentWriting = api.getUnitWriting(unitId, baseWriting);
      const currentItems = Array.isArray(currentWriting.items) ? [...currentWriting.items] : [];
      const cleaned = (itemsArray || []).map(cleanWritingItem);
      const updatedWriting = withLegacyWritingFields(currentWriting, [...currentItems, ...cleaned]);
      api.saveCustomUnit(unitId, { writing: updatedWriting });
      return updatedWriting;
    },
  };
}
