# -*- coding: utf-8 -*-
"""
Script align_curriculum.py
Cập nhật và chuẩn hóa toàn bộ nội dung 12 Unit bám sát 100% sách giáo khoa
Tiếng Anh 6 - Global Success (Tập 1 và Tập 2) theo yêu cầu của Giáo viên:
- Đoạn văn đọc hiểu (Skills 1) chuẩn xác từng câu chữ SGK kèm dịch nghĩa
- Hệ thống câu hỏi đọc hiểu 5-6 câu đa dạng (trắc nghiệm, điền khuyết, sắp xếp)
- Ngữ pháp & Trắc nghiệm (A Closer Look 2 & Looking Back)
- Bài tập viết câu (Skills 2 & Looking Back)
- Từ vựng đối chiếu chuẩn xác với Bảng tra cứu từ vựng (Glossary) cuối sách
"""

import json
import os

DATA_DIR = os.path.join(os.path.dirname(__file__), '..', 'src', 'data')

def update_unit(unit_id, updates):
    path = os.path.join(DATA_DIR, f'unit{unit_id}.json')
    with open(path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    # Merge updates
    for key, value in updates.items():
        data[key] = value

    with open(path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    print(f"✅ Updated Unit {unit_id} successfully.")

# ================= UNIT 1 =================
u1_reading = {
    "title": "Schools in Viet Nam and Around the World",
    "passage": "Sunrise is a boarding school in Sydney. Students study and live there. About 1,200 boys and girls go to Sunrise. It has students from all over Australia. They study subjects like maths, science and English.\n\nAn Son is a lower secondary school in Bac Giang. It has only 8 classes. There are mountains and green fields around the school. There is a computer room and a library. There is also a school garden and a playground.\n\nDream is an international school. Here students learn English with English-speaking teachers. In the afternoon, they join many interesting clubs. They play sports and games. Some students do paintings in the art club.",
    "translation": "Sunrise là một trường nội trú ở Sydney. Học sinh học tập và sinh hoạt tại trường. Khoảng 1.200 bạn nam và nữ theo học tại Sunrise. Trường có học sinh đến từ khắp nước Úc. Các bạn học các môn như toán, khoa học và tiếng Anh.\n\nAn Sơn là một trường trung học cơ sở ở Bắc Giang. Trường chỉ có 8 lớp học. Xung quanh trường có núi non và những cánh đồng xanh mướt. Trường có một phòng máy tính và một thư viện. Ngoài ra còn có vườn trường và sân chơi.\n\nDream là một trường quốc tế. Tại đây học sinh học tiếng Anh cùng các giáo viên bản ngữ. Vào buổi chiều, các em tham gia nhiều câu lạc bộ thú vị. Các em chơi thể thao và trò chơi. Một số học sinh vẽ tranh trong câu lạc bộ mỹ thuật.",
    "questions": [
        {
            "id": "u1_r1",
            "type": "fill_blank",
            "question": "Students live and study in a ______ school. They only go home at weekends.",
            "blankWord": "boarding",
            "options": ["boarding", "international", "secondary", "primary"],
            "explain": "Đoạn 1: 'Sunrise is a boarding school in Sydney. Students study and live there.' (Trường nội trú là nơi học sinh học và ở lại)."
        },
        {
            "id": "u1_r2",
            "type": "multiple_choice",
            "question": "Where is Sunrise School located?",
            "options": ["In Sydney, Australia", "In Bac Giang, Viet Nam", "In London, England", "In New York, USA"],
            "answerIndex": 0,
            "explain": "Đoạn 1 nêu rõ: 'Sunrise is a boarding school in Sydney... from all over Australia'."
        },
        {
            "id": "u1_r3",
            "type": "multiple_choice",
            "question": "What is around An Son Lower Secondary School in Bac Giang?",
            "options": ["Mountains and green fields", "Tall modern office buildings", "Busy shopping centres", "A huge seaport"],
            "answerIndex": 0,
            "explain": "Đoạn 2: 'There are mountains and green fields around the school.'"
        },
        {
            "id": "u1_r4",
            "type": "multiple_choice",
            "question": "Which school has an art club where students do paintings in the afternoon?",
            "options": ["Dream School", "Sunrise School", "An Son School", "Palmer School"],
            "answerIndex": 0,
            "explain": "Đoạn 3: 'Dream is an international school... Some students do paintings in the art club.'"
        },
        {
            "id": "u1_r5",
            "type": "fill_blank",
            "question": "At Dream School, students learn English with ______ teachers.",
            "blankWord": "English-speaking",
            "options": ["English-speaking", "Vietnamese", "robot", "online"],
            "explain": "Đoạn 3: 'Here students learn English with English-speaking teachers.'"
        }
    ]
}

u1_grammar = {
    "title": "Thì Hiện tại đơn & Trạng từ chỉ tần suất (Present Simple & Adverbs of Frequency)",
    "ruleVi": "Dùng để diễn tả thói quen, hành động lặp đi lặp lại hàng ngày hoặc sự thật hiển nhiên. Trạng từ chỉ tần suất (always, usually, often, sometimes, rarely, never) đứng trước động từ thường và đứng sau động từ to be.",
    "formula": "Khẳng định: S + V(s/es) | Phủ định: S + don't/doesn't + V | Nghi vấn: Do/Does + S + V?",
    "quickTip": "Chủ ngữ số ít (He, She, It, Nam) thì động từ thêm -s hoặc -es. Đi với động từ tận cùng -o, -ch, -sh, -ss, -x thêm -es (watches, teaches, does).",
    "quiz": [
        {
            "question": "He ______ from Da Nang.",
            "options": ["comes", "come", "coming", "is come"],
            "answerIndex": 0,
            "explain": "Chủ ngữ 'He' ngôi thứ 3 số ít, động từ come thêm -s thành 'comes'."
        },
        {
            "question": "Do you learn Russian? - No, I ______.",
            "options": ["don't", "doesn't", "am not", "not do"],
            "answerIndex": 0,
            "explain": "Câu hỏi bắt đầu bằng 'Do you...', câu trả lời phủ định là 'No, I don't'."
        },
        {
            "question": "She always ______ to school with her friends.",
            "options": ["walks", "walk", "is walking", "walked"],
            "answerIndex": 0,
            "explain": "Có trạng từ 'always' diễn tả thói quen, chủ ngữ 'She' số ít nên động từ chia 'walks'."
        },
        {
            "question": "I often ______ my homework after dinner.",
            "options": ["do", "does", "doing", "am do"],
            "answerIndex": 0,
            "explain": "Chủ ngữ là 'I', cụm từ 'do homework' chia theo thì hiện tại đơn là 'do'."
        },
        {
            "question": "Mr Nam ______ history at my school.",
            "options": ["teaches", "teach", "is teaching", "teaching"],
            "answerIndex": 0,
            "explain": "Mr Nam là ngôi thứ 3 số ít, động từ 'teach' tận cùng là -ch nên thêm -es thành 'teaches'."
        },
        {
            "question": "Nick gets good marks in exams. (usually) -> Nick ______ gets good marks in exams.",
            "options": ["usually", "is usually", "usually is", "gets usually"],
            "answerIndex": 0,
            "explain": "Trạng từ tần suất 'usually' đứng trước động từ thường 'gets'."
        }
    ]
}

u1_writing = {
    "items": [
        {
            "id": "u1_w1",
            "type": "unscramble",
            "scrambledWords": ["Our", "new", "uniform", "is", "very", "nice"],
            "correctSentence": "Our new uniform is very nice",
            "meaningVi": "Bộ đồng phục mới của chúng mình rất đẹp.",
            "hint": "Bắt đầu bằng 'Our new...'"
        },
        {
            "id": "u1_w2",
            "type": "unscramble",
            "scrambledWords": ["I", "always", "remember", "to", "do", "my", "homework"],
            "correctSentence": "I always remember to do my homework",
            "meaningVi": "Mình luôn luôn nhớ làm bài tập về nhà.",
            "hint": "Trạng từ 'always' đứng trước động từ 'remember'."
        },
        {
            "id": "u1_w3",
            "type": "fill_blank",
            "sentence": "We often use a ______ in a maths class.",
            "blankWord": "compass",
            "correctSentence": "We often use a compass in a maths class.",
            "options": ["compass", "rubber", "sharpener", "calculator"],
            "meaningVi": "Chúng mình thường dùng com-pa trong giờ học toán."
        },
        {
            "id": "u1_w4",
            "type": "fill_blank",
            "sentence": "Can you lend me your ______ for a minute?",
            "blankWord": "calculator",
            "correctSentence": "Can you lend me your calculator for a minute?",
            "options": ["calculator", "pencil", "school bag", "notebook"],
            "meaningVi": "Bạn có thể cho mình mượn máy tính cầm tay một lát được không?"
        }
    ],
    "correctSentence": "Our new uniform is very nice",
    "scrambledWords": ["Our", "new", "uniform", "is", "very", "nice"],
    "meaningVi": "Bộ đồng phục mới của chúng mình rất đẹp."
}

update_unit(1, {
    "reading": u1_reading,
    "grammar": u1_grammar,
    "writing": u1_writing
})

# ================= UNIT 2 =================
u2_reading = {
    "title": "A Room at the Crazy House Hotel, Da Lat",
    "passage": "Hi Phong and Mi,\n\nHow are you? I'm in Da Lat with my parents. We're staying at the Crazy House Hotel. Wow! It really is crazy.\n\nThere are ten rooms in the hotel. There's a Kangaroo Room, an Eagle Room, and even an Ant Room. I'm staying in the Tiger Room. It's called the Tiger Room because there's a big tiger on the wall.\n\nThe tiger is between the bathroom door and the window. The bed is next to the window, but the window is a strange shape. I put my bag under the bed. There's a lamp, a wardrobe and a desk.\n\nYou should stay here when you visit Da Lat. It's great.\n\nSee you soon!\nNick",
    "translation": "Chào Phong và Mi,\n\nCác bạn khỏe không? Mình đang ở Đà Lạt cùng bố mẹ. Nhà mình đang ở khách sạn Crazy House. Oa! Khách sạn này thật sự kì lạ và độc đáo.\n\nKhách sạn có 10 phòng. Có phòng Chuột túi, phòng Đại bàng và cả phòng Kiến. Mình đang ở phòng Hổ. Phòng được gọi là phòng Hổ vì có một bức tượng con hổ lớn trên tường.\n\nCon hổ nằm ở giữa cửa phòng tắm và cửa sổ. Chiếc giường ở cạnh cửa sổ, nhưng cửa sổ có hình dáng rất kỳ lạ. Mình để cặp dưới gầm giường. Trong phòng có đèn, tủ quần áo và bàn học.\n\nCác bạn nên đến ở đây khi ghé thăm Đà Lạt nhé. Tuyệt vời lắm.\n\nHẹn sớm gặp lại!\nNick",
    "questions": [
        {
            "id": "u2_r1",
            "type": "multiple_choice",
            "question": "Who is Nick in Da Lat with?",
            "options": ["His parents", "His classmates Phong and Mi", "His teacher", "His grandparents"],
            "answerIndex": 0,
            "explain": "Đoạn 1 nêu rõ: 'I'm in Da Lat with my parents.' (Nick đi Đà Lạt cùng bố mẹ)."
        },
        {
            "id": "u2_r2",
            "type": "multiple_choice",
            "question": "How many rooms are there in the Crazy House Hotel?",
            "options": ["Ten rooms", "Eight rooms", "Twelve rooms", "Twenty rooms"],
            "answerIndex": 0,
            "explain": "Đoạn 2: 'There are ten rooms in the hotel.' (Có 10 phòng trong khách sạn)."
        },
        {
            "id": "u2_r3",
            "type": "multiple_choice",
            "question": "Why is Nick's room called the Tiger Room?",
            "options": ["Because there's a big tiger on the wall", "Because Nick has a pet tiger", "Because the bed looks like a tiger", "Because there is a tiger outside"],
            "answerIndex": 0,
            "explain": "Đoạn 2: 'It's called the Tiger Room because there's a big tiger on the wall.'"
        },
        {
            "id": "u2_r4",
            "type": "multiple_choice",
            "question": "Where did Nick put his bag in the room?",
            "options": ["Under the bed", "On the desk", "In the wardrobe", "Next to the door"],
            "answerIndex": 0,
            "explain": "Đoạn 3: 'I put my bag under the bed.' (Nick đặt cặp dưới gầm giường)."
        },
        {
            "id": "u2_r5",
            "type": "fill_blank",
            "question": "The tiger is ______ the bathroom door and the window.",
            "blankWord": "between",
            "options": ["between", "behind", "under", "in front of"],
            "explain": "Đoạn 3: 'The tiger is between the bathroom door and the window.'"
        }
    ]
}

u2_grammar = {
    "title": "Sở hữu cách & Giới từ chỉ nơi chốn (Possessive Case & Prepositions of Place)",
    "ruleVi": "Sở hữu cách ('s) dùng để chỉ sự sở hữu của một người. Giới từ chỉ nơi chốn (in, on, under, behind, in front of, next to, between) mô tả vị trí của đồ vật và người.",
    "formula": "Sở hữu cách: Tên/Danh từ số ít + 's + Danh từ | Giới từ: in / on / under / behind / next to / in front of / between A and B",
    "quickTip": "Nếu danh từ số nhiều có đuôi -s (students) thì chỉ thêm dấu phẩy (students'). Giới từ 'between' luôn đi kèm với liên từ 'and' (between A and B).",
    "quiz": [
        {
            "question": "Our house is next to my ______ house.",
            "options": ["teacher's", "teachers", "teacher", "teachers's"],
            "answerIndex": 0,
            "explain": "Sở hữu cách của 'teacher' là 'teacher's' (nhà của giáo viên)."
        },
        {
            "question": "There's a big bookshelf in ______ bedroom.",
            "options": ["Elena's", "Elena", "Elenas", "Elenas'"],
            "answerIndex": 0,
            "explain": "Tên riêng Elena thêm 's thành Elena's (phòng ngủ của Elena)."
        },
        {
            "question": "The cat is sleeping ______ the table.",
            "options": ["on", "between", "behind of", "in front"],
            "answerIndex": 0,
            "explain": "Con mèo đang ngủ 'trên' bàn, dùng giới từ 'on'."
        },
        {
            "question": "The dog is standing ______ the doghouse.",
            "options": ["in front of", "between", "under to", "next"],
            "answerIndex": 0,
            "explain": "Cụm giới từ đúng chỉ phía trước là 'in front of'."
        },
        {
            "question": "The lamp is ______ the sofa and the armchair.",
            "options": ["between", "among", "next", "in front"],
            "answerIndex": 0,
            "explain": "Ở giữa 2 vật có từ 'and' nên dùng giới từ 'between'."
        },
        {
            "question": "The kitchen is my ______ favourite room.",
            "options": ["grandfather's", "grandfathers", "grandfather", "grandfathers's"],
            "answerIndex": 0,
            "explain": "Sở hữu cách của danh từ chỉ người 'grandfather' là 'grandfather's'."
        }
    ]
}

u2_writing = {
    "items": [
        {
            "id": "u2_w1",
            "type": "unscramble",
            "scrambledWords": ["There", "is", "a", "big", "bed", "next", "to", "the", "door"],
            "correctSentence": "There is a big bed next to the door",
            "meaningVi": "Có một chiếc giường lớn ở bên cạnh cửa ra vào.",
            "hint": "Bắt đầu bằng 'There is...'"
        },
        {
            "id": "u2_w2",
            "type": "unscramble",
            "scrambledWords": ["This", "is", "my", "brother's", "new", "TV"],
            "correctSentence": "This is my brother's new TV",
            "meaningVi": "Đây là chiếc tivi mới của anh trai mình.",
            "hint": "Chú ý sở hữu cách 'brother's'."
        },
        {
            "id": "u2_w3",
            "type": "fill_blank",
            "sentence": "My house has four rooms: a living room, a kitchen and two ______.",
            "blankWord": "bedrooms",
            "correctSentence": "My house has four rooms: a living room, a kitchen and two bedrooms.",
            "options": ["bedrooms", "fridges", "attics", "sinks"],
            "meaningVi": "Nhà mình có 4 phòng: 1 phòng khách, 1 phòng bếp và 2 phòng ngủ."
        },
        {
            "id": "u2_w4",
            "type": "fill_blank",
            "sentence": "Nick put his school bag ______ the bed.",
            "blankWord": "under",
            "correctSentence": "Nick put his school bag under the bed.",
            "options": ["under", "between", "next", "in front"],
            "meaningVi": "Nick đặt chiếc cặp đi học của bạn ấy ở dưới gầm giường."
        }
    ],
    "correctSentence": "There is a big bed next to the door",
    "scrambledWords": ["There", "is", "a", "big", "bed", "next", "to", "the", "door"],
    "meaningVi": "Có một chiếc giường lớn ở bên cạnh cửa ra vào."
}

update_unit(2, {
    "reading": u2_reading,
    "grammar": u2_grammar,
    "writing": u2_writing
})

# ================= UNIT 3 =================
u3_reading = {
    "title": "First Day at the Superb Summer Camp",
    "passage": "Hi Mum and Dad,\n\nHere I am at the Superb Summer Camp. Mr Black asked us to write emails in English! Wow, everything here is in English!\n\nI have some new friends: Jimmy, Phong, and Nhung. They're in the photo. Jimmy has blonde hair and blue eyes. He's clever and creative. He likes taking photos. Phong is the tall boy. He's sporty and plays basketball very well. Nhung has curly black hair. She's kind. She shared her lunch with me today.\n\nWe're having fun. Jimmy's taking photos of me. Phong's reading a comic book, and Nhung's playing the violin. I must go now.\n\nPlease write soon.\nLove,\nNam",
    "translation": "Con chào bố mẹ,\n\nCon đang ở Trại hè Tuyệt vời (Superb Summer Camp). Thầy Black yêu cầu chúng con viết email bằng tiếng Anh! Oa, mọi thứ ở đây đều bằng tiếng Anh ạ!\n\nCon có thêm một số bạn mới: Jimmy, Phong và Nhung. Các bạn ấy ở trong ảnh đấy ạ. Jimmy có mái tóc vàng và đôi mắt xanh. Bạn ấy rất thông minh và sáng tạo. Bạn ấy thích chụp ảnh. Phong là bạn nam cao ráo. Bạn ấy rất yêu thể thao và chơi bóng rổ rất cừ. Nhung có mái tóc đen xoăn. Bạn ấy tốt bụng lắm. Hôm nay bạn ấy đã chia sẻ bữa trưa với con.\n\nChúng con đang rất vui. Jimmy đang chụp ảnh con. Phong đang đọc truyện tranh, còn Nhung đang chơi đàn vĩ cầm. Con phải đi rồi ạ.\n\nBố mẹ sớm viết thư lại cho con nhé.\nYêu bố mẹ,\nNam",
    "questions": [
        {
            "id": "u3_r1",
            "type": "multiple_choice",
            "question": "Can the children speak Vietnamese at the camp?",
            "options": ["No, everything here is in English", "Yes, anytime they like", "Only in the morning", "Only when calling parents"],
            "answerIndex": 0,
            "explain": "Đoạn 1: 'Mr Black asked us to write emails in English! Wow, everything here is in English!'"
        },
        {
            "id": "u3_r2",
            "type": "multiple_choice",
            "question": "How many new friends does Nam have at the summer camp?",
            "options": ["Three new friends (Jimmy, Phong, Nhung)", "Four new friends", "Two new friends", "Five new friends"],
            "answerIndex": 0,
            "explain": "Đoạn 2: 'I have some new friends: Jimmy, Phong, and Nhung.' (Có 3 người bạn mới)."
        },
        {
            "id": "u3_r3",
            "type": "multiple_choice",
            "question": "Who likes taking photos and has blonde hair with blue eyes?",
            "options": ["Jimmy", "Phong", "Nhung", "Nam"],
            "answerIndex": 0,
            "explain": "Đoạn 2: 'Jimmy has blonde hair and blue eyes. He's clever and creative. He likes taking photos.'"
        },
        {
            "id": "u3_r4",
            "type": "multiple_choice",
            "question": "What is Phong doing during break time?",
            "options": ["He is reading a comic book", "He is taking photos", "He is playing the violin", "He is playing basketball"],
            "answerIndex": 0,
            "explain": "Đoạn 3: 'Phong's reading a comic book, and Nhung's playing the violin.'"
        },
        {
            "id": "u3_r5",
            "type": "fill_blank",
            "question": "Nhung has curly black hair and she is very ______ because she shared her lunch with Nam.",
            "blankWord": "kind",
            "options": ["kind", "sporty", "shy", "confident"],
            "explain": "Đoạn 2: 'Nhung has curly black hair. She's kind. She shared her lunch with me today.'"
        }
    ]
}

u3_grammar = {
    "title": "Thì Hiện tại tiếp diễn (Present Continuous)",
    "ruleVi": "Dùng để diễn tả hành động đang diễn ra ngay tại thời điểm nói hoặc xung quanh thời điểm nói. Dấu hiệu nhận biết: now, right now, at the moment, at present, Look!, Listen!...",
    "formula": "Khẳng định: S + am/is/are + V-ing | Phủ định: S + am/is/are not + V-ing | Nghi vấn: Am/Is/Are + S + V-ing?",
    "quickTip": "I đi với am; He/She/It danh từ số ít đi với is; You/We/They danh từ số nhiều đi với are. Động từ tận cùng bằng -e bỏ -e thêm -ing (write -> writing). Gấp đôi phụ âm cuối với từ 1 âm tiết có 1 nguyên âm kẹp giữa 2 phụ âm (run -> running).",
    "quiz": [
        {
            "question": "Nick is very ______. He makes everyone laugh!",
            "options": ["funny", "confident", "active", "shy"],
            "answerIndex": 0,
            "explain": "Làm mọi người cười thì người đó có tính cách hài hước (funny)."
        },
        {
            "question": "My sister always does her homework before class. She's very ______.",
            "options": ["hard-working", "creative", "careful", "sporty"],
            "answerIndex": 0,
            "explain": "Luôn làm bài tập trước khi đến lớp thể hiện tính chăm chỉ (hard-working)."
        },
        {
            "question": "Some boys ______ around the classroom right now.",
            "options": ["are running", "is running", "run", "runs"],
            "answerIndex": 0,
            "explain": "Có 'right now' và chủ ngữ 'Some boys' số nhiều, dùng 'are running'."
        },
        {
            "question": "Mi and Mai ______ to each other happily.",
            "options": ["are talking", "is talking", "talk", "talks"],
            "answerIndex": 0,
            "explain": "Chủ ngữ 2 người (Mi and Mai) số nhiều, dùng 'are talking'."
        },
        {
            "question": "My teacher is in the classroom too. She ______ a book.",
            "options": ["is reading", "reads", "are reading", "reading"],
            "answerIndex": 0,
            "explain": "Chủ ngữ 'She' số ít, hành động đang diễn ra dùng 'is reading'."
        },
        {
            "question": "What are you doing? - I ______ an email to my friend.",
            "options": ["am writing", "write", "writing", "is writing"],
            "answerIndex": 0,
            "explain": "Trả lời câu hỏi 'What are you doing?' dùng 'I am writing'."
        }
    ]
}

u3_writing = {
    "items": [
        {
            "id": "u3_w1",
            "type": "unscramble",
            "scrambledWords": ["Jimmy", "has", "blonde", "hair", "and", "blue", "eyes"],
            "correctSentence": "Jimmy has blonde hair and blue eyes",
            "meaningVi": "Jimmy có mái tóc vàng hoe và đôi mắt màu xanh lam.",
            "hint": "Miêu tả ngoại hình: S + have/has + tính từ + danh từ."
        },
        {
            "id": "u3_w2",
            "type": "unscramble",
            "scrambledWords": ["Nhung", "is", "playing", "the", "violin", "in", "the", "room"],
            "correctSentence": "Nhung is playing the violin in the room",
            "meaningVi": "Nhung đang kéo đàn vĩ cầm ở trong phòng.",
            "hint": "Cấu trúc hiện tại tiếp diễn: S + is playing..."
        },
        {
            "id": "u3_w3",
            "type": "fill_blank",
            "sentence": "Phong is tall and he plays ______ very well.",
            "blankWord": "basketball",
            "correctSentence": "Phong is tall and he plays basketball very well.",
            "options": ["basketball", "football", "tennis", "swimming"],
            "meaningVi": "Phong cao ráo và bạn ấy chơi bóng rổ rất giỏi."
        },
        {
            "id": "u3_w4",
            "type": "fill_blank",
            "sentence": "My best friend is very ______ because she likes doing activities.",
            "blankWord": "active",
            "correctSentence": "My best friend is very active because she likes doing activities.",
            "options": ["active", "shy", "lazy", "funny"],
            "meaningVi": "Bạn thân của mình rất năng động vì bạn ấy thích tham gia các hoạt động."
        }
    ],
    "correctSentence": "Jimmy has blonde hair and blue eyes",
    "scrambledWords": ["Jimmy", "has", "blonde", "hair", "and", "blue", "eyes"],
    "meaningVi": "Jimmy có mái tóc vàng hoe và đôi mắt màu xanh lam."
}

update_unit(3, {
    "reading": u3_reading,
    "grammar": u3_grammar,
    "writing": u3_writing
})

# ================= UNIT 4 =================
u4_reading = {
    "title": "Khang's Blog: My Neighbourhood",
    "passage": "I live in the suburbs of Da Nang City. There are many things I like about my neighbourhood.\n\nIt's great for outdoor activities because it has beautiful parks, sandy beaches and fine weather. There's almost everything I need here: shops, restaurants, and markets. The people here are friendlier, and the food is better than in other places.\n\nHowever, there are two things I dislike about it: there are many modern buildings and offices; and the streets are busy and crowded.",
    "translation": "Mình sống ở khu vực ngoại ô của thành phố Đà Nẵng. Có rất nhiều điều mình yêu thích về khu phố nơi mình sinh sống.\n\nNơi đây rất tuyệt vời cho các hoạt động ngoài trời bởi vì có những công viên xinh đẹp, bãi biển cát trắng mịn và thời tiết dễ chịu. Ở đây có hầu như mọi thứ mình cần: cửa hàng, quán ăn và các khu chợ. Con người ở đây thân thiện hơn và thức ăn ngon hơn những nơi khác.\n\nTuy nhiên, có hai điều mình không thích: có quá nhiều tòa nhà và văn phòng hiện đại; cùng với đường phố luôn bận rộn và đông đúc.",
    "questions": [
        {
            "id": "u4_r1",
            "type": "multiple_choice",
            "question": "Where does Khang live?",
            "options": ["In the suburbs of Da Nang City", "In the centre of Ha Noi", "In a small village in Da Lat", "In Sydney"],
            "answerIndex": 0,
            "explain": "Đoạn 1: 'I live in the suburbs of Da Nang City.'"
        },
        {
            "id": "u4_r2",
            "type": "multiple_choice",
            "question": "Why is Khang's neighbourhood great for outdoor activities?",
            "options": ["Because it has beautiful parks, sandy beaches and fine weather", "Because there are no cars", "Because it is very quiet", "Because it has huge shopping malls"],
            "answerIndex": 0,
            "explain": "Đoạn 2: 'It's great for outdoor activities because it has beautiful parks, sandy beaches and fine weather.'"
        },
        {
            "id": "u4_r3",
            "type": "multiple_choice",
            "question": "What are the people in his neighbourhood like?",
            "options": ["They are friendlier than in other places", "They are very busy and quiet", "They are noisy", "They are shy"],
            "answerIndex": 0,
            "explain": "Đoạn 2: 'The people here are friendlier, and the food is better than in other places.'"
        },
        {
            "id": "u4_r4",
            "type": "multiple_choice",
            "question": "What are the two things Khang dislikes about his neighbourhood?",
            "options": ["Many modern buildings and busy, crowded streets", "Bad food and unfriendly people", "No parks and bad weather", "Small schools and no markets"],
            "answerIndex": 0,
            "explain": "Đoạn 3: 'there are many modern buildings and offices; and the streets are busy and crowded.'"
        },
        {
            "id": "u4_r5",
            "type": "fill_blank",
            "question": "The food in Khang's neighbourhood is ______ than in other places.",
            "blankWord": "better",
            "options": ["better", "worse", "cheaper", "more expensive"],
            "explain": "Đoạn 2: 'and the food is better than in other places.' (So sánh hơn của good là better)."
        }
    ]
}

u4_grammar = {
    "title": "Tính từ so sánh hơn (Comparative Adjectives)",
    "ruleVi": "Dùng để so sánh giữa hai người hoặc hai vật với nhau. Tính từ ngắn (1 âm tiết) thêm đuôi -er + than. Tính từ dài (2 âm tiết trở lên) dùng more + tính từ + than.",
    "formula": "Tính từ ngắn: S1 + be + adj-er + than + S2 | Tính từ dài: S1 + be + more + adj + than + S2",
    "quickTip": "Tính từ 2 âm tiết kết thúc bằng -y (noisy, happy, busy) đổi -y thành -i rồi thêm -er (noisier, happier, busier). Một số tính từ bất quy tắc: good -> better, bad -> worse.",
    "quiz": [
        {
            "question": "This street is ______ than that one.",
            "options": ["noisier", "more noisy", "noisiest", "noisy"],
            "answerIndex": 0,
            "explain": "Noisy đổi -y thành -i rồi thêm -er thành 'noisier'."
        },
        {
            "question": "A city house is ______ than a country house.",
            "options": ["more modern", "moderner", "modernest", "most modern"],
            "answerIndex": 0,
            "explain": "Modern là tính từ dài 2 âm tiết, so sánh hơn là 'more modern'."
        },
        {
            "question": "Things at a corner shop are ______ than things at a village market.",
            "options": ["more expensive", "expensiver", "most expensive", "expensive"],
            "answerIndex": 0,
            "explain": "Expensive là tính từ dài 3 âm tiết, dùng 'more expensive'."
        },
        {
            "question": "Life in the countryside is ______ than life in the city.",
            "options": ["more peaceful", "peacefuler", "peacefulest", "peaceful"],
            "answerIndex": 0,
            "explain": "Peaceful là tính từ dài 2 âm tiết, dùng 'more peaceful'."
        },
        {
            "question": "A plane is ______ than a train.",
            "options": ["faster", "more fast", "fastest", "fast"],
            "answerIndex": 0,
            "explain": "Fast là tính từ ngắn 1 âm tiết, thêm -er thành 'faster'."
        },
        {
            "question": "My new school is ______ than my old school.",
            "options": ["larger", "more large", "largest", "large"],
            "answerIndex": 0,
            "explain": "Large có tận cùng là -e, chỉ thêm -r thành 'larger'."
        }
    ]
}

u4_writing = {
    "items": [
        {
            "id": "u4_w1",
            "type": "unscramble",
            "scrambledWords": ["The", "streets", "in", "the", "city", "are", "busy", "and", "crowded"],
            "correctSentence": "The streets in the city are busy and crowded",
            "meaningVi": "Đường phố ở thành phố rất nhộn nhịp và đông đúc.",
            "hint": "Bắt đầu bằng 'The streets...'"
        },
        {
            "id": "u4_w2",
            "type": "unscramble",
            "scrambledWords": ["Life", "in", "the", "countryside", "is", "more", "peaceful", "than", "city", "life"],
            "correctSentence": "Life in the countryside is more peaceful than city life",
            "meaningVi": "Cuộc sống ở vùng nông thôn yên bình hơn cuộc sống thành thị.",
            "hint": "So sánh hơn của peaceful: 'more peaceful than'."
        },
        {
            "id": "u4_w3",
            "type": "fill_blank",
            "sentence": "My neighbourhood is great because it has beautiful parks and sandy ______.",
            "blankWord": "beaches",
            "correctSentence": "My neighbourhood is great because it has beautiful parks and sandy beaches.",
            "options": ["beaches", "offices", "traffic", "buildings"],
            "meaningVi": "Khu phố của mình rất tuyệt vời vì có nhiều công viên đẹp và bãi biển cát mịn."
        },
        {
            "id": "u4_w4",
            "type": "fill_blank",
            "sentence": "There is an art ______ and a cathedral in my town.",
            "blankWord": "gallery",
            "correctSentence": "There is an art gallery and a cathedral in my town.",
            "options": ["gallery", "station", "suburb", "turning"],
            "meaningVi": "Thị trấn của mình có một phòng trưng bày nghệ thuật và một nhà thờ lớn."
        }
    ],
    "correctSentence": "The streets in the city are busy and crowded",
    "scrambledWords": ["The", "streets", "in", "the", "city", "are", "busy", "and", "crowded"],
    "meaningVi": "Đường phố ở thành phố rất nhộn nhịp và đông đúc."
}

update_unit(4, {
    "reading": u4_reading,
    "grammar": u4_grammar,
    "writing": u4_writing
})

# ================= UNIT 5 =================
u5_reading = {
    "title": "Natural Wonders of Viet Nam: Ha Long Bay and Mui Ne",
    "passage": "Ha Long Bay is in Quang Ninh. It has many islands and caves. Tuan Chau, with its beautiful beaches, is a popular tourist attraction in Ha Long Bay. There you can enjoy great seafood. And you can join in exciting activities. Ha Long Bay is Viet Nam's best natural wonder.\n\nMui Ne is popular for its amazing landscapes. The sand has different colours: white, yellow, red ... It's like a desert here. You can ride a bike down the slopes. You can also fly kites, or have a picnic by the beach. The best time to visit the Mui Ne Sand Dunes is early morning or late afternoon. Remember to wear suncream and bring water.",
    "translation": "Vịnh Hạ Long thuộc tỉnh Quảng Ninh. Nơi đây có rất nhiều hòn đảo và hang động kỳ vĩ. Tuần Châu, với những bãi biển tuyệt đẹp, là một điểm thu hút khách du lịch nổi tiếng tại Vịnh Hạ Long. Đến đây bạn có thể thưởng thức hải sản tươi ngon và tham gia các hoạt động thú vị. Vịnh Hạ Long là kỳ quan thiên nhiên số một của Việt Nam.\n\nMũi Né nổi tiếng với những cảnh quan thiên nhiên kỳ thú. Cát ở đây có nhiều màu sắc khác nhau: trắng, vàng, đỏ... Nơi này trông giống như một sa mạc vậy. Bạn có thể đạp xe trượt xuống những triền cát, thả diều hoặc cắm trại bên bờ biển. Thời điểm lý tưởng nhất để tham quan Đồi cát Mũi Né là sáng sớm hoặc xế chiều. Đừng quên thoa kem chống nắng và mang theo nước uống nhé.",
    "questions": [
        {
            "id": "u5_r1",
            "type": "multiple_choice",
            "question": "Where is Ha Long Bay located?",
            "options": ["In Quang Ninh", "In Da Nang", "In Binh Thuan", "In Ha Noi"],
            "answerIndex": 0,
            "explain": "Đoạn 1 nêu rõ: 'Ha Long Bay is in Quang Ninh.'"
        },
        {
            "id": "u5_r2",
            "type": "fill_blank",
            "question": "Ha Long Bay is famous for its beautiful ______.",
            "blankWord": "islands and caves",
            "options": ["islands and caves", "tall towers", "modern airports", "shopping centres"],
            "explain": "Đoạn 1: 'It has many islands and caves.'"
        },
        {
            "id": "u5_r3",
            "type": "multiple_choice",
            "question": "What is like a desert in Mui Ne?",
            "options": ["The sand dunes with different colours of sand", "The deep ocean", "The big waterfall", "The pine forest"],
            "answerIndex": 0,
            "explain": "Đoạn 2: 'The sand has different colours: white, yellow, red ... It's like a desert here.'"
        },
        {
            "id": "u5_r4",
            "type": "multiple_choice",
            "question": "When is the best time to visit the Mui Ne Sand Dunes?",
            "options": ["Early morning or late afternoon", "At midday in hot sun", "At midnight", "Only in winter"],
            "answerIndex": 0,
            "explain": "Đoạn 2: 'The best time to visit the Mui Ne Sand Dunes is early morning or late afternoon.'"
        },
        {
            "id": "u5_r5",
            "type": "multiple_choice",
            "question": "What should you remember to bring when visiting the sand dunes?",
            "options": ["Suncream and water", "A heavy coat and boots", "An umbrella and computer", "Books and pencils"],
            "answerIndex": 0,
            "explain": "Đoạn 2 câu cuối: 'Remember to wear suncream and bring water.'"
        }
    ]
}

u5_grammar = {
    "title": "Danh từ đếm được / Không đếm được & Động từ khuyết thiếu Must / Mustn't",
    "ruleVi": "Danh từ đếm được có thể đếm bằng số và có dạng số nhiều (islands, caves, bottles). Danh từ không đếm được không có dạng số nhiều (water, milk, luggage, snow). Must dùng để diễn tả điều bắt buộc phải làm; Mustn't dùng để chỉ điều cấm đoán, không được phép làm.",
    "formula": "Bắt buộc: S + must + V_inf | Cấm đoán: S + mustn't + V_inf",
    "quickTip": "Must và Mustn't luôn đi với động từ nguyên mẫu không chia. Không dùng 'many' hay số đếm với danh từ không đếm được (dùng 'much water', không nói 'many waters').",
    "quiz": [
        {
            "question": "It's dangerous to go hiking alone. You ______ tell someone where you are going.",
            "options": ["must", "mustn't", "can't", "needn't"],
            "answerIndex": 0,
            "explain": "Việc nguy hiểm nên bắt buộc 'phải' báo cho ai đó biết, dùng 'must'."
        },
        {
            "question": "It's very cold on the mountain summit. You ______ take a warm coat.",
            "options": ["must", "mustn't", "can", "shouldn't"],
            "answerIndex": 0,
            "explain": "Rất lạnh nên bắt buộc phải mang áo ấm, dùng 'must'."
        },
        {
            "question": "The cliff path is narrow. You ______ run or push others.",
            "options": ["mustn't", "must", "can", "should"],
            "answerIndex": 0,
            "explain": "Đường hẹp nguy hiểm nên 'cấm' chạy nhảy xô đẩy, dùng 'mustn't'."
        },
        {
            "question": "You ______ forget to bring a compass and suncream for your desert trip.",
            "options": ["mustn't", "must", "may", "can"],
            "answerIndex": 0,
            "explain": "Cấm không được quên mang đồ thiết yếu, dùng 'mustn't'."
        },
        {
            "question": "There is not much ______ left in the fridge.",
            "options": ["milk", "apples", "bananas", "bottles"],
            "answerIndex": 0,
            "explain": "'Much' đi với danh từ không đếm được là 'milk'."
        },
        {
            "question": "Don't take too much ______ on your backpacking trip.",
            "options": ["luggage", "luggages", "bags luggage", "items luggage"],
            "answerIndex": 0,
            "explain": "'Luggage' (hành lý) là danh từ không đếm được, không có đuôi số nhiều -s."
        }
    ]
}

u5_writing = {
    "items": [
        {
            "id": "u5_w1",
            "type": "unscramble",
            "scrambledWords": ["Ha", "Long", "Bay", "is", "Viet", "Nam's", "best", "natural", "wonder"],
            "correctSentence": "Ha Long Bay is Viet Nam's best natural wonder",
            "meaningVi": "Vịnh Hạ Long là kỳ quan thiên nhiên số một của Việt Nam.",
            "hint": "Bắt đầu bằng 'Ha Long Bay...'"
        },
        {
            "id": "u5_w2",
            "type": "unscramble",
            "scrambledWords": ["You", "must", "bring", "suncream", "and", "water", "for", "the", "trip"],
            "correctSentence": "You must bring suncream and water for the trip",
            "meaningVi": "Bạn phải mang theo kem chống nắng và nước uống cho chuyến đi.",
            "hint": "Cấu trúc với must: S + must + V_inf..."
        },
        {
            "id": "u5_w3",
            "type": "fill_blank",
            "sentence": "A ______ is a large area of land with very little water.",
            "blankWord": "desert",
            "correctSentence": "A desert is a large area of land with very little water.",
            "options": ["desert", "waterfall", "island", "forest"],
            "meaningVi": "Sa mạc là một vùng đất rộng lớn với rất ít nước."
        },
        {
            "id": "u5_w4",
            "type": "fill_blank",
            "sentence": "Ban Gioc is a famous ______ in Cao Bang.",
            "blankWord": "waterfall",
            "correctSentence": "Ban Gioc is a famous waterfall in Cao Bang.",
            "options": ["waterfall", "desert", "beach", "island"],
            "meaningVi": "Bản Giốc là một thác nước nổi tiếng ở Cao Bằng."
        }
    ],
    "correctSentence": "Ha Long Bay is Viet Nam's best natural wonder",
    "scrambledWords": ["Ha", "Long", "Bay", "is", "Viet", "Nam's", "best", "natural", "wonder"],
    "meaningVi": "Vịnh Hạ Long là kỳ quan thiên nhiên số một của Việt Nam."
}

update_unit(5, {
    "reading": u5_reading,
    "grammar": u5_grammar,
    "writing": u5_writing
})

# ================= UNIT 6 =================
u6_reading = {
    "title": "New Year Celebrations Around the World",
    "passage": "A. Russ (the USA): I often go to Times Square with my parents to welcome the New Year. When the clock strikes midnight, colourful fireworks light up the sky. Everybody cheers and sings.\n\nB. Wu (China): On New Year's Day, we dress beautifully and go to our grandparents' houses. We wish them Happy New Year and they give us lucky money. Then we go out and have a day full of fun.\n\nC. Mai (Viet Nam): I learn some customs about Tet from my parents. People give rice to wish for enough food and buy salt to wish for good luck. Dogs are lucky animals but cats are not. A cat's cry sounds like 'poor' in Vietnamese.",
    "translation": "A. Russ (Mỹ): Mình thường cùng bố mẹ đến Quảng trường Thời đại để đón chào Năm Mới. Khi đồng hồ điểm đúng nửa đêm, những chùm pháo hoa rực rỡ thắp sáng cả bầu trời. Mọi người cùng reo hò và ca hát.\n\nB. Wu (Trung Quốc): Vào ngày mồng một Tết, chúng mình mặc những bộ quần áo đẹp nhất và đến chúc Tết ông bà. Chúng mình chúc ông bà Năm Mới hạnh phúc và được ông bà mừng tiền lì xì. Sau đó cả nhà cùng đi chơi và có một ngày tràn ngập niềm vui.\n\nC. Mai (Việt Nam): Mình học được nhiều phong tục ngày Tết từ bố mẹ. Mọi người biếu gạo để chúc nhau no ấm quanh năm và mua muối đầu năm để cầu may mắn. Chó là loài vật mang lại may mắn, nhưng mèo thì không, vì tiếng mèo kêu 'meo meo' nghe gần giống từ 'nghèo'.",
    "questions": [
        {
            "id": "u6_r1",
            "type": "multiple_choice",
            "question": "Who goes to Times Square to watch colourful fireworks at midnight?",
            "options": ["Russ (the USA)", "Wu (China)", "Mai (Viet Nam)", "Nam"],
            "answerIndex": 0,
            "explain": "Phần A: 'Russ (the USA): I often go to Times Square with my parents to welcome the New Year.'"
        },
        {
            "id": "u6_r2",
            "type": "multiple_choice",
            "question": "What do children in China receive after wishing their grandparents Happy New Year?",
            "options": ["Lucky money", "A pet cat", "A calendar", "School bags"],
            "answerIndex": 0,
            "explain": "Phần B: 'We wish them Happy New Year and they give us lucky money.'"
        },
        {
            "id": "u6_r3",
            "type": "multiple_choice",
            "question": "According to Vietnamese custom, why do people buy salt at Tet?",
            "options": ["To wish for good luck", "To cook special rice", "To give to dogs", "To decorate the room"],
            "answerIndex": 0,
            "explain": "Phần C: 'and buy salt to wish for good luck.'"
        },
        {
            "id": "u6_r4",
            "type": "multiple_choice",
            "question": "Why do people in Viet Nam consider dogs as lucky animals but cats as not?",
            "options": ["Because a cat's cry sounds like 'poor' in Vietnamese", "Because dogs are bigger than cats", "Because cats run around the house", "Because dogs eat rice"],
            "answerIndex": 0,
            "explain": "Phần C: 'Dogs are lucky animals but cats are not. A cat's cry sounds like 'poor' in Vietnamese.'"
        },
        {
            "id": "u6_r5",
            "type": "fill_blank",
            "question": "On New Year's Day, children dress ______ and visit their grandparents.",
            "blankWord": "beautifully",
            "options": ["beautifully", "badly", "loudly", "slowly"],
            "explain": "Phần B: 'On New Year's Day, we dress beautifully and go to our grandparents' houses.'"
        }
    ]
}

u6_grammar = {
    "title": "Lời khuyên Should / Shouldn't & Lượng từ Some / Any",
    "ruleVi": "Dùng Should khi khuyên ai NÊN làm gì; Shouldn't khi khuyên ai KHÔNG NÊN làm gì. Some (một vài/một ít) dùng trong câu khẳng định. Any dùng trong câu phủ định và câu hỏi.",
    "formula": "Khuyên nên: S + should + V_inf | Khuyên không nên: S + shouldn't + V_inf | Some + N (khẳng định) | Any + N (phủ định/nghi vấn)",
    "quickTip": "Should/shouldn't luôn đi với động từ nguyên mẫu không 'to'. Sau 'don't have' hoặc 'isn't' luôn dùng 'any', không dùng 'some'.",
    "quiz": [
        {
            "question": "Children ______ ask for permission before entering a room.",
            "options": ["should", "shouldn't", "mustn't", "can't"],
            "answerIndex": 0,
            "explain": "Lời khuyên lễ phép: trẻ em 'nên' xin phép trước khi vào phòng, dùng 'should'."
        },
        {
            "question": "You ______ make a lot of noise when others are resting.",
            "options": ["shouldn't", "should", "must", "can"],
            "answerIndex": 0,
            "explain": "Lời khuyên không nên làm ồn, dùng 'shouldn't'."
        },
        {
            "question": "We should ______ trees in spring to make our town greener.",
            "options": ["plant", "plants", "planting", "planted"],
            "answerIndex": 0,
            "explain": "Sau should dùng động từ nguyên mẫu không chia là 'plant'."
        },
        {
            "question": "At Tet, my mother puts ______ lucky money into red envelopes.",
            "options": ["some", "any", "an", "a"],
            "answerIndex": 0,
            "explain": "Câu khẳng định dùng 'some' với danh từ không đếm được 'money'."
        },
        {
            "question": "I love flowers, but I don't have ______ peach blossoms yet.",
            "options": ["any", "some", "a", "much"],
            "answerIndex": 0,
            "explain": "Câu phủ định 'don't have' đi với 'any'."
        },
        {
            "question": "You ______ break things at Tet because it brings bad luck.",
            "options": ["shouldn't", "should", "must", "are"],
            "answerIndex": 0,
            "explain": "Khuyên không nên làm vỡ đồ đạc ngày Tết, dùng 'shouldn't'."
        }
    ]
}

u6_writing = {
    "items": [
        {
            "id": "u6_w1",
            "type": "unscramble",
            "scrambledWords": ["At", "Tet", "my", "mother", "puts", "lucky", "money", "into", "red", "envelopes"],
            "correctSentence": "At Tet my mother puts lucky money into red envelopes",
            "meaningVi": "Vào dịp Tết, mẹ mình bỏ tiền lì xì vào các phong bao đỏ.",
            "hint": "Bắt đầu bằng 'At Tet...'"
        },
        {
            "id": "u6_w2",
            "type": "unscramble",
            "scrambledWords": ["Children", "should", "behave", "well", "and", "visit", "their", "grandparents"],
            "correctSentence": "Children should behave well and visit their grandparents",
            "meaningVi": "Trẻ em nên ngoan ngoãn và đi thăm ông bà vào dịp Tết.",
            "hint": "Cấu trúc với should: S + should + V_inf..."
        },
        {
            "id": "u6_w3",
            "type": "fill_blank",
            "sentence": "When everybody is at home together, we call it a family ______.",
            "blankWord": "gathering",
            "correctSentence": "When everybody is at home together, we call it a family gathering.",
            "options": ["gathering", "firework", "blossom", "relative"],
            "meaningVi": "Khi mọi người cùng sum họp tại nhà, chúng ta gọi đó là buổi họp mặt gia đình."
        },
        {
            "id": "u6_w4",
            "type": "fill_blank",
            "sentence": "Banh chung is a special ______ for Tet in Viet Nam.",
            "blankWord": "food",
            "correctSentence": "Banh chung is a special food for Tet in Viet Nam.",
            "options": ["food", "drink", "tree", "animal"],
            "meaningVi": "Bánh chưng là một món ăn đặc biệt trong dịp Tết ở Việt Nam."
        }
    ],
    "correctSentence": "At Tet my mother puts lucky money into red envelopes",
    "scrambledWords": ["At", "Tet", "my", "mother", "puts", "lucky", "money", "into", "red", "envelopes"],
    "meaningVi": "Vào dịp Tết, mẹ mình bỏ tiền lì xì vào các phong bao đỏ."
}

update_unit(6, {
    "reading": u6_reading,
    "grammar": u6_grammar,
    "writing": u6_writing
})

# ================= UNIT 7 =================
u7_reading = {
    "title": "A Day's TV Guide",
    "passage": "8.00 - Wildlife: Cuc Phuong Forest - Watch the colourful world of plants, flowers, and animals in their real life.\n\n9.00 - Comedy: The Fox Teacher - Have a lot of fun with a fox teacher and his students on their first day at school.\n\n10.30 - Sports: The Pig Race - Watch the cute pigs compete in the most exciting races. Who wins?\n\n11.00 - Game show: Children are Always Right - Join this game show today and try to answer interesting questions about pets.\n\n12.15 - Science: The Dolphins - Watch funny and interesting clips of intelligent dolphins in their natural life - the sea.",
    "translation": "8:00 - Thế giới hoang dã: Rừng Cúc Phương - Chiêm ngưỡng thế giới đầy màu sắc của cây cối, hoa lá và các loài động vật trong môi trường tự nhiên.\n\n9:00 - Phim hài: Thầy giáo Cáo - Cùng cười sảng khoái với thầy giáo cáo và các cô cậu học trò trong ngày đầu tiên đến trường.\n\n10:30 - Thể thao: Cuộc đua heo - Xem những chú heo đáng yêu so tài trong những cuộc đua hấp dẫn nhất. Ai sẽ giành chiến thắng?\n\n11:00 - Trò chơi truyền hình: Trẻ em luôn đúng - Hãy tham gia trò chơi hôm nay và thử trả lời những câu hỏi thú vị về các loài thú cưng.\n\n12:15 - Khoa học: Những chú cá heo - Xem những thước phim hài hước và kỳ thú về loài cá heo thông minh trong môi trường biển cả tự nhiên.",
    "questions": [
        {
            "id": "u7_r1",
            "type": "multiple_choice",
            "question": "What can viewers watch on the Wildlife programme at 8.00?",
            "options": ["The colourful world of plants, flowers, and animals in Cuc Phuong Forest", "Cute pigs competing in a race", "A fox teacher and his students", "Questions about pets"],
            "answerIndex": 0,
            "explain": "Chương trình lúc 8.00 giới thiệu thế giới cây cối, hoa lá và động vật ở Rừng Cúc Phương."
        },
        {
            "id": "u7_r2",
            "type": "multiple_choice",
            "question": "Is 'The Fox Teacher' at 9.00 a comedy?",
            "options": ["Yes, it is a funny comedy", "No, it is a sports match", "No, it is a news programme", "No, it is a game show"],
            "answerIndex": 0,
            "explain": "Lịch phát sóng ghi rõ: '9.00 - Comedy: The Fox Teacher'."
        },
        {
            "id": "u7_r3",
            "type": "multiple_choice",
            "question": "What time is the sports programme 'The Pig Race' on?",
            "options": ["At 10.30", "At 8.00", "At 9.00", "At 12.15"],
            "answerIndex": 0,
            "explain": "Lịch phát sóng: '10.30 - Sports: The Pig Race'."
        },
        {
            "id": "u7_r4",
            "type": "multiple_choice",
            "question": "What is the topic of the Science programme at 12.15?",
            "options": ["Intelligent dolphins in their natural sea life", "Lions and tigers in the jungle", "Space travel", "Weather forecast"],
            "answerIndex": 0,
            "explain": "Chương trình 12.15 chiếu các clip hài hước về loài cá heo thông minh ngoài biển khơi."
        },
        {
            "id": "u7_r5",
            "type": "fill_blank",
            "question": "Phong wants to know more about dogs and cats. He should watch ______ at 11.00.",
            "blankWord": "Children are Always Right",
            "options": ["Children are Always Right", "The Fox Teacher", "The Pig Race", "Cuc Phuong Forest"],
            "explain": "Chương trình lúc 11.00 là trò chơi hỏi đáp thú vị về các loài thú cưng."
        }
    ]
}

u7_grammar = {
    "title": "Từ để hỏi Wh-questions & Liên từ kết hợp (Conjunctions: and, but, so)",
    "ruleVi": "Các từ để hỏi: What (cái gì), Where (ở đâu), When (khi nào), Who (ai), Why (tại sao), How many (bao nhiêu). Liên từ kết hợp: and (nối ý tương đồng), but (nối ý đối lập), so (nêu kết quả).",
    "formula": "Từ để hỏi: Wh-word + do/does/did/be + S + V...? | Liên từ: Mệnh đề 1, and/but/so + Mệnh đề 2",
    "quickTip": "'Why' hỏi lý do thì câu trả lời thường bắt đầu bằng 'Because...'. 'So' đứng trước mệnh đề chỉ kết quả (vì vậy, cho nên).",
    "quiz": [
        {
            "question": "______ did you watch on TV last night? - I watched The Fox Teacher.",
            "options": ["What", "Where", "When", "Who"],
            "answerIndex": 0,
            "explain": "Hỏi xem 'cái gì' trên TV tối qua, dùng 'What'."
        },
        {
            "question": "______ do you like the Wildlife programme? - Because I love animals.",
            "options": ["Why", "How", "What", "When"],
            "answerIndex": 0,
            "explain": "Câu trả lời có 'Because' chỉ lý do nên từ để hỏi là 'Why'."
        },
        {
            "question": "______ is your favourite MC on TV? - I like Minh Phong.",
            "options": ["Who", "What", "Where", "Which"],
            "answerIndex": 0,
            "explain": "Hỏi 'ai' là người dẫn chương trình yêu thích, dùng 'Who'."
        },
        {
            "question": "I like The Seven Kitties very much, ______ I watch it every day.",
            "options": ["so", "but", "although", "because"],
            "answerIndex": 0,
            "explain": "Chỉ kết quả: rất thích 'cho nên' xem mỗi ngày, dùng liên từ 'so'."
        },
        {
            "question": "BBC One is a British channel, ______ VTV6 is a Vietnamese channel.",
            "options": ["but", "so", "and", "because"],
            "answerIndex": 0,
            "explain": "Hai ý tương phản giữa kênh của Anh và kênh của Việt Nam, dùng 'but'."
        },
        {
            "question": "Ocean Life is on at 7.30, ______ Laughing out Loud comes next at 8.00.",
            "options": ["and", "but", "so", "although"],
            "answerIndex": 0,
            "explain": "Hai sự việc bổ sung tiếp nối cho nhau, dùng 'and'."
        }
    ]
}

u7_writing = {
    "items": [
        {
            "id": "u7_w1",
            "type": "unscramble",
            "scrambledWords": ["VTV1", "is", "a", "popular", "TV", "channel", "in", "Viet", "Nam"],
            "correctSentence": "VTV1 is a popular TV channel in Viet Nam",
            "meaningVi": "VTV1 là một kênh truyền hình phổ biến ở Việt Nam.",
            "hint": "Bắt đầu bằng 'VTV1 is...'"
        },
        {
            "id": "u7_w2",
            "type": "unscramble",
            "scrambledWords": ["I", "have", "a", "lot", "of", "homework", "tonight", "so", "I", "can't", "watch", "TV"],
            "correctSentence": "I have a lot of homework tonight so I can't watch TV",
            "meaningVi": "Tối nay mình có nhiều bài tập nên không thể xem tivi.",
            "hint": "Nối hai vế bằng liên từ 'so'."
        },
        {
            "id": "u7_w3",
            "type": "fill_blank",
            "sentence": "Comedies make people laugh because they are very ______.",
            "blankWord": "funny",
            "correctSentence": "Comedies make people laugh because they are very funny.",
            "options": ["funny", "boring", "sad", "difficult"],
            "meaningVi": "Phim hài làm mọi người bật cười vì chúng rất buồn cười và ngộ nghĩnh."
        },
        {
            "id": "u7_w4",
            "type": "fill_blank",
            "sentence": "Game shows on TV are both fun and ______.",
            "blankWord": "educational",
            "correctSentence": "Game shows on TV are both fun and educational.",
            "options": ["educational", "tired", "polluted", "historic"],
            "meaningVi": "Các trò chơi truyền hình trên TV vừa vui nhộn lại vừa có tính giáo dục."
        }
    ],
    "correctSentence": "VTV1 is a popular TV channel in Viet Nam",
    "scrambledWords": ["VTV1", "is", "a", "popular", "TV", "channel", "in", "Viet", "Nam"],
    "meaningVi": "VTV1 là một kênh truyền hình phổ biến ở Việt Nam."
}

update_unit(7, {
    "reading": u7_reading,
    "grammar": u7_grammar,
    "writing": u7_writing
})

# ================= UNIT 8 =================
u8_reading = {
    "title": "Pelé: The King of Football",
    "passage": "Teacher: Today we're going to talk about Pelé. Do you know him?\nNick: Yes, I think he's the best footballer of all time.\nTeacher: Right. He was born in 1940 in Brazil. His father taught him to play football at a very young age.\nSusan: Oh. When did he begin his career in football?\nTeacher: At 15, when he started playing for Santos Football Club. In 1958, he won his first World Cup.\nNick: How many goals did he score in his career?\nTeacher: 1,281 goals in total, I think.\nNick and Susan: Wow! Amazing!\nTeacher: And he became 'Football Player of the Century' in 1999.\nMichael: Surely Pelé's a national hero in Brazil.\nTeacher: Yes, and he's known around the world as 'The King of Football'.",
    "translation": "Cô giáo: Hôm nay chúng ta sẽ tìm hiểu về Pelé. Các em có biết ông ấy không?\nNick: Có ạ, em nghĩ ông ấy là cầu thủ bóng đá xuất sắc nhất mọi thời đại.\nCô giáo: Đúng vậy. Ông sinh năm 1940 tại Brazil. Bố ông đã dạy ông đá bóng từ khi còn rất nhỏ.\nSusan: Ồ, vậy ông bắt đầu sự nghiệp bóng đá khi nào ạ?\nCô giáo: Vào năm 15 tuổi, khi ông bắt đầu thi đấu cho Câu lạc bộ Santos. Năm 1958, ông đã giành cúp vô địch World Cup đầu tiên.\nNick: Trong suốt sự nghiệp, ông đã ghi được bao nhiêu bàn thắng ạ?\nCô giáo: Tổng cộng là 1.281 bàn thắng, cô nhớ là vậy.\nNick và Susan: Oa! Thật đáng kinh ngạc!\nCô giáo: Và ông đã trở thành 'Cầu thủ bóng đá của Thế kỷ' vào năm 1999.\nMichael: Chắc chắn Pelé là người anh hùng dân tộc của đất nước Brazil.\nCô giáo: Đúng thế, và khắp thế giới mọi người đều biết đến ông với danh xưng 'Vua bóng đá'.",
    "questions": [
        {
            "id": "u8_r1",
            "type": "multiple_choice",
            "question": "When and where was Pelé born?",
            "options": ["In 1940 in Brazil", "In 1958 in England", "In 1999 in France", "In 1978 in Viet Nam"],
            "answerIndex": 0,
            "explain": "Cô giáo nói: 'He was born in 1940 in Brazil.'"
        },
        {
            "id": "u8_r2",
            "type": "multiple_choice",
            "question": "Who first taught Pelé to play football at a very young age?",
            "options": ["His father", "His PE teacher", "His brother", "His coach"],
            "answerIndex": 0,
            "explain": "Cô giáo nói: 'His father taught him to play football at a very young age.'"
        },
        {
            "id": "u8_r3",
            "type": "multiple_choice",
            "question": "How old was Pelé when he began his career playing for Santos Football Club?",
            "options": ["At 15 years old", "At 18 years old", "At 20 years old", "At 10 years old"],
            "answerIndex": 0,
            "explain": "Cô giáo trả lời: 'At 15, when he started playing for Santos Football Club.'"
        },
        {
            "id": "u8_r4",
            "type": "multiple_choice",
            "question": "How many goals did Pelé score in total during his career?",
            "options": ["1,281 goals", "500 goals", "850 goals", "2,000 goals"],
            "answerIndex": 0,
            "explain": "Cô giáo: '1,281 goals in total, I think.'"
        },
        {
            "id": "u8_r5",
            "type": "fill_blank",
            "question": "Pelé is known around the world as 'The ______ of Football'.",
            "blankWord": "King",
            "options": ["King", "Prince", "Hero", "Master"],
            "explain": "Câu cuối bài: 'he's known around the world as The King of Football'."
        }
    ]
}

u8_grammar = {
    "title": "Thì Quá khứ đơn & Câu mệnh lệnh (Past Simple & Imperatives)",
    "ruleVi": "Thì Quá khứ đơn diễn tả sự việc đã bắt đầu và kết thúc hoàn toàn trong quá khứ. Câu mệnh lệnh dùng để yêu cầu, ra lệnh hoặc hướng dẫn ai làm/không làm việc gì.",
    "formula": "Quá khứ: S + V2/ed | Phủ định: S + didn't + V_inf | Mệnh lệnh: V_inf! / Don't + V_inf!",
    "quickTip": "Động từ bất quy tắc phổ biến: take -> took, win -> won, do -> did, go -> went, see -> saw, buy -> bought. Câu mệnh lệnh không có chủ ngữ, bắt đầu thẳng bằng động từ nguyên mẫu.",
    "quiz": [
        {
            "question": "The first Olympic Games ______ place in Greece in 776 BC.",
            "options": ["took", "takes", "take", "taking"],
            "answerIndex": 0,
            "explain": "Năm 776 trước Công nguyên là quá khứ, động từ take chuyển thành 'took'."
        },
        {
            "question": "In 1958, Pelé ______ his first World Cup with Brazil.",
            "options": ["won", "win", "winned", "wins"],
            "answerIndex": 0,
            "explain": "Năm 1958 trong quá khứ, động từ win đổi thành 'won'."
        },
        {
            "question": "My brother ______ to play sports when he was small.",
            "options": ["didn't like", "not liked", "doesn't like", "wasn't like"],
            "answerIndex": 0,
            "explain": "Phủ định thì quá khứ đơn dùng trợ động từ 'didn't' + động từ nguyên mẫu 'like'."
        },
        {
            "question": "Your friends are making too much noise. -> Please, ______!",
            "options": ["be quiet", "are quiet", "being quiet", "to be quiet"],
            "answerIndex": 0,
            "explain": "Câu mệnh lệnh lịch sự dùng 'Please, be quiet' (Xin hãy giữ trật tự)."
        },
        {
            "question": "Don't ______ the animals at the zoo! It's not allowed.",
            "options": ["feed", "fed", "feeding", "feeds"],
            "answerIndex": 0,
            "explain": "Câu mệnh lệnh phủ định: Don't + động từ nguyên mẫu 'feed'."
        },
        {
            "question": "Duy isn't reading now. He ______ table tennis with his friend.",
            "options": ["is playing", "plays", "played", "playing"],
            "answerIndex": 0,
            "explain": "Có 'now' chỉ hành động đang diễn ra nên dùng hiện tại tiếp diễn 'is playing'."
        }
    ]
}

u8_writing = {
    "items": [
        {
            "id": "u8_w1",
            "type": "unscramble",
            "scrambledWords": ["Pelé", "is", "known", "around", "the", "world", "as", "The", "King", "of", "Football"],
            "correctSentence": "Pelé is known around the world as The King of Football",
            "meaningVi": "Pelé được khắp thế giới biết đến với danh hiệu Vua bóng đá.",
            "hint": "Bắt đầu bằng 'Pelé is known...'"
        },
        {
            "id": "u8_w2",
            "type": "unscramble",
            "scrambledWords": ["Please", "stand", "in", "line", "and", "do", "not", "push", "each", "other"],
            "correctSentence": "Please stand in line and do not push each other",
            "meaningVi": "Xin vui lòng xếp hàng và không xô đẩy nhau.",
            "hint": "Câu mệnh lệnh: 'Please stand in line...'"
        },
        {
            "id": "u8_w3",
            "type": "fill_blank",
            "sentence": "You need a pair of ______ when you go swimming.",
            "blankWord": "goggles",
            "correctSentence": "You need a pair of goggles when you go swimming.",
            "options": ["goggles", "rackets", "skateboards", "balls"],
            "meaningVi": "Bạn cần một chiếc kính bơi khi đi bơi lội."
        },
        {
            "id": "u8_w4",
            "type": "fill_blank",
            "sentence": "Duong can do ______ very well.",
            "blankWord": "karate",
            "correctSentence": "Duong can do karate very well.",
            "options": ["karate", "football", "swimming", "aerobics"],
            "meaningVi": "Dương có thể tập võ karate rất cừ."
        }
    ],
    "correctSentence": "Pelé is known around the world as The King of Football",
    "scrambledWords": ["Pelé", "is", "known", "around", "the", "world", "as", "The", "King", "of", "Football"],
    "meaningVi": "Pelé được khắp thế giới biết đến với danh xưng Vua bóng đá."
}

update_unit(8, {
    "reading": u8_reading,
    "grammar": u8_grammar,
    "writing": u8_writing
})

# ================= UNIT 9 =================
u9_reading = {
    "title": "Love from Sweden: Mai's Postcard from Stockholm",
    "passage": "September 6\nDear Grandpa and Grandma,\n\nStockholm is fantastic!\n\nIts weather is perfect, sunny all the time! Our hotel is good. It has a swimming pool and a gym. It offers delicious breakfast. Yesterday Mum, Dad and I rented three bikes and cycled to the Old Town. My parents wore their helmets and I wore mine. We visited the Royal Palace first. What a beautiful place! Mum loved it. She said, 'Swedish art is amazing.' After that, we had 'fika', a coffee break, in a traditional café. Everything is so wonderful!\n\nWish you were here!\nLove,\nMai",
    "translation": "Ngày 6 tháng 9\nKính gửi Ông Bà yêu quý,\n\nThành phố Stockholm thật là tuyệt vời ạ!\n\nThời tiết ở đây hoàn hảo, trời luôn ngập tràn ánh nắng! Khách sạn của gia đình cháu rất tốt, có hồ bơi và phòng tập thể dục, lại phục vụ bữa sáng rất ngon miệng. Hôm qua, bố mẹ và cháu đã thuê 3 chiếc xe đạp để đạp vào Khu Phố Cổ. Bố mẹ đội mũ bảo hiểm của bố mẹ còn cháu đội mũ bảo hiểm của cháu. Điểm đến đầu tiên của nhà cháu là Cung điện Hoàng gia. Nơi này đẹp tuyệt vời! Mẹ cháu mê tít và bảo: 'Nghệ thuật Thụy Điển thật kỳ diệu.' Sau đó, cả nhà cháu thưởng thức 'fika' - một giờ nghỉ uống cà phê thư giãn trong một quán cà phê truyền thống. Mọi thứ đều vô cùng tuyệt diệu ạ!\n\nƯớc gì ông bà cũng ở đây cùng gia đình cháu!\nYêu ông bà,\nMai",
    "questions": [
        {
            "id": "u9_r1",
            "type": "multiple_choice",
            "question": "What is Mai's postcard about?",
            "options": ["A family holiday in Stockholm, Sweden", "A school sports competition", "A visit to a zoo in Ha Noi", "A shopping trip"],
            "answerIndex": 0,
            "explain": "Bưu thiếp của Mai gửi ông bà kể về kỳ nghỉ tuyệt vời của gia đình tại thủ đô Stockholm, Thụy Điển."
        },
        {
            "id": "u9_r2",
            "type": "multiple_choice",
            "question": "What facilities can guests use in Mai's hotel?",
            "options": ["A swimming pool and a gym", "A big library and theatre", "A horse race track", "A cinema"],
            "answerIndex": 0,
            "explain": "Đoạn 2: 'It has a swimming pool and a gym.'"
        },
        {
            "id": "u9_r3",
            "type": "multiple_choice",
            "question": "How did Mai and her parents travel to the Old Town?",
            "options": ["They rented three bikes and cycled", "They went by bus", "They took an underground train", "They drove a car"],
            "answerIndex": 0,
            "explain": "Đoạn 2: 'Yesterday Mum, Dad and I rented three bikes and cycled to the Old Town.'"
        },
        {
            "id": "u9_r4",
            "type": "multiple_choice",
            "question": "What landmark did they visit first in the Old Town?",
            "options": ["The Royal Palace", "The night market", "A tall bridge", "A modern museum"],
            "answerIndex": 0,
            "explain": "Đoạn 2: 'We visited the Royal Palace first. What a beautiful place!'"
        },
        {
            "id": "u9_r5",
            "type": "fill_blank",
            "question": "What is 'fika' in Swedish tradition?",
            "blankWord": "a coffee break",
            "options": ["a coffee break", "a traditional dance", "a sports game", "a flower festival"],
            "explain": "Đoạn 2: 'we had fika, a coffee break, in a traditional café.'"
        }
    ]
}

u9_grammar = {
    "title": "Tính từ sở hữu & Đại từ sở hữu (Possessive Adjectives & Possessive Pronouns)",
    "ruleVi": "Tính từ sở hữu (my, your, his, her, its, our, their) luôn đứng trước danh từ. Đại từ sở hữu (mine, yours, his, hers, ours, theirs) đứng một mình thay thế cho cụm tính từ sở hữu + danh từ để tránh lặp từ.",
    "formula": "my + N = mine | your + N = yours | his + N = his | her + N = hers | our + N = ours | their + N = theirs",
    "quickTip": "Đại từ sở hữu không bao giờ có danh từ đứng sau. Ví dụ: 'This is my bike' -> 'This bike is mine'.",
    "quiz": [
        {
            "question": "Hey Phong. You're wearing my hat. It's not ______.",
            "options": ["yours", "your", "you", "mine"],
            "answerIndex": 0,
            "explain": "Đứng cuối câu thay thế cho 'your hat' nên dùng đại từ sở hữu 'yours'."
        },
        {
            "question": "This is my drawing. It's ______.",
            "options": ["mine", "my", "me", "myself"],
            "answerIndex": 0,
            "explain": "Thay thế cho 'my drawing' ở cuối câu dùng đại từ sở hữu 'mine'."
        },
        {
            "question": "This is your room. ______ is next door.",
            "options": ["Ours", "Our", "We", "Us"],
            "answerIndex": 0,
            "explain": "Làm chủ ngữ thay thế cho 'Our room', dùng đại từ sở hữu 'Ours'."
        },
        {
            "question": "Sue doesn't need to borrow my pen. She's got ______.",
            "options": ["hers", "her", "she", "herself"],
            "answerIndex": 0,
            "explain": "Thay thế cho 'her pen' dùng đại từ sở hữu 'hers'."
        },
        {
            "question": "Bangkok is an exciting city. I love ______ street food.",
            "options": ["its", "it's", "it", "theirs"],
            "answerIndex": 0,
            "explain": "Tính từ sở hữu của 'Bangkok' (đồ vật/nơi chốn) là 'its' (không có dấu phẩy)."
        },
        {
            "question": "We are watching the sunset with ______ local friends.",
            "options": ["our", "ours", "we", "us"],
            "answerIndex": 0,
            "explain": "Đứng trước danh từ 'local friends' phải dùng tính từ sở hữu 'our'."
        }
    ]
}

u9_writing = {
    "items": [
        {
            "id": "u9_w1",
            "type": "unscramble",
            "scrambledWords": ["Stockholm", "is", "famous", "for", "the", "Royal", "Palace", "and", "Swedish", "art"],
            "correctSentence": "Stockholm is famous for the Royal Palace and Swedish art",
            "meaningVi": "Stockholm nổi tiếng với Cung điện Hoàng gia và nghệ thuật Thụy Điển.",
            "hint": "Bắt đầu bằng 'Stockholm is famous...'"
        },
        {
            "id": "u9_w2",
            "type": "unscramble",
            "scrambledWords": ["We", "rented", "bikes", "and", "cycled", "around", "the", "Old", "Town"],
            "correctSentence": "We rented bikes and cycled around the Old Town",
            "meaningVi": "Chúng mình đã thuê xe đạp và dạo quanh Khu Phố Cổ.",
            "hint": "Thì quá khứ đơn: 'We rented bikes...'"
        },
        {
            "id": "u9_w3",
            "type": "fill_blank",
            "sentence": "The weather in Stockholm is sunny and the food is ______.",
            "blankWord": "delicious",
            "correctSentence": "The weather in Stockholm is sunny and the food is delicious.",
            "options": ["delicious", "bad", "terrible", "rainy"],
            "meaningVi": "Thời tiết ở Stockholm ngập nắng và đồ ăn thì rất ngon miệng."
        },
        {
            "id": "u9_w4",
            "type": "fill_blank",
            "sentence": "Big Ben is a famous ______ in London.",
            "blankWord": "landmark",
            "correctSentence": "Big Ben is a famous landmark in London.",
            "options": ["landmark", "postcard", "market", "stall"],
            "meaningVi": "Tháp Big Ben là một địa danh mang tính biểu tượng nổi tiếng ở Luân Đôn."
        }
    ],
    "correctSentence": "Stockholm is famous for the Royal Palace and Swedish art",
    "scrambledWords": ["Stockholm", "is", "famous", "for", "the", "Royal", "Palace", "and", "Swedish", "art"],
    "meaningVi": "Stockholm nổi tiếng với Cung điện Hoàng gia và nghệ thuật Thụy Điển."
}

update_unit(9, {
    "reading": u9_reading,
    "grammar": u9_grammar,
    "writing": u9_writing
})

# ================= UNIT 10 =================
u10_reading = {
    "title": "My Future Dream House",
    "passage": "My future house will be on an island. It will be surrounded by tall trees and the blue sea. There will be a swimming pool in front of the house. There will be a helicopter on the roof. I can fly to school in it.\n\nThere will be some robots in the house. They will help me to clean the floors, cook meals, wash clothes and water the flowers. They will also help me to feed the dogs and cats.\n\nThere will be a super smart TV. It will help me to send and receive emails, and contact my friends on other planets. It will also help me to buy food from the supermarket.",
    "translation": "Ngôi nhà tương lai của mình sẽ tọa lạc trên một hòn đảo. Ngôi nhà sẽ được bao quanh bởi những hàng cây cao vút và biển xanh biếc. Sẽ có một bể bơi lớn ở ngay phía trước nhà. Trên mái nhà sẽ có một chiếc trực thăng để mình bay đi học mỗi ngày.\n\nTrong nhà sẽ có một vài chú người máy robot. Chúng sẽ giúp mình lau dọn sàn nhà, nấu những bữa ăn ngon, giặt quần áo và tưới hoa. Chúng cũng sẽ giúp mình cho chó mèo ăn.\n\nTrong phòng sẽ có một chiếc TV siêu thông minh. Chiếc TV này sẽ giúp mình gửi và nhận email, liên lạc với bạn bè ở các hành tinh khác. Nó còn có thể tự động đặt mua thức ăn từ siêu thị về nhà.",
    "questions": [
        {
            "id": "u10_r1",
            "type": "multiple_choice",
            "question": "Where will the author's future dream house be located?",
            "options": ["On an island surrounded by tall trees and blue sea", "In the cold mountains", "Under the ocean", "On the Moon"],
            "answerIndex": 0,
            "explain": "Đoạn 1 nêu: 'My future house will be on an island. It will be surrounded by tall trees and the blue sea.'"
        },
        {
            "id": "u10_r2",
            "type": "multiple_choice",
            "question": "How will the author travel to school from the future house?",
            "options": ["In a helicopter on the roof", "By a school bus", "By bicycle", "By a speed boat"],
            "answerIndex": 0,
            "explain": "Đoạn 1: 'There will be a helicopter on the roof. I can fly to school in it.'"
        },
        {
            "id": "u10_r3",
            "type": "multiple_choice",
            "question": "What tasks will the robots do in the house?",
            "options": ["Clean floors, cook meals, wash clothes, water flowers and feed pets", "Only play computer games", "Fly the helicopter", "Build the swimming pool"],
            "answerIndex": 0,
            "explain": "Đoạn 2: 'clean the floors, cook meals, wash clothes and water the flowers. They will also help me to feed the dogs and cats.'"
        },
        {
            "id": "u10_r4",
            "type": "multiple_choice",
            "question": "What can the super smart TV do in the future house?",
            "options": ["Send and receive emails, contact friends on other planets and buy food", "Wash clothes and dishes", "Water the garden", "Fly to school"],
            "answerIndex": 0,
            "explain": "Đoạn 3: 'send and receive emails, and contact my friends on other planets. It will also help me to buy food from the supermarket.'"
        },
        {
            "id": "u10_r5",
            "type": "fill_blank",
            "question": "There will be a swimming pool ______ the future house.",
            "blankWord": "in front of",
            "options": ["in front of", "behind", "under", "next to"],
            "explain": "Đoạn 1: 'There will be a swimming pool in front of the house.'"
        }
    ]
}

u10_grammar = {
    "title": "Thì Tương lai đơn & Khả năng với Might (Future Simple with Will & Might)",
    "ruleVi": "Will / Won't dùng để diễn đạt dự đoán hoặc kế hoạch trong tương lai (sẽ / sẽ không). Might / Might not dùng khi nói về một khả năng có thể xảy ra nhưng chưa chắc chắn (có thể, có lẽ).",
    "formula": "Tương lai: S + will ('ll) / won't + V_inf | Khả năng: S + might / might not + V_inf",
    "quickTip": "Cả will và might đều là động từ khuyết thiếu, đi với động từ nguyên thể không chia. 'Won't' là viết tắt của 'will not'.",
    "quiz": [
        {
            "question": "Tomorrow is Sunday, so I ______ have to get up early.",
            "options": ["won't", "will", "might", "don't"],
            "answerIndex": 0,
            "explain": "Chủ nhật được nghỉ học nên chắc chắn 'sẽ không' phải dậy sớm, dùng 'won't'."
        },
        {
            "question": "When I see Tom tomorrow, I ______ invite him to our party.",
            "options": ["will", "won't", "might", "am"],
            "answerIndex": 0,
            "explain": "Ý định chắc chắn trong tương lai, dùng 'will'."
        },
        {
            "question": "I am still not sure where to go for my holiday. I ______ go to Da Lat.",
            "options": ["might", "will", "must", "won't"],
            "answerIndex": 0,
            "explain": "Có 'not sure' (chưa chắc chắn) nên dùng 'might' (có thể/có lẽ)."
        },
        {
            "question": "The sky is very dark. It ______ rain this afternoon.",
            "options": ["might", "won't", "must", "shall"],
            "answerIndex": 0,
            "explain": "Khả năng thời tiết có thể xảy ra, dùng 'might'."
        },
        {
            "question": "Ann has a lot of homework tonight, so she ______ come to the party.",
            "options": ["might not", "might", "will", "won't be"],
            "answerIndex": 0,
            "explain": "Có khả năng không đến được vì bận bài tập, dùng 'might not'."
        },
        {
            "question": "In the future, robots ______ do all the difficult housework for humans.",
            "options": ["will", "might not", "won't", "are"],
            "answerIndex": 0,
            "explain": "Dự đoán tương lai chắc chắn công nghệ phát triển, dùng 'will'."
        }
    ]
}

u10_writing = {
    "items": [
        {
            "id": "u10_w1",
            "type": "unscramble",
            "scrambledWords": ["My", "future", "house", "will", "be", "on", "a", "beautiful", "island"],
            "correctSentence": "My future house will be on a beautiful island",
            "meaningVi": "Ngôi nhà tương lai của mình sẽ tọa lạc trên một hòn đảo xinh đẹp.",
            "hint": "Cấu trúc tương lai đơn: S + will be on..."
        },
        {
            "id": "u10_w2",
            "type": "unscramble",
            "scrambledWords": ["Robots", "will", "help", "us", "cook", "meals", "and", "wash", "clothes"],
            "correctSentence": "Robots will help us cook meals and wash clothes",
            "meaningVi": "Người máy sẽ giúp chúng ta nấu nướng và giặt giũ quần áo.",
            "hint": "Cấu trúc: Robots will help us..."
        },
        {
            "id": "u10_w3",
            "type": "fill_blank",
            "sentence": "We will use ______ energy to protect our environment.",
            "blankWord": "solar",
            "correctSentence": "We will use solar energy to protect our environment.",
            "options": ["solar", "windy", "cold", "dirty"],
            "meaningVi": "Chúng ta sẽ sử dụng năng lượng mặt trời để bảo vệ môi trường."
        },
        {
            "id": "u10_w4",
            "type": "fill_blank",
            "sentence": "A smart ______ will wash all the dirty dishes automatically.",
            "blankWord": "dishwasher",
            "correctSentence": "A smart dishwasher will wash all the dirty dishes automatically.",
            "options": ["dishwasher", "clock", "television", "fridge"],
            "meaningVi": "Chiếc máy rửa bát thông minh sẽ tự động rửa sạch toàn bộ bát đĩa bẩn."
        }
    ],
    "correctSentence": "My future house will be on a beautiful island",
    "scrambledWords": ["My", "future", "house", "will", "be", "on", "a", "beautiful", "island"],
    "meaningVi": "Ngôi nhà tương lai của mình sẽ tọa lạc trên một hòn đảo xinh đẹp."
}

update_unit(10, {
    "reading": u10_reading,
    "grammar": u10_grammar,
    "writing": u10_writing
})

# ================= UNIT 11 =================
u11_reading = {
    "title": "Tips for a Greener School: Interview with 3Rs Club",
    "passage": "Reporter: Can you share with us some tips to make your school greener?\nNam: Sure. Firstly, we put recycling bins in every classroom.\nReporter: What about old books and uniforms?\nNam: We exchange them with our friends or give them to charity. We don't throw them away.\nReporter: Anything else?\nNam: We borrow books from the school library instead of buying new ones.\nReporter: Great! You can save much paper.\nNam: And there's another tip. We bring reusable water bottles to school.\nReporter: I see lots of trees in your school. Is planting trees a good tip?\nNam: Yeah. It makes our school greener.\nReporter: Thanks for sharing. Do you want to add anything?\nNam: Finally, we usually find creative ways to reuse old items before throwing them away.",
    "translation": "Phóng viên: Bạn có thể chia sẻ cho chúng mình một vài mẹo để làm cho trường học xanh hơn không?\nNam: Chắc chắn rồi. Đầu tiên, chúng mình đặt thùng phân loại rác tái chế ở tất cả các lớp học.\nPhóng viên: Thế còn sách giáo khoa và đồng phục cũ thì sao?\nNam: Chúng mình trao đổi với bạn bè hoặc quyên góp cho các tổ chức từ thiện. Tụi mình không vứt chúng đi đâu.\nPhóng viên: Còn gì nữa không bạn?\nNam: Chúng mình mượn sách từ thư viện trường thay vì mua sách mới.\nPhóng viên: Tuyệt quá! Các bạn có thể tiết kiệm được rất nhiều giấy đấy.\nNam: Và còn một mẹo nữa. Chúng mình mang theo bình đựng nước có thể tái sử dụng đến trường.\nPhóng viên: Mình thấy trường bạn có rất nhiều cây xanh. Trồng cây có phải là một mẹo hay không?\nNam: Đúng vậy ạ. Cây xanh giúp ngôi trường của chúng mình thêm xanh tươi và trong lành.\nPhóng viên: Cảm ơn bạn đã chia sẻ. Bạn có muốn nhắn nhủ thêm điều gì không?\nNam: Cuối cùng, chúng mình luôn tìm những cách sáng tạo để tái sử dụng đồ cũ trước khi vứt chúng đi.",
    "questions": [
        {
            "id": "u11_r1",
            "type": "multiple_choice",
            "question": "What is Nam's 3Rs Club sharing in the interview?",
            "options": ["Tips to make their school greener", "How to play football", "How to build a robot", "Plans for summer camp"],
            "answerIndex": 0,
            "explain": "Đoạn 1: Phóng viên hỏi 'Can you share with us some tips to make your school greener?'."
        },
        {
            "id": "u11_r2",
            "type": "multiple_choice",
            "question": "What do students put in every classroom to protect the environment?",
            "options": ["Recycling bins", "Air conditioners", "Big sofas", "New televisions"],
            "answerIndex": 0,
            "explain": "Nam trả lời: 'Firstly, we put recycling bins in every classroom.'"
        },
        {
            "id": "u11_r3",
            "type": "multiple_choice",
            "question": "What do students do with their old books and uniforms?",
            "options": ["Exchange them with friends or give to charity", "Throw them away into the river", "Burn them", "Sell them at high prices"],
            "answerIndex": 0,
            "explain": "Nam: 'We exchange them with our friends or give them to charity. We don't throw them away.'"
        },
        {
            "id": "u11_r4",
            "type": "multiple_choice",
            "question": "What do they do instead of buying new books to save paper?",
            "options": ["Borrow books from the school library", "Stop reading books", "Copy books by hand", "Buy comics"],
            "answerIndex": 0,
            "explain": "Nam: 'We borrow books from the school library instead of buying new ones.'"
        },
        {
            "id": "u11_r5",
            "type": "fill_blank",
            "question": "Students bring ______ water bottles to school to reduce plastic waste.",
            "blankWord": "reusable",
            "options": ["reusable", "single-use", "broken", "dirty"],
            "explain": "Nam: 'We bring reusable water bottles to school.'"
        }
    ]
}

u11_grammar = {
    "title": "Mạo từ A / An / The & Câu điều kiện loại 1 (Articles & First Conditional)",
    "ruleVi": "A/An dùng trước danh từ đếm được số ít khi được nhắc tới lần đầu. 'An' đứng trước danh từ bắt đầu bằng nguyên âm (u, e, o, a, i). 'The' dùng cho vật đã xác định hoặc vật duy nhất (The Moon, The Sun). Câu điều kiện loại 1 diễn tả một điều kiện có thật ở hiện tại hoặc tương lai.",
    "formula": "Mạo từ: a/an/the + N | Câu điều kiện 1: If + S + V(hiện tại đơn), S + will + V_inf",
    "quickTip": "Mệnh đề chứa 'If' dùng thì hiện tại đơn (không dùng will). Mệnh đề chính dùng 'will + V_inf'.",
    "quiz": [
        {
            "question": "If they ______ an airport here, it will be very noisy.",
            "options": ["build", "will build", "builds", "building"],
            "answerIndex": 0,
            "explain": "Mệnh đề 'If' với chủ ngữ 'they' chia thì hiện tại đơn là 'build'."
        },
        {
            "question": "People will save the environment if they ______ old items.",
            "options": ["reuse", "will reuse", "reuses", "reusing"],
            "answerIndex": 0,
            "explain": "Mệnh đề 'if' với chủ ngữ 'they' chia hiện tại đơn là 'reuse'."
        },
        {
            "question": "If we grow more trees, our school ______ greener.",
            "options": ["will be", "is", "was", "are"],
            "answerIndex": 0,
            "explain": "Mệnh đề chính của câu điều kiện loại 1 dùng 'will be'."
        },
        {
            "question": "If you walk or cycle to school, you ______ healthy.",
            "options": ["will be", "are", "were", "being"],
            "answerIndex": 0,
            "explain": "Mệnh đề chính câu điều kiện 1 dùng 'will be'."
        },
        {
            "question": "Does your town have ______ art gallery?",
            "options": ["an", "a", "the", "some"],
            "answerIndex": 0,
            "explain": "'Art gallery' bắt đầu bằng nguyên âm 'a', số ít đếm được dùng 'an'."
        },
        {
            "question": "______ Moon is very bright tonight.",
            "options": ["The", "A", "An", "Some"],
            "answerIndex": 0,
            "explain": "Mặt Trăng là thiên thể duy nhất nên dùng mạo từ 'The'."
        }
    ]
}

u11_writing = {
    "items": [
        {
            "id": "u11_w1",
            "type": "unscramble",
            "scrambledWords": ["If", "we", "plant", "more", "trees", "our", "school", "will", "be", "greener"],
            "correctSentence": "If we plant more trees our school will be greener",
            "meaningVi": "Nếu chúng ta trồng nhiều cây hơn thì trường học của chúng ta sẽ xanh hơn.",
            "hint": "Cấu trúc câu điều kiện loại 1: If we plant..."
        },
        {
            "id": "u11_w2",
            "type": "unscramble",
            "scrambledWords": ["If", "you", "reuse", "paper", "you", "will", "save", "trees"],
            "correctSentence": "If you reuse paper you will save trees",
            "meaningVi": "Nếu bạn tái sử dụng giấy thì bạn sẽ cứu được cây rừng.",
            "hint": "Bắt đầu bằng 'If you reuse paper...'"
        },
        {
            "id": "u11_w3",
            "type": "fill_blank",
            "sentence": "We should put plastic bottles into the ______ bin.",
            "blankWord": "recycling",
            "correctSentence": "We should put plastic bottles into the recycling bin.",
            "options": ["recycling", "rubbish", "dirty", "old"],
            "meaningVi": "Chúng ta nên bỏ chai nhựa vào thùng rác tái chế."
        },
        {
            "id": "u11_w4",
            "type": "fill_blank",
            "sentence": "We borrow books from the library ______ of buying new ones.",
            "blankWord": "instead",
            "correctSentence": "We borrow books from the library instead of buying new ones.",
            "options": ["instead", "because", "although", "without"],
            "meaningVi": "Chúng mình mượn sách từ thư viện thay vì mua sách mới."
        }
    ],
    "correctSentence": "If we plant more trees our school will be greener",
    "scrambledWords": ["If", "we", "plant", "more", "trees", "our", "school", "will", "be", "greener"],
    "meaningVi": "Nếu chúng ta trồng nhiều cây hơn thì trường học của chúng ta sẽ xanh hơn."
}

update_unit(11, {
    "reading": u11_reading,
    "grammar": u11_grammar,
    "writing": u11_writing
})

# ================= UNIT 12 =================
u12_reading = {
    "title": "The International Robot Show in Ha Noi",
    "passage": "Today there is an international robot show in Ha Noi. People can see many types of robots there.\n\nHome robots are useful for housework. They can do most of the housework: cook meals, clean the house, do the washing, and iron clothes.\n\nTeacher robots are the best choice for children. They can help them to study. They can teach them English, literature, maths and other subjects. They can also help children to improve their English pronunciation.\n\nPeople are also interested in other types of robots at the show. Worker robots can build houses and move heavy things; doctor robots can look after sick people and space robots can build space stations on the Moon and on planets.",
    "translation": "Hôm nay, một triển lãm người máy quốc tế đang diễn ra tại Hà Nội. Khách tham quan có thể tận mắt chiêm ngưỡng rất nhiều loại robot hiện đại.\n\nRobot gia đình rất hữu ích cho các công việc nội trợ. Chúng có thể làm hầu hết việc nhà: nấu ăn, lau dọn nhà cửa, giặt giũ quần áo và là ủi đồ.\n\nRobot giáo viên là sự lựa chọn tuyệt vời nhất cho trẻ em. Chúng có thể hỗ trợ các em học tập, dạy các môn tiếng Anh, ngữ văn, toán và các môn học khác. Chúng còn có thể giúp trẻ em cải thiện phát âm tiếng Anh chuẩn xác.\n\nMọi người cũng đặc biệt quan tâm đến các loại robot khác tại triển lãm: Robot công nhân có thể xây nhà và vận chuyển những đồ vật nặng; robot bác sĩ chăm sóc người bệnh, còn robot vũ trụ có thể xây dựng các trạm không gian trên Mặt Trăng và các hành tinh xa xôi.",
    "questions": [
        {
            "id": "u12_r1",
            "type": "multiple_choice",
            "question": "What international event is taking place in Ha Noi today?",
            "options": ["An international robot show", "A sports marathon", "A science book fair", "A fashion exhibition"],
            "answerIndex": 0,
            "explain": "Đoạn 1 nêu rõ: 'Today there is an international robot show in Ha Noi.'"
        },
        {
            "id": "u12_r2",
            "type": "multiple_choice",
            "question": "Which type of robots is the best choice to help children in their study?",
            "options": ["Teacher robots", "Home robots", "Worker robots", "Space robots"],
            "answerIndex": 0,
            "explain": "Đoạn 3: 'Teacher robots are the best choice for children. They can help them to study.'"
        },
        {
            "id": "u12_r3",
            "type": "multiple_choice",
            "question": "What can home robots do to help families with housework?",
            "options": ["Cook meals, clean the house, do the washing and iron clothes", "Build houses and roads", "Fly into deep space", "Drive cars"],
            "answerIndex": 0,
            "explain": "Đoạn 2: 'cook meals, clean the house, do the washing, and iron clothes.'"
        },
        {
            "id": "u12_r4",
            "type": "multiple_choice",
            "question": "What can doctor robots do at hospitals?",
            "options": ["Look after sick people", "Do the dishes", "Play sports with kids", "Fix broken clocks"],
            "answerIndex": 0,
            "explain": "Đoạn 4: 'doctor robots can look after sick people.'"
        },
        {
            "id": "u12_r5",
            "type": "fill_blank",
            "question": "Worker robots can build houses and move ______ things.",
            "blankWord": "heavy",
            "options": ["heavy", "tiny", "broken", "light"],
            "explain": "Đoạn 4: 'Worker robots can build houses and move heavy things.'"
        }
    ]
}

u12_grammar = {
    "title": "So sánh nhất của tính từ ngắn (Superlative Adjectives)",
    "ruleVi": "So sánh nhất dùng để so sánh một người hoặc một vật với toàn bộ tập hợp nhóm (từ 3 đối tượng trở lên). Với tính từ ngắn, ta thêm 'the' phía trước và thêm đuôi '-est' vào sau tính từ.",
    "formula": "S + be + the + adj-est (+ N trong nhóm)",
    "quickTip": "Tính từ kết thúc bằng -e chỉ cần thêm -st (large -> the largest). Tính từ 1 âm tiết có 1 nguyên âm kẹp giữa 2 phụ âm gấp đôi phụ âm cuối (hot -> the hottest, big -> the biggest).",
    "quiz": [
        {
            "question": "What is the ______ mountain in the world? - Mount Everest.",
            "options": ["highest", "higher", "most high", "high"],
            "answerIndex": 0,
            "explain": "Đỉnh núi cao 'nhất' thế giới dùng so sánh nhất 'the highest'."
        },
        {
            "question": "Ba Be Lake is the ______ natural freshwater lake in Viet Nam.",
            "options": ["largest", "larger", "most large", "large"],
            "answerIndex": 0,
            "explain": "Hồ nước ngọt tự nhiên lớn 'nhất' dùng 'the largest'."
        },
        {
            "question": "Tra Co is the ______ beach in Viet Nam with over 17 km.",
            "options": ["longest", "longer", "most long", "long"],
            "answerIndex": 0,
            "explain": "Bãi biển dài 'nhất' dùng 'the longest'."
        },
        {
            "question": "The Sahara is the ______ desert in the world.",
            "options": ["hottest", "hotter", "most hot", "hot"],
            "answerIndex": 0,
            "explain": "Gấp đôi chữ t rồi thêm -est: 'the hottest'."
        },
        {
            "question": "This tiny machine is the ______ robot in our laboratory.",
            "options": ["smartest", "smarter", "most smart", "smart"],
            "answerIndex": 0,
            "explain": "Robot thông minh 'nhất' dùng 'the smartest'."
        },
        {
            "question": "The Amazon is the ______ river in the world.",
            "options": ["widest", "wider", "most wide", "wide"],
            "answerIndex": 0,
            "explain": "Con sông rộng 'nhất' dùng 'the widest'."
        }
    ]
}

u12_writing = {
    "items": [
        {
            "id": "u12_w1",
            "type": "unscramble",
            "scrambledWords": ["Home", "robots", "can", "do", "the", "washing", "and", "iron", "the", "clothes"],
            "correctSentence": "Home robots can do the washing and iron the clothes",
            "meaningVi": "Robot gia đình có thể giặt giũ và là ủi quần áo.",
            "hint": "Bắt đầu bằng 'Home robots can do...'"
        },
        {
            "id": "u12_w2",
            "type": "unscramble",
            "scrambledWords": ["Teacher", "robots", "can", "help", "children", "to", "improve", "English", "pronunciation"],
            "correctSentence": "Teacher robots can help children to improve English pronunciation",
            "meaningVi": "Robot giáo viên có thể giúp các em cải thiện phát âm tiếng Anh.",
            "hint": "Cấu trúc: Teacher robots can help..."
        },
        {
            "id": "u12_w3",
            "type": "fill_blank",
            "sentence": "Space robots can build space stations on the ______.",
            "blankWord": "Moon",
            "correctSentence": "Space robots can build space stations on the Moon.",
            "options": ["Moon", "river", "beach", "forest"],
            "meaningVi": "Robot vũ trụ có thể xây dựng các trạm không gian trên Mặt Trăng."
        },
        {
            "id": "u12_w4",
            "type": "fill_blank",
            "sentence": "Doctor robots can look ______ sick people in hospitals.",
            "blankWord": "after",
            "correctSentence": "Doctor robots can look after sick people in hospitals.",
            "options": ["after", "for", "at", "in"],
            "meaningVi": "Robot bác sĩ có thể chăm sóc bệnh nhân trong các bệnh viện."
        }
    ],
    "correctSentence": "Home robots can do the washing and iron the clothes",
    "scrambledWords": ["Home", "robots", "can", "do", "the", "washing", "and", "iron", "the", "clothes"],
    "meaningVi": "Robot gia đình có thể giặt giũ và là ủi quần áo."
}

update_unit(12, {
    "reading": u12_reading,
    "grammar": u12_grammar,
    "writing": u12_writing
})

print("🎉 ALL 12 UNITS READING, GRAMMAR, AND WRITING ALIGNED 100% WITH SGK!")
