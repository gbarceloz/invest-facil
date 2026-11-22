# DATABASE MAP — INVEST FÁCIL

**Banco:** PostgreSQL 17 · schema `investfacil` · Flyway V1–V7 · Hibernate `ddl-auto=validate`.
**Evidência:** `backend/src/main/resources/db/migration/**`, entidades JPA,
`FlywaySecurityIntegrationTest`.
**Observação direta:** schema local/Testcontainers; banco remoto **NOT VERIFIED**.

---

## 1. Migrations

| Migration | Conteúdo | Evidência |
|---|---|---|
| `V1__init.sql` | 17 tabelas, PK/FK, índices, constraints | `backend/src/main/resources/db/migration/V1__init.sql` |
| `V2__postgres_security.sql` | roles, grants, RLS, `apply_table_security()`, append-only base | `V2__postgres_security.sql` |
| `V3__auth_mfa_simulator.sql` | MFA/lockout, família de refresh, `simulations`, índice único de XP | `V3__auth_mfa_simulator.sql` |
| `V4__simulation_inflation.sql` | coluna `inflation_rate` em `simulations` | `V4__simulation_inflation.sql` |
| `V5__append_only_ledgers.sql` | revoga UPDATE/DELETE em ledgers para o runtime | `V5__append_only_ledgers.sql` |
| `V6__user_rls.sql` | RLS/FORCE, 68 policies `s24_*`, contexto e guard | `V6__user_rls.sql` |
| `V7__database_function_hardening.sql` | search_path fixo, EXECUTE mínimo, initplan e remoção de apply_table_security() | `V7__database_function_hardening.sql` |

Migrations são imutáveis após aplicação; evolução sempre em nova migration.

---

## 2. Tabelas

| Tabela | Migration | Finalidade | Chaves/relações | Repositório | Features |
|---|---|---|---|---|---|
| `users` | V1 + V3 | conta, papel, verificação, MFA, lockout, perfil | PK `id`; unique lower(email) | `UserRepository` | AUTH-001/002/003/004/005, USER-001, GAME-001 |
| `refresh_tokens` | V1 + V3 | sessões opacas, rotação, família | FK `user_id → users`; `replaced_by → refresh_tokens` | `RefreshTokenRepository` | AUTH-002/005 |
| `email_tokens` | V1 | verificação e reset | FK `user_id → users`; unique hash | `EmailTokenRepository` | AUTH-001/003 |
| `auth_event` | V1 | auditoria de auth | FK `user_id → users` (nullable) | `AuthEventRepository` | AUTH-001..005 |
| `categories` | V1 | categorias de conteúdo | PK `id`; unique slug | `CategoryRepository` | LEARN-001/003 |
| `modules` | V1 | módulos por categoria | FK `category_id → categories`; unique slug | `CourseModuleRepository` | LEARN-001 |
| `lessons` | V1 | aulas, `content_md`, published | FK `module_id → modules`; unique slug | `LessonRepository` | LEARN-001/002, PROGRESS-001/002 |
| `video_assets` | V1 + V3 | metadados de vídeo e URL externa | FK `lesson_id → lessons`; unique lesson/storage_path | `VideoAssetRepository` | LEARN-002, ADMIN-001 |
| `articles` | V1 | artigos Markdown | FK `category_id → categories` (nullable); unique slug | `ArticleRepository` | LEARN-003 |
| `lesson_articles` | V1 | associação N:N aula↔artigo | PK `(lesson_id, article_id)`; FKs | **nenhum** | **não usada** (órfã) |
| `user_progress` | V1 | conclusão idempotente | FK `user_id`, `lesson_id`; unique `(user_id, lesson_id)` | `UserProgressRepository` | PROGRESS-001, GAME-001 |
| `quiz_questions` | V1 | perguntas/opções/gabarito | FK `lesson_id`; `options jsonb` | `QuizQuestionRepository` | PROGRESS-002 |
| `quiz_attempts` | V1 | tentativas e score | FK `user_id`, `lesson_id` | `QuizAttemptRepository` | PROGRESS-002, GAME-001 |
| `quiz_attempt_answers` | V1 | respostas por tentativa | FK `attempt_id`, `question_id` | `QuizAttemptAnswerRepository` | PROGRESS-002 |
| `xp_ledger` | V1 + V3 | XP append-only; unique por aula/motivo | FK `user_id`, `lesson_id` (nullable) | `XpLedgerRepository` | GAME-001 |
| `achievements` | V1 | catálogo de conquistas | unique `code` | `AchievementRepository` | GAME-001 |
| `user_achievements` | V1 | conquistas desbloqueadas | PK `(user_id, achievement_id)` | `UserAchievementRepository` | GAME-001 |
| `simulations` | V3 + V4 | cenários salvos | FK `user_id → users` (ON DELETE CASCADE) | `SimulationRepository` | SIM-002 |
| `flyway_schema_history` | Flyway | histórico de migrations | interno | — | infraestrutura |

Total de aplicação: **18 tabelas** (17 da V1 + `simulations` da V3). `lesson_articles`
existe no schema, mas não tem entidade/repository/uso no código atual.

---

## 3. RLS, roles e grants

| Item | Definição | Evidência | Limite |
|---|---|---|---|
| Roles | `investfacil_app` (DML), `investfacil_migrate` (DDL, owner), `investfacil_test_guest` (SELECT de teste), `investfacil_runtime` (LOGIN INHERIT) | V2/V6 | runtime usa app |
| RLS | habilitada + FORCE nas 18 tabelas, exceto `flyway_schema_history` | V6 | RLS/FORCE por usuário |
| Policy | 68 policies `s24_*` por operação/ownership; zero `app_rw` | V6 | **RLS/FORCE por usuário** |
| Guest | sem policy → vê 0 linhas mesmo com GRANT SELECT | V2 + `guestComGrantSelectVeZeroLinhas...` | prova deny-by-default |
| DDL | app não pode `CREATE TABLE` | `investfacilAppNaoPodeExecutarDDL` | — |
| Append-only | UPDATE/DELETE revogados em `auth_event`, `xp_ledger`, `user_achievements` | V5 + teste | demais tabelas mutáveis |
| Default privileges | novas tabelas recebem grants do app/guest; funções futuras não nascem com EXECUTE PUBLIC (V7) | V2/V7 | nova tabela precisa RLS/policy |

**Estado V6/V7:** as policies `s24_*` isolam por usuário; a V7 fixa `search_path` e remove EXECUTE de PUBLIC.
A V7 ainda não foi aplicada no Lab; o guard valida RLS/FORCE, policies, owners e funções.

---

## 4. Índices e constraints relevantes

- `ux_users_email_lower` — e-mail único case-insensitive.
- `ux_refresh_tokens_hash`, `ux_email_tokens_hash` — tokens opacos por hash.
- `ix_refresh_tokens_family` — revogação de família.
- `ux_user_progress (user_id, lesson_id)` — conclusão idempotente.
- `ux_xp_once_per_lesson_reason` — XP único por aula/motivo
  (`LESSON_COMPLETED`, `QUIZ_PASSED`).
- `ix_simulations_user` — listagem por usuário.
- FKs de conteúdo (`modules→categories`, `lessons→modules`, `video_assets→lessons`,
  `articles→categories`) e de progresso/quiz/XP.
- `ck_quiz_correct`, `ck_quiz_score`, `ck_xp_amount`, checks de simulação.
- `simulations.inflation_rate` (V4) com 0–100%.

---

## 5. Data lineage

| Operação | Escrita | Leitura/derivação |
|---|---|---|
| Cadastro/verificação | `users`, `email_tokens`, `auth_event` | e-mail, token hash |
| Login/refresh/logout | `refresh_tokens`, `users.last_login_at`, `auth_event` | usuário, família, expiração |
| Conclusão de aula | `user_progress`, `xp_ledger`, `user_achievements` | aula publicada, XP total |
| Quiz | `quiz_attempts`, `quiz_attempt_answers`, `xp_ledger`, `user_achievements` | gabarito, tentativas, média |
| Gamificação | `xp_ledger`, `user_achievements` | `totalXp`, datas de atividade |
| Simulação | `simulations`, `xp_ledger`, `user_achievements` | cálculo, cenário, achievement |
| Conteúdo | seed (insert/update idempotente) | categorias, módulos, aulas, artigos |
| Vídeo | `video_assets` (upload admin) | aula, status, URL assinada |

---

## 6. Dados sensíveis

- `users.password_hash` (BCrypt), `users.mfa_secret` (AES-GCM), `users.email`.
- `refresh_tokens.token_hash`, `email_tokens.token_hash` (SHA-256; nunca token cru).
- `auth_event.ip`, `user_agent`, `detail` (auditoria).
- `user_progress`, `quiz_attempts`, `simulations` (histórico de aprendizagem/simulação).
- `video_assets.storage_path`, `external_url`.

Nenhum valor real de usuário foi copiado para os mapas.

---

## 7. Evidência de teste

`FlywaySecurityIntegrationTest` 5/5:
1. Flyway aplica V1/V2 em banco limpo; ≥15 tabelas.
2. `investfacil_app` escreve/lê.
3. `investfacil_app` não executa DDL.
4. `investfacil_app` não altera `auth_event`/`xp_ledger`.
5. `investfacil_test_guest` com GRANT SELECT vê 0 linhas (RLS deny-by-default).

**Não verificado:** banco remoto, per-user RLS, restore/backup, migração destrutiva,
concorrência de escrita, performance/índices em volume.
