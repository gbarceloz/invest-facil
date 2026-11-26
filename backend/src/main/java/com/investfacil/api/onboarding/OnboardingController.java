package com.investfacil.api.onboarding;

import com.investfacil.api.common.security.CurrentUser;
import com.investfacil.api.onboarding.OnboardingDtos.AnswersRequest;
import com.investfacil.api.onboarding.OnboardingDtos.CompleteRequest;
import com.investfacil.api.onboarding.OnboardingDtos.FinancialHealthView;
import com.investfacil.api.onboarding.OnboardingDtos.ProfileView;
import jakarta.validation.Valid;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/onboarding")
public class OnboardingController {

    private final OnboardingService onboarding;

    public OnboardingController(OnboardingService onboarding) {
        this.onboarding = onboarding;
    }

    /**
     * Cálculo público usado antes do gate de autenticação. Não persiste nada
     * e não recebe valores derivados do cliente.
     */
    @PostMapping("/estimate")
    public FinancialHealthView estimate(@Valid @RequestBody AnswersRequest request) {
        return onboarding.estimate(request);
    }

    @GetMapping("/me")
    public ProfileView onboardingProfile(@AuthenticationPrincipal CurrentUser principal) {
        return onboarding.get(principal.id());
    }

    @PutMapping("/me")
    public ProfileView completeOnboarding(@AuthenticationPrincipal CurrentUser principal,
                                          @Valid @RequestBody CompleteRequest request) {
        return onboarding.complete(principal.id(), request);
    }
}
