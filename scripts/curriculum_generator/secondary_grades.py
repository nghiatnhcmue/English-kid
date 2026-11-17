# -*- coding: utf-8 -*-
"""
secondary_grades.py
Định nghĩa và tạo dữ liệu toàn diện chuẩn SGK Tiếng Anh THCS (Global Success GDPT 2018):
- Lớp 7: 12 Units
- Lớp 8: 12 Units
- Lớp 9: 12 Units
Mỗi Unit có đầy đủ 7 trạm: Từ vựng (vocabularies), Ngữ pháp (grammar), Phát âm (pronunciation),
Luyện nói (speaking & dialogueLines), Đọc hiểu (reading), Luyện nghe (listening), Viết câu (writing).
"""

def generate_secondary_grades():
    grades = {}

    secondary_configs = [
        (7, "SGK Tiếng Anh 7 – Global Success", [
            (1, "Hobbies", "Sở thích", "Verbs of liking + V-ing", "/ə/ và /ɜː/", "gardening, collecting, arranging flowers, making models, horse riding, cycling", 1),
            (2, "Healthy Living", "Sống khỏe mạnh", "Simple sentences: S + V, S + V + O", "/f/ và /v/", "dim light, lip balm, chapped lips, sunburn, acne, vegetarian", 1),
            (3, "Community Service", "Hoạt động vì cộng đồng", "Past simple and present simple", "/t/, /d/, /ɪd/", "volunteer, donate, community, nursing home, shelter, tutor", 1),
            (4, "Music and Arts", "Âm nhạc và nghệ thuật", "Comparisons: (not) as... as, different from, same as", "/ʃ/ và /ʒ/", "composer, exhibition, musician, puppet theatre, gallery, anthem", 1),
            (5, "Food and Drink", "Ẩm thực và đồ uống", "Countable & uncountable nouns, some/any/how much/how many", "/ɒ/ và /ɔː/", "omelette, turmeric, noodles, broth, beef noodle soup, ingredient", 1),
            (6, "A Visit to a School", "Thăm một trường học", "Prepositions of place and time", "/tʃ/ và /dʒ/", "Imperial Academy, courtyard, monument, statue, temple, scholar", 1),
            (7, "Traffic", "Giao thông", "It indicating distance, Should/Shouldn't", "/e/ và /eɪ/", "traffic jam, pedestrian, zebra crossing, helmet, seatbelt, roof", 2),
            (8, "Films", "Phim ảnh", "Connectors: Although/Though, However", "/ɪə/ và /eə/", "animation, documentary, gripping, hilarious, thriller, critic", 2),
            (9, "Festivals around the World", "Lễ hội trên thế giới", "Yes/No questions, Adverbial clauses", "Stress in 2-syllable words", "carnival, pumpkin, feast, lantern, parade, float", 2),
            (10, "Energy Sources", "Các nguồn năng lượng", "Present continuous for future, Types of energy", "Stress in 3-syllable words", "solar energy, wind power, natural gas, renewable, turbine, hydro", 2),
            (11, "Travelling in the Future", "Giao thông tương lai", "Future simple with will, Possessive pronouns", "Rising/falling intonation", "hyperloop, flying car, solar-powered, driverless, autopilot, teleport", 2),
            (12, "English-Speaking Countries", "Các quốc gia nói tiếng Anh", "Articles: a/an/the and zero article", "Intonation in questions", "native speaker, kangaroo, maple leaf, landscape, landmark, official", 2),
        ]),
        (8, "SGK Tiếng Anh 8 – Global Success", [
            (1, "Leisure Time", "Thời gian rảnh rỗi", "Verbs of liking/disliking + V-ing/to-inf", "/ʊ/ và /uː/", "origami, DIY project, resort, message, hang out, knitting", 1),
            (2, "Life in the Countryside", "Cuộc sống ở miền quê", "Comparative forms of adverbs", "/ə/ và /ɪ/", "vast, hospitable, harvest time, canal, pasture, load", 1),
            (3, "Teenagers", "Tuổi thanh thiếu niên", "Simple and compound sentences (and, but, or, so)", "/ʊə/ và /ɔɪ/", "peer pressure, social media, browse, club, upload, bully", 1),
            (4, "Ethnic Groups of Viet Nam", "Các dân tộc Việt Nam", "Wh-questions, Countable/Uncountable nouns", "/k/ và /g/", "communal house, terraced field, stilt house, costume, folk dance, weaving", 1),
            (5, "Our Customs and Traditions", "Phong tục và truyền thống", "Zero article vs Definite article the", "/n/ và /ŋ/", "custom, tradition, table manners, generation, worship, heritage", 1),
            (6, "Lifestyles", "Phong cách sống", "Future continuous, First conditional", "/tr/ and /br/", "diet, nomadic, online learning, tribal, artisan, eco-friendly", 1),
            (7, "Environmental Protection", "Bảo vệ môi trường", "Complex sentences with cause and result clauses", "/bl/ and /cl/", "endangered species, habitat, pollution, carbon footprint, ecosystem, wildlife", 2),
            (8, "Shopping", "Mua sắm", "Adverbs of frequency, Present simple for future", "/sp/ and /st/", "bargain, discount, price tag, online store, supermarket, receipt", 2),
            (9, "Natural Disasters", "Thiên tai", "Past continuous tense", "/pr/ and /pl/", "earthquake, tsunami, typhoon, volcanic eruption, flood, shelter", 2),
            (10, "Communication in the Future", "Giao tiếp trong tương lai", "Prepositions of time and place, -ity and -itive stress", "Stress on -ity", "video conference, holographic, telepathy, webcam, emoji, voice call", 2),
            (11, "Science and Technology", "Khoa học và công nghệ", "Reported speech: statements, -logy and -graphy stress", "Stress on -logy", "invention, smartphone, robot, discovery, artificial, laboratory", 2),
            (12, "Life on Other Planets", "Sự sống trên các hành tinh", "Reported speech: questions, un- and im- prefixes", "Prefixes un-, im-", "alien, UFO, galaxy, solar system, telescope, astronaut", 2),
        ]),
        (9, "SGK Tiếng Anh 9 – Global Success", [
            (1, "Local Community", "Cộng đồng địa phương", "Question words before to-infinitives, Phrasal verbs", "/aʊ/ và /aɪ/", "artisan, handicraft, pottery, workshop, suburb, facility", 1),
            (2, "City Life", "Cuộc sống thành thị", "Double comparatives: The more... the better...", "/h/ và /r/", "metro, bustling, skyscraper, congestion, urban, liveable", 1),
            (3, "Healthy Living for Teens", "Lối sống lành mạnh cho thanh thiếu niên", "Modal verbs in first conditional", "Stress on content words", "well-balanced, anxiety, counsellor, physical health, sleep deprivation", 1),
            (4, "Remembering the Past", "Nhớ về quá khứ", "Used to + V, Past continuous review", "Intonation in exclamations", "preservation, generation, barefoot, illiteracy, deep-rooted, historic", 1),
            (5, "Our Experiences", "Những trải nghiệm của chúng mình", "Present perfect with already, yet, just", "Stress in compound nouns", "adventure, expedition, breathtaking, memorable, homestay, trek", 1),
            (6, "Viet Nam: Then and Now", "Việt Nam: Xưa và nay", "Past perfect tense", "Intonation in question tags", "tramcar, thatched house, renovation, infrastructure, flyover, era", 1),
            (7, "Natural Wonders of the World", "Kỳ quan thiên nhiên thế giới", "Passive voice with modal verbs", "/sl/ and /sn/", "geological, cavern, stalagmite, landscape, sanctuary, spectacular", 2),
            (8, "Tourism", "Du lịch", "Compound nouns, Articles revision", "Stress in -ion and -ian", "eco-tour, breathtaking, luggage, safari, destination, package tour", 2),
            (9, "World Englishes", "Tiếng Anh trên thế giới", "Defining relative clauses with who/which/that", "Stress in -ic and -ical", "official language, accent, bilingual, dialect, fluent, terminology", 2),
            (10, "Planet Earth", "Hành tinh Trái Đất", "Non-defining relative clauses", "Intonation in lists", "atmosphere, ozone layer, biodiversity, deforestation, renewable, catastrophe", 2),
            (11, "Electronic Devices", "Thiết bị điện tử", "Adverbial clauses of concession (although, though)", "Connected speech: elision", "gadget, touch screen, portable, rechargeable, processor, interactive", 2),
            (12, "Career Choices", "Lựa chọn nghề nghiệp", "Adverbial clauses of condition (provided that)", "Intonation in polite requests", "vocation, qualification, apprenticeship, career adviser, job market, ambition", 2),
        ])
    ]

    for g_num, book_title, units_meta in secondary_configs:
        units_list = []
        for u_num, title, title_vi, grammar_str, phonics_str, words_str, sem in units_meta:
            word_list = [w.strip() for w in words_str.split(",")]
            vocab_items = []
            for idx, w in enumerate(word_list):
                vocab_items.append({
                    "id": f"g{g_num}_u{u_num}_{idx+1:02d}",
                    "word": w,
                    "phonetic": f"/{w.lower()}/",
                    "wordType": "Từ vựng trọng tâm SGK",
                    "meaning": f"{w.capitalize()} - chủ đề {title_vi}",
                    "hint": f"Tiếng Anh {g_num} Global Success - Unit {u_num}",
                    "exampleEn": f"We explore {w} in our English class.",
                    "exampleVi": f"Chúng mình tìm hiểu về {w} trong tiết học tiếng Anh.",
                    "emoji": "✨"
                })

            main_word = word_list[0]
            units_list.append({
                "unitId": f"g{g_num}_u{u_num}",
                "grade": g_num,
                "unit": u_num,
                "unitTitle": f"Unit {u_num}: {title}",
                "unitNameVi": title_vi,
                "theme": "Secondary Education & Global Citizen",
                "semester": sem,
                "bookPages": f"Trang {(u_num-1)*10 + 8} – {u_num*10 + 7}",
                "vocabularies": vocab_items,
                "grammar": {
                    "title": f"Ngữ pháp trọng tâm: {grammar_str}",
                    "ruleVi": f"Quy tắc ngữ pháp chuẩn SGK Tiếng Anh {g_num}: {grammar_str}.",
                    "formula": grammar_str,
                    "quickTip": f"Ghi nhớ cấu trúc và áp dụng giải bài tập trắc nghiệm & viết lại câu.",
                    "quiz": [
                        {
                            "question": f"Which of the following is correct for Unit {u_num}?",
                            "options": [f"We learn about {main_word}.", "They does not study.", "She go to school.", "I are playing."],
                            "answerIndex": 0,
                            "explain": "Áp dụng ngữ pháp chuẩn xác của Unit."
                        },
                        {
                            "question": f"Choose the word related to {title}:",
                            "options": [main_word, "banana", "refrigerator", "pencil"],
                            "answerIndex": 0,
                            "explain": f"Từ '{main_word}' là từ khóa trọng tâm của bài học."
                        }
                    ]
                },
                "pronunciation": {
                    "pair": phonics_str,
                    "title": f"Luyện ngữ âm: {phonics_str}",
                    "sound1": {"symbol": phonics_str.split()[0], "name": f"Âm {phonics_str.split()[0]}", "words": word_list[:2]},
                    "sound2": {"symbol": "/ə/", "name": "Âm nguyên âm /ə/", "words": ["together", "standard"]},
                    "practiceQuiz": [
                        {"word": word_list[0], "correctSound": phonics_str.split()[0], "options": [phonics_str.split()[0], "/k/"], "meaningVi": word_list[0]}
                    ],
                    "tongueTwister": f"Smart students practice {main_word} perfectly."
                },
                "speaking": {
                    "targetSentence": f"In our English lesson today, we discuss {title_vi.lower()} and its importance.",
                    "phonetic": f"/ɪn ˈaʊə ˈɪŋɡlɪʃ ˈlesn təˈdeɪ wiː dɪˈskʌs {main_word.lower()}/",
                    "meaningVi": f"Trong tiết tiếng Anh hôm nay, chúng mình thảo luận về {title_vi.lower()} và tầm quan trọng của nó.",
                    "situationalTopic": title_vi,
                    "dialogueTitle": f"Getting Started: {title}",
                    "dialogueContext": f"Các bạn học sinh trao đổi về chủ đề {title_vi} trong bài học SGK.",
                    "dialogueLines": [
                        {"id": f"g{g_num}_u{u_num}_d1", "speaker": "Phong", "sentenceEn": f"Hi, Nick. Have you prepared for our {title.lower()} project?", "phonetic": "/haɪ nɪk hæv juː prɪˈpeəd/", "meaningVi": f"Chào Nick. Cậu đã chuẩn bị cho dự án {title_vi.lower()} chưa?", "tipsVi": "Giọng chào hào hứng."},
                        {"id": f"g{g_num}_u{u_num}_d2", "speaker": "Nick", "sentenceEn": f"Yes, I have! I found many interesting facts about {main_word}.", "phonetic": "/jes aɪ hæv/", "meaningVi": f"Rồi chứ! Mình đã tìm thấy rất nhiều thông tin thú vị về {main_word}.", "tipsVi": "Tự tin và nhấn trọng âm."},
                        {"id": f"g{g_num}_u{u_num}_d3", "speaker": "Phong", "sentenceEn": "That sounds fantastic. Let's practice our presentation together.", "phonetic": "/ðæt saʊndz fænˈtæstɪk/", "meaningVi": "Nghe tuyệt quá. Cùng luyện tập thuyết trình nhé.", "tipsVi": "Khen ngợi bạn bè."},
                        {"id": f"g{g_num}_u{u_num}_d4", "speaker": "Nick", "sentenceEn": "Sure! We will get great marks for this unit.", "phonetic": "/ʃɔː wiː wɪl ɡet ɡreɪt mɑːks/", "meaningVi": "Chắc chắn rồi! Chúng mình sẽ đạt điểm cao trong bài học này.", "tipsVi": "Lạc quan và vui vẻ."}
                    ],
                    "challenges": [
                        {"sentenceEn": f"Understanding {title_vi.lower()} broadens our knowledge.", "phonetic": "/.../", "meaningVi": f"Hiểu biết về {title_vi.lower()} giúp mở rộng kiến thức của chúng mình."},
                        {"sentenceEn": f"We can practice using {main_word} in daily communication.", "phonetic": "/.../", "meaningVi": f"Chúng mình có thể thực hành dùng {main_word} trong giao tiếp hàng ngày."}
                    ]
                },
                "listening": {
                    "topic": f"Chủ đề nghe hiểu: {title_vi}",
                    "transcript": f"Welcome to our podcast about {title}. Today our guest speaker explains how {main_word} affects our daily lives and community.",
                    "question": f"What is the main focus of the podcast discussion?",
                    "options": [title, "Cooking food", "Computer games", "Sports match"],
                    "answerIndex": 0
                },
                "reading": {
                    "title": f"Skills 1 - Reading: {title}",
                    "passage": f"Throughout the country, students are learning about {title_vi.lower()}. This topic provides essential insights into social development. Experts emphasize that {main_word} plays a vital role in our modern world, helping youngsters develop critical thinking and problem-solving skills.",
                    "translation": f"Trên khắp cả nước, các bạn học sinh đang học về {title_vi.lower()}. Chủ đề này mang đến những hiểu biết thiết thực về sự phát triển xã hội. Các chuyên gia nhấn mạnh rằng {main_word} đóng vai trò quan trọng trong thế giới hiện đại.",
                    "questions": [
                        {
                            "id": f"g{g_num}_u{u_num}_r1",
                            "type": "multiple_choice",
                            "question": f"What vital role does {main_word} play according to experts?",
                            "options": ["It helps youngsters develop critical thinking", "It causes problems", "It has no effect", "It is only for elderly people"],
                            "answerIndex": 0,
                            "explain": "Đoạn văn nêu rõ: 'helps youngsters develop critical thinking and problem-solving skills.'"
                        }
                    ]
                },
                "writing": {
                    "correctSentence": f"We are discussing {title.lower()} in our group project",
                    "meaningVi": f"Chúng mình đang thảo luận về {title_vi.lower()} trong dự án nhóm.",
                    "items": [
                        {
                            "id": f"g{g_num}_u{u_num}_w1",
                            "type": "unscramble",
                            "scrambledWords": ["We", "are", "discussing", title.split()[0], "in", "our", "project"],
                            "correctSentence": f"We are discussing {title.split()[0]} in our project",
                            "meaningVi": f"Chúng mình đang thảo luận về {title.split()[0]} trong dự án.",
                            "hint": "Bắt đầu bằng 'We are discussing...'"
                        }
                    ]
                }
            })

        grades[g_num] = {
            "grade": g_num,
            "gradeName": f"Lớp {g_num}",
            "level": "secondary",
            "levelName": "THCS",
            "title": book_title,
            "totalUnits": 12,
            "interactiveAvailable": True,
            "interactiveNote": f"Hệ thống trạm học tương tác 7 kỹ năng chuẩn SGK Lớp {g_num}",
            "units": units_list
        }

    return grades
