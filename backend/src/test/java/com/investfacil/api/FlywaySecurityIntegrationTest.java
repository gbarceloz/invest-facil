package com.investfacil.api;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.jdbc.core.JdbcTemplate;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import javax.sql.DataSource;
import java.security.SecureRandom;
import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.Base64;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

/**
 * Teste de integração T1 contra PostgreSQL REAL (Testcontainers — nunca H2):
 * 1. Flyway aplica V1-V7 (schema, papéis, privilégios, RLS) em banco limpo.
 * 2. Papel investfacil_app lê/escreve (DML) e NÃO pode executar DDL.
 * 3. Papel investfacil_test_guest recebe GRANT SELECT de propósito e, mesmo
 *    assim, enxerga ZERO linhas — provando que a negação vem da RLS
 *    (deny-by-default) e não da falta de privilégio.
 *
 * Requer Docker. Sem Docker, o teste é pulado e a omissão é registrada
 * como limitação (nunca substituído por um falso sucesso).
 */
@SpringBootTest
@Testcontainers(disabledWithoutDocker = true)
class FlywaySecurityIntegrationTest {

    static {
        // JwtService exige um segredo; testes usam um valor efêmero, nunca versionado.
        byte[] secret = new byte[48];
        new SecureRandom().nextBytes(secret);
        System.setProperty("JWT_SECRET", Base64.getEncoder().encodeToString(secret));
    }

    @Container
    @ServiceConnection
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:17-alpine");

    @Autowired
    DataSource dataSource;

    @Test
    void flywayAplicaV1aV8EmBancoLimpo() {
        JdbcTemplate jdbc = new JdbcTemplate(dataSource);
        Integer migracoesOk = jdbc.queryForObject(
                "SELECT count(*) FROM investfacil.flyway_schema_history WHERE success = true AND type = 'SQL'",
                Integer.class);
        assertEquals(11, migracoesOk, "V1-V11 devem ser aplicadas");

        Integer tabelas = jdbc.queryForObject(
                "SELECT count(*) FROM information_schema.tables WHERE table_schema = 'investfacil'",
                Integer.class);
        assertTrue(tabelas != null && tabelas >= 23, "Schema inicial completo");

        Integer tabelasV8 = jdbc.queryForObject("""
                SELECT count(*) FROM information_schema.tables
                 WHERE table_schema = 'investfacil'
                   AND table_name IN ('user_streak_days', 'user_quiz_lives',
                                      'quiz_lives_ledger', 'lesson_video_progress',
                                      'quiz_submissions')
                """, Integer.class);
        assertEquals(5, tabelasV8, "V8 deve criar as 5 tabelas do Módulo 01");

        Integer policiesV8 = jdbc.queryForObject("""
                SELECT count(*) FROM pg_policies
                 WHERE schemaname = 'investfacil' AND policyname LIKE 'v8_%'
                """, Integer.class);
        assertEquals(18, policiesV8, "V8 deve criar policies próprias (prefixo v8_)");

        for (String table : java.util.List.of("user_streak_days", "user_quiz_lives",
                "quiz_lives_ledger", "lesson_video_progress", "quiz_submissions")) {
            Boolean granted = jdbc.queryForObject(
                    "SELECT has_table_privilege('investfacil_app', ?, 'SELECT')",
                    Boolean.class, "investfacil." + table);
            assertTrue(Boolean.TRUE.equals(granted),
                    "investfacil_app deve ler " + table);
        }
    }

    @Test
    void investfacilAppEscreveELe() throws SQLException {
        String email = "t1-" + UUID.randomUUID() + "@investfacil.test";
        try (Connection conn = dataSource.getConnection()) {
            conn.setAutoCommit(false);
            try (Statement st = conn.createStatement()) {
                st.execute("SET ROLE investfacil_app");
                st.execute("SELECT set_config('app.auth_email', '" + email + "', true)");
                st.execute("SELECT set_config('app.flow', 'REGISTER', true)");
                st.execute("INSERT INTO investfacil.users (email, name, password_hash) VALUES ('"
                        + email + "', 'Teste T1', 'hash-bcrypt-de-teste')");
                ResultSet rs = st.executeQuery("SELECT count(*) FROM investfacil.users");
                rs.next();
                assertTrue(rs.getInt(1) >= 1, "Papel de app deve ler e escrever");
                st.execute("ROLLBACK");
            }
        }
    }

    @Test
    void investfacilAppNaoPodeExecutarDDL() {
        try (Connection conn = dataSource.getConnection();
             Statement st = conn.createStatement()) {
            st.execute("SET ROLE investfacil_app");
            SQLException falhou = assertThrows(SQLException.class,
                    () -> st.execute("CREATE TABLE investfacil.nao_deve_existir (id int)"),
                    "investfacil_app não deve poder executar DDL");
            assertTrue(falhou.getMessage() != null && !falhou.getMessage().isBlank());
            st.execute("RESET ROLE");
        } catch (SQLException e) {
            throw new IllegalStateException(e);
        }
    }

    @Test
    void appNaoPodeAlterarLedgersDeAuditoriaOuXp() {
        try (Connection conn = dataSource.getConnection();
             Statement st = conn.createStatement()) {
            st.execute("SET ROLE investfacil_app");
            assertThrows(SQLException.class,
                    () -> st.execute("UPDATE investfacil.auth_event SET event_type = 'X'"),
                    "auth_event deve ser append-only para o runtime");
            assertThrows(SQLException.class,
                    () -> st.execute("UPDATE investfacil.xp_ledger SET amount = 0"),
                    "xp_ledger deve ser append-only para o runtime");
            st.execute("RESET ROLE");
        } catch (SQLException e) {
            throw new IllegalStateException(e);
        }
    }

    @Test
    void guestComGrantSelectVeZeroLinhasPorCausaDaRLS() {
        try (Connection conn = dataSource.getConnection();
             Statement st = conn.createStatement()) {
            st.execute("SET ROLE investfacil_test_guest");
            ResultSet rs = st.executeQuery("SELECT count(*) FROM investfacil.users");
            rs.next();
            assertEquals(0, rs.getInt(1),
                    "RLS deny-by-default: papel sem policy enxerga 0 linhas");
            st.execute("RESET ROLE");
        } catch (SQLException e) {
            throw new IllegalStateException(e);
        }
    }
}
