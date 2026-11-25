import { Button3D } from '../components/ui.jsx';
import SkillPageLayout from '../components/layout/SkillPageLayout.jsx';
import ReadingStation from '../components/stations/ReadingStation.jsx';

export default function ReadingPage() {
  return (
    <SkillPageLayout
      title="📖 Phòng Luyện Đọc hiểu trực quan"
      subtitle={(n) =>
        `${n} đoạn văn đọc hiểu chuẩn SGK Global Success · Có loa đọc toàn văn & câu hỏi trắc nghiệm kiểm tra nắm ý`
      }
      tip={{
        tone: 'sky',
        icon: '💡',
        title: 'Phương pháp Đọc hiểu cho học sinh mất gốc:',
        body: (
          <>
            1. Bấm nút <strong>Loa phát âm 🔊</strong> để nghe máy đọc mẫu toàn bộ đoạn văn → 2. Đọc thầm lại từng câu
            → 3. Đọc câu hỏi và chọn đáp án chính xác bên dưới!
          </>
        ),
      }}
      navAriaLabel="Chọn bài học đọc hiểu"
      navLabel={(n) => `Chọn bài học đọc hiểu (${n} bài học):`}
      pillTone="sky"
      unitCardSubtitle={(u) => u.titleVi}
      unitCardAction={(u) => (
        <Button3D tone="mint" to={`/unit/${u.unitId}/writing`} className="px-4 py-2 text-sm sm:text-base">
          <span>✍️ Luyện Viết câu Unit này →</span>
        </Button3D>
      )}
      Station={ReadingStation}
      mode="reading"
    />
  );
}
