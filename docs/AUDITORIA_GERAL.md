# AUDITORIA GERAL — Invest Fácil

> **Atualização S2.8 (22/11/2026):** relatório histórico. Estado atual: V1-V7, 63 testes, RLS per-user; a V7 é local e ainda não foi aplicada no Lab. Ver docs/verification/S2.8/S2.8_DATABASE_FUNCTION_HARDENING_REPORT.md.

**Data:** 20/11/2026
**Responsável:** Project Commander (agente principal), com revisões independentes
**Deadline:** 12/12/2026 (Hack Brasil)
**Método:** inspeção direta do workspace, Git/GitHub CLI, leitura de código e migrations,
execução de builds/testes e navegação no protótipo Figma. Nenhum resultado abaixo foi
inventado; quando algo não pôde ser verificado, está marcado como **NÃO VERIFICADO**.

> **Nota P0.4 (22/11/2026):** relatório histórico de 20/11. Correções comprovadas:
> 20 entradas de rota (19 app + not-found) e 8/12/31/62/6 no seed (categorias/módulos/
> aulas/questões/artigos). CI passou a cobrir todas as branches em P0.2, mas execução
> remota continua não verificada. Fonte atual: `CONTEXT_INDEX.md`.

---

## 1. Resumo executivo

| Dimensão | Estado em 20/11/2026 |
|---|---|
| Repositório GitHub | `github.com/gbarceloz/invest-facil` público, branch `main`, 2 commits |
| Backend | Spring Boot 3.5.6 / Java 21; T1 promovida; MVP de auth, conteúdo, progresso, gamificação, simulador, vídeos e mercado implementado nesta sessão |
| Banco | PostgreSQL 17, Flyway V1 (17 tabelas) + V2 (papéis/RLS) + V3 (MFA, famílias de refresh, simulações, índice anti-farm) + V4 (inflação) + V5 (ledgers append-only) |
| Frontend | **não existia**; Next.js 16 + TypeScript + Tailwind criado nesta sessão, com 19 rotas de aplicação + not-found |
| Figma | protótipo acessível em `join-lend-92404854.figma.site`; identidade dark/amarelo/Plus Jakarta Sans capturada |
| Testes | backend: **28 testes** (unitários + integração PostgreSQL real via Testcontainers); frontend: **6 testes**; builds verdes |
| Deploy | Dockerfile, `render.yaml`, CI e runbook prontos; **nenhum deploy remoto executado** (sem credenciais/autorização) |
| Segurança | JWT 15 min, refresh opaco com hash/rotação/reuso, MFA TOTP, verificação de e-mail, reset, sessões, rate limit, RBAC, RLS |
| Pendências externas | credenciais Supabase/Resend, contas Render/Vercel, vídeos reais, contato de segurança, push/merge |

**Veredito:** o produto está funcional localmente e pronto para uma demonstração
controlada. Ainda **não** está publicado/validado em ambiente remoto. A entrega
não depende de IA comportamental nem de cotações ao vivo.

---

## 2. GitHub — o que foi verificado

Comandos executados (somente leitura):

```powershell
gh auth status
gh repo view gbarceloz/invest-facil --json name,description,visibility,defaultBranchRef,pushedAt
git log --oneline --all
git remote -v
git branch -a
git status --short
```

Resultados:

- Conta autenticada: `gbarceloz` (token com escopos `repo`, `workflow` etc.).
- Repositório: **público**, descrição “Invest Facil - plataforma de educacao financeira
  e investimentos”, branch padrão `main`.
- Commits remotos:
  - `827e54a` — import inicial do backend T1;
  - `ae9f7e2` — documentação pública + skills do Claude Code.
- Não há branches remotas adicionais, tags, releases ou workflows de CI no momento da
  auditoria (o workflow foi criado nesta sessão, ainda não publicado).
- O workspace local estava exatamente em `ae9f7e2`, com um único arquivo não rastreado:
  `git-publication-plan.md` (documento de recomendação, preservado).
- Código duplicado/divergente: a duplicata de `market-data` está preservada em
  `_quarantine/backend-market-data-duplicate-20261114`; o staging antigo está em
  `_staging/market-data` e `_staging/backend-skeleton`. Nada foi apagado.
- O repositório **não** contém frontend no commit remoto; o frontend e o MVP
  existem nos commits locais `dc18b60` e `8ee5d77` (branch `feat/mvp-completo`)
  até que o proprietário autorize push/merge.

### RBS (referência, não alterar)

`<external-project>\Desafio-GC-RBS` foi apenas inspecionado com `git status`/`git log`.
Ele já possuía modificações locais **antes** desta missão (arquivos em
`backend/src/main/java/com/rbs/...`). Nenhum arquivo do RBS foi alterado por esta
sessão. A referência foi usada apenas como inspiração de padrões (BCrypt, envelope
de erro, organização), não como base copiada.

---

## 3. Workspace local — o que existe de fato

```
<repo>
├── backend/                 API Spring Boot (T1 + MVP desta sessão)
│   ├── src/main/java/com/investfacil/api/
│   │   ├── auth/            cadastro, login, refresh, MFA, e-mail, reset, sessões
│   │   ├── users/           entidade, perfil, papéis
│   │   ├── content/         categorias, módulos, aulas, artigos
│   │   ├── videos/          metadados + Supabase Storage + upload admin
│   │   ├── progress/        conclusão, quizzes, métricas
│   │   ├── gamification/    XP, níveis, conquistas, sequência
│   │   ├── simulator/       cálculo e cenários salvos
│   │   ├── market/          BTC/ETH/SOL informativo + fallback
│   │   ├── seed/            conteúdo, conquistas, conta demo
│   │   ├── common/          ApiError, exceções, segurança, rate limit
│   │   └── config/          SecurityConfig, AppProperties, OpenAPI
│   ├── src/main/resources/db/migration/  V1, V2, V3
│   ├── src/test/java/       28 testes
│   └── Dockerfile
├── frontend/                Next.js 16 + TypeScript + Tailwind (novo)
│   ├── app/                 landing, auth, app shell, dashboard, aulas, biblioteca,
│   │                        mercado, simulador, progresso, perfil
│   ├── components/          design system, shell, gráficos, markdown, player
│   ├── lib/                 API client, auth, app data, tipos, formatadores
│   └── __tests__/           6 testes Vitest
├── docs/                    arquitetura, segurança, API, deploy, Supabase, este relatório
├── _audit/                  evidências internas (não publicadas)
├── _staging/                T1 e market-data preservados
├── _quarantine/             duplicata de market-data preservada
├── scripts/                 geração de seed e dos 70 papéis
├── .github/workflows/ci.yml CI (backend + frontend)
├── docker-compose.yml       Postgres + API local
├── render.yaml              blueprint do backend
└── README.md
```

### T1 e Missão 01.2

- `backend/` estava vazio antes da promoção; a T1 foi promovida de
  `_staging/backend-skeleton` com manifesto de hashes (`promotion-manifest.sha256`).
- O staging da T1 permanece intacto (12 fontes Java no skeleton) e o `backend/`
  atual tem 94 fontes Java (T1 + módulos novos). A diferença é explicada pelo MVP,
  não por sobrescrita de trabalho alheio.
- O relatório `_audit/mission-01-2-report.md` afirma que a reconciliação foi
  concluída e que o `backend/` estava livre. A conclusão é compatível com o estado
  encontrado; porém o relatório **não comprova** a execução do build no destino
  (o manifesto só prova hashes). O build foi reexecutado nesta sessão e passou.
- `_staging/market-data` contém o módulo WebFlux antigo (market data por stream).
  Ele **não** foi portado: a decisão arquitetural é REST + cache, compatível com
  Spring MVC. O código antigo fica preservado como referência.

---

## 4. Figma — o que foi observado

URL: `https://join-lend-92404854.figma.site/`

Telas/fluxos navegados no protótipo:

- **Landing**: header com Aprender/Mercado/Dicionário/Sobre, Entrar e “Começar agora”;
  hero “Aprenda a investir antes de colocar seu dinheiro em risco”; cards de próxima
  missão e jornada; seção “Como funciona” (01 Aprenda, 02 Pratique, 03 Entenda);
  filosofia; CTA final.
- **App shell**: sidebar com Início, Aprender, Mercado, Simular, Progresso, Perfil;
  nível e XP; “Professor em breve”; busca; navegação mobile na parte inferior.
- **Dashboard**: saudação, sequência, próxima missão, progresso por nível, estatísticas,
  lista de criptoativos.
- **Aprender**: mapa com níveis 01–06 (Fundamentos, Mercado, Bitcoin, Trading, DeFi,
  Avançado), conceitos por nível, estados Revisar/Continuar/Bloqueado.
- **Mercado**: tabela de criptoativos (BTC, ETH, SOL, BNB, XRP), preço, 24h, market cap.
- **Simular**: carteira virtual com saldo fictício e estado vazio.
- **Progresso**: média de quizzes, missões concluídas, sequência, decisões analisadas,
  domínio por tema.
- **Perfil**: identidade, conquistas e estatísticas.

Identidade visual capturada:

| Token | Valor observado |
|---|---|
| Fundo | `#050505` / cards `#181818` / borda `#2b2b2b` |
| Acento | `#facc15` (amarelo) |
| Texto | branco/quase branco; secundário cinza |
| Fonte | Plus Jakarta Sans |
| Forma | cartões arredondados, sidebar escura, CTAs em pílula |

**Decisões de adaptação:** o protótipo é centrado em cripto. O escopo do Hack Brasil
pede educação financeira ampla (renda fixa, variável, FIIs, ETFs, cripto, risco e
planejamento). O frontend preserva a identidade e a navegação, mas usa as 8 trilhas
do produto e um simulador de juros compostos (não uma carteira de trading). O
“Professor em breve” foi mantido como evolução, sem prometer IA pronta.

---

## 5. Arquitetura atual (implementada)

- **Monólito modular** Spring Boot, um deploy, fronteiras por pacote. Comunicação
  entre domínios por interfaces de serviço (`ContentCatalog`, `ProgressMetrics`,
  `ContentCatalog.LessonRef` etc.), não por repositories alheios.
- **API REST** em `/api/v1/**`; documentação springdoc em `/v3/api-docs` e
  `/swagger-ui.html`.
- **Banco**: PostgreSQL 17, schema `investfacil`, Flyway como única fonte de DDL,
  `ddl-auto=validate`.
- **Segurança**: JWT HS256 15 min; refresh opaco 32 bytes (hash SHA-256, família,
  rotação, detecção de reuso); access token em memória no cliente; refresh em cookie
  `HttpOnly`/`Secure`/`SameSite=Strict`; MFA TOTP; verificação de e-mail; reset;
  bloqueio por tentativas; rate limit por IP+bucket; RBAC lido do banco.
- **Frontend**: Next.js 16 App Router, TypeScript estrito, Tailwind, Recharts,
  React Markdown; `/api` é proxy same-origin para o backend (cookie first-party).
- **Infra**: Dockerfile multi-stage não-root; `render.yaml`; CI; compose local.

### Endpoints principais

| Área | Rotas |
|---|---|
| Auth | `POST /auth/register`, `/login`, `/refresh`, `/logout`, `/verify-email`, `/resend-verification`, `/forgot-password`, `/reset-password`, `/mfa/setup`, `/mfa/enable`, `/mfa/disable`, `/mfa/verify`, `/change-password`, `GET/DELETE /auth/sessions` |
| Usuários | `GET/PATCH /users/me` |
| Conteúdo | `GET /content/categories`, `/modules/{slug}`, `/lessons/{slug}`, `/articles`, `/articles/{slug}`, `/search`, `/lessons/{slug}/video` |
| Progresso | `POST/GET /progress/lessons/{id}`, `GET/POST /progress/lessons/{id}/quiz`, `GET /progress/summary` |
| Gamificação | `GET /gamification/summary`, `/achievements`, `/xp` |
| Simulador | `POST /simulator/calculate`, `GET/POST /simulator/scenarios`, `DELETE /simulator/scenarios/{id}` |
| Mercado | `GET /market/assets` |
| Admin | `POST /admin/videos/{lessonId}` (multipart), `GET /admin/videos` |

---

## 6. Estado real por módulo

| Módulo | Estado | Evidência |
|---|---|---|
| Backend T1 (erros, segurança base, Swagger, Actuator) | **VERIFIED** | build + testes; runtime local |
| Schema V1/V2 | **VERIFIED** | Testcontainers; RLS/roles |
| V3 (MFA, família, simulações) | **VERIFIED** | migration aplicada em banco limpo |
| Cadastro/login/JWT/refresh/logout | **VERIFIED** | `MvpFlowIntegrationTest` |
| Reuso de refresh/revogação de família | **VERIFIED** | teste integrado (401 + família revogada) |
| Verificação de e-mail/reset | **IMPLEMENTED**; envio real **NÃO VERIFICADO** | lógica + fallback de log; sem provedor configurado |
| MFA TOTP | **TESTED (API)**; UI **NÃO VERIFICADA** ponta a ponta | unit TOTP + teste manual: setup → enable → login com desafio → verify → replay 401 → disable |
| Rate limit | **VERIFIED** (unit/indireto) | filter; testes de IP; sem teste de carga |
| Conteúdo educativo | **VERIFIED** | 8 categorias, 12 módulos, 31 aulas, 62 questões, 6 artigos no seed |
| Quizzes/progresso/XP | **VERIFIED** | teste integrado; idempotência |
| Gamificação | **VERIFIED** | XP, níveis, 7 conquistas; teste integrado |
| Simulador | **VERIFIED** | cálculo + endpoints + UI local |
| Vídeos/Supabase Storage | **IMPLEMENTED / BLOCKED (externo)** | upload/URL assinada codificados; sem credenciais para testar upload real |
| Mercado | **IMPLEMENTED / fallback** | Binance + câmbio; fallback estático rotulado |
| Frontend | **VERIFIED (build)**; E2E manual local | 19 rotas de aplicação + not-found; 6 testes; navegação real no browser |
| Deploy remoto | **NOT_STARTED** | sem credenciais; runbook pronto |
| Imagem Docker | **VERIFIED (local)** | build multi-stage + container prod com health 200 e Flyway validado |
| Documentação | **VERIFIED (parcial)** | este relatório + progresso + deploy + README |

---

## 7. Problemas encontrados e correções

1. **Frontend inexistente.** Criado do zero em Next.js 16, respeitando a identidade
   do Figma e integrando com a API real.
2. **Autenticação inexistente.** Implementada com JWT, refresh opaco, rotação,
   reuso, MFA, verificação, reset, sessões e RBAC.
3. **Auditoria de cadastro violava FK.** O `auth_event` era gravado em transação
   separada antes do commit do usuário, causando `auth_event_user_id_fkey`.
   Corrigido: auditoria participa da transação corrente; falhas de login sem
   transação externa continuam sendo registradas.
4. **Query nativa de datas retornava `java.sql.Date`.** Conversão para `LocalDate`
   falhava no resumo de gamificação. Corrigido com conversão explícita.
5. **`logout` sem transação.** A revogação de família usava query `@Modifying` fora
   de transação. Corrigido com `@Transactional`.
6. **Teste de segredos com falsos positivos em Java.** O scanner tratava
   `String token = header.substring(...)` como credencial. Ajustado para aplicar
   padrões sem aspas apenas fora de Java, mantendo a proteção de literais.
7. **Teste WebMvc quebrado pela nova cadeia de segurança.** Filtros e config
   passaram a exigir beans inexistentes no slice. Corrigido com exclusão/mocks
   explícitos, sem desligar a segurança da aplicação real.
8. **Docker Desktop 29 + Testcontainers.** O workaround local é o perfil Maven
   `-Pdocker-desktop-newapi` e `DOCKER_HOST=tcp://127.0.0.1:2375`; em CI usa-se o
   comando simples. O perfil é documentado, não obrigatório.
9. **`.next` corrompido** ao rodar `next build` concorrente com `next dev`. Não é
   bug de produto; o processo de dev foi reiniciado com cache limpo.
10. **Conteúdo inicial vazio.** Criado seed idempotente com 31 aulas, 62 questões
    de quiz, 6 artigos e 7 conquistas; sem promessas de rentabilidade.
11. **MFA setup sem reautenticação.** A revisão independente apontou que um
    access token roubado poderia cadastrar um autenticador. Corrigido: setup
    exige a senha atual; a UI foi ajustada.
12. **Login permitia e-mail não verificado.** A verificação era decorativa.
    Corrigido: login (e verify MFA) respondem `403 EMAIL_NOT_VERIFIED` até a
    confirmação; teste integrado cobre o bloqueio.
13. **Tokens de verificação/reset em log.** O fallback registrava o link cru
    mesmo fora de dev. Corrigido: link só no perfil `dev`; em outros perfis o
    log não contém o token.
14. **Contadores de segurança não atômicos.** Falhas de login e consumo de TOTP
    faziam read-modify-write. Corrigido com lock pessimista (`findByIdForUpdate`)
    e `consumeMfaCounter`.
15. **Tokens de e-mail concorrentes.** O reset/verify lia `used_at` sem lock.
    Corrigido com `findByTokenHashAndTypeForUpdate`.
16. **Append-only não garantido no banco.** V2 concedia UPDATE/DELETE ao app.
    Corrigido na V5: `auth_event`, `xp_ledger` e `user_achievements` só
    INSERT/SELECT para o runtime; teste de integração prova a negação.
17. **Rate limit global atrás de proxy.** Com `TRUST_PROXY=false`, o IP TCP do
    proxy compartilha o bucket. Os limites foram recalibrados e o lockout por
    conta é a defesa principal; a configuração de proxy confiável continua
    necessária em produção.
18. **Reset de senha sem teste.** Adicionado teste integrado que cria token de
    reset, troca a senha e faz login com a nova senha.

---

## 8. Código reutilizável vs. refeito

**Reutilizado (com auditoria):**

- `ApiError`, `GlobalExceptionHandler` e padrão de envelope;
- V1 (17 tabelas) e V2 (papéis/RLS) — migrations imutáveis;
- `SecurityConfig` base, CORS por env, BCrypt, Actuator/Swagger;
- padrão de testes com Testcontainers e `SecretsScanTest`;
- ideias de organização do RBS, sem copiar código ou alterar o repositório.

**Refeito/novo:**

- Todo o frontend (não havia);
- Autenticação completa (T2 não existia);
- Entidades JPA e serviços de conteúdo/progresso/gamificação (não existiam);
- Integração Supabase Storage e upload de vídeo;
- Simulador e mercado;
- Deploy/CI e documentação operacional.

**Não portado por decisão:** módulo WebFlux/SSE de market data do staging. O MVP usa
REST + cache, conforme arquitetura aprovada.

---

## 9. Riscos de segurança

### Mitigados e testados

- API fail-closed; públicas apenas health, Swagger, catálogo e auth pública.
- Senhas BCrypt (custo configurável); nunca logadas.
- Refresh token nunca é armazenado cru; apenas SHA-256; rotação e reuso revogam a
  família.
- JWT curto; papel sempre lido do banco; token de MFA tem propósito separado.
- TOTP criptografado em repouso (AES-GCM); replay do mesmo código é rejeitado.
- Cookies `HttpOnly`, `Secure` em produção, `SameSite=Strict`; refresh exige
  `X-Requested-With`.
- Rate limit por IP+bucket; `X-Forwarded-For` só é aceito de proxy listado.
- RLS deny-by-default; app sem DDL; schema revogado de anon/authenticated.
- Upload de vídeo valida MIME, assinatura de container e tamanho; bucket privado;
  service key só no servidor.
- Nenhum segredo versionado; `SecretsScanTest` no build.

### Riscos residuais / decisões

| Risco | Nível | Mitigação atual / próxima |
|---|---|---|
| Rate limit em memória por instância | Médio | MVP de 1 instância; limites recalibrados + lockout por conta; evoluir para Redis se escalar |
| IP real atrás do proxy do Render | Alto (operacional) | `TRUST_PROXY=false` por padrão; configurar `TRUSTED_PROXIES` e validar. Sem isso, o bucket é compartilhado |
| Access token não é revogado no logout (janela de 15 min) | Baixo | Expiração curta; refresh revogado; documentar |
| Sem backup codes de MFA | Médio | Suporte manual; evoluir com recovery codes |
| E-mail real não configurado | Alto para produção | Configurar Resend + domínio verificado; testar entrega |
| Credenciais Supabase ausentes | Bloqueio externo | Provisionar e testar upload real |
| Sem antivírus/transcodificação de vídeo | Médio | Validar assinatura; bucket privado; evoluir para scanning |
| CSP pode afetar Swagger em produção | Baixo | Validar no deploy; ajustar diretivas se necessário |
| `TRUST_PROXY=false` no Render | Médio | Configurar proxy confiável e testar rate limit real |
| Conta demo com senha local | Baixo | `DEMO_PASSWORD` só em env; desabilitar após a demo |
| Sem teste de carga | Médio | Executar k6/Autocannon antes da final |
| Sem auditoria WCAG completa | Médio | Revisão dedicada e axe/Lighthouse |

---

## 10. Dependências e ambiente

- Java 21 (`%JAVA_HOME%`), Maven 3.9.16 (wrapper local).
- Node 26.13, npm 11.20; Next 16.4.6 (correção de CVE), React 19.
- Docker 29.8.2 em execução; PostgreSQL 17 em container local na porta 5433.
- Testcontainers `postgres:17-alpine`.
- Supabase (PostgreSQL + Storage) e Render/Vercel: **não configurados** nesta sessão.
- Nenhuma credencial real foi criada, solicitada ou publicada.

---

## 11. Evidências de execução

```powershell
# backend (com Docker Desktop 29)
cd backend
$env:DOCKER_HOST="tcp://127.0.0.1:2375"
mvn -B test -Pdocker-desktop-newapi
# 28 testes, 0 falhas, 0 erros, 0 skipped

# frontend
cd frontend
npm test        # 6 testes
npm run build   # 20 entradas de rota (19 app + not-found), build de produção OK
```

Testes de backend incluem:

- `MvpFlowIntegrationTest` — cadastro → bloqueio de login não verificado →
  verificação → login → conteúdo → conclusão idempotente → quiz → XP →
  simulador → rotação de refresh → detecção de reuso → reset de senha.
- `FlywaySecurityIntegrationTest` — V1–V5 em PostgreSQL real; app sem DDL;
  ledgers append-only; guest com GRANT SELECT vê 0 linhas por RLS.
- `TotpServiceTest` — vetor RFC 6238.
- `JwtServiceTest`, `SimulatorServiceTest`, `ClientIpResolverTest`,
  `RegisterValidationTest`, `GlobalExceptionHandlerTest`, `SecretsScanTest`.

Runtime local validado no navegador: landing, login, dashboard, aula, quiz,
simulador, progresso, mercado, biblioteca, perfil e sessões. Erros de console
apenas para o vídeo ausente (404 esperado e tratado pela UI).

Testes manuais de API (20/11/2026):

- MFA: setup → enable → login com `mfaRequired=true` → verify com TOTP →
  replay do mesmo código → **401** → disable.
- Logout: `204` e o refresh antigo passa a responder **401** (família revogada).

---

## 12. Plano até 12/12/2026

### P0 — antes de qualquer apresentação (até 28/11)
1. Provisionar Supabase e aplicar V1–V5; criar runtime role e bucket.
2. Configurar Render + Vercel e validar health, login e cookie no domínio real.
3. Configurar Resend e testar verificação/reset reais.
4. Fazer upload de pelo menos 3 vídeos curtos e validar URL assinada.
5. Rodar E2E no ambiente publicado (cadastro → aula → quiz → simulação → logout).
6. Revisar CSP/Swagger e `TRUST_PROXY` no Render.

### P1 — estabilização (até 05/12)
7. Teste de carga básico e ajuste de pool/rate limit.
8. Auditoria WCAG (axe/Lighthouse) e correções críticas.
9. Backup/restore documentado e testado no Supabase.
10. Monitoramento/logs e alerta de health.
11. Testes de concorrência de refresh/MFA em CI.

### P2 — demonstração (até 12/12)
12. Conta demo com dados determinísticos e roteiro de 8–10 min.
13. Ensaio cronometrado, plano B offline (fallback de mercado e vídeo).
14. Slides/pitch e relatório final de qualidade.
15. Revisão de segurança final e rotação de credenciais.

---

## 13. Bloqueios externos (não resolvidos nesta sessão)

| Bloqueio | Impacto | O que falta |
|---|---|---|
| Credenciais Supabase | Upload/playback real de vídeo e banco remoto | URL, service key, senha do runtime, projeto criado |
| Resend API key + domínio | Verificação/reset por e-mail reais | Conta, domínio verificado, `MAIL_ENABLED=true` |
| Conta Render | Deploy do backend | Serviço criado e envs |
| Conta Vercel | Deploy do frontend | Projeto e `API_PROXY_TARGET` |
| Vídeos educativos | Demonstração de vídeo | Arquivos MP4/WebM de até 3 min + direitos |
| Push/merge | Publicação do código | Autorização do proprietário (branch local `feat/mvp-completo`) |
| Contato de segurança | Documento público | E-mail real (placeholder mantido) |

---

## 14. Limitações declaradas

- Não houve deploy remoto; nenhuma afirmação de “produção funcionando”.
- O upload real no Supabase não foi testado por ausência de credenciais.
- O envio real de e-mail não foi testado; o fallback de log é explícito.
- O MFA tem teste unitário do TOTP e UI implementada, mas o fluxo completo de UI
  não foi automatizado nesta sessão.
- O protótipo Figma é mais restrito (cripto) que o escopo do produto; a adaptação
  é intencional e documentada.
- A execução dos 70 papéis foi organizada em registro; nesta sessão o trabalho foi
  concentrado no agente principal, com revisões independentes. Papéis de pesquisa
  com usuários, performance de campo e WCAG completo permanecem backlog.
- Números de “melhor sequência” e progresso da conta demo vêm do seed local; não
  representam usuários reais.

---

## 15. Conclusão

A fundação T1 foi preservada e evoluída para um MVP funcional de ponta a ponta:
backend seguro, banco versionado, conteúdo educativo, gamificação, simulador e
frontend integrado. O que falta para a final é predominantemente **externo**
(credenciais, deploy, vídeos e ensaio), não arquitetural. A recomendação é congelar
escopo, executar o P0 e só então adicionar qualquer funcionalidade nova.
