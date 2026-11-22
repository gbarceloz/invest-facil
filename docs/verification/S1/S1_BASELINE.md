# S1 — Baseline

**Projeto:** Invest Fácil
**Raiz:** `<repo>`
**Data:** 2026-11-22
**Missão:** Supabase controlled provisioning, role model e migration dry-run

---

## 1. Estado Git antes da S1

| Item | Valor |
|---|---|
| Branch | `feat/mvp-completo` |
| HEAD | `100d3fea056ceb9ef37725850992435ea30453de` |
| Assunto | `docs: relatorio consolidado da missao complementar` |
| Upstream da branch | não configurado |
| Remote | `origin` → `https://github.com/gbarceloz/invest-facil.git` |
| `main` local | `ae9f7e2` (rastreia `origin/main`) |
| Relação `main...HEAD` | 0 atrás, 6 à frente |
| Staged | 0 |
| Modificados | 42 |
| Deletados | 0 |
| Não rastreados | 49 |
| Total | 91 |

Nenhum fetch, checkout, reset, clean, stash, merge, rebase, commit, push ou deploy foi executado.

---

## 2. Preservação do frontend

| Medida | Valor |
|---|---|
| `git status --porcelain -- frontend` (hash) | `55b3268e6e534120f6c30d66833513cc2af2e527` |
| `git diff -- frontend` (hash) | `d794ae16034d304eb1cd42e32f77122428f4af69` |

Nenhum arquivo de frontend foi criado, alterado ou removido na S1.

---

## 3. Artefatos S0 lidos

- `docs/verification/S0/S0_FINAL_REPORT.md`
- `S0_DATABASE_AUDIT.md`
- `S0_SECURITY_AUDIT.md`
- `S0_SUPABASE_COMPATIBILITY.md`
- `S0_FRONTEND_PRESERVATION.md`
- `S0_RISK_REGISTER.md`

Os relatórios S0 foram preservados. O estado remoto do Supabase não foi presumido como válido.

---

## 4. Ambiente de teste criado

| Item | Valor |
|---|---|
| Docker | 29.8.2 |
| Container | `investfacil-s1-db` |
| Imagem | `postgres:17-alpine` |
| PostgreSQL | 17.12 |
| Porta host | `127.0.0.1:55434` |
| Volume | nenhum volume persistente; container descartável |
| Container preexistente removido | **não** |
| Supabase remoto conectado | **não** |

O container foi criado com `--rm` e não exposto fora de `127.0.0.1`. O container `investfacil-p12-db` e os containers preexistentes do usuário não foram removidos.

---

## 5. Hashes antes/depois

### 5.1 Scripts e configuração alterados

| Arquivo | HEAD (antes) | Working tree (depois) |
|---|---|---|
| `backend/src/main/resources/application-prod.yml` | `C6B905D53B1B0713A85713C09F1F169B119E58DCB32A9DC06B9C69D65FC1D551` | `743395BB295A3FA6C1464AB86C4D288EBAFF9CD717282F0C5666476B72AB646B` |
| `docs/DEPLOY.md` | `156C0F9EBD88C9AD17FF718AF5C2CB99127BF04C26AF35EDBBAA8305F6618187` | `F96266F1DB0FEAEE1CD508F6E3802EBA8A73ACD448D59C9A4FABFCB394D216DD` |
| `docs/supabase/PROVISION_RUNTIME_ROLE.sql` | `614A0ECC282DEFB5E7E78FFA863C795DF003B5D77169437B3E0D2B341A089547` | `A121165C5ACA5FBF731C3EF962B0A19A995004CE81E5F6F74ADA02634033D2F7` |
| `docs/supabase/PROVISION_MIGRATION_ROLE.sql` | não existia | `CFD409AF7336B78E3FC5A4B0334701B15DC07A6D2C30027F1625076D8DF0D314` |

### 5.2 Migrations — inalteradas

| Arquivo | SHA-256 |
|---|---|
| `V1__init.sql` | `A1CCC67BBB16B9246A3BA2FB3B5F0BA392014BDB51EA7404248FDE3F99EC2A09` |
| `V2__postgres_security.sql` | `1AEB16457D3DDE58F46AF65D9A1F2DD61291CDC47B19C07E3121FFE262AE6C4F` |
| `V3__auth_mfa_simulator.sql` | `68420169D7E06F1022544983FB91499E1D1BC9C941AD9CDCB99B8D5969D6D6DA` |
| `V4__simulation_inflation.sql` | `24F8D92CDC029A21C085563C14EF484C10319F59A51196B229BB9A72A30CF13E` |
| `V5__append_only_ledgers.sql` | `113CA7407F506B0B02F8DFC2B73CB74C38D74D9B601EF3D3DF785ED99E7E7C2F` |

Nenhuma migration V1–V5 foi editada.

---

## 6. Escopo e limites

- Nenhum secret real foi lido, impresso ou gravado.
- Senhas de teste usadas apenas no container descartável; não estão versionadas.
- Nenhuma conexão com o projeto Supabase.
- Nenhuma migration aplicada em produção.
- Nenhum deploy, push, PR, merge ou commit.
