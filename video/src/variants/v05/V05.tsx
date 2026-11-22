import timing from "./timing.json";
import type { TimingLine, VariantConfig } from "../shared/types";
import { VariantVideo, durationInFrames } from "../shared/VariantVideo";

const lines = (timing as { lines: TimingLine[] }).lines;

const config: VariantConfig = {
  id: "V05",
  title: "UMA NOTA SOBRE A MESA",
  music: "projects/investfacil-10-creative-variants/v05/music.wav",
  sfxBase: "projects/investfacil-10-creative-variants/v05/sfx",
  lines,
  scenes: [
    {
      kind: "hook",
      lines: [0, 0],
      eyebrow: "UMA NOTA",
      title: "QUANTO ESSA NOTA AINDA COMPRA?",
      accent: "AINDA",
      motif: "note",
    },
    {
      kind: "statement",
      lines: [1, 2],
      eyebrow: "A PROMESSA",
      title: "R$ 100 É PODER DE COMPRA.",
      subtitle: "E esse poder não tem o mesmo tamanho para sempre.",
      accent: "PODER DE COMPRA.",
      motif: "note",
    },
    {
      kind: "statement",
      lines: [3, 4],
      eyebrow: "O TEMPO",
      title: "O VALOR IMPRESSO CONTINUA. O QUE ELE COMPRA, NÃO.",
      accent: "NÃO.",
      motif: "note",
    },
    {
      kind: "counter",
      lines: [5, 6],
      eyebrow: "SIMULAÇÃO · 5% AO ANO",
      title: "A conta é simples.",
      subtitle: "Em dez anos, cerca de R$ 61.",
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
      kind: "split",
      lines: [7, 7],
      eyebrow: "O CONTRASTE",
      title: "IMPRESSO / MENOR",
      accent: "MENOR",
      left: { label: "VALOR IMPRESSO", value: "R$ 100", motif: "note", accent: false },
      right: { label: "O QUE ELE COMPRA", value: "3 de 5", motif: "basket", accent: true },
    },
    {
      kind: "cta",
      lines: [8, 8],
      title: "SALVE",
      subtitle: "PARA CONSULTAR QUANDO O PREÇO MUDAR",
    },
  ],
};

export const V05Duration = durationInFrames(config);

export function InvestFacilV05() {
  return <VariantVideo config={config} duration={V05Duration} />;
}
