# S1 — Provisionamento

**Projeto:** Invest Fácil
**Arquivos principais:** `docs/supabase/PROVISION_MIGRATION_ROLE.sql`, `docs/supabase/PROVISION_RUNTIME_ROLE.sql`
**Migration:** inalterada
**Segredos em arquivo:** nenhum

---

## 1. Separação de identidades

### 1.1 Bootstrap administrativo

Executado como owner/admin do projeto Supabase (`postgres`), em SQL Editor ou `psql`:

`PROVISION_MIGRATION_ROLE.sql`:

- cria `investfacil_app` (NOLOGIN), `investfacil_test_guest` (NOLOGIN) e `investfacil_migrate` (LOGIN INHERIT);
- define a senha de `investfacil_migrate` a partir de `app.migration_password`;
- cria o schema `investfacil` e transfere ownership para `investfacil_migrate`;
- concede `USAGE, CREATE` no schema e `CONNECT, CREATE` no database.

### 1.2 Runtime

Executado depois, também como owner/admin:

`PROVISION_RUNTIME_ROLE.sql`:

- cria/ajusta `investfacil_runtime` como `LOGIN INHERIT`;
- define a senha a partir de `app.runtime_password`;
- concede membership em `investfacil_app`;
- concede `CONNECT` no database;
- **não** dá ownership, DDL, CREATEROLE ou BYPASSRLS.

### 1.3 Flyway

O Flyway usa `investfacil_migrate` (owner do schema). O runtime usa `investfacil_runtime` (membro de `investfacil_app`). O perfil `prod` agora exige `SPRING_FLYWAY_URL`, `SPRING_FLYWAY_USER` e `SPRING_FLYWAY_PASSWORD`; sem elas o startup falha com `Could not resolve placeholder 'SPRING_FLYWAY_URL'`.

---

## 2. Execução no SQL Editor / psql

O SQL Editor não interpreta `:'runtime_password'`. Os scripts usam GUCs de sessão:

```sql
-- SQL Editor: execute na MESMA sessão, antes do script
SET app.migration_password = '<senha-forte-com-16-ou-mais-caracteres>';
-- cole/execute PROVISION_MIGRATION_ROLE.sql
```

```sql
SET app.runtime_password = '<senha-forte-com-16-ou-mais-caracteres>';
-- cole/execute PROVISION_RUNTIME_ROLE.sql
```

Em `psql`, o mesmo `SET` funciona. Nenhuma senha é literal em arquivo. Se a GUC não estiver definida, o script lança exceção clara e não cria senha vazia.

### 2.1 Ordem obrigatória

1. `PROVISION_MIGRATION_ROLE.sql` (admin/owner)
2. `PROVISION_RUNTIME_ROLE.sql` (admin/owner)
3. Flyway como `investfacil_migrate`
4. aplicação como `investfacil_runtime`

Se o passo 1 não for executado, a V2 pode falhar ao tentar criar roles sem `CREATEROLE`; isso é intencional. O bootstrap deve ser separado da execução normal.

---

## 3. Idempotência

Testado no container descartável:

| Operação | Resultado |
|---|---|
| Executar `PROVISION_MIGRATION_ROLE.sql` duas vezes | exit 0; `CREATE SCHEMA` gera NOTICE, sem erro; ownership mantido |
| Executar `PROVISION_RUNTIME_ROLE.sql` duas vezes | exit 0; membership já existente gera NOTICE |
| Recriar runtime como `NOINHERIT` e rodar novamente | `ALTER ROLE ... INHERIT` corrigiu; runtime voltou a acessar |
| Roles já existentes | `IF NOT EXISTS` + `ALTER ROLE` preservam; sem duplicação |
| Grants repetidos | idempotentes |
| Senha | redefinida para o valor da GUC a cada execução; não é armazenada no repositório |

Limitações de idempotência:

- `ALTER SCHEMA investfacil OWNER TO investfacil_migrate` pressupõe que o executor é owner/admin. Em um schema já existente com tabelas de outro owner, as tabelas **não** mudam de owner; isso é um cenário de retrofit, não o fluxo novo.
- Os scripts não removem roles, grants ou policies; são forward-only.
- Não execute o bootstrap em um banco onde o schema já pertence a outro modelo sem revisar ownership.

---

## 4. Mudanças de configuração

### 4.1 `application-prod.yml`

Adicionado:

```yaml
spring:
  flyway:
    url: ${SPRING_FLYWAY_URL}
    user: ${SPRING_FLYWAY_USER}
    password: ${SPRING_FLYWAY_PASSWORD}
```

Efeito: em `prod`, o Flyway não cai silenciosamente no datasource de runtime. O startup falha de forma explícita se as variáveis faltarem. Testado:

- sem `SPRING_FLYWAY_*`: `Could not resolve placeholder 'SPRING_FLYWAY_URL'`, processo encerrado;
- com as três variáveis: `HEALTH=UP` em `prod`.

O perfil `dev` mantém o fallback para o datasource local; isso é intencional para testes/containers onde o datasource é o owner. Não é o modelo de produção.

### 4.2 `docs/DEPLOY.md`

Atualizado para a ordem bootstrap → runtime e para explicar que o perfil `prod` exige as variáveis de Flyway.

### 4.3 Arquivos não alterados

- `backend/src/main/resources/application.yml` (base)
- migrations V1–V5
- código de controllers/services/entidades
- frontend

---

## 5. Compatibilidade com Supabase

| Item | Situação |
|---|---|
| SQL Editor aceita `SET` + DO/DDL? | **Não testado remotamente**; sintaxe é SQL padrão/PL-pgSQL |
| `postgres` pode criar roles/transferir ownership? | **Não testado remotamente**; requer owner/admin |
| `anon`/`authenticated` existem? | briefing indica projeto Supabase; V2 revoga condicionalmente; **não revalidado** |
| `storage.buckets` | script separado; não executado |
| Direct/pooler/SSL/IPv6 | **NOT TESTED — EXTERNAL CONNECTIVITY** |
| Região | `sa-east-1` × Render `oregon`; risco de latência |

O script é compatível com o SQL Editor em sintaxe (sem meta-variáveis `psql`), mas a execução real no SQL Editor do Supabase depende de permissões do role `postgres` e não foi autorizada/testada nesta missão.

---

## 6. Evidências locais

- Container `investfacil-s1-db`, PostgreSQL 17.12, `127.0.0.1:55434`.
- `PROVISION_MIGRATION_ROLE.sql` e `PROVISION_RUNTIME_ROLE.sql` executados com sucesso.
- Reexecução dos dois scripts: exit 0.
- Flyway V1–V5 aplicado como `investfacil_migrate`.
- Aplicação iniciada como `investfacil_runtime`; `/actuator/health` UP; `/content/categories` 200 com 8 categorias.
- Seed: 8 categorias, 12 módulos, 31 aulas, 62 questões, 6 artigos, 7 conquistas; segunda inicialização sem duplicação.
- Runtime: `SELECT/INSERT` OK; DDL, `CREATE ROLE`, `ALTER TABLE`, `flyway_schema_history`, schema privado e ledgers append-only negados.
- Migration: DDL OK; `CREATE ROLE` negado; runtime não pode `SET ROLE investfacil_migrate`.

**Nenhum desses testes foi executado no Supabase.**
