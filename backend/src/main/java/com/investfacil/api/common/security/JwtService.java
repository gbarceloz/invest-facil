package com.investfacil.api.common.security;

import com.investfacil.api.config.AppProperties;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Date;
import java.util.UUID;

/**
 * Access token JWT HS256 de curta duração.
 * O refresh token é opaco e NÃO passa por esta classe.
 *
 * O claim {@code role} existe para auditoria/telemetria; a autorização real
 * sempre usa o papel lido do banco por {@link JwtAuthenticationFilter}.
 */
@Service
public class JwtService {

    public static final String PURPOSE_ACCESS = "access";
    public static final String PURPOSE_MFA = "mfa";

    private final SecretKey key;
    private final AppProperties properties;

    public JwtService(AppProperties properties) {
        this.properties = properties;
        this.key = buildKey(properties.getJwt().getSecret());
    }

    private static SecretKey buildKey(String configured) {
        if (configured == null || configured.isBlank()) {
            throw new IllegalStateException(
                    "JWT_SECRET não configurado. Gere um segredo Base64 com pelo menos 32 bytes.");
        }
        byte[] bytes;
        try {
            bytes = Decoders.BASE64.decode(configured.trim());
        } catch (RuntimeException ex) {
            bytes = configured.trim().getBytes(StandardCharsets.UTF_8);
        }
        if (bytes.length < 32) {
            throw new IllegalStateException(
                    "JWT_SECRET deve ter pelo menos 32 bytes (Base64 ou texto).");
        }
        return Keys.hmacShaKeyFor(bytes);
    }

    public String createAccessToken(UUID userId, String email, String role) {
        Instant now = Instant.now();
        return Jwts.builder()
                .issuer(properties.getJwt().getIssuer())
                .subject(userId.toString())
                .claim("email", email)
                .claim("role", role)
                .claim("purpose", PURPOSE_ACCESS)
                .issuedAt(Date.from(now))
                .expiration(Date.from(now.plusSeconds(properties.getJwt().getAccessMinutes() * 60)))
                .signWith(key)
                .compact();
    }

    public String createMfaChallenge(UUID userId) {
        Instant now = Instant.now();
        return Jwts.builder()
                .issuer(properties.getJwt().getIssuer())
                .subject(userId.toString())
                .claim("purpose", PURPOSE_MFA)
                .issuedAt(Date.from(now))
                .expiration(Date.from(now.plusSeconds(properties.getJwt().getMfaChallengeMinutes() * 60)))
                .signWith(key)
                .compact();
    }

    public Claims parseAccessToken(String token) {
        Claims claims = parse(token);
        if (!PURPOSE_ACCESS.equals(claims.get("purpose", String.class))) {
            throw new JwtException("Tipo de token inválido");
        }
        return claims;
    }

    public Claims parseMfaChallenge(String token) {
        Claims claims = parse(token);
        if (!PURPOSE_MFA.equals(claims.get("purpose", String.class))) {
            throw new JwtException("Tipo de token inválido");
        }
        return claims;
    }

    public Claims parse(String token) {
        return Jwts.parser()
                .verifyWith(key)
                .requireIssuer(properties.getJwt().getIssuer())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    public long accessSeconds() {
        return properties.getJwt().getAccessMinutes() * 60;
    }

    public long refreshSeconds() {
        return properties.getJwt().getRefreshDays() * 24 * 3600;
    }
}
