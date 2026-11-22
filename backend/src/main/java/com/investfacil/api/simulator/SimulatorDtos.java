package com.investfacil.api.simulator;

import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

public final class SimulatorDtos {

    private SimulatorDtos() {
    }

    public record ScenarioRequest(
            @NotNull(message = "Informe o capital inicial.")
            @DecimalMin(value = "0", message = "O capital inicial não pode ser negativo.")
            @Digits(integer = 13, fraction = 2, message = "Valor com formato inválido.")
            BigDecimal initialAmount,
            @NotNull(message = "Informe o aporte mensal.")
            @DecimalMin(value = "0", message = "O aporte não pode ser negativo.")
            @Digits(integer = 13, fraction = 2, message = "Valor com formato inválido.")
            BigDecimal monthlyContribution,
            @Min(value = 1, message = "O prazo mínimo é 1 mês.")
            @Max(value = 600, message = "O prazo máximo é 600 meses.")
            int months,
            @NotNull(message = "Informe a taxa anual hipotética.")
            @DecimalMin(value = "0", message = "A taxa não pode ser negativa.")
            @DecimalMax(value = "100", message = "A taxa deve ser no máximo 100% ao ano.")
            @Digits(integer = 3, fraction = 3, message = "Taxa com formato inválido.")
            BigDecimal annualRate,
            @DecimalMin(value = "0", message = "A inflação não pode ser negativa.")
            @DecimalMax(value = "100", message = "A inflação deve ser no máximo 100% ao ano.")
            @Digits(integer = 3, fraction = 3, message = "Inflação com formato inválido.")
            BigDecimal inflationRate
    ) {
    }

    public record ScenarioPoint(int month, BigDecimal contributed, BigDecimal balance,
                                BigDecimal realBalance) {
    }

    public record ScenarioResult(BigDecimal finalAmount, BigDecimal investedAmount,
                                 BigDecimal interestAmount, BigDecimal realFinalAmount,
                                 BigDecimal monthlyRate, List<ScenarioPoint> series,
                                 String disclaimer) {
    }

    public record SaveScenarioRequest(
            @NotBlank(message = "Dê um nome à simulação.")
            @Size(max = 120, message = "O nome deve ter no máximo 120 caracteres.")
            String name,
            @NotNull(message = "Cenário obrigatório.")
            @Valid ScenarioRequest scenario
    ) {
    }

    public record SavedScenario(UUID id, String name, ScenarioRequest scenario,
                                BigDecimal finalAmount, BigDecimal investedAmount,
                                Instant createdAt) {
    }
}
