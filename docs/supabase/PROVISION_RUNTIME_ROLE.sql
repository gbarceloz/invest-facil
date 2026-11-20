-- ============================================================================
-- Provisionamento do LOGIN de runtime (execute no Supabase, fora do repositório)
--
-- A senha NUNCA deve ser versionada. Use uma variável psql ou o painel:
--   \set runtime_password 'cole-a-senha-forte-aqui'
--
-- O papel de grupo investfacil_app é criado pela migration V2.
-- Flyway deve rodar com o owner/postgres (ou um LOGIN membro de investfacil_migrate).
-- Para o pooler do Supabase, use a conexão direta (porta 5432) nas migrations.
-- ============================================================================

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'investfacil_runtime') THEN
        CREATE ROLE investfacil_runtime LOGIN NOINHERIT;
    END IF;
END $$;

ALTER ROLE investfacil_runtime PASSWORD :'runtime_password';
GRANT investfacil_app TO investfacil_runtime;

-- Verificação: o runtime deve conseguir DML e NÃO conseguir DDL.
-- (Execute conectado como investfacil_runtime.)
--   select count(*) from investfacil.users;
--   create table investfacil.teste_proibido (id int); -- deve falhar
