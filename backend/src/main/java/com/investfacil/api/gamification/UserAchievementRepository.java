package com.investfacil.api.gamification;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface UserAchievementRepository extends JpaRepository<UserAchievement, UserAchievementId> {

    @Query("select (count(ua) > 0) from UserAchievement ua "
            + "where ua.id.userId = :userId and ua.id.achievementId = :achievementId")
    boolean existsForUser(@Param("userId") UUID userId,
                          @Param("achievementId") UUID achievementId);

    @Query("select ua from UserAchievement ua where ua.id.userId = :userId")
    List<UserAchievement> findByUser(@Param("userId") UUID userId);

    @Query("select count(ua) from UserAchievement ua where ua.id.userId = :userId")
    long countForUser(@Param("userId") UUID userId);
}
