# CI POLICY — INVEST FÁCIL

**Data:** 21/11/2026
**Workflow:** `.github/workflows/ci.yml`
**Escopo:** validação de branches e Pull Requests; sem deploy, publicação ou merge.

---

## 1. Arquitetura

Uma única pipeline, cinco jobs:

```text
integrity ─┐
backend  ──┼─→ overall
frontend ──┤
security ──┘
```

| Job | Responsabilidade | Runner | Timeout | Depende de |
|---|---|---|---:|---|
| `integrity` | arquivos obrigatórios, JSON, políticas do workflow | ubuntu-latest | 5 min | — |
| `backend` | compile, 63 testes, Testcontainers, Flyway, secrets scan | ubuntu-latest | 25 min | — |
| `frontend` | `npm ci`, Vitest, TypeScript, build | ubuntu-latest | 15 min | — |
| `security` | `npm audit --omit=dev --audit-level=high` | ubuntu-latest | 10 min | — |
| `overall` | agregar os quatro gates; falhar se qualquer um não for `success` | ubuntu-latest | 5 min | todos |

O `overall` é **inline no workflow** e não faz checkout nem executa script do
repositório: ele lê apenas `needs.*.result`, que é um valor confiável do runner.
Isso impede que um PR neutralize o gate alterando um `.sh` versionado.

Não há job separado de database para evitar duplicar Testcontainers. O gate de banco é
o `FlywaySecurityIntegrationTest` dentro do backend, e o script `assert-surefire.py`
falha se ele não tiver rodado de verdade.

---

## 2. Triggers

```yaml
on:
  push:
    branches: ["**"]
  pull_request:
    branches: ["**"]
  workflow_dispatch:
```

- `**` cobre `main`, `feat/mvp-completo`, `feature/*`, `fix/*` e branches futuras.
- `pull_request` cobre PRs para qualquer branch base; PRs de fork também entram.
- Não há `paths`/`paths-ignore`: uma mudança de workflow, migration, backend ou frontend não pode ser pulada por filtro.
- `workflow_dispatch` permite execução manual.
- `pull_request_target` não é usado.

**Duplicação:** um PR do mesmo repositório pode gerar push + pull_request. A
`concurrency` agrupa pelo workflow + head ref e cancela a execução anterior, reduzindo
duplicação sem deixar a branch sem validação.

---

## 3. Gates

| Gate | Condição | Onde |
|---|---|---|
| Integrity | required files, JSON, triggers, permissões e padrões proibidos | `integrity` |
| Backend | `mvn -B clean verify` | `backend` |
| Database | `FlywaySecurityIntegrationTest` executado com 5 testes, 0 skipped | `backend` + assert |
| Security scan | `SecretsScanTest` executado com 2 testes | `backend` + assert |
| Frontend | `npm test`, `npm run typecheck`, `npm run build` | `frontend` |
| Security | `npm audit --omit=dev --audit-level=high` | `security` |
| Overall | todos os gates obrigatórios = `success` | `overall` |

Estados: **PASS** (executado e aprovado), **FAIL** (executado e reprovado),
**BLOCKED** (não executado por dependência/ambiente), **SKIPPED** (não executado
por configuração), **NOT CONFIGURED** (não existe), **NOT VERIFIED** (sem execução
remota). O `overall` só aceita `success`.

---

## 4. Backend e Testcontainers

- Java 21 Temurin, cache Maven.
- `mvn -B clean verify` executa compilação, testes e empacotamento.
- Testcontainers usa o Docker do runner padrão; não há credenciais.
- `scripts/ci/assert-surefire.py` falha se:
  - não houver relatórios;
  - total < 28;
  - houver failures/errors;
  - houver qualquer skipped;
  - `FlywaySecurityIntegrationTest` < 5;
  - `MvpFlowIntegrationTest` < 1;
  - `SecretsScanTest` < 2.
- Artefato `backend-surefire` é enviado mesmo em falha (`if: always()`); se não houver relatório, `if-no-files-found: error`.

**Importante:** `@Testcontainers(disabledWithoutDocker = true)` faz os testes de
integração serem marcados como skipped quando Docker não existe. O assert transforma
isso em **FAIL**, não em sucesso silencioso.

---

## 5. Frontend

- Node 22, `npm ci` com `frontend/package-lock.json`.
- `npm test` (Vitest), `npm run typecheck`, `npm run build`.
- Sem `npm install` em CI; lockfile é a fonte.
- Sem lint porque o projeto ainda não possui script/config de lint; documentado como lacuna, não inventado.

---

## 6. Segurança

- `permissions: contents: read` global.
- Nenhum `contents: write`, `pull-requests: write` ou `write-all`.
- Nenhum secret, token de deploy ou credencial.
- `pull_request_target` proibido; PRs de fork usam token read-only.
- O gate `overall` não executa código do PR: usa somente `needs.*.result`.
- `security` audita apenas dependências de produção (`--omit=dev`).
- **Risco residual:** `npm audit` completo encontrou vulnerabilidades em dependências de desenvolvimento (`vitest`/`tinypool`), com correção disponível em versão major incompatível. Não foi alterado nesta missão.

---

## 7. Actions, cache e concorrência

| Item | Uso |
|---|---|
| `actions/checkout@v4` | checkout oficial, tag major mutável |
| `actions/setup-java@v4` | Java 21 + cache Maven |
| `actions/setup-node@v4` | Node 22 + cache npm |
| `actions/upload-artifact@v4` | surefire reports |
| Cache Maven | chave gerenciada pelo setup-java |
| Cache npm | `frontend/package-lock.json` |
| Concurrency | grupo por workflow + head ref, cancel-in-progress |

**Risco residual:** actions oficiais usam tags major (`@v4`), não SHA completo.
Pinning completo exigiria SHAs verificados e atualização controlada; não foi feito nesta missão.

---

## 8. Aprovação e troubleshooting

Uma execução só é aprovada quando `Overall gate` = success.

Falhas comuns:

| Sintoma | Causa provável | Ação |
|---|---|---|
| Backend com skipped > 0 | Docker/Testcontainers indisponível | verificar Docker do runner; não remover o assert |
| `npm ci` EPERM no Windows local | arquivo SWC em uso por dev server | fechar o dev server ou testar em diretório limpo; CI limpo não tem o lock |
| `npm audit` falha | dependência vulnerável | corrigir dependência ou abrir exceção explícita documentada |
| Integrity falha | `paths`, `continue-on-error`, `|| true`, permissão write ou arquivo ausente | corrigir a causa, não o check |
| YAML inválido | sintaxe | validar com parser YAML antes do push |

---

## 9. Limitações

- Workflow **não executado no GitHub Actions** nesta missão (sem push).
- Branch protection/required checks **não configurados** (ação remota).
- YAML foi parseado localmente com `js-yaml@4.1.0`; semântica remota não verificada.
- Sem actionlint, CodeQL, SAST/DAST, cobertura ou E2E de browser.
- Vulnerabilidades de dependências de desenvolvimento permanecem.
- Cache não testado em runner remoto; pipeline foi desenhada para funcionar sem ele.

## 10. Rollback

- Restaurar `.github/workflows/ci.yml` para a versão anterior (backup Git).
- Remover `scripts/ci/` se não forem usados.
- Não há alteração de branch, secret ou configuração remota.
