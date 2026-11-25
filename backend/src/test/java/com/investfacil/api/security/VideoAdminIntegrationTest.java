package com.investfacil.api.security;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.investfacil.api.content.LessonRepository;
import com.investfacil.api.users.Role;
import com.investfacil.api.users.UserService;
import com.investfacil.api.videos.SupabaseStorageClient;
import com.investfacil.api.videos.VideoAssetRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import java.security.SecureRandom;
import java.util.Base64;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * ADMIN authorization and video upload/list integration gate.
 *
 * SupabaseStorageClient is replaced by a controlled fake because the real
 * service requires credentials and a remote bucket; no network call is made.
 * This is explicitly a test with a simulated external boundary, not a live
 * integration.
 */
@SpringBootTest
@AutoConfigureMockMvc
@Testcontainers(disabledWithoutDocker = true)
class VideoAdminIntegrationTest {

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
        registry.add("app.videos.demo-url", () -> "");
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
    VideoAssetRepository videos;

    @MockitoBean
    SupabaseStorageClient storage;

    @BeforeEach
    void cleanVideoAssets() {
        // Isolate tests from each other; the database is shared by this context.
        videos.deleteAll();
    }

    @Test
    void anonymousAndRegularUsersCannotUseAdminVideoEndpoints() throws Exception {
        TestUser user = register("video-user");

        mvc.perform(get("/api/v1/admin/videos"))
                .andExpect(status().isUnauthorized());

        mvc.perform(get("/api/v1/admin/videos")
                        .header("Authorization", bearer(user)))
                .andExpect(status().isForbidden());

        MockMultipartFile file = mp4File();
        mvc.perform(multipart("/api/v1/admin/videos/" + lessonId())
                        .file(file)
                        .header("Authorization", bearer(user)))
                .andExpect(status().isForbidden());

        verify(storage, never()).upload(anyString(), any(byte[].class), anyString());
        assertEquals(0, videos.count());
    }

    @Test
    void adminCanListAndUploadWithPersistedAsset() throws Exception {
        TestUser admin = admin("video-admin");
        UUID lessonId = lessonId();
        when(storage.isConfigured()).thenReturn(true);
        when(storage.signedUrl(anyString(), anyLong()))
                .thenReturn("https://storage.invalid/signed/video.mp4");

        mvc.perform(get("/api/v1/admin/videos")
                        .header("Authorization", bearer(admin)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(0));

        MvcResult uploaded = mvc.perform(multipart("/api/v1/admin/videos/" + lessonId)
                        .file(mp4File())
                        .header("Authorization", bearer(admin)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.lessonId").value(lessonId.toString()))
                .andExpect(jsonPath("$.status").value("PUBLISHED"))
                .andExpect(jsonPath("$.mime").value("video/mp4"))
                .andExpect(jsonPath("$.storagePath").isNotEmpty())
                .andReturn();

        String assetId = json(uploaded).get("id").asText();
        assertTrue(videos.findById(UUID.fromString(assetId)).isPresent());

        ArgumentCaptor<String> path = ArgumentCaptor.forClass(String.class);
        verify(storage, times(1)).upload(path.capture(), any(byte[].class), eq("video/mp4"));
        assertTrue(path.getValue().startsWith("videos/" + lessonId + "/"));

        mvc.perform(get("/api/v1/admin/videos")
                        .header("Authorization", bearer(admin)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].id").value(assetId));

        mvc.perform(get("/api/v1/content/lessons/por-que-educacao-financeira/video"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.source").value("SUPABASE"))
                .andExpect(jsonPath("$.url").value("https://storage.invalid/signed/video.mp4"));
    }

    @Test
    void adminUploadValidatesFormatAndLessonWithoutPersisting() throws Exception {
        TestUser admin = admin("video-admin-invalid");
        when(storage.isConfigured()).thenReturn(true);

        MockMultipartFile wrongType = new MockMultipartFile(
                "file", "nota.txt", MediaType.TEXT_PLAIN_VALUE, "conteudo".getBytes());
        mvc.perform(multipart("/api/v1/admin/videos/" + lessonId())
                        .file(wrongType)
                        .header("Authorization", bearer(admin)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("INVALID_FORMAT"));

        MockMultipartFile wrongSignature = new MockMultipartFile(
                "file", "fake.mp4", "video/mp4", "not-a-real-mp4-container".getBytes());
        mvc.perform(multipart("/api/v1/admin/videos/" + lessonId())
                        .file(wrongSignature)
                        .header("Authorization", bearer(admin)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("INVALID_FILE"));

        mvc.perform(multipart("/api/v1/admin/videos/" + UUID.randomUUID())
                        .file(mp4File())
                        .header("Authorization", bearer(admin)))
                .andExpect(status().isNotFound());

        verify(storage, never()).upload(anyString(), any(byte[].class), anyString());
        assertEquals(0, videos.count());
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
        return new TestUser(UUID.fromString(node.get("user").get("id").asText()),
                node.get("accessToken").asText());
    }

    private UUID lessonId() {
        return lessons.findBySlug("por-que-educacao-financeira").orElseThrow().getId();
    }

    private static MockMultipartFile mp4File() {
        // Minimal ISO-BMFF header: size + "ftypisom"; enough for the signature check.
        byte[] bytes = new byte[32];
        bytes[3] = 0x20;
        bytes[4] = 'f';
        bytes[5] = 't';
        bytes[6] = 'y';
        bytes[7] = 'p';
        bytes[8] = 'i';
        bytes[9] = 's';
        bytes[10] = 'o';
        bytes[11] = 'm';
        return new MockMultipartFile("file", "aula.mp4", "video/mp4", bytes);
    }

    private JsonNode json(MvcResult result) throws Exception {
        return mapper.readTree(result.getResponse().getContentAsString());
    }

    private static String bearer(TestUser user) {
        return "Bearer " + user.access();
    }

    private record TestUser(UUID id, String access) {
    }
}
