package com.investfacil.api.security;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.investfacil.api.common.context.UserContext;
import com.investfacil.api.common.security.DatabaseSecurityGuard;
import com.investfacil.api.common.security.TokenHasher;
import com.investfacil.api.common.security.TotpService;
import com.investfacil.api.seed.DemoDataInitializer;
import com.investfacil.api.users.UserService;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.DefaultApplicationArguments;
import org.springframework.dao.DataAccessException;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.datasource.DriverManagerDataSource;
import org.springframework.mock.env.MockEnvironment;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.TransactionDefinition;
import org.springframework.transaction.support.TransactionTemplate;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import jakarta.servlet.http.Cookie;

import javax.sql.DataSource;
import java.security.SecureRandom;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.time.Instant;
import java.util.Base64;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.Callable;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import java.util.concurrent.TimeUnit;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * S2.4 — prova de RLS com PostgreSQL real e com a aplicação conectada pelo
 * role runtime (não pelo superuser do Testcontainers).
 *
 * <p>O Flyway aplica V1-V7 como o usuário administrativo do container; a
 * aplicação usa {@code investfacil_runtime}, membro de
 * {@code investfacil_app}. O contexto é transportado pelo backend via
 * {@code set_config(..., true)}. Os testes diretos abrem uma transação e
 * definem o contexto manualmente para provar as policies sem depender do
 * código de serviço.</p>
 */
@SpringBootTest
@AutoConfigureMockMvc
@Testcontainers(disabledWithoutDocker = true)
class RlsIsolationIntegrationTest {

    private static final String JWT_SECRET;
    private static final String RUNTIME_PASSWORD = UUID.randomUUID().toString().replace("-", "");
    private static final String MIGRATE_PASSWORD = UUID.randomUUID().toString().replace("-", "");
    private static JdbcTemplate adminJdbc;
    private static DataSource adminDataSource;

    static {
        byte[] secret = new byte[48];
        new SecureRandom().nextBytes(secret);
        JWT_SECRET = Base64.getEncoder().encodeToString(secret);
    }

    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:17-alpine");

    @DynamicPropertySource
    static void properties(DynamicPropertyRegistry registry) {
        provisionRoles();
        registry.add("spring.datasource.url", postgres::getJdbcUrl);
        registry.add("spring.datasource.username", () -> "investfacil_runtime");
        registry.add("spring.datasource.password", () -> RUNTIME_PASSWORD);
        registry.add("spring.flyway.url", postgres::getJdbcUrl);
        registry.add("spring.flyway.user", () -> "investfacil_migrate");
        registry.add("spring.flyway.password", () -> MIGRATE_PASSWORD);

        registry.add("spring.datasource.hikari.maximum-pool-size", () -> "2");
        registry.add("spring.datasource.hikari.minimum-idle", () -> "1");

        registry.add("app.jwt.secret", () -> JWT_SECRET);
        registry.add("app.auth.expose-dev-tokens", () -> "true");
        registry.add("app.auth.cookie-secure", () -> "false");
        registry.add("app.rate-limit.enabled", () -> "false");
        registry.add("app.seed.content", () -> "true");
        registry.add("app.demo.enabled", () -> "true");
        registry.add("app.demo.email", () -> "demo-s24@example.com");
        registry.add("app.demo.password", () -> "Demo@1234");
        registry.add("app.market.enabled", () -> "false");
        registry.add("app.bitcoin.enabled", () -> "false");
    }

    @Autowired
    MockMvc mvc;

    @Autowired
    ObjectMapper mapper;

    @Autowired
    DataSource dataSource;

    @Autowired
    UserService userService;

    @Autowired
    UserContext userContext;

    @Autowired
    PasswordEncoder passwordEncoder;

    @Autowired
    TotpService totp;

    @Autowired
    DatabaseSecurityGuard securityGuard;

    @Autowired
    DemoDataInitializer demoInitializer;

    @Autowired
    PlatformTransactionManager transactionManager;

    @BeforeEach
    void setUpAdminJdbc() {
        DriverManagerDataSource admin = new DriverManagerDataSource(
                postgres.getJdbcUrl(), postgres.getUsername(), postgres.getPassword());
        adminDataSource = admin;
        adminJdbc = new JdbcTemplate(admin);
    }

    private static void provisionRoles() {
        try (Connection connection = DriverManager.getConnection(
                postgres.getJdbcUrl(), postgres.getUsername(), postgres.getPassword());
             Statement statement = connection.createStatement()) {
            statement.execute("CREATE ROLE investfacil_app NOLOGIN");
            statement.execute("CREATE ROLE investfacil_runtime LOGIN PASSWORD '"
                    + RUNTIME_PASSWORD + "' INHERIT");
            statement.execute("GRANT investfacil_app TO investfacil_runtime");
            statement.execute("CREATE ROLE investfacil_migrate LOGIN PASSWORD '"
                    + MIGRATE_PASSWORD + "'");
            statement.execute("CREATE ROLE investfacil_test_guest NOLOGIN");
            statement.execute("CREATE ROLE anon NOLOGIN");
            statement.execute("CREATE ROLE authenticated NOLOGIN");
            statement.execute("GRANT CREATE ON DATABASE " + postgres.getDatabaseName()
                    + " TO investfacil_migrate");
        } catch (SQLException ex) {
            throw new IllegalStateException("Falha ao provisionar os roles do teste.", ex);
        }
    }

    @AfterEach
    void clearContext() {
        userContext.clear();
    }

    @Test
    void seedContentAndAnonymousAccessRemainAvailable() throws Exception {
        // Sem contexto, conteúdo global é legível e dados privados são negados.
        assertEquals(8, count("select count(*) from investfacil.categories"));
        assertEquals(13, count("select count(*) from investfacil.modules"));
        assertEquals(39, count("select count(*) from investfacil.lessons"));
        assertEquals(86, count("select count(*) from investfacil.quiz_questions"));
        assertEquals(6, count("select count(*) from investfacil.articles"));
        assertEquals(7, count("select count(*) from investfacil.achievements"));

        // DemoDataInitializer roda com contexto seed e é idempotente.
        Integer demoProgress = adminJdbc.queryForObject("""
                select count(*) from investfacil.user_progress p
                 join investfacil.users u on u.id = p.user_id
                 where u.email = 'demo-s24@example.com'
                """, Integer.class);
        assertEquals(4, demoProgress);
        demoInitializer.run(new DefaultApplicationArguments(new String[0]));
        Integer demoProgressAfter = adminJdbc.queryForObject("""
                select count(*) from investfacil.user_progress p
                 join investfacil.users u on u.id = p.user_id
                 where u.email = 'demo-s24@example.com'
                """, Integer.class);
        assertEquals(4, demoProgressAfter);

        mvc.perform(get("/api/v1/content/categories"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(8));
        mvc.perform(get("/actuator/health"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("UP"));
        mvc.perform(get("/api/v1/users/me"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void registrationLoginProgressQuizAndRefreshWorkWithRls() throws Exception {
        TestUser user = register("journey");

        mvc.perform(get("/api/v1/users/me").header("Authorization", bearer(user)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value(user.email()));

        mvc.perform(patch("/api/v1/users/me")
                        .header("Authorization", bearer(user))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"Nome RLS Atualizado\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Nome RLS Atualizado"));

        mvc.perform(post("/api/v1/auth/forgot-password")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"" + user.email() + "\"}"))
                .andExpect(status().isOk());
        mvc.perform(post("/api/v1/auth/resend-verification")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"" + user.email() + "\"}"))
                .andExpect(status().isOk());

        UUID lessonId = lessonId("por-que-educacao-financeira");
        mvc.perform(post("/api/v1/progress/lessons/" + lessonId)
                        .header("Authorization", bearer(user)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.code").value("LESSON_NOT_READY"));

        mvc.perform(post("/api/v1/progress/lessons/" + lessonId + "/video")
                        .header("Authorization", bearer(user))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"watched\":true,\"positionSeconds\":120,\"durationSeconds\":120}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.watched").value(true));

        mvc.perform(get("/api/v1/progress/lessons/" + lessonId)
                        .header("Authorization", bearer(user)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.videoWatched").value(true))
                .andExpect(jsonPath("$.completed").value(false));

        MvcResult quiz = mvc.perform(get("/api/v1/progress/lessons/" + lessonId + "/quiz")
                        .header("Authorization", bearer(user)))
                .andExpect(status().isOk())
                .andReturn();
        JsonNode questions = json(quiz).get("questions");
        String answers = "{\"answers\":["
                + "{\"questionId\":\"" + questions.get(0).get("id").asText() + "\",\"selectedIndex\":1},"
                + "{\"questionId\":\"" + questions.get(1).get("id").asText() + "\",\"selectedIndex\":0}"
                + "]}";
        mvc.perform(post("/api/v1/progress/lessons/" + lessonId + "/quiz")
                        .header("Authorization", bearer(user))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(answers))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.percent").value(100))
                .andExpect(jsonPath("$.lessonCompleted").value(true));

        mvc.perform(post("/api/v1/progress/lessons/" + lessonId)
                        .header("Authorization", bearer(user)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.alreadyCompleted").value(true));

        mvc.perform(post("/api/v1/simulator/scenarios")
                        .header("Authorization", bearer(user))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"name":"Plano RLS",
                                 "scenario":{"initialAmount":1000,"monthlyContribution":100,
                                 "months":12,"annualRate":8,"inflationRate":4}}
                                """))
                .andExpect(status().isCreated());

        MvcResult refreshed = mvc.perform(post("/api/v1/auth/refresh")
                        .header("X-Refresh-Token", user.refresh())
                        .header("X-Requested-With", "XMLHttpRequest"))
                .andExpect(status().isOk())
                .andReturn();
        assertNotNull(json(refreshed).get("refreshToken").asText());

        // Falha de login sem usuário grava auth_event com user_id NULL.
        mvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"unknown-" + UUID.randomUUID()
                                + "@example.com\",\"password\":\"Teste@123\"}"))
                .andExpect(status().isUnauthorized());
        assertTrue(adminJdbc.queryForObject(
                "select count(*) from investfacil.auth_event where user_id is null",
                Integer.class) >= 1);
    }

    @Test
    void passwordResetAndLogoutWorkWithRls() throws Exception {
        TestUser user = register("reset-logout");
        String rawReset = "reset-" + UUID.randomUUID();
        adminJdbc.update("insert into investfacil.email_tokens"
                        + " (user_id, type, token_hash, expires_at)"
                        + " values (?, 'PASSWORD_RESET', ?, now() + interval '1 hour')",
                user.id(), TokenHasher.sha256Hex(rawReset));

        mvc.perform(post("/api/v1/auth/reset-password")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"token\":\"" + rawReset
                                + "\",\"password\":\"NovaSenha123\"}"))
                .andExpect(status().isOk());

        TestUser relogged = login(user.email(), "NovaSenha123");
        mvc.perform(post("/api/v1/auth/logout")
                        .cookie(new Cookie("if_refresh", relogged.refresh()))
                        .header("X-Requested-With", "XMLHttpRequest"))
                .andExpect(status().isNoContent());
        mvc.perform(post("/api/v1/auth/refresh")
                        .header("X-Refresh-Token", relogged.refresh())
                        .header("X-Requested-With", "XMLHttpRequest"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void userACannotReadOrDeleteUserBDataThroughHttp() throws Exception {
        TestUser a = register("ab-a");
        TestUser b = register("ab-b");
        UUID lessonId = lessonId("por-que-educacao-financeira");

        completeLessonViaVideoAndQuiz(b, lessonId);

        MvcResult saved = mvc.perform(post("/api/v1/simulator/scenarios")
                        .header("Authorization", bearer(b))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"name":"Cenário de B",
                                 "scenario":{"initialAmount":1000,"monthlyContribution":100,
                                 "months":12,"annualRate":8,"inflationRate":4}}
                                """))
                .andExpect(status().isCreated())
                .andReturn();
        UUID scenarioId = UUID.fromString(json(saved).get("id").asText());

        mvc.perform(get("/api/v1/progress/lessons/" + lessonId)
                        .header("Authorization", bearer(a)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.completed").value(false));

        mvc.perform(delete("/api/v1/simulator/scenarios/" + scenarioId)
                        .header("Authorization", bearer(a)))
                .andExpect(status().isNotFound());

        assertTrue(countAsUser(b.id(), "select count(*) from investfacil.simulations") >= 1);
        assertEquals(0, countAsUser(a.id(), "select count(*) from investfacil.simulations"));
    }

    @Test
    void databasePoliciesBlockCrossUserWritesAndIdentityEscalation() throws Exception {
        TestUser a = register("db-a");
        TestUser b = register("db-b");
        UUID lessonId = lessonId("por-que-educacao-financeira");

        completeLessonViaVideoAndQuiz(b, lessonId);
        mvc.perform(post("/api/v1/simulator/scenarios")
                        .header("Authorization", bearer(b))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"name":"Cenário B2",
                                 "scenario":{"initialAmount":1000,"monthlyContribution":100,
                                 "months":12,"annualRate":8,"inflationRate":4}}
                                """))
                .andExpect(status().isCreated());

        // Leitura: A não vê linhas de B.
        assertEquals(0, countAsUser(a.id(), "select count(*) from investfacil.user_progress"));
        assertTrue(countAsUser(b.id(), "select count(*) from investfacil.user_progress") >= 1);
        assertEquals(0, countAsUser(a.id(), "select count(*) from investfacil.quiz_attempts"));
        assertEquals(0, countAsUser(a.id(), "select count(*) from investfacil.quiz_attempt_answers"));
        assertTrue(countAsUser(b.id(), "select count(*) from investfacil.quiz_attempt_answers") >= 1);
        assertEquals(0, countAsUser(a.id(), "select count(*) from investfacil.xp_ledger"));
        assertTrue(countAsUser(b.id(), "select count(*) from investfacil.xp_ledger") >= 1);
        assertEquals(0, countAsUser(a.id(), "select count(*) from investfacil.user_achievements"));
        assertTrue(countAsUser(b.id(), "select count(*) from investfacil.user_achievements") >= 1);
        assertEquals(0, countAsUser(a.id(),
                "select count(*) from investfacil.refresh_tokens where user_id = '" + b.id() + "'"));
        assertTrue(countAsUser(a.id(), "select count(*) from investfacil.refresh_tokens") >= 1);
        assertTrue(countAsUser(b.id(), "select count(*) from investfacil.refresh_tokens") >= 1);
        assertEquals(0, countAsUser(a.id(),
                "select count(*) from investfacil.email_tokens where user_id = '" + b.id() + "'"));
        assertEquals(0, countAsUser(a.id(),
                "select count(*) from investfacil.users where id = '" + b.id() + "'"));
        assertEquals(1, countAsUser(a.id(),
                "select count(*) from investfacil.users where id = '" + a.id() + "'"));

        // INSERT cross-user é bloqueado pelo WITH CHECK.
        assertThrows(SQLException.class, () -> updateAsUser(a.id(),
                "insert into investfacil.user_progress (user_id, lesson_id) values ('"
                        + b.id() + "','" + lessonId + "')"));
        assertThrows(SQLException.class, () -> updateAsUser(a.id(),
                "insert into investfacil.users (email, name, password_hash)"
                        + " values ('intruder@example.com','Intruder','x')"));

        // UPDATE/DELETE cross-user e operações não concedidas são bloqueados.
        assertEquals(0, updateAsUser(a.id(),
                "delete from investfacil.simulations where user_id = '" + b.id() + "'"));
        assertEquals(0, updateAsUser(a.id(),
                "update investfacil.users set name = 'HACKED' where id = '" + b.id() + "'"));
        assertFalse("HACKED".equals(adminJdbc.queryForObject(
                "select name from investfacil.users where id = ?", String.class, b.id())));
        assertThrows(SQLException.class, () -> updateAsUser(a.id(),
                "update investfacil.user_progress set completed = false"));
        assertThrows(SQLException.class, () -> updateAsUser(a.id(),
                "update investfacil.xp_ledger set amount = 0"));
        assertThrows(SQLException.class, () -> updateAsUser(a.id(),
                "update investfacil.simulations set name = 'X'"));
        assertThrows(SQLException.class, () -> updateAsUser(a.id(),
                "delete from investfacil.users where id = '" + a.id() + "'"));

        // Quiz answer de uma tentativa de B não pode ser inserida por A.
        UUID bAttempt = adminJdbc.queryForObject(
                "select id from investfacil.quiz_attempts where user_id = ?",
                UUID.class, b.id());
        UUID bQuestion = adminJdbc.queryForObject(
                "select question_id from investfacil.quiz_attempt_answers where attempt_id = ? limit 1",
                UUID.class, bAttempt);
        assertThrows(SQLException.class, () -> updateAsUser(a.id(),
                "insert into investfacil.quiz_attempt_answers"
                        + " (attempt_id, question_id, selected_index, correct)"
                        + " values ('" + bAttempt + "','" + bQuestion + "',0,true)"));

        // Escalada de role/id é bloqueada pelo trigger de users, inclusive com
        // GUC de ADMIN forjado (o trigger não confia no contexto da aplicação).
        assertThrows(SQLException.class, () -> updateAsUser(a.id(),
                "update investfacil.users set role = 'ADMIN' where id = '" + a.id() + "'"));
        assertThrows(SQLException.class, () -> updateAsAdmin(a.id(),
                "update investfacil.users set role = 'ADMIN' where id = '" + a.id() + "'"));
        assertThrows(SQLException.class, () -> updateAsUser(a.id(),
                "update investfacil.users set id = '" + UUID.randomUUID() + "' where id = '" + a.id() + "'"));
        assertThrows(SQLException.class, () -> updateAsUser(a.id(),
                "update investfacil.users set email = 'outro@example.com' where id = '" + a.id() + "'"));

        // Ownership de token também não pode ser transferido.
        assertThrows(SQLException.class, () -> updateAsUser(a.id(),
                "update investfacil.refresh_tokens set user_id = '" + b.id()
                        + "' where user_id = '" + a.id() + "'"));
        assertThrows(SQLException.class, () -> updateAsUser(a.id(),
                "update investfacil.email_tokens set user_id = '" + b.id()
                        + "' where user_id = '" + a.id() + "'"));

        // Contexto inválido deve falhar fechado, não liberar acesso.
        assertThrows(SQLException.class, () -> withContextQuery(
                "select set_config('app.current_user_id', 'not-a-uuid', true)",
                "select count(*) from investfacil.users",
                rs -> {
                    rs.next();
                    return rs.getInt(1);
                }));

        // Auditoria e tabela órfã não são legíveis pelo runtime.
        assertThrows(SQLException.class,
                () -> countAsUser(a.id(), "select count(*) from investfacil.auth_event"));
        assertThrows(SQLException.class,
                () -> countAsUser(a.id(), "select count(*) from investfacil.lesson_articles"));
    }

    @Test
    void adminAndSeedPoliciesAreExplicit() throws Exception {
        TestUser user = register("admin-policy-user");
        List<UUID> lessons = jdbc().query(
                "select id from investfacil.lessons order by slug limit 3",
                (rs, row) -> rs.getObject(1, UUID.class));
        assertTrue(lessons.size() >= 3);
        adminJdbc.update("insert into investfacil.video_assets"
                        + " (lesson_id, storage_path, status, mime)"
                        + " values (?, ?, 'PENDING', 'video/mp4')",
                lessons.get(0), "videos/rls-pending.mp4");
        adminJdbc.update("insert into investfacil.video_assets"
                        + " (lesson_id, storage_path, status, mime)"
                        + " values (?, ?, 'PUBLISHED', 'video/mp4')",
                lessons.get(1), "videos/rls-published.mp4");

        assertEquals(1, countAsUser(user.id(), "select count(*) from investfacil.video_assets"));
        assertEquals(2, countAsAdmin(user.id(), "select count(*) from investfacil.video_assets"));
        assertThrows(SQLException.class, () -> updateAsUser(user.id(),
                "insert into investfacil.video_assets (lesson_id, storage_path, status)"
                        + " values ('" + lessons.get(2) + "','videos/user.mp4','PENDING')"));

        // Seed escreve conteúdo em transação explícita; usuário comum não.
        assertEquals(1, updateAsSeed(
                "insert into investfacil.categories (slug, name) values ('rls-seed', 'RLS Seed')"));
        assertThrows(SQLException.class, () -> updateAsUser(user.id(),
                "insert into investfacil.categories (slug, name) values ('rls-user', 'RLS User')"));

        // ADMIN da aplicação é criado fora do runtime (simulando provisionamento)
        // e continua sujeito à autorização do backend.
        String adminEmail = "admin-" + UUID.randomUUID() + "@example.com";
        adminJdbc.update("insert into investfacil.users"
                        + " (id, email, name, password_hash, role, verified)"
                        + " values (?, ?, 'Admin RLS', ?, 'ADMIN', true)",
                UUID.randomUUID(), adminEmail, passwordEncoder.encode("Admin@123"));
        TestUser admin = login(adminEmail, "Admin@123");

        mvc.perform(get("/api/v1/admin/videos").header("Authorization", bearer(admin)))
                .andExpect(status().isOk());
        mvc.perform(get("/api/v1/admin/videos").header("Authorization", bearer(user)))
                .andExpect(status().isForbidden());
    }

    @Test
    void contextIsClearedAndDoesNotLeakBetweenTransactionsOrThreads() throws Exception {
        TestUser a = register("ctx-a");
        TestUser b = register("ctx-b");

        assertNull(userContext.currentUserId(), "filtro deve limpar o ThreadLocal");

        userContext.setUser(a.id(), "USER");
        assertTrue(userService.findById(a.id()).isPresent());
        userContext.setUser(b.id(), "USER");
        assertTrue(userService.findById(b.id()).isPresent());
        userContext.clear();
        assertTrue(userService.findById(a.id()).isEmpty(),
                "sem contexto, users não deve expor linhas");

        // set_config local: depois do commit, a mesma conexão não conserva o valor.
        try (Connection connection = dataSource.getConnection()) {
            connection.setAutoCommit(false);
            try (Statement statement = connection.createStatement()) {
                statement.execute("select set_config('app.current_user_id', '"
                        + a.id() + "', true)");
                connection.commit();
                try (ResultSet rs = statement.executeQuery(
                        "select coalesce(current_setting('app.current_user_id', true), '')")) {
                    rs.next();
                    assertEquals("", rs.getString(1));
                }
            } finally {
                connection.rollback();
            }
        }

        // Duas threads com contextos distintos não compartilham identidade.
        ExecutorService executor = Executors.newFixedThreadPool(2);
        CountDownLatch start = new CountDownLatch(1);
        try {
            Callable<Boolean> taskA = () -> findWithContext(start, a.id());
            Callable<Boolean> taskB = () -> findWithContext(start, b.id());
            Future<Boolean> resultA = executor.submit(taskA);
            Future<Boolean> resultB = executor.submit(taskB);
            start.countDown();
            assertTrue(resultA.get(20, TimeUnit.SECONDS));
            assertTrue(resultB.get(20, TimeUnit.SECONDS));
        } finally {
            executor.shutdownNow();
        }
    }

    @Test
    void transactionContextSwitchNestedTransactionAndRollbackAreSafe() throws Exception {
        TestUser a = register("tx-a");
        TestUser b = register("tx-b");

        TransactionTemplate outer = new TransactionTemplate(transactionManager);
        outer.executeWithoutResult(status -> {
            userContext.setUser(a.id(), "USER");
            userContext.applyToCurrentTransaction();
            assertTrue(userService.findById(a.id()).isPresent());

            userContext.setUser(b.id(), "USER");
            userContext.applyToCurrentTransaction();
            assertTrue(userService.findById(b.id()).isPresent());
        });

        TransactionTemplate inner = new TransactionTemplate(transactionManager);
        inner.setPropagationBehavior(TransactionDefinition.PROPAGATION_REQUIRES_NEW);
        userContext.setUser(a.id(), "USER");
        outer.executeWithoutResult(status -> {
            assertTrue(userService.findById(a.id()).isPresent());
            inner.executeWithoutResult(innerStatus ->
                    assertTrue(userService.findById(a.id()).isPresent()));
        });
        userContext.clear();

        assertThrows(IllegalStateException.class, () ->
                outer.executeWithoutResult(status -> {
                    userContext.setUser(a.id(), "USER");
                    userService.findById(a.id());
                    throw new IllegalStateException("rollback de teste");
                }));
        userContext.clear();

        // A conexão única do pool não conserva app.current_user_id após rollback.
        try (Connection connection = dataSource.getConnection();
             Statement statement = connection.createStatement();
             ResultSet rs = statement.executeQuery(
                     "select coalesce(current_setting('app.current_user_id', true), '')")) {
            rs.next();
            assertEquals("", rs.getString(1));
        }
    }

    @Test
    void mfaSetupChallengeAndVerifyWorkWithRls() throws Exception {
        TestUser user = register("mfa-rls");
        MvcResult setup = mvc.perform(post("/api/v1/auth/mfa/setup")
                        .header("Authorization", bearer(user))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"password\":\"Teste@123\"}"))
                .andExpect(status().isOk())
                .andReturn();
        String secret = json(setup).get("secret").asText();

        mvc.perform(post("/api/v1/auth/mfa/enable")
                        .header("Authorization", bearer(user))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"code\":\"" + totp.code(secret, Instant.now()) + "\"}"))
                .andExpect(status().isOk());

        MvcResult challenge = mvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"" + user.email()
                                + "\",\"password\":\"Teste@123\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.mfaRequired").value(true))
                .andReturn();
        String challengeToken = json(challenge).get("challengeToken").asText();

        MvcResult verified = mvc.perform(post("/api/v1/auth/mfa/verify")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"challengeToken\":\"" + challengeToken
                                + "\",\"code\":\""
                                + totp.code(secret, Instant.now().plusSeconds(30)) + "\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken").isNotEmpty())
                .andReturn();
        String access = json(verified).get("accessToken").asText();
        mvc.perform(get("/api/v1/users/me").header("Authorization", "Bearer " + access))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.mfaEnabled").value(true));
    }

    @Test
    void runtimeHasMinimumPrivilegesAndCannotAssumeMigrationRole() throws Exception {
        assertFalse(adminJdbc.queryForObject(
                "select rolsuper from pg_roles where rolname = 'investfacil_runtime'", Boolean.class));
        assertFalse(adminJdbc.queryForObject(
                "select rolcreatedb from pg_roles where rolname = 'investfacil_runtime'", Boolean.class));
        assertFalse(adminJdbc.queryForObject(
                "select rolcreaterole from pg_roles where rolname = 'investfacil_runtime'", Boolean.class));
        assertFalse(adminJdbc.queryForObject(
                "select rolbypassrls from pg_roles where rolname = 'investfacil_runtime'", Boolean.class));

        assertEquals(Boolean.FALSE, adminJdbc.queryForObject(
                "select pg_has_role('investfacil_runtime', 'investfacil_migrate', 'MEMBER')",
                Boolean.class));
        assertEquals(Boolean.FALSE, adminJdbc.queryForObject(
                "select has_schema_privilege('investfacil_runtime', 'investfacil', 'CREATE')",
                Boolean.class));
        assertEquals(Boolean.FALSE, adminJdbc.queryForObject(
                "select has_table_privilege('investfacil_runtime', 'investfacil.users', 'DELETE')",
                Boolean.class));
        assertEquals(Boolean.FALSE, adminJdbc.queryForObject(
                "select has_table_privilege('investfacil_runtime', 'investfacil.auth_event', 'SELECT')",
                Boolean.class));
        assertEquals(Boolean.FALSE, adminJdbc.queryForObject(
                "select has_table_privilege('investfacil_runtime', 'investfacil.user_progress', 'UPDATE')",
                Boolean.class));
        assertEquals(Boolean.FALSE, adminJdbc.queryForObject(
                "select has_table_privilege('investfacil_runtime', 'investfacil.video_assets', 'DELETE')",
                Boolean.class));
        assertEquals(0, adminJdbc.queryForObject(
                "select count(*) from pg_proc"
                        + " where oid = to_regprocedure("
                        + " 'investfacil.apply_table_security()')::regprocedure",
                Integer.class));
        assertEquals(0, adminJdbc.queryForObject(
                "select count(*) from pg_tables where schemaname = 'investfacil'"
                        + " and tableowner = 'investfacil_runtime'", Integer.class));
        assertEquals(23, adminJdbc.queryForObject(
                "select count(*) from pg_tables where schemaname = 'investfacil'"
                        + " and tableowner = 'investfacil_migrate'"
                        + " and tablename <> 'flyway_schema_history'", Integer.class));
        assertEquals(23, adminJdbc.queryForObject(
                "select count(*) from pg_class c join pg_namespace n on n.oid = c.relnamespace"
                        + " where n.nspname = 'investfacil' and c.relkind = 'r'"
                        + " and c.relrowsecurity and c.relforcerowsecurity"
                        + " and c.relname <> 'flyway_schema_history'", Integer.class));
        assertEquals(0, adminJdbc.queryForObject(
                "select count(*) from pg_policies where schemaname = 'investfacil'"
                        + " and policyname = 'app_rw'", Integer.class));

        // O guard passa para o runtime real e falha para um role privilegiado
        // quando o profile de produção o torna estrito.
        assertDoesNotThrow(securityGuard::verify);
        MockEnvironment prod = new MockEnvironment();
        prod.setActiveProfiles("prod");
        DatabaseSecurityGuard strict = new DatabaseSecurityGuard(adminDataSource, prod);
        IllegalStateException guardFailure = assertThrows(
                IllegalStateException.class, strict::verify);
        assertTrue(guardFailure.getMessage().contains("superuser"));

        assertThrows(SQLException.class, () -> updateAsUser(UUID.randomUUID(),
                "create table investfacil.runtime_must_not_create (id int)"));
        assertThrows(SQLException.class, () -> updateAsUser(UUID.randomUUID(),
                "set role investfacil_migrate"));
    }

    @Test
    void v7FunctionsHaveFixedSearchPathAndLeastPrivilege() {
        List<String> functions = List.of(
                "investfacil.current_user_id()",
                "investfacil.current_role_name()",
                "investfacil.auth_email()",
                "investfacil.auth_refresh_hash()",
                "investfacil.auth_email_token_hash()",
                "investfacil.is_seed()",
                "investfacil.is_admin()",
                "investfacil.is_trusted_db_role()",
                "investfacil.s24_users_guard()");

        for (String function : functions) {
            assertEquals(1, adminJdbc.queryForObject(
                            "select count(*) from pg_proc"
                                    + " where oid = to_regprocedure(?)::regprocedure",
                            Integer.class, function),
                    "função ausente: " + function);

            String config = adminJdbc.queryForObject(
                    "select coalesce(proconfig::text, '') from pg_proc"
                            + " where oid = to_regprocedure(?)::regprocedure",
                    String.class, function);
            assertTrue(config.contains("search_path="),
                    function + " sem search_path fixo: " + config);

            Integer publicExecute = adminJdbc.queryForObject("""
                    select count(*)
                      from pg_proc p
                      cross join lateral aclexplode(
                          coalesce(p.proacl, acldefault('f', p.proowner))) a
                     where p.oid = to_regprocedure(?)::regprocedure
                       and a.grantee = 0
                       and a.privilege_type = 'EXECUTE'
                    """, Integer.class, function);
            assertEquals(0, publicExecute, "PUBLIC ainda executa " + function);

            assertEquals(Boolean.TRUE, adminJdbc.queryForObject(
                            "select has_function_privilege('investfacil_app', ?, 'EXECUTE')",
                            Boolean.class, function),
                    "investfacil_app deve executar " + function);
            assertEquals(Boolean.TRUE, adminJdbc.queryForObject(
                            "select has_function_privilege('investfacil_migrate', ?, 'EXECUTE')",
                            Boolean.class, function),
                    "investfacil_migrate deve executar " + function);
            assertEquals(Boolean.TRUE, adminJdbc.queryForObject(
                            "select has_function_privilege('investfacil_runtime', ?, 'EXECUTE')",
                            Boolean.class, function),
                    "investfacil_runtime deve executar " + function);
            assertEquals(Boolean.FALSE, adminJdbc.queryForObject(
                            "select has_function_privilege('anon', ?, 'EXECUTE')",
                            Boolean.class, function),
                    "anon não deve executar " + function);
            assertEquals(Boolean.FALSE, adminJdbc.queryForObject(
                            "select has_function_privilege('authenticated', ?, 'EXECUTE')",
                            Boolean.class, function),
                    "authenticated não deve executar " + function);
        }

        assertEquals(0, adminJdbc.queryForObject(
                "select count(*) from pg_proc"
                        + " where oid = to_regprocedure("
                        + " 'investfacil.apply_table_security()')::regprocedure",
                Integer.class), "função legada deve ter sido removida");
        assertEquals(8, adminJdbc.queryForObject(
                "select count(*) from investfacil.flyway_schema_history"
                        + " where success = true and type = 'SQL'", Integer.class));
    }

    @Test
    void legacyFunctionIsRemovedAndCannotRestoreAppRw() {
        assertEquals(0, adminJdbc.queryForObject(
                "select count(*) from pg_proc"
                        + " where oid = to_regprocedure("
                        + " 'investfacil.apply_table_security()')::regprocedure",
                Integer.class), "função legada deve estar ausente");
        assertThrows(DataAccessException.class, () -> adminJdbc.execute(
                "select investfacil.apply_table_security()"));
        assertEquals(0, adminJdbc.queryForObject(
                "select count(*) from pg_policies where schemaname = 'investfacil'"
                        + " and policyname = 'app_rw'", Integer.class));
        assertEquals(68, adminJdbc.queryForObject(
                "select count(*) from pg_policies where schemaname = 'investfacil'"
                        + " and policyname like 's24_%'", Integer.class));
        assertEquals(18, adminJdbc.queryForObject(
                "select count(*) from pg_policies where schemaname = 'investfacil'"
                        + " and policyname like 'v8_%'", Integer.class));
        assertEquals(23, adminJdbc.queryForObject(
                "select count(*) from pg_class c join pg_namespace n on n.oid = c.relnamespace"
                        + " where n.nspname = 'investfacil' and c.relkind = 'r'"
                        + " and c.relrowsecurity and c.relforcerowsecurity"
                        + " and c.relname <> 'flyway_schema_history'", Integer.class));
    }

    @Test
    void v7FixedSearchPathDefeatsSessionShadowing() throws Exception {
        adminJdbc.execute("DROP SCHEMA IF EXISTS s28_shadow CASCADE");
        adminJdbc.execute("CREATE SCHEMA s28_shadow");
        adminJdbc.execute("""
                CREATE VIEW s28_shadow.pg_roles AS
                SELECT 'investfacil_runtime'::name AS rolname,
                       true AS rolsuper
                """);
        adminJdbc.execute("""
                CREATE FUNCTION s28_shadow.current_setting(text, boolean)
                RETURNS text
                LANGUAGE sql
                IMMUTABLE
                AS $$ SELECT '00000000-0000-0000-0000-000000000001'::text $$
                """);

        UUID userId = UUID.randomUUID();
        try (Connection connection = dataSource.getConnection()) {
            connection.setAutoCommit(false);
            try (Statement statement = connection.createStatement()) {
                statement.execute("SET LOCAL search_path = s28_shadow, pg_catalog");
                statement.execute("SELECT set_config('app.current_user_id', '"
                        + userId + "', true)");
                try (ResultSet result = statement.executeQuery(
                        "SELECT investfacil.current_user_id()::text,"
                                + " investfacil.is_trusted_db_role(),"
                                + " investfacil.is_seed()")) {
                    assertTrue(result.next());
                    assertEquals(userId.toString(), result.getString(1));
                    assertFalse(result.getBoolean(2),
                            "pg_roles sintético não pode tornar o runtime confiável");
                    assertFalse(result.getBoolean(3),
                            "current_setting sintético não pode ativar o seed");
                }
            } finally {
                connection.rollback();
            }
        } finally {
            adminJdbc.execute("DROP SCHEMA IF EXISTS s28_shadow CASCADE");
        }
    }

    @Test
    void guardHonorsDeclaredExpectedSchemaVersion() {
        MockEnvironment v7 = new MockEnvironment();
        v7.setActiveProfiles("prod");
        v7.setProperty("app.security.guard.expected-version", "7");
        assertDoesNotThrow(() -> new DatabaseSecurityGuard(dataSource, v7).verify());

        MockEnvironment future = new MockEnvironment();
        future.setActiveProfiles("prod");
        future.setProperty("app.security.guard.expected-version", "99");
        IllegalStateException failure = assertThrows(IllegalStateException.class,
                () -> new DatabaseSecurityGuard(dataSource, future).verify());
        assertTrue(failure.getMessage().contains("newer than the V8"));
    }

    @Test
    void guardAllowsV6BaselineButRequiresV7WhenDeclared() {
        List<String> functions = List.of(
                "investfacil.current_user_id()",
                "investfacil.current_role_name()",
                "investfacil.auth_email()",
                "investfacil.auth_refresh_hash()",
                "investfacil.auth_email_token_hash()",
                "investfacil.is_seed()",
                "investfacil.is_admin()",
                "investfacil.is_trusted_db_role()",
                "investfacil.s24_users_guard()");
        try {
            for (String function : functions) {
                adminJdbc.execute("ALTER FUNCTION " + function + " RESET search_path");
            }
            adminJdbc.execute("""
                    CREATE OR REPLACE FUNCTION investfacil.apply_table_security()
                    RETURNS void
                    LANGUAGE plpgsql
                    AS $$ BEGIN
                        RAISE EXCEPTION 'função legada de teste';
                    END $$
                    """);
            adminJdbc.execute(
                    "REVOKE ALL ON FUNCTION investfacil.apply_table_security() FROM PUBLIC");

            MockEnvironment v6 = new MockEnvironment();
            v6.setActiveProfiles("prod");
            v6.setProperty("app.security.guard.expected-version", "6");
            assertDoesNotThrow(() -> new DatabaseSecurityGuard(dataSource, v6).verify());

            MockEnvironment requiredV7 = new MockEnvironment();
            requiredV7.setActiveProfiles("prod");
            requiredV7.setProperty("app.security.guard.expected-version", "7");
            IllegalStateException failure = assertThrows(IllegalStateException.class,
                    () -> new DatabaseSecurityGuard(dataSource, requiredV7).verify());
            assertTrue(failure.getMessage().contains("V7 is required"));
        } finally {
            adminJdbc.execute(
                    "DROP FUNCTION IF EXISTS investfacil.apply_table_security()");
            for (String function : functions) {
                adminJdbc.execute("ALTER FUNCTION " + function + " SET search_path = ''");
            }
        }
    }

    private void completeLessonViaVideoAndQuiz(TestUser user, UUID lessonId) throws Exception {
        mvc.perform(post("/api/v1/progress/lessons/" + lessonId + "/video")
                        .header("Authorization", bearer(user))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"watched\":true,\"positionSeconds\":120,\"durationSeconds\":120}"))
                .andExpect(status().isOk());
        MvcResult quiz = mvc.perform(get("/api/v1/progress/lessons/" + lessonId + "/quiz")
                        .header("Authorization", bearer(user)))
                .andExpect(status().isOk())
                .andReturn();
        JsonNode questions = json(quiz).get("questions");
        mvc.perform(post("/api/v1/progress/lessons/" + lessonId + "/quiz")
                        .header("Authorization", bearer(user))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"answers\":["
                                + "{\"questionId\":\"" + questions.get(0).get("id").asText()
                                + "\",\"selectedIndex\":1},"
                                + "{\"questionId\":\"" + questions.get(1).get("id").asText()
                                + "\",\"selectedIndex\":0}]}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.lessonCompleted").value(true));
    }

    private TestUser register(String prefix) throws Exception {
        String email = prefix + "-" + UUID.randomUUID() + "@example.com";
        MvcResult registered = mvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"name":"Usuário RLS","email":"%s","password":"Teste@123"}
                                """.formatted(email)))
                .andExpect(status().isCreated())
                .andReturn();
        String verify = json(registered).get("devVerificationToken").asText();
        assertEquals(1, adminJdbc.queryForObject(
                "select count(*) from investfacil.email_tokens where token_hash = ?",
                Integer.class, TokenHasher.sha256Hex(verify)),
                "token de verificação deve existir no banco");
        mvc.perform(post("/api/v1/auth/verify-email")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"token\":\"" + verify + "\"}"))
                .andExpect(status().isOk());
        return login(email, "Teste@123");
    }

    private TestUser login(String email, String password) throws Exception {
        MvcResult result = mvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"" + email + "\",\"password\":\"" + password + "\"}"))
                .andExpect(status().isOk())
                .andReturn();
        JsonNode node = json(result);
        return new TestUser(
                UUID.fromString(node.get("user").get("id").asText()),
                node.get("accessToken").asText(),
                node.get("refreshToken").asText(),
                email);
    }

    private JsonNode json(MvcResult result) throws Exception {
        return mapper.readTree(result.getResponse().getContentAsString());
    }

    private UUID lessonId(String slug) throws Exception {
        MvcResult result = mvc.perform(get("/api/v1/content/lessons/" + slug))
                .andExpect(status().isOk())
                .andReturn();
        return UUID.fromString(json(result).get("id").asText());
    }

    private JdbcTemplate jdbc() {
        return new JdbcTemplate(dataSource);
    }

    private int count(String sql) {
        return jdbc().queryForObject(sql, Integer.class);
    }

    private int countAsUser(UUID userId, String sql) throws SQLException {
        return withUser(userId, sql, rs -> {
            rs.next();
            return rs.getInt(1);
        });
    }

    private int countAsAdmin(UUID userId, String sql) throws SQLException {
        return withAdmin(userId, sql, rs -> {
            rs.next();
            return rs.getInt(1);
        });
    }

    private int updateAsUser(UUID userId, String sql) throws SQLException {
        return withUserUpdate(userId, sql);
    }

    private int updateAsAdmin(UUID userId, String sql) throws SQLException {
        return withContextUpdate("select set_config('app.current_user_id', '"
                + userId + "', true), set_config('app.current_role', 'ADMIN', true),"
                + " set_config('app.flow', 'ADMIN', true)", sql);
    }

    private int updateAsSeed(String sql) throws SQLException {
        return withContextUpdate("select set_config('app.seed', 'true', true),"
                + " set_config('app.flow', 'SEED', true)", sql);
    }

    private <T> T withUser(UUID userId, String sql, ResultSetReader<T> reader) throws SQLException {
        return withContextQuery("select set_config('app.current_user_id', '"
                + userId + "', true)", sql, reader);
    }

    private <T> T withAdmin(UUID userId, String sql, ResultSetReader<T> reader) throws SQLException {
        return withContextQuery("select set_config('app.current_user_id', '"
                + userId + "', true), set_config('app.current_role', 'ADMIN', true),"
                + " set_config('app.flow', 'ADMIN', true)", sql, reader);
    }

    private <T> T withContextQuery(String setup, String sql, ResultSetReader<T> reader)
            throws SQLException {
        try (Connection connection = dataSource.getConnection()) {
            connection.setAutoCommit(false);
            try (Statement statement = connection.createStatement()) {
                statement.execute(setup);
                try (ResultSet rs = statement.executeQuery(sql)) {
                    return reader.read(rs);
                }
            } finally {
                connection.rollback();
            }
        }
    }

    private int withUserUpdate(UUID userId, String sql) throws SQLException {
        return withContextUpdate("select set_config('app.current_user_id', '"
                + userId + "', true)", sql);
    }

    private int withContextUpdate(String setup, String sql) throws SQLException {
        try (Connection connection = dataSource.getConnection()) {
            connection.setAutoCommit(false);
            try (Statement statement = connection.createStatement()) {
                statement.execute(setup);
                return statement.executeUpdate(sql);
            } finally {
                connection.rollback();
            }
        }
    }

    private boolean findWithContext(CountDownLatch start, UUID userId) throws Exception {
        start.await(10, TimeUnit.SECONDS);
        userContext.setUser(userId, "USER");
        try {
            return userService.findById(userId).isPresent();
        } finally {
            userContext.clear();
        }
    }

    private static String bearer(TestUser user) {
        return "Bearer " + user.access();
    }

    private record TestUser(UUID id, String access, String refresh, String email) {
    }

    @FunctionalInterface
    private interface ResultSetReader<T> {
        T read(ResultSet rs) throws SQLException;
    }
}
