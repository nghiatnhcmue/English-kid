import SkillPageLayout from '../components/layout/SkillPageLayout.jsx';
import GrammarStation from '../components/stations/GrammarStation.jsx';

export default function GrammarPage() {
  return (
    <SkillPageLayout
      title="📐 Sổ tay Ngữ pháp cốt lõi"
      subtitle={(n) => `${n} chủ điểm ngữ pháp chuẩn SGK Global Success · Công thức tinh gọn & Mẹo nhớ nhanh`}
      backToHome
      navAriaLabel="Chọn bài học ngữ pháp"
      navLabel={(n) => `Chọn bài học ngữ pháp (${n} bài học):`}
      pillTone="banana"
      unitCardSubtitle={(u) => u.grammar?.title || 'Chủ điểm ngữ pháp trọng tâm'}
      unitCardAction={(u) => (
        <span className="text-4xl shrink-0" aria-hidden>
          {u.emoji}
        </span>
      )}
      Station={GrammarStation}
      mode="grammar"
    />
  );
}
