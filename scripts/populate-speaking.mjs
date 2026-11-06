import fs from 'node:fs';
import path from 'node:path';

const SPEAKING_DATA = {
  1: {
    situationalTopic: 'Everyday English: Giới thiệu bản thân và trường học mới',
    targetSentence: 'I love my new school.',
    phonetic: '/aɪ lʌv maɪ njuː skuːl/',
    meaningVi: 'Em yêu ngôi trường mới của mình.',
    challenges: [
      {
        id: 'spk-1',
        level: 'Khởi động (Câu ngắn)',
        sentenceEn: 'I go to school by bicycle.',
        phonetic: '/aɪ ɡəʊ tuː skuːl baɪ ˈbaɪsɪkl/',
        meaningVi: 'Em đi học bằng xe đạp.',
        tipsVi: 'Phát âm rõ âm cuối /l/ trong "bicycle" nhé.'
      },
      {
        id: 'spk-2',
        level: 'Giao tiếp hàng ngày',
        sentenceEn: 'This is Duy, my new friend.',
        phonetic: '/ðɪs ɪz duːi maɪ njuː frend/',
        meaningVi: 'Đây là Duy, bạn mới của mình.',
        tipsVi: 'Kẹp nhẹ đầu lưỡi giữa hai hàm răng khi phát âm "This" (/ðɪs/).'
      },
      {
        id: 'spk-3',
        level: 'Mô tả & Cảm nghĩ',
        sentenceEn: 'I love my new school because teachers are nice.',
        phonetic: '/aɪ lʌv maɪ njuː skuːl bɪˈkɒz ˈtiːtʃəz ɑː naɪs/',
        meaningVi: 'Em yêu ngôi trường mới vì thầy cô rất tốt bụng.',
        tipsVi: 'Nhấn giọng vào "love", "school" và "nice" để biểu cảm tự nhiên.'
      },
      {
        id: 'spk-4',
        level: 'Hội thoại đối đáp',
        dialogue: { prompt: 'Are you ready for school?', speaker: 'Bạn' },
        sentenceEn: 'Yes, I am always ready!',
        phonetic: '/jes aɪ æm ˈɔːlweɪz ˈredi/',
        meaningVi: 'Vâng, em luôn sẵn sàng!',
        tipsVi: 'Nói với ngữ điệu vui tươi, tự tin và hào hứng.'
      }
    ]
  },
  2: {
    situationalTopic: 'Everyday English: Khen ngợi ngôi nhà & Mô tả phòng ốc',
    targetSentence: 'There is a sofa in the living room.',
    phonetic: '/ðeər ɪz ə ˈsəʊfə ɪn ðə ˈlɪvɪŋ ruːm/',
    meaningVi: 'Có một chiếc ghế sô-pha trong phòng khách.',
    challenges: [
      {
        id: 'spk-1',
        level: 'Khởi động (Câu ngắn)',
        sentenceEn: 'There is a sofa in the living room.',
        phonetic: '/ðeər ɪz ə ˈsəʊfə ɪn ðə ˈlɪvɪŋ ruːm/',
        meaningVi: 'Có một chiếc ghế sô-pha trong phòng khách.',
        tipsVi: 'Nối âm nhẹ giữa "There is" thành /ðeər ɪz/.'
      },
      {
        id: 'spk-2',
        level: 'Giao tiếp hàng ngày',
        sentenceEn: 'Wow, you have a lovely bedroom!',
        phonetic: '/waʊ juː hæv ə ˈlʌvli ˈbedruːm/',
        meaningVi: 'Oa, bạn có một phòng ngủ thật đáng yêu!',
        tipsVi: 'Lên giọng ở từ "Wow" và nhấn mạnh vào "lovely".'
      },
      {
        id: 'spk-3',
        level: 'Mô tả & Cảm nghĩ',
        sentenceEn: 'My family often cooks dinner in the kitchen.',
        phonetic: '/maɪ ˈfæməli ˈɒfn kʊks ˈdɪnər ɪn ðə ˈkɪtʃɪn/',
        meaningVi: 'Gia đình em thường cùng nhau nấu bữa tối trong bếp.',
        tipsVi: 'Nhớ phát âm âm /s/ ở đuôi từ "cooks" nhé.'
      },
      {
        id: 'spk-4',
        level: 'Hội thoại đối đáp',
        dialogue: { prompt: 'Where is your lovely cat?', speaker: 'Bạn' },
        sentenceEn: 'It is sleeping under the table.',
        phonetic: '/ɪt ɪz ˈsliːpɪŋ ˈʌndə ðə ˈteɪbl/',
        meaningVi: 'Nó đang ngủ dưới gầm bàn.',
        tipsVi: 'Kéo dài âm /iː/ trong từ "sleeping".'
      }
    ]
  },
  3: {
    situationalTopic: 'Everyday English: Mô tả ngoại hình & Tính cách bạn bè',
    targetSentence: 'My best friend is very hard-working and kind.',
    phonetic: '/maɪ best frend ɪz ˈveri ˌhɑːd ˈwɜːkɪŋ ænd kaɪnd/',
    meaningVi: 'Bạn thân nhất của em rất chăm chỉ và tốt bụng.',
    challenges: [
      {
        id: 'spk-1',
        level: 'Khởi động (Câu ngắn)',
        sentenceEn: 'She has long black hair and brown eyes.',
        phonetic: '/ʃiː hæz lɒŋ blæk heər ænd braʊn aɪz/',
        meaningVi: 'Bạn ấy có mái tóc đen dài và đôi mắt nâu.',
        tipsVi: 'Phát âm tròn môi với âm /ʃ/ trong "She".'
      },
      {
        id: 'spk-2',
        level: 'Giao tiếp hàng ngày',
        sentenceEn: 'My best friend is very hard-working and kind.',
        phonetic: '/maɪ best frend ɪz ˈveri ˌhɑːd ˈwɜːkɪŋ ænd kaɪnd/',
        meaningVi: 'Bạn thân nhất của em rất chăm chỉ và tốt bụng.',
        tipsVi: 'Nhấn rõ trọng âm của từ ghép "hard-working".'
      },
      {
        id: 'spk-3',
        level: 'Mô tả & Cảm nghĩ',
        sentenceEn: 'He is tall and sporty with a bright smile.',
        phonetic: '/hiː ɪz tɔːl ænd ˈspɔːti wɪð ə braɪt smaɪl/',
        meaningVi: 'Cậu ấy cao ráo và yêu thể thao với nụ cười rạng rỡ.',
        tipsVi: 'Bật âm đuôi /t/ trong từ "bright".'
      },
      {
        id: 'spk-4',
        level: 'Hội thoại đối đáp',
        dialogue: { prompt: 'Would you like to join our picnic this Sunday?', speaker: 'Bạn' },
        sentenceEn: 'I would love to join your picnic!',
        phonetic: '/aɪ wʊd lʌv tuː dʒɔɪn jɔː ˈpɪknɪk/',
        meaningVi: 'Mình rất muốn tham gia buổi dã ngoại cùng các bạn!',
        tipsVi: 'Âm /dʒ/ trong "join" bật hơi mạnh và dứt khoát.'
      }
    ]
  },
  4: {
    situationalTopic: 'Everyday English: Hỏi và chỉ đường trong khu phố',
    targetSentence: 'My neighbourhood is very peaceful and convenient.',
    phonetic: '/maɪ ˈneɪbəhʊd ɪz ˈveri ˈpiːsfəl ænd kənˈviːniənt/',
    meaningVi: 'Khu phố nơi em sống rất yên bình và tiện lợi.',
    challenges: [
      {
        id: 'spk-1',
        level: 'Khởi động (Câu ngắn)',
        sentenceEn: 'Excuse me, where is the cinema?',
        phonetic: '/ɪkˈskjuːz miː weər ɪz ðə ˈsɪnəmɑː/',
        meaningVi: 'Xin lỗi, rạp chiếu phim ở đâu ạ?',
        tipsVi: 'Lên giọng ở cuối câu hỏi "cinema?".'
      },
      {
        id: 'spk-2',
        level: 'Giao tiếp hàng ngày',
        sentenceEn: 'Go straight, then turn left at the lights.',
        phonetic: '/ɡəʊ streɪt ðen tɜːn left æt ðə laɪts/',
        meaningVi: 'Hãy đi thẳng, sau đó rẽ trái ở cột đèn giao thông.',
        tipsVi: 'Ngắt nhẹ sau "straight" để người nghe dễ theo dõi.'
      },
      {
        id: 'spk-3',
        level: 'Mô tả & Cảm nghĩ',
        sentenceEn: 'My neighbourhood is very peaceful and convenient.',
        phonetic: '/maɪ ˈneɪbəhʊd ɪz ˈveri ˈpiːsfəl ænd kənˈviːniənt/',
        meaningVi: 'Khu phố nơi em sống rất yên bình và tiện lợi.',
        tipsVi: 'Từ "convenient" nhấn trọng âm vào âm tiết thứ hai: con-VE-ni-ent.'
      },
      {
        id: 'spk-4',
        level: 'Hội thoại đối đáp',
        dialogue: { prompt: 'Is the post office near here?', speaker: 'Người đi đường' },
        sentenceEn: 'Yes, it is opposite the supermarket.',
        phonetic: '/jes ɪt ɪz ˈɒpəzɪt ðə ˈsuːpəmɑːkɪt/',
        meaningVi: 'Vâng, nó ở đối diện siêu thị ạ.',
        tipsVi: 'Âm đuôi /t/ trong "opposite" phát âm gọn nhẹ.'
      }
    ]
  },
  5: {
    situationalTopic: 'Everyday English: Khuyên nhủ & Chuẩn bị chuyến dã ngoại',
    targetSentence: 'You must bring sun cream and a torch.',
    phonetic: '/juː mʌst brɪŋ sʌn kriːm ænd ə tɔːtʃ/',
    meaningVi: 'Bạn bắt buộc phải mang kem chống nắng và đèn pin.',
    challenges: [
      {
        id: 'spk-1',
        level: 'Khởi động (Câu ngắn)',
        sentenceEn: 'You should visit Ha Long Bay.',
        phonetic: '/juː ʃʊd ˈvɪzɪt hɑː lɒŋ beɪ/',
        meaningVi: 'Bạn nên ghé thăm Vịnh Hạ Long.',
        tipsVi: '"should" có âm /ʃ/ tròn môi và âm /d/ nhẹ ở cuối.'
      },
      {
        id: 'spk-2',
        level: 'Giao tiếp hàng ngày',
        sentenceEn: 'You must bring sun cream and a torch.',
        phonetic: '/juː mʌst brɪŋ sʌn kriːm ænd ə tɔːtʃ/',
        meaningVi: 'Bạn bắt buộc phải mang kem chống nắng và đèn pin.',
        tipsVi: 'Nhấn mạnh từ "must" để thể hiện quy tắc bắt buộc.'
      },
      {
        id: 'spk-3',
        level: 'Mô tả & Cảm nghĩ',
        sentenceEn: 'Mount Fansipan is the highest mountain in Viet Nam.',
        phonetic: '/maʊnt fænˈsɪpæn ɪz ðə ˈhaɪɪst ˈmaʊntɪn ɪn vjet næm/',
        meaningVi: 'Đỉnh Fansipan là ngọn núi cao nhất Việt Nam.',
        tipsVi: '"highest" phát âm /haɪ-ɪst/ với âm đuôi /st/.'
      },
      {
        id: 'spk-4',
        level: 'Hội thoại đối đáp',
        dialogue: { prompt: 'Can we swim in this deep stream?', speaker: 'Bạn' },
        sentenceEn: 'No, you mustn\'t. It is dangerous!',
        phonetic: '/nəʊ juː ˈmʌsnt ɪt ɪz ˈdeɪndʒərəs/',
        meaningVi: 'Không, không được bơi đâu. Nguy hiểm lắm!',
        tipsVi: '"mustn\'t" không phát âm chữ t ở giữa: đọc là /ˈmʌsnt/.'
      }
    ]
  },
  6: {
    situationalTopic: 'Everyday English: Chúc Tết & Phong tục ngày Tết',
    targetSentence: 'We should visit our relatives during Tet.',
    phonetic: '/wiː ʃʊd ˈvɪzɪt ˈaʊə ˈrelətɪvz ˈdjʊərɪŋ tet/',
    meaningVi: 'Chúng em nên đi thăm họ hàng vào dịp Tết.',
    challenges: [
      {
        id: 'spk-1',
        level: 'Khởi động (Câu ngắn)',
        sentenceEn: 'I wish you good health and happiness!',
        phonetic: '/aɪ wɪʃ juː ɡʊd helθ ænd ˈhæpinəs/',
        meaningVi: 'Em chúc bạn/thầy cô dồi dào sức khỏe và hạnh phúc!',
        tipsVi: 'Âm /θ/ trong "health" kẹp nhẹ đầu lưỡi thổi hơi ra.'
      },
      {
        id: 'spk-2',
        level: 'Giao tiếp hàng ngày',
        sentenceEn: 'We should help our parents decorate the house.',
        phonetic: '/wiː ʃʊd help ˈaʊə ˈpeərənts ˈdekəreɪt ðə haʊs/',
        meaningVi: 'Chúng em nên giúp bố mẹ trang hoàng nhà cửa.',
        tipsVi: '"decorate" nhấn trọng âm ở âm tiết thứ nhất: DE-co-rate.'
      },
      {
        id: 'spk-3',
        level: 'Mô tả & Cảm nghĩ',
        sentenceEn: 'Children should not ask for lucky money.',
        phonetic: '/ˈtʃɪldrən ʃʊd nɒt ɑːsk fɔː ˈlʌki ˈmʌni/',
        meaningVi: 'Trẻ em không nên vòi vĩnh tiền lì xì.',
        tipsVi: '"lucky money" đọc liền mạch và tự nhiên.'
      },
      {
        id: 'spk-4',
        level: 'Hội thoại đối đáp',
        dialogue: { prompt: 'What do you do on New Year\'s Eve?', speaker: 'Bạn' },
        sentenceEn: 'We watch fireworks together on New Year\'s Eve.',
        phonetic: '/wiː wɒtʃ ˈfaɪəwɜːks təˈɡeðər ɒn njuː jɪəz iːv/',
        meaningVi: 'Chúng em cùng nhau ngắm pháo hoa vào đêm Giao thừa.',
        tipsVi: '"fireworks" có âm /s/ ở đuôi, phát âm nhẹ.'
      }
    ]
  },
  7: {
    situationalTopic: 'Everyday English: Hỏi thói quen xem TV & Kênh yêu thích',
    targetSentence: 'I watch news programmes every evening.',
    phonetic: '/aɪ wɒtʃ njuːz ˈprəʊɡræmz ˈevri ˈiːvnɪŋ/',
    meaningVi: 'Em xem các chương trình thời sự vào mỗi buổi tối.',
    challenges: [
      {
        id: 'spk-1',
        level: 'Khởi động (Câu ngắn)',
        sentenceEn: 'What is your favourite TV programme?',
        phonetic: '/wɒt ɪz jɔː ˈfeɪvərɪt ˌtiː ˈviː ˈprəʊɡræm/',
        meaningVi: 'Chương trình tivi yêu thích của bạn là gì?',
        tipsVi: '"favourite" nhấn trọng âm ở đầu: FAY-vuh-rit.'
      },
      {
        id: 'spk-2',
        level: 'Giao tiếp hàng ngày',
        sentenceEn: 'I watch educational channels to learn English.',
        phonetic: '/aɪ wɒtʃ ˌedʒuˈkeɪʃənl ˈtʃænlz tuː lɜːn ˈɪŋɡlɪʃ/',
        meaningVi: 'Em xem các kênh giáo dục để học tiếng Anh.',
        tipsVi: '"educational" nhấn trọng âm vào âm "ca": e-ju-CA-tion-al.'
      },
      {
        id: 'spk-3',
        level: 'Mô tả & Cảm nghĩ',
        sentenceEn: 'I watch news programmes every evening.',
        phonetic: '/aɪ wɒtʃ njuːz ˈprəʊɡræmz ˈevri ˈiːvnɪŋ/',
        meaningVi: 'Em xem các chương trình thời sự vào mỗi buổi tối.',
        tipsVi: '"news" phát âm có âm đuôi /z/: /njuːz/.'
      },
      {
        id: 'spk-4',
        level: 'Hội thoại đối đáp',
        dialogue: { prompt: 'Why do you like this documentary?', speaker: 'Bạn' },
        sentenceEn: 'Because it is very interesting and full of knowledge.',
        phonetic: '/bɪˈkɒz ɪt ɪz ˈveri ˈɪntrəstɪŋ ænd fʊl əv ˈnɒlɪdʒ/',
        meaningVi: 'Vì nó rất thú vị và ngập tràn kiến thức bổ ích.',
        tipsVi: '"interesting" đọc 3 âm tiết gọn: IN-tre-sting.'
      }
    ]
  },
  8: {
    situationalTopic: 'Everyday English: Chúc mừng chiến thắng & Thể thao học đường',
    targetSentence: 'I played badminton with my father yesterday.',
    phonetic: '/aɪ pleɪd ˈbædmɪntən wɪð maɪ ˈfɑːðə ˈjestədeɪ/',
    meaningVi: 'Hôm qua em đã chơi cầu lông với bố.',
    challenges: [
      {
        id: 'spk-1',
        level: 'Khởi động (Câu ngắn)',
        sentenceEn: 'Congratulations! You played so well today!',
        phonetic: '/kənˌɡrætʃuˈleɪʃnz juː pleɪd səʊ wel təˈdeɪ/',
        meaningVi: 'Xin chúc mừng! Hôm nay bạn thi đấu hay lắm!',
        tipsVi: 'Nói với giọng hào hứng, chúc mừng bạn.'
      },
      {
        id: 'spk-2',
        level: 'Giao tiếp hàng ngày',
        sentenceEn: 'I played badminton with my father yesterday.',
        phonetic: '/aɪ pleɪd ˈbædmɪntən wɪð maɪ ˈfɑːðə ˈjestədeɪ/',
        meaningVi: 'Hôm qua em đã chơi cầu lông với bố.',
        tipsVi: '"played" phát âm âm đuôi /d/, không đọc thành "play-id".'
      },
      {
        id: 'spk-3',
        level: 'Mô tả & Cảm nghĩ',
        sentenceEn: 'Playing sports helps us keep fit and healthy.',
        phonetic: '/ˈpleɪɪŋ spɔːts helps ʌs kiːp fɪt ænd ˈhelθi/',
        meaningVi: 'Chơi thể thao giúp chúng em giữ dáng và khỏe mạnh.',
        tipsVi: '"sports" có âm /s/ ở đuôi, phát âm rõ.'
      },
      {
        id: 'spk-4',
        level: 'Hội thoại đối đáp',
        dialogue: { prompt: 'How often do you go swimming?', speaker: 'Bạn' },
        sentenceEn: 'I go swimming twice a week with my brother.',
        phonetic: '/aɪ ɡəʊ ˈswɪmɪŋ twaɪs ə wiːk wɪð maɪ ˈbrʌðə/',
        meaningVi: 'Em đi bơi hai lần một tuần cùng anh trai.',
        tipsVi: '"twice" phát âm đuôi có âm gió /s/.'
      }
    ]
  },
  9: {
    situationalTopic: 'Everyday English: Bày tỏ ngạc nhiên & Danh lam thế giới',
    targetSentence: 'This historic tower is very famous.',
    phonetic: '/ðɪs hɪˈstɒrɪk ˈtaʊə ɪz ˈveri ˈfeɪməs/',
    meaningVi: 'Tòa tháp lịch sử này rất nổi tiếng.',
    challenges: [
      {
        id: 'spk-1',
        level: 'Khởi động (Câu ngắn)',
        sentenceEn: 'What a beautiful and crowded city!',
        phonetic: '/wɒt ə ˈbjuːtɪfl ænd ˈkraʊdɪd ˈsɪti/',
        meaningVi: 'Thật là một thành phố xinh đẹp và náo nhiệt!',
        tipsVi: 'Lên giọng ở cuối câu cảm thán "city!".'
      },
      {
        id: 'spk-2',
        level: 'Giao tiếp hàng ngày',
        sentenceEn: 'Big Ben is the most famous historic clock in London.',
        phonetic: '/bɪɡ ben ɪz ðə məʊst ˈfeɪməs hɪˈstɒrɪk klɒk ɪn ˈlʌndən/',
        meaningVi: 'Big Ben là chiếc đồng hồ lịch sử nổi tiếng nhất ở Luân Đôn.',
        tipsVi: '"historic" nhấn trọng âm vào âm thứ hai: his-TO-ric.'
      },
      {
        id: 'spk-3',
        level: 'Mô tả & Cảm nghĩ',
        sentenceEn: 'The street food here is delicious and very cheap.',
        phonetic: '/ðə striːt fuːd hɪər ɪz dɪˈlɪʃəs ænd ˈveri tʃiːp/',
        meaningVi: 'Đồ ăn đường phố ở đây vừa ngon vừa rất rẻ.',
        tipsVi: '"delicious" phát âm âm /ʃ/ tròn môi: de-LI-shus.'
      },
      {
        id: 'spk-4',
        level: 'Hội thoại đối đáp',
        dialogue: { prompt: 'Have you ever visited Sydney Opera House?', speaker: 'Bạn' },
        sentenceEn: 'Yes, I have visited it with my family.',
        phonetic: '/jes aɪ hæv ˈvɪzɪtɪd ɪt wɪð maɪ ˈfæməli/',
        meaningVi: 'Vâng, em đã từng ghé thăm nơi đó cùng gia đình rồi.',
        tipsVi: '"visited" phát âm đuôi là /-ɪd/.'
      }
    ]
  },
  10: {
    situationalTopic: 'Everyday English: Miêu tả ngôi nhà & Thiết bị tương lai',
    targetSentence: 'My future house will have super smart appliances.',
    phonetic: '/maɪ ˈfjuːtʃə haʊs wɪl hæv ˈsuːpə smɑːt əˈplaɪənsɪz/',
    meaningVi: 'Ngôi nhà tương lai của em sẽ có các thiết bị siêu thông minh.',
    challenges: [
      {
        id: 'spk-1',
        level: 'Khởi động (Câu ngắn)',
        sentenceEn: 'In the future, my dream house will be on the ocean.',
        phonetic: '/ɪn ðə ˈfjuːtʃə maɪ driːm haʊs wɪl biː ɒn ði ˈəʊʃn/',
        meaningVi: 'Trong tương lai, ngôi nhà mơ ước của em sẽ ở trên đại dương.',
        tipsVi: '"ocean" phát âm là /ˈəʊʃn/ với âm /ʃ/.'
      },
      {
        id: 'spk-2',
        level: 'Giao tiếp hàng ngày',
        sentenceEn: 'My future house will have super smart appliances.',
        phonetic: '/maɪ ˈfjuːtʃə haʊs wɪl hæv ˈsuːpə smɑːt əˈplaɪənsɪz/',
        meaningVi: 'Ngôi nhà tương lai của em sẽ có các thiết bị siêu thông minh.',
        tipsVi: '"appliances" phát âm là /əˈplaɪənsɪz/ có 4 âm tiết.'
      },
      {
        id: 'spk-3',
        level: 'Mô tả & Cảm nghĩ',
        sentenceEn: 'Solar panels will provide free green energy for the house.',
        phonetic: '/ˈsəʊlə ˈpænlz wɪl prəˈvaɪd friː ɡriːn ˈenədʒi fɔː ðə haʊs/',
        meaningVi: 'Các tấm pin mặt trời sẽ cung cấp năng lượng xanh miễn phí cho ngôi nhà.',
        tipsVi: '"energy" nhấn trọng âm đầu: E-ner-gy.'
      },
      {
        id: 'spk-4',
        level: 'Hội thoại đối đáp',
        dialogue: { prompt: 'Will a smart robot cook meals for you?', speaker: 'Bạn' },
        sentenceEn: 'Yes, it will cook delicious meals and clean floors.',
        phonetic: '/jes ɪt wɪl kʊk dɪˈlɪʃəs miːlz ænd kliːn flɔːz/',
        meaningVi: 'Vâng, nó sẽ nấu các bữa ăn ngon và lau dọn sàn nhà.',
        tipsVi: 'Nói liền mạch, tự nhiên như lời khẳng định.'
      }
    ]
  },
  11: {
    situationalTopic: 'Everyday English: Lời khuyên 3R sống xanh bảo vệ môi trường',
    targetSentence: 'We should reduce plastic waste to protect our planet.',
    phonetic: '/wiː ʃʊd rɪˈdjuːs ˈplæstɪk weɪst tuː prəˈtekt ˈaʊə ˈplænɪt/',
    meaningVi: 'Chúng ta nên giảm rác thải nhựa để bảo vệ hành tinh.',
    challenges: [
      {
        id: 'spk-1',
        level: 'Khởi động (Câu ngắn)',
        sentenceEn: 'Remember to turn off lights before leaving.',
        phonetic: '/rɪˈmembə tuː tɜːn ɒf laɪts bɪˈfɔː ˈliːvɪŋ/',
        meaningVi: 'Nhớ tắt đèn trước khi ra ngoài nhé.',
        tipsVi: '"turn off" có thể nối âm thành /tɜːn ɒf/.'
      },
      {
        id: 'spk-2',
        level: 'Giao tiếp hàng ngày',
        sentenceEn: 'We should reduce plastic waste to protect our planet.',
        phonetic: '/wiː ʃʊd rɪˈdjuːs ˈplæstɪk weɪst tuː prəˈtekt ˈaʊə ˈplænɪt/',
        meaningVi: 'Chúng ta nên giảm rác thải nhựa để bảo vệ hành tinh.',
        tipsVi: '"reduce" nhấn trọng âm ở âm tiết thứ hai: re-DUCE.'
      },
      {
        id: 'spk-3',
        level: 'Mô tả & Cảm nghĩ',
        sentenceEn: 'You can reuse plastic bottles to grow green plants.',
        phonetic: '/juː kæn ˌriːˈjuːz ˈplæstɪk ˈbɒtlz tuː ɡrəʊ ɡriːn plɑːnts/',
        meaningVi: 'Bạn có thể tái sử dụng chai nhựa để trồng cây xanh.',
        tipsVi: '"reuse" phát âm âm đầu kéo dài: re-USE.'
      },
      {
        id: 'spk-4',
        level: 'Hội thoại đối đáp',
        dialogue: { prompt: 'How can students help the environment?', speaker: 'Cô giáo' },
        sentenceEn: 'Let us walk or cycle to school to save energy!',
        phonetic: '/let ʌs wɔːk ɔː ˈsaɪkl tuː skuːl tuː seɪv ˈenədʒi/',
        meaningVi: 'Chúng em hãy đi bộ hoặc đạp xe đến trường để tiết kiệm năng lượng ạ!',
        tipsVi: 'Nói với giọng sôi nổi, nhiệt tình hưởng ứng.'
      }
    ]
  },
  12: {
    situationalTopic: 'Everyday English: Nêu quan điểm & Khả năng của robot',
    targetSentence: 'This smart robot can recognise human voice.',
    phonetic: '/ðɪs smɑːt ˈrəʊbɒt kæn ˈrekəɡnaɪz ˈhjuːmən vɔɪs/',
    meaningVi: 'Chú robot thông minh này có thể nhận diện giọng nói con người.',
    challenges: [
      {
        id: 'spk-1',
        level: 'Khởi động (Câu ngắn)',
        sentenceEn: 'This smart robot can recognise human voice.',
        phonetic: '/ðɪs smɑːt ˈrəʊbɒt kæn ˈrekəɡnaɪz ˈhjuːmən vɔɪs/',
        meaningVi: 'Chú robot thông minh này có thể nhận diện giọng nói con người.',
        tipsVi: '"recognise" nhấn trọng âm ở đầu: RE-cog-nise.'
      },
      {
        id: 'spk-2',
        level: 'Giao tiếp hàng ngày',
        sentenceEn: 'Worker robots can build high buildings very fast.',
        phonetic: '/ˈwɜːkə ˈrəʊbɒts kæn bɪld haɪ ˈbɪldɪŋz ˈveri fɑːst/',
        meaningVi: 'Robot công nhân có thể xây các tòa nhà cao tầng rất nhanh.',
        tipsVi: '"fast" có âm đuôi /st/, phát âm rõ và dứt khoát.'
      },
      {
        id: 'spk-3',
        level: 'Mô tả & Cảm nghĩ',
        sentenceEn: 'Robots will help make our lives easier and better.',
        phonetic: '/ˈrəʊbɒts wɪl help meɪk ˈaʊə laɪvz ˈiːziər ænd ˈbetə/',
        meaningVi: 'Robot sẽ giúp cuộc sống của chúng ta dễ dàng và tốt đẹp hơn.',
        tipsVi: '"lives" là số nhiều của life, phát âm là /laɪvz/.'
      },
      {
        id: 'spk-4',
        level: 'Hội thoại đối đáp',
        dialogue: { prompt: 'Can robots understand human feelings?', speaker: 'Bạn' },
        sentenceEn: 'No, they cannot understand our emotions.',
        phonetic: '/nəʊ ðeɪ ˈkænɒt ˌʌndəˈstænd ˈaʊər ɪˈməʊʃnz/',
        meaningVi: 'Không, chúng không thể thấu hiểu cảm xúc của chúng ta.',
        tipsVi: '"emotions" có âm /ʃ/ tròn môi: e-MO-tions.'
      }
    ]
  }
};

for (let i = 1; i <= 12; i++) {
  const file = path.resolve(`src/data/unit${i}.json`);
  const raw = fs.readFileSync(file, 'utf8');
  const unit = JSON.parse(raw);

  const spk = SPEAKING_DATA[i];
  if (spk) {
    unit.speaking = {
      ...unit.speaking,
      ...spk
    };
    fs.writeFileSync(file, JSON.stringify(unit, null, 2) + '\n', 'utf8');
    console.log(`Updated Unit ${i} speaking with 4 rich challenges.`);
  }
}

console.log('Finished updating speaking data for all 12 units!');
