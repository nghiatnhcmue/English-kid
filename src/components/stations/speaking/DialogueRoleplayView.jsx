import { useRef, useEffect } from 'react';
import { Volume2, RotateCcw, ChevronLeft, ChevronRight, Bot, User } from 'lucide-react';
import { Button3D, SpeakerButton } from '../../ui.jsx';
import { playSfx } from '../../../utils/sfx.js';
import TargetSentenceHeader from '../../speech/TargetSentenceHeader.jsx';
import MicRecordButton from '../../speech/MicRecordButton.jsx';
import SpeechEvalResultCard from '../../speech/SpeechEvalResultCard.jsx';
import SpeakingPracticeCard from './SpeakingPracticeCard.jsx';

export default function DialogueRoleplayView({
  speaking,
  dialogueLines,
  dialogueSpeakers,
  dialogueSubMode,
  setDialogueSubMode,
  myRole,
  onChangeRole,
  autoPlayComputer,
  setAutoPlayComputer,
  isComputerSpeaking,
  selectedDialogueIdx,
  onSelectDialogue,
  turnScores,
  isRoleplayFinished,
  onResetRoleplay,
  onPlayOtherRole,
  onAdvanceTurn,
  onPlayComputerLine,
  currentTarget,
  evaluator,
  onStartRecord,
  onFinishStation,
}) {
  const chatScrollRef = useRef(null);

  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [selectedDialogueIdx, dialogueSubMode]);

  return (
    <div className="flex flex-col gap-5">
      {/* Thanh cài đặt phân vai */}
      <div className="rounded-3xl bg-white p-5 border-2 border-banana-soft shadow-xs flex flex-col gap-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-banana-soft pb-3">
          <div>
            <span className="rounded-full bg-banana px-3 py-0.5 text-xs font-black text-ink">
              {speaking?.dialogueTitle || 'Getting Started'}
            </span>
            <p className="mt-1 text-sm font-bold text-ink-soft">
              {speaking?.dialogueContext ||
                'Máy đóng vai một nhân vật, hiện phụ đề và câu mẫu để em đóng vai đối đáp!'}
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-1 rounded-2xl bg-cream p-1 border border-banana-soft">
            <button
              type="button"
              onClick={() => {
                playSfx('click');
                setDialogueSubMode('roleplay');
              }}
              className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-black transition-all cursor-pointer ${
                dialogueSubMode === 'roleplay'
                  ? 'bg-peach text-white shadow-2xs'
                  : 'text-ink-soft hover:text-ink'
              }`}
            >
              <Bot className="h-3.5 w-3.5" />
              <span>🎭 Đối đáp cùng Máy</span>
            </button>
            <button
              type="button"
              onClick={() => {
                playSfx('click');
                setDialogueSubMode('list');
              }}
              className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-black transition-all cursor-pointer ${
                dialogueSubMode === 'list'
                  ? 'bg-banana text-ink shadow-2xs'
                  : 'text-ink-soft hover:text-ink'
              }`}
            >
              <span>📑 Từng câu tự do</span>
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-black uppercase text-ink-soft tracking-wider">
              👤 Chọn vai của em:
            </span>
            {dialogueSpeakers.map((spk) => {
              const isSelected = myRole === spk;
              const myTurnCount = dialogueLines.filter((l) => l.speaker === spk).length;
              return (
                <button
                  key={spk}
                  type="button"
                  onClick={() => onChangeRole(spk)}
                  className={`inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-xs sm:text-sm font-black transition-all cursor-pointer border-2 ${
                    isSelected
                      ? 'bg-peach text-white border-peach-dark shadow-[0_3px_0_var(--color-peach-dark)] scale-105'
                      : 'bg-cream/60 text-ink-soft border-banana-soft hover:bg-cream hover:text-ink'
                  }`}
                >
                  <User className="h-4 w-4" />
                  <span>{spk}</span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                      isSelected ? 'bg-white/30 text-white' : 'bg-white text-ink-soft'
                    }`}
                  >
                    {myTurnCount} lượt
                  </span>
                </button>
              );
            })}
          </div>

          <label className="flex items-center gap-2 text-xs font-black text-ink-soft cursor-pointer select-none">
            <input
              type="checkbox"
              checked={autoPlayComputer}
              onChange={(e) => setAutoPlayComputer(e.target.checked)}
              className="h-4 w-4 rounded accent-peach cursor-pointer"
            />
            <span>🔊 Tự động phát giọng Máy</span>
          </label>
        </div>
      </div>

      {/* CHẾ ĐỘ ROLEPLAY CHAT */}
      {dialogueSubMode === 'roleplay' && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {dialogueLines.map((line, idx) => {
              const isCurrent = selectedDialogueIdx === idx;
              const isMine = line.speaker === myRole;
              const score = turnScores[idx]?.score;
              const isDone = turnScores[idx] !== undefined || (idx < selectedDialogueIdx && !isMine);

              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => onSelectDialogue(idx)}
                  title={`Lượt ${idx + 1}: ${line.speaker} - "${line.sentenceEn}"`}
                  className={`flex shrink-0 items-center gap-1 rounded-xl px-2.5 py-1 text-xs font-black transition-all cursor-pointer border ${
                    isCurrent
                      ? 'bg-peach text-white border-peach-dark ring-2 ring-peach/40 scale-105'
                      : isDone
                      ? 'bg-mint-soft text-mint-dark border-mint/40'
                      : 'bg-white text-ink-soft border-banana-soft hover:bg-cream'
                  }`}
                >
                  <span>#{idx + 1}</span>
                  <span>{isMine ? '👤' : '🤖'}</span>
                  <span className="hidden sm:inline">{line.speaker}</span>
                  {score !== undefined && (
                    <span className="rounded bg-mint text-white px-1 text-[10px]">{score}%</span>
                  )}
                </button>
              );
            })}
          </div>

          <div
            ref={chatScrollRef}
            className="max-h-[380px] overflow-y-auto rounded-3xl bg-cream/40 p-4 sm:p-5 border-2 border-banana-soft flex flex-col gap-3.5 scrollbar-thin shadow-inner"
          >
            {dialogueLines.slice(0, selectedDialogueIdx + 1).map((line, idx) => {
              const isMine = line.speaker === myRole;
              const isCurrent = selectedDialogueIdx === idx;
              const scoreData = turnScores[idx];

              return (
                <div
                  key={line.id || idx}
                  className={`flex items-start gap-2.5 sm:gap-3 transition-all ${
                    isMine
                      ? 'flex-row-reverse self-end max-w-[90%] sm:max-w-[80%]'
                      : 'flex-row self-start max-w-[90%] sm:max-w-[80%]'
                  }`}
                >
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl text-lg shadow-2xs ${
                      isMine
                        ? 'bg-peach text-white ring-2 ring-peach/30'
                        : 'bg-sky-dark text-white ring-2 ring-sky-300'
                    }`}
                    title={isMine ? `Vai của em: ${line.speaker}` : `Máy đóng vai: ${line.speaker}`}
                  >
                    {isMine ? '👤' : '🤖'}
                  </div>

                  <div
                    className={`flex flex-col gap-1 rounded-3xl p-3.5 sm:p-4 shadow-xs border-2 ${
                      isMine
                        ? isCurrent
                          ? 'bg-white text-ink border-peach ring-2 ring-peach/30'
                          : 'bg-peach-soft/60 text-ink border-peach/30'
                        : isCurrent
                        ? 'bg-white text-ink border-sky-dark ring-2 ring-sky-200'
                        : 'bg-white text-ink border-banana-soft'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 border-b border-banana-soft/60 pb-1.5 text-xs">
                      <span className={`font-black ${isMine ? 'text-peach-dark' : 'text-sky-dark'}`}>
                        {isMine ? `👤 ${line.speaker} (Em)` : `🤖 ${line.speaker} (Máy)`}
                      </span>
                      <div className="flex items-center gap-1.5">
                        {scoreData && (
                          <span className="rounded-full bg-mint text-white px-2 py-0.5 text-[10px] font-black">
                            ⭐ {scoreData.score}%
                          </span>
                        )}
                        <SpeakerButton text={line.sentenceEn} audio={line.audio} size="sm" />
                      </div>
                    </div>

                    <p className="text-base sm:text-lg font-black text-ink leading-snug">
                      &quot;{line.sentenceEn}&quot;
                    </p>
                    {line.phonetic && (
                      <p className="font-mono text-xs sm:text-sm font-bold text-sky-dark">{line.phonetic}</p>
                    )}
                    <p className="text-xs sm:text-sm font-bold text-ink-soft">({line.meaningVi})</p>

                    {!isMine && isCurrent && isComputerSpeaking && (
                      <div className="mt-1 flex items-center gap-1.5 text-sky-dark font-black text-xs animate-pulse">
                        <span className="h-2 w-2 rounded-full bg-sky-dark animate-ping" />
                        <span>Máy đang đọc câu thoại...</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {!isRoleplayFinished ? (
            <section
              aria-label="Lượt thoại hiện tại"
              className={`rounded-[2.5rem] bg-white p-6 sm:p-8 shadow-[0_8px_0_#efe3cc] border-3 flex flex-col gap-6 ${
                currentTarget.isMyTurn
                  ? 'border-peach ring-3 ring-peach/20'
                  : 'border-sky-dark/40 bg-sky-50/20'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-banana-soft pb-4">
                <div className="flex items-center gap-3">
                  <span
                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-2xl shadow-xs ${
                      currentTarget.isMyTurn ? 'bg-peach text-white' : 'bg-sky-dark text-white'
                    }`}
                  >
                    {currentTarget.isMyTurn ? '🎙️' : '🤖'}
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`rounded-full px-3 py-0.5 text-xs font-black uppercase ${
                          currentTarget.isMyTurn
                            ? 'bg-peach-soft text-peach-dark'
                            : 'bg-sky-100 text-sky-dark'
                        }`}
                      >
                        {currentTarget.isMyTurn ? '👉 Đến lượt em nói!' : '🤖 Lượt của Máy'}
                      </span>
                      <span className="text-xs font-bold text-ink-soft">
                        Lượt {selectedDialogueIdx + 1} / {dialogueLines.length}
                      </span>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-black text-ink mt-0.5">
                      {currentTarget.isMyTurn
                        ? `Em hãy nói lời của nhân vật "${currentTarget.speaker}"`
                        : `Máy đang nói lời của "${currentTarget.speaker}"`}
                    </h3>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto">
                  {selectedDialogueIdx > 0 && (
                    <button
                      type="button"
                      onClick={() => onSelectDialogue(selectedDialogueIdx - 1)}
                      className="inline-flex items-center gap-1 rounded-xl bg-cream px-3 py-1.5 text-xs font-black text-ink hover:bg-banana-soft cursor-pointer transition-all border border-banana-soft"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      <span>Lượt trước</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={onAdvanceTurn}
                    className="inline-flex items-center gap-1 rounded-xl bg-peach-soft px-3 py-1.5 text-xs font-black text-peach-dark hover:bg-peach hover:text-white cursor-pointer transition-all border border-peach/30"
                  >
                    <span>Bỏ qua / Kế tiếp</span>
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {!currentTarget.isMyTurn ? (
                <div className="flex flex-col items-center justify-center gap-5 py-4 text-center">
                  <div className="flex flex-col items-center gap-2 max-w-xl">
                    <span className="text-xs font-bold text-sky-dark uppercase tracking-wider">
                      Câu thoại của {currentTarget.speaker}:
                    </span>
                    <p className="text-2xl sm:text-3xl font-black text-ink">
                      &quot;{currentTarget.sentenceEn}&quot;
                    </p>
                    <p className="text-base font-bold text-ink-soft">({currentTarget.meaningVi})</p>
                  </div>

                  <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => onPlayComputerLine(dialogueLines[selectedDialogueIdx])}
                      className="inline-flex min-h-12 items-center gap-2 rounded-2xl bg-sky-dark px-6 text-sm sm:text-base font-black text-white shadow-[0_4px_0_#0284c7] hover:bg-sky-600 active:translate-y-1 active:shadow-none cursor-pointer"
                    >
                      <Volume2 className="h-5 w-5" />
                      <span>🔊 Nghe lại máy nói</span>
                    </button>

                    <Button3D tone="peach" onClick={onAdvanceTurn} className="px-6 py-3 text-base">
                      <span>Tiếp tục sang lượt của em →</span>
                    </Button3D>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-6">
                  <TargetSentenceHeader
                    sentenceEn={currentTarget.sentenceEn}
                    phonetic={currentTarget.phonetic}
                    meaningVi={currentTarget.meaningVi}
                    tipsVi={currentTarget.tipsVi}
                    audio={currentTarget.audio}
                  />

                  <MicRecordButton
                    status={evaluator.recordingStatus}
                    micError={evaluator.micError}
                    idleLabel="Bấm vào chiếc Micro màu cam và đọc to lời của em"
                    doneLabel="Bấm vào chiếc Micro màu cam để luyện đọc lại câu này"
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
                    nextAction={
                      <Button3D
                        tone="mint"
                        onClick={onAdvanceTurn}
                        className="px-6 py-2.5 text-sm sm:text-base touch-manipulation select-none"
                      >
                        <span>
                          {selectedDialogueIdx + 1 < dialogueLines.length
                            ? 'Gửi câu đối đáp & Tiếp tục →'
                            : 'Hoàn thành đoạn hội thoại 🌟'}
                        </span>
                      </Button3D>
                    }
                  />
                </div>
              )}
            </section>
          ) : (
            <div className="rounded-[2.5rem] bg-gradient-to-br from-cream via-white to-banana-soft p-8 sm:p-10 border-3 border-banana text-center flex flex-col items-center gap-5 shadow-[0_8px_0_#efe3cc]">
              <span className="text-6xl animate-bounce" aria-hidden>
                🎉
              </span>
              <h3 className="text-2xl sm:text-3xl font-black text-ink">
                Chúc mừng em đã hoàn thành cuộc hội thoại cùng Máy!
              </h3>
              <p className="max-w-md text-base sm:text-lg font-bold text-ink-soft">
                Em đã xuất sắc đóng vai <strong className="text-peach-dark">{myRole}</strong> và hoàn thành
                trọn vẹn cả đoạn đối đáp SGK!
              </p>

              <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
                <Button3D tone="peach" onClick={onPlayOtherRole} className="px-6 py-3 text-base">
                  <RotateCcw className="h-4 w-4" />
                  <span>🔄 Đổi vai đóng nhân vật khác</span>
                </Button3D>
                <Button3D tone="banana" onClick={onResetRoleplay} className="px-6 py-3 text-base">
                  <span>🔁 Luyện lại từ đầu</span>
                </Button3D>
                <Button3D
                  tone="mint"
                  onClick={() => onFinishStation?.(3, 'Đã hoàn thành xuất sắc hội thoại!')}
                  className="px-6 py-3 text-base"
                >
                  <span>Hoàn thành bài học 🌟</span>
                </Button3D>
              </div>
            </div>
          )}
        </div>
      )}

      {/* CHẾ ĐỘ DANH SÁCH TỰ DO */}
      {dialogueSubMode === 'list' && (
        <div className="flex flex-col gap-4">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none pt-1">
            {dialogueLines.map((line, idx) => {
              const isSelected = selectedDialogueIdx === idx;
              return (
                <button
                  key={line.id || idx}
                  type="button"
                  onClick={() => onSelectDialogue(idx)}
                  className={`flex shrink-0 items-center gap-2 rounded-2xl px-3.5 py-2 text-xs sm:text-sm font-black transition-all cursor-pointer border-2 ${
                    isSelected
                      ? 'bg-peach text-white border-peach-dark shadow-[0_3px_0_var(--color-peach-dark)] scale-102'
                      : 'bg-cream/60 text-ink-soft border-banana-soft hover:bg-cream hover:text-ink'
                  }`}
                >
                  <span
                    className={`rounded-lg px-1.5 py-0.5 text-[11px] font-black ${
                      isSelected ? 'bg-white/30 text-white' : 'bg-white text-ink-soft'
                    }`}
                  >
                    #{idx + 1}
                  </span>
                  <span className="font-bold">{line.speaker}:</span>
                  <span className="max-w-[140px] truncate">&quot;{line.sentenceEn}&quot;</span>
                </button>
              );
            })}
          </div>

          <SpeakingPracticeCard
            ariaLabel="Luyện đọc câu"
            badge={`Lượt ${selectedDialogueIdx + 1}/${dialogueLines.length} · ${currentTarget.speaker}`}
            sentenceEn={currentTarget.sentenceEn}
            phonetic={currentTarget.phonetic}
            meaningVi={currentTarget.meaningVi}
            tipsVi={currentTarget.tipsVi}
            audio={currentTarget.audio}
            evaluator={evaluator}
            onStartRecord={onStartRecord}
          />
        </div>
      )}
    </div>
  );
}
