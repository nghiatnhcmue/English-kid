# -*- coding: utf-8 -*-
"""
add_dialogues_and_expand_speaking.py
Cập nhật toàn bộ 12 Unit trong src/data/:
1. Bổ sung đoạn hội thoại Getting Started chuẩn sách giáo khoa (10-12 câu thoại đối đáp theo nhân vật).
2. Mở rộng bộ câu luyện phát âm & chấm điểm AI (Speaking Challenges) lên 6-8 câu đa dạng.
3. Cung cấp đầy đủ phiên âm IPA, dịch nghĩa tiếng Việt và mẹo phát âm cho từng câu.
"""

import json
import os

DATA_DIR = os.path.join(os.path.dirname(__file__), '..', 'src', 'data')

DIALOGUES_AND_CHALLENGES = {
    1: {
        "dialogueTitle": "Getting Started: A Special Day",
        "dialogueContext": "Phong, Duy và Vy gặp nhau trong buổi sáng đầu tiên của năm học mới đến trường.",
        "dialogueLines": [
            {
                "id": "u1_d1",
                "speaker": "Phong",
                "sentenceEn": "Hi, Duy.",
                "phonetic": "/haɪ duːi/",
                "meaningVi": "Chào Duy.",
                "tipsVi": "Chào hỏi thân mật, giọng vui tươi hào hứng."
            },
            {
                "id": "u1_d2",
                "speaker": "Duy",
                "sentenceEn": "Hi, Phong. Are you ready?",
                "phonetic": "/haɪ fɒŋ ɑː juː ˈredi/",
                "meaningVi": "Chào Phong. Cậu đã sẵn sàng chưa?",
                "tipsVi": "Lên giọng ở cuối câu hỏi Yes/No: \"ready↗\"."
            },
            {
                "id": "u1_d3",
                "speaker": "Phong",
                "sentenceEn": "Yes, just a minute.",
                "phonetic": "/jes dʒʌst ə ˈmɪnɪt/",
                "meaningVi": "Rồi, đợi tớ một lát nhé.",
                "tipsVi": "Nối âm nhẹ: \"just_a\" (/dʒʌstə/)."
            },
            {
                "id": "u1_d4",
                "speaker": "Phong",
                "sentenceEn": "Oh, this is Duy, my new friend.",
                "phonetic": "/əʊ ðɪs ɪz duːi maɪ njuː frend/",
                "meaningVi": "Ồ, đây là Duy, bạn mới của mình.",
                "tipsVi": "Đặt đầu lưỡi giữa hai hàm răng khi phát âm \"this\" (/ðɪs/)."
            },
            {
                "id": "u1_d5",
                "speaker": "Vy",
                "sentenceEn": "Hi, Duy. Nice to meet you.",
                "phonetic": "/haɪ duːi naɪs tuː miːt juː/",
                "meaningVi": "Chào Duy. Rất vui được gặp bạn.",
                "tipsVi": "Phát âm rõ âm cuối /s/ trong \"Nice\"."
            },
            {
                "id": "u1_d6",
                "speaker": "Duy",
                "sentenceEn": "Nice to meet you, too.",
                "phonetic": "/naɪs tuː miːt juː tuː/",
                "meaningVi": "Mình cũng rất vui được gặp bạn.",
                "tipsVi": "Nhấn giọng vào \"too\" ở cuối câu để biểu lộ sự đồng tình."
            },
            {
                "id": "u1_d7",
                "speaker": "Duy",
                "sentenceEn": "I live near here, and we go to the same school.",
                "phonetic": "/aɪ lɪv nɪə hɪə ænd wiː ɡəʊ tuː ðə seɪm skuːl/",
                "meaningVi": "Tớ sống gần đây và chúng mình học cùng trường đấy.",
                "tipsVi": "Chú ý phát âm rõ âm /l/ ở cuối từ \"school\"."
            },
            {
                "id": "u1_d8",
                "speaker": "Phong",
                "sentenceEn": "Good. Your school bag looks heavy.",
                "phonetic": "/ɡʊd jɔː skuːl bæɡ lʊks ˈhevi/",
                "meaningVi": "Tốt quá. Cặp sách của cậu trông có vẻ nặng nhỉ.",
                "tipsVi": "Nhấn giọng vào tính từ \"heavy\" để thể hiện sự quan tâm."
            },
            {
                "id": "u1_d9",
                "speaker": "Duy",
                "sentenceEn": "Yes, it is. I have new books, a calculator, and new pens.",
                "phonetic": "/jes ɪt ɪz aɪ hæv njuː bʊks ə ˈkælkjuleɪtə ænd njuː penz/",
                "meaningVi": "Ừ, nặng thật. Tớ có sách mới, máy tính cầm tay và bút mới.",
                "tipsVi": "Liệt kê đồ dùng: lên giọng ở \"books↗\", \"calculator↗\" và xuống giọng ở \"pens↘\"."
            },
            {
                "id": "u1_d10",
                "speaker": "Vy",
                "sentenceEn": "And you are wearing the new uniform, Duy!",
                "phonetic": "/ænd juː ɑː ˈweərɪŋ ðə njuː ˈjuːnɪfɔːm duːi/",
                "meaningVi": "Và cậu đang mặc bộ đồng phục mới nữa kìa, Duy!",
                "tipsVi": "Ngắt nhịp tự nhiên sau \"uniform\" và biểu cảm ngạc nhiên vui vẻ."
            },
            {
                "id": "u1_d11",
                "speaker": "Duy",
                "sentenceEn": "Yes, I look smart!",
                "phonetic": "/jes aɪ lʊk smɑːt/",
                "meaningVi": "Đúng vậy, trông tớ bảnh bao chứ!",
                "tipsVi": "Âm /ɑː/ trong \"smart\" kéo dài sâu trong vòm họng."
            },
            {
                "id": "u1_d12",
                "speaker": "Phong",
                "sentenceEn": "Let's go!",
                "phonetic": "/lets ɡəʊ/",
                "meaningVi": "Chúng mình đi thôi nào!",
                "tipsVi": "Dứt khoát, hào hứng và sẵn sàng bắt đầu ngày học mới."
            }
        ],
        "extraChallenges": [
            {
                "id": "spk-5",
                "level": "Hỏi & Đáp trường lớp",
                "sentenceEn": "What subjects do you have on Monday?",
                "phonetic": "/wɒt ˈsʌbdʒɪkts duː juː hæv ɒn ˈmʌndeɪ/",
                "meaningVi": "Bạn có những môn học nào vào ngày thứ Hai?",
                "tipsVi": "Câu hỏi Wh- xuống giọng ở cuối câu: \"Monday↘\"."
            },
            {
                "id": "spk-6",
                "level": "Thói quen hàng ngày",
                "sentenceEn": "We often do homework together in the library.",
                "phonetic": "/wiː ˈɒfn duː ˈhəʊmwɜːk təˈɡeðər ɪn ðə ˈlaɪbrəri/",
                "meaningVi": "Chúng mình thường cùng nhau làm bài tập ở thư viện.",
                "tipsVi": "Nhấn vào trạng từ tần suất \"often\" và danh từ \"library\"."
            }
        ]
    },
    2: {
        "dialogueTitle": "Getting Started: A Look at the House",
        "dialogueContext": "Elena gọi điện video cho Mi để chúc mừng và tham quan ngôi nhà mới của Mi.",
        "dialogueLines": [
            {
                "id": "u2_d1",
                "speaker": "Elena",
                "sentenceEn": "Hello, Mi.",
                "phonetic": "/həˈləʊ miː/",
                "meaningVi": "Chào Mi.",
                "tipsVi": "Chào hỏi vui tươi, ấm áp."
            },
            {
                "id": "u2_d2",
                "speaker": "Mi",
                "sentenceEn": "Hi, Elena. Welcome to my new home!",
                "phonetic": "/haɪ ɪˈleɪnə ˈwelkəm tuː maɪ njuː həʊm/",
                "meaningVi": "Chào Elena. Chào mừng bạn đến nhà mới của mình!",
                "tipsVi": "Nhấn giọng vào \"Welcome\" và \"new home\"."
            },
            {
                "id": "u2_d3",
                "speaker": "Elena",
                "sentenceEn": "Wow, it is so beautiful! Is that your living room?",
                "phonetic": "/waʊ ɪt ɪz səʊ ˈbjuːtɪfl ɪz ðæt jɔː ˈlɪvɪŋ ruːm/",
                "meaningVi": "Chà, đẹp quá! Đó là phòng khách của bạn à?",
                "tipsVi": "Biểu lộ sự trầm trồ, lên giọng ở \"living room↗\"."
            },
            {
                "id": "u2_d4",
                "speaker": "Mi",
                "sentenceEn": "Yes, it is. There is a sofa, a table, and a big television.",
                "phonetic": "/jes ɪt ɪz ðeər ɪz ə ˈsəʊfə ə ˈteɪbl ænd ə bɪɡ ˈtelɪvɪʒn/",
                "meaningVi": "Đúng rồi. Có ghế sô-pha, bàn và một chiếc ti vi lớn.",
                "tipsVi": "Đọc rõ cấu trúc \"There is a...\" mô tả đồ vật."
            },
            {
                "id": "u2_d5",
                "speaker": "Elena",
                "sentenceEn": "How many rooms are there in your house?",
                "phonetic": "/haʊ ˈmeni ruːmz ɑː ðeər ɪn jɔː haʊs/",
                "meaningVi": "Có bao nhiêu phòng trong ngôi nhà của bạn?",
                "tipsVi": "Câu hỏi \"How many\" xuống giọng ở cuối câu: \"house↘\"."
            },
            {
                "id": "u2_d6",
                "speaker": "Mi",
                "sentenceEn": "There are six rooms: a living room, a kitchen, and four bedrooms.",
                "phonetic": "/ðeər ɑː sɪks ruːmz ə ˈlɪvɪŋ ruːm ə ˈkɪtʃɪn ænd fɔː ˈbedruːmz/",
                "meaningVi": "Có sáu phòng: một phòng khách, một phòng bếp và bốn phòng ngủ.",
                "tipsVi": "Đọc rõ âm số nhiều /z/ trong \"rooms\" và \"bedrooms\"."
            },
            {
                "id": "u2_d7",
                "speaker": "Elena",
                "sentenceEn": "Where is your dog, Luke?",
                "phonetic": "/weər ɪz jɔː dɒɡ luːk/",
                "meaningVi": "Chú cún Luke của bạn đâu rồi?",
                "tipsVi": "Phát âm rõ tên riêng \"Luke\" với âm /k/ ở cuối."
            },
            {
                "id": "u2_d8",
                "speaker": "Mi",
                "sentenceEn": "He is behind the sofa, sleeping under the lamp.",
                "phonetic": "/hiː ɪz bɪˈhaɪnd ðə ˈsəʊfə ˈsliːpɪŋ ˈʌndə ðə læmp/",
                "meaningVi": "Nó đang ở sau ghế sô-pha, ngủ dưới chân đèn.",
                "tipsVi": "Nhấn vào giới từ chỉ vị trí: \"behind\" và \"under\"."
            },
            {
                "id": "u2_d9",
                "speaker": "Elena",
                "sentenceEn": "He is so cute!",
                "phonetic": "/hiː ɪz səʊ kjuːt/",
                "meaningVi": "Chú cún dễ thương quá!",
                "tipsVi": "Cảm thán nhẹ nhàng, nhấn vào tính từ \"cute\" (/kjuːt/)."
            },
            {
                "id": "u2_d10",
                "speaker": "Mi",
                "sentenceEn": "Thank you. Let me show you my bedroom.",
                "phonetic": "/θæŋk juː let miː ʃəʊ juː maɪ ˈbedruːm/",
                "meaningVi": "Cảm ơn bạn. Để mình cho bạn xem phòng ngủ của mình nhé.",
                "tipsVi": "Âm /θ/ trong \"Thank\" kẹp nhẹ lưỡi giữa hai hàm răng."
            }
        ],
        "extraChallenges": [
            {
                "id": "spk-5",
                "level": "Mô tả phòng ốc",
                "sentenceEn": "There is a poster on the wall above the bed.",
                "phonetic": "/ðeər ɪz ə ˈpəʊstər ɒn ðə wɔːl əˈbʌv ðə bed/",
                "meaningVi": "Có một bức áp phích trên tường phía trên giường ngủ.",
                "tipsVi": "Luyện các giới từ \"on the wall\" và \"above the bed\"."
            },
            {
                "id": "spk-6",
                "level": "Cảm nghĩ ngôi nhà",
                "sentenceEn": "My favourite room in the house is the cosy living room.",
                "phonetic": "/maɪ ˈfeɪvərɪt ruːm ɪn ðə haʊs ɪz ðə ˈkəʊzi ˈlɪvɪŋ ruːm/",
                "meaningVi": "Căn phòng em yêu thích nhất trong nhà là phòng khách ấm cúng.",
                "tipsVi": "Nhấn giọng vào \"favourite\" và \"cosy\"."
            }
        ]
    },
    3: {
        "dialogueTitle": "Getting Started: A Surprise Guest",
        "dialogueContext": "Phong và Nam đang có buổi dã ngoại tại công viên thì Châu và Mai xuất hiện.",
        "dialogueLines": [
            {
                "id": "u3_d1",
                "speaker": "Phong",
                "sentenceEn": "Hi, Nam. The weather is so nice today!",
                "phonetic": "/haɪ næm ðə ˈweðər ɪz səʊ naɪs təˈdeɪ/",
                "meaningVi": "Chào Nam. Thời tiết hôm nay đẹp thật đấy!",
                "tipsVi": "Âm /ð/ trong \"weather\" rung nhẹ dây thanh quản."
            },
            {
                "id": "u3_d2",
                "speaker": "Nam",
                "sentenceEn": "Yes, it is great for a picnic in the park.",
                "phonetic": "/jes ɪt ɪz ɡreɪt fɔːr ə ˈpɪknɪk ɪn ðə pɑːk/",
                "meaningVi": "Ừ, rất tuyệt cho một buổi dã ngoại ở công viên.",
                "tipsVi": "Nhấn vào tính từ \"great\" và danh từ \"picnic\"."
            },
            {
                "id": "u3_d3",
                "speaker": "Phong",
                "sentenceEn": "Look! Who is that girl with long black hair?",
                "phonetic": "/lʊk huː ɪz ðæt ɡɜːl wɪð lɒŋ blæk heə/",
                "meaningVi": "Nhìn kìa! Cô bạn có mái tóc đen dài kia là ai thế?",
                "tipsVi": "Cụm miêu tả ngoại hình: \"long black hair\" nối tự nhiên."
            },
            {
                "id": "u3_d4",
                "speaker": "Nam",
                "sentenceEn": "That is Chau. She is in class 6A.",
                "phonetic": "/ðæt ɪz tʃaʊ ʃiː ɪz ɪn klɑːs sɪks eɪ/",
                "meaningVi": "Đó là Châu. Bạn ấy học lớp 6A.",
                "tipsVi": "Giới thiệu bạn bè tự nhiên, rõ ràng."
            },
            {
                "id": "u3_d5",
                "speaker": "Phong",
                "sentenceEn": "She looks very friendly and sporty.",
                "phonetic": "/ʃiː lʊks ˈveri ˈfrendli ænd ˈspɔːti/",
                "meaningVi": "Trông bạn ấy rất thân thiện và yêu thể thao.",
                "tipsVi": "Các tính từ chỉ tính cách: \"friendly\" và \"sporty\"."
            },
            {
                "id": "u3_d6",
                "speaker": "Nam",
                "sentenceEn": "Yes, she plays basketball very well.",
                "phonetic": "/jes ʃiː pleɪz ˈbɑːskɪtbɔːl ˈveri wel/",
                "meaningVi": "Đúng rồi, bạn ấy chơi bóng rổ rất cừ khôi.",
                "tipsVi": "Nhấn giọng vào trạng từ \"very well\"."
            },
            {
                "id": "u3_d7",
                "speaker": "Chau",
                "sentenceEn": "Hi, Phong! Hi, Nam! Can we sit here?",
                "phonetic": "/haɪ fɒŋ haɪ næm kæn wiː sɪt hɪə/",
                "meaningVi": "Chào Phong! Chào Nam! Chúng mình ngồi cùng ở đây được không?",
                "tipsVi": "Câu xin phép lịch sự: lên giọng ở cuối \"here↗\"."
            },
            {
                "id": "u3_d8",
                "speaker": "Phong",
                "sentenceEn": "Sure! Please have some biscuits and fruit.",
                "phonetic": "/ʃʊə pliːz hæv sʌm ˈbɪskɪts ænd fruːt/",
                "meaningVi": "Chắc chắn rồi! Mời các bạn dùng bánh quy và hoa quả.",
                "tipsVi": "Hiếu khách, ấm áp: nhấn \"Sure!\" và \"Please\"."
            },
            {
                "id": "u3_d9",
                "speaker": "Chau",
                "sentenceEn": "Thank you. You are so kind!",
                "phonetic": "/θæŋk juː juː ɑː səʊ kaɪnd/",
                "meaningVi": "Cảm ơn các bạn. Các bạn thật tốt bụng!",
                "tipsVi": "Biểu lộ sự biết ơn chân thành, nhấn vào \"kind\"."
            },
            {
                "id": "u3_d10",
                "speaker": "Nam",
                "sentenceEn": "Let's play badminton together after eating.",
                "phonetic": "/lets pleɪ ˈbædmɪntən təˈɡeðər ˈɑːftər ˈiːtɪŋ/",
                "meaningVi": "Ăn xong chúng mình cùng chơi cầu lông nhé.",
                "tipsVi": "Rủ rê bạn bè: \"Let's play... together\"."
            }
        ],
        "extraChallenges": [
            {
                "id": "spk-5",
                "level": "Miêu tả ngoại hình",
                "sentenceEn": "My best friend has round blue eyes and a friendly smile.",
                "phonetic": "/maɪ best frend hæz raʊnd bluː aɪz ænd ə ˈfrendli smaɪl/",
                "meaningVi": "Bạn thân nhất của em có đôi mắt tròn xanh biếc và nụ cười thân thiện.",
                "tipsVi": "Chú ý phát âm rõ âm /z/ trong \"eyes\" và /l/ trong \"smile\"."
            },
            {
                "id": "spk-6",
                "level": "Tính cách bạn bè",
                "sentenceEn": "She is very creative and always helps other classmates.",
                "phonetic": "/ʃiː ɪz ˈveri kriˈeɪtɪv ænd ˈɔːlweɪz helps ˈʌðə ˈklɑːsmeɪts/",
                "meaningVi": "Bạn ấy rất sáng tạo và luôn giúp đỡ các bạn cùng lớp.",
                "tipsVi": "Nhấn vào tính từ \"creative\" và trạng từ \"always\"."
            }
        ]
    },
    4: {
        "dialogueTitle": "Getting Started: Lost in the Old Town",
        "dialogueContext": "Phong và Nick cùng đi dạo trong phố cổ Hội An và tìm đường đến Nhà cổ Tấn Ký.",
        "dialogueLines": [
            {
                "id": "u4_d1",
                "speaker": "Nick",
                "sentenceEn": "Phong, where are we going now?",
                "phonetic": "/fɒŋ weər ɑː wiː ˈɡəʊɪŋ naʊ/",
                "meaningVi": "Phong ơi, bây giờ chúng mình đang đi đâu thế?",
                "tipsVi": "Câu hỏi hỏi đường tự nhiên: \"where are we going now\"."
            },
            {
                "id": "u4_d2",
                "speaker": "Phong",
                "sentenceEn": "We are going to Tan Ky House in the old town.",
                "phonetic": "/wiː ɑː ˈɡəʊɪŋ tuː tæn kiː haʊs ɪn ðə əʊld taʊn/",
                "meaningVi": "Chúng mình đang đến Nhà cổ Tấn Ký trong khu phố cổ.",
                "tipsVi": "Phát âm rõ tên riêng \"Tan Ky House\" và cụm \"old town\"."
            },
            {
                "id": "u4_d3",
                "speaker": "Nick",
                "sentenceEn": "Is it far from here?",
                "phonetic": "/ɪz ɪt fɑː frəm hɪə/",
                "meaningVi": "Nơi đó có xa đây không?",
                "tipsVi": "Lên giọng ở cuối câu hỏi Yes/No: \"here↗\"."
            },
            {
                "id": "u4_d4",
                "speaker": "Phong",
                "sentenceEn": "No, it is quite near. But I think we are lost!",
                "phonetic": "/nəʊ ɪt ɪz kwaɪt nɪə bʌt aɪ θɪŋk wiː ɑː lɒst/",
                "meaningVi": "Không, khá gần thôi. Nhưng tớ nghĩ chúng mình bị lạc rồi!",
                "tipsVi": "Âm /θ/ trong \"think\" và phát âm dứt khoát \"lost\"."
            },
            {
                "id": "u4_d5",
                "speaker": "Nick",
                "sentenceEn": "Look at the map! The street here is narrower.",
                "phonetic": "/lʊk æt ðə mæp ðə striːt hɪər ɪz ˈnærəʊə/",
                "meaningVi": "Nhìn vào bản đồ xem! Con phố ở đây hẹp hơn.",
                "tipsVi": "Tính từ so sánh hơn: \"narrower\" (/ˈnærəʊə/)."
            },
            {
                "id": "u4_d6",
                "speaker": "Phong",
                "sentenceEn": "Yes, and the houses here are older and more historic.",
                "phonetic": "/jes ænd ðə ˈhaʊzɪz hɪər ɑːr ˈəʊldər ænd mɔː hɪˈstɒrɪk/",
                "meaningVi": "Đúng rồi, và những ngôi nhà ở đây cổ kính và mang nhiều tính lịch sử hơn.",
                "tipsVi": "So sánh hơn: \"older\" và \"more historic\"."
            },
            {
                "id": "u4_d7",
                "speaker": "Nick",
                "sentenceEn": "Let's ask that woman for directions.",
                "phonetic": "/lets ɑːsk ðæt ˈwʊmən fɔː dəˈrekʃnz/",
                "meaningVi": "Chúng mình hãy hỏi đường cô kia nhé.",
                "tipsVi": "Cụm từ \"ask for directions\" (hỏi đường đi)."
            },
            {
                "id": "u4_d8",
                "speaker": "Phong",
                "sentenceEn": "Excuse me, could you tell us the way to Tan Ky House?",
                "phonetic": "/ɪkˈskjuːz miː kʊd juː tel ʌs ðə weɪ tuː tæn kiː haʊs/",
                "meaningVi": "Xin lỗi cô, cô có thể chỉ đường cho chúng cháu đến Nhà cổ Tấn Ký không ạ?",
                "tipsVi": "Cách mở lời hỏi đường lịch sự chuẩn bản xứ: \"Excuse me, could you...\"."
            },
            {
                "id": "u4_d9",
                "speaker": "Người dân",
                "sentenceEn": "Go straight, then turn left at the corner.",
                "phonetic": "/ɡəʊ streɪt ðen tɜːn left æt ðə ˈkɔːnə/",
                "meaningVi": "Các cháu cứ đi thẳng rồi rẽ trái ở góc phố nhé.",
                "tipsVi": "Chỉ dẫn đường: \"Go straight\" và \"turn left\"."
            },
            {
                "id": "u4_d10",
                "speaker": "Nick",
                "sentenceEn": "Thank you very much. Hoi An people are so helpful!",
                "phonetic": "/θæŋk juː ˈveri mʌtʃ hɔɪ æn ˈpiːpl ɑː səʊ ˈhelpfl/",
                "meaningVi": "Cháu cảm ơn cô rất nhiều. Người dân Hội An thật nhiệt tình!",
                "tipsVi": "Khen ngợi chân thành, nhấn tính từ \"helpful\"."
            }
        ],
        "extraChallenges": [
            {
                "id": "spk-5",
                "level": "So sánh khu phố",
                "sentenceEn": "Life in the countryside is more peaceful than in the city.",
                "phonetic": "/laɪf ɪn ðə ˈkʌntrisaɪd ɪz mɔː ˈpiːsfl ðæn ɪn ðə ˈsɪti/",
                "meaningVi": "Cuộc sống ở vùng nông thôn thanh bình hơn ở thành phố.",
                "tipsVi": "Cấu trúc so sánh hơn tính từ dài: \"more peaceful than\"."
            },
            {
                "id": "spk-6",
                "level": "Hỏi & Chỉ đường",
                "sentenceEn": "Take the second turning on the right to reach the post office.",
                "phonetic": "/teɪk ðə ˈsekənd ˈtɜːnɪŋ ɒn ðə raɪt tuː riːtʃ ðə pəʊst ˈɒfɪs/",
                "meaningVi": "Hãy rẽ ở ngã rẽ thứ hai bên tay phải để đến bưu điện.",
                "tipsVi": "Mẫu câu chỉ đường chuẩn: \"Take the second turning on the right\"."
            }
        ]
    },
    5: {
        "dialogueTitle": "Getting Started: Geography Club",
        "dialogueContext": "Cô giáo phụ trách và các bạn Nick, Mai đang lên kế hoạch cho chuyến đi thực tế của CLB Địa lý.",
        "dialogueLines": [
            {
                "id": "u5_d1",
                "speaker": "Cô giáo",
                "sentenceEn": "Welcome back to our Geography Club members!",
                "phonetic": "/ˈwelkəm bæk tuː ˈaʊə dʒiˈɒɡrəfi klʌb ˈmembəz/",
                "meaningVi": "Chào mừng các thành viên quay lại Câu lạc bộ Địa lý!",
                "tipsVi": "Lời chào đón nồng hậu, giọng tự tin phấn khởi."
            },
            {
                "id": "u5_d2",
                "speaker": "Nick",
                "sentenceEn": "Hello, teacher. What are we discussing today?",
                "phonetic": "/həˈləʊ ˈtiːtʃə wɒt ɑː wiː dɪˈskʌsɪŋ təˈdeɪ/",
                "meaningVi": "Chào cô ạ. Hôm nay chúng ta thảo luận về điều gì ạ?",
                "tipsVi": "Lễ phép, phát âm rõ động từ \"discussing\"."
            },
            {
                "id": "u5_d3",
                "speaker": "Cô giáo",
                "sentenceEn": "We are choosing a natural wonder in Viet Nam for our field trip.",
                "phonetic": "/wiː ɑː ˈtʃuːzɪŋ ə ˈnætʃrəl ˈwʌndər ɪn vjet næm fɔːr ˈaʊə fiːld trɪp/",
                "meaningVi": "Chúng ta sẽ chọn một kỳ quan thiên nhiên ở Việt Nam cho chuyến đi dã ngoại.",
                "tipsVi": "Cụm danh từ cốt lõi: \"natural wonder\" và \"field trip\"."
            },
            {
                "id": "u5_d4",
                "speaker": "Mai",
                "sentenceEn": "I suggest Ha Long Bay! It has thousands of limestone islands.",
                "phonetic": "/aɪ səˈdʒest hɑː lɒŋ beɪ ɪt hæz ˈθaʊzndz əv ˈlaɪmstəʊn ˈaɪləndz/",
                "meaningVi": "Em đề xuất Vịnh Hạ Long ạ! Nơi đó có hàng nghìn hòn đảo đá vôi.",
                "tipsVi": "Từ \"islands\" câm chữ s: phát âm là /ˈaɪləndz/."
            },
            {
                "id": "u5_d5",
                "speaker": "Nick",
                "sentenceEn": "That sounds amazing. What about Mount Fansipan?",
                "phonetic": "/ðæt saʊndz əˈmeɪzɪŋ wɒt əˈbaʊt maʊnt ˈfænsɪpæn/",
                "meaningVi": "Nghe tuyệt quá. Còn đỉnh Phan-xi-păng thì sao ạ?",
                "tipsVi": "Đưa ra gợi ý: \"What about...?\"."
            },
            {
                "id": "u5_d6",
                "speaker": "Cô giáo",
                "sentenceEn": "Fansipan is the highest peak in Indochina.",
                "phonetic": "/ˈfænsɪpæn ɪz ðə ˈhaɪɪst piːk ɪn ˌɪndəʊtʃaɪnə/",
                "meaningVi": "Phan-xi-păng là đỉnh núi cao nhất khu vực Đông Dương.",
                "tipsVi": "So sánh nhất: \"the highest peak\" (/ðə ˈhaɪɪst piːk/)."
            },
            {
                "id": "u5_d7",
                "speaker": "Mai",
                "sentenceEn": "What must we bring when traveling there?",
                "phonetic": "/wɒt mʌst wiː brɪŋ wen ˈtrævlɪŋ ðeə/",
                "meaningVi": "Chúng ta phải mang theo những đồ dùng gì khi đi đến đó ạ?",
                "tipsVi": "Động từ khuyết thiếu \"must\" thể hiện sự bắt buộc cần thiết."
            },
            {
                "id": "u5_d8",
                "speaker": "Cô giáo",
                "sentenceEn": "You must bring warm clothes, a waterproof coat, and good walking boots.",
                "phonetic": "/juː mʌst brɪŋ wɔːm kləʊðz ə ˈwɔːtəpruːf kəʊt ænd ɡʊd ˈwɔːkɪŋ buːts/",
                "meaningVi": "Các em phải mang quần áo ấm, áo mưa chống thấm và giày đi bộ tốt.",
                "tipsVi": "Liệt kê các đồ dùng: lên giọng ở từng món và hạ giọng ở cuối."
            },
            {
                "id": "u5_d9",
                "speaker": "Nick",
                "sentenceEn": "Must we bring a compass and a sleeping bag?",
                "phonetic": "/mʌst wiː brɪŋ ə ˈkʌmpəs ænd ə ˈsliːpɪŋ bæɡ/",
                "meaningVi": "Chúng em có phải mang theo com-pa la bàn và túi ngủ không ạ?",
                "tipsVi": "Lên giọng ở cuối câu hỏi Yes/No với Must: \"sleeping bag↗\"."
            },
            {
                "id": "u5_d10",
                "speaker": "Cô giáo",
                "sentenceEn": "Yes, you must. But you mustn't litter in the national park!",
                "phonetic": "/jes juː mʌst bʌt juː ˈmʌsnt ˈlɪtər ɪn ðə ˈnæʃnəl pɑːk/",
                "meaningVi": "Có chứ. Nhưng các em tuyệt đối không được xả rác trong vườn quốc gia!",
                "tipsVi": "Nhấn mạnh lệnh cấm đoán: \"mustn't litter\" (/ˈmʌsnt ˈlɪtə/)."
            }
        ],
        "extraChallenges": [
            {
                "id": "spk-5",
                "level": "Quy tắc an toàn du lịch",
                "sentenceEn": "You must listen to the tour guide carefully during the trip.",
                "phonetic": "/juː mʌst ˈlɪsn tuː ðə tʊə ɡaɪd ˈkeəfəli ˈdjʊərɪŋ ðə trɪp/",
                "meaningVi": "Bạn phải chăm chú lắng nghe hướng dẫn viên trong suốt chuyến đi.",
                "tipsVi": "Nhấn mạnh \"must listen\" và trạng từ \"carefully\"."
            },
            {
                "id": "spk-6",
                "level": "Bảo vệ môi trường tự nhiên",
                "sentenceEn": "We must not pick flowers or damage wild plants here.",
                "phonetic": "/wiː mʌst nɒt pɪk ˈflaʊəz ɔː ˈdæmɪdʒ waɪld plɑːnts hɪə/",
                "meaningVi": "Chúng ta không được hái hoa hay làm tổn hại đến cây cỏ tự nhiên ở đây.",
                "tipsVi": "Nhấn vào các động từ \"pick flowers\" và \"damage wild plants\"."
            }
        ]
    },
    6: {
        "dialogueTitle": "Getting Started: Happy New Year!",
        "dialogueContext": "Linda đến thăm gia đình Phong và cùng trò chuyện về phong tục Tết cổ truyền Việt Nam.",
        "dialogueLines": [
            {
                "id": "u6_d1",
                "speaker": "Linda",
                "sentenceEn": "Phong, does Viet Nam celebrate the New Year like England?",
                "phonetic": "/fɒŋ dʌz vjet næm ˈselɪbreɪt ðə njuː jɪə laɪk ˈɪŋɡlənd/",
                "meaningVi": "Phong ơi, Việt Nam có đón năm mới giống như ở nước Anh không?",
                "tipsVi": "Hỏi thăm thân thiện, lên giọng nhẹ ở \"England↗\"."
            },
            {
                "id": "u6_d2",
                "speaker": "Phong",
                "sentenceEn": "We celebrate Tet. It is the biggest festival in Viet Nam.",
                "phonetic": "/wiː ˈselɪbreɪt tet ɪt ɪz ðə ˈbɪɡɪst ˈfestɪvl ɪn vjet næm/",
                "meaningVi": "Chúng mình đón Tết. Đó là ngày hội lớn nhất ở Việt Nam.",
                "tipsVi": "Tự hào giới thiệu văn hóa dân tộc, nhấn \"biggest festival\"."
            },
            {
                "id": "u6_d3",
                "speaker": "Linda",
                "sentenceEn": "What do you do before Tet?",
                "phonetic": "/wɒt duː juː duː bɪˈfɔː tet/",
                "meaningVi": "Các bạn thường làm những gì trước Tết vậy?",
                "tipsVi": "Câu hỏi Wh- xuống giọng ở \"Tet↘\"."
            },
            {
                "id": "u6_d4",
                "speaker": "Phong",
                "sentenceEn": "We clean and decorate our house with peach blossoms.",
                "phonetic": "/wiː kliːn ænd ˈdekəreɪt ˈaʊə haʊs wɪð piːtʃ ˈblɒsəmz/",
                "meaningVi": "Chúng mình dọn dẹp và trang hoàng nhà cửa bằng những cành hoa đào.",
                "tipsVi": "Phát âm rõ cụm \"peach blossoms\" (/piːtʃ ˈblɒsəmz/)."
            },
            {
                "id": "u6_d5",
                "speaker": "Linda",
                "sentenceEn": "What traditional food do you eat at Tet?",
                "phonetic": "/wɒt trəˈdɪʃənl fuːd duː juː iːt æt tet/",
                "meaningVi": "Các bạn ăn món ăn truyền thống gì trong dịp Tết?",
                "tipsVi": "Cụm danh từ \"traditional food\" (món ăn truyền thống)."
            },
            {
                "id": "u6_d6",
                "speaker": "Phong",
                "sentenceEn": "We make banh chung with sticky rice, green beans, and pork.",
                "phonetic": "/wiː meɪk bæŋ tʃʊŋ wɪð ˈstɪki raɪs ɡriːn biːnz ænd pɔːk/",
                "meaningVi": "Chúng mình gói bánh chưng bằng gạo nếp, đỗ xanh và thịt lợn.",
                "tipsVi": "Liệt kê các nguyên liệu gói bánh thơm ngon."
            },
            {
                "id": "u6_d7",
                "speaker": "Linda",
                "sentenceEn": "Do children get presents?",
                "phonetic": "/duː ˈtʃɪldrən ɡet ˈpreznts/",
                "meaningVi": "Trẻ em có được nhận quà không bạn?",
                "tipsVi": "Lên giọng ở cuối câu hỏi: \"presents↗\"."
            },
            {
                "id": "u6_d8",
                "speaker": "Phong",
                "sentenceEn": "Yes! Children receive lucky money inside red envelopes.",
                "phonetic": "/jes ˈtʃɪldrən rɪˈsiːv ˈlʌki ˈmʌni ɪnˈsaɪd red ˈenvələʊps/",
                "meaningVi": "Có chứ! Trẻ em được nhận tiền lì xì trong những phong bao đỏ.",
                "tipsVi": "Hào hứng: \"lucky money\" và \"red envelopes\"."
            },
            {
                "id": "u6_d9",
                "speaker": "Linda",
                "sentenceEn": "What should people do during Tet?",
                "phonetic": "/wɒt ʃʊd ˈpiːpl duː ˈdjʊərɪŋ tet/",
                "meaningVi": "Mọi người nên làm gì trong những ngày Tết?",
                "tipsVi": "Hỏi về lời khuyên phong tục với động từ \"should\"."
            },
            {
                "id": "u6_d10",
                "speaker": "Phong",
                "sentenceEn": "People should wish each other good health and happiness!",
                "phonetic": "/ˈpiːpl ʃʊd wɪʃ iːtʃ ˈʌðə ɡʊd helθ ænd ˈhæpinəs/",
                "meaningVi": "Mọi người nên chúc nhau nhiều sức khỏe và niềm hạnh phúc!",
                "tipsVi": "Lời chúc tốt lành, ấm áp: \"good health and happiness\"."
            }
        ],
        "extraChallenges": [
            {
                "id": "spk-5",
                "level": "Lời khuyên năm mới",
                "sentenceEn": "You should not ask for lucky money from adults.",
                "phonetic": "/juː ʃʊd nɒt ɑːsk fɔː ˈlʌki ˈmʌni frəm ˈædʌlts/",
                "meaningVi": "Em không nên tự ý đòi tiền lì xì từ người lớn.",
                "tipsVi": "Khuyên nhủ lễ phép: \"should not ask for...\"."
            },
            {
                "id": "spk-6",
                "level": "Lời chúc Tết",
                "sentenceEn": "I wish you a joyful new year with good luck and success!",
                "phonetic": "/aɪ wɪʃ juː ə ˈdʒɔɪfl njuː jɪə wɪð ɡʊd lʌk ænd səkˈses/",
                "meaningVi": "Mình chúc bạn một năm mới tràn ngập niềm vui, may mắn và thành công!",
                "tipsVi": "Ngữ điệu chúc tụng tươi vui, truyền cảm."
            }
        ]
    },
    7: {
        "dialogueTitle": "Getting Started: What's On Today?",
        "dialogueContext": "Phong và Hùng đang ngồi xem lịch phát sóng các chương trình truyền hình yêu thích.",
        "dialogueLines": [
            {
                "id": "u7_d1",
                "speaker": "Phong",
                "sentenceEn": "What are you watching, Hung?",
                "phonetic": "/wɒt ɑː juː ˈwɒtʃɪŋ hʊŋ/",
                "meaningVi": "Cậu đang xem chương trình gì thế Hùng?",
                "tipsVi": "Hỏi tự nhiên, xuống giọng ở \"Hung↘\"."
            },
            {
                "id": "u7_d2",
                "speaker": "Hùng",
                "sentenceEn": "I am watching The Voice Kids. The singers are very talented.",
                "phonetic": "/aɪ æm ˈwɒtʃɪŋ ðə vɔɪs kɪdz ðə ˈsɪŋəz ɑː ˈveri ˈtæləntɪd/",
                "meaningVi": "Tớ đang xem Giọng hát Việt nhí. Các bạn thí sinh rất tài năng.",
                "tipsVi": "Khen ngợi: phát âm rõ tính từ \"talented\" (/ˈtæləntɪd/)."
            },
            {
                "id": "u7_d3",
                "speaker": "Phong",
                "sentenceEn": "Do you like watching animated cartoons?",
                "phonetic": "/duː juː laɪk ˈwɒtʃɪŋ ˈænɪmeɪtɪd kɑːˈtuːnz/",
                "meaningVi": "Cậu có thích xem phim hoạt hình không?",
                "tipsVi": "Lên giọng ở cuối câu hỏi Yes/No: \"cartoons↗\"."
            },
            {
                "id": "u7_d4",
                "speaker": "Hùng",
                "sentenceEn": "Yes, Tom and Jerry is my all-time favourite cartoon.",
                "phonetic": "/jes tɒm ænd ˈdʒeri ɪz maɪ ɔːl taɪm ˈfeɪvərɪt kɑːˈtuːn/",
                "meaningVi": "Có chứ, Tom và Jerry là bộ phim hoạt hình yêu thích nhất của tớ.",
                "tipsVi": "Nhấn giọng vào cụm từ \"all-time favourite\"."
            },
            {
                "id": "u7_d5",
                "speaker": "Phong",
                "sentenceEn": "Why do you like it so much?",
                "phonetic": "/waɪ duː juː laɪk ɪt səʊ mʌtʃ/",
                "meaningVi": "Tại sao cậu lại yêu thích bộ phim đó đến vậy?",
                "tipsVi": "Câu hỏi lý do với \"Why\": xuống giọng ở \"so much↘\"."
            },
            {
                "id": "u7_d6",
                "speaker": "Hùng",
                "sentenceEn": "Because it is colourful, funny, and entertaining.",
                "phonetic": "/bɪˈkɒz ɪt ɪz ˈkʌləfl ˈfʌni ænd ˌentəˈteɪnɪŋ/",
                "meaningVi": "Bởi vì phim rất nhiều màu sắc, hài hước và tính giải trí cao.",
                "tipsVi": "Liệt kê ba tính từ: \"colourful↗\", \"funny↗\", \"entertaining↘\"."
            },
            {
                "id": "u7_d7",
                "speaker": "Phong",
                "sentenceEn": "How many hours a day do you watch television?",
                "phonetic": "/haʊ ˈmeni ˈaʊəz ə deɪ duː juː wɒtʃ ˈtelɪvɪʒn/",
                "meaningVi": "Mỗi ngày cậu xem ti vi khoảng bao nhiêu tiếng?",
                "tipsVi": "Từ \"hours\" có âm h câm: phát âm là /ˈaʊəz/."
            },
            {
                "id": "u7_d8",
                "speaker": "Hùng",
                "sentenceEn": "Only about one hour, after I finish my homework.",
                "phonetic": "/ˈəʊnli əˈbaʊt wʌn ˈaʊər ˈɑːftər aɪ ˈfɪnɪʃ maɪ ˈhəʊmwɜːk/",
                "meaningVi": "Chỉ khoảng một tiếng thôi, sau khi tớ đã làm xong bài tập về nhà.",
                "tipsVi": "Thói quen tốt, nhấn vào \"one hour\" và \"finish\"."
            },
            {
                "id": "u7_d9",
                "speaker": "Phong",
                "sentenceEn": "Good habit! Too much screen time is bad for our eyes.",
                "phonetic": "/ɡʊd ˈhæbɪt tuː mʌtʃ skriːn taɪm ɪz bæd fɔːr ˈaʊər aɪz/",
                "meaningVi": "Thói quen tốt đấy! Nhìn màn hình quá nhiều sẽ hại cho mắt.",
                "tipsVi": "Khen ngợi và khuyên nhủ: \"screen time\" và \"eyes\"."
            },
            {
                "id": "u7_d10",
                "speaker": "Hùng",
                "sentenceEn": "Let's turn to the Discovery channel to watch wild animals!",
                "phonetic": "/lets tɜːn tuː ðə dɪˈskʌvəri ˈtʃænl tuː wɒtʃ waɪld ˈænɪmlz/",
                "meaningVi": "Chúng mình cùng chuyển sang kênh Discovery để xem thế giới động vật hoang dã nhé!",
                "tipsVi": "Hào hứng rủ bạn: \"Let's turn to...\"."
            }
        ],
        "extraChallenges": [
            {
                "id": "spk-5",
                "level": "Chương trình giáo dục",
                "sentenceEn": "I learn a lot of practical knowledge from science documentaries.",
                "phonetic": "/aɪ lɜːn ə lɒt əv ˈpræktɪkl ˈnɒlɪdʒ frəm ˈsaɪəns ˌdɒkjuˈmentriz/",
                "meaningVi": "Em học được rất nhiều kiến thức thực tế từ các bộ phim tài liệu khoa học.",
                "tipsVi": "Phát âm chuẩn từ \"documentaries\" (/ˌdɒkjuˈmentriz/)."
            },
            {
                "id": "spk-6",
                "level": "Bày tỏ quan điểm",
                "sentenceEn": "Although educational programmes are long, they are very useful.",
                "phonetic": "/ɔːlˈðəʊ ˌedʒuˈkeɪʃənl ˈprəʊɡræmz ɑː lɒŋ ðeɪ ɑː ˈveri ˈjuːsfl/",
                "meaningVi": "Mặc dù các chương trình giáo dục khá dài, nhưng chúng rất hữu ích.",
                "tipsVi": "Sử dụng liên từ nhượng bộ \"Although\" tự nhiên."
            }
        ]
    },
    8: {
        "dialogueTitle": "Getting Started: At the Gym",
        "dialogueContext": "Dương và Mai gặp nhau tại phòng tập thể thao của trường và hào hứng trò chuyện.",
        "dialogueLines": [
            {
                "id": "u8_d1",
                "speaker": "Dương",
                "sentenceEn": "Hi, Mai. You look very sporty today!",
                "phonetic": "/haɪ maɪ juː lʊk ˈveri ˈspɔːti təˈdeɪ/",
                "meaningVi": "Chào Mai. Hôm nay trông bạn rất khỏe khoắn và năng động đấy!",
                "tipsVi": "Khen ngợi bạn bè: nhấn tính từ \"sporty\" (/ˈspɔːti/)."
            },
            {
                "id": "u8_d2",
                "speaker": "Mai",
                "sentenceEn": "Thanks, Duong. I come here to do karate twice a week.",
                "phonetic": "/θæŋks duːəŋ aɪ kʌm hɪə tuː duː kəˈrɑːti twaɪs ə wiːk/",
                "meaningVi": "Cảm ơn Dương. Mình đến đây tập võ karate hai lần một tuần.",
                "tipsVi": "Cụm từ \"do karate\" và tần suất \"twice a week\"."
            },
            {
                "id": "u8_d3",
                "speaker": "Dương",
                "sentenceEn": "Karate? Wow, you are so strong and cool!",
                "phonetic": "/kəˈrɑːti waʊ juː ɑː səʊ strɒŋ ænd kuːl/",
                "meaningVi": "Karate á? Chà, bạn khỏe khoắn và ngầu quá đi!",
                "tipsVi": "Trầm trồ ngưỡng mộ: \"strong and cool\"."
            },
            {
                "id": "u8_d4",
                "speaker": "Mai",
                "sentenceEn": "What sports do you play, Duong?",
                "phonetic": "/wɒt spɔːts duː juː pleɪ duːəŋ/",
                "meaningVi": "Thế bạn thường chơi môn thể thao nào vậy Dương?",
                "tipsVi": "Hỏi han bạn bè tự nhiên với câu hỏi Wh-."
            },
            {
                "id": "u8_d5",
                "speaker": "Dương",
                "sentenceEn": "I usually play table tennis with my brother on Sundays.",
                "phonetic": "/aɪ ˈjuːʒuəli pleɪ ˈteɪbl ˈtenɪs wɪð maɪ ˈbrʌðər ɒn ˈsʌndeɪz/",
                "meaningVi": "Mình thường chơi bóng bàn với anh trai vào các ngày Chủ nhật.",
                "tipsVi": "Cụm danh từ \"table tennis\" và giới từ \"on Sundays\"."
            },
            {
                "id": "u8_d6",
                "speaker": "Mai",
                "sentenceEn": "Did you watch the football match on TV last night?",
                "phonetic": "/dɪd juː wɒtʃ ðə ˈfʊtbɔːl mætʃ ɒn ˌtiːˈviː lɑːst naɪt/",
                "meaningVi": "Tối qua bạn có xem trận bóng đá trên ti vi không?",
                "tipsVi": "Câu hỏi quá khứ đơn: lên giọng ở cuối câu: \"last night↗\"."
            },
            {
                "id": "u8_d7",
                "speaker": "Dương",
                "sentenceEn": "Yes, I did! Our school team played brilliantly and won!",
                "phonetic": "/jes aɪ dɪd ˈaʊə skuːl tiːm pleɪd ˈbrɪljəntli ænd wʌn/",
                "meaningVi": "Có chứ! Đội bóng trường mình đã thi đấu xuất sắc và giành chiến thắng!",
                "tipsVi": "Phát âm rõ động từ quá khứ \"played\" (/pleɪd/) và \"won\" (/wʌn/)."
            },
            {
                "id": "u8_d8",
                "speaker": "Mai",
                "sentenceEn": "Who scored the winning goal?",
                "phonetic": "/huː skɔːd ðə ˈwɪnɪŋ ɡəʊl/",
                "meaningVi": "Ai là người đã ghi bàn thắng quyết định thế bạn?",
                "tipsVi": "Hỏi về người ghi bàn: \"scored the winning goal\"."
            },
            {
                "id": "u8_d9",
                "speaker": "Dương",
                "sentenceEn": "Phong did! He kicked the ball straight into the top corner.",
                "phonetic": "/fɒŋ dɪd hiː kɪkt ðə bɔːl streɪt ˈɪntuː ðə tɒp ˈkɔːnə/",
                "meaningVi": "Là bạn Phong đấy! Cậu ấy sút bóng thẳng vào góc cao khung thành.",
                "tipsVi": "Âm đuôi -ed trong \"kicked\" phát âm là /t/ (/kɪkt/)."
            },
            {
                "id": "u8_d10",
                "speaker": "Mai",
                "sentenceEn": "Great! Playing sports keeps us healthy and fit.",
                "phonetic": "/ɡreɪt ˈpleɪɪŋ spɔːts kiːps ʌs ˈhelθi ænd fɪt/",
                "meaningVi": "Tuyệt vời! Chơi thể thao giúp chúng mình luôn khỏe mạnh và cân đối.",
                "tipsVi": "Kết luận đầy cảm hứng: \"healthy and fit\"."
            }
        ],
        "extraChallenges": [
            {
                "id": "spk-5",
                "level": "Kể về thành tích",
                "sentenceEn": "Last summer, I won first prize in our school swimming contest.",
                "phonetic": "/lɑːst ˈsʌmər aɪ wʌn fɜːst praɪz ɪn ˈaʊə skuːl ˈswɪmɪŋ ˈkɒntest/",
                "meaningVi": "Mùa hè năm ngoái, em đã giành giải nhất trong cuộc thi bơi lội của trường.",
                "tipsVi": "Thì quá khứ đơn: \"won first prize\"."
            },
            {
                "id": "spk-6",
                "level": "Thói quen thể thao",
                "sentenceEn": "Remember to do warm-up exercises before you start running.",
                "phonetic": "/rɪˈmembə tuː duː wɔːm ʌp ˈeksəsaɪzɪz bɪˈfɔː juː stɑːt ˈrʌnɪŋ/",
                "meaningVi": "Hãy nhớ khởi động kỹ trước khi bắt đầu chạy bộ nhé.",
                "tipsVi": "Lời khuyên thể thao: \"warm-up exercises\"."
            }
        ]
    },
    9: {
        "dialogueTitle": "Getting Started: What Nice Photos!",
        "dialogueContext": "Mai và Tom cùng ngắm các tấm bưu thiếp chụp các thành phố nổi tiếng trên thế giới.",
        "dialogueLines": [
            {
                "id": "u9_d1",
                "speaker": "Tom",
                "sentenceEn": "Mai, have a look at these postcards from my uncle.",
                "phonetic": "/maɪ hæv ə lʊk æt ðiːz ˈpəʊstkɑːdz frəm maɪ ˈʌŋkl/",
                "meaningVi": "Mai ơi, xem mấy tấm bưu thiếp của chú tớ gửi này.",
                "tipsVi": "Rủ bạn cùng xem: \"have a look at...\"."
            },
            {
                "id": "u9_d2",
                "speaker": "Mai",
                "sentenceEn": "Wow, what nice photos! Which city is this?",
                "phonetic": "/waʊ wɒt naɪs ˈfəʊtəʊz wɪtʃ ˈsɪti ɪz ðɪs/",
                "meaningVi": "Chà, ảnh chụp đẹp quá! Đây là thành phố nào vậy?",
                "tipsVi": "Câu cảm thán: \"What nice photos!\"."
            },
            {
                "id": "u9_d3",
                "speaker": "Tom",
                "sentenceEn": "It is Sydney. That is the famous Sydney Opera House.",
                "phonetic": "/ɪt ɪz ˈsɪdni ðæt ɪz ðə ˈfeɪməs ˈsɪdni ˈɒprə haʊs/",
                "meaningVi": "Đó là Sydney. Kia là Nhà hát Con Sò nổi tiếng của Sydney đấy.",
                "tipsVi": "Phát âm rõ danh từ riêng \"Sydney Opera House\"."
            },
            {
                "id": "u9_d4",
                "speaker": "Mai",
                "sentenceEn": "I know it! It looks like huge white sea shells.",
                "phonetic": "/aɪ nəʊ ɪt ɪt lʊks laɪk hjuːdʒ waɪt siː ʃelz/",
                "meaningVi": "Mình biết nơi này! Trông nó giống như những chiếc vỏ sò khổng lồ màu trắng.",
                "tipsVi": "So sánh hình tượng: \"looks like huge white sea shells\"."
            },
            {
                "id": "u9_d5",
                "speaker": "Tom",
                "sentenceEn": "And this one is London, the capital of the United Kingdom.",
                "phonetic": "/ænd ðɪs wʌn ɪz ˈlʌndən ðə ˈkæpɪtl əv ðə juːˈnaɪtɪd ˈkɪŋdəm/",
                "meaningVi": "Còn tấm này là London, thủ đô của Vương quốc Anh.",
                "tipsVi": "Từ \"capital\" (thủ đô) nhấn trọng âm đầu: /ˈkæpɪtl/."
            },
            {
                "id": "u9_d6",
                "speaker": "Mai",
                "sentenceEn": "Look at the big clock tower. Is that Big Ben?",
                "phonetic": "/lʊk æt ðə bɪɡ klɒk ˈtaʊə ɪz ðæt bɪɡ ben/",
                "meaningVi": "Nhìn tháp đồng hồ to lớn kìa. Đó là Big Ben phải không?",
                "tipsVi": "Lên giọng ở cuối câu hỏi: \"Big Ben↗\"."
            },
            {
                "id": "u9_d7",
                "speaker": "Tom",
                "sentenceEn": "Yes! And there is the red double-decker bus on the road.",
                "phonetic": "/jes ænd ðeər ɪz ðə red ˌdʌbl ˈdekə bʌs ɒn ðə rəʊd/",
                "meaningVi": "Đúng rồi! Và kia là chiếc xe buýt hai tầng màu đỏ trên đường phố.",
                "tipsVi": "Biểu tượng London: \"double-decker bus\" (/ˌdʌbl ˈdekə bʌs/)."
            },
            {
                "id": "u9_d8",
                "speaker": "Mai",
                "sentenceEn": "Which city is the cleanest and most peaceful?",
                "phonetic": "/wɪtʃ ˈsɪti ɪz ðə ˈkliːnɪst ænd məʊst ˈpiːsfl/",
                "meaningVi": "Thành phố nào là sạch sẽ và yên bình nhất vậy Tom?",
                "tipsVi": "So sánh nhất: \"the cleanest\" và \"most peaceful\"."
            },
            {
                "id": "u9_d9",
                "speaker": "Tom",
                "sentenceEn": "Stockholm in Sweden! It has lots of parks and canals.",
                "phonetic": "/ˈstɒkhəʊm ɪn ˈswiːdn ɪt hæz lɒts əv pɑːks ænd kəˈnælz/",
                "meaningVi": "Là Stockholm ở Thụy Điển đấy! Nơi đó có rất nhiều công viên và kênh đào.",
                "tipsVi": "Tên riêng quốc tế: \"Stockholm\" (/ˈstɒkhəʊm/)."
            },
            {
                "id": "u9_d10",
                "speaker": "Mai",
                "sentenceEn": "I hope I can travel around the world one day!",
                "phonetic": "/aɪ həʊp aɪ kæn ˈtrævl əˈraʊnd ðə wɜːld wʌn deɪ/",
                "meaningVi": "Mình ước một ngày nào đó được đi du lịch vòng quanh thế giới!",
                "tipsVi": "Ước mơ chân thành: \"travel around the world\"."
            }
        ],
        "extraChallenges": [
            {
                "id": "spk-5",
                "level": "So sánh thành phố",
                "sentenceEn": "Tokyo is one of the most modern and exciting cities in Asia.",
                "phonetic": "/ˈtəʊkiəʊ ɪz wʌn əv ðə məʊst ˈmɒdn ænd ɪkˈsaɪtɪŋ ˈsɪtiz ɪn ˈeɪʒə/",
                "meaningVi": "Tokyo là một trong những thành phố hiện đại và sôi động nhất châu Á.",
                "tipsVi": "So sánh nhất tính từ dài: \"most modern and exciting\"."
            },
            {
                "id": "spk-6",
                "level": "Trải nghiệm du lịch",
                "sentenceEn": "Have you ever visited a floating market in Da Nang?",
                "phonetic": "/hæv juː ˈevə ˈvɪzɪtɪd ə ˈfləʊtɪŋ ˈmɑːkɪt ɪn dɑː næŋ/",
                "meaningVi": "Bạn đã bao giờ ghé thăm một khu chợ nổi ở Đà Nẵng chưa?",
                "tipsVi": "Câu hỏi thì hiện tại hoàn thành trải nghiệm: lên giọng ở cuối."
            }
        ]
    },
    10: {
        "dialogueTitle": "Getting Started: My Future House",
        "dialogueContext": "Phong và Nick cùng phác thảo và tưởng tượng về ngôi nhà thông minh trong tương lai.",
        "dialogueLines": [
            {
                "id": "u10_d1",
                "speaker": "Nick",
                "sentenceEn": "What are you drawing, Phong?",
                "phonetic": "/wɒt ɑː juː ˈdrɔːɪŋ fɒŋ/",
                "meaningVi": "Cậu đang vẽ gì thế Phong?",
                "tipsVi": "Hỏi bạn thân thiện: \"What are you drawing...?\"."
            },
            {
                "id": "u10_d2",
                "speaker": "Phong",
                "sentenceEn": "I am drawing my dream house in the year 2050.",
                "phonetic": "/aɪ æm ˈdrɔːɪŋ maɪ driːm haʊs ɪn ðə jɪə ˈtwenti ˈfɪfti/",
                "meaningVi": "Tớ đang vẽ ngôi nhà mơ ước của mình vào năm 2050.",
                "tipsVi": "Năm 2050 đọc là \"twenty fifty\" (/ˈtwenti ˈfɪfti/)."
            },
            {
                "id": "u10_d3",
                "speaker": "Nick",
                "sentenceEn": "Where will your house be located?",
                "phonetic": "/weə wɪl jɔː haʊs biː ləʊˈkeɪtɪd/",
                "meaningVi": "Ngôi nhà của cậu sẽ nằm ở vị trí nào?",
                "tipsVi": "Thì tương lai đơn với \"will\": \"Where will your house be...\"."
            },
            {
                "id": "u10_d4",
                "speaker": "Phong",
                "sentenceEn": "It will be on an island in the middle of the blue ocean.",
                "phonetic": "/ɪt wɪl biː ɒn ən ˈaɪlənd ɪn ðə ˈmɪdl əv ðə bluː ˈəʊʃn/",
                "meaningVi": "Nó sẽ toạ lạc trên một hòn đảo ở giữa đại dương xanh thẳm.",
                "tipsVi": "Cụm vị trí độc đáo: \"in the middle of the blue ocean\"."
            },
            {
                "id": "u10_d5",
                "speaker": "Nick",
                "sentenceEn": "What will your house look like?",
                "phonetic": "/wɒt wɪl jɔː haʊs lʊk laɪk/",
                "meaningVi": "Trông ngôi nhà của cậu sẽ như thế nào?",
                "tipsVi": "Hỏi về diện mạo: \"What will it look like?\"."
            },
            {
                "id": "u10_d6",
                "speaker": "Phong",
                "sentenceEn": "It will look like a spaceship, surrounded by tall solar trees.",
                "phonetic": "/ɪt wɪl lʊk laɪk ə ˈspeɪsʃɪp səˈraʊndɪd baɪ tɔːl ˈsəʊlə triːz/",
                "meaningVi": "Nó sẽ trông giống một phi thuyền, được bao quanh bởi cây năng lượng mặt trời.",
                "tipsVi": "Phát âm rõ cụm \"solar trees\" (/ˈsəʊlə triːz/)."
            },
            {
                "id": "u10_d7",
                "speaker": "Nick",
                "sentenceEn": "Will there be smart appliances inside?",
                "phonetic": "/wɪl ðeə biː smɑːt əˈplaɪənsɪz ɪnˈsaɪd/",
                "meaningVi": "Bên trong sẽ có các thiết bị gia dụng thông minh chứ?",
                "tipsVi": "Lên giọng ở cuối câu hỏi Yes/No: \"inside↗\"."
            },
            {
                "id": "u10_d8",
                "speaker": "Phong",
                "sentenceEn": "Yes! Robots will cook meals, clean floors, and wash clothes.",
                "phonetic": "/jes ˈrəʊbɒts wɪl kʊk miːlz kliːn flɔːz ænd wɒʃ kləʊðz/",
                "meaningVi": "Có chứ! Robot sẽ nấu các bữa ăn, lau sàn và giặt quần áo.",
                "tipsVi": "Liệt kê ba hành động tiện ích của robot trong tương lai."
            },
            {
                "id": "u10_d9",
                "speaker": "Nick",
                "sentenceEn": "Will you have an automatic super car?",
                "phonetic": "/wɪl juː hæv ən ˌɔːtəˈmætɪk ˈsuːpə kɑː/",
                "meaningVi": "Cậu sẽ có một chiếc siêu xe tự lái chứ?",
                "tipsVi": "Từ \"automatic\" (/ˌɔːtəˈmætɪk/) nhấn âm tiết thứ ba."
            },
            {
                "id": "u10_d10",
                "speaker": "Phong",
                "sentenceEn": "Of course! It might even fly over mountains and seas!",
                "phonetic": "/əv kɔːs ɪt maɪt ˈiːvn flaɪ ˈəʊvə ˈmaʊntɪnz ænd siːz/",
                "meaningVi": "Tất nhiên rồi! Nó thậm chí có thể bay qua núi và biển nữa đấy!",
                "tipsVi": "Diễn tả khả năng với \"might\": nhấn \"fly over mountains\"."
            }
        ],
        "extraChallenges": [
            {
                "id": "spk-5",
                "level": "Ngôi nhà sinh thái",
                "sentenceEn": "Our future home will use solar energy to protect the planet.",
                "phonetic": "/ˈaʊə ˈfjuːtʃə həʊm wɪl juːz ˈsəʊlər ˈenədʒi tuː prəˈtekt ðə ˈplænɪt/",
                "meaningVi": "Ngôi nhà tương lai của chúng ta sẽ sử dụng năng lượng mặt trời để bảo vệ hành tinh.",
                "tipsVi": "Cụm danh từ xanh: \"solar energy\" (/ˈsəʊlər ˈenədʒi/)."
            },
            {
                "id": "spk-6",
                "level": "Công nghệ hiện đại",
                "sentenceEn": "Smart sensors might turn off the lights when we leave the room.",
                "phonetic": "/smɑːt ˈsensəz maɪt tɜːn ɒf ðə laɪts wen wiː liːv ðə ruːm/",
                "meaningVi": "Cảm biến thông minh có thể tự tắt đèn khi chúng ta rời khỏi phòng.",
                "tipsVi": "Khả năng xảy ra: \"might turn off the lights\"."
            }
        ]
    },
    11: {
        "dialogueTitle": "Getting Started: The 3Rs Club",
        "dialogueContext": "Mi và Nick cùng đọc áp phích về Câu lạc bộ 3Rs trên bảng tin trường và lên kế hoạch tham gia.",
        "dialogueLines": [
            {
                "id": "u11_d1",
                "speaker": "Mi",
                "sentenceEn": "Nick, look at this club poster on the school notice board.",
                "phonetic": "/nɪk lʊk æt ðɪs klʌb ˈpəʊstər ɒn ðə skuːl ˈnəʊtɪs bɔːd/",
                "meaningVi": "Nick ơi, nhìn tấm áp phích câu lạc bộ trên bảng tin trường kìa.",
                "tipsVi": "Gây sự chú ý cho bạn: \"look at this poster\"."
            },
            {
                "id": "u11_d2",
                "speaker": "Nick",
                "sentenceEn": "The 3Rs Club? What does 3Rs stand for?",
                "phonetic": "/ðə θriː ɑːz klʌb wɒt dʌz θriː ɑːz stænd fɔː/",
                "meaningVi": "Câu lạc bộ 3Rs à? 3Rs là viết tắt của những từ gì thế bạn?",
                "tipsVi": "Cụm từ hỏi nghĩa viết tắt: \"stand for\"."
            },
            {
                "id": "u11_d3",
                "speaker": "Mi",
                "sentenceEn": "It stands for Reduce, Reuse, and Recycle.",
                "phonetic": "/ɪt stændz fɔː rɪˈdjuːs ˌriːˈjuːz ænd ˌriːˈsaɪkl/",
                "meaningVi": "Là viết tắt của Giảm thiểu, Tái sử dụng và Tái chế đấy.",
                "tipsVi": "Phát âm rõ ràng 3 từ vàng bảo vệ môi trường: Reduce, Reuse, Recycle."
            },
            {
                "id": "u11_d4",
                "speaker": "Nick",
                "sentenceEn": "How can secondary students become greener?",
                "phonetic": "/haʊ kæn ˈsekəndri ˈstjuːdnts bɪˈkʌm ˈɡriːnə/",
                "meaningVi": "Học sinh trung học cơ sở chúng mình có thể sống xanh hơn bằng cách nào?",
                "tipsVi": "Tính từ so sánh hơn: \"greener\" (/ˈɡriːnə/)."
            },
            {
                "id": "u11_d5",
                "speaker": "Mi",
                "sentenceEn": "If we recycle used paper and plastic bottles, we will save trees and energy.",
                "phonetic": "/ɪf wiː ˌriːˈsaɪkl juːzd ˈpeɪpər ænd ˈplæstɪk ˈbɒtlz wiː wɪl seɪv triːz ænd ˈenədʒi/",
                "meaningVi": "Nếu chúng ta tái chế giấy đã dùng và chai nhựa, chúng ta sẽ cứu được cây xanh và năng lượng.",
                "tipsVi": "Câu điều kiện loại 1: ngắt nhịp nhẹ ở dấu phẩy sau mệnh đề If."
            },
            {
                "id": "u11_d6",
                "speaker": "Nick",
                "sentenceEn": "Can we reuse plastic bags for shopping?",
                "phonetic": "/kæn wiː ˌriːˈjuːz ˈplæstɪk bæɡz fɔː ˈʃɒpɪŋ/",
                "meaningVi": "Chúng mình có thể tái sử dụng túi nilon để đi mua sắm không?",
                "tipsVi": "Hỏi xin ý kiến: lên giọng ở cuối câu: \"shopping↗\"."
            },
            {
                "id": "u11_d7",
                "speaker": "Mi",
                "sentenceEn": "Better still, bring your own cloth reusable shopping bag!",
                "phonetic": "/ˈbetə stɪl brɪŋ jɔːr əʊn klɒθ ˌriːˈjuːzəbl ˈʃɒpɪŋ bæɡ/",
                "meaningVi": "Tốt hơn nữa là hãy mang theo túi vải tái sử dụng của riêng bạn!",
                "tipsVi": "Đề xuất giải pháp hay hơn: \"Better still, bring...\"."
            },
            {
                "id": "u11_d8",
                "speaker": "Nick",
                "sentenceEn": "What about saving clean water at school?",
                "phonetic": "/wɒt əˈbaʊt ˈseɪvɪŋ kliːn ˈwɔːtər æt skuːl/",
                "meaningVi": "Còn việc tiết kiệm nước sạch ở trường thì sao bạn?",
                "tipsVi": "Đưa ra chủ đề mới: \"What about saving clean water...?\"."
            },
            {
                "id": "u11_d9",
                "speaker": "Mi",
                "sentenceEn": "Turn off taps tightly after washing your hands.",
                "phonetic": "/tɜːn ɒf tæps ˈtaɪtli ˈɑːftə ˈwɒʃɪŋ jɔː hændz/",
                "meaningVi": "Hãy vặn chặt vòi nước sau khi rửa tay xong nhé.",
                "tipsVi": "Lời nhắc nhở dứt khoát: \"Turn off taps tightly\"."
            },
            {
                "id": "u11_d10",
                "speaker": "Nick",
                "sentenceEn": "I will definitely join the 3Rs club this afternoon!",
                "phonetic": "/aɪ wɪl ˈdefɪnətli dʒɔɪn ðə θriː ɑːz klʌb ðɪs ˌɑːftəˈnuːn/",
                "meaningVi": "Chắc chắn chiều nay tớ sẽ đăng ký tham gia câu lạc bộ 3Rs!",
                "tipsVi": "Quyết tâm mạnh mẽ, nhấn trạng từ \"definitely\"."
            }
        ],
        "extraChallenges": [
            {
                "id": "spk-5",
                "level": "Hành động xanh",
                "sentenceEn": "If students walk or cycle to school, they will reduce air pollution.",
                "phonetic": "/ɪf ˈstjuːdnts wɔːk ɔː ˈsaɪkl tuː skuːl ðeɪ wɪl rɪˈdjuːs eə pəˈluːʃn/",
                "meaningVi": "Nếu học sinh đi bộ hoặc đi xe đạp đến trường, các bạn sẽ giảm thiểu ô nhiễm không khí.",
                "tipsVi": "Câu điều kiện loại 1: nhấn \"reduce air pollution\"."
            },
            {
                "id": "spk-6",
                "level": "Tuyên truyền lối sống xanh",
                "sentenceEn": "Remember to put rubbish into the correct recycling bins.",
                "phonetic": "/rɪˈmembə tuː pʊt ˈrʌbɪʃ ˈɪntuː ðə kəˈrekt ˌriːˈsaɪklɪŋ bɪnz/",
                "meaningVi": "Hãy nhớ bỏ rác đúng vào các thùng phân loại rác tái chế nhé.",
                "tipsVi": "Cụm danh từ \"recycling bins\" (thùng rác tái chế)."
            }
        ]
    },
    12: {
        "dialogueTitle": "Getting Started: At the International Robot Show",
        "dialogueContext": "Nick, Phong và Tiến sĩ Alex đang hào hứng tham quan Triển lãm Robot Quốc tế tại Hà Nội.",
        "dialogueLines": [
            {
                "id": "u12_d1",
                "speaker": "Nick",
                "sentenceEn": "Good morning, Dr. Alex. What a fantastic robot show!",
                "phonetic": "/ɡʊd ˈmɔːnɪŋ ˈdɒktər ˈæleks wɒt ə fænˈtæstɪk ˈrəʊbɒt ʃəʊ/",
                "meaningVi": "Chào buổi sáng tiến sĩ Alex. Triển lãm robot này hoành tráng quá ạ!",
                "tipsVi": "Lời chào kính trọng và câu cảm thán hào hứng: \"What a fantastic...\"."
            },
            {
                "id": "u12_d2",
                "speaker": "TS. Alex",
                "sentenceEn": "Good morning, boys. Welcome to the International Robot Exhibition!",
                "phonetic": "/ɡʊd ˈmɔːnɪŋ bɔɪz ˈwelkəm tuː ðɪ ˌɪntəˈnæʃnəl ˈrəʊbɒt ˌeksɪˈbɪʃn/",
                "meaningVi": "Chào buổi sáng các cậu bé. Chào mừng các cháu đến với Triển lãm Robot Quốc tế!",
                "tipsVi": "Từ \"exhibition\" (/ˌeksɪˈbɪʃn/) nhấn trọng âm ba."
            },
            {
                "id": "u12_d3",
                "speaker": "Phong",
                "sentenceEn": "Can this tall silver robot talk with humans?",
                "phonetic": "/kæn ðɪs tɔːl ˈsɪlvə ˈrəʊbɒt tɔːk wɪð ˈhjuːmənz/",
                "meaningVi": "Chú robot màu bạc cao lớn này có thể trò chuyện với con người không ạ?",
                "tipsVi": "Lên giọng ở cuối câu hỏi khả năng với Can: \"humans↗\"."
            },
            {
                "id": "u12_d4",
                "speaker": "TS. Alex",
                "sentenceEn": "Yes, it can speak ten different languages fluently.",
                "phonetic": "/jes ɪt kæn spiːk ten ˈdɪfrənt ˈlæŋɡwɪdʒɪz ˈfluːəntli/",
                "meaningVi": "Có chứ, nó có thể nói trôi chảy mười ngôn ngữ khác nhau đấy.",
                "tipsVi": "Nhấn vào trạng từ \"fluently\" (/ˈfluːəntli/ - trôi chảy)."
            },
            {
                "id": "u12_d5",
                "speaker": "Nick",
                "sentenceEn": "What can worker robots do in industrial factories?",
                "phonetic": "/wɒt kæn ˈwɜːkə ˈrəʊbɒts duː ɪn ɪnˈdʌstriəl ˈfæktəriz/",
                "meaningVi": "Còn các robot công nhân thì có thể làm những gì trong nhà máy công nghiệp ạ?",
                "tipsVi": "Cụm danh từ \"worker robots\" và \"factories\"."
            },
            {
                "id": "u12_d6",
                "speaker": "TS. Alex",
                "sentenceEn": "They can lift heavy materials and build modern cars very fast.",
                "phonetic": "/ðeɪ kæn lɪft ˈhevi məˈtɪəriəlz ænd bɪld ˈmɒdn kɑːz ˈveri fɑːst/",
                "meaningVi": "Chúng có thể nâng vật liệu nặng và lắp ráp ô tô hiện đại rất nhanh chóng.",
                "tipsVi": "Động từ hành động mạnh mẽ: \"lift heavy materials\" và \"build cars\"."
            },
            {
                "id": "u12_d7",
                "speaker": "Phong",
                "sentenceEn": "Can home robots help children with their difficult homework?",
                "phonetic": "/kæn həʊm ˈrəʊbɒts help ˈtʃɪldrən wɪð ðeə ˈdɪfɪkəlt ˈhəʊmwɜːk/",
                "meaningVi": "Robot gia đình có thể giúp trẻ em làm bài tập về nhà khó không ạ?",
                "tipsVi": "Lên giọng nhẹ ở cuối: \"homework↗\"."
            },
            {
                "id": "u12_d8",
                "speaker": "TS. Alex",
                "sentenceEn": "Yes, they can teach English and explain difficult maths problems.",
                "phonetic": "/jes ðeɪ kæn tiːtʃ ˈɪŋɡlɪʃ ænd ɪkˈspleɪn ˈdɪfɪkəlt mæθs ˈprɒbləmz/",
                "meaningVi": "Được chứ, chúng có thể dạy tiếng Anh và giảng giải các bài toán khó.",
                "tipsVi": "Hai kỹ năng gia sư: \"teach English\" và \"explain maths problems\"."
            },
            {
                "id": "u12_d9",
                "speaker": "Nick",
                "sentenceEn": "Will robots ever replace human teachers completely?",
                "phonetic": "/wɪl ˈrəʊbɒts ˈevə rɪˈpleɪs ˈhjuːmən ˈtiːtʃəz kəmˈpliːtli/",
                "meaningVi": "Liệu có khi nào robot thay thế hoàn toàn các thầy cô giáo không ạ?",
                "tipsVi": "Câu hỏi dự đoán tương lai với \"Will\": \"replace human teachers\"."
            },
            {
                "id": "u12_d10",
                "speaker": "TS. Alex",
                "sentenceEn": "No, they won't! Robots cannot show human feelings and love.",
                "phonetic": "/nəʊ ðeɪ wəʊnt ˈrəʊbɒts ˈkænɒt ʃəʊ ˈhjuːmən ˈfiːlɪŋz ænd lʌv/",
                "meaningVi": "Không đâu các cháu! Robot không thể thể hiện cảm xúc và tình yêu thương như con người.",
                "tipsVi": "Khẳng định ấm áp và sâu sắc: \"human feelings and love\"."
            }
        ],
        "extraChallenges": [
            {
                "id": "spk-5",
                "level": "Khả năng của robot",
                "sentenceEn": "Doctor robots can examine sick patients and give correct medicine.",
                "phonetic": "/ˈdɒktə ˈrəʊbɒts kæn ɪɡˈzæmɪn sɪk ˈpeɪʃnts ænd ɡɪv kəˈrekt ˈmedsn/",
                "meaningVi": "Robot bác sĩ có thể thăm khám cho bệnh nhân và phát thuốc chuẩn xác.",
                "tipsVi": "Phát âm rõ từ \"patients\" (/ˈpeɪʃnts/) và \"medicine\" (/ˈmedsn/)."
            },
            {
                "id": "spk-6",
                "level": "So sánh tương lai",
                "sentenceEn": "Robots will be the smartest and most helpful inventions in our lives.",
                "phonetic": "/ˈrəʊbɒts wɪl biː ðə ˈsmɑːtɪst ænd məʊst ˈhelpfl ɪnˈvenʃnz ɪn ˈaʊə laɪvz/",
                "meaningVi": "Robot sẽ là phát minh thông minh nhất và hữu ích nhất trong đời sống chúng ta.",
                "tipsVi": "So sánh nhất: \"the smartest and most helpful\"."
            }
        ]
    }
}

def run():
    print("🚀 Bắt đầu cập nhật Hội thoại SGK và mở rộng câu luyện phát âm cho 12 Unit...")
    for unit_id in range(1, 13):
        path = os.path.join(DATA_DIR, f'unit{unit_id}.json')
        if not os.path.exists(path):
            print(f"❌ File not found: {path}")
            continue
        
        with open(path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        unit_spk = data.get('speaking', {})
        dialogue_info = DIALOGUES_AND_CHALLENGES.get(unit_id)
        if not dialogue_info:
            continue

        # Cập nhật thông tin hội thoại SGK
        unit_spk['dialogueTitle'] = dialogue_info['dialogueTitle']
        unit_spk['dialogueContext'] = dialogue_info['dialogueContext']
        unit_spk['dialogueLines'] = dialogue_info['dialogueLines']

        # Mở rộng challenges hiện có
        existing_challenges = unit_spk.get('challenges', [])
        # Tránh trùng lặp nếu đã thêm
        existing_ids = {c.get('id') for c in existing_challenges}
        for extra in dialogue_info.get('extraChallenges', []):
            if extra.get('id') not in existing_ids:
                existing_challenges.append(extra)
        unit_spk['challenges'] = existing_challenges

        data['speaking'] = unit_spk

        with open(path, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        
        total_lines = len(unit_spk.get('dialogueLines', []))
        total_chal = len(unit_spk.get('challenges', []))
        print(f"✅ Unit {unit_id}: {total_lines} câu Hội thoại SGK + {total_chal} câu Thử thách giao tiếp.")

    print("🎉 Hoàn tất cập nhật 12 Unit thành công!")

if __name__ == '__main__':
    run()
