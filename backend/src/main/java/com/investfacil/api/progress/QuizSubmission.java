package com.investfacil.api.progress;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;
import java.util.UUID;

/** Registro idempotente de um submit de quiz. */
@Entity
@Table(name = "quiz_submissions", schema = "investfacil")
@Getter
@Setter
@NoArgsConstructor
public class QuizSubmission {

    public static final String STATUS_PENDING = "PENDING";
    public static final String STATUS_PASSED = "PASSED";
    public static final String STATUS_FAILED = "FAILED";

    @Id
    private UUID id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "lesson_id", nullable = false)
    private UUID lessonId;

    @Column(name = "idempotency_key", nullable = false, length = 100)
    private String idempotencyKey;

    @Column(nullable = false, length = 12)
    private String status = STATUS_PENDING;

    @Column(name = "attempt_id")
    private UUID attemptId;

    @Column(name = "xp_awarded", nullable = false)
    private int xpAwarded;

    @Column(name = "lesson_completed", nullable = false)
    private boolean lessonCompleted;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @Column(name = "completed_at")
    private Instant completedAt;

    @PrePersist
    void onCreate() {
        if (id == null) {
            id = UUID.randomUUID();
        }
        if (createdAt == null) {
            createdAt = Instant.now();
        }
    }
}
