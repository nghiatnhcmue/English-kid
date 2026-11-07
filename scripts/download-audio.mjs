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

export function isMp3(buf) {
  if (!buf || buf.length < 4) return false;
  if (buf.slice(0, 3).toString('latin1') === 'ID3') return true;
  return buf[0] === 0xff && (buf[1] & 0xe0) === 0xe0; // MPEG frame sync
}

function isUsableMp3(file) {
  if (!fs.existsSync(file)) return false;
  const fd = fs.openSync(file, 'r');
  const head = Buffer.alloc(4);
  fs.readSync(fd, head, 0, 4, 0);
  fs.closeSync(fd);
  return isMp3(head);
}

// Chọn file đích: giữ file đang dùng nếu là mp3 hợp lệ; nếu là WAV/hỏng thì ghi sang tên mới -v2
// (tên mới để vượt qua cache "immutable" 1 năm trên thiết bị học sinh).
function pickTarget(dir, unitDir, currentUrl, baseName) {
  const candidates = [];
  if (currentUrl && currentUrl.startsWith(`/assets/audio/${unitDir}/`)) candidates.push(path.basename(currentUrl));
  candidates.push(`${baseName}.mp3`, `${baseName}-v2.mp3`, `${baseName}-v3.mp3`);
  for (const name of candidates) {
    if (isUsableMp3(path.join(dir, name))) return { name, exists: true };
  }
  const free = candidates.find((n) => !fs.existsSync(path.join(dir, n))) || `${baseName}-v9.mp3`;
  return { name: free, exists: false };
}

async function fetchAudio(url) {
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });
    if (!res.ok) return null;
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.byteLength < 500) return null; // quá nhỏ hoặc lỗi
    // Chỉ nhận mp3 thật (Youdao đôi khi trả WAV → Safari/iOS không phát được khi mang đuôi .mp3)
    if (!isMp3(buf)) return null;
    return buf;
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
      const tasks = [
        { field: 'audio', base: slug, text: v.word, get: getWordAudio, label: 'Từ' },
        v.exampleEn && { field: 'audioExample', base: `${slug}-example`, text: v.exampleEn, get: getSentenceAudio, label: 'Ví dụ' },
      ].filter(Boolean);
      for (const t of tasks) {
        const target = pickTarget(targetDir, u.dir, v[t.field], t.base);
        if (!target.exists) {
          process.stdout.write(`  - ${t.label}: "${t.text.slice(0, 40)}" → ${target.name} `);
          const buf = await t.get(t.text);
          if (buf) {
            fs.writeFileSync(path.join(targetDir, target.name), buf);
            console.log(`✓ (${buf.byteLength} bytes)`);
          } else {
            console.log('✗ Thất bại');
            continue;
          }
          await new Promise((r) => setTimeout(r, 150)); // tránh rate-limit
        }
        v[t.field] = `/assets/audio/${u.dir}/${target.name}`;
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

    fs.writeFileSync(u.file, JSON.stringify(data, null, 2) + '\n', 'utf-8');
    console.log(`💾 Đã cập nhật xong dữ liệu ${u.file}`);
  }

  console.log('\n🎉 Hoàn thành toàn bộ quá trình tải âm thanh!');
}

if (process.argv[1] && path.resolve(process.argv[1]) === __filename) main().catch(console.error);

