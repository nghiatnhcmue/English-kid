import fs from 'node:fs';
import path from 'node:path';
import https from 'node:https';

const NEW_WORDS = {
  6: [
    {
      id: 'u6_10',
      word: 'gathering',
      phonetic: '/ˈɡæð.ə.rɪŋ/',
      wordType: 'Danh từ',
      meaning: 'Sum họp gia đình',
      hint: 'Dịp các thành viên quây quần sum vầy bên nhau ngày Tết',
      exampleEn: 'Family gathering is a wonderful Tet tradition.',
      exampleVi: 'Sum họp gia đình là một truyền thống Tết tuyệt vời.',
      emoji: '🥘'
    },
    {
      id: 'u6_11',
      word: 'first footer',
      phonetic: '/ˌfɜːst ˈfʊtə/',
      wordType: 'Danh từ',
      meaning: 'Người xông đất',
      hint: 'Người đầu tiên bước vào nhà chúc Tết sau thời khắc Giao thừa',
      exampleEn: 'The first footer brings good luck for the new year.',
      exampleVi: 'Người xông đất mang lại may mắn cho năm mới.',
      emoji: '🚶'
    }
  ],
  7: [
    {
      id: 'u7_10',
      word: 'weather forecast',
      phonetic: '/ˈweðə fɔːkɑːst/',
      wordType: 'Danh từ',
      meaning: 'Dự báo thời tiết',
      hint: 'Bản tin dự đoán thời tiết nắng mưa trên tivi hàng ngày',
      exampleEn: 'We watch the weather forecast every morning.',
      exampleVi: 'Gia đình em xem dự báo thời tiết vào mỗi buổi sáng.',
      emoji: '⛅'
    },
    {
      id: 'u7_11',
      word: 'local television',
      phonetic: '/ˈləʊkl ˈtelɪvɪʒn/',
      wordType: 'Danh từ',
      meaning: 'Đài truyền hình địa phương',
      hint: 'Kênh truyền hình phát tin tức và sự kiện trong khu vực tỉnh/thành phố',
      exampleEn: 'Local television broadcasts news about our town.',
      exampleVi: 'Đài truyền hình địa phương phát tin tức về thị trấn của em.',
      emoji: '📡'
    }
  ],
  8: [
    {
      id: 'u8_10',
      word: 'champion',
      phonetic: '/ˈtʃæmpiən/',
      wordType: 'Danh từ',
      meaning: 'Nhà vô địch, quán quân',
      hint: 'Đội hoặc người chiến thắng giải nhất trong một cuộc thi đấu',
      exampleEn: 'Our school football team became the champion.',
      exampleVi: 'Đội bóng đá trường em đã trở thành nhà vô địch.',
      emoji: '🏆'
    },
    {
      id: 'u8_11',
      word: 'marathon',
      phonetic: '/ˈmærəθən/',
      wordType: 'Danh từ',
      meaning: 'Cuộc chạy ma-ra-tông',
      hint: 'Môn thi chạy bộ đường trường dài hơn 42 km đòi hỏi sự bền bỉ',
      exampleEn: 'Many runners join the city marathon.',
      exampleVi: 'Nhiều vận động viên tham gia cuộc chạy ma-ra-tông thành phố.',
      emoji: '🏃'
    }
  ],
  9: [
    {
      id: 'u9_09',
      word: 'crowded',
      phonetic: '/ˈkraʊdɪd/',
      wordType: 'Tính từ',
      meaning: 'Đông đúc, náo nhiệt',
      hint: 'Nơi có rất nhiều người qua lại tấp nập như phố xá trung tâm',
      exampleEn: 'Tokyo is a very modern and crowded city.',
      exampleVi: 'Tokyo là một thành phố rất hiện đại và đông đúc.',
      emoji: '👥'
    },
    {
      id: 'u9_10',
      word: 'historic',
      phonetic: '/hɪˈstɒrɪk/',
      wordType: 'Tính từ',
      meaning: 'Mang tính lịch sử, cổ kính',
      hint: 'Địa điểm hoặc công trình có từ lâu đời gắn liền với lịch sử',
      exampleEn: 'Ha Noi has many famous historic monuments.',
      exampleVi: 'Hà Nội có nhiều di tích lịch sử nổi tiếng.',
      emoji: '🏰'
    }
  ],
  10: [
    {
      id: 'u10_09',
      word: 'automatic',
      phonetic: '/ˌɔːtəˈmætɪk/',
      wordType: 'Tính từ',
      meaning: 'Tự động',
      hint: 'Thiết bị tự đóng mở hoặc tự hoạt động mà không cần người điều khiển',
      exampleEn: 'Our future house will have automatic doors.',
      exampleVi: 'Ngôi nhà tương lai của em sẽ có các cánh cửa tự động.',
      emoji: '🚪'
    },
    {
      id: 'u10_10',
      word: 'modern',
      phonetic: '/ˈmɒdn/',
      wordType: 'Tính từ',
      meaning: 'Hiện đại, tối tân',
      hint: 'Mang phong cách mới, áp dụng công nghệ tiên tiến nhất',
      exampleEn: 'This modern house produces green energy.',
      exampleVi: 'Ngôi nhà hiện đại này tự sản xuất năng lượng xanh.',
      emoji: '🏡'
    }
  ],
  11: [
    {
      id: 'u11_09',
      word: 'protect',
      phonetic: '/prəˈtekt/',
      wordType: 'Động từ',
      meaning: 'Bảo vệ, gìn giữ',
      hint: 'Hành động che chở, giữ cho môi trường và thiên nhiên an toàn',
      exampleEn: 'We must protect the forest and green nature.',
      exampleVi: 'Chúng ta phải bảo vệ rừng và thiên nhiên xanh.',
      emoji: '🛡️'
    },
    {
      id: 'u11_10',
      word: 'save energy',
      phonetic: '/seɪv ˈenədʒi/',
      wordType: 'Cụm động từ',
      meaning: 'Tiết kiệm năng lượng',
      hint: 'Tắt đèn, tắt quạt khi ra khỏi phòng để không lãng phí điện năng',
      exampleEn: 'Turning off unused lights helps save energy.',
      exampleVi: 'Tắt đèn khi không dùng giúp tiết kiệm năng lượng.',
      emoji: '💡'
    }
  ],
  12: [
    {
      id: 'u12_09',
      word: 'smart assistant',
      phonetic: '/smɑːt əˈsɪstənt/',
      wordType: 'Danh từ',
      meaning: 'Trợ lý thông minh',
      hint: 'Hệ thống AI giúp nhắc nhở lịch học và giải đáp câu hỏi',
      exampleEn: 'The smart assistant answers all our questions.',
      exampleVi: 'Trợ lý thông minh giải đáp mọi câu hỏi của em.',
      emoji: '🤖'
    },
    {
      id: 'u12_10',
      word: 'understand',
      phonetic: '/ˌʌndəˈstænd/',
      wordType: 'Động từ',
      meaning: 'Thấu hiểu, hiểu',
      hint: 'Khả năng nắm bắt ý nghĩa hoặc cảm xúc của người khác',
      exampleEn: 'Future robots will understand human emotions.',
      exampleVi: 'Robot tương lai sẽ thấu hiểu cảm xúc con người.',
      emoji: '🧠'
    }
  ]
};

// Helper tải file MP3 có fallback sang Google UK TTS
async function downloadAudio(text, filePath) {
  if (fs.existsSync(filePath) && fs.statSync(filePath).size > 1000) {
    return true;
  }
  const clean = text.trim();
  // Try Youdao first
  const youdaoUrl = `https://dict.youdao.com/dictvoice?audio=${encodeURIComponent(clean)}&type=1`;
  const okYoudao = await fetchAndSave(youdaoUrl, filePath);
  if (okYoudao) return true;

  // Fallback to Google TTS UK
  const googleUrl = `https://translate.google.com/translate_tts?ie=UTF-8&tl=en-GB&client=tw-ob&q=${encodeURIComponent(clean)}`;
  return fetchAndSave(googleUrl, filePath, { 'User-Agent': 'Mozilla/5.0' });
}

function fetchAndSave(url, filePath, headers = {}) {
  return new Promise((resolve) => {
    const req = https.get(url, { headers }, (res) => {
      if (res.statusCode === 200) {
        const file = fs.createWriteStream(filePath);
        res.pipe(file);
        file.on('finish', () => {
          file.close();
          const size = fs.existsSync(filePath) ? fs.statSync(filePath).size : 0;
          if (size > 800) {
            resolve(true);
          } else {
            if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
            resolve(false);
          }
        });
      } else {
        resolve(false);
      }
    });
    req.on('error', () => {
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      resolve(false);
    });
    req.setTimeout(8000, () => {
      req.abort();
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      resolve(false);
    });
  });
}

async function run() {
  for (const [unitId, words] of Object.entries(NEW_WORDS)) {
    const file = path.resolve(`src/data/unit${unitId}.json`);
    const raw = fs.readFileSync(file, 'utf8');
    const unit = JSON.parse(raw);

    const dir = path.resolve(`public/assets/audio/unit${unitId}`);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    for (const item of words) {
      const idx = unit.vocabularies.findIndex(v => v.id === item.id || v.word.toLowerCase() === item.word.toLowerCase());
      const slug = item.word.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      const audioWordPath = `/assets/audio/unit${unitId}/${slug}.mp3`;
      const audioExamplePath = `/assets/audio/unit${unitId}/${slug}-example.mp3`;

      const localAudioWord = path.join(dir, `${slug}.mp3`);
      const localAudioExample = path.join(dir, `${slug}-example.mp3`);

      await downloadAudio(item.word, localAudioWord);
      await downloadAudio(item.exampleEn, localAudioExample);

      item.audio = audioWordPath;
      item.audioExample = audioExamplePath;

      if (idx >= 0) {
        unit.vocabularies[idx] = { ...unit.vocabularies[idx], ...item };
      } else {
        unit.vocabularies.push(item);
      }
      console.log(`Unit ${unitId}: Saved word "${item.word}"`);
    }

    fs.writeFileSync(file, JSON.stringify(unit, null, 2) + '\n', 'utf8');
  }

  console.log('Successfully enriched and updated vocabulary for Units 6 to 12!');
}

run();
