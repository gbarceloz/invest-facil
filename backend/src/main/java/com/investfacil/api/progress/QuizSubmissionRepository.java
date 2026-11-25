package com.investfacil.api.progress;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

public interface QuizSubmissionRepository extends JpaRepository<QuizSubmission, UUID> {

    Optional<QuizSubmission> findByUserIdAndIdempotencyKey(UUID userId, String idempotencyKey);

    /**
     * Reserva a chave antes de processar. Retorna 0 quando a chave já existe
     * (retry ou requisição concorrente).
     */
    @Modifying
    @Query(value = """
            insert into investfacil.quiz_submissions
                (user_id, lesson_id, idempotency_key, status)
            values (:userId, :lessonId, :idempotencyKey, 'PENDING')
            on conflict do nothing
            """, nativeQuery = true)
    int insertIfAbsent(@Param("userId") UUID userId,
                       @Param("lessonId") UUID lessonId,
                       @Param("idempotencyKey") String idempotencyKey);

    @Modifying
    @Query("update QuizSubmission s set s.status = :status, s.attemptId = :attemptId, "
            + "s.xpAwarded = :xpAwarded, s.lessonCompleted = :lessonCompleted, "
            + "s.completedAt = :now "
            + "where s.userId = :userId and s.idempotencyKey = :idempotencyKey")
    int complete(@Param("userId") UUID userId,
                 @Param("idempotencyKey") String idempotencyKey,
                 @Param("status") String status,
                 @Param("attemptId") UUID attemptId,
                 @Param("xpAwarded") int xpAwarded,
                 @Param("lessonCompleted") boolean lessonCompleted,
                 @Param("now") Instant now);
}
