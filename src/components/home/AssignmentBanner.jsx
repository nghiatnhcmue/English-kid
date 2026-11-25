import { Link } from 'react-router-dom';
import { playSfx } from '../../utils/sfx.js';

export function buildAssignmentTargetLink(assignedItem) {
  if (!assignedItem) return '/';
  if (assignedItem.scopeType === 'skill') {
    const skillRoutes = {
      speaking: '/speaking',
      listening: '/listening',
      pronunciation: '/pronunciation',
      grammar: '/grammar',
      reading: '/reading',
      writing: '/writing',
    };
    const base = skillRoutes[assignedItem.selectedSkill];
    if (base) return `${base}?unit=${assignedItem.unitId}`;
    return `/unit/${assignedItem.unitId}`;
  }
  if (assignedItem.scopeType === 'custom_words') {
    const ids = (assignedItem.selectedWordIds || []).join(',');
    return `/unit/${assignedItem.unitId}/flashcard${ids ? `?words=${encodeURIComponent(ids)}` : ''}`;
  }
  return `/unit/${assignedItem.unitId}`;
}

export default function AssignmentBanner({ assignedItem, onOpenQuizModal }) {
  if (!assignedItem) return null;

  const isQuizModalType =
    assignedItem.scopeType === 'custom_questions' ||
    assignedItem.scopeType === 'external_quiz' ||
    (Array.isArray(assignedItem.questions) && assignedItem.questions.length > 0);

  return (
    <section
      aria-label="Bài tập được giao"
      className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-r from-peach-soft to-peach/20 p-6 sm:p-7 shadow-md border-3 border-peach"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-peach text-white text-3xl shadow-xs">
            🎯
          </span>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="rounded-full bg-peach px-2.5 py-0.5 text-xs font-black text-white">
                Bài tập Tuần {assignedItem.week}
              </span>
              {assignedItem.deadline && (
                <span className="rounded-full bg-white px-2.5 py-0.5 text-xs font-black text-peach-dark border border-peach/30">
                  ⏰ Hạn nộp: {assignedItem.deadline}
                </span>
              )}
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-ink mt-1">{assignedItem.title}</h3>
            {assignedItem.note && (
              <p className="text-xs sm:text-sm font-bold text-ink-soft mt-0.5 italic">
                💬 Lời dặn của Thầy Cô: &quot;{assignedItem.note}&quot;
              </p>
            )}
          </div>
        </div>

        {isQuizModalType ? (
          <button
            type="button"
            onClick={() => {
              playSfx('click');
              onOpenQuizModal?.(assignedItem);
            }}
            className="inline-flex min-h-14 shrink-0 items-center justify-center gap-2 rounded-2xl bg-peach px-6 text-base font-black text-white shadow-[0_4px_0_var(--color-peach-dark)] hover:-translate-y-0.5 active:translate-y-1 transition-all cursor-pointer whitespace-nowrap text-center"
          >
            <span>Làm bài tập ngay 🚀</span>
          </button>
        ) : (
          <Link
            to={buildAssignmentTargetLink(assignedItem)}
            onClick={() => playSfx('click')}
            className="inline-flex min-h-14 shrink-0 items-center justify-center gap-2 rounded-2xl bg-peach px-6 text-base font-black text-white shadow-[0_4px_0_var(--color-peach-dark)] hover:-translate-y-0.5 active:translate-y-1 transition-all cursor-pointer whitespace-nowrap text-center"
          >
            <span>Làm bài ngay 🚀</span>
          </Link>
        )}
      </div>
    </section>
  );
}
