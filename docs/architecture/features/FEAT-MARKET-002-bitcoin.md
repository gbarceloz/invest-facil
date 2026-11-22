---
feature_id: FEAT-MARKET-002
name: Bitcoin (CoinGecko)
domain: market
subdomain: bitcoin
status:
  discovery: MAPPED
  implementation: IMPLEMENTED
  test: NOT VERIFIED
  verification: PARTIAL
  human_review: NOT REQUIRED
  deployment: NOT VERIFIED
  publication: NOT APPLICABLE
---

# FEAT-MARKET-002 — Bitcoin (CoinGecko)

## Resumo
Exibe preço, variação, market cap, volume e gráficos 24 h/7 d do Bitcoin via CoinGecko.
Endpoint público, cache 120 s, fallback `STALE` (último sucesso) ou `UNAVAILABLE`.

## Frontend
| Item | Referência |
|---|---|
| Página | `frontend/app/app/bitcoin/page.tsx` |
| Dashboard | `frontend/app/app/page.tsx` (card “Mercado agora”) |
| Formatação | `frontend/lib/format.ts` |
| Estados | loading skeleton, `UNAVAILABLE`, `STALE`, gráficos Recharts |

## API
| Método/path | Controller → Service | DTO | Auth |
|---|---|---|---|
| `GET /api/v1/bitcoin/market` | `BitcoinController.market` → `BitcoinMarketService.market` | — → `BitcoinMarketResponse` | público |

## Backend
- `BitcoinMarketService.market`: cache 120 s (`BITCOIN_MARKET_CACHE_SECONDS`); TTL 30 s
  para resposta não-FRESH.
- `fetch`: CoinGecko `/simple/price` (USD/BRL, change, market cap, volume, last update)
  e `/coins/bitcoin/market_chart` (1/7 dias).
- `staleOrUnavailable`: devolve último sucesso com `status=STALE`; senão `UNAVAILABLE`.
- Sem API key; timeout 3 s/8 s; sem persistência.

## Database
Nenhuma tabela; cache em memória por instância.

## Security
- Público; sem dados de usuário.
- Sem chave/credencial; chamada externa.
- Sem teste de rede; pode falhar silenciosamente para fallback.
- Disclaimer fixo de conteúdo informativo.

## Tests
Nenhum teste automatizado; `MvpFlowIntegrationTest` não cobre Bitcoin.

## Dependencies
INT-07 (CoinGecko); `FEAT-DASH-001` lê este endpoint. Sem dependência de auth.

## Evidence / limitations
- Verificado: código/rotas/build; fallback implementado.
- Não verificado: resposta live, gráficos, cache/stale, rate limit do provedor, UI E2E,
  precisão dos números exibidos.

## Change impact
Médio: dashboard e página Bitcoin dependem do contrato; falha deve manter fallback honesto.
