package com.investfacil.api.auth;

import com.investfacil.api.common.error.BusinessException;
import com.investfacil.api.config.AppProperties;
import com.investfacil.api.users.UserService;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtException;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.Set;

/**
 * Valida o ID token emitido pelo Google Identity Services.
 *
 * <p>A assinatura é verificada contra o JWKS público do Google; aud, iss,
 * expiração e email_verified são checados antes de qualquer acesso ao banco.</p>
 */
@Component
public class GoogleTokenVerifier {

    private static final String JWKS_URI = "https://www.googleapis.com/oauth2/v3/certs";
    private static final Set<String> ISSUERS =
            Set.of("https://accounts.google.com", "accounts.google.com");

    public record GoogleUser(String sub, String email, String name, String picture) {
    }

    private final String clientId;
    private final NimbusJwtDecoder decoder;

    public GoogleTokenVerifier(AppProperties properties) {
        this.clientId = properties.getGoogle().getClientId() == null
                ? "" : properties.getGoogle().getClientId().trim();
        this.decoder = NimbusJwtDecoder.withJwkSetUri(JWKS_URI).build();
    }

    public GoogleUser verify(String credential) {
        if (clientId.isEmpty()) {
            throw new BusinessException(org.springframework.http.HttpStatus.SERVICE_UNAVAILABLE,
                    "GOOGLE_NOT_CONFIGURED",
                    "O login com Google ainda não foi configurado.");
        }
        if (credential == null || credential.isBlank()) {
            throw BusinessException.unauthorized("Credencial do Google ausente.");
        }
        try {
            Jwt token = decoder.decode(credential);
            String issuer = token.getIssuer() == null ? "" : token.getIssuer().toString();
            if (!ISSUERS.contains(issuer)) {
                throw BusinessException.unauthorized("Emissor do Google inválido.");
            }
            if (token.getAudience() == null || !token.getAudience().contains(clientId)) {
                throw BusinessException.unauthorized("Token do Google emitido para outro aplicativo.");
            }
            Instant expiresAt = token.getExpiresAt();
            if (expiresAt != null && expiresAt.isBefore(Instant.now())) {
                throw BusinessException.unauthorized("Credencial do Google expirada.");
            }
            Object verifiedClaim = token.getClaim("email_verified");
            boolean emailVerified = Boolean.TRUE.equals(verifiedClaim)
                    || "true".equalsIgnoreCase(String.valueOf(verifiedClaim));
            String email = token.getClaimAsString("email");
            String sub = token.getSubject();
            if (!emailVerified || email == null || email.isBlank() || sub == null || sub.isBlank()) {
                throw BusinessException.unauthorized(
                        "A conta Google precisa ter um e-mail verificado.");
            }
            return new GoogleUser(
                    sub,
                    UserService.normalize(email),
                    token.getClaimAsString("name"),
                    token.getClaimAsString("picture"));
        } catch (JwtException | IllegalArgumentException ex) {
            throw BusinessException.unauthorized("Credencial do Google inválida.");
        }
    }
}
