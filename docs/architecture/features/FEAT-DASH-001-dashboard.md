---
feature_id: FEAT-DASH-001
name: Dashboard e composição da jornada
domain: dashboard
subdomain: overview
status:
  discovery: MAPPED
  implementation: IMPLEMENTED
  test: NOT VERIFIED
  verification: PARTIAL
  human_review: NOT REQUIRED
  deployment: NOT VERIFIED
  publication: NOT APPLICABLE
---

# FEAT-DASH-001 — Dashboard

## Resumo
Compõe a visão inicial autenticada: próxima aula, progresso, XP/nível, streak, conquistas
e card de Bitcoin. Não tem endpoint próprio; consome `AppDataProvider` e
`GET /api/v1/bitcoin/market`.

## Frontend
| Item | Referência |
|---|---|
| Página | `frontend/app/app/page.tsx` |
| Dados globais | `frontend/lib/app-data.tsx` (`progress`, `gamification`) |
| Bitcoin | chamada direta `GET /api/v1/bitcoin/market` |
| Componentes | `ProgressBar`, `Skeleton`, `Disclaimer`, `PageHeader`/`Stat` (quando usado) |
| Shell | `frontend/components/app-shell.tsx` (XP/streak/nav) |

## API
| Fonte | Uso |
|---|---|
| `GET /api/v1/progress/summary` | via `AppDataProvider` |
| `GET /api/v1/gamification/summary` | via `AppDataProvider` |
| `GET /api/v1/bitcoin/market` | card “Mercado agora” |

Não há `GET /dashboard`; a composição é frontend.

## Backend
- `ProgressService.summary`: total/concluídas/percentual, média/tentativas de quiz,
  streak, XP/level, próxima aula, categorias, recentes.
- `GamificationService.summary`: XP, nível, próximo nível, streak, conquistas.
- `BitcoinMarketService.market`: cotação/fallback.
- Nenhuma transação cross-service; cada endpoint é read-only independente.

## Database
Leitura de `user_progress`, `quiz_attempts`, `xp_ledger`, `user_achievements`,
`lessons`, `categories`, `modules`; Bitcoin sem tabela.

## Security
- Autenticado; os two endpoints usam `userId` do principal.
- Bitcoin é público.
- Dashboard não é fonte de autorização; apenas exibe.

## Tests
Nenhum teste de dashboard/E2E. Cobertura indireta: `MvpFlowIntegrationTest` valida
`progress/summary` e `gamification/summary`; frontend só tem testes de formatadores e
`ProgressBar`.

## Dependencies
`FEAT-AUTH-002`, `FEAT-PROGRESS-001/002`, `FEAT-GAME-001`, `FEAT-MARKET-002`;
componentes compartilhados do shell.

## Evidence / limitations
- **PARTIAL**: dados de backend testados; composição/UX não.
- Não verificado: loading/erro no browser, próximo card, card Bitcoin, responsividade,
  estados vazios, E2E.

## Change impact
Alterar summaries afeta dashboard, shell e progresso; alterar Bitcoin afeta o card.
