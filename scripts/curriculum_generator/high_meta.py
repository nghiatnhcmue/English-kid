# -*- coding: utf-8 -*-
"""
high_meta.py
Chủ điểm Ngữ pháp / Phát âm / số trang của SGK Tiếng Anh 10, 11, 12 – Global Success,
đối chiếu Book map và trang "This unit includes" trong pdf/ (OCR).
Kèm câu hỏi trắc nghiệm ngữ pháp đúng chủ điểm từng Unit (câu soạn mới, không chép SGK)
và bài luyện phát âm soạn tay cho các bài ngữ điệu / từ đồng âm / từ hai cách đọc.

Mỗi Unit: (grammar_vi, pron_vi, (trang_đầu, trang_cuối), [quiz ngữ pháp], pron_custom | None)
quiz: (câu hỏi, [đáp án đúng, nhiễu...], giải thích)
"""

UP, DOWN = "↗ Lên giọng", "↘ Xuống giọng"
S1, S2 = "Âm tiết 1", "Âm tiết 2"


def _intonation(items, guide_up, guide_down, examples=None):
    """items: (câu, nghĩa, lên/xuống); examples: (câu, nghĩa, lên/xuống) chỉ dùng làm ví dụ minh họa"""
    shown = (examples or []) + items
    return {
        "prompt": "Nghe câu và chọn ngữ điệu ở cuối câu:",
        "quiz": [{"word": s, "correctSound": ans, "options": [UP, DOWN], "meaningVi": vi, "phonetic": "", "answerIndex": [UP, DOWN].index(ans)}
                 for s, vi, ans in items],
        "sound1": {"symbol": "↗", "name": "Lên giọng", "guideVi": guide_up,
                   "words": [{"word": s, "meaning": vi} for s, vi, a in shown if a == UP][:2]},
        "sound2": {"symbol": "↘", "name": "Xuống giọng", "guideVi": guide_down,
                   "words": [{"word": s, "meaning": vi} for s, vi, a in shown if a == DOWN][:2]},
    }


HIGH_META = {
    10: {
        1: ("Hiện tại đơn và Hiện tại tiếp diễn", "/br/, /kr/ và /tr/", (8, 17), [
            ("My father usually ______ the washing-up after dinner.", ["does", "is doing", "do", "doing"],
             "Thói quen lặp lại (usually) → Hiện tại đơn; chủ ngữ số ít → does."),
            ("Look! Mum ______ the laundry in the backyard right now.", ["is hanging out", "hangs out", "hang out", "hanged out"],
             "Hành động đang diễn ra (Look!, right now) → Hiện tại tiếp diễn."),
        ], None),
        2: ("Tương lai với will và be going to; Câu bị động", "/kl/, /pl/, /gr/ và /pr/", (18, 27), [
            ("Look at those dark clouds! It ______ rain.", ["is going to", "will", "is", "going to"],
             "Dự đoán có căn cứ ở hiện tại (mây đen) → be going to."),
            ("Plastic bottles ______ by our club every Friday.", ["are collected", "collect", "are collecting", "collected"],
             "Chủ ngữ chịu tác động (by our club) → bị động Hiện tại đơn: are + V3."),
        ], None),
        3: ("Câu ghép; Động từ nguyên mẫu có to và không to", "Trọng âm từ có 2 âm tiết", (28, 37), [
            ("The band practised very hard, ______ they won the competition.", ["so", "but", "or", "nor"],
             "Mệnh đề sau là kết quả của mệnh đề trước → liên từ so."),
            ("My parents let me ______ the guitar in the evening.", ["practise", "to practise", "practising", "practised"],
             "let + tân ngữ + động từ nguyên mẫu không to."),
        ], None),
        4: ("Quá khứ đơn và Quá khứ tiếp diễn với when/while", "Trọng âm từ 2 âm tiết có cùng cách viết", (42, 51), [
            ("I ______ my homework when the lights went out.", ["was doing", "did", "am doing", "have done"],
             "Hành động đang diễn ra (QKTD) thì hành động khác xen vào (QKĐ, when)."),
            ("While we were cleaning the park, it ______ to rain.", ["started", "was starting", "starts", "has started"],
             "while + QKTD; hành động ngắn xen vào chia Quá khứ đơn."),
        ], {
            "prompt": "Nghe cụm từ và chọn âm tiết mang trọng âm của từ có hai cách đọc:",
            "quiz": [
                {"word": "a world record", "correctSound": S1, "options": [S1, S2], "meaningVi": "record (danh từ): kỷ lục", "phonetic": "/ˈrekɔːd/", "answerIndex": 0},
                {"word": "record a song", "correctSound": S2, "options": [S1, S2], "meaningVi": "record (động từ): thu âm", "phonetic": "/rɪˈkɔːd/", "answerIndex": 1},
                {"word": "a birthday present", "correctSound": S1, "options": [S1, S2], "meaningVi": "present (danh từ): món quà", "phonetic": "/ˈpreznt/", "answerIndex": 0},
                {"word": "present a report", "correctSound": S2, "options": [S1, S2], "meaningVi": "present (động từ): trình bày", "phonetic": "/prɪˈzent/", "answerIndex": 1},
                {"word": "export rice", "correctSound": S2, "options": [S1, S2], "meaningVi": "export (động từ): xuất khẩu", "phonetic": "/ɪkˈspɔːt/", "answerIndex": 1},
                {"word": "an increase in prices", "correctSound": S1, "options": [S1, S2], "meaningVi": "increase (danh từ): sự tăng lên", "phonetic": "/ˈɪŋkriːs/", "answerIndex": 0},
            ],
            "sound1": {"symbol": "ˈ● ●", "name": "Danh từ: trọng âm âm tiết 1",
                       "guideVi": "Với từ 2 âm tiết viết giống nhau, danh từ (và tính từ) thường nhấn âm tiết 1.",
                       "words": [{"word": "record", "meaning": "kỷ lục (n) /ˈrekɔːd/"}, {"word": "present", "meaning": "món quà (n) /ˈpreznt/"}]},
            "sound2": {"symbol": "● ˈ●", "name": "Động từ: trọng âm âm tiết 2",
                       "guideVi": "Động từ cùng cách viết thường nhấn âm tiết 2: record /rɪˈkɔːd/, present /prɪˈzent/.",
                       "words": [{"word": "export", "meaning": "xuất khẩu (v) /ɪkˈspɔːt/"}, {"word": "increase", "meaning": "tăng lên (v) /ɪnˈkriːs/"}]},
        }),
        5: ("Hiện tại hoàn thành; Danh động từ và động từ nguyên mẫu có to", "Trọng âm danh từ có 3 âm tiết", (52, 61), [
            ("Scientists ______ many useful inventions since 2000.", ["have made", "made", "make", "are making"],
             "since + mốc thời gian → Hiện tại hoàn thành."),
            ("Would you mind ______ me how to use this 3D printer?", ["showing", "to show", "show", "shown"],
             "mind + V-ing (danh động từ)."),
        ], None),
        6: ("Câu bị động với động từ khuyết thiếu", "Trọng âm tính từ và động từ có 3 âm tiết", (66, 75), [
            ("Women ______ equal pay for equal work.", ["should be given", "should give", "should be giving", "should gave"],
             "Bị động với động từ khuyết thiếu: modal + be + V3."),
            ("This job can ______ by both men and women.", ["be done", "do", "been done", "doing"],
             "can + be + V3."),
        ], None),
        7: ("So sánh hơn và so sánh nhất của tính từ", "Trọng âm từ có hơn 3 âm tiết", (76, 85), [
            ("The UN is ______ international organisation in the world.", ["the largest", "larger", "the most large", "largest"],
             "So sánh nhất với tính từ ngắn: the + adj-est."),
            ("Life in Viet Nam is ______ than it was 30 years ago.", ["better", "more good", "best", "the better"],
             "good → better (so sánh hơn bất quy tắc) + than."),
        ], None),
        8: ("Mệnh đề quan hệ xác định và không xác định (who, that, which, whose)", "Trọng âm câu", (86, 95), [
            ("The student ______ laptop was broken borrowed mine.", ["whose", "who", "which", "that"],
             "whose + danh từ: chỉ sự sở hữu (laptop của bạn học sinh đó)."),
            ("Online learning, ______ is very flexible, suits busy students.", ["which", "that", "who", "whose"],
             "Mệnh đề không xác định (có dấu phẩy) chỉ vật → which, không dùng that."),
        ], None),
        9: ("Câu gián tiếp (Reported speech)", "Nhịp điệu (Rhythm)", (100, 109), [
            ("She said, \"I am planting trees.\" → She said that she ______ trees.", ["was planting", "is planting", "planted", "has planted"],
             "Lùi thì: Hiện tại tiếp diễn → Quá khứ tiếp diễn."),
            ("He said, \"We will recycle more.\" → He said that they ______ more.", ["would recycle", "will recycle", "recycled", "are recycling"],
             "Lùi thì: will → would."),
        ], None),
        10: ("Câu điều kiện loại 1 và loại 2", "Ngữ điệu (Intonation)", (110, 119), [
            ("If we ______ litter in the forest, we will harm the animals.", ["leave", "left", "will leave", "would leave"],
             "Điều kiện loại 1: If + Hiện tại đơn, S + will + V."),
            ("If I had more money, I ______ an ecotour to Cuc Phuong.", ["would take", "will take", "take", "took"],
             "Điều kiện loại 2 (không có thật ở hiện tại): If + QKĐ, S + would + V."),
        ], _intonation([
            ("Do you like ecotourism?", "Bạn có thích du lịch sinh thái không?", UP),
            ("Where are you going this summer?", "Hè này bạn đi đâu?", DOWN),
            ("We visited Ha Long Bay last year.", "Năm ngoái chúng mình đã tới vịnh Hạ Long.", DOWN),
            ("Is it far from here?", "Chỗ đó có xa đây không?", UP),
        ], "Câu hỏi Yes/No thường lên giọng ở cuối câu.", "Câu trần thuật và câu hỏi Wh- thường xuống giọng ở cuối câu.")),
    },
    11: {
        1: ("Quá khứ đơn và Hiện tại hoàn thành", "Dạng mạnh và dạng yếu của trợ động từ", (8, 17), [
            ("I ______ to the gym three times this week.", ["have been", "went", "go", "was"],
             "this week (khoảng thời gian chưa kết thúc) → Hiện tại hoàn thành."),
            ("She ______ a bad cold last month.", ["had", "has had", "has", "was having"],
             "last month (thời điểm đã kết thúc) → Quá khứ đơn."),
        ], None),
        2: ("Động từ khuyết thiếu: must, have to, should", "Dạng rút gọn (Contracted forms)", (18, 27), [
            ("You ______ use your phone during the exam. It's not allowed.", ["mustn't", "don't have to", "should", "have to"],
             "mustn't: cấm, không được phép."),
            ("Tomorrow is Sunday, so I ______ get up early.", ["don't have to", "mustn't", "have to", "must"],
             "don't have to: không cần, không bắt buộc."),
        ], None),
        3: ("Động từ trạng thái ở dạng tiếp diễn; Động từ nối (linking verbs)", "Nối phụ âm cuối với nguyên âm đầu", (28, 37), [
            ("We ______ a meeting with the city planners at the moment.", ["are having", "have", "has", "had"],
             "have mang nghĩa hành động (tổ chức cuộc họp) có thể dùng tiếp diễn; at the moment → HTTD."),
            ("This smart city looks very ______.", ["modern", "modernly", "modernity", "modernise"],
             "Sau động từ nối (look, seem, become…) dùng tính từ."),
        ], None),
        4: ("Danh động từ làm chủ ngữ và tân ngữ", "Lược bỏ nguyên âm (Elision)", (42, 51), [
            ("______ in the ASEAN Youth Programme is a great experience.", ["Taking part", "Take part", "To taking part", "Took part"],
             "Danh động từ (V-ing) làm chủ ngữ."),
            ("Viet Nam enjoys ______ cultural events with other ASEAN countries.", ["sharing", "to share", "share", "shared"],
             "enjoy + V-ing (danh động từ làm tân ngữ)."),
        ], None),
        5: ("Mệnh đề phân từ hiện tại và quá khứ", "Trọng âm câu và nhịp điệu", (52, 61), [
            ("______ fossil fuels, factories release a lot of CO2.", ["Burning", "Burnt", "Burn", "To burned"],
             "Chủ ngữ (factories) chủ động thực hiện → phân từ hiện tại V-ing."),
            ("______ by human activities, global warming is getting worse.", ["Caused", "Causing", "Cause", "Causes"],
             "Chủ ngữ (global warming) bị gây ra → phân từ quá khứ V3."),
        ], None),
        6: ("Mệnh đề to-infinitive", "Ngữ điệu trong câu trần thuật, câu mệnh lệnh và câu liệt kê", (66, 75), [
            ("Hue was the first place in Viet Nam ______ as a World Heritage Site.", ["to be recognised", "recognising", "to recognise", "recognise"],
             "the first + N + to-infinitive; nghĩa bị động → to be + V3."),
            ("She was the only student ______ the heritage quiz.", ["to win", "win", "won", "wins"],
             "the only + N + to-infinitive."),
        ], _intonation([
            ("Please don't touch the statues.", "Vui lòng không chạm vào các bức tượng.", DOWN),
            ("Hoi An is a beautiful old town.", "Hội An là một phố cổ xinh đẹp.", DOWN),
            ("We visited Hue, Hoi An and My Son.", "Chúng mình đã tới Huế, Hội An và Mỹ Sơn (cuối danh sách xuống giọng).", DOWN),
            ("Take a map with you.", "Hãy mang theo bản đồ.", DOWN),
        ], "Khi liệt kê, các mục đứng trước lên giọng để báo hiệu danh sách chưa hết.",
            "Câu trần thuật, câu mệnh lệnh và mục cuối cùng của danh sách xuống giọng.",
            [("We visited Hue, Hoi An and My Son.", "Hue ↗, Hoi An ↗ … and My Son ↘", UP)])),
        7: ("Danh động từ hoàn thành và mệnh đề phân từ hoàn thành", "Ngữ điệu trong câu hỏi Wh- và Yes/No", (76, 85), [
            ("______ the exam, she applied to a vocational school.", ["Having passed", "Having pass", "Passed having", "To have passing"],
             "Hành động xảy ra trước → Having + V3."),
            ("He was proud of ______ the scholarship.", ["having won", "to have won", "have won", "had won"],
             "Sau giới từ dùng danh động từ; hành động đã xong → having + V3."),
        ], _intonation([
            ("What do you want to study?", "Bạn muốn học ngành gì?", DOWN),
            ("Have you applied to university?", "Bạn đã nộp hồ sơ vào đại học chưa?", UP),
            ("Where is the vocational school?", "Trường nghề ở đâu?", DOWN),
            ("Do you need a scholarship?", "Bạn có cần học bổng không?", UP),
        ], "Câu hỏi Yes/No thường lên giọng ở cuối câu.", "Câu hỏi Wh- thường xuống giọng ở cuối câu.")),
        8: ("Câu chẻ: It is/was ... that/who ...", "Ngữ điệu trong lời mời, gợi ý và yêu cầu lịch sự", (86, 95), [
            ("It was my mum ______ taught me how to cook.", ["who", "which", "what", "where"],
             "Câu chẻ nhấn mạnh người → It was + người + who/that."),
            ("It is time management ______ helps teens become independent.", ["that", "who", "what", "when"],
             "Câu chẻ nhấn mạnh sự vật → It is + N + that."),
        ], _intonation([
            ("Would you like to come to my party?", "Bạn có muốn đến bữa tiệc của mình không?", UP),
            ("Could you help me with this form?", "Bạn giúp mình điền mẫu đơn này được không?", UP),
            ("Why don't we cook dinner together?", "Sao chúng ta không cùng nấu bữa tối nhỉ?", DOWN),
            ("Let's go shopping this weekend.", "Cuối tuần này mình đi mua sắm nhé.", DOWN),
        ], "Lời mời và yêu cầu lịch sự dạng câu hỏi Yes/No (Would you…? Could you…?) thường lên giọng.",
            "Gợi ý với Let's… hoặc Why don't we…? thường xuống giọng.")),
        9: ("Từ và cụm từ nối (Linking words and phrases)", "Ngữ điệu trong câu hỏi lựa chọn", (100, 109), [
            ("Peer pressure can be positive. ______, it is often negative.", ["However", "Therefore", "Because", "Moreover"],
             "Hai ý tương phản → However."),
            ("He was bullied online; ______, he felt stressed and lonely.", ["as a result", "however", "although", "in contrast"],
             "Mệnh đề sau là kết quả → as a result."),
        ], _intonation([
            ("Do you prefer online or offline classes?", "Bạn thích học trực tuyến hay trực tiếp? (câu hỏi lựa chọn)", DOWN),
            ("Is it a social issue or a personal problem?", "Đó là vấn đề xã hội hay chuyện cá nhân? (câu hỏi lựa chọn)", DOWN),
            ("Do you want to join our club?", "Bạn có muốn tham gia câu lạc bộ không? (câu hỏi Yes/No)", UP),
        ], "Trong câu hỏi lựa chọn, phương án đứng trước lên giọng; câu hỏi Yes/No lên giọng ở cuối.",
            "Phương án cuối cùng của câu hỏi lựa chọn xuống giọng.",
            [("Do you prefer online or offline classes?", "online ↗ … or offline ↘", UP)])),
        10: ("Danh từ ghép (Compound nouns)", "Ngữ điệu trong câu hỏi đuôi", (110, 119), [
            ("Which of the following is a compound noun?", ["rainforest", "beautiful", "quickly", "protect"],
             "rainforest = rain + forest (danh từ ghép)."),
            ("Bees, flowers and birds are all part of the food ______.", ["chain", "line", "row", "list"],
             "food chain (chuỗi thức ăn) là danh từ ghép quen thuộc của chủ đề hệ sinh thái."),
        ], _intonation([
            ("You went to Cuc Phuong last weekend, didn't you?", "Người nói chắc chắn, chỉ muốn xác nhận.", DOWN),
            ("The forest is protected, isn't it?", "Người nói không chắc, thật sự muốn hỏi.", UP),
            ("Tigers are endangered, aren't they?", "Người nói chắc chắn, chỉ muốn xác nhận.", DOWN),
            ("You've seen a red-shanked douc, haven't you?", "Người nói không chắc, thật sự muốn hỏi.", UP),
        ], "Câu hỏi đuôi lên giọng khi người nói không chắc chắn và thật sự muốn hỏi.",
            "Câu hỏi đuôi xuống giọng khi người nói đã chắc chắn, chỉ muốn người nghe xác nhận.")),
    },
    12: {
        1: ("Quá khứ đơn và Quá khứ tiếp diễn", "/eɪ/ và /aʊ/", (8, 19), [
            ("She ______ her diary when the bombs fell.", ["was writing", "wrote", "writes", "has written"],
             "Hành động đang diễn ra (QKTD) thì hành động khác xen vào (QKĐ)."),
            ("Steve Jobs ______ Apple in 1976.", ["founded", "was founding", "has founded", "founds"],
             "Sự việc đã xong tại thời điểm xác định trong quá khứ → Quá khứ đơn."),
        ], None),
        2: ("Mạo từ (ôn tập và mở rộng)", "/ɔɪ/, /aɪ/ và /aʊ/", (20, 31), [
            ("Kimchi is ______ traditional Korean dish.", ["a", "an", "the", "(không dùng mạo từ)"],
             "Danh từ đếm được số ít, nhắc đến lần đầu, bắt đầu bằng phụ âm → a."),
            ("______ Japanese often bow when they greet each other.", ["The", "A", "An", "(không dùng mạo từ)"],
             "the + tính từ quốc tịch chỉ cả dân tộc: the Japanese."),
        ], None),
        3: ("Động từ đi với giới từ; Mệnh đề quan hệ thay cho cả câu", "/ɪə/, /eə/ và /ʊə/", (32, 43), [
            ("Many people now rely ______ reusable bags.", ["on", "in", "at", "with"],
             "rely on: dựa vào."),
            ("She recycles all her plastic bottles, ______ is good for the environment.", ["which", "that", "who", "what"],
             "which thay cho cả mệnh đề phía trước (việc cô ấy tái chế chai nhựa)."),
        ], None),
        4: ("Hiện tại hoàn thành (ôn tập và mở rộng); So sánh kép", "Từ không nhấn trong chuỗi lời nói", (48, 59), [
            ("The city ______ a lot since my last visit three years ago.", ["has changed", "changed", "changes", "is changing"],
             "since + mốc thời gian → Hiện tại hoàn thành."),
            ("The bigger the city grows, ______ the traffic becomes.", ["the worse", "worse", "the worst", "the more bad"],
             "So sánh kép: The + so sánh hơn…, the + so sánh hơn…"),
        ], None),
        5: ("Câu đơn, câu ghép và câu phức (ôn tập và mở rộng)", "Nhấn trợ động từ và động từ khuyết thiếu", (60, 71), [
            ("Which is a complex sentence?", ["I applied for the job because I love working with children.",
                                             "I applied for the job and got an interview.",
                                             "I applied for the job.",
                                             "I applied for the job, but I didn't get it."],
             "Câu phức có mệnh đề phụ thuộc bắt đầu bằng liên từ phụ thuộc (because)."),
            ("She has good communication skills, ______ she got the job.", ["so", "but", "although", "because"],
             "Câu ghép nối mệnh đề chỉ kết quả → so."),
        ], None),
        6: ("Câu sai khiến chủ động và bị động", "Từ đồng âm (Homophones)", (76, 87), [
            ("We had a technician ______ the robot.", ["repair", "repaired", "repairing", "to repair"],
             "Sai khiến chủ động: have + người + V nguyên mẫu."),
            ("I got my essay ______ by an AI tool.", ["checked", "check", "checking", "to check"],
             "Sai khiến bị động: get/have + vật + V3."),
        ], {
            "prompt": "Nghe từ và chọn từ có cách phát âm giống hệt (từ đồng âm):",
            "quiz": [
                {"word": "right", "correctSound": "write", "options": ["write", "ride"], "meaningVi": "đúng / bên phải", "phonetic": "/raɪt/", "answerIndex": 0},
                {"word": "weather", "correctSound": "whether", "options": ["wetter", "whether"], "meaningVi": "thời tiết", "phonetic": "/ˈweðə/", "answerIndex": 1},
                {"word": "their", "correctSound": "there", "options": ["there", "three"], "meaningVi": "của họ", "phonetic": "/ðeə/", "answerIndex": 0},
                {"word": "knew", "correctSound": "new", "options": ["know", "new"], "meaningVi": "đã biết", "phonetic": "/njuː/", "answerIndex": 1},
                {"word": "flower", "correctSound": "flour", "options": ["flour", "floor"], "meaningVi": "bông hoa", "phonetic": "/ˈflaʊə/", "answerIndex": 0},
            ],
            "sound1": {"symbol": "=", "name": "Cùng cách đọc", "guideVi": "Từ đồng âm đọc giống hệt nhau nhưng khác cách viết và nghĩa; dựa vào ngữ cảnh để hiểu đúng.",
                       "words": [{"word": "right", "meaning": "đúng / bên phải"}, {"word": "write", "meaning": "viết"}]},
            "sound2": {"symbol": "≠", "name": "Khác nghĩa, khác cách viết", "guideVi": "Ví dụ: their (của họ) – there (ở đó); knew (đã biết) – new (mới).",
                       "words": [{"word": "their", "meaning": "của họ"}, {"word": "there", "meaning": "ở đó"}]},
        }),
        7: ("Mệnh đề trạng ngữ chỉ cách thức và kết quả", "Nối âm /r/ giữa hai nguyên âm", (88, 99), [
            ("He talks ______ he knows everything about social media.", ["as if", "so that", "so", "such"],
             "as if: như thể (mệnh đề chỉ cách thức)."),
            ("The news was ______ shocking that everyone shared it.", ["so", "such", "as", "too"],
             "so + tính từ + that: quá… đến nỗi (mệnh đề chỉ kết quả)."),
        ], {
            "prompt": "Nghe cụm từ và cho biết có nối âm /r/ giữa hai từ hay không:",
            "quiz": [
                {"word": "far away", "correctSound": "Có nối /r/", "options": ["Có nối /r/", "Không nối /r/"], "meaningVi": "xa xôi – far kết thúc bằng chữ r, away bắt đầu bằng nguyên âm", "phonetic": "", "answerIndex": 0},
                {"word": "four books", "correctSound": "Không nối /r/", "options": ["Có nối /r/", "Không nối /r/"], "meaningVi": "bốn quyển sách – books bắt đầu bằng phụ âm", "phonetic": "", "answerIndex": 1},
                {"word": "her idea", "correctSound": "Có nối /r/", "options": ["Có nối /r/", "Không nối /r/"], "meaningVi": "ý tưởng của cô ấy", "phonetic": "", "answerIndex": 0},
                {"word": "better news", "correctSound": "Không nối /r/", "options": ["Có nối /r/", "Không nối /r/"], "meaningVi": "tin tốt hơn – news bắt đầu bằng phụ âm", "phonetic": "", "answerIndex": 1},
                {"word": "the media are", "correctSound": "Có nối /r/", "options": ["Có nối /r/", "Không nối /r/"], "meaningVi": "giới truyền thông thì… – nối /r/ giữa media và are", "phonetic": "", "answerIndex": 0},
                {"word": "newspaper column", "correctSound": "Không nối /r/", "options": ["Có nối /r/", "Không nối /r/"], "meaningVi": "chuyên mục báo – column bắt đầu bằng phụ âm", "phonetic": "", "answerIndex": 1}
            ],
            "sound1": {"symbol": "‿r‿", "name": "Có nối /r/", "guideVi": "Từ trước kết thúc bằng chữ r/re (âm cuối là nguyên âm) và từ sau bắt đầu bằng nguyên âm → đọc /r/ nối hai từ: far‿away /fɑːr əˈweɪ/.",
                       "words": [{"word": "far away", "meaning": "/fɑːr əˈweɪ/"}, {"word": "her idea", "meaning": "/hɜːr aɪˈdɪə/"}]},
            "sound2": {"symbol": "r̸", "name": "Không nối /r/", "guideVi": "Từ sau bắt đầu bằng phụ âm → không đọc /r/ (giọng Anh – Anh): four books /fɔː bʊks/.",
                       "words": [{"word": "four books", "meaning": "/fɔː bʊks/"}, {"word": "better news", "meaning": "/ˈbetə njuːz/"}]},
        }),
        8: ("Mệnh đề trạng ngữ chỉ điều kiện và so sánh", "Đồng hóa âm (Assimilation)", (100, 111), [
            ("______ we act now, many species will disappear. (Nếu chúng ta không hành động ngay…)", ["Unless", "If", "As long as", "Provided that"],
             "Unless = If … not."),
            ("Elephants are hunted more often ______ many other animals because of their ivory.", ["than", "as", "so", "that"],
             "Mệnh đề so sánh hơn: more … than."),
        ], None),
        9: ("Cụm động từ ba từ (Three-word phrasal verbs)", "Trọng âm câu và nhịp điệu", (116, 127), [
            ("You should keep up ______ the changes in the job market.", ["with", "on", "for", "at"],
             "keep up with: theo kịp."),
            ("If you don't like this job, you can always fall back ______ your second option.", ["on", "with", "for", "at"],
             "fall back on: dựa vào (phương án dự phòng)."),
        ], None),
        10: ("Câu gián tiếp: tường thuật mệnh lệnh, yêu cầu, lời đề nghị và lời khuyên", "Ngữ điệu trong câu hỏi (ôn tập)", (128, 139), [
            ("\"Keep learning new skills,\" the headteacher told us. → The headteacher told us ______ new skills.",
             ["to keep learning", "keep learning", "keeping learning", "that keep learning"],
             "Tường thuật mệnh lệnh: tell + O + to V."),
            ("\"You should take an online course,\" my teacher said to me. → My teacher advised me ______ an online course.",
             ["to take", "taking", "take", "that take"],
             "Tường thuật lời khuyên: advise + O + to V."),
        ], _intonation([
            ("What skills do you want to learn?", "Bạn muốn học kĩ năng gì? (câu hỏi Wh-)", DOWN),
            ("Have you ever taken an online course?", "Bạn đã từng học khóa trực tuyến chưa? (câu hỏi Yes/No)", UP),
            ("Would you prefer a short course or a degree?", "Bạn thích khóa ngắn hạn hay một tấm bằng? (câu hỏi lựa chọn)", DOWN),
            ("You're going to study abroad, aren't you?", "Người nói không chắc, thật sự muốn hỏi.", UP),
        ], "Câu hỏi Yes/No và câu hỏi đuôi khi chưa chắc chắn: lên giọng.",
            "Câu hỏi Wh-, câu hỏi lựa chọn (phương án cuối): xuống giọng.")),
    },
}


# ---------------------------------------------------------------------------
# Bài luyện soạn tay cho các hiện tượng ngữ âm không quy về "chọn âm" / "trọng âm từ"
def _choice(prompt, items, s1, s2):
    """items: (câu/cụm, [đáp án đúng, phương án khác], nghĩa); s1/s2: (ký hiệu, tên, hướng dẫn, [(ví dụ, nghĩa)])"""
    quiz = []
    for k, (w, opts, vi) in enumerate(items):
        order = list(opts) if k % 2 == 0 else list(reversed(opts))
        quiz.append({"word": w, "correctSound": opts[0], "options": order, "meaningVi": vi, "phonetic": "",
                     "answerIndex": order.index(opts[0])})

    def snd(s):
        return {"symbol": s[0], "name": s[1], "guideVi": s[2], "words": [{"word": a, "meaning": b} for a, b in s[3]]}
    return {"prompt": prompt, "quiz": quiz, "sound1": snd(s1), "sound2": snd(s2)}


STRONG, WEAK = "Dạng mạnh", "Dạng yếu"
LINK, NOLINK = "Có nối âm", "Không nối âm"
STR, UNSTR = "Được nhấn", "Không nhấn"

_CONTENT = ("●", "Từ nội dung (được nhấn)", "Danh từ, động từ chính, tính từ, trạng từ, từ để hỏi thường được nhấn: đọc to, rõ, dài hơn.")
_FUNC = ("·", "Từ chức năng (đọc lướt)", "Mạo từ, giới từ, đại từ, trợ động từ, liên từ thường không nhấn và đọc nhanh, nhẹ.")

CUSTOM_PRON = {
    (10, 8): _choice("Nghe câu và chọn từ được nhấn mạnh:", [
        ("We learn English online.", ["online", "we"], "Chúng mình học tiếng Anh trực tuyến."),
        ("She uses a tablet in class.", ["tablet", "a"], "Bạn ấy dùng máy tính bảng trong lớp."),
        ("Can you send me the link?", ["link", "the"], "Bạn gửi mình đường link được không?"),
        ("They study at the library.", ["library", "at"], "Họ học ở thư viện."),
    ], _CONTENT + ([("online", "từ nội dung"), ("tablet", "từ nội dung")],), _FUNC + ([("the", "mạo từ"), ("at", "giới từ")],)),
    (10, 9): _choice("Nghe câu và chọn từ được nhấn (giữ nhịp đều giữa các từ được nhấn):", [
        ("We must protect the forests.", ["forests", "the"], "Chúng ta phải bảo vệ rừng."),
        ("Plastic is bad for the ocean.", ["ocean", "for"], "Nhựa có hại cho đại dương."),
        ("Turn off the lights when you leave.", ["lights", "when"], "Tắt đèn khi bạn ra ngoài."),
        ("Recycle your bottles and cans.", ["bottles", "and"], "Hãy tái chế chai và lon."),
    ], _CONTENT + ([("protect", "bảo vệ"), ("forests", "rừng")],), _FUNC + ([("the", "mạo từ"), ("and", "liên từ")],)),
    (11, 1): _choice("Nghe câu và cho biết trợ động từ IN HOA đọc ở dạng mạnh hay dạng yếu:", [
        ("Yes, I CAN.", [STRONG, WEAK], "Có, mình làm được. (cuối câu trả lời ngắn → dạng mạnh /kæn/)"),
        ("I CAN run five kilometres.", [WEAK, STRONG], "Mình chạy được 5 km. (giữa câu → dạng yếu /kən/)"),
        ("Where HAVE you been?", [WEAK, STRONG], "Bạn đã ở đâu vậy? (dạng yếu /əv/)"),
        ("Yes, she DOES.", [STRONG, WEAK], "Vâng, bạn ấy có. (cuối câu → dạng mạnh /dʌz/)"),
        ("DOES he eat vegetables?", [WEAK, STRONG], "Anh ấy có ăn rau không? (dạng yếu /dəz/)"),
    ], ("M", STRONG, "Trợ động từ đọc dạng mạnh khi đứng cuối câu, trong câu trả lời ngắn hoặc khi được nhấn mạnh.",
        [("Yes, I can.", "/kæn/"), ("Yes, she does.", "/dʌz/")]),
       ("y", WEAK, "Trong câu bình thường, trợ động từ thường đọc dạng yếu với /ə/.",
        [("I can swim.", "/kən/"), ("Where have you been?", "/əv/")])),
    (11, 2): _choice("Nghe cụm từ và chọn dạng rút gọn đúng:", [
        ("I would", ["I'd", "I'll"], "tôi sẽ / tôi muốn"),
        ("they are", ["they're", "there"], "họ là / họ đang"),
        ("we will not", ["we won't", "we wouldn't"], "chúng tôi sẽ không"),
        ("it is", ["it's", "its"], "nó là"),
        ("you should not", ["you shouldn't", "you couldn't"], "bạn không nên"),
    ], ("'", "Dạng rút gọn", "Trong văn nói, trợ động từ thường được rút gọn: I am → I'm, do not → don't, will not → won't.",
        [("I'd", "I would / I had"), ("won't", "will not")]),
       ("≠", "Dễ nhầm", "Phân biệt it's (it is) với its (của nó), they're (they are) với there (ở đó).",
        [("its", "của nó"), ("there", "ở đó")])),
    (11, 3): _choice("Nghe cụm từ và cho biết có nối phụ âm cuối với nguyên âm đầu không:", [
        ("turn on", [LINK, NOLINK], "bật lên – /n/ nối với /ɒ/"),
        ("smart city", [NOLINK, LINK], "thành phố thông minh – city bắt đầu bằng phụ âm"),
        ("live in", [LINK, NOLINK], "sống ở – /v/ nối với /ɪ/"),
        ("green space", [NOLINK, LINK], "không gian xanh – space bắt đầu bằng phụ âm"),
        ("look at it", [LINK, NOLINK], "nhìn vào nó – look‿at‿it"),
    ], ("‿", LINK, "Từ trước kết thúc bằng phụ âm, từ sau bắt đầu bằng nguyên âm → đọc liền: turn‿on, live‿in.",
        [("turn on", "/tɜːn‿ɒn/"), ("look at it", "/lʊk‿æt‿ɪt/")]),
       ("|", NOLINK, "Từ sau bắt đầu bằng phụ âm thì không có nối âm kiểu này.",
        [("smart city", "/smɑːt ˈsɪti/"), ("green space", "/ɡriːn speɪs/")])),
    (11, 4): _choice("Chọn cách đọc tự nhiên (đã lược bỏ nguyên âm yếu):", [
        ("different", ["/ˈdɪfrənt/", "/ˈdɪfɪrent/"], "khác nhau"),
        ("interesting", ["/ˈɪntrəstɪŋ/", "/ˌɪntəˈrestɪŋ/"], "thú vị"),
        ("camera", ["/ˈkæmrə/", "/kəˈmerə/"], "máy ảnh"),
        ("history", ["/ˈhɪstri/", "/hɪˈstɔːri/"], "lịch sử"),
        ("vegetable", ["/ˈvedʒtəbl/", "/ˈvedʒɪteɪbl/"], "rau"),
    ], ("✂", "Lược bỏ nguyên âm", "Nguyên âm yếu /ə/ hoặc /ɪ/ sau âm tiết nhấn thường bị lược bỏ khi nói tự nhiên.",
        [("family", "/ˈfæmli/"), ("chocolate", "/ˈtʃɒklət/")]),
       ("ˈ●", "Giữ trọng âm", "Âm tiết mang trọng âm không bao giờ bị lược bỏ.",
        [("different", "/ˈdɪfrənt/"), ("history", "/ˈhɪstri/")])),
    (11, 5): _choice("Nghe câu và chọn từ được nhấn mạnh:", [
        ("Global warming is a serious problem.", ["serious", "a"], "Nóng lên toàn cầu là vấn đề nghiêm trọng."),
        ("We should plant more trees.", ["trees", "we"], "Chúng ta nên trồng thêm cây."),
        ("The ice is melting fast.", ["melting", "is"], "Băng đang tan nhanh."),
        ("Cars produce a lot of gas.", ["produce", "of"], "Ô tô thải ra rất nhiều khí."),
    ], _CONTENT + ([("warming", "sự nóng lên"), ("serious", "nghiêm trọng")],), _FUNC + ([("is", "trợ động từ"), ("of", "giới từ")],)),
    (12, 4): _choice("Nghe câu và chọn từ KHÔNG được nhấn (đọc lướt):", [
        ("The city has grown fast.", ["has", "grown"], "Thành phố phát triển nhanh."),
        ("People move to big cities.", ["to", "move"], "Người dân chuyển lên thành phố lớn."),
        ("There are more cars on the roads.", ["the", "cars"], "Trên đường có nhiều xe hơn."),
        ("It was a quiet village.", ["was", "quiet"], "Đó từng là một ngôi làng yên tĩnh."),
    ], _CONTENT + ([("grown", "phát triển"), ("cities", "thành phố")],), _FUNC + ([("has", "/həz/"), ("to", "/tə/")],)),
    (12, 5): _choice("Trợ động từ / động từ khuyết thiếu IN HOA có được nhấn không?", [
        ("Yes, I CAN.", [STR, UNSTR], "Có, tôi làm được. (câu trả lời ngắn)"),
        ("She CAN speak three languages.", [UNSTR, STR], "Cô ấy nói được ba thứ tiếng. (câu khẳng định thông thường)"),
        ("I CAN'T work on Sundays.", [STR, UNSTR], "Tôi không làm việc được vào Chủ nhật. (dạng phủ định)"),
        ("I DO want this job!", [STR, UNSTR], "Tôi thật sự muốn công việc này! (nhấn mạnh)"),
        ("Where DOES he work?", [UNSTR, STR], "Anh ấy làm ở đâu? (câu hỏi thông thường)"),
    ], ("●", STR, "Nhấn trợ động từ / động từ khuyết thiếu khi ở dạng phủ định, trong câu trả lời ngắn hoặc để nhấn mạnh.",
        [("I can't come.", "phủ định"), ("I do like it!", "nhấn mạnh")]),
       ("·", UNSTR, "Trong câu khẳng định và câu hỏi thông thường, chúng đọc nhẹ (dạng yếu).",
        [("She can swim.", "/kən/"), ("Where does he work?", "/dəz/")])),
    (12, 8): _choice("Chọn cách đọc tự nhiên khi nói nhanh (đồng hóa âm):", [
        ("ten pens", ["/tem penz/", "/ten penz/"], "mười cây bút – /n/ thành /m/ trước /p/"),
        ("green park", ["/ɡriːm pɑːk/", "/ɡriːn pɑːk/"], "công viên xanh – /n/ thành /m/ trước /p/"),
        ("did you", ["/ˈdɪdʒu/", "/ˈdɪd ju/"], "bạn đã… – /d/ + /j/ thành /dʒ/"),
        ("that cat", ["/ðæk kæt/", "/ðæt kæt/"], "con mèo đó – /t/ thành /k/ trước /k/"),
        ("would you", ["/ˈwʊdʒu/", "/ˈwʊd ju/"], "bạn có muốn… – /d/ + /j/ thành /dʒ/"),
    ], ("→", "Đồng hóa âm", "Âm cuối của từ trước biến đổi cho giống âm đầu của từ sau khi nói nhanh: ten‿pens /tem penz/.",
        [("ten pens", "/tem penz/"), ("did you", "/ˈdɪdʒu/")]),
       ("=", "Khi nói chậm", "Nói chậm, tách từng từ thì không có đồng hóa: /ten penz/, /dɪd juː/.",
        [("that cat", "/ðæt kæt/"), ("would you", "/wʊd juː/")])),
    (12, 9): _choice("Nghe câu và chọn từ được nhấn mạnh:", [
        ("I want to be a doctor.", ["doctor", "to"], "Tôi muốn trở thành bác sĩ."),
        ("You need a university degree.", ["degree", "a"], "Bạn cần một tấm bằng đại học."),
        ("She works for a big company.", ["company", "for"], "Cô ấy làm cho một công ty lớn."),
        ("Think about your skills.", ["skills", "your"], "Hãy nghĩ về kỹ năng của bạn."),
    ], _CONTENT + ([("doctor", "bác sĩ"), ("degree", "bằng cấp")],), _FUNC + ([("a", "mạo từ"), ("for", "giới từ")],)),
}

for (_g, _u), _p in CUSTOM_PRON.items():
    _row = HIGH_META[_g][_u]
    assert _row[4] is None, (_g, _u)
    HIGH_META[_g][_u] = _row[:4] + (_p,)
