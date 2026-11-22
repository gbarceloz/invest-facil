# Skill: invest-facil-testing

> **Atualização 20/11/2026:** a suíte atual tem 28 testes de backend
> (incluindo jornada integrada, MFA, reset e append-only) e 6 de frontend.
> Consulte `docs/QUALIDADE_FINAL.md`.

## Regras de Testes — Invest Fácil

> **Decisões aprovadas (T1):** O que está definido e não deve ser alterado sem autorização do arquiteto (GLM).
> **Propostas pendentes:** O que está em discussão ou planejado para T2+.

---

## 1. Princípios Fundamentais

| Regra | Descrição |
|---|---|
| **JUnit 5** | Framework padrão. |
| **Testcontainers obrigatório** | Testes de integração **sempre** contra PostgreSQL real (`postgres:17-alpine`). **H2 proibido** em testes de integração — migrations usam recursos específicos do PostgreSQL (roles, RLS, `gen_random_uuid()`, `timestamptz`, etc.). |
| **Fail-fast** | A aplicação não sobe sem datasource configurado. Testes falham se Docker indisponível (registrados como skipped, nunca como passed falso). |
| **Segurança no build** | `SecretsScanTest` falha o build se detectar padrões de segredo (password/secret/token/api-key literal) em código, resources, pom ou docs. |

---

## 2. Suítes de Teste (T1)

| Suite | Arquivo | O que Valida |
|---|---|---|
| `GlobalExceptionHandlerTest` | `backend/src/test/.../GlobalExceptionHandlerTest.java` | Envelope `ApiError` (404, 400 validation, 400 malformed body, 500 sem vazamento) — 4 testes |
| `FlywaySecurityIntegrationTest` | `backend/src/test/.../FlywaySecurityIntegrationTest.java` | Migrations V1+V2 em banco limpo; `investfacil_app` faz DML, não DDL; papel `investfacil_test_guest` com GRANT SELECT vê **0 linhas** (RLS deny-by-default) — 4 testes |
| `SecretsScanTest` | `backend/src/test/.../SecretsScanTest.java` | Falha o build se houver padrão de segredo versionado (env-with-password, JWT literal, AWS, Stripe/OpenAI, Supabase service key, atribuições literais) — 2 testes |

**Total:** 10 testes, 100% passando no build verificado.

---

## 3. Configuração de Ambiente

| Variável | Valor | Uso |
|---|---|---|
| `DOCKER_HOST` | `tcp://127.0.0.1:2375` | Workaround Docker Desktop 29.x (perfil `-Pdocker-desktop-newapi`) |
| `SPRING_DATASOURCE_URL` | `jdbc:postgresql://localhost:5432/investfacil` (exemplo local) | Via `.env` ou env do CI |
| `SPRING_PROFILES_ACTIVE` | `dev` | Perfil de teste |

**Perfil Maven opcional:** `-Pdocker-desktop-newapi` (apenas nesta máquina — Docker Desktop 29.x + Testcontainers 1.21.3). Em CI/outros ambientes: `mvn -B clean verify` simples.

---

## 4. Regras de Escrita de Testes

| Regra | Detalhe |
|---|---|
| **Nomes de testes** | `should<ExpectedBehavior>When<Condition>` (ex: `shouldReturn403WhenTokenMissing`) |
| **Given/When/Then** | Estrutura explícita em cada teste |
| **Isolamento** | Cada teste roda em transação separada (Spring `@Transactional` ou limpeza manual) |
| **Dados de teste** | Builders ou fixtures — sem fixtures globais mutáveis |
| **Asserções** | AssertJ (`assertThat(...).isEqualTo(...)`) |
| **Mocks** | Apenas para unidades isoladas (ex: `GlobalExceptionHandlerTest`); integração = banco real |

---

## 5. Testes de Concorrência (Obrigatórios a partir de T2)

| Cenário | Expectativa |
|---|---|
| Dois refresh simultâneos com mesmo token | Apenas um succeeds; outro recebe erro de reutilização |
| Refresh token reutilizado após rotação | Família inteira revogada + evento `REFRESH_REUSE_DETECTED` |
| Login concorrente mesmo usuário | Ambos succeeds; refresh tokens independentes |
| Reset de senha concorrente | Apenas um token válido; outros invalidados |
| Criação concorrente de mesmo recurso único (e-mail, slug) | Constraint unique violada → 409/400 |

**Implementação:** `@RepeatedTest` + `CountDownLatch` ou `ExecutorService` para forçar concorrência real.

---

## 6. Testes de Idempotência (Obrigatórios a partir de T2)

| Endpoint | Chave de Idempotência | Comportamento Esperado |
|---|---|---|
| `POST /api/v1/auth/register` | E-mail | 201 na primeira; 409 nas subsequentes |
| `POST /api/v1/auth/refresh` | Refresh token | Rotação a cada uso; reutilização = revogação de família |
| `POST /api/v1/progress/{lessonId}` | `(userId, lessonId)` | Upsert — 201 na primeira, 200 nas subsequentes |
| `POST /api/v1/quiz/{lessonId}/submit` | `(userId, lessonId, attemptId)` | Uma submissão por tentativa |

---

## 6. Cobertura e Qualidade

| Métrica | Mínimo |
|---|---|
| Cobertura de linhas (linhas de código produtivo) | 80% |
| Cobertura de branches | 70% |
| Testes de integração passando | 100% (exceto skipped por Docker indisponível) |
| `SecretsScanTest` | Deve passar (zero segredos) |

**Ferramenta:** JaCoCo (configurado no `pom.xml` se necessário).

---

## 7. Execução Local

```powershell
# Com Docker Desktop 29.x (workaround)
cd backend
$env:DOCKER_HOST = "tcp://127.0.0.1:2375"
mvn -B clean verify -Pdocker-desktop-newapi

# Em CI / outras máquinas
mvn -B clean verify
```

**Sem Docker:** Testes de integração são skipped (registrados), unitários rodam.

---

## 7. CI/CD (Quando Configurado)

| Stage | Comando |
|---|---|
| Build | `mvn -B clean compile` |
| Testes | `mvn -B test` |
| Verificação completa | `mvn -B clean verify` (inclui `SecretsScanTest`, Testcontainers) |
| Análise estática | SpotBugs / Checkstyle (se configurado) |

---

## 8. Decisões NÃO Tomadas (Pendentes)

| Item | Status |
|---|---|
| Framework de contract testing (Pact, Spring Cloud Contract) | Pendente — avaliar na T2/T3 |
| Mutation testing (Pitest) | Pendente — avaliar custo/benefício |
| Testes de carga (k6, Gatling) | Pendente — fase de preparação para produção |
| Testes de acessibilidade (axe) | Pendente — quando frontend existir |

---

## Referências

- `backend/src/test/java/com/investfacil/api/`
- `backend/pom.xml` (dependências Testcontainers, JaCoCo, perfil `docker-desktop-newapi`)
- `docs/security/SECURITY.md` (políticas que testes validam)
- `docs/security/PUBLIC_REPOSITORY_AUDIT.md` (auditoria que inclui validação de testes)
- `backend/T1_RELATORIO.md` (seção 7 — evidências de execução)