# DEPENDENCY MAP — INVEST FÁCIL

**Fonte:** referências reais em código (imports, injeção, chamadas, FKs e endpoints).
**Regra:** relação sem evidência não foi incluída.

---

## 1. Grafo funcional

```text
AUTH-001 (registro/verificação)
   ↓ AUTHENTICATES
AUTH-002 (login/sessão) ──→ AUTH-004 (MFA)
   │                         AUTH-005 (sessões/senha)
   ├──→ USER-001 (perfil)
   ├──→ PROGRESS-001 (conclusão) ──→ GAME-001 (XP/níveis)
   ├──→ PROGRESS-002 (quiz) ────────┘
   ├──→ SIM-002 (cenários) ──→ GAME-001
   ├──→ DASH-001
   └──→ ADMIN-001 (ADMIN)

LEARN-001 (catálogo)
   ├──→ LEARN-002 (aula/vídeo)
   └──→ LEARN-003 (biblioteca/busca)

PROGRESS-002 ──depends on──→ PROGRESS-001
GAME-001 ──reads metrics──→ PROGRESS-001/002

MARKET-002 (Bitcoin) ──reads──→ DASH-001
MARKET-001 (Binance) — sem consumidor frontend
AUTH-003 (reset) ──writes──→ AUTH-002 (sessões)
```

---

## 2. Dependências por feature

| Origem | Destino | Tipo | Evidência | Criticidade | Risco de alteração |
|---|---|---|---|---|---|
| FEAT-AUTH-002 | FEAT-AUTH-001 | `DEPENDS_ON` | login exige `verified`; `AuthService.login` | alta | quebrar cadastro/login |
| FEAT-AUTH-004 | FEAT-AUTH-002 | `AUTHENTICATES` | challenge no login; `verifyMfa` | alta | bloquear login |
| FEAT-AUTH-004 | FEAT-AUTH-001 | `DEPENDS_ON` | MFA exige conta verificada | média | — |
| FEAT-AUTH-005 | FEAT-AUTH-002 | `DEPENDS_ON` | sessões e refresh tokens | alta | revogar sessões indevidamente |
| FEAT-AUTH-003 | FEAT-AUTH-002 | `WRITES` | reset revoga refresh tokens | alta | sessões antigas |
| FEAT-USER-001 | FEAT-AUTH-002 | `DEPENDS_ON` | `@AuthenticationPrincipal` | alta | perfil sem sessão |
| FEAT-PROGRESS-001 | FEAT-AUTH-002 | `AUTHENTICATES` | principal userId | alta | progresso cruzado |
| FEAT-PROGRESS-001 | FEAT-LEARN-002 | `DEPENDS_ON` | aula publicada | alta | concluir aula inexistente |
| FEAT-PROGRESS-002 | FEAT-PROGRESS-001 | `DEPENDS_ON` | quiz só após conclusão | alta | liberar quiz indevidamente |
| FEAT-PROGRESS-002 | FEAT-LEARN-002 | `DEPENDS_ON` | lessonId/perguntas | alta | quiz órfão |
| FEAT-GAME-001 | FEAT-PROGRESS-001 | `READS` | `ProgressMetrics.completedLessons` | alta | XP/achievements errados |
| FEAT-GAME-001 | FEAT-PROGRESS-002 | `READS` | média/tentativas de quiz | média | achievement `QUIZ_MASTER` |
| FEAT-PROGRESS-001 | FEAT-GAME-001 | `WRITES` | `awardXp(50)` | alta | XP duplicado |
| FEAT-PROGRESS-002 | FEAT-GAME-001 | `WRITES` | `awardXp(30)` + achievements | alta | XP duplicado/replay |
| FEAT-SIM-002 | FEAT-SIM-001 | `DEPENDS_ON` | `save` recalcula cenário | média | valores salvos divergentes |
| FEAT-SIM-002 | FEAT-GAME-001 | `WRITES` | `FIRST_SIMULATION` | baixa | achievement perdido |
| FEAT-DASH-001 | FEAT-PROGRESS-001/002 | `READS` | `progress/summary` | média | dashboard vazio |
| FEAT-DASH-001 | FEAT-GAME-001 | `READS` | `gamification/summary` | média | XP/level errado |
| FEAT-DASH-001 | FEAT-MARKET-002 | `READS` | `bitcoin/market` | baixa | cotação/fallback |
| FEAT-LEARN-002 | FEAT-LEARN-001 | `DEPENDS_ON` | lesson → module/category | alta | navegação quebrada |
| FEAT-ADMIN-001 | FEAT-LEARN-001 | `DEPENDS_ON` | lessonId válido | alta | upload órfão |
| FEAT-ADMIN-001 | INT-03 Supabase | `INTEGRATES_WITH` | `SupabaseStorageClient` | alta | upload falha |
| FEAT-MARKET-001 | INT-05/06 | `INTEGRATES_WITH` | Binance/Frankfurter | baixa | endpoint sem UI |
| FEAT-MARKET-002 | INT-07 | `INTEGRATES_WITH` | CoinGecko | média | dashboard/bitcoin |

---

## 3. Componentes, serviços e tabelas compartilhados

| Recurso | Consumidores | Risco |
|---|---|---|
| `frontend/components/app-shell.tsx` | todas as rotas `/app/**` | alto (guard/nav/topbar) |
| `frontend/lib/api.ts` | todas as chamadas | alto (refresh/erros) |
| `frontend/lib/app-data.tsx` | shell, dashboard, aprender, progresso, perfil | alto |
| `ContentCatalog` / `ContentService` | progresso, vídeo, frontend | alto |
| `GamificationService` | progresso, quiz, simulador, shell | alto |
| `ProgressMetrics` / `ProgressMetricsService` | gamificação | médio |
| `UserService` | auth, perfil | alto |
| `users` | auth, perfil, progresso, quiz, XP, simulação | alto |
| `lessons` | conteúdo, progresso, quiz, vídeo, admin | alto |
| `xp_ledger` | progresso, quiz, simulação, gamificação | alto |
| `video_assets` | aula, admin | médio |
| `simulations` | simulador | médio |

---

## 4. Ciclo conceitual

`ProgressService` chama `GamificationService.awardXp`; `GamificationService` depende de
`ProgressMetrics`, implementado por `ProgressMetricsService`, não por `ProgressService`.
Não há ciclo de beans, mas há **dependência conceitual bidirecional** entre progresso e
gamificação. Alterações em XP/achievements devem considerar ambos.

**Não há** dependência de `SimulatorService` para `ProgressService`; a integração é via
`GamificationService` (achievement).
