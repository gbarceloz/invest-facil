package com.investfacil.api.auth;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.UUID;

/**
 * Auditoria de autenticação. Participa da transação corrente quando existe
 * (ex.: cadastro, para respeitar a FK de users) e abre transação própria nos
 * fluxos sem transação externa (ex.: falha de login).
 */
@Service
public class AuthAuditService {

    private final AuthEventRepository repository;

    public AuthAuditService(AuthEventRepository repository) {
        this.repository = repository;
    }

    @Transactional
    public void record(UUID userId, String type, String ip, String userAgent, String detail) {
        AuthEvent event = new AuthEvent();
        event.setUserId(userId);
        event.setEventType(type);
        event.setIp(truncate(ip, 64));
        event.setUserAgent(truncate(userAgent, 255));
        event.setDetail(truncate(detail, 500));
        event.setOccurredAt(Instant.now());
        repository.save(event);
    }

    private static String truncate(String value, int max) {
        if (value == null) {
            return null;
        }
        return value.length() <= max ? value : value.substring(0, max);
    }
}
