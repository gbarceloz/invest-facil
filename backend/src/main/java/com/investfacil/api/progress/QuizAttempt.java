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

@Entity
@Table(name = "quiz_attempts", schema = "investfacil")
@Getter
@Setter
@NoArgsConstructor
public class QuizAttempt {

    @Id
    private UUID id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "lesson_id", nullable = false)
    private UUID lessonId;

    @Column(nullable = false)
    private int score;

    @Column(name = "max_score", nullable = false)
    private int maxScore;

    @Column(name = "taken_at", nullable = false)
    private Instant takenAt;

    @PrePersist
    void onCreate() {
        if (id == null) {
            id = UUID.randomUUID();
        }
        if (takenAt == null) {
            takenAt = Instant.now();
        }
    }

    public int percent() {
        return maxScore == 0 ? 0 : (int) Math.round(score * 100.0 / maxScore);
    }
}
