# S2.0 — Preflight baseline

**Projeto:** Invest Fácil
**Raiz:** `<repo>`
**Data:** 2026-11-22
**Missão:** Supabase remote preflight & disposable environment selection
**Autorização de escrita remota:** **NÃO CONCEDIDA**

---

## 1. Git antes da S2.0

| Item | Valor |
|---|---|
| Branch | `feat/mvp-completo` |
| HEAD | `100d3fea056ceb9ef37725850992435ea30453de` |
| Upstream | não configurado |
| Staged | 0 |
| Modificados | 45 |
| Deletados | 0 |
| Não rastreados | 50 |
| Total | 95 |
| Commits/push/PR/merge/deploy | 0 |

O estado corresponde ao final da S1 (45 modificados, 50 não rastreados).

---

## 2. Preservação do frontend

| Medida | Valor |
|---|---|
| `git status --porcelain -- frontend` (hash) | `55b3268e6e534120f6c30d66833513cc2af2e527` |
| `git diff -- frontend` (hash) | `d794ae16034d304eb1cd42e32f77122428f4af69` |

Nenhum arquivo do frontend foi alterado na S2.0.

---

## 3. Artefatos S1

- 7 arquivos em `docs/verification/S1/`
- `S1_FINAL_REPORT.md` declara `PASS WITH LIMITATIONS` e go-live `BLOCKED`
- `S1_SECURITY_GAPS.md` mantém RLS per-user fora do escopo
- `docs/supabase/PROVISION_MIGRATION_ROLE.sql`
- `docs/supabase/PROVISION_RUNTIME_ROLE.sql`
- `docs/DEPLOY.md`
- `backend/src/main/resources/application-prod.yml`

Nenhum desses arquivos foi modificado na S2.0.

---

## 4. Verificação de ambiente

### 4.1 Variáveis S2

Verificadas apenas por presença, sem imprimir valores, nos escopos Process, User e Machine:

| Variável | Process | User | Machine |
|---|---|---|---|
| `S2_TARGET_PROJECT_REF` | ABSENT | ABSENT | ABSENT |
| `S2_TARGET_PROJECT_REGION` | ABSENT | ABSENT | ABSENT |
| `S2_DISPOSABLE_PROJECT_CONFIRMED` | ABSENT | ABSENT | ABSENT |
| `S2_REMOTE_WRITE_APPROVED` | ABSENT | ABSENT | ABSENT |

Nenhum alvo descartável foi designado por variável de ambiente.

### 4.2 Segredos

Presença verificada sem valores:

| Variável | Estado |
|---|---|
| `SUPABASE_URL` | ABSENT |
| `SUPABASE_ACCESS_TOKEN` | ABSENT |
| `SUPABASE_DB_PASSWORD` | ABSENT |
| `DATABASE_URL` | ABSENT |
| `SPRING_DATASOURCE_URL` | ABSENT |

Nenhum valor secreto foi lido ou registrado.

### 4.3 Arquivos de ambiente

Foram encontrados apenas arquivos de exemplo:

- `backend/.env.example`
- `frontend/.env.example`
- `_staging/backend-skeleton/.env.example`

Nenhum `.env` real foi lido.

### 4.4 Supabase CLI

| Item | Valor |
|---|---|
| CLI instalado | Sim |
| Versão | `3.2.0` |
| `supabase --version` | executado (local) |
| `supabase --help` | consultado (local) |
| `supabase projects --help` | consultado (local) |
| `supabase projects list` | **não executado** |
| Comandos remotos | **nenhum** |
| `--yes` / confirmação automática | **não usado** |

O CLI v3.2.0 tem comportamento local por padrão e confirma mudanças hospedadas; ainda assim, não foi usado para acessar projetos.

### 4.5 Projeto principal

`fvsofuwgdurrzipqfwyg` aparece apenas em relatórios S0 já existentes. Não foi usado como destino, não foi consultado e não recebeu conexão.

---

## 5. Escopo da S2.0

- Somente leitura local.
- Consulta à documentação oficial do Supabase via web.
- Nenhuma conexão com banco Supabase.
- Nenhum SQL, migration, seed, role, grant ou policy.
- Nenhum deploy ou alteração de rede.
- Nenhum arquivo fora de `docs/verification/S2/` foi criado/alterado.

---

## 6. Baseline final esperado

Como `docs/verification/` já era uma entrada não rastreada, os sete documentos S2 não devem alterar a contagem do Git. O estado final esperado é 95 entradas: 45 modificadas e 50 não rastreadas.

A confirmação final está em `S2_PREFLIGHT_FINAL_REPORT.md`.
