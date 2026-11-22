import type { CSSProperties } from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { CLAMP, FONT } from "./constants";

type Props = {
  from?: number;
  to: number;
  delay?: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  style?: CSSProperties;
  format?: (value: number) => string;
};

export function AnimatedNumber({
  from = 0,
  to,
  delay = 0,
  duration = 32,
  prefix = "",
  suffix = "",
  decimals = 0,
  style,
  format,
}: Props) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const progress = spring({
    frame: frame - delay,
    fps,
    durationInFrames: duration,
    config: { damping: 24, stiffness: 70, mass: 1.05 },
  });
  const value = interpolate(progress, [0, 1], [from, to], CLAMP);
  const text =
    format?.(value) ??
    value.toLocaleString("pt-BR", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });

  return (
    <span style={{ fontFamily: FONT, fontVariantNumeric: "tabular-nums", ...style }}>
      {prefix}
      {text}
      {suffix}
    </span>
  );
}
