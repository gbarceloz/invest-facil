-- ============================================================================
-- V11 - Onboarding conversacional
--
-- Perfil financeiro e de aprendizado do usuario. Dados financeiros ficam
-- apenas nesta tabela; nunca sao enviados para logs.
-- ============================================================================

CREATE TABLE IF NOT EXISTS investfacil.onboarding_profiles (
    user_id                  uuid PRIMARY KEY REFERENCES investfacil.users (id) ON DELETE CASCADE,
    goal                     varchar(40) NOT NULL,
    financial_situation      varchar(40) NOT NULL,
    income_cents             bigint,
    savings_capacity_cents   bigint,
    essential_expenses_cents bigint,
    emergency_reserve        varchar(30) NOT NULL,
    high_interest_debt       varchar(30) NOT NULL,
    learning_preference      varchar(30) NOT NULL,
    knowledge_level          varchar(30) NOT NULL,
    spending_triggers        jsonb NOT NULL DEFAULT '[]'::jsonb,
    study_days               jsonb NOT NULL DEFAULT '[]'::jsonb,
    study_time               varchar(5) NOT NULL,
    monthly_savings_goal_cents bigint,
    emergency_fund_goal_cents  bigint,
    health_score             int,
    health_band              varchar(30),
    opportunity              varchar(40),
    recommendation           text,
    completed_at             timestamptz NOT NULL DEFAULT now(),
    created_at               timestamptz NOT NULL DEFAULT now(),
    updated_at               timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT ck_onboarding_income CHECK (income_cents IS NULL OR income_cents >= 0),
    CONSTRAINT ck_onboarding_savings CHECK (savings_capacity_cents IS NULL OR savings_capacity_cents >= 0),
    CONSTRAINT ck_onboarding_expenses CHECK (essential_expenses_cents IS NULL OR essential_expenses_cents >= 0),
    CONSTRAINT ck_onboarding_goal CHECK (goal IN ('DEBT', 'INVEST', 'MULTIPLY', 'ORGANIZE', 'WEALTH')),
    CONSTRAINT ck_onboarding_situation CHECK (financial_situation IN ('IN_DEBT', 'FROM_ZERO', 'CAN_SAVE', 'INVESTOR')),
    CONSTRAINT ck_onboarding_reserve CHECK (emergency_reserve IN ('NONE', 'LESS_THAN_1', 'ONE_TO_3', 'THREE_TO_6', 'MORE_THAN_6', 'PREFER_NOT')),
    CONSTRAINT ck_onboarding_debt CHECK (high_interest_debt IN ('NONE', 'CREDIT_CARD', 'OVERDRAFT', 'LOANS', 'MULTIPLE', 'PREFER_NOT')),
    CONSTRAINT ck_onboarding_learning CHECK (learning_preference IN ('VIDEOS', 'TEXTS', 'PRACTICE', 'MIX')),
    CONSTRAINT ck_onboarding_knowledge CHECK (knowledge_level IN ('ZERO', 'BASIC', 'INTERMEDIATE', 'ADVANCED')),
    CONSTRAINT ck_onboarding_time CHECK (study_time ~ '^([01][0-9]|2[0-3]):[0-5][0-9]$'),
    CONSTRAINT ck_onboarding_triggers_array CHECK (jsonb_typeof(spending_triggers) = 'array'),
    CONSTRAINT ck_onboarding_days_array CHECK (jsonb_typeof(study_days) = 'array'),
    CONSTRAINT ck_onboarding_score CHECK (health_score IS NULL OR (health_score >= 0 AND health_score <= 100))
);

CREATE INDEX IF NOT EXISTS ix_onboarding_completed
    ON investfacil.onboarding_profiles (completed_at DESC);

GRANT SELECT, INSERT, UPDATE ON investfacil.onboarding_profiles TO investfacil_app;

ALTER TABLE investfacil.onboarding_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE investfacil.onboarding_profiles FORCE ROW LEVEL SECURITY;

CREATE POLICY onb_profile_select ON investfacil.onboarding_profiles
    FOR SELECT TO investfacil_app
    USING (user_id = investfacil.current_user_id());

CREATE POLICY onb_profile_insert ON investfacil.onboarding_profiles
    FOR INSERT TO investfacil_app
    WITH CHECK (user_id = investfacil.current_user_id());

CREATE POLICY onb_profile_update ON investfacil.onboarding_profiles
    FOR UPDATE TO investfacil_app
    USING (user_id = investfacil.current_user_id())
    WITH CHECK (user_id = investfacil.current_user_id());

CREATE POLICY onb_profile_migration_all ON investfacil.onboarding_profiles
    FOR ALL TO investfacil_migrate USING (true) WITH CHECK (true);
