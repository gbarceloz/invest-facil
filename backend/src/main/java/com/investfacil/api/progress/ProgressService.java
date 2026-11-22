package com.investfacil.api.progress;

import com.investfacil.api.common.error.BusinessException;
import com.investfacil.api.content.ContentCatalog;
import com.investfacil.api.gamification.GamificationDtos;
import com.investfacil.api.gamification.GamificationService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class ProgressService {

    private final UserProgressRepository progress;
    private final QuizQuestionRepository questions;
    private final QuizAttemptRepository attempts;
    private final QuizAttemptAnswerRepository answers;
    private final ContentCatalog catalog;
    private final GamificationService gamification;
    private final ProgressMetricsService metrics;

    public ProgressService(UserProgressRepository progress, QuizQuestionRepository questions,
                           QuizAttemptRepository attempts, QuizAttemptAnswerRepository answers,
                           ContentCatalog catalog, GamificationService gamification,
                           ProgressMetricsService metrics) {
        this.progress = progress;
        this.questions = questions;
        this.attempts = attempts;
        this.answers = answers;
        this.catalog = catalog;
        this.gamification = gamification;
        this.metrics = metrics;
    }

    @Transactional
    public ProgressDtos.CompleteLessonResponse completeLesson(UUID userId, UUID lessonId) {
        requirePublishedLesson(lessonId);
        boolean already = progress.existsByUserIdAndLessonId(userId, lessonId);
        if (!already) {
            UserProgress entry = new UserProgress();
            entry.setUserId(userId);
            entry.setLessonId(lessonId);
            progress.save(entry);
            gamification.awardXp(userId, 50, GamificationService.REASON_LESSON, lessonId);
        }
        GamificationDtos.GamificationSummary summary = gamification.summary(userId);
        return new ProgressDtos.CompleteLessonResponse(
                already, already ? 0 : 50, summary.xp(), summary.level().name(),
                summary.currentStreak());
    }

    @Transactional(readOnly = true)
    public ProgressDtos.LessonStatus lessonStatus(UUID userId, UUID lessonId) {
        boolean completed = progress.existsByUserIdAndLessonId(userId, lessonId);
        List<QuizAttempt> history = attempts.findByUserIdAndLessonIdOrderByTakenAtDesc(userId, lessonId);
        int best = history.stream().mapToInt(QuizAttempt::percent).max().orElse(0);
        return new ProgressDtos.LessonStatus(completed, best, history.size());
    }

    @Transactional(readOnly = true)
    public ProgressDtos.QuizView quiz(UUID lessonId) {
        ContentCatalog.LessonRef lesson = requirePublishedLesson(lessonId);
        List<QuizQuestion> list = questions.findByLessonIdOrderByPositionAsc(lessonId);
        if (list.isEmpty()) {
            throw BusinessException.notFound("Esta aula ainda não possui quiz.");
        }
        return new ProgressDtos.QuizView(lessonId, lesson.title(), list.size(),
                list.stream().map(question -> new ProgressDtos.QuizQuestionView(
                        question.getId(), question.getPosition(), question.getQuestion(),
                        question.getOptions().stream().map(QuizOption::getText).toList()))
                        .toList());
    }

    @Transactional
    public ProgressDtos.QuizResult submitQuiz(UUID userId, UUID lessonId,
                                              ProgressDtos.QuizSubmitRequest request) {
        requirePublishedLesson(lessonId);
        List<QuizQuestion> list = questions.findByLessonIdOrderByPositionAsc(lessonId);
        if (list.isEmpty()) {
            throw BusinessException.notFound("Esta aula ainda não possui quiz.");
        }
        Map<UUID, QuizQuestion> byId = list.stream()
                .collect(Collectors.toMap(QuizQuestion::getId, question -> question));
        Map<UUID, Integer> selected = new HashMap<>();
        for (ProgressDtos.QuizAnswerRequest answer : request.answers()) {
            if (!byId.containsKey(answer.questionId())) {
                throw BusinessException.badRequest("INVALID_QUESTION", "Questão inválida para esta aula.");
            }
            if (selected.put(answer.questionId(), answer.selectedIndex()) != null) {
                throw BusinessException.badRequest("DUPLICATE_ANSWER",
                        "Cada questão deve ser respondida uma única vez.");
            }
            QuizQuestion question = byId.get(answer.questionId());
            if (answer.selectedIndex() >= question.getOptions().size()) {
                throw BusinessException.badRequest("INVALID_OPTION", "Alternativa inválida.");
            }
        }
        if (selected.size() != list.size()) {
            throw BusinessException.badRequest("INCOMPLETE_QUIZ", "Responda a todas as questões.");
        }

        int score = 0;
        List<ProgressDtos.QuestionResult> results = new ArrayList<>();
        for (QuizQuestion question : list) {
            int selectedIndex = selected.get(question.getId());
            boolean correct = selectedIndex == question.getCorrectIndex();
            if (correct) {
                score++;
            }
            results.add(new ProgressDtos.QuestionResult(question.getId(), correct, selectedIndex,
                    question.getCorrectIndex()));
        }
        int maxScore = list.size();
        int percent = (int) Math.round(score * 100.0 / maxScore);
        boolean passed = percent >= 70;
        List<QuizAttempt> history = attempts
                .findByUserIdAndLessonIdOrderByTakenAtDesc(userId, lessonId);
        boolean hadPassedBefore = history.stream().anyMatch(attempt -> attempt.percent() >= 70);

        QuizAttempt attempt = new QuizAttempt();
        attempt.setUserId(userId);
        attempt.setLessonId(lessonId);
        attempt.setScore(score);
        attempt.setMaxScore(maxScore);
        attempts.save(attempt);
        for (QuizQuestion question : list) {
            QuizAttemptAnswer entity = new QuizAttemptAnswer();
            entity.setId(UUID.randomUUID());
            entity.setAttemptId(attempt.getId());
            entity.setQuestionId(question.getId());
            entity.setSelectedIndex(selected.get(question.getId()));
            entity.setCorrect(selected.get(question.getId()) == question.getCorrectIndex());
            answers.save(entity);
        }

        int xpAwarded = 0;
        if (passed && !hadPassedBefore) {
            gamification.awardXp(userId, 30, GamificationService.REASON_QUIZ, lessonId);
            xpAwarded = 30;
        }
        gamification.evaluateAchievements(userId);
        GamificationDtos.GamificationSummary summary = gamification.summary(userId);
        return new ProgressDtos.QuizResult(score, maxScore, percent, passed, xpAwarded,
                summary.xp(), summary.level().name(), results);
    }

    @Transactional(readOnly = true)
    public ProgressDtos.ProgressSummary summary(UUID userId) {
        List<ContentCatalog.LessonRef> allLessons = catalog.publishedLessons();
        Set<UUID> completed = new HashSet<>(progress.lessonIdsByUser(userId));
        int total = allLessons.size();
        int done = (int) allLessons.stream().filter(lesson -> completed.contains(lesson.id())).count();
        int percent = total == 0 ? 0 : (int) Math.round(done * 100.0 / total);

        Map<UUID, List<ContentCatalog.LessonRef>> byCategory = allLessons.stream()
                .filter(lesson -> lesson.categoryId() != null)
                .collect(Collectors.groupingBy(ContentCatalog.LessonRef::categoryId));
        List<ProgressDtos.CategoryProgress> categories = catalog.allCategories().stream()
                .map(category -> {
                    List<ContentCatalog.LessonRef> list =
                            byCategory.getOrDefault(category.id(), List.of());
                    int categoryDone = (int) list.stream()
                            .filter(lesson -> completed.contains(lesson.id())).count();
                    int categoryPercent = list.isEmpty() ? 0
                            : (int) Math.round(categoryDone * 100.0 / list.size());
                    return new ProgressDtos.CategoryProgress(category.id(), category.slug(),
                            category.name(), list.size(), categoryDone, categoryPercent);
                }).toList();

        Map<UUID, ContentCatalog.LessonRef> byId = allLessons.stream()
                .collect(Collectors.toMap(ContentCatalog.LessonRef::id, lesson -> lesson));
        LinkedHashSet<ProgressDtos.RecentActivity> recent = new LinkedHashSet<>();
        for (UserProgress entry : progress.findTop10ByUserIdOrderByCompletedAtDesc(userId)) {
            ContentCatalog.LessonRef lesson = byId.get(entry.getLessonId());
            if (lesson != null) {
                recent.add(new ProgressDtos.RecentActivity(lesson.id(), lesson.slug(),
                        lesson.title(), entry.getCompletedAt()));
            }
        }

        Map<UUID, String> moduleTitles = catalog.allModules().stream()
                .collect(Collectors.toMap(ContentCatalog.ModuleRef::id,
                        ContentCatalog.ModuleRef::title));
        Map<UUID, String> categoryNames = catalog.allCategories().stream()
                .collect(Collectors.toMap(ContentCatalog.CategoryRef::id,
                        ContentCatalog.CategoryRef::name));
        ProgressDtos.NextLesson next = allLessons.stream()
                .filter(lesson -> !completed.contains(lesson.id()))
                .findFirst()
                .map(lesson -> new ProgressDtos.NextLesson(
                        lesson.id(), lesson.slug(), lesson.title(),
                        moduleTitles.get(lesson.moduleId()),
                        categoryNames.get(lesson.categoryId()),
                        lesson.estimatedMin()))
                .orElse(null);

        GamificationDtos.GamificationSummary gamificationSummary = gamification.summary(userId);
        return new ProgressDtos.ProgressSummary(total, done, percent,
                metrics.averageQuizPercent(userId), (int) metrics.quizAttempts(userId),
                gamificationSummary.currentStreak(), gamificationSummary.bestStreak(),
                gamificationSummary.xp(), gamificationSummary.level().name(),
                next, allLessons.stream().map(ContentCatalog.LessonRef::id)
                        .filter(completed::contains).toList(),
                categories, recent.stream().limit(5).toList());
    }

    private ContentCatalog.LessonRef requirePublishedLesson(UUID lessonId) {
        return catalog.findLesson(lessonId)
                .filter(ContentCatalog.LessonRef::published)
                .orElseThrow(() -> BusinessException.notFound("Aula não encontrada."));
    }
}
