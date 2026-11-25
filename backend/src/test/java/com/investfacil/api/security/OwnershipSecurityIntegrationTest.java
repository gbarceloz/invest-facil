package com.investfacil.api.security;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.investfacil.api.content.LessonRepository;
import com.investfacil.api.progress.UserProgressRepository;
import com.investfacil.api.simulator.SimulationRepository;
import com.investfacil.api.users.Role;
import com.investfacil.api.users.User;
import com.investfacil.api.users.UserService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.http.MediaType;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import java.security.SecureRandom;
import java.util.Base64;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Security integration gate: two independent users plus ADMIN.
 *
 * Proves behavior at the HTTP + PostgreSQL layers. It is not a production
 * security proof and does not replace a per-user RLS policy.
 */
@SpringBootTest
@AutoConfigureMockMvc
@Testcontainers(disabledWithoutDocker = true)
class OwnershipSecurityIntegrationTest {

    private static final String JWT_SECRET;

    static {
        byte[] secret = new byte[48];
        new SecureRandom().nextBytes(secret);
        JWT_SECRET = Base64.getEncoder().encodeToString(secret);
    }

    @Container
    @ServiceConnection
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:17-alpine");

    @DynamicPropertySource
    static void properties(DynamicPropertyRegistry registry) {
        registry.add("app.jwt.secret", () -> JWT_SECRET);
        registry.add("app.auth.expose-dev-tokens", () -> "true");
        registry.add("app.auth.cookie-secure", () -> "false");
        registry.add("app.rate-limit.enabled", () -> "false");
        registry.add("app.seed.content", () -> "true");
        registry.add("app.demo.enabled", () -> "false");
        registry.add("app.market.enabled", () -> "false");
        registry.add("app.bitcoin.enabled", () -> "false");
    }

    @Autowired
    MockMvc mvc;

    @Autowired
    ObjectMapper mapper;

    @Autowired
    UserService users;

    @Autowired
    LessonRepository lessons;

    @Autowired
    UserProgressRepository progress;

    @Autowired
    SimulationRepository simulations;

    @Test
    void userCannotReadOrChangeOtherUsersProgress() throws Exception {
        TestUser a = register("own-progress-a");
        TestUser b = register("own-progress-b");
        UUID lessonId = lessonId();

        completeLessonViaVideoAndQuiz(b, lessonId);

        mvc.perform(get("/api/v1/progress/lessons/" + lessonId)
                        .header("Authorization", bearer(a)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.completed").value(false))
                .andExpect(jsonPath("$.attempts").value(0));

        mvc.perform(get("/api/v1/progress/summary")
                        .header("Authorization", bearer(a)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.completedLessons").value(0))
                .andExpect(jsonPath("$.quizAttempts").value(0));

        assertFalse(progress.existsByUserIdAndLessonId(a.id(), lessonId));
        assertTrue(progress.existsByUserIdAndLessonId(b.id(), lessonId));
    }

    @Test
    void userCannotDeleteOtherUsersScenario() throws Exception {
        TestUser a = register("own-sim-a");
        TestUser b = register("own-sim-b");

        MvcResult saved = mvc.perform(post("/api/v1/simulator/scenarios")
                        .header("Authorization", bearer(b))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"name":"Cenário de B","scenario":{"initialAmount":1000,
                                "monthlyContribution":100,"months":12,"annualRate":8,
                                "inflationRate":4}}
                                """))
                .andExpect(status().isCreated())
                .andReturn();
        UUID scenarioId = UUID.fromString(json(saved).get("id").asText());

        mvc.perform(delete("/api/v1/simulator/scenarios/" + scenarioId)
                        .header("Authorization", bearer(a)))
                .andExpect(status().isNotFound());

        assertTrue(simulations.findById(scenarioId).isPresent(),
                "A exclusão de A não pode remover o cenário de B");

        MvcResult aList = mvc.perform(get("/api/v1/simulator/scenarios")
                        .header("Authorization", bearer(a)))
                .andExpect(status().isOk())
                .andReturn();
        MvcResult bList = mvc.perform(get("/api/v1/simulator/scenarios")
                        .header("Authorization", bearer(b)))
                .andExpect(status().isOk())
                .andReturn();
        assertFalse(aList.getResponse().getContentAsString().contains(scenarioId.toString()));
        assertTrue(bList.getResponse().getContentAsString().contains(scenarioId.toString()));
    }

    @Test
    void userCannotRevokeOtherUsersSession() throws Exception {
        TestUser a = register("own-session-a");
        TestUser b = register("own-session-b");

        MvcResult sessions = mvc.perform(get("/api/v1/auth/sessions")
                        .header("Authorization", bearer(b))
                        .header("X-Refresh-Token", b.refresh()))
                .andExpect(status().isOk())
                .andReturn();
        JsonNode list = json(sessions);
        assertTrue(list.isArray() && !list.isEmpty());
        String sessionId = list.get(0).get("id").asText();

        mvc.perform(delete("/api/v1/auth/sessions/" + sessionId)
                        .header("Authorization", bearer(a)))
                .andExpect(status().isNotFound());

        MvcResult after = mvc.perform(get("/api/v1/auth/sessions")
                        .header("Authorization", bearer(b))
                        .header("X-Refresh-Token", b.refresh()))
                .andExpect(status().isOk())
                .andReturn();
        assertTrue(after.getResponse().getContentAsString().contains(sessionId),
                "A sessão de B deve continuar existindo após a tentativa de A");
    }

    @Test
    void anonymousCannotAccessProtectedEndpoints() throws Exception {
        mvc.perform(get("/api/v1/progress/summary"))
                .andExpect(status().isUnauthorized());
        mvc.perform(get("/api/v1/users/me"))
                .andExpect(status().isUnauthorized());
        mvc.perform(get("/api/v1/simulator/scenarios"))
                .andExpect(status().isUnauthorized());
        mvc.perform(get("/api/v1/admin/videos"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void userCannotUseAdminEndpointsButAdminCanListVideos() throws Exception {
        TestUser user = register("own-admin-user");
        TestUser admin = admin("own-admin");

        mvc.perform(get("/api/v1/admin/videos")
                        .header("Authorization", bearer(user)))
                .andExpect(status().isForbidden());
        mvc.perform(get("/api/v1/admin/videos")
                        .header("Authorization", bearer(admin)))
                .andExpect(status().isOk());
    }

    @Test
    void malformedBearerTokenIsRejected() throws Exception {
        mvc.perform(get("/api/v1/users/me")
                        .header("Authorization", "Bearer definitely-not-a-jwt"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void profileUpdateOnlyChangesTheAuthenticatedUser() throws Exception {
        TestUser a = register("own-profile-a");
        TestUser b = register("own-profile-b");

        mvc.perform(patch("/api/v1/users/me")
                        .header("Authorization", bearer(a))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"Nome A Atualizado\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Nome A Atualizado"));

        mvc.perform(get("/api/v1/users/me")
                        .header("Authorization", bearer(b)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value(org.hamcrest.Matchers.not("Nome A Atualizado")));
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
        String password = "Teste@123";
        mvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"name":"Usuário de Teste","email":"%s","password":"%s"}
                                """.formatted(email, password)))
                .andExpect(status().isCreated());
        return login(email, password);
    }

    private TestUser admin(String prefix) throws Exception {
        String email = prefix + "-" + UUID.randomUUID() + "@example.com";
        String password = "Admin@123";
        users.create("Admin de Teste", email, password, Role.ADMIN, true);
        return login(email, password);
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
                node.get("refreshToken").asText());
    }

    private JsonNode json(MvcResult result) throws Exception {
        return mapper.readTree(result.getResponse().getContentAsString());
    }

    private UUID lessonId() {
        return lessons.findBySlug("por-que-educacao-financeira").orElseThrow().getId();
    }

    private static String bearer(TestUser user) {
        return "Bearer " + user.access();
    }

    private record TestUser(UUID id, String access, String refresh) {
    }
}
