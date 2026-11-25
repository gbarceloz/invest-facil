package com.investfacil.api.gamification;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public final class GamificationDtos {

    private GamificationDtos() {
    }

    public record LevelView(int number, String name, int minXp, Integer nextLevelXp) {
    }

    public record AchievementView(UUID id, String code, String name, String description,
                                  int xpReward, boolean unlocked, Instant unlockedAt) {
    }

    public record XpEntry(int amount, String reason, UUID lessonId, Instant createdAt) {
    }

    public record StreakView(int current, int best, LocalDate lastActivityDate,
                             String timezone) {
    }

    public record GamificationSummary(int xp, LevelView level, int xpToNextLevel,
                                      int progressPercent, int currentStreak, int bestStreak,
                                      int achievementsUnlocked, int achievementsTotal,
                                      List<AchievementView> achievements,
                                      int fichas, int fichasMax, int quizPassThresholdPercent,
                                      StreakView streak) {
    }
}
