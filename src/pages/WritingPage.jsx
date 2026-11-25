import { Button3D } from '../components/ui.jsx';
import SkillPageLayout from '../components/layout/SkillPageLayout.jsx';
import WritingStation from '../components/stations/WritingStation.jsx';

export default function WritingPage() {
  return (
    <SkillPageLayout
      title="✍️ Phòng Luyện Viết & Sắp xếp câu"
      subtitle={(n) =>
        `${n} bài tập sắp xếp khối từ xáo trộn thành câu hoàn chỉnh · Củng cố cấu trúc ngữ pháp chuẩn SGK`
      }
      tip={{
        tone: 'mint',
        icon: '✍️',
        title: 'Cách làm bài sắp xếp câu:',
        body: 'Bấm vào từng khối từ để đưa lên dòng kẻ theo đúng thứ tự câu tiếng Anh (Chủ ngữ → Động từ → Vị ngữ). Nếu chọn nhầm, bấm lại vào từ đó để gỡ xuống nhé!',
      }}
      navAriaLabel="Chọn bài học luyện viết"
      navLabel={(n) => `Chọn bài học luyện viết câu (${n} bài học):`}
      pillTone="mint"
      unitCardSubtitle={(u) => u.titleVi}
      unitCardAction={(u) => (
        <Button3D tone="sky" to={`/unit/${u.unitId}/reading`} className="px-4 py-2 text-sm sm:text-base">
          <span>📖 Đọc đoạn văn Unit này →</span>
        </Button3D>
      )}
      Station={WritingStation}
      mode="writing"
    />
  );
}
