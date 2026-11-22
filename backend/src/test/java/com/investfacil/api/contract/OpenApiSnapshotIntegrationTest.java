package com.investfacil.api.contract;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.http.ResponseEntity;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import java.nio.file.Files;
import java.nio.file.Path;
import java.security.SecureRandom;
import java.util.Base64;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

/**
 * Captures the OpenAPI document actually served by a running application and
 * writes it to backend/target/openapi-current.json.
 *
 * The versioned snapshot (docs/contracts/openapi.json) is compared by
 * scripts/contracts/check_openapi_contract.py, which classifies breaking versus
 * compatible changes and returns a non-zero exit code for breaking drift.
 *
 * This test proves only what the backend exposes at build time. It does not
 * prove runtime behavior, authorization or deployment.
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@Testcontainers(disabledWithoutDocker = true)
class OpenApiSnapshotIntegrationTest {

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

    @LocalServerPort
    int port;

    @Autowired
    ObjectMapper mapper;

    @Test
    void capturesExposedOpenApiDocument() throws Exception {
        TestRestTemplate rest = new TestRestTemplate();
        ResponseEntity<String> response = rest.getForEntity(
                "http://localhost:" + port + "/v3/api-docs", String.class);
        assertEquals(200, response.getStatusCode().value(), "OpenAPI endpoint must be public");

        JsonNode spec = mapper.readTree(response.getBody());
        if (spec instanceof ObjectNode object) {
            // Environment-specific server URL and descriptive metadata are not
            // part of the API contract (paths, operations, schemas, security are).
            object.remove("servers");
            object.remove("info");
        }
        assertTrue(spec.path("paths").size() > 0, "OpenAPI must expose at least one path");

        Path target = Path.of("target", "openapi-current.json").toAbsolutePath().normalize();
        Files.createDirectories(target.getParent());
        Files.writeString(target,
                mapper.writerWithDefaultPrettyPrinter().writeValueAsString(spec) + "\n");
    }
}
