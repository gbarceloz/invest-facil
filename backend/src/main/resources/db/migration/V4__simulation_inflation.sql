-- ============================================================================
-- V4 — Preserva a inflação hipotética usada no cenário salvo.
-- (V3 é imutável após aplicação; evolução sempre em nova migration.)
-- ============================================================================

ALTER TABLE investfacil.simulations
    ADD COLUMN IF NOT EXISTS inflation_rate numeric(7, 3) NOT NULL DEFAULT 0
    CHECK (inflation_rate >= 0 AND inflation_rate <= 100);
