package com.investfacil.api.common.security;

import java.util.UUID;

/** Principal autenticado, carregado do banco a cada requisição (nunca só do JWT). */
public record CurrentUser(UUID id, String email, String name, String role) {
}
