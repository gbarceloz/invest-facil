package com.investfacil.api.gamification;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

/**
 * Cálculo de streak a partir da lista de dias válidos. É puro (sem banco e sem
 * relógio) para ser testável; o caller passa a data de "hoje" no timezone do
 * usuário.
 */
public final class StreakCalculator {

    private StreakCalculator() {
    }

    /**
     * Sequência atual: começa no dia mais recente e só continua se o dia mais
     * recente for hoje ou ontem (no timezone do usuário).
     *
     * @param datesDesc dias válidos em ordem decrescente
     * @param today     data local do usuário
     */
    public static int current(List<LocalDate> datesDesc, LocalDate today) {
        if (datesDesc == null || datesDesc.isEmpty()) {
            return 0;
        }
        LocalDate latest = datesDesc.get(0);
        if (!latest.equals(today) && !latest.equals(today.minusDays(1))) {
            return 0;
        }
        Set<LocalDate> days = new HashSet<>(datesDesc);
        int streak = 0;
        LocalDate cursor = latest;
        while (days.contains(cursor)) {
            streak++;
            cursor = cursor.minusDays(1);
        }
        return streak;
    }

    /** Maior sequência consecutiva em toda a história do usuário. */
    public static int best(List<LocalDate> dates) {
        if (dates == null || dates.isEmpty()) {
            return 0;
        }
        List<LocalDate> sorted = new ArrayList<>(dates);
        sorted.sort(Comparator.naturalOrder());
        int best = 1;
        int run = 1;
        for (int i = 1; i < sorted.size(); i++) {
            LocalDate previous = sorted.get(i - 1);
            LocalDate current = sorted.get(i);
            if (current.equals(previous)) {
                continue;
            }
            if (current.equals(previous.plusDays(1))) {
                run++;
                if (run > best) {
                    best = run;
                }
            } else {
                run = 1;
            }
        }
        return best;
    }

    public static LocalDate lastActivityDate(List<LocalDate> datesDesc) {
        return datesDesc == null || datesDesc.isEmpty() ? null : datesDesc.get(0);
    }
}
