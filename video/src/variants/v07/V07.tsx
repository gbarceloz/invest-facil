import timing from "./timing.json";
import type { TimingLine, VariantConfig } from "../shared/types";
import { VariantVideo, durationInFrames } from "../shared/VariantVideo";

const lines = (timing as { lines: TimingLine[] }).lines;

const config: VariantConfig = {
  id: "V07",
  title: "A LINHA QUE EXPLICA SEU BOLSO",
  music: "projects/investfacil-10-creative-variants/v07/music.wav",
  sfxBase: "projects/investfacil-10-creative-variants/v07/sfx",
  lines,
  scenes: [
    {
      kind: "hook",
      lines: [0, 1],
      eyebrow: "PODER DE COMPRA",
      title: "UMA LINHA PODE EXPLICAR.",
      subtitle: "Ela começa em R$ 100.",
      accent: "EXPLICAR.",
      motif: "line",
    },
    {
      kind: "chart",
      lines: [2, 3],
      eyebrow: "SIMULAÇÃO · 5% AO ANO",
      title: "100 → 78.",
      subtitle: "Em 5 anos, a linha já caiu.",
      accent: "78.",
      motif: "line",
      chartYears: 5,
    },
    {
      kind: "chart",
      lines: [4, 4],
      eyebrow: "SIMULAÇÃO · 5% AO ANO",
      title: "78 → 61.",
      subtitle: "Em 10 anos, uma perda de quase 39%.",
      accent: "61.",
      motif: "line",
      chartYears: 10,
    },
    {
      kind: "statement",
      lines: [5, 6],
      eyebrow: "O CONTRASTE",
      title: "O NÚMERO NÃO MUDOU. A CESTA FICOU MENOR.",
      accent: "MENOR.",
      motif: "basket",
    },
    {
      kind: "statement",
      lines: [7, 7],
      eyebrow: "O PAYOFF",
      title: "INFLAÇÃO.",
      subtitle: "Entender importa.",
      accent: "INFLAÇÃO.",
    },
    {
      kind: "cta",
      lines: [8, 8],
      title: "SALVE",
      subtitle: "PARA CONSULTAR QUANDO FALAREM DE INFLAÇÃO",
    },
  ],
};

export const V07Duration = durationInFrames(config);

export function InvestFacilV07() {
  return <VariantVideo config={config} duration={V07Duration} />;
}
