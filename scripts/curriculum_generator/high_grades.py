# -*- coding: utf-8 -*-
"""
high_grades.py
Định nghĩa và tạo dữ liệu toàn diện chuẩn SGK Tiếng Anh THPT (Global Success GDPT 2018):
- Lớp 10: 10 Units
- Lớp 11: 10 Units
- Lớp 12: 10 Units
Mỗi Unit có đầy đủ 7 trạm với IPA chuẩn quốc tế, dịch nghĩa tiếng Việt chính xác, câu hỏi trắc nghiệm kèm answerIndex.
"""

def generate_high_grades():
    grades = {}

    high_configs = [
        (10, "SGK Tiếng Anh 10 – Global Success", "sgk-10", [
            (1, "Family Life", "Đời sống gia đình", "Thì Hiện tại đơn vs Hiện tại tiếp diễn", "/br/, /kr/, /tr/", [
                ("chore", "/tʃɔː/", "Danh từ", "Việc nhà, công việc vặt", "Sharing household chores equally makes families happier.", "Chia sẻ việc nhà bình đẳng giúp gia đình hạnh phúc hơn.", "Công việc thường nhật trong nhà"),
                ("breadwinner", "/ˈbredwɪnə/", "Danh từ", "Trụ cột gia đình (người kiếm tiền chính)", "In many modern families, both parents act as breadwinners.", "Trong nhiều gia đình hiện đại, cả cha và mẹ đều là trụ cột kinh tế.", "Người kiếm thu nhập chính nuôi sống gia đình"),
                ("homemaker", "/ˈhəʊmmeɪkə/", "Danh từ", "Người nội trợ", "Being a homemaker requires immense dedication and organization.", "Làm một người nội trợ đòi hỏi sự tận tâm và tài sắp xếp chu đáo.", "Người quán xuyến việc nhà và chăm sóc con cái"),
                ("groceries", "/ˈɡrəʊsəriz/", "Danh từ số nhiều", "Thực phẩm và đồ tạp hóa", "Mom bought fresh groceries at the supermarket this morning.", "Mẹ đã mua thực phẩm tươi sống ở siêu thị sáng nay.", "Hàng hóa thực phẩm mua dùng hàng ngày"),
                ("heavy lifting", "/ˌhevi ˈlɪftɪŋ/", "Cụm danh từ", "Công việc nặng nhọc, khuân vác", "My elder brother usually does the heavy lifting around the house.", "Anh trai mình thường làm những việc khuân vác nặng nhọc trong nhà.", "Việc đòi hỏi sức lực lớn"),
                ("financial burden", "/faɪˈnænʃl ˈbɜːdn/", "Cụm danh từ", "Gánh nặng tài chính", "Both parents working helps ease the family's financial burden.", "Cả hai bố mẹ cùng đi làm giúp giảm bớt gánh nặng tài chính cho gia đình.", "Áp lực tiền bạc chi tiêu"),
            ]),
            (2, "Humans and the Environment", "Con người và môi trường", "Tương lai với will và be going to & Câu bị động", "/kl/, /pl/, /gr/, /pr/", [
                ("carbon footprint", "/ˌkɑːbən ˈfʊtprɪnt/", "Cụm danh từ", "Dấu chân carbon", "Walking to school reduces your individual carbon footprint.", "Đi bộ tới trường giúp giảm dấu chân carbon của cá nhân em.", "Lượng phát thải khí nhà kính tạo ra"),
                ("eco-friendly", "/ˌiːkəʊ ˈfrendli/", "Tính từ", "Thân thiện với môi trường", "Our school encourages using eco-friendly bamboo straws.", "Trường mình khuyến khích sử dụng ống hút tre thân thiện với môi trường.", "Không gây ô nhiễm thiên nhiên"),
                ("landfill", "/ˈlændfɪl/", "Danh từ", "Bãi chôn lấp rác thải", "Plastic bags take hundreds of years to decompose in a landfill.", "Túi nilon mất hàng trăm năm để phân hủy trong bãi chôn lấp rác.", "Nơi tập kết chôn rác"),
                ("litter", "/ˈlɪtə/", "Danh từ/Động từ", "Rác bừa bãi / Xả rác", "Do not drop litter on public streets and pavements.", "Đừng vứt rác bừa bãi trên đường phố công cộng và vỉa hè.", "Rác thải bị xả không đúng nơi quy định"),
                ("appliance", "/əˈplaɪəns/", "Danh từ", "Thiết bị điện gia dụng", "Turn off household appliances when they are not in use.", "Hãy tắt các thiết bị điện gia dụng khi không sử dụng nhé.", "Đồ dùng điện trong nhà như tivi, tủ lạnh"),
                ("energy-saving", "/ˈenədʒi ˈseɪvɪŋ/", "Tính từ", "Tiết kiệm năng lượng", "Energy-saving LED bulbs lower electrical consumption.", "Bóng đèn LED tiết kiệm năng lượng giúp hạ thấp lượng điện tiêu thụ.", "Giúp sử dụng ít điện năng"),
            ]),
            (3, "Music", "Âm nhạc", "Câu ghép, Động từ nguyên mẫu có to và nguyên mẫu không to", "Trọng âm từ có 2 âm tiết", [
                ("instrument", "/ˈɪnstrəmənt/", "Danh từ", "Nhạc cụ", "The piano is a classical musical instrument loved worldwide.", "Đàn piano là một loại nhạc cụ cổ điển được yêu thích trên toàn thế giới.", "Dụng cụ dùng để tấu nhạc"),
                ("phenomenon", "/fəˈnɒmɪnən/", "Danh từ", "Hiện tượng âm nhạc nổi bật", "The young boy band became an international pop phenomenon.", "Nhóm nhạc nam trẻ tuổi đã trở thành một hiện tượng nhạc pop quốc tế.", "Hiện tượng đặc biệt gây chú ý"),
                ("idol", "/ˈaɪdl/", "Danh từ", "Thần tượng", "Teenagers look up to talented music idols for inspiration.", "Các bạn trẻ hướng về các thần tượng âm nhạc tài năng để tìm nguồn cảm hứng.", "Người được đông đảo công chúng ngưỡng mộ"),
                ("audience", "/ˈɔːdiəns/", "Danh từ", "Khán giả", "The stadium audience cheered passionately for the singer.", "Khán giả trong sân vận động đã reo hò cuồng nhiệt cổ vũ cho ca sĩ.", "Người xem và nghe biểu diễn"),
                ("talent show", "/ˈtælənt ʃəʊ/", "Cụm danh từ", "Chương trình tìm kiếm tài năng", "Viet Nam Idol is a widely watched television talent show.", "Vietnam Idol là một chương trình tìm kiếm tài năng truyền hình được đón xem rộng rãi.", "Cuộc thi phát hiện tài năng"),
                ("passionate", "/ˈpæʃənət/", "Tính từ", "Đam mê nồng cháy", "She is deeply passionate about playing the traditional violin.", "Cô ấy vô cùng say mê chơi đàn vĩ cầm truyền thống.", "Tràn đầy nhiệt huyết và tình yêu"),
            ]),
            (4, "For a Better Community", "Vì một cộng đồng tốt đẹp hơn", "Quá khứ đơn vs Quá khứ tiếp diễn với when/while", "Trọng âm tính từ có 3 âm tiết", [
                ("community", "/kəˈmjuːnəti/", "Danh từ", "Cộng đồng", "Volunteering builds a stronger and more compassionate community.", "Hoạt động tình nguyện xây dựng một cộng đồng vững mạnh và giàu lòng nhân ái hơn.", "Xã hội quần chúng cùng chung sống"),
                ("charity", "/ˈtʃærəti/", "Danh từ", "Tổ chức từ thiện, lòng từ thiện", "All proceeds from the marathon were donated to charity.", "Toàn bộ số tiền thu được từ cuộc thi chạy marathon đã được trao tặng cho hội từ thiện.", "Tổ chức giúp đỡ người khó khăn"),
                ("non-governmental", "/ˌnɒn ˌɡʌvnˈmentl/", "Tính từ", "Phi chính phủ (NGO)", "Non-governmental organizations fund clean water projects in villages.", "Các tổ chức phi chính phủ tài trợ cho những dự án nước sạch tại các làng quê.", "Tổ chức hoạt động độc lập không thuộc chính quyền"),
                ("volunteer", "/ˌvɒlənˈtɪə/", "Danh từ/Động từ", "Tình nguyện viên", "Youth volunteers teach disadvantaged children in the evening.", "Các tình nguyện viên trẻ dạy học cho trẻ em có hoàn cảnh khó khăn vào buổi tối.", "Người cống hiến vì xã hội"),
                ("remote", "/rɪˈməʊt/", "Tính từ", "Vùng sâu vùng xa, xa xôi hẻo lánh", "Doctors travelled to remote mountainous areas to provide free check-ups.", "Các bác sĩ đã đến những vùng núi xa xôi hẻo lánh để khám bệnh miễn phí.", "Khu vực cách xa trung tâm"),
                ("donation", "/dəʊˈneɪʃn/", "Danh từ", "Khoản quyên góp, đồ ủng hộ", "Generous donations helped rebuild the damaged school.", "Những khoản quyên góp hào phóng đã giúp xây dựng lại ngôi trường bị hư hại.", "Tiền bạc đồ dùng ủng hộ"),
            ]),
            (5, "Inventions", "Các phát minh", "Thì Hiện tại hoàn thành, Danh động từ và Động từ nguyên mẫu", "Trọng âm từ có đuôi -ment và -tion", [
                ("invention", "/ɪnˈvenʃn/", "Danh từ", "Phát minh", "The printing press was a groundbreaking historical invention.", "Máy in là một phát minh mang tính bước ngoặt trong lịch sử.", "Sáng chế công nghệ mới"),
                ("artificial", "/ˌɑːtɪˈfɪʃl/", "Tính từ", "Nhân tạo", "Artificial intelligence enhances automated speech recognition.", "Trí tuệ nhân tạo nâng cao năng lực nhận diện giọng nói tự động.", "Do con người thiết kế chế tạo"),
                ("patent", "/ˈpætnt/", "Danh từ/Động từ", "Bằng sáng chế", "The university secured a global patent for its solar cell technology.", "Trường đại học đã đăng ký thành công bằng sáng chế toàn cầu cho công nghệ pin mặt trời.", "Chứng nhận độc quyền phát minh"),
                ("portable", "/ˈpɔːtəbl/", "Tính từ", "Di động, nhỏ gọn mang theo được", "A portable charger keeps your devices powered during trips.", "Một chiếc sạc dự phòng nhỏ gọn giúp sạc đầy các thiết bị trong suốt chuyến đi.", "Tiện lợi bỏ túi mang đi"),
                ("laboratory", "/ləˈbɒrətri/", "Danh từ", "Phòng thí nghiệm", "Scientists test vaccine efficacy in high-tech laboratories.", "Các nhà khoa học kiểm nghiệm hiệu quả của vắc-xin trong các phòng thí nghiệm công nghệ cao.", "Nơi nghiên cứu thí nghiệm khoa học"),
                ("touchscreen", "/ˈtʌtʃskriːn/", "Danh từ", "Màn hình cảm ứng", "Modern smartphones feature highly responsive touchscreens.", "Điện thoại thông minh ngày nay sở hữu màn hình cảm ứng độ nhạy cao.", "Màn hình tương tác bằng ngón tay"),
            ]),
            (6, "Gender Equality", "Bình đẳng giới", "Câu bị động với động từ khuyết thiếu (Passive voice with modals)", "Trọng âm từ có 3 âm tiết trở lên", [
                ("gender", "/ˈdʒendə/", "Danh từ", "Giới tính", "Equal opportunities should be available regardless of gender.", "Cơ hội bình đẳng cần được trao cho mọi người bất kể giới tính.", "Đặc tính nam nữ"),
                ("equality", "/iˈkwɒləti/", "Danh từ", "Sự bình đẳng", "Gender equality promotes sustainable social and economic progress.", "Bình đẳng giới thúc đẩy sự tiến bộ xã hội và kinh tế bền vững.", "Quyền lợi và địa vị ngang nhau"),
                ("discrimination", "/dɪˌskrɪmɪˈneɪʃn/", "Danh từ", "Sự phân biệt đối xử", "Laws strictly prohibit discrimination in employment recruitment.", "Pháp luật nghiêm cấm mọi hành vi phân biệt đối xử trong tuyển dụng lao động.", "Đối xử bất công"),
                ("eliminate", "/ɪˈlɪmɪneɪt/", "Động từ", "Xóa bỏ, loại trừ", "Society strives to eliminate harmful traditional stereotypes.", "Xã hội nỗ lực loại bỏ những định kiến truyền thống có hại.", "Trừ bỏ tận gốc"),
                ("opportunity", "/ˌɒpəˈtjuːnəti/", "Danh từ", "Cơ hội", "Education gives girls equal opportunity to pursue STEM careers.", "Giáo dục mang lại cho các bạn nữ cơ hội bình đẳng để theo đuổi sự nghiệp khối ngành STEM.", "Thời cơ thuận lợi để phát triển"),
                ("workforce", "/ˈwɜːkfɔːs/", "Danh từ", "Lực lượng lao động", "More women are joining the engineering and aviation workforce.", "Ngày càng có nhiều phụ nữ gia nhập lực lượng lao động ngành kỹ thuật và hàng không.", "Tổng số người làm việc"),
            ]),
            (7, "Viet Nam and International Organisations", "Việt Nam và các tổ chức quốc tế", "So sánh hơn và so sánh nhất của tính từ", "Trọng âm từ có đuôi -ic, -ical, -ity", [
                ("organisation", "/ˌɔːɡənaɪˈzeɪʃn/", "Danh từ", "Tổ chức", "The United Nations is the largest international organisation.", "Liên Hợp Quốc là tổ chức quốc tế lớn nhất thế giới.", "Tổ chức liên kết các quốc gia"),
                ("peacekeeping", "/ˈpiːskiːpɪŋ/", "Danh từ", "Gìn giữ hòa bình", "Vietnamese military officers serve in UN peacekeeping missions in Africa.", "Các sĩ quan quân đội Việt Nam tham gia các phái bộ gìn giữ hòa bình của Liên Hợp Quốc tại châu Phi.", "Hoạt động bảo vệ hòa bình quốc tế"),
                ("integration", "/ˌɪntɪˈɡreɪʃn/", "Danh từ", "Sự hội nhập quốc tế", "Economic integration brings substantial trade benefits to Viet Nam.", "Hội nhập kinh tế mang lại nhiều lợi ích thương mại to lớn cho Việt Nam.", "Hòa nhập vào dòng chảy toàn cầu"),
                ("promotion", "/prəˈməʊʃn/", "Danh từ", "Sự thúc đẩy, quảng bá", "UNESCO aids the promotion of Vietnamese cultural heritage globally.", "UNESCO hỗ trợ quảng bá di sản văn hóa Việt Nam ra toàn cầu.", "Đẩy mạnh và phát triển"),
                ("summit", "/ˈsʌmɪt/", "Danh từ", "Hội nghị thượng đỉnh", "Leaders from twenty nations convened at the international climate summit.", "Lãnh đạo hai mươi quốc gia đã tề tựu tại hội nghị thượng đỉnh quốc tế về khí hậu.", "Cuộc họp cấp cao của các nguyên thủ"),
                ("treaty", "/ˈtriːti/", "Danh từ", "Hiệp ước, hiệp định", "Member states signed a binding treaty on biodiversity preservation.", "Các quốc gia thành viên đã ký kết một hiệp ước ràng buộc về bảo tồn đa dạng sinh học.", "Văn bản thỏa thuận quốc tế"),
            ]),
            (8, "New Ways to Learn", "Phương thức học tập mới", "Mệnh đề quan hệ: xác định và không xác định", "Trọng âm động từ có 3 âm tiết", [
                ("blended learning", "/ˌblendɪd ˈlɜːnɪŋ/", "Cụm danh từ", "Học tập kết hợp (trực tiếp và trực tuyến)", "Blended learning combines classroom lectures with digital modules.", "Học tập kết hợp hòa quyện giữa bài giảng trên lớp với các học phần kỹ thuật số.", "Phương pháp kết hợp offline và online"),
                ("tablet", "/ˈtæblət/", "Danh từ", "Máy tính bảng", "Students use lightweight tablets to read e-textbooks in class.", "Học sinh sử dụng máy tính bảng nhỏ gọn để đọc sách giáo khoa điện tử trên lớp.", "Thiết bị màn hình cảm ứng di động"),
                ("digital", "/ˈdɪdʒɪtl/", "Tính từ", "Kỹ thuật số", "Digital tools enhance collaborative group study immensely.", "Các công cụ kỹ thuật số hỗ trợ việc học nhóm tương tác vô cùng đắc lực.", "Công nghệ trên nền tảng điện tử"),
                ("face-to-face", "/ˌfeɪs tə ˈfeɪs/", "Tính từ/Trạng từ", "Trực tiếp, mặt đối mặt", "Face-to-face discussions build strong social empathy.", "Các cuộc thảo luận trực tiếp giúp xây dựng sự thấu cảm xã hội sâu sắc.", "Tương tác trực diện ngoài đời"),
                ("interactive", "/ˌɪntərˈæktɪv/", "Tính từ", "Có tính tương tác", "Interactive educational software keeps students engaged.", "Phần mềm giáo dục có tính tương tác giúp học sinh luôn hứng thú học tập.", "Có sự phản hồi hai chiều"),
                ("educational app", "/ˌedʒuˈkeɪʃənl æp/", "Cụm danh từ", "Ứng dụng giáo dục", "Educational apps enable personalised self-paced learning.", "Các ứng dụng giáo dục tạo điều kiện cho việc tự học cá nhân hóa theo tốc độ riêng.", "Phần mềm trên điện thoại phục vụ học tập"),
            ]),
            (9, "Protecting the Environment", "Bảo vệ môi trường sống", "Câu gián tiếp: Câu trần thuật và câu mệnh lệnh", "Trọng âm trong câu (Sentence Stress)", [
                ("ecosystem", "/ˈiːkəʊsɪstəm/", "Danh từ", "Hệ sinh thái", "Mangrove forests are vital marine ecosystems along our coastlines.", "Rừng ngập mặn là những hệ sinh thái ven biển thiết yếu dọc bờ biển nước ta.", "Môi trường sống của các sinh vật"),
                ("deforestation", "/diːˌfɒrɪˈsteɪʃn/", "Danh từ", "Nạn phá rừng", "Illegal deforestation causes destructive flash floods during rainy seasons.", "Nạn chặt phá rừng trái phép gây ra những cơn lũ quét tàn phá trong mùa mưa.", "Chặt phá rừng bừa bãi"),
                ("global warming", "/ˌɡləʊbl ˈwɔːmɪŋ/", "Cụm danh từ", "Sự nóng lên toàn cầu", "Global warming is causing polar ice caps to melt at alarming rates.", "Hiện tượng nóng lên toàn cầu đang khiến các tảng băng ở địa cực tan chảy với tốc độ đáng báo động.", "Nhiệt độ trái đất tăng cao"),
                ("fossil fuel", "/ˈfɒsl fjuːəl/", "Cụm danh từ", "Nhiên liệu hóa thạch", "Burning fossil fuels releases massive amounts of carbon dioxide.", "Đốt cháy nhiên liệu hóa thạch giải phóng lượng lớn khí carbon dioxide.", "Than đá dầu mỏ tự nhiên"),
                ("conservation", "/ˌkɒnsəˈveɪʃn/", "Danh từ", "Sự bảo tồn", "Wildlife conservation centers nurse injured animals back to health.", "Các trung tâm bảo tồn động vật hoang dã chăm sóc những cá thể bị thương phục hồi sức khỏe.", "Bảo vệ và duy trì nguồn gen tự nhiên"),
                ("marine", "/məˈriːn/", "Tính từ", "Thuộc biển, đại dương", "Marine life suffers greatly from plastic debris dumped into oceans.", "Sinh vật biển chịu tổn thương nghiêm trọng bởi rác thải nhựa bị đổ ra đại dương.", "Liên quan đến biển cả"),
            ]),
            (10, "Ecotourism", "Du lịch sinh thái", "Câu điều kiện loại 1 và loại 2", "Ngữ điệu trong câu điều kiện", [
                ("ecotour", "/ˈiːkəʊtʊə/", "Danh từ", "Chuyến du lịch sinh thái", "Our class joined an educational ecotour to Cat Tien National Park.", "Lớp chúng mình đã tham gia một chuyến du lịch sinh thái bổ ích tới Vườn quốc gia Cát Tiên.", "Chuyến đi hòa mình vào thiên nhiên hoang dã"),
                ("sustainable", "/səˈsteɪnəbl/", "Tính từ", "Bền vững", "Sustainable travel balances tourism growth with ecological preservation.", "Du lịch bền vững cân bằng giữa phát triển du lịch với bảo tồn sinh thái.", "Phát triển không làm tổn hại tương lai"),
                ("destination", "/ˌdestɪˈneɪʃn/", "Danh từ", "Điểm đến du lịch", "Phong Nha - Ke Bang is a premier ecotourism destination in Viet Nam.", "Phong Nha - Kẻ Bàng là điểm đến du lịch sinh thái hàng đầu tại Việt Nam.", "Địa danh đón du khách"),
                ("biodiversity", "/ˌbaɪəʊdaɪˈvɜːsəti/", "Danh từ", "Đa dạng sinh học", "The tropical park boasts rich floral and faunal biodiversity.", "Vườn quốc gia nhiệt đới sở hữu sự đa dạng sinh học động thực vật vô cùng phong phú.", "Sự phong phú muôn loài"),
                ("culture", "/ˈkʌltʃə/", "Danh từ", "Văn hóa", "Respecting local culture is a core tenet of responsible tourism.", "Tôn trọng văn hóa địa phương là nguyên tắc cốt lõi của du lịch có trách nhiệm.", "Bản sắc phong tục tập quán"),
                ("local craft", "/ˈləʊkl krɑːft/", "Cụm danh từ", "Nghề thủ công địa phương", "Buying local crafts directly supports ethnic artisan communities.", "Mua đồ thủ công địa phương trực tiếp hỗ trợ cho cộng đồng các nghệ nhân dân tộc.", "Sản phẩm thủ công truyền thống"),
            ])
        ]),

        (11, "SGK Tiếng Anh 11 – Global Success", "sgk-11", [
            (1, "A Long and Healthy Life", "Cuộc sống trường thọ và khỏe mạnh", "Thì Quá khứ đơn vs Thì Hiện tại hoàn thành", "Dạng mạnh và dạng yếu của trợ động từ", [
                ("longevity", "/lɒnˈdʒevəti/", "Danh từ", "Tuổi thọ, sự trường thọ", "Regular exercise and positive optimism contribute to human longevity.", "Tập thể dục đều đặn và sự lạc quan tích cực góp phần nâng cao tuổi thọ của con người.", "Sống lâu sống khỏe"),
                ("immune system", "/ɪˈmjuːn ˈsɪstəm/", "Cụm danh từ", "Hệ miễn dịch", "Nutritious citrus fruits help fortify the body's immune system.", "Những loại trái cây họ cam quýt giàu dinh dưỡng giúp củng cố hệ miễn dịch của cơ thể.", "Hệ thống phòng vệ chống bệnh tật"),
                ("nutritious", "/njuːˈtrɪʃəs/", "Tính từ", "Bổ dưỡng, giàu dinh dưỡng", "A bowl of vegetable soup offers a warm nutritious meal.", "Một bát súp rau củ mang lại một bữa ăn ấm áp và giàu chất dinh dưỡng.", "Chứa nhiều dưỡng chất tốt"),
                ("workout", "/ˈwɜːkaʊt/", "Danh từ", "Buổi tập thể dục, bài tập thể hình", "He finishes a 45-minute gym workout before starting office work.", "Cậu ấy hoàn thành một buổi tập gym 45 phút trước khi bắt đầu công việc văn phòng.", "Bài rèn luyện thể chất"),
                ("prescription", "/prɪˈskrɪpʃn/", "Danh từ", "Đơn thuốc, toa thuốc", "Patients must follow the doctor's medical prescription strictly.", "Bệnh nhân phải tuân thủ nghiêm ngặt đơn thuốc của bác sĩ.", "Giấy chỉ định dùng thuốc"),
                ("bacteria", "/bækˈtɪəriə/", "Danh từ số nhiều", "Vi khuẩn", "Washing hands thoroughly with soap kills infectious bacteria.", "Rửa tay kỹ bằng xà phòng giúp tiêu diệt các vi khuẩn truyền nhiễm.", "Vi sinh vật đơn bào"),
            ]),
            (2, "The Generation Gap", "Khoảng cách thế hệ", "Động từ khuyết thiếu: must, have to, should, ought to", "Dạng viết tắt của trợ động từ", [
                ("generation gap", "/ˌdʒenəˈreɪʃn ɡæp/", "Cụm danh từ", "Khoảng cách thế hệ", "Open communication bridges the generation gap between parents and teens.", "Giao tiếp cởi mở giúp thu hẹp khoảng cách thế hệ giữa cha mẹ và con cái.", "Sự khác biệt quan điểm giữa các lứa tuổi"),
                ("curfew", "/ˈkɜːfjuː/", "Danh từ", "Giờ giới nghiêm", "Her parents set an 11 p.m. curfew on weekend nights.", "Bố mẹ cô ấy đặt giờ giới nghiêm lúc 11 giờ đêm vào các tối cuối tuần.", "Quy định giờ phải về nhà"),
                ("viewpoint", "/ˈvjuːpɔɪnt/", "Danh từ", "Quan điểm, góc nhìn", "Listening to differing viewpoints encourages personal maturity.", "Lắng nghe các quan điểm khác nhau giúp khuyến khích sự trưởng thành của cá nhân.", "Cách nhìn nhận một vấn đề"),
                ("nuclear family", "/ˌnjuːkliə ˈfæməli/", "Cụm danh từ", "Gia đình hạt nhân (bố mẹ và con cái)", "Most modern urban residents live in nuclear families.", "Hầu hết các cư dân đô thị hiện đại đều sống trong các gia đình hạt nhân.", "Gia đình chỉ có hai thế hệ"),
                ("conflict", "/ˈkɒnflɪkt/", "Danh từ", "Mâu thuẫn, xung đột", "Mutual respect prevents minor disagreements from escalating into family conflicts.", "Sự tôn trọng lẫn nhau ngăn không cho những bất đồng nhỏ leo thang thành mâu thuẫn gia đình.", "Sự va chạm bất đồng ý kiến"),
                ("open-minded", "/ˌəʊpən ˈmaɪndɪd/", "Tính từ", "Cởi mở, phóng khoáng", "Open-minded parents accept their children's career decisions willingly.", "Những bậc cha mẹ cởi mở sẵn sàng đón nhận những quyết định nghề nghiệp của con cái.", "Sẵn lòng lắng nghe cái mới"),
            ]),
            (3, "Cities of the Future", "Các thành phố tương lai", "Động từ chỉ trạng thái trong các thì tiếp diễn", "Nối âm phụ âm cuối với nguyên âm đầu", [
                ("smart city", "/ˈsmɑːt sɪti/", "Cụm danh từ", "Thành phố thông minh", "A smart city uses IoT sensors to manage energy and traffic flow.", "Một thành phố thông minh sử dụng các cảm biến IoT để quản lý dòng năng lượng và giao thông.", "Đô thị ứng dụng công nghệ cao"),
                ("infrastructure", "/ˈɪnfrəstrʌktʃə/", "Danh từ", "Cơ sở hạ tầng", "Modern transit infrastructure reduces urban commuting time.", "Cơ sở hạ tầng giao thông hiện đại giúp giảm thời gian đi lại trong đô thị.", "Hệ thống đường sá công trình kỹ thuật"),
                ("skyscraper", "/ˈskaɪskreɪpə/", "Danh từ", "Tòa nhà chọc trời", "Sustainable skyscrapers incorporate vertical gardens on their balconies.", "Những tòa nhà chọc trời bền vững tích hợp các khu vườn thẳng đứng trên ban công.", "Tòa tháp cao tầng hiện đại"),
                ("liveable", "/ˈlɪvəbl/", "Tính từ", "Đáng sống", "Clean air and pedestrian parks make a city truly liveable.", "Không khí trong lành và các công viên cho người đi bộ làm cho thành phố thực sự đáng sống.", "Có chất lượng môi trường sống tuyệt vời"),
                ("automated", "/ˈɔːtəmeɪtɪd/", "Tính từ", "Tự động hóa", "Automated recycling systems sort household waste with high precision.", "Hệ thống tái chế tự động hóa phân loại rác thải sinh hoạt với độ chính xác cao.", "Vận hành hoàn toàn bằng máy móc"),
                ("green space", "/ˈɡriːn speɪs/", "Cụm danh từ", "Không gian xanh", "Urban planners dedicate twenty percent of city land to green spaces.", "Các nhà quy hoạch đô thị dành ra hai mươi phần trăm diện tích thành phố cho các không gian xanh.", "Khu vực công viên cây xanh mặt nước"),
            ]),
            (4, "ASEAN and Viet Nam", "ASEAN và Việt Nam", "Danh động từ làm chủ ngữ và tân ngữ", "Hiện tượng nuốt nguyên âm (Elision)", [
                ("association", "/əˌsəʊʃiˈeɪʃn/", "Danh từ", "Hiệp hội, liên minh", "ASEAN stands for the Association of Southeast Asian Nations.", "ASEAN là tên viết tắt của Hiệp hội các Quốc gia Đông Nam Á.", "Tổ chức liên kết khu vực"),
                ("charter", "/ˈtʃɑːtə/", "Danh từ", "Hiến chương", "The ASEAN Charter outlines the fundamental principles of regional integration.", "Hiến chương ASEAN phác thảo những nguyên tắc nền tảng của quá trình hội nhập khu vực.", "Văn kiện quy phạm nền tảng"),
                ("solidarity", "/ˌsɒlɪˈdærəti/", "Danh từ", "Tình đoàn kết", "Member countries foster regional solidarity in resolving shared challenges.", "Các quốc gia thành viên thắt chặt tình đoàn kết khu vực trong việc giải quyết các thách thức chung.", "Sự gắn kết đồng lòng"),
                ("motto", "/ˈmɒtəʊ/", "Danh từ", "Khẩu hiệu, phương châm", "One Vision, One Identity, One Community is ASEAN's official motto.", "Một Tầm nhìn, Một Bản sắc, Một Cộng đồng là phương châm chính thức của ASEAN.", "Câu khẩu hiệu định hướng"),
                ("cooperation", "/kəʊˌɒpəˈreɪʃn/", "Danh từ", "Sự hợp tác", "Educational cooperation allows university student exchange across Southeast Asia.", "Hợp tác giáo dục cho phép sinh viên đại học trao đổi học tập khắp Đông Nam Á.", "Cùng chung tay làm việc"),
                ("diplomacy", "/dɪˈpləʊməsɪ/", "Danh từ", "Ngoại giao", "Peaceful diplomacy ensures stability and prosperity across the region.", "Ngoại giao hòa bình bảo đảm sự ổn định và thịnh vượng trên toàn khu vực.", "Nghệ thuật giao thiệp quốc tế"),
            ]),
            (5, "Global Warming", "Hiện tượng ấm lên toàn cầu", "Mệnh đề phân từ hiện tại và quá khứ", "Hiện tượng đồng hóa âm (Assimilation)", [
                ("greenhouse gas", "/ˈɡriːnhaʊs ɡæs/", "Cụm danh từ", "Khí nhà kính", "Carbon dioxide and methane are potent greenhouse gases.", "Khí CO2 và khí mê-tan là những loại khí nhà kính có tác động mạnh mẽ.", "Khí giữ nhiệt trong khí quyển"),
                ("emission", "/iˈmɪʃn/", "Danh từ", "Khí thải, sự phát thải", "Countries pledged to reduce carbon emissions to net zero by 2050.", "Các quốc gia đã cam kết giảm lượng phát thải carbon về mức bằng không vào năm 2050.", "Chất thải xả vào không khí"),
                ("catastrophic", "/ˌkætəˈstrɒfɪk/", "Tính từ", "Thảm khốc, gây tai họa lớn", "Rising sea levels could cause catastrophic coastal flooding.", "Mực nước biển dâng cao có thể gây ra những trận lụt ven biển thảm khốc.", "Gây hậu quả vô cùng nặng nề"),
                ("extreme weather", "/ɪkˌstriːm ˈweðə/", "Cụm danh từ", "Thời tiết cực đoan", "Climate change intensifies extreme weather events like prolonged heatwaves.", "Biến đổi khí hậu làm gia tăng các đợt thời tiết cực đoan như những đợt nắng nóng kéo dài.", "Hiện tượng bão lũ hạn hán bất thường"),
                ("drought", "/draʊt/", "Danh từ", "Hạn hán", "Prolonged droughts severely impact agricultural yields in central provinces.", "Hạn hán kéo dài ảnh hưởng nghiêm trọng đến sản lượng nông nghiệp tại các tỉnh miền Trung.", "Thời gian dài thiếu nước mưa"),
                ("renewable", "/rɪˈnjuːəbl/", "Tính từ", "Có thể tái tạo", "Transitioning to renewable energy mitigates global warming substantially.", "Chuyển đổi sang năng lượng tái tạo giúp giảm thiểu đáng kể hiện tượng nóng lên toàn cầu.", "Nguồn năng lượng thiên nhiên vô tận"),
            ]),
            (6, "Preserving Our Heritage", "Bảo tồn di sản của chúng ta", "Mệnh đề to-infinitive", "Ngữ điệu trong câu chẻ (Cleft sentences)", [
                ("heritage", "/ˈherɪtɪdʒ/", "Danh từ", "Di sản", "Ca tru singing is an intangible cultural heritage recognized by UNESCO.", "Hát ca trù là một di sản văn hóa phi vật thể được UNESCO vinh danh.", "Tài sản văn hóa lịch sử truyền lại"),
                ("folklore", "/ˈfəʊklɔː/", "Danh từ", "Văn hóa dân gian, truyện dân gian", "Grandmother recited captivating folklore stories to the children by the hearth.", "Bà kể những câu chuyện dân gian đầy cuốn hút cho các cháu nghe bên bếp lửa.", "Truyền thống truyền miệng dân gian"),
                ("monument", "/ˈmɒnjumənt/", "Danh từ", "Công trình tưởng niệm, di tích", "The ancient Hue imperial monuments display sublime royal architecture.", "Quần thể di tích Cố đô Huế thể hiện nét kiến trúc cung đình tuyệt mỹ.", "Công trình kiến trúc lịch sử"),
                ("preservation", "/ˌprezəˈveɪʃn/", "Danh từ", "Sự bảo tồn", "Digital archiving aids the long-term preservation of historical documents.", "Số hóa tài liệu hỗ trợ việc bảo tồn lâu dài các văn bản lịch sử.", "Giữ gìn không để hư hại"),
                ("authentic", "/ɔːˈθentɪk/", "Tính từ", "Nguyên bản, chân thực", "Restoration experts used authentic wooden materials to restore the temple.", "Các chuyên gia trùng tu đã sử dụng vật liệu gỗ nguyên bản để phục dựng ngôi đền.", "Đúng với nguyên mẫu ban đầu"),
                ("restoration", "/ˌrestəˈreɪʃn/", "Danh từ", "Sự phục dựng, trùng tu", "Careful architectural restoration returned the ancient citadel to its glory.", "Sự trùng tu kiến trúc cẩn trọng đã đưa tòa thành cổ trở lại với vẻ huy hoàng của nó.", "Tái thiết lại di tích"),
            ]),
            (7, "Education Options for School-Leavers", "Định hướng giáo dục sau phổ thông", "Danh động từ hoàn thành và phân từ hoàn thành", "Ngữ điệu trong câu hỏi lựa chọn", [
                ("vocational", "/vəʊˈkeɪʃənl/", "Tính từ", "Thuộc về học nghề", "Vocational colleges provide hands-on training for high-demand careers.", "Các trường cao đẳng nghề cung cấp chương trình đào tạo thực hành cho các công việc có nhu cầu cao.", "Đào tạo kỹ năng thực tiễn"),
                ("university", "/ˌjuːnɪˈvɜːsəti/", "Danh từ", "Trường đại học", "She applied to a leading national university to study biotechnology.", "Cô ấy đã nộp hồ sơ vào một trường đại học quốc gia hàng đầu để học ngành công nghệ sinh học.", "Cơ sở giáo dục bậc cao"),
                ("apprenticeship", "/əˈprentɪsʃɪp/", "Danh từ", "Chương trình thực tập nghề", "Paid apprenticeships allow young trainees to earn while they learn.", "Các chương trình học nghề có trả lương cho phép học viên kiếm thêm thu nhập trong khi học.", "Vừa học vừa làm có lương"),
                ("qualification", "/ˌkwɒlɪfɪˈkeɪʃn/", "Danh từ", "Bằng cấp, chứng chỉ nghề", "Holding a recognized qualification boosts employability worldwide.", "Sở hữu một chứng chỉ được công nhận giúp nâng cao cơ hội việc làm trên toàn cầu.", "Văn bằng chứng nhận trình độ"),
                ("tertiary", "/ˈtɜːʃəri/", "Tính từ", "Bậc đại học / giáo dục sau phổ thông", "Tertiary education cultivates independent critical research thinking.", "Giáo dục bậc đại học rèn luyện tư duy nghiên cứu phản biện độc lập.", "Giáo dục bậc ba"),
                ("scholarship", "/ˈskɒləʃɪp/", "Danh từ", "Học bổng", "Talented students received full scholarships to study abroad.", "Những học sinh xuất sắc đã nhận được học bổng toàn phần để đi du học.", "Khoản tiền tài trợ học tập"),
            ]),
            (8, "Becoming Independent", "Tự lập", "Câu chẻ: It is/was... that...", "Hiện tượng nối âm /r/ (Linking r and intrusive r)", [
                ("independent", "/ˌɪndɪˈpendənt/", "Tính từ", "Tự lập, độc lập", "Living away from home teaches teenagers to become fully independent.", "Sống xa nhà rèn luyện cho các bạn trẻ khả năng tự lập hoàn toàn.", "Tự mình lo liệu cuộc sống"),
                ("self-reliant", "/ˌself rɪˈlaɪənt/", "Tính từ", "Tự lực cánh sinh, tự tin vào bản thân", "Self-reliant youths manage daily cooking and study without supervision.", "Những bạn trẻ tự lực cánh sinh tự nấu ăn và học tập hàng ngày mà không cần giám sát.", "Tự dựa vào năng lực của mình"),
                ("time management", "/ˈtaɪm ˌmænɪdʒmənt/", "Cụm danh từ", "Kỹ năng quản lý thời gian", "Good time management prevents cramming before important examinations.", "Kỹ năng quản lý thời gian tốt giúp tránh việc học dồn ép trước các kỳ thi quan trọng.", "Phân bổ thời gian khoa học"),
                ("budget", "/ˈbʌdʒɪt/", "Danh từ/Động từ", "Ngân sách chi tiêu / Lập ngân sách", "Creating a weekly budget keeps spending well within limits.", "Lập ngân sách hàng tuần giúp duy trì chi tiêu luôn nằm trong giới hạn cho phép.", "Kế hoạch quản lý tiền bạc"),
                ("decision-making", "/dɪˈsɪʒn ˌmeɪkɪŋ/", "Danh từ", "Kỹ năng ra quyết định", "Critical decision-making requires evaluating pros and cons carefully.", "Việc ra quyết định sáng suốt đòi hỏi sự cân nhắc kỹ lưỡng giữa mặt lợi và hại.", "Quyết đoán chọn phương án"),
                ("mature", "/məˈtʃʊə/", "Tính từ", "Trưởng thành, chín chắn", "She demonstrated mature judgment in handling difficult interpersonal conflicts.", "Cô ấy đã thể hiện sự suy xét chín chắn khi giải quyết những bất đồng phức tạp.", "Chín chắn trong suy nghĩ"),
            ]),
            (9, "Social Issues", "Các vấn đề xã hội", "Từ và cụm từ liên kết đoạn văn (Linking words)", "Nhịp điệu và ngắt nghỉ trong lời nói", [
                ("cyberbullying", "/ˈsaɪbəbʊliɪŋ/", "Danh từ", "Bắt nạt trên mạng", "Schools actively educate students on reporting online cyberbullying.", "Nhà trường tích cực giáo dục học sinh cách báo cáo các hành vi bắt nạt trên không gian mạng.", "Xúc phạm đe dọa qua internet"),
                ("peer pressure", "/ˈpɪə ˈpreʃə/", "Cụm danh từ", "Áp lực đồng trang lứa", "Resisting negative peer pressure requires moral courage.", "Cưỡng lại áp lực tiêu cực từ bạn bè cùng trang lứa đòi hỏi lòng dũng cảm đạo đức.", "Áp lực bắt chước bạn bè"),
                ("poverty", "/ˈpɒvəti/", "Danh từ", "Nạn đói nghèo, sự nghèo khó", "Vocational training programs help eradicate poverty in rural communities.", "Các chương trình đào tạo nghề giúp xóa đói giảm nghèo tại các cộng đồng nông thôn.", "Tình trạng thiếu thốn vật chất"),
                ("body shaming", "/ˈbɒdi ˈʃeɪmɪŋ/", "Cụm danh từ", "Miệt thị ngoại hình", "Body shaming damages self-esteem and causes emotional distress.", "Miệt thị ngoại hình làm tổn hại lòng tự trọng và gây ra những nỗi đau tâm lý.", "Chê bai châm chọc vẻ ngoài của người khác"),
                ("overpopulation", "/ˌəʊvəˌpɒpjuˈleɪʃn/", "Danh từ", "Bùng nổ dân số, quá tải dân số", "Urban overpopulation strains healthcare and housing infrastructure.", "Tình trạng quá tải dân số đô thị gây áp lực lên hệ thống y tế và nhà ở.", "Dân số tăng quá đông"),
                ("crime", "/kraɪm/", "Danh từ", "Tội phạm, tội ác", "Community vigilance and education reduce youth crime rates.", "Sự cảnh giác của cộng đồng và giáo dục giúp kéo giảm tỷ lệ tội phạm trong giới trẻ.", "Hành vi vi phạm pháp luật"),
            ]),
            (10, "The Ecosystem", "Hệ sinh thái", "Danh từ ghép và Cụm danh từ phức hợp", "Ngữ điệu với thành phần chêm xen", [
                ("fauna", "/ˈfɔːnə/", "Danh từ", "Hệ động vật", "The reserve harbors unique endemic fauna found nowhere else.", "Khu bảo tồn nuôi dưỡng một hệ động vật đặc hữu độc đáo không tìm thấy ở nơi nào khác.", "Quần thể các loài động vật"),
                ("flora", "/ˈflɔːrə/", "Danh từ", "Hệ thực vật", "Botanists documented over two thousand species of tropical flora.", "Các nhà thực vật học đã ghi chép hơn hai ngàn loài trong hệ thực vật nhiệt đới.", "Quần thể các loài cây cỏ"),
                ("food chain", "/ˈfuːd tʃeɪn/", "Cụm danh từ", "Chuỗi thức ăn", "Disrupting the food chain destabilizes the whole ecological balance.", "Làm gián đoạn chuỗi thức ăn sẽ làm mất cân bằng toàn bộ hệ sinh thái.", "Mối quan hệ dinh dưỡng giữa các loài"),
                ("habitat loss", "/ˈhæbɪtæt lɒs/", "Cụm danh từ", "Mất môi trường sống", "Agricultural expansion is the primary driver of rainforest habitat loss.", "Sự mở rộng đất nông nghiệp là nguyên nhân chính dẫn đến việc mất môi trường sống ở rừng mưa.", "Thu hẹp nơi cư trú tự nhiên"),
                ("endangered", "/ɪnˈdeɪndʒəd/", "Tính từ", "Bị đe dọa, có nguy cơ tuyệt chủng", "Strict anti-poaching measures protect endangered Asian elephants.", "Những biện pháp chống săn trộm nghiêm ngặt bảo vệ loài voi châu Á đang có nguy cơ tuyệt chủng.", "Đứng trước nguy cơ biến mất"),
                ("biosphere", "/ˈbaɪəʊsfɪə/", "Danh từ", "Sinh quyển", "The biosphere encompasses all ecosystems supporting life on Earth.", "Sinh quyển bao trùm tất cả các hệ sinh thái nâng đỡ sự sống trên Trái Đất.", "Tầng chứa đựng sự sống"),
            ])
        ]),

        (12, "SGK Tiếng Anh 12 – Global Success", "sgk-12", [
            (1, "Life Stories We Admire", "Những tấm gương cuộc đời đáng ngưỡng mộ", "Quá khứ đơn vs Quá khứ tiếp diễn, used to và would", "Dạng mạnh và yếu của giới từ", [
                ("admire", "/ədˈmaɪə/", "Động từ", "Ngưỡng mộ, khâm phục", "Millions admire President Ho Chi Minh for his modest lifestyle.", "Hàng triệu con người ngưỡng mộ Chủ tịch Hồ Chí Minh vì lối sống giản dị thanh bạch của Người.", "Kính trọng và noi theo"),
                ("biography", "/baɪˈɒɡrəfi/", "Danh từ", "Tiểu sử", "Reading inspirational biographies inspires young leaders.", "Đọc những cuốn tiểu sử truyền cảm hứng khích lệ những nhà lãnh đạo trẻ.", "Cuốn sách kể về cuộc đời một nhân vật"),
                ("dedication", "/ˌdedɪˈkeɪʃn/", "Danh từ", "Sự cống hiến, tận tụy", "Her lifelong dedication to curing illnesses earned international acclaim.", "Sự cống hiến trọn đời của bà cho việc chữa bệnh đã nhận được sự tán dương của quốc tế.", "Hết lòng cống hiến"),
                ("persevere", "/ˌpɜːsɪˈvɪə/", "Động từ", "Kiên trì, bền chí", "Scientists persevered through hundreds of failed experiments.", "Các nhà khoa học đã bền chí vượt qua hàng trăm thí nghiệm thất bại.", "Vững lòng không nản chí"),
                ("resilience", "/rɪˈzɪliəns/", "Danh từ", "Khả năng phục hồi, sự kiên cường", "Emotional resilience allows people to overcome severe adversity.", "Sự kiên cường về mặt tâm lý giúp con người vượt qua những nghịch cảnh khắc nghiệt.", "Sức chịu đựng và hồi phục"),
                ("legacy", "/ˈleɡəsi/", "Danh từ", "Di sản tinh thần, gia sản", "General Vo Nguyen Giap left a legendary military and moral legacy.", "Đại tướng Võ Nguyên Giáp đã để lại một di sản quân sự và đạo đức mang tính huyền thoại.", "Những giá trị để lại cho đời sau"),
            ]),
            (2, "A Multicultural World", "Thế giới đa văn hóa", "Mạo từ xác định, không xác định và mạo từ zero", "Ngữ điệu trong câu trần thuật dùng như câu hỏi", [
                ("multicultural", "/ˌmʌltiˈkʌltʃərəl/", "Tính từ", "Đa văn hóa", "London is a vibrant multicultural metropolis home to diverse nationalities.", "London là một đại đô thị đa văn hóa sôi động, quê hương của nhiều quốc tịch đa dạng.", "Giao thoa nhiều nền văn hóa"),
                ("identity", "/aɪˈdentəti/", "Danh từ", "Bản sắc, danh tính", "Retaining cultural identity is essential in an era of globalization.", "Gìn giữ bản sắc văn hóa là điều cốt yếu trong kỷ nguyên toàn cầu hóa.", "Nét riêng biệt nhận diện một dân tộc"),
                ("diversity", "/daɪˈvɜːsəti/", "Danh từ", "Sự đa dạng", "Cultural diversity enriches society with creative perspectives.", "Sự đa dạng văn hóa làm phong phú xã hội với những góc nhìn đầy sáng tạo.", "Sự muôn màu muôn vẻ"),
                ("assimilation", "/əˌsɪməˈleɪʃn/", "Danh từ", "Sự đồng hóa văn hóa", "Sociologists study the assimilation of migrant families into urban life.", "Các nhà xã hội học nghiên cứu sự đồng hóa của những gia đình di cư vào đời sống đô thị.", "Hòa tan vào văn hóa đa số"),
                ("integration", "/ˌɪntɪˈɡreɪʃn/", "Danh từ", "Sự hòa nhập, hội nhập", "Integration preserves distinct ethnic customs while sharing national values.", "Hội nhập vừa gìn giữ những phong tục dân tộc đặc thù vừa cùng chia sẻ những giá trị quốc gia.", "Hòa nhập mà không hòa tan"),
                ("customs", "/ˈkʌstəmz/", "Danh từ số nhiều", "Phong tục tập quán", "Respecting local wedding customs builds cultural goodwill.", "Tôn trọng phong tục cưới hỏi địa phương tạo dựng thiện cảm văn hóa.", "Lề lối thói quen lâu đời"),
            ]),
            (3, "Green Living", "Lối sống xanh", "Ôn tập danh động từ và động từ nguyên mẫu có to", "Dạng rút gọn của động từ khuyết thiếu", [
                ("eco-friendly", "/ˌiːkəʊ ˈfrendli/", "Tính từ", "Thân thiện với sinh thái", "Eco-friendly lifestyle habits conserve natural resources effectively.", "Những thói quen sống thân thiện với môi trường bảo tồn tài nguyên thiên nhiên hiệu quả.", "Bảo vệ môi trường"),
                ("zero-waste", "/ˌzɪərəʊ ˈweɪst/", "Tính từ", "Không rác thải", "Zero-waste advocates bring reusable containers when shopping.", "Những người ủng hộ lối sống không rác thải mang theo hộp đựng tái sử dụng khi đi mua hàng.", "Giảm thiểu tối đa rác"),
                ("compost", "/ˈkɒmpɒst/", "Danh từ/Động từ", "Phân ủ hữu cơ / Ủ phân hữu cơ", "Kitchen vegetable scraps can be composted into nutrient-rich soil.", "Các mẩu rau củ thừa trong nhà bếp có thể được ủ thành đất giàu dưỡng chất.", "Phân bón từ rác hữu cơ"),
                ("biodegradable", "/ˌbaɪəʊdɪˈɡreɪdəbl/", "Tính từ", "Phân hủy sinh học được", "Biodegradable shopping bags decompose naturally without toxic residue.", "Túi mua sắm phân hủy sinh học tự tiêu biến trong tự nhiên mà không để lại cặn độc hại.", "Tự phân hủy an toàn"),
                ("solar panel", "/ˈsəʊlə ˈpænl/", "Cụm danh từ", "Tấm pin năng lượng mặt trời", "Installing solar panels on rooftops generates clean green electricity.", "Lắp đặt các tấm pin mặt trời trên mái nhà giúp sản sinh ra nguồn điện xanh sạch.", "Tấm hấp thụ ánh sáng mặt trời"),
                ("sustainability", "/səˌsteɪnəˈbɪləti/", "Danh từ", "Sự phát triển bền vững", "Corporate sustainability policies prioritize environmental stewardship.", "Các chính sách phát triển bền vững của doanh nghiệp đặt ưu tiên vào việc bảo vệ môi trường.", "Duy trì lâu dài không cạn kiệt"),
            ]),
            (4, "Urbanisation", "Đô thị hóa", "Tính từ ghép & Thức giả định (Subjunctive mood)", "Hiện tượng nối phụ âm với nguyên âm giữa các từ", [
                ("urbanisation", "/ˌɜːbənaɪˈzeɪʃn/", "Danh từ", "Quá trình đô thị hóa", "Rapid urbanisation strains housing and transportation systems.", "Quá trình đô thị hóa nhanh chóng gây áp lực lên hệ thống nhà ở và giao thông.", "Sự mở rộng của các thành phố"),
                ("rural-to-urban", "/ˌrʊərəl tuː ˈɜːbən/", "Tính từ", "Di cư từ nông thôn ra thành thị", "Rural-to-urban migration drives population growth in capital cities.", "Dòng di cư từ nông thôn ra thành thị thúc đẩy sự tăng trưởng dân số ở các thủ đô.", "Chuyển từ quê lên phố"),
                ("mega-city", "/ˈmeɡə ˌsɪti/", "Danh từ", "Siêu đô thị (trên 10 triệu dân)", "Tokyo and Shanghai are colossal Asian mega-cities.", "Tokyo và Thượng Hải là những siêu đô thị khổng lồ ở châu Á.", "Thành phố cực lớn"),
                ("slum", "/slʌm/", "Danh từ", "Khu ổ chuột", "Municipal governments work to upgrade sanitation in peri-urban slums.", "Chính quyền thành phố nỗ lực nâng cấp hệ thống vệ sinh trong các khu ổ chuột ven đô.", "Khu dân cư lụp xụp thiếu thốn"),
                ("industrialisation", "/ɪnˌdʌstriəlaɪˈzeɪʃn/", "Danh từ", "Công nghiệp hóa", "Industrialisation created millions of manufacturing jobs nationwide.", "Công nghiệp hóa đã tạo ra hàng triệu việc làm trong ngành sản xuất trên toàn quốc.", "Phát triển công nghiệp quy mô lớn"),
                ("municipal", "/mjuːˈnɪsɪpl/", "Tính từ", "Thuộc chính quyền thành phố, đô thị", "Municipal authorities expanded metro lines to ease congestion.", "Chính quyền đô thị đã mở rộng các tuyến tàu điện ngầm để giảm bớt ùn tắc.", "Liên quan đến quản lý đô thị"),
            ]),
            (5, "The World of Work", "Thế giới việc làm", "Câu gián tiếp với các động từ trần thuật đặc biệt (suggest, recommend)", "Ngữ điệu trong câu hỏi đuôi", [
                ("internship", "/ˈɪntɜːnʃɪp/", "Danh từ", "Kỳ thực tập", "A summer corporate internship provides practical workplace exposure.", "Một kỳ thực tập mùa hè tại doanh nghiệp mang lại sự cọ xát thực tế trong môi trường làm việc.", "Giai đoạn học sinh sinh viên làm thử việc"),
                ("recruitment", "/rɪˈkruːtmənt/", "Danh từ", "Sự tuyển dụng nhân sự", "Online recruitment platforms streamline the hiring interview process.", "Các nền tảng tuyển dụng trực tuyến giúp tinh gọn quy trình phỏng vấn tuyển người.", "Thu nhận nhân viên mới"),
                ("curriculum vitae", "/kəˌrɪkjələm ˈviːtaɪ/", "Danh từ (CV)", "Sơ yếu lý lịch, CV", "A concise curriculum vitae highlights achievements and core competencies.", "Một bản sơ yếu lý lịch súc tích làm nổi bật các thành tích và năng lực cốt lõi.", "Bản tóm tắt quá trình học tập làm việc"),
                ("soft skills", "/ˈsɒft skɪlz/", "Cụm danh từ", "Kỹ năng mềm", "Employers prize soft skills such as teamwork and active listening.", "Nhà tuyển dụng rất đánh giá cao các kỹ năng mềm như làm việc nhóm và lắng nghe tích cực.", "Kỹ năng giao tiếp ứng xử"),
                ("probationary", "/prəˈbeɪʃənri/", "Tính từ", "Thuộc thời gian thử việc", "New hires undergo a three-month probationary employment evaluation.", "Các nhân viên mới trải qua quá trình đánh giá thử việc kéo dài ba tháng.", "Giai đoạn thử thách công việc"),
                ("remuneration", "/rɪˌmjuːnəˈreɪʃn/", "Danh từ", "Tiền thù lao, lương thưởng", "Competitive remuneration packages attract highly capable specialists.", "Chế độ đãi ngộ lương thưởng cạnh tranh thu hút được những chuyên gia giỏi.", "Thu nhập từ công sức lao động"),
            ]),
            (6, "Artificial Intelligence", "Trí tuệ nhân tạo", "Thể bị động nâng cao & Thể sai khiến (have/get something done)", "Ngữ điệu trong câu chẻ", [
                ("machine learning", "/məˈʃiːn ˈlɜːnɪŋ/", "Cụm danh từ", "Học máy (Machine Learning)", "Machine learning models analyze patterns in massive datasets.", "Các mô hình học máy phân tích các khuôn mẫu quy luật trong những bộ dữ liệu khổng lồ.", "Máy tính tự học từ dữ liệu"),
                ("algorithm", "/ˈælɡərɪðəm/", "Danh từ", "Thuật toán", "Search engines rely on complex ranking algorithms.", "Các công cụ tìm kiếm dựa trên những thuật toán xếp hạng phức tạp.", "Trình tự giải quyết vấn đề bằng máy tính"),
                ("automation", "/ˌɔːtəˈmeɪʃn/", "Danh từ", "Sự tự động hóa", "Robotic automation in factories boosts production speed.", "Sự tự động hóa bằng người máy trong các nhà máy giúp tăng tốc độ sản xuất.", "Vận hành không cần sức người"),
                ("neural network", "/ˌnjʊərəl ˈnetwɜːk/", "Cụm danh từ", "Mạng nơ-ron nhân tạo", "Deep neural networks simulate biological cognitive mechanisms.", "Các mạng nơ-ron sâu mô phỏng những cơ chế nhận thức sinh học của não bộ.", "Hệ thống tính toán phỏng theo não người"),
                ("robotic", "/rəʊˈbɒtɪk/", "Tính từ", "Thuộc về người máy", "Robotic surgical arms assist surgeons in performing microscopic incisions.", "Cánh tay người máy phẫu thuật hỗ trợ các bác sĩ phẫu thuật thực hiện những đường rạch siêu nhỏ.", "Liên quan đến robot"),
                ("ethics", "/ˈeθɪks/", "Danh từ", "Đạo đức học, quy chuẩn đạo đức", "AI ethics committees ensure fairness and prevent algorithmic bias.", "Các ủy ban đạo đức AI bảo đảm tính công bằng và ngăn ngừa sự thiên vị trong thuật toán.", "Các chuẩn mực đạo đức đúng đắn"),
            ]),
            (7, "The World of Mass Media", "Thế giới truyền thông đại chúng", "Giới từ theo sau động từ và tính từ", "Trọng âm từ học thuật nhiều âm tiết", [
                ("mass media", "/ˌmæs ˈmiːdiə/", "Cụm danh từ", "Truyền thông đại chúng", "Mass media channels inform, educate, and entertain audiences globally.", "Các kênh truyền thông đại chúng cung cấp thông tin, giáo dục và giải trí cho khán giả toàn cầu.", "Báo chí truyền hình phát thanh mạng"),
                ("journalism", "/ˈdʒɜːnəlɪzəm/", "Danh từ", "Nghề làm báo, báo chí", "Investigative journalism exposes corruption and protects public interest.", "Báo chí điều tra phanh phui nạn tham nhũng và bảo vệ lợi ích công cộng.", "Nghề phóng viên nhà báo"),
                ("censorship", "/ˈsensəʃɪp/", "Danh từ", "Sự kiểm duyệt thông tin", "Debates continue regarding the balance between freedom of speech and content censorship.", "Những cuộc tranh luận vẫn tiếp diễn xung quanh sự cân bằng giữa tự do ngôn luận và kiểm duyệt nội dung.", "Kiểm tra gạn lọc nội dung trước khi phát hành"),
                ("broadcast", "/ˈbrɔːdkɑːst/", "Động từ/Danh từ", "Phát sóng, buổi phát thanh truyền hình", "The national broadcaster transmitted live coverage of the ceremony.", "Đài truyền hình quốc gia đã phát sóng trực tiếp buổi lễ long trọng.", "Truyền tín hiệu âm thanh hình ảnh"),
                ("digital platform", "/ˌdɪdʒɪtl ˈplætfɔːm/", "Cụm danh từ", "Nền tảng kỹ thuật số", "Social networks have become dominant digital platforms for news distribution.", "Các mạng xã hội đã trở thành những nền tảng kỹ thuật số chiếm ưu thế trong việc phân phối tin tức.", "Hệ thống ứng dụng trên internet"),
                ("sensationalism", "/senˈseɪʃənəlɪzəm/", "Danh từ", "Xu hướng giật gân, câu khách", "Responsible news editors reject cheap sensationalism and sensational headlines.", "Những người biên tập tin tức có trách nhiệm từ chối lối viết giật gân rẻ tiền và những tiêu đề câu khách.", "Thổi phồng gây sốc để thu hút"),
            ]),
            (8, "Wildlife Conservation", "Bảo tồn động vật hoang dã", "Ôn tập câu điều kiện: Câu điều kiện hỗn hợp (Mixed Conditionals)", "Lời nói nối trong giao tiếp tự nhiên", [
                ("poaching", "/ˈpəʊtʃɪŋ/", "Danh từ", "Nạn săn trộm động vật hoang dã", "Rangers conduct armed patrols to stop illegal tiger poaching.", "Lực lượng kiểm lâm tuần tra vũ trang để ngăn chặn nạn săn trộm hổ trái phép.", "Săn bắt thú quý hiếm trái phép"),
                ("extinct", "/ɪkˈstɪŋkt/", "Tính từ", "Đã tuyệt chủng", "The Javan rhinoceros in Viet Nam was declared officially extinct in 2011.", "Loài tê giác một sừng Java ở Việt Nam đã bị tuyên bố chính thức tuyệt chủng vào năm 2011.", "Không còn cá thể nào sống sót"),
                ("sanctuary", "/ˈsæŋktʃuəri/", "Danh từ", "Khu bảo tồn động vật hoang dã", "The island serves as a protected bird sanctuary for migratory cranes.", "Hòn đảo này đóng vai trò là một khu bảo tồn chim được bảo vệ dành cho loài sếu di cư.", "Nơi an toàn che chở muông thú"),
                ("biodiversity", "/ˌbaɪəʊdaɪˈvɜːsəti/", "Danh từ", "Đa dạng sinh học", "Preserving biodiversity ensures resilience against ecological disturbances.", "Bảo tồn sự đa dạng sinh học bảo đảm sức chống chịu trước những xáo trộn sinh thái.", "Sự phong phú muôn loài"),
                ("endangered species", "/ɪnˈdeɪndʒəd ˈspiːʃiːz/", "Cụm danh từ", "Các loài có nguy cơ tuyệt chủng", "Strict treaties regulate international trade in endangered species products.", "Các hiệp ước nghiêm ngặt quy định việc buôn bán quốc tế các sản phẩm từ động vật có nguy cơ tuyệt chủng.", "Động vật sắp biến mất"),
                ("captivity", "/kæpˈtɪvəti/", "Danh từ", "Tình trạng nuôi nhốt", "Breeding pandas in captivity helps restore dwindled wild numbers.", "Nhân giống gấu trúc trong điều kiện nuôi nhốt giúp phục hồi số lượng cá thể hoang dã bị suy giảm.", "Bị giữ trong chuồng trại sở thú"),
            ]),
            (9, "Career Paths", "Con đường sự nghiệp", "Ôn tập mệnh đề quan hệ nâng cao", "Trọng âm trong danh từ và tính từ phái sinh", [
                ("entrepreneur", "/ˌɒntrəprəˈnɜː/", "Danh từ", "Doanh nhân khởi nghiệp", "Young entrepreneurs launch innovative tech start-ups to solve real problems.", "Các doanh nhân trẻ khởi nghiệp những công ty công nghệ đổi mới để giải quyết những vấn đề thực tiễn.", "Người thành lập và vận hành doanh nghiệp"),
                ("vocation", "/vəʊˈkeɪʃn/", "Danh từ", "Thiên hướng nghề nghiệp, tiếng gọi nghề", "He found his true vocation in humanitarian community medicine.", "Cậu ấy đã tìm thấy thiên hướng nghề nghiệp đích thực của mình trong ngành y học nhân đạo phục vụ cộng đồng.", "Công việc gắn với sứ mệnh cuộc đời"),
                ("trajectory", "/trəˈdʒektəri/", "Danh từ", "Quỹ đạo, lộ trình phát triển sự nghiệp", "Mentorship accelerates a professional's upward career trajectory.", "Sự hướng dẫn của người đi trước giúp đẩy nhanh lộ trình thăng tiến sự nghiệp của một chuyên gia.", "Hướng đi và đà tiến lên"),
                ("lifelong", "/ˈlaɪflɒŋ/", "Tính từ", "Suốt đời, trọn đời", "Cultivating lifelong curiosity is the secret to sustained relevance.", "Nuôi dưỡng trí tò mò suốt đời là bí quyết để luôn bắt kịp thời đại.", "Kéo dài trong cả cuộc đời"),
                ("promotion", "/prəˈməʊʃn/", "Danh từ", "Sự thăng chức, thăng tiến", "Exemplary performance earned him a well-deserved senior promotion.", "Hiệu quả công việc xuất sắc đã đem lại cho anh ấy một sự thăng chức cấp cao hoàn toàn xứng đáng.", "Được cất nhắc lên vị trí cao hơn"),
                ("mentoring", "/ˈmentɔːrɪŋ/", "Danh từ", "Sự cố vấn, kèm cặp nghề nghiệp", "Experienced directors provide one-on-one mentoring for junior staff.", "Những giám đốc giàu kinh nghiệm cung cấp sự cố vấn một kèm một cho nhân viên cấp dưới.", "Dẫn dắt truyền đạt kinh nghiệm"),
            ]),
            (10, "Lifelong Learning", "Học tập suốt đời", "Đảo ngữ với các trạng từ mang nghĩa phủ định (Not only... but also)", "Ngữ điệu trong các câu hỏi tu từ", [
                ("lifelong learning", "/ˈlaɪflɒŋ ˈlɜːnɪŋ/", "Cụm danh từ", "Học tập suốt đời", "Lifelong learning empowers professionals to adapt to technological shifts.", "Học tập suốt đời trao quyền cho người đi làm thích ứng linh hoạt với những chuyển dịch công nghệ.", "Tinh thần học hỏi không ngừng nghỉ"),
                ("self-directed", "/ˌself daɪˈrektɪd/", "Tính từ", "Tự định hướng, tự chủ", "Self-directed learners set ambitious goals and track their own milestones.", "Những người học tự định hướng tự đặt ra những mục tiêu lớn và theo dõi các dấu mốc của chính mình.", "Chủ động hoàn toàn trong việc học"),
                ("cognitive", "/ˈkɒɡnətɪv/", "Tính từ", "Thuộc về nhận thức, trí tuệ", "Solving logic puzzles keeps cognitive faculties agile in senior years.", "Giải các câu đố tư duy giúp duy trì các năng lực nhận thức luôn nhạy bén khi về già.", "Liên quan đến hoạt động của não bộ"),
                ("agility", "/əˈdʒɪləti/", "Danh từ", "Sự nhanh nhẹn, nhạy bén linh hoạt", "Mental agility is crucial for navigating dynamic economic landscapes.", "Sự nhạy bén về trí tuệ là điều cốt yếu để điều hướng trong bối cảnh kinh tế đầy biến động.", "Khả năng ứng biến nhanh nhạy"),
                ("upskill", "/ˌʌpˈskɪl/", "Động từ", "Nâng cao tay nghề, bồi dưỡng kỹ năng mới", "Workers frequently upskill to operate sophisticated automated machinery.", "Người lao động thường xuyên bồi dưỡng nâng cao tay nghề để vận hành các máy móc tự động hóa tối tân.", "Học thêm kỹ năng bậc cao hơn"),
                ("mindset", "/ˈmaɪndset/", "Danh từ", "Tư duy, cách nhìn nhận", "A growth mindset views setbacks as springboards for improvement.", "Một tư duy cầu tiến nhìn nhận những trở ngại như những bàn đạp để hoàn thiện bản thân.", "Hệ tư tưởng và thái độ tiếp cận"),
            ])
        ])
    ]

    for g_num, book_title, book_id, units_data in high_configs:
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
                    "emoji": "🎓"
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
                "theme": "High School Academic & Career Readiness",
                "semester": 1 if u_num <= 5 else 2,
                "bookPages": f"Trang {(u_num-1)*12 + 8} – {u_num*12 + 7}",
                "bookId": book_id,
                "vocabularies": vocab_items,
                "grammar": {
                    "title": f"Chủ điểm ngữ pháp: {grammar_str}",
                    "ruleVi": f"Ngữ pháp trọng tâm chuẩn SGK Tiếng Anh {g_num} Global Success: {grammar_str}.",
                    "formula": grammar_str,
                    "quickTip": "Nắm vững công thức và cấu trúc để giải các đề thi THPT Quốc gia và bài tập chuyên sâu.",
                    "quiz": [
                        {
                            "question": f"Which vocabulary word from Unit {u_num} represents '{main_mean}'?",
                            "options": [main_word, "banana", "refrigerator", "pencil"],
                            "answerIndex": 0,
                            "explain": f"Từ '{main_word}' có phiên âm {main_ipa} mang nghĩa là '{main_mean}'."
                        },
                        {
                            "question": f"Choose the grammatically correct sentence for Unit {u_num}:",
                            "options": [f"Students examine {main_word} thoroughly in their project.", "They does not study.", "She go to school.", "I are playing."],
                            "answerIndex": 0,
                            "explain": "Áp dụng cấu trúc ngữ pháp học thuật chuẩn xác của bài học."
                        }
                    ]
                },
                "pronunciation": {
                    "pair": phonics_str,
                    "title": f"Ngữ âm & Trọng âm: {phonics_str}",
                    "sound1": {"symbol": phonics_str.split()[0], "name": f"Ngữ âm {phonics_str.split()[0]}", "words": [main_word]},
                    "sound2": {"symbol": "/ə/", "name": "Nguyên âm trung tâm /ə/", "words": ["together", "standard"]},
                    "practiceQuiz": [
                        {"word": main_word, "correctSound": phonics_str.split()[0], "options": [phonics_str.split()[0], "/k/"], "meaningVi": main_mean, "phonetic": main_ipa, "answerIndex": 0}
                    ],
                    "tongueTwister": f"Scholars articulate {main_word} accurately and persuasively."
                },
                "speaking": {
                    "targetSentence": f"In today's academic debate, we explore {title_vi.lower()} in modern society.",
                    "phonetic": f"/ɪn təˈdeɪz ˌækəˈdemɪk dɪˈbeɪt wiː ɪkˈsplɔː {main_word.lower()}/",
                    "meaningVi": f"Trong buổi tranh biện học thuật hôm nay, chúng ta khám phá về {title_vi.lower()} trong xã hội hiện đại.",
                    "situationalTopic": title_vi,
                    "dialogueTitle": f"Getting Started: {title}",
                    "dialogueContext": f"Các bạn học sinh THPT thảo luận sâu sắc về chủ đề {title_vi}.",
                    "dialogueLines": [
                        {"id": f"g{g_num}_u{u_num}_d1", "speaker": "Minh", "sentenceEn": f"Hi, Linh! Have you analyzed the background research for {title.lower()}?", "phonetic": "/haɪ lɪnh hæv juː ˈænəlaɪzd ðə ˈriːsɜːtʃ/", "meaningVi": f"Chào Linh! Cậu đã phân tích tài liệu nghiên cứu về {title_vi.lower()} chưa?", "tipsVi": "Giọng học thuật, tự tin."},
                        {"id": f"g{g_num}_u{u_num}_d2", "speaker": "Linh", "sentenceEn": f"Yes, I have! Understanding {main_word} provides deep insights for our presentation.", "phonetic": f"/jes aɪ hæv ˌʌndəˈstændɪŋ {main_word.lower()}/", "meaningVi": f"Rồi chứ! Thấu hiểu về {main_mean.lower()} mang lại những góc nhìn rất sâu sắc cho bài thuyết trình.", "tipsVi": "Nhấn rõ trọng âm từ khóa."},
                        {"id": f"g{g_num}_u{u_num}_d3", "speaker": "Minh", "sentenceEn": "Excellent! Let's synthesize our key findings and present them convincingly.", "phonetic": "/ˈeksələnt lets ˈsɪnθəsaɪz ˈaʊə faɪndɪŋz/", "meaningVi": "Tuyệt vời! Cùng tổng hợp các phát hiện chính và trình bày thật thuyết phục nhé.", "tipsVi": "Khích lệ tinh thần làm việc nhóm."}
                    ],
                    "challenges": [
                        {"id": 1, "level": "Thuyết trình học thuật", "sentenceEn": f"Critical thinking on {title_vi.lower()} prepares students for university success.", "phonetic": "/.../", "meaningVi": f"Tư duy phản biện về {title_vi.lower()} chuẩn bị hành trang vững chắc cho sự thành công ở bậc đại học.", "tipsVi": "Trình bày mạch lạc, tự tin."}
                    ]
                },
                "listening": {
                    "topic": f"Bài giảng học thuật: {title_vi}",
                    "transcript": f"Welcome to our lecture on {title}. The professor examines how {main_word} influences contemporary societal structures and economic development.",
                    "question": f"What is the central subject of the lecture?",
                    "options": [title, "Football rules", "Pop music history", "Cooking recipes"],
                    "answerIndex": 0
                },
                "reading": {
                    "title": f"Academic Reading: {title}",
                    "passage": f"In contemporary education, understanding {title_vi.lower()} is essential for high school students. Modern analysis demonstrates that {main_word} ({main_mean.lower()}) plays an indispensable role in shaping progressive viewpoints. Experts emphasize that mastering these concepts fosters intellectual resilience and equips learners with the necessary competencies to excel in an interconnected global landscape.",
                    "translation": f"Trong nền giáo dục đương đại, việc thấu hiểu {title_vi.lower()} là điều cốt yếu đối với học sinh THPT. Các phân tích hiện đại chỉ ra rằng {main_mean.lower()} ({main_word}) đóng một vai trò không thể thiếu trong việc định hình các quan điểm tiến bộ. Các chuyên gia nhấn mạnh rằng việc làm chủ những khái niệm này sẽ nuôi dưỡng sự kiên định về trí tuệ và trang bị cho người học những năng lực cần thiết để tỏa sáng trong một thế giới toàn cầu hóa kết nối chặt chẽ.",
                    "questions": [
                        {
                            "id": f"g{g_num}_u{u_num}_r1",
                            "type": "multiple_choice",
                            "question": f"Why is understanding {main_word} vital according to the passage?",
                            "options": ["It fosters intellectual resilience and equips learners for global success", "It has no practical application", "It causes academic setbacks", "It is obsolete in modern times"],
                            "answerIndex": 0,
                            "explain": "Đoạn văn nêu rõ: 'fosters intellectual resilience and equips learners with the necessary competencies to excel'."
                        }
                    ]
                },
                "writing": {
                    "correctSentence": f"We are examining {title.lower()} in our advanced seminar project",
                    "meaningVi": f"Chúng mình đang nghiên cứu về {title_vi.lower()} trong dự án hội thảo chuyên sâu.",
                    "items": [
                        {
                            "id": f"g{g_num}_u{u_num}_w1",
                            "type": "unscramble",
                            "scrambledWords": ["We", "are", "examining", main_word, "carefully"],
                            "correctSentence": f"We are examining {main_word} carefully",
                            "meaningVi": f"Chúng mình đang nghiên cứu {main_mean.lower()} một cách cẩn trọng.",
                            "hint": "Bắt đầu bằng 'We are examining...'"
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
