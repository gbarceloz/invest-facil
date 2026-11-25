#!/usr/bin/env node
/**
 * Sincroniza os vídeos do Módulo 01 para o diretório público do frontend.
 *
 * Origem padrão: video/out/new/module-01 (ou MODULE01_VIDEO_SOURCE)
 * Destino:       frontend/public/videos/module-01
 *
 * Mapeamento:
 *   NN-<slug>.mp4            -> <slug>.mp4
 *   NN-<slug>.srt            -> <slug>.srt
 *   NN-<slug>.thumbnail.jpg  -> <slug>.jpg
 *   NN-<slug>.srt            -> <slug>.vtt  (conversão para WebVTT)
 *
 * Arquivos ausentes são ignorados com aviso; o script não quebra.
 */
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  statSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const MODULE01_SLUGS = [
  "o-que-e-dinheiro",
  "por-que-o-dinheiro-tem-valor",
  "como-o-dinheiro-surgiu",
  "o-que-e-inflacao",
  "por-que-100-hoje-nao-vale-o-mesmo-no-futuro",
  "o-que-e-poder-de-compra",
  "o-que-sao-juros",
  "juros-simples-vs-compostos",
];

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, "../..");
const sourceDir = process.env.MODULE01_VIDEO_SOURCE
  ? path.resolve(process.env.MODULE01_VIDEO_SOURCE)
  : path.join(repoRoot, "video", "out", "new", "module-01");
const destinationDir = path.join(repoRoot, "frontend", "public", "videos", "module-01");

/**
 * Converte SRT em WebVTT:
 * - cabeçalho WEBVTT;
 * - remove a numeração dos cues;
 * - timestamps com ponto no lugar da vírgula.
 */
export function srtToVtt(input) {
  const normalized = input
    .replace(/^\uFEFF/, "")
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .trimEnd();
  const lines = normalized.split("\n");
  const output = [];

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    const next = lines[index + 1] ?? "";
    if (/^\d+$/.test(line.trim()) && next.includes("-->")) {
      continue;
    }
    if (line.includes("-->")) {
      output.push(line.replace(/(\d{2}:\d{2}:\d{2}),(\d{3})/g, "$1.$2"));
      continue;
    }
    output.push(line);
  }

  return `WEBVTT\n\n${output.join("\n").replace(/\n{3,}/g, "\n\n").trim()}\n`;
}

mkdirSync(destinationDir, { recursive: true });

let copied = 0;
let converted = 0;
let skipped = 0;

console.log(`[module-01] origem:  ${sourceDir}`);
console.log(`[module-01] destino: ${destinationDir}`);

MODULE01_SLUGS.forEach((slug, index) => {
  const prefix = String(index + 1).padStart(2, "0");
  const files = [
    [`${prefix}-${slug}.mp4`, `${slug}.mp4`],
    [`${prefix}-${slug}.srt`, `${slug}.srt`],
    [`${prefix}-${slug}.thumbnail.jpg`, `${slug}.jpg`],
  ];

  for (const [from, to] of files) {
    const source = path.join(sourceDir, from);
    const destination = path.join(destinationDir, to);
    if (!existsSync(source) || !statSync(source).isFile()) {
      skipped += 1;
      console.warn(`[skip] ${from} ainda não existe`);
      continue;
    }
    copyFileSync(source, destination);
    copied += 1;
    console.log(`[copy] ${from} -> public/videos/module-01/${to}`);
  }

  const srtSource = path.join(sourceDir, `${prefix}-${slug}.srt`);
  const vttDestination = path.join(destinationDir, `${slug}.vtt`);
  if (!existsSync(srtSource) || !statSync(srtSource).isFile()) {
    skipped += 1;
    console.warn(`[skip] ${prefix}-${slug}.srt ausente: não foi possível gerar ${slug}.vtt`);
    return;
  }
  const vtt = srtToVtt(readFileSync(srtSource, "utf8"));
  writeFileSync(vttDestination, vtt, "utf8");
  converted += 1;
  console.log(`[vtt]  ${prefix}-${slug}.srt -> public/videos/module-01/${slug}.vtt`);
});

console.log(
  `\n[module-01] ${copied} arquivo(s) copiado(s); ${converted} VTT gerado(s); ${skipped} ausente(s).`,
);
if (copied === 0 && converted === 0) {
  console.warn("[module-01] nenhum arquivo encontrado — a UI mantém o estado de vídeo indisponível.");
}
