package com.investfacil.api.gamification;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.sql.Date;
import java.util.List;
import java.util.UUID;

public interface XpLedgerRepository extends JpaRepository<XpLedger, UUID> {

    @Query("select coalesce(sum(x.amount), 0) from XpLedger x where x.userId = :userId")
    int totalXp(@Param("userId") UUID userId);

    List<XpLedger> findTop20ByUserIdOrderByCreatedAtDesc(UUID userId);

    boolean existsByUserIdAndLessonIdAndReason(UUID userId, UUID lessonId, String reason);

    @Query(value = "select distinct (created_at at time zone 'America/Sao_Paulo')::date "
            + "from investfacil.xp_ledger where user_id = :userId order by 1 desc",
            nativeQuery = true)
    List<Date> activityDates(@Param("userId") UUID userId);
}
