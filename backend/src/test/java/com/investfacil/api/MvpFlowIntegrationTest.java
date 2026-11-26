package com.investfacil.api;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.investfacil.api.auth.EmailToken;
import com.investfacil.api.auth.EmailTokenRepository;
import com.investfacil.api.auth.EmailTokenType;
import com.investfacil.api.common.security.TokenHasher;
import com.investfacil.api.users.User;
import com.investfacil.api.users.UserRepository;
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
import java.time.Instant;
import java.util.Base64;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Fluxo integrado real contra PostgreSQL (Testcontainers):
 * cadastro → verificação → login → conteúdo → progresso → XP → quiz →
 * simulador → rotação de refresh → detecção de reuso.
 */
@SpringBootTest
@AutoConfigureMockMvc
@Testcontainers(disabledWithoutDocker = true)
class MvpFlowIntegrationTest {

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
    }

    @Autowired
    MockMvc mvc;

    @Autowired
    ObjectMapper mapper;

    @Autowired
    UserRepository users;

    @Autowired
    EmailTokenRepository emailTokens;

    @Test
    void shouldRunCompleteLearnerJourney() throws Exception {
        String email = "aluno-" + UUID.randomUUID() + "@example.com";

        // 1. Catálogo público já veio do seed
        mvc.perform(get("/api/v1/content/categories"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(8));

        // 2. Cadastro emite o token oficial; a conta nasce não verificada.
        mvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"name":"Aluno Teste","email":"%s","password":"Teste@123"}
                                """.formatted(email)))
                .andExpect(status().isCreated());

        // 3. Login segue liberado (V9); a confirmação é registrada no link.
        MvcResult login = mvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"" + email + "\",\"password\":\"Teste@123\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken").isNotEmpty())
                .andExpect(jsonPath("$.user.emailVerified").value(false))
                .andReturn();
        JsonNode auth = json(login);
        String access = auth.get("accessToken").asText();
        String refresh = auth.get("refreshToken").asText();

        // 5. Perfil autenticado
        mvc.perform(get("/api/v1/users/me").header("Authorization", "Bearer " + access))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value(email));

        // 6. Aula pública
        MvcResult lesson = mvc.perform(get("/api/v1/content/lessons/por-que-educacao-financeira"))
                .andExpect(status().isOk())
                .andReturn();
        String lessonId = json(lesson).get("id").asText();

        // 7. Conclusão legada é bloqueada sem vídeo + quiz (409 LESSON_NOT_READY)
        mvc.perform(post("/api/v1/progress/lessons/" + lessonId)
                        .header("Authorization", "Bearer " + access))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.code").value("LESSON_NOT_READY"))
                .andExpect(jsonPath("$.details.videoWatched").value(false));

        // 7.1 Vídeo assistido (90% da duração) — não conclui sozinho
        mvc.perform(post("/api/v1/progress/lessons/" + lessonId + "/video")
                        .header("Authorization", "Bearer " + access)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"watched\":true,\"positionSeconds\":120,\"durationSeconds\":120}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.watched").value(true));

        // 8. Quiz da aula (gabarito não vem na consulta; aqui usamos os índices do seed)
        MvcResult quiz = mvc.perform(get("/api/v1/progress/lessons/" + lessonId + "/quiz")
                        .header("Authorization", "Bearer " + access))
                .andExpect(status().isOk())
                .andReturn();
        JsonNode questions = json(quiz).get("questions");
        String answers = "{\"answers\":["
                + "{\"questionId\":\"" + questions.get(0).get("id").asText() + "\",\"selectedIndex\":1},"
                + "{\"questionId\":\"" + questions.get(1).get("id").asText() + "\",\"selectedIndex\":0}"
                + "]}";
        mvc.perform(post("/api/v1/progress/lessons/" + lessonId + "/quiz")
                        .header("Authorization", "Bearer " + access)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(answers))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.percent").value(100))
                .andExpect(jsonPath("$.passed").value(true))
                .andExpect(jsonPath("$.lessonCompleted").value(true));

        // 8.1 Legado agora é idempotente e confirma a conclusão já feita
        mvc.perform(post("/api/v1/progress/lessons/" + lessonId)
                        .header("Authorization", "Bearer " + access))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.alreadyCompleted").value(true))
                .andExpect(jsonPath("$.xpAwarded").value(0));

        // 9. Resumo de progresso e gamificação
        mvc.perform(get("/api/v1/progress/summary").header("Authorization", "Bearer " + access))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.completedLessons").value(1));
        // 50 (aula) + 30 (quiz) + 20 (1ª aula) + 20 (1º quiz) = 120 XP
        mvc.perform(get("/api/v1/gamification/summary").header("Authorization", "Bearer " + access))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.xp").value(120));

        // 10. Simulador: cálculo público e cenário salvo
        mvc.perform(post("/api/v1/simulator/calculate")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"initialAmount":1000,"monthlyContribution":100,"months":120,
                                 "annualRate":8,"inflationRate":4}
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.disclaimer").isNotEmpty());
        mvc.perform(post("/api/v1/simulator/scenarios")
                        .header("Authorization", "Bearer " + access)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"name":"Meu primeiro plano",
                                 "scenario":{"initialAmount":1000,"monthlyContribution":100,
                                 "months":120,"annualRate":8,"inflationRate":4}}
                                """))
                .andExpect(status().isCreated());

        // 11. Rotação de refresh
        MvcResult rotated = mvc.perform(post("/api/v1/auth/refresh")
                        .header("X-Refresh-Token", refresh)
                        .header("X-Requested-With", "XMLHttpRequest"))
                .andExpect(status().isOk())
                .andReturn();
        String newRefresh = json(rotated).get("refreshToken").asText();
        assertNotNull(newRefresh);

        // 12. Reuso do token antigo: 401 e revogação da família
        mvc.perform(post("/api/v1/auth/refresh")
                        .header("X-Refresh-Token", refresh)
                        .header("X-Requested-With", "XMLHttpRequest"))
                .andExpect(status().isUnauthorized());
        mvc.perform(post("/api/v1/auth/refresh")
                        .header("X-Refresh-Token", newRefresh)
                        .header("X-Requested-With", "XMLHttpRequest"))
                .andExpect(status().isUnauthorized());

        // 13. Cadastro duplicado é recusado sem revelar detalhes internos
        mvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"name":"Aluno Teste","email":"%s","password":"Teste@123"}
                                """.formatted(email)))
                .andExpect(status().isConflict());

        // 14. Rota protegida sem token permanece fail-closed
        mvc.perform(get("/api/v1/progress/summary"))
                .andExpect(status().isUnauthorized());

        // 15. Reset de senha com token de uso único invalida sessões
        User user = users.findByEmailIgnoreCase(email).orElseThrow();
        String rawReset = "reset-" + UUID.randomUUID();
        EmailToken resetToken = new EmailToken();
        resetToken.setUserId(user.getId());
        resetToken.setType(EmailTokenType.PASSWORD_RESET);
        resetToken.setTokenHash(TokenHasher.sha256Hex(rawReset));
        resetToken.setExpiresAt(Instant.now().plusSeconds(3600));
        emailTokens.save(resetToken);

        mvc.perform(post("/api/v1/auth/reset-password")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"token\":\"" + rawReset + "\",\"password\":\"NovaSenha123\"}"))
                .andExpect(status().isOk());
        mvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"" + email + "\",\"password\":\"NovaSenha123\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken").isNotEmpty());
    }

    private JsonNode json(MvcResult result) throws Exception {
        String body = result.getResponse().getContentAsString();
        assertTrue(body != null && !body.isBlank(), "Resposta JSON vazia");
        JsonNode node = mapper.readTree(body);
        assertEquals(true, node != null);
        return node;
    }
}
