/**
 * Mercado (informativo, P1): cotações BTC/ETH via Binance REST + cache em
 * memória (TTL 30s), degradação FRESH/STALE/UNAVAILABLE.
 * Sem SSE/WS no MVP; sem negociação, carteira ou execução de ordens.
 */
package com.investfacil.api.market;
