# PROGRESSO GERAL — Invest Fácil

> **Atualização S2.8 (22/11/2026):** relatório histórico. Estado atual: V1-V7, 63 testes, RLS per-user; a V7 é local e ainda não foi aplicada no Lab. Ver docs/verification/S2.8/S2.8_DATABASE_FUNCTION_HARDENING_REPORT.md.

**Atualizado:** 22/11/2026 · **Branch local:** `feat/mvp-completo` · **Commits locais:** `dc18b60`–`100d3fe` · **Deadline Hack Brasil:** 12/12/2026 (README/APRESENTAÇÃO/AUDITORIA); 29/11/2026 sem fonte — UNKNOWN.
**Push/merge:** pendente de autorização do proprietário; nada foi enviado ao GitHub nesta sessão.

> **Regra:** `IMPLEMENTED` ≠ `VERIFIED`. Só marcamos `VERIFIED` quando há comando,
> teste ou navegação real registrada. Bloqueios externos ficam explícitos.
> `DEFINED` é usado para papéis/tarefas planejadas que ainda não foram executadas.
>
> **Semântica P0.4:** `DEFINED`/`NOT_STARTED` → `PLANNED`; `IN_PROGRESS` → `PARTIAL`;
> `DONE`/`CONCLUÍDO` → `VERIFIED` apenas com evidência. Ver
> `docs/engineering/SOURCE_OF_TRUTH.md`.

---

## 1. Marcos

| Marco | Status | Evidência |
|---|---|---|
| Auditoria GitHub/workspace/Figma | **VERIFIED** | `docs/AUDITORIA_GERAL.md` |
| T1 preservada e reexecutada | **VERIFIED** | `mvn verify`, 28 testes; staging intacto |
| Banco V1–V5 | **VERIFIED** | Testcontainers PostgreSQL 17 |
| Backend MVP (auth, conteúdo, progresso, XP, simulador, vídeos, mercado) | **VERIFIED** (vídeo real bloqueado) | build + testes + runtime |
| Frontend MVP (19 rotas de aplicação + not-found) | **VERIFIED** (build + testes) | `npm run build`, `npm test` |
| Integração frontend↔backend | **TESTED** manual local | login, aula, quiz, simulador, perfil; sem E2E automatizado |
| Pipeline de vídeo (CapCut + VectCutAPI) | **TESTED**; visual **VERIFIED** (52 amostras, pós-save) | `docs/VECTCUTAPI_INTEGRATION.md`; piloto 02 |
| Variantes Gate 4 (Remotion) | **TESTED** técnico; **HUMAN REVIEW REQUIRED** | 10 MP4, QC/loudness; publicação não aprovada |
| Deploy remoto | **NOT VERIFIED** (não deployado) | sem credenciais |
| Fonte de verdade/contexto | **VERIFIED** (docs) | `CONTEXT_INDEX.md` + `SOURCE_REGISTRY.md` |
| Vídeos reais no Supabase | **BLOCKED** | sem credenciais/bucket |
| E-mail real | **BLOCKED** | sem Resend/domínio |
| Ensaio e pitch | **PARTIAL** | docs iniciais |

---

## 2. Ledger de tarefas

### Fase 0 — Auditoria e governança

| ID | Tarefa | Agente | Status | Arquivos | Testes/evidência | Dependências | Bloqueios |
|---|---|---|---|---|---|---|---|
| A01 | Auditar GitHub (branches, commits, workflows) | Repository Auditor | VERIFIED | `docs/AUDITORIA_GERAL.md` | `gh repo view`, `git log`, `git branch -a` | — | — |
| A02 | Auditar workspace e T1/Missão 01.2 | Repository Auditor | VERIFIED | `_audit/*`, `backend/`, `_staging/` | contagem de fontes, relatórios, hashes | — | — |
| A03 | Inspecionar Figma e capturar identidade | Figma Integration Specialist | VERIFIED | `docs/AUDITORIA_GERAL.md` §4 | navegação real nas telas | — | — |
| A04 | Registrar 70 papéis | Technical PM | **IMPLEMENTED** | `docs/AGENTES_70.md`, `docs/agentes/registry.json` | 70 seções geradas; não são 70 agentes executáveis | — | — |
| A05 | Criar branch de trabalho | Technical PM | VERIFIED | `feat/mvp-completo` | `git switch` | autorização local | push não autorizado |

### Fase P0 — Transformação e proteção

| ID | Tarefa | Status | Evidência | Limitações |
|---|---|---|---|---|
| P01 | Media safety / Git hygiene | **PASS** | `docs/engineering/P0_1_VERIFICATION.md` | hook opcional; mídia local |
| P02 | CI em todas as branches | **PASS WITH LIMITATIONS** | `docs/engineering/P0_2_VERIFICATION.md` | remoto/branch protection não verificados |
| P03 | Permissões de agentes | **PASS WITH LIMITATIONS** | `docs/engineering/P0_3_VERIFICATION.md` | globais/MCP/shell/browser abertos |
| P04 | Source of truth e contexto | **PASS WITH LIMITATIONS** | `docs/engineering/P0_4_VERIFICATION.md` | drift histórico e lacunas de evidência |

---

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
| B10 | Catálogo de conteúdo + seed | Content Engineer | VERIFIED | `content/**`, `seed/content.json` | 8 categorias, 12 módulos, 31 aulas, 62 questões, 6 artigos; teste integrado | B01 | — |
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
| C06 | Mapa de aprendizado + módulo | Frontend Engineer | VERIFIED | `app/app/aprender/**` | navegação real; 5/31 e próxima aula correta | B10 | — |
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
| D03 | E2E manual no browser | E2E Engineer | **TESTED** (manual) | — | login, aula, quiz, simulador, perfil; sem automação | backend+frontend | — |
| D04 | CI GitHub Actions | Deployment Engineer | **IMPLEMENTED**; remoto **NOT VERIFIED** | `.github/workflows/ci.yml` | 5 jobs, triggers `**`; sem run remoto | push | autorização/branch protection |
| D05 | Docker/Render/Vercel runbook | Infra Engineer | **TESTED** (histórico local) | `Dockerfile`, `render.yaml`, `docs/DEPLOY.md` | imagem Docker buildada; container local com health 200 | Docker | credenciais Render/Vercel |
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

### Fase 5 — Pipeline de vídeo (CapCut + VectCutAPI)

| ID | Tarefa | Agente | Status | Arquivos | Testes/evidência | Dependências | Bloqueios |
|---|---|---|---|---|---|---|---|
| V01 | Instalar VectCutAPI isolado | Video/Integration | **INSTALLED** | `%LOCALAPPDATA%\InvestFacil\tools\VectCutAPI` | venv 3.12.8; dependências; `mcp_server.py` | — | — |
| V02 | Endurecer VectCutAPI | Security/Video | **TESTED** | `config.json`, `settings/local.py`, `save_draft_impl.py` | domínio local; upload/auto-deploy desligados; mídia remota bloqueada | V01 | — |
| V03 | Configurar MCP no OpenCode | Integration | **CONNECTED** | `~/.config/opencode/opencode.json` | `opencode mcp list` → `vectcut-api connected` | V01 | — |
| V04 | Validar ferramentas VectCutAPI | QA | **TESTED** | `_audit/vectcut-*.py` | 11 ferramentas; create/add/save; guarda remota | V03 | — |
| V05 | Piloto 01 via CapCut MCP | Video | **TESTED**; visual **parcial** | `content/pilots/01-volatilidade/**` | 33 s, 3 slides + narração; `ok: true` | — | abertura visual |
| V06 | Piloto 02 via VectCutAPI | Video | **TESTED** | `content/pilots/02-diversificacao/**` | 51,1 s, 3 imagens, áudio, 12 legendas revisadas | V02/V04 | — |
| V07 | Interop VectCutAPI → CapCut MCP | Integration/QA | **TESTED** | `_audit/vectcut-build-pilot02.py`, `capcut-mcp/interop-pilot02.mjs` | read/validate/save; `ok: true` | V06 | — |
| V08 | Reabrir e inspecionar no CapCut 9.8 | Visual QA | **VERIFIED** (52 amostras) | `_audit/missao03-contact-sheet-52s.png` | 0–51 s; cenas 1–3; sem tela preta | V06 | — |
| V09 | Exportar MP4 | Video | **PENDING (manual)** | `content/pilots/02-diversificacao/export/` | editor pronto no início | V08 | ação humana |
| V10 | Verificar MP4 exportado | QA | **PENDING** | `scripts/verify-mp4.py` | aguarda o arquivo | V09 | arquivo MP4 |
| V11 | Subir no Supabase | Storage | **BLOCKED** | — | — | V10 | credenciais |

**Status do piloto 02:** **CONCLUÍDO COM RESSALVAS** — SRT corrigido, draft
reaberto e validado; MP4 e verificação independente pendentes de exportação
manual.

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
npm run build   # 20 entradas de rota (19 app + not-found), build de produção
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

### Pipeline de vídeo

- VectCutAPI (11 ferramentas) criou `if_piloto_diversificacao` com 3 imagens,
  áudio de 51,1 s e 12 legendas revisadas; mídia remota bloqueada.
- CapCut MCP (17 ferramentas) leu o draft, validou `ok: true` e salvou.
- CapCut 9.8 reabriu o draft após o save; a inspeção visual cobriu 0–51 s em 52
  amostras, sem tela preta e com legendas horizontais acima do rodapé.
- Áudio analisado: 51,084 s, mono 22,05 kHz/16-bit, pico 0,5464, sem clipping.
- O áudio do draft era WAV renomeado como `.mp3`; foi convertido para MP3 real
  (192 kbps, 51,147 s) e validado com `ffprobe`.
- Saída visual: `_audit/missao03-contact-sheet-52s.png`,
  `_audit/missao03-timeline-chart.png`, `_audit/missao03-editor-ready.png`.
- MP4: ainda não exportado; `scripts/verify-mp4.py` está preparado.

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

## 6. Missão complementar (Firebase + CapCut)

| ID | Tarefa | Status | Evidência | Bloqueio |
|---|---|---|---|---|
| F01 | Avaliar Firebase Spark/Blaze e comparar Storage/Hosting/Auth/Analytics/App Check/Crashlytics | **VERIFIED** | `docs/FIREBASE_EVALUATION.md` com fontes oficiais | — |
| F02 | Integrar Firebase | **NOT_STARTED (decisão: não integrar)** | Storage exige Blaze/cartão; Hosting Spark é estático; Crashlytics não cobre web | autorização/orçamento |
| C01 | Auditar MCPs CapCut e escolher opção segura | **VERIFIED** | `docs/CAPCUT_MCP_SETUP.md`; MIT commit `50beafd`; código revisado | — |
| C02 | Endurecer e instalar MCP | **VERIFIED** | clone local em `%LOCALAPPDATA%\InvestFacil\capcut-mcp`; `npm ci --ignore-scripts`; patch de segurança | — |
| C03 | Validar conexão MCP | **VERIFIED** | cliente SDK listou 17 ferramentas e leu o piloto | — |
| C04 | Criar draft descartável e piloto | **TESTED** | `if_mcp_smoke` e `investfacil_piloto` (33 s, 9:16, 3 slides + narração; validação ok) | abertura visual do piloto 01 parcial |
| C05 | Configurar MCP nos clientes | **VERIFIED** | `opencode.json` (`capcut` e `vectcut-api`) e `mcp_config.json` com backups | Gemini/Antigravity exige reinício |
| C06 | Exportar e subir vídeo | **BLOCKED** | CapCut sem export CLI; Supabase sem credenciais | export manual + Supabase |
| C07 | Instalar/endurecer VectCutAPI | **TESTED** | `%LOCALAPPDATA%\InvestFacil\tools\VectCutAPI`; domínio local; mídia remota bloqueada | — |
| C08 | Criar piloto 02 com VectCutAPI | **TESTED** | `if_piloto_diversificacao` (51,1 s, 3 imagens, áudio, 12 legendas) | — |
| C09 | Interop CapCut MCP no piloto 02 | **TESTED** | `read_timeline` + `validate` + `save`; `ok: true` | — |
| C10 | Reabrir e inspecionar o piloto 02 | **VERIFIED** (52 amostras) | CapCut 9.8; 0–51 s; sem tela preta | — |
| C11 | Exportar e verificar MP4 | **PENDING (manual)** | `export/` vazio; `scripts/verify-mp4.py` pronto | ação humana |
| T01 | Pipeline e templates de conteúdo | **IMPLEMENTED** | `docs/CONTENT_PIPELINE.md`, `content/templates/**`, pilotos 01 e 02 | revisão humana/TTS final |

**Custos:** nenhum cartão associado; nenhum plano Firebase Blaze habilitado;
CapCut Pro/Ultra não foi adquirido. CapCut MCP e VectCutAPI são open source e
rodam localmente.

## 7. Próximas ações (ordem de execução)

1. Exportar o MP4 do piloto 02 no CapCut (editor aberto no início) e rodar
   `scripts/verify-mp4.py`; revisar o resultado.
2. Exportar o MP4 do piloto 01 e revisar os dois arquivos no celular.
3. Fazer a escuta humana da narração e ajustar TTS/SRT se necessário.
4. Provisionar Supabase e rodar V1–V5; testar upload/playback real.
5. Configurar Resend e validar e-mail.
6. Deploy Render + Vercel; repetir checklist de release.
7. Executar E2E publicado e corrigir CSP/proxy/rate limit.
8. Adicionar teste integrado de MFA e logout.
9. Auditar acessibilidade e responsividade com ferramenta.
10. Teste de carga básico.
11. Ensaiar demo com plano B (mercado fallback e vídeo placeholder).
12. Revisar documentação final e emitir `QUALIDADE_FINAL.md`.
