# S1 — Auditoria e modelo de roles

**Projeto:** Invest Fácil
**PostgreSQL de teste:** 17.12
**Migrations:** V1–V5 (inalteradas)
**Objetivo:** separar migration e runtime com privilégios mínimos e resolver o `NOINHERIT`

---

## 1. Modelo encontrado na S0/S1

### 1.1 Roles

| Role | Login | Herança | Situação encontrada |
|---|---|---|---|
| `investfacil_app` | não | sim | role de grupo DML; policy `app_rw` |
| `investfacil_migrate` | não | sim | NOLOGIN, apenas `USAGE, CREATE` no schema |
| `investfacil_test_guest` | não | sim | SELECT de teste; sem policy |
| `investfacil_runtime` | sim (script) | **NOINHERIT** | membro de `investfacil_app`, mas sem herança efetiva |
| `postgres` | sim | — | owner do schema/tabelas no provisioning antigo |

### 1.2 Problemas confirmados

1. `PROVISION_RUNTIME_ROLE.sql` criava `investfacil_runtime LOGIN NOINHERIT`.
2. O backend não executa `SET ROLE`.
3. `NOINHERIT` não herda privilégios de `investfacil_app`; o runtime recebeu `permission denied for schema investfacil` no teste.
4. `investfacil_migrate` NOLOGIN/USAGE+CREATE não é suficiente para as operações da V2 (`CREATE ROLE`, `REVOKE ON SCHEMA`, `CREATE POLICY`).
5. O Flyway tinha fallback para o datasource de runtime; se `SPRING_FLYWAY_*` faltasse, tentava DDL com DML.
6. O placeholder `:'runtime_password'` é sintaxe `psql`, não SQL Editor.

Evidência do teste `NOINHERIT`:

```text
CREATE ROLE s1_noinherit LOGIN NOINHERIT;
GRANT investfacil_app TO s1_noinherit;
SELECT count(*) FROM investfacil.users;
ERROR: permission denied for schema investfacil
```

---

## 2. Modelo proposto

### 2.1 Identidades

| Identidade | Tipo | Privilégios | Uso |
|---|---|---|---|
| `postgres`/owner do projeto | administrativa | bootstrap, ownership, criação de roles | executar scripts de provisionamento; nunca runtime |
| `investfacil_migrate` | LOGIN INHERIT | owner do schema `investfacil`; CREATE no database/schema; DDL/DML nos objetos que possui | somente Flyway |
| `investfacil_app` | NOLOGIN | DML nas tabelas; USAGE no schema | role de privilégios do runtime |
| `investfacil_runtime` | LOGIN INHERIT | membro de `investfacil_app`; sem ownership/DDL/CREATEROLE/BYPASSRLS | datasource da aplicação |
| `investfacil_test_guest` | NOLOGIN | SELECT; sem policy | teste de deny-by-default |
| `anon`/`authenticated` | roles Supabase | schema revogado | não usadas pela aplicação |

### 2.2 Por que `INHERIT`

- A aplicação usa HikariCP e não executa `SET ROLE`.
- `SET ROLE` em uma conexão é frágil: o pool pode reciclar a conexão e perder o contexto.
- Grants diretos ao login duplicariam a matriz e não aplicariam automaticamente a policy `TO investfacil_app`.
- `INHERIT` + membership é o modelo mais simples e compatível com pool.
- Teste local comprovou que a policy `app_rw` se aplica ao runtime membro com `INHERIT`:
  - `SELECT` funcionou;
  - `INSERT` funcionou;
  - `SELECT` seguinte viu a linha inserida.

### 2.3 Ownership da migration

A identidade `investfacil_migrate` é owner do schema e dos objetos. Isso é necessário porque a V2 executa `REVOKE ON SCHEMA`, `ALTER TABLE`, `CREATE POLICY` e `CREATE OR REPLACE FUNCTION`; sem ownership, essas operações falham.

O owner da migration **não** é usado pela aplicação. O runtime não tem ownership, não pode DDL, não pode criar roles e não acessa `flyway_schema_history`.

A criação das roles fica no bootstrap administrativo. Depois que `investfacil_app`, `investfacil_test_guest` e `investfacil_migrate` existem, os blocos `CREATE ROLE` condicionais da V2 não criam nada e o Flyway não precisa de `CREATEROLE`. Isso foi testado.

### 2.4 Dependência de bootstrap

A V2 ainda contém `CREATE ROLE` condicional. Em um banco onde as roles não existem, a execução exige `CREATEROLE`/admin. O caminho suportado é:

1. executar `PROVISION_MIGRATION_ROLE.sql` como owner/admin;
2. executar `PROVISION_RUNTIME_ROLE.sql`;
3. executar o Flyway como `investfacil_migrate`.

Sem o passo 1, o Flyway pode falhar na V2; isso é explícito e documentado, não um fallback silencioso.

---

## 3. Matriz de privilégios

| Operação | Owner/admin | `investfacil_migrate` | `investfacil_runtime` |
|---|---|---|---|
| CREATE schema | Sim | Sim (CREATE no database) | Não |
| CREATE table | Sim | Sim, no schema `investfacil` | Não |
| ALTER table | Sim | Sim, objetos que possui | Não |
| CREATE index | Sim | Sim | Não |
| CREATE function | Sim | Sim | Não |
| CREATE policy | Sim | Sim, tabelas que possui | Não |
| GRANT/REVOKE no schema | Sim | Sim, owner do schema | Não |
| CREATE ROLE | Sim (bootstrap) | **Não** (testado) | **Não** (testado) |
| SELECT/INSERT/UPDATE/DELETE | Sim | Sim como owner | Sim, via `investfacil_app` e policy |
| Acessar `flyway_schema_history` | Sim | Sim | **Não** (testado) |
| Acessar schema não autorizado | Sim | Não | **Não** (testado) |
| SET ROLE `investfacil_migrate` | Sim | — | **Não** (testado) |
| SUPERUSER / BYPASSRLS | owner do projeto | **Não** | **Não** |

A matriz descreve o modelo efetivamente testado localmente, não uma concessão automática para produção.

---

## 4. Alternativas descartadas

| Alternativa | Motivo |
|---|---|
| Runtime `NOINHERIT` + `SET ROLE` manual | Não sobrevive à reciclagem do Hikari; não é executado pelo app |
| Grants diretos ao runtime sem membership | Duplica a matriz e não garante a policy `TO investfacil_app` |
| Runtime como owner | Daria DDL e bypass de RLS; viola privilégio mínimo |
| `SECURITY DEFINER` para contornar | Aumenta a superfície e não resolve identidade |
| `SUPERUSER` para migration | Desnecessário e perigoso; bootstrap separado resolve |

---

## 5. Limitações e validação remota

- O modelo foi validado em PostgreSQL 17.12 local; o Supabase não foi conectado.
- A existência/atributos de `anon` e `authenticated` no Supabase não foram revalidados; o script V2 os revoga condicionalmente.
- A capacidade do `postgres` do Supabase de criar roles e transferir ownership não foi testada; marcada como `NOT TESTED — REMOTE`.
- A policy `app_rw` continua `USING (true)`; o modelo **não** implementa isolamento por usuário. RLS per-user está fora do escopo da S1.
- O runtime ainda pode criar tabelas temporárias se o `PUBLIC` tiver `TEMPORARY` no database; isso não foi revogado para não alterar o modelo global do Supabase. Não é DDL persistente no schema.

---

## 6. Conclusão

`INHERIT` + membership em `investfacil_app` + migration owner separado é o modelo mais simples, compatível com Hikari e testado localmente. O `NOINHERIT` foi eliminado; o runtime não consegue DDL, criar roles ou acessar o histórico de migrations; o Flyway usa a identidade de migration.

**Nenhuma migration ou policy foi alterada.**
