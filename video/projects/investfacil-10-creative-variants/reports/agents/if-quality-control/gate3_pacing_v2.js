// Gate 3 QC — narration pacing estimator v2 (Node).
// Expands numbers to their spoken form in pt-BR before counting, because
// "5%" is spoken "cinco por cento" (4 words), not 1 token.
// Calibration from High Impact 01: 8 sentences, ~95 spoken words, 35.136 s
// => 2.70 spoken words/second with Thalita at -12%.
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..', '..');
const CALIB = 2.70;

function expand(t) {
  return t
    .replace(/R\$\s*61,39/g, 'sessenta e um vírgula trinta e nove')
    .replace(/R\$\s*100/g, 'cem reais')
    .replace(/R\$\s*78/g, 'setenta e oito reais')
    .replace(/R\$\s*61/g, 'sessenta e um reais')
    .replace(/25%/g, 'vinte e cinco por cento')
    .replace(/5%/g, 'cinco por cento')
    .replace(/10 anos/g, 'dez anos')
    .replace(/30 segundos/g, 'trinta segundos');
}

function words(t) {
  return (expand(t).replace(/–/g, ' ').match(/[A-Za-zÀ-ÿ0-9]+/g) || []);
}

const out = [];
for (let i = 1; i <= 10; i++) {
  const vid = 'V' + String(i).padStart(2, '0');
  const txt = fs.readFileSync(path.join(ROOT, vid, 'SCRIPT.md'), 'utf8');
  let totalWords = 0, totalSec = 0;
  const flags = [];
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
    const wps = dur ? n / dur : 0;
    if (wps >= 3.0) {
      flags.push({
        time: cells[0], dur, spokenWords: n, wps: +wps.toFixed(2),
        neededAtCalib: +(n / CALIB).toFixed(1),
        text: cells[1],
      });
    }
  }
  const target = +txt.match(/\*\*Duração-alvo:\*\*\s*(\d+)/)[1];
  out.push({
    vid, target, scriptSpan: +totalSec.toFixed(1), spokenWords: totalWords,
    avgWps: +(totalWords / totalSec).toFixed(2),
    minRuntimeAtCalib: +(totalWords / CALIB).toFixed(1),
    slack: +(totalSec - totalWords / CALIB).toFixed(1),
    overload: flags,
  });
}

for (const r of out) {
  console.log(`\n${r.vid} target=${r.target}s span=${r.scriptSpan}s spoken=${r.spokenWords} avg=${r.avgWps} w/s | min at 2.70 w/s = ${r.minRuntimeAtCalib}s (slack ${r.slack}s)`);
  for (const f of r.overload) {
    console.log(`  OVER ${f.time} dur=${f.dur}s spoken=${f.spokenWords} ${f.wps} w/s -> needs ${f.neededAtCalib}s | ${f.text}`);
  }
}
fs.writeFileSync(path.join(__dirname, 'gate3-pacing.json'), JSON.stringify(out, null, 1), 'utf8');
