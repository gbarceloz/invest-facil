package com.investfacil.api.onboarding;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface OnboardingProfileRepository
        extends JpaRepository<OnboardingProfile, UUID> {
}
