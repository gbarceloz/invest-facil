# P0.2 — CI ALL BRANCHES — VERIFICATION REPORT

> **Atualização S2.8 (22/11/2026):** relatório histórico. Estado atual: V1-V7, 63 testes, RLS per-user; a V7 é local e ainda não foi aplicada no Lab. Ver docs/verification/S2.8/S2.8_DATABASE_FUNCTION_HARDENING_REPORT.md.

**Data:** 21/11/2026
**Status:** **PASS WITH LIMITATIONS**

> **Nota P0.4 (22/11/2026):** relatório histórico. O build de 21/11 foi registrado como
> “17 rotas”; a contagem atual é **20 entradas de rota** (19 app + `_not-found`). O workflow
> e as limitações remotas permanecem como descritos. Ver `P0_4_VERIFICATION.md`.

**Escopo:** triggers, jobs, gates, permissões, Testcontainers, frontend, segurança e validação local.
**Não executado:** commit, push, PR, merge, deploy, branch protection remota ou workflow no GitHub Actions.

---

## 1. Baseline

| Item | Valor |
|---|---|
| Workflow existente | `.github/workflows/ci.yml` |
| Triggers anteriores | `push` e `pull_request` apenas em `main`; `workflow_dispatch` |
| Jobs anteriores | `backend`, `frontend` |
| Permissões | `contents: read` |
| Automação de integração | `mvn -B clean verify` sem assert de testes executados |
| Frontend | `npm ci`, `npm test`, `npm run build`; sem typecheck explícito |
| Segurança | sem `npm audit` no CI |
| Integridade | sem job |
| Gate agregado | ausente |
| Branch atual | `feat/mvp-completo`, **não coberta** pelo workflow anterior |
| Staged | 0 |
| Histórico | sem branch protection verificável localmente |

---

## 2. Problemas encontrados

| ID | Severidade | Problema | Evidência |
|---|---|---|---|
| P01 | **HIGH** | CI não rodava em `feat/mvp-completo` nem em branches futuras | triggers `branches: [main]` |
| P02 | **HIGH** | Testes de integração podiam ser skipped sem falhar quando Docker não existia | `@Testcontainers(disabledWithoutDocker = true)`; execução sem `DOCKER_HOST` mostrou 6 skipped e BUILD SUCCESS |
| P03 | **HIGH** | Nenhum gate agregado; jobs podiam falhar sem um check único de conclusão | workflow anterior |
| P04 | **HIGH** | Nenhuma auditoria de dependências no CI | ausência de `npm audit` |
| P05 | **MEDIUM** | Typecheck não era um step explícito | apenas build |
| P06 | **MEDIUM** | Sem job de integridade de configuração/workflow | ausência |
| P07 | **MEDIUM** | Sem timeout/concurrency | workflow anterior |
| P08 | **LOW** | Actions oficiais em tags major mutáveis (`@v4`) | workflow |
| P09 | **HIGH (residual)** | `npm audit` completo aponta vulnerabilidades críticas em devDependencies (`vitest`/`tinypool`) | audit local |
| P10 | **INFORMATIONAL** | `npm ci`/`mvn clean` locais falharam por arquivos em uso (SWC/jar), não por lockfile | execução local |

---

## 3. Arquitetura final

```text
integrity ─┐
backend  ──┼─→ overall
frontend ──┤
security ──┘
```

| Job | Função | Gate |
|---|---|---|
| `integrity` | required files, JSON, triggers, permissões, padrões proibidos | Integrity |
| `backend` | `mvn -B clean verify` + assert de 28 testes/Testcontainers/Flyway/secrets | Backend + Database + Security scan |
| `frontend` | `npm ci`, Vitest, typecheck, build | Frontend |
| `security` | `npm audit --omit=dev --audit-level=high` | Security |
| `overall` | exige `success` dos quatro | Overall |

`overall` usa `if: always()` e falha se qualquer `needs.*.result` não for `success`.
O agregador é **inline no workflow** e não executa nenhum script do checkout: ele lê apenas
os resultados confiáveis de `needs`, então um PR não pode neutralizar o gate alterando
um arquivo do repositório.

---

## 4. Arquivos alterados/criados

### Alterado
- `.github/workflows/ci.yml` — triggers, jobs, gates, timeouts, concurrency, permissões, assert e audit.

### Criado
- `scripts/ci/check-integrity.sh`
- `scripts/ci/assert-surefire.py`
- `docs/engineering/CI_POLICY.md`
- `docs/engineering/P0_2_VERIFICATION.md` (este relatório)

### Atualizado
- `docs/transformation/CHANGELOG.md`
- `docs/transformation/TRANSFORMATION_ROADMAP.md`

Nenhum código de produto, agente, skill, vídeo, draft ou migration foi alterado.

---

## 5. Triggers

| Evento | Filtro | Cobertura |
|---|---|---|
| `push` | `branches: ["**"]` | `main`, `feat/mvp-completo`, `feature/*`, `fix/*`, branches futuras |
| `pull_request` | `branches: ["**"]` | PRs para qualquer branch base, incluindo forks |
| `workflow_dispatch` | — | execução manual |

Sem `paths`/`paths-ignore`. Sem `pull_request_target`. `concurrency` agrupa por workflow + head ref e cancela execução anterior.

---

## 6. Segurança

- `permissions: contents: read` global.
- Nenhum secret/deploy token.
- Nenhum `contents: write`/`pull-requests: write`/`write-all`.
- PRs de fork recebem apenas leitura.
- `security` audita dependências de produção; `npm audit --omit=dev` local = 0.
- **Residual:** `npm audit` completo local = 3 vulnerabilidades (1 moderate, 2 critical) em `vitest`/`tinypool`; correção exige vitest 5.1.1, mudança breaking não feita nesta missão.
- Actions oficiais permanecem em tags major (`@v4`); pinagem por SHA não foi feita.

---

## 7. Testes executados

| Verificação | Comando | Resultado |
|---|---|---|
| YAML parse | `npx --yes js-yaml@4.1.0 .github/workflows/ci.yml` | **PASS** (exit 0) |
| Integridade | `bash scripts/ci/check-integrity.sh` | **PASS** |
| Backend com Docker | `mvn -B test -Pdocker-desktop-newapi` + `DOCKER_HOST=tcp://127.0.0.1:2375` | **28/28**, 0 skipped, BUILD SUCCESS |
| Backend sem Docker | `mvn -B test` | 28 reportados (22 executados), **6 skipped**, BUILD SUCCESS — o assert deve falhar |
| Assert sem Docker | `python scripts/ci/assert-surefire.py` | **FAIL** (skipped=6) — comportamento correto |
| Assert com Docker | idem, após 28/28 | **PASS**; Database/Security scan gates PASS |
| Clean verify limpo | cópia temporária + `mvn -B clean verify -Pdocker-desktop-newapi` | **28/28**, 0 skipped, BUILD SUCCESS |
| Frontend instalação | `npm ci` em cópia temporária | **PASS** (376 pacotes) |
| Frontend testes | `npm test` | **6/6** |
| TypeScript | `npm run typecheck` | **PASS** |
| Build | `npm run build` | **PASS**, 17 rotas |
| Audit produção | `npm audit --omit=dev --audit-level=high` | **0 vulnerabilidades** |
| Audit completo | `npm audit --audit-level=high` | **FAIL** (3 dev vulns), residual documentado |
| Gate agregado (bloco extraído do workflow) | 4× `success` | **PASS** (exit 0) |
| Gate backend failure | `BACKEND=failure` | **FAIL** (exit 1) |
| Gate frontend failure | `FRONTEND=failure` | **FAIL** (exit 1) |
| Gate security skipped | `SECURITY=skipped` | **FAIL** (exit 1) |
| Gate cancelled | `INTEGRITY=cancelled` | **FAIL** (exit 1) |
| Gate múltiplas falhas | `BACKEND=failure`, `FRONTEND=skipped` | **FAIL** (exit 1) |

O bloco do `overall` foi **extraído do próprio YAML** com `js-yaml` e executado com as
mesmas variáveis de ambiente; não é uma cópia manual. Assim o que foi testado é
exatamente o que roda no runner.

**Limitação local:** `mvn clean` no repo e `npm ci` no repo falharam por arquivos em uso (jar/SWC); a validação limpa foi feita em cópias temporárias. CI em runner limpo não tem esses locks.

---

## 8. Cenários

| # | Cenário | Status | Evidência |
|---:|---|---|---|
| 1 | Push em `feat/mvp-completo` | **PASS estático / NOT VERIFIED remoto** | trigger `**` |
| 2 | Push em `feature/nova-funcionalidade` | **PASS estático / NOT VERIFIED remoto** | trigger `**` |
| 3 | Push em `fix/correcao` | **PASS estático / NOT VERIFIED remoto** | trigger `**` |
| 4 | PR para `main` | **PASS estático / NOT VERIFIED remoto** | `pull_request` `**` |
| 5 | Alteração só frontend | **PASS estático** | sem path filter; jobs rodam |
| 6 | Alteração só backend | **PASS estático** | sem path filter |
| 7 | Alteração em migration | **PASS estático** | backend + Flyway + assert |
| 8 | Alteração em workflow | **PASS local** | integrity + YAML parse |
| 9 | Falha de teste backend | **PASS simulado (FAIL)** | bloco do `overall` extraído do workflow, exit 1 |
| 10 | Falha de teste frontend | **PASS simulado (FAIL)** | idem, exit 1 |
| 11 | Falha de build | **PASS simulado (FAIL)** | frontend != success → exit 1 |
| 12 | Falha/skip de auditoria | **PASS simulado (FAIL)** | security skipped → exit 1 |
| 13 | Ausência de cache | **NOT VERIFIED** | pipeline não depende de cache; não testado sem cache |
| 14 | Runner sem secret de deploy | **PASS estático** | workflow não referencia secrets |
| 15 | PR tenta neutralizar o gate agregado | **PASS estático** | `overall` não faz checkout nem executa script do repo; lê só `needs.*.result` |

---

## 9. Evidências

- `.github/workflows/ci.yml`
- `scripts/ci/check-integrity.sh`
- `scripts/ci/assert-surefire.py`
- `docs/engineering/CI_POLICY.md`
- Saída local do Maven com 28/28 e do assert PASS.
- Saída local do Vitest 6/6, typecheck, build 17 rotas.
- `npx js-yaml` exit 0.
- Extração e execução do bloco `overall` em 6 cenários (1 PASS, 5 FAIL).

---

## 10. Limitações

- Workflow **não executado no GitHub Actions**; não houve push.
- Branch protection/required checks **não configurados**; é ação remota.
- YAML validado localmente; semântica/execução remota não verificada.
- Sem actionlint, CodeQL, SAST/DAST, cobertura, E2E ou lint.
- Cache não testado em runner remoto.
- Vulnerabilidades dev permanecem.
- `npm ci`/`mvn clean` locais têm locks de processos; validação limpa foi em cópias temporárias.

---

## 11. Riscos residuais

- Actions em tags major mutáveis.
- Dev dependency chain com vulnerabilidades críticas.
- Sem branch protection: o gate só bloqueia se o repositório exigir `Overall gate`.
- Sem E2E de browser: build verde não prova fluxo real.
- Sem coverage/SAST: regressões de lógica e segurança podem passar.

---

## 12. Rollback

1. Restaurar `.github/workflows/ci.yml` para a versão anterior (Git).
2. Remover `scripts/ci/` se não forem usados.
3. Nenhum secret, branch, configuração remota ou migration foi alterado.
4. Não há commit/push para reverter.

---

## 13. Git

- Branch: `feat/mvp-completo`
- Staged: **0**
- Commits desta missão: **0**
- Push: **não**
- PR: **não**
- Merge: **não**
- Deploy: **não**

---

## 14. Próxima missão

**P0.3 não iniciado.** O P0.2 está implementado e validado localmente, com limitações remotas explícitas. Aguardar revisão do proprietário.
