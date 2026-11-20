package com.investfacil.api.common.security;

import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.ByteBuffer;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.time.Instant;
import java.util.Locale;

/**
 * TOTP (RFC 6238) para MFA: HMAC-SHA1, 6 dígitos, janela de 30 s.
 * Implementação própria para evitar dependência de serviço externo.
 */
@Service
public class TotpService {

    private static final String ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
    private static final int PERIOD_SECONDS = 30;
    private static final SecureRandom RANDOM = new SecureRandom();

    public String generateSecret() {
        byte[] bytes = new byte[20];
        RANDOM.nextBytes(bytes);
        return base32Encode(bytes);
    }

    public long counter(Instant instant) {
        return instant.getEpochSecond() / PERIOD_SECONDS;
    }

    public String code(String secret, Instant instant) {
        return codeForCounter(secret, counter(instant));
    }

    /** Aceita a janela anterior, atual e seguinte (tolerância de relógio). */
    public boolean verify(String secret, String code, Instant instant) {
        if (secret == null || secret.isBlank() || code == null || !code.matches("\\d{6}")) {
            return false;
        }
        long current = counter(instant);
        for (long offset = -1; offset <= 1; offset++) {
            if (MessageDigest.isEqual(
                    codeForCounter(secret, current + offset).getBytes(),
                    code.getBytes())) {
                return true;
            }
        }
        return false;
    }

    /** Contador usado pelo código validado (para impedir replay do mesmo código). */
    public long matchedCounter(String secret, String code, Instant instant) {
        long current = counter(instant);
        for (long offset = -1; offset <= 1; offset++) {
            if (MessageDigest.isEqual(
                    codeForCounter(secret, current + offset).getBytes(),
                    code.getBytes())) {
                return current + offset;
            }
        }
        return -1;
    }

    public String otpauthUri(String issuer, String account, String secret) {
        String label = urlEncode(issuer) + ":" + urlEncode(account);
        return "otpauth://totp/" + label
                + "?secret=" + secret
                + "&issuer=" + urlEncode(issuer)
                + "&algorithm=SHA1&digits=6&period=" + PERIOD_SECONDS;
    }

    private String codeForCounter(String secret, long counter) {
        try {
            byte[] key = base32Decode(secret);
            Mac mac = Mac.getInstance("HmacSHA1");
            mac.init(new SecretKeySpec(key, "HmacSHA1"));
            byte[] hash = mac.doFinal(ByteBuffer.allocate(8).putLong(counter).array());
            int offset = hash[hash.length - 1] & 0x0f;
            int binary = ((hash[offset] & 0x7f) << 24)
                    | ((hash[offset + 1] & 0xff) << 16)
                    | ((hash[offset + 2] & 0xff) << 8)
                    | (hash[offset + 3] & 0xff);
            return String.format(Locale.ROOT, "%06d", binary % 1_000_000);
        } catch (Exception ex) {
            throw new IllegalStateException("Falha ao gerar TOTP", ex);
        }
    }

    static String base32Encode(byte[] data) {
        StringBuilder out = new StringBuilder();
        int buffer = 0;
        int bitsLeft = 0;
        for (byte b : data) {
            buffer = (buffer << 8) | (b & 0xff);
            bitsLeft += 8;
            while (bitsLeft >= 5) {
                out.append(ALPHABET.charAt((buffer >> (bitsLeft - 5)) & 0x1f));
                bitsLeft -= 5;
            }
        }
        if (bitsLeft > 0) {
            out.append(ALPHABET.charAt((buffer << (5 - bitsLeft)) & 0x1f));
        }
        return out.toString();
    }

    static byte[] base32Decode(String encoded) {
        String normalized = encoded.replace("=", "").replace(" ", "").toUpperCase(Locale.ROOT);
        int buffer = 0;
        int bitsLeft = 0;
        byte[] out = new byte[normalized.length() * 5 / 8];
        int index = 0;
        for (char c : normalized.toCharArray()) {
            int value = ALPHABET.indexOf(c);
            if (value < 0) {
                throw new IllegalArgumentException("Segredo Base32 inválido");
            }
            buffer = (buffer << 5) | value;
            bitsLeft += 5;
            if (bitsLeft >= 8) {
                out[index++] = (byte) ((buffer >> (bitsLeft - 8)) & 0xff);
                bitsLeft -= 8;
            }
        }
        return out;
    }

    private static String urlEncode(String value) {
        return java.net.URLEncoder.encode(value, java.nio.charset.StandardCharsets.UTF_8)
                .replace("+", "%20");
    }
}
