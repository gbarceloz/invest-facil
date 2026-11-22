import { interpolate, useCurrentFrame } from "remotion";
import { CLAMP, FONT, MUTED, WHITE, YELLOW, YELLOW_SOFT } from "../v01/data";
import type { MotifKind } from "./types";

const box: React.CSSProperties = {
  borderRadius: 26,
  background: "linear-gradient(135deg, #0b0b0b 0%, #171717 55%, #0a0a0a 100%)",
  border: "1.5px solid rgba(250,204,21,0.30)",
  boxShadow: "0 34px 80px rgba(0,0,0,0.72)",
  overflow: "hidden",
  position: "relative",
};

export function ProductIcon({ type, color = WHITE, size = 54 }: { type: string; color?: string; size?: number }) {
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

export function NoteMotif({ width = 640, height = 352 }: { width?: number; height?: number }) {
  const frame = useCurrentFrame();
  const scale = Math.min(width / 640, height / 352);
  const sheen = interpolate(frame % 180, [0, 90, 180], [-0.6, 1.8, -0.6], CLAMP);
  return (
    <div style={{ ...box, width, height }}>
      <svg width="100%" height="100%" viewBox="0 0 640 352" style={{ position: "absolute", inset: 0 }}>
        <defs>
          <pattern id="note-grid" width="56" height="56" patternUnits="userSpaceOnUse">
            <circle cx="28" cy="28" r="23" fill="none" stroke="rgba(250,204,21,0.10)" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="640" height="352" fill="url(#note-grid)" />
        <rect x="0" y="0" width="14" height="352" fill={YELLOW} />
        <path d="M0 286 Q 160 238 320 286 T 640 286" fill="none" stroke="rgba(250,204,21,0.20)" strokeWidth="2" />
        <rect x={-120 + sheen * 380} y="-40" width="90" height="440" fill="rgba(255,255,255,0.045)" transform="rotate(16 320 176)" />
      </svg>
      <div style={{ position: "absolute", top: 28 * scale, left: 44 * scale, color: YELLOW, fontSize: 26 * scale, fontWeight: 900 }}>R$</div>
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: WHITE,
          fontSize: 172 * scale,
          fontWeight: 900,
          letterSpacing: "-0.09em",
        }}
      >
        100
      </div>
      <div style={{ position: "absolute", left: 44 * scale, bottom: 24 * scale, color: MUTED, fontSize: 15 * scale, fontWeight: 700, letterSpacing: "0.14em" }}>
        NOTA ILUSTRATIVA
      </div>
      <div style={{ position: "absolute", right: 34 * scale, bottom: 24 * scale, color: YELLOW, fontSize: 15 * scale, fontWeight: 800, letterSpacing: "0.12em" }}>
        IF · 001
      </div>
    </div>
  );
}

export function CupMotif({ width = 520 }: { width?: number }) {
  const frame = useCurrentFrame();
  const steam = (index: number) => {
    const t = (frame / 30 + index * 0.8) % 2;
    return Math.sin(t * Math.PI) * 8;
  };
  return (
    <div style={{ width, height: width * 0.78, position: "relative", fontFamily: FONT }}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "radial-gradient(ellipse at 50% 60%, rgba(250,204,21,0.12) 0%, rgba(5,5,5,0) 65%)",
        }}
      />
      <svg viewBox="0 0 520 406" width="100%" height="100%">
        <ellipse cx="260" cy="340" rx="170" ry="28" fill="rgba(250,204,21,0.08)" stroke="rgba(250,204,21,0.26)" strokeWidth="2" />
        <path d="M152 150 L368 150 L344 300 Q338 330 306 330 L214 330 Q182 330 176 300 Z" fill="rgba(255,255,255,0.06)" stroke={YELLOW} strokeWidth="4" />
        <path d="M368 178 L412 178 Q448 178 448 214 Q448 258 404 258 L354 258" fill="none" stroke={YELLOW} strokeWidth="4" strokeLinecap="round" />
        <ellipse cx="260" cy="150" rx="108" ry="24" fill="rgba(250,204,21,0.10)" stroke={YELLOW_SOFT} strokeWidth="3" />
        {[0, 1, 2].map((index) => (
          <path
            key={index}
            d={`M ${220 + index * 40} 112 C ${210 + index * 40 + steam(index)} 84, ${236 + index * 40} 66, ${226 + index * 40} 42`}
            fill="none"
            stroke="rgba(255,255,255,0.28)"
            strokeWidth="4"
            strokeLinecap="round"
          />
        ))}
      </svg>
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 4, textAlign: "center", color: MUTED, fontSize: 18, letterSpacing: "0.16em" }}>
        O MESMO CAFÉ
      </div>
    </div>
  );
}

export function ReceiptMotif({ width = 460 }: { width?: number }) {
  const frame = useCurrentFrame();
  const line = interpolate(frame, [0, 70], [0, 1], CLAMP);
  return (
    <div
      style={{
        width,
        minHeight: width * 1.12,
        background: "linear-gradient(180deg, #f5f0e6 0%, #e8e1d2 100%)",
        borderRadius: 10,
        padding: "26px 26px 30px",
        fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
        color: "#1a1a1a",
        boxShadow: "0 40px 80px rgba(0,0,0,0.65)",
        transform: "rotate(-1.5deg)",
      }}
    >
      <div style={{ fontSize: 18, fontWeight: 700, letterSpacing: "0.18em", textAlign: "center" }}>RECIBO</div>
      <div style={{ marginTop: 8, fontSize: 13, textAlign: "center", opacity: 0.55 }}>EXEMPLO DIDÁTICO</div>
      <div style={{ marginTop: 24, display: "flex", flexDirection: "column", gap: 12 }}>
        {[0, 1, 2, 3].map((index) => (
          <div key={index} style={{ display: "flex", justifyContent: "space-between", fontSize: 15, opacity: 0.72 }}>
            <span>{["CAFÉ", "PÃO", "TRANSPORTE", "LEITE"][index]}</span>
            <span>R$ {["8,00", "6,00", "5,00", "5,49"][index]}</span>
          </div>
        ))}
        <div style={{ height: 1, background: "rgba(0,0,0,0.18)", margin: "8px 0" }} />
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 16, fontWeight: 700 }}>
          <span>SUBTOTAL</span>
          <span>R$ 24,49</span>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: 16,
            fontWeight: 800,
            background: `rgba(250,204,21,${0.25 + line * 0.45})`,
            padding: "8px 6px",
            borderLeft: `4px solid ${YELLOW}`,
          }}
        >
          <span>INFLAÇÃO</span>
          <span>+ R$ 5,51</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 20, fontWeight: 800, marginTop: 4 }}>
          <span>TOTAL</span>
          <span>R$ 30,00</span>
        </div>
      </div>
      <div style={{ marginTop: 22, fontSize: 12, lineHeight: 1.5, opacity: 0.55 }}>
        Valores hipotéticos. Não representam preços reais.
      </div>
    </div>
  );
}

export function MachineMotif({ width = 860 }: { width?: number }) {
  const frame = useCurrentFrame();
  const rotate = (frame * 1.7) % 360;
  return (
    <div style={{ width, height: width * 0.46, position: "relative", fontFamily: FONT }}>
      <svg viewBox="0 0 860 396" width="100%" height="100%">
        <rect x="40" y="290" width="780" height="10" rx="5" fill="rgba(255,255,255,0.12)" />
        <rect x="250" y="120" width="360" height="190" rx="22" fill="rgba(255,255,255,0.04)" stroke="rgba(250,204,21,0.35)" strokeWidth="2" />
        {[0, 1, 2].map((index) => (
          <g key={index} transform={`translate(${330 + index * 100} 214) rotate(${index % 2 ? -rotate : rotate})`}>
            <circle r="44" fill="none" stroke={YELLOW} strokeWidth="4" opacity="0.85" />
            <circle r="12" fill={YELLOW} />
            {Array.from({ length: 8 }, (_, tooth) => {
              const angle = (tooth / 8) * Math.PI * 2;
              return <line key={tooth} x1={Math.cos(angle) * 22} y1={Math.sin(angle) * 22} x2={Math.cos(angle) * 40} y2={Math.sin(angle) * 40} stroke={YELLOW} strokeWidth="7" strokeLinecap="round" />;
            })}
          </g>
        ))}
        <g transform="translate(80 196)">
          <rect x="-40" y="-56" width="150" height="112" rx="8" fill="rgba(250,204,21,0.10)" stroke={YELLOW} strokeWidth="2" />
          <text x="35" y="6" fill={WHITE} fontSize="34" fontWeight="900" textAnchor="middle" fontFamily={FONT}>100</text>
          <text x="35" y="30" fill={MUTED} fontSize="12" textAnchor="middle" fontFamily={FONT}>ENTRA</text>
        </g>
        <g transform="translate(700 196)">
          <rect x="-70" y="-70" width="150" height="140" rx="12" fill="rgba(255,255,255,0.03)" stroke="rgba(250,204,21,0.4)" strokeWidth="2" />
          {[0, 1, 2].map((index) => (
            <circle key={index} cx={-34 + index * 34} cy={10} r="16" fill="rgba(250,204,21,0.18)" stroke={YELLOW} strokeWidth="2" />
          ))}
          <text x="5" y="56" fill={MUTED} fontSize="12" textAnchor="middle" fontFamily={FONT}>SAI MENOR</text>
        </g>
        <path d="M190 196 L250 196 M610 196 L630 196" stroke={YELLOW} strokeWidth="3" strokeDasharray="8 8" />
      </svg>
    </div>
  );
}

export function TimerMotif({ width = 380 }: { width?: number }) {
  const frame = useCurrentFrame();
  const progress = interpolate(frame, [0, 900], [1, 0], CLAMP);
  const radius = 130;
  const circumference = 2 * Math.PI * radius;
  return (
    <div style={{ width, height: width, position: "relative", fontFamily: FONT }}>
      <svg viewBox="0 0 380 380" width="100%" height="100%">
        <circle cx="190" cy="190" r={radius} fill="rgba(250,204,21,0.04)" stroke="rgba(255,255,255,0.12)" strokeWidth="10" />
        <circle
          cx="190"
          cy="190"
          r={radius}
          fill="none"
          stroke={YELLOW}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - progress)}
          transform="rotate(-90 190 190)"
        />
        <text x="190" y="205" fill={WHITE} fontSize="86" fontWeight="900" textAnchor="middle" fontFamily={FONT}>30</text>
        <text x="190" y="242" fill={MUTED} fontSize="18" textAnchor="middle" letterSpacing="0.14em" fontFamily={FONT}>SEGUNDOS</text>
      </svg>
    </div>
  );
}

export function ChatMotif({ width = 760, local = 0 }: { width?: number; local?: number }) {
  const second = interpolate(local, [140, 160], [0, 1], CLAMP);
  return (
    <div style={{ width, minHeight: 360, position: "relative", fontFamily: FONT }}>
      <div
        style={{
          width: "78%",
          padding: "22px 26px",
          borderRadius: "24px 24px 24px 6px",
          background: "rgba(255,255,255,0.07)",
          border: "1px solid rgba(255,255,255,0.12)",
          color: WHITE,
          fontSize: 28,
          lineHeight: 1.3,
          fontWeight: 700,
        }}
      >
        “dinheiro parado não perde valor”
        <div style={{ marginTop: 8, color: MUTED, fontSize: 17, fontWeight: 600 }}>amigo · 09:41</div>
      </div>
      <div
        style={{
          width: "76%",
          marginLeft: "auto",
          marginTop: 24,
          padding: "22px 26px",
          borderRadius: "24px 24px 6px 24px",
          background: "rgba(250,204,21,0.14)",
          border: "1px solid rgba(250,204,21,0.45)",
          color: WHITE,
          fontSize: 28,
          lineHeight: 1.3,
          fontWeight: 700,
          opacity: second,
          transform: `translateY(${interpolate(second, [0, 1], [16, 0])}px)`,
        }}
      >
        A conta não fecha.
        <div style={{ marginTop: 8, color: YELLOW, fontSize: 17, fontWeight: 700 }}>VOCÊ · AGORA</div>
      </div>
    </div>
  );
}

export function MirrorMotif({ width = 640 }: { width?: number }) {
  const frame = useCurrentFrame();
  const shrink = interpolate(frame, [0, 120], [1, 0.72], CLAMP);
  return (
    <div style={{ width, height: width * 0.86, position: "relative", fontFamily: FONT }}>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: width * 0.42, transform: `scale(${shrink})`, transformOrigin: "center top", opacity: 0.95 }}>
        <NoteMotif width={width} height={width * 0.42} />
      </div>
      <div
        style={{
          position: "absolute",
          top: width * 0.42,
          left: 0,
          right: 0,
          height: width * 0.42,
          transform: "scaleY(-1)",
          opacity: 0.32,
          maskImage: "linear-gradient(180deg, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0) 100%)",
          WebkitMaskImage: "linear-gradient(180deg, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0) 100%)",
        }}
      >
        <NoteMotif width={width} height={width * 0.42} />
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: width * 0.36, height: 1, background: "rgba(250,204,21,0.25)" }} />
    </div>
  );
}

export function SalaryMotif({ width = 560 }: { width?: number }) {
  return (
    <div style={{ ...box, width, padding: "30px 32px", fontFamily: FONT }}>
      <div style={{ color: MUTED, fontSize: 18, fontWeight: 800, letterSpacing: "0.16em" }}>SALÁRIO</div>
      <div style={{ color: WHITE, fontSize: 48, fontWeight: 900, marginTop: 8, fontVariantNumeric: "tabular-nums" }}>R$ 3.200</div>
      <div style={{ marginTop: 18, height: 1, background: "rgba(255,255,255,0.12)" }} />
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 18, color: MUTED, fontSize: 18 }}>
        <span>PREÇOS</span>
        <span style={{ color: YELLOW, fontWeight: 800 }}>+ MAIS</span>
      </div>
      <div style={{ marginTop: 10, color: MUTED, fontSize: 14 }}>EXEMPLO DIDÁTICO</div>
    </div>
  );
}

export function LineMotif({
  width = 760,
  height = 360,
  local = 0,
  years = 10,
}: {
  width?: number;
  height?: number;
  local?: number;
  years?: number;
}) {
  const draw = interpolate(local, [-45, 45], [0, 1], CLAMP);
  const five = years === 5;
  const points = five ? [100, 90.7, 82.3, 78.35] : [100, 90.7, 82.3, 74.6, 67.7, 61.4];
  const last = points.length - 1;
  const x = (index: number) => 40 + (index / last) * 680;
  const y = (value: number) => 26 + ((100 - value) / 40) * 250;
  const path = points.map((value, index) => `${index === 0 ? "M" : "L"} ${x(index)} ${y(value)}`).join(" ");
  return (
    <svg viewBox="0 0 760 360" width={width} height={height} style={{ overflow: "visible", fontFamily: FONT }}>
      {[100, 80, 60].map((value) => (
        <g key={value}>
          <line x1="34" y1={y(value)} x2="734" y2={y(value)} stroke="rgba(255,255,255,0.10)" strokeWidth="1" />
          <text x="22" y={y(value) + 5} fill={MUTED} fontSize="14" textAnchor="end">{value}</text>
        </g>
      ))}
      {(five ? [0, 5] : [0, 5, 10]).map((year) => (
        <text key={year} x={x((year / (five ? 5 : 10)) * last)} y="330" fill={MUTED} fontSize="15" textAnchor="middle">
          {year === 0 ? "HOJE" : `${year} ANOS`}
        </text>
      ))}
      <path d={`${path} L 720 300 L 40 300 Z`} fill="rgba(250,204,21,0.10)" opacity={draw} />
      <path d={path} fill="none" stroke={YELLOW} strokeWidth="5" strokeLinecap="round" strokeDasharray="1000" strokeDashoffset={1000 * (1 - draw)} />
      {points.map((value, index) => (
        <circle key={index} cx={x(index)} cy={y(value)} r={index === last ? 7 : 4} fill={YELLOW} opacity={interpolate(draw, [index * 0.15, index * 0.15 + 0.2], [0, 1], CLAMP)} />
      ))}
      <text x="716" y={y(points[last]) - 16} fill={YELLOW} fontSize="20" fontWeight="800" textAnchor="end">
        {five ? "78" : "61"}
      </text>
    </svg>
  );
}

export function BasketMotif({ width = 700, remove = 2 }: { width?: number; remove?: number }) {
  const frame = useCurrentFrame();
  const icons = ["coffee", "bread", "bus", "milk", "eggs"];
  return (
    <div style={{ width, display: "flex", gap: 12, justifyContent: "center", fontFamily: FONT }}>
      {icons.map((icon, index) => {
        const removed = index >= icons.length - remove && frame > 30 + (index - 3) * 14;
        return (
          <div
            key={icon}
            style={{
              width: (width - 48) / 5,
              height: (width - 48) / 5,
              borderRadius: 18,
              border: removed ? "1px dashed rgba(255,255,255,0.20)" : "1px solid rgba(250,204,21,0.50)",
              background: removed ? "rgba(255,255,255,0.02)" : "rgba(250,204,21,0.10)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              opacity: removed ? 0.45 : 1,
            }}
          >
            <ProductIcon type={icon} color={removed ? MUTED : YELLOW} size={42} />
          </div>
        );
      })}
    </div>
  );
}

export function Motif({ kind, width, remove, local, years }: { kind: MotifKind; width?: number; remove?: number; local?: number; years?: number }) {
  switch (kind) {
    case "note":
      return <NoteMotif width={width} />;
    case "cup":
      return <CupMotif width={width} />;
    case "receipt":
      return <ReceiptMotif width={width} />;
    case "machine":
      return <MachineMotif width={width} />;
    case "timer":
      return <TimerMotif width={width} />;
    case "chat":
      return <ChatMotif width={width} local={local} />;
    case "mirror":
      return <MirrorMotif width={width} />;
    case "salary":
      return <SalaryMotif width={width} />;
    case "line":
      return <LineMotif width={width} local={local} years={years} />;
    case "basket":
      return <BasketMotif width={width} remove={remove} />;
  }
}
