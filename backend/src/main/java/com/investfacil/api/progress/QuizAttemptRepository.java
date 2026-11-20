package com.investfacil.api.progress;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public interface QuizAttemptRepository extends JpaRepository<QuizAttempt, UUID> {

    List<QuizAttempt> findByUserIdAndLessonIdOrderByTakenAtDesc(UUID userId, UUID lessonId);

    List<QuizAttempt> findTop10ByUserIdOrderByTakenAtDesc(UUID userId);

    long countByUserId(UUID userId);

    @Query("select avg(a.score * 100.0 / a.maxScore) from QuizAttempt a where a.userId = :userId")
    Double averagePercent(@Param("userId") UUID userId);

    @Query("select a.takenAt from QuizAttempt a where a.userId = :userId")
    List<Instant> attemptTimes(@Param("userId") UUID userId);
}
