-- ============================================================================
-- V2 — Modelo de segurança do PostgreSQL (schema investfacil)
--
-- Camadas:
--   1. PostgREST: schema investfacil NÃO exposto (REVOKE de anon/authenticated
--      e de PUBLIC) — o único caminho de acesso aos dados é o backend Java.
--   2. Privilégio mínimo: investfacil_app (DML, sem DDL) vs
--      investfacil_migrate (DDL, usado somente pelo Flyway).
--   3. RLS ativada em TODAS as tabelas, NEGADA por padrão: nenhuma policy
--      permissiva genérica — somente investfacil_app tem policy.
--      Papéis sem policy enxergam ZERO linhas (mesmo com GRANT SELECT).
--   4. Auditoria: password reset/rotina de papéis fora das migrations —
--      senhas NUNCA em arquivos versionados.
--
-- Observação Supabase: as migrations rodam como o usuário postgres (owner).
-- O papel de runtime é um LOGIN sem herança, membro de investfacil_app:
--   CREATE ROLE investfacil_runtime LOGIN PASSWORD '<env>' NOINHERIT;
--   GRANT investfacil_app TO investfacil_runtime;
-- (executar manualmente/por provisionamento — jamais em arquivo versionado)
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1. Papéis de grupo (NOLOGIN): não possuem senha — evita segredos em migrations
-- ---------------------------------------------------------------------------
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'investfacil_app') THEN
        CREATE ROLE investfacil_app NOLOGIN;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'investfacil_migrate') THEN
        CREATE ROLE investfacil_migrate NOLOGIN;
    END IF;
    -- Papel de teste: recebe GRANT SELECT de propósito, para PROVAR que a
    -- negação vem da RLS (0 linhas) e não da falta de privilégio.
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'investfacil_test_guest') THEN
        CREATE ROLE investfacil_test_guest NOLOGIN;
    END IF;
END $$;

-- ---------------------------------------------------------------------------
-- 2. PostgREST/uso público: negado no schema do app
-- ---------------------------------------------------------------------------
REVOKE ALL ON SCHEMA investfacil FROM PUBLIC;

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon') THEN
        EXECUTE 'REVOKE ALL ON SCHEMA investfacil FROM anon';
    END IF;
    IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') THEN
        EXECUTE 'REVOKE ALL ON SCHEMA investfacil FROM authenticated';
    END IF;
END $$;

-- ---------------------------------------------------------------------------
-- 3. Privilégios do papel de aplicação (DML, sem DDL)
-- ---------------------------------------------------------------------------
GRANT USAGE ON SCHEMA investfacil TO investfacil_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA investfacil TO investfacil_app;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA investfacil TO investfacil_app;
-- Tabelas criadas por migrations futuras (executadas pelo mesmo papel do Flyway)
-- já nascem com os privilégios do app:
ALTER DEFAULT PRIVILEGES IN SCHEMA investfacil
    GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO investfacil_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA investfacil
    GRANT USAGE ON SEQUENCES TO investfacil_app;

-- Papel de teste: SELECT concedido de propósito (validação da RLS abaixo)
GRANT USAGE ON SCHEMA investfacil TO investfacil_test_guest;
GRANT SELECT ON ALL TABLES IN SCHEMA investfacil TO investfacil_test_guest;
ALTER DEFAULT PRIVILEGES IN SCHEMA investfacil
    GRANT SELECT ON TABLES TO investfacil_test_guest;

-- Papel de migração (DDL), quando o Flyway usar SPRING_FLYWAY_USER dedicado
GRANT USAGE, CREATE ON SCHEMA investfacil TO investfacil_migrate;

-- ---------------------------------------------------------------------------
-- 4. RLS: negada por padrão + policy exclusiva do papel de aplicação
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION investfacil.apply_table_security()
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
    t text;
BEGIN
    -- flyway_schema_history é excluído: é tabela interna do Flyway, não é dado
    -- de aplicação. ALTERar a tabela de histórico DURANTE a migration causa
    -- deadlock com a conexão de lock do Flyway (comprovado em teste).
    FOR t IN SELECT tablename FROM pg_tables
             WHERE schemaname = 'investfacil'
               AND tablename <> 'flyway_schema_history'
    LOOP
        EXECUTE format('ALTER TABLE investfacil.%I ENABLE ROW LEVEL SECURITY', t);
        EXECUTE format('DROP POLICY IF EXISTS app_rw ON investfacil.%I', t);
        EXECUTE format(
            'CREATE POLICY app_rw ON investfacil.%I FOR ALL TO investfacil_app USING (true) WITH CHECK (true)',
            t);
    END LOOP;
END $$;

SELECT investfacil.apply_table_security();

-- A tabela de histórico do Flyway recebeu GRANTs genéricos acima (ON ALL TABLES).
-- Privilégio mínimo: nenhum papel de runtime acessa o histórico de migrations.
-- (Condicional: sob o Flyway a tabela sempre existe; fora dele, nem sempre.)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_tables
               WHERE schemaname = 'investfacil'
                 AND tablename = 'flyway_schema_history') THEN
        REVOKE ALL ON investfacil.flyway_schema_history FROM investfacil_app;
        REVOKE ALL ON investfacil.flyway_schema_history FROM investfacil_test_guest;
    END IF;
END $$;
