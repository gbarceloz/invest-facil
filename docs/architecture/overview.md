# Visão geral da arquitetura

**Status: MVP implementado e testado localmente (20/11/2026).**
Deploy remoto e integrações externas (Supabase/Resend) permanecem pendentes de
credenciais. Onde algo não foi validado, está marcado.

## 1. Decisão central: monólito modular

O Invest Fácil é um **monólito modular**: um único deploy Spring Boot, com
domínios separados como pacotes Java de fronteira rígida.

Por que não microserviços:

- equipe pequena e prazo curto (Hack Brasil, 12/12/2026);
- domínios fortemente acoplados ao ciclo do usuário (progresso → gamificação);
- um banco PostgreSQL já resolve consistência, transações e custo operacional.

A fronteira é pacote + convenção: comunicação entre módulos somente por
interfaces de serviço, nunca pelo repository de outro domínio.

```
com.investfacil.api
├── common         # ApiError, exceções, JWT, TOTP, rate limit, IP
├── config         # SecurityConfig, AppProperties, OpenAPI
├── auth           # cadastro, login, refresh, MFA, e-mail, reset, sessões
├── users          # perfil, papéis USER/ADMIN
├── content        # categorias, módulos, aulas, artigos, busca
├── videos         # metadados + Supabase Storage + upload admin
├── progress       # conclusão, quizzes, métricas
├── gamification   # XP append-only, níveis, conquistas, sequência
├── simulator      # juros compostos, cenários salvos
├── market         # BTC/ETH/SOL informativo + fallback
└── seed           # conteúdo inicial e conta demo opcional
```

Interfaces de fronteira relevantes:

- `ContentCatalog` — conteúdo para progresso, gamificação e vídeos;
- `ProgressMetrics` — métricas de progresso para a gamificação, sem ciclo de beans.

## 2. Requisições e streaming

Spring MVC (servlet) síncrono. O antigo módulo WebFlux/WebSocket/SSE de market
data **não** foi portado. A entrega de cotações é REST + cache em memória (TTL 30 s),
com estados `FRESH`/`UNAVAILABLE` e fallback explícito.

## 3. Erros e observabilidade

- Envelope único `ApiError` (`timestamp, status, code, message, traceId, details`).
- `GlobalExceptionHandler` cobre validação, negócio, conflito, autorização,
  upload e erro inesperado; nunca expõe stack trace/SQL/caminho interno.
- Actuator com `health` e `info`; probes de liveness/readiness; `show-details=never`.
- `server.error.include-stacktrace: never`.

## 4. Banco de dados

- PostgreSQL 17, schema dedicado `investfacil`.
- Flyway é a única fonte de DDL (`V1` a `V7`); Hibernate em `validate`.
- RLS deny-by-default; papéis `investfacil_app` (DML) e
  `investfacil_migrate` (DDL); runtime LOGIN provisionado fora do repositório.
- V3 adiciona MFA/bloqueio em `users`, família em `refresh_tokens`, URL externa
  em `video_assets` e `simulations`; V4 preserva a inflação do cenário; V5
  torna `auth_event`, `xp_ledger` e `user_achievements` append-only.

Detalhes em [database.md](database.md).

## 5. Autenticação (implementada)

- Access JWT HS256 de 15 minutos, emissor e propósito validados.
- Refresh opaco 32 bytes; banco guarda apenas SHA-256; rotação com
  `replaced_by`; reuso revoga a família.
- Verificação de e-mail e reset por token de uso único (hash no banco).
- MFA TOTP (6 dígitos/30 s), segredo criptografado com AES-GCM; replay rejeitado.
- Papel USER/ADMIN sempre lido do banco a cada request.
- Navegador: access em memória; refresh em cookie `HttpOnly`,
  `Secure` (produção), `SameSite=Strict`, `Path=/api/v1/auth`.
- Refresh por cookie exige `X-Requested-With`; CORS explícito.
- Rate limit por IP+bucket; `X-Forwarded-For` só de proxy confiável.
- **Sem Supabase Auth** — autenticação é do backend.

## 6. Segurança do PostgreSQL

- Schema não exposto via PostgREST.
- Privilégio mínimo; runtime sem DDL.
- RLS habilitada e negada por padrão; policy exclusiva do app.
- Autorização de negócio no Spring Security, não no banco.
- Validação em `FlywaySecurityIntegrationTest` com PostgreSQL real.

## 7. Vídeos (implementado; integração real bloqueada)

- Bucket privado no Supabase Storage.
- Upload autenticado como ADMIN, multipart, 50 MB, MIME e assinatura validados.
- Caminho gerado pelo servidor; metadados em `video_assets`.
- Leitura por URL assinada de curta duração; nunca streaming pela heap do servidor.
- Sem credenciais, a UI exibe “vídeo em preparação” — não simula publicação.

## 8. Market data (informativo)

- Binance REST para BTC, ETH e SOL + câmbio USD/BRL.
- Cache TTL 30 s; timeouts curtos; fallback rotulado `UNAVAILABLE`.
- A plataforma não executa ordens, não custodia valores e não recomenda ativos.

## 9. Frontend

- Next.js 16 App Router, TypeScript estrito, Tailwind, Recharts, React Markdown.
- `/api` é reescrito para o backend (`API_PROXY_TARGET`), mantendo cookie
  first-party e evitando CORS no navegador.
- Rotas: landing, login/cadastro/verificação/reset, dashboard, mapa, módulo,
  aula, biblioteca, artigo, mercado, simulador, progresso e perfil.
- Design: fundo `#050505`, acento `#facc15`, Plus Jakarta Sans, cartões escuros.
- Responsivo: sidebar no desktop, navegação inferior no mobile.

## 10. IA educacional (preparação, não dependência)

A arquitetura permite um tutor futuro usando conteúdo revisado e dados de
progresso. Decisões para não comprometer a entrega:

- IA não é dependência da demo;
- nenhum conteúdo gerado sem revisão;
- nenhum dado sensível enviado a provedores sem base legal;
- a interface “Professor em breve” é um placeholder honesto.

## 11. Decisões registradas

- GeoIP removido (nenhuma identificação por geolocalização).
- CSRF desabilitado como mecanismo de sessão; refresh cookie + SameSite +
  `X-Requested-With`.
- Testes de integração sempre contra PostgreSQL real (Testcontainers); H2 proibido.
- Conteúdo seed em JSON idempotente, separado das migrations de schema.
- XP idempotente por índice único parcial; sem farm de aula/quiz.
- Porta local 8081 documentada porque 8080 pode estar ocupada no host.

## 12. Estado das integrações

| Integração | Estado |
|---|---|
| Frontend ↔ backend | **VERIFIED local** (proxy `/api`) |
| Supabase PostgreSQL | **BLOCKED** (sem credenciais; migrations prontas) |
| Supabase Storage | **BLOCKED** (código e SQL prontos) |
| Resend | **BLOCKED** (fallback de log em dev) |
| Render / Vercel | **NOT_STARTED** (Docker/CI/runbook prontos) |
| IA comportamental | **NOT_STARTED** (arquitetura preparada) |
