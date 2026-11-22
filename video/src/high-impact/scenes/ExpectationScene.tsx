import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { CameraMovement } from "../CameraMovement";
import { CLAMP, FONT, MUTED, WHITE, YELLOW } from "../constants";
import { KineticText } from "../KineticText";

function ValueCard({ frame }: { frame: number }) {
  const { fps } = useVideoConfig();
  const enter = spring({ frame: frame - 112, fps, config: { damping: 18, stiffness: 90, mass: 0.9 } });
  const focus = spring({ frame: frame - 172, fps, config: { damping: 24, stiffness: 70, mass: 1 } });
  const rotate = interpolate(enter, [0, 1], [-6, -1.5]) + interpolate(focus, [0, 1], [0, 2]);
  const scale = interpolate(enter, [0, 1], [0.78, 1]) * interpolate(focus, [0, 1], [1, 0.96]);
  const opacity = interpolate(enter, [0, 1], [0, 1], CLAMP) * interpolate(focus, [0, 1], [1, 0.78], CLAMP);

  return (
    <div
      style={{
        position: "absolute",
        left: 150,
        top: 330,
        width: 780,
        height: 400,
        borderRadius: 26,
        border: "1px solid rgba(250,204,21,0.30)",
        background: "linear-gradient(135deg, rgba(250,204,21,0.10), rgba(255,255,255,0.025) 55%, rgba(250,204,21,0.06))",
        boxShadow: "0 30px 90px rgba(0,0,0,0.50)",
        transform: `translateY(${interpolate(enter, [0, 1], [60, 0])}px) rotate(${rotate}deg) scale(${scale})`,
        opacity,
        overflow: "hidden",
      }}
    >
      <svg viewBox="0 0 780 400" width="100%" height="100%" style={{ position: "absolute", inset: 0, opacity: 0.55 }}>
        {Array.from({ length: 9 }, (_, index) => (
          <path
            key={index}
            d={`M -40 ${70 + index * 32} C 160 ${20 + index * 32}, 320 ${140 + index * 32}, 500 ${60 + index * 32} S 760 ${120 + index * 32}, 830 ${70 + index * 32}`}
            fill="none"
            stroke="rgba(250,204,21,0.14)"
            strokeWidth="1"
          />
        ))}
        <circle cx="650" cy="80" r="110" fill="none" stroke="rgba(250,204,21,0.11)" strokeWidth="1" />
        <circle cx="650" cy="80" r="80" fill="none" stroke="rgba(250,204,21,0.08)" strokeWidth="1" />
      </svg>
      <div style={{ position: "relative", padding: "38px 44px", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div style={{ color: MUTED, fontSize: 17, fontWeight: 700, letterSpacing: "0.16em" }}>VALOR NOMINAL</div>
          <div style={{ border: "1px solid rgba(250,204,21,0.28)", borderRadius: 999, padding: "6px 12px", color: YELLOW, fontSize: 14, fontWeight: 800, letterSpacing: "0.10em" }}>
            SIMULAÇÃO
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 16 }}>
          <span style={{ color: YELLOW, fontSize: 70, fontWeight: 800, letterSpacing: "-0.06em" }}>R$</span>
          <span style={{ color: WHITE, fontSize: 210, lineHeight: 0.8, fontWeight: 900, letterSpacing: "-0.09em" }}>100</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <div style={{ color: MUTED, fontSize: 20 }}>o número na conta</div>
          <div style={{ color: YELLOW, fontSize: 18, fontWeight: 800, letterSpacing: "0.10em" }}>PODER DE COMPRA?</div>
        </div>
      </div>
    </div>
  );
}

export function ExpectationScene() {
  const frame = useCurrentFrame();
  const split = spring({ frame: frame - 172, fps: 30, config: { damping: 20, stiffness: 85, mass: 1 } });

  return (
    <CameraMovement from={102} to={282} zoomFrom={1.02} zoomTo={1.055} panX={-12} panY={6}>
      <div style={{ position: "absolute", inset: 0, fontFamily: FONT, color: WHITE }}>
        <div style={{ position: "absolute", left: 78, right: 78, top: 150 }}>
          <KineticText
            text="O NÚMERO CONTINUA O MESMO."
            delay={118}
            mode="mask"
            style={{ fontSize: 58, lineHeight: 1.02, fontWeight: 800, letterSpacing: "-0.04em" }}
          />
        </div>

        <ValueCard frame={frame} />

        <div style={{ position: "absolute", left: 78, right: 78, top: 820 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 18, marginBottom: 20 }}>
            <span style={{ width: 46, height: 3, background: YELLOW, transform: `scaleX(${split})`, transformOrigin: "left" }} />
            <span style={{ color: MUTED, fontSize: 20, fontWeight: 700, letterSpacing: "0.14em" }}>A DIFERENÇA</span>
          </div>
          <KineticText
            text={"MAS O PODER\nDE COMPRA NÃO."}
            delay={178}
            mode="word"
            accentWords={["PODER", "DE", "COMPRA"]}
            stagger={4}
            style={{ fontSize: 96, lineHeight: 1.0, fontWeight: 900, letterSpacing: "-0.055em" }}
          />
        </div>

        <div
          style={{
            position: "absolute",
            left: 78,
            right: 78,
            bottom: 120,
            display: "flex",
            justifyContent: "space-between",
            color: MUTED,
            fontSize: 17,
            letterSpacing: "0.10em",
          }}
        >
          <span>valor nominal ≠ valor real</span>
          <span style={{ color: YELLOW }}>o número não conta a história toda</span>
        </div>
      </div>
    </CameraMovement>
  );
}
