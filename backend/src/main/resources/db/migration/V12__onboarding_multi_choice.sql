-- ============================================================================
-- V12 - Onboarding com multipla escolha de objetivo e situacao
--
-- Mantem as colunas singulares (primeira escolha) para compatibilidade e
-- adiciona as listas completas em jsonb. Nao altera RLS nem grants: as
-- colunas novas usam os mesmos privilegios de tabela ja concedidos.
-- ============================================================================

ALTER TABLE investfacil.onboarding_profiles
    ADD COLUMN IF NOT EXISTS goals jsonb NOT NULL DEFAULT '[]'::jsonb,
    ADD COLUMN IF NOT EXISTS financial_situations jsonb NOT NULL DEFAULT '[]'::jsonb;

UPDATE investfacil.onboarding_profiles
   SET goals = jsonb_build_array(goal)
 WHERE jsonb_array_length(goals) = 0;

UPDATE investfacil.onboarding_profiles
   SET financial_situations = jsonb_build_array(financial_situation)
 WHERE jsonb_array_length(financial_situations) = 0;

ALTER TABLE investfacil.onboarding_profiles
    ADD CONSTRAINT ck_onboarding_goals_array
    CHECK (jsonb_typeof(goals) = 'array' AND jsonb_array_length(goals) >= 1);

ALTER TABLE investfacil.onboarding_profiles
    ADD CONSTRAINT ck_onboarding_situations_array
    CHECK (jsonb_typeof(financial_situations) = 'array'
           AND jsonb_array_length(financial_situations) >= 1);
