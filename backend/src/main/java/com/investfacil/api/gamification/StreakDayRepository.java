package com.investfacil.api.gamification;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public interface StreakDayRepository extends JpaRepository<StreakDay, UUID> {

    /**
     * Insere o dia válido sem lançar exceção quando já existe (ON CONFLICT
     * DO NOTHING). Usar SQL nativo evita envenenar a transação com uma
     * DataIntegrityViolationException em retry concorrente.
     */
    @Modifying
    @Query(value = """
            insert into investfacil.user_streak_days
                (user_id, activity_date, lesson_id, timezone)
            values (:userId, :activityDate, :lessonId, :timezone)
            on conflict do nothing
            """, nativeQuery = true)
    int insertIfAbsent(@Param("userId") UUID userId,
                       @Param("activityDate") LocalDate activityDate,
                       @Param("lessonId") UUID lessonId,
                       @Param("timezone") String timezone);

    /** Variante sem aula associada (todos os parâmetros não nulos). */
    @Modifying
    @Query(value = """
            insert into investfacil.user_streak_days
                (user_id, activity_date, timezone)
            values (:userId, :activityDate, :timezone)
            on conflict do nothing
            """, nativeQuery = true)
    int insertIfAbsentWithoutLesson(@Param("userId") UUID userId,
                                    @Param("activityDate") LocalDate activityDate,
                                    @Param("timezone") String timezone);

    @Query("select d.activityDate from StreakDay d where d.userId = :userId "
            + "order by d.activityDate desc")
    List<LocalDate> findDatesDesc(@Param("userId") UUID userId);

    boolean existsByUserId(UUID userId);
}
