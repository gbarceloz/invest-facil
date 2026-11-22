import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { AnimatedNumber } from "./AnimatedNumber";
import {
  BG,
  CLAMP,
  FONT,
  MUTED,
  PRODUCTS,
  WHITE,
  YELLOW,
} from "./constants";

const START = 282;

function ProductIcon({ type, color }: { type: string; color: string }) {
  const common = { fill: "none", stroke: color, strokeWidth: 3, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  if (type === "rice") {
    return (
      <svg viewBox="0 0 64 64" width="58" height="58">
        <path d="M18 18 L46 18 L43 54 L21 54 Z" {...common} />
        <path d="M18 18 L14 12 L50 12 L46 18" {...common} />
        <path d="M26 28 L26 46 M32 26 L32 48 M38 28 L38 46" {...common} />
      </svg>
    );
  }
  if (type === "milk") {
    return (
      <svg viewBox="0 0 64 64" width="58" height="58">
        <path d="M20 22 L44 22 L44 54 L20 54 Z" {...common} />
        <path d="M20 22 L28 12 L52 12 L44 22" {...common} />
        <path d="M32 30 L32 42" {...common} />
      </svg>
    );
  }
  if (type === "coffee") {
    return (
      <svg viewBox="0 0 64 64" width="58" height="58">
        <path d="M16 24 L42 24 L39 48 Q38 54 32 54 L23 54 Q17 54 16 48 Z" {...common} />
        <path d="M42 28 L50 28 Q56 28 56 34 Q56 42 48 42 L41 42" {...common} />
        <path d="M22 16 Q26 10 22 6 M31 16 Q35 10 31 6" {...common} />
      </svg>
    );
  }
  if (type === "bread") {
    return (
      <svg viewBox="0 0 64 64" width="58" height="58">
        <path d="M10 32 Q10 16 24 14 Q32 10 40 14 Q54 16 54 32 Q54 46 44 48 L20 48 Q10 46 10 32 Z" {...common} />
        <path d="M22 20 L24 34 M32 17 L33 34 M42 20 L40 34" {...common} />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 64 64" width="58" height="58">
      <ellipse cx="22" cy="34" rx="12" ry="15" {...common} />
      <ellipse cx="40" cy="28" rx="11" ry="14" {...common} />
      <ellipse cx="44" cy="43" rx="9" ry="11" {...common} />
    </svg>
  );
}

function ProductCard({
  product,
  index,
  frame,
}: {
  product: (typeof PRODUCTS)[number];
  index: number;
  frame: number;
}) {
  const { fps } = useVideoConfig();
  const enter = spring({
    frame: frame - START - index * 1,
    fps,
    config: { damping: 18, stiffness: 120, mass: 0.8 },
  });
  const priceRise = spring({
    frame: frame - START - 32,
    fps,
    config: { damping: 22, stiffness: 120, mass: 0.8 },
  });
  const isLast = index === PRODUCTS.length - 1;
  const removing = isLast ? interpolate(frame, [START + 54, START + 70], [0, 1], CLAMP) : 0;
  const opacity = enter * (isLast ? 1 - removing : 1);
  const price = product.before + (product.after - product.before) * priceRise;

  return (
    <div
      style={{
        width: 440,
        minHeight: 152,
        padding: "18px 20px",
        borderRadius: 16,
        background: "rgba(255,255,255,0.035)",
        border: `1px solid ${priceRise > 0.5 ? "rgba(250,204,21,0.32)" : "rgba(255,255,255,0.10)"}`,
        display: "flex",
        alignItems: "center",
        gap: 16,
        opacity,
        transform: `translateY(${interpolate(enter, [0, 1], [28, 0])}px) scale(${1 - removing * 0.08})`,
        filter: `blur(${removing * 7}px)`,
      }}
    >
      <div style={{ width: 66, display: "flex", justifyContent: "center" }}>
        <ProductIcon type={product.icon} color={priceRise > 0.5 ? YELLOW : WHITE} />
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ color: WHITE, fontSize: 28, fontWeight: 800, letterSpacing: "-0.02em" }}>{product.name}</div>
        <div style={{ color: MUTED, fontSize: 16, marginTop: 4, letterSpacing: "0.08em" }}>1 unidade</div>
      </div>
      <div
        style={{
          color: priceRise > 0.5 ? YELLOW : WHITE,
          fontSize: 30,
          fontWeight: 800,
          fontVariantNumeric: "tabular-nums",
          textDecoration: isLast && removing > 0.3 ? "line-through" : undefined,
          opacity: 1 - removing * 0.5,
        }}
      >
        R$ {price.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </div>
    </div>
  );
}

export function ProductBasket() {
  const frame = useCurrentFrame();
  const rise = spring({
    frame: frame - START - 32,
    fps: 30,
    config: { damping: 22, stiffness: 110, mass: 0.9 },
  });
  const afterRemoval = frame >= START + 74;

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "110px 70px 140px",
        fontFamily: FONT,
        color: WHITE,
      }}
    >
      <div style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ color: YELLOW, fontSize: 20, fontWeight: 800, letterSpacing: "0.14em" }}>CESTA DE EXEMPLO</div>
        <div
          style={{
            border: "1px solid rgba(250,204,21,0.35)",
            borderRadius: 999,
            padding: "8px 14px",
            color: YELLOW,
            fontSize: 16,
            fontWeight: 700,
            letterSpacing: "0.08em",
          }}
        >
          SIMULAÇÃO · PREÇOS +25%
        </div>
      </div>

      <div style={{ marginTop: 18, width: "100%", maxWidth: 920 }}>
        <div style={{ fontSize: 62, fontWeight: 900, letterSpacing: "-0.05em", lineHeight: 1 }}>
          A mesma quantia.
          <br />
          <span style={{ color: YELLOW }}>Menos produtos.</span>
        </div>
      </div>

      <div style={{ marginTop: 26, display: "flex", flexWrap: "wrap", gap: 16, justifyContent: "center", maxWidth: 920 }}>
        {PRODUCTS.map((product, index) => (
          <ProductCard key={product.name} product={product} index={index} frame={frame} />
        ))}
        <div
          style={{
            width: 440,
            minHeight: 152,
            padding: "18px 22px",
            borderRadius: 16,
            background: "rgba(250,204,21,0.08)",
            border: "1px solid rgba(250,204,21,0.45)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            gap: 4,
          }}
        >
          <div style={{ color: MUTED, fontSize: 15, letterSpacing: "0.12em" }}>CUSTO DA CESTA</div>
          <AnimatedNumber
            from={100}
            to={125}
            delay={START + 32}
            duration={18}
            prefix="R$ "
            decimals={2}
            style={{ color: YELLOW, fontSize: 44, fontWeight: 900, letterSpacing: "-0.05em" }}
          />
          <div style={{ color: MUTED, fontSize: 16 }}>{afterRemoval ? "R$ 100 compram 4 de 5" : "5 itens · exemplo hipotético"}</div>
        </div>
      </div>

      <div
        style={{
          marginTop: 26,
          minHeight: 74,
          width: "100%",
          maxWidth: 920,
          display: "flex",
          alignItems: "center",
          gap: 16,
          opacity: interpolate(rise, [0, 1], [0.35, 1]),
          transform: `translateY(${interpolate(rise, [0, 1], [18, 0])}px)`,
        }}
      >
        <div style={{ width: 44, height: 3, background: YELLOW }} />
        <div style={{ color: WHITE, fontSize: 27, fontWeight: 700 }}>
          {afterRemoval ? "R$ 100 compram 4 dos 5 itens." : "Os preços sobem. O valor nominal não."}
        </div>
      </div>
      <div style={{ position: "absolute", left: 70, right: 70, bottom: 120, color: MUTED, fontSize: 17, textAlign: "center" }}>
        Valores hipotéticos para explicar o conceito. Não representam preços reais.
      </div>
    </div>
  );
}
