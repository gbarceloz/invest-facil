package com.investfacil.api.onboarding;

import com.investfacil.api.onboarding.OnboardingDtos.AnswersRequest;
import com.investfacil.api.onboarding.OnboardingDtos.FinancialHealthView;
import com.investfacil.api.onboarding.OnboardingTypes.EmergencyReserve;
import com.investfacil.api.onboarding.OnboardingTypes.FinancialSituation;
import com.investfacil.api.onboarding.OnboardingTypes.Goal;
import com.investfacil.api.onboarding.OnboardingTypes.HighInterestDebt;
import com.investfacil.api.onboarding.OnboardingTypes.KnowledgeLevel;
import com.investfacil.api.onboarding.OnboardingTypes.LearningPreference;
import com.investfacil.api.onboarding.OnboardingTypes.SpendingTrigger;
import com.investfacil.api.onboarding.OnboardingTypes.StudyDay;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

class FinancialHealthCalculatorTest {

    private final FinancialHealthCalculator calculator = new FinancialHealthCalculator();

    @Test
    void shouldReturnNoScoreWhenNothingWasAnswered() {
        FinancialHealthView health = calculator.calculate(answers(
                null, null, null, EmergencyReserve.PREFER_NOT,
                HighInterestDebt.PREFER_NOT, KnowledgeLevel.BASIC));

        assertNull(health.score());
        assertEquals("SEM_DADOS", health.band());
        assertEquals("Sem dados suficientes", health.bandLabel());
        assertEquals("APRENDER_BASE", health.opportunity());
        assertEquals(4, health.factors().size());
        assertTrue(health.factors().stream().noneMatch(f -> f.answered()));
        assertNull(health.monthlySavingsCents());
        assertNull(health.emergencyFundGoalCents());
    }

    @Test
    void shouldScoreStrongProfileAt100() {
        FinancialHealthView health = calculator.calculate(answers(
                1_000_000L, 250_000L, 400_000L, EmergencyReserve.MORE_THAN_6,
                HighInterestDebt.NONE, KnowledgeLevel.ADVANCED));

        assertEquals(100, health.score());
        assertEquals("CONSOLIDADO", health.band());
        assertEquals("INVESTIR_COM_CRITERIO", health.opportunity());
        assertEquals(250_000L, health.monthlySavingsCents());
        assertEquals(2_400_000L, health.emergencyFundGoalCents());
        assertTrue(health.factors().stream().allMatch(f -> f.answered()));
    }

    @Test
    void shouldPrioritizeHighInterestDebt() {
        FinancialHealthView health = calculator.calculate(answers(
                null, null, null, EmergencyReserve.NONE,
                HighInterestDebt.CREDIT_CARD, KnowledgeLevel.ZERO));

        assertEquals(11, health.score());
        assertEquals("ATENCAO", health.band());
        assertEquals("QUITAR_DIVIDA", health.opportunity());
        assertNull(health.monthlySavingsCents());
    }

    @Test
    void shouldNormalizeOnlyAnsweredFactors() {
        FinancialHealthView health = calculator.calculate(answers(
                null, null, null, EmergencyReserve.THREE_TO_6,
                HighInterestDebt.NONE, KnowledgeLevel.BASIC));

        assertEquals(89, health.score());
        assertEquals("CONSOLIDADO", health.band());
        assertEquals("APRENDER_BASE", health.opportunity());
    }

    @Test
    void shouldDeriveMonthlySavingsAndEmergencyGoal() {
        FinancialHealthView health = calculator.calculate(answers(
                800_000L, null, 500_000L, EmergencyReserve.ONE_TO_3,
                HighInterestDebt.NONE, KnowledgeLevel.INTERMEDIATE));

        assertEquals(300_000L, health.monthlySavingsCents());
        assertEquals(3_000_000L, health.emergencyFundGoalCents());
        assertEquals(80, health.score());
        assertEquals("CONSOLIDADO", health.band());
    }

    @Test
    void shouldNotGoNegativeWhenExpensesExceedIncome() {
        FinancialHealthView health = calculator.calculate(answers(
                500_000L, null, 700_000L, EmergencyReserve.NONE,
                HighInterestDebt.MULTIPLE, KnowledgeLevel.ZERO));

        assertEquals(0L, health.monthlySavingsCents());
        assertEquals(0, health.score());
        assertEquals("ATENCAO", health.band());
        assertEquals("QUITAR_DIVIDA", health.opportunity());
    }

    @Test
    void shouldApplySavingsRateTierAndRoundHalfUp() {
        FinancialHealthView health = calculator.calculate(answers(
                1_000_000L, 50_000L, null, EmergencyReserve.ONE_TO_3,
                HighInterestDebt.NONE, KnowledgeLevel.ADVANCED));

        assertEquals(68, health.score());
        assertEquals("ORGANIZANDO", health.band());
        assertTrue(health.factors().stream()
                .filter(f -> f.key().equals("savingsRate"))
                .findFirst()
                .orElseThrow()
                .detail()
                .contains("5%"));
        assertFalse(health.factors().stream()
                .filter(f -> f.key().equals("expenseRatio"))
                .findFirst()
                .orElseThrow()
                .answered());
    }

    private AnswersRequest answers(Long income, Long savings, Long expenses,
                                   EmergencyReserve reserve, HighInterestDebt debt,
                                   KnowledgeLevel knowledge) {
        return new AnswersRequest(
                Goal.INVEST,
                FinancialSituation.FROM_ZERO,
                income,
                savings,
                expenses,
                reserve,
                debt,
                LearningPreference.MIX,
                knowledge,
                List.of(SpendingTrigger.NONE),
                List.of(StudyDay.MON, StudyDay.WED),
                "19:00");
    }
}
