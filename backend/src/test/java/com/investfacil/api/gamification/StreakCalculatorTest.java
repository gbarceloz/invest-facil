package com.investfacil.api.gamification;

import org.junit.jupiter.api.Test;

import java.time.LocalDate;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;

class StreakCalculatorTest {

    private static final LocalDate TODAY = LocalDate.of(2026, 11, 24);

    @Test
    void semDiasRetornaZero() {
        assertEquals(0, StreakCalculator.current(List.of(), TODAY));
        assertEquals(0, StreakCalculator.best(List.of()));
    }

    @Test
    void sequenciaAtualContaDiasConsecutivosAteHoje() {
        List<LocalDate> dates = List.of(
                TODAY, TODAY.minusDays(1), TODAY.minusDays(2), TODAY.minusDays(4));
        assertEquals(3, StreakCalculator.current(dates, TODAY));
    }

    @Test
    void sequenciaAtualAceitaUltimoDiaOntem() {
        List<LocalDate> dates = List.of(TODAY.minusDays(1), TODAY.minusDays(2));
        assertEquals(2, StreakCalculator.current(dates, TODAY));
    }

    @Test
    void sequenciaAtualZeraQuandoUltimoDiaEhAntigo() {
        List<LocalDate> dates = List.of(TODAY.minusDays(3), TODAY.minusDays(4));
        assertEquals(0, StreakCalculator.current(dates, TODAY));
    }

    @Test
    void melhorSequenciaConsideraTodoOHistorico() {
        List<LocalDate> dates = List.of(
                TODAY,
                TODAY.minusDays(2), TODAY.minusDays(3), TODAY.minusDays(4),
                TODAY.minusDays(6));
        assertEquals(3, StreakCalculator.best(dates));
    }

    @Test
    void ultimoDiaDeAtividadeEhOMaisRecente() {
        List<LocalDate> dates = List.of(TODAY.minusDays(1), TODAY.minusDays(5));
        assertEquals(TODAY.minusDays(1), StreakCalculator.lastActivityDate(dates));
    }
}
