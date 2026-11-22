export const FPS = 30;
export const WIDTH = 1080;
export const HEIGHT = 1920;
export const DURATION = 1200;

export const BG = "#050505";
export const YELLOW = "#FACC15";
export const YELLOW_SOFT = "#FDE047";
export const WHITE = "#FFFFFF";
export const MUTED = "#A3A3A3";
export const DIM = "#525252";
export const FONT = '"Plus Jakarta Sans", "Segoe UI", sans-serif';

export const CLAMP = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

export const SCENES = {
  hook: { from: 0, to: 102 },
  expectation: { from: 102, to: 282 },
  basket: { from: 282, to: 405 },
  explanation: { from: 405, to: 624 },
  impact: { from: 624, to: 912 },
  outro: { from: 912, to: 1200 },
} as const;

export const NARRATION_START = 0.35;

export type Caption = {
  from: number;
  to: number;
  text: string;
  accent?: string;
};

export const CAPTIONS: Caption[] = [
  { from: 0.4, to: 3.39, text: "Você acha que cem reais estão parados?", accent: "cem reais" },
  { from: 3.39, to: 4.85, text: "Eles não estão.", accent: "não" },
  { from: 4.85, to: 9.31, text: "O número pode continuar o mesmo, mas o poder de compra muda.", accent: "poder de compra" },
  { from: 9.31, to: 13.39, text: "Se os preços sobem, a mesma quantia compra menos.", accent: "menos" },
  {
    from: 13.39,
    to: 20.82,
    text: "Em dez anos, com uma inflação hipotética de cinco por cento ao ano, cem reais valem cerca de sessenta e um.",
    accent: "sessenta e um",
  },
  { from: 20.82, to: 22.62, text: "Não é sobre o número.", accent: "número" },
  { from: 22.62, to: 24.46, text: "É sobre o que ele compra.", accent: "compra" },
  { from: 24.46, to: 27.48, text: "É por isso que entender a inflação importa.", accent: "inflação" },
  { from: 27.48, to: 30.43, text: "Deixar de entender também tem um custo.", accent: "custo" },
  {
    from: 30.43,
    to: 35.41,
    text: "Entender o dinheiro é o primeiro passo para tomar decisões melhores.",
    accent: "dinheiro",
  },
];

export const PRODUCTS = [
  { name: "Arroz", before: 25, after: 31.25, icon: "rice" },
  { name: "Leite", before: 15, after: 18.75, icon: "milk" },
  { name: "Café", before: 25, after: 31.25, icon: "coffee" },
  { name: "Pão", before: 15, after: 18.75, icon: "bread" },
  { name: "Ovos", before: 20, after: 25, icon: "eggs" },
] as const;
