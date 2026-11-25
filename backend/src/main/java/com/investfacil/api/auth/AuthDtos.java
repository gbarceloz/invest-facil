package com.investfacil.api.auth;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.investfacil.api.users.UserDtos;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.time.Instant;
import java.util.UUID;

public final class AuthDtos {

    private AuthDtos() {
    }

    private static final String PASSWORD_RULE =
            "A senha deve ter entre 8 e 72 caracteres e conter ao menos uma letra e um número.";

    public record RegisterRequest(
            @NotBlank(message = "Informe seu nome.")
            @Size(min = 2, max = 120, message = "O nome deve ter entre 2 e 120 caracteres.")
            String name,
            @NotBlank(message = "Informe seu e-mail.")
            @Email(message = "E-mail inválido.")
            @Size(max = 255, message = "E-mail muito longo.")
            String email,
            @NotBlank(message = "Informe uma senha.")
            @Size(min = 8, max = 72, message = PASSWORD_RULE)
            @Pattern(regexp = "^(?=.*[A-Za-z])(?=.*\\d).+$", message = PASSWORD_RULE)
            String password
    ) {
    }

    public record GoogleLoginRequest(
            @NotBlank(message = "Credencial do Google obrigatória.")
            String credential
    ) {
    }

    public record LoginRequest(
            @NotBlank(message = "Informe seu e-mail.")
            @Email(message = "E-mail inválido.")
            String email,
            @NotBlank(message = "Informe sua senha.")
            String password
    ) {
    }

    @JsonInclude(JsonInclude.Include.NON_NULL)
    public record AuthResponse(
            String accessToken,
            Long expiresIn,
            UserDtos.UserView user,
            boolean mfaRequired,
            String challengeToken,
            String refreshToken,
            String message
    ) {
    }

    @JsonInclude(JsonInclude.Include.NON_NULL)
    public record RegisterResponse(String message, String devVerificationToken) {
    }

    public record VerifyEmailRequest(@NotBlank(message = "Token obrigatório.") String token) {
    }

    public record ForgotPasswordRequest(
            @NotBlank(message = "Informe seu e-mail.")
            @Email(message = "E-mail inválido.")
            String email
    ) {
    }

    public record ResetPasswordRequest(
            @NotBlank(message = "Token obrigatório.") String token,
            @NotBlank(message = "Informe uma senha.")
            @Size(min = 8, max = 72, message = PASSWORD_RULE)
            @Pattern(regexp = "^(?=.*[A-Za-z])(?=.*\\d).+$", message = PASSWORD_RULE)
            String password
    ) {
    }

    public record ChangePasswordRequest(
            @NotBlank(message = "Informe a senha atual.") String currentPassword,
            @NotBlank(message = "Informe a nova senha.")
            @Size(min = 8, max = 72, message = PASSWORD_RULE)
            @Pattern(regexp = "^(?=.*[A-Za-z])(?=.*\\d).+$", message = PASSWORD_RULE)
            String newPassword
    ) {
    }

    public record MfaVerifyRequest(
            @NotBlank(message = "Challenge obrigatório.") String challengeToken,
            @NotBlank(message = "Informe o código de 6 dígitos.")
            @Pattern(regexp = "\\d{6}", message = "O código deve ter 6 dígitos.")
            String code
    ) {
    }

    public record MfaCodeRequest(
            @NotBlank(message = "Informe o código de 6 dígitos.")
            @Pattern(regexp = "\\d{6}", message = "O código deve ter 6 dígitos.")
            String code
    ) {
    }

    public record MfaDisableRequest(
            @NotBlank(message = "Informe sua senha.") String password,
            @NotBlank(message = "Informe o código de 6 dígitos.")
            @Pattern(regexp = "\\d{6}", message = "O código deve ter 6 dígitos.")
            String code
    ) {
    }

    public record MfaSetupRequest(
            @NotBlank(message = "Confirme sua senha para configurar o MFA.")
            String password
    ) {
    }

    public record MfaSetupResponse(String secret, String otpauthUri) {
    }

    public record SessionView(
            UUID id,
            String ip,
            String userAgent,
            Instant createdAt,
            Instant expiresAt,
            boolean current
    ) {
    }

    public record MessageResponse(String message) {
    }
}
