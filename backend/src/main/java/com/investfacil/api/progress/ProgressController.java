package com.investfacil.api.progress;

import com.investfacil.api.common.security.CurrentUser;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/progress")
public class ProgressController {

    private final ProgressService progress;

    public ProgressController(ProgressService progress) {
        this.progress = progress;
    }

    @PostMapping("/lessons/{lessonId}")
    public ResponseEntity<ProgressDtos.CompleteLessonResponse> complete(
            @AuthenticationPrincipal CurrentUser principal,
            @PathVariable UUID lessonId) {
        ProgressDtos.CompleteLessonResponse response = progress.completeLesson(principal.id(), lessonId);
        return ResponseEntity.status(response.alreadyCompleted() ? HttpStatus.OK : HttpStatus.CREATED)
                .body(response);
    }

    @GetMapping("/lessons/{lessonId}")
    public ProgressDtos.LessonStatus status(@AuthenticationPrincipal CurrentUser principal,
                                            @PathVariable UUID lessonId) {
        return progress.lessonStatus(principal.id(), lessonId);
    }

    /** Registra vídeo assistido; nunca conclui a aula sozinho. */
    @PostMapping("/lessons/{lessonId}/video")
    public ProgressDtos.VideoProgressResponse video(
            @AuthenticationPrincipal CurrentUser principal,
            @PathVariable UUID lessonId,
            @Valid @RequestBody ProgressDtos.VideoProgressRequest request) {
        return progress.watchVideo(principal.id(), lessonId, request);
    }

    @GetMapping("/lessons/{lessonId}/quiz")
    public ProgressDtos.QuizView quiz(@PathVariable UUID lessonId) {
        return progress.quiz(lessonId);
    }

    @PostMapping("/lessons/{lessonId}/quiz")
    public ProgressDtos.QuizResult submit(
            @AuthenticationPrincipal CurrentUser principal,
            @PathVariable UUID lessonId,
            @RequestHeader(value = "Idempotency-Key", required = false) String idempotencyKey,
            @Valid @RequestBody ProgressDtos.QuizSubmitRequest request) {
        return progress.submitQuiz(principal.id(), lessonId, request, idempotencyKey);
    }

    @GetMapping("/summary")
    public ProgressDtos.ProgressSummary summary(@AuthenticationPrincipal CurrentUser principal) {
        return progress.summary(principal.id());
    }
}
