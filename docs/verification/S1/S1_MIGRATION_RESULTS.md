# S1 — Resultados de migrations e dry-run

**Banco:** PostgreSQL 17.12 descartável (`investfacil-s1-db`, porta 127.0.0.1:55434)
**Flyway:** 11.7.2 (resolvido pelo Spring Boot 3.5.6)
**Migration identity:** `investfacil_migrate` (LOGIN INHERIT, owner do schema)
**Runtime identity:** `investfacil_runtime` (LOGIN INHERIT, membro de `investfacil_app`)
**Nenhuma migration alterada.**

---

## 1. Migrations aplicadas

| Rank | Versão | Descrição | Sucesso |
|---|---|---|---|
| 1 | V1 | init | true |
| 2 | V2 | postgres security | true |
| 3 | V3 | auth mfa simulator | true |
| 4 | V4 | simulation inflation | true |
| 5 | V5 | append only ledgers | true |

O Flyway criou o schema history em `investfacil`; o schema e os objetos pertencem a `investfacil_migrate`.

---

## 2. Objetos resultantes

| Item | Resultado |
|---|---|
| Tabelas de aplicação | 18 |
| `flyway_schema_history` | 1 |
| Índices | 49 |
| Foreign keys | 22 |
| Policies | 18 |
| Funções | 1 (`apply_table_security`) |
| Triggers não internos | 0 |
| Extensões | apenas `plpgsql` |
| RLS habilitada | 18 tabelas |
| `FORCE RLS` | 0 tabelas (fora do escopo S1) |
| Owner das tabelas | `investfacil_migrate` |

A validação estrutural confirma que V1–V5 executam em PostgreSQL 17 sem depender de extensões externas.

---

## 3. Startup da aplicação

Configuração usada:

- `SPRING_DATASOURCE_USERNAME=investfacil_runtime`
- `SPRING_FLYWAY_USER=investfacil_migrate`
- `SPRING_PROFILES_ACTIVE=dev`
- `SEED_CONTENT=true`
- `ddl-auto=validate` (base)
- porta local 18084

Resultados:

- Flyway aplicou V1–V5 como migration identity.
- Hibernate `validate` passou; a aplicação iniciou como runtime.
- `/actuator/health` → `UP`.
- `/api/v1/content/categories` → 200, 8 categorias.
- Cadastro → verificação → login → `/users/me` → 200, usando apenas o runtime.
- Segunda inicialização: Flyway não reaplicou migrations; seed não duplicou contagens.

### 3.1 Seed

| Entidade | Banco | Fonte `seed/content.json` |
|---|---|---|
| Categorias | 8 | 8 |
| Módulos | 12 | 12 |
| Aulas | 31 | 31 |
| Questões | 62 | 62 |
| Artigos | 6 | 6 |
| Conquistas | 7 | 7 (seed de achievements) |
| Usuários | 3 (teste) | não faz parte do seed |

A contagem foi idêntica após restart; o seed é idempotente no cenário testado.

---

## 4. Testes de permissão

### 4.1 Positivos

| Teste | Resultado |
|---|---|
| Runtime `SELECT` em `users` | OK (policy aplicada) |
| Runtime `INSERT` em `users` via API | 201; login/me 200 |
| Runtime `INSERT` em duas sessões concorrentes | OK; contagens 2 e 3 |
| Runtime `SELECT` em conteúdo | OK; 8 categorias |
| Runtime `INSERT` em refresh/email tokens via login | OK |
| Migration identity `CREATE TABLE`/`DROP TABLE` | OK |
| RLS `app_rw` para runtime INHERIT | OK; `SELECT`/`INSERT` permitidos |

### 4.2 Negativos esperados

| Teste | Resultado |
|---|---|
| Runtime `CREATE TABLE investfacil.runtime_probe` | `permission denied for schema investfacil` |
| Runtime `ALTER TABLE users ADD COLUMN` | `must be owner of table users` |
| Runtime `CREATE ROLE runtime_escalation` | `permission denied to create role` |
| Runtime `SELECT flyway_schema_history` | `permission denied for table flyway_schema_history` |
| Runtime `SELECT private_s1.secret_probe` | `permission denied for schema private_s1` |
| Runtime `UPDATE auth_event` | `permission denied for table auth_event` |
| Runtime `UPDATE xp_ledger` | `permission denied for table xp_ledger` |
| Runtime `SET ROLE investfacil_migrate` | `permission denied to set role` |
| Migration `CREATE ROLE` | `permission denied to create role` |
| Runtime como Flyway (banco limpo) | `permission denied for database s1_runtime_migration` |
| Runtime `NOINHERIT` | `permission denied for schema investfacil` |
| `investfacil_test_guest` SELECT | 0 linhas (RLS deny-by-default) |
| `anon` SELECT | `permission denied for schema investfacil` |

---

## 5. Teste de configuração prod

### 5.1 Sem variáveis de Flyway

Com `SPRING_PROFILES_ACTIVE=prod` e sem `SPRING_FLYWAY_*`:

```text
PlaceholderResolutionException: Could not resolve placeholder 'SPRING_FLYWAY_URL' in value "${SPRING_FLYWAY_URL}"
```

O processo encerrou com exit 1. O fallback silencioso para o runtime não ocorre no perfil de produção.

### 5.2 Com variáveis de Flyway

Com `SPRING_FLYWAY_URL/USER/PASSWORD` definidos e runtime/migration separados:

```text
/actuator/health -> UP
```

A aplicação iniciou em `prod` sem erro de schema.

---

## 6. Regressão backend

| Comando | Resultado |
|---|---|
| `mvn -B -Pdocker-desktop-newapi test` | **47 testes, 0 falhas, 0 erros, 0 skipped** |
| `assert-surefire.py` | PASS 47; database/security gates PASS |

Nenhum teste foi enfraquecido, ignorado ou substituído por mock.

---

## 7. Limitações

- Tudo foi executado em PostgreSQL local, não no Supabase.
- `FORCE RLS` e RLS per-user não foram implementados; o modelo atual continua `USING (true)`.
- O teste de seed usa o conteúdo local; não valida mídia/Storage.
- O container usa `pg_hba` com trust em loopback; a senha do runtime foi testada via IP de bridge com `scram-sha-256`; a senha de migration não foi testada via scram; SSL externo não foi testado.
- A migration identity é owner do schema; isso é intencional para a V2, mas não é a identidade de runtime.
