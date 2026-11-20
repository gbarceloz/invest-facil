package com.investfacil.api.auth;

import com.investfacil.api.common.error.BusinessException;
import com.investfacil.api.common.security.JwtService;
import com.investfacil.api.common.security.SecretCipher;
import com.investfacil.api.common.security.TokenHasher;
import com.investfacil.api.common.security.TotpService;
import com.investfacil.api.config.AppProperties;
import com.investfacil.api.users.Role;
import com.investfacil.api.users.User;
import com.investfacil.api.users.UserDtos;
import com.investfacil.api.users.UserService;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
public class AuthService {

    public record ClientContext(String ip, String userAgent) {
    }

    public record AuthResult(String accessToken, String refreshToken, long expiresIn,
                             UserDtos.UserView user, boolean mfaRequired, String challengeToken) {
    }

    public record RegistrationResult(String message, String devToken) {
    }

    private final UserService users;
    private final RefreshTokenRepository refreshTokens;
    private final EmailTokenRepository emailTokens;
    private final AuthAuditService audit;
    private final JwtService jwt;
    private final EmailService email;
    private final SecretCipher cipher;
    private final TotpService totp;
    private final AppProperties properties;
    private final PasswordEncoder encoder;
    private final String dummyHash;

    public AuthService(UserService users, RefreshTokenRepository refreshTokens,
                       EmailTokenRepository emailTokens, AuthAuditService audit,
                       JwtService jwt, EmailService email, SecretCipher cipher,
                       TotpService totp, AppProperties properties, PasswordEncoder encoder) {
        this.users = users;
        this.refreshTokens = refreshTokens;
        this.emailTokens = emailTokens;
        this.audit = audit;
        this.jwt = jwt;
        this.email = email;
        this.cipher = cipher;
        this.totp = totp;
        this.properties = properties;
        this.encoder = encoder;
        this.dummyHash = encoder.encode(TokenHasher.randomToken());
    }

    // ------------------------------------------------------------------
    // Cadastro, login e tokens
    // ------------------------------------------------------------------

    @Transactional
    public RegistrationResult register(AuthDtos.RegisterRequest request, ClientContext context) {
        String normalized = UserService.normalize(request.email());
        if (users.existsByEmail(normalized)) {
            audit.record(null, "REGISTER", context.ip(), context.userAgent(), "duplicate-email");
            throw BusinessException.conflict(
                    "Não foi possível concluir o cadastro com estes dados.");
        }
        User user = users.create(request.name(), normalized, request.password(), Role.USER, false);
        String verifyToken = issueEmailToken(user, EmailTokenType.EMAIL_VERIFY, Duration.ofHours(24));
        email.sendVerification(user, verifyToken);
        audit.record(user.getId(), "REGISTER", context.ip(), context.userAgent(), "created");
        return new RegistrationResult(
                "Cadastro criado. Confira seu e-mail para confirmar a conta.",
                properties.getAuth().isExposeDevTokens() ? verifyToken : null);
    }

    public AuthResult login(AuthDtos.LoginRequest request, ClientContext context) {
        User user = users.findByEmail(request.email()).orElse(null);
        if (user == null) {
            // Tempo de resposta comparável ao de uma senha errada (anti-enumeração).
            encoder.matches(request.password(), dummyHash);
            audit.record(null, "LOGIN_FAIL", context.ip(), context.userAgent(), "unknown-email");
            throw BusinessException.unauthorized("E-mail ou senha inválidos.");
        }
        if (user.isLocked(Instant.now())) {
            audit.record(user.getId(), "LOGIN_FAIL", context.ip(), context.userAgent(), "locked");
            throw BusinessException.locked(
                    "Conta temporariamente bloqueada após tentativas inválidas. Tente novamente mais tarde.");
        }
        if (!users.matches(request.password(), user.getPasswordHash())) {
            users.registerFailedLogin(user.getId());
            audit.record(user.getId(), "LOGIN_FAIL", context.ip(), context.userAgent(), "bad-password");
            throw BusinessException.unauthorized("E-mail ou senha inválidos.");
        }
        if (!user.isVerified()) {
            audit.record(user.getId(), "LOGIN_FAIL", context.ip(), context.userAgent(), "email-not-verified");
            throw new BusinessException(org.springframework.http.HttpStatus.FORBIDDEN,
                    "EMAIL_NOT_VERIFIED", "Confirme seu e-mail antes de entrar.");
        }
        if (user.isMfaEnabled()) {
            String challenge = jwt.createMfaChallenge(user.getId());
            audit.record(user.getId(), "LOGIN_MFA_CHALLENGE", context.ip(), context.userAgent(), "totp");
            return new AuthResult(null, null, 0, UserDtos.UserView.from(user), true, challenge);
        }
        AuthResult result = issueTokens(user, context, null);
        users.registerSuccessfulLogin(user.getId());
        audit.record(user.getId(), "LOGIN_OK", context.ip(), context.userAgent(), "password");
        return result;
    }

    public AuthResult verifyMfa(AuthDtos.MfaVerifyRequest request, ClientContext context) {
        UUID userId;
        try {
            Claims claims = jwt.parseMfaChallenge(request.challengeToken());
            userId = UUID.fromString(claims.getSubject());
        } catch (JwtException | IllegalArgumentException ex) {
            throw BusinessException.unauthorized("Desafio de MFA inválido ou expirado.");
        }
        User user = users.findById(userId)
                .orElseThrow(() -> BusinessException.unauthorized("Desafio de MFA inválido."));
        if (user.isLocked(Instant.now())) {
            throw BusinessException.locked("Conta temporariamente bloqueada.");
        }
        if (!user.isVerified()) {
            throw new BusinessException(org.springframework.http.HttpStatus.FORBIDDEN,
                    "EMAIL_NOT_VERIFIED", "Confirme seu e-mail antes de entrar.");
        }
        if (!user.isMfaEnabled() || user.getMfaSecret() == null) {
            throw BusinessException.unauthorized("MFA não está ativo para esta conta.");
        }
        String secret = cipher.decrypt(user.getMfaSecret());
        long matched = totp.matchedCounter(secret, request.code(), Instant.now());
        if (matched < 0) {
            audit.record(user.getId(), "LOGIN_FAIL", context.ip(), context.userAgent(), "bad-totp");
            throw BusinessException.unauthorized("Código inválido. Verifique o app autenticador.");
        }
        if (!users.consumeMfaCounter(user.getId(), matched)) {
            audit.record(user.getId(), "LOGIN_FAIL", context.ip(), context.userAgent(), "totp-replay");
            throw BusinessException.unauthorized("Código já utilizado. Aguarde o próximo código.");
        }
        AuthResult result = issueTokens(user, context, null);
        users.registerSuccessfulLogin(user.getId());
        audit.record(user.getId(), "LOGIN_OK", context.ip(), context.userAgent(), "totp");
        return result;
    }

    /**
     * Rotação de refresh com detecção de reuso. noRollbackFor garante que a
     * revogação da família seja persistida mesmo quando a requisição termina
     * em 401 (cenário de token reutilizado).
     */
    @Transactional(noRollbackFor = BusinessException.class)
    public AuthResult refresh(String rawToken, ClientContext context) {
        if (rawToken == null || rawToken.isBlank()) {
            throw BusinessException.unauthorized("Sessão não encontrada. Entre novamente.");
        }
        RefreshToken current = refreshTokens
                .findByTokenHashForUpdate(TokenHasher.sha256Hex(rawToken))
                .orElseThrow(() -> BusinessException.unauthorized("Sessão inválida. Entre novamente."));

        Instant now = Instant.now();
        if (current.getRevokedAt() != null || current.getReplacedBy() != null) {
            refreshTokens.revokeFamily(current.getFamilyId(), now);
            audit.record(current.getUserId(), "REFRESH_REUSE_DETECTED",
                    context.ip(), context.userAgent(), "family-revoked");
            throw BusinessException.unauthorized(
                    "Sessão inválida por segurança. Entre novamente em todos os dispositivos.");
        }
        if (current.getExpiresAt().isBefore(now)) {
            current.setRevokedAt(now);
            refreshTokens.save(current);
            throw BusinessException.unauthorized("Sessão expirada. Entre novamente.");
        }
        User user = users.findById(current.getUserId())
                .orElseThrow(() -> BusinessException.unauthorized("Sessão inválida."));
        if (user.isLocked(now)) {
            refreshTokens.revokeFamily(current.getFamilyId(), now);
            throw BusinessException.locked("Conta temporariamente bloqueada.");
        }

        AuthResult next = issueTokens(user, context, current.getFamilyId());
        RefreshToken stored = refreshTokens
                .findByTokenHash(TokenHasher.sha256Hex(next.refreshToken()))
                .orElseThrow(() -> new IllegalStateException("Refresh recém-criado não encontrado"));
        current.setRevokedAt(now);
        current.setReplacedBy(stored.getId());
        refreshTokens.save(current);
        audit.record(user.getId(), "REFRESH_ROTATED", context.ip(), context.userAgent(), "ok");
        return next;
    }

    @Transactional
    public void logout(String rawToken, UUID userId, ClientContext context) {
        if (rawToken != null && !rawToken.isBlank()) {
            refreshTokens.findByTokenHash(TokenHasher.sha256Hex(rawToken)).ifPresent(token -> {
                refreshTokens.revokeFamily(token.getFamilyId(), Instant.now());
                audit.record(userId != null ? userId : token.getUserId(), "LOGOUT",
                        context.ip(), context.userAgent(), "family-revoked");
            });
        }
    }

    // ------------------------------------------------------------------
    // Verificação de e-mail e recuperação de senha
    // ------------------------------------------------------------------

    @Transactional
    public void verifyEmail(String rawToken) {
        EmailToken token = emailTokens
                .findByTokenHashAndTypeForUpdate(TokenHasher.sha256Hex(rawToken),
                        EmailTokenType.EMAIL_VERIFY)
                .orElseThrow(() -> BusinessException.badRequest("TOKEN_INVALID",
                        "Link de verificação inválido."));
        if (token.getUsedAt() != null) {
            throw BusinessException.badRequest("TOKEN_USED",
                    "Este link já foi utilizado. Você pode entrar na sua conta.");
        }
        if (token.getExpiresAt().isBefore(Instant.now())) {
            throw BusinessException.badRequest("TOKEN_EXPIRED",
                    "Link expirado. Solicite um novo e-mail de verificação.");
        }
        token.setUsedAt(Instant.now());
        emailTokens.save(token);
        users.markVerified(token.getUserId());
        emailTokens.invalidateUnused(token.getUserId(), EmailTokenType.EMAIL_VERIFY, Instant.now());
        audit.record(token.getUserId(), "EMAIL_VERIFIED", null, null, "ok");
    }

    @Transactional
    public void resendVerification(String emailAddress) {
        users.findByEmail(emailAddress).ifPresent(user -> {
            if (!user.isVerified()) {
                String raw = issueEmailToken(user, EmailTokenType.EMAIL_VERIFY, Duration.ofHours(24));
                email.sendVerification(user, raw);
            }
        });
    }

    @Transactional
    public void forgotPassword(String emailAddress) {
        users.findByEmail(emailAddress).ifPresent(user -> {
            String raw = issueEmailToken(user, EmailTokenType.PASSWORD_RESET, Duration.ofHours(1));
            email.sendPasswordReset(user, raw);
            audit.record(user.getId(), "PASSWORD_RESET_REQUESTED", null, null, "email-sent");
        });
    }

    @Transactional
    public void resetPassword(String rawToken, String newPassword) {
        EmailToken token = emailTokens
                .findByTokenHashAndTypeForUpdate(TokenHasher.sha256Hex(rawToken),
                        EmailTokenType.PASSWORD_RESET)
                .orElseThrow(() -> BusinessException.badRequest("TOKEN_INVALID",
                        "Link de redefinição inválido."));
        if (token.getUsedAt() != null) {
            throw BusinessException.badRequest("TOKEN_USED", "Este link já foi utilizado.");
        }
        if (token.getExpiresAt().isBefore(Instant.now())) {
            throw BusinessException.badRequest("TOKEN_EXPIRED",
                    "Link expirado. Solicite uma nova recuperação de senha.");
        }
        Instant now = Instant.now();
        token.setUsedAt(now);
        emailTokens.save(token);
        users.changePassword(token.getUserId(), newPassword);
        refreshTokens.revokeAllForUser(token.getUserId(), now);
        emailTokens.invalidateUnused(token.getUserId(), EmailTokenType.PASSWORD_RESET, now);
        audit.record(token.getUserId(), "PASSWORD_RESET", null, null, "completed");
    }

    @Transactional
    public void changePassword(UUID userId, String currentPassword, String newPassword,
                               ClientContext context) {
        User user = users.require(userId);
        if (!users.matches(currentPassword, user.getPasswordHash())) {
            throw BusinessException.badRequest("INVALID_PASSWORD", "Senha atual incorreta.");
        }
        users.changePassword(userId, newPassword);
        refreshTokens.revokeAllForUser(userId, Instant.now());
        audit.record(userId, "PASSWORD_CHANGED", context.ip(), context.userAgent(), "sessions-revoked");
    }

    // ------------------------------------------------------------------
    // MFA
    // ------------------------------------------------------------------

    @Transactional
    public AuthDtos.MfaSetupResponse setupMfa(UUID userId, String password) {
        User user = users.require(userId);
        if (!users.matches(password, user.getPasswordHash())) {
            throw BusinessException.badRequest("INVALID_PASSWORD",
                    "Senha incorreta. MFA não foi iniciado.");
        }
        if (user.isMfaEnabled()) {
            throw BusinessException.conflict("MFA já está ativo nesta conta.");
        }
        String secret = totp.generateSecret();
        users.setMfaSecret(userId, cipher.encrypt(secret));
        audit.record(userId, "MFA_SETUP", null, null, "secret-generated");
        return new AuthDtos.MfaSetupResponse(secret,
                totp.otpauthUri("Invest Fácil", user.getEmail(), secret));
    }

    @Transactional
    public void enableMfa(UUID userId, String code) {
        User user = users.require(userId);
        if (user.getMfaSecret() == null) {
            throw BusinessException.badRequest("MFA_NOT_SETUP", "Inicie a configuração do MFA primeiro.");
        }
        String secret = cipher.decrypt(user.getMfaSecret());
        long matched = totp.matchedCounter(secret, code, Instant.now());
        if (matched < 0) {
            throw BusinessException.badRequest("INVALID_TOTP", "Código inválido. Tente novamente.");
        }
        users.enableMfa(userId, matched);
        audit.record(userId, "MFA_ENABLED", null, null, "ok");
    }

    @Transactional
    public void disableMfa(UUID userId, String password, String code) {
        User user = users.require(userId);
        if (!users.matches(password, user.getPasswordHash())) {
            throw BusinessException.badRequest("INVALID_PASSWORD", "Senha incorreta.");
        }
        if (!user.isMfaEnabled() || user.getMfaSecret() == null) {
            throw BusinessException.badRequest("MFA_NOT_ENABLED", "MFA não está ativo.");
        }
        String secret = cipher.decrypt(user.getMfaSecret());
        long matched = totp.matchedCounter(secret, code, Instant.now());
        if (matched < 0) {
            throw BusinessException.badRequest("INVALID_TOTP", "Código inválido.");
        }
        if (!users.consumeMfaCounter(userId, matched)) {
            throw BusinessException.badRequest("INVALID_TOTP", "Código já utilizado.");
        }
        users.disableMfa(userId);
        audit.record(userId, "MFA_DISABLED", null, null, "ok");
    }

    // ------------------------------------------------------------------
    // Sessões
    // ------------------------------------------------------------------

    public List<AuthDtos.SessionView> sessions(UUID userId, String currentRawToken) {
        String currentHash = currentRawToken == null ? null : TokenHasher.sha256Hex(currentRawToken);
        return refreshTokens
                .findByUserIdAndRevokedAtIsNullAndExpiresAtAfterOrderByCreatedAtDesc(userId, Instant.now())
                .stream()
                .map(token -> new AuthDtos.SessionView(
                        token.getId(), token.getIp(), token.getUserAgent(),
                        token.getCreatedAt(), token.getExpiresAt(),
                        currentHash != null && currentHash.equals(token.getTokenHash())))
                .toList();
    }

    @Transactional
    public void revokeSession(UUID userId, UUID sessionId) {
        int changed = refreshTokens.revokeOne(userId, sessionId, Instant.now());
        if (changed == 0) {
            throw BusinessException.notFound("Sessão não encontrada.");
        }
        audit.record(userId, "SESSION_REVOKED", null, null, sessionId.toString());
    }

    @Transactional
    public void revokeAllSessions(UUID userId) {
        refreshTokens.revokeAllForUser(userId, Instant.now());
        audit.record(userId, "ALL_SESSIONS_REVOKED", null, null, "ok");
    }

    public UserDtos.UserView me(UUID userId) {
        return UserDtos.UserView.from(users.require(userId));
    }

    // ------------------------------------------------------------------
    // Internos
    // ------------------------------------------------------------------

    private AuthResult issueTokens(User user, ClientContext context, UUID familyId) {
        String raw = TokenHasher.randomToken();
        Instant now = Instant.now();
        RefreshToken token = new RefreshToken();
        token.setUserId(user.getId());
        token.setTokenHash(TokenHasher.sha256Hex(raw));
        token.setFamilyId(familyId != null ? familyId : UUID.randomUUID());
        token.setExpiresAt(now.plusSeconds(jwt.refreshSeconds()));
        token.setIp(truncate(context.ip(), 64));
        token.setUserAgent(truncate(context.userAgent(), 255));
        token.setCreatedAt(now);
        refreshTokens.save(token);
        String access = jwt.createAccessToken(user.getId(), user.getEmail(), user.getRole().name());
        return new AuthResult(access, raw, jwt.accessSeconds(), UserDtos.UserView.from(user), false, null);
    }

    private String issueEmailToken(User user, EmailTokenType type, Duration ttl) {
        Instant now = Instant.now();
        emailTokens.invalidateUnused(user.getId(), type, now);
        String raw = TokenHasher.randomToken();
        EmailToken token = new EmailToken();
        token.setUserId(user.getId());
        token.setType(type);
        token.setTokenHash(TokenHasher.sha256Hex(raw));
        token.setExpiresAt(now.plus(ttl));
        emailTokens.save(token);
        return raw;
    }

    private static String truncate(String value, int max) {
        if (value == null) {
            return null;
        }
        return value.length() <= max ? value : value.substring(0, max);
    }
}
