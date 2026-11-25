package com.investfacil.api.seed;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.core.io.ClassPathResource;

import java.io.InputStream;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

/**
 * Valida o seed do Módulo 01 sem Spring e sem banco (não depende de Docker).
 * Protege o contrato do conteúdo: 8 slugs canônicos e exatamente 3 perguntas
 * por aula, cada uma com 4 alternativas e índice correto válido.
 */
class Module01SeedTest {

    private static final List<String> CANONICAL_SLUGS = List.of(
            "o-que-e-dinheiro",
            "por-que-o-dinheiro-tem-valor",
            "como-o-dinheiro-surgiu",
            "o-que-e-inflacao",
            "por-que-100-hoje-nao-vale-o-mesmo-no-futuro",
            "o-que-e-poder-de-compra",
            "o-que-sao-juros",
            "juros-simples-vs-compostos");

    @Test
    void modulo01TemOitoAulasCanonicasComTresPerguntasCada() throws Exception {
        ContentSeedService.SeedData data;
        try (InputStream input = new ClassPathResource("seed/content.json").getInputStream()) {
            data = new ObjectMapper().readValue(input, ContentSeedService.SeedData.class);
        }

        ContentSeedService.SeedCategory fundamentos = data.categories().stream()
                .filter(category -> "fundamentos".equals(category.slug()))
                .findFirst()
                .orElseThrow();
        ContentSeedService.SeedModule module = fundamentos.modules().stream()
                .filter(candidate -> "entenda-o-dinheiro".equals(candidate.slug()))
                .findFirst()
                .orElseThrow();

        assertNotNull(module.title());
        assertEquals(8, module.lessons().size(), "Módulo 01 deve ter exatamente 8 aulas");

        List<String> slugs = module.lessons().stream()
                .map(ContentSeedService.SeedLesson::slug)
                .toList();
        assertEquals(CANONICAL_SLUGS, slugs, "slugs canônicos e ordem do arquivo de missão");

        for (ContentSeedService.SeedLesson lesson : module.lessons()) {
            assertEquals(2, lesson.estimatedMin(), "estimativa curta: " + lesson.slug());
            assertEquals(3, lesson.quiz().size(),
                    "cada aula deve ter exatamente 3 perguntas: " + lesson.slug());
            for (ContentSeedService.SeedQuestion question : lesson.quiz()) {
                assertEquals(4, question.options().size(),
                        "cada pergunta deve ter 4 alternativas: " + lesson.slug());
                assertTrue(question.options().stream()
                                .noneMatch(option -> option == null || option.isBlank()),
                        "alternativas não podem ser vazias: " + lesson.slug());
                assertTrue(question.correctIndex() >= 0
                                && question.correctIndex() < question.options().size(),
                        "correctIndex inválido em " + lesson.slug());
            }
        }
    }
}
