package com.investfacil.api.common.security;

import com.investfacil.api.config.AppProperties;
import org.springframework.stereotype.Service;

import javax.crypto.Cipher;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.util.Base64;

/**
 * Criptografia AES-GCM do segredo TOTP em repouso.
 * A chave vem de APP_MFA_KEY (Base64 32 bytes) ou é derivada do JWT_SECRET.
 */
@Service
public class SecretCipher {

    private static final SecureRandom RANDOM = new SecureRandom();
    private static final String PREFIX = "v1:";

    private final SecretKeySpec key;

    public SecretCipher(AppProperties properties) {
        this.key = new SecretKeySpec(resolveKey(properties), "AES");
    }

    private static byte[] resolveKey(AppProperties properties) {
        String configured = properties.getSecurity().getMfaKey();
        byte[] bytes;
        if (configured != null && !configured.isBlank()) {
            try {
                bytes = Base64.getDecoder().decode(configured.trim());
            } catch (RuntimeException ex) {
                bytes = configured.trim().getBytes(StandardCharsets.UTF_8);
            }
        } else {
            bytes = properties.getJwt().getSecret().getBytes(StandardCharsets.UTF_8);
        }
        try {
            bytes = MessageDigest.getInstance("SHA-256").digest(bytes);
        } catch (Exception ex) {
            throw new IllegalStateException("Falha ao derivar chave de MFA", ex);
        }
        return bytes;
    }

    public String encrypt(String plain) {
        try {
            byte[] iv = new byte[12];
            RANDOM.nextBytes(iv);
            Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding");
            cipher.init(Cipher.ENCRYPT_MODE, key, new GCMParameterSpec(128, iv));
            byte[] encrypted = cipher.doFinal(plain.getBytes(StandardCharsets.UTF_8));
            byte[] output = new byte[iv.length + encrypted.length];
            System.arraycopy(iv, 0, output, 0, iv.length);
            System.arraycopy(encrypted, 0, output, iv.length, encrypted.length);
            return PREFIX + Base64.getEncoder().encodeToString(output);
        } catch (Exception ex) {
            throw new IllegalStateException("Falha ao criptografar segredo", ex);
        }
    }

    public String decrypt(String stored) {
        try {
            if (stored == null || !stored.startsWith(PREFIX)) {
                throw new IllegalArgumentException("Formato de segredo inválido");
            }
            byte[] input = Base64.getDecoder().decode(stored.substring(PREFIX.length()));
            byte[] iv = new byte[12];
            byte[] encrypted = new byte[input.length - iv.length];
            System.arraycopy(input, 0, iv, 0, iv.length);
            System.arraycopy(input, iv.length, encrypted, 0, encrypted.length);
            Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding");
            cipher.init(Cipher.DECRYPT_MODE, key, new GCMParameterSpec(128, iv));
            return new String(cipher.doFinal(encrypted), StandardCharsets.UTF_8);
        } catch (Exception ex) {
            throw new IllegalStateException("Falha ao descriptografar segredo", ex);
        }
    }
}
