package com.investfacil.api.progress;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

public interface LessonVideoProgressRepository extends JpaRepository<LessonVideoProgress, UUID> {

    Optional<LessonVideoProgress> findByUserIdAndLessonId(UUID userId, UUID lessonId);

    /**
     * Upsert monotônico de vídeo assistido. Todos os parâmetros são não nulos
     * (evita inferência de tipo para NULL em SQL nativo).
     */
    @Modifying
    @Query(value = """
            insert into investfacil.lesson_video_progress
                (user_id, lesson_id, watched, position_seconds, duration_seconds,
                 watched_at, updated_at)
            values (:userId, :lessonId, true, :positionSeconds, :durationSeconds,
                    :watchedAt, now())
            on conflict (user_id, lesson_id) do update set
                watched = true,
                position_seconds = greatest(
                    investfacil.lesson_video_progress.position_seconds,
                    excluded.position_seconds),
                duration_seconds = excluded.duration_seconds,
                watched_at = coalesce(
                    investfacil.lesson_video_progress.watched_at,
                    excluded.watched_at),
                updated_at = now()
            """, nativeQuery = true)
    int markWatched(@Param("userId") UUID userId,
                    @Param("lessonId") UUID lessonId,
                    @Param("positionSeconds") int positionSeconds,
                    @Param("durationSeconds") int durationSeconds,
                    @Param("watchedAt") Instant watchedAt);

    /** Só posição: nunca desmarca um vídeo já assistido. */
    @Modifying
    @Query(value = """
            insert into investfacil.lesson_video_progress
                (user_id, lesson_id, watched, position_seconds, updated_at)
            values (:userId, :lessonId, false, :positionSeconds, now())
            on conflict (user_id, lesson_id) do update set
                position_seconds = greatest(
                    investfacil.lesson_video_progress.position_seconds,
                    excluded.position_seconds),
                updated_at = now()
            """, nativeQuery = true)
    int updatePosition(@Param("userId") UUID userId,
                       @Param("lessonId") UUID lessonId,
                       @Param("positionSeconds") int positionSeconds);
}
