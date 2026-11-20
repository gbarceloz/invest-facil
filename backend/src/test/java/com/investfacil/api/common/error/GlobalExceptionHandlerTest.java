package com.investfacil.api.common.error;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.FilterType;
import org.springframework.context.annotation.Import;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.resource.NoResourceFoundException;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Garante que TODAS as respostas de erro usam o envelope {@link ApiError},
 * sem stack trace, mensagem de SQL ou caminhos internos.
 */
@WebMvcTest(
        controllers = GlobalExceptionHandlerTest.ProbeController.class,
        excludeFilters = @ComponentScan.Filter(
                type = FilterType.ASSIGNABLE_TYPE,
                classes = com.investfacil.api.config.SecurityConfig.class))
@Import(GlobalExceptionHandlerTest.ProbeController.class)
@AutoConfigureMockMvc(addFilters = false) // foco no handler de erros, sem a cadeia de segurança
class GlobalExceptionHandlerTest {

    @Autowired
    MockMvc mvc;

    @MockBean
    com.investfacil.api.common.security.JwtAuthenticationFilter jwtAuthenticationFilter;

    @MockBean
    com.investfacil.api.common.web.RateLimitFilter rateLimitFilter;

    @RestController
    @RequestMapping("/probe")
    static class ProbeController {

        record Body(@NotBlank String name) {
        }

        @GetMapping("/missing")
        public void missing() throws NoResourceFoundException {
            throw new NoResourceFoundException(HttpMethod.GET, "/probe/missing");
        }

        @PostMapping("/validate")
        public Body validate(@Valid @RequestBody Body body) {
            return body;
        }

        @GetMapping("/boom")
        public void boom() {
            throw new IllegalStateException("falha interna simulada (jamais vazará ao cliente)");
        }
    }

    @Test
    void recursoInexistenteRetornaEnvelope404() throws Exception {
        mvc.perform(get("/probe/missing"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404))
                .andExpect(jsonPath("$.code").value("NOT_FOUND"))
                .andExpect(jsonPath("$.message").value("Recurso não encontrado."))
                .andExpect(jsonPath("$.timestamp").exists());
    }

    @Test
    void validacaoRetornaEnvelope400ComCampos() throws Exception {
        mvc.perform(post("/probe/validate")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.code").value("VALIDATION_ERROR"))
                .andExpect(jsonPath("$.details.name").exists());
    }

    @Test
    void corpoInvalidoRetornaEnvelope400() throws Exception {
        mvc.perform(post("/probe/validate")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("isto-nao-e-json"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("VALIDATION_ERROR"));
    }

    @Test
    void erroInesperadoRetorna500SemVazarDetalheInterno() throws Exception {
        mvc.perform(get("/probe/boom"))
                .andExpect(status().isInternalServerError())
                .andExpect(jsonPath("$.status").value(500))
                .andExpect(jsonPath("$.code").value("INTERNAL_ERROR"))
                // Mensagem genérica: o texto da exceção ("falha interna simulada")
                // NUNCA aparece na resposta.
                .andExpect(jsonPath("$.message").value(
                        "Erro interno inesperado. Tente novamente mais tarde."));
    }
}
