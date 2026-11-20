package com.investfacil.api.progress;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface UserProgressRepository extends JpaRepository<UserProgress, UUID> {

    Optional<UserProgress> findByUserIdAndLessonId(UUID userId, UUID lessonId);

    boolean existsByUserIdAndLessonId(UUID userId, UUID lessonId);

    long countByUserId(UUID userId);

    List<UserProgress> findByUserIdOrderByCompletedAtDesc(UUID userId);

    List<UserProgress> findTop10ByUserIdOrderByCompletedAtDesc(UUID userId);

    @Query("select p.lessonId from UserProgress p where p.userId = :userId")
    List<UUID> lessonIdsByUser(@Param("userId") UUID userId);

    @Query("select p.completedAt from UserProgress p where p.userId = :userId")
    List<Instant> completionTimes(@Param("userId") UUID userId);
}
