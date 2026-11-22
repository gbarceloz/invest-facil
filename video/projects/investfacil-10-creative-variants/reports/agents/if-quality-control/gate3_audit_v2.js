// Independent re-implementation of scripts/audit_gate3_docs.py (Python unavailable on PATH).
// Purpose: verify the claimed 217 checks / 0 failures without trusting the producer's log.
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..', '..');
const IDS = Array.from({ length: 10 }, (_, i) => 'V' + String(i + 1).padStart(2, '0'));
const FILES = ['CONCEPT.md', 'SCRIPT.md', 'STORYBOARD.md', 'EDITING_TIMELINE.md', 'SOUND_DESIGN.md', 'RETENTION_MAP.md', 'QUALITY_CHECKLIST.md'];
const BANNED = [
  'energia média-alta', 'Conheça a plataforma', 'Fechar em 40 s', 'Fechar em 35 s',
  'Fechar em 30 s', 'uma cadeira', 'agora com preço maior', 'dois itens saem',
  'números verificáveis', 'O ponto não é quanto você tem',
];

let fail = 0;
const results = [];
function check(name, cond, detail = '') {
  if (!cond) fail++;
  results.push(`${cond ? 'PASS' : 'FAIL'} | ${name}${detail ? ' | ' + detail : ''}`);
}
const read = (p) => fs.readFileSync(p, 'utf8');

for (const vid of IDS) {
  const existing = FILES.filter(f => fs.existsSync(path.join(ROOT, vid, f)));
  check(`${vid} 7 docs`, existing.length === 7, existing.join(','));
}

for (const vid of IDS) {
  const texts = {};
  for (const name of FILES) {
    const p = path.join(ROOT, vid, name);
    if (fs.existsSync(p)) texts[name] = read(p);
  }
  const all = Object.values(texts).join('\n');
  for (const phrase of BANNED) check(`${vid} no stale '${phrase.slice(0, 32)}'`, !all.includes(phrase));

  const concept = texts['CONCEPT.md'] || '';
  const script = texts['SCRIPT.md'] || '';
  const story = texts['STORYBOARD.md'] || '';
  const editing = texts['EDITING_TIMELINE.md'] || '';
  const sound = texts['SOUND_DESIGN.md'] || '';

  check(`${vid} concepto tem duração calculada`, concept.includes('Duração calculada'));
  check(`${vid} script tem direção de voz`, script.includes('## Direção de voz'));
  check(`${vid} script tem pausas`, script.includes('## Pausas e ênfases'));
  check(`${vid} editing tem cortes internos`, editing.includes('Cortes internos planejados'));
  check(`${vid} storyboard tem disclaimer`, story.includes('Conteúdo educacional. Não é recomendação de investimento.'));
  check(`${vid} storyboard tem safe zone TikTok`, story.includes('120 px à direita'));
  check(`${vid} sound tem ducking`, sound.includes('attack 150 ms'));
  check(`${vid} sound tem limite de SFX`, sound.includes('no máximo 1 acento a cada 2 s'));
}

check('V03 hook corrigido', read(path.join(ROOT, 'V03', 'CONCEPT.md')).includes('A nota entra inteira. O que ela compra, não.'));
check('V06 hook corrigido', read(path.join(ROOT, 'V06', 'CONCEPT.md')).includes('Seu salário subiu. Então por que o mês continua apertado?'));
check('V04 shot 4/5 corrigido', read(path.join(ROOT, 'V04', 'STORYBOARD.md')).includes('um item sai; restam quatro de cinco'));
check('V02 shot sem preço maior', !read(path.join(ROOT, 'V02', 'STORYBOARD.md')).includes('agora com preço maior'));
check('V09 qualifica imposto', read(path.join(ROOT, 'V09', 'SCRIPT.md')).includes('Não é imposto literal'));

const matrix = read(path.join(ROOT, 'reports', 'CREATIVE_CONCEPTS_MATRIX.md'));
check('matriz 10 IDs', IDS.every(v => matrix.includes(`| ${v} |`)));
for (const vid of IDS) {
  const n = matrix.split(`| ${vid} |`).length - 1;
  check(`matriz ${vid} 1 ocorrência no núcleo`, n >= 3, String(n));
}

const lines = new Map();
for (const vid of IDS) {
  const script = read(path.join(ROOT, vid, 'SCRIPT.md'));
  for (const line of script.split(/\r?\n/)) {
    if (line.startsWith('| ') && line.includes('–') && (line.split('|').length - 1) >= 7) {
      const cells = line.replace(/^\||\|$/g, '').split('|').map(c => c.trim());
      if (cells.length >= 2 && cells[1] && !cells[1].startsWith('Narração')) {
        if (!lines.has(cells[1])) lines.set(cells[1], []);
        lines.get(cells[1]).push(vid);
      }
    }
  }
}
const dupes = {};
for (const [text, vids] of lines) if (vids.length >= 3) dupes[text] = vids;
check('Nenhuma fala idêntica em 3+ vídeos', Object.keys(dupes).length === 0, JSON.stringify(dupes));

for (const vid of IDS) {
  const script = read(path.join(ROOT, vid, 'SCRIPT.md'));
  const rows = script.split(/\r?\n/).filter(l => l.startsWith('| ') && l.includes('–'));
  const unlabeled = [];
  for (const row of rows) {
    const cells = row.replace(/^\||\|$/g, '').split('|').map(c => c.trim());
    if (cells.length >= 3 && /5%|25%|R\$ 61|cerca de 61/.test(cells[1])) {
      if (!cells[2].toUpperCase().includes('SIMULA')) unlabeled.push(cells[0]);
    }
  }
  check(`${vid} simulações rotuladas`, unlabeled.length === 0, unlabeled.join(','));
}

console.log(results.filter(r => r.startsWith('FAIL')).join('\n'));
console.log(`\nTOTAL ${results.length} checks, ${fail} failures`);
fs.writeFileSync(path.join(__dirname, 'gate3-audit-v2.out.txt'), results.join('\n') + `\n\nTOTAL ${results.length} checks, ${fail} failures\n`, 'utf8');
