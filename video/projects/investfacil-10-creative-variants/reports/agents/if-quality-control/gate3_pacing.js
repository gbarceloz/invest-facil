// Gate 3 QC — narration pacing estimator (Node).
// Calibration: High Impact 01 Thalita narration = ~95 words / 35.136 s = 2.70 w/s.
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..', '..');
const out = [];

function words(t) {
  return (t.replace(/–/g, ' ').match(/[A-Za-zÀ-ÿ0-9%$]+/g) || [])
    .filter(w => /[A-Za-zÀ-ÿ0-9]/.test(w));
}

for (let i = 1; i <= 10; i++) {
  const vid = 'V' + String(i).padStart(2, '0');
  const txt = fs.readFileSync(path.join(ROOT, vid, 'SCRIPT.md'), 'utf8');
  let totalWords = 0, totalSec = 0;
  const segs = [], overload = [];
  for (const line of txt.split(/\r?\n/)) {
    const s = line.trim();
    if (!s.startsWith('|')) continue;
    const cells = s.replace(/^\||\|$/g, '').split('|').map(c => c.trim());
    if (cells.length < 3) continue;
    const m = cells[0].match(/^(\d+),(\d+)\s*[–-]\s*(\d+),(\d+)$/);
    if (!m) continue;
    const a = parseFloat(`${m[1]}.${m[2]}`);
    const b = parseFloat(`${m[3]}.${m[4]}`);
    const dur = +(b - a).toFixed(2);
    const n = words(cells[1]).length;
    totalWords += n;
    totalSec += dur;
    const wps = dur ? +(n / dur).toFixed(2) : 0;
    segs.push([cells[0], dur, n, wps]);
    if (wps >= 3.2) overload.push([cells[0], dur, n, wps, cells[1]]);
  }
  out.push({ vid, scriptSpan: +totalSec.toFixed(1), words: totalWords, avgWps: +(totalWords / totalSec).toFixed(2), overload });
}

for (const r of out) {
  console.log(`\n${r.vid}: span=${r.scriptSpan}s words=${r.words} avg=${r.avgWps} w/s`);
  for (const w of r.overload) console.log(`  ${w[0]} dur=${w[1]}s words=${w[2]} ${w[3]} w/s | ${w[4]}`);
}
fs.writeFileSync(path.join(__dirname, 'gate3-pacing.json'), JSON.stringify(out, null, 1), 'utf8');
