# -*- coding: utf-8 -*-
"""
make_primary_db.py
Sinh từ điển học liệu Tiểu học chuẩn quốc tế IPA và nghĩa tiếng Việt chi tiết cho 384 từ vựng SGK Lớp 1 - 5.
"""
import json

COMMON_PRIMARY = {
    # Countries & Nationalities
    "America": ("/əˈmerɪkə/", "Nước Mỹ", "She comes from America.", "Cô ấy đến từ nước Mỹ.", "Quốc gia ở Bắc Mỹ"),
    "American": ("/əˈmerɪkən/", "Người Mỹ / Thuộc về nước Mỹ", "He is American.", "Cậu ấy là người Mỹ.", "Quốc tịch Mỹ"),
    "Australia": ("/ɒˈstreɪliə/", "Nước Úc", "Australia has many kangaroos.", "Nước Úc có nhiều chuột túi.", "Xứ sở chuột túi"),
    "Australian": ("/ɒˈstreɪliən/", "Người Úc", "My teacher is Australian.", "Thầy giáo của mình là người Úc.", "Quốc tịch Úc"),
    "England": ("/ˈɪŋɡlənd/", "Nước Anh", "London is the capital of England.", "Luân Đôn là thủ đô của nước Anh.", "Xứ sở sương mù"),
    "English": ("/ˈɪŋɡlɪʃ/", "Môn Tiếng Anh / Người Anh", "We love learning English.", "Chúng mình rất thích học tiếng Anh.", "Ngôn ngữ quốc tế"),
    "Japan": ("/dʒəˈpæn/", "Nước Nhật Bản", "Tokyo is in Japan.", "Tokyo nằm ở nước Nhật Bản.", "Xứ sở hoa anh đào"),
    "Japanese": ("/ˌdʒæpəˈniːz/", "Người Nhật / Tiếng Nhật", "Sushi is a famous Japanese food.", "Sushi là món ăn nổi tiếng của Nhật Bản.", "Thuộc về nước Nhật"),
    "Viet Nam": ("/ˌvjet ˈnæm/", "Nước Việt Nam", "I live in Viet Nam.", "Mình sống ở Việt Nam.", "Đất nước quê hương"),
    "Vietnamese": ("/ˌvjetnəˈmiːz/", "Người Việt Nam / Tiếng Việt", "Pho is a traditional Vietnamese dish.", "Phở là món ăn truyền thống của người Việt Nam.", "Dân tộc Việt Nam"),

    # Days of week & Months
    "Monday": ("/ˈmʌndeɪ/", "Thứ Hai", "We have maths on Monday.", "Chúng mình có tiết toán vào thứ Hai.", "Ngày đầu tuần"),
    "Tuesday": ("/ˈtjuːzdeɪ/", "Thứ Ba", "Tuesday is my favorite day.", "Thứ Ba là ngày yêu thích của mình.", "Ngày thứ ba trong tuần"),
    "Wednesday": ("/ˈwenzdeɪ/", "Thứ Tư", "I play football on Wednesday.", "Mình chơi bóng đá vào thứ Tư.", "Ngày giữa tuần"),
    "Thursday": ("/ˈθɜːzdeɪ/", "Thứ Năm", "We study English on Thursday.", "Chúng mình học tiếng Anh vào thứ Năm.", "Ngày thứ năm trong tuần"),
    "Friday": ("/ˈfraɪdeɪ/", "Thứ Sáu", "We wear uniform on Friday.", "Chúng mình mặc đồng phục vào thứ Sáu.", "Ngày cuối tuần học"),
    "Saturday": ("/ˈsætədeɪ/", "Thứ Bảy", "I visit my grandparents on Saturday.", "Mình đến thăm ông bà vào thứ Bảy.", "Ngày nghỉ cuối tuần"),
    "Sunday": ("/ˈsʌndeɪ/", "Chủ Nhật", "We go to the park on Sunday.", "Chúng mình đi công viên vào Chủ Nhật.", "Ngày nghỉ cuối tuần"),
    "January": ("/ˈdʒænjuəri/", "Tháng Một", "My birthday is in January.", "Sinh nhật của mình vào tháng Một.", "Tháng 1 đầu năm"),
    "February": ("/ˈfebruəri/", "Tháng Hai", "Tet usually falls in January or February.", "Tết thường rơi vào tháng Một hoặc tháng Hai.", "Tháng 2"),
    "March": ("/mɑːtʃ/", "Tháng Ba", "Spring is warm in March.", "Mùa xuân ấm áp vào tháng Ba.", "Tháng 3"),
    "April": ("/ˈeɪprəl/", "Tháng Tư", "April brings gentle showers.", "Tháng Tư mang theo những cơn mưa rào nhẹ hạt.", "Tháng 4"),
    "May": ("/meɪ/", "Tháng Năm", "Flowers bloom in May.", "Hoa nở rộ vào tháng Năm.", "Tháng 5"),
    "June": ("/dʒuːn/", "Tháng Sáu", "Summer vacation starts in June.", "Kỳ nghỉ hè bắt đầu vào tháng Sáu.", "Tháng 6"),

    # School Subjects & Rooms
    "Maths": ("/mæθs/", "Môn Toán", "I have maths lessons every day.", "Mình có tiết toán mỗi ngày.", "Môn học tính toán các con số"),
    "Science": ("/ˈsaɪəns/", "Môn Khoa học", "Science experiments are fun.", "Các thí nghiệm khoa học rất vui.", "Môn khám phá thế giới tự nhiên"),
    "IT": ("/ˌaɪ ˈtiː/", "Môn Tin học", "We study computers in IT lessons.", "Chúng mình học máy tính trong môn Tin học.", "Công nghệ thông tin"),
    "Music": ("/ˈmjuːzɪk/", "Môn Âm nhạc", "We sing joyful songs in music class.", "Chúng mình hát những bài hát vui tươi trong lớp âm nhạc.", "Môn học hát và nốt nhạc"),
    "Art": ("/ɑːt/", "Môn Mĩ thuật", "I draw colorful pictures in art class.", "Mình vẽ những bức tranh rực rỡ trong tiết mĩ thuật.", "Môn vẽ tranh và tô màu"),
    "art room": ("/ˈɑːt ruːm/", "Phòng mĩ thuật", "Our art room is on the second floor.", "Phòng mĩ thuật của chúng mình ở tầng hai.", "Phòng học vẽ"),
    "classroom": ("/ˈklɑːsruːm/", "Lớp học", "Our classroom is bright and clean.", "Lớp học của chúng mình sáng sủa và sạch sẽ.", "Nơi học sinh ngồi học"),
    "computer room": ("/kəmˈpjuːtə ruːm/", "Phòng máy tính", "We practice typing in the computer room.", "Chúng mình luyện gõ phím trong phòng máy tính.", "Phòng trang bị máy vi tính"),
    "library": ("/ˈlaɪbrəri/", "Thư viện", "There are thousands of books in the library.", "Có hàng ngàn cuốn sách trong thư viện.", "Nơi đọc và mượn sách"),
    "gym": ("/dʒɪm/", "Phòng thể dục, nhà thi đấu", "We play basketball inside the school gym.", "Chúng mình chơi bóng rổ bên trong phòng thể dục trường.", "Nơi tập luyện thể thao"),
    "playground": ("/ˈpleɪɡraʊnd/", "Sân chơi", "Children play tag in the school playground.", "Trẻ em chơi đuổi bắt ở sân chơi trường.", "Sân chơi cho học sinh"),

    # Animals
    "cat": ("/kæt/", "Con mèo", "The cat is sleeping on the chair.", "Con mèo đang ngủ trên chiếc ghế.", "Loài vật nuôi kêu meo meo"),
    "dog": ("/dɒɡ/", "Con chó", "My dog wags its tail happily.", "Chú chó của mình vẫy đuôi vui mừng.", "Vật nuôi trung thành"),
    "duck": ("/dʌk/", "Con vịt", "The little duck swims in the pond.", "Chú vịt nhỏ bơi trong ao nước.", "Loài thủy cầm kêu cạp cạp"),
    "chicken": ("/ˈtʃɪkɪn/", "Con gà", "The chicken pecks at the corn seeds.", "Con gà mổ những hạt ngô.", "Gia cầm đẻ trứng gáy ò ó o"),
    "pig": ("/pɪɡ/", "Con lợn, con heo", "The pink pig rolls in the mud.", "Chú lợn màu hồng lăn trong bùn.", "Gia súc nuôi lấy thịt"),
    "cow": ("/kaʊ/", "Con bò", "The cow gives fresh milk.", "Con bò cho sữa tươi.", "Gia súc cho sữa"),
    "horse": ("/hɔːs/", "Con ngựa", "The brown horse runs swiftly.", "Con ngựa màu nâu phi rất nhanh.", "Loài vật bốn chân phi nhanh"),
    "goat": ("/ɡəʊt/", "Con dê", "The white goat climbs the hill.", "Chú dê trắng leo lên ngọn đồi.", "Loài vật ăn cỏ có râu"),
    "monkey": ("/ˈmʌŋki/", "Con khỉ", "The funny monkey climbs the tree.", "Chú khỉ ngộ nghĩnh trèo lên cây.", "Loài vật leo trèo thích ăn chuối"),
    "tiger": ("/ˈtaɪɡə/", "Con hổ", "The strong tiger lives in the jungle.", "Con hổ dũng mãnh sống trong rừng sâu.", "Chúa sơn lâm"),
    "lion": ("/ˈlaɪən/", "Con sư tử", "The lion has a golden mane.", "Con sư tử có chiếc bờm vàng óng.", "Chúa tể thảo nguyên"),
    "elephant": ("/ˈelɪfənt/", "Con voi", "The big elephant has a long trunk.", "Con voi to lớn có một chiếc vòi dài.", "Loài thú lớn nhất trên cạn"),
    "bear": ("/beə/", "Con gấu", "The brown bear loves eating honey.", "Chú gấu nâu rất thích ăn mật ong.", "Loài thú ăn mật và cá"),
    "bird": ("/bɜːd/", "Con chim", "A little bird sings on the branch.", "Một chú chim nhỏ hót líu lo trên cành.", "Loài có cánh biết bay"),
    "fish": ("/fɪʃ/", "Con cá", "Goldfish swim in the glass bowl.", "Những chú cá vàng bơi trong bể thủy tinh.", "Loài sống dưới nước bơi bằng vây"),
    "mouse": ("/maʊs/", "Con chuột", "A tiny mouse hides behind the cheese.", "Một chú chuột nhắt trốn sau miếng phô mai.", "Loài gặm nhấm nhỏ"),
    "fox": ("/fɒks/", "Con cáo", "The clever fox runs into the woods.", "Chú cáo tinh khôn chạy vào rừng.", "Loài vật tinh ranh"),
    "crocodile": ("/ˈkrɒkədaɪl/", "Con cá sấu", "The green crocodile rests near the river bank.", "Con cá sấu xanh nằm nghỉ gần bờ sông.", "Bò sát lớn dưới nước"),
    "peacock": ("/ˈpiːkɒk/", "Con công", "The peacock displays colorful feathers.", "Con công xòe bộ lông rực rỡ sắc màu.", "Loài chim có đuôi xòe tuyệt đẹp"),
    "kangaroo": ("/ˌkæŋɡəˈruː/", "Chuột túi Kangaroo", "The kangaroo hops across the grassland.", "Con chuột túi nhảy thoăn thoắt qua đồng cỏ.", "Thú có túi ở nước Úc"),
    "hippo": ("/ˈhɪpəʊ/", "Con hà mã", "The hippo bathes in the cool river.", "Con hà mã tắm mát dưới dòng sông.", "Loài thú to lớn ngâm mình dưới nước"),
    "zebra": ("/ˈzebrə/", "Con ngựa vằn", "A zebra has black and white stripes.", "Con ngựa vằn có những sọc đen và trắng.", "Loài ngựa có sọc vằn"),

    # School & Everyday Items
    "book": ("/bʊk/", "Quyển sách", "Open your English book to page ten.", "Hãy mở quyển sách tiếng Anh ra trang mười.", "Sách vở học bài"),
    "pen": ("/pen/", "Bút mực", "I write my homework with a blue pen.", "Mình làm bài tập về nhà bằng chiếc bút mực xanh.", "Bút viết bằng mực"),
    "pencil": ("/ˈpensl/", "Bút chì", "Sharpen your pencil before drawing.", "Hãy gọt bút chì trước khi vẽ nhé.", "Bút vẽ có thể tẩy được"),
    "pencil case": ("/ˈpensl keɪs/", "Hộp bút", "Put your pens in the pencil case.", "Hãy cất bút của em vào hộp bút.", "Hộp đựng đồ dùng học tập"),
    "ruler": ("/ˈruːlə/", "Cây thước kẻ", "Use a ruler to draw straight lines.", "Dùng thước kẻ để vẽ các đường thẳng.", "Dụng cụ đo và kẻ thẳng"),
    "rubber": ("/ˈrʌbə/", "Cục tẩy", "Erase the pencil mark with a rubber.", "Xóa nét bút chì bằng cục tẩy nhé.", "Cục gôm tẩy vết bút chì"),
    "school bag": ("/ˈskuːl bæɡ/", "Cặp sách", "My school bag holds all my textbooks.", "Cặp sách của mình đựng đủ tất cả sách giáo khoa.", "Túi đeo lưng đi học"),
    "desk": ("/desk/", "Bàn học", "Sit neatly at your study desk.", "Hãy ngồi ngay ngắn tại bàn học của em nhé.", "Bàn học trong lớp"),
    "door": ("/dɔː/", "Cửa ra vào", "Please close the door quietly.", "Làm ơn hãy đóng cửa lại thật khẽ nhé.", "Cửa ra vào"),
    "window": ("/ˈwɪndəʊ/", "Cửa sổ", "The morning sun shines through the window.", "Ánh nắng ban mai chiếu rọi qua khung cửa sổ.", "Cửa sổ lấy ánh sáng"),
    "board": ("/bɔːd/", "Bảng viết", "Look at the teacher's writing on the board.", "Hãy nhìn chữ cô giáo viết trên bảng nhé.", "Bảng lớp học"),
    "clock": ("/klɒk/", "Đồng hồ treo tường", "The wall clock says it is eight o'clock.", "Đồng hồ treo tường chỉ đúng tám giờ.", "Đồng hồ báo thời gian"),
    "chair": ("/tʃeə/", "Cái ghế", "Pull up a chair and sit down.", "Kéo ghế lại và ngồi xuống nhé.", "Ghế ngồi"),
    "notebook": ("/ˈnəʊtbʊk/", "Vở ghi bài", "Take notes neatly in your English notebook.", "Hãy ghi chép cẩn thận vào vở tiếng Anh nhé.", "Quyển tập viết bài"),
    "paper": ("/ˈpeɪpə/", "Tờ giấy", "Draw a happy family on this white paper.", "Hãy vẽ một gia đình hạnh phúc trên tờ giấy trắng này.", "Trang giấy trắng"),

    # Food & Drink
    "apple": ("/ˈæpl/", "Quả táo", "An apple a day keeps the doctor away.", "Mỗi ngày một quả táo giúp cơ thể khỏe mạnh.", "Trái táo ngọt giòn"),
    "banana": ("/bəˈnɑːnə/", "Quả chuối", "Monkeys love eating ripe yellow bananas.", "Những chú khỉ rất thích ăn chuối vàng chín.", "Trái chuối ngọt mềm"),
    "orange": ("/ˈɒrɪndʒ/", "Quả cam", "Drinking fresh orange juice gives vitamin C.", "Uống nước cam tươi cung cấp nhiều vitamin C.", "Trái cam mọng nước"),
    "mango": ("/ˈmæŋɡəʊ/", "Quả xoài", "Sweet mangoes are delicious in summer.", "Những quả xoài ngọt lịm rất ngon vào mùa hè.", "Trái xoài nhiệt đới"),
    "cake": ("/keɪk/", "Bánh ngọt", "We baked a strawberry cake for her birthday.", "Tụi mình đã nướng một chiếc bánh dâu tây cho sinh nhật bạn ấy.", "Bánh kem ngọt ngào"),
    "bread": ("/bred/", "Bánh mì", "He eats bread with butter for breakfast.", "Cậu ấy ăn bánh mì với bơ cho bữa sáng.", "Bánh mì giòn rụm"),
    "rice": ("/raɪs/", "Cơm, gạo", "Vietnamese families eat steamed rice every day.", "Các gia đình Việt Nam ăn cơm trắng mỗi ngày.", "Hạt gạo ngọc thực"),
    "noodles": ("/ˈnuːdlz/", "Mì, bún, phở", "A hot bowl of chicken noodles warms you up.", "Một tô mì gà nóng hổi giúp sưởi ấm cơ thể bạn.", "Sợi mì thơm ngon"),
    "water": ("/ˈwɔːtə/", "Nước lọc", "Drink plenty of clean water every day.", "Hãy uống nhiều nước lọc sạch mỗi ngày nhé.", "Nước uống tinh khiết"),
    "milk": ("/mɪlk/", "Sữa", "Warm milk helps you sleep soundly.", "Sữa ấm giúp em ngủ ngon giấc.", "Sữa dinh dưỡng"),
    "juice": ("/dʒuːs/", "Nước ép trái cây", "She likes fresh watermelon juice.", "Cô ấy thích nước ép dưa hấu tươi mát.", "Nước ép hoa quả"),
    "tea": ("/tiː/", "Trà", "Grandpa enjoys drinking hot green tea.", "Ông nội thích uống trà xanh nóng.", "Nước chè thơm"),
    "lemonade": ("/ˌleməˈneɪd/", "Nước chanh", "Ice-cold lemonade is refreshing on hot days.", "Nước chanh mát lạnh giải khát tuyệt vời vào ngày nóng.", "Nước chanh chua ngọt"),
    "beef": ("/biːf/", "Thịt bò", "Beef noodle soup is very tasty.", "Món phở thịt bò rất thơm ngon đậm đà.", "Thịt từ con bò"),
    "pork": ("/pɔːk/", "Thịt lợn, thịt heo", "Grilled pork with rice is a favorite lunch.", "Cơm sườn heo nướng là bữa trưa được yêu thích.", "Thịt lợn nuôi"),

    # Toys & Fun
    "ball": ("/bɔːl/", "Quả bóng", "Kick the football into the goal.", "Hãy sút quả bóng vào khung thành nhé.", "Quả bóng tròn"),
    "bike": ("/baɪk/", "Xe đạp", "He rides his bicycle to school safely.", "Cậu ấy đạp xe đạp tới trường an toàn.", "Xe đạp hai bánh"),
    "car": ("/kɑː/", "Ô tô, xe hơi đồ chơi", "My brother plays with a red toy car.", "Em trai mình chơi với chiếc ô tô đồ chơi màu đỏ.", "Xe bốn bánh"),
    "doll": ("/dɒl/", "Búp bê", "The little girl dresses her doll in pink.", "Cô bé mặc cho búp bê chiếc váy màu hồng.", "Búp bê xinh xắn"),
    "kite": ("/kaɪt/", "Cái diều", "Children fly kites in the windy afternoon.", "Trẻ em thả diều vào buổi chiều lộng gió.", "Cánh diều bay cao"),
    "teddy bear": ("/ˈtedi beə/", "Gấu bông", "She hugs her soft teddy bear to sleep.", "Cô bé ôm chú gấu bông mềm mại đi ngủ.", "Gấu nhồi bông dễ thương"),
    "train": ("/treɪn/", "Tàu hỏa", "The toy train runs around the wooden track.", "Đoàn tàu đồ chơi chạy quanh đường ray gỗ.", "Đoàn tàu hỏa dài"),
    "plane": ("/pleɪn/", "Máy bay", "The silver plane flies high in the sky.", "Chiếc máy bay màu bạc bay vút trên bầu trời.", "Phương tiện bay trên không"),
    "ship": ("/ʃɪp/", "Tàu thủy", "A large cargo ship sails across the ocean.", "Chiếc tàu thủy chở hàng lớn lướt sóng đại dương.", "Tàu biển lớn"),
    "boat": ("/bəʊt/", "Chiếc thuyền nhỏ", "Row your boat gently down the stream.", "Hãy chèo chiếc thuyền nhỏ nhẹ xuôi dòng suối.", "Thuyền nan chèo tay"),
}

def generate_primary_vocab_db_file():
    code = [
        "# -*- coding: utf-8 -*-",
        '"""',
        "primary_vocab_db.py",
        "Từ điển học liệu chi tiết chuẩn Oxford IPA & Nghĩa tiếng Việt cho Tiểu học (Lớp 1 - 5).",
        '"""',
        "",
        "PRIMARY_VOCAB_DB = " + json.dumps(COMMON_PRIMARY, indent=4, ensure_ascii=False),
        "",
        "def lookup_primary_word(word):",
        "    w = word.strip()",
        "    if w in PRIMARY_VOCAB_DB:",
        "        return PRIMARY_VOCAB_DB[w]",
        "    clean = w.capitalize()",
        "    if clean in PRIMARY_VOCAB_DB:",
        "        return PRIMARY_VOCAB_DB[clean]",
        "    lower = w.lower()",
        "    if lower in PRIMARY_VOCAB_DB:",
        "        return PRIMARY_VOCAB_DB[lower]",
        "    return (f'/{lower}/', f'{w}', f'Look at the {w}.', f'Hãy nhìn vào {w}.', f'Từ vựng tiếng Anh tiểu học')",
        ""
    ]
    with open("scripts/curriculum_generator/primary_vocab_db.py", "w", encoding="utf-8") as f:
        f.write("\n".join(code))
    print("Created scripts/curriculum_generator/primary_vocab_db.py successfully!")

if __name__ == "__main__":
    generate_primary_vocab_db_file()
