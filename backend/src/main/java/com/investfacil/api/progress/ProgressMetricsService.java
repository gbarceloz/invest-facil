package com.investfacil.api.progress;

import com.investfacil.api.content.ContentCatalog;
import com.investfacil.api.gamification.ProgressMetrics;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.ZoneId;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Service
public class ProgressMetricsService implements ProgressMetrics {

    private static final ZoneId ZONE = ZoneId.of("America/Sao_Paulo");

    private final UserProgressRepository progress;
    private final QuizAttemptRepository attempts;
    private final ContentCatalog catalog;

    public ProgressMetricsService(UserProgressRepository progress, QuizAttemptRepository attempts,
                                  ContentCatalog catalog) {
        this.progress = progress;
        this.attempts = attempts;
        this.catalog = catalog;
    }

    @Override
    @Transactional(readOnly = true)
    public long completedLessons(UUID userId) {
        return progress.countByUserId(userId);
    }

    @Override
    @Transactional(readOnly = true)
    public int averageQuizPercent(UUID userId) {
        Double average = attempts.averagePercent(userId);
        return average == null ? 0 : (int) Math.round(average);
    }

    @Override
    @Transactional(readOnly = true)
    public long quizAttempts(UUID userId) {
        return attempts.countByUserId(userId);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean hasCompletedAnyModule(UUID userId) {
        Set<UUID> completed = new HashSet<>(progress.lessonIdsByUser(userId));
        Map<UUID, List<ContentCatalog.LessonRef>> byModule = catalog.publishedLessons().stream()
                .collect(Collectors.groupingBy(ContentCatalog.LessonRef::moduleId));
        for (List<ContentCatalog.LessonRef> lessons : byModule.values()) {
            if (!lessons.isEmpty() && lessons.stream().allMatch(lesson -> completed.contains(lesson.id()))) {
                return true;
            }
        }
        return false;
    }

    @Override
    @Transactional(readOnly = true)
    public List<LocalDate> activityDates(UUID userId) {
        return Stream.concat(
                        progress.completionTimes(userId).stream(),
                        attempts.attemptTimes(userId).stream())
                .map(instant -> instant.atZone(ZONE).toLocalDate())
                .distinct()
                .sorted((a, b) -> b.compareTo(a))
                .toList();
    }
}
