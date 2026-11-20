-- ============================================================================
-- V3 — Autenticação completa (MFA, bloqueio), famílias de refresh tokens,
--      simulador persistido e URL externa de vídeo (fallback de demonstração).
-- Migrations V1/V2 são imutáveis; toda evolução nasce aqui.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1. Usuário: perfil, MFA e proteção contra força bruta
-- ---------------------------------------------------------------------------
ALTER TABLE investfacil.users
    ADD COLUMN IF NOT EXISTS avatar_url            varchar(500),
    ADD COLUMN IF NOT EXISTS mfa_enabled           boolean NOT NULL DEFAULT false,
    ADD COLUMN IF NOT EXISTS mfa_secret            varchar(255),
    ADD COLUMN IF NOT EXISTS mfa_last_counter      bigint,
    ADD COLUMN IF NOT EXISTS failed_login_attempts int NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS locked_until          timestamptz,
    ADD COLUMN IF NOT EXISTS last_login_at         timestamptz;

-- ---------------------------------------------------------------------------
-- 2. Refresh tokens: família para revogação em cascata na detecção de reuso
-- ---------------------------------------------------------------------------
ALTER TABLE investfacil.refresh_tokens
    ADD COLUMN IF NOT EXISTS family_id uuid NOT NULL DEFAULT gen_random_uuid();

CREATE INDEX IF NOT EXISTS ix_refresh_tokens_family
    ON investfacil.refresh_tokens (family_id);

-- ---------------------------------------------------------------------------
-- 3. Vídeos: URL externa opcional (fallback controlado quando o Storage não
--    está configurado; produção usa exclusivamente o bucket privado)
-- ---------------------------------------------------------------------------
ALTER TABLE investfacil.video_assets
    ADD COLUMN IF NOT EXISTS external_url varchar(500);

-- ---------------------------------------------------------------------------
-- 4. Simulador financeiro persistido (dados do próprio usuário)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS investfacil.simulations (
    id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             uuid NOT NULL REFERENCES investfacil.users (id) ON DELETE CASCADE,
    name                varchar(120) NOT NULL,
    initial_amount      numeric(15, 2) NOT NULL CHECK (initial_amount >= 0),
    monthly_contribution numeric(15, 2) NOT NULL DEFAULT 0 CHECK (monthly_contribution >= 0),
    months              int NOT NULL CHECK (months BETWEEN 1 AND 600),
    annual_rate         numeric(7, 3) NOT NULL CHECK (annual_rate >= 0 AND annual_rate <= 100),
    final_amount        numeric(15, 2) NOT NULL,
    invested_amount     numeric(15, 2) NOT NULL,
    created_at          timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS ix_simulations_user
    ON investfacil.simulations (user_id, created_at DESC);

GRANT SELECT, INSERT, UPDATE, DELETE ON investfacil.simulations TO investfacil_app;
GRANT SELECT ON investfacil.simulations TO investfacil_test_guest;

-- ---------------------------------------------------------------------------
-- 5. XP idempotente: no máximo 1 concessão por aula/motivo (anti-farm)
-- ---------------------------------------------------------------------------
CREATE UNIQUE INDEX IF NOT EXISTS ux_xp_once_per_lesson_reason
    ON investfacil.xp_ledger (user_id, lesson_id, reason)
    WHERE lesson_id IS NOT NULL AND reason IN ('LESSON_COMPLETED', 'QUIZ_PASSED');

-- ---------------------------------------------------------------------------
-- 6. RLS deny-by-default em todas as tabelas, incluindo as novas
-- ---------------------------------------------------------------------------
SELECT investfacil.apply_table_security();
