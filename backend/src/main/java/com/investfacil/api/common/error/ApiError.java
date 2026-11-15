package com.investfacil.api.common.error;

import java.time.Instant;
import java.util.Map;

/**
 * Envelope padrão de erro de todas as respostas da API.
 *
 * @param timestamp momento do erro
 * @param status    HTTP status
 * @param code      código estável do erro (ex.: VALIDATION_ERROR, NOT_FOUND)
 * @param message   mensagem compreensível para o cliente (nunca stack trace,
 *                  SQL ou caminhos internos)
 * @param traceId   identificador de rastreamento da requisição
 * @param details   detalhes opcionais (ex.: erros de validação por campo)
 */
public record ApiError(
        Instant timestamp,
        int status,
        String code,
        String message,
        String traceId,
        Map<String, Object> details
) {

    public static ApiError of(int status, String code, String message, String traceId) {
        return new ApiError(Instant.now(), status, code, message, traceId, null);
    }

    public static ApiError of(int status, String code, String message, String traceId,
                              Map<String, Object> details) {
        return new ApiError(Instant.now(), status, code, message, traceId, details);
    }
}
