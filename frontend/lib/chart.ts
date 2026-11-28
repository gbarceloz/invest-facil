export type ChartRange = "24h" | "7d";

export function chartLabel(timestamp: number, range: ChartRange) {
  const date = new Date(timestamp);
  if (range === "24h") {
    return date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  }
  return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
}
