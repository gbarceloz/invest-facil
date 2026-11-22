export const FPS = 30;
export const WIDTH = 1080;
export const HEIGHT = 1920;
export const DURATION = 1020;

export const BG = "#050505";
export const YELLOW = "#FACC15";
export const YELLOW_SOFT = "#FDE047";
export const WHITE = "#FFFFFF";
export const MUTED = "#A3A3A3";
export const DIM = "#525252";
export const FONT = '"Plus Jakarta Sans", "Segoe UI", sans-serif';
export const CLAMP = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

export const f = (seconds: number) => Math.round(seconds * FPS);

export const T = {
  hook: 0,
  prices: 3.331,
  same: 5.664,
  less: 8.206,
  inflation: 12.331,
  power: 13.829,
  simulation: 18.07,
  samePower: 24.328,
  firstStep: 27.886,
  end: 30.034,
  total: 34.0,
};

export const SCENES = {
  hook: { from: f(T.hook), to: f(T.prices) },
  prices: { from: f(T.prices), to: f(T.same) },
  same: { from: f(T.same), to: f(T.less) },
  less: { from: f(T.less), to: f(T.inflation) },
  inflation: { from: f(T.inflation), to: f(T.power) },
  power: { from: f(T.power), to: f(T.simulation) },
  simulation: { from: f(T.simulation), to: f(T.samePower) },
  samePower: { from: f(T.samePower), to: f(T.firstStep) },
  firstStep: { from: f(T.firstStep), to: f(T.end) },
  end: { from: f(T.end), to: f(T.total) },
} as const;

export const PRODUCTS = [
  { name: "CAFÉ", icon: "coffee", from: 8, to: 10, unit: "1 xícara" },
  { name: "PÃO", icon: "bread", from: 6, to: 7.5, unit: "1 unidade" },
  { name: "TRANSPORTE", icon: "bus", from: 5, to: 6.25, unit: "1 trecho" },
] as const;

export const TICKER_ITEMS = [
  { name: "CAFÉ", price: "R$ 8,00" },
  { name: "PÃO", price: "R$ 6,00" },
  { name: "LEITE", price: "R$ 5,49" },
  { name: "ARROZ", price: "R$ 27,90" },
  { name: "TRANSPORTE", price: "R$ 5,00" },
  { name: "OVOS", price: "R$ 12,90" },
  { name: "FEIJÃO", price: "R$ 8,99" },
  { name: "MANTEIGA", price: "R$ 11,50" },
  { name: "AÇÚCAR", price: "R$ 4,29" },
  { name: "ÓLEO", price: "R$ 7,99" },
  { name: "MACARRÃO", price: "R$ 4,49" },
  { name: "FRANGO", price: "R$ 14,90" },
  { name: "BANANA", price: "R$ 6,99" },
  { name: "MAÇÃ", price: "R$ 8,49" },
  { name: "TOMATE", price: "R$ 7,29" },
  { name: "BATATA", price: "R$ 5,99" },
  { name: "CEBOLA", price: "R$ 4,79" },
  { name: "ALHO", price: "R$ 3,99" },
  { name: "QUEIJO", price: "R$ 12,50" },
  { name: "IOGURTE", price: "R$ 3,49" },
  { name: "SABÃO", price: "R$ 9,90" },
  { name: "PAPEL", price: "R$ 6,49" },
  { name: "DETERGENTE", price: "R$ 3,29" },
  { name: "ÁGUA", price: "R$ 2,49" },
] as const;

export const SIM_POINTS = [100, 90.7, 82.3, 74.6, 67.7, 61.39] as const;
