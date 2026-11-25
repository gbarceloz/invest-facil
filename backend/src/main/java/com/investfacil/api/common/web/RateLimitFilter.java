package com.investfacil.api.common.web;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.investfacil.api.common.error.ApiError;
import com.investfacil.api.config.AppProperties;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;

/**
 * Rate limiting em memória, por IP + bucket de rota.
 *
 * Limitações: em múltiplas instâncias o limite é por instância. Para o MVP
 * (uma instância no Render) é suficiente; a evolução natural é Redis.
 * Jamais usa X-Forwarded-For sem proxy confiável ({@link ClientIpResolver}).
 */
@Component
@Order(Ordered.HIGHEST_PRECEDENCE + 20)
public class RateLimitFilter extends OncePerRequestFilter {

    private record Rule(String prefix, int limit, long windowSeconds) {
    }

    private record Window(long resetAtMillis, AtomicLong count) {
    }

    private static final List<Rule> RULES = List.of(
            // Limites por IP+bucket. O bloqueio por conta (5 falhas) é a defesa
            // principal contra força bruta; estes limites protegem a superfície.
            // Se o IP real não puder ser resolvido atrás de um proxy, os limites
            // são compartilhados — por isso não são agressivos a ponto de um
            // único cliente derrubar o login de todos em poucos segundos.
            new Rule("/api/v1/auth/register", 20, 3600),
            new Rule("/api/v1/auth/forgot-password", 15, 3600),
            new Rule("/api/v1/auth/reset-password", 20, 3600),
            new Rule("/api/v1/auth/login", 30, 300),
            new Rule("/api/v1/auth/google", 30, 300),
            new Rule("/api/v1/auth/mfa/verify", 20, 300),
            new Rule("/api/v1/auth/refresh", 120, 300),
            new Rule("/api/v1/auth", 180, 300),
            new Rule("/api/v1", 1200, 60)
    ).stream().sorted(Comparator.comparingInt((Rule r) -> r.prefix().length()).reversed()).toList();

    private final boolean enabled;
    private final ClientIpResolver ipResolver;
    private final ObjectMapper objectMapper;
    private final Map<String, Window> windows = new ConcurrentHashMap<>();
    private final AtomicLong requests = new AtomicLong();

    public RateLimitFilter(AppProperties properties, ClientIpResolver ipResolver,
                           ObjectMapper objectMapper) {
        this.enabled = properties.getRateLimit().isEnabled();
        this.ipResolver = ipResolver;
        this.objectMapper = objectMapper;
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getRequestURI();
        return !enabled
                || "OPTIONS".equalsIgnoreCase(request.getMethod())
                || path.startsWith("/actuator")
                || path.startsWith("/swagger-ui")
                || path.startsWith("/v3/api-docs");
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        Rule rule = resolveRule(request.getRequestURI());
        if (rule == null) {
            filterChain.doFilter(request, response);
            return;
        }
        long now = System.currentTimeMillis();
        if (requests.incrementAndGet() % 2000 == 0) {
            windows.entrySet().removeIf(entry -> entry.getValue().resetAtMillis() < now);
        }
        String key = ipResolver.resolve(request) + "|" + rule.prefix();
        Window window = windows.compute(key, (ignored, existing) -> {
            if (existing == null || existing.resetAtMillis() <= now) {
                return new Window(now + rule.windowSeconds() * 1000, new AtomicLong(1));
            }
            existing.count().incrementAndGet();
            return existing;
        });
        long used = window.count().get();
        long remaining = Math.max(0, rule.limit() - used);
        response.setHeader("X-RateLimit-Limit", String.valueOf(rule.limit()));
        response.setHeader("X-RateLimit-Remaining", String.valueOf(remaining));
        if (used > rule.limit()) {
            long retryAfter = Math.max(1, (window.resetAtMillis() - now + 999) / 1000);
            response.setHeader("Retry-After", String.valueOf(retryAfter));
            response.setStatus(429);
            response.setContentType(MediaType.APPLICATION_JSON_VALUE);
            response.setCharacterEncoding("UTF-8");
            objectMapper.writeValue(response.getWriter(), ApiError.of(
                    429, "RATE_LIMITED",
                    "Muitas tentativas. Aguarde alguns instantes e tente novamente.",
                    request.getRequestId()));
            return;
        }
        filterChain.doFilter(request, response);
    }

    private Rule resolveRule(String path) {
        for (Rule rule : RULES) {
            if (path.startsWith(rule.prefix())) {
                return rule;
            }
        }
        return null;
    }
}
