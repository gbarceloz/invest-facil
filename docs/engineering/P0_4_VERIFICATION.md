# P0.4 — SOURCE OF TRUTH & CONTEXT INTEGRITY — VERIFICATION

> **Atualização S2.8 (22/11/2026):** relatório histórico. Estado atual: V1-V7, 63 testes, RLS per-user; a V7 é local e ainda não foi aplicada no Lab. Ver docs/verification/S2.8/S2.8_DATABASE_FUNCTION_HARDENING_REPORT.md.

**Data:** 22/11/2026
**Status:** **PASS WITH LIMITATIONS**
**Escopo:** inventário documental, autoridade, conflitos, status, índice de contexto,
frescor, validação e riscos de conhecimento.
**Não executado:** commit, push, merge, PR, deploy, publicação, alteração de agentes,
skills, workflows, código de produto, banco, migrations, vídeos, drafts ou configuração
global.

---

## 1. Baseline

| Item | Valor |
|---|---|
| Repositório | `<repo>` |
| Branch | `feat/mvp-completo` |
| HEAD | `100d3fe docs: relatorio consolidado da missao complementar` |
| Staged | **0** |
| Working tree | 60 entradas: 32 modificadas e 28 não rastreadas (antes de P0.4) |
| Remote | `origin https://github.com/gbarceloz/invest-facil.git` |
| Upstream | **nenhum** (`feat/mvp-completo` não tem upstream) |
| Docs no workspace | **334** arquivos `.md/.mdx/.txt` (excluindo `node_modules`, `target`, `.next`, `_staging`) |
| Docs rastreados | **33** |
| Docs não rastreados/ignorados | 301 (histórico, `_audit`, `docs/transformation`, `video`, `docs/engineering`) |
| Agentes resolvidos | **43** (7 built-in + 28 globais + 8 locais) |
| MCP | 3 (`auron-vault`, `capcut`, `vectcut-api`) |
| Plugins | 0 |

Hashes SHA-256 de 26 documentos existentes foram registrados antes das edições em
`%TEMP%\p04-prehashes.txt`; os principais estão na tabela de rollback (§13).

### 1.1 Evidência técnica coletada

| Fato | Evidência |
|---|---|
| Backend | 28 testes, 0 falhas/erros/skips; Spring Boot 3.5.6 / Java 21 |
| Frontend | `npm test` 6/6; `npm run build` 20 entradas de rota (19 app + `_not-found`) |
| Seed | 8 categorias, 12 módulos, 31 aulas, 62 questões, 6 artigos |
| API | 42 `@*Mapping` em 9 controllers |
| Banco | V1–V5; 17 tabelas na V1 + `simulations`; 5/5 no Testcontainers |
| CI | 5 jobs (`integrity`, `backend`, `frontend`, `security`, `overall`); triggers `**` |
| Vídeo | 10 MP4 finais + 1 pré-polish; V01 `0C7FC6EE…C9500B`; QC/loudness |
| Agentes | 43; 8 locais default-deny; 10 globais com `shell:*` |
| Deploy | nenhuma execução remota; `NOT VERIFIED` / `NOT DEPLOYED` |

---

## 2. Inventário

### 2.1 Documentação

| Grupo | Exemplos | Classe |
|---|---|---|
| Produto/operação | `README.md`, `docs/PROGRESSO_GERAL.md`, `docs/DEPLOY.md`, `docs/RELEASE_READINESS.md` | OPERATIONAL/SOURCE |
| Arquitetura/API/segurança | `docs/architecture/*`, `docs/api/README.md`, `docs/security/*` | OPERATIONAL/SOURCE |
| Engenharia P0 | `docs/engineering/P0_1..P0_4`, `CI_POLICY`, `AGENT_*` | SOURCE/OPERATIONAL |
| Transformação | `docs/transformation/**` | OPERATIONAL/HISTORICAL |
| Vídeo | `video/README.md`, `video/MEMORY.md`, `GATE4_*`, `V*/**` | OPERATIONAL/GENERATED |
| Evidência histórica | `_audit/**`, `_quarantine/**`, relatórios datados | HISTORICAL/ARCHIVED |
| Skills/agentes | `.opencode/**`, `.claude/**` | SOURCE (instruções) |

### 2.2 Configuração e evidência técnica

`backend/pom.xml`, `frontend/package.json`, lockfiles, `.github/workflows/ci.yml`,
`backend/src/main/resources/db/migration/**`, `backend/src/main/resources/seed/content.json`,
`docs/supabase/*.sql`, `render.yaml`, `backend/Dockerfile`, `docker-compose.yml`,
surefire reports, MP4/hashes e QC.

### 2.3 Agentes e skills

Foram lidos os 8 agentes locais, 28 globais (inventário P0.3), 5 skills locais e 4 skills
Claude. Nenhum foi alterado. Achados de referência:

- `if-sound-designer` cita `docs/RELATORIO_TECNICO.md`, que não existe; o caminho correto é
  `video/projects/investfacil-high-impact-01/docs/RELATORIO_TECNICO.md`.
- `.claude/skills/invest-facil-testing` diz 10 testes/80%; há 28 e nenhum JaCoCo.
- `.claude/CLAUDE.md` mantém corpo histórico (“frontend não iniciado”), com banner no topo.
- `AGENTES_70.md` pode ser confundido com 70 agentes; são 70 papéis documentais.

---

## 3. Hierarquia de autoridade

Detalhe em `docs/engineering/SOURCE_OF_TRUTH.md`. Resumo:

1. Código/configuração em execução.
2. Teste/comando executado com resultado.
3. Artefato/hash observado.
4. Configuração declarada.
5. Documento canônico/operacional.
6. Referência.
7. Histórico/gerado/arquivado.

Para aprovações, vale o registro de decisão humana; silêncio não é aprovação. Configuração
declarada não prova execução remota; documento não prova comportamento.

---

## 4. Source Registry

`docs/engineering/SOURCE_REGISTRY.md` contém **20 domínios (D01–D20)**, com fonte canônica,
tipo, evidência, owner funcional, gatilho de atualização, frescor, dependências, conflitos e
status.

| Status | Domínios |
|---|---|
| `VERIFIED` | D01, D04, D05, D15, D16, D20 (6) |
| `PARTIAL` | D02, D03, D06, D07, D08, D09, D10, D11, D12, D14, D17 (11) |
| `UNKNOWN` | D13 (1) |
| `NOT VERIFIED` | D18 (1) |
| `HUMAN REVIEW REQUIRED` | D19 (1) |

Nenhum domínio foi declarado `READY FOR RELEASE`, `DEPLOYED` ou `PUBLISHED`.

---

## 5. Contradições

| ID | Afirmação antiga | Evidência | Resolução | Status |
|---|---|---|---|---|
| C01 | README/PROGRESSO: 8 módulos, 19 aulas, 38 questões | seed: 12 módulos, 31 aulas, 62 questões | README/PROGRESSO corrigidos; históricos anotados | `RESOLVED` |
| C02 | 16 páginas + not-found | build: 20 entradas (19 app + not-found) | README/PROGRESSO corrigidos; históricos anotados | `RESOLVED` |
| C03 | README da coleção: “nenhum vídeo produzido; assets vazio” | 10 MP4 finais + 1 pré-polish; áudio/drafts | README da coleção atualizado | `RESOLVED` |
| C04 | 70 papéis lidos como 70 agentes | 43 agentes resolvidos | Nota em AGENTES_70/README/registry | `RESOLVED` |
| C05 | Skill testing: 10 testes/80% | 28 testes; sem JaCoCo | Skill não editada; recomendação registrada | `UNRESOLVED` |
| C06 | CLAUDE.md: frontend não iniciado | 19 rotas/build | Banner existente; corpo preservado | `PARTIALLY RESOLVED` |
| C07 | git-publication-plan: “sem Git” | repo/remote/branch existem | Banner histórico + substituto | `RESOLVED` |
| C08 | Deadline 29/11 | README/APRESENTAÇÃO/AUDITORIA: 12/12 | 29/11 `UNKNOWN`; 12/12 canônico | `PARTIALLY RESOLVED` |
| C09 | CI só `main` | workflow `**` (P0.2) | Histórico anotado; registry atualizado | `RESOLVED` |
| C10 | `npm audit` fora do CI | job `security` (P0.2) | Registry atualizado | `RESOLVED` |
| C11 | Integração “VERIFIED” | sem E2E; validação manual | Reclassificado `TESTED` manual | `PARTIALLY RESOLVED` |
| C12 | Export de vídeo pendente | Gate4: 10 MP4; pilotos CapCut são outro pipeline | Nota de escopo | `PARTIALLY RESOLVED` |
| C13 | P0.1/P0.2: “17 rotas” | build: 20 entradas | Correção no P0.4; relatórios permanecem históricos | `PARTIALLY RESOLVED` |
| C14 | Safe zone 60/130 | V01 156/320; outros 9 não | Distinção mantida; risco aberto | `UNRESOLVED` |
| C15 | DOMAIN_OWNERSHIP: 4/8 shell `*` | P0.3: 0/8 shell `*`; 4 mídia | Nota de atualização | `RESOLVED` (nota) |
| C16 | AGENTES_70: 19 aulas | 31 aulas | Nota/correção | `RESOLVED` |
| C17 | README sem índice de engenharia | docs existem | Índice atualizado | `RESOLVED` |
| C18 | transformation README: nada executado | P0.1–P0.4 | Status atualizado | `RESOLVED` |
| C19 | PHASE0: CI só main; 4/8 shell `*` | P0.2/P0.3 | Banner `HISTÓRICO` | `RESOLVED` (histórico) |
| C20 | Riscos P0.3 | P0.3 verification | Permanecem `OPEN` | `OPEN` |

Resumo: **12 resolvidas, 5 parciais, 2 não resolvidas, 1 aberta**. Nenhuma foi resolvida
apenas por “documento mais recente”; todas usaram código/teste/artefato ou foram marcadas
como incerteza.

---

## 6. Status

A semântica está em `SOURCE_OF_TRUTH.md` §4. Exemplos aplicados:

| Objeto | implementation | test | verification | human_review | deployment | publication |
|---|---|---|---|---|---|---|
| Backend local | `IMPLEMENTED` | `TESTED` | `VERIFIED` | não exigido | `NOT DEPLOYED` | `NOT PUBLISHED` |
| Conteúdo (seed) | `IMPLEMENTED` | `TESTED` | `VERIFIED` (contagens) | não exigido | `NOT DEPLOYED` | `NOT PUBLISHED` |
| CI | `IMPLEMENTED` | `TESTED` (local) | `PARTIAL` (remoto) | — | — | — |
| V01 / 10 variantes | `IMPLEMENTED` | `TESTED` | `VERIFIED` técnico | `HUMAN REVIEW REQUIRED` | `NOT DEPLOYED` | `NOT PUBLISHED` |
| Deploy Render/Vercel | `IMPLEMENTED` (runbook) | `PARTIAL` | `NOT VERIFIED` | `HUMAN REVIEW REQUIRED` | `NOT DEPLOYED` | `NOT PUBLISHED` |
| Agentes locais | `IMPLEMENTED` | `TESTED` | `PARTIAL` | decisão global pendente | — | — |

Aliases legados (`DEFINED`, `NOT_STARTED`, `IN_PROGRESS`, `DONE`) foram mapeados; não são
usados como status canônicos em novos documentos.

---

## 7. Context Index e testes de descoberta

`CONTEXT_INDEX.md` encaminha 20 domínios para documentos e fontes técnicas, com status e
atenção. Testes executados sem alterar arquivos:

| # | Pergunta | Índice/fonte consultada | Evidência | Resposta | Ambiguidade | Resultado |
|---:|---|---|---|---|---|---|
| 1 | Estado atual do backend | D04 + `backend/pom.xml` + surefire | 28 testes; Spring Boot 3.5.6; 42 mappings | funcional local, sem deploy | “funcional” não é produção | PASS |
| 2 | Quais verificações a CI faz | D09 + `CI_POLICY` + workflow | 5 jobs; triggers `**`; sem run remoto | backend/frontend/security/integrity/overall | remoto/branch protection ausentes | PASS |
| 3 | Segurança dos agentes | D11 + `AGENT_*` + P0.3 | 43 agentes; 8 locais default-deny; 10 globais shell `*` | locais endurecidos; globais abertos | browser/MCP global não verificados | PASS |
| 4 | Status real dos vídeos | D14 + GATE4 index/PENDENCIAS/MEMORY | 10 MP4 + 1 pré-polish; V01 hash; publicação não aprovada | técnico aprovado; humano/publicação pendentes | Gate4 ≠ pilotos CapCut | PASS |
| 5 | Fonte oficial de uma feature | D02 + seed + controllers | 8/12/31/62/6; 42 mappings | seed + código são a fonte | sem feature map detalhado | PASS |
| 6 | Local vs publicado | D01/D18/D19 + README/DEPLOY | nenhum deploy/log/URL; vídeos não publicados | local funcional; publicação não | sem credenciais | PASS |

**Fixtures de contradição (fictícios, em `%TEMP%`):**

- fonte antiga “CI só main” vs fonte atual/worflow → detectada e resolvida pela evidência;
- status inválido `DONE` → convertido para `VERIFIED` somente com evidência; sem evidência,
  `NOT VERIFIED`;
- link para `docs/does-not-exist.md` → detectado pelo checker de links;
- “APPROVED para publicação” sem registro → classificado `HUMAN REVIEW REQUIRED`, não
  aprovado.

Nenhum fixture foi criado dentro de documentos reais ou gerou aprovação/deploy falso.
Os quatro testes de fixture foram executados em `%TEMP%`: conflito old/current resolvido
pelo workflow (`**`), `DONE` sem evidência rebaixado para `NOT VERIFIED`, link inexistente
detectado e `APPROVED` sem registro classificado como `HUMAN REVIEW REQUIRED`.

---

## 8. Documentação corrigida

### 8.1 Criada

- `docs/engineering/SOURCE_OF_TRUTH.md` — hierarquia, semântica, conflitos, evidência.
- `docs/engineering/CONTEXT_INDEX.md` — entrada por domínio e contexto mínimo.
- `docs/engineering/SOURCE_REGISTRY.md` — matriz D01–D20, owners e frescor.
- `docs/engineering/P0_4_VERIFICATION.md` — este relatório.
- `scripts/docs/check_docs.py` — checker leve (links, D01–D20, placeholders).

### 8.2 Atualizada (com motivo)

| Arquivo | Correção |
|---|---|
| `README.md` | contagens 12/31/62, 19 rotas, integração manual, índice de engenharia, 70 papéis, riscos P0.3 |
| `docs/PROGRESSO_GERAL.md` | deadline 12/12/29-11 UNKNOWN, contagens, 20 rotas, CI remoto, fase P0, semântica |
| `docs/QUALIDADE_FINAL.md` | banner histórico; 20 rotas; 12/31/62; Gate4 ≠ pilotos |
| `docs/AUDITORIA_GERAL.md` | banner; contagens; 20 rotas |
| `docs/AGENTES_70.md` | 70 papéis ≠ 43 agentes; 31 aulas/62 questões |
| `docs/RELEASE_READINESS.md` | nota P0.2/P0.3/P0.4; deploy NOT VERIFIED |
| `docs/security/SECURITY.md` | separação segurança do produto × agentes; riscos abertos |
| `docs/transformation/README.md` | P0.1–P0.4 executados; links canônicos |
| `docs/transformation/PHASE0_BASELINE.md` | banner HISTÓRICO |
| `docs/transformation/RISK_ASSESSMENT.md` | status pós-P0.1–P0.4 |
| `docs/transformation/HARD_CONSTRAINTS_REGISTRY.md` | CI/audit/media/shell atuais |
| `docs/transformation/DOMAIN_OWNERSHIP_MATRIX.md` | CI/segurança/docs/agentes |
| `docs/transformation/CONTEXT_AND_MEMORY.md` | ações P0.4 e pendências |
| `docs/transformation/AGENT_REGISTRY.md` | 7 built-in/43 total; riscos |
| `docs/transformation/VERIFICATION_INVENTORY.md` | nota P0.2–P0.4 |
| `docs/transformation/FEATURE_MAP_INDEX.md` | contexto ≠ feature map |
| `docs/FIREBASE_EVALUATION.md` | dimensionamento de 19 → 31 aulas |
| `docs/GATE1_AUDIT.md` | banner histórico; Gate4 produziu 10 MP4 |
| `docs/GATE2_VALIDATION.md` | banner histórico; Gate4 produziu 10 MP4 |
| `docs/transformation/FAILURE_CATALOG.md` | status P0.4 de F02/F08/F09/F10/F11/F14/F15 |
| `docs/transformation/ENGINEERING_LEDGER.md` | nota de 20 entradas de rota |
| `docs/transformation/CHANGELOG.md` | entrada P0.4 |
| `docs/transformation/TRANSFORMATION_ROADMAP.md` | P0.4 concluído; P1.1 pode começar em escopo local |
| `docs/engineering/P0_2_VERIFICATION.md` | nota P0.4 sobre 20 entradas de rota |
| `docs/engineering/P0_1_VERIFICATION.md` | nota P0.4 sobre 20 entradas de rota |
| `docs/architecture/database.md` | contagens de conteúdo 8/12/31/62 |
| `video/projects/investfacil-10-creative-variants/README.md` | Gate4, 10 MP4, V01, finalistas |
| `git-publication-plan.md` | banner HISTÓRICO |

**Não alterados:** `.opencode/agents/**`, `.opencode/skills/**`, `.claude/skills/**`,
`.github/workflows/**`, código de produto, migrations, banco, vídeos, drafts, config global.

---

## 9. Freshness

Gatilhos por evento em `SOURCE_OF_TRUTH.md` §7 e `SOURCE_REGISTRY.md`. Resumo:

| Evento | Atualiza |
|---|---|
| mudança de código/dependência | D03, D04, D06, D07 |
| migration/schema | D05 |
| teste/suite | D08 |
| workflow/runner | D09 |
| agente/permissão | D11 |
| skill | D12 |
| token/componente | D13 |
| render/QC/aprovação | D14, D19 |
| asset/política | D15 |
| commit/branch/remote | D16 |
| infra/deploy | D17, D18 |
| decisão humana | D19 |
| fase/gate | D20 |

Não há prazo diário/semanal arbitrário. A atualização ocorre na mesma tarefa da mudança;
caso contrário, registrar `STALE` e pendência.

---

## 10. Validação

| Verificação | Resultado |
|---|---|
| `scripts/docs/check_docs.py` | **PASS** (7 canônicos, 22 links relativos, D01–D20 únicos) |
| Link scan amplo (225 arquivos) | 26 links relativos, **0 quebrados** (pós-edições) |
| IDs de domínio | D01–D20 únicos |
| Hash dos 8 agentes locais | inalterados vs P0.3 |
| Config global | hash `F847616D…79E910` inalterado |
| Backend | surefire 28/28; assert PASS |
| Frontend | Vitest 6/6; build 20 entradas |
| Contagens de conteúdo | seed 8/12/31/62/6 |
| MP4 | 10 finais + 1 pré-polish; V01 hash confere |
| Agentes | 43 resolvidos |
| CI | 5 jobs; triggers `**` |
| Docs proibidos | nenhum agente/skill/workflow/produto alterado |
| `git diff --check` (docs) | **PASS**; o tree completo tem um blank line EOF pré-existente em `frontend/app/app/progresso/page.tsx`, não tocado pelo P0.4 |

**Limite:** o checker prova propriedades documentais (existência/links/IDs/placeholders),
não comportamento de código, teste executado, deploy, aprovação ou permissão efetiva.

---

## 11. Riscos

### 11.1 Riscos P0.3 (permanecem abertos)

| ID | Risco | Status | Evidência/recomendação |
|---|---|---|---|
| R-P03-01 | MCP global lê/escreve projeto | `OPEN` | `auron-auditor` leu `backend/pom.xml` via MCP; restringir MCP por agente/política |
| R-P03-02 | 10 globais com `shell:*` | `OPEN` | decisão humana; allowlist/isolamento |
| R-P03-03 | `build`/globais com operações críticas indiretas | `OPEN` | shell/MCP; requer sandbox/aprovação |
| R-P03-04 | Root do MCP diverge da config | `OPEN` | config AURON BRAIN × observado InvestFacil; investigar |
| R-P03-05 | `npx -y` sem versão | `OPEN` | pinar versão/validar pacote |
| R-P03-06 | `ffmpeg` escreve fora do escopo | `OPEN` | teste criou PNG; remover/limitar ou isolar |
| R-P03-07 | Rede via `ffmpeg` não testada | `OPEN` | bloquear protocolos ou isolar |
| R-P03-08 | Sem sandbox/taint | `OPEN` | isolamento de SO/taint |
| R-P03-09 | Sem aprovação técnica (`ask`) | `OPEN` | configurar `ask`/ledger |
| R-P03-10 | Browser não verificado | `OPEN` | testar com cliente conectado |
| R-P03-11 | CLI 2.2.5 × servidor 2.3.2 | `OPEN` | alinhar versões |

### 11.2 Riscos documentais

| ID | Risco | Status | Mitigação |
|---|---|---|---|
| R-DOC-01 | Skill testing desatualizada | `OPEN` (C05) | corrigir skill em missão autorizada |
| R-DOC-02 | Drift recorrente em 300+ docs | `MITIGATED` (parcial) | registry + checker; ainda sem CI |
| R-DOC-03 | Sem ledger formal de aprovação | `OPEN` | criar/registrar decisões |
| R-DOC-04 | Feature maps ausentes | `OPEN` | P1.1 |
| R-DOC-05 | CI remoto/branch protection | `OPEN` | P0.2 pendência |
| R-DOC-06 | Hook de mídia opcional | `OPEN` | instalar/decidir |
| R-DOC-07 | Docs históricos numerosos | `MITIGATED` (parcial) | banners/índice; não apagar |

Nenhum risco foi marcado `RESOLVED` ou `ACCEPTED` sem evidência/decisão humana.

---

## 12. Limitações

- Sem execução remota de CI, branch protection ou deploy.
- Sem E2E automatizado, cobertura, SAST/DAST, teste de carga ou WCAG.
- Sem escuta humana dos 10 vídeos; sem licença comercial de voz/Remotion.
- Sem ledger formal de aprovações humanas.
- Sem feature maps completos; o índice resolve descoberta, não implementação.
- `.claude/CLAUDE.md` e skills não foram editados; C05/C06 permanecem.
- O checker é limitado a links/IDs/placeholders; não valida semântica profunda.
- Backend não foi reexecutado nesta missão; usou-se surefire de P0.2 e `assert`.
- Banco não foi consultado ao vivo; usou-se seed/migrations/Testcontainers.
- A contagem de 334 docs é do baseline; após P0.4 há +4 docs.
- O `git diff --check` do tree completo falha por um blank line EOF pré-existente em
  `frontend/app/app/progresso/page.tsx`; não foi corrigido (código de produto).

---

## 13. Rollback

Novos arquivos (remover somente eles):

- `docs/engineering/SOURCE_OF_TRUTH.md`
- `docs/engineering/CONTEXT_INDEX.md`
- `docs/engineering/SOURCE_REGISTRY.md`
- `docs/engineering/P0_4_VERIFICATION.md`
- `scripts/docs/check_docs.py`

Arquivos modificados — hash antes → depois:

| Arquivo | SHA-256 antes | SHA-256 depois |
|---|---|---|
| `README.md` | `8A14E75E…6921D2E6` | `2542FCF9…72085735` |
| `docs/PROGRESSO_GERAL.md` | `B2683E7D…6242CB17` | `9EB61F12…3102E1BE` |
| `docs/QUALIDADE_FINAL.md` | `24DF8110…892720` | `AF3369E9…0FFF7D4` |
| `docs/AUDITORIA_GERAL.md` | `A4001519…D1D2996` | `4A06D03D…AA011214` |
| `docs/AGENTES_70.md` | `6C98C989…E7109862` | `0196B08A…0520E201` |
| `docs/RELEASE_READINESS.md` | `983A901C…59C0FB` | `373CC9B8…4C971C99` |
| `docs/security/SECURITY.md` | `4927DED8…0B05E6` | `0CE61D87…C510DF8` |
| `docs/transformation/README.md` | `1EF4C707…30D6E0F` | `3A7DCECE…0EC22B2` |
| `docs/transformation/PHASE0_BASELINE.md` | `101BD834…1D73E85` | `09FA7FCC…B894E8A` |
| `docs/transformation/RISK_ASSESSMENT.md` | `A6F4A49B…12F44C` | `D136F38E…A1A4BF4` |
| `docs/transformation/HARD_CONSTRAINTS_REGISTRY.md` | `9A9714FC…663BA51` | `0D4BC05E…0BBAC53` |
| `docs/transformation/DOMAIN_OWNERSHIP_MATRIX.md` | `B070ADFD…9268B` | `DA044A1A…151F33A` |
| `docs/transformation/CONTEXT_AND_MEMORY.md` | `536F16E4…C4D3E3` | `E023F3DD…77DA6CD` |
| `docs/transformation/AGENT_REGISTRY.md` | `7AD4F3F7…647B96` | `D808805B…F7E4` |
| `docs/transformation/VERIFICATION_INVENTORY.md` | `C3B236F1…692B7` | `909D1773…BC4B8` |
| `docs/transformation/FEATURE_MAP_INDEX.md` | `E09FB642…1EACB` | `85B619BF…DE44` |
| `video/.../README.md` | `B0746CFB…83BEC0` | `1B42065D…B35CCF` |
| `git-publication-plan.md` | `5FACEF40…DD955` | `C1CC5EC3…A5768A` |

> Os hashes “depois” foram coletados durante as edições; ajustes posteriores de banner/data
> podem alterar o hash final. O valor “antes” é a referência de rollback.

### 13.1 Edições tardias sem pré-hash capturado

Estas edições foram feitas depois do manifesto inicial de 26 hashes. A reversão é
descrita pelo estado anterior, sem alegar hash que não foi coletado.

| Arquivo | Estado anterior | Reversão |
|---|---|---|
| `docs/FIREBASE_EVALUATION.md` | “19 aulas” | restaurar `HEAD` (arquivo rastreado) |
| `docs/GATE1_AUDIT.md` | sem banner histórico | remover o bloco `HISTÓRICO (P0.4…)` |
| `docs/GATE2_VALIDATION.md` | sem banner histórico | remover o bloco `HISTÓRICO (P0.4…)` |
| `docs/transformation/FAILURE_CATALOG.md` | sem `Status P0.4` | remover a seção `Status P0.4` |
| `docs/transformation/ENGINEERING_LEDGER.md` | sem nota de rotas | remover a nota `Nota P0.4` |
| `docs/transformation/CHANGELOG.md` | topo em P0.3 | remover a entrada P0.4 |
| `docs/transformation/TRANSFORMATION_ROADMAP.md` | topo em P0.3 | remover nota P0.4 e bloco P1.1 |
| `docs/engineering/P0_2_VERIFICATION.md` | sem nota de rotas | remover a nota `P0.4` |
| `docs/engineering/P0_1_VERIFICATION.md` | sem nota de rotas | remover a nota `P0.4` |
| `docs/architecture/database.md` | “8/8/19/38” | restaurar `HEAD` |

Procedimento:

1. Para arquivos **rastreados**, restaurar a versão do HEAD com `git show HEAD:<path>` para
   um arquivo temporário e copiar de volta; **não** usar `git reset --hard`/`git clean`.
2. Para arquivos **não rastreados** (`video/.../README.md`, `git-publication-plan.md`,
   `docs/transformation/*`), reverter as edições listadas ou restaurar de backup próprio;
   os hashes acima permitem conferir.
3. Remover os 5 arquivos novos.
4. Preservar P0.1–P0.3, `_audit`, relatórios e evidências históricas.
5. O rollback **não foi executado**; foi apenas documentado.

---

## 14. Git

- Branch: `feat/mvp-completo`
- HEAD: `100d3fe`
- Staged: **0**
- Commits desta missão: **0**
- Push/PR/merge/deploy: **não**
- Upstream: inexistente
- Working tree final: **68 entradas** (39 modificadas, 29 não rastreadas). O P0.4 tocou 9 docs rastreados: 7 passaram a `M` agora e 2 (`PROGRESSO`, `QUALIDADE`) já estavam `M`; o restante é preexistente
- Alterações: docs + 1 script; agentes/skills/workflows/produto intocados

---

## 15. Próxima missão

**P1.1 pode começar apenas no escopo de feature maps/documentação/verificação local.**
Continuam bloqueando atividades específicas:

- deploy, publicação e upload: sem credenciais e sem aprovação humana;
- release: sem E2E, cobertura, branch protection e run remoto;
- autonomia global de agentes: R-P03-01..11 abertos;
- vídeo: escuta humana e licença de voz/Remotion pendentes;
- aprovações: sem ledger formal.

Não iniciar P1.1 automaticamente; aguardar revisão do proprietário.
