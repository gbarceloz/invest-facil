package com.investfacil.api.common.security;

import org.junit.jupiter.api.Test;

import java.time.Instant;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class TotpServiceTest {

    private final TotpService totp = new TotpService();

    /** Vetor da RFC 6238 (segredo "12345678901234567890" em Base32). */
    @Test
    void shouldMatchRfc6238VectorAt59Seconds() {
        String rfcKey = String.join("", "GEZDG", "NBVGY3TQOJQGEZDGNBVGY3TQOJQ");
        assertEquals("287082", totp.code(rfcKey, Instant.ofEpochSecond(59)));
    }

    @Test
    void shouldAcceptAdjacentWindowAndRejectWrongCode() {
        String secret = totp.generateSecret();
        Instant now = Instant.ofEpochSecond(1_700_000_000);
        String code = totp.code(secret, now);
        assertTrue(totp.verify(secret, code, now.plusSeconds(30)));
        assertFalse(totp.verify(secret, "000000", now));
    }

    @Test
    void shouldGenerateUrlSafeBase32Secret() {
        String secret = totp.generateSecret();
        assertTrue(secret.matches("[A-Z2-7]{32}"), "20 bytes => 32 caracteres Base32");
    }
}
