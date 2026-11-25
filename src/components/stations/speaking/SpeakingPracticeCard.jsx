import { ChevronLeft } from 'lucide-react';
import { Button3D } from '../../ui.jsx';
import TargetSentenceHeader from '../../speech/TargetSentenceHeader.jsx';
import MicRecordButton from '../../speech/MicRecordButton.jsx';
import SpeechEvalResultCard from '../../speech/SpeechEvalResultCard.jsx';

export default function SpeakingPracticeCard({
  ariaLabel = 'Luyện nói',
  badge,
  badgeTone = 'peach',
  sentenceEn,
  quoted = true,
  phonetic,
  meaningVi,
  tipsVi,
  tipsLabel = 'Mẹo phát âm',
  audio,
  dialoguePrompt,
  micTone = 'peach',
  idleLabel,
  doneLabel,
  recordingLabel,
  evaluator,
  onStartRecord,
  hasPrev = false,
  prevLabel = 'Câu trước',
  onPrev,
  hasNext = false,
  nextLabel = 'Sang câu tiếp theo →',
  nextTone = 'peach',
  onNext,
  finishLabel = 'Hoàn thành xuất sắc 🌟',
  onFinish,
}) {
  return (
    <section
      aria-label={ariaLabel}
      className="rounded-[2.5rem] bg-white p-6 sm:p-8 shadow-[0_8px_0_#efe3cc] border-3 border-banana-soft flex flex-col gap-6"
    >
      <TargetSentenceHeader
        badge={badge}
        badgeTone={badgeTone}
        sentenceEn={sentenceEn}
        quoted={quoted}
        phonetic={phonetic}
        meaningVi={meaningVi}
        tipsVi={tipsVi}
        tipsLabel={tipsLabel}
        audio={audio}
        dialoguePrompt={dialoguePrompt}
      />

      <MicRecordButton
        status={evaluator.recordingStatus}
        micError={evaluator.micError}
        tone={micTone}
        idleLabel={idleLabel}
        doneLabel={doneLabel}
        recordingLabel={recordingLabel}
        onStart={onStartRecord}
        onStop={evaluator.stopRecord}
      />

      <SpeechEvalResultCard
        status={evaluator.recordingStatus}
        scorePercent={evaluator.scorePercent}
        stars={evaluator.stars}
        feedback={evaluator.feedback}
        wordAnalysis={evaluator.wordAnalysis}
        recognizedText={evaluator.recognizedText}
        audioUrl={evaluator.audioUrl}
        onRetry={onStartRecord}
      />

      {(onPrev || onNext || onFinish) && (
        <div className="flex items-center justify-between border-t border-banana-soft pt-4">
          {hasPrev && onPrev ? (
            <button
              type="button"
              onClick={onPrev}
              className="inline-flex items-center gap-1.5 rounded-2xl bg-cream px-4 py-2 text-xs sm:text-sm font-black text-ink hover:bg-banana-soft cursor-pointer transition-all border border-banana-soft"
            >
              <ChevronLeft className="h-4 w-4" />
              <span>{prevLabel}</span>
            </button>
          ) : (
            <div />
          )}

          {hasNext && onNext ? (
            <Button3D tone={nextTone} onClick={onNext} className="px-5 py-2 text-xs sm:text-sm">
              <span>{nextLabel}</span>
            </Button3D>
          ) : onFinish ? (
            <Button3D tone="mint" onClick={onFinish} className="px-5 py-2 text-xs sm:text-sm">
              <span>{finishLabel}</span>
            </Button3D>
          ) : null}
        </div>
      )}
    </section>
  );
}
