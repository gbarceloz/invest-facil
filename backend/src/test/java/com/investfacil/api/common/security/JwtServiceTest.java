package com.investfacil.api.common.security;

import com.investfacil.api.config.AppProperties;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.JwtException;
import org.junit.jupiter.api.Test;

import java.security.SecureRandom;
import java.util.Base64;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

class JwtServiceTest {

    private static AppProperties properties(long accessMinutes) {
        byte[] secret = new byte[48];
        new SecureRandom().nextBytes(secret);
        AppProperties properties = new AppProperties();
        properties.getJwt().setSecret(Base64.getEncoder().encodeToString(secret));
        properties.getJwt().setAccessMinutes(accessMinutes);
        properties.getJwt().setIssuer("investfacil-test");
        return properties;
    }

    @Test
    void shouldCreateAndParseAccessToken() {
        JwtService service = new JwtService(properties(15));
        UUID id = UUID.randomUUID();
        String token = service.createAccessToken(id, "pessoa@example.com", "USER");
        var claims = service.parseAccessToken(token);
        assertEquals(id.toString(), claims.getSubject());
        assertEquals("pessoa@example.com", claims.get("email", String.class));
        assertEquals("USER", claims.get("role", String.class));
    }

    @Test
    void shouldRejectMfaTokenAsAccessToken() {
        JwtService service = new JwtService(properties(15));
        String token = service.createMfaChallenge(UUID.randomUUID());
        assertThrows(JwtException.class, () -> service.parseAccessToken(token));
    }

    @Test
    void shouldRejectExpiredToken() {
        JwtService service = new JwtService(properties(-1));
        String token = service.createAccessToken(UUID.randomUUID(), "pessoa@example.com", "USER");
        assertThrows(ExpiredJwtException.class, () -> service.parseAccessToken(token));
    }

    @Test
    void shouldRefuseWeakSecret() {
        AppProperties properties = new AppProperties();
        properties.getJwt().setSecret("curto");
        assertThrows(IllegalStateException.class, () -> new JwtService(properties));
    }
}
