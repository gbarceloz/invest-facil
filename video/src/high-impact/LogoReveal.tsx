import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { CLAMP, FONT, MUTED, WHITE, YELLOW } from "./constants";

export function LogoReveal({ delay = 0 }: { delay?: number }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const mark = spring({
    frame: frame - delay,
    fps,
    config: { damping: 16, stiffness: 95, mass: 0.9 },
  });
  const line = spring({
    frame: frame - delay - 6,
    fps,
    config: { damping: 22, stiffness: 70, mass: 1 },
  });
  const text = spring({
    frame: frame - delay - 12,
    fps,
    config: { damping: 24, stiffness: 80, mass: 1 },
  });

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: FONT,
        textAlign: "center",
      }}
    >
      <div
        style={{
          width: 108,
          height: 108,
          borderRadius: 28,
          background: "rgba(250,204,21,0.08)",
          border: "1px solid rgba(250,204,21,0.22)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          opacity: interpolate(mark, [0, 1], [0, 1], CLAMP),
          transform: `scale(${interpolate(mark, [0, 1], [0.55, 1])}) rotate(${interpolate(mark, [0, 1], [-8, 0])}deg)`,
        }}
      >
        <svg viewBox="0 0 40 40" width="66" height="66">
          <path d="M9 14.8 L29 5.2 L29 12.6 C29 14.5 27.7 15.9 26.0 16.5 L9 22.5 Z" fill={YELLOW} />
          <path d="M9 23.7 L23 17.8 L23 25.0 C23 26.9 21.7 28.3 20.0 28.9 L9 33.0 Z" fill={YELLOW} />
          <path d="M9 14.8 L12.8 13.2 L12.8 33.8 L9 35.2 Z" fill="#EAB308" />
        </svg>
      </div>

      <div
        style={{
          marginTop: 24,
          fontSize: 62,
          fontWeight: 900,
          letterSpacing: "-0.055em",
          color: WHITE,
          opacity: interpolate(text, [0, 1], [0, 1], CLAMP),
          transform: `translateY(${interpolate(text, [0, 1], [18, 0])}px)`,
        }}
      >
        Invest <span style={{ color: YELLOW }}>Fácil</span>
      </div>

      <div
        style={{
          marginTop: 18,
          height: 3,
          width: interpolate(line, [0, 1], [0, 130], CLAMP),
          background: YELLOW,
        }}
      />

      <div
        style={{
          marginTop: 20,
          color: MUTED,
          fontSize: 24,
          opacity: interpolate(text, [0, 1], [0, 1], CLAMP),
        }}
      >
        Entenda o dinheiro. Depois, o mercado.
      </div>

      <div
        style={{
          marginTop: 26,
          color: WHITE,
          fontSize: 17,
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          opacity: interpolate(text, [0, 1], [0, 1], CLAMP),
        }}
      >
        educação financeira sem promessas
      </div>
    </div>
  );
}
