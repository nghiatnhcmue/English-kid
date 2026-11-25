import { useState } from 'react';
import { Button3D, SpeakerButton } from '../ui.jsx';
import { speak } from '../../utils/speech.js';
import { playSfx } from '../../utils/sfx.js';
import { useSpeechEvaluator } from '../../hooks/useSpeechEvaluator.js';
import MultipleChoiceOptions from '../questions/MultipleChoiceOptions.jsx';
import SpeakingPracticeCard from './speaking/SpeakingPracticeCard.jsx';

export default function ShadowingStation({ unit, initialTab = 'listening', onFinish }) {
  const listening = unit?.listening;
  const speaking = unit?.speaking;

  const [activeTab, setActiveTab] = useState(initialTab); // 'listening' | 'speaking'
  const [listenAnswered, setListenAnswered] = useState(false);
  const [listenSelected, setListenSelected] = useState(null);

  const evaluator = useSpeechEvaluator({ enableConfetti: false });

  const handleListenSelect = (idx) => {
    if (listenAnswered) return;
    setListenSelected(idx);
    setListenAnswered(true);
    playSfx(idx === listening?.answerIndex ? 'correct' : 'wrong');
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex gap-2 rounded-2xl bg-white p-1.5 shadow-sm border border-[#efe3cc]">
        <button
          type="button"
          onClick={() => setActiveTab('listening')}
          className={`flex-1 min-h-12 rounded-xl text-base font-black transition-all cursor-pointer flex items-center justify-center gap-2 ${
            activeTab === 'listening' ? 'bg-banana text-ink shadow-sm' : 'text-ink-soft hover:bg-cream'
          }`}
        >
          <span>👂</span>
          <span>1. Luyện Nghe hội thoại</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('speaking')}
          className={`flex-1 min-h-12 rounded-xl text-base font-black transition-all cursor-pointer flex items-center justify-center gap-2 ${
            activeTab === 'speaking' ? 'bg-peach text-white shadow-sm' : 'text-ink-soft hover:bg-cream'
          }`}
        >
          <span>🎙️</span>
          <span>2. Luyện Nói (Nhại giọng)</span>
        </button>
      </div>

      {activeTab === 'listening' && (
        <div className="rounded-[2.5rem] bg-white p-6 sm:p-8 shadow-[0_8px_0_#efe3cc] border-2 border-[#efe3cc] flex flex-col gap-5">
          <div className="flex items-center justify-between">
            <span className="rounded-full bg-banana-soft px-3.5 py-1 text-xs font-black text-ink uppercase">
              Hội thoại học đường
            </span>
          </div>

          <div className="rounded-2xl bg-cream-soft p-5 border border-banana-soft flex flex-col items-center gap-3 text-center">
            <p className="text-sm font-bold text-ink-soft">Bấm nút để nghe đoạn hội thoại:</p>
            <div className="flex items-center gap-3">
              <SpeakerButton text={listening?.transcript} audio={listening?.audio} size="lg" />
              <button
                type="button"
                onClick={() => speak(listening?.transcript, { rate: 0.65, audio: listening?.audio })}
                className="inline-flex min-h-12 items-center gap-2 rounded-2xl bg-white px-4 text-base font-black text-ink shadow-sm border border-[#efe3cc] hover:bg-cream active:translate-y-0.5 cursor-pointer"
              >
                <span>🐢 Nghe chậm</span>
              </button>
            </div>
            {listenAnswered && (
              <div className="mt-2 text-base font-bold text-ink bg-white/90 p-3 rounded-xl border border-banana">
                <span className="text-xs font-black uppercase text-ink-soft block mb-1">Lời thoại:</span>
                &quot;{listening?.transcript}&quot;
              </div>
            )}
          </div>

          <div className="flex flex-col gap-3">
            <h3 className="text-xl font-black text-ink">❓ {listening?.question}</h3>
            <MultipleChoiceOptions
              options={listening?.options || []}
              selectedIndex={listenSelected}
              answerIndex={listening?.answerIndex}
              locked={listenAnswered}
              showResult={listenAnswered}
              onSelect={handleListenSelect}
            />
          </div>

          {listenAnswered && (
            <div className="flex justify-end pt-2">
              <Button3D tone="peach" onClick={() => setActiveTab('speaking')} className="px-6 py-3">
                Chuyển sang phần Luyện Nói 🎙️ →
              </Button3D>
            </div>
          )}
        </div>
      )}

      {activeTab === 'speaking' && (
        <SpeakingPracticeCard
          ariaLabel="Nhại giọng câu giao tiếp"
          badge="Nhại giọng câu giao tiếp (Shadowing)"
          sentenceEn={speaking?.targetSentence || ''}
          phonetic={speaking?.phonetic}
          meaningVi={speaking?.meaningVi}
          audio={speaking?.audio}
          evaluator={evaluator}
          onStartRecord={() => evaluator.startRecord(speaking?.targetSentence || '')}
          finishLabel="Hoàn thành trạm Nghe & Nói →"
          onFinish={
            evaluator.recordingStatus === 'done'
              ? () => onFinish?.(evaluator.stars, 'Đã hoàn thành luyện Nghe & Nói!')
              : undefined
          }
        />
      )}
    </div>
  );
}
