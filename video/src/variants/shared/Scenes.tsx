import { AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { KineticText } from "../../high-impact/KineticText";
import { LogoReveal } from "../../high-impact/LogoReveal";
import { CLAMP, FONT, MUTED, WHITE, YELLOW } from "../v01/data";
import { Motif } from "./Motifs";
import type { SceneSpec, SplitSide } from "./types";

const motifWidth: Record<string, number> = {
  note: 620,
  cup: 520,
  receipt: 440,
  machine: 820,
  timer: 330,
  chat: 680,
  mirror: 500,
  salary: 480,
  line: 700,
  basket: 620,
};

function titleSize(title: string, base = 84) {
  if (title.length > 48) return base * 0.62;
  if (title.length > 34) return base * 0.72;
  if (title.length > 24) return base * 0.84;
  return base;
}

function Eyebrow({ children }: { children: string }) {
  return <div style={{ color: YELLOW, fontSize: 22, fontWeight: 900, letterSpacing: "0.18em" }}>{children}</div>;
}

export function HookScene({ scene, local }: { scene: SceneSpec; local: number }) {
  const enter = interpolate(local, [0, 12], [0, 1], CLAMP);
  const width = scene.motif ? motifWidth[scene.motif] : 600;
  const size = titleSize(scene.title, 88);

  return (
    <AbsoluteFill style={{ fontFamily: FONT, overflow: "hidden" }}>
      <div style={{ position: "absolute", top: 260, left: 70, right: 120, opacity: 1 }}>
        {scene.eyebrow ? <Eyebrow>{scene.eyebrow}</Eyebrow> : null}
        <div style={{ marginTop: 14 }}>
          <KineticText
            text={scene.title}
            mode="word"
            accentWords={scene.accent ? [scene.accent] : []}
            delay={-30}
            stagger={2}
            style={{ fontSize: size, fontWeight: 900, letterSpacing: "-0.06em", lineHeight: 1.06 }}
          />
        </div>
        {scene.subtitle ? (
          <div style={{ marginTop: 22, color: MUTED, fontSize: 30, lineHeight: 1.35, maxWidth: 820, fontWeight: 600 }}>
            {scene.subtitle}
          </div>
        ) : null}
      </div>

      {scene.motif ? (
        <div
          style={{
            position: "absolute",
            top: scene.motif === "machine" ? 940 : scene.motif === "cup" || scene.motif === "receipt" ? 980 : 1050,
            left: 0,
            right: 0,
            display: "flex",
            justifyContent: "center",
            opacity: interpolate(local, [0, 20], [0.55, 1], CLAMP),
            transform: `translateY(${interpolate(local, [0, 20], [16, 0], CLAMP)}px)`,
          }}
        >
          <Motif kind={scene.motif} width={width} remove={scene.basket?.remove} local={local} />
        </div>
      ) : null}

      <div
        style={{
          position: "absolute",
          left: 70,
          top: 900,
          width: 220,
          height: 3,
          background: YELLOW,
          transform: `scaleX(${interpolate(local, [12, 30], [0, 1], CLAMP)})`,
          transformOrigin: "left center",
          opacity: enter,
        }}
      />
    </AbsoluteFill>
  );
}

export function StatementScene({ scene, local }: { scene: SceneSpec; local: number }) {
  const enter = interpolate(local, [0, 10], [0, 1], CLAMP);
  const huge = scene.title === "INFLAÇÃO" || scene.title === "PODER DE COMPRA";
  const size = huge ? 156 : titleSize(scene.title, 96);
  const showBar = scene.title.replace(/[.!?]/g, "").trim().toUpperCase() === "INFLAÇÃO";

  return (
    <AbsoluteFill style={{ fontFamily: FONT, alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
      <div style={{ textAlign: "center", opacity: enter, maxWidth: 940 }}>
        {scene.eyebrow ? <Eyebrow>{scene.eyebrow}</Eyebrow> : null}
        <div style={{ marginTop: 18 }}>
          <KineticText
            text={scene.title}
            mode="word"
            accentWords={scene.accent ? [scene.accent] : []}
            style={{ fontSize: size, fontWeight: 900, letterSpacing: "-0.07em", lineHeight: 1.02 }}
            align="center"
          />
        </div>
        {scene.subtitle ? (
          <div style={{ marginTop: 26, color: MUTED, fontSize: 30, lineHeight: 1.4, fontWeight: 600 }}>{scene.subtitle}</div>
        ) : null}
      </div>
      {showBar ? (
        <div style={{ position: "absolute", width: 900, height: 260, background: "rgba(250,204,21,0.08)", transform: "rotate(-3deg)", zIndex: -1 }} />
      ) : null}
    </AbsoluteFill>
  );
}

function SplitPanel({ side, width }: { side: SplitSide; width: number }) {
  return (
    <div style={{ width, fontFamily: FONT }}>
      <div style={{ color: side.accent ? YELLOW : MUTED, fontSize: 21, fontWeight: 900, letterSpacing: "0.14em" }}>{side.label}</div>
      <div style={{ marginTop: 16, display: "flex", justifyContent: "center" }}>
        {side.motif ? <Motif kind={side.motif} width={width * 0.94} remove={side.remove} /> : null}
      </div>
      <div style={{ marginTop: 16, color: side.accent ? YELLOW : WHITE, fontSize: 42, fontWeight: 900, letterSpacing: "-0.04em" }}>{side.value}</div>
    </div>
  );
}

export function SplitScene({ scene, local }: { scene: SceneSpec; local: number }) {
  const enter = interpolate(local, [0, 12], [0, 1], CLAMP);
  const left = scene.left ?? { label: "ANTES", value: "", motif: "note" as const };
  const right = scene.right ?? { label: "DEPOIS", value: "", motif: "basket" as const };
  return (
    <AbsoluteFill style={{ fontFamily: FONT, overflow: "hidden" }}>
      <div style={{ position: "absolute", top: 260, left: 70, right: 120, opacity: enter }}>
        {scene.eyebrow ? <Eyebrow>{scene.eyebrow}</Eyebrow> : null}
        <div style={{ marginTop: 10 }}>
          <KineticText
            text={scene.title}
            mode="word"
            accentWords={scene.accent ? [scene.accent] : []}
            style={{ fontSize: titleSize(scene.title, 74), fontWeight: 900, letterSpacing: "-0.055em", lineHeight: 1.06 }}
          />
        </div>
      </div>

      <div style={{ position: "absolute", top: 600, left: 70, right: 120, display: "flex", flexDirection: "column", gap: 22, opacity: enter }}>
        <SplitPanel side={left} width={460} />
        <div style={{ height: 1, width: "100%", background: "rgba(255,255,255,0.14)" }} />
        <SplitPanel side={right} width={460} />
      </div>

      {scene.subtitle ? (
        <div style={{ position: "absolute", left: 70, right: 160, top: 1560, color: YELLOW, fontSize: 34, fontWeight: 800, letterSpacing: "0.02em" }}>
          {scene.subtitle}
        </div>
      ) : null}
    </AbsoluteFill>
  );
}

function CounterValue({ scene, local, sceneFrames }: { scene: SceneSpec; local: number; sceneFrames: number }) {
  const number = scene.number!;
  const endFrame = Math.max(72, sceneFrames - 30);
  const progress = interpolate(local, [24, endFrame], [0, 1], { ...CLAMP, easing: Easing.out(Easing.cubic) });
  const value = number.from + (number.to - number.from) * progress;
  const decimals = number.decimals ?? 0;
  const text = value.toLocaleString("pt-BR", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
  const landed = progress >= 0.999;
  return (
    <div
      style={{
        width: 920,
        borderRadius: 28,
        background: "linear-gradient(180deg, rgba(18,18,18,0.96) 0%, rgba(8,8,8,0.98) 100%)",
        border: "1px solid rgba(250,204,21,0.30)",
        boxShadow: "0 50px 120px rgba(0,0,0,0.75)",
        padding: "42px 46px 32px",
        fontFamily: FONT,
        opacity: interpolate(local, [0, 12], [0, 1], CLAMP),
        transform: `translateY(${interpolate(local, [0, 16], [26, 0], CLAMP)}px)`,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ color: YELLOW, fontSize: 23, fontWeight: 900, letterSpacing: "0.16em" }}>{scene.eyebrow ?? "SIMULAÇÃO"}</div>
        <div style={{ color: MUTED, fontSize: 18, fontWeight: 700, letterSpacing: "0.12em" }}>{number.label ?? "10 ANOS"}</div>
      </div>

      <div style={{ marginTop: 38, color: MUTED, fontSize: 23, fontWeight: 700, letterSpacing: "0.14em" }}>PODER DE COMPRA</div>
      <div
        style={{
          marginTop: 2,
          color: landed ? YELLOW : WHITE,
          fontSize: 122,
          fontWeight: 900,
          letterSpacing: "-0.075em",
          lineHeight: 1,
          fontVariantNumeric: "tabular-nums",
          textShadow: landed ? "0 0 34px rgba(250,204,21,0.26)" : "none",
        }}
      >
        {number.prefix ?? "R$ "} {text} {number.suffix ?? ""}
      </div>

      {scene.motif === "line" ? (
        <div style={{ marginTop: 10 }}>
          <Motif kind="line" width={820} local={local} />
        </div>
      ) : null}

      {number.disclaimer ? <div style={{ marginTop: 20, color: MUTED, fontSize: 18, lineHeight: 1.35 }}>{number.disclaimer}</div> : null}
    </div>
  );
}

export function CounterScene({ scene, local, sceneFrames }: { scene: SceneSpec; local: number; sceneFrames: number }) {
  const enter = interpolate(local, [0, 10], [0, 1], CLAMP);
  return (
    <AbsoluteFill style={{ fontFamily: FONT, overflow: "hidden", alignItems: "center", justifyContent: "center" }}>
      <div style={{ position: "absolute", top: 250, left: 70, right: 120, opacity: enter }}>
        {scene.eyebrow ? <Eyebrow>{scene.eyebrow}</Eyebrow> : null}
        <div style={{ marginTop: 8, color: WHITE, fontSize: 50, fontWeight: 900, letterSpacing: "-0.04em" }}>{scene.title}</div>
        {scene.subtitle ? <div style={{ marginTop: 10, color: MUTED, fontSize: 26 }}>{scene.subtitle}</div> : null}
      </div>
      <CounterValue scene={scene} local={local} sceneFrames={sceneFrames} />
    </AbsoluteFill>
  );
}

export function BasketScene({ scene, local }: { scene: SceneSpec; local: number }) {
  const enter = interpolate(local, [0, 10], [0, 1], CLAMP);
  return (
    <AbsoluteFill style={{ fontFamily: FONT, overflow: "hidden" }}>
      <div style={{ position: "absolute", top: 280, left: 70, right: 120, opacity: enter }}>
        {scene.eyebrow ? <Eyebrow>{scene.eyebrow}</Eyebrow> : null}
        <div style={{ marginTop: 10 }}>
          <KineticText
            text={scene.title}
            mode="word"
            accentWords={scene.accent ? [scene.accent] : []}
            style={{ fontSize: titleSize(scene.title, 74), fontWeight: 900, letterSpacing: "-0.055em", lineHeight: 1.06 }}
          />
        </div>
      </div>
      <div style={{ position: "absolute", top: 900, left: 0, right: 0, display: "flex", justifyContent: "center", opacity: enter }}>
        <Motif kind="basket" width={680} remove={scene.basket?.remove ?? 2} />
      </div>
      <div style={{ position: "absolute", top: 1250, left: 70, right: 160, color: WHITE, fontSize: 34, lineHeight: 1.35, fontWeight: 700 }}>
        {scene.subtitle ?? "A mesma quantia compra menos."}
      </div>
    </AbsoluteFill>
  );
}

export function ChartScene({ scene, local }: { scene: SceneSpec; local: number }) {
  const enter = interpolate(local, [0, 10], [0, 1], CLAMP);
  return (
    <AbsoluteFill style={{ fontFamily: FONT, overflow: "hidden" }}>
      <div style={{ position: "absolute", top: 260, left: 70, right: 120, opacity: enter }}>
        {scene.eyebrow ? <Eyebrow>{scene.eyebrow}</Eyebrow> : null}
        <div style={{ marginTop: 10 }}>
          <KineticText
            text={scene.title}
            mode="word"
            accentWords={scene.accent ? [scene.accent] : []}
            style={{ fontSize: titleSize(scene.title, 74), fontWeight: 900, letterSpacing: "-0.055em", lineHeight: 1.06 }}
          />
        </div>
      </div>
      <div style={{ position: "absolute", top: 760, left: 60, right: 60, opacity: enter }}>
        <Motif kind="line" width={940} local={local} years={scene.chartYears} />
      </div>
      <div style={{ position: "absolute", left: 70, right: 160, top: 1480, color: MUTED, fontSize: 28, lineHeight: 1.4 }}>
        {scene.subtitle ?? "Simulação hipotética. Não é projeção."}
      </div>
    </AbsoluteFill>
  );
}

export function QuoteScene({ scene, local }: { scene: SceneSpec; local: number }) {
  return (
    <AbsoluteFill style={{ fontFamily: FONT, overflow: "hidden" }}>
      <div style={{ position: "absolute", top: 280, left: 70, right: 120, opacity: 1 }}>
        {scene.eyebrow ? <Eyebrow>{scene.eyebrow}</Eyebrow> : null}
        <div style={{ marginTop: 10 }}>
          <KineticText
            text={scene.title}
            mode="word"
            accentWords={scene.accent ? [scene.accent] : []}
            delay={-30}
            style={{ fontSize: titleSize(scene.title, 72), fontWeight: 900, letterSpacing: "-0.055em", lineHeight: 1.06 }}
          />
        </div>
      </div>
      <div style={{ position: "absolute", top: 780, left: 70, right: 120, opacity: 1 }}>
        {scene.motif === "receipt" ? <Motif kind="receipt" width={440} /> : <Motif kind="chat" width={720} local={local} />}
      </div>
      {scene.subtitle ? (
        <div style={{ position: "absolute", left: 70, right: 160, top: 1560, color: YELLOW, fontSize: 32, fontWeight: 800 }}>
          {scene.subtitle}
        </div>
      ) : null}
    </AbsoluteFill>
  );
}

export function CTAScene({ scene, local }: { scene: SceneSpec; local: number }) {
  const { fps } = useVideoConfig();
  const cta = spring({ frame: local - 18, fps, config: { damping: 18, stiffness: 100, mass: 0.9 } });
  return (
    <AbsoluteFill style={{ fontFamily: FONT, alignItems: "center", justifyContent: "center" }}>
      <div style={{ marginTop: -180 }}>
        <LogoReveal delay={0} />
      </div>
      <div
        style={{
          marginTop: 64,
          height: 84,
          padding: "0 42px",
          borderRadius: 999,
          border: "1px solid rgba(250,204,21,0.55)",
          background: "rgba(250,204,21,0.08)",
          display: "flex",
          alignItems: "center",
          gap: 16,
          opacity: cta,
          transform: `translateY(${interpolate(cta, [0, 1], [20, 0])}px)`,
        }}
      >
        <div style={{ color: YELLOW, fontSize: 32, fontWeight: 900, letterSpacing: "0.16em" }}>{scene.title}</div>
        <div style={{ color: YELLOW, fontSize: 36, fontWeight: 900 }}>→</div>
      </div>
      {scene.subtitle ? (
        <div style={{ marginTop: 24, color: MUTED, fontSize: 21, letterSpacing: "0.12em" }}>{scene.subtitle}</div>
      ) : null}
      <div style={{ position: "absolute", left: 80, right: 160, bottom: 96, color: MUTED, fontSize: 20, lineHeight: 1.4, textAlign: "center" }}>
        Conteúdo educacional. Não é recomendação de investimento.
        <br />
        Áudio de preview interno. Licença comercial pendente.
      </div>
    </AbsoluteFill>
  );
}

export function SceneRenderer({ scene, local, sceneFrames }: { scene: SceneSpec; local: number; sceneFrames: number }) {
  switch (scene.kind) {
    case "hook":
      return <HookScene scene={scene} local={local} />;
    case "statement":
      return scene.motif ? <HookScene scene={scene} local={local} /> : <StatementScene scene={scene} local={local} />;
    case "split":
      return <SplitScene scene={scene} local={local} />;
    case "counter":
      return <CounterScene scene={scene} local={local} sceneFrames={sceneFrames} />;
    case "basket":
      return <BasketScene scene={scene} local={local} />;
    case "chart":
      return <ChartScene scene={scene} local={local} />;
    case "quote":
      return <QuoteScene scene={scene} local={local} />;
    case "cta":
      return <CTAScene scene={scene} local={local} />;
  }
}
