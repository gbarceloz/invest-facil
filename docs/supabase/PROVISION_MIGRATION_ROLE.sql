-- ============================================================================
-- Invest Fácil — bootstrap da identidade de migration
--
-- Execute como o owner/admin do projeto Supabase (role `postgres`), no SQL
-- Editor ou psql, ANTES do Flyway e antes de PROVISION_RUNTIME_ROLE.sql.
--
-- A senha NUNCA fica neste arquivo. No SQL Editor, execute na MESMA sessão:
--   SET app.migration_password = '<senha-forte-com-16-ou-mais-caracteres>';
-- Depois cole/execute este script. Em psql, use o mesmo SET.
--
-- Resultado:
--   investfacil_app        NOLOGIN  (role de privilégios DML)
--   investfacil_test_guest NOLOGIN  (role de teste)
--   investfacil_migrate    LOGIN INHERIT, owner do schema investfacil
--
-- A V2 ainda contém blocos CREATE ROLE condicionais; como as três roles já
-- existem, esses blocos não criam nada e o Flyway não precisa de CREATEROLE.
-- ============================================================================

DO $$
DECLARE
    pw text := current_setting('app.migration_password', true);
BEGIN
    IF pw IS NULL OR length(pw) < 16 THEN
        RAISE EXCEPTION
            'Defina app.migration_password (>=16 caracteres) na mesma sessão antes deste script.';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'investfacil_app') THEN
        EXECUTE 'CREATE ROLE investfacil_app NOLOGIN';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'investfacil_test_guest') THEN
        EXECUTE 'CREATE ROLE investfacil_test_guest NOLOGIN';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'investfacil_migrate') THEN
        EXECUTE 'CREATE ROLE investfacil_migrate LOGIN INHERIT';
    END IF;

    EXECUTE 'ALTER ROLE investfacil_migrate LOGIN INHERIT';
    EXECUTE format('ALTER ROLE investfacil_migrate PASSWORD %L', pw);
END $$;

-- O schema nasce antes do Flyway; a V1 usa CREATE SCHEMA IF NOT EXISTS e
-- encontra o schema já existente. O owner é a identidade de migration.
CREATE SCHEMA IF NOT EXISTS investfacil;
ALTER SCHEMA investfacil OWNER TO investfacil_migrate;
GRANT USAGE, CREATE ON SCHEMA investfacil TO investfacil_migrate;

DO $$
BEGIN
    EXECUTE format(
        'GRANT CONNECT ON DATABASE %I TO investfacil_migrate',
        current_database());
    EXECUTE format(
        'GRANT CREATE ON DATABASE %I TO investfacil_migrate',
        current_database());
END $$;

-- Verificação (não imprime segredo):
--   SELECT rolname, rolcanlogin, rolinherit, rolsuper, rolcreaterole, rolbypassrls
--   FROM pg_roles WHERE rolname LIKE 'investfacil%' ORDER BY rolname;
