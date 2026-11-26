package com.investfacil.api.onboarding;

import com.investfacil.api.onboarding.OnboardingTypes.EmergencyReserve;
import com.investfacil.api.onboarding.OnboardingTypes.FinancialSituation;
import com.investfacil.api.onboarding.OnboardingTypes.Goal;
import com.investfacil.api.onboarding.OnboardingTypes.HealthBand;
import com.investfacil.api.onboarding.OnboardingTypes.HighInterestDebt;
import com.investfacil.api.onboarding.OnboardingTypes.KnowledgeLevel;
import com.investfacil.api.onboarding.OnboardingTypes.LearningPreference;
import com.investfacil.api.onboarding.OnboardingTypes.Opportunity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * Perfil financeiro coletado no onboarding. Dados financeiros ficam somente
 * nesta tabela, protegida por RLS por usuário.
 */
@Entity
@Table(name = "onboarding_profiles", schema = "investfacil")
@Getter
@Setter
@NoArgsConstructor
public class OnboardingProfile {

    @Id
    @Column(name = "user_id")
    private UUID userId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 40)
    private Goal goal;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(nullable = false, columnDefinition = "jsonb")
    private List<String> goals = new ArrayList<>();

    @Enumerated(EnumType.STRING)
    @Column(name = "financial_situation", nullable = false, length = 40)
    private FinancialSituation financialSituation;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "financial_situations", nullable = false, columnDefinition = "jsonb")
    private List<String> financialSituations = new ArrayList<>();

    @Column(name = "income_cents")
    private Long incomeCents;

    @Column(name = "savings_capacity_cents")
    private Long savingsCapacityCents;

    @Column(name = "essential_expenses_cents")
    private Long essentialExpensesCents;

    @Enumerated(EnumType.STRING)
    @Column(name = "emergency_reserve", nullable = false, length = 30)
    private EmergencyReserve emergencyReserve;

    @Enumerated(EnumType.STRING)
    @Column(name = "high_interest_debt", nullable = false, length = 30)
    private HighInterestDebt highInterestDebt;

    @Enumerated(EnumType.STRING)
    @Column(name = "learning_preference", nullable = false, length = 30)
    private LearningPreference learningPreference;

    @Enumerated(EnumType.STRING)
    @Column(name = "knowledge_level", nullable = false, length = 30)
    private KnowledgeLevel knowledgeLevel;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "spending_triggers", nullable = false, columnDefinition = "jsonb")
    private List<String> spendingTriggers = new ArrayList<>();

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "study_days", nullable = false, columnDefinition = "jsonb")
    private List<String> studyDays = new ArrayList<>();

    @Column(name = "study_time", nullable = false, length = 5)
    private String studyTime;

    @Column(name = "monthly_savings_goal_cents")
    private Long monthlySavingsGoalCents;

    @Column(name = "emergency_fund_goal_cents")
    private Long emergencyFundGoalCents;

    @Column(name = "health_score")
    private Integer healthScore;

    @Enumerated(EnumType.STRING)
    @Column(name = "health_band", length = 30)
    private HealthBand healthBand;

    @Enumerated(EnumType.STRING)
    @Column(length = 40)
    private Opportunity opportunity;

    @Column(columnDefinition = "text")
    private String recommendation;

    @Column(name = "completed_at", nullable = false)
    private Instant completedAt;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @PrePersist
    void onCreate() {
        Instant now = Instant.now();
        if (completedAt == null) {
            completedAt = now;
        }
        if (createdAt == null) {
            createdAt = now;
        }
        updatedAt = now;
    }

    @PreUpdate
    void onUpdate() {
        updatedAt = Instant.now();
    }
}
