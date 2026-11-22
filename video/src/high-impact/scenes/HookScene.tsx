import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { CameraMovement } from "../CameraMovement";
import { CLAMP, FONT, MUTED, WHITE, YELLOW } from "../constants";

export function HookScene() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const slam = spring({ frame: frame + 6, fps, config: { damping: 11, stiffness: 115, mass: 0.85 } });
  const today = spring({ frame: frame - 24, fps, config: { damping: 18, stiffness: 110, mass: 0.8 } });
  const sub = spring({ frame: frame - 44, fps, config: { damping: 22, stiffness: 90, mass: 0.9 } });
  const flash = interpolate(frame, [0, 2], [0.05, 0], CLAMP);

  return (
    <CameraMovement from={0} to={102} zoomFrom={1.02} zoomTo={1.075} panY={-10}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "0 78px",
          fontFamily: FONT,
          color: WHITE,
        }}
      >
        <div
          style={{
            position: "absolute",
            right: -80,
            top: 300,
            fontSize: 360,
            fontWeight: 900,
            letterSpacing: "-0.08em",
            color: "rgba(255,255,255,0.035)",
            lineHeight: 0.8,
            transform: `translateY(${interpolate(frame, [0, 102], [40, -30], CLAMP)}px)`,
          }}
        >
          HOJE
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 18, marginBottom: 22 }}>
          <span style={{ width: 54, height: 3, background: YELLOW }} />
          <span style={{ color: YELLOW, fontSize: 21, fontWeight: 800, letterSpacing: "0.18em" }}>INVEST FÁCIL · 01</span>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            gap: 18,
            transform: `scale(${interpolate(slam, [0, 1], [0.45, 1])}) rotate(${interpolate(
              slam,
              [0, 1],
              [-7, 0],
            )}deg)`,
            transformOrigin: "left center",
            opacity: interpolate(slam, [0, 0.2], [0, 1], CLAMP),
          }}
        >
          <span style={{ color: YELLOW, fontSize: 94, fontWeight: 800, letterSpacing: "-0.07em" }}>R$</span>
          <span
            style={{
              fontSize: 392,
              lineHeight: 0.78,
              fontWeight: 900,
              letterSpacing: "-0.10em",
              textShadow: "0 0 110px rgba(250,204,21,0.18)",
            }}
          >
            100
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 24, marginTop: 18 }}>
          <div
            style={{
              width: interpolate(slam, [0, 1], [0, 300], CLAMP),
              height: 8,
              background: YELLOW,
            }}
          />
          <div
            style={{
              opacity: interpolate(today, [0, 0.3], [0, 1], CLAMP),
              transform: `translateY(${interpolate(today, [0, 1], [26, 0])}px)`,
              color: WHITE,
              fontSize: 92,
              fontWeight: 900,
              letterSpacing: `${interpolate(today, [0, 1], [0.22, 0.02])}em`,
            }}
          >
            HOJE
          </div>
        </div>

        <div
          style={{
            marginTop: 46,
            maxWidth: 850,
            opacity: interpolate(sub, [0, 0.35], [0, 1], CLAMP),
            transform: `translateY(${interpolate(sub, [0, 1], [24, 0])}px)`,
            color: MUTED,
            fontSize: 36,
            lineHeight: 1.2,
            fontWeight: 600,
          }}
        >
          Podem valer muito menos
          <br />
          <span style={{ color: WHITE }}>do que você imagina.</span>
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
            fontSize: 16,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
          }}
        >
          <span>uma explicação visual</span>
          <span style={{ color: YELLOW }}>simulação</span>
        </div>
      </div>
      <div style={{ position: "absolute", inset: 0, background: WHITE, opacity: flash, pointerEvents: "none" }} />
    </CameraMovement>
  );
}
