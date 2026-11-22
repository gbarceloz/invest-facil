# Invest Fácil

Plataforma web de **educação financeira** para o Brasil, com trilhas curtas,
quizzes, simulador com dinheiro fictício e gamificação honesta. Projeto do
**Hack Brasil 2026** (final em **12/12/2026**).

> **Promessa:** aprender antes de arriscar. A plataforma **não executa ordens,
> não custodia valores e não promete rentabilidade**.

---

## Estado atual (22/11/2026)

| Camada | Estado |
|---|---|
| Backend Spring Boot + PostgreSQL | **funcional e testado localmente** (28 testes) |
| Autenticação completa | **implementada e testada** (JWT, refresh, MFA, e-mail, reset, sessões) |
| Frontend Next.js | **funcional** (19 rotas de aplicação + not-found; 6 testes; build verde) |
| Integração frontend ↔ backend | **validada manualmente** em sessão local (login, aula, quiz, simulador, perfil); sem E2E automatizado |
| CI e governança de agentes | CI em todas as branches/PRs; execução remota **não verificada**; 8 agentes locais com default-deny; riscos globais abertos (P0.3) |
| Banco remoto (Supabase) | **pendente de credenciais** |
| Upload/playback real de vídeo | **pendente de credenciais** (código pronto) |
| E-mail transacional (Resend) | **pendente de credenciais** (fallback de log em dev) |
| Deploy (Render/Vercel) | **não executado** (Docker/CI/runbook prontos) |

Nada acima de “pendente” é apresentado como production-ready. A auditoria
completa está em [`docs/AUDITORIA_GERAL.md`](docs/AUDITORIA_GERAL.md).

---

## O problema

Quem começa a investir no Brasil escolhe entre conteúdo técnico em inglês, dicas
soltas em redes sociais e plataformas cujo negócio é incentivar transações.
Falta um caminho claro, em português, que ensine o risco **antes** do primeiro real.

**Público-alvo:** jovens de 18 a 25 anos, iniciantes, sem familiaridade com o
mercado.

## A proposta

- **Trilhas estruturadas:** 8 categorias, 12 módulos, 31 aulas e 6 artigos.
- **Aprendizado ativo:** 62 questões de quiz; XP por aula concluída e quiz aprovado.
- **Simulador educativo:** capital inicial, aportes, prazo, taxa hipotética,
  inflação e comparação de cenários.
- **Gamificação honesta:** níveis, conquistas e sequência de estudos — sem
  recompensa por transação.
- **Contexto, não recomendação:** cotações BTC/ETH/SOL apenas informativas.
- **Segurança de produto real:** JWT curto, refresh rotativo com detecção de
  reuso, MFA TOTP, rate limit, RLS no PostgreSQL.

---

## Stack

| Camada | Tecnologia |
|---|---|
| Linguagem | Java 21 |
| Backend | Spring Boot 3.5.6 (Web MVC, Security, Data JPA, Validation, Actuator) |
| Build | Maven |
| Banco | PostgreSQL 17 (schema `investfacil`) |
| Schema | Flyway V1–V5 (fonte única; `ddl-auto=validate`) |
| Auth | JWT HS256 + refresh opaco + TOTP + BCrypt |
| Docs de API | springdoc-openapi (Swagger UI) |
| Frontend | Next.js 16 + React 19 + TypeScript + Tailwind + Recharts |
| Testes | JUnit 5, Testcontainers (PostgreSQL real), Vitest/Testing Library |
| Infra | Docker, Render (backend), Vercel (frontend), Supabase (DB + Storage) |

---

## Arquitetura

Monólito modular com um único deploy; cada domínio é um pacote Java com fronteira
documentada. Comunicação entre módulos por interfaces de serviço, nunca pelo
repository de outro domínio.

```
backend/src/main/java/com/investfacil/api/
├── auth/          cadastro, login, refresh, MFA, e-mail, reset, sessões
├── users/         perfil e papéis
├── content/       categorias, módulos, aulas, artigos
├── videos/        metadados + Supabase Storage
├── progress/      conclusão, quizzes, métricas
├── gamification/  XP, níveis, conquistas, sequência
├── simulator/     juros compostos e cenários salvos
├── market/        cotações informativas + fallback
├── common/        erros, JWT, TOTP, rate limit, IP
├── config/        segurança, propriedades, OpenAPI
└── seed/          conteúdo inicial e conta demo opcional

frontend/
├── app/           landing, auth, app shell, dashboard, aulas, biblioteca,
│                  mercado, simulador, progresso, perfil
├── components/    design system, shell, gráficos, markdown, player
└── lib/           API client, auth, app data, tipos, formatadores
```

Detalhes: [`docs/architecture/overview.md`](docs/architecture/overview.md) e
[`docs/architecture/database.md`](docs/architecture/database.md).

---

## Executar localmente

Pré-requisitos: JDK 21, Maven, Node 18+, Docker (PostgreSQL).

### 1. Banco

```powershell
docker run -d --name investfacil-db `
  -e POSTGRES_PASSWORD=local `
  -e POSTGRES_DB=investfacil `
  -p 5433:5432 postgres:17-alpine
```

### 2. Backend (porta 8081 no host)

A porta 8080 é o padrão do projeto, mas pode estar ocupada; use `PORT` para
escolher. Exemplo:

```powershell
cd backend
$env:JAVA_HOME="C:\caminho\para\jdk-21"
$env:JWT_SECRET=[Convert]::ToBase64String((1..48 | % { Get-Random -Maximum 256 }))
$env:SPRING_PROFILES_ACTIVE="dev"
$env:PORT="8081"
$env:SPRING_DATASOURCE_URL="jdbc:postgresql://localhost:5433/investfacil"
$env:SPRING_DATASOURCE_USERNAME="postgres"
$env:SPRING_DATASOURCE_PASSWORD="local"
$env:APP_DEMO_ENABLED="true"
$env:DEMO_EMAIL="marina@investfacil.local"
$env:DEMO_PASSWORD="<defina-uma-senha-forte-local>"
$env:DEMO_NAME="Marina Lima"
$env:MAIL_ENABLED="false"
mvn spring-boot:run
```

- Swagger: <http://localhost:8081/swagger-ui.html>
- Health: <http://localhost:8081/actuator/health>
- API: <http://localhost:8081/api/v1/...>

### 3. Frontend

```powershell
cd frontend
$env:API_PROXY_TARGET="http://localhost:8081"
npm install
npm run dev
```

Abrir <http://localhost:3000>. O `/api` é reescrito para o backend, então o
cookie de refresh é first-party.

> A conta demo só é criada se `APP_DEMO_ENABLED=true` e `DEMO_PASSWORD` estiver
> definido. Nenhuma senha é versionada.

---

## Testes

```powershell
# Backend — 28 testes, incluindo PostgreSQL real via Testcontainers
cd backend
$env:DOCKER_HOST="tcp://127.0.0.1:2375"
mvn -B test -Pdocker-desktop-newapi
```

Em CI/outra máquina, use `mvn -B verify` (sem o perfil local). O perfil
`docker-desktop-newapi` é um workaround do Docker Desktop 29 desta máquina.

```powershell
# Frontend — 6 testes + build de produção
cd frontend
npm test
npm run build
```

Cobertura funcional dos testes:

- cadastro → verificação → login → conteúdo → conclusão idempotente → quiz →
  XP → simulador → rotação de refresh → detecção de reuso;
- migrations + RLS + privilégios de banco;
- TOTP (vetor RFC 6238), JWT, validação, simulador, resolução de IP;
- envelope de erro sem vazamento; ausência de segredos versionados.

---

## Segurança (resumo)

- API **fail-closed**; públicos: health, Swagger, catálogo, auth pública e
  cálculo do simulador.
- Login exige e-mail verificado; reenvio de verificação disponível.
- Access JWT 15 min; refresh opaco com hash SHA-256, rotação e revogação de
  família em caso de reuso.
- MFA TOTP com segredo criptografado (AES-GCM), proteção contra replay e setup
  exigindo a senha atual.
- Cookie `HttpOnly`, `Secure` em produção, `SameSite=Strict`; refresh exige
  `X-Requested-With`.
- Rate limit por IP+bucket; `X-Forwarded-For` só de proxy listado.
- RLS deny-by-default; runtime sem DDL; ledgers de auditoria/XP append-only;
  PostgREST sem acesso ao schema.
- Upload de vídeo valida MIME, assinatura e tamanho; bucket privado.
- Nenhum segredo no repositório; `SecretsScanTest` falha o build.

Detalhes: [`docs/security/SECURITY.md`](docs/security/SECURITY.md).

---

## Deploy

Runbook completo em [`docs/DEPLOY.md`](docs/DEPLOY.md). Resumo:

1. Supabase: banco + Storage; aplicar V1–V5; provisionar runtime role.
2. Render: backend via `backend/Dockerfile`; health `/actuator/health`.
3. Vercel: frontend com `API_PROXY_TARGET` para o Render.
4. Resend: e-mail real (`MAIL_ENABLED=true`).
5. Validar o checklist de release (inclui cookie, 401, Swagger e E2E).

Arquivos: `render.yaml`, `backend/Dockerfile`, `docker-compose.yml`,
`.github/workflows/ci.yml`, `docs/supabase/*.sql`.

---

## Documentação

| Documento | Conteúdo |
|---|---|
| [`docs/engineering/CONTEXT_INDEX.md`](docs/engineering/CONTEXT_INDEX.md) | ponto de entrada: domínio → fonte oficial → evidência |
| [`docs/architecture/README.md`](docs/architecture/README.md) | mapas técnicos, 18 features e caminhos críticos |
| [`docs/engineering/SOURCE_REGISTRY.md`](docs/engineering/SOURCE_REGISTRY.md) | matriz de fontes, owners funcionais, frescor e conflitos |
| [`docs/engineering/SOURCE_OF_TRUTH.md`](docs/engineering/SOURCE_OF_TRUTH.md) | hierarquia de autoridade, status e resolução de conflitos |
| [`docs/AUDITORIA_GERAL.md`](docs/AUDITORIA_GERAL.md) | auditoria GitHub/workspace/Figma, riscos, plano |
| [`docs/PROGRESSO_GERAL.md`](docs/PROGRESSO_GERAL.md) | ledger de tarefas e evidências |
| [`docs/AGENTES_70.md`](docs/AGENTES_70.md) | 70 papéis documentais (não são 70 agentes executáveis) |
| [`docs/DEMO_SCRIPT.md`](docs/DEMO_SCRIPT.md) | roteiro de 8–10 min + plano B |
| [`docs/APRESENTACAO.md`](docs/APRESENTACAO.md) | pitch, narrativa, critérios, Q&A |
| [`docs/DEPLOY.md`](docs/DEPLOY.md) | runbook de produção |
| [`docs/QUALIDADE_FINAL.md`](docs/QUALIDADE_FINAL.md) | relatório final de qualidade e veredito |
| [`docs/FIREBASE_EVALUATION.md`](docs/FIREBASE_EVALUATION.md) | avaliação Firebase Spark/Blaze e decisão |
| [`docs/CAPCUT_MCP_SETUP.md`](docs/CAPCUT_MCP_SETUP.md) | MCP CapCut, hardening, testes e limitações |
| [`docs/CONTENT_PIPELINE.md`](docs/CONTENT_PIPELINE.md) | pipeline e templates de vídeo educativo |
| [`docs/COMPLEMENTARY_MISSION_REPORT.md`](docs/COMPLEMENTARY_MISSION_REPORT.md) | relatório Firebase + CapCut + conteúdo |
| [`docs/api/README.md`](docs/api/README.md) | endpoints e exemplos |
| [`docs/architecture/`](docs/architecture/) | visão geral e banco |
| [`docs/security/`](docs/security/) | política e auditoria pública |

---

## Limitações conhecidas

- Deploy remoto, Supabase e Resend **não** foram validados nesta sessão por
  ausência de credenciais.
- A CI foi executada localmente (parse, integridade e gates), mas **não** há evidência de
  execução no GitHub Actions nem branch protection.
- A validação de integração é manual; não há E2E automatizado de browser.
- O P0.3 manteve riscos abertos: MCP global com acesso ao projeto, shell amplo em 10
  agentes globais, browser não verificado e ausência de sandbox/aprovação técnica.
- O player exibe “vídeo em preparação” quando não há vídeo publicado; a
  integração com o bucket privado está implementada, mas sem teste real.
- Cotações usam fallback estático quando o provedor está indisponível; a UI
  marca “referência estática”.
- Rate limit é em memória (uma instância). Para escalar, usar Redis.
- Sem teste de carga, auditoria WCAG formal ou pesquisa com usuários nesta fase.
- A conta demo é local e deve ser desabilitada/rotacionada após a apresentação.

---

## Equipe e licença

Backend, frontend, conteúdo e documentação implementados com apoio de agentes de
IA, sob direção do proprietário do projeto. Nomes pessoais e contato de segurança
permanecem a definir pelo proprietário; nenhum nome foi inventado.

**Licença: NONE.** O repositório é público apenas para avaliação no Hack Brasil;
nenhuma licença de reutilização foi concedida e nenhum arquivo `LICENSE` deve ser
criado. Repositório público **não** significa open source.
