# S0 — Baseline e integridade do repositório

**Projeto:** Invest Fácil
**Raiz:** `<repo>`
**Data da auditoria:** 2026-11-22
**Modo:** somente leitura no produto; escrita restrita a `docs/verification/S0/`

---

## 1. Identificação

| Item | Valor |
|---|---|
| Diretório absoluto | `<repo>` |
| `git rev-parse --show-toplevel` | `<repo>` |
| Branch atual | `feat/mvp-completo` |
| HEAD | `100d3fea056ceb9ef37725850992435ea30453de` |
| Assunto do HEAD | `docs: relatorio consolidado da missao complementar` |
| Upstream da branch atual | **não configurado** |
| Remote | `origin` → `https://github.com/gbarceloz/invest-facil.git` |
| Branch local `main` | `ae9f7e2` (rastreia `origin/main`) |
| Relação `main...HEAD` | 0 atrás, **6 commits à frente** |
| Fetch/push/merge/rebase/checkout | **não executados** |

O estado local é a fonte de verdade. Nenhuma referência remota foi atualizada nem comparada por rede; a relação acima usa apenas as refs locais existentes.

---

## 2. Working tree no início da S0

| Categoria | Quantidade |
|---|---|
| Total de entradas | **91** |
| Staged | **0** |
| Modificadas | **42** |
| Deletadas | **0** |
| Renomeadas | **0** |
| Não rastreadas | **49** |

`git diff --stat` (apenas arquivos rastreados): **42 arquivos, 1.856 inserções, 1.422 remoções**.

O working tree inclui trabalho anterior às missões P1.2/S0 e os artefatos da P1.2. Nada foi descartado ou substituído.

### 2.1 Categorias não rastreadas relevantes

- `docs/architecture/`, `docs/contracts/`, `docs/engineering/`, `docs/transformation/`, `docs/verification/`, `docs/recovery/`
- testes backend de contrato/segurança em `backend/src/test/java/com/investfacil/api/`
- E2E Playwright em `frontend/e2e/` e `frontend/playwright.config.ts`
- scripts de CI, contratos, docs e audiovisual em `scripts/`
- `video/`, `content/pilots/`, `docs/GATE*`, `.githooks/`, `.opencode/`

Esses itens são preservados; a S0 não os altera.

---

## 3. Hashes de integridade

### 3.1 Migrations

| Arquivo | SHA-256 |
|---|---|
| `V1__init.sql` | `A1CCC67BBB16B9246A3BA2FB3B5F0BA392014BDB51EA7404248FDE3F99EC2A09` |
| `V2__postgres_security.sql` | `1AEB16457D3DDE58F46AF65D9A1F2DD61291CDC47B19C07E3121FFE262AE6C4F` |
| `V3__auth_mfa_simulator.sql` | `68420169D7E06F1022544983FB91499E1D1BC9C941AD9CDCB99B8D5969D6D6DA` |
| `V4__simulation_inflation.sql` | `24F8D92CDC029A21C085563C14EF484C10319F59A51196B229BB9A72A30CF13E` |
| `V5__append_only_ledgers.sql` | `113CA7407F506B0B02F8DFC2B73CB74C38D74D9B601EF3D3DF785ED99E7E7C2F` |

### 3.2 Configuração e documentação

| Arquivo | SHA-256 |
|---|---|
| `backend/src/main/resources/application.yml` | `C9285E8ED3AAC62C988FAE62EE9ABB968DE844C4DFE7F77846B1875CBEFF41B3` |
| `backend/pom.xml` | `A976A5753C0E54B1EC0997D131304AF0747A27C986902908042A70493ADBB094` |
| `frontend/package.json` | `B27CCE6E727DC7B9499D66957BEC6376F5AE0975D6B69CEB9DB7E66F03B25D68` |
| `frontend/next.config.ts` | `A7691C190257A429008D52BBBB1A214B8C3501A4C56799B56223FEAD64A6CE21` |
| `docs/architecture/database.md` | `2A613A3496925BD6D6C3CBCC714B107029BA2338E7AB6C5855663E51A9A31D74` |
| `docs/security/SECURITY.md` | `0CE61D8734313B48693E899E1877D5766A607940948D2A40412FEF4EAC510DF8` |
| `docs/supabase/PROVISION_RUNTIME_ROLE.sql` | `614A0ECC282DEFB5E7E78FFA863C795DF003B5D77169437B3E0D2B341A089547` |
| `docs/supabase/STORAGE_SETUP.sql` | `102674BC5F2ED34AB05FE7972B3450DA70B7F2613447750DBBBCACFFEB798FFA` |
| `render.yaml` | `37CC81D99155F88EC70F975B322C8875159EE1708F0AD817876E667C3A943B6C` |

### 3.3 Preservação do frontend

| Medida | Valor |
|---|---|
| Hash de `git status -- frontend` | `55b3268e6e534120f6c30d66833513cc2af2e527` |
| Hash de `git diff -- frontend` | `d794ae16034d304eb1cd42e32f77122428f4af69` |

Esses hashes devem permanecer idênticos ao final da S0.

---

## 4. Ferramentas e stack observados

| Ferramenta | Versão |
|---|---|
| Java | OpenJDK 21.0.12.1 LTS (Microsoft) |
| Maven | 3.9.16 |
| Node | 26.13.0 |
| npm | 11.20.0 |
| PostgreSQL local | 17.12 |
| Docker | 29.8.2 |
| Spring Boot | 3.5.6 |
| Next.js | 16.4.6 |
| React | 19.1 |
| TypeScript | 5.7 |

---

## 5. Escopo cumprido

- Nenhum arquivo de backend, frontend, migration, configuração de produto ou lockfile foi alterado.
- Nenhuma migration foi executada.
- Nenhuma conexão com Supabase foi aberta.
- Nenhum SQL de escrita foi executado.
- Nenhum commit, push, PR, merge ou deploy foi realizado.
- A única escrita autorizada é a pasta `docs/verification/S0/`.
