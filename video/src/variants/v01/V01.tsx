import type { ReactNode } from "react";
import { AbsoluteFill, Audio, interpolate, staticFile, useCurrentFrame } from "remotion";
import { BackgroundEffects } from "../../high-impact/BackgroundEffects";
import { KineticText } from "../../high-impact/KineticText";
import { SoundEffect } from "../../high-impact/SoundEffect";
import { SCENES, T } from "./data";
import {
  BasketBlocks,
  EndCardGraphic,
  Note100,
  PriceCard,
  PriceIcon,
  ProgressLine,
  SimulationPanel,
  SplitCompare,
  TickerColumn,
  TopLabel,
} from "./graphics";
import { BG, CLAMP, FONT, HEIGHT, MUTED, PRODUCTS, WHITE, WIDTH, YELLOW } from "./data";

const NARRATION = staticFile("projects/investfacil-10-creative-variants/v01/narration/narracao.wav");
const MUSIC = staticFile("projects/investfacil-10-creative-variants/v01/music.wav");
const SFX = "projects/investfacil-10-creative-variants/v01/sfx";

function MusicTrack() {
  const frame = useCurrentFrame();
  const t = frame / 30;
  const fadeIn = interpolate(t, [0, 0.5], [0, 1], CLAMP);
  const fadeOut = interpolate(t, [33.0, 34.0], [1, 0], CLAMP);
  const duck = interpolate(
    t,
    [0, 0.4, 3.2, 3.5, 8.1, 8.4, 12.2, 12.5, 18.0, 18.3, 24.2, 24.5, 30.0, 30.3, 33.0],
    [1, 1, 0.85, 1, 0.88, 1, 0.82, 1, 0.82, 1, 0.86, 1, 0.82, 1, 0.8],
    CLAMP,
  );
  return <Audio src={MUSIC} volume={() => 0.20 * duck * fadeIn * fadeOut} />;
}

function CutScene({ from, to, zIndex = 0, children }: { from: number; to: number; zIndex?: number; children: ReactNode }) {
  const frame = useCurrentFrame();
  if (frame < from || frame >= to) {
    return null;
  }
  return <AbsoluteFill style={{ zIndex }}>{children}</AbsoluteFill>;
}

function WhipStreak({ at, direction = 1 }: { at: number; direction?: 1 | -1 }) {
  const frame = useCurrentFrame();
  const local = frame - at * 30;
  if (local < -3 || local > 9) {
    return null;
  }
  const x = interpolate(local, [-3, 9], [-30, 130], CLAMP) * direction;
  const opacity = interpolate(local, [-3, 0, 9], [0, 0.7, 0], CLAMP);
  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        bottom: 0,
        left: `${x}%`,
        width: "18%",
        background: "linear-gradient(90deg, rgba(250,204,21,0) 0%, rgba(250,204,21,0.22) 50%, rgba(250,204,21,0) 100%)",
        filter: "blur(12px)",
        opacity,
        zIndex: 220,
        pointerEvents: "none",
      }}
    />
  );
}

function HookScene() {
  const frame = useCurrentFrame();
  const enter = interpolate(frame, [0, 10], [0, 1], CLAMP);
  const noteScale = interpolate(frame, [0, 18, 30], [0.96, 1, 1.035], CLAMP);
  const punch = interpolate(frame, [22, 34], [1, 1.04], CLAMP);

  return (
    <AbsoluteFill style={{ fontFamily: FONT, overflow: "hidden" }}>
      <TickerColumn left={-6} speed={1.05} opacity={0.18} width={360} blur={2} />
      <TickerColumn left={780} speed={0.85} direction={-1} opacity={0.14} width={360} blur={3} />

      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(180deg, #050505 0%, rgba(5,5,5,0.92) 9%, rgba(5,5,5,0) 24%), linear-gradient(0deg, #050505 0%, rgba(5,5,5,0.9) 10%, rgba(5,5,5,0) 28%), radial-gradient(ellipse at 50% 48%, rgba(5,5,5,0.55) 0%, rgba(5,5,5,0.05) 62%, rgba(5,5,5,0.55) 100%)",
          zIndex: 2,
        }}
      />

      <div
        style={{
          position: "absolute",
          top: 292,
          left: 70,
          right: 120,
          color: MUTED,
          fontSize: 26,
          fontWeight: 700,
          letterSpacing: "0.16em",
          opacity: enter,
        }}
      >
        O NÚMERO NÃO CONTA A HISTÓRIA TODA
      </div>

      <div
        style={{
          position: "absolute",
          top: 344,
          left: 70,
          right: 120,
          opacity: 1,
        }}
      >
        <div style={{ color: WHITE, fontSize: 78, fontWeight: 900, letterSpacing: "-0.06em", lineHeight: 1.08 }}>R$ 100</div>
      </div>

      <div
        style={{
          position: "absolute",
          top: 500,
          left: 70,
          right: 120,
          opacity: interpolate(frame, [12, 20], [0, 1], CLAMP),
        }}
      >
        <KineticText
          text="NÃO É IMPRESSÃO."
          mode="word"
          accentWords={["IMPRESSÃO."]}
          delay={12}
          stagger={2}
          style={{ fontSize: 64, fontWeight: 900, letterSpacing: "-0.05em", lineHeight: 1.08 }}
        />
      </div>

      <div
        style={{
          position: "absolute",
          top: 820,
          left: 160,
          right: 160,
          display: "flex",
          justifyContent: "center",
          transform: `scale(${noteScale * punch}) rotate(-2.4deg)`,
          opacity: 1,
          zIndex: 3,
        }}
      >
        <Note100 />
      </div>

      <div
        style={{
          position: "absolute",
          left: 70,
          top: 1300,
          width: 250,
          height: 3,
          background: YELLOW,
          opacity: enter,
          transform: `scaleX(${interpolate(frame, [8, 26], [0, 1], CLAMP)})`,
          transformOrigin: "left center",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 70,
          top: 1324,
          color: MUTED,
          fontSize: 23,
          letterSpacing: "0.12em",
          opacity: enter,
        }}
      >
        PREÇOS EM MOVIMENTO. NOTA PARADA.
      </div>
    </AbsoluteFill>
  );
}

function PricesScene() {
  const frame = useCurrentFrame();
  const enter = interpolate(frame, [0, 10], [0, 1], CLAMP);

  return (
    <AbsoluteFill style={{ fontFamily: FONT, overflow: "hidden" }}>
      <TickerColumn left={-4} speed={2.1} opacity={0.55} width={390} />
      <TickerColumn left={720} speed={1.65} direction={-1} opacity={0.40} width={390} blur={0.6} />

      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(180deg, #050505 0%, rgba(5,5,5,0.92) 9%, rgba(5,5,5,0) 24%), linear-gradient(0deg, #050505 0%, rgba(5,5,5,0.9) 10%, rgba(5,5,5,0) 28%), linear-gradient(90deg, #050505 0%, #050505 52%, rgba(5,5,5,0.62) 70%, rgba(5,5,5,0) 90%), radial-gradient(ellipse at 50% 47%, rgba(5,5,5,0.55) 0%, rgba(5,5,5,0.12) 58%, rgba(5,5,5,0.05) 78%)",
          zIndex: 2,
        }}
      />

      <div style={{ position: "absolute", top: 610, left: 70, right: 120, zIndex: 3, opacity: enter }}>
        <div style={{ color: YELLOW, fontSize: 24, fontWeight: 900, letterSpacing: "0.18em" }}>O QUE MUDOU</div>
        <KineticText
          text={"OS PREÇOS\nSE MOVEM."}
          mode="word"
          accentWords={["MOVEM."]}
          stagger={3}
          style={{ fontSize: 92, fontWeight: 900, letterSpacing: "-0.06em", lineHeight: 1.06, marginTop: 12 }}
        />
      </div>

      <div style={{ position: "absolute", left: 70, bottom: 300, zIndex: 3, color: MUTED, fontSize: 24, letterSpacing: "0.12em" }}>
        ÍNDICE HIPOTÉTICO · EXEMPLO DIDÁTICO
      </div>
    </AbsoluteFill>
  );
}

function SameScene() {
  const frame = useCurrentFrame();
  const enter = interpolate(frame, [0, 10], [0, 1], CLAMP);
  const punch = interpolate(frame, [26, 40], [1, 1.045], CLAMP);

  return (
    <AbsoluteFill style={{ fontFamily: FONT, overflow: "hidden" }}>
      <div style={{ position: "absolute", top: 300, left: 70, right: 120, opacity: enter }}>
        <div style={{ color: MUTED, fontSize: 24, fontWeight: 800, letterSpacing: "0.16em" }}>A NOTA NÃO MUDA</div>
        <KineticText
          text="MESMO NÚMERO."
          mode="word"
          accentWords={["NÚMERO."]}
          style={{ fontSize: 82, fontWeight: 900, letterSpacing: "-0.06em", lineHeight: 1.08, marginTop: 10 }}
        />
      </div>

      <div
        style={{
          position: "absolute",
          top: 740,
          left: 70,
          transform: `scale(${punch})`,
          transformOrigin: "left center",
        }}
      >
        <Note100 width={500} height={278} />
        <div style={{ marginTop: 18, color: WHITE, fontSize: 40, fontWeight: 900 }}>R$ 100</div>
      </div>

      <div style={{ position: "absolute", top: 700, left: 620, right: 0, height: 1000, overflow: "hidden", opacity: 0.75 }}>
        <TickerColumn left={0} speed={1.8} opacity={1} width={400} />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(90deg, rgba(5,5,5,0.95) 0%, rgba(5,5,5,0.1) 22%, rgba(5,5,5,0.1) 78%, rgba(5,5,5,0.95) 100%), linear-gradient(180deg, rgba(5,5,5,0.98) 0%, rgba(5,5,5,0) 14%, rgba(5,5,5,0) 86%, rgba(5,5,5,0.98) 100%)",
          }}
        />
      </div>

      <div style={{ position: "absolute", left: 70, bottom: 300, color: YELLOW, fontSize: 30, fontWeight: 800, letterSpacing: "0.10em" }}>
        OS PREÇOS, NÃO.
      </div>
    </AbsoluteFill>
  );
}

function LessScene() {
  const frame = useCurrentFrame();
  const local = frame - SCENES.less.from;
  const enter = interpolate(local, [0, 10], [0, 1], CLAMP);
  const words = ["CAFÉ", "PÃO", "TRANSPORTE"];
  const active = local < 34 ? 0 : local < 72 ? 1 : 2;

  return (
    <AbsoluteFill style={{ fontFamily: FONT, overflow: "hidden" }}>
      <div style={{ position: "absolute", top: 220, left: 70, right: 120, opacity: enter }}>
        <div style={{ color: YELLOW, fontSize: 24, fontWeight: 900, letterSpacing: "0.18em" }}>EXEMPLO DIDÁTICO</div>
        <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 2 }}>
          {words.map((word, index) => (
            <div
              key={word}
              style={{
                color: index === active ? YELLOW : index < active ? MUTED : "rgba(255,255,255,0.38)",
                fontSize: 58,
                fontWeight: 900,
                letterSpacing: "-0.05em",
                lineHeight: 1.08,
              }}
            >
              MENOS {word}.
            </div>
          ))}
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          top: 620,
          left: 110,
          display: "flex",
          flexDirection: "column",
          gap: 24,
        }}
      >
        {PRODUCTS.map((product, index) => (
          <PriceCard key={product.name} product={product} index={index} sceneStart={SCENES.less.from} />
        ))}
      </div>

      <div style={{ position: "absolute", left: 70, bottom: 300, color: MUTED, fontSize: 22, lineHeight: 1.4 }}>
        Valores hipotéticos para explicar o conceito.
        <br />
        Não representam preços reais.
      </div>
    </AbsoluteFill>
  );
}

function InflationScene() {
  const frame = useCurrentFrame();
  const local = frame;
  const shake = local < 12 ? Math.sin(local * 7) * 8 * (1 - local / 12) : 0;
  const bar = interpolate(local, [0, 12], [0, 1], CLAMP);

  return (
    <AbsoluteFill style={{ fontFamily: FONT, overflow: "hidden", alignItems: "center", justifyContent: "center" }}>
      <div
        style={{
          position: "absolute",
          width: 980,
          height: 260,
          background: "rgba(250,204,21,0.10)",
          transform: `scaleX(${bar}) rotate(-3deg)`,
          filter: "blur(2px)",
        }}
      />
      <div style={{ transform: `translateX(${shake}px)`, textAlign: "center", zIndex: 2 }}>
        <div style={{ color: WHITE, fontSize: 176, fontWeight: 900, letterSpacing: "-0.09em", lineHeight: 0.95 }}>INFLAÇÃO</div>
        <div style={{ marginTop: 28, color: YELLOW, fontSize: 28, fontWeight: 800, letterSpacing: "0.18em" }}>
          A ALTA GENERALIZADA DOS PREÇOS
        </div>
      </div>

      {local < 18 ? (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "repeating-linear-gradient(0deg, rgba(250,204,21,0.05) 0px, rgba(250,204,21,0.05) 2px, transparent 2px, transparent 7px)",
            opacity: 0.5 * (1 - local / 18),
            zIndex: 3,
          }}
        />
      ) : null}
    </AbsoluteFill>
  );
}

function PowerScene() {
  const frame = useCurrentFrame();
  const enter = interpolate(frame, [0, 10], [0, 1], CLAMP);
  const punch = interpolate(frame, [34, 70, 112], [1, 1.09, 1], CLAMP);

  return (
    <AbsoluteFill style={{ fontFamily: FONT, overflow: "hidden" }}>
      <div style={{ position: "absolute", top: 270, left: 70, right: 120, opacity: enter }}>
        <div style={{ color: YELLOW, fontSize: 24, fontWeight: 900, letterSpacing: "0.18em" }}>O QUE ACONTECE</div>
        <KineticText
          text="PODER DE COMPRA"
          mode="word"
          accentWords={["COMPRA"]}
          style={{ fontSize: 82, fontWeight: 900, letterSpacing: "-0.06em", lineHeight: 1.08, marginTop: 12 }}
        />
      </div>

      <div
        style={{
          position: "absolute",
          top: 790,
          left: 80,
          right: 80,
          display: "flex",
          justifyContent: "center",
          transform: `scale(${punch})`,
        }}
      >
        <BasketBlocks sceneStart={SCENES.power.from} />
      </div>

      <div style={{ position: "absolute", left: 70, right: 160, bottom: 300, color: WHITE, fontSize: 32, fontWeight: 700, lineHeight: 1.3 }}>
        A mesma quantia compra
        <br />
        <span style={{ color: YELLOW }}>menos do que antes.</span>
      </div>
    </AbsoluteFill>
  );
}

function SimulationScene() {
  const frame = useCurrentFrame();
  const enter = interpolate(frame, [0, 10], [0, 1], CLAMP);
  return (
    <AbsoluteFill style={{ fontFamily: FONT, overflow: "hidden", alignItems: "center", justifyContent: "center" }}>
      <div style={{ position: "absolute", top: 250, left: 70, right: 120, opacity: enter }}>
        <div style={{ color: MUTED, fontSize: 24, fontWeight: 800, letterSpacing: "0.16em" }}>A CONTA</div>
        <div style={{ color: WHITE, fontSize: 52, fontWeight: 900, letterSpacing: "-0.04em", marginTop: 6 }}>
          R$ 100 <span style={{ color: MUTED }}>em dez anos</span>
        </div>
      </div>
      <SimulationPanel sceneStart={SCENES.simulation.from} />
    </AbsoluteFill>
  );
}

function SamePowerScene() {
  const frame = useCurrentFrame();
  const enter = interpolate(frame, [0, 10], [0, 1], CLAMP);
  const punch = interpolate(frame, [40, 60], [1, 1.035], CLAMP);
  return (
    <AbsoluteFill style={{ fontFamily: FONT, overflow: "hidden" }}>
      <div style={{ position: "absolute", top: 290, left: 70, right: 120, opacity: enter }}>
        <div style={{ color: MUTED, fontSize: 24, fontWeight: 800, letterSpacing: "0.16em" }}>O CONTRASTE</div>
        <div style={{ color: WHITE, fontSize: 52, fontWeight: 900, letterSpacing: "-0.04em", marginTop: 8 }}>
          O número é o mesmo.
        </div>
      </div>
      <div style={{ position: "absolute", top: 600, left: 70, transform: `scale(${punch})`, transformOrigin: "left center" }}>
        <SplitCompare sceneStart={SCENES.samePower.from} />
      </div>
      <div style={{ position: "absolute", left: 70, right: 160, top: 1080, color: YELLOW, fontSize: 44, fontWeight: 900, letterSpacing: "-0.02em" }}>
        O poder de compra, não.
      </div>
    </AbsoluteFill>
  );
}

function FirstStepScene() {
  const frame = useCurrentFrame();
  const enter = interpolate(frame, [0, 12], [0, 1], CLAMP);
  const line = interpolate(frame, [12, 38], [0, 1], CLAMP);
  return (
    <AbsoluteFill style={{ fontFamily: FONT, alignItems: "center", justifyContent: "center", textAlign: "center" }}>
      <div style={{ maxWidth: 840, opacity: enter, transform: `translateY(${interpolate(enter, [0, 1], [24, 0])}px)` }}>
        <div style={{ color: MUTED, fontSize: 24, fontWeight: 800, letterSpacing: "0.18em" }}>O PRIMEIRO PASSO</div>
        <div style={{ marginTop: 18, color: WHITE, fontSize: 70, fontWeight: 900, letterSpacing: "-0.055em", lineHeight: 1.06 }}>
          ENTENDER
          <br />
          <span style={{ color: YELLOW }}>É O PRIMEIRO PASSO.</span>
        </div>
      </div>
      <div style={{ marginTop: 42, width: 520 * line, height: 4, background: YELLOW }} />
      <div style={{ marginTop: 34, color: MUTED, fontSize: 24, letterSpacing: "0.14em", opacity: line }}>
        INVEST FÁCIL
      </div>
    </AbsoluteFill>
  );
}

function EndScene() {
  return (
    <AbsoluteFill style={{ fontFamily: FONT }}>
      <EndCardGraphic sceneStart={SCENES.end.from} />
    </AbsoluteFill>
  );
}

export function InvestFacilV01() {
  return (
    <AbsoluteFill style={{ background: BG, fontFamily: FONT, color: WHITE }}>
      <style>{`@font-face { font-family: "Plus Jakarta Sans"; src: url("${staticFile(
        "fonts/PlusJakartaSans.ttf",
      )}") format("truetype"); font-weight: 100 900; font-style: normal; font-display: block; }`}</style>

      <BackgroundEffects intensity={0.62} />
      <TopLabel />
      <ProgressLine />

      <CutScene from={SCENES.hook.from} to={SCENES.hook.to} zIndex={10}>
        <HookScene />
      </CutScene>
      <CutScene from={SCENES.prices.from} to={SCENES.prices.to} zIndex={20}>
        <PricesScene />
      </CutScene>
      <CutScene from={SCENES.same.from} to={SCENES.same.to} zIndex={30}>
        <SameScene />
      </CutScene>
      <CutScene from={SCENES.less.from} to={SCENES.less.to} zIndex={40}>
        <LessScene />
      </CutScene>
      <CutScene from={SCENES.inflation.from} to={SCENES.inflation.to} zIndex={50}>
        <InflationScene />
      </CutScene>
      <CutScene from={SCENES.power.from} to={SCENES.power.to} zIndex={60}>
        <PowerScene />
      </CutScene>
      <CutScene from={SCENES.simulation.from} to={SCENES.simulation.to} zIndex={70}>
        <SimulationScene />
      </CutScene>
      <CutScene from={SCENES.samePower.from} to={SCENES.samePower.to} zIndex={80}>
        <SamePowerScene />
      </CutScene>
      <CutScene from={SCENES.firstStep.from} to={SCENES.firstStep.to} zIndex={90}>
        <FirstStepScene />
      </CutScene>
      <CutScene from={SCENES.end.from} to={SCENES.end.to} zIndex={100}>
        <EndScene />
      </CutScene>

      <WhipStreak at={T.prices} />
      <WhipStreak at={T.less} direction={-1} />
      <WhipStreak at={T.inflation} />

      <Audio src={NARRATION} volume={1} />
      <MusicTrack />

      <SoundEffect base={SFX} file="impact.wav" at={0.0} volume={0.42} />
      <SoundEffect base={SFX} file="whoosh.wav" at={0.35} volume={0.24} />
      <SoundEffect base={SFX} file="click.wav" at={2.1} volume={0.13} />
      <SoundEffect base={SFX} file="whoosh.wav" at={3.331} volume={0.26} />
      <SoundEffect base={SFX} file="click.wav" at={5.664} volume={0.14} />
      <SoundEffect base={SFX} file="whoosh.wav" at={8.206} volume={0.24} />
      <SoundEffect base={SFX} file="whoosh.wav" at={9.33} volume={0.18} />
      <SoundEffect base={SFX} file="whoosh.wav" at={10.47} volume={0.16} />
      <SoundEffect base={SFX} file="bass-hit.wav" at={12.331} volume={0.34} />
      <SoundEffect base={SFX} file="sub-drop.wav" at={12.331} volume={0.28} />
      <SoundEffect base={SFX} file="riser.wav" at={13.3} volume={0.14} />
      <SoundEffect base={SFX} file="whoosh.wav" at={13.829} volume={0.16} />
      <SoundEffect base={SFX} file="click.wav" at={14.1} volume={0.08} />
      <SoundEffect base={SFX} file="click.wav" at={14.4} volume={0.08} />
      <SoundEffect base={SFX} file="click.wav" at={14.7} volume={0.08} />
      <SoundEffect base={SFX} file="click.wav" at={15.0} volume={0.08} />
      <SoundEffect base={SFX} file="stamp.wav" at={18.07} volume={0.42} />
      <SoundEffect base={SFX} file="riser.wav" at={18.9} volume={0.16} />
      <SoundEffect base={SFX} file="tick.wav" at={19.6} volume={0.06} />
      <SoundEffect base={SFX} file="tick.wav" at={20.6} volume={0.06} />
      <SoundEffect base={SFX} file="tick.wav" at={21.6} volume={0.06} />
      <SoundEffect base={SFX} file="tick.wav" at={22.6} volume={0.06} />
      <SoundEffect base={SFX} file="impact.wav" at={23.2} volume={0.34} />
      <SoundEffect base={SFX} file="impact-short.wav" at={24.328} volume={0.36} />
      <SoundEffect base={SFX} file="riser.wav" at={27.9} volume={0.18} />
      <SoundEffect base={SFX} file="impact.wav" at={30.034} volume={0.42} />
      <SoundEffect base={SFX} file="ui-pop.wav" at={30.4} volume={0.14} />
      <SoundEffect base={SFX} file="sweep.wav" at={33.2} volume={0.12} />
    </AbsoluteFill>
  );
}
