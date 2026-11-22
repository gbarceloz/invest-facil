-- ============================================================================
-- V7 — Database function hardening, least privilege and RLS initplan
--
-- S2.8 — LOCAL ONLY.
-- Esta migration NÃO foi aplicada no Supabase Lab nesta etapa.
--
-- Findings tratados:
--   1. nove funções do schema investfacil com search_path mutável;
--   2. EXECUTE para PUBLIC em nove funções;
--   3. policy s24_users_register_insert com current_setting direto no filtro
--      (auth_rls_initplan);
--   4. remoção da função legada apply_table_security(), que recriava app_rw.
--
-- Não altera lógica de negócio, ownership, RLS ou o número de policies.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1. search_path fixo e vazio
--
-- Todas as referências dos corpos abaixo são:
--   - funções internas de pg_catalog (current_setting, coalesce, lower,
--     pg_has_role) ou
--   - objetos explicitamente qualificados com investfacil.
--
-- O caminho vazio segue a recomendação do Supabase Advisor e impede que um
-- schema controlado pelo usuário sombreie pg_catalog ou investfacil.
--
-- apply_table_security() não recebe search_path porque é removida na seção 3.
-- ---------------------------------------------------------------------------
ALTER FUNCTION investfacil.current_user_id() SET search_path = '';
ALTER FUNCTION investfacil.current_role_name() SET search_path = '';
ALTER FUNCTION investfacil.auth_email() SET search_path = '';
ALTER FUNCTION investfacil.auth_refresh_hash() SET search_path = '';
ALTER FUNCTION investfacil.auth_email_token_hash() SET search_path = '';
ALTER FUNCTION investfacil.is_seed() SET search_path = '';
ALTER FUNCTION investfacil.is_admin() SET search_path = '';
ALTER FUNCTION investfacil.is_trusted_db_role() SET search_path = '';
ALTER FUNCTION investfacil.s24_users_guard() SET search_path = '';

-- ---------------------------------------------------------------------------
-- 2. EXECUTE mínimo
--
-- PUBLIC nunca executa estas funções. O runtime herda investfacil_app.
-- A trigger é executada no contexto do runtime; por isso o papel de aplicação
-- recebe EXECUTE nela e nos helpers chamados pelo trigger.
-- ---------------------------------------------------------------------------
REVOKE ALL ON FUNCTION investfacil.current_user_id() FROM PUBLIC;
REVOKE ALL ON FUNCTION investfacil.current_role_name() FROM PUBLIC;
REVOKE ALL ON FUNCTION investfacil.auth_email() FROM PUBLIC;
REVOKE ALL ON FUNCTION investfacil.auth_refresh_hash() FROM PUBLIC;
REVOKE ALL ON FUNCTION investfacil.auth_email_token_hash() FROM PUBLIC;
REVOKE ALL ON FUNCTION investfacil.is_seed() FROM PUBLIC;
REVOKE ALL ON FUNCTION investfacil.is_admin() FROM PUBLIC;
REVOKE ALL ON FUNCTION investfacil.is_trusted_db_role() FROM PUBLIC;
REVOKE ALL ON FUNCTION investfacil.s24_users_guard() FROM PUBLIC;

GRANT EXECUTE ON FUNCTION investfacil.current_user_id() TO investfacil_app;
GRANT EXECUTE ON FUNCTION investfacil.current_role_name() TO investfacil_app;
GRANT EXECUTE ON FUNCTION investfacil.auth_email() TO investfacil_app;
GRANT EXECUTE ON FUNCTION investfacil.auth_refresh_hash() TO investfacil_app;
GRANT EXECUTE ON FUNCTION investfacil.auth_email_token_hash() TO investfacil_app;
GRANT EXECUTE ON FUNCTION investfacil.is_seed() TO investfacil_app;
GRANT EXECUTE ON FUNCTION investfacil.is_admin() TO investfacil_app;
GRANT EXECUTE ON FUNCTION investfacil.is_trusted_db_role() TO investfacil_app;
GRANT EXECUTE ON FUNCTION investfacil.s24_users_guard() TO investfacil_app;

-- O owner/migração precisa executar os helpers durante seed, migrações e
-- verificações de integridade. O owner já tem privilégio implícito, mas o
-- grant explícito deixa a intenção auditável.
GRANT EXECUTE ON FUNCTION investfacil.current_user_id() TO investfacil_migrate;
GRANT EXECUTE ON FUNCTION investfacil.current_role_name() TO investfacil_migrate;
GRANT EXECUTE ON FUNCTION investfacil.auth_email() TO investfacil_migrate;
GRANT EXECUTE ON FUNCTION investfacil.auth_refresh_hash() TO investfacil_migrate;
GRANT EXECUTE ON FUNCTION investfacil.auth_email_token_hash() TO investfacil_migrate;
GRANT EXECUTE ON FUNCTION investfacil.is_seed() TO investfacil_migrate;
GRANT EXECUTE ON FUNCTION investfacil.is_admin() TO investfacil_migrate;
GRANT EXECUTE ON FUNCTION investfacil.is_trusted_db_role() TO investfacil_migrate;
GRANT EXECUTE ON FUNCTION investfacil.s24_users_guard() TO investfacil_migrate;

-- Funções futuras criadas por investfacil_migrate não nascem executáveis por
-- PUBLIC. Grants explícitos continuam necessários para cada nova função.
ALTER DEFAULT PRIVILEGES FOR ROLE investfacil_migrate IN SCHEMA investfacil
    REVOKE EXECUTE ON FUNCTIONS FROM PUBLIC;

-- ---------------------------------------------------------------------------
-- 3. Remoção da função legada
--
-- apply_table_security() era usada por V2/V3 para criar a policy permissiva
-- app_rw. A V6 substituiu essas policies por 68 policies específicas. Manter a
-- função executável — mesmo só por migrate — permitiria desfazer o isolamento
-- por um acidente operacional.
--
-- Não há trigger, policy, default privilege, Java ou migration posterior que
-- dependa da função. V2/V3 já executaram antes da V7. DROP sem CASCADE garante
-- que qualquer dependência inesperada faça a migration falhar em vez de ser
-- removida silenciosamente.
-- ---------------------------------------------------------------------------
DROP FUNCTION IF EXISTS investfacil.apply_table_security();

-- ---------------------------------------------------------------------------
-- 4. auth_rls_initplan
--
-- A chamada direta a current_setting no filtro da policy é substituída por
-- uma subquery escalar. A semântica é idêntica:
--   - contexto ausente -> '' -> não é REGISTER;
--   - contexto inválido -> não é REGISTER;
--   - REGISTER + e-mail do contexto + role USER -> permitido;
--   - seed continua permitido pela exceção is_seed().
--
-- As demais policies e a separação OR entre ownership/hash são preservadas.
-- ---------------------------------------------------------------------------
ALTER POLICY s24_users_register_insert ON investfacil.users
    WITH CHECK (
        (role = 'USER'
         AND lower(email) = lower(investfacil.auth_email())
         AND coalesce((SELECT current_setting('app.flow', true)), '') = 'REGISTER')
        OR investfacil.is_seed()
    );
