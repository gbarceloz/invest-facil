import timing from "./timing.json";
import type { TimingLine, VariantConfig } from "../shared/types";
import { VariantVideo, durationInFrames } from "../shared/VariantVideo";

const lines = (timing as { lines: TimingLine[] }).lines;

const config: VariantConfig = {
  id: "V06",
  title: "NÃO É IMPRESSÃO",
  music: "projects/investfacil-10-creative-variants/v06/music.wav",
  sfxBase: "projects/investfacil-10-creative-variants/v06/sfx",
  lines,
  scenes: [
    {
      kind: "hook",
      lines: [0, 1],
      eyebrow: "A PERGUNTA",
      title: "SEU SALÁRIO SUBIU. POR QUE O MÊS CONTINUA APERTADO?",
      accent: "APERTADO?",
      motif: "salary",
    },
    {
      kind: "statement",
      lines: [2, 3],
      eyebrow: "A VALIDAÇÃO",
      title: "VOCÊ NÃO ESTÁ IMAGINANDO.",
      subtitle: "Seu dinheiro compra menos.",
      accent: "IMAGINANDO.",
      motif: "salary",
    },
    {
      kind: "split",
      lines: [4, 5],
      eyebrow: "O CONFLITO",
      title: "SALÁRIO x PREÇOS",
      accent: "PREÇOS",
      left: { label: "SALÁRIO", value: "SOBE", motif: "salary", accent: false },
      right: { label: "CESTA", value: "SOBE MAIS", motif: "basket", accent: true },
      subtitle: "O que sobra no fim do mês diminui.",
    },
    {
      kind: "statement",
      lines: [6, 7],
      eyebrow: "O NOME",
      title: "INFLAÇÃO.",
      subtitle: "Ela corrói o poder de compra sem fazer barulho.",
      accent: "INFLAÇÃO.",
    },
    {
      kind: "counter",
      lines: [8, 8],
      eyebrow: "SIMULAÇÃO · 5% AO ANO",
      title: "Em dez anos, R$ 100 valem cerca de R$ 61.",
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
      lines: [9, 9],
      eyebrow: "O PAYOFF",
      title: "NÃO É IMPRESSÃO. É INFLAÇÃO.",
      accent: "INFLAÇÃO.",
    },
    {
      kind: "cta",
      lines: [10, 10],
      title: "SALVE",
      subtitle: "PARA ENTENDER QUANDO O SALÁRIO NÃO ACOMPANHA",
    },
  ],
};

export const V06Duration = durationInFrames(config);

export function InvestFacilV06() {
  return <VariantVideo config={config} duration={V06Duration} />;
}
