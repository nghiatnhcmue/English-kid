import SkillPageLayout from '../components/layout/SkillPageLayout.jsx';
import PronunciationStation from '../components/stations/PronunciationStation.jsx';

export default function PronunciationPage() {
  return (
    <SkillPageLayout
      title="🗣️ Phòng Luyện Phát Âm & Ngữ Âm"
      subtitle={(n) =>
        `${n} cặp âm chuẩn SGK Global Success (A Closer Look 1) · Khẩu hình tiếng Việt & Trắc nghiệm phân biệt âm`
      }
      navAriaLabel="Chọn bài học phát âm"
      navLabel={(n) => `Chọn bài học để luyện phát âm (${n} bài học):`}
      pillTone="peach"
      Station={PronunciationStation}
      mode="pronunciation"
    />
  );
}
