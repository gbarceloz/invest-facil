import { describe, expect, it } from "vitest";
import { dayCount, initials, money, percent, signedPercent } from "@/lib/format";

describe("formatadores", () => {
  it("formata valores em BRL", () => {
    expect(money(1000)).toContain("1.000,00");
    expect(money("250.5")).toContain("250,50");
    expect(money(null)).toContain("0,00");
  });

  it("formata percentuais com sinal", () => {
    expect(signedPercent(2.4)).toBe("+2,40%");
    expect(signedPercent(-0.6)).toBe("-0,60%");
    expect(percent(42.2)).toBe("42,2%");
  });

  it("usa singular e plural em dias", () => {
    expect(dayCount(0)).toBe("0 dias");
    expect(dayCount(1)).toBe("1 dia");
    expect(dayCount(7)).toBe("7 dias");
  });

  it("extrai iniciais do nome", () => {
    expect(initials("Marina Lima")).toBe("ML");
    expect(initials("Ana")).toBe("A");
  });
});
