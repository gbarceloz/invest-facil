package com.investfacil.api.gamification;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class GamificationService {

    public static final String REASON_LESSON = "LESSON_COMPLETED";
    public static final String REASON_QUIZ = "QUIZ_PASSED";
    public static final String REASON_SIMULATION = "SIMULATION_SAVED";
    public static final String REASON_ACHIEVEMENT = "ACHIEVEMENT";

    private static final ZoneId ZONE = ZoneId.of("America/Sao_Paulo");
    private static final List<Level> LEVELS = List.of(
            new Level(1, "Curioso", 0),
            new Level(2, "Explorador", 300),
            new Level(3, "Analista", 800),
            new Level(4, "Estrategista", 1500),
            new Level(5, "Investidor Consciente", 2500),
            new Level(6, "Mestre", 4000)
    );

    private record Level(int number, String name, int minXp) {
    }

    private final XpLedgerRepository xp;
    private final AchievementRepository achievements;
    private final UserAchievementRepository userAchievements;
    private final ProgressMetrics metrics;

    public GamificationService(XpLedgerRepository xp, AchievementRepository achievements,
                               UserAchievementRepository userAchievements, ProgressMetrics metrics) {
        this.xp = xp;
        this.achievements = achievements;
        this.userAchievements = userAchievements;
        this.metrics = metrics;
    }

    /**
     * Concede XP uma Ãºnica vez por (usuÃ¡rio, aula, motivo) graÃ§as ao Ã­ndice
     * Ãºnico parcial criado na V3. Chamadas repetidas sÃ£o idempotentes.
     */
    @Transactional
    public int awardXp(UUID userId, int amount, String reason, UUID lessonId) {
        if (amount > 0) {
            boolean already = lessonId != null
                    && (REASON_LESSON.equals(reason) || REASON_QUIZ.equals(reason))
                    && xp.existsByUserIdAndLessonIdAndReason(userId, lessonId, reason);
            if (!already) {
                XpLedger entry = new XpLedger();
                entry.setUserId(userId);
                entry.setAmount(amount);
                entry.setReason(reason);
                entry.setLessonId(lessonId);
                try {
                    xp.save(entry);
                } catch (DataIntegrityViolationException ignored) {
                    // Corrida entre duas requisiÃ§Ãµes: o Ã­ndice Ãºnico garante 1 concessÃ£o.
                }
            }
            evaluateAchievements(userId);
        }
        return xp.totalXp(userId);
    }

    @Transactional
    public void unlockByCode(UUID userId, String code) {
        unlock(userId, code);
        evaluateAchievements(userId);
    }

    @Transactional(readOnly = true)
    public GamificationDtos.GamificationSummary summary(UUID userId) {
        int totalXp = xp.totalXp(userId);
        Level level = levelFor(totalXp);
        Level next = nextLevel(level);
        List<LocalDate> dates = activityDates(userId);
        int currentStreak = currentStreak(dates);
        int bestStreak = bestStreak(dates);
        Map<UUID, UserAchievement> unlocked = userAchievements.findByUser(userId).stream()
                .collect(Collectors.toMap(ua -> ua.getId().getAchievementId(), Function.identity()));
        List<GamificationDtos.AchievementView> views = achievements.findAllByOrderByXpRewardAsc()
                .stream()
                .map(achievement -> new GamificationDtos.AchievementView(
                        achievement.getId(), achievement.getCode(), achievement.getName(),
                        achievement.getDescription(), achievement.getXpReward(),
                        unlocked.containsKey(achievement.getId()),
                        unlocked.containsKey(achievement.getId())
                                ? unlocked.get(achievement.getId()).getUnlockedAt() : null))
                .toList();
        int progress = next == null ? 100
                : Math.min(100, Math.max(0,
                (int) Math.round((totalXp - level.minXp()) * 100.0 / (next.minXp() - level.minXp()))));
        return new GamificationDtos.GamificationSummary(
                totalXp,
                new GamificationDtos.LevelView(level.number(), level.name(), level.minXp(),
                        next != null ? next.minXp() : null),
                next != null ? Math.max(0, next.minXp() - totalXp) : 0,
                progress,
                currentStreak,
                bestStreak,
                unlocked.size(),
                views.size(),
                views);
    }

    @Transactional(readOnly = true)
    public List<GamificationDtos.XpEntry> xpHistory(UUID userId) {
        return xp.findTop20ByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(entry -> new GamificationDtos.XpEntry(entry.getAmount(), entry.getReason(),
                        entry.getLessonId(), entry.getCreatedAt()))
                .toList();
    }

    @Transactional
    public void evaluateAchievements(UUID userId) {
        List<Achievement> all = achievements.findAllByOrderByXpRewardAsc();
        Set<UUID> unlocked = userAchievements.findByUser(userId).stream()
                .map(ua -> ua.getId().getAchievementId())
                .collect(Collectors.toCollection(HashSet::new));
        int totalXp = xp.totalXp(userId);
        for (Achievement achievement : all) {
            if (unlocked.contains(achievement.getId())) {
                continue;
            }
            if (!meetsCondition(achievement.getCode(), userId, totalXp)) {
                continue;
            }
            UserAchievement userAchievement = new UserAchievement();
            userAchievement.setId(new UserAchievementId(userId, achievement.getId()));
            userAchievements.save(userAchievement);
            unlocked.add(achievement.getId());
            if (achievement.getXpReward() > 0) {
                XpLedger entry = new XpLedger();
                entry.setUserId(userId);
                entry.setAmount(achievement.getXpReward());
                entry.setReason(REASON_ACHIEVEMENT);
                xp.save(entry);
                totalXp += achievement.getXpReward();
            }
        }
    }

    private void unlock(UUID userId, String code) {
        Achievement achievement = achievements.findByCode(code).orElse(null);
        if (achievement == null || userAchievements.existsForUser(userId, achievement.getId())) {
            return;
        }
        UserAchievement userAchievement = new UserAchievement();
        userAchievement.setId(new UserAchievementId(userId, achievement.getId()));
        userAchievements.save(userAchievement);
        if (achievement.getXpReward() > 0) {
            XpLedger entry = new XpLedger();
            entry.setUserId(userId);
            entry.setAmount(achievement.getXpReward());
            entry.setReason(REASON_ACHIEVEMENT);
            xp.save(entry);
        }
    }

    private boolean meetsCondition(String code, UUID userId, int totalXp) {
        return switch (code) {
            case "FIRST_LESSON" -> metrics.completedLessons(userId) >= 1;
            case "FIRST_QUIZ" -> metrics.quizAttempts(userId) >= 1;
            case "STREAK_7" -> currentStreak(activityDates(userId)) >= 7;
            case "QUIZ_MASTER" -> metrics.averageQuizPercent(userId) >= 80
                    && metrics.quizAttempts(userId) >= 3;
            case "MODULE_FINISHED" -> metrics.hasCompletedAnyModule(userId);
            case "XP_1000" -> totalXp >= 1000;
            default -> false;
        };
    }

    private List<LocalDate> activityDates(UUID userId) {
        return xp.activityDates(userId).stream()
                .map(java.sql.Date::toLocalDate)
                .toList();
    }

    private static Level levelFor(int totalXp) {
        Level current = LEVELS.get(0);
        for (Level level : LEVELS) {
            if (totalXp >= level.minXp()) {
                current = level;
            }
        }
        return current;
    }

    private static Level nextLevel(Level current) {
        for (Level level : LEVELS) {
            if (level.minXp() > current.minXp()) {
                return level;
            }
        }
        return null;
    }

    private static int currentStreak(List<LocalDate> descendingDates) {
        if (descendingDates.isEmpty()) {
            return 0;
        }
        LocalDate today = LocalDate.now(ZONE);
        LocalDate latest = descendingDates.get(0);
        if (!latest.equals(today) && !latest.equals(today.minusDays(1))) {
            return 0;
        }
        Set<LocalDate> set = new HashSet<>(descendingDates);
        int streak = 0;
        LocalDate cursor = latest;
        while (set.contains(cursor)) {
            streak++;
            cursor = cursor.minusDays(1);
        }
        return streak;
    }

    private static int bestStreak(List<LocalDate> dates) {
        if (dates.isEmpty()) {
            return 0;
        }
        List<LocalDate> sorted = new ArrayList<>(dates);
        sorted.sort(Comparator.naturalOrder());
        int best = 1;
        int current = 1;
        for (int i = 1; i < sorted.size(); i++) {
            if (sorted.get(i).equals(sorted.get(i - 1).plusDays(1))) {
                current++;
                best = Math.max(best, current);
            } else if (!sorted.get(i).equals(sorted.get(i - 1))) {
                current = 1;
            }
        }
        return best;
    }
}
