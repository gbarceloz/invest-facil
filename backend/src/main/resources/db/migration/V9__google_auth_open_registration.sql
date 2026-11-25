-- ============================================================================
-- V9 - Login social e cadastro sem confirmacao de e-mail
--
-- 1. google_sub identifica a conta Google (unique quando presente).
-- 2. Contas existentes passam a verified=true: o produto nao depende mais de
--    e-mail transacional para liberar o acesso.
-- 3. Nao altera policies/RLS existentes; a insercao de usuario Google usa o
--    mesmo fluxo REGISTER + app.auth_email da V6.
-- ============================================================================

ALTER TABLE investfacil.users
    ADD COLUMN IF NOT EXISTS google_sub varchar(255);

CREATE UNIQUE INDEX IF NOT EXISTS ux_users_google_sub
    ON investfacil.users (google_sub)
    WHERE google_sub IS NOT NULL;

UPDATE investfacil.users
   SET verified = true
 WHERE verified = false;
