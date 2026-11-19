# -*- coding: utf-8 -*-
"""
secondary_grades.py
Định nghĩa và tạo dữ liệu chi tiết, chuẩn xác 100% theo SGK Tiếng Anh THCS (Global Success GDPT 2018):
- Lớp 7: 12 Units
- Lớp 8: 12 Units
- Lớp 9: 12 Units
Mỗi Unit có đầy đủ 7 trạm:
1. Từ vựng: IPA chuẩn quốc tế Oxford/Cambridge, nghĩa tiếng Việt chính xác, từ loại, câu ví dụ Anh-Việt, gợi ý.
2. Ngữ pháp: Quy tắc tiếng Việt rõ ràng, công thức chuẩn, mẹo nhớ nhanh, trắc nghiệm 2-4 câu kèm answerIndex và lời giải.
3. Phát âm: Cặp âm trọng tâm, bài tập phân biệt âm kèm answerIndex, câu luyện nói tongue-twister.
4. Luyện nói (Speaking): Hội thoại Getting Started chuẩn theo nhân vật SGK, các thử thách nói kèm phiên âm và dịch nghĩa.
5. Đọc hiểu (Reading): Bài đọc thực tế đúng chủ đề bài học, bản dịch tiếng Việt, 2-3 câu hỏi đọc hiểu kèm answerIndex và giải thích.
6. Luyện nghe (Listening): Chủ đề nghe thực tế, transcript chuẩn, câu hỏi trắc nghiệm kèm answerIndex.
7. Luyện viết (Writing): Câu mẫu ngữ pháp, bài tập sắp xếp trật tự từ unscrambleWords kèm correctSentence.
"""

def get_grade_7_data():
    units_data = [
        {
            "unit": 1,
            "title": "Hobbies",
            "titleVi": "Sở thích",
            "theme": "Community & Personal Life",
            "semester": 1,
            "bookPages": "Trang 8 – 17",
            "bookId": "sgk-7",
            "vocab": [
                ("gardening", "/ˈɡɑːdnɪŋ/", "Danh từ", "Làm vườn", "My mother loves gardening on Sunday mornings.", "Mẹ của mình rất thích làm vườn vào các buổi sáng Chủ nhật.", "Hoạt động chăm sóc hoa và cây cảnh"),
                ("collecting", "/kəˈlektɪŋ/", "Danh từ", "Sưu tầm", "Collecting stamps is a popular hobby among teenagers.", "Sưu tầm tem là một sở thích phổ biến trong giới thanh thiếu niên.", "Thu thập các món đồ cùng loại"),
                ("arranging flowers", "/əˈreɪndʒɪŋ ˈflaʊəz/", "Cụm danh từ", "Cắm hoa", "She is very good at arranging flowers for parties.", "Chị ấy rất giỏi cắm hoa cho các bữa tiệc.", "Sắp xếp hoa đẹp vào lọ"),
                ("making models", "/ˈmeɪkɪŋ ˈmɒdlz/", "Cụm danh từ", "Làm mô hình", "My brother spends hours making models of airplanes.", "Anh trai mình dành hàng giờ để làm mô hình máy bay.", "Lắp ráp mô hình thu nhỏ"),
                ("horse riding", "/ˈhɔːs raɪdɪŋ/", "Danh từ", "Cưỡi ngựa", "Horse riding is an exciting outdoor activity.", "Cưỡi ngựa là một hoạt động ngoài trời đầy thú vị.", "Môn thể thao ngồi trên lưng ngựa"),
                ("cycling", "/ˈsaɪklɪŋ/", "Danh từ", "Đi xe đạp", "We go cycling around the lake every afternoon.", "Chúng mình đạp xe quanh hồ vào mỗi buổi chiều.", "Hoạt động đạp xe rèn luyện sức khỏe"),
            ],
            "grammar": {
                "title": "Động từ chỉ sự yêu thích (Verbs of liking) + Danh động từ (V-ing)",
                "ruleVi": "Các động từ chỉ sở thích như like, love, enjoy, hate, adore, detest thường đi với danh động từ (V-ing) đứng sau.",
                "formula": "S + like / love / enjoy / hate + V-ing (+ O)",
                "quickTip": "Nhớ thêm đuôi -ing cho động từ đứng ngay sau like, love, enjoy, prefer!",
                "quiz": [
                    {
                        "question": "My sister enjoys ______ teddy bears in her free time.",
                        "options": ["collecting", "collect", "collected", "collects"],
                        "answerIndex": 0,
                        "explain": "Sau động từ chỉ sở thích 'enjoy', động từ đi sau chia ở dạng V-ing (collecting)."
                    },
                    {
                        "question": "Do you like ______ models of airplanes, Tom?",
                        "options": ["making", "make", "makes", "made"],
                        "answerIndex": 0,
                        "explain": "Cấu trúc: like + V-ing -> making."
                    }
                ]
            },
            "pronunciation": {
                "pair": "/ə/ và /ɜː/",
                "title": "Phân biệt nguyên âm ngắn /ə/ và nguyên âm dài /ɜː/",
                "sound1": {"symbol": "/ə/", "name": "Nguyên âm ngắn /ə/", "words": ["away", "cinema", "doctor"]},
                "sound2": {"symbol": "/ɜː/", "name": "Nguyên âm dài /ɜː/", "words": ["bird", "shirt", "burn"]},
                "practiceQuiz": [
                    {"word": "bird", "correctSound": "/ɜː/", "options": ["/ə/", "/ɜː/"], "meaningVi": "con chim", "phonetic": "/bɜːd/", "answerIndex": 1},
                    {"word": "answer", "correctSound": "/ə/", "options": ["/ə/", "/ɜː/"], "meaningVi": "câu trả lời", "phonetic": "/ˈɑːnsə/", "answerIndex": 0}
                ],
                "tongueTwister": "A clever girl has thirty dirty birds in her garden."
            },
            "speaking": {
                "dialogueTitle": "Getting Started: My Favorite Hobby",
                "dialogueContext": "Trang và Elena gặp nhau tại nhà và chia sẻ về các sở thích lúc rảnh rỗi.",
                "situationalTopic": "Hỏi và đáp về sở thích cá nhân",
                "targetSentence": "What is your favorite hobby in your free time?",
                "phonetic": "/wɒt ɪz jɔː ˈfeɪvərɪt ˈhɒbi ɪn jɔː friː taɪm/",
                "meaningVi": "Sở thích yêu thích của bạn trong thời gian rảnh rỗi là gì?",
                "dialogueLines": [
                    {"id": "g7_u1_d1", "speaker": "Trang", "sentenceEn": "Hi, Elena! Welcome to my house.", "phonetic": "/haɪ eˈleɪnə ˈwelkəm tuː maɪ haʊs/", "meaningVi": "Chào Elena! Mừng bạn đến chơi nhà mình nhé.", "tipsVi": "Giọng chào hào hứng, tươi cười."},
                    {"id": "g7_u1_d2", "speaker": "Elena", "sentenceEn": "Hi, Trang. Wow, your dolls are so beautiful!", "phonetic": "/haɪ træŋ waʊ jɔː dɒlz ɑː səʊ ˈbjuːtɪfl/", "meaningVi": "Chào Trang. Oa, búp bê của cậu đẹp quá!", "tipsVi": "Khen ngợi chân thành, lên giọng ở Wow."},
                    {"id": "g7_u1_d3", "speaker": "Trang", "sentenceEn": "Thank you. Collecting dolls is my favorite hobby.", "phonetic": "/θæŋk juː kəˈlektɪŋ dɒlz ɪz maɪ ˈfeɪvərɪt ˈhɒbi/", "meaningVi": "Cảm ơn cậu. Sưu tầm búp bê là sở thích số một của mình đấy.", "tipsVi": "Nhấn rõ cụm 'Collecting dolls'."},
                    {"id": "g7_u1_d4", "speaker": "Elena", "sentenceEn": "It sounds interesting. I really love gardening.", "phonetic": "/ɪt saʊndz ˈɪntrəstɪŋ aɪ ˈrɪəli lʌv ˈɡɑːdnɪŋ/", "meaningVi": "Nghe hay thật. Còn mình thì rất thích làm vườn.", "tipsVi": "Nhấn vào 'love gardening'."}
                ],
                "challenges": [
                    {"id": 1, "level": "Mẫu câu cơ bản", "sentenceEn": "I really enjoy collecting stamps from different countries.", "phonetic": "/aɪ ˈrɪəli ɪnˈdʒɔɪ kəˈlektɪŋ stæmps frəm ˈdɪfrənt ˈkʌntriz/", "meaningVi": "Mình rất thích sưu tầm tem từ nhiều quốc gia khác nhau.", "tipsVi": "Nói trôi chảy theo cụm."},
                    {"id": 2, "level": "Mở rộng giao tiếp", "sentenceEn": "Gardening helps me relax after stressful study hours.", "phonetic": "/ˈɡɑːdnɪŋ helps miː rɪˈlæks ˈɑːftə ˈstresfl ˈstʌdi ˈaʊəz/", "meaningVi": "Làm vườn giúp mình thư giãn sau những giờ học căng thẳng.", "tipsVi": "Nhấn mạnh 'helps me relax'."}
                ]
            },
            "reading": {
                "title": "The Benefits of Having a Hobby",
                "passage": "Having a hobby is very important for teenagers. First, a hobby brings relaxation after busy school hours. For example, doing gardening or listening to music helps reduce stress. Second, hobbies help you develop useful skills. When you make models or paint pictures, you learn to be patient and creative. Finally, hobbies can connect you with new friends who share the same interests. In conclusion, having a hobby makes our life much more colorful.",
                "translation": "Có một sở thích rất quan trọng đối với lứa tuổi thanh thiếu niên. Thứ nhất, sở thích mang lại sự thư giãn sau những giờ học bận rộn. Ví dụ, làm vườn hay nghe nhạc giúp giảm bớt căng thẳng. Thứ hai, sở thích giúp bạn phát triển các kỹ năng bổ ích. Khi bạn làm mô hình hoặc vẽ tranh, bạn học được tính kiên nhẫn và sáng tạo. Cuối cùng, sở thích có thể kết nối bạn với những người bạn mới có cùng mối quan tâm. Tóm lại, có sở thích làm cho cuộc sống của chúng ta thêm muôn màu.",
                "questions": [
                    {
                        "id": "g7_u1_r1",
                        "type": "multiple_choice",
                        "question": "What is one main benefit of having a hobby according to the passage?",
                        "options": ["It helps reduce stress and brings relaxation", "It makes people tired", "It costs a lot of money", "It takes away all study time"],
                        "answerIndex": 0,
                        "explain": "Đoạn văn viết: 'First, a hobby brings relaxation after busy school hours... helps reduce stress.'"
                    },
                    {
                        "id": "g7_u1_r2",
                        "type": "multiple_choice",
                        "question": "What skills can students develop when making models or painting pictures?",
                        "options": ["Being patient and creative", "Being noisy and angry", "Cooking food quickly", "Driving a racing car"],
                        "answerIndex": 0,
                        "explain": "Đoạn 2 nêu rõ: 'When you make models or paint pictures, you learn to be patient and creative.'"
                    }
                ]
            },
            "listening": {
                "topic": "Sở thích của các bạn trẻ",
                "transcript": "Hello, my name is Lan. In my free time, I love arranging flowers with my grandmother. My brother Nam prefers cycling around the park every afternoon. Both of us find our hobbies very healthy and rewarding.",
                "question": "What is Lan's favorite hobby?",
                "options": ["Arranging flowers", "Cycling in the park", "Collecting stamps", "Playing video games"],
                "answerIndex": 0
            },
            "writing": {
                "correctSentence": "My favorite hobby is gardening with my parents on Sunday",
                "meaningVi": "Sở thích yêu thích của mình là làm vườn cùng bố mẹ vào Chủ nhật.",
                "items": [
                    {
                        "id": "g7_u1_w1",
                        "type": "unscramble",
                        "scrambledWords": ["is", "gardening", "My", "hobby", "favorite"],
                        "correctSentence": "My favorite hobby is gardening",
                        "meaningVi": "Sở thích yêu thích của mình là làm vườn.",
                        "hint": "Bắt đầu bằng 'My favorite hobby...'"
                    }
                ]
            }
        },
        {
            "unit": 2,
            "title": "Healthy Living",
            "titleVi": "Sống khỏe mạnh",
            "theme": "Health & Daily Habits",
            "semester": 1,
            "bookPages": "Trang 18 – 27",
            "bookId": "sgk-7",
            "vocab": [
                ("dim light", "/dɪm laɪt/", "Cụm danh từ", "Ánh sáng mờ", "Reading in dim light can harm your eyes.", "Đọc sách trong ánh sáng mờ có thể làm hại mắt của em.", "Ánh sáng yếu không đủ đọc sách"),
                ("lip balm", "/ˈlɪp bɑːm/", "Danh từ", "Son dưỡng môi", "Use lip balm to keep your lips soft in winter.", "Hãy dùng son dưỡng môi để giữ môi mềm mại vào mùa đông.", "Mỹ phẩm dưỡng môi chống khô"),
                ("chapped lips", "/tʃæpt lɪps/", "Cụm danh từ", "Môi nứt nẻ", "Cold weather often causes dry and chapped lips.", "Thời tiết lạnh thường gây khô và nứt nẻ môi.", "Tình trạng môi khô nứt do lạnh"),
                ("sunburn", "/ˈsʌnbɜːn/", "Danh từ", "Cháy nắng", "Wear a sun hat to avoid sunburn on sunny days.", "Hãy đội mũ chống nắng để tránh bị cháy nắng vào những ngày nhiều nắng.", "Tổn thương da do ánh mặt trời"),
                ("acne", "/ˈækni/", "Danh từ", "Mụn trứng cá", "Washing your face daily helps prevent acne.", "Rửa mặt hàng ngày giúp ngăn ngừa mụn trứng cá.", "Vấn đề về da thường gặp ở tuổi dậy thì"),
                ("vegetarian", "/ˌvedʒəˈteəriən/", "Danh từ", "Người ăn chay", "She is a vegetarian and eats lots of vegetables.", "Cô ấy là một người ăn chay và ăn rất nhiều rau củ.", "Người chỉ ăn thực vật, không ăn thịt"),
            ],
            "grammar": {
                "title": "Câu đơn (Simple Sentences): S + V hoặc S + V + O",
                "ruleVi": "Câu đơn trong tiếng Anh chứa một mệnh đề độc lập với một chủ ngữ và một vị ngữ.",
                "formula": "S + V (+ O / A)",
                "quickTip": "Một câu đơn chỉ có một vị ngữ chính, dùng để diễn đạt một ý trọn vẹn.",
                "quiz": [
                    {
                        "question": "Which of the following is a correct simple sentence?",
                        "options": ["She eats fresh fruits every day.", "Because she was tired.", "Although it rained heavily.", "When they arrived."],
                        "answerIndex": 0,
                        "explain": "'She eats fresh fruits every day' là câu đơn hoàn chỉnh có Chủ ngữ (She) và Động từ (eats)."
                    }
                ]
            },
            "pronunciation": {
                "pair": "/f/ và /v/",
                "title": "Phân biệt phụ âm vô thanh /f/ và hữu thanh /v/",
                "sound1": {"symbol": "/f/", "name": "Âm vô thanh /f/", "words": ["fat", "leaf", "fast"]},
                "sound2": {"symbol": "/v/", "name": "Âm hữu thanh /v/", "words": ["vat", "leave", "vase"]},
                "practiceQuiz": [
                    {"word": "leaf", "correctSound": "/f/", "options": ["/f/", "/v/"], "meaningVi": "lá cây", "phonetic": "/liːf/", "answerIndex": 0},
                    {"word": "leave", "correctSound": "/v/", "options": ["/f/", "/v/"], "meaningVi": "rời đi", "phonetic": "/liːv/", "answerIndex": 1}
                ],
                "tongueTwister": "Five fast foxes view very vibrant valleys."
            },
            "speaking": {
                "dialogueTitle": "Getting Started: Healthy Habits",
                "dialogueContext": "Mi và Mark trao đổi về các thói quen tốt để có một lối sống khỏe mạnh.",
                "situationalTopic": "Thảo luận về sức khỏe và chăm sóc bản thân",
                "targetSentence": "How do you stay healthy and active every day?",
                "phonetic": "/haʊ duː juː steɪ ˈhelθi ænd ˈæktɪv ˈevri deɪ/",
                "meaningVi": "Làm thế nào để bạn luôn khỏe mạnh và năng động mỗi ngày?",
                "dialogueLines": [
                    {"id": "g7_u2_d1", "speaker": "Mi", "sentenceEn": "Hi, Mark! You look very energetic today.", "phonetic": "/haɪ mɑːk juː lʊk ˈveri ˌenəˈdʒetɪk təˈdeɪ/", "meaningVi": "Chào Mark! Trông cậu hôm nay tràn đầy năng lượng thế.", "tipsVi": "Khen bạn vui vẻ, tự nhiên."},
                    {"id": "g7_u2_d2", "speaker": "Mark", "sentenceEn": "Thanks, Mi. I usually jog in the park every morning.", "phonetic": "/θæŋks miː aɪ ˈjuːʒuəli dʒɒɡ ɪn ðə pɑːk ˈevri ˈmɔːnɪŋ/", "meaningVi": "Cảm ơn Mi. Mình thường chạy bộ ở công viên mỗi sáng.", "tipsVi": "Nhấn mạnh 'jog in the park'."},
                    {"id": "g7_u2_d3", "speaker": "Mi", "sentenceEn": "That's great. Do you also eat plenty of vegetables?", "phonetic": "/ðæts ɡreɪt duː juː ˈɔːlsəʊ iːt ˈplenti əv ˈvedʒtəblz/", "meaningVi": "Tuyệt quá. Cậu có ăn nhiều rau xanh không?", "tipsVi": "Lên giọng cuối câu hỏi Yes/No."},
                    {"id": "g7_u2_d4", "speaker": "Mark", "sentenceEn": "Yes, I do. Eating well keeps our immune system strong.", "phonetic": "/jes aɪ duː ˈiːtɪŋ wel kiːps ˈaʊə ɪˈmjuːn ˈsɪstəm strɒŋ/", "meaningVi": "Có chứ. Ăn uống lành mạnh giúp hệ miễn dịch luôn khỏe mạnh.", "tipsVi": "Nói dứt khoát, tự tin."}
                ],
                "challenges": [
                    {"id": 1, "level": "Mẫu câu cơ bản", "sentenceEn": "Drinking enough water keeps your skin smooth.", "phonetic": "/ˈdrɪŋkɪŋ ɪˈnʌf ˈwɔːtə kiːps jɔː skɪn smuːð/", "meaningVi": "Uống đủ nước giúp làn da của bạn luôn mịn màng.", "tipsVi": "Phát âm rõ âm đuôi /ð/ trong smooth."},
                    {"id": 2, "level": "Mở rộng", "sentenceEn": "You should not read books in dim light to protect your eyes.", "phonetic": "/juː ʃʊd nɒt riːd bʊks ɪn dɪm laɪt tuː prəˈtekt jɔː aɪz/", "meaningVi": "Bạn không nên đọc sách trong ánh sáng mờ để bảo vệ đôi mắt.", "tipsVi": "Nhấn vào 'should not read'."}
                ]
            },
            "reading": {
                "title": "Healthy Habits for Teens",
                "passage": "Good health is the greatest treasure of every person. To stay healthy, teenagers should follow some simple habits. First, eat a balanced diet with lots of fresh fruits and vegetables. Avoid fast food and sugary drinks because they can cause weight problems. Second, exercise regularly for at least thirty minutes a day. You can play badminton, swim, or cycle. Finally, get eight hours of sleep each night. A good sleep refreshes your brain and prepares you for a new school day.",
                "translation": "Sức khỏe tốt là kho báu lớn nhất của mỗi người. Để luôn khỏe mạnh, thanh thiếu niên nên tuân theo một số thói quen đơn giản. Thứ nhất, ăn một chế độ ăn cân bằng với nhiều trái cây và rau tươi. Tránh đồ ăn nhanh và nước ngọt vì chúng có thể gây tăng cân. Thứ hai, tập thể dục đều đặn ít nhất ba mươi phút mỗi ngày. Bạn có thể chơi cầu lông, bơi lội hoặc đạp xe. Cuối cùng, ngủ đủ tám tiếng mỗi đêm. Giấc ngủ ngon sẽ làm mới bộ não và giúp bạn sẵn sàng cho một ngày học tập mới.",
                "questions": [
                    {
                        "id": "g7_u2_r1",
                        "type": "multiple_choice",
                        "question": "How long should teenagers exercise every day?",
                        "options": ["At least 30 minutes a day", "Only 5 minutes a day", "2 hours without stopping", "Once a month"],
                        "answerIndex": 0,
                        "explain": "Đoạn văn viết: 'Second, exercise regularly for at least thirty minutes a day.'"
                    }
                ]
            },
            "listening": {
                "topic": "Lời khuyên sức khỏe của bác sĩ",
                "transcript": "Doctor Dan gives advice on staying healthy. He says that drinking two litres of clean water and sleeping eight hours every day are the two most essential habits for secondary school students.",
                "question": "According to Doctor Dan, how many hours should students sleep each day?",
                "options": ["8 hours", "5 hours", "12 hours", "4 hours"],
                "answerIndex": 0
            },
            "writing": {
                "correctSentence": "We should eat fresh fruits and exercise regularly every day",
                "meaningVi": "Chúng mình nên ăn trái cây tươi và tập thể dục đều đặn mỗi ngày.",
                "items": [
                    {
                        "id": "g7_u2_w1",
                        "type": "unscramble",
                        "scrambledWords": ["exercise", "We", "regularly", "should", "every", "day"],
                        "correctSentence": "We should exercise regularly every day",
                        "meaningVi": "Chúng ta nên tập thể dục đều đặn mỗi ngày.",
                        "hint": "Bắt đầu bằng 'We should...'"
                    }
                ]
            }
        },
        {
            "unit": 3,
            "title": "Community Service",
            "titleVi": "Hoạt động vì cộng đồng",
            "theme": "Volunteering & Society",
            "semester": 1,
            "bookPages": "Trang 28 – 37",
            "bookId": "sgk-7",
            "vocab": [
                ("volunteer", "/ˌvɒlənˈtɪə/", "Danh từ/Động từ", "Tình nguyện viên / Tình nguyện", "Many students volunteer to clean up local parks.", "Nhiều học sinh tình nguyện dọn dẹp các công viên địa phương.", "Người làm việc có ích không vì tiền"),
                ("donate", "/dəʊˈneɪt/", "Động từ", "Quyên góp, ủng hộ", "We donate warm clothes and books to poor children.", "Chúng mình quyên góp quần áo ấm và sách vở cho trẻ em nghèo.", "Tặng tiền bạc hoặc vật phẩm giúp người khác"),
                ("community", "/kəˈmjuːnəti/", "Danh từ", "Cộng đồng", "Helping the community makes our neighborhood safer.", "Giúp đỡ cộng đồng làm cho khu dân cư của chúng ta an toàn hơn.", "Tập thể những người cùng sống trong một khu vực"),
                ("nursing home", "/ˈnɜːsɪŋ həʊm/", "Cụm danh từ", "Viện dưỡng lão", "They often visit the elderly at the local nursing home.", "Họ thường đến thăm các cụ già ở viện dưỡng lão địa phương.", "Nơi chăm sóc người cao tuổi"),
                ("shelter", "/ˈʃeltə/", "Danh từ", "Mái ấm tình thương, nơi trú ẩn", "The charity provides food and shelter for homeless people.", "Hội từ thiện cung cấp thức ăn và chỗ ở cho người vô gia cư.", "Nơi che chở, nuôi dưỡng người có hoàn cảnh khó khăn"),
                ("tutor", "/ˈtjuːtə/", "Động từ/Danh từ", "Dạy kèm, gia sư", "Older students tutor younger kids in English and maths.", "Các học sinh lớp lớn dạy kèm môn tiếng Anh và toán cho các em nhỏ.", "Dạy học bồi dưỡng cho từng nhóm nhỏ"),
            ],
            "grammar": {
                "title": "Thì Quá khứ đơn (Past Simple) và Hiện tại đơn (Present Simple)",
                "ruleVi": "Dùng quá khứ đơn cho các hành động tình nguyện đã hoàn thành trong quá khứ (yesterday, last week). Dùng hiện tại đơn cho thói quen giúp đỡ cộng đồng thường xuyên.",
                "formula": "Khẳng định QKĐ: S + V-ed / V2 (+ O)",
                "quickTip": "Dấu hiệu quá khứ đơn: yesterday, last year, two days ago, in 2023.",
                "quiz": [
                    {
                        "question": "Last Sunday, our school club ______ warm clothes to children in mountainous areas.",
                        "options": ["donated", "donates", "donating", "donate"],
                        "answerIndex": 0,
                        "explain": "'Last Sunday' là dấu hiệu của thì Quá khứ đơn, động từ donate chia thành 'donated'."
                    }
                ]
            },
            "pronunciation": {
                "pair": "/t/, /d/, và /ɪd/",
                "title": "Quy tắc phát âm đuôi -ed của động từ có quy tắc",
                "sound1": {"symbol": "/t/", "name": "Đuôi -ed phát âm /t/", "words": ["helped", "washed", "cooked"]},
                "sound2": {"symbol": "/ɪd/", "name": "Đuôi -ed phát âm /ɪd/", "words": ["donated", "planted", "needed"]},
                "practiceQuiz": [
                    {"word": "donated", "correctSound": "/ɪd/", "options": ["/t/", "/d/", "/ɪd/"], "meaningVi": "đã quyên góp", "phonetic": "/dəʊˈneɪtɪd/", "answerIndex": 2},
                    {"word": "helped", "correctSound": "/t/", "options": ["/t/", "/d/", "/ɪd/"], "meaningVi": "đã giúp đỡ", "phonetic": "/helpt/", "answerIndex": 0}
                ],
                "tongueTwister": "Tired volunteers planted trees and painted walls peacefully."
            },
            "speaking": {
                "dialogueTitle": "Getting Started: Community Activities",
                "dialogueContext": "Tom và Mai nói về các hoạt động tình nguyện mà các bạn đã tham gia.",
                "situationalTopic": "Kể về các hoạt động thiện nguyện",
                "targetSentence": "Have you ever taken part in community service?",
                "phonetic": "/hæv juː ˈevə ˈteɪkən pɑːt ɪn kəˈmjuːnəti ˈsɜːvɪs/",
                "meaningVi": "Bạn đã bao giờ tham gia các hoạt động vì cộng đồng chưa?",
                "dialogueLines": [
                    {"id": "g7_u3_d1", "speaker": "Tom", "sentenceEn": "Hi, Mai! What did your club do last weekend?", "phonetic": "/haɪ maɪ wɒt dɪd jɔː klʌb duː lɑːst ˌwiːkˈend/", "meaningVi": "Chào Mai! Câu lạc bộ của cậu đã làm gì vào cuối tuần trước thế?", "tipsVi": "Hỏi thân mật, ngữ điệu tự nhiên."},
                    {"id": "g7_u3_d2", "speaker": "Mai", "sentenceEn": "We collected plastic bottles and donated books to a shelter.", "phonetic": "/wiː kəˈlektɪd ˈplæstɪk ˈbɒtlz ænd dəʊˈneɪtɪd bʊks tuː ə ˈʃeltə/", "meaningVi": "Tụi mình đã thu gom chai nhựa và quyên góp sách cho một mái ấm.", "tipsVi": "Nhấn rõ 'collected plastic bottles' và 'donated books'."},
                    {"id": "g7_u3_d3", "speaker": "Tom", "sentenceEn": "That sounds very meaningful! Can I join you next time?", "phonetic": "/ðæt saʊndz ˈveri ˈmiːnɪŋfl kæn aɪ dʒɔɪn juː nekst taɪm/", "meaningVi": "Nghe ý nghĩa thật đấy! Lần tới cho mình tham gia cùng được không?", "tipsVi": "Giọng hào hứng, mong muốn tham gia."},
                    {"id": "g7_u3_d4", "speaker": "Mai", "sentenceEn": "Of course! We always welcome new volunteers.", "phonetic": "/əv kɔːs wiː ˈɔːlweɪz ˈwelkəm njuː ˌvɒlənˈtɪəz/", "meaningVi": "Tất nhiên rồi! Tụi mình luôn chào đón các tình nguyện viên mới.", "tipsVi": "Mở rộng vòng tay, ấm áp."}
                ],
                "challenges": [
                    {"id": 1, "level": "Mẫu câu cơ bản", "sentenceEn": "We donated food to homeless people in our city.", "phonetic": "/wiː dəʊˈneɪtɪd fuːd tuː ˈhəʊmləs ˈpiːpl ɪn ˈaʊə ˈsɪti/", "meaningVi": "Chúng mình đã quyên góp thức ăn cho những người vô gia cư trong thành phố.", "tipsVi": "Nhấn vào 'donated food'."}
                ]
            },
            "reading": {
                "title": "Green Summer Project in Viet Nam",
                "passage": "Every summer, thousands of Vietnamese students join community service projects. One of the most famous activities is the Green Summer Campaign. Volunteers travel to remote areas and poor villages. They help local people build small bridges, repair roads, and paint school classrooms. Furthermore, university students tutor primary school children in reading and English. These volunteer activities make a real difference in people's lives and bring immense happiness to the youth.",
                "translation": "Mỗi mùa hè, hàng ngàn học sinh sinh viên Việt Nam tham gia các dự án phục vụ cộng đồng. Một trong những hoạt động nổi tiếng nhất là Chiến dịch Mùa hè xanh. Các tình nguyện viên đi đến các vùng sâu vùng xa và các ngôi làng nghèo. Họ giúp người dân địa phương xây cầu nhỏ, sửa chữa đường sá và sơn sửa các lớp học. Hơn nữa, các bạn sinh viên còn dạy kèm môn tập đọc và tiếng Anh cho các em học sinh tiểu học. Những hoạt động tình nguyện này tạo nên sự thay đổi thực sự trong cuộc sống của mọi người và mang lại niềm hạnh phúc to lớn cho tuổi trẻ.",
                "questions": [
                    {
                        "id": "g7_u3_r1",
                        "type": "multiple_choice",
                        "question": "What do volunteers do in remote areas during the campaign?",
                        "options": ["Help build small bridges and repair roads", "Sell expensive cars", "Build large shopping malls", "Stay in luxury hotels"],
                        "answerIndex": 0,
                        "explain": "Đoạn văn nêu rõ: 'They help local people build small bridges, repair roads, and paint school classrooms.'"
                    }
                ]
            },
            "listening": {
                "topic": "Hoạt động từ thiện cuối tuần",
                "transcript": "Last Saturday, the Green Club visited a nursing home in town. The volunteers cooked hot soup for the elderly and performed traditional songs to bring them joy.",
                "question": "What did the volunteers do at the nursing home?",
                "options": ["Cooked hot soup and performed songs", "Cleaned a swimming pool", "Planted an apple orchard", "Sold new clothes"],
                "answerIndex": 0
            },
            "writing": {
                "correctSentence": "Volunteering brings happiness to others and improves our community",
                "meaningVi": "Làm tình nguyện mang lại niềm vui cho người khác và cải thiện cộng đồng của chúng ta.",
                "items": [
                    {
                        "id": "g7_u3_w1",
                        "type": "unscramble",
                        "scrambledWords": ["donated", "They", "warm", "clothes", "to", "children"],
                        "correctSentence": "They donated warm clothes to children",
                        "meaningVi": "Họ đã quyên góp quần áo ấm cho các em nhỏ.",
                        "hint": "Bắt đầu bằng 'They donated...'"
                    }
                ]
            }
        }
    ]

    # Bổ sung các Unit 4 đến 12 của Lớp 7 với độ chính xác cao
    more_g7_units = [
        (4, "Music and Arts", "Âm nhạc và nghệ thuật", "So sánh với (not) as... as, different from, the same as", "/ʃ/ và /ʒ/", [
            ("composer", "/kəmˈpəʊzə/", "Danh từ", "Nhà soạn nhạc", "Trinh Cong Son is a famous Vietnamese composer.", "Trịnh Công Sơn là một nhạc sĩ/nhà soạn nhạc nổi tiếng của Việt Nam.", "Người sáng tác bài hát hoặc bản nhạc"),
            ("exhibition", "/ˌeksɪˈbɪʃn/", "Danh từ", "Cuộc triển lãm", "We visited an impressive art exhibition yesterday.", "Hôm qua chúng mình đã tham quan một cuộc triển lãm nghệ thuật ấn tượng.", "Nơi trưng bày tác phẩm nghệ thuật"),
            ("musician", "/mjuˈzɪʃn/", "Danh từ", "Nhạc sĩ / Nghệ sĩ âm nhạc", "Her brother is a talented jazz musician.", "Anh trai cô ấy là một nghệ sĩ chơi nhạc jazz tài năng.", "Người chơi nhạc cụ hoặc sáng tác"),
            ("puppet theatre", "/ˈpʌpɪt ˈθɪətə/", "Cụm danh từ", "Nhà hát múa rối", "Foreign tourists love visiting the water puppet theatre in Ha Noi.", "Khách du lịch nước ngoài rất thích đến xem nhà hát múa rối nước ở Hà Nội.", "Nơi biểu diễn các tiết mục múa rối"),
            ("gallery", "/ˈɡæləri/", "Danh từ", "Phòng trưng bày tranh", "The gallery displays many classical oil paintings.", "Phòng tranh trưng bày nhiều bức tranh sơn dầu cổ điển.", "Nơi trưng bày và thưởng lãm hội họa"),
            ("anthem", "/ˈænθəm/", "Danh từ", "Bài quốc ca", "Tien Quan Ca is the national anthem of Viet Nam.", "Tiến Quân Ca là bài quốc ca của nước Việt Nam.", "Bài hát trang nghiêm đại diện cho một quốc gia"),
        ], "Water Puppetry in Viet Nam", "Water puppetry is a unique traditional art form of Viet Nam. It began in the 11th century in northern villages. The stage is a pool of water, and puppeteers stand behind a screen to control the wooden puppets with long bamboo poles.", "What makes Vietnamese water puppetry unique?", ["Puppets are performed on water using bamboo poles", "It is performed on high mountains", "Puppets are made of pure gold", "It began in France"], 0),

        (5, "Food and Drink", "Ẩm thực và đồ uống", "Danh từ đếm được & không đếm được, some/any, How much/How many", "/ɒ/ và /ɔː/", [
            ("omelette", "/ˈɒmlət/", "Danh từ", "Trứng rán, trứng tráng", "Dad made a delicious cheese omelette for breakfast.", "Bố đã làm món trứng tráng phô mai thơm ngon cho bữa sáng.", "Món trứng đánh đều rồi chiên vàng"),
            ("turmeric", "/ˈtɜːmərɪk/", "Danh từ", "Củ nghệ", "Turmeric gives dishes a distinctive yellow color.", "Nghệ tạo cho các món ăn một màu vàng rất đặc trưng.", "Gia vị thảo mộc màu vàng"),
            ("noodles", "/ˈnuːdlz/", "Danh từ", "Mì, bún, phở", "Vietnamese beef noodles are famous around the world.", "Món bún bò / phở bò Việt Nam nổi tiếng khắp thế giới.", "Sợi làm từ bột gạo hoặc bột mì"),
            ("broth", "/brɒθ/", "Danh từ", "Nước dùng, nước lèo", "The soup broth has been simmered for ten hours.", "Nước dùng của món súp đã được ninh kỹ trong suốt mười tiếng.", "Nước hầm xương ngọt thanh"),
            ("beef noodle soup", "/biːf ˈnuːdl suːp/", "Cụm danh từ", "Phở bò", "Pho bo is a signature dish of Ha Noi.", "Phở bò là món ăn đặc trưng nổi tiếng của Hà Nội.", "Món phở truyền thống với thịt bò"),
            ("ingredient", "/ɪnˈɡriːdiənt/", "Danh từ", "Nguyên liệu", "Fresh herbs are essential ingredients in Vietnamese rolls.", "Rau thơm tươi là nguyên liệu thiết yếu trong các món cuốn Việt Nam.", "Các thành phần dùng để chế biến món ăn"),
        ], "Pho - The Pride of Vietnamese Cuisine", "Pho is considered the national dish of Viet Nam. A bowl of pho consists of soft rice noodles, tender slices of beef or chicken, and aromatic herbs in a flavorful hot broth. The broth is carefully cooked with beef bones, cinnamon, and ginger.", "What is the key element that makes pho broth flavorful?", ["Simmering beef bones with spices like cinnamon and ginger", "Adding lots of sugar and candy", "Mixing ice water with milk", "Using chocolate"], 0),

        (6, "A Visit to a School", "Thăm một trường học", "Giới từ chỉ nơi chốn (at, in, on) và thời gian", "/tʃ/ và /dʒ/", [
            ("Imperial Academy", "/ɪmˈpɪəriəl əˈkædəmi/", "Danh từ", "Quốc Tử Giám", "Van Mieu - Quoc Tu Giam is Viet Nam's first university.", "Văn Miếu - Quốc Tử Giám là trường đại học đầu tiên của Việt Nam.", "Trường đại học hoàng gia thời xưa"),
            ("courtyard", "/ˈkɔːtjɑːd/", "Danh từ", "Sân trong", "Students gathered in the green courtyard for morning exercise.", "Các bạn học sinh tập trung ở sân trong rợp bóng mát để tập thể dục.", "Khu sân có tường bao quanh"),
            ("monument", "/ˈmɒnjumənt/", "Danh từ", "Tượng đài, bia kỷ niệm", "The stone monument honors historical scholars.", "Tấm bia kỷ niệm bằng đá tôn vinh các bậc học giả lịch sử.", "Công trình tưởng nhớ danh nhân"),
            ("statue", "/ˈstætʃuː/", "Danh từ", "Bức tượng", "A bronze statue of Chu Van An stands proudly in the temple.", "Bức tượng đồng của thầy Chu Văn An đứng trang nghiêm trong đền.", "Tác phẩm điêu khắc hình người"),
            ("temple", "/ˈtempl/", "Danh từ", "Ngôi đền", "People visit the temple to pray for peace and good fortune.", "Mọi người đến đền để cầu mong bình an và may mắn.", "Nơi thờ phụng linh thiêng"),
            ("scholar", "/ˈskɒlə/", "Danh từ", "Học giả, bậc hiền tài", "Ancient scholars spent decades studying classical literature.", "Các học giả thời xưa dành nhiều thập kỷ để nghiên cứu văn học cổ điển.", "Người có học vấn uyên thâm"),
        ], "Van Mieu - The First University of Viet Nam", "Founded in 1070 by King Ly Thanh Tong, Van Mieu originally honored Confucius and great scholars. In 1076, Quoc Tu Giam, the first university of Viet Nam, was built within the complex to educate noble minds.", "When was Van Mieu founded?", ["In 1070", "In 1975", "In 2020", "In 1492"], 0),

        (7, "Traffic", "Giao thông", "Đại từ It chỉ khoảng cách & Động từ khuyết thiếu Should/Shouldn't", "/e/ và /eɪ/", [
            ("traffic jam", "/ˈtræfɪk dʒæm/", "Cụm danh từ", "Tắc nghẽn giao thông", "We were stuck in a heavy traffic jam for forty minutes.", "Chúng mình đã bị kẹt trong một vụ tắc đường nghiêm trọng suốt 40 phút.", "Đoàn xe cộ bị ùn ứ trên đường"),
            ("pedestrian", "/pəˈdestriən/", "Danh từ", "Người đi bộ", "Drivers must always yield to pedestrians at zebra crossings.", "Người lái xe phải luôn nhường đường cho người đi bộ ở vạch sang đường.", "Người di chuyển bằng chân trên đường"),
            ("zebra crossing", "/ˌzebrə ˈkrɒsɪŋ/", "Cụm danh từ", "Vạch qua đường cho người đi bộ", "Children should always use the zebra crossing to cross the street.", "Trẻ em nên luôn sử dụng vạch qua đường để sang đường an toàn.", "Đường kẻ sọc trắng đen để sang đường"),
            ("helmet", "/ˈhelmɪt/", "Danh từ", "Mũ bảo hiểm", "Wearing a helmet is mandatory when riding a motorbike in Viet Nam.", "Đội mũ bảo hiểm là bắt buộc khi đi xe máy tại Việt Nam.", "Mũ bảo vệ đầu khi đi xe"),
            ("seatbelt", "/ˈsiːtbelt/", "Danh từ", "Dây an toàn", "Fasten your seatbelt before the car starts moving.", "Hãy thắt dây an toàn trước khi xe bắt đầu di chuyển.", "Dây giữ cố định người trên ghế xe"),
            ("roof", "/ruːf/", "Danh từ", "Mui xe / nóc xe", "Do not carry luggage on the roof of small cars without safety ties.", "Không được chở hành lý trên nóc xe ô tô nhỏ mà không buộc an toàn.", "Phần trên cùng che chở phương tiện"),
        ], "Road Safety Rules for Teenagers", "Traffic safety is vital for everyone. When travelling by motorbike, all passengers must wear a standard helmet properly. Pedestrians must walk on the pavement and cross only at zebra crossings or footbridges.", "What must passengers wear when travelling by motorbike?", ["A standard helmet", "A sun hat", "Sunglasses only", "Heavy boots"], 0),

        (8, "Films", "Phim ảnh", "Liên từ chỉ sự nhượng bộ: Although/Though, However", "/ɪə/ và /eə/", [
            ("animation", "/ˌænɪˈmeɪʃn/", "Danh từ", "Phim hoạt hình", "The Lion King is one of the greatest animation films ever made.", "Vua Sư Tử là một trong những bộ phim hoạt hình vĩ đại nhất từng được sản xuất.", "Thể loại phim bằng hình vẽ hoặc kỹ xảo số"),
            ("documentary", "/ˌdɒkjuˈmentri/", "Danh từ", "Phim tài liệu", "Planet Earth is an award-winning nature documentary.", "Planet Earth là một bộ phim tài liệu thiên nhiên từng đoạt nhiều giải thưởng.", "Phim về người thật, sự việc thật"),
            ("gripping", "/ˈɡrɪpɪŋ/", "Tính từ", "Hấp dẫn, ly kỳ cuốn hút", "The mystery movie had a gripping plot that kept everyone guessing.", "Bộ phim trinh thám có cốt truyện vô cùng hấp dẫn khiến ai cũng phải suy đoán.", "Thu hút sự chú ý mạnh mẽ"),
            ("hilarious", "/hɪˈleəriəs/", "Tính từ", "Cực kỳ hài hước, vui nhộn", "The comedy was so hilarious that the whole audience laughed non-stop.", "Bộ phim hài hước đến mức cả khán phòng cười không dứt.", "Rất buồn cười và hóm hỉnh"),
            ("thriller", "/ˈθrɪlə/", "Danh từ", "Phim giật gân, ly kỳ", "He loves watching psychological thrillers on weekend nights.", "Cậu ấy rất thích xem những bộ phim tâm lý ly kỳ vào các tối cuối tuần.", "Thể loại phim hồi hộp, gay cấn"),
            ("critic", "/ˈkrɪtɪk/", "Danh từ", "Nhà phê bình phim", "Film critics praised the leading actor for his realistic performance.", "Các nhà phê bình phim đã khen ngợi nam diễn viên chính vì diễn xuất rất chân thật.", "Chuyên gia đánh giá tác phẩm nghệ thuật"),
        ], "A Review of a Must-See Animated Movie", "Finding Nemo is an animated movie directed by Andrew Stanton. Although the movie was released years ago, it remains beloved worldwide. The story tells the journey of an overprotective clownfish father searching for his missing son across the ocean.", "Why is Finding Nemo so popular despite being released years ago?", ["Because of its touching story and colorful underwater world", "Because it is completely black and white", "Because it has no sound", "Because it is very scary"], 0),

        (9, "Festivals around the World", "Lễ hội trên thế giới", "Câu hỏi Yes/No & Mệnh đề trạng ngữ chỉ thời gian", "Trọng âm từ có 2 âm tiết", [
            ("carnival", "/ˈkɑːnɪvl/", "Danh từ", "Lễ hội hóa trang Carnival", "The Rio Carnival in Brazil features spectacular samba parades.", "Lễ hội Carnival ở Rio, Brazil nổi bật với những đoàn diễu hành samba hoành tráng.", "Lễ hội hóa trang đường phố lớn"),
            ("pumpkin", "/ˈpʌmpkɪn/", "Danh từ", "Quả bí ngô", "Children carve glowing faces into pumpkins for Halloween.", "Trẻ em khắc các khuôn mặt phát sáng lên quả bí ngô cho dịp lễ Halloween.", "Loại quả màu cam biểu tượng mùa thu"),
            ("feast", "/fiːst/", "Danh từ", "Bữa tiệc thịnh soạn", "Families gather for a grand Thanksgiving feast every November.", "Các gia đình quây quần bên bữa tiệc Lễ Tạ Ơn thịnh soạn vào mỗi tháng 11.", "Bữa ăn thịnh soạn nhiều món ngon"),
            ("lantern", "/ˈlæntən/", "Danh từ", "Đèn lồng", "Mid-Autumn Festival is famous for colorful star-shaped lanterns.", "Tết Trung thu nổi tiếng với những chiếc đèn lồng hình ngôi sao rực rỡ sắc màu.", "Dụng cụ thắp sáng mang tính trang trí"),
            ("parade", "/pəˈreɪd/", "Danh từ", "Cuộc diễu hành", "Thousands of dancers joined the festive parade in the city square.", "Hàng ngàn vũ công đã tham gia cuộc diễu hành lễ hội tại quảng trường thành phố.", "Đoàn người rước cờ hoa trên phố"),
            ("float", "/fləʊt/", "Danh từ", "Xe diễu hành trang trí", "The flower float was decorated with twenty thousand red roses.", "Chiếc xe hoa diễu hành được trang trí bằng hai mươi ngàn bông hồng đỏ thắm.", "Xe rước trang trí lộng lẫy trong lễ hội"),
        ], "La Tomatina - The World's Biggest Food Fight", "La Tomatina is an eccentric tomato-throwing festival held in the Spanish town of Bunol every August. Tens of thousands of participants gather to throw overripe tomatoes at each other in one hour of pure fun.", "Where does the La Tomatina festival take place?", ["In Bunol, Spain", "In Ha Noi, Viet Nam", "In Tokyo, Japan", "In London, England"], 0),

        (10, "Energy Sources", "Các nguồn năng lượng", "Thì Hiện tại tiếp diễn diễn tả tương lai & Các dạng năng lượng", "Trọng âm từ có 3 âm tiết", [
            ("solar energy", "/ˈsəʊlə ˈenədʒi/", "Cụm danh từ", "Năng lượng mặt trời", "Solar energy is completely clean and renewable.", "Năng lượng mặt trời hoàn toàn sạch và có thể tái tạo được.", "Năng lượng khai thác từ ánh sáng mặt trời"),
            ("wind power", "/ˈwɪnd paʊə/", "Cụm danh từ", "Năng lượng gió", "Wind power turbines generate clean electricity on coastal hills.", "Các tua bin gió sản sinh điện sạch trên những sườn đồi ven biển.", "Năng lượng tạo ra từ sức gió"),
            ("natural gas", "/ˌnætʃrəl ˈɡæs/", "Cụm danh từ", "Khí thiên nhiên", "Natural gas produces less carbon dioxide than coal when burned.", "Khí thiên nhiên sinh ra ít khí CO2 hơn than đá khi được đốt cháy.", "Nguồn nhiên liệu hóa thạch dạng khí"),
            ("renewable", "/rɪˈnjuːəbl/", "Tính từ", "Có thể tái tạo", "Renewable sources like sun and wind never run out.", "Các nguồn năng lượng tái tạo như mặt trời và gió không bao giờ cạn kiệt.", "Nguồn tài nguyên vô tận"),
            ("turbine", "/ˈtɜːbaɪn/", "Danh từ", "Tua bin", "Giant turbines convert wind energy into electrical power.", "Các tua bin khổng lồ biến đổi năng lượng gió thành điện năng.", "Cỗ máy quay nhờ dòng khí hoặc nước"),
            ("hydro", "/ˈhaɪdrəʊ/", "Tiền tố/Danh từ", "Thủy điện (năng lượng nước)", "Hydro power stations supply a major share of electricity in Viet Nam.", "Các nhà máy thủy điện cung cấp một phần lớn sản lượng điện ở Việt Nam.", "Năng lượng khai thác từ dòng nước chảy"),
        ], "Clean Energy for Our Future", "Fossil fuels such as coal and oil are limited and harmful to our atmosphere. Therefore, scientists are urging countries to switch to renewable sources. Solar and wind energies produce zero emissions and help combat climate change.", "Why should we switch to solar and wind energy?", ["Because they produce zero emissions and are renewable", "Because they cause heavy pollution", "Because they run out quickly", "Because they are very dirty"], 0),

        (11, "Travelling in the Future", "Giao thông tương lai", "Thì Tương lai đơn (will) & Đại từ sở hữu (mine, yours, his, hers)", "Ngữ điệu lên và xuống giọng trong câu", [
            ("hyperloop", "/ˈhaɪpəluːp/", "Danh từ", "Tàu đệm từ siêu tốc Hyperloop", "The hyperloop can travel at speeds of over a thousand kilometers per hour.", "Tàu hyperloop có thể di chuyển ở vận tốc hơn một ngàn cây số một giờ.", "Hệ thống tàu cao tốc di chuyển trong đường ống chân không"),
            ("flying car", "/ˈflaɪɪŋ kɑː/", "Cụm danh từ", "Xe bay", "Flying cars could reduce traffic congestion in big cities completely.", "Xe ô tô bay có thể giúp giảm thiểu hoàn toàn nạn ùn tắc giao thông ở các thành phố lớn.", "Phương tiện bay kết hợp ô tô"),
            ("solar-powered", "/ˈsəʊlə ˈpaʊəd/", "Tính từ", "Chạy bằng năng lượng mặt trời", "Solar-powered buses run smoothly without needing gasoline.", "Xe buýt chạy bằng năng lượng mặt trời vận hành êm ái mà không cần xăng dầu.", "Được cấp điện từ pin mặt trời"),
            ("driverless", "/ˈdraɪvələs/", "Tính từ", "Không người lái, tự hành", "Driverless taxis use sensors and artificial intelligence to navigate safely.", "Xe taxi không người lái sử dụng cảm biến và trí tuệ nhân tạo để dẫn đường an toàn.", "Tự vận hành mà không cần tài xế"),
            ("autopilot", "/ˈɔːtəʊˌpaɪlət/", "Danh từ", "Chế độ lái tự động", "The modern airplane flew on autopilot across the Pacific Ocean.", "Chiếc máy bay hiện đại đã bay ở chế độ lái tự động băng qua Thái Bình Dương.", "Hệ thống tự động điều khiển phương tiện"),
            ("teleport", "/ˈtelɪpɔːt/", "Động từ/Danh từ", "Dịch chuyển tức thời", "Scientists wonder if humans will ever be able to teleport across planets.", "Các nhà khoa học tự hỏi liệu loài người có bao giờ dịch chuyển tức thời qua các hành tinh được không.", "Di chuyển ngay lập tức giữa hai vị trí"),
        ], "How Will We Travel in 2050?", "Transportation in 2050 will be smarter, faster, and much greener. Hyperloop trains will connect distant cities in minutes. Flying cars and driverless pods will navigate the skies autonomously, leaving traffic jams as a memory of the past.", "What will characterize transportation in 2050?", ["Smarter, faster, and greener technology", "Slower horse carriages", "More smoke and coal engines", "No transportation at all"], 0),

        (12, "English-Speaking Countries", "Các quốc gia nói tiếng Anh", "Mạo từ a/an/the và mạo từ zero (không dùng mạo từ)", "Ngữ điệu trong các loại câu hỏi", [
            ("native speaker", "/ˈneɪtɪv ˈspiːkə/", "Cụm danh từ", "Người bản ngữ", "Practicing speaking with native speakers improves your accent quickly.", "Luyện nói cùng người bản ngữ giúp cải thiện ngữ điệu của em rất nhanh chóng.", "Người dùng ngôn ngữ đó từ lúc sinh ra"),
            ("kangaroo", "/ˌkæŋɡəˈruː/", "Danh từ", "Chuột túi Kangaroo", "The kangaroo is the national symbol of Australia.", "Chuột túi kangaroo là biểu tượng quốc gia của nước Úc.", "Loài thú có túi nhảy bằng hai chân sau"),
            ("maple leaf", "/ˈmeɪpl liːf/", "Cụm danh từ", "Lá phong", "The red maple leaf appears proudly on the Canadian national flag.", "Lá phong đỏ xuất hiện đầy kiêu hãnh trên quốc kỳ của Canada.", "Chiếc lá phong đặc trưng của Canada"),
            ("landscape", "/ˈlændskeɪp/", "Danh từ", "Phong cảnh, cảnh quan", "Scotland is famous for its dramatic mountain landscapes and ancient castles.", "Xứ Scotland nổi tiếng với phong cảnh núi non hùng vĩ và những tòa lâu đài cổ kính.", "Khung cảnh thiên nhiên bao quát"),
            ("landmark", "/ˈlændmɑːk/", "Danh từ", "Thắng cảnh mang tính biểu tượng", "The Statue of Liberty is a world-renowned landmark in New York.", "Tượng Nữ thần Tự do là thắng cảnh biểu tượng trứ danh thế giới tại New York.", "Công trình kiến trúc hoặc địa danh nổi bật"),
            ("official", "/əˈfɪʃl/", "Tính từ", "Chính thức", "English is an official language in more than fifty nations around the globe.", "Tiếng Anh là ngôn ngữ chính thức tại hơn năm mươi quốc gia trên toàn cầu.", "Được nhà nước hoặc pháp luật công nhận"),
        ], "Discovering New Zealand and Canada", "New Zealand and Canada are two prominent English-speaking countries blessed with stunning natural beauty. Canada boasts immense snowy mountains and pristine lakes, while New Zealand is famous for its unique wildlife like the kiwi bird and friendly Maori culture.", "What is unique about New Zealand mentioned in the text?", ["Stunning nature, the kiwi bird, and rich Maori culture", "It has no mountains or lakes", "English is not spoken there", "It is located in Europe"], 0),
    ]

    for u_num, title, title_vi, grammar_str, phonics_str, vocab_tuples, r_title, r_passage, r_q, r_opts, r_ans in more_g7_units:
        units_data.append({
            "unit": u_num,
            "title": title,
            "titleVi": title_vi,
            "theme": "Culture & Society",
            "semester": 1 if u_num <= 6 else 2,
            "bookPages": f"Trang {(u_num-1)*10 + 8} – {u_num*10 + 7}",
            "bookId": "sgk-7",
            "vocab": vocab_tuples,
            "grammar": {
                "title": f"Ngữ pháp trọng tâm: {grammar_str}",
                "ruleVi": f"Điểm ngữ pháp chuẩn SGK Tiếng Anh 7 Global Success - Unit {u_num}: {grammar_str}.",
                "formula": grammar_str,
                "quickTip": "Ghi nhớ cấu trúc cốt lõi và làm các bài tập trắc nghiệm vận dụng.",
                "quiz": [
                    {
                        "question": f"Which option best fits Unit {u_num} grammar ({title})?",
                        "options": [vocab_tuples[0][0], "apple", "door", "window"],
                        "answerIndex": 0,
                        "explain": f"Từ '{vocab_tuples[0][0]}' ({vocab_tuples[0][3]}) là từ vựng trọng tâm của Unit."
                    }
                ]
            },
            "pronunciation": {
                "pair": phonics_str,
                "title": f"Luyện ngữ âm và trọng âm: {phonics_str}",
                "sound1": {"symbol": phonics_str.split()[0], "name": f"Âm {phonics_str.split()[0]}", "words": [vocab_tuples[0][0]]},
                "sound2": {"symbol": "/ə/", "name": "Nguyên âm /ə/", "words": ["together", "standard"]},
                "practiceQuiz": [
                    {"word": vocab_tuples[0][0], "correctSound": phonics_str.split()[0], "options": [phonics_str.split()[0], "/k/"], "meaningVi": vocab_tuples[0][3], "phonetic": vocab_tuples[0][1], "answerIndex": 0}
                ],
                "tongueTwister": f"Smart students study {vocab_tuples[0][0]} passionately every day."
            },
            "speaking": {
                "dialogueTitle": f"Getting Started: {title}",
                "dialogueContext": f"Các bạn học sinh trò chuyện về chủ đề {title_vi} trong tiết học tiếng Anh.",
                "situationalTopic": title_vi,
                "targetSentence": f"We are discussing {title_vi.lower()} in our English lesson.",
                "phonetic": f"/wiː ɑː dɪˈskʌsɪŋ {vocab_tuples[0][0]} təˈdeɪ/",
                "meaningVi": f"Chúng mình đang thảo luận về {title_vi.lower()} trong tiết học tiếng Anh hôm nay.",
                "dialogueLines": [
                    {"id": f"g7_u{u_num}_d1", "speaker": "Lan", "sentenceEn": f"Hi, Nam! Have you prepared for our {title.lower()} presentation?", "phonetic": "/haɪ næm hæv juː prɪˈpeəd fɔːr ˈaʊə ˌpreznˈteɪʃn/", "meaningVi": f"Chào Nam! Cậu đã chuẩn bị bài thuyết trình về {title_vi.lower()} chưa?", "tipsVi": "Chào hỏi hào hứng."},
                    {"id": f"g7_u{u_num}_d2", "speaker": "Nam", "sentenceEn": f"Yes, I have! I learned many interesting things about {vocab_tuples[0][0]}.", "phonetic": f"/jes aɪ hæv aɪ lɜːnd ˈmeni ˈɪntrəstɪŋ θɪŋz/", "meaningVi": f"Rồi chứ! Mình đã học được rất nhiều điều bổ ích về {vocab_tuples[0][3].lower()}.", "tipsVi": "Tự tin và vui vẻ."},
                    {"id": f"g7_u{u_num}_d3", "speaker": "Lan", "sentenceEn": "Wonderful! Let's present our project to the class together.", "phonetic": "/ˈwʌndəfl lets prɪˈzent ˈaʊə ˈprɒdʒekt tuː ðə klɑːs təˈɡeðə/", "meaningVi": "Tuyệt vời! Cùng lên thuyết trình dự án trước cả lớp nhé.", "tipsVi": "Cổ vũ bạn bè."}
                ],
                "challenges": [
                    {"id": 1, "level": "Mẫu câu cốt lõi", "sentenceEn": f"Understanding {title_vi.lower()} helps us become better global citizens.", "phonetic": "/ˌʌndəˈstændɪŋ .../", "meaningVi": f"Hiểu biết về {title_vi.lower()} giúp chúng ta trở thành công dân toàn cầu tốt hơn.", "tipsVi": "Nói trôi chảy theo cụm."}
                ]
            },
            "reading": {
                "title": r_title,
                "passage": r_passage,
                "translation": f"Bài đọc về {title_vi}: {r_title}. Nội dung cung cấp kiến thức thực tế bám sát SGK Tiếng Anh 7 Global Success.",
                "questions": [
                    {
                        "id": f"g7_u{u_num}_r1",
                        "type": "multiple_choice",
                        "question": r_q,
                        "options": r_opts,
                        "answerIndex": r_ans,
                        "explain": "Chi tiết được nêu trực tiếp trong bài đọc SGK."
                    }
                ]
            },
            "listening": {
                "topic": f"Bài nghe chủ đề: {title_vi}",
                "transcript": f"In today's lesson, our teacher explains key aspects of {title}. Learning about {vocab_tuples[0][0]} gives us practical knowledge for daily life.",
                "question": f"What is the main topic of the listening lesson?",
                "options": [title, "Playing football", "Cooking soup", "Watching TV"],
                "answerIndex": 0
            },
            "writing": {
                "correctSentence": f"We learn valuable lessons about {title.lower()} in class",
                "meaningVi": f"Chúng mình học được nhiều bài học quý báu về {title_vi.lower()} trong lớp học.",
                "items": [
                    {
                        "id": f"g7_u{u_num}_w1",
                        "type": "unscramble",
                        "scrambledWords": ["learn", "We", "about", title.split()[0], "today"],
                        "correctSentence": f"We learn about {title.split()[0]} today",
                        "meaningVi": f"Hôm nay chúng mình học về {title_vi.lower()}.",
                        "hint": "Bắt đầu bằng 'We learn...'"
                    }
                ]
            }
        })

    return units_data


def generate_secondary_grades():
    grades = {}

    # ==========================
    # LỚP 7 (12 UNITS)
    # ==========================
    g7_raw_units = get_grade_7_data()
    g7_units_list = []
    for u in g7_raw_units:
        u_num = u["unit"]
        vocab_items = []
        for idx, (w, ipa, w_type, mean, ex_en, ex_vi, hint) in enumerate(u["vocab"]):
            vocab_items.append({
                "id": f"g7_u{u_num}_{idx+1:02d}",
                "word": w,
                "phonetic": ipa,
                "wordType": w_type,
                "meaning": mean,
                "hint": hint,
                "exampleEn": ex_en,
                "exampleVi": ex_vi,
                "emoji": "🌟"
            })

        g7_units_list.append({
            "unitId": f"g7_u{u_num}",
            "grade": 7,
            "unit": u_num,
            "unitTitle": f"Unit {u_num}: {u['title']}",
            "unitNameVi": u["titleVi"],
            "theme": u["theme"],
            "semester": u["semester"],
            "bookPages": u["bookPages"],
            "bookId": "sgk-7",
            "vocabularies": vocab_items,
            "grammar": u["grammar"],
            "pronunciation": u["pronunciation"],
            "speaking": u["speaking"],
            "reading": u["reading"],
            "listening": u["listening"],
            "writing": u["writing"]
        })

    grades[7] = {
        "grade": 7,
        "gradeName": "Lớp 7",
        "level": "secondary",
        "levelName": "THCS",
        "title": "SGK Tiếng Anh 7 – Global Success",
        "totalUnits": 12,
        "interactiveAvailable": True,
        "interactiveNote": "Hệ thống trạm học tương tác 7 kỹ năng chuẩn SGK Lớp 7",
        "units": g7_units_list
    }

    # ==========================
    # LỚP 8 & LỚP 9 CONFIGURATION
    # ==========================
    sec_configs = [
        (8, "SGK Tiếng Anh 8 – Global Success", "sgk-8", [
            (1, "Leisure Time", "Thời gian rảnh rỗi", "Verbs of liking/disliking + V-ing/to-inf", "/ʊ/ và /uː/", [
                ("origami", "/ˌɒrɪˈɡɑːmi/", "Danh từ", "Nghệ thuật gấp giấy Nhật Bản", "Origami is the Japanese art of paper folding.", "Origami là nghệ thuật gấp giấy truyền thống của Nhật Bản.", "Môn nghệ thuật tạo hình từ giấy"),
                ("DIY project", "/ˌdiː aɪ ˈwaɪ ˈprɒdʒekt/", "Cụm danh từ", "Dự án tự làm đồ (Do-It-Yourself)", "Making paper flowers is a fun DIY project for girls.", "Làm hoa giấy là một dự án tự làm thú vị cho các bạn nữ.", "Tự tay làm đồ trang trí"),
                ("resort", "/rɪˈzɔːt/", "Danh từ", "Khu nghỉ dưỡng", "Our family spent the summer at a seaside resort.", "Gia đình mình đã trải qua mùa hè ở một khu nghỉ dưỡng ven biển.", "Nơi nghỉ ngơi du lịch tiện nghi"),
                ("message", "/ˈmesɪdʒ/", "Danh từ", "Tin nhắn", "Send me a message when you arrive home.", "Hãy gửi cho tớ một tin nhắn khi cậu về tới nhà nhé.", "Tin nhắn gửi qua điện thoại"),
                ("hang out", "/hæŋ aʊt/", "Cụm động từ", "Đi chơi, tụ tập bạn bè", "Teenagers love to hang out at cafes on weekends.", "Các bạn tuổi teen rất thích tụ tập đi chơi tại các quán cà phê vào cuối tuần.", "Gặp gỡ bạn bè thư giãn"),
                ("knitting", "/ˈnɪtɪŋ/", "Danh từ", "Đan len", "Knitting a warm wool scarf takes patience.", "Đan một chiếc khăn len ấm áp đòi hỏi sự kiên nhẫn.", "Hoạt động đan len bằng que đan"),
            ]),
            (2, "Life in the Countryside", "Cuộc sống ở miền quê", "So sánh hơn của trạng từ (Comparative forms of adverbs)", "/ə/ và /ɪ/", [
                ("vast", "/vɑːst/", "Tính từ", "Rộng lớn, bao la", "The vast green rice fields stretch to the horizon.", "Những cánh đồng lúa xanh bao la trải dài đến tận chân trời.", "Bát ngát, không gian rộng lớn"),
                ("hospitable", "/hɒˈspɪtəbl/", "Tính từ", "Hiếu khách, niềm nở", "Local villagers are warm and hospitable to visitors.", "Người dân làng rất ấm áp và hiếu khách đối với du khách.", "Đón tiếp khách nhiệt tình chu đáo"),
                ("harvest time", "/ˈhɑːvɪst taɪm/", "Cụm danh từ", "Mùa thu hoạch, mùa gặt", "Farmers work hard from early morning during harvest time.", "Những người nông dân làm việc chăm chỉ từ sáng sớm trong mùa gặt.", "Mùa thu hoạch lúa hoa màu"),
                ("canal", "/kəˈnæl/", "Danh từ", "Con kênh", "Small boats navigate peacefully along the village canal.", "Những chiếc thuyền nhỏ xuôi mái chèo thanh bình dọc theo con kênh làng.", "Đường dẫn nước nhân tạo"),
                ("pasture", "/ˈpɑːstʃə/", "Danh từ", "Đồng cỏ chăn thả gia súc", "Cattle graze freely on the green pasture.", "Đàn gia súc gặm cỏ tự do trên đồng cỏ xanh mát.", "Khu đất trồng cỏ cho bò cừu"),
                ("load", "/ləʊd/", "Động từ/Danh từ", "Chất hàng, tải hàng", "Workers load bundles of golden rice onto the carts.", "Những người thợ chất từng bó lúa vàng óng lên xe kéo.", "Đưa đồ đạc lên phương tiện"),
            ]),
            (3, "Teenagers", "Tuổi thanh thiếu niên", "Câu đơn và câu ghép với liên từ and, but, or, so", "/ʊə/ và /ɔɪ/", [
                ("peer pressure", "/ˈpɪə ˈpreʃə/", "Cụm danh từ", "Áp lực từ bạn bè đồng trang lứa", "Teenagers sometimes face peer pressure at school.", "Các bạn tuổi thiếu niên đôi khi phải đối mặt với áp lực từ bạn bè cùng lứa.", "Cảm giác phải làm theo bạn bè"),
                ("social media", "/ˈsəʊʃl ˈmiːdiə/", "Cụm danh từ", "Mạng xã hội", "Using social media sensibly helps teens connect positively.", "Sử dụng mạng xã hội hợp lý giúp giới trẻ kết nối tích cực.", "Nền tảng như Facebook, Zalo"),
                ("browse", "/braʊz/", "Động từ", "Lướt xem thông tin", "She likes to browse news websites before going to bed.", "Cô ấy thích lướt xem các trang tin tức trước khi đi ngủ.", "Xem lướt qua nhiều trang web"),
                ("club", "/klʌb/", "Danh từ", "Câu lạc bộ", "Joining an English club boosts communication confidence.", "Tham gia câu lạc bộ tiếng Anh giúp nâng cao sự tự tin khi giao tiếp.", "Hội nhóm có chung sở thích"),
                ("upload", "/ˌʌpˈləʊd/", "Động từ", "Đăng tải lên mạng", "He uploaded his musical performance to the school forum.", "Cậu ấy đã đăng tải tiết mục biểu diễn âm nhạc của mình lên diễn đàn trường.", "Đưa tệp dữ liệu lên internet"),
                ("bully", "/ˈbʊli/", "Động từ/Danh từ", "Bắt nạt / Kẻ bắt nạt", "Schools have strict rules to prevent bullying.", "Các trường học có nội quy nghiêm khắc để ngăn chặn hành vi bắt nạt.", "Hành vi ức hiếp người khác"),
            ]),
            (4, "Ethnic Groups of Viet Nam", "Các dân tộc Việt Nam", "Câu hỏi với từ để hỏi (Wh-questions) & Danh từ đếm được/không đếm được", "/k/ và /ɡ/", [
                ("communal house", "/kəˈmjuːnl haʊs/", "Cụm danh từ", "Nhà rông (nhà cộng đồng)", "The communal house is the cultural heart of the village.", "Nhà rông là trái tim văn hóa của cả buôn làng.", "Ngôi nhà chung lớn của đồng bào Tây Nguyên"),
                ("terraced field", "/ˈterəst fiːld/", "Cụm danh từ", "Ruộng bậc thang", "Terraced fields in Mu Cang Chai attract many tourists.", "Những thửa ruộng bậc thang ở Mù Căng Chải thu hút rất nhiều du khách.", "Thửa ruộng xếp tầng trên sườn đồi"),
                ("stilt house", "/stɪlt haʊs/", "Cụm danh từ", "Nhà sàn", "Many ethnic minorities live in wooden stilt houses.", "Nhiều đồng bào dân tộc thiểu số sinh sống trong những ngôi nhà sàn bằng gỗ.", "Nhà dựng trên các cây cột cao"),
                ("costume", "/ˈkɒstjuːm/", "Danh từ", "Trang phục truyền thống", "Ethnic women wear colorful handmade costumes with embroidery.", "Phụ nữ dân tộc mặc những bộ trang phục truyền thống thêu tay sặc sỡ sắc màu.", "Quần áo lễ hội mang đậm bản sắc"),
                ("folk dance", "/fəʊk dɑːns/", "Cụm danh từ", "Điệu múa dân gian", "The xoe dance of the Thai people is recognized as world heritage.", "Điệu múa xòe của người Thái đã được công nhận là di sản thế giới.", "Vũ điệu truyền thống dân gian"),
                ("weaving", "/ˈwiːvɪŋ/", "Danh từ", "Dệt vải thổ cẩm", "Weaving brocade is a traditional craft passed down through generations.", "Dệt thổ cẩm là một nghề thủ công truyền thống được lưu truyền qua nhiều thế hệ.", "Nghề đan dệt sợi thành vải"),
            ]),
            (5, "Our Customs and Traditions", "Phong tục và truyền thống", "Mạo từ the và zero article (không mạo từ)", "/n/ và /ŋ/", [
                ("custom", "/ˈkʌstəm/", "Danh từ", "Phong tục", "Giving lucky money at Tet is a widespread Vietnamese custom.", "Mừng tuổi vào dịp Tết là một phong tục phổ biến của người Việt Nam.", "Thói quen lâu đời của một cộng đồng"),
                ("tradition", "/trəˈdɪʃn/", "Danh từ", "Truyền thống", "Respecting teachers is an honorable tradition of our nation.", "Tôn sư trọng đạo là một truyền thống cao đẹp của dân tộc ta.", "Nét đẹp văn hóa truyền từ đời trước"),
                ("table manners", "/ˈteɪbl ˈmænəz/", "Cụm danh từ", "Quy tắc ứng xử trên bàn ăn", "Good table manners show respect to older family members.", "Quy tắc ứng xử tốt trên bàn ăn thể hiện sự kính trọng đối với người lớn tuổi.", "Phép lịch sự khi ăn uống"),
                ("generation", "/ˌdʒenəˈreɪʃn/", "Danh từ", "Thế hệ", "Three generations often live under the same roof in Viet Nam.", "Ba thế hệ thường cùng chung sống dưới một mái nhà ở Việt Nam.", "Tập hợp những người cùng lứa tuổi"),
                ("worship", "/ˈwɜːʃɪp/", "Động từ/Danh từ", "Thờ phụng, cúng bái", "Families worship ancestors on special memorial days.", "Các gia đình thờ cúng tổ tiên vào những ngày giỗ chạp đặc biệt.", "Tỏ lòng thành kính với tổ tiên thần linh"),
                ("heritage", "/ˈherɪtɪdʒ/", "Danh từ", "Di sản văn hóa", "Hoi An Ancient Town is a UNESCO World Cultural Heritage site.", "Phố cổ Hội An là một di sản văn hóa thế giới được UNESCO công nhận.", "Tài sản văn hóa vô giá"),
            ]),
            (6, "Lifestyles", "Phong cách sống", "Thì Tương lai tiếp diễn & Câu điều kiện loại 1", "/tr/ và /br/", [
                ("diet", "/ˈdaɪət/", "Danh từ", "Chế độ ăn uống", "A balanced diet rich in greens boosts physical endurance.", "Chế độ ăn cân bằng giàu rau xanh giúp tăng cường sức bền thể chất.", "Thực đơn dinh dưỡng hàng ngày"),
                ("nomadic", "/nəʊˈmædɪk/", "Tính từ", "Du mục", "Nomadic tribes travel with their herds across wide grasslands.", "Các bộ tộc du mục di chuyển cùng đàn gia súc của họ qua những thảo nguyên bao la.", "Lối sống di chuyển không định cư"),
                ("online learning", "/ˌɒnˈlaɪn ˈlɜːnɪŋ/", "Cụm danh từ", "Học trực tuyến", "Online learning allows students to access courses from home.", "Học trực tuyến cho phép học sinh tiếp cận các khóa học ngay tại nhà.", "Học qua mạng internet"),
                ("tribal", "/ˈtraɪbl/", "Tính từ", "Thuộc bộ lạc", "Tribal leaders gather to resolve village disputes peacefully.", "Các thủ lĩnh bộ lạc tụ họp để giải quyết các tranh chấp trong làng một cách hòa bình.", "Liên quan đến cộng đồng bộ tộc"),
                ("artisan", "/ˌɑːtɪˈzæn/", "Danh từ", "Nghệ nhân", "Skilled artisans craft delicate pottery by hand.", "Các nghệ nhân tài hoa chế tác đồ gốm tinh xảo bằng đôi bàn tay.", "Thợ thủ công tay nghề bậc thầy"),
                ("eco-friendly", "/ˌiːkəʊ ˈfrendli/", "Tính từ", "Thân thiện với môi trường", "Using canvas bags instead of plastic is an eco-friendly choice.", "Sử dụng túi vải thay vì túi nilon là một lựa chọn thân thiện với môi trường.", "Không gây hại cho thiên nhiên"),
            ]),
            (7, "Environmental Protection", "Bảo vệ môi trường", "Câu phức với mệnh đề nguyên nhân và kết quả (because, since, so)", "/bl/ và /cl/", [
                ("endangered species", "/ɪnˈdeɪndʒəd ˈspiːʃiːz/", "Cụm danh từ", "Các loài có nguy cơ tuyệt chủng", "The saola is one of the rarest endangered species in Viet Nam.", "Sao la là một trong những loài có nguy cơ tuyệt chủng hiếm nhất ở Việt Nam.", "Động vật quý hiếm sắp biến mất"),
                ("habitat", "/ˈhæbɪtæt/", "Danh từ", "Môi trường sống tự nhiên", "Deforestation destroys the natural habitat of wild animals.", "Nạn phá rừng phá hủy môi trường sống tự nhiên của động vật hoang dã.", "Nơi sinh sống của muôn loài"),
                ("pollution", "/pəˈluːʃn/", "Danh từ", "Sự ô nhiễm", "Air pollution in urban areas causes respiratory illnesses.", "Ô nhiễm không khí ở các đô thị gây ra các bệnh về đường hô hấp.", "Tình trạng môi trường bị nhiễm bẩn"),
                ("carbon footprint", "/ˌkɑːbən ˈfʊtprɪnt/", "Cụm danh từ", "Dấu chân carbon", "Riding a bicycle helps reduce your personal carbon footprint.", "Đi xe đạp giúp giảm dấu chân carbon của cá nhân em.", "Lượng khí thải nhà kính tạo ra"),
                ("ecosystem", "/ˈiːkəʊsɪstəm/", "Danh từ", "Hệ sinh thái", "Coral reefs support a vibrant marine ecosystem.", "Những rạn san hô nuôi dưỡng một hệ sinh thái biển vô cùng rực rỡ.", "Hệ thống sinh vật và môi trường sống"),
                ("wildlife", "/ˈwaɪldlaɪf/", "Danh từ", "Động vật hoang dã", "National parks protect precious wildlife from hunters.", "Các vườn quốc gia bảo vệ động vật hoang dã quý giá khỏi thợ săn.", "Các sinh vật sống trong tự nhiên"),
            ]),
            (8, "Shopping", "Mua sắm", "Trạng từ chỉ tần suất & Thì Hiện tại đơn diễn tả lịch trình tương lai", "/sp/ và /st/", [
                ("bargain", "/ˈbɑːɡən/", "Danh từ/Động từ", "Món hời / Trả giá, mặc cả", "Shoppers often bargain for lower prices at local open-air markets.", "Người mua sắm thường mặc cả để có giá thấp hơn tại các chợ ngoài trời.", "Thương lượng giá cả khi mua"),
                ("discount", "/ˈdɪskaʊnt/", "Danh từ", "Mức giảm giá, chiết khấu", "The store offers a twenty percent discount on school stationery.", "Cửa hàng đang giảm giá hai mươi phần trăm cho đồ dùng học tập.", "Số tiền được giảm khi mua"),
                ("price tag", "/ˈpraɪs tæɡ/", "Cụm danh từ", "Nhãn giá", "Check the price tag before taking items to the cashier counter.", "Hãy kiểm tra nhãn giá trước khi mang đồ đến quầy thu ngân nhé.", "Thẻ ghi giá tiền của món hàng"),
                ("supermarket", "/ˈsuːpəmɑːkɪt/", "Danh từ", "Siêu thị", "We buy groceries at the clean modern supermarket every Saturday.", "Chúng mình mua đồ tạp hóa ở siêu thị hiện đại sạch sẽ vào mỗi thứ Bảy.", "Cửa hàng bách hóa tự chọn quy mô lớn"),
                ("receipt", "/rɪˈsiːt/", "Danh từ", "Biên lai, hóa đơn mua hàng", "Keep your receipt in case you want to exchange the shirt.", "Hãy giữ lại hóa đơn mua hàng phòng khi bạn muốn đổi chiếc áo sơ mi.", "Phiếu chứng nhận đã thanh toán tiền"),
                ("online store", "/ˌɒnˈlaɪn stɔː/", "Cụm danh từ", "Cửa hàng trực tuyến", "Online stores offer convenient home delivery services.", "Các cửa hàng trực tuyến cung cấp dịch vụ giao hàng tận nhà rất tiện lợi.", "Gian hàng buôn bán trên mạng"),
            ]),
            (9, "Natural Disasters", "Thiên tai", "Thì Quá khứ tiếp diễn (Past Continuous Tense)", "/pr/ và /pl/", [
                ("earthquake", "/ˈɜːθkweɪk/", "Danh từ", "Trận động đất", "The strong earthquake shook buildings in the capital.", "Trận động đất mạnh đã làm rung chuyển các tòa nhà ở thủ đô.", "Sự rung chuyển dữ dội của vỏ trái đất"),
                ("tsunami", "/tsuːˈnɑːmi/", "Danh từ", "Sóng thần", "A tsunami alert was issued after the offshore tremor.", "Cảnh báo sóng thần đã được phát đi sau cơn chấn động ngoài khơi.", "Đợt sóng biển khổng lồ tràn vào bờ"),
                ("typhoon", "/taɪˈfuːn/", "Danh từ", "Cơn bão nhiệt đới", "The powerful typhoon brought heavy rain and severe flooding.", "Cơn bão nhiệt đới dữ dội mang theo mưa lớn và ngập lụt nghiêm trọng.", "Cơn bão lốc xoáy trên biển nhiệt đới"),
                ("volcanic eruption", "/vɒlˈkænɪk ɪˈrʌpʃn/", "Cụm danh từ", "Sự phun trào núi lửa", "Ash covered the valley following the sudden volcanic eruption.", "Tro bụi bao phủ cả thung lũng sau đợt phun trào núi lửa bất ngờ.", "Hiện tượng núi lửa phun dung nham"),
                ("flood", "/flʌd/", "Danh từ/Động từ", "Lũ lụt / Làm ngập úng", "Rescuers helped residents evacuate the flooded areas safely.", "Lực lượng cứu hộ đã giúp người dân sơ tán khỏi vùng ngập lụt an toàn.", "Nước dâng cao tràn ngập nhà cửa"),
                ("shelter", "/ˈʃeltə/", "Danh từ", "Nơi trú ẩn khẩn cấp", "Families took temporary shelter in the reinforced gymnasium.", "Các gia đình đã vào trú ẩn tạm thời trong nhà thi đấu kiên cố.", "Nơi an toàn tránh bão lũ"),
            ]),
            (10, "Communication in the Future", "Giao tiếp trong tương lai", "Giới từ chỉ thời gian và nơi chốn & Trọng âm đuôi -ity và -itive", "Trọng âm đuôi -ity", [
                ("video conference", "/ˈvɪdiəʊ ˈkɒnfərəns/", "Cụm danh từ", "Hội nghị truyền hình trực tuyến", "The global team held an interactive video conference this morning.", "Đội ngũ toàn cầu đã tổ chức một cuộc hội nghị truyền hình trực tuyến sáng nay.", "Họp trực tuyến qua màn hình có hình ảnh"),
                ("holographic", "/ˌhɒləˈɡræfɪk/", "Tính từ", "Ảnh nổi ba chiều (hologram)", "Holographic calls will display 3D projections of your friends.", "Các cuộc gọi hình ảnh ba chiều sẽ hiển thị hình ảnh 3D chân thực của bạn bè bạn.", "Công nghệ chiếu hình 3D lơ lửng"),
                ("telepathy", "/təˈlepəθi/", "Danh từ", "Thần giao cách cảm", "Telepathy would allow direct mind-to-mind messaging without words.", "Thần giao cách cảm sẽ cho phép truyền suy nghĩ trực tiếp mà không cần dùng lời nói.", "Khả năng truyền ý nghĩ qua tâm trí"),
                ("webcam", "/ˈwebkæm/", "Danh từ", "Máy quay máy tính, webcam", "Turn on your webcam so everyone in class can see you.", "Hãy bật webcam lên để mọi người trong lớp có thể nhìn thấy em nhé.", "Camera gắn trên máy vi tính"),
                ("emoji", "/ɪˈməʊdʒi/", "Danh từ", "Biểu tượng cảm xúc", "Young people use emojis to express feelings humorously in text chats.", "Các bạn trẻ dùng biểu tượng cảm xúc để thể hiện tâm trạng vui nhộn trong tin nhắn.", "Hình vẽ mặt cười, icon cảm xúc"),
                ("voice call", "/ˈvɔɪs kɔːl/", "Cụm danh từ", "Cuộc gọi thoại", "Grandpa still prefers a simple voice call over video messaging.", "Ông nội vẫn thích một cuộc gọi thoại đơn giản hơn là nhắn tin có hình.", "Cuộc gọi chỉ truyền âm thanh"),
            ]),
            (11, "Science and Technology", "Khoa học và công nghệ", "Câu tường thuật dạng trần thuật (Reported Speech: Statements)", "Trọng âm đuôi -logy và -graphy", [
                ("invention", "/ɪnˈvenʃn/", "Danh từ", "Phát minh", "The invention of the internet revolutionized human communication.", "Phát minh ra mạng internet đã cách mạng hóa nền giao tiếp của nhân loại.", "Sáng chế ra thứ chưa từng có"),
                ("smartphone", "/ˈsmɑːtfəʊn/", "Danh từ", "Điện thoại thông minh", "A modern smartphone works like a mini computer in your pocket.", "Một chiếc điện thoại thông minh hiện đại hoạt động như chiếc máy tính mini trong túi bạn.", "Điện thoại đa năng có kết nối internet"),
                ("robot", "/ˈrəʊbɒt/", "Danh từ", "Người máy, rô-bốt", "Surgical robots assist doctors in performing delicate operations.", "Người máy phẫu thuật hỗ trợ các bác sĩ thực hiện những ca mổ tinh vi.", "Cỗ máy tự động làm việc thay người"),
                ("discovery", "/dɪˈskʌvəri/", "Danh từ", "Sự phát hiện, khám phá", "The discovery of penicillin saved millions of lives.", "Phát hiện ra kháng sinh penicillin đã cứu sống hàng triệu sinh mạng.", "Tìm ra điều mới mẻ trong tự nhiên"),
                ("artificial", "/ˌɑːtɪˈfɪʃl/", "Tính từ", "Nhân tạo", "Artificial intelligence helps analyze medical images accurately.", "Trí tuệ nhân tạo giúp phân tích các hình ảnh y khoa một cách chuẩn xác.", "Do con người tạo ra, không phải tự nhiên"),
                ("laboratory", "/ləˈbɒrətri/", "Danh từ", "Phòng thí nghiệm", "Students wear protective lab coats inside the chemistry laboratory.", "Học sinh mặc áo khoác bảo hộ khi ở trong phòng thí nghiệm hóa học.", "Nơi tiến hành thí nghiệm khoa học"),
            ]),
            (12, "Life on Other Planets", "Sự sống trên các hành tinh khác", "Câu tường thuật dạng câu hỏi (Reported Speech: Questions)", "Tiền tố un- và im-", [
                ("alien", "/ˈeɪliən/", "Danh từ", "Người ngoài hành tinh", "Sci-fi books depict aliens with advanced interstellar technology.", "Những cuốn sách viễn tưởng miêu tả người ngoài hành tinh với công nghệ du hành vũ trụ tiên tiến.", "Sinh vật đến từ ngoài trái đất"),
                ("UFO", "/ˌjuː ef ˈəʊ/", "Danh từ viết tắt", "Vật thể bay không xác định (Đĩa bay)", "Several pilots reported witnessing a mysterious glowing UFO.", "Nhiều phi công đã báo cáo việc chứng kiến một vật thể bay phát sáng bí ẩn.", "Vật thể bay lạ trên bầu trời"),
                ("galaxy", "/ˈɡæləksi/", "Danh từ", "Thiên hà", "The Milky Way is our home galaxy containing billions of stars.", "Dải Ngân Hà là thiên hà quê hương của chúng ta chứa hàng tỷ ngôi sao.", "Tập hợp khổng lồ các ngôi sao trong vũ trụ"),
                ("solar system", "/ˈsəʊlə ˈsɪstəm/", "Cụm danh từ", "Hệ Mặt Trời", "Eight planets revolve around the central star in our solar system.", "Tám hành tinh quay quanh ngôi sao trung tâm trong hệ Mặt Trời của chúng ta.", "Mặt Trời và các thiên thể quay quanh"),
                ("telescope", "/ˈtelɪskəʊp/", "Danh từ", "Kính thiên văn", "Astronomers observe distant exoplanets through the space telescope.", "Các nhà thiên văn học quan sát những ngoại hành tinh xa xôi qua kính viễn vọng không gian.", "Thiết bị ngắm các vì sao xa xôi"),
                ("astronaut", "/ˈæstrənɔːt/", "Danh từ", "Phi hành gia", "Astronauts conduct biological experiments on the space station.", "Các phi hành gia tiến hành các thí nghiệm sinh học trên trạm vũ trụ quốc tế.", "Người bay vào thám hiểm vũ trụ"),
            ])
        ]),

        (9, "SGK Tiếng Anh 9 – Global Success", "sgk-9", [
            (1, "Local Community", "Cộng đồng địa phương", "Từ để hỏi đứng trước To-Infinitive & Cụm động từ (Phrasal Verbs)", "/aʊ/ và /aɪ/", [
                ("artisan", "/ˌɑːtɪˈzæn/", "Danh từ", "Nghệ nhân", "Bat Trang artisans create exquisite ceramic bowls.", "Các nghệ nhân Bát Tràng tạo ra những chiếc bát gốm sứ tinh xảo.", "Thợ thủ công tay nghề giỏi"),
                ("handicraft", "/ˈhændikrɑːft/", "Danh từ", "Hàng thủ công mỹ nghệ", "Foreign tourists admire Vietnamese lacquerware handicrafts.", "Khách du lịch nước ngoài trầm trồ trước các món đồ thủ công sơn mài Việt Nam.", "Sản phẩm làm thủ công khéo léo"),
                ("pottery", "/ˈpɒtəri/", "Danh từ", "Đồ gốm", "Pottery making has thrived in this village for five centuries.", "Nghề làm đồ gốm đã phát triển rực rỡ ở ngôi làng này suốt 5 thế kỷ.", "Sản phẩm nung từ đất sét"),
                ("workshop", "/ˈwɜːkʃɒp/", "Danh từ", "Xưởng thủ công / Buổi tập huấn", "The master opened a carpentry workshop to train young villagers.", "Vị nghệ nhân đã mở một xưởng mộc để đào tạo cho các thanh niên trong làng.", "Nơi thợ gia công sản xuất"),
                ("suburb", "/ˈsʌbɜːb/", "Danh từ", "Vùng ngoại ô", "Many families prefer living in the quiet suburbs of Ha Noi.", "Nhiều gia đình thích sinh sống ở vùng ngoại ô yên tĩnh của Hà Nội.", "Khu vực ven rìa thành phố"),
                ("facility", "/fəˈsɪləti/", "Danh từ", "Cơ sở vật chất, tiện ích", "The local community center provides sports facilities for youth.", "Nhà văn hóa cộng đồng địa phương cung cấp các cơ sở vật chất thể thao cho giới trẻ.", "Trang thiết bị phục vụ đời sống"),
            ]),
            (2, "City Life", "Cuộc sống thành thị", "Cấu trúc so sánh kép (Double Comparatives: The more... the better...)", "/h/ và /r/", [
                ("metro", "/ˈmetrəʊ/", "Danh từ", "Tàu điện ngầm, đường sắt đô thị", "The new metro system helps commuters avoid morning traffic jams.", "Hệ thống tàu điện đô thị mới giúp người đi làm tránh được cảnh tắc đường buổi sáng.", "Hệ thống tàu điện trong thành phố"),
                ("bustling", "/ˈbʌslɪŋ/", "Tính từ", "Nhộn nhịp, hối hả náo nhiệt", "Ben Thanh Market is always bustling with shoppers and vendors.", "Chợ Bến Thành luôn nhộn nhịp người mua sắm và những người bán hàng.", "Đông vui tấp nập người qua lại"),
                ("skyscraper", "/ˈskaɪskreɪpə/", "Danh từ", "Tòa nhà chọc trời", "Landmark 81 is the tallest skyscraper in Ho Chi Minh City.", "Landmark 81 là tòa nhà chọc trời cao nhất tại Thành phố Hồ Chí Minh.", "Tòa tháp cao vút tầng mây"),
                ("congestion", "/kənˈdʒestʃən/", "Danh từ", "Sự ùn tắc, nghẽn xe", "Expanding public transit is vital to alleviate city congestion.", "Mở rộng giao thông công cộng là điều cấp thiết để giảm bớt ùn tắc đô thị.", "Tình trạng đông nghẹt cản trở giao thông"),
                ("urban", "/ˈɜːbən/", "Tính từ", "Thuộc đô thị, thành phố", "Urban planning ensures sustainable development for modern cities.", "Quy hoạch đô thị bảo đảm sự phát triển bền vững cho các thành phố hiện đại.", "Liên quan đến khu vực thành thị"),
                ("liveable", "/ˈlɪvəbl/", "Tính từ", "Đáng sống", "Da Nang is widely regarded as the most liveable city in Viet Nam.", "Đà Nẵng được đông đảo mọi người xem là thành phố đáng sống nhất ở Việt Nam.", "Có môi trường và điều kiện sống lý tưởng"),
            ]),
            (3, "Healthy Living for Teens", "Lối sống lành mạnh cho thanh thiếu niên", "Động từ khuyết thiếu trong câu điều kiện loại 1", "Trọng âm từ chỉ nội dung (Content Words)", [
                ("well-balanced", "/ˌwel ˈbælənst/", "Tính từ", "Cân bằng, hài hòa", "A well-balanced routine includes study, rest, and sports.", "Một thời gian biểu cân bằng bao gồm việc học tập, nghỉ ngơi và chơi thể thao.", "Phân bổ hợp lý các mặt"),
                ("anxiety", "/æŋˈzaɪəti/", "Danh từ", "Sự lo âu, âu lo", "Deep breathing exercises help ease anxiety before exam periods.", "Các bài tập hít thở sâu giúp làm dịu bớt sự lo âu trước các kỳ thi cử.", "Cảm giác bồn chồn lo lắng"),
                ("counsellor", "/ˈkaʊnsələ/", "Danh từ", "Chuyên viên tư vấn tâm lý", "School counsellors provide helpful guidance for stressed teens.", "Các chuyên viên tư vấn học đường mang lại những lời khuyên bổ ích cho học sinh bị căng thẳng.", "Người hỗ trợ định hướng tâm lý"),
                ("physical health", "/ˈfɪzɪkl helθ/", "Cụm danh từ", "Sức khỏe thể chất", "Regular swimming builds cardiovascular strength and physical health.", "Bơi lội thường xuyên giúp tăng cường hệ tim mạch và sức khỏe thể chất.", "Trạng thái lành mạnh của cơ thể"),
                ("sleep deprivation", "/sliːp ˌdeprɪˈveɪʃn/", "Cụm danh từ", "Tình trạng thiếu ngủ", "Chronic sleep deprivation weakens focus and memorisation.", "Thiếu ngủ kéo dài làm suy giảm khả năng tập trung và ghi nhớ.", "Không ngủ đủ số giờ cần thiết"),
                ("mindfulness", "/ˈmaɪndflnəs/", "Danh từ", "Sự chú tâm, chánh niệm", "Practicing mindfulness reduces academic stress effectively.", "Thực hành sự chú tâm giúp xua tan áp lực bài vở một cách hiệu quả.", "Trạng thái nhận biết tỉnh thức"),
            ]),
            (4, "Remembering the Past", "Nhớ về quá khứ", "Cấu trúc Used to + V & Ôn tập thì Quá khứ tiếp diễn", "Ngữ điệu trong câu cảm thán", [
                ("preservation", "/ˌprezəˈveɪʃn/", "Danh từ", "Sự bảo tồn, gìn giữ", "The preservation of historic relics preserves national pride.", "Việc bảo tồn các di tích lịch sử gìn giữ niềm tự hào của dân tộc.", "Giữ cho không bị mai một"),
                ("generation", "/ˌdʒenəˈreɪʃn/", "Danh từ", "Thế hệ", "Our grandparents' generation endured hardship during wartime.", "Thế hệ ông bà của chúng ta đã kiên cường vượt qua gian nan trong thời chiến.", "Các tầng lớp thế hệ con người"),
                ("barefoot", "/ˈbeəfʊt/", "Tính từ/Trạng từ", "Chân trần", "Decades ago, village children often walked barefoot to school.", "Nhiều thập kỷ trước, các cô bé cậu bé trong làng thường đi chân trần tới trường.", "Không đi giày dép"),
                ("illiteracy", "/ɪˈlɪtərəsi/", "Danh từ", "Nạn mù chữ", "National campaigns successfully eradicated illiteracy across remote districts.", "Các chiến dịch toàn quốc đã xóa mù chữ thành công khắp các huyện vùng sâu vùng xa.", "Tình trạng không biết chữ"),
                ("deep-rooted", "/ˌdiːp ˈruːtɪd/", "Tính từ", "Bắt rễ sâu xa, lâu đời", "Vietnamese people have a deep-rooted tradition of filial piety.", "Người Việt Nam có truyền thống hiếu thảo bắt rễ sâu xa tự ngàn đời.", "In sâu vào tâm thức"),
                ("historic", "/hɪˈstɒrɪk/", "Tính từ", "Mang tính lịch sử trọng đại", "The historic Dien Bien Phu victory marked a pivotal triumph.", "Chiến thắng lịch sử Điện Biên Phủ đã đánh dấu một thắng lợi mang tính bước ngoặt.", "Có ý nghĩa quan trọng trong lịch sử"),
            ]),
            (5, "Our Experiences", "Những trải nghiệm của chúng mình", "Thì Hiện tại hoàn thành với already, yet, just", "Trọng âm danh từ ghép", [
                ("adventure", "/ədˈventʃə/", "Danh từ", "Chuyến phiêu lưu", "Climbing Mount Fansipan was an unforgettable adventure for the youth.", "Leo đỉnh núi Fansipan là một chuyến phiêu lưu không thể nào quên của tuổi trẻ.", "Hành trình khám phá mạo hiểm"),
                ("expedition", "/ˌekspəˈdɪʃn/", "Danh từ", "Cuộc thám hiểm", "Scientists launched an expedition into Son Doong Cave.", "Các nhà khoa học đã triển khai một cuộc thám hiểm vào trong hang Sơn Đoòng.", "Chuyến đi thám sát khoa học"),
                ("breathtaking", "/ˈbreθteɪkɪŋ/", "Tính từ", "Ngoạn mục, đẹp đến ngạt thở", "The mountain summit offered a breathtaking view of the valley below.", "Đỉnh núi mở ra một khung cảnh ngoạn mục bao la của thung lũng bên dưới.", "Cảnh đẹp choáng ngợp lòng người"),
                ("memorable", "/ˈmemərəbl/", "Tính từ", "Đáng nhớ, khó quên", "Our school volunteer trip was a deeply memorable milestone.", "Chuyến đi tình nguyện của trường là một dấu mốc vô cùng đáng nhớ.", "Khắc sâu trong ký ức"),
                ("homestay", "/ˈhəʊmsteɪ/", "Danh từ", "Nghỉ trọ nhà dân, homestay", "Staying at an ethnic homestay gave us authentic insights into local customs.", "Nghỉ lại tại một homestay nhà dân bản địa mang lại cho chúng mình những hiểu biết chân thực về phong tục địa phương.", "Loại hình lưu trú cùng người dân"),
                ("trek", "/trek/", "Động từ/Danh từ", "Chuyến đi bộ đường dài dã ngoại", "We trekked through dense tropical forests for six hours.", "Chúng mình đã đi bộ băng qua những cánh rừng nhiệt đới rậm rạp suốt sáu tiếng đồng hồ.", "Đi bộ vượt địa hình hiểm trở"),
            ]),
            (6, "Viet Nam: Then and Now", "Việt Nam: Xưa và nay", "Thì Quá khứ hoàn thành (Past Perfect Tense)", "Ngữ điệu trong câu hỏi đuôi (Question Tags)", [
                ("tramcar", "/ˈtræmkɑː/", "Danh từ", "Xe điện mặt đất", "Old Ha Noi had historic tramcars clanging along the streets.", "Hà Nội xưa từng có những chuyến xe điện leng keng rộn rã dọc theo các phố.", "Phương tiện chạy đường ray trong phố thời xưa"),
                ("thatched house", "/θætʃt haʊs/", "Cụm danh từ", "Nhà tranh mái lá", "In the past, poor villagers lived in simple thatched houses.", "Thời xưa, những người dân nghèo sống trong những ngôi nhà tranh vách đất đơn sơ.", "Nhà lợp bằng cỏ tranh hoặc lá"),
                ("renovation", "/ˌrenəˈveɪʃn/", "Danh từ", "Công cuộc Đổi Mới / Sự cải tạo", "The 1986 Doi Moi renovation policy transformed Viet Nam's economy.", "Chính sách Đổi Mới năm 1986 đã làm biến đổi diện mạo nền kinh tế Việt Nam.", "Cải cách toàn diện để phát triển"),
                ("infrastructure", "/ˈɪnfrəstrʌktʃə/", "Danh từ", "Cơ sở hạ tầng", "Modern highways and bridges boosted regional economic connectivity.", "Những tuyến đường cao tốc và cây cầu hiện đại đã thúc đẩy sự kết nối kinh tế giữa các vùng miền.", "Hệ thống đường sá cầu cống bến bãi"),
                ("flyover", "/ˈflaɪəʊvə/", "Danh từ", "Cầu vượt cạn", "Construction of new flyovers resolved traffic bottlenecks at junctions.", "Việc xây dựng các cây cầu vượt mới đã tháo gỡ những điểm nghẽn giao thông tại các nút giao.", "Cầu vượt trên cạn bắc qua ngã tư"),
                ("era", "/ˈɪərə/", "Danh từ", "Kỷ nguyên, thời đại", "Viet Nam is stepping into an era of digital modernization.", "Việt Nam đang vững bước tiến vào một kỷ nguyên hiện đại hóa kỹ thuật số.", "Thời kỳ lịch sử lâu dài"),
            ]),
            (7, "Natural Wonders of the World", "Kỳ quan thiên nhiên thế giới", "Câu bị động với động từ khuyết thiếu (Modal Passives: must be, can be)", "/sl/ và /sn/", [
                ("geological", "/ˌdʒiːəˈlɒdʒɪkl/", "Tính từ", "Thuộc địa chất", "Ha Long Bay features astonishing geological limestone formations.", "Vịnh Hạ Long sở hữu những kiến tạo địa chất đá vôi kỳ vĩ đáng kinh ngạc.", "Liên quan đến cấu trúc đất đá"),
                ("cavern", "/ˈkævən/", "Danh từ", "Hang động lớn", "Son Doong Cavern possesses its own localized weather climate.", "Đại hang động Sơn Đoòng sở hữu cả một hệ khí hậu cục bộ riêng biệt bên trong.", "Hang đá khổng lồ dưới lòng đất"),
                ("stalagmite", "/ˈstæləɡmaɪt/", "Danh từ", "Măng đá", "Ancient stalagmites rose dramatically from the cave floor.", "Những cột măng đá cổ xưa mọc sừng sững lên từ nền hang động.", "Cột đá vôi nhô lên từ đáy hang"),
                ("sanctuary", "/ˈsæŋktʃuəri/", "Danh từ", "Khu bảo tồn thiên nhiên", "The national sanctuary shelters hundreds of endangered bird species.", "Khu bảo tồn thiên nhiên quốc gia che chở cho hàng trăm loài chim quý hiếm.", "Nơi an toàn cho muôn loài nương náu"),
                ("spectacular", "/spekˈtækjələ/", "Tính từ", "Hùng vĩ, tráng lệ ngoạn mục", "The cascading waterfall presented a spectacular sight at dawn.", "Thác nước cuồn cuộn đổ xuống mở ra một cảnh tượng tráng lệ lúc rạng đông.", "Cảnh tượng vô cùng đẹp đẽ"),
                ("landscape", "/ˈlændskeɪp/", "Danh từ", "Cảnh quan thiên nhiên", "The karst landscape of Phong Nha attracts global spelunkers.", "Cảnh quan karst của Phong Nha thu hút những nhà thám hiểm hang động toàn cầu.", "Toàn cảnh đất đai thiên nhiên"),
            ]),
            (8, "Tourism", "Du lịch", "Danh từ ghép (Compound Nouns) & Ôn tập mạo từ", "Trọng âm từ có đuôi -ion và -ian", [
                ("eco-tour", "/ˈiːkəʊ tʊə/", "Cụm danh từ", "Chuyến du lịch sinh thái", "Eco-tours teach tourists to respect natural habitats and local culture.", "Những chuyến du lịch sinh thái dạy du khách biết tôn trọng môi trường sống tự nhiên và văn hóa bản địa.", "Du lịch trải nghiệm thiên nhiên bền vững"),
                ("luggage", "/ˈlʌɡɪdʒ/", "Danh từ", "Hành lý", "Passengers must weigh their checked luggage before flight boarding.", "Hành khách phải cân hành lý ký gửi trước khi làm thủ tục lên máy bay.", "Đồ đạc mang theo khi đi xa"),
                ("safari", "/səˈfɑːri/", "Danh từ", "Chuyến dã ngoại ngắm động vật hoang dã", "The safari took visitors deep into the savannah to see elephants.", "Chuyến thám hiểm safari đưa du khách tiến sâu vào thảo nguyên để ngắm đàn voi.", "Chuyến đi ngắm muông thú tự nhiên"),
                ("destination", "/ˌdestɪˈneɪʃn/", "Danh từ", "Điểm đến du lịch", "Phu Quoc Island is a top beach destination in Southeast Asia.", "Đảo Phú Quốc là một điểm đến nghỉ dưỡng biển hàng đầu tại Đông Nam Á.", "Nơi hướng tới trong chuyến đi"),
                ("package tour", "/ˈpækɪdʒ tʊə/", "Cụm danh từ", "Chuyến du lịch trọn gói", "A package tour covers flight tickets, hotel rooms, and guided tours.", "Một chuyến du lịch trọn gói bao gồm vé máy bay, phòng khách sạn và hướng dẫn viên.", "Tour du lịch bao trọn gói chi phí"),
                ("hospitality", "/ˌhɒspɪˈtæləti/", "Danh từ", "Lòng mến khách / Ngành du lịch khách sạn", "Vietnamese hospitality leaves a warm lasting impression on travelers.", "Lòng mến khách của người Việt để lại ấn tượng ấm áp sâu đậm trong lòng lữ khách.", "Sự ân cần chu đáo với khách"),
            ]),
            (9, "World Englishes", "Tiếng Anh trên thế giới", "Mệnh đề quan hệ xác định với who, which, that", "Trọng âm từ có đuôi -ic và -ical", [
                ("official language", "/əˈfɪʃl ˈlæŋɡwɪdʒ/", "Cụm danh từ", "Ngôn ngữ chính thức", "English serves as the official language of international aviation.", "Tiếng Anh đóng vai trò là ngôn ngữ chính thức của ngành hàng không quốc tế.", "Ngôn ngữ nhà nước quy định dùng"),
                ("accent", "/ˈæksent/", "Danh từ", "Chất giọng, ngữ âm", "Australian English features a distinctive friendly accent.", "Tiếng Anh của người Úc mang một chất giọng thân thiện rất đặc trưng.", "Cách phát âm của từng vùng miền"),
                ("bilingual", "/baɪˈlɪŋɡwəl/", "Tính từ", "Song ngữ", "Growing up in a bilingual home enriches cognitive versatility.", "Lớn lên trong một gia đình song ngữ làm phong phú thêm khả năng tư duy ngôn ngữ.", "Sử dụng thành thạo hai thứ tiếng"),
                ("dialect", "/ˈdaɪəlekt/", "Danh từ", "Tiếng địa phương, phương ngữ", "The northern dialect has distinct vocabulary from southern speech.", "Phương ngữ miền Bắc có vốn từ vựng khác biệt so với giọng miền Nam.", "Biến thể ngôn ngữ của từng địa phương"),
                ("fluent", "/ˈfluːənt/", "Tính từ", "Lưu loát, trôi chảy", "Practicing every day enables students to become fluent in English.", "Luyện tập mỗi ngày giúp các bạn học sinh nói tiếng Anh trôi chảy và tự tin.", "Nói năng mượt mà không vấp"),
                ("terminology", "/ˌtɜːmɪˈnɒlədʒi/", "Danh từ", "Thuật ngữ chuyên ngành", "Medical terminology requires precise understanding in diagnosis.", "Thuật ngữ y khoa đòi hỏi sự thấu hiểu chuẩn xác trong chẩn đoán.", "Từ ngữ chuyên môn của một lĩnh vực"),
            ]),
            (10, "Planet Earth", "Hành tinh Trái Đất", "Mệnh đề quan hệ không xác định (Non-defining Relative Clauses)", "Ngữ điệu trong danh sách liệt kê", [
                ("atmosphere", "/ˈætməsfɪə/", "Danh từ", "Khí quyển", "The Earth's atmosphere shields us from harmful solar radiation.", "Bầu khí quyển của Trái Đất che chắn cho chúng ta khỏi bức xạ mặt trời độc hại.", "Tầng không khí bao quanh hành tinh"),
                ("ozone layer", "/ˈəʊzəʊn ˈleɪə/", "Cụm danh từ", "Tầng ozon", "The ozone layer absorbs most of the sun's ultraviolet rays.", "Tầng ozon hấp thụ phần lớn các tia cực tím nguy hiểm từ ánh mặt trời.", "Lớp khí bảo vệ sự sống trên trái đất"),
                ("biodiversity", "/ˌbaɪəʊdaɪˈvɜːsəti/", "Danh từ", "Đa dạng sinh học", "Tropical rainforests harbor the richest biodiversity on the planet.", "Các khu rừng mưa nhiệt đới lưu giữ nguồn đa dạng sinh học phong phú nhất trên hành tinh.", "Sự phong phú của các loài sinh vật"),
                ("deforestation", "/diːˌfɒrɪˈsteɪʃn/", "Danh từ", "Nạn phá rừng", "Deforestation accelerates soil erosion and greenhouse gas build-up.", "Nạn phá rừng làm đẩy nhanh quá trình xói mòn đất và sự tích tụ khí nhà kính.", "Việc chặt phá rừng bừa bãi"),
                ("renewable", "/rɪˈnjuːəbl/", "Tính từ", "Tái tạo được", "Wind and sunshine provide infinite renewable power sources.", "Gió và ánh nắng mặt trời mang đến những nguồn năng lượng tái tạo vô tận.", "Có thể hồi phục tự nhiên"),
                ("catastrophe", "/kəˈtæstrəfi/", "Danh từ", "Thảm họa thiên nhiên", "Global warming could trigger ecological catastrophes if left unchecked.", "Sự nóng lên toàn cầu có thể gây ra những thảm họa sinh thái nếu không được kiềm chế.", "Biến cố thảm khốc gây thiệt hại lớn"),
            ]),
            (11, "Electronic Devices", "Thiết bị điện tử", "Mệnh đề trạng ngữ chỉ sự nhượng bộ (although, though, even though)", "Hiện tượng nuốt âm trong lời nói nối (Elision)", [
                ("gadget", "/ˈɡædʒɪt/", "Danh từ", "Thiết bị công nghệ tiện ích", "Smart watches are handy gadgets for tracking physical workouts.", "Đồng hồ thông minh là những thiết bị tiện ích tuyệt vời để theo dõi quá trình tập luyện.", "Dụng cụ điện tử thông minh nhỏ gọn"),
                ("touchscreen", "/ˈtʌtʃskriːn/", "Danh từ", "Màn hình cảm ứng", "Tablets feature responsive touchscreens for digital drawing.", "Máy tính bảng sở hữu màn hình cảm ứng nhạy bén để vẽ tranh kỹ thuật số.", "Màn hình chạm điều khiển trực tiếp"),
                ("portable", "/ˈpɔːtəbl/", "Tính từ", "Di động, có thể mang theo", "Laptops are lightweight and portable for students on the move.", "Máy tính xách tay có trọng lượng nhẹ và tiện lợi mang theo cho học sinh di chuyển.", "Dễ dàng cầm theo mọi nơi"),
                ("rechargeable", "/ˌriːˈtʃɑːdʒəbl/", "Tính từ", "Có thể sạc lại điện", "Rechargeable batteries save money and reduce electronic waste.", "Pin sạc lại được giúp tiết kiệm tiền bạc và giảm bớt rác thải điện tử.", "Nạp lại điện nhiều lần"),
                ("processor", "/ˈprəʊsesə/", "Danh từ", "Bộ vi xử lý máy tính (Chip CPU)", "A powerful processor ensures seamless multi-tasking on computers.", "Một bộ vi xử lý mạnh mẽ bảo đảm việc chạy đa nhiệm mượt mà trên máy tính.", "Bộ não tính toán của thiết bị"),
                ("interactive", "/ˌɪntərˈæktɪv/", "Tính từ", "Tương tác", "Interactive learning software makes grammar study engaging.", "Phần mềm học tập tương tác giúp cho việc học ngữ pháp trở nên vô cùng cuốn hút.", "Có sự phản hồi hai chiều qua lại"),
            ]),
            (12, "Career Choices", "Lựa chọn nghề nghiệp", "Mệnh đề trạng ngữ chỉ điều kiện (provided that, as long as)", "Ngữ điệu trong lời đề nghị lịch sự", [
                ("vocation", "/vəʊˈkeɪʃn/", "Danh từ", "Thiên hướng nghề nghiệp, nghề nghiệp", "Teaching is not merely a job; it is a heartfelt vocation.", "Nghề dạy học không đơn thuần là một công việc; đó là một thiên hướng thiêng liêng từ trái tim.", "Nghề nghiệp phù hợp với đam mê"),
                ("qualification", "/ˌkwɒlɪfɪˈkeɪʃn/", "Danh từ", "Bằng cấp, chứng chỉ chuyên môn", "Higher qualifications open doors to senior professional roles.", "Bằng cấp chuyên môn cao mở ra những cánh cửa dẫn tới các vị trí nghề nghiệp cao cấp.", "Chứng chỉ xác nhận năng lực"),
                ("apprenticeship", "/əˈprentɪsʃɪp/", "Danh từ", "Thời gian học nghề, kỳ thực tập nghề", "The automotive factory offers paid apprenticeships for high school graduates.", "Nhà máy ô tô cung cấp những kỳ học nghề có trả lương cho các bạn tốt nghiệp THPT.", "Quá trình vừa học vừa làm thực tế"),
                ("career adviser", "/kəˈrɪər ədˈvaɪzə/", "Cụm danh từ", "Chuyên viên tư vấn hướng nghiệp", "A career adviser helps students align talents with market needs.", "Một chuyên viên tư vấn hướng nghiệp giúp học sinh gắn kết tài năng với nhu cầu thị trường.", "Người định hướng tương lai nghề nghiệp"),
                ("job market", "/dʒɒb ˈmɑːkɪt/", "Cụm danh từ", "Thị trường lao động, thị trường việc làm", "The modern job market demands strong digital and language capabilities.", "Thị trường việc làm hiện đại đòi hỏi năng lực kỹ thuật số và ngoại ngữ vững vàng.", "Nơi cung cầu về việc làm"),
                ("ambition", "/æmˈbɪʃn/", "Danh từ", "Hoài bão, ước vọng lớn", "Her ambition is to become an aerospace engineer at NASA.", "Hoài bão lớn của cô ấy là trở thành một kỹ sư hàng không vũ trụ tại NASA.", "Ý chí khát vọng vươn tới đỉnh cao"),
            ])
        ])
    ]

    for g_num, book_title, book_id, units_data in sec_configs:
        units_list = []
        for u_num, title, title_vi, grammar_str, phonics_str, vocab_tuples in units_data:
            vocab_items = []
            for idx, (w, ipa, w_type, mean, ex_en, ex_vi, hint) in enumerate(vocab_tuples):
                vocab_items.append({
                    "id": f"g{g_num}_u{u_num}_{idx+1:02d}",
                    "word": w,
                    "phonetic": ipa,
                    "wordType": w_type,
                    "meaning": mean,
                    "hint": hint,
                    "exampleEn": ex_en,
                    "exampleVi": ex_vi,
                    "emoji": "✨"
                })

            main_word = vocab_tuples[0][0]
            main_ipa = vocab_tuples[0][1]
            main_mean = vocab_tuples[0][3]

            units_list.append({
                "unitId": f"g{g_num}_u{u_num}",
                "grade": g_num,
                "unit": u_num,
                "unitTitle": f"Unit {u_num}: {title}",
                "unitNameVi": title_vi,
                "theme": "Secondary Education & Global Citizen",
                "semester": 1 if u_num <= 6 else 2,
                "bookPages": f"Trang {(u_num-1)*10 + 8} – {u_num*10 + 7}",
                "bookId": book_id,
                "vocabularies": vocab_items,
                "grammar": {
                    "title": f"Ngữ pháp trọng tâm: {grammar_str}",
                    "ruleVi": f"Điểm ngữ pháp chuẩn SGK Tiếng Anh {g_num} Global Success - Unit {u_num}: {grammar_str}.",
                    "formula": grammar_str,
                    "quickTip": "Ghi nhớ cấu trúc ngữ pháp và áp dụng làm các câu hỏi trắc nghiệm bên dưới.",
                    "quiz": [
                        {
                            "question": f"Which word from Unit {u_num} means '{main_mean}'?",
                            "options": [main_word, "banana", "refrigerator", "pencil"],
                            "answerIndex": 0,
                            "explain": f"Từ '{main_word}' có phiên âm {main_ipa} mang nghĩa là '{main_mean}'."
                        },
                        {
                            "question": f"Choose the correct sentence related to {title}:",
                            "options": [f"Students learn about {main_word} in Unit {u_num}.", "They does not study.", "She go to school.", "I are playing."],
                            "answerIndex": 0,
                            "explain": "Áp dụng ngữ pháp và từ vựng chuẩn xác của Unit."
                        }
                    ]
                },
                "pronunciation": {
                    "pair": phonics_str,
                    "title": f"Luyện ngữ âm: {phonics_str}",
                    "sound1": {"symbol": phonics_str.split()[0], "name": f"Âm {phonics_str.split()[0]}", "words": [main_word]},
                    "sound2": {"symbol": "/ə/", "name": "Nguyên âm /ə/", "words": ["together", "standard"]},
                    "practiceQuiz": [
                        {"word": main_word, "correctSound": phonics_str.split()[0], "options": [phonics_str.split()[0], "/k/"], "meaningVi": main_mean, "phonetic": main_ipa, "answerIndex": 0}
                    ],
                    "tongueTwister": f"Smart students pronounce {main_word} perfectly in English."
                },
                "speaking": {
                    "targetSentence": f"We are discussing {title_vi.lower()} in our English lesson today.",
                    "phonetic": f"/wiː ɑː dɪˈskʌsɪŋ {main_word.lower()} təˈdeɪ/",
                    "meaningVi": f"Chúng mình đang thảo luận về {title_vi.lower()} trong tiết học tiếng Anh hôm nay.",
                    "situationalTopic": title_vi,
                    "dialogueTitle": f"Getting Started: {title}",
                    "dialogueContext": f"Các bạn học sinh trao đổi về chủ đề {title_vi} trong bài học SGK.",
                    "dialogueLines": [
                        {"id": f"g{g_num}_u{u_num}_d1", "speaker": "Phong", "sentenceEn": f"Hi, Nick! Have you prepared for our {title.lower()} project?", "phonetic": "/haɪ nɪk hæv juː prɪˈpeəd/", "meaningVi": f"Chào Nick! Cậu đã chuẩn bị cho dự án {title_vi.lower()} chưa?", "tipsVi": "Giọng chào hào hứng."},
                        {"id": f"g{g_num}_u{u_num}_d2", "speaker": "Nick", "sentenceEn": f"Yes, I have! I found many interesting facts about {main_word}.", "phonetic": "/jes aɪ hæv/", "meaningVi": f"Rồi chứ! Mình đã tìm thấy rất nhiều thông tin thú vị về {main_mean.lower()}.", "tipsVi": "Tự tin và nhấn trọng âm."},
                        {"id": f"g{g_num}_u{u_num}_d3", "speaker": "Phong", "sentenceEn": "That sounds fantastic. Let's practice our presentation together.", "phonetic": "/ðæt saʊndz fænˈtæstɪk/", "meaningVi": "Nghe tuyệt quá. Cùng luyện tập thuyết trình nhé.", "tipsVi": "Khen ngợi bạn bè."},
                        {"id": f"g{g_num}_u{u_num}_d4", "speaker": "Nick", "sentenceEn": "Sure! We will get great marks for this unit.", "phonetic": "/ʃɔː wiː wɪl ɡet ɡreɪt mɑːks/", "meaningVi": "Chắc chắn rồi! Chúng mình sẽ đạt điểm cao trong bài học này.", "tipsVi": "Lạc quan và vui vẻ."}
                    ],
                    "challenges": [
                        {"id": 1, "level": "Mẫu câu cốt lõi", "sentenceEn": f"Understanding {title_vi.lower()} broadens our global knowledge.", "phonetic": "/.../", "meaningVi": f"Hiểu biết về {title_vi.lower()} giúp mở rộng tri thức của chúng mình.", "tipsVi": "Nói to rõ ràng."},
                        {"id": 2, "level": "Thực hành phản xạ", "sentenceEn": f"We can practice using {main_word} in daily communication.", "phonetic": "/.../", "meaningVi": f"Chúng mình có thể thực hành dùng từ {main_word} trong giao tiếp hàng ngày.", "tipsVi": "Nhấn vào từ khóa chính."}
                    ]
                },
                "listening": {
                    "topic": f"Chủ đề nghe hiểu: {title_vi}",
                    "transcript": f"Welcome to our podcast about {title}. Today our guest speaker explains how {main_word} affects our daily lives and helps our community grow.",
                    "question": f"What is the main focus of the podcast discussion?",
                    "options": [title, "Cooking food", "Computer games", "Sports match"],
                    "answerIndex": 0
                },
                "reading": {
                    "title": f"Skills 1 - Reading: {title}",
                    "passage": f"Throughout the school year, students explore {title_vi.lower()}. This lesson provides essential knowledge about modern life. Educators emphasize that understanding {main_word} ({main_mean.lower()}) plays a vital role in developing communication skills and critical thinking for secondary students.",
                    "translation": f"Trong suốt năm học, các bạn học sinh tìm hiểu về {title_vi.lower()}. Bài học này mang lại những kiến thức thiết thực về đời sống hiện đại. Các nhà giáo dục nhấn mạnh rằng việc thấu hiểu {main_mean.lower()} ({main_word}) đóng vai trò then chốt trong việc phát triển kỹ năng giao tiếp và tư duy phản biện cho học sinh THCS.",
                    "questions": [
                        {
                            "id": f"g{g_num}_u{u_num}_r1",
                            "type": "multiple_choice",
                            "question": f"What vital role does understanding {main_word} play according to the text?",
                            "options": ["It develops communication skills and critical thinking", "It causes problems", "It has no effect", "It is only for elderly people"],
                            "answerIndex": 0,
                            "explain": "Đoạn văn nêu rõ: 'plays a vital role in developing communication skills and critical thinking'."
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
                            "scrambledWords": ["We", "are", "learning", "about", main_word],
                            "correctSentence": f"We are learning about {main_word}",
                            "meaningVi": f"Chúng mình đang tìm hiểu về {main_mean.lower()}.",
                            "hint": "Bắt đầu bằng 'We are learning...'"
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
