"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { chartLabel, type ChartRange } from "@/lib/chart";
import { usd } from "@/lib/format";

export function BitcoinPriceChart({
  data,
  range,
}: {
  data: { time: number; price: number }[];
  range: ChartRange;
}) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 8, right: 4, bottom: 0, left: 0 }}>
        <defs>
          <linearGradient id="bitcoinFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#facc15" stopOpacity={0.28} />
            <stop offset="100%" stopColor="#facc15" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
        <XAxis
          dataKey="time"
          tick={{ fill: "#737373", fontSize: 10 }}
          tickLine={false}
          axisLine={false}
          minTickGap={34}
          tickFormatter={(value) => chartLabel(Number(value), range)}
        />
        <YAxis hide domain={["dataMin", "dataMax"]} />
        <Tooltip
          contentStyle={{
            background: "#0b0b0b",
            border: "1px solid rgba(255,255,255,0.12)",
            borderRadius: 10,
            fontSize: 12,
          }}
          labelFormatter={(value) => chartLabel(Number(value), range)}
          formatter={(value) => [usd(Number(value)), "BTC"]}
        />
        <Area
          type="monotone"
          dataKey="price"
          stroke="#facc15"
          strokeWidth={2}
          fill="url(#bitcoinFill)"
          dot={false}
          activeDot={{ r: 3, fill: "#facc15", stroke: "#050505" }}
          isAnimationActive
          animationDuration={900}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
