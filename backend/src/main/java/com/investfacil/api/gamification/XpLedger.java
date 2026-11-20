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
import java.util.UUID;

/** Ledger append-only: nunca se atualiza ou apaga uma linha de XP. */
@Entity
@Table(name = "xp_ledger", schema = "investfacil")
@Getter
@Setter
@NoArgsConstructor
public class XpLedger {

    @Id
    private UUID id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(nullable = false)
    private int amount;

    @Column(nullable = false, length = 60)
    private String reason;

    @Column(name = "lesson_id")
    private UUID lessonId;

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
