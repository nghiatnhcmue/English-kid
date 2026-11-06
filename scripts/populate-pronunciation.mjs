import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const PRONUNCIATION_DATA = {
  1: {
    pair: '/ɑː/ & /ʌ/',
    title: 'Phân biệt cặp âm /ɑː/ (A dài) và /ʌ/ (Á ngắn)',
    sound1: {
      symbol: '/ɑː/',
      name: 'Âm A dài',
      guideVi: 'Hạ hàm thấp, mở rộng miệng tự nhiên, kéo dài âm hơi sâu trong cuống họng.',
      words: [
        { word: 'smart', highlight: 'ar', meaning: 'thông minh' },
        { word: 'sharpener', highlight: 'ar', meaning: 'cái gọt bút chì' },
        { word: 'star', highlight: 'ar', meaning: 'ngôi sao' },
        { word: 'park', highlight: 'ar', meaning: 'công viên' }
      ]
    },
    sound2: {
      symbol: '/ʌ/',
      name: 'Âm Á ngắn',
      guideVi: 'Mở miệng vừa phải, thả lỏng môi và lưỡi, phát âm dứt khoát và ngắn gần giống âm "á" tiếng Việt.',
      words: [
        { word: 'study', highlight: 'u', meaning: 'học tập' },
        { word: 'subject', highlight: 'u', meaning: 'môn học' },
        { word: 'club', highlight: 'u', meaning: 'câu lạc bộ' },
        { word: 'lunch', highlight: 'u', meaning: 'bữa trưa' }
      ]
    },
    practiceQuiz: [
      { word: 'smart', meaning: 'thông minh', correctSound: '/ɑː/', options: ['/ɑː/', '/ʌ/'] },
      { word: 'study', meaning: 'học tập', correctSound: '/ʌ/', options: ['/ɑː/', '/ʌ/'] },
      { word: 'sharpener', meaning: 'cái gọt bút chì', correctSound: '/ɑː/', options: ['/ɑː/', '/ʌ/'] },
      { word: 'subject', meaning: 'môn học', correctSound: '/ʌ/', options: ['/ɑː/', '/ʌ/'] },
      { word: 'park', meaning: 'công viên', correctSound: '/ɑː/', options: ['/ɑː/', '/ʌ/'] },
      { word: 'lunch', meaning: 'bữa trưa', correctSound: '/ʌ/', options: ['/ɑː/', '/ʌ/'] }
    ],
    tongueTwister: {
      en: 'Smart students study subjects at the school club.',
      vi: 'Những học sinh thông minh học các môn học tại câu lạc bộ trường.'
    }
  },
  2: {
    pair: '/s/ & /z/',
    title: 'Phát âm âm đuôi số nhiều: /s/ (Âm gió vô thanh) & /z/ (Âm rung hữu thanh)',
    sound1: {
      symbol: '/s/',
      name: 'Âm đuôi /s/ (Vô thanh)',
      guideVi: 'Hai hàm răng khép nhẹ, đẩy luồng hơi xì qua kẽ răng, dây thanh quản không rung (đi sau âm p, t, k, f).',
      words: [
        { word: 'lamps', highlight: 's', meaning: 'những chiếc đèn' },
        { word: 'sinks', highlight: 's', meaning: 'những bồn rửa' },
        { word: 'books', highlight: 's', meaning: 'những cuốn sách' },
        { word: 'flats', highlight: 's', meaning: 'những căn hộ' }
      ]
    },
    sound2: {
      symbol: '/z/',
      name: 'Âm đuôi /z/ (Hữu thanh)',
      guideVi: 'Khẩu hình giống âm /s/ nhưng rung dây thanh quản trong cổ họng tạo âm zzz như tiếng ong vo ve.',
      words: [
        { word: 'beds', highlight: 's', meaning: 'những chiếc giường' },
        { word: 'tables', highlight: 's', meaning: 'những cái bàn' },
        { word: 'chairs', highlight: 's', meaning: 'những chiếc ghế' },
        { word: 'rooms', highlight: 's', meaning: 'những căn phòng' }
      ]
    },
    practiceQuiz: [
      { word: 'lamps', meaning: 'những chiếc đèn', correctSound: '/s/', options: ['/s/', '/z/'] },
      { word: 'beds', meaning: 'những chiếc giường', correctSound: '/z/', options: ['/s/', '/z/'] },
      { word: 'sinks', meaning: 'những bồn rửa', correctSound: '/s/', options: ['/s/', '/z/'] },
      { word: 'tables', meaning: 'những cái bàn', correctSound: '/z/', options: ['/s/', '/z/'] },
      { word: 'books', meaning: 'những cuốn sách', correctSound: '/s/', options: ['/s/', '/z/'] },
      { word: 'chairs', meaning: 'những chiếc ghế', correctSound: '/z/', options: ['/s/', '/z/'] }
    ],
    tongueTwister: {
      en: 'Four lamps and six beds in these big rooms.',
      vi: 'Bốn chiếc đèn và sáu chiếc giường trong những căn phòng lớn này.'
    }
  },
  3: {
    pair: '/b/ & /p/',
    title: 'Phân biệt cặp phụ âm bật môi: /b/ (Hữu thanh) & /p/ (Vô thanh)',
    sound1: {
      symbol: '/b/',
      name: 'Phụ âm /b/ (Rung thanh)',
      guideVi: 'Mím chặt hai môi lại rồi bật mở nhanh, đồng thời làm rung dây thanh quản trong cổ.',
      words: [
        { word: 'boy', highlight: 'b', meaning: 'cậu bé' },
        { word: 'blonde', highlight: 'bl', meaning: 'tóc vàng hoe' },
        { word: 'bag', highlight: 'b', meaning: 'chiếc túi' },
        { word: 'book', highlight: 'b', meaning: 'cuốn sách' }
      ]
    },
    sound2: {
      symbol: '/p/',
      name: 'Phụ âm /p/ (Bật gió)',
      guideVi: 'Mím chặt hai môi giữ hơi lại rồi bật mạnh hơi ra ngoài (để tờ giấy trước miệng sẽ thấy giấy bay).',
      words: [
        { word: 'patient', highlight: 'p', meaning: 'kiên nhẫn' },
        { word: 'picnic', highlight: 'p', meaning: 'dã ngoại' },
        { word: 'pencil', highlight: 'p', meaning: 'bút chì' },
        { word: 'pet', highlight: 'p', meaning: 'thú cưng' }
      ]
    },
    practiceQuiz: [
      { word: 'boy', meaning: 'cậu bé', correctSound: '/b/', options: ['/b/', '/p/'] },
      { word: 'patient', meaning: 'kiên nhẫn', correctSound: '/p/', options: ['/b/', '/p/'] },
      { word: 'blonde', meaning: 'tóc vàng', correctSound: '/b/', options: ['/b/', '/p/'] },
      { word: 'picnic', meaning: 'dã ngoại', correctSound: '/p/', options: ['/b/', '/p/'] },
      { word: 'bag', meaning: 'chiếc túi', correctSound: '/b/', options: ['/b/', '/p/'] },
      { word: 'pencil', meaning: 'bút chì', correctSound: '/p/', options: ['/b/', '/p/'] }
    ],
    tongueTwister: {
      en: 'The patient boy packed a big bag for the picnic.',
      vi: 'Cậu bé kiên nhẫn đã chuẩn bị một chiếc túi to cho chuyến dã ngoại.'
    }
  },
  4: {
    pair: '/iː/ & /ɪ/',
    title: 'Phân biệt cặp nguyên âm: /iː/ (I dài) & /ɪ/ (I ngắn)',
    sound1: {
      symbol: '/iː/',
      name: 'Âm I dài',
      guideVi: 'Môi mỉm cười kéo sang hai bên, phát âm âm "i" kéo dài hơi một chút.',
      words: [
        { word: 'peaceful', highlight: 'ea', meaning: 'yên bình' },
        { word: 'clean', highlight: 'ea', meaning: 'sạch sẽ' },
        { word: 'street', highlight: 'ee', meaning: 'đường phố' },
        { word: 'convenient', highlight: 'ie', meaning: 'tiện lợi' }
      ]
    },
    sound2: {
      symbol: '/ɪ/',
      name: 'Âm I ngắn',
      guideVi: 'Mở miệng hơi hé, phát âm âm "i" cực nhanh, dứt khoát, âm thoang thoảng giữa "i" và "ê".',
      words: [
        { word: 'busy', highlight: 'u', meaning: 'bận rộn' },
        { word: 'city', highlight: 'i', meaning: 'thành phố' },
        { word: 'historic', highlight: 'i', meaning: 'cổ kính' },
        { word: 'building', highlight: 'ui', meaning: 'tòa nhà' }
      ]
    },
    practiceQuiz: [
      { word: 'peaceful', meaning: 'yên bình', correctSound: '/iː/', options: ['/iː/', '/ɪ/'] },
      { word: 'busy', meaning: 'bận rộn', correctSound: '/ɪ/', options: ['/iː/', '/ɪ/'] },
      { word: 'clean', meaning: 'sạch sẽ', correctSound: '/iː/', options: ['/iː/', '/ɪ/'] },
      { word: 'city', meaning: 'thành phố', correctSound: '/ɪ/', options: ['/iː/', '/ɪ/'] },
      { word: 'street', meaning: 'con phố', correctSound: '/iː/', options: ['/iː/', '/ɪ/'] },
      { word: 'historic', meaning: 'cổ kính', correctSound: '/ɪ/', options: ['/iː/', '/ɪ/'] }
    ],
    tongueTwister: {
      en: 'This peaceful city has clean streets and big buildings.',
      vi: 'Thành phố yên bình này có những con đường sạch sẽ và những tòa nhà lớn.'
    }
  },
  5: {
    pair: '/t/ & /d/',
    title: 'Phân biệt cặp phụ âm đầu lưỡi: /t/ (Vô thanh) & /d/ (Hữu thanh)',
    sound1: {
      symbol: '/t/',
      name: 'Phụ âm /t/ (Bật gió)',
      guideVi: 'Đặt đầu lưỡi chạm vào nướu răng hàm trên, nén hơi rồi hạ lưỡi bật luồng hơi gió ra.',
      words: [
        { word: 'desert', highlight: 't', meaning: 'sa mạc' },
        { word: 'mountain', highlight: 't', meaning: 'núi non' },
        { word: 'boat', highlight: 't', meaning: 'con thuyền' },
        { word: 'forest', highlight: 't', meaning: 'rừng rậm' }
      ]
    },
    sound2: {
      symbol: '/d/',
      name: 'Phụ âm /d/ (Rung thanh)',
      guideVi: 'Vị trí lưỡi giống âm /t/ nhưng tạo độ rung trong cổ họng khi phát âm.',
      words: [
        { word: 'island', highlight: 'd', meaning: 'hòn đảo' },
        { word: 'sand', highlight: 'd', meaning: 'cát' },
        { word: 'wonder', highlight: 'd', meaning: 'kỳ quan' },
        { word: 'guide', highlight: 'd', meaning: 'hướng dẫn' }
      ]
    },
    practiceQuiz: [
      { word: 'desert', meaning: 'sa mạc', correctSound: '/t/', options: ['/t/', '/d/'] },
      { word: 'island', meaning: 'hòn đảo', correctSound: '/d/', options: ['/t/', '/d/'] },
      { word: 'mountain', meaning: 'núi', correctSound: '/t/', options: ['/t/', '/d/'] },
      { word: 'wonder', meaning: 'kỳ quan', correctSound: '/d/', options: ['/t/', '/d/'] },
      { word: 'boat', meaning: 'con thuyền', correctSound: '/t/', options: ['/t/', '/d/'] },
      { word: 'sand', meaning: 'bãi cát', correctSound: '/d/', options: ['/t/', '/d/'] }
    ],
    tongueTwister: {
      en: 'The guide took a boat to explore the island of wonders.',
      vi: 'Người hướng dẫn đã đi thuyền để thám hiểm hòn đảo của những kỳ quan.'
    }
  },
  6: {
    pair: '/s/ & /ʃ/',
    title: 'Phân biệt cặp âm xì và sờ nặng: /s/ (Răng khép) & /ʃ/ (Chu môi)',
    sound1: {
      symbol: '/s/',
      name: 'Âm /s/ (Xì nhẹ)',
      guideVi: 'Hai khóe miệng kéo bè sang hai bên, răng khép hờ xì hơi nhẹ.',
      words: [
        { word: 'celebrate', highlight: 'c', meaning: 'kỷ niệm, ăn mừng' },
        { word: 'school', highlight: 's', meaning: 'trường học' },
        { word: 'spring', highlight: 's', meaning: 'mùa xuân' },
        { word: 'see', highlight: 's', meaning: 'nhìn thấy' }
      ]
    },
    sound2: {
      symbol: '/ʃ/',
      name: 'Âm /ʃ/ (Chu môi sờ nặng)',
      guideVi: 'Môi hơi chu tròn về phía trước, thân lưỡi nâng lên chạm vòm họng đẩy hơi xì mạnh như khi ra hiệu "suỵt".',
      words: [
        { word: 'wish', highlight: 'sh', meaning: 'lời chúc' },
        { word: 'special', highlight: 'ci', meaning: 'đặc biệt' },
        { word: 'shopping', highlight: 'sh', meaning: 'mua sắm' },
        { word: 'should', highlight: 'sh', meaning: 'nên làm' }
      ]
    },
    practiceQuiz: [
      { word: 'celebrate', meaning: 'ăn mừng', correctSound: '/s/', options: ['/s/', '/ʃ/'] },
      { word: 'wish', meaning: 'lời chúc', correctSound: '/ʃ/', options: ['/s/', '/ʃ/'] },
      { word: 'spring', meaning: 'mùa xuân', correctSound: '/s/', options: ['/s/', '/ʃ/'] },
      { word: 'special', meaning: 'đặc biệt', correctSound: '/ʃ/', options: ['/s/', '/ʃ/'] },
      { word: 'school', meaning: 'trường học', correctSound: '/s/', options: ['/s/', '/ʃ/'] },
      { word: 'shopping', meaning: 'mua sắm', correctSound: '/ʃ/', options: ['/s/', '/ʃ/'] }
    ],
    tongueTwister: {
      en: 'We send special wishes when we celebrate spring.',
      vi: 'Chúng ta gửi những lời chúc đặc biệt khi cùng nhau đón mừng mùa xuân.'
    }
  },
  7: {
    pair: '/θ/ & /ð/',
    title: 'Phân biệt cặp âm th kẹp lưỡi: /θ/ (Thổi gió) & /ð/ (Rung thanh)',
    sound1: {
      symbol: '/θ/',
      name: 'Âm /θ/ (Vô thanh)',
      guideVi: 'Đặt nhẹ đầu lưỡi kẹp giữa hai hàm răng, đẩy luồng hơi nhẹ qua khe lưỡi (không rung cổ họng).',
      words: [
        { word: 'theatre', highlight: 'th', meaning: 'nhà hát' },
        { word: 'thank', highlight: 'th', meaning: 'cảm ơn' },
        { word: 'through', highlight: 'th', meaning: 'xuyên qua' },
        { word: 'think', highlight: 'th', meaning: 'suy nghĩ' }
      ]
    },
    sound2: {
      symbol: '/ð/',
      name: 'Âm /ð/ (Hữu thanh)',
      guideVi: 'Khẩu hình đặt lưỡi kẹp giữa hai răng giống /θ/ nhưng làm rung dây thanh quản (nghe như âm "dờ").',
      words: [
        { word: 'there', highlight: 'th', meaning: 'ở đằng kia' },
        { word: 'weather', highlight: 'th', meaning: 'thời tiết' },
        { word: 'together', highlight: 'th', meaning: 'cùng nhau' },
        { word: 'brother', highlight: 'th', meaning: 'anh em trai' }
      ]
    },
    practiceQuiz: [
      { word: 'theatre', meaning: 'nhà hát', correctSound: '/θ/', options: ['/θ/', '/ð/'] },
      { word: 'weather', meaning: 'thời tiết', correctSound: '/ð/', options: ['/θ/', '/ð/'] },
      { word: 'thank', meaning: 'cảm ơn', correctSound: '/θ/', options: ['/θ/', '/ð/'] },
      { word: 'together', meaning: 'cùng nhau', correctSound: '/ð/', options: ['/θ/', '/ð/'] },
      { word: 'think', meaning: 'suy nghĩ', correctSound: '/θ/', options: ['/θ/', '/ð/'] },
      { word: 'brother', meaning: 'anh em trai', correctSound: '/ð/', options: ['/θ/', '/ð/'] }
    ],
    tongueTwister: {
      en: 'My brother and I go to the theatre together in fine weather.',
      vi: 'Tôi và anh trai cùng nhau đến rạp hát trong tiết trời đẹp.'
    }
  },
  8: {
    pair: '/e/ & /æ/',
    title: 'Phân biệt cặp nguyên âm: /e/ (E ngắn) & /æ/ (E bẹt)',
    sound1: {
      symbol: '/e/',
      name: 'Âm E ngắn',
      guideVi: 'Miệng mở tự nhiên vừa phải, phát âm âm "e" dứt khoát giống âm "e" tiếng Việt.',
      words: [
        { word: 'chess', highlight: 'e', meaning: 'cờ vua' },
        { word: 'tennis', highlight: 'e', meaning: 'quần vợt' },
        { word: 'racket', highlight: 'e', meaning: 'chiếc vợt' },
        { word: 'member', highlight: 'e', meaning: 'thành viên' }
      ]
    },
    sound2: {
      symbol: '/æ/',
      name: 'Âm E bẹt (A bẹt)',
      guideVi: 'Hạ hàm mở rộng miệng hết cỡ theo chiều dọc và ngang, phát âm lai giữa "a" và "e".',
      words: [
        { word: 'match', highlight: 'a', meaning: 'trận đấu' },
        { word: 'badminton', highlight: 'a', meaning: 'cầu lông' },
        { word: 'champion', highlight: 'a', meaning: 'quán quân' },
        { word: 'athlete', highlight: 'a', meaning: 'vận động viên' }
      ]
    },
    practiceQuiz: [
      { word: 'chess', meaning: 'cờ vua', correctSound: '/e/', options: ['/e/', '/æ/'] },
      { word: 'badminton', meaning: 'cầu lông', correctSound: '/æ/', options: ['/e/', '/æ/'] },
      { word: 'tennis', meaning: 'quần vợt', correctSound: '/e/', options: ['/e/', '/æ/'] },
      { word: 'match', meaning: 'trận đấu', correctSound: '/æ/', options: ['/e/', '/æ/'] },
      { word: 'racket', meaning: 'chiếc vợt', correctSound: '/e/', options: ['/e/', '/æ/'] },
      { word: 'champion', meaning: 'quán quân', correctSound: '/æ/', options: ['/e/', '/æ/'] }
    ],
    tongueTwister: {
      en: 'The champion won the badminton match with a new racket.',
      vi: 'Nhà vô địch đã thắng trận cầu lông với một cây vợt mới.'
    }
  },
  9: {
    pair: '/əʊ/ & /aʊ/',
    title: 'Phân biệt cặp nguyên âm đôi: /əʊ/ (Âu) & /aʊ/ (Ao)',
    sound1: {
      symbol: '/əʊ/',
      name: 'Âm /əʊ/',
      guideVi: 'Bắt đầu từ âm /ə/ rồi chu tròn môi lướt sang âm /ʊ/, tạo thành âm "âu" trầm ấm.',
      words: [
        { word: 'boat', highlight: 'oa', meaning: 'con thuyền' },
        { word: 'postcard', highlight: 'o', meaning: 'bưu thiếp' },
        { word: 'photo', highlight: 'o', meaning: 'bức ảnh' },
        { word: 'cold', highlight: 'o', meaning: 'lạnh giá' }
      ]
    },
    sound2: {
      symbol: '/aʊ/',
      name: 'Âm /aʊ/',
      guideVi: 'Mở rộng miệng phát âm /a/ rồi thu nhỏ môi lại lướt sang /ʊ/, tương tự âm "ao".',
      words: [
        { word: 'tower', highlight: 'ow', meaning: 'tòa tháp' },
        { word: 'crowded', highlight: 'ow', meaning: 'đông đúc' },
        { word: 'house', highlight: 'ou', meaning: 'ngôi nhà' },
        { word: 'south', highlight: 'ou', meaning: 'phía nam' }
      ]
    },
    practiceQuiz: [
      { word: 'boat', meaning: 'con thuyền', correctSound: '/əʊ/', options: ['/əʊ/', '/aʊ/'] },
      { word: 'tower', meaning: 'tòa tháp', correctSound: '/aʊ/', options: ['/əʊ/', '/aʊ/'] },
      { word: 'postcard', meaning: 'bưu thiếp', correctSound: '/əʊ/', options: ['/əʊ/', '/aʊ/'] },
      { word: 'crowded', meaning: 'đông đúc', correctSound: '/aʊ/', options: ['/əʊ/', '/aʊ/'] },
      { word: 'photo', meaning: 'bức ảnh', correctSound: '/əʊ/', options: ['/əʊ/', '/aʊ/'] },
      { word: 'house', meaning: 'ngôi nhà', correctSound: '/aʊ/', options: ['/əʊ/', '/aʊ/'] }
    ],
    tongueTwister: {
      en: 'Send a postcard of that old tower near the cold boat.',
      vi: 'Gửi một tấm bưu thiếp về tòa tháp cổ gần chiếc thuyền trong giá lạnh.'
    }
  },
  10: {
    pair: '/dr/ & /tr/',
    title: 'Phân biệt cặp phụ âm đôi: /dr/ (Đờ-rờ) & /tr/ (Tờ-rờ)',
    sound1: {
      symbol: '/dr/',
      name: 'Cụm âm /dr/',
      guideVi: 'Đầu lưỡi chạm nướu phát âm /d/ rồi cong lưỡi lướt nhanh sang /r/ có rung thanh.',
      words: [
        { word: 'draw', highlight: 'dr', meaning: 'vẽ tranh' },
        { word: 'dream', highlight: 'dr', meaning: 'giấc mơ' },
        { word: 'drive', highlight: 'dr', meaning: 'lái xe' },
        { word: 'drink', highlight: 'dr', meaning: 'đồ uống' }
      ]
    },
    sound2: {
      symbol: '/tr/',
      name: 'Cụm âm /tr/',
      guideVi: 'Đầu lưỡi chạm nướu phát âm /t/ rồi bật nhanh sang /r/ tống luồng hơi gió mạnh.',
      words: [
        { word: 'travel', highlight: 'tr', meaning: 'du lịch' },
        { word: 'tree', highlight: 'tr', meaning: 'cái cây' },
        { word: 'traffic', highlight: 'tr', meaning: 'giao thông' },
        { word: 'train', highlight: 'tr', meaning: 'xe lửa' }
      ]
    },
    practiceQuiz: [
      { word: 'draw', meaning: 'vẽ', correctSound: '/dr/', options: ['/dr/', '/tr/'] },
      { word: 'travel', meaning: 'du lịch', correctSound: '/tr/', options: ['/dr/', '/tr/'] },
      { word: 'dream', meaning: 'giấc mơ', correctSound: '/dr/', options: ['/dr/', '/tr/'] },
      { word: 'tree', meaning: 'cái cây', correctSound: '/tr/', options: ['/dr/', '/tr/'] },
      { word: 'drive', meaning: 'lái xe', correctSound: '/dr/', options: ['/dr/', '/tr/'] },
      { word: 'train', meaning: 'xe lửa', correctSound: '/tr/', options: ['/dr/', '/tr/'] }
    ],
    tongueTwister: {
      en: 'Children dream to travel by train and draw green trees.',
      vi: 'Trẻ em mơ ước được đi du lịch bằng tàu hỏa và vẽ những hàng cây xanh.'
    }
  },
  11: {
    pair: '/ɑː/ & /æ/',
    title: 'Phân biệt cặp nguyên âm: /ɑː/ (A sâu dài) & /æ/ (E bẹt rộng)',
    sound1: {
      symbol: '/ɑː/',
      name: 'Âm A sâu dài',
      guideVi: 'Hạ hàm mở rộng khoang miệng, âm phát ra trầm sâu từ cuống họng.',
      words: [
        { word: 'plant', highlight: 'a', meaning: 'trồng cây' },
        { word: 'fast', highlight: 'a', meaning: 'nhanh nhẹn' },
        { word: 'father', highlight: 'a', meaning: 'người cha' },
        { word: 'park', highlight: 'ar', meaning: 'công viên' }
      ]
    },
    sound2: {
      symbol: '/æ/',
      name: 'Âm E bẹt',
      guideVi: 'Kéo khóe miệng sang hai bên và hạ cằm hết cỡ, âm lai giữa a và e.',
      words: [
        { word: 'plastic', highlight: 'a', meaning: 'nhựa' },
        { word: 'bag', highlight: 'a', meaning: 'túi xách' },
        { word: 'environment', highlight: 'a', meaning: 'môi trường' },
        { word: 'recycle', highlight: 'a', meaning: 'tái chế' }
      ]
    },
    practiceQuiz: [
      { word: 'plant', meaning: 'trồng cây', correctSound: '/ɑː/', options: ['/ɑː/', '/æ/'] },
      { word: 'plastic', meaning: 'chất nhựa', correctSound: '/æ/', options: ['/ɑː/', '/æ/'] },
      { word: 'fast', meaning: 'nhanh', correctSound: '/ɑː/', options: ['/ɑː/', '/æ/'] },
      { word: 'bag', meaning: 'túi xách', correctSound: '/æ/', options: ['/ɑː/', '/æ/'] },
      { word: 'park', meaning: 'công viên', correctSound: '/ɑː/', options: ['/ɑː/', '/æ/'] },
      { word: 'recycle', meaning: 'tái chế', correctSound: '/æ/', options: ['/ɑː/', '/æ/'] }
    ],
    tongueTwister: {
      en: 'Do not throw plastic bags in the park, plant green trees fast!',
      vi: 'Đừng vứt túi nhựa trong công viên, hãy nhanh chóng trồng thêm cây xanh!'
    }
  },
  12: {
    pair: '/ɔɪ/ & /aɪ/',
    title: 'Phân biệt cặp nguyên âm đôi: /ɔɪ/ (Oi) & /aɪ/ (Ai)',
    sound1: {
      symbol: '/ɔɪ/',
      name: 'Âm /ɔɪ/',
      guideVi: 'Bắt đầu từ âm /ɔ/ chu tròn môi rồi trượt mỉm cười sang âm /ɪ/, tương tự âm "oi".',
      words: [
        { word: 'voice', highlight: 'oi', meaning: 'giọng nói' },
        { word: 'boy', highlight: 'oy', meaning: 'cậu bé' },
        { word: 'toy', highlight: 'oy', meaning: 'đồ chơi' },
        { word: 'noise', highlight: 'oi', meaning: 'tiếng ồn' }
      ]
    },
    sound2: {
      symbol: '/aɪ/',
      name: 'Âm /aɪ/',
      guideVi: 'Mở rộng miệng phát âm /a/ rồi mỉm cười lướt nhanh sang /ɪ/, tương tự âm "ai".',
      words: [
        { word: 'like', highlight: 'i', meaning: 'yêu thích' },
        { word: 'high', highlight: 'igh', meaning: 'trên cao' },
        { word: 'climb', highlight: 'i', meaning: 'leo trèo' },
        { word: 'right', highlight: 'igh', meaning: 'chính xác' }
      ]
    },
    practiceQuiz: [
      { word: 'voice', meaning: 'giọng nói', correctSound: '/ɔɪ/', options: ['/ɔɪ/', '/aɪ/'] },
      { word: 'like', meaning: 'thích', correctSound: '/aɪ/', options: ['/ɔɪ/', '/aɪ/'] },
      { word: 'boy', meaning: 'cậu bé', correctSound: '/ɔɪ/', options: ['/ɔɪ/', '/aɪ/'] },
      { word: 'high', meaning: 'cao', correctSound: '/aɪ/', options: ['/ɔɪ/', '/aɪ/'] },
      { word: 'toy', meaning: 'đồ chơi', correctSound: '/ɔɪ/', options: ['/ɔɪ/', '/aɪ/'] },
      { word: 'climb', meaning: 'leo trèo', correctSound: '/aɪ/', options: ['/ɔɪ/', '/aɪ/'] }
    ],
    tongueTwister: {
      en: 'The robot with a soft voice likes to climb high.',
      vi: 'Chú robot có giọng nói ấm áp thích leo lên những nơi cao.'
    }
  }
};

for (let unitId = 1; unitId <= 12; unitId++) {
  const filePath = path.join(rootDir, `src/data/unit${unitId}.json`);
  if (!fs.existsSync(filePath)) continue;

  const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  data.pronunciation = PRONUNCIATION_DATA[unitId];

  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
  console.log(`✓ Đã thêm bài học Phát âm cho Unit ${unitId}: ${data.pronunciation.pair} (${data.pronunciation.title})`);
}

console.log('\n🎉 Hoàn thành cập nhật ngữ âm phát âm cho toàn bộ 12 Unit!');
