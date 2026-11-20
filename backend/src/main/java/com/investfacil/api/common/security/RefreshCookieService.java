package com.investfacil.api.common.security;

import com.investfacil.api.config.AppProperties;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.stereotype.Component;

import java.time.Duration;

/**
 * Refresh token em cookie HttpOnly. O access token fica somente em memória
 * no frontend; nunca em localStorage.
 *
 * SameSite=Strict é o padrão. O frontend encaminha /api pelo próprio domínio
 * (rewrite do Next.js), portanto o cookie continua first-party.
 */
@Component
public class RefreshCookieService {

    private final AppProperties properties;

    public RefreshCookieService(AppProperties properties) {
        this.properties = properties;
    }

    /** Cabeçalho explícito (clientes de API/testes) tem precedência sobre o cookie. */
    public String read(HttpServletRequest request) {
        String header = request.getHeader("X-Refresh-Token");
        if (header != null && !header.isBlank()) {
            return header.trim();
        }
        Cookie[] cookies = request.getCookies();
        if (cookies == null) {
            return null;
        }
        String name = properties.getAuth().getRefreshCookieName();
        for (Cookie cookie : cookies) {
            if (name.equals(cookie.getName()) && cookie.getValue() != null
                    && !cookie.getValue().isBlank()) {
                return cookie.getValue();
            }
        }
        return null;
    }

    public void write(HttpServletResponse response, String rawToken, long maxAgeSeconds) {
        ResponseCookie cookie = ResponseCookie
                .from(properties.getAuth().getRefreshCookieName(), rawToken)
                .httpOnly(true)
                .secure(properties.getAuth().isCookieSecure())
                .sameSite(properties.getAuth().getCookieSameSite())
                .path("/api/v1/auth")
                .maxAge(Duration.ofSeconds(maxAgeSeconds))
                .build();
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
    }

    public void clear(HttpServletResponse response) {
        ResponseCookie cookie = ResponseCookie
                .from(properties.getAuth().getRefreshCookieName(), "")
                .httpOnly(true)
                .secure(properties.getAuth().isCookieSecure())
                .sameSite(properties.getAuth().getCookieSameSite())
                .path("/api/v1/auth")
                .maxAge(Duration.ZERO)
                .build();
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
    }
}
