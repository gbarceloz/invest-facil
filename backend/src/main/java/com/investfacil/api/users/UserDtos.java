package com.investfacil.api.users;

import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.time.Instant;
import java.util.UUID;

public final class UserDtos {

    private UserDtos() {
    }

    public record UpdateProfileRequest(
            @Size(min = 2, max = 120, message = "O nome deve ter entre 2 e 120 caracteres.")
            String name,
            @Size(max = 500, message = "A URL do avatar é muito longa.")
            @Pattern(regexp = "^$|^https://.*", message = "O avatar deve usar HTTPS.")
            String avatarUrl,
            @Size(max = 64, message = "O timezone é muito longo.")
            String timezone
    ) {
    }

    public record UserView(
            UUID id,
            String name,
            String email,
            String role,
            boolean emailVerified,
            boolean mfaEnabled,
            String avatarUrl,
            Instant createdAt,
            String timezone
    ) {
        public static UserView from(User user) {
            return new UserView(user.getId(), user.getName(), user.getEmail(),
                    user.getRole().name(), user.isVerified(), user.isMfaEnabled(),
                    user.getAvatarUrl(), user.getCreatedAt(), user.getTimezone());
        }
    }

    public record MessageResponse(String message) {
    }
}
