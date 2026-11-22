package com.investfacil.api.progress;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public final class ProgressDtos {

    private ProgressDtos() {
    }

    public record CompleteLessonResponse(boolean alreadyCompleted, int xpAwarded, int totalXp,
                                         String level, int currentStreak) {
    }

    public record LessonStatus(boolean completed, int bestQuizPercent, int attempts) {
    }

    public record CategoryProgress(UUID id, String slug, String name, int totalLessons,
                                   int completedLessons, int percent) {
    }

    public record RecentActivity(UUID lessonId, String lessonSlug, String lessonTitle,
                                 Instant completedAt) {
    }

    public record NextLesson(UUID id, String slug, String title, String moduleTitle,
                             String categoryName, int estimatedMin) {
    }

    public record ProgressSummary(int totalLessons, int completedLessons, int percent,
                                  int quizAverage, int quizAttempts, int currentStreak,
                                  int bestStreak, int xp, String level,
                                  NextLesson nextLesson,
                                  List<UUID> completedLessonIds,
                                  List<CategoryProgress> categories,
                                  List<RecentActivity> recent) {
    }

    public record QuizQuestionView(UUID id, int position, String question, List<String> options) {
    }

    public record QuizView(UUID lessonId, String lessonTitle, int questionCount,
                           List<QuizQuestionView> questions) {
    }

    public record QuizAnswerRequest(@NotNull(message = "Questão obrigatória.")
                                    UUID questionId,
                                    @Min(value = 0, message = "Alternativa inválida.")
                                    int selectedIndex) {
    }

    public record QuizSubmitRequest(@NotEmpty(message = "Responda ao quiz.")
                                    @Valid List<QuizAnswerRequest> answers) {
    }

    public record QuestionResult(UUID questionId, boolean correct, int selectedIndex,
                                 int correctIndex) {
    }

    public record QuizResult(int score, int maxScore, int percent, boolean passed,
                             int xpAwarded, int totalXp, String level,
                             List<QuestionResult> results) {
    }
}
