# S0 — Auditoria do banco de dados e migrations

**Projeto:** Invest Fácil
**Banco local auditado:** PostgreSQL 17.12
**Migrations:** V1–V5
**Modo:** leitura; nenhuma migration aplicada nesta missão

---

## 1. Stack e configuração efetiva

| Item | Valor |
|---|---|
| Java | 21 (Spring Boot 3.5.6) |
| Driver | PostgreSQL JDBC (runtime) |
| Schema da aplicação | `investfacil` |
| DDL | exclusivamente Flyway |
| Hibernate | `ddl-auto: validate` |
| Schema default JPA | `investfacil` |
| Pool | HikariCP, `maximum-pool-size=5`, `minimum-idle=1`, timeout 10 s |
| Flyway | `flyway-core` + `flyway-database-postgresql`; versão via BOM do Boot |
| Timezone JDBC | UTC |
| OpenAPI | springdoc 2.8.9 |

### 1.1 Variáveis de banco esperadas

Nomes apenas; nenhum valor foi lido ou registrado:

- `SPRING_DATASOURCE_URL`
- `SPRING_DATASOURCE_USERNAME`
- `SPRING_DATASOURCE_PASSWORD`
- `SPRING_FLYWAY_URL`
- `SPRING_FLYWAY_USER`
- `SPRING_FLYWAY_PASSWORD`

O `application.yml` usa o datasource como fallback do Flyway quando as variáveis `SPRING_FLYWAY_*` não existem. Isso é conveniente localmente, mas perigoso em produção se o datasource for o runtime DML: o Flyway tentaria DDL com um papel sem privilégio e a aplicação falharia na inicialização.

### 1.2 Perfis

| Perfil | Comportamento |
|---|---|
| `dev` | cookie pode ser HTTP; `EXPOSE_DEV_TOKENS=true`; log DEBUG; market habilitado |
| `prod` | apenas logging enxuto; segurança/cookies vêm da base e do ambiente |
| testes | Testcontainers PostgreSQL 17; propriedades dinâmicas; sem H2 |

---

## 2. Inventário de tabelas

**18 tabelas de aplicação** + `flyway_schema_history`.

### 2.1 Identidade e segurança

| Tabela | Função | Chaves/constraints principais |
|---|---|---|
| `users` | conta, perfil, MFA, lockout | PK UUID; e-mail único por `lower(email)`; `role IN (USER,ADMIN)`; V3 adiciona avatar, MFA, tentativas, lock, último login |
| `refresh_tokens` | sessões opacas | FK `user_id`; hash único; `expires_at > created_at`; `replaced_by` self-FK; V3 `family_id` |
| `email_tokens` | verificação/reset | FK `user_id`; hash único; `type IN (EMAIL_VERIFY,PASSWORD_RESET)`; uso único por `used_at` |
| `auth_event` | auditoria de autenticação | FK `user_id` nullable; `event_type`; IP/UA/detalhe; append-only por grants |

### 2.2 Conteúdo

| Tabela | Função | Chaves/constraints principais |
|---|---|---|
| `categories` | trilhas | slug único; ordem |
| `modules` | módulos | FK `category_id`; slug único; ordem |
| `lessons` | aulas | FK `module_id`; slug único; `published`; conteúdo markdown |
| `video_assets` | vídeo por aula | FK `lesson_id` único; `storage_path` único; status `PENDING/READY/PUBLISHED/EXPIRED`; V3 `external_url` |
| `articles` | biblioteca | FK `category_id` nullable; slug único; `published`, `published_at` |
| `lesson_articles` | vínculo N:N | PK `(lesson_id, article_id)`; FKs; **sem entidade/repository/uso atual** |

### 2.3 Progresso, quiz e gamificação

| Tabela | Função | Chaves/constraints principais |
|---|---|---|
| `user_progress` | conclusão de aula | FKs user/lesson; UNIQUE `(user_id, lesson_id)` |
| `quiz_questions` | perguntas | FK lesson; `options jsonb`; `correct_index >= 0` |
| `quiz_attempts` | tentativas | FKs user/lesson; score/max |
| `quiz_attempt_answers` | respostas | FKs attempt/question; selected/correct |
| `xp_ledger` | extrato de XP | FKs user/lesson; `amount <> 0`; append-only |
| `achievements` | catálogo | código único |
| `user_achievements` | desbloqueios | PK composta user/achievement; FKs; append-only |

### 2.4 Simulador

| Tabela | Função | Chaves/constraints principais |
|---|---|---|
| `simulations` | cenários salvos | FK `user_id` com `ON DELETE CASCADE`; valores `numeric(15,2)`; meses 1–600; taxas 0–100; V4 `inflation_rate` |

---

## 3. Migrations — auditoria individual

### V1 — `V1__init.sql` (227 linhas)

**Objetivo:** criar o schema `investfacil` e as 17 tabelas iniciais.

- **Schemas/tabelas:** `investfacil`; users, refresh_tokens, email_tokens, auth_event, categories, modules, lessons, video_assets, articles, lesson_articles, user_progress, quiz_questions, quiz_attempts, quiz_attempt_answers, xp_ledger, achievements, user_achievements.
- **Constraints:** 17 PKs; 2 self/user FKs de refresh; FKs de conteúdo, progresso, quiz, XP e conquistas; checks de role, status de vídeo, expiração de refresh, tipo de token, score, `correct_index`, `amount <> 0`; UNIQUE `(user_id, lesson_id)` em progresso.
- **Índices:** e-mail lower único; hashes únicos de tokens; índices por usuário/data; slugs únicos de categoria/módulo/aula/artigo; índices de publicação, categoria, módulo e quiz.
- **Roles/grants/RLS/triggers:** não nesta migration.
- **Dependências:** nenhuma; cria a base.
- **Supabase PG17:** recursos padrão (`uuid`, `gen_random_uuid`, `timestamptz`, `jsonb`, `numeric`, índices parciais). Sem extensão obrigatória. **Compatível em princípio.**

### V2 — `V2__postgres_security.sql` (115 linhas)

**Objetivo:** criar roles, separar DDL/DML, revogar PostgREST e habilitar RLS.

- **Roles:** `investfacil_app`, `investfacil_migrate`, `investfacil_test_guest` (NOLOGIN).
- **Schema:** `REVOKE ALL ON SCHEMA investfacil FROM PUBLIC`; revoga `anon`/`authenticated` se existirem.
- **Grants:** USAGE no schema e DML em todas as tabelas para `investfacil_app`; SELECT para `test_guest`; USAGE/CREATE para `migrate`; default privileges.
- **Função:** `investfacil.apply_table_security()` em PL/pgSQL, que percorre `pg_tables`, habilita RLS, remove e recria `app_rw` com `USING (true) WITH CHECK (true)` para `investfacil_app`.
- **RLS:** habilitada nas 18 tabelas de aplicação; uma policy permissiva por tabela.
- **Triggers:** nenhum.
- **Dependências:** V1.
- **Supabase PG17:** `CREATE ROLE`, `REVOKE`, `GRANT`, `ALTER DEFAULT PRIVILEGES`, `PL/pgSQL`, `CREATE POLICY` são suportados, mas dependem de o executor ser owner/superuser ou ter `CREATEROLE` e ownership do schema. **Não validado no Supabase.**
- **Observação:** a policy `app_rw` não isola usuários. O nome “deny-by-default” aplica-se a papéis sem policy (`test_guest`), não ao `investfacil_app`.

### V3 — `V3__auth_mfa_simulator.sql` (66 linhas)

**Objetivo:** completar autenticação, refresh por família, vídeo externo e simulador.

- **`users`:** adiciona avatar, MFA, contador TOTP, tentativas falhas, lock e último login.
- **`refresh_tokens`:** adiciona `family_id` com default `gen_random_uuid()` e índice.
- **`video_assets`:** adiciona `external_url`.
- **`simulations`:** nova tabela com FK `user_id ON DELETE CASCADE`, checks de valores/meses/taxas, índices.
- **XP:** índice único parcial `(user_id, lesson_id, reason)` para `LESSON_COMPLETED`/`QUIZ_PASSED`.
- **Grants:** DML em `simulations` para `investfacil_app`; SELECT para `test_guest`.
- **RLS:** chama `apply_table_security()` para incluir a nova tabela.
- **Dependências:** V1 e V2.
- **Supabase PG17:** compatível em princípio; exige que a função e as roles da V2 existam e que o executor possa criar a tabela/índices.

### V4 — `V4__simulation_inflation.sql` (8 linhas)

**Objetivo:** preservar `inflation_rate` no cenário salvo.

- Adiciona `simulations.inflation_rate numeric(7,3) NOT NULL DEFAULT 0` com check 0–100.
- **Dependências:** V3.
- **Supabase PG17:** compatível.

### V5 — `V5__append_only_ledgers.sql` (13 linhas)

**Objetivo:** tornar append-only real para ledgers sensíveis.

- `REVOKE UPDATE, DELETE` de `auth_event`, `xp_ledger` e `user_achievements` para `investfacil_app`.
- `REVOKE ALL` de `flyway_schema_history` para `investfacil_app`.
- **Não cria triggers.** A garantia depende de o runtime herdar apenas `investfacil_app` e de o owner/superuser não ser usado pela aplicação.
- **Dependências:** V2/V3.
- **Supabase PG17:** compatível sintaticamente; a eficácia depende do role de conexão.

---

## 4. Evidência de execução local

Consulta somente leitura no PostgreSQL 17.12 local:

| Item | Resultado |
|---|---|
| Flyway history | 5 migrations SQL + criação de schema, todas `success=true` |
| Checksums | V1 `2042958527`, V2 `-1758759071`, V3 `-985364667`, V4 `96204379`, V5 `1689826810` |
| Tabelas no schema | 19 (18 de aplicação + `flyway_schema_history`) |
| Índices | 49 |
| Constraints | 165 (inclui NOT NULL gerados pelo PG 17) |
| Foreign keys | 22 |
| Policies | 18 |
| Triggers não internos | 0 |
| Funções no schema | 1 (`apply_table_security`) |
| Extensões | apenas `plpgsql` 1.0 |
| Owner do schema/tabelas | `postgres` |

A ausência de extensões adicionais é relevante: `gen_random_uuid()` é nativo no PG 13+, e não há dependência de `pgcrypto`, `citext` ou `uuid-ossp`.

---

## 5. Documentação versus realidade

| Documento | Afirmação | Realidade |
|---|---|---|
| `application.yml` | comentário “V1..V3” | existem V1–V5 |
| `docs/DEPLOY.md` | 28 testes backend / 6 frontend | 47 backend / 12 frontend no estado atual |
| `docs/architecture/database.md` | Supabase remoto “ainda não provisionado” | o briefing informa projeto criado, `public` vazio, sem migrations |
| `docs/architecture/database.md` e `SECURITY.md` | “RLS deny-by-default” | verdadeiro para roles sem policy; `investfacil_app` tem `USING (true)` |
| `PROVISION_RUNTIME_ROLE.sql` | runtime “membro de investfacil_app” | `NOINHERIT` impede herança automática; a aplicação não executa `SET ROLE` |

---

## 6. Conclusão da camada de banco

O schema é completo, versionado e executável em PostgreSQL 17 limpo. As migrations não usam recursos exóticos e são compatíveis com PG17 em sintaxe. Os riscos não estão na criação das tabelas, mas em:

1. provisionamento do role de runtime;
2. separação real entre credencial de Flyway e credencial de aplicação;
3. RLS sem isolamento por usuário;
4. comportamento do owner/superuser;
5. conectividade/SSL/pooler/região do Supabase.

**Nenhuma migration foi aplicada ou alterada nesta missão.**
