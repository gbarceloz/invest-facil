import timing from "./timing.json";
import type { TimingLine, VariantConfig } from "../shared/types";
import { VariantVideo } from "../shared/VariantVideo";

const lines = (timing as { lines: TimingLine[] }).lines;

const config: VariantConfig = {
  id: "V04",
  title: "R$ 100 EM 30 SEGUNDOS",
  music: "projects/investfacil-10-creative-variants/v04/music.wav",
  sfxBase: "projects/investfacil-10-creative-variants/v04/sfx",
  lines,
  scenes: [
    {
      kind: "hook",
      lines: [0, 1],
      eyebrow: "RESPOSTA RÁPIDA",
      title: "R$ 100. QUANTO ISSO COMPRA?",
      subtitle: "Depende do ano.",
      accent: "R$ 100.",
      motif: "timer",
    },
    {
      kind: "basket",
      lines: [2, 2],
      eyebrow: "HOJE",
      title: "UMA CESTA CHEIA.",
      subtitle: "Cinco itens. Um exemplo didático.",
      accent: "CHEIA.",
      basket: { remove: 0 },
    },
    {
      kind: "statement",
      lines: [3, 3],
      eyebrow: "SIMULAÇÃO · PREÇOS +25%",
      title: "QUATRO DE CINCO ITENS.",
      subtitle: "A mesma quantia compra menos.",
      accent: "QUATRO.",
      motif: "basket",
      basket: { remove: 1 },
    },
    {
      kind: "counter",
      lines: [4, 4],
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
      lines: [5, 5],
      eyebrow: "A RESPOSTA",
      title: "A RESPOSTA MUDOU. A PERGUNTA CONTINUA A MESMA.",
      accent: "MUDOU.",
    },
    {
      kind: "statement",
      lines: [6, 7],
      eyebrow: "O PONTO",
      title: "NÃO É QUANTO VOCÊ TEM. É O QUE ELE COMPRA.",
      accent: "O QUE ELE COMPRA.",
    },
    {
      kind: "statement",
      lines: [8, 8],
      eyebrow: "O OLHAR",
      title: "ENTENDER INFLAÇÃO MUDA COMO VOCÊ OLHA O PREÇO.",
      accent: "PREÇO.",
    },
    {
      kind: "cta",
      lines: [9, 9],
      title: "COMENTE",
      subtitle: "O QUE FICOU MAIS CARO PARA VOCÊ?",
    },
  ],
};

export const V04Duration = 900;

export function InvestFacilV04() {
  return <VariantVideo config={config} duration={V04Duration} />;
}
