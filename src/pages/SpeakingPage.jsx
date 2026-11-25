import SkillPageLayout from '../components/layout/SkillPageLayout.jsx';
import SpeakingStation from '../components/stations/SpeakingStation.jsx';

export default function SpeakingPage() {
  return (
    <SkillPageLayout
      title="🎙️ Phòng Luyện Nói & Chấm Điểm AI"
      subtitle="🎭 Đối đáp phân vai cùng Máy theo hội thoại SGK · Máy nói 1 vai, em nói 1 vai · Chấm điểm AI & nghe lại giọng"
      showBackToUnitAction
      tip={{
        tone: 'peach',
        icon: '🎭',
        title: 'Chế độ Đối đáp Phân vai cùng Máy (Interactive Role-Play):',
        body: '1. Chọn nhân vật em muốn đóng vai → 2. Máy tự động đọc vai của máy → 3. Đến lượt em, bấm Micro đọc câu thoại theo phiên âm → 4. Máy chấm điểm AI và tiếp tục đối đáp cùng em!',
      }}
      navAriaLabel="Chọn bài học luyện nói"
      navLabel={(n) => `Chọn bài học để luyện nói (${n} Unit Global Success):`}
      pillTone="peach"
      Station={SpeakingStation}
      mode="speaking"
    />
  );
}
