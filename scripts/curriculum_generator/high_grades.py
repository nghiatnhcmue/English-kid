# -*- coding: utf-8 -*-
"""
high_grades.py
Định nghĩa và tạo dữ liệu toàn diện chuẩn SGK Tiếng Anh THPT (Global Success GDPT 2018):
- Lớp 10: 10 Units
- Lớp 11: 10 Units
- Lớp 12: 10 Units
Mỗi Unit có đầy đủ 7 trạm: Từ vựng học thuật (vocabularies), Ngữ pháp chuyên sâu (grammar),
Phát âm & trọng âm (pronunciation), Luyện nói học thuật & tranh biện (speaking & dialogueLines),
Đọc hiểu nâng cao (reading), Luyện nghe học thuật (listening), Viết luận & diễn đạt (writing).
"""

def generate_high_grades():
    grades = {}

    high_configs = [
        (10, "SGK Tiếng Anh 10 – Global Success", [
            (1, "Family Life", "Đời sống gia đình", "Present simple vs Present continuous", "/br/, /kr/, /tr/", "chore, breadwinner, homemaker, groceries, split, heavy lifting, financial burden", 1),
            (2, "Humans and the Environment", "Con người và môi trường", "Future with will and be going to, Passive voice", "/kl/, /pl/, /gr/, /pr/", "carbon footprint, eco-friendly, landfill, litter, appliance, energy-saving", 1),
            (3, "Music", "Âm nhạc", "Compound sentences, to-infinitives and bare infinitives", "Stress in 2-syllable words", "instrument, phenomenon, idol, audience, talent show, passionate, release", 1),
            (4, "For a Better Community", "Vì một cộng đồng tốt đẹp hơn", "Past simple vs Past continuous with when/while", "Stress in 3-syllable adjectives", "community, charity, non-governmental, volunteer, remote, donation, underprivileged", 1),
            (5, "Inventions", "Các phát minh", "Present perfect, Gerunds and to-infinitives", "Stress in words with -ment, -tion", "invention, artificial, patent, portable, laboratory, touchscreen, bulky", 1),
            (6, "Gender Equality", "Bình đẳng giới", "Passive voice with modals", "Stress in words with 3+ syllables", "gender, equality, discrimination, eliminate, opportunity, workforce, wage gap", 2),
            (7, "Viet Nam and International Organisations", "Việt Nam và các tổ chức quốc tế", "Comparative and superlative adjectives", "Stress in -ic, -ical, -ity", "organisation, peacekeeping, integration, promotion, summit, treaty, delegate", 2),
            (8, "New Ways to Learn", "Phương thức học tập mới", "Relative clauses: defining and non-defining", "Stress in 3-syllable verbs", "blended learning, tablet, digital, face-to-face, interactive, educational app", 2),
            (9, "Protecting the Environment", "Bảo vệ môi trường sống", "Reported speech: statements and commands", "Sentence stress", "ecosystem, deforestation, global warming, fossil fuel, conservation, marine", 2),
            (10, "Ecotourism", "Du lịch sinh thái", "Conditional sentences Type 1 and Type 2", "Intonation in conditionals", "ecotour, sustainable, destination, biodiversity, culture, local craft, wildlife", 2),
        ]),
        (11, "SGK Tiếng Anh 11 – Global Success", [
            (1, "A Long and Healthy Life", "Cuộc sống trường thọ và khỏe mạnh", "Past simple vs Present perfect", "Strong and weak forms of auxiliary verbs", "longevity, immune system, nutritious, workout, prescription, organism, bacteria", 1),
            (2, "The Generation Gap", "Khoảng cách thế hệ", "Modal verbs: must, have to, should, ought to", "Contracted forms of verbs", "generation gap, curfew, viewpoint, nuclear family, conflict, open-minded", 1),
            (3, "Cities of the Future", "Các thành phố tương lai", "Stative verbs in continuous forms", "Linking final consonant to initial vowel", "smart city, infrastructure, skyscraper, liveable, automated, green space, urban", 1),
            (4, "ASEAN and Viet Nam", "ASEAN và Việt Nam", "Gerunds as subject and object", "Elision of vowels", "association, charter, solidarity, motto, cooperation, diplomacy, bloc", 1),
            (5, "Global Warming", "Hiện tượng ấm lên toàn cầu", "Present participle and past participle clauses", "Assimilation of sounds", "greenhouse gas, emission, catastrophic, extreme weather, drought, renewable", 1),
            (6, "Preserving Our Heritage", "Bảo tồn di sản của chúng ta", "To-infinitive clauses", "Intonation in cleft sentences", "heritage, folklore, monument, preservation, authentic, imperial, restoration", 2),
            (7, "Education Options for School-Leavers", "Định hướng giáo dục sau phổ thông", "Perfect gerunds and perfect participles", "Intonation in choice questions", "vocational, university, apprenticeship, qualification, tertiary, scholarship", 2),
            (8, "Becoming Independent", "Tự lập", "Cleft sentences: It is/was... that...", "Linking /r/ and intrusive /r/", "independent, self-reliant, time management, budget, decision-making, mature", 2),
            (9, "Social Issues", "Các vấn đề xã hội", "Linking words and phrases", "Rhythm and pause in speech", "cyberbullying, peer pressure, poverty, body shaming, overpopulation, crime", 2),
            (10, "The Ecosystem", "Hệ sinh thái", "Compound nouns and noun phrases", "Intonation with parenthetical elements", "fauna, flora, food chain, habitat loss, endangered, balance, biosphere", 2),
        ]),
        (12, "SGK Tiếng Anh 12 – Global Success", [
            (1, "Life Stories We Admire", "Những tấm gương cuộc đời đáng ngưỡng mộ", "Past simple vs Past continuous, used to/would", "Weak and strong forms of prepositions", "admire, biography, dedication, persevere, resilience, legacy, pioneer", 1),
            (2, "A Multicultural World", "Thế giới đa văn hóa", "Articles: definite, indefinite, zero article", "Intonation in statements used as questions", "multicultural, identity, diversity, assimilation, integration, customs, global citizen", 1),
            (3, "Green Living", "Lối sống xanh", "Gerunds and to-infinitives review", "Contracted forms of modal verbs", "eco-friendly, zero-waste, compost, biodegradable, solar panel, sustainability", 1),
            (4, "Urbanisation", "Đô thị hóa", "Compound adjectives, Subjunctive mood", "Linking consonant to vowel across words", "urbanisation, rural-to-urban, mega-city, slum, industrialisation, municipal", 1),
            (5, "The World of Work", "Thế giới việc làm", "Reported speech with reporting verbs (suggest, recommend)", "Intonation in question tags", "internship, recruitment, curriculum vitae, soft skills, probationary, remuneration", 1),
            (6, "Artificial Intelligence", "Trí tuệ nhân tạo", "Passive voice in advanced structures, Causative have/get", "Intonation in cleft sentences", "machine learning, algorithm, automation, neural network, robotic, ethics", 2),
            (7, "The World of Mass Media", "Thế giới truyền thông đại chúng", "Prepositions after verbs and adjectives", "Stress in multi-syllable academic words", "mass media, journalism, censorship, broadcast, digital platform, sensationalism", 2),
            (8, "Wildlife Conservation", "Bảo tồn động vật hoang dã", "Conditionals review: mixed conditionals", "Connected speech in rapid dialogue", "poaching, extinct, sanctuary, biodiversity, endangered species, captivity", 2),
            (9, "Career Paths", "Con đường sự nghiệp", "Relative clauses review", "Stress in derived nouns and adjectives", "entrepreneur, vocation, trajectory, lifelong, promotion, ambition, mentoring", 2),
            (10, "Lifelong Learning", "Học tập suốt đời", "Inversion with negative adverbials (Not only... but also)", "Rhetorical intonation", "lifelong learning, self-directed, cognitive, agility, upskill, reskill, mindset", 2),
        ])
    ]

    for g_num, book_title, units_meta in high_configs:
        units_list = []
        for u_num, title, title_vi, grammar_str, phonics_str, words_str, sem in units_meta:
            word_list = [w.strip() for w in words_str.split(",")]
            vocab_items = []
            for idx, w in enumerate(word_list):
                vocab_items.append({
                    "id": f"g{g_num}_u{u_num}_{idx+1:02d}",
                    "word": w,
                    "phonetic": f"/{w.lower()}/",
                    "wordType": "Thuật ngữ học thuật THPT",
                    "meaning": f"{w.capitalize()} - chủ đề {title_vi}",
                    "hint": f"Tiếng Anh {g_num} Global Success - Unit {u_num}",
                    "exampleEn": f"The concept of {w} is essential in understanding {title.lower()}.",
                    "exampleVi": f"Khái niệm {w} rất cần thiết để thấu hiểu chủ đề {title_vi.lower()}.",
                    "emoji": "🎓"
                })

            main_word = word_list[0]
            units_list.append({
                "unitId": f"g{g_num}_u{u_num}",
                "grade": g_num,
                "unit": u_num,
                "unitTitle": f"Unit {u_num}: {title}",
                "unitNameVi": title_vi,
                "theme": "High School Academic & Career Readiness",
                "semester": sem,
                "bookPages": f"Trang {(u_num-1)*12 + 8} – {u_num*12 + 7}",
                "vocabularies": vocab_items,
                "grammar": {
                    "title": f"Chuyên đề ngữ pháp THPT: {grammar_str}",
                    "ruleVi": f"Ngữ pháp trọng tâm kỳ thi Tốt nghiệp THPT & chứng chỉ quốc tế: {grammar_str}.",
                    "formula": grammar_str,
                    "quickTip": "Nắm vững bản chất ngữ pháp để giải quyết các câu phân loại điểm 9-10 trong đề thi.",
                    "quiz": [
                        {
                            "question": f"Identify the sentence demonstrating the correct structure for Unit {u_num}:",
                            "options": [
                                f"In modern society, {main_word} requires comprehensive attention and dedication.",
                                "She are studying very hard for the upcoming exam.",
                                "They does not understand the primary rule.",
                                "He have completed the task yesterday."
                            ],
                            "answerIndex": 0,
                            "explain": "Câu đúng cấu trúc ngữ pháp và phù hợp văn phong học thuật THPT."
                        },
                        {
                            "question": f"Which term is most strongly associated with {title}?",
                            "options": [main_word, "pencil box", "doll house", "toy train"],
                            "answerIndex": 0,
                            "explain": f"Thuật ngữ '{main_word}' là từ vựng cốt lõi của Unit {u_num} Lớp {g_num}."
                        }
                    ]
                },
                "pronunciation": {
                    "pair": phonics_str,
                    "title": f"Ngữ âm & Trọng âm nâng cao: {phonics_str}",
                    "sound1": {"symbol": phonics_str.split()[0], "name": f"Quy tắc {phonics_str.split()[0]}", "words": word_list[:2]},
                    "sound2": {"symbol": "/ə/", "name": "Nguyên âm trung tính /ə/", "words": ["development", "perspective"]},
                    "practiceQuiz": [
                        {"word": word_list[0], "correctSound": phonics_str.split()[0], "options": [phonics_str.split()[0], "/b/"], "meaningVi": word_list[0]}
                    ],
                    "tongueTwister": f"High school scholars master academic vocabulary such as {main_word} with confidence."
                },
                "speaking": {
                    "targetSentence": f"We are examining {title_vi.lower()} to develop our critical thinking and presentation skills.",
                    "phonetic": f"/wiː ɑːr ɪɡˈzæmɪnɪŋ {main_word.lower()} tuː dɪˈveləp ˈaʊə ˈkrɪtɪkl ˈθɪŋkɪŋ/",
                    "meaningVi": f"Chúng mình đang nghiên cứu về {title_vi.lower()} nhằm phát triển tư duy phản biện và kỹ năng thuyết trình.",
                    "situationalTopic": f"Thuyết trình & Tranh biện học thuật: {title_vi}",
                    "dialogueTitle": f"Getting Started: {title}",
                    "dialogueContext": f"Hai học sinh THPT thảo luận chuyên sâu về {title_vi} trong dự án nghiên cứu học tập.",
                    "dialogueLines": [
                        {"id": f"g{g_num}_u{u_num}_d1", "speaker": "Lan", "sentenceEn": f"Good morning, Nam. Have you analyzed the background data for our {title.lower()} seminar?", "phonetic": "/ɡʊd ˈmɔːnɪŋ næm/", "meaningVi": f"Chào Nam. Cậu đã phân tích dữ liệu cho hội thảo về {title_vi.lower()} chưa?", "tipsVi": "Phong thái học thuật tự tin."},
                        {"id": f"g{g_num}_u{u_num}_d2", "speaker": "Nam", "sentenceEn": f"Yes, Lan. I focused on how {main_word} influences contemporary society.", "phonetic": "/jes læn aɪ ˈfəʊkəst ɒn/", "meaningVi": f"Rồi Lan. Mình tập trung vào tầm ảnh hưởng của {main_word} đối với xã hội đương đại.", "tipsVi": "Nhấn mạnh từ khóa học thuật."},
                        {"id": f"g{g_num}_u{u_num}_d3", "speaker": "Lan", "sentenceEn": "Excellent! That perspective will definitely enrich our class presentation.", "phonetic": "/ˈeksələnt ðæt pəˈspektɪv/", "meaningVi": "Tuyệt vời! Góc nhìn đó chắc chắn sẽ làm phong phú bài thuyết trình của chúng ta.", "tipsVi": "Tán thành và khích lệ."},
                        {"id": f"g{g_num}_u{u_num}_d4", "speaker": "Nam", "sentenceEn": "Let's review the final slides together to ensure our arguments are convincing.", "phonetic": "/lets rɪˈvjuː ðə ˈfaɪnl slaɪdz/", "meaningVi": "Cùng rà soát các slide cuối để đảm bảo lập luận thuyết phục nhất nhé.", "tipsVi": "Giọng điệu nghiêm túc và chủ động."}
                    ],
                    "challenges": [
                        {"sentenceEn": f"Scholars emphasize the role of {title_vi.lower()} in modern national development.", "phonetic": "/.../", "meaningVi": f"Các học giả nhấn mạnh vai trò của {title_vi.lower()} trong sự phát triển quốc gia hiện đại."},
                        {"sentenceEn": f"Critical understanding of {main_word} prepares students for global integration.", "phonetic": "/.../", "meaningVi": f"Sự hiểu biết sâu sắc về {main_word} chuẩn bị hành trang hội nhập quốc tế cho học sinh."}
                    ]
                },
                "listening": {
                    "topic": f"Academic Lecture: {title}",
                    "transcript": f"Good afternoon everyone. In today's lecture, we examine {title}. As research indicates, {main_word} represents a key factor in our ongoing strategic development.",
                    "question": f"What key factor is highlighted in the opening lecture on {title}?",
                    "options": [main_word.capitalize(), "Weather forecast", "Traffic light", "Movie ticket"],
                    "answerIndex": 0
                },
                "reading": {
                    "title": f"Reading & Academic Analysis: {title}",
                    "passage": f"In an increasingly interconnected world, understanding {title_vi.lower()} is essential for high school graduates. Recent studies demonstrate that {main_word} plays a transformative role in driving sustainable progress. Educational institutions worldwide are adapting curricula to equip learners with competencies relevant to {title.lower()}.",
                    "translation": f"Trong một thế giới ngày càng gắn kết, việc thấu hiểu {title_vi.lower()} là vô cùng quan trọng đối với học sinh tốt nghiệp THPT. Các nghiên cứu gần đây chứng minh rằng {main_word} đóng vai trò chuyển biến trong việc thúc đẩy tiến bộ bền vững.",
                    "questions": [
                        {
                            "id": f"g{g_num}_u{u_num}_r1",
                            "type": "multiple_choice",
                            "question": f"According to the text, what plays a transformative role in driving sustainable progress?",
                            "options": [main_word.capitalize(), "Traditional farming only", "Passive entertainment", "Ignoring social changes"],
                            "answerIndex": 0,
                            "explain": "Đoạn văn viết: 'Recent studies demonstrate that [term] plays a transformative role in driving sustainable progress.'"
                        }
                    ]
                },
                "writing": {
                    "correctSentence": f"We are investigating {title.lower()} to enhance our academic competence",
                    "meaningVi": f"Chúng mình đang nghiên cứu về {title_vi.lower()} để nâng cao năng lực học thuật.",
                    "items": [
                        {
                            "id": f"g{g_num}_u{u_num}_w1",
                            "type": "unscramble",
                            "scrambledWords": ["We", "are", "investigating", title.split()[0], "to", "enhance", "competence"],
                            "correctSentence": f"We are investigating {title.split()[0]} to enhance competence",
                            "meaningVi": f"Chúng mình đang nghiên cứu {title.split()[0]} để nâng cao năng lực.",
                            "hint": "Bắt đầu bằng 'We are investigating...'"
                        }
                    ]
                }
            })

        grades[g_num] = {
            "grade": g_num,
            "gradeName": f"Lớp {g_num}",
            "level": "high",
            "levelName": "THPT",
            "title": book_title,
            "totalUnits": 10,
            "interactiveAvailable": True,
            "interactiveNote": f"Hệ thống trạm học tương tác 7 kỹ năng chuẩn SGK Lớp {g_num}",
            "units": units_list
        }

    return grades
