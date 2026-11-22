import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { CLAMP, FONT, MUTED, WHITE, YELLOW } from "./constants";

const POINTS = [
  { year: 0, value: 100, label: "R$ 100" },
  { year: 2, value: 90.7, label: "" },
  { year: 4, value: 82.3, label: "" },
  { year: 6, value: 74.6, label: "" },
  { year: 8, value: 67.7, label: "" },
  { year: 10, value: 61.4, label: "R$ 61" },
];

const X0 = 70;
const X1 = 850;
const Y0 = 60;
const Y1 = 380;
const MIN = 55;
const MAX = 100;

const x = (year: number) => X0 + (year / 10) * (X1 - X0);
const y = (value: number) => Y1 - ((value - MIN) / (MAX - MIN)) * (Y1 - Y0);

export function FinancialChart({ delay = 0 }: { delay?: number }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const draw = spring({
    frame: frame - delay,
    fps,
    config: { damping: 26, stiffness: 55, mass: 1.1 },
    durationInFrames: 90,
  });
  const path = POINTS.map((point, index) => `${index === 0 ? "M" : "L"} ${x(point.year)} ${y(point.value)}`).join(" ");
  const area = `${path} L ${X1} ${Y1} L ${X0} ${Y1} Z`;
  const pathLength = 1200;
  const offset = interpolate(draw, [0, 1], [pathLength, 0], CLAMP);

  return (
    <svg viewBox="0 0 920 430" width="100%" height="100%" style={{ overflow: "visible", fontFamily: FONT }}>
      <defs>
        <linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={YELLOW} stopOpacity="0.24" />
          <stop offset="100%" stopColor={YELLOW} stopOpacity="0" />
        </linearGradient>
        <linearGradient id="lineStroke" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#FDE047" />
          <stop offset="100%" stopColor={YELLOW} />
        </linearGradient>
      </defs>

      {[100, 80, 60].map((value) => (
        <g key={value}>
          <line x1={X0} y1={y(value)} x2={X1} y2={y(value)} stroke="rgba(255,255,255,0.10)" strokeWidth="1" />
          <text x={X0 - 14} y={y(value) + 5} fill={MUTED} fontSize="15" textAnchor="end">
            {value}
          </text>
        </g>
      ))}

      {[0, 5, 10].map((year) => (
        <g key={year}>
          <line x1={x(year)} y1={Y0} x2={x(year)} y2={Y1} stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
          <text x={x(year)} y={Y1 + 32} fill={MUTED} fontSize="16" textAnchor="middle">
            {year === 0 ? "hoje" : `${year} anos`}
          </text>
        </g>
      ))}

      <path d={area} fill="url(#areaFill)" opacity={interpolate(draw, [0.25, 0.8], [0, 1], CLAMP)} />
      <path
        d={path}
        fill="none"
        stroke="url(#lineStroke)"
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray={pathLength}
        strokeDashoffset={offset}
      />

      {[0, 5, 10].map((year) => {
        const point = POINTS.find((item) => item.year === year);
        if (!point) {
          return null;
        }
        const threshold = year / 10;
        const opacity = interpolate(draw, [threshold * 0.8, threshold * 0.8 + 0.15], [0, 1], CLAMP);
        return (
          <g key={year} opacity={opacity}>
            <circle cx={x(year)} cy={y(point.value)} r="10" fill={YELLOW} />
            <circle cx={x(year)} cy={y(point.value)} r="22" fill="none" stroke={YELLOW} strokeOpacity="0.22" />
            <text
              x={x(year)}
              y={y(point.value) - 26}
              fill={year === 10 ? YELLOW : WHITE}
              fontSize={year === 10 ? 34 : 24}
              fontWeight="800"
              textAnchor="middle"
            >
              {point.label}
            </text>
          </g>
        );
      })}

      <text x={X0} y={Y0 - 24} fill={MUTED} fontSize="16" letterSpacing="0.12em">
        PODER DE COMPRA
      </text>
    </svg>
  );
}
