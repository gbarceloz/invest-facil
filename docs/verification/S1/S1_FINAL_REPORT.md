# S1 — Relatório final

## S1 — SUPABASE CONTROLLED PROVISIONING & MIGRATION DRY-RUN

**Status:** **PASS WITH LIMITATIONS**
**Go-live:** **BLOCKED**
**Data:** 2026-11-22
**Projeto:** Invest Fácil
**Raiz:** `<repo>`

> O provisionamento e o modelo de privilégios foram validados em PostgreSQL 17 local. A conectividade com o Supabase, a execução no SQL Editor e a RLS por usuário continuam não comprovadas.

---

## 1. Baseline

| Item | Início | Fim |
|---|---|---|
| Branch | `feat/mvp-completo` | `feat/mvp-completo` |
| HEAD | `100d3fea056ceb9ef37725850992435ea30453de` | idêntico |
| Staged | 0 | 0 |
| Modificados | 42 | **45** |
| Deletados | 0 | 0 |
| Não rastreados | 49 | **50** |
| Total | 91 | **95** |
| Commits/push/PR/merge/deploy | 0 | 0 |

O aumento reflete três arquivos rastreados alterados e um script novo; os relatórios S1 ficam dentro de `docs/verification/`, que já era uma entrada não rastreada.

**Frontend preservado:** hashes idênticos antes/depois:
- `git status -- frontend`: `55b3268e6e534120f6c30d66833513cc2af2e527`
- `git diff -- frontend`: `d794ae16034d304eb1cd42e32f77122428f4af69`

---

## 2. Modelo atual de roles

Encontrado:

- `investfacil_app`: NOLOGIN, DML, policy `app_rw USING (true)`.
- `investfacil_migrate`: NOLOGIN, apenas USAGE/CREATE; insuficiente para V2.
- `investfacil_test_guest`: NOLOGIN, SELECT; sem policy.
- `investfacil_runtime`: LOGIN **NOINHERIT**, membro de `investfacil_app`.
- Backend não executa `SET ROLE`.
- Flyway podia cair no datasource runtime.
- Script de runtime usava `:'runtime_password'`, sintaxe `psql`.

O teste `NOINHERIT` produziu `permission denied for schema investfacil`.

---

## 3. Modelo proposto e testado

| Identidade | Atributos | Uso |
|---|---|---|
| `postgres`/owner | bootstrap/ownership | scripts de provisionamento; nunca runtime |
| `investfacil_migrate` | LOGIN INHERIT; owner do schema; CREATE no database; sem SUPERUSER/CREATEROLE/BYPASSRLS | somente Flyway |
| `investfacil_app` | NOLOGIN; DML; policy atual | privilégios do runtime |
| `investfacil_runtime` | LOGIN INHERIT; membro de `investfacil_app`; sem ownership/DDL/CREATEROLE/BYPASSRLS | datasource |
| `investfacil_test_guest` | NOLOGIN; SELECT; sem policy | teste |
| `anon`/`authenticated` | roles Supabase | schema revogado |

`INHERIT` foi escolhido porque o Hikari recicla conexões e a aplicação não executa `SET ROLE`. O teste comprovou que a policy `TO investfacil_app` se aplica ao runtime membro com `INHERIT`.

A migration identity é owner do schema porque a V2 exige `REVOKE ON SCHEMA`, `CREATE POLICY` e `ALTER TABLE`; o runtime não tem esses privilégios. O bootstrap é separado e cria as roles antes do Flyway, evitando `CREATEROLE` na execução normal.

---

## 4. Provisionamento

Arquivos:

- `docs/supabase/PROVISION_MIGRATION_ROLE.sql` (novo)
- `docs/supabase/PROVISION_RUNTIME_ROLE.sql` (corrigido)
- `docs/DEPLOY.md` (ordem e instruções atualizadas)
- `backend/src/main/resources/application-prod.yml` (Flyway obrigatório)

Os scripts usam `SET app.migration_password` / `SET app.runtime_password` na mesma sessão. Nenhuma senha está em arquivo. A execução no SQL Editor é sintaticamente compatível; a execução real no Supabase não foi testada.

Idempotência testada:

- execução dupla do bootstrap: exit 0;
- execução dupla do runtime: exit 0;
- runtime recriado como `NOINHERIT`: script corrigiu para `INHERIT`;
- roles/grants não duplicaram;
- senha via GUC redefinida, sem armazenamento.

Limitação: o bootstrap pressupõe schema novo/ownership controlado; não é um retrofit automático de schema já pertencente a outro owner.

---

## 5. Credenciais

Separação efetiva:

| Finalidade | Variáveis | Identidade |
|---|---|---|
| Aplicação | `SPRING_DATASOURCE_URL/USERNAME/PASSWORD` | `investfacil_runtime` |
| Flyway | `SPRING_FLYWAY_URL/USER/PASSWORD` | `investfacil_migrate` |
| Bootstrap | SQL Editor/painel | `postgres`/owner |

O perfil `prod` agora exige as três variáveis de Flyway. Sem elas:

```text
Could not resolve placeholder 'SPRING_FLYWAY_URL'
```

Com elas, a aplicação `prod` iniciou com `HEALTH=UP`.

O perfil `dev` mantém fallback para o datasource local; isso é intencional para containers/testes e não é o modelo de produção.

Nenhum valor de senha/token foi registrado.

---

## 6. Migrations

V1–V5 **não foram alteradas**. No banco descartável:

| Versão | Resultado |
|---|---|
| V1 | sucesso |
| V2 | sucesso |
| V3 | sucesso |
| V4 | sucesso |
| V5 | sucesso |

Evidências:

- Flyway 11.7.2.
- 18 tabelas de aplicação + `flyway_schema_history`.
- 49 índices, 22 FKs, 18 policies, 1 função, 0 triggers.
- Owner das tabelas: `investfacil_migrate`.
- Schema `investfacil` owner `investfacil_migrate`.

---

## 7. Testes de permissões

### Passaram

- Runtime SELECT/INSERT em `users` e conteúdo.
- API cadastro → verificação → login → `/users/me` → 200.
- Duas sessões concorrentes de runtime inserindo/consultando.
- Migration identity executando DDL.
- Runtime membro de `investfacil_app` com policy aplicada.

### Falharam como esperado

- Runtime `CREATE TABLE` → `permission denied for schema investfacil`.
- Runtime `ALTER TABLE` → `must be owner`.
- Runtime `CREATE ROLE` → `permission denied to create role`.
- Runtime `SELECT flyway_schema_history` → `permission denied`.
- Runtime schema privado → `permission denied`.
- Runtime `UPDATE auth_event`/`xp_ledger` → `permission denied`.
- Runtime `SET ROLE investfacil_migrate` → `permission denied`.
- Migration `CREATE ROLE` → `permission denied`.
- Flyway usando runtime em banco limpo → `permission denied for database`.
- Runtime `NOINHERIT` → `permission denied for schema`.
- `test_guest` → 0 linhas.
- `anon` → schema negado.

---

## 8. Aplicação e seed

- `ddl-auto=validate` passou.
- `/actuator/health` UP como runtime.
- `/api/v1/content/categories` 200, 8 categorias.
- Seed: 8 categorias, 12 módulos, 31 aulas, 62 questões, 6 artigos, 7 conquistas.
- Segunda inicialização: sem duplicação de seed; Flyway não reaplicou migrations.
- Backend: **47/47 testes, 0 falhas, 0 erros, 0 skipped**; `assert-surefire.py` PASS.
- Frontend: **12/12 testes** e typecheck exit 0; nenhum arquivo alterado.

---

## 9. Conectividade

- Testes locais: OK.
- Supabase remoto: **NOT TESTED — EXTERNAL CONNECTIVITY**.
- SSL: não testado.
- Direct/session/transaction pooler: não testados.
- IPv4/IPv6 e egress Render: não testados.
- Região: Render `oregon` × Supabase `sa-east-1`; latência não medida.
- Nenhuma connection string foi registrada.

Flyway deve usar conexão direta ou session pooler; transaction pooler não é recomendado para DDL.

---

## 10. Segurança

| Dimensão | Estado |
|---|---|
| Compatibility | PASS local; remoto não testado |
| Privilege model | PASS local |
| RLS security | **NÃO IMPLEMENTADO** (`USING (true)`) |
| Data integrity | PASS local |
| Connectivity | NOT TESTED |
| Production readiness | **BLOCKED** |

Pendências para missão futura:

- policy por usuário, `USING`/`WITH CHECK`, `FORCE RLS`;
- `SET LOCAL app.current_user_id` ou identidade Supabase;
- `quiz_attempt_answers` via `EXISTS`;
- admin/audit roles;
- testes A×B e USER×ADMIN diretamente no PostgreSQL;
- access token após logout, rate limit distribuído, append-only por trigger;
- views/funções `SECURITY DEFINER`.

Detalhes em `S1_SECURITY_GAPS.md`.

---

## 11. Frontend

Intacto. Hashes idênticos. Nenhuma rota, componente, estilo, dependência, lockfile ou configuração alterada.

---

## 12. Limitações

- Supabase remoto não conectado; SQL Editor, roles `anon`/`authenticated`, ownership e permissões do `postgres` remoto não validados.
- SSL/pooler/IPv6/região não testados.
- RLS per-user não implementada.
- A migration identity é owner do schema (necessário para V2); não é runtime.
- Container local usa `pg_hba` trust em loopback; a senha do runtime foi validada via IP de bridge/scram; a senha de migration não foi testada via scram.
- O perfil `dev` mantém fallback de Flyway para o datasource local.
- Nenhum teste de carga, backup/PITR ou storage real.
- `SOURCE_REGISTRY.md` e `CONTEXT_INDEX.md` não foram alterados: a evidência S1 é local e o go-live segue bloqueado; a atualização canônica deve ocorrer após validação remota/aprovação.

---

## 13. Rollback

Arquivos alterados:

- `backend/src/main/resources/application-prod.yml` — restaurar HEAD `C6B905D53B1B0713A85713C09F1F169B119E58DCB32A9DC06B9C69D65FC1D551`;
- `docs/DEPLOY.md` — restaurar HEAD `156C0F9EBD88C9AD17FF718AF5C2CB99127BF04C26AF35EDBBAA8305F6618187`;
- `docs/supabase/PROVISION_RUNTIME_ROLE.sql` — restaurar HEAD `614A0ECC282DEFB5E7E78FFA863C795DF003B5D77169437B3E0D2B341A089547`;
- remover `docs/supabase/PROVISION_MIGRATION_ROLE.sql` (novo);
- remover `docs/verification/S1/` (novo);
- remover o container `investfacil-s1-db` (descartável, sem volume).

Não usar `git reset --hard`, `git clean`, `git checkout .` ou `git restore .`. O rollback não foi executado.

---

## 14. Git final

- Branch: `feat/mvp-completo`
- HEAD: `100d3fe`
- Staged: 0
- Modificados: 45
- Deletados: 0
- Não rastreados: 50
- Total: 95
- Commits/push/PR/merge/deploy: 0

---

## 15. Go-live readiness

| Bloqueador | Estado |
|---|---|
| Runtime/migration separados | Resolvido localmente |
| `NOINHERIT` | Resolvido localmente |
| Flyway com credencial DML | Bloqueado no `prod`; falha explícita |
| Scripts SQL Editor | Sintaxe OK; execução remota não testada |
| Conectividade/SSL/pooler/IPv6 | **NOT TESTED** |
| RLS per-user | **NÃO IMPLEMENTADO** |
| Backup/PITR | não definido |
| Região/latência | não medida |

**Produção continua bloqueada.**

---

## 16. Próxima missão

Recomendação: **S2 — validação remota controlada em ambiente Supabase descartável autorizado** (conectividade, SQL Editor, ownership, V1–V5, seed e runtime), seguida de **S3 — RLS per-user**.

Não iniciar S2 automaticamente. Nenhuma operação remota foi executada.
