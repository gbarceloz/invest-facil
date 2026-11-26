package com.investfacil.api.onboarding;

import com.investfacil.api.onboarding.OnboardingTypes.EmergencyReserve;
import com.investfacil.api.onboarding.OnboardingTypes.FinancialSituation;
import com.investfacil.api.onboarding.OnboardingTypes.Goal;
import com.investfacil.api.onboarding.OnboardingTypes.HighInterestDebt;
import com.investfacil.api.onboarding.OnboardingTypes.KnowledgeLevel;
import com.investfacil.api.onboarding.OnboardingTypes.LearningPreference;
import com.investfacil.api.onboarding.OnboardingTypes.SpendingTrigger;
import com.investfacil.api.onboarding.OnboardingTypes.StudyDay;
import com.fasterxml.jackson.annotation.JsonInclude;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;

import java.time.Instant;
import java.util.List;

public final class OnboardingDtos {

    private OnboardingDtos() {
    }

    /**
     * Respostas do onboarding. Todos os valores monetários estão em centavos e
     * são opcionais quando a pessoa escolhe não informar. Nenhum indicador
     * derivado é aceito do cliente.
     */
    public record AnswersRequest(
            @NotNull(message = "Escolha um objetivo.")
            Goal goal,
            @NotNull(message = "Informe sua situação financeira.")
            FinancialSituation financialSituation,
            @PositiveOrZero(message = "A renda não pode ser negativa.")
            @Max(value = 100_000_000_000L, message = "Valor acima do limite suportado.")
            Long incomeCents,
            @PositiveOrZero(message = "A capacidade de poupança não pode ser negativa.")
            @Max(value = 100_000_000_000L, message = "Valor acima do limite suportado.")
            Long savingsCapacityCents,
            @PositiveOrZero(message = "As despesas não podem ser negativas.")
            @Max(value = 100_000_000_000L, message = "Valor acima do limite suportado.")
            Long essentialExpensesCents,
            @NotNull(message = "Informe sua reserva de emergência.")
            EmergencyReserve emergencyReserve,
            @NotNull(message = "Informe se há dívidas de juros altos.")
            HighInterestDebt highInterestDebt,
            @NotNull(message = "Escolha uma preferência de aprendizado.")
            LearningPreference learningPreference,
            @NotNull(message = "Informe seu nível de conhecimento.")
            KnowledgeLevel knowledgeLevel,
            @NotNull(message = "Informe seus gatilhos de gasto.")
            @Size(min = 1, max = 6, message = "Escolha entre 1 e 6 gatilhos de gasto.")
            List<@NotNull(message = "Gatilho inválido.") SpendingTrigger> spendingTriggers,
            @NotNull(message = "Escolha ao menos um dia de estudo.")
            @Size(min = 1, max = 7, message = "Escolha entre 1 e 7 dias de estudo.")
            List<@NotNull(message = "Dia inválido.") StudyDay> studyDays,
            @NotBlank(message = "Escolha um horário de estudo.")
            @Pattern(regexp = "^([01][0-9]|2[0-3]):[0-5][0-9]$",
                    message = "Horário inválido. Use o formato HH:mm.")
            String studyTime
    ) {
    }

    public record CompleteRequest(
            @NotBlank(message = "Informe seu nome.")
            @Size(min = 2, max = 120, message = "O nome deve ter entre 2 e 120 caracteres.")
            String name,
            @NotNull(message = "Respostas obrigatórias.")
            @Valid
            AnswersRequest answers
    ) {
    }

    public record ScoreFactorView(
            String key,
            String label,
            boolean answered,
            int points,
            int maxPoints,
            String detail
    ) {
    }

    public record FinancialHealthView(
            Integer score,
            String band,
            String bandLabel,
            String opportunity,
            String opportunityLabel,
            String recommendation,
            Long monthlySavingsCents,
            Long emergencyFundGoalCents,
            List<ScoreFactorView> factors
    ) {
    }

    public record AnswersView(
            Goal goal,
            FinancialSituation financialSituation,
            Long incomeCents,
            Long savingsCapacityCents,
            Long essentialExpensesCents,
            EmergencyReserve emergencyReserve,
            HighInterestDebt highInterestDebt,
            LearningPreference learningPreference,
            KnowledgeLevel knowledgeLevel,
            List<String> spendingTriggers,
            List<String> studyDays,
            String studyTime
    ) {
    }

    @JsonInclude(JsonInclude.Include.NON_NULL)
    public record ProfileView(
            boolean completed,
            String name,
            AnswersView answers,
            FinancialHealthView health,
            Instant completedAt
    ) {
        public static ProfileView empty(String name) {
            return new ProfileView(false, name, null, null, null);
        }
    }
}
