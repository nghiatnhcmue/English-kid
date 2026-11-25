const BADGE_META = {
  multiple_choice: {
    cls: 'bg-mint-soft text-mint-dark',
    label: '🏷️ Trắc nghiệm A, B, C, D',
  },
  fill_blank: {
    cls: 'bg-sky-soft text-sky-dark',
    label: '✏️ Điền từ vào chỗ trống',
  },
  unscramble: {
    cls: 'bg-peach-soft text-peach-dark',
    label: '🧩 Sắp xếp từ thành câu',
  },
  sentence_completion: {
    cls: 'bg-purple-100 text-purple-700',
    label: '✍️ Viết thêm hoàn thành câu',
  },
};

export default function QuestionTypeBadge({ type = 'multiple_choice' }) {
  const meta = BADGE_META[type] || BADGE_META.multiple_choice;
  return (
    <span className={`rounded-full px-3.5 py-1 text-xs font-black uppercase tracking-wider ${meta.cls}`}>
      {meta.label}
    </span>
  );
}
