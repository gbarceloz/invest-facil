package com.investfacil.api.gamification;

import com.investfacil.api.common.security.CurrentUser;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/gamification")
public class GamificationController {

    private final GamificationService gamification;

    public GamificationController(GamificationService gamification) {
        this.gamification = gamification;
    }

    @GetMapping("/summary")
    public GamificationDtos.GamificationSummary summary(
            @AuthenticationPrincipal CurrentUser principal) {
        return gamification.summary(principal.id());
    }

    @GetMapping("/achievements")
    public List<GamificationDtos.AchievementView> achievements(
            @AuthenticationPrincipal CurrentUser principal) {
        return gamification.summary(principal.id()).achievements();
    }

    @GetMapping("/xp")
    public List<GamificationDtos.XpEntry> xpHistory(
            @AuthenticationPrincipal CurrentUser principal) {
        return gamification.xpHistory(principal.id());
    }
}
