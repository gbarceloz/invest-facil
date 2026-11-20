package com.investfacil.api.gamification;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface AchievementRepository extends JpaRepository<Achievement, UUID> {

    Optional<Achievement> findByCode(String code);

    List<Achievement> findAllByOrderByXpRewardAsc();
}
