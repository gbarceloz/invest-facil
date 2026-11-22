import timing from "./timing.json";
import type { TimingLine, VariantConfig } from "../shared/types";
import { VariantVideo, durationInFrames } from "../shared/VariantVideo";

const lines = (timing as { lines: TimingLine[] }).lines;

const config: VariantConfig = {
  id: "V10",
  title: "O ESPELHO DO DINHEIRO",
  music: "projects/investfacil-10-creative-variants/v10/music.wav",
  sfxBase: "projects/investfacil-10-creative-variants/v10/sfx",
  lines,
  scenes: [
    {
      kind: "hook",
      lines: [0, 1],
      eyebrow: "O ESPELHO",
      title: "SE O SEU DINHEIRO PUDESSE FALAR...",
      subtitle: "Ele diria: eu não desapareci.",
      accent: "FALAR...",
      motif: "mirror",
    },
    {
      kind: "statement",
      lines: [2, 3],
      eyebrow: "O REFLEXO",
      title: "VOCÊ SÓ COMPRA MENOS.",
      subtitle: "O que muda é o tamanho do que ele pode comprar.",
      accent: "MENOS.",
      motif: "mirror",
    },
    {
      kind: "statement",
      lines: [4, 5],
      eyebrow: "A NOTA",
      title: "O NÚMERO CONTINUA. A NOTA NÃO ENCOLHE.",
      accent: "NÃO ENCOLHE.",
      motif: "note",
    },
    {
      kind: "statement",
      lines: [6, 7],
      eyebrow: "O PODER",
      title: "O PODER DE COMPRA MUDA.",
      subtitle: "E muda devagar.",
      accent: "MUDA.",
      motif: "mirror",
    },
    {
      kind: "statement",
      lines: [8, 8],
      eyebrow: "O NOME",
      title: "INFLAÇÃO.",
      subtitle: "Ela diminui o que ele pode comprar. Item por item.",
      accent: "INFLAÇÃO.",
    },
    {
      kind: "counter",
      lines: [9, 9],
      eyebrow: "SIMULAÇÃO · 5% AO ANO",
      title: "Em dez anos, 61.",
      number: {
        from: 100,
        to: 61,
        prefix: "R$ ",
        decimals: 0,
        label: "10 ANOS",
        disclaimer: "Simulação hipotética. Não é projeção.",
      },
      motif: "line",
    },
    {
      kind: "statement",
      lines: [10, 10],
      eyebrow: "O FECHO",
      title: "O DINHEIRO NÃO SOME. ELE MUDA DE TAMANHO.",
      accent: "MUDA DE TAMANHO.",
    },
    {
      kind: "cta",
      lines: [11, 11],
      title: "SALVE",
      subtitle: "PARA REVER QUANDO O PREÇO SUBIR",
    },
  ],
};

export const V10Duration = durationInFrames(config);

export function InvestFacilV10() {
  return <VariantVideo config={config} duration={V10Duration} />;
}
