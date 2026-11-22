import type { CSSProperties } from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { CLAMP, FONT, WHITE, YELLOW } from "./constants";

export type KineticMode = "word" | "mask" | "tracking" | "blur";

type Props = {
  text: string;
  delay?: number;
  mode?: KineticMode;
  style?: CSSProperties;
  accentWords?: string[];
  stagger?: number;
  align?: "left" | "center" | "right";
  accentColor?: string;
};

const normalize = (value: string) => value.replace(/[.,!?;:]/g, "").toLowerCase();

export function KineticText({
  text,
  delay = 0,
  mode = "word",
  style,
  accentWords = [],
  stagger = 3,
  align = "left",
  accentColor = YELLOW,
}: Props) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const accents = new Set(accentWords.map(normalize));
  const lines = text.split("\n");

  if (mode === "tracking") {
    const progress = spring({
      frame: frame - delay,
      fps,
      config: { damping: 22, stiffness: 80, mass: 0.9 },
    });
    return (
      <div
        style={{
          display: "block",
          fontFamily: FONT,
          color: WHITE,
          letterSpacing: `${interpolate(progress, [0, 1], [0.28, 0.015])}em`,
          opacity: interpolate(progress, [0, 1], [0, 1], CLAMP),
          transform: `translateY(${interpolate(progress, [0, 1], [18, 0])}px)`,
          textAlign: align,
          ...style,
        }}
      >
        {text}
      </div>
    );
  }

  if (mode === "blur") {
    const progress = spring({
      frame: frame - delay,
      fps,
      config: { damping: 24, stiffness: 70, mass: 1 },
    });
    return (
      <div
        style={{
          display: "block",
          fontFamily: FONT,
          color: WHITE,
          opacity: interpolate(progress, [0, 1], [0, 1], CLAMP),
          filter: `blur(${interpolate(progress, [0, 1], [18, 0])}px)`,
          transform: `scale(${interpolate(progress, [0, 1], [1.06, 1])})`,
          textAlign: align,
          ...style,
        }}
      >
        {text}
      </div>
    );
  }

  if (mode === "mask") {
    return (
      <div style={{ display: "flex", flexDirection: "column", fontFamily: FONT, textAlign: align, ...style }}>
        {lines.map((line, lineIndex) => {
          const progress = spring({
            frame: frame - delay - lineIndex * 5,
            fps,
            config: { damping: 20, stiffness: 110, mass: 0.85 },
          });
          return (
            <div key={`${line}-${lineIndex}`} style={{ overflow: "hidden", display: "block" }}>
              <div
                style={{
                  transform: `translateY(${interpolate(progress, [0, 1], [112, 0])}%)`,
                  opacity: interpolate(progress, [0, 0.35], [0, 1], CLAMP),
                }}
              >
                {line}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  let globalIndex = 0;
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: align === "center" ? "center" : align === "right" ? "flex-end" : "flex-start",
        fontFamily: FONT,
        ...style,
      }}
    >
      {lines.map((line, lineIndex) => (
        <span
          key={`${line}-${lineIndex}`}
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: align === "center" ? "center" : align === "right" ? "flex-end" : "flex-start",
          }}
        >
          {line.split(" ").map((word) => {
            const index = globalIndex++;
            const progress = spring({
              frame: frame - delay - index * stagger,
              fps,
              config: { damping: 18, stiffness: 145, mass: 0.72 },
            });
            const accent = accents.has(normalize(word));
            return (
              <span
                key={`${word}-${index}`}
                style={{
                  display: "inline-block",
                  opacity: interpolate(progress, [0, 0.3], [0, 1], CLAMP),
                  transform: `translateY(${interpolate(progress, [0, 1], [38, 0])}px) scale(${interpolate(
                    progress,
                    [0, 0.7, 1],
                    [0.92, 1.015, 1],
                  )})`,
                  color: accent ? accentColor : undefined,
                  marginRight: "0.22em",
                }}
              >
                {word}
              </span>
            );
          })}
        </span>
      ))}
    </div>
  );
}
