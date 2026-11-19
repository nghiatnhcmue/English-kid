# -*- coding: utf-8 -*-
"""
expand_primary_db.py
Cung cấp từ điển đầy đủ 100% cho 384 từ vựng Tiểu học Lớp 1 - 5 với IPA chuẩn Oxford và nghĩa tiếng Việt chi tiết.
"""
import json

WORDS_EXTRA = {
    "Bill": ("/bɪl/", "Bạn Bill (tên riêng)", "Bill is riding his bicycle.", "Bill đang đạp chiếc xe đạp của cậu ấy.", "Tên bạn nhỏ trong SGK"),
    "Children's Day": ("/ˈtʃɪldrənz deɪ/", "Ngày Quốc tế Thiếu nhi", "We celebrate Children's Day on June 1st.", "Chúng mình chào mừng ngày Quốc tế Thiếu nhi vào ngày 1 tháng 6.", "Ngày hội của trẻ em"),
    "Sports Day": ("/ˈspɔːts deɪ/", "Ngày hội thể thao", "Sports Day is held on the school playground.", "Ngày hội thể thao được tổ chức ở sân trường.", "Ngày thi đấu thể dục thể thao"),
    "T-shirt": ("/ˈtiː ʃɜːt/", "Áo thun, áo phông", "He wears a cool white T-shirt.", "Cậu ấy mặc một chiếc áo phông trắng rất ngầu.", "Áo ngắn tay cổ tròn"),
    "Teachers' Day": ("/ˈtiːtʃəz deɪ/", "Ngày Nhà giáo Việt Nam", "We give flowers to teachers on Teachers' Day.", "Chúng em tặng hoa cho các thầy cô vào Ngày Nhà giáo.", "Ngày 20 tháng 11"),
    "active": ("/ˈæktɪv/", "Năng động, hoạt bát", "Mai is very active in physical games.", "Mai rất năng động trong các trò chơi vận động.", "Nhanh nhẹn và tháo vát"),
    "address": ("/əˈdres/", "Địa chỉ nhà", "What is your home address?", "Địa chỉ nhà của bạn là gì?", "Số nhà và tên đường phố"),
    "afternoon": ("/ˌɑːftəˈnuːn/", "Buổi chiều", "Good afternoon, teacher!", "Em chào cô vào buổi chiều ạ!", "Thời gian từ trưa đến tối"),
    "architect": ("/ˈɑːkɪtekt/", "Kiến trúc sư", "My uncle is an architect who designs beautiful buildings.", "Chú của mình là một kiến trúc sư thiết kế những tòa nhà đẹp.", "Người vẽ thiết kế nhà cửa"),
    "artist": ("/ˈɑːtɪst/", "Họa sĩ, nghệ sĩ", "The talented artist paints a rural landscape.", "Người họa sĩ tài hoa vẽ một bức tranh phong cảnh làng quê.", "Người sáng tạo nghệ thuật"),
    "astronaut": ("/ˈæstrənɔːt/", "Phi hành gia", "He dreams of becoming an astronaut flying to Mars.", "Cậu ấy ước mơ trở thành một phi hành gia bay lên sao Hỏa.", "Người du hành vào vũ trụ"),
    "at home": ("/æt həʊm/", "Ở nhà", "I usually stay at home on rainy Sunday mornings.", "Mình thường ở nhà vào những sáng Chủ nhật trời mưa.", "Không gian gia đình"),
    "at school": ("/æt skuːl/", "Ở trường học", "We study English and play games at school.", "Chúng mình học tiếng Anh và chơi trò chơi ở trường.", "Nơi thầy cô và học sinh gặp nhau"),
    "autumn": ("/ˈɔːtəm/", "Mùa thu", "Autumn has cool winds and golden leaves.", "Mùa thu có những cơn gió mát và lá vàng rơi.", "Mùa thứ ba trong năm"),
    "avenue": ("/ˈævənjuː/", "Đại lộ", "The presidential palace is located on a grand avenue.", "Dinh thự nằm trên một đại lộ thênh thang.", "Con đường lớn nhiều làn xe"),
    "baby": ("/ˈbeɪbi/", "Em bé sơ sinh", "The cute baby sleeps soundly in the cradle.", "Em bé dễ thương ngủ ngoan trong chiếc nôi.", "Trẻ em còn rất nhỏ"),
    "badminton": ("/ˈbædmɪntən/", "Môn cầu lông", "We play badminton in the gym every afternoon.", "Chúng mình chơi cầu lông trong nhà thi đấu mỗi buổi chiều.", "Môn thể thao dùng vợt đánh cầu"),
    "bag": ("/bæɡ/", "Cái cặp, cái túi", "Put your notebooks into your school bag.", "Hãy bỏ những quyển vở của em vào cặp sách nhé.", "Túi đựng đồ"),
    "bakery": ("/ˈbeɪkəri/", "Tiệm bánh mì, lò bánh", "The aroma of fresh bread comes from the bakery.", "Mùi thơm nức của bánh mì mới ra lò tỏa ra từ tiệm bánh.", "Nơi nướng và bán bánh"),
    "ball": ("/bɔːl/", "Quả bóng", "The boys kick the ball into the net.", "Các bạn nam sút quả bóng vào lưới.", "Đồ chơi thể thao hình tròn"),
    "basketball": ("/ˈbɑːskɪtbɔːl/", "Môn bóng rổ", "Basketball is an exciting team sport.", "Bóng rổ là một môn thể thao đồng đội đầy hào hứng.", "Môn ném bóng vào rổ"),
    "bathroom": ("/ˈbɑːθruːm/", "Phòng tắm", "Wash your hands in the clean bathroom.", "Hãy rửa tay trong phòng tắm sạch sẽ nhé.", "Nơi tắm gội vệ sinh"),
    "bay": ("/beɪ/", "Vịnh biển", "Ha Long Bay is a world natural wonder.", "Vịnh Hạ Long là một kỳ quan thiên nhiên của thế giới.", "Vùng biển ăn sâu vào đất liền"),
    "beach": ("/biːtʃ/", "Bãi biển", "Children build sandcastles on the sunny beach.", "Trẻ em xây lâu đài cát trên bãi biển đầy nắng.", "Bãi cát ven biển"),
    "because": ("/bɪˈkɒz/", "Bởi vì", "I like apples because they are sweet and healthy.", "Mình thích táo bởi vì chúng ngọt và bổ dưỡng.", "Từ nối chỉ nguyên nhân"),
    "bed": ("/bed/", "Cái giường ngủ", "Go to bed early to stay healthy.", "Hãy đi ngủ sớm để giữ gìn sức khỏe nhé.", "Đồ nội thất để nằm ngủ"),
    "bedroom": ("/ˈbedruːm/", "Phòng ngủ", "My cozy bedroom has a bookshelf and a lamp.", "Phòng ngủ ấm cúng của mình có một giá sách và chiếc đèn bàn.", "Phòng để nghỉ ngơi ngủ"),
    "bee": ("/biː/", "Con ong", "The busy bee collects nectar from blooming flowers.", "Chú ong chăm chỉ thu thập mật hoa từ những bông hoa đang nở.", "Loài côn trùng làm mật"),
    "bell": ("/bel/", "Cái chuông", "The school bell rings at seven o'clock.", "Chuông trường reo vang lúc bảy giờ.", "Vật phát ra tiếng reng reng"),
    "birthday": ("/ˈbɜːθdeɪ/", "Ngày sinh nhật", "Happy birthday to you!", "Chúc mừng sinh nhật bạn nhé!", "Ngày kỷ niệm sinh ra đời"),
    "black": ("/blæk/", "Màu đen", "The blackboard is clean and smooth.", "Chiếc bảng đen sạch sẽ và bóng loáng.", "Màu sắc huyền bí"),
    "blouse": ("/blaʊz/", "Áo sơ mi nữ", "She wears a white blouse to school.", "Bạn ấy mặc một chiếc áo sơ mi nữ màu trắng đi học.", "Áo sơ mi kiểu dành cho bạn nữ"),
    "blue": ("/bluː/", "Màu xanh da trời, xanh lam", "The sky is bright blue today.", "Bầu trời hôm nay có màu xanh lam trong trẻo.", "Màu của bầu trời và biển"),
    "brown": ("/braʊn/", "Màu nâu", "The friendly dog has soft brown fur.", "Chú chó thân thiện có bộ lông màu nâu mềm mại.", "Màu của đất và gỗ"),
    "bus": ("/bʌs/", "Xe buýt", "We take the school bus every morning.", "Chúng mình đi xe buýt của trường vào mỗi sáng.", "Phương tiện giao thông công cộng"),
    "bus stop": ("/ˈbʌs stɒp/", "Trạm xe buýt", "Wait for the bus at the bus stop safely.", "Hãy chờ xe buýt tại trạm xe buýt an toàn nhé.", "Nơi đón trả khách đi xe buýt"),
    "canteen": ("/kænˈtiːn/", "Căng tin trường", "Students buy healthy snacks in the school canteen.", "Học sinh mua đồ ăn nhẹ lành mạnh ở căng tin trường.", "Nơi ăn uống trong trường"),
    "clever": ("/ˈklevə/", "Thông minh, khéo léo", "The clever fox found a way to cross the river.", "Chú cáo thông minh đã tìm ra cách để qua sông.", "Sáng dạ và mưu trí"),
    "climb": ("/klaɪm/", "Trèo, leo", "Do not climb tall trees because it is dangerous.", "Đừng trèo cây cao vì rất nguy hiểm nhé.", "Động tác bám leo lên cao"),
    "cloudy": ("/ˈklaʊdi/", "Nhiều mây", "It is cloudy and cool today.", "Hôm nay trời nhiều mây và mát mẻ.", "Thời tiết có nhiều đám mây"),
    "cook": ("/kʊk/", "Nấu ăn / Đầu bếp", "Dad cooks delicious dinner for the family.", "Bố nấu bữa tối thơm ngon cho cả gia đình.", "Làm đồ ăn chín"),
    "dancer": ("/ˈdɑːnsə/", "Vũ công, người nhảy múa", "The graceful dancer performs on stage.", "Người vũ công duyên dáng biểu diễn trên sân khấu.", "Người múa chuyên nghiệp"),
    "doctor": ("/ˈdɒktə/", "Bác sĩ", "The caring doctor examines the sick child.", "Vị bác sĩ ân cần khám bệnh cho em bé ốm.", "Người chữa bệnh cứu người"),
    "drawing": ("/ˈdrɔːɪŋ/", "Vẽ tranh / Bức vẽ", "Drawing animals is my favorite hobby.", "Vẽ các con vật là sở thích yêu thích của mình.", "Môn nghệ thuật tạo hình"),
    "dress": ("/dres/", "Chiếc váy liền thân", "Mai wears a lovely pink dress for the party.", "Mai mặc một chiếc váy màu hồng xinh xắn đi dự tiệc.", "Trang phục nữ liền áo và váy"),
    "drive": ("/draɪv/", "Lái xe", "Dad drives a car carefully on the road.", "Bố lái xe ô tô cẩn thận trên đường.", "Điều khiển xe hơi"),
    "farmer": ("/ˈfɑːmə/", "Bác nông dân", "The hard-working farmer harvests rice in the field.", "Bác nông dân chăm chỉ gặt lúa trên cánh đồng.", "Người làm nghề trồng trọt"),
    "father": ("/ˈfɑːðə/", "Bố, người cha", "My father teaches me how to ride a bicycle.", "Bố dạy mình cách đạp xe đạp.", "Người cha trong gia đình"),
    "fly": ("/flaɪ/", "Bay / Thả diều", "Birds fly high across the blue sky.", "Những chú chim bay vút qua bầu trời xanh.", "Chuyển động trên không"),
    "football": ("/ˈfʊtbɔːl/", "Môn bóng đá", "Boys play football in the yard after class.", "Các bạn nam chơi bóng đá ở sân sau giờ học.", "Môn thể thao vua"),
    "friend": ("/frend/", "Người bạn", "Nam is my best friend in class.", "Nam là người bạn thân nhất của mình trong lớp.", "Bạn bè thân thiết"),
    "grandfather": ("/ˈɡrænfɑːðə/", "Ông nội / Ông ngoại", "My grandfather tells exciting historical stories.", "Ông của mình kể những câu chuyện lịch sử hấp dẫn.", "Người ông trong gia đình"),
    "grandmother": ("/ˈɡrænmʌðə/", "Bà nội / Bà ngoại", "Grandmother knits a warm scarf for winter.", "Bà đan một chiếc khăn ấm cho mùa đông.", "Người bà yêu quý"),
    "green": ("/ɡriːn/", "Màu xanh lá cây", "The leaves are fresh green in spring.", "Những chiếc lá xanh tươi mơn mởn vào mùa xuân.", "Màu của cỏ cây"),
    "guitar": ("/ɡɪˈtɑː/", "Đàn ghi-ta", "He plays the acoustic guitar and sings happily.", "Cậu ấy gảy đàn ghi-ta và hát thật vui vẻ.", "Nhạc cụ dây gảy"),
    "hat": ("/hæt/", "Cái mũ, nón", "Wear a wide-brimmed hat when going out in the sun.", "Hãy đội mũ rộng vành khi đi ra ngoài trời nắng nhé.", "Vật đội trên đầu che nắng"),
    "mother": ("/ˈmʌðə/", "Mẹ, người mẹ", "My mother cooks delicious soup for us.", "Mẹ nấu món súp thơm ngon cho chúng mình.", "Người mẹ dịu hiền"),
    "nurse": ("/nɜːs/", "Y tá, điều dưỡng viên", "The gentle nurse cares for sick patients.", "Cô y tá dịu dàng chăm sóc các bệnh nhân ốm.", "Người hỗ trợ bác sĩ"),
    "orange": ("/ˈɒrɪndʒ/", "Quả cam / Màu cam", "The sun sets with a glowing orange light.", "Mặt trời lặn tỏa ánh sáng màu cam rực rỡ.", "Màu sắc ấm áp"),
    "painter": ("/ˈpeɪntə/", "Họa sĩ / Thợ sơn", "The skilled painter colors the wall neatly.", "Người thợ sơn quét màu lên bức tường thật gọn gàng.", "Người vẽ tranh hoặc sơn nhà"),
    "park": ("/pɑːk/", "Công viên", "We go for a walk in the green park.", "Chúng mình đi dạo trong công viên rợp bóng cây xanh.", "Khu vui chơi cây xanh công cộng"),
    "pilot": ("/ˈpaɪlət/", "Phi công", "The brave pilot flies giant passenger airplanes.", "Người phi công dũng cảm lái những chiếc máy bay chở khách khổng lồ.", "Người điều khiển máy bay"),
    "rainy": ("/ˈreɪni/", "Trời mưa", "Take an umbrella on a rainy day.", "Hãy mang theo một chiếc ô vào ngày trời mưa nhé.", "Thời tiết có mưa rơi"),
    "red": ("/red/", "Màu đỏ", "The red roses smell wonderful.", "Những bông hồng đỏ tỏa hương thơm ngát.", "Màu sắc tươi thắm"),
    "ride": ("/raɪd/", "Cưỡi, đạp xe", "Children ride bikes around the calm lake.", "Trẻ em đạp xe quanh bờ hồ tĩnh lặng.", "Động tác đi xe hai bánh hoặc cưỡi ngựa"),
    "sing": ("/sɪŋ/", "Hát", "The happy children sing English songs together.", "Các bạn nhỏ vui vẻ cùng nhau hát những bài hát tiếng Anh.", "Phát ra giai điệu bằng giọng"),
    "sister": ("/ˈsɪstə/", "Chị gái / Em gái", "My elder sister helps me with homework.", "Chị gái giúp mình làm bài tập về nhà.", "Chị hoặc em gái trong gia đình"),
    "sunny": ("/ˈsʌni/", "Trời nắng, nhiều nắng", "It is warm and sunny on the beach today.", "Hôm nay trời ấm áp và đầy nắng trên bãi biển.", "Thời tiết có ánh mặt trời"),
    "swim": ("/swɪm/", "Bơi lội", "We swim in the cool pool during summer.", "Chúng mình bơi trong hồ bơi mát lạnh suốt mùa hè.", "Vận động dưới nước"),
    "teacher": ("/ˈtiːtʃə/", "Thầy giáo, cô giáo", "Our English teacher is kind and patient.", "Cô giáo tiếng Anh của chúng mình rất tốt bụng và kiên nhẫn.", "Người truyền dạy kiến thức"),
    "white": ("/waɪt/", "Màu trắng", "The clouds are fluffy white in the sky.", "Những đám mây trắng bồng bềnh trôi trên bầu trời.", "Màu tinh khôi"),
    "windy": ("/ˈwɪndi/", "Trời nhiều gió, lộng gió", "It is windy today, perfect for flying kites.", "Hôm nay trời lộng gió, rất hoàn hảo để thả diều.", "Thời tiết có nhiều gió thổi"),
    "yellow": ("/ˈjeləʊ/", "Màu vàng", "The ripe bananas are bright yellow.", "Những quả chuối chín có màu vàng tươi sáng.", "Màu của ánh mặt trời"),
    "zoo": ("/zuː/", "Sở thú, vườn bách thú", "We saw monkeys and elephants at the city zoo.", "Chúng mình đã thấy những chú khỉ và đàn voi ở sở thú thành phố.", "Nơi nuôi dưỡng muông thú"),
}

def update_db():
    import sys, os
    sys.path.insert(0, os.path.abspath("."))
    from scripts.curriculum_generator.primary_vocab_db import PRIMARY_VOCAB_DB
    updated = dict(PRIMARY_VOCAB_DB)
    updated.update(WORDS_EXTRA)
    
    code = [
        "# -*- coding: utf-8 -*-",
        '"""',
        "primary_vocab_db.py",
        "Từ điển học liệu chi tiết chuẩn Oxford IPA & Nghĩa tiếng Việt cho Tiểu học (Lớp 1 - 5).",
        '"""',
        "",
        "PRIMARY_VOCAB_DB = " + json.dumps(updated, indent=4, ensure_ascii=False),
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
    print(f"Updated primary_vocab_db.py with {len(updated)} entries!")

if __name__ == "__main__":
    update_db()
