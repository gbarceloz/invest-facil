-- ============================================================================
-- V1 — Schema inicial do Invest Fácil (schema: investfacil)
-- Fonte única do modelo relacional. Hibernate roda em ddl-auto=validate.
-- ============================================================================

CREATE SCHEMA IF NOT EXISTS investfacil;

-- ============================================================================
-- Identidade e segurança
-- ============================================================================

CREATE TABLE investfacil.users (
    id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    email         varchar(255) NOT NULL,
    name          varchar(120) NOT NULL,
    password_hash varchar(100) NOT NULL,
    role          varchar(10)  NOT NULL DEFAULT 'USER'
                  CONSTRAINT ck_users_role CHECK (role IN ('USER', 'ADMIN')),
    verified      boolean      NOT NULL DEFAULT false,
    created_at    timestamptz  NOT NULL DEFAULT now(),
    updated_at    timestamptz  NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX ux_users_email_lower ON investfacil.users (lower(email));

CREATE TABLE investfacil.refresh_tokens (
    id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     uuid NOT NULL REFERENCES investfacil.users (id),
    -- Armazenamos APENAS o hash SHA-256 do token opaco (nunca o token cru).
    token_hash  varchar(64)  NOT NULL,
    expires_at  timestamptz  NOT NULL,
    revoked_at  timestamptz,
    replaced_by uuid REFERENCES investfacil.refresh_tokens (id),
    ip          varchar(64),
    user_agent  varchar(255),
    created_at  timestamptz  NOT NULL DEFAULT now(),
    CONSTRAINT ck_refresh_expiry CHECK (expires_at > created_at)
);
CREATE UNIQUE INDEX ux_refresh_tokens_hash  ON investfacil.refresh_tokens (token_hash);
CREATE        INDEX ix_refresh_tokens_user  ON investfacil.refresh_tokens (user_id);

CREATE TABLE investfacil.email_tokens (
    id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id    uuid NOT NULL REFERENCES investfacil.users (id),
    -- type: EMAIL_VERIFY | PASSWORD_RESET
    type       varchar(20)  NOT NULL
               CONSTRAINT ck_email_tokens_type CHECK (type IN ('EMAIL_VERIFY', 'PASSWORD_RESET')),
    token_hash varchar(64)  NOT NULL,
    expires_at timestamptz  NOT NULL,
    used_at    timestamptz,
    created_at timestamptz  NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX ux_email_tokens_hash ON investfacil.email_tokens (token_hash);
CREATE        INDEX ix_email_tokens_user ON investfacil.email_tokens (user_id);

-- Auditoria append-only de eventos de autenticação (substitui o fluxo GeoIP da RBS).
-- IP/UA são sinais de auditoria — nunca mecanismo único de identificação.
CREATE TABLE investfacil.auth_event (
    id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     uuid REFERENCES investfacil.users (id),
    -- LOGIN_OK | LOGIN_FAIL | REGISTER | EMAIL_VERIFIED | PASSWORD_RESET |
    -- REFRESH_ROTATED | REFRESH_REUSE_DETECTED | LOGOUT
    event_type  varchar(40)  NOT NULL,
    ip          varchar(64),
    user_agent  varchar(255),
    detail      varchar(500),
    occurred_at timestamptz  NOT NULL DEFAULT now()
);
CREATE INDEX ix_auth_event_user_time ON investfacil.auth_event (user_id, occurred_at DESC);

-- ============================================================================
-- Conteúdo educativo
-- ============================================================================

CREATE TABLE investfacil.categories (
    id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    slug          varchar(80)  NOT NULL,
    name          varchar(120) NOT NULL,
    description   varchar(500),
    display_order int          NOT NULL DEFAULT 0
);
CREATE UNIQUE INDEX ux_categories_slug ON investfacil.categories (slug);

CREATE TABLE investfacil.modules (
    id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id  uuid NOT NULL REFERENCES investfacil.categories (id),
    slug         varchar(80)  NOT NULL,
    title        varchar(150) NOT NULL,
    description  varchar(500),
    display_order int         NOT NULL DEFAULT 0
);
CREATE UNIQUE INDEX ux_modules_slug ON investfacil.modules (slug);
CREATE        INDEX ix_modules_category ON investfacil.modules (category_id, display_order);

CREATE TABLE investfacil.lessons (
    id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    module_id     uuid NOT NULL REFERENCES investfacil.modules (id),
    slug          varchar(80)  NOT NULL,
    title         varchar(150) NOT NULL,
    content_md    text,
    estimated_min int,
    display_order int          NOT NULL DEFAULT 0,
    published     boolean      NOT NULL DEFAULT false,
    created_at    timestamptz  NOT NULL DEFAULT now(),
    updated_at    timestamptz  NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX ux_lessons_slug ON investfacil.lessons (slug);
CREATE        INDEX ix_lessons_module ON investfacil.lessons (module_id, display_order);
-- Consulta frequente do catálogo público
CREATE        INDEX ix_lessons_published ON investfacil.lessons (published);

CREATE TABLE investfacil.video_assets (
    id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    lesson_id        uuid NOT NULL REFERENCES investfacil.lessons (id),
    -- Chave do objeto no Supabase Storage (bucket privado), ex.: videos/{uuid}.mp4
    storage_path     varchar(300) NOT NULL,
    -- PENDING (aguardando upload) | READY (upload confirmado) |
    -- PUBLISHED (visível) | EXPIRED (upload não confirmado)
    status           varchar(12)  NOT NULL DEFAULT 'PENDING'
                     CONSTRAINT ck_video_status CHECK (status IN ('PENDING', 'READY', 'PUBLISHED', 'EXPIRED')),
    mime             varchar(100),
    size_bytes       bigint,
    duration_seconds int,
    created_at       timestamptz  NOT NULL DEFAULT now(),
    updated_at       timestamptz  NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX ux_video_lesson ON investfacil.video_assets (lesson_id);
CREATE UNIQUE INDEX ux_video_storage_path ON investfacil.video_assets (storage_path);

CREATE TABLE investfacil.articles (
    id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id     uuid REFERENCES investfacil.categories (id),
    slug            varchar(80)  NOT NULL,
    title           varchar(150) NOT NULL,
    subtitle        varchar(300),
    content_md      text,
    source_name     varchar(150),
    source_url      varchar(500),
    -- Atribuição de fonte é obrigatória para conteúdo derivado de fontes externas
    published       boolean      NOT NULL DEFAULT false,
    published_at    timestamptz,
    reading_minutes int,
    created_at      timestamptz  NOT NULL DEFAULT now(),
    updated_at      timestamptz  NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX ux_articles_slug ON investfacil.articles (slug);
CREATE        INDEX ix_articles_category ON investfacil.articles (category_id);
CREATE        INDEX ix_articles_public ON investfacil.articles (published, published_at DESC);

CREATE TABLE investfacil.lesson_articles (
    lesson_id  uuid NOT NULL REFERENCES investfacil.lessons (id),
    article_id uuid NOT NULL REFERENCES investfacil.articles (id),
    PRIMARY KEY (lesson_id, article_id)
);
CREATE INDEX ix_lesson_articles_article ON investfacil.lesson_articles (article_id);

-- ============================================================================
-- Progresso, quizzes e gamificação
-- ============================================================================

CREATE TABLE investfacil.user_progress (
    id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id      uuid NOT NULL REFERENCES investfacil.users (id),
    lesson_id    uuid NOT NULL REFERENCES investfacil.lessons (id),
    completed    boolean      NOT NULL DEFAULT true,
    completed_at timestamptz  NOT NULL DEFAULT now(),
    created_at   timestamptz  NOT NULL DEFAULT now(),
    CONSTRAINT ux_user_progress UNIQUE (user_id, lesson_id)
);
CREATE INDEX ix_user_progress_user ON investfacil.user_progress (user_id, completed_at DESC);

CREATE TABLE investfacil.quiz_questions (
    id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    lesson_id     uuid NOT NULL REFERENCES investfacil.lessons (id),
    position      int          NOT NULL,
    question      text         NOT NULL,
    -- Alternativas [{"text": "..."}, ...]; correct_index é a posição da correta
    options       jsonb        NOT NULL,
    correct_index int          NOT NULL CONSTRAINT ck_quiz_correct CHECK (correct_index >= 0),
    created_at    timestamptz  NOT NULL DEFAULT now()
);
CREATE INDEX ix_quiz_questions_lesson ON investfacil.quiz_questions (lesson_id, position);

CREATE TABLE investfacil.quiz_attempts (
    id        uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id   uuid NOT NULL REFERENCES investfacil.users (id),
    lesson_id uuid NOT NULL REFERENCES investfacil.lessons (id),
    score     int          NOT NULL CONSTRAINT ck_quiz_score CHECK (score >= 0),
    max_score int          NOT NULL,
    taken_at  timestamptz  NOT NULL DEFAULT now()
);
CREATE INDEX ix_quiz_attempts_user ON investfacil.quiz_attempts (user_id, taken_at DESC);

CREATE TABLE investfacil.quiz_attempt_answers (
    id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    attempt_id     uuid NOT NULL REFERENCES investfacil.quiz_attempts (id),
    question_id    uuid NOT NULL REFERENCES investfacil.quiz_questions (id),
    selected_index int          NOT NULL,
    correct        boolean      NOT NULL
);
CREATE INDEX ix_quiz_answers_attempt ON investfacil.quiz_attempt_answers (attempt_id);

CREATE TABLE investfacil.xp_ledger (
    id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id    uuid NOT NULL REFERENCES investfacil.users (id),
    amount     int          NOT NULL CONSTRAINT ck_xp_amount CHECK (amount <> 0),
    reason     varchar(60)  NOT NULL,
    lesson_id  uuid REFERENCES investfacil.lessons (id),
    created_at timestamptz  NOT NULL DEFAULT now()
);
CREATE INDEX ix_xp_ledger_user ON investfacil.xp_ledger (user_id, created_at DESC);

CREATE TABLE investfacil.achievements (
    id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    code        varchar(60)  NOT NULL,
    name        varchar(120) NOT NULL,
    description varchar(300),
    xp_reward   int          NOT NULL DEFAULT 0
);
CREATE UNIQUE INDEX ux_achievements_code ON investfacil.achievements (code);

CREATE TABLE investfacil.user_achievements (
    user_id        uuid NOT NULL REFERENCES investfacil.users (id),
    achievement_id uuid NOT NULL REFERENCES investfacil.achievements (id),
    unlocked_at    timestamptz NOT NULL DEFAULT now(),
    PRIMARY KEY (user_id, achievement_id)
);
CREATE INDEX ix_user_achievements_ach ON investfacil.user_achievements (achievement_id);
