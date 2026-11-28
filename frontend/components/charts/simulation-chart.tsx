"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { money } from "@/lib/format";

export type SimulationPoint = {
  month: number;
  label: string;
  "patrimônio": number;
  investido: number;
  "poder de compra": number;
};

export function SimulationChart({ data }: { data: SimulationPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 5, right: 8, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="balance" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#facc15" stopOpacity={0.35} />
            <stop offset="95%" stopColor="#facc15" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="invested" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#a3a3a3" stopOpacity={0.18} />
            <stop offset="95%" stopColor="#a3a3a3" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke="rgba(255,255,255,0.07)" vertical={false} />
        <XAxis
          dataKey="label"
          tick={{ fill: "#a3a3a3", fontSize: 10 }}
          tickLine={false}
          axisLine={false}
          minTickGap={28}
        />
        <YAxis
          tick={{ fill: "#a3a3a3", fontSize: 10 }}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `R$ ${(Number(value) / 1000).toFixed(0)}k`}
          width={58}
        />
        <Tooltip
          contentStyle={{ background: "#111111", border: "1px solid #2b2b2b", borderRadius: 12, fontSize: 12 }}
          labelStyle={{ color: "#a3a3a3" }}
          formatter={(value) => money(Number(value ?? 0))}
        />
        <Legend wrapperStyle={{ fontSize: 11, color: "#a3a3a3" }} />
        <Area
          type="monotone"
          dataKey="patrimônio"
          stroke="#facc15"
          strokeWidth={2}
          fill="url(#balance)"
          isAnimationActive
          animationDuration={900}
        />
        <Area
          type="monotone"
          dataKey="investido"
          stroke="#a3a3a3"
          strokeWidth={1.5}
          fill="url(#invested)"
          isAnimationActive
          animationDuration={900}
        />
        <Area
          type="monotone"
          dataKey="poder de compra"
          stroke="#d4d4d4"
          strokeWidth={1.5}
          fillOpacity={0}
          isAnimationActive
          animationDuration={900}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
