# SOURCE REGISTRY — INVEST FÁCIL

**Data:** 22/11/2026
**Escopo:** matriz de fontes oficiais por domínio, owners funcionais, gatilhos e conflitos.
**Autoridade e semântica:** `SOURCE_OF_TRUTH.md`.
**Entrada operacional:** `CONTEXT_INDEX.md`.

Owners são **funções**, não nomes inventados. O único owner humano é o proprietário do
projeto, para decisões que exigem autorização.

---

## 1. Matriz de fontes oficiais

| ID | Domínio | Fonte canônica | Tipo | Evidência | Owner funcional | Gatilho de atualização | Freshness | Dependências | Conflitos conhecidos | Status |
|---|---|---|---|---|---|---|---|---|---|---|
| D01 | Product Scope | `README.md` | SOURCE OF TRUTH (escopo) | README + código + testes | agente principal | mudança de escopo/não-escopo | válido enquanto o produto e a licença não mudarem | D02, D18, D19 | C08, C11 | `VERIFIED` |
| D02 | Product Features | `backend/src/main/resources/seed/content.json` + controllers | SOURCE OF TRUTH (implementação) | seed 8/12/31/62/6; 42 mappings | agente principal | mudança de seed/endpoint/feature | revisar a cada mudança de conteúdo/API | D03, D04, D07 | C01, C16 | `PARTIAL` (upload de vídeo bloqueado) |
| D03 | Frontend | `frontend/app/**` + `frontend/package.json` | SOURCE OF TRUTH (código) | build 20 entradas de rota; 6 testes | agente principal | mudança de rota/componente/build | a cada alteração de frontend | D02, D04, D07, D13 | C02 | `PARTIAL` (sem E2E) |
| D04 | Backend | `backend/src/main/java/**` + `backend/pom.xml` | SOURCE OF TRUTH (código) | `mvn test` 28/28; build | agente principal | mudança de código/dependência | a cada alteração de backend | D05, D06, D07 | — | `VERIFIED` |
| D05 | Database | `backend/src/main/resources/db/migration/**` | SOURCE OF TRUTH (schema) | V1–V7; Testcontainers 5/5; 18 tabelas | agente principal | nova migration/schema | a cada migration | D04, D06 | — | `VERIFIED` |
| D06 | Authentication | `backend/src/main/java/com/investfacil/api/auth/**` + `docs/security/SECURITY.md` | SOURCE OF TRUTH (código) + OPERATIONAL | JWT/TOTP/refresh tests; fluxo integrado | agente principal | mudança de auth/segurança | a cada alteração de auth | D04, D05, D10 | e-mail real/MFA UI | `PARTIAL` |
| D07 | API Contracts | controllers + `docs/api/README.md` + OpenAPI runtime | SOURCE OF TRUTH (código) + REFERENCE | 42 mappings; Swagger | agente principal | mudança de controller/DTO | a cada alteração de API | D02, D04, D06 | sem snapshot | `PARTIAL` |
| D08 | Testing | `backend/target/surefire-reports/**` + `frontend/__tests__/**` | GENERATED + SOURCE OF TRUTH (execução) | 63 backend, 6 frontend | agente principal | novo teste/resultado | a cada execução relevante | D03, D04, D05, D09 | C05, C11 | `PARTIAL` (sem cobertura/E2E) |
| D09 | CI/CD | `.github/workflows/ci.yml` | SOURCE OF TRUTH (config declarada) | 5 jobs; triggers `**`; P0.2 | agente principal | mudança de workflow/runner | a cada mudança de CI | D08, D10, D16 | C09, C10, C13 | `PARTIAL` (remoto não verificado) |
| D10 | Security | `docs/security/SECURITY.md` + `P0_3` docs | OPERATIONAL + SOURCE OF TRUTH (controles) | testes + policy/matrix | agente principal | mudança de controle/agente | a cada alteração de segurança | D04, D06, D11 | C20, riscos P0.3 | `PARTIAL` |
| D11 | Agents | `.opencode/agents/*.md` + `opencode debug agents` | SOURCE OF TRUTH (config resolvida) | 43 agentes; 8 locais default-deny | agente principal | mudança de agente/permissão | a cada alteração de agente | D10, D12 | C04, C15 | `PARTIAL` (globais abertos) |
| D12 | Skills | `.opencode/skills/**` + `.claude/skills/**` | SOURCE OF TRUTH (instruções) | 5 locais + 4 Claude | agente principal | mudança de skill | a cada alteração de skill | D11 | C05 | `PARTIAL` (sem evals) |
| D13 | Design System | `frontend/app/globals.css` + `frontend/components/**` | SOURCE OF TRUTH (código) | inspeção visual/build | nenhum owner ativo (funcional: agente principal) | mudança de token/componente | a cada alteração visual | D03 | sem mapa de tokens | `UNKNOWN` |
| D14 | Video Production | `video/projects/investfacil-10-creative-variants/reports/GATE4_PRODUCTION_INDEX.md` | SOURCE OF TRUTH (artefatos) | 10 MP4 finais + 1 pré-polish; V01 hash | agente principal + 8 agentes de vídeo | novo render/QC/decisão | a cada versão | D15, D19 | C03, C12, C14 | `PARTIAL` (sem aprovação/publicação) |
| D15 | Media Assets | `docs/engineering/MEDIA_ASSET_POLICY.md` + `.gitignore` + `scripts/check-large-files.ps1` | SOURCE OF TRUTH (política) | guard 5 MiB; allowlist | agente principal | novo asset/política | a cada alteração de mídia | D14, D16 | — | `VERIFIED` (local; hook opcional) |
| D16 | Git & Repository | estado real do Git + `.gitignore` | SOURCE OF TRUTH (estado) | branch, staged, remotes, status | agente principal | commit/branch/remote/staged | a cada operação Git relevante | D15 | C07 | `VERIFIED` (local; sem upstream) |
| D17 | Infrastructure | `render.yaml`, `backend/Dockerfile`, `docker-compose.yml` | SOURCE OF TRUTH (config) | arquivos presentes; build histórico | agente principal | mudança de infra/build | a cada alteração de infra | D04, D05, D18 | — | `PARTIAL` (não reproduzido agora) |
| D18 | Deployment | `docs/DEPLOY.md` + `docs/RELEASE_READINESS.md` | OPERATIONAL | nenhuma execução remota | agente principal | mudança de ambiente/deploy | a cada deploy/credencial | D17, D19 | C08 | `NOT VERIFIED` |
| D19 | Human Approvals | `docs/GATE4_PENDENCIAS.md` + `video/MEMORY.md` + `docs/GATE4_LICENSES.md` | SOURCE OF TRUTH (decisão registrada) | aprovação de publicação não concedida | proprietário | nova decisão humana | a cada decisão | D14, D18 | C14 | `HUMAN REVIEW REQUIRED` |
| D20 | Transformation Roadmap | `docs/transformation/TRANSFORMATION_ROADMAP.md` + `CHANGELOG.md` | OPERATIONAL | P0.1–P0.4 + P1.1 | agente principal | mudança de fase/gate | a cada missão | todos | C18 | `VERIFIED` (docs) |

### 1.1 Feature maps (P1.1)

| Item | Valor |
|---|---|
| Índice | `docs/architecture/features/README.md` |
| Mapas | `docs/architecture/features/FEAT-*.md` (18) |
| Mapas transversais | `docs/architecture/{frontend,backend,database,authentication,api,integration,dependency}-map.md`, `critical-paths.md` |
| Validador | `scripts/docs/check_docs.py` |
| Fonte superior | código/testes/artefatos continuam sendo a fonte; o mapa é representação |
| Status da camada | `PARTIAL` — cobertura de 42 endpoints/18 features, sem E2E/coverage/live |
| Owner funcional | agente principal |
| Gatilho | mudança de código, endpoint, tabela, feature ou teste |
| Limite | não prova comportamento, deploy, aprovação ou isolamento |

---

## 2. Evidência que sustenta os status

| Domínio | Evidência executada/observada |
|---|---|
| D02 | `content.json`: 8 categorias, 12 módulos, 31 aulas, 62 questões, 6 artigos. `ContentSeedService` percorre todas as listas |
| D03 | `npm run build` em 22/11: 20 entradas de rota (19 de aplicação + `_not-found`); 6 testes |
| D04 | Surefire: 15 classes, 63 testes, 0 falhas/erros/skips |
| D05 | `FlywaySecurityIntegrationTest` 5/5; V1–V7; 17 tabelas na V1 + `simulations` = 18 |
| D07 | 42 `@*Mapping` em 9 controllers; Swagger documentado |
| D09 | 5 jobs: `integrity`, `backend`, `frontend`, `security`, `overall`; triggers `**`; sem execução remota |
| D11 | `opencode debug agents` → 43; 8 locais com `* * deny`; 10 globais com `shell:*` |
| D14 | 10 MP4 finais; V01 `0C7FC6EE…C9500B`; 1 MP4 pré-polish; QC/loudness |
| D16 | branch `feat/mvp-completo`; HEAD `100d3fe`; staged 0; sem upstream |
| D19 | `GATE4_PENDENCIAS`: publicação não autorizada, escuta humana não realizada, edge-tts pendente |

---

## 3. Conflitos e resoluções

| ID | Afirmação antiga | Evidência atual | Resolução | Status |
|---|---|---|---|---|
| C01 | README/PROGRESSO: 8 módulos, 19 aulas, 38 questões | seed: 12 módulos, 31 aulas, 62 questões | README/PROGRESSO corrigidos; docs históricos recebem nota | `RESOLVED` |
| C02 | README/PROGRESSO/QUALIDADE/AUDITORIA: “16 páginas + not-found” | build: 20 entradas (19 app + not-found) | README/PROGRESSO corrigidos; históricos anotados | `RESOLVED` |
| C03 | README da coleção de vídeos: “nenhum vídeo produzido; assets vazio” | 10 MP4 finais + 1 pré-polish; áudio/drafts | README da coleção atualizado para Gate 4 | `RESOLVED` |
| C04 | `AGENTES_70`: 70 papéis; pode ser lido como 70 agentes | 43 agentes resolvidos; 36 custom + 7 built-in | Nota de distinção em AGENTES_70, README e registry | `RESOLVED` |
| C05 | Skill `invest-facil-testing`: 10 testes, 80% cobertura | 63 testes; nenhum JaCoCo | Skill não pode ser editada; recomendação registrada | `UNRESOLVED` (registrado) |
| C06 | `.claude/CLAUDE.md` corpo: frontend não iniciado | 19 rotas, build verde | Banner histórico já existe; corpo preservado | `PARTIALLY RESOLVED` |
| C07 | `git-publication-plan.md`: “nenhum repositório Git” | repo, remote e branch existem | Banner histórico + substituto | `RESOLVED` |
| C08 | PROGRESSO/QUALIDADE: deadline 29/11 | README/APRESENTAÇÃO/AUDITORIA: 12/12 | 29/11 sem fonte; marcado `UNKNOWN`; 12/12 canônico | `PARTIALLY RESOLVED` |
| C09 | HARD_CONSTRAINTS/PHASE0: CI só `main` | workflow `**` desde P0.2 | Histórico anotado; registry atualizado | `RESOLVED` |
| C10 | HARD_CONSTRAINTS: `npm audit` fora do CI | job `security` desde P0.2 | Registry atualizado | `RESOLVED` |
| C11 | PROGRESSO: integração “VERIFIED” | P0.2: sem E2E automatizado; validação manual | Reclassificado como `TESTED` manual/PARTIAL | `PARTIALLY RESOLVED` |
| C12 | QUALIDADE_FINAL: export de vídeo pendente | Gate 4: 10 MP4 Remotion exportados; pilotos CapCut são outro pipeline | Nota de escopo adicionada | `PARTIALLY RESOLVED` |
| C13 | P0.2: “17 rotas” | build atual: 20 entradas | Correção no P0.4; P0.2 permanece histórico | `PARTIALLY RESOLVED` |
| C14 | GATE4_PENDENCIAS: safe zone topo 60/disclaimer 130 | V01 corrigido para 156/320; outros 9 não | Documento já distingue V01; manter aberto | `UNRESOLVED` (risco) |
| C15 | DOMAIN_OWNERSHIP: 4/8 shell `*`; CI maturity 1 | P0.2/P0.3 mudaram | Nota de atualização no documento | `RESOLVED` (nota) |
| C16 | AGENTES_70: 19 aulas | 31 aulas | Nota de correção no documento | `RESOLVED` |
| C17 | README não indexa transformation/engineering | Docs existem | Índice do README atualizado | `RESOLVED` |
| C18 | transformation README: “nada foi executado” | P0.1–P0.4 executados | Status/banner atualizado | `RESOLVED` |
| C19 | PHASE0_BASELINE: CI só main; 4/8 shell `*` | P0.2/P0.3 | Banner `HISTÓRICO` | `RESOLVED` (histórico) |
| C20 | Riscos P0.3 (MCP global, shell global, etc.) | P0.3 verification | Permanecem `OPEN`; documentar não resolve | `OPEN` |

---

## 3.1 Achados de rastreabilidade (P1.1)

| ID | Achado | Evidência | Impacto |
|---|---|---|---|
| M01 | Angular não existe no repo; stack é Next.js 16.4.6 | `frontend/package.json`, `next.config.ts`, build | divergência histórica resolvida |
| M02 | RLS per-user `s24_*` (V6); V7 endurece funções | V6/V7 + `RlsIsolationIntegrationTest` | V7 local, ainda não aplicada no Lab |
| M03 | `lesson_articles` existe, mas não é usada | V1; nenhum repository/entity/consulta | tabela órfã; artigos relacionados usam categoria |
| M04 | 5 endpoints sem consumidor frontend | `api-map.md` §9 | endpoint ≠ feature usada |
| M05 | `FEAT-MARKET-001`/admin vídeo sem UI | `frontend-map.md` | implementação backend sem fluxo de usuário |
| M06 | MFA/sessões/PATCH perfil sem teste integrado | feature maps AUTH-004/005, USER-001 | verificação parcial |
| M07 | Integrações externas sem teste live | `integration-map.md` | configurado ≠ operacional |
| M08 | Sem E2E/coverage/contract test | frontend/backend maps | rastreabilidade documental, não comportamental |
| M09 | 18 feature maps, 42 endpoints, 18 tabelas | `features/README.md`, `api-map.md`, `database-map.md` | cobertura documental |

---

## 4. Aprovações humanas

Não existe um ledger formal de aprovações. As decisões conhecidas estão em:

- `video/MEMORY.md` (entradas datadas, incluindo voz Thalita e V01);
- `docs/GATE4_PENDENCIAS.md` (publicação não autorizada, escuta humana pendente);
- `docs/GATE4_LICENSES.md` (licenças Remotion/edge-tts);
- `README.md` (licença `NONE`).

**Não há registro de `HUMAN APPROVED` para publicação, deploy, push/merge ou licença
comercial.** Qualquer afirmação nesse sentido é `HUMAN REVIEW REQUIRED`, não aprovada.

---

## 5. Lacunas de evidência

- Nenhum run remoto de CI/branch protection.
- Nenhum deploy Render/Vercel/Supabase.
- Nenhum E2E automatizado de browser.
- Nenhuma cobertura JaCoCo/Vitest.
- Nenhum snapshot OpenAPI/contract test.
- Nenhum teste de carga/WCAG formal.
- Nenhuma escuta humana dos 10 vídeos.
- Nenhuma licença comercial de voz/Remotion.
- Nenhum ledger formal de aprovações.

Essas lacunas não impedem o uso do produto local, mas impedem declarar
`READY FOR RELEASE`, `DEPLOYED` ou `PUBLISHED`.
