import timing from "./timing.json";
import type { TimingLine, VariantConfig } from "../shared/types";
import { VariantVideo, durationInFrames } from "../shared/VariantVideo";

const lines = (timing as { lines: TimingLine[] }).lines;

const config: VariantConfig = {
  id: "V09",
  title: "O IMPOSTO INVISÍVEL",
  music: "projects/investfacil-10-creative-variants/v09/music.wav",
  sfxBase: "projects/investfacil-10-creative-variants/v09/sfx",
  lines,
  scenes: [
    {
      kind: "hook",
      lines: [0, 1],
      eyebrow: "O IMPOSTO INVISÍVEL",
      title: "EXISTE UM IMPOSTO QUE NINGUÉM VOTOU.",
      subtitle: "E você paga todos os dias.",
      accent: "NINGUÉM VOTOU.",
      motif: "receipt",
    },
    {
      kind: "quote",
      lines: [2, 4],
      eyebrow: "A METÁFORA",
      title: "NÃO É IMPOSTO LITERAL. É INFLAÇÃO.",
      subtitle: "Ela não aparece na nota. Mas está embutida no preço.",
      accent: "INFLAÇÃO.",
      motif: "receipt",
    },
    {
      kind: "statement",
      lines: [5, 5],
      eyebrow: "O PREÇO",
      title: "OS PREÇOS SOBEM. O DINHEIRO COMPRA MENOS.",
      accent: "MENOS.",
      motif: "receipt",
    },
    {
      kind: "counter",
      lines: [6, 6],
      eyebrow: "SIMULAÇÃO · 5% AO ANO",
      title: "Em dez anos, cerca de R$ 61.",
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
      lines: [7, 8],
      eyebrow: "O PRESENTE",
      title: "NÃO É PREVER O FUTURO. É ENTENDER O PRESENTE.",
      subtitle: "Olhar para o dinheiro e ver o que ele realmente compra.",
      accent: "PRESENTE.",
      motif: "line",
    },
    {
      kind: "cta",
      lines: [9, 9],
      title: "SIGA O INVEST FÁCIL",
      subtitle: "ENTENDA O DINHEIRO. DEPOIS, O MERCADO.",
    },
  ],
};

export const V09Duration = durationInFrames(config);

export function InvestFacilV09() {
  return <VariantVideo config={config} duration={V09Duration} />;
}
