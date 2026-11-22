// Gate 3 v2 — auditoria de caracteres/s e cortes por bloco.
const fs = require("fs");
const path = require("path");

const base = path.resolve(__dirname, "../../..");
const variants = fs
  .readdirSync(base)
  .filter((d) => /^V\d+$/.test(d))
  .sort();

for (const v of variants) {
  const txt = fs.readFileSync(path.join(base, v, "SCRIPT.md"), "utf8");
  const rows = [];
  for (const line of txt.split(/\r?\n/)) {
    if (!line.trim().startsWith("|")) continue;
    const c = line.trim().replace(/^\|/, "").replace(/\|$/, "").split("|").map((s) => s.trim());
    const m = c[0].match(/^(\d+(?:,\d+)?)\s*[\u2013-]\s*(\d+(?:,\d+)?)/);
    if (!m) continue;
    const a = parseFloat(m[1].replace(",", "."));
    const b = parseFloat(m[2].replace(",", "."));
    const chars = c[1].length;
    rows.push({ a, b, dur: b - a, chars, cps: chars / (b - a) });
  }
  let speech = 0;
  let chars = 0;
  for (const r of rows) {
    speech += r.dur;
    chars += r.chars;
  }
  const flags = rows.filter((r) => r.cps > 14).map((r) => `${r.a}-${r.b} (${r.cps.toFixed(1)})`);
  console.log(`${v} chars ${chars} | blocos ${speech.toFixed(1)}s | ${(chars / speech).toFixed(1)} c/s | acima de 14: ${flags.join(", ") || "nenhum"}`);
  for (const r of rows) {
    if (r.cps > 13.5) console.log(`   ${r.a}-${r.b}  ${r.dur.toFixed(1)}s  ${r.chars} ch  ${r.cps.toFixed(1)} c/s`);
  }
}
