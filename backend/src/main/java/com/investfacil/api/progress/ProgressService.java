package com.investfacil.api.progress;

import com.investfacil.api.common.error.BusinessException;
import com.investfacil.api.content.ContentCatalog;
import com.investfacil.api.gamification.GamificationDtos;
import com.investfacil.api.gamification.GamificationService;
import com.investfacil.api.gamification.QuizLivesService;
import com.investfacil.api.gamification.StreakService;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
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

    private static final int LESSON_XP = 50;
    private static final int QUIZ_XP = 30;
    private static final double VIDEO_COMPLETION_RATIO = 0.9;

    private final UserProgressRepository progress;
    private final QuizQuestionRepository questions;
    private final QuizAttemptRepository attempts;
    private final QuizAttemptAnswerRepository answers;
    private final LessonVideoProgressRepository video;
    private final QuizSubmissionRepository submissions;
    private final ContentCatalog catalog;
    private final GamificationService gamification;
    private final ProgressMetricsService metrics;
    private final StreakService streaks;
    private final QuizLivesService lives;

    public ProgressService(UserProgressRepository progress, QuizQuestionRepository questions,
                           QuizAttemptRepository attempts, QuizAttemptAnswerRepository answers,
                           LessonVideoProgressRepository video,
                           QuizSubmissionRepository submissions, ContentCatalog catalog,
                           GamificationService gamification, ProgressMetricsService metrics,
                           StreakService streaks, QuizLivesService lives) {
        this.progress = progress;
        this.questions = questions;
        this.attempts = attempts;
        this.answers = answers;
        this.video = video;
        this.submissions = submissions;
        this.catalog = catalog;
        this.gamification = gamification;
        this.metrics = metrics;
        this.streaks = streaks;
        this.lives = lives;
    }

    /**
     * Conclusão legada: só conclui quando vídeo assistido e quiz aprovado já
     * existem. O caminho novo é vídeo → quiz (a aprovação conclui sozinha).
     */
    @Transactional
    public ProgressDtos.CompleteLessonResponse completeLesson(UUID userId, UUID lessonId) {
        requirePublishedLesson(lessonId);
        boolean videoWatched = videoWatched(userId, lessonId);
        boolean quizPassed = bestPercent(userId, lessonId) >= lives.passThresholdPercent();
        if (!videoWatched || !quizPassed) {
            throw new BusinessException(HttpStatus.CONFLICT, "LESSON_NOT_READY",
                    "Conclua o vídeo e o quiz desta aula antes de marcá-la como concluída.",
                    Map.<String, Object>of("videoWatched", videoWatched,
                            "quizPassed", quizPassed));
        }
        boolean created = markCompleted(userId, lessonId, true);
        return completeResponse(userId, created);
    }

    /**
     * Conclusão interna usada apenas pelo seed de demonstração. Não registra
     * dia de streak (não é atividade real do usuário) e não passa pelo gate do
     * endpoint legado.
     */
    @Transactional
    public ProgressDtos.CompleteLessonResponse completeLessonAsSeed(UUID userId, UUID lessonId) {
        requirePublishedLesson(lessonId);
        boolean created = markCompleted(userId, lessonId, false);
        return completeResponse(userId, created);
    }

    @Transactional(readOnly = true)
    public ProgressDtos.LessonStatus lessonStatus(UUID userId, UUID lessonId) {
        requirePublishedLesson(lessonId);
        List<QuizAttempt> history =
                attempts.findByUserIdAndLessonIdOrderByTakenAtDesc(userId, lessonId);
        int best = history.stream().mapToInt(QuizAttempt::percent).max().orElse(0);
        int threshold = lives.passThresholdPercent();
        boolean videoWatched = videoWatched(userId, lessonId);
        boolean quizPassed = best >= threshold;
        boolean completed = progress.existsByUserIdAndLessonId(userId, lessonId);
        int fichas = lives.balance(userId);
        return new ProgressDtos.LessonStatus(completed, best, history.size(),
                videoWatched, quizPassed, fichas > 0, fichas, lives.max(), threshold);
    }

    @Transactional
    public ProgressDtos.VideoProgressResponse watchVideo(UUID userId, UUID lessonId,
                                                         ProgressDtos.VideoProgressRequest request) {
        requirePublishedLesson(lessonId);
        boolean watched = request.watched();
        if (watched) {
            Integer duration = request.durationSeconds();
            if (duration == null || duration <= 0) {
                throw BusinessException.badRequest("VIDEO_INVALID_DURATION",
                        "Informe a duração do vídeo para registrá-lo como assistido.");
            }
            int required = (int) Math.ceil(duration * VIDEO_COMPLETION_RATIO);
            if (request.positionSeconds() < required) {
                throw new BusinessException(HttpStatus.BAD_REQUEST, "VIDEO_NOT_FINISHED",
                        "Assista ao vídeo até o fim para registrá-lo como assistido.",
                        Map.<String, Object>of("requiredPositionSeconds", required,
                                "positionSeconds", request.positionSeconds()));
            }
        }
        Instant watchedAt = watched ? Instant.now() : null;
        if (watched) {
            video.markWatched(userId, lessonId, request.positionSeconds(),
                    request.durationSeconds(), watchedAt);
        } else {
            video.updatePosition(userId, lessonId, request.positionSeconds());
        }
        LessonVideoProgress state = video.findByUserIdAndLessonId(userId, lessonId).orElse(null);
        // D-02: se o quiz já foi aprovado antes do vídeo, a conclusão não pode
        // ficar presa. Conclui pelo mesmo fluxo idempotente do submit (XP de
        // aula uma única vez + dia de streak via recordToday).
        if (state != null && state.isWatched()
                && !progress.existsByUserIdAndLessonId(userId, lessonId)
                && bestPercent(userId, lessonId) >= lives.passThresholdPercent()) {
            markCompleted(userId, lessonId, true);
        }
        return new ProgressDtos.VideoProgressResponse(lessonId,
                state != null && state.isWatched(),
                state != null ? state.getPositionSeconds() : request.positionSeconds(),
                state != null ? state.getDurationSeconds() : request.durationSeconds(),
                state != null ? state.getWatchedAt() : null,
                lives.balance(userId), lives.max(), lives.passThresholdPercent());
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
                                              ProgressDtos.QuizSubmitRequest request,
                                              String idempotencyKey) {
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

        String key = normalizeKey(idempotencyKey);
        if (key != null) {
            int reserved = submissions.insertIfAbsent(userId, lessonId, key);
            if (reserved == 0) {
                return replay(userId, lessonId, key);
            }
        }

        int threshold = lives.passThresholdPercent();
        int bestBefore = attempts.findByUserIdAndLessonIdOrderByTakenAtDesc(userId, lessonId)
                .stream().mapToInt(QuizAttempt::percent).max().orElse(0);
        boolean hadPassed = bestBefore >= threshold;
        int fichasBefore = lives.balance(userId);

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
        boolean passed = percent >= threshold;

        // Saldo 0 impede qualquer nova tentativa (aprovada ou não), mas nunca
        // impede revisar a aula. Replay idempotente já retornou acima.
        if (fichasBefore <= 0) {
            throw new BusinessException(HttpStatus.CONFLICT, "NO_FICHAS",
                    "Você não tem fichas para uma nova tentativa. Revise a aula e tente novamente quando tiver fichas.",
                    Map.<String, Object>of("fichas", 0, "fichasMax", lives.max()));
        }

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

        boolean watchedVideo = videoWatched(userId, lessonId);
        boolean lessonCompleted = progress.existsByUserIdAndLessonId(userId, lessonId);
        int xpAwarded = 0;
        if (passed) {
            if (watchedVideo) {
                boolean created = markCompleted(userId, lessonId, true);
                if (created) {
                    xpAwarded += LESSON_XP;
                }
                lessonCompleted = true;
            }
            if (!hadPassed) {
                gamification.awardXp(userId, QUIZ_XP, GamificationService.REASON_QUIZ, lessonId);
                xpAwarded += QUIZ_XP;
            }
        } else {
            // Reprovação consome 1 ficha de forma atômica; corrida com saldo 0
            // desfaz tentativa + consumo (rollback) e retorna NO_FICHAS.
            lives.consumeForFailedAttempt(userId, lessonId, attempt.getId(), key);
        }

        if (key != null) {
            submissions.complete(userId, key,
                    passed ? QuizSubmission.STATUS_PASSED : QuizSubmission.STATUS_FAILED,
                    attempt.getId(), xpAwarded, lessonCompleted, Instant.now());
        }

        GamificationDtos.GamificationSummary summary = gamification.summary(userId);
        return new ProgressDtos.QuizResult(score, maxScore, percent, passed, xpAwarded,
                summary.xp(), summary.level().name(), results,
                summary.fichas(), summary.fichasMax(),
                progress.existsByUserIdAndLessonId(userId, lessonId),
                false, watchedVideo);
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

    // ------------------------------------------------------------------
    // Internos
    // ------------------------------------------------------------------

    private ProgressDtos.CompleteLessonResponse completeResponse(UUID userId, boolean created) {
        GamificationDtos.GamificationSummary summary = gamification.summary(userId);
        return new ProgressDtos.CompleteLessonResponse(!created, created ? LESSON_XP : 0,
                summary.xp(), summary.level().name(), summary.currentStreak());
    }

    private boolean markCompleted(UUID userId, UUID lessonId, boolean recordStreak) {
        if (progress.existsByUserIdAndLessonId(userId, lessonId)) {
            return false;
        }
        UserProgress entry = new UserProgress();
        entry.setUserId(userId);
        entry.setLessonId(lessonId);
        progress.save(entry);
        if (recordStreak) {
            streaks.recordToday(userId);
        }
        gamification.awardXp(userId, LESSON_XP, GamificationService.REASON_LESSON, lessonId);
        return true;
    }

    private ProgressDtos.QuizResult replay(UUID userId, UUID lessonId, String key) {
        QuizSubmission submission = submissions.findByUserIdAndIdempotencyKey(userId, key)
                .orElseThrow(() -> new IllegalStateException("Idempotency-Key reservada sem registro"));
        if (!submission.getLessonId().equals(lessonId)) {
            throw new BusinessException(HttpStatus.CONFLICT, "IDEMPOTENCY_KEY_REUSED",
                    "Esta Idempotency-Key já foi usada em outra aula.");
        }
        if (submission.getAttemptId() == null) {
            throw new BusinessException(HttpStatus.CONFLICT, "QUIZ_IN_PROGRESS",
                    "Esta tentativa ainda está sendo processada. Aguarde e tente novamente.");
        }
        QuizAttempt attempt = attempts.findById(submission.getAttemptId())
                .orElseThrow(() -> new IllegalStateException("Tentativa idempotente não encontrada"));
        Map<UUID, QuizAttemptAnswer> byQuestion = answers.findByAttemptId(attempt.getId())
                .stream().collect(Collectors.toMap(QuizAttemptAnswer::getQuestionId,
                        answer -> answer));
        List<QuizQuestion> list = questions.findByLessonIdOrderByPositionAsc(lessonId);
        List<ProgressDtos.QuestionResult> results = list.stream()
                .map(question -> {
                    QuizAttemptAnswer answer = byQuestion.get(question.getId());
                    int selectedIndex = answer == null ? -1 : answer.getSelectedIndex();
                    boolean correct = answer != null && answer.isCorrect();
                    return new ProgressDtos.QuestionResult(question.getId(), correct,
                            selectedIndex, question.getCorrectIndex());
                }).toList();
        GamificationDtos.GamificationSummary summary = gamification.summary(userId);
        int threshold = lives.passThresholdPercent();
        int percent = attempt.percent();
        return new ProgressDtos.QuizResult(attempt.getScore(), attempt.getMaxScore(), percent,
                percent >= threshold, submission.getXpAwarded(), summary.xp(),
                summary.level().name(), results, summary.fichas(), summary.fichasMax(),
                submission.isLessonCompleted(), true, videoWatched(userId, lessonId));
    }

    private boolean videoWatched(UUID userId, UUID lessonId) {
        return video.findByUserIdAndLessonId(userId, lessonId)
                .map(LessonVideoProgress::isWatched).orElse(false);
    }

    private int bestPercent(UUID userId, UUID lessonId) {
        return attempts.findByUserIdAndLessonIdOrderByTakenAtDesc(userId, lessonId)
                .stream().mapToInt(QuizAttempt::percent).max().orElse(0);
    }

    private static String normalizeKey(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        if (trimmed.isEmpty()) {
            return null;
        }
        if (trimmed.length() > 100) {
            throw BusinessException.badRequest("INVALID_IDEMPOTENCY_KEY",
                    "Idempotency-Key deve ter no máximo 100 caracteres.");
        }
        return trimmed;
    }

    private ContentCatalog.LessonRef requirePublishedLesson(UUID lessonId) {
        return catalog.findLesson(lessonId)
                .filter(ContentCatalog.LessonRef::published)
                .orElseThrow(() -> BusinessException.notFound("Aula não encontrada."));
    }
}
