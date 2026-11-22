package com.investfacil.api;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.security.servlet.UserDetailsServiceAutoConfiguration;

/**
 * Backend principal do Invest Fácil — monólito modular.
 * <p>
 * Módulos (fronteira = pacote; comunicação entre módulos somente por
 * interfaces de serviço, nunca pelo repository de outro domínio):
 * <ul>
 *   <li>{@code common}      — envelope de erros, validação, utilitários</li>
 *   <li>{@code auth}        — cadastro, login, refresh, verificação de e-mail, reset</li>
 *   <li>{@code users}       — perfil e papéis (USER/ADMIN)</li>
 *   <li>{@code content}     — categorias, módulos, aulas, artigos</li>
 *   <li>{@code videos}      — metadados e fluxo de upload/leitura assinada (Supabase Storage)</li>
 *   <li>{@code progress}    — progresso do usuário, quizzes</li>
 *   <li>{@code gamification}— XP, níveis, conquistas</li>
 *   <li>{@code market}      — cotações BTC/ETH (REST + cache; informativo)</li>
 * </ul>
 * Segurança do PostgreSQL: schema {@code investfacil}, papéis
 * {@code investfacil_migrate} (DDL) e {@code investfacil_app} (DML),
 * RLS negada por padrão — ver {@code db/migration/V2__postgres_security.sql}.
 */
@SpringBootApplication(exclude = UserDetailsServiceAutoConfiguration.class)
public class InvestFacilApplication {

    public static void main(String[] args) {
        SpringApplication.run(InvestFacilApplication.class, args);
    }
}
