import { interpolate, spring, useCurrentFrame } from "remotion";
import { AnimatedNumber } from "../AnimatedNumber";
import { CameraMovement } from "../CameraMovement";
import { FinancialChart } from "../FinancialChart";
import { CLAMP, FONT, MUTED, WHITE, YELLOW } from "../constants";
import { KineticText } from "../KineticText";

export function ExplanationScene() {
  const frame = useCurrentFrame();
  const reveal = spring({ frame: frame - 470, fps: 30, config: { damping: 22, stiffness: 80, mass: 1 } });

  return (
    <CameraMovement from={405} to={624} zoomFrom={1.02} zoomTo={1.06} panY={-8}>
      <div style={{ position: "absolute", inset: 0, padding: "130px 78px 90px", fontFamily: FONT, color: WHITE }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <span style={{ width: 38, height: 3, background: YELLOW }} />
          <span style={{ color: YELLOW, fontSize: 19, fontWeight: 800, letterSpacing: "0.16em" }}>O QUE ACONTECE</span>
        </div>

        <div style={{ marginTop: 20 }}>
          <KineticText
            text={"O dinheiro não some.\nEle compra menos."}
            delay={414}
            mode="word"
            accentWords={["menos"]}
            stagger={3}
            style={{ fontSize: 70, lineHeight: 1.02, fontWeight: 900, letterSpacing: "-0.05em" }}
          />
        </div>

        <div style={{ position: "absolute", left: 70, right: 70, top: 500, height: 470 }}>
          <FinancialChart delay={415} />
        </div>

        <div
          style={{
            position: "absolute",
            left: 78,
            right: 78,
            top: 1000,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
          }}
        >
          <div>
            <div style={{ color: MUTED, fontSize: 18, fontWeight: 700, letterSpacing: "0.14em" }}>DE R$ 100 PARA</div>
            <AnimatedNumber
              from={100}
              to={61.39}
              delay={520}
              duration={55}
              prefix="R$ "
              decimals={2}
              style={{ display: "block", color: YELLOW, fontSize: 112, lineHeight: 0.95, fontWeight: 900, letterSpacing: "-0.08em" }}
            />
          </div>
          <div
            style={{
              border: "1px solid rgba(250,204,21,0.35)",
              borderRadius: 18,
              padding: "16px 20px",
              textAlign: "right",
              opacity: interpolate(reveal, [0, 1], [0, 1], CLAMP),
              transform: `translateY(${interpolate(reveal, [0, 1], [18, 0])}px)`,
            }}
          >
            <div style={{ color: MUTED, fontSize: 16, letterSpacing: "0.10em" }}>EM 10 ANOS</div>
            <div style={{ color: WHITE, fontSize: 42, fontWeight: 900, letterSpacing: "-0.04em" }}>-39%</div>
            <div style={{ color: YELLOW, fontSize: 15, fontWeight: 700 }}>poder de compra</div>
          </div>
        </div>

        <div style={{ position: "absolute", left: 78, right: 78, bottom: 130, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ color: MUTED, fontSize: 17, maxWidth: 620, lineHeight: 1.35 }}>
            Exemplo hipotético com 5% ao ano. Não é projeção nem dado histórico.
          </div>
          <div style={{ color: YELLOW, fontSize: 17, fontWeight: 800, letterSpacing: "0.12em" }}>SIMULAÇÃO</div>
        </div>
      </div>
    </CameraMovement>
  );
}
