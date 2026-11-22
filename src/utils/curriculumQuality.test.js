// Kiểm định nội dung 12 khối lớp: chặn tái phát các lỗi khuôn mẫu đã sửa (11/2026).
// Dữ liệu sinh bởi scripts/curriculum_generator/build_all.py (+ quality_pass.py).
import { describe, it, expect } from 'vitest';

const grades = import.meta.glob('../data/grades/grade*.json', { eager: true, import: 'default' });
const ALL = Object.values(grades).sort((a, b) => a.grade - b.grade);

// Dấu tiếng Việt (không gồm é/è đơn lẻ để không bắt nhầm tên như "Pelé")
const VI = /[ăâđêôơưạảãáàẹẻẽịỉĩíìọỏõóòụủũúùỵỷỹýỳ]/i;
const ENGLISH_FIELDS = ['sentenceEn', 'targetSentence', 'exampleEn', 'correctSentence', 'transcript', 'passage', 'tongueTwister'];
const TEMPLATES = [
  'We are discussing', 'We enjoy learning about', 'In today\'s academic debate', 'This is our ', 'I would like some',
  'We are learning about', 'We are examining', 'We learn about', 'This is my new ', 'Which option best fits',
  'Choose the best answer for Unit', "What's this? - It is a ______", 'Practice speaking about', 'Critical thinking on',
  'Welcome to our podcast', 'Welcome to our lecture', 'Throughout the school year, students explore',
  'In contemporary education, understanding', 'Learning English helps us connect', 'Hello, my name is Linh. I am in class 3A',
  'Have you prepared for our', 'Nội dung cung cấp kiến thức',
];
// Các từ mà phiên âm IPA trùng mặt chữ (hợp lệ)
const IPA_SAME_AS_SPELLING = new Set(['pen', 'bed', 'hen', 'desk', 'red', 'tent', 'trek', 'dress', 'spell', 'bell', 'egg', 'leg', 'ten', 'net', 'help', 'vest']);

function walk(node, path, visit) {
  if (Array.isArray(node)) node.forEach((x, i) => walk(x, `${path}[${i}]`, visit));
  else if (node && typeof node === 'object') for (const [k, v] of Object.entries(node)) {
    visit(k, v, `${path}.${k}`);
    walk(v, `${path}.${k}`, visit);
  }
}

describe.each(ALL.map((g) => [g.grade, g]))('Lớp %i', (grade, data) => {
  it('câu tiếng Anh không chứa tiếng Việt và không còn câu khuôn mẫu', () => {
    const bad = [];
    for (const u of data.units) {
      walk(u, `U${u.unit}`, (k, v, p) => {
        if (typeof v !== 'string' || !ENGLISH_FIELDS.includes(k)) return;
        if (VI.test(v)) bad.push(`${p}: ${v.slice(0, 80)}`);
        const t = TEMPLATES.find((m) => v.includes(m));
        if (t) bad.push(`${p} (khuôn mẫu "${t}")`);
      });
      walk(u, `U${u.unit}`, (k, v, p) => {
        if (typeof v === 'string' && /translation|meaningVi/.test(k) && TEMPLATES.some((m) => v.includes(m))) bad.push(`${p}: ${v.slice(0, 80)}`);
      });
    }
    expect(bad).toEqual([]);
  });

  it('từ vựng có nghĩa tiếng Việt và phiên âm thật', () => {
    const bad = [];
    for (const u of data.units) {
      for (const v of u.vocabularies || []) {
        const w = String(v.word).toLowerCase();
        if (!v.meaning || /trong tiếng Anh$/i.test(v.meaning) || v.meaning.toLowerCase() === w) bad.push(`U${u.unit} ${v.word}: nghĩa "${v.meaning}"`);
        if (!v.phonetic || (v.phonetic === `/${w}/` && !IPA_SAME_AS_SPELLING.has(w))) bad.push(`U${u.unit} ${v.word}: phiên âm ${v.phonetic}`);
        if (!v.exampleEn || !v.exampleVi) bad.push(`U${u.unit} ${v.word}: thiếu câu ví dụ`);
      }
    }
    expect(bad).toEqual([]);
  });

  it('phiên âm câu không có "/.../" hay chữ tiếng Việt', () => {
    const bad = [];
    for (const u of data.units) {
      walk(u, `U${u.unit}`, (k, v, p) => {
        if (k === 'phonetic' && typeof v === 'string' && (v.includes('...') || VI.test(v))) bad.push(`${p}: ${v}`);
      });
    }
    expect(bad).toEqual([]);
  });

  it('câu trắc nghiệm có đáp án hợp lệ, lựa chọn không trùng', () => {
    const bad = [];
    const check = (q, where) => {
      if (!q || !Array.isArray(q.options)) return;
      const norm = q.options.map((o) => String(o).trim().toLowerCase());
      if (q.options.length < 2) bad.push(`${where}: < 2 lựa chọn`);
      if (new Set(norm).size !== norm.length) bad.push(`${where}: lựa chọn trùng ${JSON.stringify(q.options)}`);
      const ok = Number.isInteger(q.answerIndex)
        ? q.answerIndex >= 0 && q.answerIndex < q.options.length
        : q.blankWord != null && norm.includes(String(q.blankWord).trim().toLowerCase());
      if (!ok) bad.push(`${where}: đáp án không hợp lệ`);
    };
    for (const u of data.units) {
      (u.grammar?.quiz || []).forEach((q, i) => check(q, `U${u.unit} grammar#${i}`));
      (u.reading?.questions || []).forEach((q, i) => check(q, `U${u.unit} reading#${i}`));
      check(u.listening, `U${u.unit} listening`);
      for (const q of u.pronunciation?.practiceQuiz || []) {
        if (!(q.options || []).includes(q.correctSound)) bad.push(`U${u.unit} phát âm ${q.word}: đáp án ${q.correctSound} không có trong lựa chọn`);
      }
    }
    expect(bad).toEqual([]);
  });

  it('bài nghe "Which word do you hear?": đáp án có trong bài nghe', () => {
    const bad = [];
    for (const u of data.units) {
      const L = u.listening;
      if (L?.question !== 'Which word do you hear?') continue;
      const ans = L.options[L.answerIndex];
      if (!new RegExp(`(?<![A-Za-z])${ans.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?![A-Za-z])`, 'i').test(L.transcript)) bad.push(`U${u.unit}: ${ans}`);
    }
    expect(bad).toEqual([]);
  });

  it('trạm Phát âm: có câu luyện, đáp án đúng với phiên âm của từ', () => {
    const bad = [];
    for (const u of data.units) {
      const quiz = u.pronunciation?.practiceQuiz || [];
      if (!quiz.length) bad.push(`U${u.unit}: không có câu luyện`);
      for (const q of quiz) {
        const ipa = String(q.phonetic || '').replace(/[/ˌ]/g, '');
        if (!ipa) continue;
        const m = /^\/(.+)\/$/.exec(q.correctSound || '');
        if (m && !ipa.replace(/ˈ/g, '').includes(m[1])) bad.push(`U${u.unit} ${q.word} ${q.phonetic}: không có âm ${q.correctSound}`);
        const st = /^Âm tiết (\d)$/.exec(q.correctSound || '');
        if (st && !ipa.includes('ˈ')) bad.push(`U${u.unit} ${q.word}: không có dấu trọng âm`);
      }
      for (const key of ['sound1', 'sound2']) {
        for (const w of u.pronunciation?.[key]?.words || []) {
          if (typeof w !== 'object' || !w.word) bad.push(`U${u.unit} ${key}: từ ví dụ sai định dạng ${JSON.stringify(w)}`);
        }
      }
    }
    expect(bad).toEqual([]);
  });

  it('câu sắp xếp: các từ ghép lại đúng bằng câu đáp án', () => {
    const bad = [];
    for (const u of data.units) {
      for (const it of u.writing?.items || []) {
        if (it.type !== 'unscramble') continue;
        const a = [...it.scrambledWords].map((x) => x.toLowerCase()).sort().join(' ');
        const b = String(it.correctSentence).split(/\s+/).map((x) => x.toLowerCase()).sort().join(' ');
        if (a !== b && it.scrambledWords.join(' ').toLowerCase() !== String(it.correctSentence).toLowerCase()) bad.push(`U${u.unit} ${it.id}`);
      }
    }
    expect(bad).toEqual([]);
  });
});
