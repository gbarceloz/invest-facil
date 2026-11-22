import timing from "./timing.json";
import type { TimingLine, VariantConfig } from "../shared/types";
import { VariantVideo, durationInFrames } from "../shared/VariantVideo";

const lines = (timing as { lines: TimingLine[] }).lines;

const config: VariantConfig = {
  id: "V03",
  title: "A MÁQUINA DE ENCOLHER DINHEIRO",
  music: "projects/investfacil-10-creative-variants/v03/music.wav",
  sfxBase: "projects/investfacil-10-creative-variants/v03/sfx",
  lines,
  scenes: [
    {
      kind: "hook",
      lines: [0, 1],
      eyebrow: "A MÁQUINA",
      title: "A NOTA ENTRA INTEIRA. O QUE ELA COMPRA, NÃO.",
      accent: "O QUE ELA COMPRA, NÃO.",
      motif: "machine",
    },
    {
      kind: "statement",
      lines: [2, 3],
      eyebrow: "A TRANSFORMAÇÃO",
      title: "OS PREÇOS SOBEM. A MESMA QUANTIA COMPRA MENOS.",
      accent: "MENOS.",
      motif: "machine",
    },
    {
      kind: "split",
      lines: [4, 5],
      eyebrow: "O NÚMERO",
      title: "O NÚMERO NÃO MUDA. O QUE ELE COMPRA, SIM.",
      accent: "SIM.",
      left: { label: "A NOTA", value: "100", motif: "note", accent: false },
      right: { label: "O QUE ELA COMPRA", value: "3 de 5", motif: "basket", accent: true },
    },
    {
      kind: "statement",
      lines: [6, 6],
      eyebrow: "A CADA ANO",
      title: "A MÁQUINA LEVA UM POUCO.",
      accent: "UM POUCO.",
    },
    {
      kind: "counter",
      lines: [7, 7],
      eyebrow: "SIMULAÇÃO · 5% AO ANO",
      title: "Em dez anos, o poder de compra cai para 61.",
      subtitle: "O número da nota não muda.",
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
      lines: [8, 9],
      eyebrow: "A CONSEQUÊNCIA",
      title: "A INFLAÇÃO NÃO RASGA O DINHEIRO.",
      subtitle: "Ela diminui o que ele compra.",
      accent: "NÃO RASGA.",
    },
    {
      kind: "cta",
      lines: [10, 10],
      title: "COMPARTILHE",
      subtitle: "COM QUEM ACHA QUE DINHEIRO PARADO NÃO MUDA",
    },
  ],
};

export const V03Duration = durationInFrames(config);

export function InvestFacilV03() {
  return <VariantVideo config={config} duration={V03Duration} />;
}
