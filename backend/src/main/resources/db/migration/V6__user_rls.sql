-- ============================================================================
-- V6 — RLS por usuário e contexto transacional (S2.4)
--
-- Objetivo:
--   1. substituir a policy permissiva app_rw por policies específicas;
--   2. exigir contexto de identidade definido pelo backend em cada transação;
--   3. preservar conteúdo educacional global;
--   4. reduzir os privilégios DML do runtime ao mínimo usado pelo código;
--   5. impedir alteração insegura de id/role/e-mail em users.
--
-- O transporte do contexto é feito pelo backend com:
--   select set_config('app.current_user_id', <uuid>, true),
--          set_config('app.current_role', <USER|ADMIN>, true),
--          set_config('app.auth_email', <email>, true),
--          set_config('app.auth_refresh_hash', <sha256>, true),
--          set_config('app.auth_email_token_hash', <sha256>, true),
--          set_config('app.flow', <LOGIN|REGISTER|...>, true),
--          set_config('app.seed', <true|false>, true)
-- O terceiro argumento true torna o valor local à transação; commit/rollback
-- removem o contexto e o Hikari não devolve identidade residual.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1. Funções auxiliares (SECURITY INVOKER; não elevam privilégio)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION investfacil.current_user_id()
RETURNS uuid
LANGUAGE sql
STABLE
AS $$
    SELECT NULLIF(current_setting('app.current_user_id', true), '')::uuid
$$;

CREATE OR REPLACE FUNCTION investfacil.current_role_name()
RETURNS text
LANGUAGE sql
STABLE
AS $$
    SELECT NULLIF(current_setting('app.current_role', true), '')
$$;

CREATE OR REPLACE FUNCTION investfacil.auth_email()
RETURNS text
LANGUAGE sql
STABLE
AS $$
    SELECT NULLIF(current_setting('app.auth_email', true), '')
$$;

CREATE OR REPLACE FUNCTION investfacil.auth_refresh_hash()
RETURNS text
LANGUAGE sql
STABLE
AS $$
    SELECT NULLIF(current_setting('app.auth_refresh_hash', true), '')
$$;

CREATE OR REPLACE FUNCTION investfacil.auth_email_token_hash()
RETURNS text
LANGUAGE sql
STABLE
AS $$
    SELECT NULLIF(current_setting('app.auth_email_token_hash', true), '')
$$;

CREATE OR REPLACE FUNCTION investfacil.is_seed()
RETURNS boolean
LANGUAGE sql
STABLE
AS $$
    SELECT coalesce(current_setting('app.seed', true), 'false') = 'true'
$$;

CREATE OR REPLACE FUNCTION investfacil.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
AS $$
    SELECT coalesce(current_setting('app.current_role', true), '') = 'ADMIN'
       AND coalesce(current_setting('app.flow', true), '') = 'ADMIN'
$$;

-- Superuser e o role de migração são os únicos que podem alterar
-- id/role/e-mail sem passar pelos fluxos da aplicação. O runtime (membro de
-- investfacil_app) não é owner, não é superuser e não é membro de migrate.
CREATE OR REPLACE FUNCTION investfacil.is_trusted_db_role()
RETURNS boolean
LANGUAGE sql
STABLE
AS $$
    SELECT coalesce((SELECT r.rolsuper FROM pg_roles r WHERE r.rolname = current_user), false)
        OR pg_has_role(current_user, 'investfacil_migrate', 'MEMBER')
$$;

-- ---------------------------------------------------------------------------
-- 2. Remover a policy permissiva e os privilégios genéricos
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS app_rw ON investfacil.users;
DROP POLICY IF EXISTS app_rw ON investfacil.refresh_tokens;
DROP POLICY IF EXISTS app_rw ON investfacil.email_tokens;
DROP POLICY IF EXISTS app_rw ON investfacil.auth_event;
DROP POLICY IF EXISTS app_rw ON investfacil.categories;
DROP POLICY IF EXISTS app_rw ON investfacil.modules;
DROP POLICY IF EXISTS app_rw ON investfacil.lessons;
DROP POLICY IF EXISTS app_rw ON investfacil.video_assets;
DROP POLICY IF EXISTS app_rw ON investfacil.articles;
DROP POLICY IF EXISTS app_rw ON investfacil.lesson_articles;
DROP POLICY IF EXISTS app_rw ON investfacil.user_progress;
DROP POLICY IF EXISTS app_rw ON investfacil.quiz_questions;
DROP POLICY IF EXISTS app_rw ON investfacil.quiz_attempts;
DROP POLICY IF EXISTS app_rw ON investfacil.quiz_attempt_answers;
DROP POLICY IF EXISTS app_rw ON investfacil.xp_ledger;
DROP POLICY IF EXISTS app_rw ON investfacil.achievements;
DROP POLICY IF EXISTS app_rw ON investfacil.user_achievements;
DROP POLICY IF EXISTS app_rw ON investfacil.simulations;

REVOKE ALL ON ALL TABLES IN SCHEMA investfacil FROM investfacil_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA investfacil
    REVOKE SELECT, INSERT, UPDATE, DELETE ON TABLES FROM investfacil_app;

-- O runtime não deve poder reaplicar a policy antiga nem executar DDL.
REVOKE ALL ON FUNCTION investfacil.apply_table_security() FROM PUBLIC;

-- ---------------------------------------------------------------------------
-- 3. Privilégios mínimos do runtime (DML somente onde o app usa)
-- ---------------------------------------------------------------------------
GRANT SELECT, INSERT, UPDATE ON investfacil.users TO investfacil_app;
GRANT SELECT, INSERT, UPDATE ON investfacil.refresh_tokens TO investfacil_app;
GRANT SELECT, INSERT, UPDATE ON investfacil.email_tokens TO investfacil_app;
GRANT INSERT ON investfacil.auth_event TO investfacil_app;

GRANT SELECT, INSERT, UPDATE ON investfacil.categories TO investfacil_app;
GRANT SELECT, INSERT, UPDATE ON investfacil.modules TO investfacil_app;
GRANT SELECT, INSERT, UPDATE ON investfacil.lessons TO investfacil_app;
GRANT SELECT, INSERT, UPDATE ON investfacil.video_assets TO investfacil_app;
GRANT SELECT, INSERT, UPDATE ON investfacil.articles TO investfacil_app;
-- lesson_articles está órfã no código atual: sem acesso normal do runtime.
GRANT SELECT, INSERT ON investfacil.user_progress TO investfacil_app;
GRANT SELECT, INSERT, UPDATE ON investfacil.quiz_questions TO investfacil_app;
GRANT SELECT, INSERT ON investfacil.quiz_attempts TO investfacil_app;
GRANT SELECT, INSERT ON investfacil.quiz_attempt_answers TO investfacil_app;
GRANT SELECT, INSERT ON investfacil.xp_ledger TO investfacil_app;
GRANT SELECT, INSERT, UPDATE ON investfacil.achievements TO investfacil_app;
GRANT SELECT, INSERT ON investfacil.user_achievements TO investfacil_app;
GRANT SELECT, INSERT, DELETE ON investfacil.simulations TO investfacil_app;

-- ---------------------------------------------------------------------------
-- 4. Policies privadas por proprietário
-- ---------------------------------------------------------------------------
-- users: auto-leitura, leitura pelo e-mail do fluxo, cadastro e auto-update.
CREATE POLICY s24_users_self_select ON investfacil.users
    FOR SELECT TO investfacil_app
    USING (id = investfacil.current_user_id());

CREATE POLICY s24_users_auth_email_select ON investfacil.users
    FOR SELECT TO investfacil_app
    USING (lower(email) = lower(investfacil.auth_email()));

CREATE POLICY s24_users_register_insert ON investfacil.users
    FOR INSERT TO investfacil_app
    WITH CHECK (
        (role = 'USER'
         AND lower(email) = lower(investfacil.auth_email())
         AND coalesce(current_setting('app.flow', true), '') = 'REGISTER')
        OR investfacil.is_seed()
    );

CREATE POLICY s24_users_self_update ON investfacil.users
    FOR UPDATE TO investfacil_app
    USING (id = investfacil.current_user_id())
    WITH CHECK (id = investfacil.current_user_id());

CREATE POLICY s24_users_seed_update ON investfacil.users
    FOR UPDATE TO investfacil_app
    USING (investfacil.is_seed())
    WITH CHECK (investfacil.is_seed());

-- refresh_tokens: dono ou hash do token apresentado no fluxo de refresh/logout.
CREATE POLICY s24_refresh_owner_select ON investfacil.refresh_tokens
    FOR SELECT TO investfacil_app
    USING (user_id = investfacil.current_user_id());

CREATE POLICY s24_refresh_hash_select ON investfacil.refresh_tokens
    FOR SELECT TO investfacil_app
    USING (token_hash = investfacil.auth_refresh_hash());

-- SELECT ... FOR UPDATE no fluxo de refresh/logout precisa da policy de UPDATE;
-- o WITH CHECK exige que o dono já tenha sido descoberto e vinculado.
CREATE POLICY s24_refresh_hash_update ON investfacil.refresh_tokens
    FOR UPDATE TO investfacil_app
    USING (token_hash = investfacil.auth_refresh_hash())
    WITH CHECK (user_id = investfacil.current_user_id());

CREATE POLICY s24_refresh_owner_insert ON investfacil.refresh_tokens
    FOR INSERT TO investfacil_app
    WITH CHECK (user_id = investfacil.current_user_id());

CREATE POLICY s24_refresh_owner_update ON investfacil.refresh_tokens
    FOR UPDATE TO investfacil_app
    USING (user_id = investfacil.current_user_id())
    WITH CHECK (user_id = investfacil.current_user_id());

-- email_tokens: dono ou hash do link de verificação/reset.
CREATE POLICY s24_email_owner_select ON investfacil.email_tokens
    FOR SELECT TO investfacil_app
    USING (user_id = investfacil.current_user_id());

CREATE POLICY s24_email_hash_select ON investfacil.email_tokens
    FOR SELECT TO investfacil_app
    USING (token_hash = investfacil.auth_email_token_hash());

CREATE POLICY s24_email_hash_update ON investfacil.email_tokens
    FOR UPDATE TO investfacil_app
    USING (token_hash = investfacil.auth_email_token_hash())
    WITH CHECK (user_id = investfacil.current_user_id());

CREATE POLICY s24_email_owner_insert ON investfacil.email_tokens
    FOR INSERT TO investfacil_app
    WITH CHECK (user_id = investfacil.current_user_id());

CREATE POLICY s24_email_owner_update ON investfacil.email_tokens
    FOR UPDATE TO investfacil_app
    USING (user_id = investfacil.current_user_id())
    WITH CHECK (user_id = investfacil.current_user_id());

-- auth_event: append-only; falha de login sem usuário usa user_id NULL.
CREATE POLICY s24_auth_event_insert ON investfacil.auth_event
    FOR INSERT TO investfacil_app
    WITH CHECK (user_id IS NULL OR user_id = investfacil.current_user_id());

-- Progresso/quiz/XP/conquistas: SELECT/INSERT do próprio usuário; sem UPDATE/DELETE.
CREATE POLICY s24_progress_select ON investfacil.user_progress
    FOR SELECT TO investfacil_app
    USING (user_id = investfacil.current_user_id());

CREATE POLICY s24_progress_insert ON investfacil.user_progress
    FOR INSERT TO investfacil_app
    WITH CHECK (user_id = investfacil.current_user_id());

CREATE POLICY s24_quiz_attempts_select ON investfacil.quiz_attempts
    FOR SELECT TO investfacil_app
    USING (user_id = investfacil.current_user_id());

CREATE POLICY s24_quiz_attempts_insert ON investfacil.quiz_attempts
    FOR INSERT TO investfacil_app
    WITH CHECK (user_id = investfacil.current_user_id());

CREATE POLICY s24_quiz_answers_select ON investfacil.quiz_attempt_answers
    FOR SELECT TO investfacil_app
    USING (EXISTS (
        SELECT 1 FROM investfacil.quiz_attempts a
        WHERE a.id = attempt_id
          AND a.user_id = investfacil.current_user_id()
    ));

CREATE POLICY s24_quiz_answers_insert ON investfacil.quiz_attempt_answers
    FOR INSERT TO investfacil_app
    WITH CHECK (EXISTS (
        SELECT 1 FROM investfacil.quiz_attempts a
        WHERE a.id = attempt_id
          AND a.user_id = investfacil.current_user_id()
    ));

CREATE POLICY s24_xp_select ON investfacil.xp_ledger
    FOR SELECT TO investfacil_app
    USING (user_id = investfacil.current_user_id());

CREATE POLICY s24_xp_insert ON investfacil.xp_ledger
    FOR INSERT TO investfacil_app
    WITH CHECK (user_id = investfacil.current_user_id());

CREATE POLICY s24_user_achievements_select ON investfacil.user_achievements
    FOR SELECT TO investfacil_app
    USING (user_id = investfacil.current_user_id());

CREATE POLICY s24_user_achievements_insert ON investfacil.user_achievements
    FOR INSERT TO investfacil_app
    WITH CHECK (user_id = investfacil.current_user_id());

-- simulations: dono lê, cria e exclui; não há UPDATE no código atual.
CREATE POLICY s24_simulations_select ON investfacil.simulations
    FOR SELECT TO investfacil_app
    USING (user_id = investfacil.current_user_id());

CREATE POLICY s24_simulations_insert ON investfacil.simulations
    FOR INSERT TO investfacil_app
    WITH CHECK (user_id = investfacil.current_user_id());

CREATE POLICY s24_simulations_delete ON investfacil.simulations
    FOR DELETE TO investfacil_app
    USING (user_id = investfacil.current_user_id());

-- ---------------------------------------------------------------------------
-- 5. Conteúdo educacional global
-- ---------------------------------------------------------------------------
-- categories/modules: leitura pública; escrita somente no seed.
CREATE POLICY s24_categories_select ON investfacil.categories
    FOR SELECT TO investfacil_app USING (true);
CREATE POLICY s24_categories_seed_insert ON investfacil.categories
    FOR INSERT TO investfacil_app WITH CHECK (investfacil.is_seed());
CREATE POLICY s24_categories_seed_update ON investfacil.categories
    FOR UPDATE TO investfacil_app
    USING (investfacil.is_seed()) WITH CHECK (investfacil.is_seed());

CREATE POLICY s24_modules_select ON investfacil.modules
    FOR SELECT TO investfacil_app USING (true);
CREATE POLICY s24_modules_seed_insert ON investfacil.modules
    FOR INSERT TO investfacil_app WITH CHECK (investfacil.is_seed());
CREATE POLICY s24_modules_seed_update ON investfacil.modules
    FOR UPDATE TO investfacil_app
    USING (investfacil.is_seed()) WITH CHECK (investfacil.is_seed());

-- lessons/articles: normal vê publicado; seed/admin veem tudo.
CREATE POLICY s24_lessons_select ON investfacil.lessons
    FOR SELECT TO investfacil_app
    USING (published OR investfacil.is_seed() OR investfacil.is_admin());
CREATE POLICY s24_lessons_seed_insert ON investfacil.lessons
    FOR INSERT TO investfacil_app WITH CHECK (investfacil.is_seed());
CREATE POLICY s24_lessons_seed_update ON investfacil.lessons
    FOR UPDATE TO investfacil_app
    USING (investfacil.is_seed()) WITH CHECK (investfacil.is_seed());

CREATE POLICY s24_articles_select ON investfacil.articles
    FOR SELECT TO investfacil_app
    USING (published OR investfacil.is_seed() OR investfacil.is_admin());
CREATE POLICY s24_articles_seed_insert ON investfacil.articles
    FOR INSERT TO investfacil_app WITH CHECK (investfacil.is_seed());
CREATE POLICY s24_articles_seed_update ON investfacil.articles
    FOR UPDATE TO investfacil_app
    USING (investfacil.is_seed()) WITH CHECK (investfacil.is_seed());

-- video_assets: normal vê PUBLISHED; ADMIN vê tudo e faz upload/update.
CREATE POLICY s24_video_select ON investfacil.video_assets
    FOR SELECT TO investfacil_app
    USING (status = 'PUBLISHED' OR investfacil.is_admin());
CREATE POLICY s24_video_admin_insert ON investfacil.video_assets
    FOR INSERT TO investfacil_app WITH CHECK (investfacil.is_admin());
CREATE POLICY s24_video_admin_update ON investfacil.video_assets
    FOR UPDATE TO investfacil_app
    USING (investfacil.is_admin()) WITH CHECK (investfacil.is_admin());

-- quiz_questions/achievements: catálogo global; escrita somente no seed.
CREATE POLICY s24_quiz_questions_select ON investfacil.quiz_questions
    FOR SELECT TO investfacil_app USING (true);
CREATE POLICY s24_quiz_questions_seed_insert ON investfacil.quiz_questions
    FOR INSERT TO investfacil_app WITH CHECK (investfacil.is_seed());
CREATE POLICY s24_quiz_questions_seed_update ON investfacil.quiz_questions
    FOR UPDATE TO investfacil_app
    USING (investfacil.is_seed()) WITH CHECK (investfacil.is_seed());

CREATE POLICY s24_achievements_select ON investfacil.achievements
    FOR SELECT TO investfacil_app USING (true);
CREATE POLICY s24_achievements_seed_insert ON investfacil.achievements
    FOR INSERT TO investfacil_app WITH CHECK (investfacil.is_seed());
CREATE POLICY s24_achievements_seed_update ON investfacil.achievements
    FOR UPDATE TO investfacil_app
    USING (investfacil.is_seed()) WITH CHECK (investfacil.is_seed());

-- lesson_articles: sem acesso do runtime; políticas de migração abaixo.

-- ---------------------------------------------------------------------------
-- 6. Política do owner/migração (FORCE RLS também vale para o owner)
-- ---------------------------------------------------------------------------
CREATE POLICY s24_migration_all ON investfacil.users
    FOR ALL TO investfacil_migrate USING (true) WITH CHECK (true);
CREATE POLICY s24_migration_all ON investfacil.refresh_tokens
    FOR ALL TO investfacil_migrate USING (true) WITH CHECK (true);
CREATE POLICY s24_migration_all ON investfacil.email_tokens
    FOR ALL TO investfacil_migrate USING (true) WITH CHECK (true);
CREATE POLICY s24_migration_all ON investfacil.auth_event
    FOR ALL TO investfacil_migrate USING (true) WITH CHECK (true);
CREATE POLICY s24_migration_all ON investfacil.categories
    FOR ALL TO investfacil_migrate USING (true) WITH CHECK (true);
CREATE POLICY s24_migration_all ON investfacil.modules
    FOR ALL TO investfacil_migrate USING (true) WITH CHECK (true);
CREATE POLICY s24_migration_all ON investfacil.lessons
    FOR ALL TO investfacil_migrate USING (true) WITH CHECK (true);
CREATE POLICY s24_migration_all ON investfacil.video_assets
    FOR ALL TO investfacil_migrate USING (true) WITH CHECK (true);
CREATE POLICY s24_migration_all ON investfacil.articles
    FOR ALL TO investfacil_migrate USING (true) WITH CHECK (true);
CREATE POLICY s24_migration_all ON investfacil.lesson_articles
    FOR ALL TO investfacil_migrate USING (true) WITH CHECK (true);
CREATE POLICY s24_migration_all ON investfacil.user_progress
    FOR ALL TO investfacil_migrate USING (true) WITH CHECK (true);
CREATE POLICY s24_migration_all ON investfacil.quiz_questions
    FOR ALL TO investfacil_migrate USING (true) WITH CHECK (true);
CREATE POLICY s24_migration_all ON investfacil.quiz_attempts
    FOR ALL TO investfacil_migrate USING (true) WITH CHECK (true);
CREATE POLICY s24_migration_all ON investfacil.quiz_attempt_answers
    FOR ALL TO investfacil_migrate USING (true) WITH CHECK (true);
CREATE POLICY s24_migration_all ON investfacil.xp_ledger
    FOR ALL TO investfacil_migrate USING (true) WITH CHECK (true);
CREATE POLICY s24_migration_all ON investfacil.achievements
    FOR ALL TO investfacil_migrate USING (true) WITH CHECK (true);
CREATE POLICY s24_migration_all ON investfacil.user_achievements
    FOR ALL TO investfacil_migrate USING (true) WITH CHECK (true);
CREATE POLICY s24_migration_all ON investfacil.simulations
    FOR ALL TO investfacil_migrate USING (true) WITH CHECK (true);

-- ---------------------------------------------------------------------------
-- 7. FORCE RLS nas 18 tabelas de aplicação (flyway_schema_history fica fora)
-- ---------------------------------------------------------------------------
ALTER TABLE investfacil.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE investfacil.users FORCE ROW LEVEL SECURITY;
ALTER TABLE investfacil.refresh_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE investfacil.refresh_tokens FORCE ROW LEVEL SECURITY;
ALTER TABLE investfacil.email_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE investfacil.email_tokens FORCE ROW LEVEL SECURITY;
ALTER TABLE investfacil.auth_event ENABLE ROW LEVEL SECURITY;
ALTER TABLE investfacil.auth_event FORCE ROW LEVEL SECURITY;
ALTER TABLE investfacil.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE investfacil.categories FORCE ROW LEVEL SECURITY;
ALTER TABLE investfacil.modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE investfacil.modules FORCE ROW LEVEL SECURITY;
ALTER TABLE investfacil.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE investfacil.lessons FORCE ROW LEVEL SECURITY;
ALTER TABLE investfacil.video_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE investfacil.video_assets FORCE ROW LEVEL SECURITY;
ALTER TABLE investfacil.articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE investfacil.articles FORCE ROW LEVEL SECURITY;
ALTER TABLE investfacil.lesson_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE investfacil.lesson_articles FORCE ROW LEVEL SECURITY;
ALTER TABLE investfacil.user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE investfacil.user_progress FORCE ROW LEVEL SECURITY;
ALTER TABLE investfacil.quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE investfacil.quiz_questions FORCE ROW LEVEL SECURITY;
ALTER TABLE investfacil.quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE investfacil.quiz_attempts FORCE ROW LEVEL SECURITY;
ALTER TABLE investfacil.quiz_attempt_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE investfacil.quiz_attempt_answers FORCE ROW LEVEL SECURITY;
ALTER TABLE investfacil.xp_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE investfacil.xp_ledger FORCE ROW LEVEL SECURITY;
ALTER TABLE investfacil.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE investfacil.achievements FORCE ROW LEVEL SECURITY;
ALTER TABLE investfacil.user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE investfacil.user_achievements FORCE ROW LEVEL SECURITY;
ALTER TABLE investfacil.simulations ENABLE ROW LEVEL SECURITY;
ALTER TABLE investfacil.simulations FORCE ROW LEVEL SECURITY;

-- ---------------------------------------------------------------------------
-- 8. Guarda de identidade em users
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION investfacil.s24_users_guard()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
    -- Superuser e o owner/migração são confiáveis para DDL/seed operacional.
    IF investfacil.is_trusted_db_role() THEN
        RETURN NEW;
    END IF;

    IF TG_OP = 'INSERT' THEN
        IF coalesce(NEW.role, '') <> 'USER' THEN
            RAISE EXCEPTION 'users.role só pode ser USER no fluxo de runtime'
                USING ERRCODE = '42501';
        END IF;
        IF NOT investfacil.is_seed()
           AND lower(NEW.email) <> lower(coalesce(investfacil.auth_email(), '')) THEN
            RAISE EXCEPTION 'users.email não corresponde ao e-mail do cadastro'
                USING ERRCODE = '42501';
        END IF;
    ELSIF TG_OP = 'UPDATE' THEN
        IF NEW.id <> OLD.id THEN
            RAISE EXCEPTION 'users.id é imutável' USING ERRCODE = '42501';
        END IF;
        IF coalesce(NEW.role, '') <> coalesce(OLD.role, '') THEN
            RAISE EXCEPTION 'users.role só pode ser alterado pela migração'
                USING ERRCODE = '42501';
        END IF;
        IF lower(NEW.email) <> lower(OLD.email) THEN
            RAISE EXCEPTION 'users.email não pode ser alterado neste fluxo'
                USING ERRCODE = '42501';
        END IF;
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS s24_users_guard ON investfacil.users;
CREATE TRIGGER s24_users_guard
    BEFORE INSERT OR UPDATE ON investfacil.users
    FOR EACH ROW EXECUTE FUNCTION investfacil.s24_users_guard();
