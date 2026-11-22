import timing from "./timing.json";
import type { TimingLine, VariantConfig } from "../shared/types";
import { VariantVideo, durationInFrames } from "../shared/VariantVideo";

const lines = (timing as { lines: TimingLine[] }).lines;

const config: VariantConfig = {
  id: "V08",
  title: "PAPO DE MERCADO",
  music: "projects/investfacil-10-creative-variants/v08/music.wav",
  sfxBase: "projects/investfacil-10-creative-variants/v08/sfx",
  lines,
  scenes: [
    {
      kind: "quote",
      lines: [0, 1],
      eyebrow: "PAPO DE MERCADO",
      title: "O PAPO QUE TODO MUNDO JÁ OUVIU.",
      accent: "JÁ OUVIU.",
      motif: "chat",
    },
    {
      kind: "statement",
      lines: [2, 2],
      eyebrow: "SIMULAÇÃO · PREÇOS +25%",
      title: "QUATRO DE CINCO ITENS.",
      subtitle: "A mesma quantia compra menos.",
      accent: "QUATRO.",
      motif: "basket",
      basket: { remove: 1 },
    },
    {
      kind: "split",
      lines: [3, 4],
      eyebrow: "A CORREÇÃO",
      title: "O DINHEIRO NÃO SUMIU. ELE COMPRA MENOS.",
      accent: "COMPRA MENOS.",
      left: { label: "O DINHEIRO", value: "CONTINUA", motif: "note", accent: false },
      right: { label: "O QUE ELE COMPRA", value: "MENOS", motif: "basket", accent: true },
    },
    {
      kind: "counter",
      lines: [5, 5],
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
      lines: [6, 7],
      eyebrow: "O PAYOFF",
      title: "DINHEIRO PARADO NÃO FICA IGUAL.",
      subtitle: "Ele perde poder de compra. E a inflação age devagar.",
      accent: "NÃO FICA IGUAL.",
    },
    {
      kind: "statement",
      lines: [8, 8],
      eyebrow: "O EQUILÍBRIO",
      title: "GUARDAR É IMPORTANTE.",
      subtitle: "Entender o que acontece com ele, também.",
      accent: "IMPORTANTE.",
    },
    {
      kind: "cta",
      lines: [9, 9],
      title: "MANDA PRA ELE",
      subtitle: "O AMIGO QUE ACHA QUE DINHEIRO PARADO NÃO MUDA",
    },
  ],
};

export const V08Duration = durationInFrames(config);

export function InvestFacilV08() {
  return <VariantVideo config={config} duration={V08Duration} />;
}
