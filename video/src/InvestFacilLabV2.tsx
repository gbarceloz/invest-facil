import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { InvestFacilLab } from "./InvestFacilLab";

const YELLOW = "#FACC15";
const WHITE = "#FAFAFA";
const FONT = '"Plus Jakarta Sans", "Segoe UI", sans-serif';
const CLAMP = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

/**
 * Regra de layout do laboratório:
 * a composição base usa a faixa inferior até y=1670 (bottom >= 250 px).
 * A legenda integrada ocupa a faixa y=1730..1830, com o rodapé em y=1852..1872.
 * Nenhum texto da composição base entra nessa faixa.
 */
export const CAPTION_SAFE_TOP = 1680;
const CAPTION_BOTTOM = 92;

type Caption = {
  from: number;
  to: number;
  text: string;
  emphasis?: string;
};

const CAPTIONS: Caption[] = [
  { from: 0.0, to: 2.6, text: "Você acha que R$ 100 estão parados?", emphasis: "R$ 100" },
  { from: 2.6, to: 4.2, text: "Não estão.", emphasis: "Não" },
  { from: 4.2, to: 8.3, text: "A inflação corrói o seu poder de compra.", emphasis: "inflação" },
  { from: 8.3, to: 12.5, text: "Em 10 anos, a 5% ao ano, R$ 100 valem R$ 61.", emphasis: "R$ 61" },
  { from: 12.5, to: 15.0, text: "O problema não é o número.", emphasis: "número" },
  { from: 15.0, to: 18.6, text: "É a ilusão de que o dinheiro está parado.", emphasis: "parado" },
];

function CaptionText({ caption }: { caption: Caption }) {
  const parts = caption.emphasis ? caption.text.split(caption.emphasis) : [caption.text];
  if (!caption.emphasis || parts.length !== 2) {
    return <>{caption.text}</>;
  }
  return (
    <>
      {parts[0]}
      <span style={{ color: YELLOW }}>{caption.emphasis}</span>
      {parts[1]}
    </>
  );
}

function CaptionBand({ frame }: { frame: number }) {
  const time = frame / 30;
  const active = CAPTIONS.find((caption) => time >= caption.from && time < caption.to);
  if (!active) {
    return null;
  }
  const local = time - active.from;
  const enter = interpolate(local, [0, 0.18], [0, 1], CLAMP);
  const exit = interpolate(active.to - time, [0, 0.16], [0, 1], CLAMP);
  const opacity = Math.min(enter, exit);
  const translateY = interpolate(enter, [0, 1], [10, 0]);

  return (
    <div
      style={{
        position: "absolute",
        left: 60,
        right: 60,
        bottom: CAPTION_BOTTOM,
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-end",
        zIndex: 30,
        pointerEvents: "none",
        opacity,
        transform: `translateY(${translateY}px)`,
      }}
    >
      <div
        style={{
          maxWidth: 940,
          padding: "14px 22px 15px",
          borderRadius: 14,
          background: "rgba(5,5,5,0.82)",
          border: "1px solid rgba(250,204,21,0.22)",
          boxShadow: "0 12px 40px rgba(0,0,0,0.45)",
          color: WHITE,
          fontFamily: FONT,
          fontSize: 36,
          lineHeight: 1.24,
          fontWeight: 700,
          letterSpacing: "-0.015em",
          textAlign: "center",
        }}
      >
        <CaptionText caption={active} />
      </div>
    </div>
  );
}

function SafeAreaGuide({ frame }: { frame: number }) {
  const time = (frame / 30).toFixed(1);
  return (
    <AbsoluteFill style={{ zIndex: 40, pointerEvents: "none" }}>
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: CAPTION_SAFE_TOP,
          borderTop: "2px dashed #22C55E",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 24,
          top: CAPTION_SAFE_TOP + 8,
          color: "#22C55E",
          fontFamily: FONT,
          fontSize: 18,
          fontWeight: 800,
          letterSpacing: "0.06em",
        }}
      >
        ÁREA SEGURA DE LEGENDA · y ≥ {CAPTION_SAFE_TOP} · t={time}s
      </div>
      <div
        style={{
          position: "absolute",
          left: 24,
          right: 24,
          top: CAPTION_SAFE_TOP,
          bottom: 24,
          border: "2px solid rgba(34,197,94,0.35)",
          borderRadius: 12,
        }}
      />
    </AbsoluteFill>
  );
}

type Props = {
  showGuides?: boolean;
  showCaptions?: boolean;
};

export function InvestFacilLabV2({ showGuides = false, showCaptions = false }: Props) {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: "#050505", fontFamily: FONT, color: WHITE }}>
      <InvestFacilLab />
      {showCaptions ? <CaptionBand frame={frame} /> : null}
      {showGuides ? <SafeAreaGuide frame={frame} /> : null}
    </AbsoluteFill>
  );
}
