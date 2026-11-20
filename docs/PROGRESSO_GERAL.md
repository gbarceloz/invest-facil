# PROGRESSO GERAL — Invest Fácil

**Atualizado:** 20/11/2026 · **Branch local:** `feat/mvp-completo` · **Commit local:** `dc18b60` · **Deadline:** 12/12/2026
**Push/merge:** pendente de autorização do proprietário; nada foi enviado ao GitHub nesta sessão.

> **Regra:** `IMPLEMENTED` ≠ `VERIFIED`. Só marcamos `VERIFIED` quando há comando,
> teste ou navegação real registrada. Bloqueios externos ficam explícitos.
> `DEFINED` é usado para papéis/tarefas planejadas que ainda não foram executadas.

---

## 1. Marcos

| Marco | Status | Evidência |
|---|---|---|
| Auditoria GitHub/workspace/Figma | **VERIFIED** | `docs/AUDITORIA_GERAL.md` |
| T1 preservada e reexecutada | **VERIFIED** | `mvn verify`, 28 testes; staging intacto |
| Banco V1–V5 | **VERIFIED** | Testcontainers PostgreSQL 17 |
| Backend MVP (auth, conteúdo, progresso, XP, simulador, vídeos, mercado) | **VERIFIED** (vídeo real bloqueado) | build + testes + runtime |
| Frontend MVP (16 páginas + not-found) | **VERIFIED** (build + navegação local) | `npm run build`, `npm test` |
| Integração frontend↔backend | **VERIFIED** local | login, aula, quiz, simulador, perfil |
| Deploy remoto | **NOT_STARTED** | sem credenciais |
| Vídeos reais no Supabase | **BLOCKED** | sem credenciais/bucket |
| E-mail real | **BLOCKED** | sem Resend/domínio |
| Ensaio e pitch | **IN_PROGRESS** | docs iniciais |

---

## 2. Ledger de tarefas

### Fase 0 — Auditoria e governança

| ID | Tarefa | Agente | Status | Arquivos | Testes/evidência | Dependências | Bloqueios |
|---|---|---|---|---|---|---|---|
| A01 | Auditar GitHub (branches, commits, workflows) | Repository Auditor | VERIFIED | `docs/AUDITORIA_GERAL.md` | `gh repo view`, `git log`, `git branch -a` | — | — |
| A02 | Auditar workspace e T1/Missão 01.2 | Repository Auditor | VERIFIED | `_audit/*`, `backend/`, `_staging/` | contagem de fontes, relatórios, hashes | — | — |
| A03 | Inspecionar Figma e capturar identidade | Figma Integration Specialist | VERIFIED | `docs/AUDITORIA_GERAL.md` §4 | navegação real nas telas | — | — |
| A04 | Registrar 70 papéis | Technical PM | **IMPLEMENTED** | `docs/AGENTES_70.md`, `docs/agentes/registry.json` | 70 seções geradas | — | — |
| A05 | Criar branch de trabalho | Technical PM | VERIFIED | `feat/mvp-completo` | `git switch` | autorização local | push não autorizado |

### Fase 1 — Fundação backend/banco

| ID | Tarefa | Agente | Status | Arquivos | Testes/evidência | Dependências | Bloqueios |
|---|---|---|---|---|---|---|---|
| B01 | V3: MFA, família de refresh, simulações, índice anti-farm | PostgreSQL/Flyway | VERIFIED | `V3__auth_mfa_simulator.sql` | `FlywaySecurityIntegrationTest` 5/5 (com V4/V5) | V1/V2 | — |
| B02 | Entidades/repos de usuários e auth | Java Backend | VERIFIED | `users/**`, `auth/**` | contexto Spring + integração | B01 | — |
| B03 | JWT + filtro + configuração stateless | JWT Engineer | VERIFIED | `JwtService`, `JwtAuthenticationFilter`, `SecurityConfig` | `JwtServiceTest` 4/4; fluxo integrado | B02 | — |
| B04 | Refresh opaco com rotação/reuso | Refresh Engineer | VERIFIED | `RefreshToken*`, `AuthService` | `MvpFlowIntegrationTest` (reuso → 401 + família revogada) | B03 | — |
| B05 | Cadastro/login/logout/sessões | Auth Engineers | VERIFIED | `AuthController`, `AuthService` | fluxo integrado | B04 | — |
| B06 | MFA TOTP + criptografia do segredo | MFA Engineer | **TESTED** | `TotpService`, `SecretCipher`, endpoints | `TotpServiceTest` 3/3 + teste manual API: enable → login desafiado → verify → replay 401 → disable | B03 | UI não automatizada |
| B07 | Verificação de e-mail/reset | Email Engineers | **TESTED** (lógica) | `EmailToken*`, `EmailService` | verificação bloqueia login até confirmar; reset com token de uso único testado; envio real não testado | B05 | Resend |
| B08 | Rate limit + resolução de IP | Security Engineer | VERIFIED | `RateLimitFilter`, `ClientIpResolver` | `ClientIpResolverTest` 3/3; filtro ativo no runtime | — | carga não testada |
| B09 | Envelope de erro + exceções de negócio | Exception Engineer | VERIFIED | `BusinessException`, `GlobalExceptionHandler` | `GlobalExceptionHandlerTest` 4/4 | — | — |
| B10 | Catálogo de conteúdo + seed | Content Engineer | VERIFIED | `content/**`, `seed/content.json` | 8 categorias, 8 módulos, 19 aulas, 38 questões, 6 artigos; teste integrado | B01 | — |
| B11 | Progresso idempotente + quizzes | Progress Engineer | VERIFIED | `progress/**` | conclusão 201→200; quiz 100% no teste | B10 | — |
| B12 | Gamificação (XP/níveis/conquistas/streak) | Gamification Engineer | VERIFIED | `gamification/**` | XP 120 no fluxo; 4 conquistas desbloqueadas na demo (7 disponíveis); UI local | B11 | — |
| B13 | Simulador de juros compostos | Simulator Engineer | VERIFIED | `simulator/**` | `SimulatorServiceTest` 3/3; UI local | B12 | — |
| B14 | Mercado informativo + fallback | Market Engineer | **IMPLEMENTED** | `market/**` | UI local com status UNAVAILABLE | — | provedor externo |
| B15 | Upload/playback Supabase Storage | Storage/Video Engineers | **BLOCKED** | `videos/**` | MIME/assinatura/tamanho; testado só por unidade indireta | — | Supabase |
| B16 | Swagger/OpenAPI e Actuator | API Docs Engineer | VERIFIED | `OpenApiConfig`, `application.yml` | `/swagger-ui.html` 200; `/v3/api-docs` 200 | — | — |
| B17 | Ledgers append-only no banco | PostgreSQL/Security | **TESTED** | `V5__append_only_ledgers.sql` | `FlywaySecurityIntegrationTest.appNaoPodeAlterarLedgers...` | V2 | — |
| B18 | Lockout/TOTP atômicos + tokens de e-mail com lock | Security Engineer | **TESTED** | `UserRepository`, `EmailTokenRepository`, `UserService` | 28 testes; replay MFA 401 | — | — |
| B19 | MFA setup exige senha atual | Security Engineer | **TESTED** | `AuthService.setupMfa`, UI perfil | setup com senha; API testada | B06 | — |

### Fase 2 — Frontend e experiência

| ID | Tarefa | Agente | Status | Arquivos | Testes/evidência | Dependências | Bloqueios |
|---|---|---|---|---|---|---|---|
| C01 | Scaffold Next.js 16 + TS + Tailwind | Frontend Architect | VERIFIED | `frontend/**` | `npm run build` | Node | — |
| C02 | Design system dark/yellow + Plus Jakarta Sans | Design System | VERIFIED | `globals.css`, `components/**` | build + inspeção visual | C01 | — |
| C03 | Landing page | React Engineer | VERIFIED | `app/page.tsx` | navegação real | C02 | — |
| C04 | Login/cadastro/verificação/reset | Auth UI | VERIFIED | `app/entrar`, `cadastro`, `verificar-email`, `recuperar-senha`, `redefinir-senha` | login real com conta demo | C01 | e-mail real bloqueado |
| C05 | App shell + dashboard | Dashboard Engineer | VERIFIED | `components/app-shell.tsx`, `app/app/page.tsx` | screenshot e texto reais | C03 | — |
| C06 | Mapa de aprendizado + módulo | Frontend Engineer | VERIFIED | `app/app/aprender/**` | navegação real; 5/19 e próxima aula correta | B10 | — |
| C07 | Aula + vídeo + quiz + conclusão | Frontend Engineer | VERIFIED | `app/app/aprender/aula/[slug]` | conclusão e quiz reais no browser | B11 | vídeo real |
| C08 | Biblioteca + artigo | Content/Frontend | VERIFIED | `app/app/biblioteca/**` | artigo renderizado | B10 | — |
| C09 | Mercado | Frontend | VERIFIED | `app/app/mercado/page.tsx` | fallback rotulado | B14 | provedor |
| C10 | Simulador + gráfico + cenários salvos | Frontend/Simulator | VERIFIED | `app/app/simulador/page.tsx` | cálculo real, 3 cenários, save | B13 | — |
| C11 | Progresso + conquistas + XP | Frontend | VERIFIED | `app/app/progresso/page.tsx` | dados reais | B12 | — |
| C12 | Perfil + sessões + MFA UI | Auth UI | **IMPLEMENTED** | `app/app/perfil/page.tsx` | perfil/sessões reais; MFA UI não automatizada | B06/B05 | E2E MFA |
| C13 | Responsividade e acessibilidade | Responsive/A11y | **IN_PROGRESS** | classes responsivas, labels/aria | revisão visual; auditoria formal pendente | C02 | — |
| C14 | Testes frontend | Frontend Testing | VERIFIED | `__tests__/**` | 6 testes | C01 | — |

### Fase 3 — Qualidade, infra e demonstração

| ID | Tarefa | Agente | Status | Arquivos | Testes/evidência | Dependências | Bloqueios |
|---|---|---|---|---|---|---|---|
| D01 | Suíte backend completa | Backend Testing | VERIFIED | `backend/src/test/**` | 28/28, 0 skipped | Docker | — |
| D02 | Fluxo integrado backend | Integration Testing | VERIFIED | `MvpFlowIntegrationTest` | 1/1 jornada completa | PostgreSQL | — |
| D03 | E2E manual no browser | E2E Engineer | VERIFIED | — | login, aula, quiz, simulador, perfil | backend+frontend | — |
| D04 | CI GitHub Actions | Deployment Engineer | **IMPLEMENTED** | `.github/workflows/ci.yml` | workflow criado; não executado remoto | push | autorização |
| D05 | Docker/Render/Vercel runbook | Infra Engineer | **TESTED** | `Dockerfile`, `render.yaml`, `docs/DEPLOY.md` | imagem Docker buildada; container em produção local com health 200 e Flyway validado | Docker | credenciais Render/Vercel |
| D06 | Documentação de auditoria/progresso | Product Docs | VERIFIED | `docs/AUDITORIA_GERAL.md`, este arquivo | leitura e conferência | — | — |
| D07 | README e docs de arquitetura/API | Product Docs | **IMPLEMENTED** | `README.md`, `docs/**` | auditoria de docs vs código; contagens corrigidas | — | — |
| D08 | Roteiro de demo e apresentação | Presentation Architect | **IMPLEMENTED** | `docs/DEMO_SCRIPT.md`, `docs/APRESENTACAO.md` | rascunho completo com plano B | D03 | ensaio pendente |
| D09 | Relatório final de qualidade | QA Lead | **IMPLEMENTED** | `docs/QUALIDADE_FINAL.md` | veredito local GO / produção NO-GO | D01–D08 | P0 externo |
| D10 | Teste de carga/performance | Performance Engineer | NOT_STARTED | — | — | deploy | — |
| D11 | Auditoria WCAG formal | A11y Auditor | NOT_STARTED | — | — | frontend | — |
| D12 | Backup/restore Supabase | PostgreSQL Architect | NOT_STARTED | — | — | Supabase | — |

### Fase 4 — Bloqueios externos

| ID | Tarefa | Status | O que falta | Impacto |
|---|---|---|---|---|
| E01 | Provisionar Supabase (DB + Storage) | BLOCKED | projeto, URL, service key, senha runtime | banco e vídeos remotos |
| E02 | Configurar Resend | BLOCKED | conta, domínio, API key | verificação/reset reais |
| E03 | Deploy Render | BLOCKED | conta/serviço e envs | backend público |
| E04 | Deploy Vercel | BLOCKED | projeto e `API_PROXY_TARGET` | frontend público |
| E05 | Vídeos educativos | BLOCKED | arquivos e direitos | demonstração de vídeo |
| E06 | Push/merge para `main` | BLOCKED | autorização do proprietário | publicação do código |
| E07 | Contato de segurança | BLOCKED | e-mail real | documento público |

---

## 3. Evidências de teste

### Backend (executado em 20/11/2026)

```powershell
cd backend
$env:DOCKER_HOST="tcp://127.0.0.1:2375"
mvn -B test -Pdocker-desktop-newapi
```

Resultado: **28 testes, 0 falhas, 0 erros, 0 skipped**.

| Suíte | Testes | O que valida |
|---|---|---|
| `GlobalExceptionHandlerTest` | 4 | envelope 404/400/500 sem vazamento |
| `FlywaySecurityIntegrationTest` | 5 | V1–V5, DML sem DDL, ledgers append-only, RLS 0 linhas |
| `MvpFlowIntegrationTest` | 1 | jornada completa + bloqueio de e-mail não verificado + reset + refresh/reuso |
| `SecretsScanTest` | 2 | ausência de `.env` e segredos |
| `TotpServiceTest` | 3 | RFC 6238, janela, segredo |
| `JwtServiceTest` | 4 | criação, parsing, propósito, expiração, segredo fraco |
| `SimulatorServiceTest` | 3 | juros, série, inflação, disclaimer |
| `ClientIpResolverTest` | 3 | XFF não confiável, proxy confiável |
| `RegisterValidationTest` | 3 | senha/e-mail válidos e inválidos |

### Frontend

```powershell
cd frontend
npm test        # 6 testes
npm run build   # 16 páginas + not-found, build de produção
```

### Runtime local

- Backend em `http://localhost:8081` (porta 8080 ocupada por outro serviço do host).
- Frontend em `http://localhost:3000` com `API_PROXY_TARGET=http://localhost:8081`.
- Health `UP`; Swagger e OpenAPI 200.
- Conta demo local criada via `DEMO_EMAIL`/`DEMO_PASSWORD` (não versionados).
- Navegação validada: landing, login, dashboard, aula, quiz, conclusão, simulador,
  mercado, biblioteca, progresso e perfil.
- MFA testado por API: setup → enable → login desafiado → verify → replay do
  mesmo código (401) → disable.
- Logout testado: 204 e refresh antigo passa a 401 (família revogada).

---

## 4. Revisões independentes executadas

| Revisão | Papel | Escopo | Resultado |
|---|---|---|---|
| Segurança backend | Security Auditor (25) | auth, JWT, refresh, MFA, rate limit, cookies, RLS, upload | 0 crítico; 3 altos e 3 médios tratados (2 aceitos/documentados) |
| Frontend/UX/A11y | Frontend QA + A11y (43/58) | páginas, componentes, estados, contraste, CSP | achados altos/médios corrigidos; WCAG formal pendente |
| Docs vs código | Repository/Docs Auditor (03/65) | README, arquitetura, segurança, API, contagens | afirmações desatualizadas corrigidas; lacunas registradas |

Nenhuma revisão alterou arquivos; os relatórios foram incorporados a
`docs/QUALIDADE_FINAL.md` e `docs/AUDITORIA_GERAL.md`.

## 5. Decisões registradas

1. **Porta local 8081** para o backend porque 8080 já era usada por outro container
   do host. Produção continua em 8080 (`PORT`).
2. **Proxy `/api` no Next.js** em vez de CORS direto: cookie first-party e
   `SameSite=Strict` funcionam sem enfraquecer a política.
3. **Vídeo demo não é simulado como publicado.** Sem Supabase, a UI mostra “vídeo em
   preparação”. A integração real está codificada e pronta para credenciais.
4. **Mercado com fallback explícito.** Quando Binance/câmbio falham, a UI marca
   “referência estática” e “provedor indisponível”.
5. **XP idempotente por índice único parcial.** Não é possível farmar a mesma aula
   ou o mesmo quiz.
6. **Nenhum commit/push/deploy remoto** sem autorização do proprietário; o trabalho
   está na branch local `feat/mvp-completo`.

---

## 6. Próximas ações (ordem de execução)

1. Provisionar Supabase e rodar V1–V5; testar upload/playback real.
2. Configurar Resend e validar e-mail.
3. Deploy Render + Vercel; repetir checklist de release.
4. Executar E2E publicado e corrigir CSP/proxy/rate limit.
5. Adicionar teste integrado de MFA e logout.
6. Auditar acessibilidade e responsividade com ferramenta.
7. Teste de carga básico.
8. Ensaiar demo com plano B (mercado fallback e vídeo placeholder).
9. Revisar documentação final e emitir `QUALIDADE_FINAL.md`.
