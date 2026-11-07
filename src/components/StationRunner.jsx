import { useState } from 'react';
import { store } from '../utils/storage.js';
import { ResultScreen } from './ui.jsx';

/**
 * Chạy một trạm luyện kỹ năng (dùng ở các trang Nghe/Nói/Đọc/Viết/Ngữ pháp/Phát âm):
 * khi em làm xong thì lưu sao vào tiến độ Unit và hiện màn kết quả (làm lại / về bài học).
 */
export default function StationRunner({ Station, unit, mode }) {
  const [result, setResult] = useState(null);
  const [round, setRound] = useState(0);
  if (!unit) return null;

  if (result) {
    return (
      <ResultScreen
        stars={result.stars}
        summary={result.summary}
        backTo={`/unit/${unit.unitId}`}
        onAgain={() => {
          setResult(null);
          setRound((r) => r + 1);
        }}
      />
    );
  }

  return (
    <Station
      key={`${unit.unitId}-${round}`}
      unit={unit}
      onFinish={(stars, summary) => {
        const s = Math.max(1, Math.min(3, Number(stars) || 1));
        store().saveModeResult(unit.unitId, mode, s);
        setResult({ stars: s, summary: typeof summary === 'string' ? summary : '' });
      }}
    />
  );
}
