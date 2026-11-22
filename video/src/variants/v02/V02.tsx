import timing from "./timing.json";
import type { TimingLine, VariantConfig } from "../shared/types";
import { VariantVideo, durationInFrames } from "../shared/VariantVideo";

const lines = (timing as { lines: TimingLine[] }).lines;

const config: VariantConfig = {
  id: "V02",
  title: "O CAFÉ DE SEMPRE",
  music: "projects/investfacil-10-creative-variants/v02/music.wav",
  sfxBase: "projects/investfacil-10-creative-variants/v02/sfx",
  lines,
  scenes: [
    {
      kind: "hook",
      lines: [0, 0],
      eyebrow: "O CAFÉ DE SEMPRE",
      title: "ATÉ O DIA EM QUE O DINHEIRO NÃO DEU.",
      subtitle: "O mesmo café. O mesmo orçamento. Menos troco.",
      accent: "NÃO DEU.",
      motif: "cup",
    },
    {
      kind: "statement",
      lines: [1, 2],
      eyebrow: "O RITUAL",
      title: "O MESMO PEDIDO. OS MESMOS R$ 100.",
      subtitle: "Uma semana de café. Um orçamento que parecia estável.",
      accent: "R$ 100.",
    },
    {
      kind: "statement",
      lines: [3, 4],
      eyebrow: "O TROCO",
      title: "NO COMEÇO, SOBRAVA TROCO. DEPOIS, FOI FICANDO MENOR.",
      accent: "MENOR.",
      motif: "receipt",
    },
    {
      kind: "statement",
      lines: [5, 6],
      eyebrow: "A QUEBRA",
      title: "NÃO FOI O CAFÉ QUE FICOU CARO DO NADA.",
      subtitle: "O dinheiro é que compra menos.",
      accent: "DO NADA.",
      motif: "note",
    },
    {
      kind: "statement",
      lines: [7, 7],
      eyebrow: "O NOME",
      title: "INFLAÇÃO.",
      subtitle: "Os preços sobem. O poder de compra cai.",
      accent: "INFLAÇÃO.",
    },
    {
      kind: "counter",
      lines: [8, 8],
      eyebrow: "SEM ALARME",
      title: "Em dez anos, o poder de compra cai.",
      subtitle: "Uma simulação de 5% ao ano.",
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
      lines: [9, 9],
      eyebrow: "O CONTRASTE",
      title: "O CAFÉ É O MESMO.",
      accent: "MESMO.",
      left: { label: "MESMO CAFÉ", value: "R$ 100", motif: "cup", accent: false },
      right: { label: "TROCO MENOR", value: "3 de 5", motif: "basket", accent: true },
      subtitle: "O troco é que encolheu.",
    },
    {
      kind: "statement",
      lines: [10, 10],
      eyebrow: "O FECHO",
      title: "A INFLAÇÃO NÃO FAZ BARULHO.",
      subtitle: "Ela aparece no troco.",
      accent: "BARULHO.",
    },
    {
      kind: "cta",
      lines: [11, 11],
      title: "SALVE",
      subtitle: "PARA LEMBRAR QUANDO O PREÇO PARECER ‘DO NADA’",
    },
  ],
};

export const V02Duration = durationInFrames(config);

export function InvestFacilV02() {
  return <VariantVideo config={config} duration={V02Duration} />;
}
