package com.investfacil.api.videos;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.investfacil.api.common.error.BusinessException;
import com.investfacil.api.config.AppProperties;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.util.UriComponentsBuilder;

import java.net.URI;
import java.util.Map;

/**
 * Cliente mínimo da Supabase Storage API (bucket privado).
 * A service role key fica apenas no servidor; nunca vai ao frontend.
 */
@Component
public class SupabaseStorageClient {

    private final AppProperties properties;
    private final RestClient restClient;

    public SupabaseStorageClient(AppProperties properties) {
        this.properties = properties;
        this.restClient = RestClient.builder().build();
    }

    public boolean isConfigured() {
        String url = properties.getSupabase().getUrl();
        String key = properties.getSupabase().getServiceKey();
        return url != null && !url.isBlank() && key != null && !key.isBlank();
    }

    public void upload(String path, byte[] bytes, String contentType) {
        if (!isConfigured()) {
            throw BusinessException.unavailable("Supabase Storage não configurado.");
        }
        URI uri = objectUri(path);
        try {
            restClient.post()
                    .uri(uri)
                    .header("Authorization", "Bearer " + properties.getSupabase().getServiceKey())
                    .header("x-upsert", "false")
                    .contentType(MediaType.parseMediaType(contentType))
                    .body(bytes)
                    .retrieve()
                    .toBodilessEntity();
        } catch (RuntimeException ex) {
            throw BusinessException.unavailable(
                    "Falha ao enviar o vídeo para o armazenamento. Tente novamente.");
        }
    }

    public String signedUrl(String path, long expiresInSeconds) {
        if (!isConfigured()) {
            throw BusinessException.unavailable("Supabase Storage não configurado.");
        }
        URI uri = UriComponentsBuilder.fromUriString(baseUrl())
                .pathSegment("storage", "v1", "object", "sign",
                        properties.getSupabase().getBucket())
                .path("/" + path)
                .build()
                .encode()
                .toUri();
        try {
            SignedUrlResponse response = restClient.post()
                    .uri(uri)
                    .header("Authorization", "Bearer " + properties.getSupabase().getServiceKey())
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(Map.of("expiresIn", expiresInSeconds))
                    .retrieve()
                    .body(SignedUrlResponse.class);
            if (response == null || response.signedUrl() == null) {
                throw new IllegalStateException("Resposta sem signedURL");
            }
            String signed = response.signedUrl();
            if (signed.startsWith("http://") || signed.startsWith("https://")) {
                return signed;
            }
            return baseUrl() + "/storage/v1" + (signed.startsWith("/") ? signed : "/" + signed);
        } catch (RuntimeException ex) {
            throw BusinessException.unavailable(
                    "Não foi possível gerar a URL de reprodução do vídeo.");
        }
    }

    private URI objectUri(String path) {
        return UriComponentsBuilder.fromUriString(baseUrl())
                .pathSegment("storage", "v1", "object",
                        properties.getSupabase().getBucket())
                .path("/" + path)
                .build()
                .encode()
                .toUri();
    }

    private String baseUrl() {
        String url = properties.getSupabase().getUrl();
        return url.endsWith("/") ? url.substring(0, url.length() - 1) : url;
    }

    private record SignedUrlResponse(@JsonProperty("signedURL") String signedUrl) {
    }
}
