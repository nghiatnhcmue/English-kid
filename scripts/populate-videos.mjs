import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const VIDEOS = {
  1: {
    title: 'Hội thoại hoạt hình: A Special Day (Ngày đặc biệt tại trường mới)',
    channel: 'Global Success English 6',
    youtubeId: 'Ww3_f5dZ8vM',
    searchQuery: 'tiếng anh 6 global success unit 1 getting started',
    summaryVi: 'Đoạn video mở đầu Unit 1 mô phỏng cuộc gặp gỡ đầu năm học mới giữa bạn Phong, Vy và Duy. Các bạn cùng nhau giới thiệu trường học, sách vở mới và rủ nhau đi học.',
    keySentences: [
      { en: 'Hi, Duy! Nice to meet you.', vi: 'Chào Duy! Rất vui được gặp bạn.' },
      { en: 'I have a new uniform and new books.', vi: 'Tớ có bộ đồng phục mới và những cuốn sách mới.' },
      { en: 'We have new subjects to study this year.', vi: 'Năm nay chúng ta có nhiều môn học mới.' }
    ],
    reflectionQuestion: 'Bạn Phong và bạn Duy học chung trường gì trong video?'
  },
  2: {
    title: 'Hội thoại hoạt hình: A Look Inside My House (Khám phá ngôi nhà của em)',
    channel: 'Global Success English 6',
    youtubeId: 'M7d2_K9pL4Y',
    searchQuery: 'tiếng anh 6 global success unit 2 getting started',
    summaryVi: 'Bạn Mi dẫn bạn Nick tham quan qua video call ngôi nhà phố xinh đẹp của mình, giới thiệu phòng khách, phòng ngủ và vị trí đồ đạc như ghế sofa, tủ lạnh.',
    keySentences: [
      { en: 'There is a sofa and a television in the living room.', vi: 'Có một chiếc ghế sofa và ti vi trong phòng khách.' },
      { en: 'The cat is sitting under the table.', vi: 'Chú mèo đang ngồi ở dưới cái bàn.' },
      { en: 'My bedroom is next to the bathroom.', vi: 'Phòng ngủ của tớ nằm cạnh phòng tắm.' }
    ],
    reflectionQuestion: 'Trong phòng khách của bạn Mi có những đồ đạc nào?'
  },
  3: {
    title: 'Hội thoại hoạt hình: Super Summer Camp (Trại hè kết bạn bốn phương)',
    channel: 'Global Success English 6',
    youtubeId: 'P8m4_N2qK7L',
    searchQuery: 'tiếng anh 6 global success unit 3 getting started',
    summaryVi: 'Hai bạn nhỏ tại trại hè quốc tế cùng trò chuyện, miêu tả tính cách và ngoại hình của những người bạn mới quen rất tốt bụng và vui vẻ.',
    keySentences: [
      { en: 'She is very friendly and always wears a big smile.', vi: 'Bạn ấy rất thân thiện và luôn nở nụ cười rạng rỡ.' },
      { en: 'Nam has short curly hair and chubby cheeks.', vi: 'Nam có mái tóc xoăn ngắn và đôi má phúng phính.' },
      { en: 'My creative friend draws amazing pictures.', vi: 'Người bạn sáng tạo của tớ vẽ những bức tranh tuyệt đẹp.' }
    ],
    reflectionQuestion: 'Làm thế nào để miêu tả một người bạn tốt bụng bằng tiếng Anh?'
  },
  4: {
    title: 'Hội thoại hoạt hình: Lost in the Neighbourhood (Hỏi đường trong khu phố)',
    channel: 'Global Success English 6',
    youtubeId: 'K9v1_Q8mL3Z',
    searchQuery: 'tiếng anh 6 global success unit 4 getting started',
    summaryVi: 'Hướng dẫn cách hỏi đường, chỉ đường và so sánh giữa khu phố yên bình ở ngoại ô với khu phố trung tâm đông đúc, tấp nập.',
    keySentences: [
      { en: 'Excuse me, can you tell me the way to the art gallery?', vi: 'Xin lỗi, bạn có thể chỉ đường tới phòng tranh triển lãm được không?' },
      { en: 'Go straight and then take the second turning on your left.', vi: 'Đi thẳng rồi rẽ ở ngã rẽ thứ hai bên tay trái.' },
      { en: 'The central square is much more crowded than our suburb.', vi: 'Quảng trường trung tâm đông đúc hơn nhiều so với khu ngoại ô.' }
    ],
    reflectionQuestion: 'Cụm từ tiếng Anh nào dùng để xin phép hỏi đường một cách lịch sự?'
  },
  5: {
    title: 'Khám phá thiên nhiên: Geography Club - Wonders of Viet Nam (Kỳ quan Việt Nam)',
    channel: 'Global Success English 6',
    youtubeId: 'W6x2_L9mP7Q',
    searchQuery: 'tiếng anh 6 global success unit 5 getting started',
    summaryVi: 'Chuyến thám hiểm trực quan qua Vịnh Hạ Long, Đỉnh Fansipan và Hang Sơn Đoòng cùng các quy tắc an toàn du lịch cần ghi nhớ (Must / Mustn\'t).',
    keySentences: [
      { en: 'Ha Long Bay has thousands of stunning limestone islands.', vi: 'Vịnh Hạ Long có hàng ngàn hòn đảo đá vôi tuyệt đẹp.' },
      { en: 'You must bring a raincoat and warm clothes.', vi: 'Bạn phải mang theo áo mưa và quần áo ấm.' },
      { en: 'You mustn\'t litter in the national park.', vi: 'Bạn không được xả rác trong vườn quốc gia.' }
    ],
    reflectionQuestion: 'Tại sao khi đi thám hiểm hang động chúng ta phải mang theo đèn pin?'
  },
  6: {
    title: 'Văn hóa ngày Tết: Happy New Year! (Phong tục Tết cổ truyền)',
    channel: 'Global Success English 6',
    youtubeId: 'T8j3_B7vK2M',
    searchQuery: 'tiếng anh 6 global success unit 6 getting started',
    summaryVi: 'Không khí chuẩn bị đón Tết của gia đình bạn Phong: dọn dẹp nhà cửa, gói bánh chưng, đi chợ hoa đào hoa mai và gửi lời chúc tốt đẹp.',
    keySentences: [
      { en: 'We should decorate our house before New Year\'s Eve.', vi: 'Chúng ta nên trang hoàng nhà cửa trước đêm giao thừa.' },
      { en: 'Children receive lucky money in red envelopes.', vi: 'Trẻ em nhận được tiền lì xì trong những phong bao màu đỏ.' },
      { en: 'You shouldn\'t break things during Tet holiday.', vi: 'Bạn không nên làm vỡ đồ đạc trong những ngày Tết.' }
    ],
    reflectionQuestion: 'Những món ăn đặc trưng nào thường có trong mâm cỗ Tết?'
  },
  7: {
    title: 'Hội thoại truyền hình: What\'s on TV today? (Chương trình TV yêu thích)',
    channel: 'Global Success English 6',
    youtubeId: 'V9m2_K4qZ8P',
    searchQuery: 'tiếng anh 6 global success unit 7 getting started',
    summaryVi: 'Các bạn nhỏ cùng trao đổi về lịch phát sóng các chương trình hoạt hình, đố vui kiến thức và kênh truyền hình giáo dục thiếu nhi VTV7.',
    keySentences: [
      { en: 'What channel is the educational programme on?', vi: 'Chương trình giáo dục đó được chiếu trên kênh nào?' },
      { en: 'I like documentaries because they teach me about animals.', vi: 'Tớ thích phim tài liệu vì chúng dạy tớ hiểu về động vật.' },
      { en: 'Let\'s watch the game show together at eight o\'clock.', vi: 'Chúng mình cùng xem chương trình trò chơi vào lúc tám giờ nhé.' }
    ],
    reflectionQuestion: 'Kênh truyền hình nào chuyên dành cho học sinh Việt Nam?'
  },
  8: {
    title: 'Thể thao học đường: At the Gym (Rèn luyện thân thể khỏe mạnh)',
    channel: 'Global Success English 6',
    youtubeId: 'S9d4_M3pL8K',
    searchQuery: 'tiếng anh 6 global success unit 8 getting started',
    summaryVi: 'Hai bạn nhỏ tại câu lạc bộ thể thao trường cùng nói về các trận cầu lông, bóng đá cuối tuần và những môn võ thuật bổ ích như Karate.',
    keySentences: [
      { en: 'Did you play football with your classmates yesterday?', vi: 'Hôm qua bạn có đá bóng cùng các bạn cùng lớp không?' },
      { en: 'I scored two goals and our team won the match!', vi: 'Tớ đã ghi hai bàn thắng và đội chúng tớ đã giành chiến thắng!' },
      { en: 'Remember to wear your sports shoes and warm up first.', vi: 'Hãy nhớ đi giày thể thao và khởi động kỹ trước nhé.' }
    ],
    reflectionQuestion: 'Môn thể thao nào cần dùng vợt và quả cầu lông?'
  },
  9: {
    title: 'Du lịch thế giới: Cities Around the Globe (Những thành phố kỳ thú)',
    channel: 'Global Success English 6',
    youtubeId: 'C8w3_K9zL1M',
    searchQuery: 'tiếng anh 6 global success unit 9 getting started',
    summaryVi: 'Chuyến du ngoạn khám phá các công trình biểu tượng thế giới: Tháp Big Ben ở Luân Đôn, Tháp Eiffel ở Paris và Nhà hát Con Sò ở Sydney.',
    keySentences: [
      { en: 'Tokyo is one of the most exciting cities in the world.', vi: 'Tokyo là một trong những thành phố sôi động nhất thế giới.' },
      { en: 'The Eiffel Tower is the most famous landmark in France.', vi: 'Tháp Eiffel là biểu tượng nổi tiếng nhất nước Pháp.' },
      { en: 'Have you ever seen the Merlion in Singapore?', vi: 'Bạn đã từng nhìn thấy tượng Merlion ở Singapore chưa?' }
    ],
    reflectionQuestion: 'Biểu tượng nổi tiếng nhất của thành phố Luân Đôn là gì?'
  },
  10: {
    title: 'Công nghệ tương lai: Houses in the Year 2050 (Ngôi nhà thông minh tương lai)',
    channel: 'Global Success English 6',
    youtubeId: 'F2h4_P8qZ3K',
    searchQuery: 'tiếng anh 6 global success unit 10 getting started',
    summaryVi: 'Ý tưởng thiết kế những ngôi nhà tương lai dưới lòng đại dương, trên vũ trụ với nguồn năng lượng mặt trời và robot tự động phục vụ.',
    keySentences: [
      { en: 'In the future, our houses will be powered by solar energy.', vi: 'Trong tương lai, nhà của chúng ta sẽ chạy bằng năng lượng mặt trời.' },
      { en: 'A smart TV might help us order groceries automatically.', vi: 'Ti vi thông minh có thể giúp chúng ta tự động đặt mua thực phẩm.' },
      { en: 'We will live in eco-friendly and wireless homes.', vi: 'Chúng ta sẽ sống trong những ngôi nhà thân thiện môi trường và không dây.' }
    ],
    reflectionQuestion: 'Nguồn năng lượng sạch nào sẽ được dùng phổ biến trong tương lai?'
  },
  11: {
    title: 'Hành tinh xanh: The 3R Project (Dự án giảm thiểu, tái sử dụng, tái chế)',
    channel: 'Global Success English 6',
    youtubeId: 'G3w8_L9mP2L',
    searchQuery: 'tiếng anh 6 global success unit 11 getting started',
    summaryVi: 'Các bạn học sinh cùng tham gia câu lạc bộ xanh Green Club, hướng dẫn tái chế chai nhựa, dùng túi vải và trồng cây bảo vệ môi trường.',
    keySentences: [
      { en: 'If we reuse glass bottles, we will save natural resources.', vi: 'Nếu chúng ta tái sử dụng chai thủy tinh, chúng ta sẽ tiết kiệm tài nguyên thiên nhiên.' },
      { en: 'Do not throw rubbish into rivers and lakes.', vi: 'Đừng vứt rác thải xuống sông hồ.' },
      { en: 'Small actions today will make a greener world tomorrow.', vi: 'Những hành động nhỏ hôm nay sẽ tạo nên một thế giới xanh hơn ngày mai.' }
    ],
    reflectionQuestion: '3 chữ R trong dự án bảo vệ môi trường là gì?'
  },
  12: {
    title: 'Triển lãm công nghệ: International Robot Show (Người máy thông minh)',
    channel: 'Global Success English 6',
    youtubeId: 'R9m3_K2pZ8M',
    searchQuery: 'tiếng anh 6 global success unit 12 getting started',
    summaryVi: 'Tham quan hội chợ triển lãm robot thế giới, chiêm ngưỡng các người máy có thể nhận diện giọng nói, nấu ăn, chăm sóc vườn và làm việc nhà.',
    keySentences: [
      { en: 'This domestic robot can clean the floor and iron clothes.', vi: 'Chú robot gia đình này có thể lau sàn nhà và là ủi quần áo.' },
      { en: 'Robots with AI will be able to talk to humans naturally.', vi: 'Những người máy có trí tuệ nhân tạo sẽ có thể trò chuyện với con người tự nhiên.' },
      { en: 'Can a robot guard the house safely while we are away?', vi: 'Liệu robot có thể trông nhà an toàn khi chúng ta đi vắng không?' }
    ],
    reflectionQuestion: 'Người máy gia đình có thể giúp bạn những công việc gì?'
  }
};

for (let unitId = 1; unitId <= 12; unitId++) {
  const filePath = path.join(rootDir, `src/data/unit${unitId}.json`);
  if (!fs.existsSync(filePath)) continue;

  const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  data.video = VIDEOS[unitId];

  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
  console.log(`✓ Đã thêm video tài nguyên cho Unit ${unitId}: ${data.video.title}`);
}

console.log('\n🎉 Hoàn thành cập nhật video cho toàn bộ 12 Unit!');
