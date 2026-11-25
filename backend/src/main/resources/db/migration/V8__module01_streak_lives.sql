-- ============================================================================
-- V8 — Módulo 01: dias válidos de streak, fichas de quiz, vídeo assistido e
--      idempotência de submit.
--
-- LOCAL ONLY nesta entrega. Não executar em Supabase/banco remoto sem
-- autorização explícita do owner da operação.
--
-- Princípios:
--   1. Streak tem tabela própria (user_streak_days); não deriva de xp_ledger.
--      A UNIQUE (user_id, activity_date) garante no máximo 1 dia por usuário.
--   2. Fichas têm saldo (user_quiz_lives) + ledger append-only
--      (quiz_lives_ledger). Consumo é UPDATE condicional (balance > 0) e o
--      ledger tem chave idempotente por (user_id, idempotency_key).
--   3. Vídeo assistido tem estado próprio por (user, lesson).
--   4. quiz_submissions registra a Idempotency-Key do submit; a UNIQUE evita
--      duplo consumo/dupla tentativa em retry.
--   5. RLS FORCE + políticas por usuário, seguindo o modelo da V6. Políticas
--      desta migration usam prefixo v8_ para não alterar as contagens s24_.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1. Timezone IANA do usuário (data de streak é calculada no servidor)
-- ---------------------------------------------------------------------------
ALTER TABLE investfacil.users
    ADD COLUMN IF NOT EXISTS timezone varchar(64) NOT NULL DEFAULT 'America/Sao_Paulo';

-- ---------------------------------------------------------------------------
-- 2. Dias válidos de streak
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS investfacil.user_streak_days (
    id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id       uuid NOT NULL REFERENCES investfacil.users (id) ON DELETE CASCADE,
    activity_date date NOT NULL,
    lesson_id     uuid REFERENCES investfacil.lessons (id),
    timezone      varchar(64) NOT NULL,
    created_at    timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT ux_user_streak_days_user_date UNIQUE (user_id, activity_date)
);
CREATE INDEX IF NOT EXISTS ix_user_streak_days_user
    ON investfacil.user_streak_days (user_id, activity_date DESC);

-- ---------------------------------------------------------------------------
-- 3. Fichas: saldo atual + ledger append-only
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS investfacil.user_quiz_lives (
    user_id    uuid PRIMARY KEY REFERENCES investfacil.users (id) ON DELETE CASCADE,
    balance    int NOT NULL CONSTRAINT ck_user_quiz_lives_balance CHECK (balance >= 0),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS investfacil.quiz_lives_ledger (
    id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         uuid NOT NULL REFERENCES investfacil.users (id) ON DELETE CASCADE,
    delta           int NOT NULL CONSTRAINT ck_quiz_lives_ledger_delta CHECK (delta <> 0),
    reason          varchar(40) NOT NULL
                    CONSTRAINT ck_quiz_lives_ledger_reason
                    CHECK (reason IN ('INITIAL_GRANT', 'QUIZ_FAILED')),
    lesson_id       uuid REFERENCES investfacil.lessons (id),
    attempt_id      uuid REFERENCES investfacil.quiz_attempts (id),
    idempotency_key varchar(100),
    created_at      timestamptz NOT NULL DEFAULT now()
);
-- Um único grant inicial por usuário (idempotente mesmo sob concorrência).
CREATE UNIQUE INDEX IF NOT EXISTS ux_quiz_lives_ledger_initial
    ON investfacil.quiz_lives_ledger (user_id)
    WHERE reason = 'INITIAL_GRANT';
-- Uma única cobrança por Idempotency-Key.
CREATE UNIQUE INDEX IF NOT EXISTS ux_quiz_lives_ledger_idempotency
    ON investfacil.quiz_lives_ledger (user_id, idempotency_key)
    WHERE idempotency_key IS NOT NULL;
CREATE INDEX IF NOT EXISTS ix_quiz_lives_ledger_user
    ON investfacil.quiz_lives_ledger (user_id, created_at DESC);

-- ---------------------------------------------------------------------------
-- 4. Vídeo assistido por aula
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS investfacil.lesson_video_progress (
    id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id          uuid NOT NULL REFERENCES investfacil.users (id) ON DELETE CASCADE,
    lesson_id        uuid NOT NULL REFERENCES investfacil.lessons (id) ON DELETE CASCADE,
    watched          boolean NOT NULL DEFAULT false,
    position_seconds int NOT NULL DEFAULT 0
                     CONSTRAINT ck_lesson_video_position CHECK (position_seconds >= 0),
    duration_seconds int
                     CONSTRAINT ck_lesson_video_duration CHECK (duration_seconds IS NULL OR duration_seconds >= 0),
    watched_at       timestamptz,
    updated_at       timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT ux_lesson_video_progress_user_lesson UNIQUE (user_id, lesson_id)
);

-- ---------------------------------------------------------------------------
-- 5. Idempotência do submit do quiz
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS investfacil.quiz_submissions (
    id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id          uuid NOT NULL REFERENCES investfacil.users (id) ON DELETE CASCADE,
    lesson_id        uuid NOT NULL REFERENCES investfacil.lessons (id) ON DELETE CASCADE,
    idempotency_key  varchar(100) NOT NULL,
    status           varchar(12) NOT NULL DEFAULT 'PENDING'
                     CONSTRAINT ck_quiz_submissions_status
                     CHECK (status IN ('PENDING', 'PASSED', 'FAILED')),
    attempt_id       uuid REFERENCES investfacil.quiz_attempts (id),
    xp_awarded       int NOT NULL DEFAULT 0 CONSTRAINT ck_quiz_submissions_xp CHECK (xp_awarded >= 0),
    lesson_completed boolean NOT NULL DEFAULT false,
    created_at       timestamptz NOT NULL DEFAULT now(),
    completed_at     timestamptz,
    CONSTRAINT ux_quiz_submissions_user_key UNIQUE (user_id, idempotency_key)
);
CREATE INDEX IF NOT EXISTS ix_quiz_submissions_user_lesson
    ON investfacil.quiz_submissions (user_id, lesson_id, created_at DESC);

-- ---------------------------------------------------------------------------
-- 6. Privilégios mínimos do runtime (V6 revogou os default privileges)
-- ---------------------------------------------------------------------------
GRANT SELECT, INSERT ON investfacil.user_streak_days TO investfacil_app;

GRANT SELECT, INSERT, UPDATE ON investfacil.user_quiz_lives TO investfacil_app;
GRANT SELECT, INSERT ON investfacil.quiz_lives_ledger TO investfacil_app;

GRANT SELECT, INSERT, UPDATE ON investfacil.lesson_video_progress TO investfacil_app;

GRANT SELECT, INSERT, UPDATE ON investfacil.quiz_submissions TO investfacil_app;

-- ---------------------------------------------------------------------------
-- 7. RLS FORCE + políticas por proprietário
-- ---------------------------------------------------------------------------
CREATE POLICY v8_streak_select ON investfacil.user_streak_days
    FOR SELECT TO investfacil_app
    USING (user_id = investfacil.current_user_id());
CREATE POLICY v8_streak_insert ON investfacil.user_streak_days
    FOR INSERT TO investfacil_app
    WITH CHECK (user_id = investfacil.current_user_id());
CREATE POLICY v8_streak_migration_all ON investfacil.user_streak_days
    FOR ALL TO investfacil_migrate USING (true) WITH CHECK (true);

CREATE POLICY v8_lives_select ON investfacil.user_quiz_lives
    FOR SELECT TO investfacil_app
    USING (user_id = investfacil.current_user_id());
CREATE POLICY v8_lives_insert ON investfacil.user_quiz_lives
    FOR INSERT TO investfacil_app
    WITH CHECK (user_id = investfacil.current_user_id());
CREATE POLICY v8_lives_update ON investfacil.user_quiz_lives
    FOR UPDATE TO investfacil_app
    USING (user_id = investfacil.current_user_id())
    WITH CHECK (user_id = investfacil.current_user_id());
CREATE POLICY v8_lives_migration_all ON investfacil.user_quiz_lives
    FOR ALL TO investfacil_migrate USING (true) WITH CHECK (true);

CREATE POLICY v8_lives_ledger_select ON investfacil.quiz_lives_ledger
    FOR SELECT TO investfacil_app
    USING (user_id = investfacil.current_user_id());
CREATE POLICY v8_lives_ledger_insert ON investfacil.quiz_lives_ledger
    FOR INSERT TO investfacil_app
    WITH CHECK (user_id = investfacil.current_user_id());
CREATE POLICY v8_lives_ledger_migration_all ON investfacil.quiz_lives_ledger
    FOR ALL TO investfacil_migrate USING (true) WITH CHECK (true);

CREATE POLICY v8_video_select ON investfacil.lesson_video_progress
    FOR SELECT TO investfacil_app
    USING (user_id = investfacil.current_user_id());
CREATE POLICY v8_video_insert ON investfacil.lesson_video_progress
    FOR INSERT TO investfacil_app
    WITH CHECK (user_id = investfacil.current_user_id());
CREATE POLICY v8_video_update ON investfacil.lesson_video_progress
    FOR UPDATE TO investfacil_app
    USING (user_id = investfacil.current_user_id())
    WITH CHECK (user_id = investfacil.current_user_id());
CREATE POLICY v8_video_migration_all ON investfacil.lesson_video_progress
    FOR ALL TO investfacil_migrate USING (true) WITH CHECK (true);

CREATE POLICY v8_submissions_select ON investfacil.quiz_submissions
    FOR SELECT TO investfacil_app
    USING (user_id = investfacil.current_user_id());
CREATE POLICY v8_submissions_insert ON investfacil.quiz_submissions
    FOR INSERT TO investfacil_app
    WITH CHECK (user_id = investfacil.current_user_id());
CREATE POLICY v8_submissions_update ON investfacil.quiz_submissions
    FOR UPDATE TO investfacil_app
    USING (user_id = investfacil.current_user_id())
    WITH CHECK (user_id = investfacil.current_user_id());
CREATE POLICY v8_submissions_migration_all ON investfacil.quiz_submissions
    FOR ALL TO investfacil_migrate USING (true) WITH CHECK (true);

ALTER TABLE investfacil.user_streak_days ENABLE ROW LEVEL SECURITY;
ALTER TABLE investfacil.user_streak_days FORCE ROW LEVEL SECURITY;
ALTER TABLE investfacil.user_quiz_lives ENABLE ROW LEVEL SECURITY;
ALTER TABLE investfacil.user_quiz_lives FORCE ROW LEVEL SECURITY;
ALTER TABLE investfacil.quiz_lives_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE investfacil.quiz_lives_ledger FORCE ROW LEVEL SECURITY;
ALTER TABLE investfacil.lesson_video_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE investfacil.lesson_video_progress FORCE ROW LEVEL SECURITY;
ALTER TABLE investfacil.quiz_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE investfacil.quiz_submissions FORCE ROW LEVEL SECURITY;
