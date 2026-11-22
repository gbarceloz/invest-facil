package com.investfacil.api.common.security;

import com.investfacil.api.common.context.UserContext;
import com.investfacil.api.users.Role;
import com.investfacil.api.users.User;
import com.investfacil.api.users.UserService;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

/**
 * Autentica a requisição a partir do Bearer JWT.
 * O usuário e o papel são SEMPRE carregados do banco; o claim do JWT não
 * concede autoridade por si só.
 *
 * <p>Antes de carregar o usuário, o {@code sub} assinado é colocado no
 * contexto transacional para que a policy de auto-leitura de {@code users}
 * permita a consulta. O papel só é colocado depois de lido do banco. O
 * contexto é limpo no {@code finally}, inclusive em erro/401.</p>
 */
@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UserService userService;
    private final UserContext context;

    public JwtAuthenticationFilter(JwtService jwtService, UserService userService,
                                   UserContext context) {
        this.jwtService = jwtService;
        this.userService = userService;
        this.context = context;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        context.clear();
        try {
            String header = request.getHeader("Authorization");
            if (header != null && header.startsWith("Bearer ")
                    && SecurityContextHolder.getContext().getAuthentication() == null) {
                String token = header.substring(7).trim();
                try {
                    Claims claims = jwtService.parseAccessToken(token);
                    UUID userId = UUID.fromString(claims.getSubject());

                    // A identidade do JWT é a única fonte do userId. O papel
                    // continua vindo do banco, nunca do claim.
                    context.setUser(userId, null);
                    context.setFlow("REQUEST");

                    User user = userService.findById(userId).orElse(null);
                    if (user != null && !isLocked(user)) {
                        context.setUser(user.getId(), user.getRole().name());
                        context.setFlow(user.getRole() == Role.ADMIN ? "ADMIN" : "REQUEST");
                        CurrentUser principal = new CurrentUser(
                                user.getId(), user.getEmail(), user.getName(), user.getRole().name());
                        var authentication = new UsernamePasswordAuthenticationToken(
                                principal, null,
                                List.of(new SimpleGrantedAuthority("ROLE_" + user.getRole().name())));
                        authentication.setDetails(
                                new WebAuthenticationDetailsSource().buildDetails(request));
                        SecurityContextHolder.getContext().setAuthentication(authentication);
                    }
                } catch (JwtException | IllegalArgumentException ex) {
                    SecurityContextHolder.clearContext();
                }
            } else {
                var existing = SecurityContextHolder.getContext().getAuthentication();
                if (existing != null && existing.getPrincipal() instanceof CurrentUser principal) {
                    context.setUser(principal.id(), principal.role());
                    context.setFlow("ADMIN".equals(principal.role()) ? "ADMIN" : "REQUEST");
                }
            }
            filterChain.doFilter(request, response);
        } finally {
            context.clear();
        }
    }

    private boolean isLocked(User user) {
        return user.getLockedUntil() != null && user.getLockedUntil().isAfter(Instant.now());
    }
}
