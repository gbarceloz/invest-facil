# RELEASE READINESS — Invest Fácil

**Data: 2026-11-15 | Revisão final da documentação pública (Missão 03)**
**Confere com: backend/ promovido e revalidado (build SUCCESS, 10/10 testes)**
**Revisado no Adendo 02.6: ADEQUADO para inclusão no primeiro commit** —
sem segredos, sem caminhos pessoais, sem funcionalidades futuras afirmadas
como prontas; pendências restantes marcadas explicitamente (contato de
segurança e push, ambos do proprietário).

## 1. O que está implementado (verificado por build e testes executados)

| Item | Evidência |
|---|---|
| Backend principal: Java 21, Spring Boot 3.5.6, Maven, monólito modular (8 pacotes de domínio) | `backend/pom.xml`, `src/main/java/com/investfacil/api/**` |
| Migrations Flyway V1 (17 tabelas, schema `investfacil`) e V2 (papéis/grants/RLS) | `backend/src/main/resources/db/migration/` |
| PostgreSQL real nos testes (Testcontainers); H2 ausente | `FlywaySecurityIntegrationTest` |
| Segurança de banco validada: app faz DML e não faz DDL; papel convidado com GRANT SELECT vê 0 linhas (RLS deny-by-default) | 4/4 testes de integração |
| Envelope de erro único sem vazamento interno (404/400/500) | `GlobalExceptionHandlerTest` 4/4 |
| API fail-closed: 403 sem token em rotas de negócio; públicas apenas health + Swagger | verificação de runtime (missão 02.1) |
| CORS por variável de ambiente, BCrypt, sessões stateless, sem form login/HTTP Basic | `SecurityConfig` |
| Swagger/OpenAPI (`bearerAuth`) e Actuator (`health` público; `info` exposto mas autenticado) | runtime + `application.yml` |
| Verificação automatizada de segredos versionados (falha o build) | `SecretsScanTest` 2/2 |
| **Ausência de GeoIP** (decisão: nenhum módulo, dependência ou migration de geolocalização) | varredura de dependências e código |
| T1 promovida de `_staging` para `backend/` com hashes idênticos (65/65) e build revalidado no destino | `promotion-manifest.sha256`, `build_promotion.log` |

## 2. O que está planejado (NÃO implementado — não apresentar como pronto)

- **T2 — autenticação**: JWT de 15 min, refresh opaco com rotação/revogação/
  detecção de reuso, verificação de e-mail, reset de senha, rate limiting,
  cookies HttpOnly/Secure/SameSite. Desenho aprovado; código não existe.
- **T3 — conteúdo**: catálogo (categorias/módulos/aulas/artigos) e gestão
  admin; tabelas existem, endpoints e lógica não.
- **T3+ — vídeos**: Supabase Storage com URL assinada; tabela existe, integração não.
- **T4 — progresso/gamificação**: lógica de XP, níveis, conquistas; tabelas existem.
- **P1 até 04/12 — market data**: REST + cache TTL 30s (BTC/ETH, Binance,
  FRESH/STALE/UNAVAILABLE). Contrato aprovado; implementação não iniciada.
- **Frontend** (Next.js + TypeScript): não iniciado.
- **Figma**: link não fornecido; será integrado à apresentação quando fornecido.

## 3. O que foi revisado nesta missão

- `README.md` — funcionalidades implementadas vs planejadas separadas; estado
  real com promoção; pendências frontend/Figma explícitas.
- `docs/architecture/overview.md` — decisões arquiteturais separadas do que
  está implementado; nova seção 10 (integrações pendentes na apresentação).
- `docs/architecture/database.md` — relação Spring Boot ↔ PostgreSQL ↔
  Supabase explicitada (JDBC + Flyway; Supabase = hospedagem + Storage, sem
  Supabase Auth, PostgREST revogado); Flyway como fonte única mantida.
- `docs/security/SECURITY.md` — T1 implementada vs T2 planejada; contato de
  segurança substituído por placeholder `SECURITY_CONTACT_EMAIL_PENDING`.
- `docs/api/README.md` — endpoints públicos conferidos contra `SecurityConfig`
  (leitura) — apenas health e Swagger são públicos.
- `docs/security/PUBLIC_REPOSITORY_AUDIT.md` — estado pós-promoção; histórico
  Git: **não existe repositório; não há histórico auditado pós-publicação**;
  verificações datadas e responsabilidade do proprietário antes do push.

## 4. Pendências para publicação (proprietário)

1. Substituir `SECURITY_CONTACT_EMAIL_PENDING` pelo e-mail real (decisão do
   proprietário: usar um e-mail real — endereço ainda não fornecido).
2. Criar o repositório remoto e executar o push conforme
   `git-publication-plan.md` (nenhum push foi feito pelos agentes).
3. Reexecutar as verificações de `PUBLIC_REPOSITORY_AUDIT.md` imediatamente
   antes do push.
4. ~~Definir licença~~ **resolvido (Adendo 02.6)**: decisão do proprietário é
   **NONE** — README atualizado, nenhum arquivo LICENSE, nada declarado como
   open source.
5. Fornecer URL do Figma quando disponível (não bloqueia o backend).

## 5. Limitações conhecidas (registradas, não ocultas)

- Perfil Maven opcional `-Pdocker-desktop-newapi` é específico da máquina
  atual (Docker Desktop 29.x × Testcontainers 1.21.3). Em CI/outras máquinas:
  `mvn -B clean verify` simples.
- Testes de integração pulados (honestamente registrados) quando Docker está
  indisponível — nunca substituídos por falso sucesso.
- Sem entidades JPA ainda: `ddl-auto: validate` não valida mapeamentos até T2.
- `/actuator/info` está exposto pela configuração do management, mas exige
  autenticação (não está no `permitAll`).
- Logs de build contêm senhas efêmeras de runtime e caminhos locais —
  excluídos do commit via `.gitignore` (raiz, no plano).

## 6. Checklist de apresentação para avaliadores

- [x] Problema, público-alvo e proposta de valor claros (README).
- [x] Funcionalidades **implementadas** e **planejadas** em seções separadas.
- [x] Nenhuma funcionalidade futura apresentada como pronta (JWT, refresh,
      e-mail, vídeos, market data marcados como planejados).
- [x] Arquitetura e stack documentadas e conferidas contra o código.
- [x] Como executar localmente (build + API) — comandos reais, executados.
- [x] Variáveis de ambiente documentadas (`.env.example` sem valores).
- [x] Como executar testes — incluindo comportamento sem Docker.
- [x] Estado real do desenvolvimento: T1 concluída e verificada; T2 não iniciada.
- [x] Segurança: modelo de banco validado com papel de teste; auditoria de
      publicação concluída; contato de segurança pendente marcado como tal.
- [x] Créditos sem nomes inventados.
- [x] Licença: decisão **NONE** registrada no README — repositório público
      **não** equivale a open source; sem arquivo LICENSE.
- [ ] Pendência do proprietário: link Figma / frontend na apresentação.
- [ ] Pendência do proprietário: contato de segurança e push do repositório.

## 7. Conferência final documentação ↔ arquivos reais (Missão 03)

| Afirmação na documentação | Fonte real | Confere? |
|---|---|---|
| 17 tabelas | `CREATE TABLE` em `V1__init.sql` = 17 | ✅ |
| Java 21 / Boot 3.5.6 / springdoc 2.8.9 | `pom.xml` | ✅ |
| 10 testes, 3 suítes | 3 arquivos em `src/test` | ✅ |
| Públicos: `/actuator/health/**`, `/error`, Swagger | `SecurityConfig` (leitura) | ✅ |
| Actuator `health,info` expostos | `application.yml` | ✅ |
| RLS + papéis como descrito | `V2__postgres_security.sql` | ✅ |
| Sem GeoIP | pom/sem dependência, sem classe | ✅ |
| Sem endpoints de negócio | nenhum `@RestController` de negócio | ✅ |
| Sem credenciais | `SecretsScanTest` + varredura manual | ✅ |
