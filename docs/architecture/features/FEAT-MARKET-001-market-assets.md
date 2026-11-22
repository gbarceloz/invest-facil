---
feature_id: FEAT-MARKET-001
name: Cotações de mercado (Binance/FX)
domain: market
subdomain: quotes
status:
  discovery: MAPPED
  implementation: IMPLEMENTED
  test: NOT VERIFIED
  verification: NOT VERIFIED
  human_review: NOT REQUIRED
  deployment: NOT VERIFIED
  publication: NOT APPLICABLE
---

# FEAT-MARKET-001 — Cotações de mercado

## Resumo
Endpoint público que retorna BTC/ETH/SOL em BRL via Binance + câmbio Frankfurter, com cache
de 30 s e fallback `UNAVAILABLE` (sem números inventados). **Não há consumidor frontend
ativo**: `/app/mercado` redireciona para `/app/bitcoin`.

## Frontend
Nenhuma página consome `/api/v1/market/assets`. A rota legada
`frontend/app/app/mercado/page.tsx` faz `redirect('/app/bitcoin')`.

## API
| Método/path | Controller → Service | DTO | Auth |
|---|---|---|---|
| `GET /api/v1/market/assets` | `MarketController.assets` → `MarketService.assets` | — → `MarketResponse` | público |

## Backend
- `MarketService.assets`: cache em memória por `MARKET_CACHE_SECONDS` (30 s).
- `fetch`: Binance `/api/v3/ticker/24hr` para BTC/ETH/SOL; câmbio USD/BRL via Frankfurter.
- `fetchFx` falha → usa `5.00` como referência de conversão (não é cotação real).
- `fallback`: lista vazia + `status=UNAVAILABLE` + disclaimer.
- Sem persistência.

## Database
Nenhuma tabela.

## Security
- Público; sem dados de usuário.
- Sem API key; chamadas externas com timeout 2 s/5 s.
- Sem teste de rede real; não há garantia de que o provedor esteja disponível.

## Tests
Nenhum teste automatizado para esta feature. `MvpFlowIntegrationTest` desabilita
`app.market.enabled`.

## Dependencies
INT-05 (Binance), INT-06 (Frankfurter). Não é dependência do dashboard atual
(que usa Bitcoin/CoinGecko).

## Evidence / limitations
- **IMPLEMENTED**, **NOT VERIFIED**; endpoint existe, mas não é usado pela UI.
- Não verificado: resposta live, fallback, timeout, cache, conversão FX real, contrato.
- Candidato a remoção/arquivamento em missão futura, se não houver consumidor.

## Change impact
Baixo no produto atual (sem UI); qualquer uso futuro precisa de teste live/contrato.
