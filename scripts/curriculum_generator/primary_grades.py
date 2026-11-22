# -*- coding: utf-8 -*-
"""
primary_grades.py
Tạo dữ liệu SGK Tiếng Anh Tiểu học (Global Success GDPT 2018):
- Lớp 1, 2: 16 Units – Lớp 3, 4, 5: 20 Units (Tập 1 & Tập 2)

Tên Unit, ngữ âm, từ vựng và mẫu câu lấy từ sgk_primary.py (đối chiếu Book map trong pdf/).
Các trạm luyện tập (ngữ pháp, phát âm, nói, nghe, đọc, viết) để trống ở đây và được dựng
từ từ vựng + mẫu câu SGK ở bước quality_pass.py (chạy trong build_all.py).
"""
import sys, os
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))
from primary_vocab_db import lookup_primary_word, PRIMARY_VOCAB_EXTRA
from sgk_primary import G1, G2, G3_T2, G4, G5
try:
    from .emoji_lookup import lookup_emoji
except ImportError:
    from emoji_lookup import lookup_emoji


def get_primary_book_id(grade, sem):
    if grade == 1: return "sgk-1"
    if grade == 2: return "sgk-2"
    if grade == 3: return "sgk-3-tap2"  # app chỉ có PDF Tập 2 của Lớp 3
    if grade == 4: return "sgk-4-tap1" if sem == 1 else "sgk-4-tap2"
    if grade == 5: return "sgk-5-tap1" if sem == 1 else "sgk-5-tap2"
    return f"sgk-{grade}"


# Lớp 3 Tập 1 (Unit 1–10): chưa có PDF Tập 1 trong thư mục pdf/ để đối chiếu → giữ dữ liệu đã soạn.
G3_T1 = [
    (1, "Hello", "Xin chào", 1, "Trang 6 – 11", "/s/ và /ʃ/", "hello, hi, fine, thank you", "Hello/Hi, I'm... / How are you? – I'm fine, thank you."),
    (2, "Our names", "Tên của chúng em", 1, "Trang 12 – 17", "/s/ và /ʃ/", "name, spell, what, how", "What's your name? – My name is..."),
    (3, "Our friends", "Bạn bè của chúng em", 1, "Trang 18 – 23", "/s/ và /ʃ/", "friend, this, that, yes, no", "This is... / Is this...? – Yes, it is."),
    (4, "Our bodies", "Cơ thể của chúng em", 1, "Trang 24 – 29", "/s/ và /ʃ/", "eye, ear, nose, mouth, face, hand", "Touch your... / Open your..."),
    (5, "My hobbies", "Sở thích của em", 1, "Trang 30 – 35", "/s/ và /ʃ/", "singing, dancing, drawing, swimming", "What's your hobby? – I like..."),
    (6, "Our school", "Trường học của chúng em", 1, "Trang 40 – 45", "/s/ và /ʃ/", "school, classroom, library, playground, gym", "Is that your school? – Yes, it is."),
    (7, "Classroom instructions", "Lời chỉ dẫn trong lớp học", 1, "Trang 46 – 51", "/s/ và /ʃ/", "open, close, stand up, sit down, speak", "Open your book. / May I come in?"),
    (8, "My school things", "Đồ dùng học tập của em", 1, "Trang 52 – 57", "/s/ và /ʃ/", "pen, pencil, ruler, rubber, pencil case", "I have a... / Do you have a...?"),
    (9, "Colours", "Màu sắc", 1, "Trang 58 – 63", "/s/ và /ʃ/", "red, blue, yellow, green, black, white", "What colour is it? – It's..."),
    (10, "Break time activities", "Hoạt động giờ ra chơi", 1, "Trang 64 – 69", "/s/ và /ʃ/", "play, football, basketball, chess, badminton", "What do you do at break time? – I play..."),
]

WEEK_MONTH = {"Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday", "January", "February", "March",
              "April", "May", "June", "July", "August", "September", "October", "November", "December", "English", "Vietnamese",
              "Maths", "Science", "IT", "PE", "Art", "Music"}


def theme_of(g, u):
    if g <= 2:
        return "Phonics & Everyday Life"
    return ["Me and My Friends", "Me and My School", "Me and My Family", "Me and the World Around"][(u - 1) // 5]


def word_type(w):
    for k in (w, w.lower()):
        if k in PRIMARY_VOCAB_EXTRA:
            return PRIMARY_VOCAB_EXTRA[k][5]
    if w[:1].isupper() and w not in WEEK_MONTH:
        return "Tên riêng"
    return "Danh từ"


def make_unit(g, row, title_book):
    u_num, title, title_vi, sem, pages, phonics, words_str, structures = row
    words = [w.strip() for w in words_str.split(",") if w.strip()]
    vocab = []
    for i, w in enumerate(words):
        ipa, mean, ex_en, ex_vi, hint = lookup_primary_word(w)
        vocab.append({
            "id": f"g{g}_u{u_num}_{i + 1:02d}", "word": w, "phonetic": ipa, "wordType": word_type(w),
            "meaning": mean, "hint": hint, "exampleEn": ex_en, "exampleVi": ex_vi, "emoji": lookup_emoji(w, mean),
        })
    letter_note = f"Lớp {g} học ngữ âm qua chữ cái và từ khóa của bài." if g <= 2 else "Đọc to theo mẫu và chú ý âm, trọng âm được tô đậm trong SGK."
    return {
        "unitId": f"g{g}_u{u_num}",
        "grade": g,
        "unit": u_num,
        "unitTitle": f"Unit {u_num}: {title}",
        "unitNameVi": title_vi,
        "title": title,
        "titleEn": title,
        "titleVi": title_vi,
        "theme": theme_of(g, u_num),
        "semester": sem,
        "bookPages": pages,
        "bookId": get_primary_book_id(g, sem),
        "vocabularies": vocab,
        "grammar": {
            "title": f"Mẫu câu Unit {u_num}: {title}",
            "ruleVi": f"Mẫu câu trọng tâm theo SGK {title_book}: {structures}",
            "formula": structures,
            "quickTip": "Đọc to cả câu hỏi và câu trả lời; thay từ vựng của bài vào chỗ \"...\" để tự đặt câu mới.",
            "quiz": [],
        },
        "pronunciation": {"pair": phonics, "title": f"Ngữ âm: {phonics}", "sound1": {}, "sound2": {}, "practiceQuiz": [],
                          "tongueTwister": "", "noteVi": letter_note},
        "speaking": {"targetSentence": "", "phonetic": "", "meaningVi": "", "situationalTopic": title_vi,
                     "dialogueTitle": f"Let's talk: {title}", "dialogueContext": f"Hai bạn luyện mẫu câu của bài \"{title}\".",
                     "dialogueLines": [], "challenges": []},
        "listening": {"topic": f"Nghe và chọn từ: {title_vi}", "transcript": "", "question": "", "options": [], "answerIndex": 0},
        "reading": {"title": "", "passage": "", "translation": "", "questions": []},
        "writing": {"correctSentence": "", "meaningVi": "", "items": []},
    }


def generate_primary_grades():
    grades = {}
    books = [
        (1, "SGK Tiếng Anh 1 – Global Success", G1),
        (2, "SGK Tiếng Anh 2 – Global Success", G2),
        (3, "SGK Tiếng Anh 3 – Global Success", G3_T1 + G3_T2),
        (4, "SGK Tiếng Anh 4 – Global Success", G4),
        (5, "SGK Tiếng Anh 5 – Global Success", G5),
    ]
    for g, title_book, rows in books:
        units = [make_unit(g, r, title_book) for r in rows]
        grades[g] = {
            "grade": g,
            "gradeName": f"Lớp {g}",
            "level": "primary",
            "levelName": "Tiểu học",
            "title": title_book,
            "totalUnits": len(units),
            "interactiveAvailable": True,
            "interactiveNote": f"Hệ thống trạm học tương tác 7 kỹ năng chuẩn SGK Lớp {g}",
            "units": units,
        }
    return grades
