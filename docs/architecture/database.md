# Banco de dados — Invest Fácil

**Status: V1–V7 implementadas e validadas em PostgreSQL 17 real (Testcontainers).**
Supabase remoto ainda não provisionado.

## 1. Flyway é a fonte única de DDL

Todo o schema nasce de migrations versionadas em
`backend/src/main/resources/db/migration/`:

| Migration | Conteúdo |
|---|---|
| `V1__init.sql` | 17 tabelas do domínio, schema `investfacil` |
| `V2__postgres_security.sql` | papéis, grants, RLS deny-by-default, revogação do PostgREST |
| `V3__auth_mfa_simulator.sql` | MFA/bloqueio, família de refresh, `simulations`, URL externa de vídeo, índice anti-farm |
| `V4__simulation_inflation.sql` | preserva a inflação hipotética no cenário salvo |
| `V5__append_only_ledgers.sql` | revoga UPDATE/DELETE de `auth_event`, `xp_ledger` e `user_achievements` para o runtime |
| `V6__user_rls.sql` | RLS por usuário, FORCE RLS, 68 policies `s24_*`, contexto transacional e guard de `users` |
| `V7__database_function_hardening.sql` | search_path fixo nas 9 funções, EXECUTE mínimo, initplan e remoção da função legada apply_table_security |

Hibernate roda com `ddl-auto=validate`: **valida, nunca cria/altere**. Não existe
caminho alternativo de DDL (`supabase/migrations` duplicado é proibido).

## 2. Evolução V3 (detalhe)

### `users`
- `avatar_url`, `mfa_enabled`, `mfa_secret` (AES-GCM), `mfa_last_counter`,
  `failed_login_attempts`, `locked_until`, `last_login_at`.

### `refresh_tokens`
- `family_id uuid NOT NULL DEFAULT gen_random_uuid()` + índice, para revogar a
  família inteira na detecção de reuso. O token cru nunca é armazenado; apenas
  SHA-256 em `token_hash`.

### `video_assets`
- `external_url` opcional para fallback controlado; produção usa o bucket privado.

### `simulations`
- `id`, `user_id` (FK), `name`, `initial_amount`, `monthly_contribution`,
  `months` (1–600), `annual_rate` (0–100), `inflation_rate` (0–100, V4),
  `final_amount`, `invested_amount`, `created_at`; índice por usuário/data; RLS aplicada.

### Append-only real
A V5 revoga `UPDATE`/`DELETE` de `auth_event`, `xp_ledger` e
`user_achievements` para `investfacil_app`. O runtime só pode inserir/ler esses
ledgers; alteração exigiria o owner do banco. Validado por
`FlywaySecurityIntegrationTest.appNaoPodeAlterarLedgersDeAuditoriaOuXp`.

### XP idempotente
Índice único parcial:

```sql
CREATE UNIQUE INDEX ux_xp_once_per_lesson_reason
  ON investfacil.xp_ledger (user_id, lesson_id, reason)
  WHERE lesson_id IS NOT NULL
    AND reason IN ('LESSON_COMPLETED', 'QUIZ_PASSED');
```

Impede farm de XP repetindo a mesma aula/quiz, inclusive sob concorrência.

## 3. Modelo lógico (V1–V7)

```mermaid
erDiagram
    users ||--o{ refresh_tokens : "sessões"
    users ||--o{ email_tokens : "verify/reset"
    users ||--o{ auth_event : "auditoria"
    users ||--o{ user_progress : "conclusões"
    users ||--o{ quiz_attempts : "tentativas"
    users ||--o{ xp_ledger : "XP"
    users ||--o{ user_achievements : "conquistas"
    users ||--o{ simulations : "cenários"
    categories ||--o{ modules : "organiza"
    categories ||--o{ articles : "categoriza"
    modules ||--o{ lessons : "contém"
    lessons ||--o| video_assets : "1 vídeo"
    lessons ||--o{ quiz_questions : "quiz"
    lessons ||--o{ lesson_articles : "leitura"
    articles ||--o{ lesson_articles : "vínculo"
    quiz_attempts ||--o{ quiz_attempt_answers : "respostas"
    quiz_questions ||--o{ quiz_attempt_answers : "avaliada"
    achievements ||--o{ user_achievements : "desbloqueio"
```

Tabelas: `users`, `refresh_tokens`, `email_tokens`, `auth_event`, `categories`,
`modules`, `lessons`, `video_assets`, `articles`, `lesson_articles`,
`user_progress`, `quiz_questions`, `quiz_attempts`, `quiz_attempt_answers`,
`xp_ledger`, `achievements`, `user_achievements`, `simulations`.
(18 tabelas no total; a V4 adiciona apenas a coluna `inflation_rate`.)

## 4. Segurança do banco

| Papel | Tipo | Escopo |
|---|---|---|
| `investfacil_app` | NOLOGIN | DML em todas as tabelas |
| `investfacil_migrate` | LOGIN INHERIT | DDL (USAGE/CREATE), owner do schema |
| `investfacil_test_guest` | NOLOGIN | `GRANT SELECT` de propósito, para provar RLS |
| `investfacil_runtime` | LOGIN INHERIT | membro de `investfacil_app`; senha fora do repositório |

- `REVOKE ALL ON SCHEMA investfacil FROM PUBLIC/anon/authenticated`.
- RLS habilitada + FORCE RLS nas 18 tabelas; 68 policies `s24_*`; zero `app_rw`.
- Funções V7 com search_path vazio e EXECUTE mínimo; o runtime herda investfacil_app; apply_table_security foi removida na V7.
- `DatabaseSecurityGuard` valida V6/V7 e exige a versão declarada em `APP_SECURITY_GUARD_EXPECTED_VERSION`.
- `flyway_schema_history` sem privilégio de runtime.
- App não pode executar DDL (testado).
- App não pode alterar/apagar ledgers de auditoria/XP (V5, testado).
- Guest com SELECT vê 0 linhas (testado).

### 4.1 V7 - hardening local (S2.8/R1)

- Nove funções com search_path vazio; apply_table_security foi removida, sem assinatura residual.
- EXECUTE: investfacil_app nos helpers e na trigger; investfacil_migrate nas nove; zero PUBLIC/anon/authenticated; apply_table_security removida.
- Policy s24_users_register_insert usa subquery escalar para current_setting de app.flow (initplan).
- A V7 foi aplicada apenas em Testcontainers/local; o Lab permanece em V6 nesta etapa.

## 5. Supabase

- PostgreSQL gerenciado; usar a conexão **direta (5432)** para Flyway. O pooler
  (6543) pode não suportar DDL.
- `investfacil_runtime` provisionado fora do repositório
  (`docs/supabase/PROVISION_RUNTIME_ROLE.sql`).
- PostgREST não expõe o schema; Supabase Auth não é usado.
- Storage separado para vídeos (`docs/supabase/STORAGE_SETUP.sql`).

## 6. Seed de conteúdo

- Conteúdo educativo fica em `backend/src/main/resources/seed/content.json`,
  gerado por `scripts/generate-seed.mjs`.
- O seed é aplicado por `ContentSeedService` de forma idempotente (só quando não
  há categorias) e não cria schema.
- 8 categorias, 12 módulos, 31 aulas, 62 questões de quiz, 6 artigos e 7 conquistas.
- Conta demo é opcional (`APP_DEMO_ENABLED`, `DEMO_PASSWORD`); nunca há senha
  versionada.

## 7. Regras de evolução

- Toda mudança é uma nova migration (V4, V5, ...); V1–V7 são imutáveis após
  ambientes compartilhados.
- Tabelas novas herdam privilégios via ALTER DEFAULT PRIVILEGES; apply_table_security foi removida na V7 e não deve ser recriada. Novas tabelas exigem policies explícitas.
- Índices e constraints pertencem à migration que cria a tabela.
- Antes de migration destrutiva: backup/PITR e janela combinada.
