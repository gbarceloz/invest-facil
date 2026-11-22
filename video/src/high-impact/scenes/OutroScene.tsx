import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { CameraMovement } from "../CameraMovement";
import { CLAMP, FONT, MUTED, WHITE, YELLOW } from "../constants";
import { KineticText } from "../KineticText";
import { LogoReveal } from "../LogoReveal";

export function OutroScene() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const statementOut = interpolate(frame, [1054, 1066], [1, 0], CLAMP);
  const logoIn = interpolate(frame, [1066, 1078], [0, 1], CLAMP);
  const cta = spring({ frame: frame - 1138, fps, config: { damping: 22, stiffness: 90, mass: 0.9 } });
  const fade = interpolate(frame, [1190, 1200], [1, 0], CLAMP);

  return (
    <CameraMovement from={912} to={1200} zoomFrom={1.04} zoomTo={0.99} panY={8}>
      <div style={{ position: "absolute", inset: 0, fontFamily: FONT, color: WHITE, opacity: fade }}>
        <div
          style={{
            position: "absolute",
            left: 78,
            right: 78,
            top: 250,
            opacity: statementOut,
            transform: `translateY(${interpolate(statementOut, [0, 1], [0, -26])}px)`,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24 }}>
            <span style={{ width: 42, height: 3, background: YELLOW }} />
            <span style={{ color: YELLOW, fontSize: 18, fontWeight: 800, letterSpacing: "0.16em" }}>O PRIMEIRO PASSO</span>
          </div>
          <KineticText
            text={"ENTENDER O DINHEIRO\nÉ O PRIMEIRO PASSO\nPARA DECISÕES MELHORES."}
            delay={920}
            mode="word"
            accentWords={["DINHEIRO", "MELHORES."]}
            stagger={3}
            style={{ fontSize: 72, lineHeight: 1.04, fontWeight: 900, letterSpacing: "-0.05em" }}
          />
          <div
            style={{
              marginTop: 34,
              color: MUTED,
              fontSize: 23,
              maxWidth: 760,
              lineHeight: 1.35,
              opacity: interpolate(frame, [980, 1010], [0, 1], CLAMP),
            }}
          >
            Não é sobre prever o futuro. É sobre entender o que está acontecendo com o seu dinheiro.
          </div>
        </div>

        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            opacity: logoIn,
            transform: `scale(${interpolate(logoIn, [0, 1], [0.96, 1])})`,
          }}
        >
          <LogoReveal delay={1066} />
        </div>

        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 210,
            display: "flex",
            justifyContent: "center",
            opacity: cta,
            transform: `translateY(${interpolate(cta, [0, 1], [16, 0])}px)`,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              border: "1px solid rgba(250,204,21,0.32)",
              borderRadius: 999,
              padding: "13px 24px",
              color: YELLOW,
              fontSize: 19,
              fontWeight: 800,
              letterSpacing: "0.04em",
            }}
          >
            Conheça a plataforma
            <span style={{ fontSize: 24, lineHeight: 1 }}>→</span>
          </div>
        </div>

        <div
          style={{
            position: "absolute",
            left: 78,
            right: 78,
            bottom: 90,
            display: "flex",
            justifyContent: "space-between",
            color: MUTED,
            fontSize: 15,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
          }}
        >
          <span>Invest Fácil</span>
          <span>1080 × 1920 · 30 fps</span>
        </div>
      </div>
    </CameraMovement>
  );
}
