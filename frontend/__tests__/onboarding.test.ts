import { describe, expect, it, beforeEach } from "vitest";
import {
  DRAFT_KEY,
  EMPTY_DRAFT,
  centsToBrlInput,
  clearDraft,
  loadDraft,
  LAST_QUESTION_STEP,
  moneyCents,
  parseBrlToCents,
  saveDraft,
  toAnswers,
} from "@/lib/onboarding";

describe("onboarding currency parsing", () => {
  it("parses Brazilian currency values to cents", () => {
    expect(parseBrlToCents("1.500,00")).toBe(150000);
    expect(parseBrlToCents("R$ 1.500,00")).toBe(150000);
    expect(parseBrlToCents("1500")).toBe(150000);
    expect(parseBrlToCents("10,50")).toBe(1050);
    expect(parseBrlToCents("10.50")).toBe(1050);
    expect(parseBrlToCents("1.000.000")).toBe(100000000);
    expect(parseBrlToCents("0,00")).toBe(0);
    expect(parseBrlToCents("")).toBeNull();
    expect(parseBrlToCents("abc")).toBeNull();
  });

  it("formats cents without losing the decimal part", () => {
    expect(centsToBrlInput(150000)).toBe("1.500,00");
    expect(centsToBrlInput(1050)).toBe("10,50");
    expect(centsToBrlInput(null)).toBe("");
    expect(moneyCents(150000)).toContain("1.500,00");
    expect(moneyCents(null)).toBe("—");
  });
});

describe("onboarding draft", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("round-trips a draft and clamps an invalid step", () => {
    const draft = { ...EMPTY_DRAFT, name: "Marina", goals: ["INVEST" as const] };
    saveDraft(99, draft);
    const restored = loadDraft();
    expect(restored).not.toBeNull();
    expect(restored?.draft.name).toBe("Marina");
    expect(restored?.draft.goals).toEqual(["INVEST"]);
    expect(restored?.step).toBe(LAST_QUESTION_STEP);
    expect(window.localStorage.getItem(DRAFT_KEY)).toContain("version");
  });

  it("migrates a legacy single-choice draft to multi-choice", () => {
    window.localStorage.setItem(
      DRAFT_KEY,
      JSON.stringify({
        version: 1,
        step: 0,
        draft: {
          name: "Marina",
          goal: "INVEST",
          financialSituation: "CAN_SAVE",
          spendingTriggers: [],
        },
      }),
    );
    const restored = loadDraft();
    expect(restored?.draft.goals).toEqual(["INVEST"]);
    expect(restored?.draft.financialSituations).toEqual(["CAN_SAVE"]);
    expect(restored?.draft.spendingTriggers).toEqual(["NONE"]);
  });

  it("ignores malformed storage and clears safely", () => {
    window.localStorage.setItem(DRAFT_KEY, "{not-json");
    expect(loadDraft()).toBeNull();
    window.localStorage.setItem(DRAFT_KEY, JSON.stringify({ version: 2, draft: {} }));
    expect(loadDraft()).toBeNull();
    clearDraft();
    expect(window.localStorage.getItem(DRAFT_KEY)).toBeNull();
  });

  it("only produces answers when every required choice exists", () => {
    expect(toAnswers(EMPTY_DRAFT)).toBeNull();
    const complete = {
      ...EMPTY_DRAFT,
      name: "Marina",
      goals: ["INVEST" as const],
      financialSituations: ["CAN_SAVE" as const],
      emergencyReserve: "ONE_TO_3" as const,
      highInterestDebt: "NONE" as const,
      learningPreference: "MIX" as const,
      knowledgeLevel: "BASIC" as const,
      spendingTriggers: ["NONE" as const],
      studyDays: ["MON" as const],
      studyTime: "19:00",
    };
    const answers = toAnswers(complete);
    expect(answers).not.toBeNull();
    expect(answers?.goal).toBe("INVEST");
    expect(answers?.financialSituation).toBe("CAN_SAVE");
    expect(answers?.incomeCents).toBeNull();
    expect(answers?.studyTime).toBe("19:00");
  });

  it("preserves multiple goals and situations", () => {
    const complete = {
      ...EMPTY_DRAFT,
      name: "Marina",
      goals: ["INVEST" as const, "WEALTH" as const],
      financialSituations: ["FROM_ZERO" as const, "CAN_SAVE" as const],
      emergencyReserve: "ONE_TO_3" as const,
      highInterestDebt: "NONE" as const,
      learningPreference: "MIX" as const,
      knowledgeLevel: "BASIC" as const,
      spendingTriggers: ["NONE" as const],
      studyDays: ["MON" as const],
      studyTime: "19:00",
    };
    const answers = toAnswers(complete);
    expect(answers?.goal).toBe("INVEST");
    expect(answers?.goals).toEqual(["INVEST", "WEALTH"]);
    expect(answers?.financialSituation).toBe("FROM_ZERO");
    expect(answers?.financialSituations).toEqual(["FROM_ZERO", "CAN_SAVE"]);
  });

  it("defaults spending triggers to NONE when the short flow omits them", () => {
    const complete = {
      ...EMPTY_DRAFT,
      name: "Marina",
      goals: ["INVEST" as const],
      financialSituations: ["CAN_SAVE" as const],
      emergencyReserve: "ONE_TO_3" as const,
      highInterestDebt: "NONE" as const,
      learningPreference: "MIX" as const,
      knowledgeLevel: "BASIC" as const,
      spendingTriggers: [],
      studyDays: ["MON" as const],
      studyTime: "19:00",
    };
    expect(toAnswers(complete)?.spendingTriggers).toEqual(["NONE"]);
  });
});
