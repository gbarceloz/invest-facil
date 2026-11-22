export type MotifKind =
  | "note"
  | "cup"
  | "receipt"
  | "machine"
  | "timer"
  | "chat"
  | "mirror"
  | "salary"
  | "line"
  | "basket";

export type SceneKind = "hook" | "statement" | "split" | "counter" | "basket" | "chart" | "quote" | "cta";

export type SplitSide = {
  label: string;
  value: string;
  motif?: MotifKind;
  accent?: boolean;
  remove?: number;
};

export type SceneSpec = {
  kind: SceneKind;
  lines: [number, number];
  eyebrow?: string;
  title: string;
  subtitle?: string;
  accent?: string;
  motif?: MotifKind;
  left?: SplitSide;
  right?: SplitSide;
  number?: {
    from: number;
    to: number;
    prefix?: string;
    suffix?: string;
    decimals?: number;
    label?: string;
    disclaimer?: string;
  };
  basket?: {
    remove: number;
  };
  chartYears?: number;
  quote?: {
    text: string;
    author: string;
    side?: "left" | "right";
  };
};

export type TimingLine = {
  id: string;
  display: string;
  start: number;
  end: number;
  duration: number;
};

export type VariantConfig = {
  id: string;
  title: string;
  music: string;
  sfxBase: string;
  lines: TimingLine[];
  scenes: SceneSpec[];
};
