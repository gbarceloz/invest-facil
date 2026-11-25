package com.investfacil.api.security;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.investfacil.api.common.security.JwtService;
import com.investfacil.api.common.security.TotpService;
import com.investfacil.api.content.LessonRepository;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
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

import javax.crypto.SecretKey;
import java.security.SecureRandom;
import java.time.Instant;
import java.util.Base64;
import java.util.Date;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Integration gate for flows that had no automated coverage after P1.1:
 * MFA (setup, challenge, replay), sessions, change-password, articles/search,
 * external-market fallback (disabled providers, no network) and gamification
 * level/streak after a real lesson completion.
 *
 * Uses PostgreSQL (Testcontainers), never H2. External providers are disabled
 * by configuration, so this class never performs a live third-party call.
 */
@SpringBootTest
@AutoConfigureMockMvc
@Testcontainers(disabledWithoutDocker = true)
class ExtendedIntegrationTest {

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
    TotpService totp;

    @Autowired
    LessonRepository lessons;

    @Test
    void mfaSetupLoginChallengeAndReplayProtection() throws Exception {
        TestUser user = register("mfa-user");
        String password = "Teste@123";

        MvcResult setup = mvc.perform(post("/api/v1/auth/mfa/setup")
                        .header("Authorization", bearer(user))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"password\":\"" + password + "\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.secret").isNotEmpty())
                .andExpect(jsonPath("$.otpauthUri").isNotEmpty())
                .andReturn();
        String secret = json(setup).get("secret").asText();

        // Enable with the current window; the subsequent login uses the next
        // window so the TOTP counter consumed by enable is not reused.
        String currentCode = totp.code(secret, Instant.now());
        mvc.perform(post("/api/v1/auth/mfa/enable")
                        .header("Authorization", bearer(user))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"code\":\"" + currentCode + "\"}"))
                .andExpect(status().isOk());
        String nextWindowCode = totp.code(secret, Instant.now().plusSeconds(30));

        mvc.perform(get("/api/v1/users/me").header("Authorization", bearer(user)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.mfaEnabled").value(true));

        MvcResult login = mvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"" + user.email() + "\",\"password\":\"" + password + "\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.mfaRequired").value(true))
                .andExpect(jsonPath("$.challengeToken").isNotEmpty())
                .andExpect(jsonPath("$.accessToken").doesNotExist())
                .andReturn();
        String challenge = json(login).get("challengeToken").asText();

        String wrongCode = wrongCodeFor(secret, Instant.now());
        mvc.perform(post("/api/v1/auth/mfa/verify")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"challengeToken\":\"" + challenge
                                + "\",\"code\":\"" + wrongCode + "\"}"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value("UNAUTHORIZED"));

        MvcResult verified = mvc.perform(post("/api/v1/auth/mfa/verify")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"challengeToken\":\"" + challenge
                                + "\",\"code\":\"" + nextWindowCode + "\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken").isNotEmpty())
                .andReturn();
        assertNotEquals("", json(verified).get("accessToken").asText());

        // A new challenge cannot reuse the already consumed TOTP counter.
        MvcResult secondLogin = mvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"" + user.email() + "\",\"password\":\"" + password + "\"}"))
                .andExpect(status().isOk())
                .andReturn();
        String secondChallenge = json(secondLogin).get("challengeToken").asText();
        mvc.perform(post("/api/v1/auth/mfa/verify")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"challengeToken\":\"" + secondChallenge
                                + "\",\"code\":\"" + nextWindowCode + "\"}"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value("UNAUTHORIZED"));
    }

    @Test
    void sessionsListRotateAndRevoke() throws Exception {
        TestUser user = register("session-user");

        MvcResult before = mvc.perform(get("/api/v1/auth/sessions")
                        .header("Authorization", bearer(user))
                        .header("X-Refresh-Token", user.refresh()))
                .andExpect(status().isOk())
                .andReturn();
        JsonNode sessions = json(before);
        assertTrue(sessions.isArray() && sessions.size() == 1);
        String sessionId = sessions.get(0).get("id").asText();
        assertTrue(sessions.get(0).get("current").asBoolean());

        MvcResult rotated = mvc.perform(post("/api/v1/auth/refresh")
                        .header("X-Refresh-Token", user.refresh())
                        .header("X-Requested-With", "XMLHttpRequest"))
                .andExpect(status().isOk())
                .andReturn();
        String newRefresh = json(rotated).get("refreshToken").asText();

        MvcResult rotatedSessions = mvc.perform(get("/api/v1/auth/sessions")
                        .header("Authorization", bearer(user))
                        .header("X-Refresh-Token", newRefresh))
                .andExpect(status().isOk())
                .andReturn();
        JsonNode active = json(rotatedSessions);
        assertEquals(1, active.size());
        String activeSessionId = active.get(0).get("id").asText();
        assertTrue(active.get(0).get("current").asBoolean());

        mvc.perform(delete("/api/v1/auth/sessions/" + activeSessionId)
                        .header("Authorization", bearer(user)))
                .andExpect(status().isNoContent());

        mvc.perform(post("/api/v1/auth/refresh")
                        .header("X-Refresh-Token", newRefresh)
                        .header("X-Requested-With", "XMLHttpRequest"))
                .andExpect(status().isUnauthorized());

        JsonNode after = json(mvc.perform(get("/api/v1/auth/sessions")
                        .header("Authorization", bearer(user))
                        .header("X-Refresh-Token", newRefresh))
                .andExpect(status().isOk())
                .andReturn());
        assertEquals(0, after.size());
    }

    @Test
    void changePasswordRevokesSessionsAndOldCredentials() throws Exception {
        TestUser user = register("password-user");

        mvc.perform(post("/api/v1/auth/change-password")
                        .header("Authorization", bearer(user))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"currentPassword\":\"Wrong@123\",\"newPassword\":\"NovaSenha123\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("INVALID_PASSWORD"));

        mvc.perform(post("/api/v1/auth/change-password")
                        .header("Authorization", bearer(user))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"currentPassword\":\"Teste@123\",\"newPassword\":\"NovaSenha123\"}"))
                .andExpect(status().isOk());

        mvc.perform(post("/api/v1/auth/refresh")
                        .header("X-Refresh-Token", user.refresh())
                        .header("X-Requested-With", "XMLHttpRequest"))
                .andExpect(status().isUnauthorized());

        mvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"" + user.email()
                                + "\",\"password\":\"Teste@123\"}"))
                .andExpect(status().isUnauthorized());

        mvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"" + user.email()
                                + "\",\"password\":\"NovaSenha123\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken").isNotEmpty());
    }

    @Test
    void articlesAndSearchAreServedFromSeededContent() throws Exception {
        MvcResult list = mvc.perform(get("/api/v1/content/articles"))
                .andExpect(status().isOk())
                .andReturn();
        JsonNode articles = json(list);
        assertTrue(articles.isArray() && !articles.isEmpty());
        String slug = articles.get(0).get("slug").asText();

        mvc.perform(get("/api/v1/content/articles/" + slug))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.contentMd").isNotEmpty())
                .andExpect(jsonPath("$.sourceName").isNotEmpty());

        mvc.perform(get("/api/v1/content/articles/artigo-inexistente"))
                .andExpect(status().isNotFound());

        MvcResult search = mvc.perform(get("/api/v1/content/search").param("q", "dinheiro"))
                .andExpect(status().isOk())
                .andReturn();
        JsonNode result = json(search);
        assertTrue(result.has("lessons") && result.has("articles"));
        assertTrue(result.get("lessons").size() + result.get("articles").size() > 0,
                "A busca deve encontrar conteúdo do seed");

        mvc.perform(get("/api/v1/content/search").param("q", "a"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void marketAndBitcoinReturnExplicitFallbackWithoutNetwork() throws Exception {
        mvc.perform(get("/api/v1/market/assets"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("UNAVAILABLE"))
                .andExpect(jsonPath("$.assets").isEmpty())
                .andExpect(jsonPath("$.disclaimer").isNotEmpty());

        mvc.perform(get("/api/v1/bitcoin/market"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("UNAVAILABLE"))
                .andExpect(jsonPath("$.disclaimer").isNotEmpty());
    }

    @Test
    void videoPlaybackWithoutPublishedAssetIsNotFound() throws Exception {
        mvc.perform(get("/api/v1/content/lessons/por-que-educacao-financeira/video"))
                .andExpect(status().isNotFound());
    }

    @Test
    void gamificationLevelAndStreakAfterRealCompletion() throws Exception {
        TestUser user = register("gamification-user");
        UUID lessonId = lessonId("por-que-educacao-financeira");

        // Conclusão legada não aceita mais pular vídeo + quiz.
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
                .andExpect(jsonPath("$.passed").value(true))
                .andExpect(jsonPath("$.lessonCompleted").value(true));

        // 50 (aula) + 30 (quiz) + 20 (1ª aula) + 20 (1º quiz) = 120 XP
        mvc.perform(get("/api/v1/gamification/summary")
                        .header("Authorization", bearer(user)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.xp").value(120))
                .andExpect(jsonPath("$.level.number").value(1))
                .andExpect(jsonPath("$.level.name").value("Curioso"))
                .andExpect(jsonPath("$.xpToNextLevel").value(180))
                .andExpect(jsonPath("$.currentStreak").value(1))
                .andExpect(jsonPath("$.bestStreak").value(1))
                .andExpect(jsonPath("$.achievementsUnlocked").value(2))
                .andExpect(jsonPath("$.fichas").value(3))
                .andExpect(jsonPath("$.fichasMax").value(3))
                .andExpect(jsonPath("$.quizPassThresholdPercent").value(67))
                .andExpect(jsonPath("$.streak.current").value(1));

        MvcResult achievements = mvc.perform(get("/api/v1/gamification/achievements")
                        .header("Authorization", bearer(user)))
                .andExpect(status().isOk())
                .andReturn();
        boolean firstLessonUnlocked = false;
        for (JsonNode achievement : json(achievements)) {
            if ("FIRST_LESSON".equals(achievement.get("code").asText())) {
                firstLessonUnlocked = achievement.get("unlocked").asBoolean();
            }
        }
        assertTrue(firstLessonUnlocked, "FIRST_LESSON deve estar desbloqueada após concluir a aula");

        MvcResult history = mvc.perform(get("/api/v1/gamification/xp")
                        .header("Authorization", bearer(user)))
                .andExpect(status().isOk())
                .andReturn();
        boolean hasLessonXp = false;
        boolean hasQuizXp = false;
        for (JsonNode entry : json(history)) {
            hasLessonXp |= entry.get("amount").asInt() == 50;
            hasQuizXp |= entry.get("amount").asInt() == 30;
        }
        assertTrue(hasLessonXp, "XP de aula (50) deve aparecer no histórico");
        assertTrue(hasQuizXp, "XP de quiz (30) deve aparecer no histórico");
    }

    @Test
    void expiredAndWronglySignedTokensAreRejected() throws Exception {
        TestUser user = register("token-user");

        SecretKey key = Keys.hmacShaKeyFor(Decoders.BASE64.decode(JWT_SECRET));
        String expired = Jwts.builder()
                .issuer("investfacil-api")
                .subject(user.id().toString())
                .claim("email", user.email())
                .claim("role", "USER")
                .claim("purpose", JwtService.PURPOSE_ACCESS)
                .issuedAt(Date.from(Instant.now().minusSeconds(3600)))
                .expiration(Date.from(Instant.now().minusSeconds(1800)))
                .signWith(key)
                .compact();
        mvc.perform(get("/api/v1/users/me").header("Authorization", "Bearer " + expired))
                .andExpect(status().isUnauthorized());

        String wrongKey = Base64.getEncoder().encodeToString(new byte[48]);
        SecretKey otherKey = Keys.hmacShaKeyFor(Decoders.BASE64.decode(wrongKey));
        String forged = Jwts.builder()
                .issuer("investfacil-api")
                .subject(user.id().toString())
                .claim("email", user.email())
                .claim("role", "ADMIN")
                .claim("purpose", JwtService.PURPOSE_ACCESS)
                .issuedAt(Date.from(Instant.now()))
                .expiration(Date.from(Instant.now().plusSeconds(600)))
                .signWith(otherKey)
                .compact();
        mvc.perform(get("/api/v1/admin/videos").header("Authorization", "Bearer " + forged))
                .andExpect(status().isUnauthorized());
    }

    private TestUser register(String prefix) throws Exception {
        String email = prefix + "-" + UUID.randomUUID() + "@example.com";
        String password = "Teste@123";
        MvcResult registered = mvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"name":"Usuário de Teste","email":"%s","password":"%s"}
                                """.formatted(email, password)))
                .andExpect(status().isCreated())
                .andReturn();
        String verify = json(registered).get("devVerificationToken").asText();
        mvc.perform(post("/api/v1/auth/verify-email")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"token\":\"" + verify + "\"}"))
                .andExpect(status().isOk());
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
                email,
                node.get("accessToken").asText(),
                node.get("refreshToken").asText());
    }

    private JsonNode json(MvcResult result) throws Exception {
        return mapper.readTree(result.getResponse().getContentAsString());
    }

    private UUID lessonId(String slug) {
        return lessons.findBySlug(slug).orElseThrow().getId();
    }

    private String wrongCodeFor(String secret, Instant instant) {
        String current = totp.code(secret, instant);
        String previous = totp.code(secret, instant.minusSeconds(30));
        String next = totp.code(secret, instant.plusSeconds(30));
        int candidate = (Integer.parseInt(current) + 1) % 1_000_000;
        while (true) {
            String formatted = String.format("%06d", candidate);
            if (!formatted.equals(current) && !formatted.equals(previous)
                    && !formatted.equals(next)) {
                return formatted;
            }
            candidate = (candidate + 1) % 1_000_000;
        }
    }

    private static String bearer(TestUser user) {
        return "Bearer " + user.access();
    }

    private record TestUser(UUID id, String email, String access, String refresh) {
    }
}
