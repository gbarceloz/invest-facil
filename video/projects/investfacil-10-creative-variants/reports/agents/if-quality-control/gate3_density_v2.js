// Gate 3 v2 — density and pause budget check.
// Tests the changelog claim "nenhum bloco estoura a capacidade da voz".
// Model: 14.0 spoken chars/s, 130 ms between lines, declared intentional pauses, 0.55 s end-card tail.
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..', '..');
const CALIB = 14.0;

function expand(t) {
  return t
    .replace(/R\$\s*61,39/g, 'sessenta e um vírgula trinta e nove')
    .replace(/R\$\s*100/g, 'cem reais')
    .replace(/R\$\s*78/g, 'setenta e oito reais')
    .replace(/R\$\s*61/g, 'sessenta e um reais')
    .replace(/25%/g, 'vinte e cinco por cento')
    .replace(/5%/g, 'cinco por cento')
    .replace(/10 anos/g, 'dez anos');
}

const rows = [];
for (let i = 1; i <= 10; i++) {
  const vid = 'V' + String(i).padStart(2, '0');
  const t = fs.readFileSync(path.join(ROOT, vid, 'SCRIPT.md'), 'utf8');
  const dur = +t.match(/Duração calculada:\*\*\s*(\d+)/)[1];
  let raw = 0, xp = 0, lines = 0;
  for (const l of t.split(/\r?\n/)) {
    if (!l.startsWith('| ')) continue;
    const c = l.replace(/^\||\|$/g, '').split('|').map(s => s.trim());
    if (!/^\d+,\d+–\d+,\d+$/.test(c[0])) continue;
    raw += c[1].length;
    xp += expand(c[1]).length;
    lines++;
  }
  const pauses = [...t.matchAll(/Pausa de \*\*(\d+) ms\*\*/g)].reduce((a, m) => a + +m[1], 0) / 1000;
  const speech = xp / CALIB;
  const budget = speech + (lines - 1) * 0.13 + pauses + 0.55;
  rows.push({ vid, dur, raw, xp, lines, pauses: +pauses.toFixed(2), speech: +speech.toFixed(2), budget: +budget.toFixed(2), margin: +(dur - budget).toFixed(2) });
}

// Calibration check against High Impact 01 narration (35.136 s).
const nar = fs.readFileSync(path.join(ROOT, '..', 'investfacil-high-impact-01', 'script', 'narracao.txt'), 'utf8').replace(/\s+/g, ' ').trim();
const achars = nar.length;
console.log(`H.I.01 narração: ${achars} chars / 35.136 s = ${(achars / 35.136).toFixed(2)} chars/s (inclui pausas)`);
console.log(`Modelo: ${CALIB} chars/s de fala + 130 ms entre linhas + pausas declaradas + 0.55 s de cauda\n`);

for (const r of rows) {
  const flag = r.margin < 0 ? 'ESTOURA' : r.margin < 0.6 ? 'MARGEM CRÍTICA' : r.margin < 1.2 ? 'margem curta' : 'ok';
  console.log(`${r.vid} ${r.dur}s | raw ${r.raw} | expanded ${r.xp} | lines ${r.lines} | speech ${r.speech}s | pauses ${r.pauses}s | budget ${r.budget}s | margin ${r.margin}s | ${flag}`);
}
fs.writeFileSync(path.join(__dirname, 'gate3-density-v2.json'), JSON.stringify({ calib: { chars: achars, seconds: 35.136 }, rows }, null, 1), 'utf8');
