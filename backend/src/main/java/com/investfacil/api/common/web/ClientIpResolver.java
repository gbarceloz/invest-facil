package com.investfacil.api.common.web;

import com.investfacil.api.config.AppProperties;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Resolve o IP do cliente sem confiar cegamente em cabeçalhos.
 *
 * X-Forwarded-For só é considerado quando a conexão direta vem de um proxy
 * explicitamente listado em TRUSTED_PROXIES. Nesse caso, percorre a lista da
 * direita para a esquerda e devolve o primeiro endereço que não é proxy.
 * Sem essa configuração, vale sempre o endereço TCP da conexão.
 */
@Component
public class ClientIpResolver {

    private final boolean trustProxy;
    private final Set<String> trustedProxies;

    public ClientIpResolver(AppProperties properties) {
        this.trustProxy = properties.getSecurity().isTrustProxy();
        this.trustedProxies = Arrays.stream(properties.getSecurity().getTrustedProxies().split(","))
                .map(String::trim)
                .filter(value -> !value.isEmpty())
                .collect(Collectors.toUnmodifiableSet());
    }

    public String resolve(HttpServletRequest request) {
        String remote = request.getRemoteAddr();
        if (!trustProxy || !trustedProxies.contains(remote)) {
            return remote;
        }
        String forwarded = request.getHeader("X-Forwarded-For");
        if (forwarded == null || forwarded.isBlank()) {
            return remote;
        }
        String[] parts = forwarded.split(",");
        for (int i = parts.length - 1; i >= 0; i--) {
            String candidate = parts[i].trim();
            if (!candidate.isEmpty() && !trustedProxies.contains(candidate)) {
                return candidate;
            }
        }
        return remote;
    }
}
