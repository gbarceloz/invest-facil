import type { ReactNode } from "react";
import { AbsoluteFill, interpolate, Sequence, useCurrentFrame } from "remotion";
import { CameraMovement } from "../CameraMovement";
import { CLAMP, FONT, MUTED, WHITE, YELLOW } from "../constants";
import { KineticText } from "../KineticText";

function Group({ duration, children }: { duration: number; children: ReactNode }) {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 7, duration - 8, duration], [0, 1, 1, 0], CLAMP);
  const rise = interpolate(frame, [0, 10], [18, 0], CLAMP);
  return (
    <AbsoluteFill style={{ opacity, transform: `translateY(${rise}px)` }}>
      {children}
    </AbsoluteFill>
  );
}

export function ImpactScene() {
  const frame = useCurrentFrame();
  const flash = interpolate(frame, [824, 826, 830], [0, 0.65, 0], CLAMP);
  const edge = interpolate(frame, [890, 912], [0, 1], CLAMP);
  const shake = frame >= 824 && frame < 840 ? Math.sin(frame * 2.7) * 10 : 0;

  return (
    <CameraMovement from={624} to={912} zoomFrom={1.01} zoomTo={1.10} panX={14} panY={-18}>
      <AbsoluteFill style={{ fontFamily: FONT, color: WHITE, overflow: "hidden" }}>
        <div
          style={{
            position: "absolute",
            left: -10,
            right: -40,
            top: 360,
            fontSize: 250,
            fontWeight: 900,
            lineHeight: 0.78,
            letterSpacing: "-0.10em",
            color: "rgba(250,204,21,0.032)",
            transform: `translateY(${interpolate(frame, [624, 912], [40, -50], CLAMP)}px) rotate(-6deg)`,
            whiteSpace: "nowrap",
          }}
        >
          INFLAÇÃO
        </div>
        <div
          style={{
            position: "absolute",
            left: -20,
            top: 100,
            width: 980,
            height: 780,
            background:
              "linear-gradient(90deg, rgba(5,5,5,0.94) 0%, rgba(5,5,5,0.82) 48%, rgba(5,5,5,0.18) 100%)",
            filter: "blur(2px)",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: 70,
            right: 70,
            top: 150,
            height: 2,
            background: "rgba(250,204,21,0.20)",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: 76,
            top: 132,
            color: YELLOW,
            fontSize: 18,
            fontWeight: 800,
            letterSpacing: "0.18em",
          }}
        >
          O CUSTO INVISÍVEL
        </div>

        <div style={{ position: "absolute", left: 78, right: 78, top: 220, bottom: 160, transform: `translateX(${shake}px)` }}>
          <Sequence from={624} durationInFrames={60} layout="none">
            <Group duration={60}>
              <div style={{ position: "absolute", top: 120, left: 0, right: 0 }}>
                <KineticText
                  text="NÃO É SOBRE O NÚMERO."
                  delay={2}
                  mode="mask"
                  style={{ fontSize: 82, lineHeight: 1.0, fontWeight: 900, letterSpacing: "-0.055em" }}
                />
              </div>
            </Group>
          </Sequence>

          <Sequence from={678} durationInFrames={62} layout="none">
            <Group duration={62}>
              <div style={{ position: "absolute", top: 110, left: 0, right: 0 }}>
                <KineticText
                  text={"É SOBRE O QUE\nELE COMPRA."}
                  delay={2}
                  mode="word"
                  accentWords={["COMPRA"]}
                  stagger={4}
                  style={{ fontSize: 96, lineHeight: 0.98, fontWeight: 900, letterSpacing: "-0.06em" }}
                />
              </div>
            </Group>
          </Sequence>

          <Sequence from={733} durationInFrames={88} layout="none">
            <Group duration={88}>
              <div style={{ position: "absolute", top: 120, left: 0, right: 0 }}>
                <KineticText
                  text={"ENTENDER A\nINFLAÇÃO IMPORTA."}
                  delay={2}
                  mode="tracking"
                  style={{ fontSize: 66, lineHeight: 1.05, fontWeight: 900, letterSpacing: "-0.04em" }}
                />
              </div>
            </Group>
          </Sequence>

          <Sequence from={824} durationInFrames={88} layout="none">
            <Group duration={88}>
              <div style={{ position: "absolute", top: 66, left: 0, right: 0 }}>
                <div style={{ color: YELLOW, fontSize: 18, fontWeight: 800, letterSpacing: "0.16em", marginBottom: 22 }}>
                  A FRASE QUE FICA
                </div>
                <KineticText
                  text={"DEIXAR DE ENTENDER\nTAMBÉM TEM UM\nCUSTO."}
                  delay={2}
                  mode="mask"
                  accentWords={["CUSTO."]}
                  style={{ fontSize: 88, lineHeight: 0.98, fontWeight: 900, letterSpacing: "-0.06em" }}
                />
              </div>
            </Group>
          </Sequence>
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
            letterSpacing: "0.12em",
            textTransform: "uppercase",
          }}
        >
          <span>inflação é silenciosa</span>
          <span style={{ color: YELLOW }}>educação não</span>
        </div>

        <div style={{ position: "absolute", inset: 0, background: "#FACC15", opacity: flash, pointerEvents: "none" }} />
        <div style={{ position: "absolute", inset: 0, background: "#050505", opacity: edge, pointerEvents: "none" }} />
      </AbsoluteFill>
    </CameraMovement>
  );
}
