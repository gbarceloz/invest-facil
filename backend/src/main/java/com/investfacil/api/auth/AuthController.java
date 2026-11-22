package com.investfacil.api.auth;

import com.investfacil.api.common.error.BusinessException;
import com.investfacil.api.common.context.UserContext;
import com.investfacil.api.common.security.CurrentUser;
import com.investfacil.api.common.security.RefreshCookieService;
import com.investfacil.api.common.security.TokenHasher;
import com.investfacil.api.common.web.ClientIpResolver;
import com.investfacil.api.config.AppProperties;
import com.investfacil.api.users.UserService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    private final AuthService authService;
    private final RefreshCookieService cookies;
    private final ClientIpResolver ipResolver;
    private final AppProperties properties;
    private final UserContext context;

    public AuthController(AuthService authService, RefreshCookieService cookies,
                          ClientIpResolver ipResolver, AppProperties properties,
                          UserContext context) {
        this.authService = authService;
        this.cookies = cookies;
        this.ipResolver = ipResolver;
        this.properties = properties;
        this.context = context;
    }

    @PostMapping("/register")
    public ResponseEntity<AuthDtos.RegisterResponse> register(
            @Valid @RequestBody AuthDtos.RegisterRequest request,
            HttpServletRequest http) {
        beginAuth(request.email(), "REGISTER");
        var result = authService.register(request, context(http));
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new AuthDtos.RegisterResponse(result.message(), result.devToken()));
    }

    @PostMapping("/login")
    public AuthDtos.AuthResponse login(@Valid @RequestBody AuthDtos.LoginRequest request,
                                       HttpServletRequest http,
                                       HttpServletResponse response) {
        beginAuth(request.email(), "LOGIN");
        return render(authService.login(request, context(http)), response);
    }

    @PostMapping("/refresh")
    public AuthDtos.AuthResponse refresh(HttpServletRequest http, HttpServletResponse response) {
        String refreshHeader = http.getHeader("X-Refresh-Token");
        boolean fromCookie = refreshHeader == null || refreshHeader.isBlank();
        if (fromCookie && !"XMLHttpRequest".equals(http.getHeader("X-Requested-With"))) {
            throw BusinessException.forbidden(
                    "Requisição de refresh inválida. Envie o cabeçalho X-Requested-With.");
        }
        String raw = cookies.read(http);
        if (raw == null) {
            throw BusinessException.unauthorized("Sessão não encontrada. Entre novamente.");
        }
        context.clear();
        context.setFlow("REFRESH");
        context.setRefreshHash(TokenHasher.sha256Hex(raw));
        return render(authService.refresh(raw, context(http)), response);
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(HttpServletRequest http, HttpServletResponse response,
                                       @AuthenticationPrincipal CurrentUser principal) {
        String raw = cookies.read(http);
        context.setFlow("LOGOUT");
        if (raw != null) {
            context.setRefreshHash(TokenHasher.sha256Hex(raw));
        }
        authService.logout(raw, principal != null ? principal.id() : null, context(http));
        cookies.clear(response);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/verify-email")
    public AuthDtos.MessageResponse verifyEmail(
            @Valid @RequestBody AuthDtos.VerifyEmailRequest request) {
        beginToken(request.token(), "EMAIL_VERIFY");
        authService.verifyEmail(request.token());
        return new AuthDtos.MessageResponse("E-mail confirmado. Sua conta está ativa.");
    }

    @PostMapping("/resend-verification")
    public AuthDtos.MessageResponse resendVerification(
            @Valid @RequestBody AuthDtos.ForgotPasswordRequest request) {
        beginAuth(request.email(), "RESEND_VERIFICATION");
        authService.resendVerification(request.email());
        return new AuthDtos.MessageResponse(
                "Se o e-mail estiver cadastrado, enviaremos as instruções.");
    }

    @PostMapping("/forgot-password")
    public AuthDtos.MessageResponse forgotPassword(
            @Valid @RequestBody AuthDtos.ForgotPasswordRequest request) {
        beginAuth(request.email(), "PASSWORD_RESET");
        authService.forgotPassword(request.email());
        return new AuthDtos.MessageResponse(
                "Se o e-mail estiver cadastrado, enviaremos as instruções.");
    }

    @PostMapping("/reset-password")
    public AuthDtos.MessageResponse resetPassword(
            @Valid @RequestBody AuthDtos.ResetPasswordRequest request,
            HttpServletResponse response) {
        beginToken(request.token(), "PASSWORD_RESET");
        authService.resetPassword(request.token(), request.password());
        cookies.clear(response);
        return new AuthDtos.MessageResponse(
                "Senha redefinida. Entre novamente com a nova senha.");
    }

    @PostMapping("/mfa/verify")
    public AuthDtos.AuthResponse verifyMfa(@Valid @RequestBody AuthDtos.MfaVerifyRequest request,
                                           HttpServletRequest http,
                                           HttpServletResponse response) {
        context.clear();
        context.setFlow("MFA");
        return render(authService.verifyMfa(request, context(http)), response);
    }

    @PostMapping("/mfa/setup")
    public AuthDtos.MfaSetupResponse setupMfa(@AuthenticationPrincipal CurrentUser principal,
                                              @Valid @RequestBody AuthDtos.MfaSetupRequest request) {
        return authService.setupMfa(principal.id(), request.password());
    }

    @PostMapping("/mfa/enable")
    public AuthDtos.MessageResponse enableMfa(@AuthenticationPrincipal CurrentUser principal,
                                              @Valid @RequestBody AuthDtos.MfaCodeRequest request) {
        authService.enableMfa(principal.id(), request.code());
        return new AuthDtos.MessageResponse("MFA ativado com sucesso.");
    }

    @PostMapping("/mfa/disable")
    public AuthDtos.MessageResponse disableMfa(@AuthenticationPrincipal CurrentUser principal,
                                               @Valid @RequestBody AuthDtos.MfaDisableRequest request) {
        authService.disableMfa(principal.id(), request.password(), request.code());
        return new AuthDtos.MessageResponse("MFA desativado.");
    }

    @PostMapping("/change-password")
    public AuthDtos.MessageResponse changePassword(@AuthenticationPrincipal CurrentUser principal,
                                                   @Valid @RequestBody AuthDtos.ChangePasswordRequest request,
                                                   HttpServletRequest http,
                                                   HttpServletResponse response) {
        authService.changePassword(principal.id(), request.currentPassword(),
                request.newPassword(), context(http));
        cookies.clear(response);
        return new AuthDtos.MessageResponse(
                "Senha alterada. Todas as sessões foram encerradas; entre novamente.");
    }

    @GetMapping("/sessions")
    public List<AuthDtos.SessionView> sessions(HttpServletRequest http,
                                               @AuthenticationPrincipal CurrentUser principal) {
        return authService.sessions(principal.id(), cookies.read(http));
    }

    @DeleteMapping("/sessions/{id}")
    public ResponseEntity<Void> revokeSession(@PathVariable UUID id,
                                              HttpServletRequest http,
                                              HttpServletResponse response,
                                              @AuthenticationPrincipal CurrentUser principal) {
        authService.revokeSession(principal.id(), id);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/sessions")
    public ResponseEntity<Void> revokeAllSessions(HttpServletResponse response,
                                                  @AuthenticationPrincipal CurrentUser principal) {
        authService.revokeAllSessions(principal.id());
        cookies.clear(response);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/me")
    public com.investfacil.api.users.UserDtos.UserView me(
            @AuthenticationPrincipal CurrentUser principal) {
        return authService.me(principal.id());
    }

    private AuthDtos.AuthResponse render(AuthService.AuthResult result, HttpServletResponse response) {
        if (result.refreshToken() != null) {
            long maxAge = properties.getJwt().getRefreshDays() * 24 * 3600;
            cookies.write(response, result.refreshToken(), maxAge);
        }
        return new AuthDtos.AuthResponse(
                result.accessToken(),
                result.expiresIn() == 0 ? null : result.expiresIn(),
                result.user(),
                result.mfaRequired(),
                result.challengeToken(),
                properties.getAuth().isExposeDevTokens() ? result.refreshToken() : null,
                null);
    }

    private AuthService.ClientContext context(HttpServletRequest http) {
        return new AuthService.ClientContext(
                ipResolver.resolve(http), http.getHeader("User-Agent"));
    }

    private void beginAuth(String email, String flow) {
        context.clear();
        context.setAuthEmail(UserService.normalize(email));
        context.setFlow(flow);
    }

    private void beginToken(String token, String flow) {
        context.clear();
        if (token != null && !token.isBlank()) {
            context.setEmailTokenHash(TokenHasher.sha256Hex(token));
        }
        context.setFlow(flow);
    }
}
