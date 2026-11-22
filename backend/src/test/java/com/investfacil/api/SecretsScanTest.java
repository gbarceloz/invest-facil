package com.investfacil.api;

import org.junit.jupiter.api.Test;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;
import java.util.regex.Pattern;
import java.util.stream.Stream;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

/**
 * Verificação de ausência de credenciais versionadas (exigência da Missão 02.1, item 7).
 *
 * Escaneia pom.xml, sources e resources procurando padrões de segredos:
 * URL de banco com senha embutida, JWT literal, chaves AWS/Stripe/OpenAI,
 * e atribuições literais de password/secret/api-key (não referências ${ENV}).
 *
 * Este teste falha o build se alguém cometer uma credencial em arquivo versionado.
 */
class SecretsScanTest {

    /** Raiz do projeto Maven (user.dir = diretório de execução do build). */
    private static final Path ROOT = Paths.get(System.getProperty("user.dir")).toAbsolutePath();

    /**
     * Padrões válidos em qualquer arquivo. Em Java, só literais entre aspas
     * contam: declarações como "String token = header.substring(...)" são
     * código, não credenciais.
     */
    private static final List<Pattern> QUOTED_PATTERNS = List.of(
            // postgres://user:senha@host — senha embutida em connection string
            Pattern.compile("(?i)postgres(?:ql)?://[^\\s'\\\"]+:[^\\s'\\\"]+@"),
            // JWT literal (header.payload)
            Pattern.compile("eyJ[A-Za-z0-9_-]{8,}\\.[A-Za-z0-9_-]{8,}"),
            // AWS access key id
            Pattern.compile("AKIA[0-9A-Z]{16}"),
            // Stripe / OpenAI style
            Pattern.compile("sk-(?:live|test|proj)-[A-Za-z0-9_-]{20,}"),
            // password/secret/api_key = "valor literal" (não ${ENV}, não placeholder <...>)
            Pattern.compile("(?i)(?:password|passwd|secret|api[_-]?key|client[_-]?secret)"
                    + "\\s*[:=]\\s*['\\\"](?![\\$\\{<])[A-Za-z0-9!@#$%^&*_+=./-]{12,}['\\\"]")
    );

    /** Atribuições sem aspas só são avaliadas fora de Java (YAML/properties). */
    private static final List<Pattern> UNQUOTED_PATTERNS = List.of(
            Pattern.compile("(?i)(?:password|secret|token)\\s*[:=]\\s*"
                    + "[^\\s'\\\"\\$\\{<][^\\s]{15,}")
    );

    private static final List<String> SCANNED_EXTENSIONS =
            List.of("yml", "yaml", "properties", "xml", "sql", "java", "md", "json", "example", "txt");

    @Test
    void arquivoEnvNaoExisteNoProjeto() {
        assertFalse(Files.exists(ROOT.resolve(".env")),
                ".env é segredo local e não deve existir no diretório versionado do projeto");
    }

    @Test
    void nenhumArquivoVersionadoContemCredenciais() throws IOException {
        assertTrue(Files.isDirectory(ROOT), "user.dir deve apontar para o projeto: " + ROOT);

        List<String> suspeitos = new ArrayList<>();
        try (Stream<Path> walk = Files.walk(ROOT)) {
            walk.filter(p -> !p.toString().contains("target"))
                    .filter(p -> !p.toString().contains(".git"))
                    .filter(Files::isRegularFile)
                    .filter(SecretsScanTest::escaneavel)
                    .forEach(p -> {
                        try {
                            String conteudo = Files.readString(p, StandardCharsets.UTF_8);
                            for (String linha : conteudo.lines().toList()) {
                                String t = linha.strip();
                                if (t.startsWith("#") || t.startsWith("--")
                                        || t.startsWith("//") || t.startsWith("*")) {
                                    continue; // comentários: documentação, não segredo
                                }
                                List<Pattern> patterns = new ArrayList<>(QUOTED_PATTERNS);
                                if (!p.getFileName().toString().endsWith(".java")) {
                                    patterns.addAll(UNQUOTED_PATTERNS);
                                }
                                for (Pattern padrao : patterns) {
                                    if (padrao.matcher(linha).find()) {
                                        suspeitos.add(p.getFileName() + ": " + linha.strip());
                                        break;
                                    }
                                }
                            }
                        } catch (IOException e) {
                            // Binário ou ilegível: ignora (não é falso positivo de segredo)
                        }
                    });
        }

        assertTrue(suspeitos.isEmpty(),
                "Credenciais encontradas em arquivos versionados — corrija antes do commit: "
                        + String.join(" | ", suspeitos));
    }

    private static boolean escaneavel(Path p) {
        String nome = p.getFileName().toString().toLowerCase();
        if (nome.startsWith(".env")) {
            return true; // .env.example é escaneado; .env é proibido pelo outro teste
        }
        int ponto = nome.lastIndexOf('.');
        return ponto >= 0 && SCANNED_EXTENSIONS.contains(nome.substring(ponto + 1));
    }
}
