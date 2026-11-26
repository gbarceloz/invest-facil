package com.investfacil.api.onboarding;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
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

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Fluxo real do onboarding contra PostgreSQL: cálculo público, persistência
 * autenticada, atualização idempotente e isolamento entre usuários via RLS.
 */
@SpringBootTest
@AutoConfigureMockMvc
@Testcontainers(disabledWithoutDocker = true)
class OnboardingIntegrationTest {

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
        registry.add("app.seed.content", () -> "false");
        registry.add("app.demo.enabled", () -> "false");
        registry.add("app.market.enabled", () -> "false");
        registry.add("app.bitcoin.enabled", () -> "false");
    }

    @Autowired
    MockMvc mvc;

    @Autowired
    ObjectMapper mapper;

    @Test
    void shouldCalculatePersistUpdateAndIsolateProfiles() throws Exception {
        String firstToken = registerAndLogin("onboarding-a-" + UUID.randomUUID() + "@example.com");

        mvc.perform(get("/api/v1/onboarding/me")
                        .header("Authorization", "Bearer " + firstToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.completed").value(false))
                .andExpect(jsonPath("$.health").doesNotExist());

        // Cálculo público: não exige autenticação e não persiste.
        mvc.perform(post("/api/v1/onboarding/estimate")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(answersJson(true)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.score").value(100))
                .andExpect(jsonPath("$.band").value("CONSOLIDADO"))
                .andExpect(jsonPath("$.opportunity").value("INVESTIR_COM_CRITERIO"))
                .andExpect(jsonPath("$.monthlySavingsCents").value(250000))
                .andExpect(jsonPath("$.emergencyFundGoalCents").value(2400000))
                .andExpect(jsonPath("$.factors.length()").value(4));

        // Persistência autenticada.
        mvc.perform(put("/api/v1/onboarding/me")
                        .header("Authorization", "Bearer " + firstToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"Aluno Onboarding\",\"answers\":" + answersJson(true) + "}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.completed").value(true))
                .andExpect(jsonPath("$.name").value("Aluno Onboarding"))
                .andExpect(jsonPath("$.answers.studyTime").value("19:00"))
                .andExpect(jsonPath("$.health.score").value(100))
                .andExpect(jsonPath("$.completedAt").isNotEmpty());

        mvc.perform(get("/api/v1/onboarding/me")
                        .header("Authorization", "Bearer " + firstToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.completed").value(true))
                .andExpect(jsonPath("$.answers.emergencyReserve").value("MORE_THAN_6"));

        // Atualização idempotente: recalcula e mantém um único perfil.
        mvc.perform(put("/api/v1/onboarding/me")
                        .header("Authorization", "Bearer " + firstToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"Aluno Atualizado\",\"answers\":" + answersJson(false) + "}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Aluno Atualizado"))
                .andExpect(jsonPath("$.health.score").value(10))
                .andExpect(jsonPath("$.health.band").value("ATENCAO"))
                .andExpect(jsonPath("$.health.opportunity").value("QUITAR_DIVIDA"));

        // Segundo usuário não enxerga o perfil do primeiro (RLS).
        String secondToken = registerAndLogin("onboarding-b-" + UUID.randomUUID() + "@example.com");
        mvc.perform(get("/api/v1/onboarding/me")
                        .header("Authorization", "Bearer " + secondToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.completed").value(false));
        mvc.perform(put("/api/v1/onboarding/me")
                        .header("Authorization", "Bearer " + secondToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"Segundo Aluno\",\"answers\":" + answersJson(false) + "}"))
                .andExpect(status().isOk());
        mvc.perform(get("/api/v1/onboarding/me")
                        .header("Authorization", "Bearer " + firstToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Aluno Atualizado"));

        // Validação de contrato.
        mvc.perform(put("/api/v1/onboarding/me")
                        .header("Authorization", "Bearer " + firstToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"name":"Aluno","answers":{
                                  "goal":"INVEST","financialSituation":"FROM_ZERO",
                                  "emergencyReserve":"NONE","highInterestDebt":"NONE",
                                  "learningPreference":"MIX","knowledgeLevel":"BASIC",
                                  "spendingTriggers":["NONE"],"studyDays":["MON"],
                                  "studyTime":"25:00"}}
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("VALIDATION_ERROR"));

        mvc.perform(post("/api/v1/onboarding/estimate")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(answersJson(true).replace("\"incomeCents\":1000000",
                                "\"incomeCents\":-1")))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("VALIDATION_ERROR"));

        // Sem autenticação não há leitura nem escrita.
        mvc.perform(get("/api/v1/onboarding/me"))
                .andExpect(status().isUnauthorized());
        mvc.perform(put("/api/v1/onboarding/me")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"Anonimo\",\"answers\":" + answersJson(true) + "}"))
                .andExpect(status().isUnauthorized());
    }

    private String registerAndLogin(String email) throws Exception {
        mvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"name":"Aluno Onboarding","email":"%s","password":"Teste@123"}
                                """.formatted(email)))
                .andExpect(status().isCreated());

        MvcResult login = mvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"" + email + "\",\"password\":\"Teste@123\"}"))
                .andExpect(status().isOk())
                .andReturn();
        JsonNode body = mapper.readTree(login.getResponse().getContentAsString());
        String token = body.path("accessToken").asText();
        assertNotNull(token);
        assertEquals(false, body.path("user").path("emailVerified").asBoolean());
        return token;
    }

    private String answersJson(boolean strong) {
        if (strong) {
            return """
                    {"goal":"INVEST","financialSituation":"CAN_SAVE",
                     "incomeCents":1000000,"savingsCapacityCents":250000,
                     "essentialExpensesCents":400000,
                     "emergencyReserve":"MORE_THAN_6","highInterestDebt":"NONE",
                     "learningPreference":"MIX","knowledgeLevel":"ADVANCED",
                     "spendingTriggers":["DELIVERY","IMPULSE"],
                     "studyDays":["MON","WED","FRI"],"studyTime":"19:00"}
                    """;
        }
        return """
                {"goal":"ORGANIZE","financialSituation":"IN_DEBT",
                 "incomeCents":1000000,"savingsCapacityCents":0,
                 "essentialExpensesCents":900000,
                 "emergencyReserve":"NONE","highInterestDebt":"CREDIT_CARD",
                 "learningPreference":"VIDEOS","knowledgeLevel":"ZERO",
                 "spendingTriggers":["NONE"],"studyDays":["SAT"],"studyTime":"09:30"}
                """;
    }
}
