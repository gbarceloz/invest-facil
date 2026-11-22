-- ============================================================================
-- Invest Fácil — identidade de runtime
--
-- Execute DEPOIS de PROVISION_MIGRATION_ROLE.sql, como owner/admin do projeto
-- Supabase, no SQL Editor ou psql.
--
-- A senha NUNCA fica neste arquivo. No SQL Editor, execute na MESMA sessão:
--   SET app.runtime_password = '<senha-forte-com-16-ou-mais-caracteres>';
-- Depois cole/execute este script. Em psql, use o mesmo SET.
--
-- Modelo:
--   investfacil_runtime LOGIN INHERIT
--   membro de investfacil_app
--   sem ownership, sem DDL, sem CREATEROLE, sem BYPASSRLS
--
-- INHERIT é obrigatório: a aplicação não executa SET ROLE e o Hikari pode
-- reciclar conexões. Um SET ROLE feito uma única vez não é modelo válido.
-- ============================================================================

DO $$
DECLARE
    pw text := current_setting('app.runtime_password', true);
BEGIN
    IF pw IS NULL OR length(pw) < 16 THEN
        RAISE EXCEPTION
            'Defina app.runtime_password (>=16 caracteres) na mesma sessão antes deste script.';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'investfacil_app') THEN
        RAISE EXCEPTION
            'investfacil_app não existe. Execute PROVISION_MIGRATION_ROLE.sql primeiro.';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'investfacil_runtime') THEN
        EXECUTE 'CREATE ROLE investfacil_runtime LOGIN INHERIT';
    END IF;

    -- Corrige também uma role criada anteriormente com NOINHERIT.
    EXECUTE 'ALTER ROLE investfacil_runtime LOGIN INHERIT';
    EXECUTE format('ALTER ROLE investfacil_runtime PASSWORD %L', pw);
    EXECUTE 'GRANT investfacil_app TO investfacil_runtime';
    EXECUTE format(
        'GRANT CONNECT ON DATABASE %I TO investfacil_runtime',
        current_database());
END $$;

-- Verificação (não imprime segredo):
--   SELECT r.rolname, r.rolcanlogin, r.rolinherit, r.rolsuper,
--          r.rolcreaterole, r.rolbypassrls,
--          pg_has_role('investfacil_runtime', 'investfacil_app', 'MEMBER') AS member_app
--   FROM pg_roles r WHERE r.rolname = 'investfacil_runtime';
