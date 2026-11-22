package com.investfacil.api.gamification;

import jakarta.persistence.Column;
import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

@Entity
@Table(name = "user_achievements", schema = "investfacil")
@Getter
@Setter
@NoArgsConstructor
public class UserAchievement {

    @EmbeddedId
    private UserAchievementId id;

    @Column(name = "unlocked_at", nullable = false)
    private Instant unlockedAt;

    @PrePersist
    void onCreate() {
        if (unlockedAt == null) {
            unlockedAt = Instant.now();
        }
    }
}
