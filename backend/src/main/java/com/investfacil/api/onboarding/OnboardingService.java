package com.investfacil.api.onboarding;

import com.investfacil.api.onboarding.OnboardingDtos.AnswersRequest;
import com.investfacil.api.onboarding.OnboardingDtos.AnswersView;
import com.investfacil.api.onboarding.OnboardingDtos.CompleteRequest;
import com.investfacil.api.onboarding.OnboardingDtos.FinancialHealthView;
import com.investfacil.api.onboarding.OnboardingDtos.ProfileView;
import com.investfacil.api.onboarding.OnboardingTypes.HealthBand;
import com.investfacil.api.onboarding.OnboardingTypes.Opportunity;
import com.investfacil.api.onboarding.OnboardingTypes.SpendingTrigger;
import com.investfacil.api.onboarding.OnboardingTypes.StudyDay;
import com.investfacil.api.users.User;
import com.investfacil.api.users.UserService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
public class OnboardingService {

    private final OnboardingProfileRepository profiles;
    private final UserService users;
    private final FinancialHealthCalculator calculator;

    public OnboardingService(OnboardingProfileRepository profiles, UserService users,
                             FinancialHealthCalculator calculator) {
        this.profiles = profiles;
        this.users = users;
        this.calculator = calculator;
    }

    @Transactional(readOnly = true)
    public ProfileView get(UUID userId) {
        User user = users.require(userId);
        return profiles.findById(userId)
                .map(profile -> view(user, profile))
                .orElseGet(() -> ProfileView.empty(user.getName()));
    }

    public FinancialHealthView estimate(AnswersRequest answers) {
        return calculator.calculate(answers);
    }

    @Transactional
    public ProfileView complete(UUID userId, CompleteRequest request) {
        User user = users.require(userId);
        AnswersRequest answers = request.answers();
        FinancialHealthView health = calculator.calculate(answers);

        OnboardingProfile profile = profiles.findById(userId).orElseGet(() -> {
            OnboardingProfile created = new OnboardingProfile();
            created.setUserId(userId);
            return created;
        });
        apply(profile, answers);
        profile.setMonthlySavingsGoalCents(health.monthlySavingsCents());
        profile.setEmergencyFundGoalCents(health.emergencyFundGoalCents());
        profile.setHealthScore(health.score());
        profile.setHealthBand(HealthBand.valueOf(health.band()));
        profile.setOpportunity(Opportunity.valueOf(health.opportunity()));
        profile.setRecommendation(health.recommendation());
        // O id é atribuído pelo cliente, então o Spring Data usa merge em vez de
        // persist. Os timestamps são definidos aqui para que a resposta reflita
        // exatamente o que foi gravado.
        Instant now = Instant.now();
        if (profile.getCompletedAt() == null) {
            profile.setCompletedAt(now);
        }
        if (profile.getCreatedAt() == null) {
            profile.setCreatedAt(now);
        }
        profile.setUpdatedAt(now);
        profiles.save(profile);

        users.updateProfile(userId, request.name(), null, null);
        return view(users.require(userId), profile);
    }

    private void apply(OnboardingProfile profile, AnswersRequest answers) {
        profile.setGoal(answers.goal());
        profile.setFinancialSituation(answers.financialSituation());
        profile.setIncomeCents(answers.incomeCents());
        profile.setSavingsCapacityCents(answers.savingsCapacityCents());
        profile.setEssentialExpensesCents(answers.essentialExpensesCents());
        profile.setEmergencyReserve(answers.emergencyReserve());
        profile.setHighInterestDebt(answers.highInterestDebt());
        profile.setLearningPreference(answers.learningPreference());
        profile.setKnowledgeLevel(answers.knowledgeLevel());
        profile.setSpendingTriggers(normalizeTriggers(answers.spendingTriggers()));
        profile.setStudyDays(answers.studyDays().stream()
                .distinct()
                .sorted()
                .map(Enum::name)
                .toList());
        profile.setStudyTime(answers.studyTime());
    }

    /**
     * "Nenhum gatilho" é exclusivo: se vier junto com outros, prevalece NONE.
     * A lista é deduplicada para não inflar o jsonb com repetições.
     */
    private List<String> normalizeTriggers(List<SpendingTrigger> triggers) {
        if (triggers.contains(SpendingTrigger.NONE)) {
            return List.of(SpendingTrigger.NONE.name());
        }
        return triggers.stream().distinct().map(Enum::name).toList();
    }

    private ProfileView view(User user, OnboardingProfile profile) {
        AnswersRequest answers = new AnswersRequest(
                profile.getGoal(),
                profile.getFinancialSituation(),
                profile.getIncomeCents(),
                profile.getSavingsCapacityCents(),
                profile.getEssentialExpensesCents(),
                profile.getEmergencyReserve(),
                profile.getHighInterestDebt(),
                profile.getLearningPreference(),
                profile.getKnowledgeLevel(),
                profile.getSpendingTriggers().stream().map(SpendingTrigger::valueOf).toList(),
                profile.getStudyDays().stream().map(StudyDay::valueOf).toList(),
                profile.getStudyTime());
        AnswersView answersView = new AnswersView(
                profile.getGoal(),
                profile.getFinancialSituation(),
                profile.getIncomeCents(),
                profile.getSavingsCapacityCents(),
                profile.getEssentialExpensesCents(),
                profile.getEmergencyReserve(),
                profile.getHighInterestDebt(),
                profile.getLearningPreference(),
                profile.getKnowledgeLevel(),
                List.copyOf(profile.getSpendingTriggers()),
                List.copyOf(profile.getStudyDays()),
                profile.getStudyTime());
        return new ProfileView(true, user.getName(), answersView,
                calculator.calculate(answers), profile.getCompletedAt());
    }
}
