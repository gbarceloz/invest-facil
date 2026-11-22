import type { CSSProperties, ReactNode } from "react";
import {
  AbsoluteFill,
  Audio,
  Sequence,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

const BG = "#050505";
const YELLOW = "#FACC15";
const WHITE = "#FAFAFA";
const MUTED = "#A3A3A3";
const FONT = '"Plus Jakarta Sans", "Segoe UI", sans-serif';
const CLAMP = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

function Grid({ frame, opacity = 0.16 }: { frame: number; opacity?: number }) {
  const shift = interpolate(frame, [0, 570], [0, -90], CLAMP);
  return (
    <div
      style={{
        position: "absolute",
        inset: -120,
        backgroundImage:
          "linear-gradient(rgba(255,255,255,0.055) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.055) 1px, transparent 1px)",
        backgroundSize: "90px 90px",
        transform: `translateY(${shift}px)`,
        opacity,
      }}
    />
  );
}

const PARTICLES = Array.from({ length: 20 }, (_, index) => ({
  x: (index * 137 + 61) % 980,
  y: (index * 233 + 140) % 1900,
  size: 2 + (index % 4),
  speed: 0.35 + (index % 5) * 0.12,
  phase: index * 0.7,
}));

function Particles({ frame, opacity = 0.5 }: { frame: number; opacity?: number }) {
  return (
    <>
      {PARTICLES.map((particle, index) => {
        const y = (particle.y + frame * particle.speed) % 2050 - 80;
        const x = particle.x + Math.sin(frame / 36 + particle.phase) * 18;
        return (
          <div
            key={index}
            style={{
              position: "absolute",
              left: x,
              top: y,
              width: particle.size,
              height: particle.size,
              borderRadius: 999,
              background: YELLOW,
              opacity: opacity * (0.25 + (index % 5) * 0.12),
            }}
          />
        );
      })}
    </>
  );
}

function Fade({
  children,
  delay = 0,
  duration = 14,
  style,
}: {
  children: ReactNode;
  delay?: number;
  duration?: number;
  style?: CSSProperties;
}) {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [delay, delay + duration], [0, 1], CLAMP);
  return <div style={{ opacity, ...style }}>{children}</div>;
}

function MaskLine({
  children,
  delay,
  style,
}: {
  children: ReactNode;
  delay: number;
  style?: CSSProperties;
}) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const progress = spring({
    frame: frame - delay,
    fps,
    config: { damping: 18, stiffness: 120, mass: 0.8 },
  });
  return (
    <div style={{ overflow: "hidden", display: "block", ...style }}>
      <div style={{ transform: `translateY(${interpolate(progress, [0, 1], [118, 0])}%)` }}>
        {children}
      </div>
    </div>
  );
}

function WordStagger({
  text,
  delay,
  style,
  accentWords = [],
}: {
  text: string;
  delay: number;
  style?: CSSProperties;
  accentWords?: string[];
}) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <span style={{ display: "inline", ...style }}>
      {text.split(" ").map((word, index) => {
        const progress = spring({
          frame: frame - delay - index * 3,
          fps,
          config: { damping: 20, stiffness: 140, mass: 0.7 },
        });
        const accent = accentWords.includes(word.replace(/[.,]/g, ""));
        return (
          <span
            key={`${word}-${index}`}
            style={{
              display: "inline-block",
              opacity: progress,
              transform: `translateY(${interpolate(progress, [0, 1], [32, 0])}px)`,
              color: accent ? YELLOW : undefined,
              marginRight: "0.22em",
            }}
          >
            {word}
          </span>
        );
      })}
    </span>
  );
}

function Counter({
  from,
  to,
  delay,
  prefix = "",
  suffix = "",
  style,
}: {
  from: number;
  to: number;
  delay: number;
  prefix?: string;
  suffix?: string;
  style?: CSSProperties;
}) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const progress = spring({
    frame: frame - delay,
    fps,
    config: { damping: 26, stiffness: 55, mass: 1.25 },
  });
  const value = Math.round(interpolate(progress, [0, 1], [from, to]));
  return (
    <span style={{ fontVariantNumeric: "tabular-nums", ...style }}>
      {prefix}
      {value}
      {suffix}
    </span>
  );
}

function Scene({
  from,
  to,
  children,
  zIndex = 0,
}: {
  from: number;
  to: number;
  children: ReactNode;
  zIndex?: number;
}) {
  const frame = useCurrentFrame();
  const fadeIn = interpolate(frame, [from, from + 10], [0, 1], CLAMP);
  const fadeOut = interpolate(frame, [to - 12, to], [1, 0], CLAMP);
  return (
    <AbsoluteFill
      style={{
        background: BG,
        opacity: Math.min(fadeIn, fadeOut),
        zIndex,
      }}
    >
      {children}
    </AbsoluteFill>
  );
}

function TopLabel({ children, frame }: { children: ReactNode; frame: number }) {
  return (
    <div
      style={{
        position: "absolute",
        top: 82,
        left: 78,
        right: 78,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        color: MUTED,
        fontSize: 20,
        fontWeight: 700,
        letterSpacing: "0.16em",
        textTransform: "uppercase",
        zIndex: 5,
      }}
    >
      <span style={{ color: YELLOW }}>{children}</span>
      <span style={{ fontVariantNumeric: "tabular-nums" }}>
        {String(Math.floor(frame / 30)).padStart(2, "0")}s
      </span>
    </div>
  );
}

function HookScene() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const slam = spring({
    frame,
    fps,
    config: { damping: 12, stiffness: 130, mass: 0.8 },
  });
  const float = interpolate(frame, [0, 130], [0, -22], CLAMP);

  return (
    <Scene from={0} to={135}>
      <Grid frame={frame} opacity={0.2} />
      <Particles frame={frame} opacity={0.55} />
      <div
        style={{
          position: "absolute",
          left: 60,
          bottom: 340,
          fontSize: 330,
          fontWeight: 900,
          letterSpacing: "-0.08em",
          color: "rgba(255,255,255,0.035)",
          whiteSpace: "nowrap",
          transform: `translateX(${interpolate(frame, [0, 135], [100, -260], CLAMP)}px)`,
        }}
      >
        INFLAÇÃO
      </div>
      <TopLabel frame={frame}>Invest Fácil · Lab 01</TopLabel>

      <div
        style={{
          position: "absolute",
          left: 78,
          right: 78,
          top: 310,
          transform: `translateY(${float}px)`,
        }}
      >
        <Fade delay={0} duration={10}>
          <div style={{ color: MUTED, fontSize: 28, fontWeight: 600, letterSpacing: "0.02em" }}>
            Você acha que R$ 100 estão parados?
          </div>
        </Fade>

        <div
          style={{
            marginTop: 34,
            display: "flex",
            alignItems: "baseline",
            gap: 18,
            transform: `scale(${interpolate(slam, [0, 1], [0.55, 1])}) rotate(${interpolate(
              slam,
              [0, 1],
              [-7, 0],
            )}deg)`,
            transformOrigin: "left center",
          }}
        >
          <span style={{ color: YELLOW, fontSize: 92, fontWeight: 800, letterSpacing: "-0.06em" }}>R$</span>
          <span
            style={{
              color: WHITE,
              fontSize: 390,
              lineHeight: 0.78,
              fontWeight: 900,
              letterSpacing: "-0.09em",
              textShadow: "0 0 80px rgba(250,204,21,0.14)",
            }}
          >
            100
          </span>
        </div>

        <div style={{ marginTop: 32, height: 8, width: 300, background: YELLOW }} />

        <div style={{ marginTop: 40, maxWidth: 880 }}>
          <MaskLine delay={38}>
            <div style={{ fontSize: 76, lineHeight: 1.02, fontWeight: 800, letterSpacing: "-0.045em" }}>
              não valem o mesmo
            </div>
          </MaskLine>
          <MaskLine delay={46}>
            <div style={{ fontSize: 76, lineHeight: 1.02, fontWeight: 800, letterSpacing: "-0.045em", color: YELLOW }}>
              amanhã.
            </div>
          </MaskLine>
        </div>

        <Fade delay={74} style={{ marginTop: 46 }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 14,
              border: "1px solid rgba(250,204,21,0.35)",
              borderRadius: 999,
              padding: "14px 24px",
              color: YELLOW,
              fontSize: 24,
              fontWeight: 700,
            }}
          >
            <span style={{ width: 9, height: 9, borderRadius: 99, background: YELLOW }} />
            exemplo: 5% de inflação ao ano
          </div>
        </Fade>
      </div>
    </Scene>
  );
}

const BAR_VALUES = [100, 90.7, 82.3, 74.6, 67.7, 61.4];
const BAR_LABELS = ["hoje", "2a", "4a", "6a", "8a", "10a"];

function InflationScene() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const chartProgress = spring({
    frame: frame - 165,
    fps,
    config: { damping: 20, stiffness: 70, mass: 1.1 },
  });

  return (
    <Scene from={130} to={305}>
      <Grid frame={frame} opacity={0.12} />
      <Particles frame={frame} opacity={0.35} />
      <TopLabel frame={frame}>O que acontece</TopLabel>

      <div style={{ position: "absolute", left: 78, right: 78, top: 190 }}>
        <MaskLine delay={135}>
          <div style={{ fontSize: 82, lineHeight: 1.02, fontWeight: 800, letterSpacing: "-0.05em" }}>
            O dinheiro não some.
          </div>
        </MaskLine>
        <MaskLine delay={145}>
          <div style={{ fontSize: 82, lineHeight: 1.02, fontWeight: 800, letterSpacing: "-0.05em", color: YELLOW }}>
            Ele perde poder de compra.
          </div>
        </MaskLine>
      </div>

      <div style={{ position: "absolute", left: 78, right: 78, bottom: 250 }}>
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            height: 440,
            gap: 18,
            borderBottom: "2px solid rgba(255,255,255,0.18)",
            paddingBottom: 0,
          }}
        >
          {BAR_VALUES.map((value, index) => {
            const barProgress = spring({
              frame: frame - 175 - index * 7,
              fps,
              config: { damping: 16, stiffness: 100, mass: 0.8 },
            });
            const height = 400 * (value / 100) * barProgress;
            return (
              <div key={index} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center" }}>
                <div
                  style={{
                    width: "100%",
                    maxWidth: 100,
                    height,
                    borderRadius: "8px 8px 0 0",
                    background: index === BAR_VALUES.length - 1 ? YELLOW : "rgba(250,204,21,0.38)",
                    border: index === BAR_VALUES.length - 1 ? "1px solid #FDE047" : "1px solid rgba(250,204,21,0.25)",
                    transformOrigin: "bottom",
                  }}
                />
                <div style={{ marginTop: 14, color: index === BAR_VALUES.length - 1 ? YELLOW : MUTED, fontSize: 20, fontWeight: 700 }}>
                  {BAR_LABELS[index]}
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ marginTop: 28, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ color: MUTED, fontSize: 22 }}>poder de compra de R$ 100</span>
          <span style={{ color: YELLOW, fontSize: 26, fontWeight: 800 }}>
            -{Math.round(interpolate(chartProgress, [0, 1], [0, 39]))}%
          </span>
        </div>
      </div>
    </Scene>
  );
}

function TenYearsScene() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const draw = spring({
    frame: frame - 330,
    fps,
    config: { damping: 24, stiffness: 55, mass: 1.1 },
  });
  const pathLength = 900;
  const path = "M 0 40 C 120 55, 200 95, 300 110 S 500 190, 620 205 S 760 250, 820 270";

  return (
    <Scene from={300} to={435}>
      <Grid frame={frame} opacity={0.1} />
      <Particles frame={frame} opacity={0.35} />
      <TopLabel frame={frame}>Em 10 anos</TopLabel>

      <div style={{ position: "absolute", left: 78, right: 78, top: 190, display: "flex", alignItems: "flex-start", gap: 30 }}>
        <div>
          <div style={{ color: MUTED, fontSize: 26, fontWeight: 700, letterSpacing: "0.08em" }}>R$ 100</div>
          <div style={{ color: YELLOW, fontSize: 240, lineHeight: 0.9, fontWeight: 900, letterSpacing: "-0.08em" }}>
            10
          </div>
          <div style={{ color: MUTED, fontSize: 30, fontWeight: 700 }}>anos depois</div>
        </div>
        <div style={{ marginLeft: "auto", textAlign: "right", paddingTop: 30 }}>
          <div style={{ color: MUTED, fontSize: 24, fontWeight: 700, letterSpacing: "0.08em" }}>VALEM APROXIMADAMENTE</div>
          <Counter
            from={100}
            to={61}
            delay={330}
            prefix="R$ "
            style={{ display: "block", color: WHITE, fontSize: 170, lineHeight: 1, fontWeight: 900, letterSpacing: "-0.08em" }}
          />
        </div>
      </div>

      <div style={{ position: "absolute", left: 78, right: 78, top: 760 }}>
        <svg viewBox="0 0 900 320" width="100%" height="320" style={{ overflow: "visible" }}>
          {[0, 1, 2, 3].map((line) => (
            <line key={line} x1="0" y1={40 + line * 80} x2="900" y2={40 + line * 80} stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
          ))}
          <path
            d={path}
            fill="none"
            stroke={YELLOW}
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={pathLength}
            strokeDashoffset={interpolate(draw, [0, 1], [pathLength, 0])}
          />
          <circle cx="820" cy="270" r="10" fill={YELLOW} opacity={draw} />
        </svg>
      </div>

      <div style={{ position: "absolute", left: 78, right: 78, bottom: 260 }}>
        <MaskLine delay={365}>
          <div style={{ fontSize: 54, lineHeight: 1.1, fontWeight: 800, letterSpacing: "-0.04em" }}>
            A conta não é sobre o preço.
            <br />
            <span style={{ color: YELLOW }}>É sobre poder de compra.</span>
          </div>
        </MaskLine>
        <Fade delay={390} style={{ marginTop: 24 }}>
          <div style={{ color: MUTED, fontSize: 22 }}>Exemplo hipotético com 5% ao ano. Não é projeção.</div>
        </Fade>
      </div>
    </Scene>
  );
}

function IllusionScene() {
  const frame = useCurrentFrame();
  const band = spring({ frame: frame - 465, fps: 30, config: { damping: 20, stiffness: 60, mass: 1 } });
  return (
    <Scene from={430} to={515}>
      <Grid frame={frame} opacity={0.12} />
      <Particles frame={frame} opacity={0.35} />
      <div
        style={{
          position: "absolute",
          right: -100,
          top: 170,
          fontSize: 520,
          fontWeight: 900,
          letterSpacing: "-0.1em",
          color: "rgba(250,204,21,0.05)",
          lineHeight: 0.8,
        }}
      >
        100
      </div>
      <TopLabel frame={frame}>A ilusão</TopLabel>

      <div style={{ position: "absolute", left: 78, right: 78, top: 290 }}>
        <MaskLine delay={438}>
          <div style={{ fontSize: 74, lineHeight: 1.06, fontWeight: 800, letterSpacing: "-0.045em" }}>
            O problema não é o número.
          </div>
        </MaskLine>
        <MaskLine delay={458}>
          <div style={{ marginTop: 34, fontSize: 74, lineHeight: 1.06, fontWeight: 800, letterSpacing: "-0.045em" }}>
            É a ilusão de que ele está
          </div>
        </MaskLine>
        <div style={{ position: "relative", marginTop: 8, display: "inline-block" }}>
          <div
            style={{
              position: "absolute",
              left: -10,
              right: -20,
              top: "18%",
              bottom: "8%",
              background: YELLOW,
              transform: `scaleX(${band})`,
              transformOrigin: "left center",
              zIndex: 0,
            }}
          />
          <div style={{ position: "relative", zIndex: 1, fontSize: 92, lineHeight: 1, fontWeight: 900, letterSpacing: "-0.06em", color: BG, padding: "4px 12px 8px 0" }}>
            parado.
          </div>
        </div>
        <Fade delay={495} style={{ marginTop: 66 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16, color: MUTED, fontSize: 25 }}>
            <span style={{ width: 52, height: 2, background: YELLOW }} />
            inflação é silenciosa. educação não.
          </div>
        </Fade>
      </div>
    </Scene>
  );
}

function EndScene() {
  const frame = useCurrentFrame();
  const appear = interpolate(frame, [505, 515], [0, 1], CLAMP);
  const fade = appear * interpolate(frame, [555, 570], [1, 0], CLAMP);
  return (
    <AbsoluteFill style={{ background: BG, opacity: fade }}>
      <Grid frame={frame} opacity={0.1} />
      <Particles frame={frame} opacity={0.3} />
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", textAlign: "center" }}>
        <Fade delay={512}>
          <svg viewBox="0 0 40 40" width="76" height="76" style={{ marginBottom: 24 }}>
            <path d="M9 14.8 L29 5.2 L29 12.6 C29 14.5 27.7 15.9 26.0 16.5 L9 22.5 Z" fill={YELLOW} />
            <path d="M9 23.7 L23 17.8 L23 25.0 C23 26.9 21.7 28.3 20.0 28.9 L9 33.0 Z" fill={YELLOW} />
            <path d="M9 14.8 L12.8 13.2 L12.8 33.8 L9 35.2 Z" fill="#EAB308" />
          </svg>
        </Fade>
        <Fade delay={520}>
          <div style={{ fontSize: 58, fontWeight: 900, letterSpacing: "-0.05em" }}>
            Invest <span style={{ color: YELLOW }}>Fácil</span>
          </div>
        </Fade>
        <Fade delay={530} style={{ marginTop: 22 }}>
          <div style={{ color: MUTED, fontSize: 25, letterSpacing: "0.01em" }}>
            Entenda o dinheiro. Depois, o mercado.
          </div>
        </Fade>
        <Fade delay={540} style={{ marginTop: 28 }}>
          <div style={{ width: 120, height: 3, background: YELLOW }} />
        </Fade>
        <Fade delay={548} style={{ marginTop: 24 }}>
          <div style={{ color: MUTED, fontSize: 18, letterSpacing: "0.18em", textTransform: "uppercase" }}>
            educação financeira sem promessas
          </div>
        </Fade>
      </div>
    </AbsoluteFill>
  );
}

export function InvestFacilLab() {
  return (
    <AbsoluteFill style={{ background: BG, fontFamily: FONT, color: WHITE }}>
      <style>{`@font-face { font-family: "Plus Jakarta Sans"; src: url("${staticFile("fonts/PlusJakartaSans.ttf")}") format("truetype"); font-weight: 100 900; font-style: normal; font-display: block; }`}</style>
      <HookScene />
      <InflationScene />
      <TenYearsScene />
      <IllusionScene />
      <EndScene />

      <Sequence from={5}>
        <Audio src={staticFile("audio/narracao-temp.wav")} volume={0.92} />
      </Sequence>

      <Sequence from={0} durationInFrames={30}>
        <Audio src={staticFile("audio/sfx-boom.wav")} volume={0.55} />
      </Sequence>
      <Sequence from={46} durationInFrames={30}>
        <Audio src={staticFile("audio/sfx-whoosh.wav")} volume={0.45} />
      </Sequence>
      <Sequence from={118} durationInFrames={12}>
        <Audio src={staticFile("audio/sfx-click.wav")} volume={0.4} />
      </Sequence>
      <Sequence from={130} durationInFrames={30}>
        <Audio src={staticFile("audio/sfx-boom.wav")} volume={0.35} />
      </Sequence>
      {[180, 195, 210, 225, 240, 255, 270, 285, 300].map((tick) => (
        <Sequence key={tick} from={tick} durationInFrames={8}>
          <Audio src={staticFile("audio/sfx-tick.wav")} volume={0.18} />
        </Sequence>
      ))}
      <Sequence from={338} durationInFrames={30}>
        <Audio src={staticFile("audio/sfx-whoosh.wav")} volume={0.3} />
      </Sequence>
      <Sequence from={430} durationInFrames={20}>
        <Audio src={staticFile("audio/sfx-click.wav")} volume={0.35} />
      </Sequence>
      <Sequence from={510} durationInFrames={40}>
        <Audio src={staticFile("audio/sfx-riser.wav")} volume={0.34} />
      </Sequence>
      <Sequence from={555} durationInFrames={20}>
        <Audio src={staticFile("audio/sfx-boom.wav")} volume={0.4} />
      </Sequence>

      <div
        style={{
          position: "absolute",
          left: 78,
          right: 78,
          bottom: 48,
          display: "flex",
          justifyContent: "space-between",
          color: MUTED,
          fontSize: 16,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          zIndex: 10,
        }}
      >
        <span>Invest Fácil</span>
        <span style={{ color: YELLOW }}>lab 01 · 1080 × 1920 · 30 fps</span>
      </div>
    </AbsoluteFill>
  );
}
