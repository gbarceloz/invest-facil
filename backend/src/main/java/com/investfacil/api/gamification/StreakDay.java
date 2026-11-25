package com.investfacil.api.gamification;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

/**
 * Dia válido de atividade para streak. A UNIQUE (user_id, activity_date)
 * garante no máximo um registro por dia por usuário; a data é sempre calculada
 * no servidor com o timezone IANA do usuário.
 */
@Entity
@Table(name = "user_streak_days", schema = "investfacil")
@Getter
@Setter
@NoArgsConstructor
public class StreakDay {

    @Id
    private UUID id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "activity_date", nullable = false)
    private LocalDate activityDate;

    @Column(name = "lesson_id")
    private UUID lessonId;

    @Column(nullable = false, length = 64)
    private String timezone;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

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
