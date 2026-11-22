# -*- coding: utf-8 -*-
"""
quality_pass.py
Bước kiểm định nội dung chạy sau khi sinh dữ liệu 12 khối lớp (gọi từ build_all.py).

Vấn đề cần sửa: nhiều trạm học được sinh bằng câu khuôn mẫu, dẫn tới
  - câu tiếng Anh chứa tiếng Việt ("We are discussing âm nhạc và nghệ thuật…") – học sinh không thể đọc/được chấm,
  - câu sai ngữ pháp / vô nghĩa ("We are learning about My today", "I would like some kitten"),
  - phiên âm giả ("/.../", "/ðɪs ɪz ˈaʊə hello æt skuːl/"),
  - câu hỏi luyện âm sai ("chore" có âm /br/), bài đọc/bài nghe giống hệt nhau ở mọi Unit.

Cách sửa: dựng lại các trạm khuôn mẫu từ dữ liệu ĐÃ SOẠN CHUẨN của chính Unit đó (từ vựng, câu ví dụ
và bản dịch, mẫu câu SGK). Phiên âm cả câu chỉ được ghép khi MỌI từ đều có trong từ điển; nếu không thì để trống
(giao diện tự ẩn) – không bao giờ in phiên âm đoán mò.
Dữ liệu soạn tay (Lớp 6, các trạm không theo khuôn mẫu) được giữ nguyên.
"""
import re

try:
    from .content_data import PATTERN_QA, G7_READING_VI, FUNCTION_IPA, STRESS_BANK
except ImportError:
    from content_data import PATTERN_QA, G7_READING_VI, FUNCTION_IPA, STRESS_BANK

VI_RE = re.compile(r"[ăâđêôơưạảãáàẹẻẽéèịỉĩíìọỏõóòụủũúùỵỷỹýỳ]", re.I)
IPA_CHARS = re.compile(r"[əɪʊæʌɒɔːɑɜθðʃʒŋˈˌ]")

TEMPLATE_MARKERS = [
    # ngữ pháp
    "Which option best fits", "Choose the best answer for Unit", "What's this? - It is a ______", "Look at the ______",
    "I like ______.", "Which word from Unit", "Which vocabulary word from Unit", "Choose the correct sentence related to",
    "Choose the grammatically correct sentence for Unit", "Point to the ball. ->",
    # nói
    "We are discussing", "We enjoy learning about", "This is our ", "I would like some", "In today's academic debate",
    "Practice speaking about", "Understanding ", "Critical thinking on", "We can practice using", "I can see a ",
    "Touch the ", "Pass me the ", "I have a new ", "Have you prepared for our", "Let's talk about", "Have you analyzed",
    "Look! A ", "Do you like ", "Fine, thanks. Look at the", "Yes, it is a ", "I learned many interesting things about",
    "I found many interesting facts about", "We will get great marks", "Let's practice our presentation",
    "Let's present our project", "provides deep insights", "That's a great idea! I'm ready.",
    # nghe
    "Welcome to our podcast", "Welcome to our lecture", "Good morning class. Today we explore", "Hi everyone, my name is Mai",
    "Hi, I am Nam. Today is a sunny day", "Hello, I am Bill. Look at my", "In today's lesson, our teacher explains",
    # đọc
    "Learning English helps us connect", "Throughout the school year, students explore", "In contemporary education, understanding",
    "Hello, my name is Linh. I am in class 3A", "This is my school. Look at the playground", "Welcome to our ",
    # viết
    "This is my new ", "We are learning about", "We are examining", "We learn about", "very much", "We learn valuable lessons",
    # luyện âm
    "Smart students", "Scholars articulate", "on the table.", "Peter likes",
]


def has_vi(s):
    return bool(VI_RE.search(s or ""))


def templated(s):
    s = s or ""
    return has_vi(s) or any(m in s for m in TEMPLATE_MARKERS)


def strip_ipa(p):
    return str(p or "").strip().strip("/").strip()


def real_ipa(p, word=""):
    inner = strip_ipa(p)
    if not inner or inner == "..." or inner.lower() == str(word).lower():
        return False
    return bool(IPA_CHARS.search(inner)) or not re.search(r"[cqxy]|(.)\1|ee|oo|ou|ea", inner)


# ---------------------------------------------------------------- phiên âm
WORD_RE = re.compile(r"[A-Za-z][A-Za-z'\-]*")


class IpaDict:
    def __init__(self):
        self.d = {k.lower(): v for k, v in FUNCTION_IPA.items() if " " not in k and not k.endswith((",", ".", "!"))}
        self.phrases = {}

    def add(self, word, ipa):
        w = str(word or "").strip().lower()
        p = strip_ipa(ipa)
        if not w or not real_ipa(ipa, w):
            return
        if " " in w:
            self.phrases.setdefault(w, p)
        else:
            self.d.setdefault(w, p)

    def harvest(self, sentence, phonetic):
        """Ghép từ ↔ phiên âm từ các câu đã soạn chuẩn (chỉ khi số từ khớp đúng)."""
        p = strip_ipa(phonetic)
        if not p or "..." in p or bad_phonetic(sentence, phonetic, self):
            return
        words = [w.lower() for w in WORD_RE.findall(sentence or "")]
        toks = p.split()
        if len(words) == len(toks):
            for w, t in zip(words, toks):
                self.d.setdefault(w, t)

    def sentence(self, s):
        words = [w.lower() for w in WORD_RE.findall(s or "")]
        out, i = [], 0
        while i < len(words):
            hit = None
            for n in (3, 2):
                ph = " ".join(words[i:i + n])
                if len(words[i:i + n]) == n and ph in self.phrases:
                    hit = (self.phrases[ph], n)
                    break
            if hit:
                out.append(hit[0])
                i += hit[1]
                continue
            w = words[i]
            if w in self.d:
                out.append(self.d[w])
            elif w.endswith("'s") and w[:-2] in self.d:
                out.append(self.d[w[:-2]] + "z")
            else:
                return ""
            i += 1
        return "/" + " ".join(out) + "/" if out else ""


def bad_phonetic(sentence, phonetic, ipa=None):
    p = strip_ipa(phonetic)
    if not p:
        return False
    if "..." in p or has_vi(p):
        return True
    words = {w.lower() for w in WORD_RE.findall(sentence or "")}
    for t in p.split():
        if re.fullmatch(r"[a-z]{3,}", t) and t in words:
            known = ipa.d.get(t) if ipa else None
            if (known and known != t) or re.search(r"[cqxy]|(.)\1|ee|oo|ou|ea", t):
                return True
    return False


# ---------------------------------------------------------------- âm vị
PHONEMES = ["tʃ", "dʒ", "eɪ", "aɪ", "ɔɪ", "aʊ", "əʊ", "ɪə", "eə", "ʊə", "iː", "ɑː", "ɔː", "uː", "ɜː"]


def phonemes(ipa):
    s = re.sub(r"[ˈˌ.\s/]", "", ipa or "")
    out, i = [], 0
    while i < len(s):
        two = s[i:i + 2]
        if two in PHONEMES:
            out.append(two)
            i += 2
        else:
            out.append(s[i])
            i += 1
    return out


def has_sound(ipa, sym):
    a, b = phonemes(ipa), phonemes(sym)
    if not b:
        return False
    return any(a[i:i + len(b)] == b for i in range(len(a) - len(b) + 1))


CONTRAST = {
    "b": "p", "p": "b", "k": "ɡ", "ɡ": "k", "æ": "e", "e": "æ", "d": "t", "t": "d", "f": "v", "v": "f", "h": "w",
    "w": "v", "aɪ": "eɪ", "eɪ": "aɪ", "iː": "ɪ", "ɪ": "iː", "m": "n", "n": "m", "l": "r", "r": "l", "s": "z", "z": "s",
    "tʃ": "ʃ", "ʃ": "s", "dʒ": "j", "j": "dʒ", "aʊ": "əʊ", "əʊ": "aʊ", "ʊ": "uː", "uː": "ʊ", "ɒ": "ɔː", "ɔː": "ɒ",
    "ʌ": "ɑː", "ɑː": "ʌ", "ə": "ɜː", "ɜː": "ə", "θ": "ð", "ð": "θ", "ŋ": "n",
}


VOWELS = {"iː", "ɪ", "e", "æ", "ɑː", "ɒ", "ɔː", "ʊ", "uː", "ʌ", "ɜː", "ə", "eɪ", "aɪ", "ɔɪ", "aʊ", "əʊ", "ɪə", "eə", "ʊə",
          "i", "u", "ɑ", "ɔ", "ɜ", "a", "o"}


def syllables(toks):
    n = sum(1 for t in toks if t in VOWELS)
    # phụ âm âm tiết cuối từ: /ˈæpl/, /ˈkɪtn/
    if len(toks) >= 2 and toks[-1] in ("l", "n") and toks[-2] not in VOWELS:
        n += 1
    return n


def stress_of(ipa):
    """(số âm tiết, âm tiết mang trọng âm chính) của MỘT từ, hoặc None."""
    raw = strip_ipa(ipa).replace("ˌ", "")
    if " " in raw or "ˈ" not in raw:
        return None
    total = syllables(phonemes(raw))
    before = raw[: raw.index("ˈ")]
    idx = sum(1 for t in phonemes(before) if t in VOWELS) + 1
    if 2 <= total <= 4 and idx <= total:
        return total, idx
    return None


def parse_symbols(pair):
    syms = []
    for m in re.findall(r"/([^/]+)/", pair or ""):
        m = m.strip().strip(",")
        if m and not re.search(r"\s", m) and len(m) <= 4 and not has_vi(m):
            syms.append(m.replace("g", "ɡ"))
    return list(dict.fromkeys(syms))


# ---------------------------------------------------------------- tiện ích câu
def clean_sentence(s):
    return re.sub(r"\s+", " ", str(s or "")).strip()


def blank(sentence, word):
    """Thay đúng cả từ/cụm từ bằng ______ (không đục lỗ giữa từ khác).
    Trả về (câu đã đục lỗ, dạng chữ đúng như trong câu) hoặc None."""
    pat = re.compile(r"(?<![A-Za-z])" + re.escape(word) + r"(?![A-Za-z])", re.I)
    m = pat.search(sentence)
    if not m:
        return None
    return sentence[:m.start()] + "______" + sentence[m.end():], m.group(0)


def fit_case(answer_surface, options):
    """Chỗ trống ở đầu câu: viết hoa chữ đầu của mọi lựa chọn cho đồng nhất."""
    if answer_surface[:1].isupper():
        return [o[:1].upper() + o[1:] for o in options]
    return options


def is_person(v):
    return str(v.get("meaning", "")).startswith("Bạn ") or "(tên riêng)" in str(v.get("meaning", ""))


def contains_word(text, w):
    return bool(re.search(r"(?<![A-Za-z])" + re.escape(w) + r"(?![A-Za-z])", text or "", re.I))


def good_examples(vocab):
    out = []
    for v in vocab:
        if is_person(v):
            continue
        en, vi = clean_sentence(v.get("exampleEn")), clean_sentence(v.get("exampleVi"))
        if en and vi and not has_vi(en) and not templated(en) and not re.match(r"^(Look at the|Hãy nhìn)", en):
            out.append((v, en, vi))
    return out


def article(word, ipa):
    first = phonemes(ipa)[:1]
    vowels = {"æ", "e", "ɪ", "ɒ", "ʌ", "ʊ", "ə", "a", "i", "o", "u", "ɔ", "ɑ", "ɜ", "eɪ", "aɪ", "ɔɪ", "aʊ", "əʊ", "ɪə", "eə", "iː", "ɑː", "ɔː", "uː", "ɜː"}
    return "an" if first and (first[0] in vowels or first[0][0] in "aeiouæɪɒʌʊəɔɑɜ") else "a"


UNCOUNTABLE = {"popcorn", "pasta", "cheese", "sand", "yogurt", "water", "rice", "milk", "bread", "juice", "seafood",
               "fruit", "homework", "time", "music", "art", "chess", "football", "volleyball", "badminton", "fire", "danger"}


def countable_nouns(vocab):
    out = []
    for v in vocab:
        w = v.get("word", "")
        if v.get("wordType") != "Danh từ" or " " in w or w[:1].isupper() or w.lower() in UNCOUNTABLE:
            continue
        if w.endswith("s") and not w.endswith(("ss", "us")):
            continue
        if real_ipa(v.get("phonetic"), w):
            out.append(v)
    return out


def distractors(answer, candidates, n=3, key=lambda x: x):
    seen = {str(answer).strip().lower()}
    out = []
    for c in candidates:
        k = str(key(c)).strip()
        if k and k.lower() not in seen:
            seen.add(k.lower())
            out.append(k)
        if len(out) == n:
            break
    return out


def rotate(lst, k):
    if not lst:
        return lst
    k %= len(lst)
    return lst[k:] + lst[:k]


# ---------------------------------------------------------------- dựng lại từng trạm
def build_grammar_quiz(g, u, ex, pool_words, pool_meanings, qa_answers):
    quiz = []
    for (q, _, qvi), (a, _, avi) in PATTERN_QA.get(g, {}).get(u["unit"], [])[:2]:
        # Không lấy câu trả lời của một câu hỏi giống hệt (VD "What's this?" ở Unit khác) làm phương án sai
        pool = [a2 for q2, a2 in rotate(qa_answers, u["unit"]) if q2.lower() != q.lower() and a2 != a]
        opts = [a] + distractors(a, pool, 3)
        quiz.append({
            "question": f"Choose the correct answer: \"{q}\"",
            "options": opts,
            "answerIndex": 0,
            "explain": f"\"{q}\" ({qvi}) – \"{a}\" ({avi})",
        })
    unit_words = [v["word"] for v in u.get("vocabularies", []) if not is_person(v)]
    for v, en, vi in ex:
        if len(quiz) >= 4:
            break
        hit = blank(en, v["word"])
        if not hit:
            continue
        b, surface = hit
        others = [w for w in unit_words if w != v["word"]] + rotate(pool_words, len(quiz) * 7 + u["unit"])
        quiz.append({
            # Kèm nghĩa tiếng Việt của cả câu: tránh câu mơ hồ kiểu "I like ______." (từ nào cũng đúng)
            "question": f"{b} ({vi})",
            "options": fit_case(surface, [v["word"]] + distractors(v["word"], others, 3)),
            "answerIndex": 0,
            "explain": f"Câu đầy đủ: \"{en}\"",
        })
    vocab = u.get("vocabularies", [])
    for v in [x for x in vocab if not is_person(x)][:2]:
        if len(quiz) >= 5:
            break
        m = v.get("meaning", "")
        if not m or not has_vi(m) and m.lower() == v["word"].lower():
            continue
        others = [x.get("meaning", "") for x in vocab if x is not v and not is_person(x)] + rotate(pool_meanings, u["unit"] * 3)
        quiz.append({
            "question": f"What does \"{v['word']}\" mean?",
            "options": [m] + distractors(m, others, 3),
            "answerIndex": 0,
            "explain": f"\"{v['word']}\" {v.get('phonetic', '')} nghĩa là \"{m}\".",
        })
    return [q for q in quiz if len(q["options"]) == 4]


def build_pron(g, u, pron, word_bank, ipa):
    pron = dict(pron or {})
    syms = parse_symbols(pron.get("pair", ""))

    def valid(q):
        cs = parse_symbols(q.get("correctSound", ""))
        p = q.get("phonetic") or ipa.d.get(str(q.get("word", "")).lower()) or ""
        return bool(cs) and q.get("correctSound") in (q.get("options") or []) and has_sound(p, cs[0])

    if pron.get("custom") and pron.get("practiceQuiz"):
        return pron  # bài soạn tay (ngữ điệu, từ đồng âm…): giữ nguyên
    if pron.get("practiceQuiz") and all(valid(q) for q in pron["practiceQuiz"]) and not templated(pron.get("tongueTwister")):
        return pron
    if not syms:
        # Bài trọng âm / ngữ điệu / nối âm…: luyện "trọng âm rơi vào âm tiết nào" (tính từ dấu ˈ trong IPA)
        pool = [v for v in list(u.get("vocabularies", [])) + word_bank if " " not in v.get("word", "") and stress_of(v.get("phonetic"))]
        # Bài trọng âm giới hạn số âm tiết / từ loại (VD "Trọng âm danh từ có 3 âm tiết", "từ có hơn 3 âm tiết")
        topic_l = pron.get("pair", "").lower()
        m_syl = re.search(r"(hơn )?(\d) âm tiết", topic_l)
        if "trọng âm" in topic_l and m_syl:
            n_syl = int(m_syl.group(2))
            fit = (lambda t: t > n_syl) if m_syl.group(1) else (lambda t: t == n_syl)
            pool = [v for v in pool if fit(stress_of(v["phonetic"])[0])]
            kinds = [k for k in ("danh từ", "tính từ", "động từ") if k in topic_l]
            if kinds:
                pool = [v for v in pool if any(str(v.get("wordType", "")).lower().startswith(k) for k in kinds)]
        # Bài trọng âm theo hậu tố (VD "-al và -ous", "-ese và -ee"): ưu tiên từ có đúng hậu tố đó
        suff = re.findall(r"-([a-z]{2,5})\b", pron.get("pair", ""))
        if suff:
            hit = [v for v in pool if str(v.get("word", "")).lower().endswith(tuple(suff))]
            pool = hit + [v for v in pool if v not in hit]
        by_idx, seen = {1: [], 2: [], 3: []}, set()
        for v in pool:
            t, i = stress_of(v["phonetic"])
            if v["word"].lower() in seen or i not in by_idx or len(by_idx[i]) >= 3:
                continue
            seen.add(v["word"].lower())
            by_idx[i].append((v, t, i))
        unit_words = {str(v.get("word", "")).lower() for v in u.get("vocabularies", [])}
        flat = [x for i in (1, 2, 3) for x in by_idx[i]]
        if suff:
            chosen = [x for x in flat if x[0]["word"].lower().endswith(tuple(suff))][:4]
        else:
            chosen = [x for x in flat if x[0]["word"].lower() in unit_words][:3]  # ưu tiên từ của chính Unit
        for want_new in (True, False):
            for x in flat:
                if len(chosen) >= 4:
                    break
                if x in chosen or (want_new and x[2] in {c[2] for c in chosen}):
                    continue
                chosen.append(x)
        quiz = []
        for v, t, i2 in chosen:
            opts = [f"Âm tiết {n}" for n in range(1, min(t, 3) + 1)]
            quiz.append({"word": v["word"], "correctSound": f"Âm tiết {i2}", "options": opts, "meaningVi": v.get("meaning", ""),
                         "phonetic": v.get("phonetic", ""), "answerIndex": i2 - 1})
        topic = pron.get("pair", "")
        is_stress = "Trọng âm" in topic or "Numbers" in topic
        note = "" if is_stress else f" Bài này về: {topic}. Phần luyện dưới đây ôn trọng âm của từ vựng."
        pron["practiceQuiz"] = quiz
        for key, i, sym in (("sound1", 1, "ˈ● ●"), ("sound2", 2, "● ˈ●")):
            pron[key] = {
                "symbol": sym,
                "name": f"Trọng âm rơi vào âm tiết {i}",
                "guideVi": "Đọc to, dài và rõ hơn ở âm tiết đứng sau dấu ˈ trong phiên âm." + note,
                "words": [v["word"] for v, _, _ in by_idx[i]],
            }
        if templated(pron.get("tongueTwister")):
            pron["tongueTwister"] = ""
        return pron
    if len(syms) == 1:
        syms = [syms[0], CONTRAST.get(syms[0], "ə")]
    syms = syms[:3]
    opts = [f"/{s}/" for s in syms]
    unit_first = list(u.get("vocabularies", [])) + word_bank
    unit_first = [v for v in unit_first if " " not in v.get("word", "")] + [v for v in unit_first if " " in v.get("word", "")]
    picked, per = [], {s: [] for s in syms}
    seen = set()
    for v in unit_first:
        w, p = v.get("word", ""), v.get("phonetic", "")
        if not real_ipa(p, w) or w.lower() in seen:
            continue
        hits = [s for s in syms if has_sound(p, s)]
        if len(hits) == 1 and len(per[hits[0]]) < 2:
            per[hits[0]].append(v)
            seen.add(w.lower())
    for i in range(2):
        for s in syms:
            if i < len(per[s]):
                v = per[s][i]
                picked.append({
                    "word": v["word"], "correctSound": f"/{s}/", "options": opts, "meaningVi": v.get("meaning", ""),
                    "phonetic": v.get("phonetic", ""), "answerIndex": opts.index(f"/{s}/"),
                })
    pron["practiceQuiz"] = picked
    for key, s in (("sound1", syms[0]), ("sound2", syms[1])):
        snd = dict(pron.get(key) or {})
        words = [v["word"] for v in per.get(s, [])]
        cur_ok = all(has_sound(ipa.d.get(w.lower(), ""), s) for w in snd.get("words", []) if " " not in w) and snd.get("words")
        if not cur_ok and words:
            snd["words"] = words
        if snd.get("symbol") != f"/{s}/" or f"/{s}/" not in str(snd.get("name", "")):
            snd["name"] = f"Âm /{s}/"
        snd["symbol"] = f"/{s}/"
        pron[key] = snd
    if templated(pron.get("tongueTwister")):
        ws = [v["word"] for v in per[syms[0]]][:3]
        pron["tongueTwister"] = f"Say it three times: {', '.join(ws)}!" if ws else ""
    return pron


def line(i, gid, speaker, en, vi, tips, ipa, ipa_text=None):
    return {"id": f"{gid}_d{i}", "speaker": speaker, "sentenceEn": en, "phonetic": ipa_text if ipa_text is not None else ipa.sentence(en),
            "meaningVi": vi, "tipsVi": tips}


def build_speaking(g, u, sp, ex, ipa):
    sp = dict(sp or {})
    gid = f"g{g}_u{u['unit']}"
    qas = PATTERN_QA.get(g, {}).get(u["unit"], [])
    qa = qas[0] if qas else None
    lines = sp.get("dialogueLines") or []
    names = [l.get("speaker") for l in lines[:2] if l.get("speaker")] or ["Mai", "Nam"]
    if len(names) < 2:
        names.append("Nam")
    a, b = names[0], names[1]

    # Câu mục tiêu
    if not sp.get("targetSentence") or templated(sp.get("targetSentence")) or bad_phonetic(sp.get("targetSentence"), sp.get("phonetic"), ipa):
        if qa:
            # Câu mục tiêu: câu mẫu đủ nghĩa (bỏ qua câu quá ngắn như "Two." / "Yes, I was.")
            cands = [p[1] for p in qas] + [p[0] for p in qas]
            full = [c for c in cands if len(c[0].split()) >= 3 and not re.match(r"(Yes|No|OK)\b", c[0])]
            sp["targetSentence"], sp["phonetic"], sp["meaningVi"] = (full or cands)[0]
        elif ex:
            v, en, vi = ex[0]
            sp["targetSentence"], sp["phonetic"], sp["meaningVi"] = en, ipa.sentence(en), vi

    # Hội thoại
    dlg_bad = any(templated(l.get("sentenceEn")) or bad_phonetic(l.get("sentenceEn"), l.get("phonetic"), ipa)
                  or "..." in str(l.get("phonetic", "")) for l in lines)
    if dlg_bad or not lines:
        new = []
        if qa:
            new = [
                line(1, gid, a, f"Hi, {b}!", f"Chào {b}!", "Chào bạn thật vui vẻ.", ipa),
                line(2, gid, b, f"Hi, {a}!", f"Chào {a}!", "Mỉm cười đáp lời.", ipa),
            ]
            for (q, qi, qv), (an, ai, av) in qas[:2]:
                new.append(line(len(new) + 1, gid, a, q, qv, "Lên giọng/xuống giọng đúng kiểu câu hỏi.", ipa, qi))
                new.append(line(len(new) + 1, gid, b, an, av, "Trả lời rõ ràng, tự tin.", ipa, ai))
        elif g <= 2:
            nouns = countable_nouns(u.get("vocabularies", []))
            if nouns:
                n = nouns[0]
                art = article(n["word"], n["phonetic"])
                ans = f"It's {art} {n['word']}."
                new = [
                    line(1, gid, a, "What's this?", "Đây là cái gì?", "Chỉ tay vào hình.", ipa, "/wɒts ðɪs/"),
                    line(2, gid, b, ans, f"Đó là {n.get('meaning', '').split(',')[0].lower()}.", f"Nhấn giọng vào \"{n['word']}\".", ipa,
                         f"/ɪts {'ən' if art == 'an' else 'ə'} {strip_ipa(n['phonetic'])}/"),
                ]
            for i, (v, en, vi) in enumerate(ex[:2]):
                new.append(line(len(new) + 1, gid, a if len(new) % 2 == 0 else b, en, vi, f"Đọc rõ từ \"{v['word']}\".", ipa))
        else:
            if len(ex) >= 2:
                (v1, e1, x1), (v2, e2, x2) = ex[0], ex[1]
                p1, p2 = strip_ipa(v1.get("phonetic")), strip_ipa(v2.get("phonetic"))
                new = [
                    line(1, gid, a, f"Can you make a sentence with the word \"{v1['word']}\"?",
                         f"Bạn đặt một câu với từ \"{v1['word']}\" được không?", "Hỏi bạn thân thiện.", ipa,
                         f"/kən juː meɪk ə ˈsentəns wɪð ðə wɜːd {p1}/" if real_ipa(v1.get('phonetic'), v1['word']) else ""),
                    line(2, gid, b, e1, x1, f"Nhấn rõ từ \"{v1['word']}\".", ipa),
                    line(3, gid, a, f"Great! Now try the word \"{v2['word']}\".", f"Hay lắm! Giờ thử với từ \"{v2['word']}\" nhé.",
                         "Khen bạn rồi hỏi tiếp.", ipa,
                         f"/ɡreɪt naʊ traɪ ðə wɜːd {p2}/" if real_ipa(v2.get('phonetic'), v2['word']) else ""),
                    line(4, gid, b, e2, x2, f"Nhấn rõ từ \"{v2['word']}\".", ipa),
                ]
        if new:
            sp["dialogueLines"] = new
    else:
        for l in lines:
            if bad_phonetic(l.get("sentenceEn"), l.get("phonetic"), ipa):
                l["phonetic"] = ipa.sentence(l.get("sentenceEn"))

    # Câu luyện thêm
    ch = sp.get("challenges") or []
    if not ch or any(templated(c.get("sentenceEn")) or bad_phonetic(c.get("sentenceEn"), c.get("phonetic"), ipa) for c in ch):
        new = []
        for i, (v, en, vi) in enumerate(ex[1:4] or ex[:3]):
            item = {"sentenceEn": en, "phonetic": ipa.sentence(en), "meaningVi": vi}
            if ch and "id" in ch[0]:
                item = {"id": i + 1, "level": "Câu ví dụ từ vựng", **item, "tipsVi": f"Nhấn rõ từ \"{v['word']}\"."}
            new.append(item)
        if new:
            sp["challenges"] = new
    return sp


def build_listening(g, u, L, ex, pool_words):
    L = dict(L or {})
    if L.get("transcript") and not (templated(L.get("transcript")) or templated(L.get("question"))):
        return L
    use = ex[:3]
    if not use:
        return L
    transcript = " ".join(en for _, en, _ in use)
    heard = [v["word"] for v, en, _ in use if contains_word(en, v["word"])]
    if not heard:
        return L
    ans = heard[0]
    low = transcript.lower()
    cands = [v["word"] for v in u.get("vocabularies", []) if not is_person(v)] + rotate(pool_words, u["unit"] * 5)
    cands = [w for w in cands if not re.search(r"(?<![a-z])" + re.escape(w.lower()) + r"(?![a-z])", low)]
    L.update({
        "transcript": transcript,
        "question": "Which word do you hear?",
        "options": [ans] + distractors(ans, cands, 3),
        "answerIndex": 0,
    })
    L.pop("audio", None)
    return L


def build_reading(g, u, R, ex, pool_words):
    R = dict(R or {})
    if g == 7 and u["unit"] in G7_READING_VI and not templated(R.get("passage")):
        R["translation"] = G7_READING_VI[u["unit"]]
        return R
    if R.get("passage") and not (templated(R.get("passage")) or templated(R.get("title"))):
        return R
    use = ex[:5]
    if len(use) < 2:
        return R
    R["title"] = f"Reading: {u.get('title') or u.get('titleEn')}"
    R["passage"] = " ".join(en for _, en, _ in use)
    R["translation"] = " ".join(vi for _, _, vi in use)
    qs = []
    unit_words = [v["word"] for v in u.get("vocabularies", []) if not is_person(v)]
    for v, en, vi in use:
        hit = blank(en, v["word"])
        if not hit:
            continue
        b, surface = hit
        others = [w for w in unit_words if w != v["word"]] + rotate(pool_words, len(qs) * 11 + u["unit"])
        qs.append({
            "id": f"g{g}_u{u['unit']}_r{len(qs) + 1}",
            "type": "multiple_choice",
            "question": f"Complete the sentence from the text: \"{b}\"",
            "options": fit_case(surface, [v["word"]] + distractors(v["word"], others, 3)),
            "answerIndex": 0,
            "explain": f"Trong bài đọc: \"{en}\" ({vi})",
        })
        if len(qs) == 3:
            break
    if qs:
        R["questions"] = qs
    return R


def build_writing(g, u, W, ex):
    W = dict(W or {})
    items = W.get("items") or []
    def tpl(x):
        return templated(x) or (g <= 2 and str(x or "").startswith(("Look at the ", "I like ")))

    bad = not items or tpl(W.get("correctSentence")) or any(tpl(i.get("correctSentence")) for i in items)
    if not bad:
        return W
    keep = [i for i in items if not tpl(i.get("correctSentence"))]
    new = []
    for v, en, vi in ex:
        s = re.sub(r"[.!?]+$", "", en).strip()
        toks = s.split()
        if not 3 <= len(toks) <= 12 or '"' in s or " - " in s:
            continue
        new.append({
            "id": f"g{g}_u{u['unit']}_w{len(keep) + len(new) + 1}",
            "type": "unscramble",
            "scrambledWords": toks,
            "correctSentence": s,
            "meaningVi": vi,
            "hint": f"Câu bắt đầu bằng \"{toks[0]}\"…",
        })
        if len(new) == 3:
            break
    if not new and not keep:
        return W
    W["items"] = keep + new
    first = (keep + new)[0]
    W["correctSentence"], W["meaningVi"] = first["correctSentence"], first["meaningVi"]
    return W


def normalize_pron(pron, meaning_of):
    """Đưa về đúng định dạng trạm Phát âm đang dùng (như Lớp 6):
    sound*.words = [{word, meaning}], câu hỏi có trường meaning."""
    pron = dict(pron or {})
    for key in ("sound1", "sound2"):
        snd = dict(pron.get(key) or {})
        snd["words"] = [w if isinstance(w, dict) else {"word": w, "meaning": meaning_of(w)} for w in snd.get("words", []) or []]
        snd.setdefault("guideVi", "")
        pron[key] = snd
    pron["practiceQuiz"] = [{**q, "meaning": q.get("meaning") or q.get("meaningVi") or meaning_of(q.get("word"))}
                            for q in pron.get("practiceQuiz", []) or []]
    return pron


# ---------------------------------------------------------------- chạy cho toàn bộ
def apply_quality_pass(all_grades):
    ipa = IpaDict()
    for g, data in all_grades.items():
        for u in data.get("units", []):
            for v in u.get("vocabularies", []):
                ipa.add(v.get("word"), v.get("phonetic"))
    # Học thêm phiên âm từ các câu soạn chuẩn (Lớp 6 và các hội thoại không theo khuôn mẫu)
    for g, data in all_grades.items():
        for u in data.get("units", []):
            sp = u.get("speaking") or {}
            pairs = [(sp.get("targetSentence"), sp.get("phonetic"))]
            pairs += [(l.get("sentenceEn"), l.get("phonetic")) for l in sp.get("dialogueLines", []) or []]
            pairs += [(c.get("sentenceEn"), c.get("phonetic")) for c in sp.get("challenges", []) or []]
            for s, p in pairs:
                if s and p and not templated(s):
                    ipa.harvest(s, p)
    for qa_g in PATTERN_QA.values():
        for pairs in qa_g.values():
            for (q, qi, _), (a, ai, _) in pairs:
                ipa.harvest(q, qi)
                ipa.harvest(a, ai)

    all_bank = [v for data in all_grades.values() for u in data.get("units", []) for v in u.get("vocabularies", [])]
    meanings = {}
    for v in all_bank:
        meanings.setdefault(str(v.get("word", "")).lower(), v.get("meaning", ""))
    meanings.update({"see": "nhìn thấy", "sit": "ngồi", "she": "cô ấy", "shop": "cửa hàng", "pen": "cái bút", "bed": "cái giường",
                     "cat": "con mèo", "bag": "cái cặp", "the": "(mạo từ xác định)", "a": "một (mạo từ)", "two": "số hai",
                     "ten": "số mười", "together": "cùng nhau", "standard": "tiêu chuẩn"})

    def meaning_of(w):
        return meanings.get(str(w).lower(), "")
    stats = {}
    for g, data in sorted(all_grades.items()):
        if g == 6:
            continue  # Lớp 6: học liệu soạn tay đầy đủ
        units = data.get("units", [])
        grade_vocab = [v for u in units for v in u.get("vocabularies", [])]
        pool_words = [v["word"] for v in grade_vocab if not is_person(v)]
        pool_meanings = [v.get("meaning", "") for v in grade_vocab if has_vi(v.get("meaning", "")) and not is_person(v)]
        qa_answers = list(dict.fromkeys((p[0][0], p[1][0]) for pairs in PATTERN_QA.get(g, {}).values() for p in pairs))
        n = 0
        for u in units:
            ex = good_examples(u.get("vocabularies", []))
            gram = u.get("grammar") or {}
            quiz = gram.get("quiz") or []
            if not quiz or len(quiz) < 4 or any(templated(q.get("question")) or templated(" ".join(map(str, q.get("options", [])))) for q in quiz):
                keep = [q for q in quiz if not (templated(q.get("question")) or templated(" ".join(map(str, q.get("options", [])))))]
                gram["quiz"] = keep + build_grammar_quiz(g, u, ex, pool_words, pool_meanings, qa_answers)
                u["grammar"] = gram
                n += 1
            u["pronunciation"] = normalize_pron(build_pron(g, u, u.get("pronunciation"), grade_vocab + all_bank + STRESS_BANK, ipa), meaning_of)
            u["speaking"] = build_speaking(g, u, u.get("speaking"), ex, ipa)
            u["listening"] = build_listening(g, u, u.get("listening"), ex, pool_words)
            u["reading"] = build_reading(g, u, u.get("reading"), ex, pool_words)
            u["writing"] = build_writing(g, u, u.get("writing"), ex)
        stats[g] = n
    return stats
