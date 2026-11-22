import type { CSSProperties } from "react";
import { AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { LogoReveal } from "../../high-impact/LogoReveal";
import {
  BG,
  CLAMP,
  DIM,
  FONT,
  HEIGHT,
  MUTED,
  PRODUCTS,
  SIM_POINTS,
  TICKER_ITEMS,
  WIDTH,
  WHITE,
  YELLOW,
  YELLOW_SOFT,
} from "./data";

export function TopLabel() {
  return (
    <div
      style={{
        position: "absolute",
        top: 156,
        left: 70,
        right: 120,
        display: "flex",
        alignItems: "center",
        gap: 14,
        fontFamily: FONT,
        zIndex: 200,
      }}
    >
      <div style={{ width: 9, height: 9, borderRadius: 99, background: YELLOW, boxShadow: `0 0 16px ${YELLOW}` }} />
      <div style={{ color: WHITE, fontSize: 23, fontWeight: 800, letterSpacing: "0.14em" }}>INVEST FÁCIL</div>
      <div style={{ color: MUTED, fontSize: 23, fontWeight: 700, letterSpacing: "0.14em" }}>/ INFLAÇÃO</div>
      <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.12)" }} />
    </div>
  );
}

export function ProgressLine() {
  const frame = useCurrentFrame();
  const width = interpolate(frame, [0, 1020], [0, 100], CLAMP);
  return (
    <div style={{ position: "absolute", top: 0, left: 0, width: `${width}%`, height: 3, background: YELLOW, zIndex: 250 }} />
  );
}

export function Note100({
  width = 760,
  height = 420,
  style,
}: {
  width?: number;
  height?: number;
  style?: CSSProperties;
}) {
  const frame = useCurrentFrame();
  const sheen = interpolate(frame % 180, [0, 90, 180], [-1, 2, -1], CLAMP);
  const scale = Math.min(width / 760, height / 420);

  return (
    <div
      style={{
        width,
        height,
        position: "relative",
        borderRadius: 30,
        overflow: "hidden",
        background: "linear-gradient(135deg, #0a0a0a 0%, #151515 48%, #0b0b0b 100%)",
        border: "1.5px solid rgba(250,204,21,0.34)",
        boxShadow: "0 40px 90px rgba(0,0,0,0.75), inset 0 0 80px rgba(250,204,21,0.035)",
        ...style,
      }}
    >
      <svg width="100%" height="100%" viewBox="0 0 760 420" style={{ position: "absolute", inset: 0 }}>
        <defs>
          <pattern id="guilloche" width="64" height="64" patternUnits="userSpaceOnUse">
            <circle cx="32" cy="32" r="27" fill="none" stroke="rgba(250,204,21,0.11)" strokeWidth="1" />
            <circle cx="32" cy="32" r="17" fill="none" stroke="rgba(250,204,21,0.08)" strokeWidth="1" />
          </pattern>
          <linearGradient id="sheen" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="rgba(255,255,255,0)" />
            <stop offset="48%" stopColor="rgba(255,255,255,0.05)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0)" />
          </linearGradient>
        </defs>
        <rect width="760" height="420" fill="url(#guilloche)" />
        <path d="M0 330 Q 190 270 380 330 T 760 330" fill="none" stroke="rgba(250,204,21,0.22)" strokeWidth="2" />
        <path d="M0 352 Q 190 292 380 352 T 760 352" fill="none" stroke="rgba(250,204,21,0.10)" strokeWidth="1" />
        <rect width="760" height="420" fill="url(#sheen)" opacity={Math.max(0, sheen)} />
        <rect x="0" y="0" width="16" height="420" fill={YELLOW} opacity="0.9" />
      </svg>

      <div
        style={{
          position: "absolute",
          top: 38 * scale,
          left: 54 * scale,
          color: YELLOW,
          fontFamily: FONT,
          fontSize: 30 * scale,
          fontWeight: 900,
          letterSpacing: "0.06em",
        }}
      >
        R$
      </div>

      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: WHITE,
          fontFamily: FONT,
          fontSize: 208 * scale,
          fontWeight: 900,
          letterSpacing: "-0.09em",
          lineHeight: 1,
          textShadow: "0 8px 40px rgba(0,0,0,0.45)",
        }}
      >
        100
      </div>

      <div
        style={{
          position: "absolute",
          left: 54 * scale,
          bottom: 30 * scale,
          color: MUTED,
          fontFamily: FONT,
          fontSize: 18 * scale,
          fontWeight: 700,
          letterSpacing: "0.14em",
        }}
      >
        NOTA ILUSTRATIVA
      </div>

      <div
        style={{
          position: "absolute",
          right: 42 * scale,
          bottom: 30 * scale,
          color: YELLOW,
          fontFamily: FONT,
          fontSize: 18 * scale,
          fontWeight: 800,
          letterSpacing: "0.12em",
        }}
      >
        IF · 001
      </div>
    </div>
  );
}

export function TickerColumn({
  left,
  speed = 1.2,
  direction = 1,
  opacity = 1,
  width = 330,
  blur = 0,
}: {
  left: number;
  speed?: number;
  direction?: 1 | -1;
  opacity?: number;
  width?: number;
  blur?: number;
}) {
  const frame = useCurrentFrame();
  const offset = frame * speed * direction;
  const spacing = 118;
  const count = 24;
  const cycle = count * spacing;
  const items = Array.from({ length: count }, (_, index) => TICKER_ITEMS[index % TICKER_ITEMS.length]);

  return (
    <div
      style={{
        position: "absolute",
        left,
        top: 0,
        width,
        height: HEIGHT,
        overflow: "hidden",
        opacity,
        filter: blur ? `blur(${blur}px)` : undefined,
        zIndex: 1,
      }}
    >
      {items.map((item, index) => {
        const raw = (index * spacing + offset) % cycle;
        const top = ((raw + cycle) % cycle) - 160;
        const up = index % 3 !== 1;
        return (
          <div
            key={`${item.name}-${index}`}
            style={{
              position: "absolute",
              top,
              left: 0,
              right: 0,
              height: 98,
              borderRadius: 14,
              background: "rgba(255,255,255,0.032)",
              border: "1px solid rgba(255,255,255,0.09)",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              padding: "0 18px",
              fontFamily: FONT,
            }}
          >
            <div style={{ color: MUTED, fontSize: 18, fontWeight: 700, letterSpacing: "0.10em" }}>{item.name}</div>
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginTop: 4 }}>
              <div style={{ color: WHITE, fontSize: 30, fontWeight: 800, fontVariantNumeric: "tabular-nums" }}>{item.price}</div>
              <div style={{ color: YELLOW, fontSize: 20, fontWeight: 900 }}>{up ? "▲" : "▼"}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function PriceIcon({ type, color = WHITE, size = 64 }: { type: string; color?: string; size?: number }) {
  const common = {
    fill: "none",
    stroke: color,
    strokeWidth: 3,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  if (type === "coffee") {
    return (
      <svg viewBox="0 0 64 64" width={size} height={size}>
        <path d="M15 24 L43 24 L40 49 Q39 55 33 55 L23 55 Q17 55 16 49 Z" {...common} />
        <path d="M43 28 L51 28 Q57 28 57 35 Q57 43 49 43 L42 43" {...common} />
        <path d="M22 16 Q26 10 22 6 M31 16 Q35 10 31 6" {...common} />
      </svg>
    );
  }
  if (type === "bread") {
    return (
      <svg viewBox="0 0 64 64" width={size} height={size}>
        <path d="M10 33 Q10 17 24 15 Q32 11 40 15 Q54 17 54 33 Q54 47 44 49 L20 49 Q10 47 10 33 Z" {...common} />
        <path d="M22 21 L24 35 M32 18 L33 35 M42 21 L40 35" {...common} />
      </svg>
    );
  }
  if (type === "milk") {
    return (
      <svg viewBox="0 0 64 64" width={size} height={size}>
        <path d="M20 22 L44 22 L44 54 L20 54 Z" {...common} />
        <path d="M20 22 L28 12 L52 12 L44 22" {...common} />
        <path d="M32 30 L32 42" {...common} />
      </svg>
    );
  }
  if (type === "eggs") {
    return (
      <svg viewBox="0 0 64 64" width={size} height={size}>
        <ellipse cx="22" cy="34" rx="12" ry="15" {...common} />
        <ellipse cx="40" cy="28" rx="11" ry="14" {...common} />
        <ellipse cx="44" cy="45" rx="8" ry="10" {...common} />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 64 64" width={size} height={size}>
      <rect x="10" y="18" width="44" height="30" rx="6" {...common} />
      <path d="M10 27 L54 27 M18 18 L18 12 M46 18 L46 12" {...common} />
      <circle cx="20" cy="41" r="4" {...common} />
      <circle cx="44" cy="41" r="4" {...common} />
    </svg>
  );
}

export function PriceCard({
  product,
  index,
  sceneStart,
}: {
  product: (typeof PRODUCTS)[number];
  index: number;
  sceneStart: number;
}) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const local = frame - sceneStart;
  const enter = spring({
    frame: local - index * 34,
    fps,
    config: { damping: 18, stiffness: 120, mass: 0.8 },
  });
  const rise = interpolate(local, [index * 34 + 18, index * 34 + 42], [0, 1], {
    ...CLAMP,
    easing: Easing.out(Easing.cubic),
  });
  const price = product.from + (product.to - product.from) * rise;
  const dots = Array.from({ length: 5 }, (_, dot) => dot < 5 - Math.round(rise * 1));

  return (
    <div
      style={{
        width: 860,
        height: 176,
        borderRadius: 20,
        background: "rgba(255,255,255,0.035)",
        border: `1px solid ${rise > 0.4 ? "rgba(250,204,21,0.42)" : "rgba(255,255,255,0.10)"}`,
        display: "flex",
        alignItems: "center",
        gap: 24,
        padding: "0 28px",
        opacity: enter,
        transform: `translateY(${interpolate(enter, [0, 1], [46, 0])}px) scale(${interpolate(enter, [0, 1], [0.96, 1])})`,
        boxShadow: rise > 0.4 ? "0 18px 50px rgba(250,204,21,0.06)" : "none",
      }}
    >
      <div
        style={{
          width: 92,
          height: 92,
          borderRadius: 18,
          background: "rgba(250,204,21,0.06)",
          border: "1px solid rgba(250,204,21,0.18)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <PriceIcon type={product.icon} color={rise > 0.4 ? YELLOW : WHITE} size={62} />
      </div>

      <div style={{ flex: 1 }}>
        <div style={{ color: WHITE, fontFamily: FONT, fontSize: 36, fontWeight: 900, letterSpacing: "-0.03em" }}>
          {product.name}
        </div>
        <div style={{ color: MUTED, fontFamily: FONT, fontSize: 22, marginTop: 4 }}>{product.unit}</div>
        <div style={{ display: "flex", gap: 7, marginTop: 14 }}>
          {Array.from({ length: 5 }, (_, dot) => (
            <div
              key={dot}
              style={{
                width: 22,
                height: 7,
                borderRadius: 99,
                background: dot < dots.length ? YELLOW : "rgba(255,255,255,0.14)",
                opacity: dot < dots.length ? 1 : 0.55,
              }}
            />
          ))}
        </div>
      </div>

      <div style={{ textAlign: "right", fontFamily: FONT, fontVariantNumeric: "tabular-nums" }}>
        <div style={{ color: MUTED, fontSize: 20, fontWeight: 700, letterSpacing: "0.10em" }}>PREÇO</div>
        <div style={{ color: rise > 0.4 ? YELLOW : WHITE, fontSize: 38, fontWeight: 900, letterSpacing: "-0.04em" }}>
          R$ {price.toFixed(2).replace(".", ",")}
        </div>
        <div style={{ color: YELLOW, fontSize: 20, fontWeight: 800, marginTop: 4 }}>↑</div>
      </div>
    </div>
  );
}

export function BasketBlocks({ sceneStart, count = 10, remove = 4 }: { sceneStart: number; count?: number; remove?: number }) {
  const frame = useCurrentFrame();
  const local = frame - sceneStart;
  const bracket = interpolate(local, [20, 110], [1, 1 - remove / count], {
    ...CLAMP,
    easing: Easing.inOut(Easing.cubic),
  });

  return (
    <div style={{ width: 920, fontFamily: FONT }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 22 }}>
        <div style={{ color: YELLOW, fontSize: 24, fontWeight: 900, letterSpacing: "0.14em" }}>CESTA</div>
        <div style={{ color: MUTED, fontSize: 22, fontWeight: 700, letterSpacing: "0.10em" }}>A MESMA QUANTIA</div>
      </div>

      <div style={{ display: "flex", gap: 10, height: 250, alignItems: "flex-end" }}>
        {Array.from({ length: count }, (_, index) => {
          const isRemoved = index >= count - remove;
          const order = index - (count - remove);
          const vanish = isRemoved
            ? interpolate(local, [36 + order * 10, 52 + order * 10], [1, 0], {
                ...CLAMP,
                easing: Easing.in(Easing.cubic),
              })
            : 1;
          return (
            <div
              key={index}
              style={{
                flex: 1,
                height: 190 + (index % 3) * 18,
                borderRadius: 14,
                background: isRemoved ? "rgba(255,255,255,0.03)" : "rgba(250,204,21,0.16)",
                border: isRemoved ? "1px dashed rgba(255,255,255,0.16)" : "1px solid rgba(250,204,21,0.55)",
                opacity: isRemoved ? vanish * 0.7 : 1,
                transform: `translateY(${isRemoved ? (1 - vanish) * 26 : 0}px)`,
              }}
            />
          );
        })}
      </div>

      <div style={{ position: "relative", height: 46, marginTop: 14 }}>
        <div style={{ position: "absolute", left: 0, top: 10, width: `${bracket * 100}%`, height: 4, background: YELLOW }} />
        <div
          style={{
            position: "absolute",
            left: `calc(${bracket * 100}% - 2px)`,
            top: 2,
            width: 3,
            height: 22,
            background: YELLOW,
          }}
        />
        <div style={{ position: "absolute", left: 0, top: 22, color: MUTED, fontSize: 22, letterSpacing: "0.10em" }}>
          O QUE ELE COMPRA
        </div>
        <div style={{ position: "absolute", right: 0, top: 22, color: YELLOW, fontSize: 22, fontWeight: 800 }}>
          {Math.round(bracket * count)} / {count}
        </div>
      </div>
    </div>
  );
}

export function SimulationPanel({ sceneStart }: { sceneStart: number }) {
  const frame = useCurrentFrame();
  const local = frame - sceneStart;
  const progress = interpolate(local, [30, 154], [0, 1], {
    ...CLAMP,
    easing: Easing.out(Easing.cubic),
  });
  const value = 100 + (61.39 - 100) * progress;
  const landed = local >= 154;
  const glow = landed ? 0.55 + 0.45 * Math.sin((local - 154) / 7) : 0;
  const pulse = interpolate(local, [140, 154, 172], [1, 1.018, 1], CLAMP);
  const draw = interpolate(local, [30, 154], [0, 1], CLAMP);

  const x = (index: number) => 40 + (index / (SIM_POINTS.length - 1)) * 820;
  const y = (valuePoint: number) => 28 + ((100 - valuePoint) / 40) * 190;
  const path = SIM_POINTS.map((point, index) => `${index === 0 ? "M" : "L"} ${x(index)} ${y(point)}`).join(" ");

  return (
    <div
      style={{
        width: 940,
        borderRadius: 28,
        background: "linear-gradient(180deg, rgba(18,18,18,0.96) 0%, rgba(8,8,8,0.98) 100%)",
        border: "1px solid rgba(250,204,21,0.28)",
        boxShadow: "0 50px 120px rgba(0,0,0,0.75)",
        padding: "42px 46px 34px",
        fontFamily: FONT,
        opacity: interpolate(local, [0, 12], [0, 1], CLAMP),
        transform: `translateY(${interpolate(local, [0, 16], [28, 0], CLAMP)}px) scale(${interpolate(
          local,
          [0, 16],
          [0.97, 1],
          CLAMP,
        ) * pulse})`,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ color: YELLOW, fontSize: 24, fontWeight: 900, letterSpacing: "0.16em" }}>SIMULAÇÃO · 5% AO ANO</div>
        <div style={{ color: MUTED, fontSize: 22, fontWeight: 700, letterSpacing: "0.10em" }}>10 ANOS</div>
      </div>

      <div style={{ marginTop: 42, color: MUTED, fontSize: 26, fontWeight: 700, letterSpacing: "0.12em" }}>PODER DE COMPRA</div>

      <div
        style={{
          marginTop: 2,
          color: landed ? YELLOW : WHITE,
          fontSize: 126,
          fontWeight: 900,
          letterSpacing: "-0.075em",
          lineHeight: 1,
          fontVariantNumeric: "tabular-nums",
          textShadow: landed ? `0 0 ${28 + glow * 26}px rgba(250,204,21,${0.20 + glow * 0.22})` : "none",
        }}
      >
        R$ {value.toFixed(2).replace(".", ",")}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 8 }}>
        <div style={{ width: 44, height: 3, background: YELLOW }} />
        <div style={{ color: WHITE, fontSize: 28, fontWeight: 700 }}>
          {landed ? "O número é o mesmo." : "O poder de compra cai."}
        </div>
      </div>

      <svg width="100%" height="230" viewBox="0 0 900 230" style={{ marginTop: 22, overflow: "visible" }}>
        <defs>
          <linearGradient id="v01line" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={YELLOW_SOFT} />
            <stop offset="100%" stopColor={YELLOW} />
          </linearGradient>
          <linearGradient id="v01fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={YELLOW} stopOpacity="0.18" />
            <stop offset="100%" stopColor={YELLOW} stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={`${path} L 860 218 L 40 218 Z`} fill="url(#v01fill)" opacity={draw} />
        <path
          d={path}
          fill="none"
          stroke="url(#v01line)"
          strokeWidth="5"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray="1000"
          strokeDashoffset={interpolate(draw, [0, 1], [1000, 0], CLAMP)}
        />
        {SIM_POINTS.map((point, index) => {
          const opacity = interpolate(draw, [index / SIM_POINTS.length, index / SIM_POINTS.length + 0.1], [0, 1], CLAMP);
          return (
            <g key={index} opacity={opacity}>
              <circle cx={x(index)} cy={y(point)} r={index === SIM_POINTS.length - 1 ? 8 : 4} fill={YELLOW} />
              {index === SIM_POINTS.length - 1 ? (
                <text x={x(index) - 8} y={y(point) - 20} fill={YELLOW} fontSize="22" fontWeight="800" textAnchor="end">
                  61
                </text>
              ) : null}
            </g>
          );
        })}
      </svg>

      <div style={{ display: "flex", justifyContent: "space-between", color: MUTED, fontSize: 21, letterSpacing: "0.08em" }}>
        <div>HOJE</div>
        <div>10 ANOS</div>
      </div>

      <div style={{ marginTop: 22, color: MUTED, fontSize: 21, lineHeight: 1.35 }}>
        Simulação hipotética. Não é projeção nem recomendação.
      </div>
    </div>
  );
}

export function SplitCompare({ sceneStart }: { sceneStart: number }) {
  const frame = useCurrentFrame();
  const local = frame - sceneStart;
  const fade = interpolate(local, [0, 12], [0, 1], CLAMP);

  return (
    <div style={{ width: 940, display: "flex", gap: 34, fontFamily: FONT, opacity: fade, alignItems: "center" }}>
      <div style={{ flex: 1 }}>
        <div style={{ color: MUTED, fontSize: 24, fontWeight: 800, letterSpacing: "0.14em", marginBottom: 18 }}>MESMO NÚMERO</div>
        <Note100 width={430} height={238} />
        <div style={{ marginTop: 18, color: WHITE, fontSize: 34, fontWeight: 900 }}>R$ 100</div>
      </div>

      <div style={{ width: 1, height: 330, background: "rgba(255,255,255,0.12)" }} />

      <div style={{ flex: 1 }}>
        <div style={{ color: YELLOW, fontSize: 24, fontWeight: 800, letterSpacing: "0.14em", marginBottom: 18 }}>MENOS PODER</div>
        <div style={{ display: "flex", flexWrap: "nowrap", gap: 10, width: 430 }}>
          {Array.from({ length: 5 }, (_, index) => {
            const removed = index >= 3 && local > 30 + (index - 3) * 14;
            return (
              <div
                key={index}
                style={{
                  width: 74,
                  height: 74,
                  borderRadius: 14,
                  border: removed ? "1px dashed rgba(255,255,255,0.22)" : "1px solid rgba(250,204,21,0.55)",
                  background: removed ? "rgba(255,255,255,0.02)" : "rgba(250,204,21,0.14)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  opacity: removed ? 0.45 : 1,
                }}
              >
                <PriceIcon
                  type={index === 0 ? "coffee" : index === 1 ? "bread" : index === 2 ? "bus" : index === 3 ? "milk" : "eggs"}
                  color={removed ? DIM : YELLOW}
                  size={42}
                />
              </div>
            );
          })}
        </div>
        <div style={{ marginTop: 18, color: WHITE, fontSize: 34, fontWeight: 900 }}>
          {5 - (local > 30 ? 1 : 0) - (local > 44 ? 1 : 0)} <span style={{ color: MUTED, fontSize: 24 }}>DE 5</span>
        </div>
      </div>
    </div>
  );
}

export function EndCardGraphic({ sceneStart }: { sceneStart: number }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const local = frame - sceneStart;
  const cta = spring({
    frame: local - 8,
    fps,
    config: { damping: 18, stiffness: 100, mass: 0.9 },
  });
  const ctaFade = interpolate(local, [4, 12], [0, 1], CLAMP);

  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", fontFamily: FONT }}>
      <div style={{ marginTop: -180 }}>
        <LogoReveal delay={0} />
      </div>

      <div
        style={{
          marginTop: 70,
          height: 84,
          padding: "0 42px",
          borderRadius: 999,
          border: "1px solid rgba(250,204,21,0.55)",
          background: "rgba(250,204,21,0.08)",
          display: "flex",
          alignItems: "center",
          gap: 16,
          opacity: ctaFade,
          transform: `translateY(${interpolate(cta, [0, 1], [20, 0])}px) scale(${interpolate(cta, [0, 1], [0.94, 1])})`,
        }}
      >
        <div style={{ color: YELLOW, fontSize: 32, fontWeight: 900, letterSpacing: "0.16em" }}>SIGA</div>
        <div style={{ color: YELLOW, fontSize: 36, fontWeight: 900 }}>→</div>
      </div>

      <div style={{ marginTop: 26, color: MUTED, fontSize: 24, letterSpacing: "0.12em" }}>
        PRÓXIMO VÍDEO: DE ONDE VEM A INFLAÇÃO
      </div>

      <div
        style={{
          position: "absolute",
          left: 80,
          right: 160,
          bottom: 320,
          color: MUTED,
          fontSize: 23,
          lineHeight: 1.45,
          textAlign: "center",
        }}
      >
        Conteúdo educacional. Não é recomendação de investimento.
        <br />
        Áudio de preview interno. Licença comercial pendente.
      </div>
    </AbsoluteFill>
  );
}

export const noteShadow = "0 40px 90px rgba(0,0,0,0.75)";
export const panelStyle: CSSProperties = {
  background: "rgba(255,255,255,0.03)",
  border: "1px solid rgba(255,255,255,0.10)",
  borderRadius: 24,
};
export const yellowGlow = `0 0 40px rgba(250,204,21,0.22)`;
