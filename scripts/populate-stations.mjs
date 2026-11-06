import fs from 'fs';
import path from 'path';

const STATIONS_DATA = {
  3: {
    grammar: {
      title: "Thì Hiện tại tiếp diễn (Present Continuous) & Have got",
      ruleVi: "Dùng để miêu tả hành động đang diễn ra tại thời điểm nói hoặc miêu tả ngoại hình của bạn bè.",
      formula: "S + am/is/are + V-ing | S + have/has got + N",
      quickTip: "Thấy 'now, look, at the moment' -> chọn am/is/are + V-ing. Nói về tóc, mắt -> dùng have/has got.",
      quiz: [
        {
          question: "Look! The children ______ football in the playground.",
          options: ["are playing", "play", "plays"],
          answerIndex: 0,
          explain: "Có 'Look!' báo hiệu hành động đang diễn ra, chủ ngữ 'The children' số nhiều dùng 'are playing'."
        },
        {
          question: "My best friend, Lan, ______ long black hair.",
          options: ["has got", "have got", "is having"],
          answerIndex: 0,
          explain: "Lan là ngôi thứ ba số ít, dùng 'has got' để miêu tả đặc điểm ngoại hình."
        },
        {
          question: "What ______ you doing right now?",
          options: ["are", "is", "do"],
          answerIndex: 0,
          explain: "Chủ ngữ 'you' đi với trợ động từ 'are' trong thì hiện tại tiếp diễn."
        }
      ]
    },
    listening: {
      transcript: "Hello, my name is Phong. My best friend is Duy. He is very creative and sporty. He has curly hair.",
      question: "What is Duy like?",
      options: ["Creative and sporty", "Lazy and shy", "Quiet and sad"],
      answerIndex: 0
    },
    speaking: {
      targetSentence: "My best friend is very hard-working and kind.",
      phonetic: "/maɪ best frend ɪz ˈveri ˌhɑːd ˈwɜːkɪŋ ænd kaɪnd/",
      meaningVi: "Bạn thân nhất của em rất chăm chỉ và tốt bụng."
    },
    reading: {
      passage: "Minh is my new classmate. He is twelve years old. He is very friendly and confident. Minh has chubby cheeks and short black hair. In his free time, he likes reading books and drawing pictures.",
      questions: [
        {
          question: "How old is Minh?",
          options: ["Twelve", "Ten", "Eleven"],
          answerIndex: 0
        },
        {
          question: "What does Minh look like?",
          options: ["He has chubby cheeks and short black hair", "He is very tall and thin", "He has curly blonde hair"],
          answerIndex: 0
        }
      ]
    },
    writing: {
      type: "unscramble",
      scrambledWords: ["friend", "is", "My", "very", "kind", "and", "creative."],
      correctSentence: "My friend is very kind and creative.",
      meaningVi: "Bạn của em rất tốt bụng và sáng tạo."
    }
  },
  4: {
    grammar: {
      title: "So sánh hơn của tính từ (Comparative Adjectives)",
      ruleVi: "Dùng để so sánh đặc điểm giữa hai khu phố, hai đồ vật hoặc hai địa điểm.",
      formula: "Tính từ ngắn: adj + -er + than | Tính từ dài: more + adj + than",
      quickTip: "Từ 1 âm tiết (short) thêm -er (cleaner, noisier). Từ 2 âm tiết trở lên thêm 'more' phía trước (more peaceful than).",
      quiz: [
        {
          question: "The streets in the city centre are ______ than those in the countryside.",
          options: ["crowded", "more crowded", "crowdeder"],
          answerIndex: 1,
          explain: "'crowded' là tính từ dài 2 âm tiết, so sánh hơn dùng 'more crowded than'."
        },
        {
          question: "Living in a quiet neighbourhood is ______ than living near a railway station.",
          options: ["better", "gooder", "more good"],
          answerIndex: 0,
          explain: "'good' là tính từ bất quy tắc, so sánh hơn đổi thành 'better'."
        },
        {
          question: "My new house is ______ than my old flat.",
          options: ["larger", "more large", "largerer"],
          answerIndex: 0,
          explain: "'large' là tính từ ngắn kết thúc bằng 'e', chỉ cần thêm '-r' thành 'larger'."
        }
      ]
    },
    listening: {
      transcript: "Welcome to my neighbourhood! There is a historic cathedral, a modern square, and an art gallery near my house.",
      question: "What historic place is near the house?",
      options: ["A historic cathedral", "A noisy market", "A busy airport"],
      answerIndex: 0
    },
    speaking: {
      targetSentence: "My neighbourhood is very peaceful and convenient.",
      phonetic: "/maɪ ˈneɪbəhʊd ɪz ˈveri ˈpiːsfəl ænd kənˈviːniənt/",
      meaningVi: "Khu phố nơi em sống rất yên bình và tiện lợi."
    },
    reading: {
      passage: "I live in a quiet suburb of Da Nang. The air here is cleaner and fresher than in the city centre. There are many convenient shops, a railway station, and a green park. People in my neighbourhood are very friendly.",
      questions: [
        {
          question: "Where does the writer live?",
          options: ["In a quiet suburb of Da Nang", "In the noisy centre of Ha Noi", "Near a desert"],
          answerIndex: 0
        },
        {
          question: "How is the air in the suburb?",
          options: ["Cleaner and fresher", "Hot and dusty", "Very polluted"],
          answerIndex: 0
        }
      ]
    },
    writing: {
      type: "unscramble",
      scrambledWords: ["This", "railway", "station", "is", "larger", "than", "that", "one."],
      correctSentence: "This railway station is larger than that one.",
      meaningVi: "Nhà ga xe lửa này lớn hơn nhà ga kia."
    }
  },
  5: {
    grammar: {
      title: "Động từ khuyết thiếu Must / Mustn't",
      ruleVi: "Dùng 'must' khi bắt buộc phải làm việc gì đó (quy tắc an toàn) và 'mustn't' khi tuyệt đối không được phép làm.",
      formula: "S + must / mustn't + V (nguyên mẫu)",
      quickTip: "Sau must và mustn't luôn là động từ nguyên thể, không thêm -s, -ed hay -ing.",
      quiz: [
        {
          question: "You ______ stay with your group when exploring the forest.",
          options: ["must", "mustn't", "shouldn't"],
          answerIndex: 0,
          explain: "Quy tắc an toàn trong rừng: bạn 'phải' đi cùng nhóm."
        },
        {
          question: "Visitors ______ litter in the national park.",
          options: ["mustn't", "must", "can"],
          answerIndex: 0,
          explain: "Bảo vệ thiên nhiên: du khách 'tuyệt đối không được' xả rác."
        },
        {
          question: "We ______ bring a torch because the cave is very dark.",
          options: ["must", "mustn't", "haven't"],
          answerIndex: 0,
          explain: "Hang động rất tối nên bắt buộc 'phải' mang theo đèn pin."
        }
      ]
    },
    listening: {
      transcript: "We are packing for our trip to Fansipan mountain. We must bring a sleeping bag, a backpack, and warm clothes.",
      question: "Where are they going?",
      options: ["Fansipan mountain", "Ha Long bay", "Phu Quoc island"],
      answerIndex: 0
    },
    speaking: {
      targetSentence: "You must bring sun cream and a torch.",
      phonetic: "/juː mʌst brɪŋ sʌn kriːm ænd ə tɔːtʃ/",
      meaningVi: "Bạn bắt buộc phải mang kem chống nắng và đèn pin."
    },
    reading: {
      passage: "Ha Long Bay is one of the most famous natural wonders of Viet Nam. It has thousands of limestone islands and beautiful caves. When you visit Ha Long Bay, you must wear a life jacket on the boat.",
      questions: [
        {
          question: "What must visitors wear on the boat?",
          options: ["A life jacket", "A raincoat", "A warm hat"],
          answerIndex: 0
        },
        {
          question: "What does Ha Long Bay have?",
          options: ["Thousands of limestone islands", "A huge desert", "A tall volcano"],
          answerIndex: 0
        }
      ]
    },
    writing: {
      type: "unscramble",
      scrambledWords: ["You", "must", "carry", "a", "heavy", "backpack", "carefully."],
      correctSentence: "You must carry a heavy backpack carefully.",
      meaningVi: "Em phải đeo chiếc ba lô nặng thật cẩn thận."
    }
  },
  6: {
    grammar: {
      title: "Lời khuyên với Should / Shouldn't",
      ruleVi: "Dùng để khuyên ai đó nên làm (should) hoặc không nên làm (shouldn't) những điều tốt lành vào dịp Tết.",
      formula: "S + should / shouldn't + V (nguyên mẫu)",
      quickTip: "Should = nên làm (chúc Tết ông bà, mặc áo mới). Shouldn't = không nên (vòi tiền mừng tuổi, làm vỡ đồ).",
      quiz: [
        {
          question: "Children ______ help their parents decorate the house before Tet.",
          options: ["should", "shouldn't", "mustn't"],
          answerIndex: 0,
          explain: "Con cái 'nên' giúp bố mẹ trang trí nhà cửa đón Tết."
        },
        {
          question: "You ______ break things on the first day of the new year.",
          options: ["shouldn't", "should", "must"],
          answerIndex: 0,
          explain: "Không nên làm vỡ đồ đạc vào ngày đầu năm mới."
        },
        {
          question: "We ______ wish our grandparents good health and happiness.",
          options: ["should", "shouldn't", "don't"],
          answerIndex: 0,
          explain: "Chúng em 'nên' chúc ông bà dồi dào sức khỏe và hạnh phúc."
        }
      ]
    },
    listening: {
      transcript: "Tet is our biggest festival. We decorate our house with peach blossoms and eat special food like chung cake.",
      question: "What flowers do they decorate their house with?",
      options: ["Peach blossoms", "Sunflowers", "Lotus flowers"],
      answerIndex: 0
    },
    speaking: {
      targetSentence: "We should visit our relatives during Tet.",
      phonetic: "/wiː ʃʊd ˈvɪzɪt ˈaʊə ˈrelətɪvz ˈdjʊərɪŋ tet/",
      meaningVi: "Chúng em nên đi thăm họ hàng vào dịp Tết."
    },
    reading: {
      passage: "Tet is coming soon. In Viet Nam, people clean their houses to wash away bad luck. Children receive lucky money in red envelopes. Families gather together and enjoy special meals.",
      questions: [
        {
          question: "Why do people clean their houses before Tet?",
          options: ["To wash away bad luck", "To invite strangers", "To play games"],
          answerIndex: 0
        },
        {
          question: "What do children receive?",
          options: ["Lucky money in red envelopes", "School books", "New shoes"],
          answerIndex: 0
        }
      ]
    },
    writing: {
      type: "unscramble",
      scrambledWords: ["Children", "receive", "lucky", "money", "at", "Tet."],
      correctSentence: "Children receive lucky money at Tet.",
      meaningVi: "Trẻ em được nhận tiền lì xì vào dịp Tết."
    }
  },
  7: {
    grammar: {
      title: "Từ để hỏi (Wh-questions) & Liên từ (Conjunctions)",
      ruleVi: "Dùng từ để hỏi (What, Where, When, Who, Why, How) và các từ nối câu (and, but, although, because, so).",
      formula: "Wh-word + do/does/is/are + S + V...? | Mệnh đề 1 + [and/but/so/because] + Mệnh đề 2",
      quickTip: "Because: giải thích lý do; So: kết quả; But: trái ngược; What: cái gì; When: khi nào; Who: ai.",
      quiz: [
        {
          question: "______ do you watch cartoons? - Because they are funny.",
          options: ["Why", "When", "Where"],
          answerIndex: 0,
          explain: "Hỏi lý do dùng 'Why', trả lời bằng 'Because'."
        },
        {
          question: "I like documentaries, ______ my brother prefers animated films.",
          options: ["but", "because", "so"],
          answerIndex: 0,
          explain: "Hai sở thích đối lập nhau, dùng liên từ 'but' (nhưng)."
        },
        {
          question: "______ is the MC of this game show? - That is Mr. Tran.",
          options: ["Who", "What", "When"],
          answerIndex: 0,
          explain: "Hỏi về người (MC) dùng từ để hỏi 'Who'."
        }
      ]
    },
    listening: {
      transcript: "My favourite television channel is the discovery channel. It has educational programmes and funny animated films.",
      question: "What channel does the speaker like?",
      options: ["The discovery channel", "The music channel", "The news channel"],
      answerIndex: 0
    },
    speaking: {
      targetSentence: "I watch news programmes every evening.",
      phonetic: "/aɪ wɒtʃ njuːz ˈprəʊɡræmz ˈevri ˈiːvnɪŋ/",
      meaningVi: "Em xem các chương trình thời sự vào mỗi buổi tối."
    },
    reading: {
      passage: "Television is a popular source of entertainment and education. Viewers can watch many different channels from around the world. Educational programmes teach kids about animals, science, and history.",
      questions: [
        {
          question: "What do educational programmes teach kids about?",
          options: ["Animals, science, and history", "Cooking only", "Football only"],
          answerIndex: 0
        },
        {
          question: "Who watches television channels?",
          options: ["Viewers", "Actors only", "Singers only"],
          answerIndex: 0
        }
      ]
    },
    writing: {
      type: "unscramble",
      scrambledWords: ["This", "educational", "channel", "is", "very", "popular", "with", "kids."],
      correctSentence: "This educational channel is very popular with kids.",
      meaningVi: "Kênh truyền hình giáo dục này rất phổ biến với trẻ em."
    }
  },
  8: {
    grammar: {
      title: "Thì Quá khứ đơn (Past Simple) & Câu mệnh lệnh",
      ruleVi: "Dùng để kể lại các sự kiện thể thao đã kết thúc trong quá khứ hoặc dùng câu mệnh lệnh để hướng dẫn luật chơi.",
      formula: "S + V-ed / V2 | Phủ định: S + didn't + V (nguyên mẫu)",
      quickTip: "Dấu hiệu nhận biết: yesterday (hôm qua), last week, ago. Động từ quy tắc thêm -ed (played, watched).",
      quiz: [
        {
          question: "Yesterday, our class ______ a football match against class 6B.",
          options: ["played", "play", "plays"],
          answerIndex: 0,
          explain: "Có 'Yesterday' (hôm qua), chia động từ ở quá khứ đơn 'played'."
        },
        {
          question: "She didn't ______ to the karate club last Sunday.",
          options: ["go", "went", "goes"],
          answerIndex: 0,
          explain: "Sau trợ động từ phủ định 'didn't', động từ trở về nguyên mẫu 'go'."
        },
        {
          question: "______ your goggles before jumping into the swimming pool!",
          options: ["Put on", "Puts on", "Putting on"],
          answerIndex: 0,
          explain: "Câu mệnh lệnh bắt đầu bằng động từ nguyên mẫu 'Put on'."
        }
      ]
    },
    listening: {
      transcript: "Nam plays table tennis every Saturday. Last weekend, he won a gold medal in the city tournament.",
      question: "What did Nam win last weekend?",
      options: ["A gold medal", "A new racket", "A football"],
      answerIndex: 0
    },
    speaking: {
      targetSentence: "I played badminton with my father yesterday.",
      phonetic: "/aɪ pleɪd ˈbædmɪntən wɪð maɪ ˈfɑːðə ˈjestədeɪ/",
      meaningVi: "Hôm qua em đã chơi cầu lông với bố."
    },
    reading: {
      passage: "Sports and games play an important role in our lives. Doing aerobics or playing football keeps us healthy and fit. Last month, our school organized a marathon, and hundreds of students took part in it.",
      questions: [
        {
          question: "What did the school organize last month?",
          options: ["A marathon", "A dance contest", "A chess match"],
          answerIndex: 0
        },
        {
          question: "Why are sports important?",
          options: ["They keep us healthy and fit", "They make us tired", "They cost too much"],
          answerIndex: 0
        }
      ]
    },
    writing: {
      type: "unscramble",
      scrambledWords: ["We", "played", "table", "tennis", "in", "the", "school", "gym."],
      correctSentence: "We played table tennis in the school gym.",
      meaningVi: "Chúng em đã chơi bóng bàn trong nhà thể chất của trường."
    }
  },
  9: {
    grammar: {
      title: "Tính từ so sánh nhất (Superlative Adjectives)",
      ruleVi: "Dùng để so sánh một thành phố, một công trình kiến trúc nổi bật nhất trong tất cả các đối tượng được xét.",
      formula: "Tính từ ngắn: the + adj + -est | Tính từ dài: the + most + adj",
      quickTip: "Luôn có chữ 'the' phía trước tính từ so sánh nhất (the tallest, the most modern).",
      quiz: [
        {
          question: "Tokyo is one of ______ modern cities in the world.",
          options: ["the most", "most", "more"],
          answerIndex: 0,
          explain: "So sánh nhất của tính từ dài 'modern' dùng 'the most modern'."
        },
        {
          question: "Landmark 81 is ______ building in Viet Nam.",
          options: ["the tallest", "taller", "tallest"],
          answerIndex: 0,
          explain: "So sánh nhất của tính từ ngắn 'tall' dùng 'the tallest'."
        },
        {
          question: "London is famous for ______ historic bridges.",
          options: ["its", "it", "they"],
          answerIndex: 0,
          explain: "Tính từ sở hữu 'its' (của nó) bổ nghĩa cho danh từ 'bridges'."
        }
      ]
    },
    listening: {
      transcript: "Welcome to London! You can see famous landmarks such as Big Ben, the Tower Bridge, and Buckingham Palace.",
      question: "What famous tower is mentioned?",
      options: ["The Tower Bridge", "Eiffel Tower", "Tokyo Tower"],
      answerIndex: 0
    },
    speaking: {
      targetSentence: "This historic tower is very famous.",
      phonetic: "/ðɪs hɪˈstɒrɪk ˈtaʊə ɪz ˈveri ˈfeɪməs/",
      meaningVi: "Tòa tháp lịch sử này rất nổi tiếng."
    },
    reading: {
      passage: "Sydney is an exciting city in Australia. It has the famous Sydney Opera House with its unique architectural design. The weather is sunny in summer, and millions of tourists visit its beautiful beaches every year.",
      questions: [
        {
          question: "Where is Sydney located?",
          options: ["In Australia", "In England", "In Viet Nam"],
          answerIndex: 0
        },
        {
          question: "What is the famous building in Sydney?",
          options: ["Sydney Opera House", "Eiffel Tower", "Statue of Liberty"],
          answerIndex: 0
        }
      ]
    },
    writing: {
      type: "unscramble",
      scrambledWords: ["This", "is", "the", "most", "famous", "palace", "in", "the", "city."],
      correctSentence: "This is the most famous palace in the city.",
      meaningVi: "Đây là cung điện nổi tiếng nhất trong thành phố."
    }
  },
  10: {
    grammar: {
      title: "Thì Tương lai đơn (Future Simple with Will) & Might",
      ruleVi: "Dùng để đưa ra lời dự đoán về cuộc sống, nhà ở và robot trong tương lai (will/won't) hoặc khả năng có thể xảy ra (might).",
      formula: "S + will / won't + V (nguyên mẫu) | S + might + V",
      quickTip: "Sau will, won't, might luôn là động từ nguyên thể không chia.",
      quiz: [
        {
          question: "In the future, our smart house ______ solar energy for heating.",
          options: ["will use", "used", "uses"],
          answerIndex: 0,
          explain: "Dự đoán tương lai có 'In the future' dùng 'will use'."
        },
        {
          question: "We ______ live on the Moon because it might be too cold.",
          options: ["might not", "will", "are"],
          answerIndex: 0,
          explain: "Khả năng không chắc chắn trong tương lai dùng 'might not'."
        },
        {
          question: "Robot helpers ______ do all the housework for us.",
          options: ["will", "shall to", "are"],
          answerIndex: 0,
          explain: "Dự đoán việc robot sẽ làm trong tương lai dùng 'will + V'."
        }
      ]
    },
    listening: {
      transcript: "My dream house will be a smart space houseboat. It will have solar energy and automatic appliances.",
      question: "What kind of energy will the house use?",
      options: ["Solar energy", "Coal energy", "Wind only"],
      answerIndex: 0
    },
    speaking: {
      targetSentence: "My future house will have super smart appliances.",
      phonetic: "/maɪ ˈfjuːtʃə haʊs wɪl hæv ˈsuːpə smɑːt əˈplaɪənsɪz/",
      meaningVi: "Ngôi nhà tương lai của em sẽ có các thiết bị siêu thông minh."
    },
    reading: {
      passage: "Future houses will be very eco-friendly. Many people might live in floating houses on the ocean or in underground smart homes. Solar panels on the roof will provide clean electricity for wireless appliances.",
      questions: [
        {
          question: "What will provide clean electricity?",
          options: ["Solar panels on the roof", "Petrol engines", "Gas tanks"],
          answerIndex: 0
        },
        {
          question: "Where might some future houses float?",
          options: ["On the ocean", "In the clouds", "Inside volcanoes"],
          answerIndex: 0
        }
      ]
    },
    writing: {
      type: "unscramble",
      scrambledWords: ["Our", "smart", "house", "will", "use", "solar", "energy."],
      correctSentence: "Our smart house will use solar energy.",
      meaningVi: "Ngôi nhà thông minh của chúng em sẽ sử dụng năng lượng mặt trời."
    }
  },
  11: {
    grammar: {
      title: "Câu điều kiện loại 1 (First Conditional: If)",
      ruleVi: "Dùng để diễn tả một điều kiện có thể xảy ra và kết quả thực tế của nó (Đặc biệt dùng cho các hành động bảo vệ môi trường).",
      formula: "If + S + V(hiện tại đơn), S + will / won't + V(nguyên mẫu)",
      quickTip: "Vế có 'If' chia hiện tại đơn. Vế kết quả dùng 'will/won't' + động từ nguyên mẫu.",
      quiz: [
        {
          question: "If we recycle plastic bottles, we ______ the environment.",
          options: ["will protect", "protected", "protects"],
          answerIndex: 0,
          explain: "Vế 'If' ở hiện tại đơn (recycle), vế sau dùng 'will protect'."
        },
        {
          question: "If you ______ reusable bags, you will reduce plastic waste.",
          options: ["use", "used", "will use"],
          answerIndex: 0,
          explain: "Vế 'If' của câu điều kiện loại 1 chia động từ ở hiện tại đơn 'use'."
        },
        {
          question: "The river ______ polluted if factories dump rubbish into it.",
          options: ["will be", "was", "is being"],
          answerIndex: 0,
          explain: "Vế kết quả của câu điều kiện loại 1 dùng 'will be'."
        }
      ]
    },
    listening: {
      transcript: "We should follow the 3Rs rule: reduce our rubbish, reuse old containers, and recycle plastic bags.",
      question: "What does the 3Rs rule stand for?",
      options: ["Reduce, reuse, and recycle", "Run, read, and write", "Rest, relax, and recover"],
      answerIndex: 0
    },
    speaking: {
      targetSentence: "We should reduce plastic waste to protect our planet.",
      phonetic: "/wiː ʃʊd rɪˈdjuːs ˈplæstɪk weɪst tuː prəˈtekt ˈaʊə ˈplænɪt/",
      meaningVi: "Chúng ta nên giảm rác thải nhựa để bảo vệ hành tinh."
    },
    reading: {
      passage: "Our planet is facing serious pollution. If we don't save energy, natural resources will run out quickly. Everyone can help by turning off the lights, picking up litter, and planting green trees.",
      questions: [
        {
          question: "What can everyone do to help?",
          options: ["Turn off lights and plant trees", "Burn more plastic", "Use more cars"],
          answerIndex: 0
        },
        {
          question: "What happens if we don't save energy?",
          options: ["Natural resources will run out", "The air becomes cleaner", "Rivers become clearer"],
          answerIndex: 0
        }
      ]
    },
    writing: {
      type: "unscramble",
      scrambledWords: ["If", "we", "reuse", "bottles,", "we", "will", "save", "money."],
      correctSentence: "If we reuse bottles, we will save money.",
      meaningVi: "Nếu chúng ta tái sử dụng chai lọ, chúng ta sẽ tiết kiệm được tiền."
    }
  },
  12: {
    grammar: {
      title: "Diễn tả khả năng với Can, Could, Will be able to",
      ruleVi: "Dùng 'can' để nói về khả năng ở hiện tại, 'could' cho quá khứ và 'will be able to' cho tương lai.",
      formula: "Hiện tại: S + can + V | Quá khứ: S + could + V | Tương lai: S + will be able to + V",
      quickTip: "Khả năng bây giờ: CAN. Khả năng ngày xưa: COULD. Khả năng sau này: WILL BE ABLE TO.",
      quiz: [
        {
          question: "In the future, smart robots ______ recognise human feelings.",
          options: ["will be able to", "could", "can to"],
          answerIndex: 0,
          explain: "Khả năng trong tương lai có 'In the future' dùng 'will be able to'."
        },
        {
          question: "Ten years ago, robots ______ only do very simple tasks.",
          options: ["could", "will be able to", "can"],
          answerIndex: 0,
          explain: "Khả năng trong quá khứ có 'Ten years ago' dùng 'could'."
        },
        {
          question: "Today, home robots ______ clean the floor and cook meals.",
          options: ["can", "could", "will able"],
          answerIndex: 0,
          explain: "Khả năng ở hiện tại có 'Today' dùng 'can'."
        }
      ]
    },
    listening: {
      transcript: "My smart home robot can guard the house, iron clothes, and water flowers in the garden.",
      question: "What can the robot do in the garden?",
      options: ["Water flowers", "Dig holes", "Cut trees"],
      answerIndex: 0
    },
    speaking: {
      targetSentence: "This smart robot can recognise human voice.",
      phonetic: "/ðɪs smɑːt ˈrəʊbɒt kæn ˈrekəɡnaɪz ˈhjuːmən vɔɪs/",
      meaningVi: "Chú robot thông minh này có thể nhận diện giọng nói con người."
    },
    reading: {
      passage: "Robots are becoming more helpful in our daily lives. Doctor robots can help examine patients, while teacher robots can teach English to young children. In the future, robots will be able to do heavy and dangerous work for humans.",
      questions: [
        {
          question: "What can teacher robots do?",
          options: ["Teach English to young children", "Drive buses", "Build bridges"],
          answerIndex: 0
        },
        {
          question: "What will robots be able to do in the future?",
          options: ["Heavy and dangerous work", "Sleep all day", "Nothing new"],
          answerIndex: 0
        }
      ]
    },
    writing: {
      type: "unscramble",
      scrambledWords: ["This", "smart", "robot", "can", "guard", "our", "house."],
      correctSentence: "This smart robot can guard our house.",
      meaningVi: "Chú robot thông minh này có thể trông coi nhà của chúng em."
    }
  }
};

for (const [unitId, data] of Object.entries(STATIONS_DATA)) {
  const filePath = path.join('src', 'data', `unit${unitId}.json`);
  if (!fs.existsSync(filePath)) continue;

  const current = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  current.grammar = data.grammar;
  current.listening = data.listening;
  current.speaking = data.speaking;
  current.reading = data.reading;
  current.writing = data.writing;

  fs.writeFileSync(filePath, JSON.stringify(current, null, 2), 'utf8');
  console.log(`Updated unit ${unitId} with Grammar and 4-skill stations.`);
}

