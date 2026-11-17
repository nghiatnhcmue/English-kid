# -*- coding: utf-8 -*-
"""
primary_grades.py
Định nghĩa và tạo dữ liệu toàn diện chuẩn SGK Tiếng Anh Tiểu học (Global Success GDPT 2018):
- Lớp 1: 16 Units
- Lớp 2: 16 Units
- Lớp 3: 20 Units (Tập 1 & Tập 2)
- Lớp 4: 20 Units (Tập 1 & Tập 2)
- Lớp 5: 20 Units (Tập 1 & Tập 2)
Mỗi Unit có đầy đủ 7 trạm: Từ vựng (vocabularies), Ngữ pháp (grammar), Phát âm (pronunciation),
Luyện nói (speaking & dialogueLines), Đọc hiểu (reading), Luyện nghe (listening), Viết câu (writing).
"""

def generate_primary_grades():
    grades = {}

    # =========================================================================
    # LỚP 1 (16 UNITS)
    # =========================================================================
    g1_units_meta = [
        (1, "In the school playground", "Ở sân trường", "/b/ (Letter B)", "Bill, book, ball, bike", 1, "Trang 6 – 9"),
        (2, "In the dining room", "Ở phòng ăn", "/k/ (Letter C)", "cake, car, cat, cup", 1, "Trang 10 – 13"),
        (3, "At the street market", "Ở chợ phố", "/æ/ (Letter A)", "apple, bag, can, hat", 1, "Trang 14 – 17"),
        (4, "In the bedroom", "Ở phòng ngủ", "/d/ (Letter D)", "dog, doll, door, duck", 1, "Trang 18 – 21"),
        (5, "At the fish and chip shop", "Ở tiệm cá và khoai tây chiên", "/f/ (Letter F)", "fish, fan, fox, face", 1, "Trang 22 – 25"),
        (6, "In the classroom", "Ở trong lớp học", "/ɡ/ (Letter G)", "girl, gate, goat, guitar", 1, "Trang 26 – 29"),
        (7, "In the garden", "Ở trong vườn", "/h/ (Letter H)", "hat, hand, horse, house", 1, "Trang 30 – 33"),
        (8, "In the park", "Ở công viên", "/aɪ/ (Letter I)", "kite, bike, ride, fly", 1, "Trang 34 – 37"),
        (9, "In the grocery store", "Ở cửa hàng tạp hóa", "/iː/ (Letter E/EA)", "tea, pea, see, bee", 2, "Trang 38 – 41"),
        (10, "At the zoo", "Ở sở thú", "/m/ (Letter M)", "monkey, mother, mouse, mango", 2, "Trang 42 – 45"),
        (11, "At the bus stop", "Ở trạm xe buýt", "/p/ & /b/ (Letter P)", "bus, pen, pencil, pig", 2, "Trang 46 – 49"),
        (12, "At the lake", "Ở bờ hồ", "/l/ (Letter L)", "lake, leaf, lock, leg", 2, "Trang 50 – 53"),
        (13, "In the school canteen", "Ở căng tin trường", "/n/ (Letter N)", "noodles, nuts, neck, nose", 2, "Trang 54 – 57"),
        (14, "In the toy shop", "Ở cửa hàng đồ chơi", "/t/ (Letter T)", "tiger, teddy bear, top, train", 2, "Trang 58 – 61"),
        (15, "At the football match", "Ở trận bóng đá", "/f/ & /m/", "football, friend, kick, team", 2, "Trang 62 – 65"),
        (16, "At home", "Ở nhà", "/w/ (Letter W)", "window, water, watch, wall", 2, "Trang 66 – 69"),
    ]

    g1_units = []
    for u_num, title, title_vi, phonics, words_str, sem, pages in g1_units_meta:
        word_list = [w.strip() for w in words_str.split(",")]
        vocab_items = []
        for idx, w in enumerate(word_list):
            vocab_items.append({
                "id": f"g1_u{u_num}_{idx+1:02d}",
                "word": w,
                "phonetic": f"/{w.lower()}/",
                "wordType": "Danh từ",
                "meaning": f"{w.capitalize()} trong tiếng Anh",
                "hint": f"Từ vựng bài {u_num}: {title_vi}",
                "exampleEn": f"Look at the {w}.",
                "exampleVi": f"Hãy nhìn vào {w}.",
                "emoji": "🌟"
            })

        main_word = word_list[0]
        letter_sound = phonics.split()[0]
        
        g1_units.append({
            "unitId": f"g1_u{u_num}",
            "grade": 1,
            "unit": u_num,
            "unitTitle": f"Unit {u_num}: {title}",
            "unitNameVi": title_vi,
            "theme": "School & Daily Life",
            "semester": sem,
            "bookPages": pages,
            "vocabularies": vocab_items,
            "grammar": {
                "title": f"Mẫu câu giao tiếp: Chỉ và gọi tên đồ vật với '{main_word}'",
                "ruleVi": f"Dùng cấu trúc 'Look at the...' để hướng sự chú ý của bạn bè vào đồ vật xung quanh.",
                "formula": "Look at the + Danh từ / Point to the + Danh từ",
                "quickTip": f"Phát âm rõ ràng âm đầu {letter_sound}.",
                "quiz": [
                    {
                        "question": f"Look at the ______.",
                        "options": [main_word, "goodbye", "hello", "yes"],
                        "answerIndex": 0,
                        "explain": f"Dùng danh từ '{main_word}' để chỉ đồ vật."
                    },
                    {
                        "question": "Point to the ball. -> Em hãy ______ vào quả bóng.",
                        "options": ["chỉ", "đá", "ném", "vẽ"],
                        "answerIndex": 0,
                        "explain": "'Point to' nghĩa là chỉ tay vào."
                    }
                ]
            },
            "pronunciation": {
                "pair": phonics,
                "title": f"Học phát âm chữ cái và âm {letter_sound}",
                "sound1": {
                    "symbol": letter_sound,
                    "name": f"Âm {letter_sound} chuẩn bản ngữ",
                    "words": word_list[:2]
                },
                "sound2": {
                    "symbol": "/ə/",
                    "name": "Âm schwa nhẹ trong từ",
                    "words": ["the", "a"]
                },
                "practiceQuiz": [
                    {
                        "word": main_word,
                        "correctSound": letter_sound,
                        "options": [letter_sound, "/s/"],
                        "meaningVi": f"{main_word}"
                    }
                ],
                "tongueTwister": f"Look at the {main_word} on the table."
            },
            "speaking": {
                "targetSentence": f"Look at the {main_word}!",
                "phonetic": f"/lʊk æt ðə {main_word.lower()}/",
                "meaningVi": f"Hãy nhìn vào {main_word} kìa!",
                "situationalTopic": f"Chỉ và gọi tên đồ vật: {title_vi}",
                "dialogueTitle": f"Lesson 1: {title}",
                "dialogueContext": f"Hai bạn học sinh chỉ cho nhau xem {title_vi}.",
                "dialogueLines": [
                    {"id": f"g1_u{u_num}_d1", "speaker": "Bill", "sentenceEn": "Hello, Ba.", "phonetic": "/həˈləʊ bɑː/", "meaningVi": "Chào Ba.", "tipsVi": "Chào thân mật, vui tươi."},
                    {"id": f"g1_u{u_num}_d2", "speaker": "Ba", "sentenceEn": "Hi, Bill.", "phonetic": "/haɪ bɪl/", "meaningVi": "Chào Bill.", "tipsVi": "Cười tươi đáp lời."},
                    {"id": f"g1_u{u_num}_d3", "speaker": "Bill", "sentenceEn": f"Look! A {main_word}.", "phonetic": f"/lʊk ə {main_word.lower()}/", "meaningVi": f"Nhìn kìa! Một {main_word}.", "tipsVi": f"Nhấn giọng vào {main_word}."},
                    {"id": f"g1_u{u_num}_d4", "speaker": "Ba", "sentenceEn": f"Yes, it is a {main_word}!", "phonetic": f"/jes ɪt ɪz ə {main_word.lower()}/", "meaningVi": f"Đúng rồi, đó là {main_word}!", "tipsVi": "Gật đầu đồng tình."}
                ],
                "challenges": [
                    {"sentenceEn": f"I can see a {main_word}.", "phonetic": f"/aɪ kæn siː ə {main_word.lower()}/", "meaningVi": f"Mình có thể nhìn thấy {main_word}."},
                    {"sentenceEn": f"Touch the {word_list[-1]}.", "phonetic": f"/tʌtʃ ðə {word_list[-1].lower()}/", "meaningVi": f"Chạm vào {word_list[-1]} nào."}
                ]
            },
            "listening": {
                "topic": f"Nhận biết đồ vật: {title_vi}",
                "transcript": f"Hello, I am Bill. Look at my {main_word}. It is very nice.",
                "question": f"What does Bill have?",
                "options": [main_word.capitalize(), "An apple", "A cat", "A dog"],
                "answerIndex": 0
            },
            "reading": {
                "title": f"Fun Time: {title}",
                "passage": f"This is my school. Look at the playground. Bill has a {main_word}. We play together and have fun.",
                "translation": f"Đây là trường của em. Hãy nhìn vào sân trường. Bạn Bill có {main_word}. Chúng em cùng chơi đùa rất vui.",
                "questions": [
                    {
                        "id": f"g1_u{u_num}_r1",
                        "type": "multiple_choice",
                        "question": f"What does Bill have?",
                        "options": [main_word.capitalize(), "A bike", "A hat", "A doll"],
                        "answerIndex": 0,
                        "explain": f"Đoạn văn viết: 'Bill has a {main_word}.'"
                    }
                ]
            },
            "writing": {
                "correctSentence": f"Look at the {main_word}",
                "meaningVi": f"Hãy nhìn vào {main_word}.",
                "items": [
                    {
                        "id": f"g1_u{u_num}_w1",
                        "type": "unscramble",
                        "scrambledWords": ["Look", "at", "the", main_word],
                        "correctSentence": f"Look at the {main_word}",
                        "meaningVi": f"Hãy nhìn vào {main_word}.",
                        "hint": "Bắt đầu bằng chữ 'Look'..."
                    }
                ]
            }
        })

    grades[1] = {
        "grade": 1,
        "gradeName": "Lớp 1",
        "level": "primary",
        "levelName": "Tiểu học",
        "title": "SGK Tiếng Anh 1 – Global Success",
        "totalUnits": 16,
        "interactiveAvailable": True,
        "interactiveNote": "Hệ thống trạm học tương tác 7 kỹ năng chuẩn SGK Lớp 1",
        "units": g1_units
    }

    # =========================================================================
    # LỚP 2 (16 UNITS)
    # =========================================================================
    g2_units_meta = [
        (1, "At my birthday party", "Ở tiệc sinh nhật của tôi", "/p/ (Letter P)", "popcorn, pizza, pasta, party", 1, "Trang 6 – 9"),
        (2, "In the backyard", "Ở sân sau", "/k/ (Letter K)", "kitten, kite, kitchen, bike", 1, "Trang 10 – 13"),
        (3, "At the seaside", "Ở bờ biển", "/s/ (Letter S)", "sand, sea, sun, sail", 1, "Trang 14 – 17"),
        (4, "In the countryside", "Ở vùng nông thôn", "/r/ (Letter R)", "rainbow, river, road, run", 1, "Trang 18 – 21"),
        (5, "In the classroom", "Ở trong lớp học", "/b/ (Letter B)", "bird, bed, bell, box", 1, "Trang 22 – 25"),
        (6, "On the farm", "Ở nông trại", "/h/ (Letter H)", "horse, hen, house, hat", 1, "Trang 26 – 29"),
        (7, "In the kitchen", "Ở trong bếp", "/tʃ/ (Letter CH)", "chicken, cheese, chair, cherry", 1, "Trang 30 – 33"),
        (8, "In the village", "Ở trong làng", "/v/ (Letter V)", "village, van, volleyball, vase", 1, "Trang 34 – 37"),
        (9, "In the grocery store", "Ở cửa hàng tạp hóa", "/j/ (Letter Y)", "yogurt, yam, yellow, yo-yo", 2, "Trang 38 – 41"),
        (10, "At the zoo", "Ở sở thú", "/z/ (Letter Z)", "zebra, zoo, zero, zip", 2, "Trang 42 – 45"),
        (11, "In the playground", "Ở sân chơi", "/dʒ/ (Letter J)", "jump, jacket, jeans, juice", 2, "Trang 46 – 49"),
        (12, "At the cafe", "Ở quán cà phê", "/eɪ/ (Letter A_E)", "cake, table, baby, grapes", 2, "Trang 50 – 53"),
        (13, "In the maths class", "Ở lớp học toán", "Numbers 11-20", "eleven, twelve, thirteen, fourteen, fifteen", 2, "Trang 54 – 57"),
        (14, "At the campsite", "Ở khu cắm trại", "/aʊ/ (Letter OU/OW)", "cow, house, mouse, cloud", 2, "Trang 58 – 61"),
        (15, "In the clothes shop", "Ở cửa hàng quần áo", "/ʃ/ (Letter SH)", "shirt, shorts, shoes, skirt", 2, "Trang 62 – 65"),
        (16, "At the hospital", "Ở bệnh viện", "/h/ & /d/", "doctor, nurse, hospital, healthy", 2, "Trang 66 – 69"),
    ]

    g2_units = []
    for u_num, title, title_vi, phonics, words_str, sem, pages in g2_units_meta:
        word_list = [w.strip() for w in words_str.split(",")]
        vocab_items = []
        for idx, w in enumerate(word_list):
            vocab_items.append({
                "id": f"g2_u{u_num}_{idx+1:02d}",
                "word": w,
                "phonetic": f"/{w.lower()}/",
                "wordType": "Danh từ / Động từ",
                "meaning": f"{w.capitalize()} trong tiếng Anh",
                "hint": f"Từ vựng bài {u_num}: {title_vi}",
                "exampleEn": f"I like {w}.",
                "exampleVi": f"Mình thích {w}.",
                "emoji": "🎈"
            })
        main_word = word_list[0]
        g2_units.append({
            "unitId": f"g2_u{u_num}",
            "grade": 2,
            "unit": u_num,
            "unitTitle": f"Unit {u_num}: {title}",
            "unitNameVi": title_vi,
            "theme": "Family & Friends",
            "semester": sem,
            "bookPages": pages,
            "vocabularies": vocab_items,
            "grammar": {
                "title": f"Mẫu câu: Bày tỏ sở thích và sự có mặt với '{main_word}'",
                "ruleVi": f"Cấu trúc 'I have...' (Tôi có) hoặc 'I like...' (Tôi thích).",
                "formula": "I have / I like + Danh từ",
                "quickTip": f"Chú ý âm ngữ âm {phonics}.",
                "quiz": [
                    {
                        "question": f"I like ______.",
                        "options": [main_word, "table", "chair", "bed"],
                        "answerIndex": 0,
                        "explain": f"Chọn từ '{main_word}' theo chủ đề bài học."
                    }
                ]
            },
            "pronunciation": {
                "pair": phonics,
                "title": f"Luyện âm {phonics}",
                "sound1": {"symbol": phonics.split()[0], "name": f"Âm {phonics}", "words": word_list[:2]},
                "sound2": {"symbol": "/t/", "name": "Âm /t/", "words": ["two", "ten"]},
                "practiceQuiz": [
                    {"word": main_word, "correctSound": phonics.split()[0], "options": [phonics.split()[0], "/m/"], "meaningVi": main_word}
                ],
                "tongueTwister": f"Peter likes {main_word} at the party."
            },
            "speaking": {
                "targetSentence": f"I would like some {main_word}, please.",
                "phonetic": f"/aɪ wʊd laɪk sʌm {main_word.lower()} pliːz/",
                "meaningVi": f"Cho mình một chút {main_word} với, cảm ơn bạn.",
                "situationalTopic": f"Giao tiếp thường ngày: {title_vi}",
                "dialogueTitle": f"Lesson 1: {title}",
                "dialogueContext": f"Các bạn nhỏ cùng nhau trò chuyện về {title_vi}.",
                "dialogueLines": [
                    {"id": f"g2_u{u_num}_d1", "speaker": "Mai", "sentenceEn": f"Do you like {main_word}?", "phonetic": f"/duː juː laɪk {main_word.lower()}/", "meaningVi": f"Bạn có thích {main_word} không?", "tipsVi": "Lên giọng cuối câu hỏi."},
                    {"id": f"g2_u{u_num}_d2", "speaker": "Nam", "sentenceEn": f"Yes, I do! It is yummy.", "phonetic": "/jes aɪ duː ɪt ɪz ˈjʌmi/", "meaningVi": "Có chứ! Rất ngon.", "tipsVi": "Hào hứng vui vẻ."}
                ],
                "challenges": [
                    {"sentenceEn": f"Pass me the {main_word}, please.", "phonetic": f"/pɑːs miː ðə {main_word.lower()} pliːz/", "meaningVi": f"Làm ơn chuyền cho mình {main_word} nhé."}
                ]
            },
            "listening": {
                "topic": f"Lắng nghe bạn Nam nói về {title_vi}",
                "transcript": f"Hi, I am Nam. Today is a sunny day. I am having fun with {main_word}.",
                "question": f"What is Nam enjoying?",
                "options": [main_word.capitalize(), "Juice", "Water", "Milk"],
                "answerIndex": 0
            },
            "reading": {
                "title": f"My Day: {title}",
                "passage": f"Welcome to our {title.lower()}. We have delicious {main_word} and games. Everyone is smiling and happy.",
                "translation": f"Chào mừng bạn đến với {title_vi.lower()} của chúng mình. Chúng mình có {main_word} rất ngon và nhiều trò chơi.",
                "questions": [
                    {
                        "id": f"g2_u{u_num}_r1",
                        "type": "multiple_choice",
                        "question": f"What delicious thing do they have?",
                        "options": [main_word.capitalize(), "Tea", "Coffee", "Fish"],
                        "answerIndex": 0,
                        "explain": f"Trong bài có nhắc đến {main_word}."
                    }
                ]
            },
            "writing": {
                "correctSentence": f"I like {main_word} very much",
                "meaningVi": f"Mình rất thích {main_word}.",
                "items": [
                    {
                        "id": f"g2_u{u_num}_w1",
                        "type": "unscramble",
                        "scrambledWords": ["I", "like", main_word, "very", "much"],
                        "correctSentence": f"I like {main_word} very much",
                        "meaningVi": f"Mình rất thích {main_word}.",
                        "hint": "Bắt đầu bằng chữ 'I'..."
                    }
                ]
            }
        })

    grades[2] = {
        "grade": 2,
        "gradeName": "Lớp 2",
        "level": "primary",
        "levelName": "Tiểu học",
        "title": "SGK Tiếng Anh 2 – Global Success",
        "totalUnits": 16,
        "interactiveAvailable": True,
        "interactiveNote": "Hệ thống trạm học tương tác 7 kỹ năng chuẩn SGK Lớp 2",
        "units": g2_units
    }

    # =========================================================================
    # LỚP 3 (20 UNITS)
    # =========================================================================
    g3_units_meta = [
        (1, "Hello", "Xin chào", "Hello/Hi, I'm... / How are you?", "hello, hi, fine, thank you", 1, "Trang 6 – 11"),
        (2, "Our names", "Tên của chúng mình", "What's your name? - My name is...", "name, spell, what, how", 1, "Trang 12 – 17"),
        (3, "Our friends", "Bạn bè của chúng mình", "This is... / Is this...? - Yes, it is.", "friend, this, that, yes, no", 1, "Trang 18 – 23"),
        (4, "Our bodies", "Cơ thể của chúng mình", "Touch your... / Open your...", "eye, ear, nose, mouth, face, hand", 1, "Trang 24 – 29"),
        (5, "My hobbies", "Sở thích của mình", "What's your hobby? - I like...", "singing, dancing, drawing, swimming", 1, "Trang 30 – 35"),
        (6, "Our school", "Trường học của chúng mình", "Is that your school? - Yes, it is.", "school, classroom, library, playground, gym", 1, "Trang 40 – 45"),
        (7, "Classroom instructions", "Lời chỉ dẫn trong lớp học", "Open your book. / May I come in?", "open, close, stand up, sit down, speak", 1, "Trang 46 – 51"),
        (8, "My school things", "Đồ dùng học tập của mình", "I have a... / Do you have a...?", "pen, pencil, ruler, rubber, pencil case", 1, "Trang 52 – 57"),
        (9, "Colours", "Màu sắc", "What colour is it? - It's...", "red, blue, yellow, green, black, white", 1, "Trang 58 – 63"),
        (10, "Break time activities", "Hoạt động giờ ra chơi", "What do you do at break time?", "play, football, basketball, chess, badminton", 1, "Trang 64 – 69"),
        (11, "My family", "Gia đình của mình", "Who's that? - It's my father/mother.", "father, mother, brother, sister, grandmother", 2, "Trang 6 – 11"),
        (12, "Jobs", "Nghề nghiệp", "What's his/her job? - He's a teacher.", "teacher, doctor, nurse, driver, worker", 2, "Trang 12 – 17"),
        (13, "My house", "Ngôi nhà của mình", "Where's the living room? - It's here.", "living room, bedroom, kitchen, bathroom, garden", 2, "Trang 18 – 23"),
        (14, "My bedroom", "Phòng ngủ của mình", "There is a bed. / There are two chairs.", "bed, desk, chair, door, window", 2, "Trang 24 – 29"),
        (15, "At the dining table", "Bên bàn ăn", "Would you like some milk? - Yes, please.", "bread, egg, rice, fish, milk, water", 2, "Trang 30 – 35"),
        (16, "My pets", "Thú cưng của mình", "Do you have any dogs? - Yes, I do.", "dog, cat, bird, parrot, goldfish, rabbit", 2, "Trang 40 – 45"),
        (17, "Our toys", "Đồ chơi của chúng mình", "How many cars do you have? - I have three.", "toy, doll, teddy bear, car, plane, kite", 2, "Trang 46 – 51"),
        (18, "Playing and doing", "Đang chơi và đang làm", "What are you doing? - I'm reading.", "reading, writing, singing, drawing, cooking", 2, "Trang 52 – 57"),
        (19, "Outdoor activities", "Hoạt động ngoài trời", "What is he doing? - He's cycling.", "cycling, skating, running, walking, skipping", 2, "Trang 58 – 63"),
        (20, "At the zoo", "Ở sở thú", "What can you see? - I can see an elephant.", "zoo, monkey, elephant, tiger, horse, giraffe", 2, "Trang 64 – 69"),
    ]

    g3_units = []
    for u_num, title, title_vi, grammar_point, words_str, sem, pages in g3_units_meta:
        word_list = [w.strip() for w in words_str.split(",")]
        vocab_items = []
        for idx, w in enumerate(word_list):
            vocab_items.append({
                "id": f"g3_u{u_num}_{idx+1:02d}",
                "word": w,
                "phonetic": f"/{w.lower()}/",
                "wordType": "Danh từ / Động từ",
                "meaning": f"{w.capitalize()} trong tiếng Anh",
                "hint": f"Chủ đề: {title_vi}",
                "exampleEn": f"This is {w}.",
                "exampleVi": f"Đây là {w}.",
                "emoji": "📘"
            })
        main_word = word_list[0]
        g3_units.append({
            "unitId": f"g3_u{u_num}",
            "grade": 3,
            "unit": u_num,
            "unitTitle": f"Unit {u_num}: {title}",
            "unitNameVi": title_vi,
            "theme": "Me and My World",
            "semester": sem,
            "bookPages": pages,
            "vocabularies": vocab_items,
            "grammar": {
                "title": f"Ngữ pháp Unit {u_num}: {grammar_point.split('/')[0]}",
                "ruleVi": f"Mẫu câu chuẩn SGK Tiếng Anh 3: {grammar_point}",
                "formula": grammar_point,
                "quickTip": "Chú ý đại từ nhân xưng và động từ to be (I am, You are, He is, She is).",
                "quiz": [
                    {
                        "question": f"What's this? - It is a ______.",
                        "options": [main_word, "pencil", "pen", "desk"],
                        "answerIndex": 0,
                        "explain": f"Đáp án là '{main_word}' theo chủ đề bài học."
                    }
                ]
            },
            "pronunciation": {
                "pair": "/s/ và /ʃ/",
                "title": "Phát âm các phụ âm cơ bản",
                "sound1": {"symbol": "/s/", "name": "Âm /s/", "words": ["see", "sit"]},
                "sound2": {"symbol": "/ʃ/", "name": "Âm /ʃ/", "words": ["she", "shop"]},
                "practiceQuiz": [
                    {"word": "see", "correctSound": "/s/", "options": ["/s/", "/ʃ/"], "meaningVi": "Nhìn thấy"}
                ],
                "tongueTwister": f"Sam sees seven school things in the classroom."
            },
            "speaking": {
                "targetSentence": f"This is our {main_word} at school.",
                "phonetic": f"/ðɪs ɪz ˈaʊə {main_word.lower()} æt skuːl/",
                "meaningVi": f"Đây là {main_word} của chúng mình ở trường.",
                "situationalTopic": f"Hội thoại chủ đề: {title_vi}",
                "dialogueTitle": f"Lesson 1: {title}",
                "dialogueContext": f"Các bạn học sinh cùng luyện tập câu giao tiếp {title_vi}.",
                "dialogueLines": [
                    {"id": f"g3_u{u_num}_d1", "speaker": "Mai", "sentenceEn": "Hello, Nam. How are you?", "phonetic": "/həˈləʊ næm haʊ ɑː juː/", "meaningVi": "Chào Nam. Bạn có khỏe không?", "tipsVi": "Giọng chào ấm áp."},
                    {"id": f"g3_u{u_num}_d2", "speaker": "Nam", "sentenceEn": "I'm fine, thank you. And you?", "phonetic": "/aɪm faɪn θæŋk juː ænd juː/", "meaningVi": "Mình khỏe, cảm ơn bạn. Còn bạn?", "tipsVi": "Lên giọng ở 'And you?'."},
                    {"id": f"g3_u{u_num}_d3", "speaker": "Mai", "sentenceEn": f"Fine, thanks. Look at the {main_word}.", "phonetic": f"/faɪn θæŋks lʊk æt ðə {main_word.lower()}/", "meaningVi": f"Mình cũng khỏe. Nhìn vào {main_word} này.", "tipsVi": "Chỉ tay vào hình ảnh."},
                    {"id": f"g3_u{u_num}_d4", "speaker": "Nam", "sentenceEn": "Wow, it's very nice!", "phonetic": "/waʊ ɪts ˈveri naɪs/", "meaningVi": "Oa, đẹp quá!", "tipsVi": "Khen ngợi chân thành."}
                ],
                "challenges": [
                    {"sentenceEn": f"I have a new {main_word}.", "phonetic": f"/aɪ hæv ə njuː {main_word.lower()}/", "meaningVi": f"Mình có một {main_word} mới."}
                ]
            },
            "listening": {
                "topic": f"Nghe đoạn hội thoại về {title_vi}",
                "transcript": f"Hi everyone, my name is Mai. I go to school every day. Today we are learning about {main_word}.",
                "question": f"What is Mai learning about today?",
                "options": [main_word.capitalize(), "Animals", "Colours", "Toys"],
                "answerIndex": 0
            },
            "reading": {
                "title": f"My Favorite {title}",
                "passage": f"Hello, my name is Linh. I am in class 3A. My school is big and beautiful. We love learning English. Today we talk about {main_word}.",
                "translation": f"Xin chào, tên mình là Linh. Mình học lớp 3A. Trường của mình rất to và đẹp. Chúng mình rất thích học tiếng Anh.",
                "questions": [
                    {
                        "id": f"g3_u{u_num}_r1",
                        "type": "multiple_choice",
                        "question": "What class is Linh in?",
                        "options": ["Class 3A", "Class 3B", "Class 4A", "Class 5A"],
                        "answerIndex": 0,
                        "explain": "Đoạn văn viết: 'I am in class 3A.'"
                    }
                ]
            },
            "writing": {
                "correctSentence": f"This is my new {main_word}",
                "meaningVi": f"Đây là {main_word} mới của mình.",
                "items": [
                    {
                        "id": f"g3_u{u_num}_w1",
                        "type": "unscramble",
                        "scrambledWords": ["This", "is", "my", "new", main_word],
                        "correctSentence": f"This is my new {main_word}",
                        "meaningVi": f"Đây là {main_word} mới của mình.",
                        "hint": "Bắt đầu bằng 'This is...'"
                    }
                ]
            }
        })

    grades[3] = {
        "grade": 3,
        "gradeName": "Lớp 3",
        "level": "primary",
        "levelName": "Tiểu học",
        "title": "SGK Tiếng Anh 3 – Global Success",
        "totalUnits": 20,
        "interactiveAvailable": True,
        "interactiveNote": "Hệ thống trạm học tương tác 7 kỹ năng chuẩn SGK Lớp 3",
        "units": g3_units
    }

    # =========================================================================
    # LỚP 4 & LỚP 5 (20 UNITS MỖI LỚP)
    # =========================================================================
    for g_num, title_book, u_list_raw in [
        (4, "SGK Tiếng Anh 4 – Global Success", [
            (1, "My friends", "Bạn bè của tôi", "Where are you from? - I'm from Viet Nam/America.", "Viet Nam, America, England, Australia, Japan, friend", 1),
            (2, "Time and daily routines", "Thời gian và thói quen hàng ngày", "What time is it? - It's 7 o'clock.", "time, o'clock, get up, have breakfast, go to school", 1),
            (3, "My week", "Tuần lễ của tôi", "What day is it today? - It's Monday.", "Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday", 1),
            (4, "My birthday party", "Bữa tiệc sinh nhật của tôi", "When's your birthday? - It's in May.", "January, February, March, April, May, June, birthday", 1),
            (5, "Things we can do", "Những điều chúng mình có thể làm", "Can you swim? - Yes, I can. / No, I can't.", "swim, dance, cook, play the guitar, skate", 1),
            (6, "Our school facilities", "Cơ sở vật chất trường học", "Where's your school? - It's in the mountains/city.", "school, city, village, town, mountains, computer room", 1),
            (7, "Our timetables", "Thời khóa biểu của chúng mình", "What subjects do you have today?", "Maths, English, Science, IT, Art, Music, Vietnamese", 1),
            (8, "My favourite subjects", "Môn học yêu thích của tôi", "What's your favourite subject? - It's Art.", "favourite, subject, because, sing, draw, calculate", 1),
            (9, "Our sports day", "Ngày hội thể thao trường em", "When is your sports day? - It's in November.", "sports day, football match, running race, table tennis", 1),
            (10, "Where were you yesterday?", "Hôm qua bạn ở đâu?", "Where were you yesterday? - I was at home.", "yesterday, at home, at school, on the beach, in the zoo", 1),
            (11, "My home", "Ngôi nhà của tôi", "Where do you live? - I live in a flat.", "flat, house, street, avenue, village, tower", 2),
            (12, "Jobs and workplaces", "Nghề nghiệp và nơi làm việc", "What does your father do? - He's a doctor.", "doctor, farmer, nurse, worker, hospital, factory", 2),
            (13, "Appearance", "Ngoại hình", "What does he look like? - He's tall and slim.", "tall, short, slim, strong, young, old", 2),
            (14, "Daily activities", "Hoạt động hàng ngày", "What do you do in the morning? - I do morning exercise.", "morning, afternoon, evening, exercise, homework", 2),
            (15, "My family's weekends", "Cuối tuần của gia đình em", "What does your family do at weekends?", "visit grandparents, go for a picnic, watch TV, cook", 2),
            (16, "Weather", "Thời tiết", "What's the weather like today? - It's sunny.", "sunny, rainy, windy, cloudy, snowy, stormy", 2),
            (17, "In the city", "Ở thành phố", "How can I get to the bakery? - Turn left.", "bakery, pharmacy, bookshop, cinema, turn left, turn right", 2),
            (18, "At the shopping centre", "Ở trung tâm mua sắm", "How much is this T-shirt? - It's 80,000 dong.", "T-shirt, dress, skirt, jacket, trousers, shoes", 2),
            (19, "Animal world", "Thế giới động vật", "What animal do you want to see? - I want to see kangaroos.", "kangaroo, crocodile, tiger, monkey, bear, elephant", 2),
            (20, "At summer camp", "Ở trại hè", "Where are you going this summer? - I'm going to Phu Quoc.", "summer camp, sea, island, mountain, travel, tent", 2),
        ]),
        (5, "SGK Tiếng Anh 5 – Global Success", [
            (1, "All about me!", "Tất cả về tôi!", "What are you like? - I'm friendly and hard-working.", "friendly, hard-working, active, helpful, kind, clever", 1),
            (2, "Our homes", "Ngôi nhà của chúng mình", "What's your address? - It's 105 Hoa Binh Lane.", "address, lane, street, avenue, quiet, crowded", 1),
            (3, "My foreign friends", "Những người bạn nước ngoài", "Where does he come from? - He's from London.", "country, nationality, English, American, Australian, Japanese", 1),
            (4, "Our free-time activities", "Hoạt động lúc rảnh rỗi", "What do you do in your free time? - I surf the Internet.", "surf the Internet, read comic books, clean the house, skate", 1),
            (5, "My future job", "Nghề nghiệp tương lai", "What would you like to be in the future? - An architect.", "architect, pilot, writer, astronaut, engineer, artist", 1),
            (6, "Our school rooms", "Các phòng chức năng ở trường", "Which room is on the second floor? - The library.", "first floor, second floor, third floor, science lab, art room", 1),
            (7, "Our favourite school activities", "Hoạt động học tập yêu thích", "What school activity do you like best? - Science club.", "project, experiment, presentation, debate, exhibition", 1),
            (8, "School subjects", "Các môn học", "How often do you have English? - Four times a week.", "once, twice, three times, four times, every school day", 1),
            (9, "Our outdoor activities", "Hoạt động ngoài trời", "What were you doing yesterday afternoon? - Playing badminton.", "badminton, volleyball, hide-and-seek, cycling, walking", 1),
            (10, "Our school trip", "Chuyến dã ngoại của trường", "Where did you go on your school trip? - Cuc Phuong National Park.", "school trip, national park, museum, countryside, lake", 1),
            (11, "Family health", "Sức khỏe gia đình", "What's the matter with you? - I have a headache.", "headache, toothache, stomach ache, fever, cough, sore throat", 2),
            (12, "Our responsibilities", "Trách nhiệm của chúng mình", "Don't ride your bike too fast! - OK, I won't.", "danger, knife, stairs, fire, ride fast, touch the stove", 2),
            (13, "Our special days", "Những ngày đặc biệt", "When will Teachers' Day be? - It'll be next Wednesday.", "Teachers' Day, Children's Day, Sports Day, celebration", 2),
            (14, "Staying healthy", "Giữ gìn sức khỏe", "What should you eat to stay healthy? - More vegetables.", "healthy, fruit, vegetables, drink water, do exercise, sleep early", 2),
            (15, "Life stories", "Những câu chuyện cuộc sống", "What happened in the story? - First,... Then,... Finally,...", "character, plot, fairy tale, fox, crow, prince, princess", 2),
            (16, "Seasons and weather", "Các mùa và thời tiết", "What will the weather be like tomorrow? - Warm and sunny.", "spring, summer, autumn, winter, warm, cool, freezing", 2),
            (17, "Stories for children", "Truyện đọc thiếu nhi", "What do you think of the Fox? - He is clever.", "clever, greedy, kind, gentle, hard-working, honest", 2),
            (18, "Means of transport", "Phương tiện giao thông", "How can I get to Da Nang? - You can go by plane.", "plane, train, coach, underground, boat, motorbike", 2),
            (19, "Places of interest", "Danh lam thắng cảnh", "Which place would you like to visit: Trang An or Bai Dinh?", "pagoda, bridge, bay, island, temple, palace", 2),
            (20, "Our summer holiday", "Kỳ nghỉ hè của chúng mình", "Where did you go on holiday? - I went to Ha Long Bay.", "holiday, beach, resort, seafood, swimming, castle", 2),
        ])
    ]:
        g_units = []
        for u_num, title, title_vi, grammar_str, words_str, sem in u_list_raw:
            word_list = [w.strip() for w in words_str.split(",")]
            vocab_items = []
            for idx, w in enumerate(word_list):
                vocab_items.append({
                    "id": f"g{g_num}_u{u_num}_{idx+1:02d}",
                    "word": w,
                    "phonetic": f"/{w.lower()}/",
                    "wordType": "Từ vựng trọng tâm",
                    "meaning": f"{w.capitalize()} - chủ đề {title_vi}",
                    "hint": f"Tiếng Anh {g_num} - Unit {u_num}",
                    "exampleEn": f"We are talking about {w}.",
                    "exampleVi": f"Chúng mình đang nói về {w}.",
                    "emoji": "🌟"
                })
            main_word = word_list[0]
            g_units.append({
                "unitId": f"g{g_num}_u{u_num}",
                "grade": g_num,
                "unit": u_num,
                "unitTitle": f"Unit {u_num}: {title}",
                "unitNameVi": title_vi,
                "theme": "Community & Life Skills",
                "semester": sem,
                "bookPages": f"Trang {(u_num-1)*6 + 6} – {u_num*6 + 5}",
                "vocabularies": vocab_items,
                "grammar": {
                    "title": f"Mẫu câu trọng tâm Unit {u_num}",
                    "ruleVi": grammar_str,
                    "formula": grammar_str.split("-")[0].strip() if "-" in grammar_str else grammar_str,
                    "quickTip": "Áp dụng cấu trúc câu chuẩn xác theo ngữ cảnh giao tiếp thực tế.",
                    "quiz": [
                        {
                            "question": f"Choose the best answer for Unit {u_num}: '{grammar_str.split('?')[0]}?'",
                            "options": [grammar_str.split('-')[-1].strip() if '-' in grammar_str else main_word, "Yes, I am", "No, I didn't", "It is 9 o'clock"],
                            "answerIndex": 0,
                            "explain": "Áp dụng câu trả lời mẫu chuẩn SGK."
                        }
                    ]
                },
                "pronunciation": {
                    "pair": "/e/ và /æ/",
                    "title": "Ngữ âm chuẩn bản ngữ",
                    "sound1": {"symbol": "/e/", "name": "Nguyên âm /e/", "words": ["pen", "bed"]},
                    "sound2": {"symbol": "/æ/", "name": "Nguyên âm /æ/", "words": ["cat", "bag"]},
                    "practiceQuiz": [
                        {"word": "cat", "correctSound": "/æ/", "options": ["/e/", "/æ/"], "meaningVi": "Con mèo"}
                    ],
                    "tongueTwister": f"Ten red pens are on the desk."
                },
                "speaking": {
                    "targetSentence": f"We enjoy learning about {title_vi.lower()} in English.",
                    "phonetic": f"/wiː ɪnˈdʒɔɪ ˈlɜːnɪŋ əˈbaʊt {main_word.lower()} ɪn ˈɪŋɡlɪʃ/",
                    "meaningVi": f"Chúng mình rất thích học về {title_vi.lower()} trong môn tiếng Anh.",
                    "situationalTopic": title_vi,
                    "dialogueTitle": f"Getting Started: {title}",
                    "dialogueContext": f"Các bạn học sinh cùng trao đổi và phỏng vấn nhau về {title_vi}.",
                    "dialogueLines": [
                        {"id": f"g{g_num}_u{u_num}_d1", "speaker": "Mai", "sentenceEn": f"Hello, Tony. Let's talk about {title.lower()}.", "phonetic": "/həˈləʊ ˈtəʊni lets tɔːk əˈbaʊt/", "meaningVi": f"Chào Tony. Chúng mình cùng nói về {title_vi.lower()} nhé.", "tipsVi": "Mở đầu tự nhiên."},
                        {"id": f"g{g_num}_u{u_num}_d2", "speaker": "Tony", "sentenceEn": "That's a great idea! I'm ready.", "phonetic": "/ðæts ə ɡreɪt aɪˈdɪə aɪm ˈredi/", "meaningVi": "Ý kiến hay đó! Mình đã sẵn sàng.", "tipsVi": "Hào hứng đón nhận."},
                        {"id": f"g{g_num}_u{u_num}_d3", "speaker": "Mai", "sentenceEn": f"{grammar_str.split('-')[0].strip()}", "phonetic": "/.../", "meaningVi": "Hỏi câu trọng tâm.", "tipsVi": "Phát âm rõ ràng."},
                        {"id": f"g{g_num}_u{u_num}_d4", "speaker": "Tony", "sentenceEn": f"{grammar_str.split('-')[-1].strip() if '-' in grammar_str else 'Sure!'}", "phonetic": "/.../", "meaningVi": "Đáp lại chuẩn xác.", "tipsVi": "Tự tin và chuẩn ngữ điệu."}
                    ],
                    "challenges": [
                        {"sentenceEn": f"Practice speaking about {title_vi.lower()} every day.", "phonetic": "/.../", "meaningVi": f"Luyện tập nói về {title_vi.lower()} mỗi ngày."}
                    ]
                },
                "listening": {
                    "topic": f"Bài nghe chủ đề: {title_vi}",
                    "transcript": f"Good morning class. Today we explore our lesson on {title}. Please listen and note down the key ideas about {main_word}.",
                    "question": f"What is the main topic of today's lesson?",
                    "options": [title, "Maths lesson", "Art lesson", "Sports day"],
                    "answerIndex": 0
                },
                "reading": {
                    "title": f"Reading: {title}",
                    "passage": f"Learning English helps us connect with friends around the world. In this unit, we learn about {title_vi.lower()}. Many students find that {main_word} is very interesting and practical in daily life.",
                    "translation": f"Học tiếng Anh giúp chúng mình kết nối với bạn bè khắp nơi trên thế giới. Trong bài học này, chúng mình học về {title_vi.lower()}.",
                    "questions": [
                        {
                            "id": f"g{g_num}_u{u_num}_r1",
                            "type": "multiple_choice",
                            "question": f"What helps students connect with friends around the world?",
                            "options": ["Learning English", "Playing games", "Sleeping late", "Watching television"],
                            "answerIndex": 0,
                            "explain": "Đoạn 1 nêu rõ: 'Learning English helps us connect with friends around the world.'"
                        }
                    ]
                },
                "writing": {
                    "correctSentence": f"We are learning about {title.lower()} today",
                    "meaningVi": f"Hôm nay chúng mình đang học về {title_vi.lower()}.",
                    "items": [
                        {
                            "id": f"g{g_num}_u{u_num}_w1",
                            "type": "unscramble",
                            "scrambledWords": ["We", "are", "learning", "about", title.split()[0], "today"],
                            "correctSentence": f"We are learning about {title.split()[0]} today",
                            "meaningVi": f"Hôm nay chúng mình học về {title.split()[0]}.",
                            "hint": "Bắt đầu bằng 'We are...'"
                        }
                    ]
                }
            })

        grades[g_num] = {
            "grade": g_num,
            "gradeName": f"Lớp {g_num}",
            "level": "primary",
            "levelName": "Tiểu học",
            "title": title_book,
            "totalUnits": 20,
            "interactiveAvailable": True,
            "interactiveNote": f"Hệ thống trạm học tương tác 7 kỹ năng chuẩn SGK Lớp {g_num}",
            "units": g_units
        }

    return grades
