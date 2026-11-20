package com.investfacil.api.users;

import com.investfacil.api.common.security.CurrentUser;
import jakarta.validation.Valid;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/users/me")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping
    public UserDtos.UserView me(@AuthenticationPrincipal CurrentUser principal) {
        return UserDtos.UserView.from(userService.require(principal.id()));
    }

    @PatchMapping
    public UserDtos.UserView update(@AuthenticationPrincipal CurrentUser principal,
                                    @Valid @RequestBody UserDtos.UpdateProfileRequest request) {
        return UserDtos.UserView.from(
                userService.updateProfile(principal.id(), request.name(), request.avatarUrl()));
    }
}
