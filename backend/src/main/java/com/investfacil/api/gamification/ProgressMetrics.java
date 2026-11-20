package com.investfacil.api.gamification;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

/** Porta de leitura de progresso usada pela gamificação (sem ciclo de beans). */
public interface ProgressMetrics {

    long completedLessons(UUID userId);

    int averageQuizPercent(UUID userId);

    long quizAttempts(UUID userId);

    boolean hasCompletedAnyModule(UUID userId);

    List<LocalDate> activityDates(UUID userId);
}
