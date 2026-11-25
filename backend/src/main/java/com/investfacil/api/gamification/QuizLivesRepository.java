package com.investfacil.api.gamification;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

public interface QuizLivesRepository extends JpaRepository<QuizLives, UUID> {

    @Query("select l.balance from QuizLives l where l.userId = :userId")
    Optional<Integer> findBalance(@Param("userId") UUID userId);

    @Modifying
    @Query(value = """
            insert into investfacil.user_quiz_lives (user_id, balance)
            values (:userId, :balance)
            on conflict (user_id) do nothing
            """, nativeQuery = true)
    int insertIfAbsent(@Param("userId") UUID userId, @Param("balance") int balance);

    /**
     * Consumo atômico: o UPDATE só afeta a linha se ainda houver saldo.
     * Retorna 1 quando consumiu e 0 quando o saldo já era zero (corrida).
     */
    @Modifying
    @Query("update QuizLives l set l.balance = l.balance - 1, l.updatedAt = :now "
            + "where l.userId = :userId and l.balance > 0")
    int consumeOne(@Param("userId") UUID userId, @Param("now") Instant now);
}
