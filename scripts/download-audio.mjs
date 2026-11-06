import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const units = Array.from({ length: 12 }, (_, i) => ({
  id: i + 1,
  file: path.join(rootDir, `src/data/unit${i + 1}.json`),
  dir: `unit${i + 1}`,
}));

function slugify(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

async function fetchAudio(url) {
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });
    if (!res.ok) return null;
    const buf = await res.arrayBuffer();
    if (buf.byteLength < 500) return null; // quá nhỏ hoặc lỗi
    return Buffer.from(buf);
  } catch (err) {
    return null;
  }
}

async function getWordAudio(wordText) {
  // 1. Thử Youdao UK voice (giọng người bản xứ đọc từ điển chất lượng cao)
  const youdaoUrl = `https://dict.youdao.com/dictvoice?audio=${encodeURIComponent(wordText)}&type=1`;
  let buf = await fetchAudio(youdaoUrl);
  if (buf) return buf;

  // 2. Fallback sang Google TTS giọng Anh - Anh
  const googleUrl = `https://translate.google.com/translate_tts?ie=UTF-8&tl=en-GB&client=tw-ob&q=${encodeURIComponent(wordText)}`;
  buf = await fetchAudio(googleUrl);
  if (buf) return buf;

  // 3. Fallback sang DictionaryAPI nếu có
  try {
    const dictApiRes = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(wordText)}`);
    if (dictApiRes.ok) {
      const data = await dictApiRes.json();
      const audioUrl = data[0]?.phonetics?.find((p) => p.audio)?.audio;
      if (audioUrl) {
        buf = await fetchAudio(audioUrl);
        if (buf) return buf;
      }
    }
  } catch {}

  return null;
}

async function getSentenceAudio(sentenceText) {
  const googleUrl = `https://translate.google.com/translate_tts?ie=UTF-8&tl=en-GB&client=tw-ob&q=${encodeURIComponent(sentenceText)}`;
  return await fetchAudio(googleUrl);
}

async function main() {
  console.log('🔊 Bắt đầu tải âm thanh chất lượng cao cho từ vựng và câu văn...');

  for (const u of units) {
    const targetDir = path.join(rootDir, 'public/assets/audio', u.dir);
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    const data = JSON.parse(fs.readFileSync(u.file, 'utf-8'));
    console.log(`\n📚 Đang xử lý Unit ${u.id} (${data.vocabularies.length} từ)...`);

    for (const v of data.vocabularies) {
      const slug = slugify(v.word);
      const wordAudioPath = path.join(targetDir, `${slug}.mp3`);
      const exampleAudioPath = path.join(targetDir, `${slug}-example.mp3`);

      // Tải âm thanh từ vựng
      if (!fs.existsSync(wordAudioPath)) {
        process.stdout.write(`  - Tải từ: "${v.word}"... `);
        const buf = await getWordAudio(v.word);
        if (buf) {
          fs.writeFileSync(wordAudioPath, buf);
          console.log(`✓ (${buf.byteLength} bytes)`);
        } else {
          console.log(`✗ Thất bại`);
        }
        await new Promise((r) => setTimeout(r, 120)); // tránh rate-limit
      } else {
        console.log(`  - Từ "${v.word}" đã có sẵn ✓`);
      }
      v.audio = `/assets/audio/${u.dir}/${slug}.mp3`;

      // Tải âm thanh câu ví dụ (nếu có)
      if (v.exampleEn) {
        if (!fs.existsSync(exampleAudioPath)) {
          process.stdout.write(`    Ví dụ: "${v.exampleEn.slice(0, 30)}..." `);
          const buf = await getSentenceAudio(v.exampleEn);
          if (buf) {
            fs.writeFileSync(exampleAudioPath, buf);
            console.log(`✓ (${buf.byteLength} bytes)`);
          } else {
            console.log(`✗ Thất bại`);
          }
          await new Promise((r) => setTimeout(r, 120));
        }
        v.audioExample = `/assets/audio/${u.dir}/${slug}-example.mp3`;
      }
    }

    // Tải âm thanh bài nghe Listening
    if (data.listening && data.listening.transcript) {
      const listeningPath = path.join(targetDir, 'listening.mp3');
      if (!fs.existsSync(listeningPath)) {
        process.stdout.write(`  - Tải bài nghe: "${data.listening.transcript.slice(0, 30)}..." `);
        const buf = await getSentenceAudio(data.listening.transcript);
        if (buf) {
          fs.writeFileSync(listeningPath, buf);
          console.log(`✓ (${buf.byteLength} bytes)`);
        } else {
          console.log(`✗ Thất bại`);
        }
        await new Promise((r) => setTimeout(r, 120));
      }
      data.listening.audio = `/assets/audio/${u.dir}/listening.mp3`;
    }

    // Tải âm thanh bài nói Speaking Target
    if (data.speaking && data.speaking.targetSentence) {
      const speakingPath = path.join(targetDir, 'speaking-target.mp3');
      if (!fs.existsSync(speakingPath)) {
        process.stdout.write(`  - Tải câu nói: "${data.speaking.targetSentence}" `);
        const buf = await getSentenceAudio(data.speaking.targetSentence);
        if (buf) {
          fs.writeFileSync(speakingPath, buf);
          console.log(`✓ (${buf.byteLength} bytes)`);
        } else {
          console.log(`✗ Thất bại`);
        }
        await new Promise((r) => setTimeout(r, 120));
      }
      data.speaking.audio = `/assets/audio/${u.dir}/speaking-target.mp3`;
    }

    // Tải âm thanh các thử thách Speaking
    if (data.speaking && Array.isArray(data.speaking.challenges)) {
      for (let cIdx = 0; cIdx < data.speaking.challenges.length; cIdx++) {
        const ch = data.speaking.challenges[cIdx];
        if (ch.sentenceEn) {
          const chPath = path.join(targetDir, `speaking-ch${cIdx + 1}.mp3`);
          if (!fs.existsSync(chPath)) {
            process.stdout.write(`    Thử thách ${cIdx + 1}: "${ch.sentenceEn.slice(0, 25)}..." `);
            const buf = await getSentenceAudio(ch.sentenceEn);
            if (buf) {
              fs.writeFileSync(chPath, buf);
              console.log(`✓ (${buf.byteLength} bytes)`);
            } else {
              console.log(`✗ Thất bại`);
            }
            await new Promise((r) => setTimeout(r, 120));
          }
          ch.audio = `/assets/audio/${u.dir}/speaking-ch${cIdx + 1}.mp3`;
        }
      }
    }

    fs.writeFileSync(u.file, JSON.stringify(data, null, 2), 'utf-8');
    console.log(`💾 Đã cập nhật xong dữ liệu ${u.file}`);
  }

  console.log('\n🎉 Hoàn thành toàn bộ quá trình tải âm thanh!');
}

main().catch(console.error);

