-- ============================================================================
-- V5 — Append-only real para auditoria e XP.
-- A V2 concedia UPDATE/DELETE genéricos ao papel da aplicação; para os ledgers
-- de segurança (auth_event, xp_ledger, user_achievements) o runtime só precisa
-- de INSERT/SELECT. Revogar o resto torna a promessa "append-only" verificável.
-- ============================================================================

REVOKE UPDATE, DELETE ON investfacil.auth_event FROM investfacil_app;
REVOKE UPDATE, DELETE ON investfacil.xp_ledger FROM investfacil_app;
REVOKE UPDATE, DELETE ON investfacil.user_achievements FROM investfacil_app;

-- O histórico de migrations também não é dado de aplicação.
REVOKE ALL ON investfacil.flyway_schema_history FROM investfacil_app;
