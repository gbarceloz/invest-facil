package com.investfacil.api.simulator;

import org.junit.jupiter.api.Test;

import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

class SimulatorServiceTest {

    private final SimulatorService service = new SimulatorService(null, null);

    @Test
    void shouldComputeContributionsWithoutInterest() {
        var request = new SimulatorDtos.ScenarioRequest(
                new BigDecimal("1000"), new BigDecimal("100"), 12,
                BigDecimal.ZERO, BigDecimal.ZERO);
        var result = service.calculate(request);
        assertEquals(new BigDecimal("2200.00"), result.investedAmount());
        assertEquals(new BigDecimal("2200.00"), result.finalAmount());
        assertEquals(new BigDecimal("0.00"), result.interestAmount());
        assertEquals(13, result.series().size());
        assertEquals(12, result.series().get(12).month());
    }

    @Test
    void shouldCompoundAtEquivalentMonthlyRate() {
        var request = new SimulatorDtos.ScenarioRequest(
                new BigDecimal("1000"), BigDecimal.ZERO, 12,
                new BigDecimal("12"), BigDecimal.ZERO);
        var result = service.calculate(request);
        // 1000 * (1 + 0.12)^1 = 1120 (equivalência composta)
        assertEquals(new BigDecimal("1120.00"), result.finalAmount());
        assertTrue(result.interestAmount().compareTo(BigDecimal.ZERO) > 0);
    }

    @Test
    void shouldReduceRealValueWhenInflationIsPositive() {
        var request = new SimulatorDtos.ScenarioRequest(
                new BigDecimal("1000"), BigDecimal.ZERO, 120,
                new BigDecimal("10"), new BigDecimal("5"));
        var result = service.calculate(request);
        assertTrue(result.realFinalAmount().compareTo(result.finalAmount()) < 0);
        assertTrue(result.disclaimer().toLowerCase().contains("não representa garantia"));
    }
}
