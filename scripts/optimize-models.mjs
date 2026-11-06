// Tối ưu model 3D cho web: texture tối đa 512px (webp), quantize hình học, không simplify.
// Không dùng Draco/Meshopt vì model-viewer sẽ phải tải bộ giải mã từ CDN (hỏng khi offline).
//
// Dùng: node scripts/optimize-models.mjs <thư-mục-glb-gốc> <unitN>
//   ví dụ: node scripts/optimize-models.mjs ../raw unit1  -> public/assets/models/unit1/*.glb
import { execFileSync } from 'node:child_process';
import { readdirSync, mkdirSync, statSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const [srcDir, unit] = process.argv.slice(2);
if (!srcDir || !unit) {
  console.error('Cách dùng: node scripts/optimize-models.mjs <thư-mục-glb-gốc> <unitN> [tên-file...]');
  process.exit(1);
}
const only = new Set(process.argv.slice(4));
const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const outDir = join(root, 'public', 'assets', 'models', unit);
mkdirSync(outDir, { recursive: true });
const cli = join(root, 'node_modules', '@gltf-transform', 'cli', 'bin', 'cli.js');

const MAX = 1024 * 1024;
let failed = 0;
for (const file of readdirSync(srcDir).filter((f) => f.endsWith('.glb'))) {
  if (only.size && !only.has(file.replace(/\.glb$/, ''))) continue;
  const input = resolve(srcDir, file);
  const output = join(outDir, file);
  execFileSync(
    process.execPath,
    [cli, 'optimize', input, output, '--compress', 'quantize', '--texture-compress', 'webp', '--texture-size', '512', '--simplify', 'false'],
    { stdio: 'pipe' },
  );
  const before = statSync(input).size;
  const after = statSync(output).size;
  const warn = after > MAX ? '  ⚠️ > 1MB' : '';
  if (after > MAX) failed++;
  console.log(`${file.padEnd(24)} ${(before / 1024).toFixed(0).padStart(6)}KB → ${(after / 1024).toFixed(0).padStart(5)}KB${warn}`);
}
process.exit(failed ? 1 : 0);
