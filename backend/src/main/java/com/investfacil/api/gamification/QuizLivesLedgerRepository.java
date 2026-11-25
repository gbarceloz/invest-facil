package com.investfacil.api.gamification;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.UUID;

public interface QuizLivesLedgerRepository extends JpaRepository<QuizLivesLedger, UUID> {

    /** Concessão inicial (todos os parâmetros não nulos). */
    @Modifying
    @Query(value = """
            insert into investfacil.quiz_lives_ledger
                (user_id, delta, reason)
            values (:userId, :delta, 'INITIAL_GRANT')
            on conflict do nothing
            """, nativeQuery = true)
    int insertInitialGrant(@Param("userId") UUID userId, @Param("delta") int delta);

    /** Consumo sem Idempotency-Key (nenhum parâmetro nulo). */
    @Modifying
    @Query(value = """
            insert into investfacil.quiz_lives_ledger
                (user_id, delta, reason, lesson_id, attempt_id)
            values (:userId, :delta, 'QUIZ_FAILED', :lessonId, :attemptId)
            on conflict do nothing
            """, nativeQuery = true)
    int insertConsumption(@Param("userId") UUID userId,
                          @Param("delta") int delta,
                          @Param("lessonId") UUID lessonId,
                          @Param("attemptId") UUID attemptId);

    /**
     * Consumo com Idempotency-Key. O índice parcial
     * (user_id, idempotency_key) garante uma única cobrança por chave.
     *
     * @return 1 quando inseriu, 0 quando a chave já existia
     */
    @Modifying
    @Query(value = """
            insert into investfacil.quiz_lives_ledger
                (user_id, delta, reason, lesson_id, attempt_id, idempotency_key)
            values (:userId, :delta, 'QUIZ_FAILED', :lessonId, :attemptId, :idempotencyKey)
            on conflict do nothing
            """, nativeQuery = true)
    int insertConsumptionWithKey(@Param("userId") UUID userId,
                                 @Param("delta") int delta,
                                 @Param("lessonId") UUID lessonId,
                                 @Param("attemptId") UUID attemptId,
                                 @Param("idempotencyKey") String idempotencyKey);
}
