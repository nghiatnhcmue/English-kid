import { useState, useEffect, useMemo, useCallback } from 'react';
import { MessageCircle, BookOpen, Users } from 'lucide-react';
import confetti from 'canvas-confetti';
import { speak, stopSpeaking } from '../../utils/speech.js';
import { compareWords } from '../../utils/speechScoring.js';
import { playSfx } from '../../utils/sfx.js';
import { useSettings } from '../../settings.jsx';
import { store } from '../../utils/storage.js';
import { useSpeechEvaluator } from '../../hooks/useSpeechEvaluator.js';
import DialogueRoleplayView from './speaking/DialogueRoleplayView.jsx';
import SpeakingPracticeCard from './speaking/SpeakingPracticeCard.jsx';

export { compareWords };

export default function SpeakingStation({ unit, onFinish }) {
  const { settings } = useSettings();
  const speaking = unit?.speaking;
  const vocabularies = unit?.vocabularies || [];

  const dialogueLines = useMemo(() => speaking?.dialogueLines || [], [speaking]);

  const dialogueSpeakers = useMemo(() => {
    const set = new Set(dialogueLines.map((l) => l.speaker).filter(Boolean));
    return Array.from(set);
  }, [dialogueLines]);

  const challengeList = useMemo(() => {
    if (speaking?.challenges?.length) return speaking.challenges;
    return [
      {
        id: 'spk-fallback',
        level: 'Mẫu câu cốt lõi',
        sentenceEn: speaking?.targetSentence || 'I love English.',
        phonetic: speaking?.phonetic || '',
        meaningVi: speaking?.meaningVi || '',
        tipsVi: 'Luyện đọc to rõ từng từ và ngữ điệu tự nhiên.',
      },
    ];
  }, [speaking]);

  const [mode, setMode] = useState(() => (dialogueLines.length > 0 ? 'dialogue' : 'sentences'));
  const [dialogueSubMode, setDialogueSubMode] = useState('roleplay');
  const [myRole, setMyRole] = useState(() =>
    dialogueSpeakers.length > 1 ? dialogueSpeakers[1] : dialogueSpeakers[0] || 'Học sinh',
  );
  const [autoPlayComputer, setAutoPlayComputer] = useState(true);
  const [isComputerSpeaking, setIsComputerSpeaking] = useState(false);

  const [selectedDialogueIdx, setSelectedDialogueIdx] = useState(0);
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [selectedVocabIdx, setSelectedVocabIdx] = useState(0);

  const [turnScores, setTurnScores] = useState({});
  const [isRoleplayFinished, setIsRoleplayFinished] = useState(false);

  const evaluator = useSpeechEvaluator({
    onEvaluated: ({ scorePercent, stars, rawSpokenText, wordAnalysis, audioUrl }) => {
      if (mode === 'dialogue') {
        setTurnScores((prev) => ({
          ...prev,
          [selectedDialogueIdx]: {
            score: scorePercent,
            stars,
            spokenText: rawSpokenText,
            wordAnalysis,
            audioUrl,
          },
        }));
      }
      store().recordStationProgress(unit.unitId, 'speaking', {
        score: scorePercent,
        stars,
        correct: scorePercent >= 50,
      });
    },
  });

  const currentTarget = useMemo(() => {
    if (mode === 'dialogue') {
      const item = dialogueLines[selectedDialogueIdx] || dialogueLines[0] || {};
      const prevLine = selectedDialogueIdx > 0 ? dialogueLines[selectedDialogueIdx - 1] : null;
      return {
        sentenceEn: item.sentenceEn || '',
        phonetic: item.phonetic || '',
        meaningVi: item.meaningVi || '',
        tipsVi: item.tipsVi || '',
        speaker: item.speaker || 'Nhân vật',
        isMyTurn: item.speaker === myRole,
        prevLine,
        dialogue: prevLine ? { speaker: prevLine.speaker, prompt: prevLine.sentenceEn } : null,
        level: `Lượt ${selectedDialogueIdx + 1}/${dialogueLines.length}`,
        audio: item.audio || null,
      };
    }
    if (mode === 'sentences') {
      const item = challengeList[selectedIdx] || challengeList[0] || {};
      return {
        sentenceEn: item.sentenceEn || '',
        phonetic: item.phonetic || '',
        meaningVi: item.meaningVi || '',
        tipsVi: item.tipsVi || '',
        speaker: item.dialogue?.speaker || null,
        isMyTurn: true,
        prevLine: null,
        dialogue: item.dialogue || null,
        level: item.level || `Mẫu câu ${selectedIdx + 1}`,
        audio: item.audio || null,
      };
    }
    const v = vocabularies[selectedVocabIdx] || vocabularies[0] || {};
    return {
      sentenceEn: v?.word || '',
      phonetic: v?.phonetic || '',
      meaningVi: v?.meaning || '',
      tipsVi: `Loại từ: [${v?.wordType || 'từ vựng'}] · Ví dụ: "${v?.exampleEn || ''}"`,
      speaker: null,
      isMyTurn: true,
      prevLine: null,
      dialogue: null,
      level: `Từ vựng ${selectedVocabIdx + 1}/${vocabularies.length}`,
      audio: v?.audio || null,
    };
  }, [mode, selectedDialogueIdx, selectedIdx, selectedVocabIdx, dialogueLines, challengeList, vocabularies, myRole]);

  const playComputerLine = useCallback(
    async (line) => {
      if (!line) return;
      setIsComputerSpeaking(true);
      try {
        await speak(line.sentenceEn, {
          lang: settings.lang || 'en-GB',
          audio: line.audio || null,
        });
      } finally {
        setIsComputerSpeaking(false);
      }
    },
    [settings.lang],
  );

  useEffect(() => {
    if (mode !== 'dialogue' || dialogueSubMode !== 'roleplay' || isRoleplayFinished) return undefined;
    const item = dialogueLines[selectedDialogueIdx];
    if (!item || item.speaker === myRole || !autoPlayComputer) return undefined;

    const timer = setTimeout(() => {
      playComputerLine(item);
    }, 350);
    return () => clearTimeout(timer);
  }, [
    mode,
    dialogueSubMode,
    selectedDialogueIdx,
    myRole,
    autoPlayComputer,
    dialogueLines,
    isRoleplayFinished,
    playComputerLine,
  ]);

  const handleChangeRole = (newRole) => {
    playSfx('click');
    stopSpeaking();
    setMyRole(newRole);
    setSelectedDialogueIdx(0);
    setTurnScores({});
    setIsRoleplayFinished(false);
    evaluator.reset();
  };

  const handleSelectDialogue = (idx) => {
    playSfx('click');
    stopSpeaking();
    setSelectedDialogueIdx(idx);
    evaluator.reset();
    const prevTurn = turnScores[idx];
    if (prevTurn) {
      evaluator.hydrateResult({
        scorePercent: prevTurn.score,
        stars: prevTurn.stars,
        spokenText: prevTurn.spokenText,
        wordAnalysis: prevTurn.wordAnalysis,
        audioUrl: prevTurn.audioUrl,
        targetSentence: dialogueLines[idx]?.sentenceEn,
      });
    }
  };

  const handleSelectSentence = (idx) => {
    playSfx('click');
    stopSpeaking();
    setSelectedIdx(idx);
    evaluator.reset();
  };

  const handleSelectVocab = (idx) => {
    playSfx('click');
    stopSpeaking();
    setSelectedVocabIdx(idx);
    evaluator.reset();
  };

  const advanceDialogueTurn = () => {
    playSfx('click');
    stopSpeaking();
    if (selectedDialogueIdx + 1 < dialogueLines.length) {
      handleSelectDialogue(selectedDialogueIdx + 1);
    } else {
      setIsRoleplayFinished(true);
      confetti({ particleCount: 70, spread: 80, origin: { y: 0.6 } });
      playSfx('victory');

      const scores = Object.values(turnScores).map((t) => t.score);
      const avgScore = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 85;
      const earnedStars = avgScore >= 80 ? 3 : avgScore >= 50 ? 2 : 1;

      store().recordStationProgress(unit.unitId, 'speaking', {
        score: avgScore,
        stars: earnedStars,
        correct: true,
      });
    }
  };

  const switchMode = (nextMode) => {
    playSfx('click');
    stopSpeaking();
    setMode(nextMode);
    evaluator.reset();
  };

  const handleStartRecord = () => {
    evaluator.startRecord(currentTarget.sentenceEn, {
      onBeforeStart: () => setIsComputerSpeaking(false),
    });
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 rounded-[2rem] bg-gradient-to-r from-peach-soft via-cream to-banana-soft p-5 sm:p-6 shadow-[0_6px_0_#efe3cc] border-3 border-peach/30">
        <div>
          <span className="rounded-full bg-peach text-white px-3 py-1 text-xs font-black uppercase shadow-2xs">
            {speaking?.situationalTopic || 'Everyday English · Luyện Nói Giao Tiếp'}
          </span>
          <h2 className="mt-2 text-2xl sm:text-3xl font-black text-ink">
            🎙️ Phòng Luyện Nói & Chấm Điểm AI
          </h2>
          <p className="mt-1 text-sm sm:text-base font-bold text-ink-soft">
            Luyện đối đáp phân vai SGK cùng Máy, mẫu câu giao tiếp và từ vựng chuẩn bản xứ
          </p>
        </div>

        <div className="flex flex-wrap shrink-0 gap-1.5 rounded-2xl bg-white/90 p-1.5 border border-banana-soft shadow-xs">
          {dialogueLines.length > 0 && (
            <button
              type="button"
              onClick={() => switchMode('dialogue')}
              className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs sm:text-sm font-black transition-all cursor-pointer ${
                mode === 'dialogue'
                  ? 'bg-peach text-white shadow-xs scale-102'
                  : 'text-ink-soft hover:bg-cream hover:text-ink'
              }`}
            >
              <Users className="h-4 w-4" />
              <span>💬 Hội thoại SGK ({dialogueLines.length})</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => switchMode('sentences')}
            className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs sm:text-sm font-black transition-all cursor-pointer ${
              mode === 'sentences'
                ? 'bg-peach text-white shadow-xs scale-102'
                : 'text-ink-soft hover:bg-cream hover:text-ink'
            }`}
          >
            <MessageCircle className="h-4 w-4" />
            <span>🌟 Mẫu câu ({challengeList.length})</span>
          </button>

          <button
            type="button"
            onClick={() => switchMode('vocab')}
            className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs sm:text-sm font-black transition-all cursor-pointer ${
              mode === 'vocab'
                ? 'bg-banana text-ink shadow-xs scale-102'
                : 'text-ink-soft hover:bg-cream hover:text-ink'
            }`}
          >
            <BookOpen className="h-4 w-4" />
            <span>📖 Từ vựng ({vocabularies.length})</span>
          </button>
        </div>
      </div>

      {mode === 'dialogue' && (
        <DialogueRoleplayView
          speaking={speaking}
          dialogueLines={dialogueLines}
          dialogueSpeakers={dialogueSpeakers}
          dialogueSubMode={dialogueSubMode}
          setDialogueSubMode={setDialogueSubMode}
          myRole={myRole}
          onChangeRole={handleChangeRole}
          autoPlayComputer={autoPlayComputer}
          setAutoPlayComputer={setAutoPlayComputer}
          isComputerSpeaking={isComputerSpeaking}
          selectedDialogueIdx={selectedDialogueIdx}
          onSelectDialogue={handleSelectDialogue}
          turnScores={turnScores}
          isRoleplayFinished={isRoleplayFinished}
          onResetRoleplay={() => {
            setSelectedDialogueIdx(0);
            setTurnScores({});
            setIsRoleplayFinished(false);
            evaluator.reset();
          }}
          onPlayOtherRole={() => {
            const other = dialogueSpeakers.filter((s) => s !== myRole)[0] || myRole;
            handleChangeRole(other);
          }}
          onAdvanceTurn={advanceDialogueTurn}
          onPlayComputerLine={playComputerLine}
          currentTarget={currentTarget}
          evaluator={evaluator}
          onStartRecord={handleStartRecord}
          onFinishStation={onFinish}
        />
      )}

      {mode === 'sentences' && (
        <div className="flex flex-col gap-5">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
            {challengeList.map((item, idx) => {
              const isSelected = selectedIdx === idx;
              return (
                <button
                  key={item.id || idx}
                  type="button"
                  onClick={() => handleSelectSentence(idx)}
                  className={`flex flex-col items-start rounded-2xl p-3 text-left transition-all cursor-pointer border-2 ${
                    isSelected
                      ? 'bg-peach text-white border-peach-dark shadow-[0_4px_0_var(--color-peach-dark)] scale-102'
                      : 'bg-white text-ink border-banana-soft hover:bg-cream hover:border-banana shadow-2xs'
                  }`}
                >
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-black uppercase ${
                      isSelected ? 'bg-white/30 text-white' : 'bg-cream text-ink-soft'
                    }`}
                  >
                    {item.level || `Câu ${idx + 1}`}
                  </span>
                  <span className="mt-1 text-xs sm:text-sm font-black line-clamp-2 leading-snug">
                    {item.sentenceEn}
                  </span>
                </button>
              );
            })}
          </div>

          <SpeakingPracticeCard
            ariaLabel="Luyện nói mẫu câu"
            badge={currentTarget.level}
            sentenceEn={currentTarget.sentenceEn}
            phonetic={currentTarget.phonetic}
            meaningVi={currentTarget.meaningVi}
            tipsVi={currentTarget.tipsVi}
            audio={currentTarget.audio}
            dialoguePrompt={currentTarget.dialogue}
            evaluator={evaluator}
            onStartRecord={handleStartRecord}
            hasPrev={selectedIdx > 0}
            prevLabel="Câu trước"
            onPrev={() => handleSelectSentence(selectedIdx - 1)}
            hasNext={selectedIdx + 1 < challengeList.length}
            nextLabel="Sang câu tiếp theo →"
            onNext={() => handleSelectSentence(selectedIdx + 1)}
            onFinish={() => onFinish?.(3, 'Đã hoàn thành mẫu câu!')}
          />
        </div>
      )}

      {mode === 'vocab' && (
        <div className="flex flex-col gap-5">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
            {vocabularies.map((v, idx) => {
              const isSelected = selectedVocabIdx === idx;
              return (
                <button
                  key={v.id || idx}
                  type="button"
                  onClick={() => handleSelectVocab(idx)}
                  className={`flex shrink-0 items-center gap-2 rounded-2xl px-4 py-2 text-sm font-black transition-all cursor-pointer border ${
                    isSelected
                      ? 'bg-banana text-ink border-banana-dark shadow-[0_3px_0_#d8b13c] scale-105'
                      : 'bg-white text-ink-soft border-banana-soft hover:bg-cream hover:text-ink'
                  }`}
                >
                  <span>{v.emoji || '💬'}</span>
                  <span>{v.word}</span>
                </button>
              );
            })}
          </div>

          <SpeakingPracticeCard
            ariaLabel="Luyện nói từ vựng"
            badge={currentTarget.level}
            badgeTone="banana"
            sentenceEn={currentTarget.sentenceEn}
            quoted={false}
            phonetic={currentTarget.phonetic}
            meaningVi={currentTarget.meaningVi}
            tipsVi={currentTarget.tipsVi}
            tipsLabel="Thông tin từ vựng"
            audio={currentTarget.audio}
            micTone="banana"
            idleLabel="Bấm micro để đọc từ này"
            doneLabel="Bấm micro để đọc lại từ này"
            recordingLabel="Đang thu âm từ vựng..."
            evaluator={evaluator}
            onStartRecord={handleStartRecord}
            hasPrev={selectedVocabIdx > 0}
            prevLabel="Từ trước"
            onPrev={() => handleSelectVocab(selectedVocabIdx - 1)}
            hasNext={selectedVocabIdx + 1 < vocabularies.length}
            nextLabel="Sang từ tiếp theo →"
            nextTone="banana"
            onNext={() => handleSelectVocab(selectedVocabIdx + 1)}
            onFinish={() => onFinish?.(3, 'Đã hoàn thành từ vựng!')}
          />
        </div>
      )}
    </div>
  );
}
