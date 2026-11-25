package com.investfacil.api.gamification;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;
import java.util.UUID;

/** Saldo atual de fichas de quiz. Nunca aceito do cliente. */
@Entity
@Table(name = "user_quiz_lives", schema = "investfacil")
@Getter
@Setter
@NoArgsConstructor
public class QuizLives {

    @Id
    @Column(name = "user_id")
    private UUID userId;

    @Column(nullable = false)
    private int balance;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt = Instant.now();
}
