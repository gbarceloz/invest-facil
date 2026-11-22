---
feature_id: FEAT-SIM-001
name: Cálculo de simulação financeira
domain: simulator
subdomain: calculation
status:
  discovery: MAPPED
  implementation: IMPLEMENTED
  test: TESTED
  verification: VERIFIED
  human_review: NOT REQUIRED
  deployment: NOT VERIFIED
  publication: NOT APPLICABLE
---

# FEAT-SIM-001 — Cálculo de simulação

## Resumo
Calcula juros compostos com aporte mensal, taxa anual e inflação, devolvendo série mensal,
valores nominais/reais e disclaimer educativo. Cálculo é público e não persiste.

## Frontend
| Item | Referência |
|---|---|
| Página | `frontend/app/app/simulador/page.tsx` |
| Chamadas | `POST /api/v1/simulator/calculate`; fallback/preset |
| Componentes | `PageHeader`, `Alert`, `Spinner`; gráfico Recharts na página |

## API
| Método/path | Controller → Service | DTO | Auth |
|---|---|---|---|
| `POST /api/v1/simulator/calculate` | `SimulatorController.calculate` → `SimulatorService.calculate` | `ScenarioRequest` → `ScenarioResult` | público |

## Backend
- Entrada: `initialAmount`, `monthlyContribution`, `months` (1–600), `annualRate` (0–100),
  `inflationRate` (0–100); validação Jakarta.
- Taxa mensal equivalente: `(1 + anual/100)^(1/12) - 1`.
- Inflação mensal equivalente; valor real = saldo / `(1 + inflaçãoMensal)^mês`.
- Série com até 600 pontos; arredondamento monetário HALF_UP; disclaimer fixo.
- Cálculo puro, sem repository/transação.

## Database
Nenhuma tabela; não persiste. `simulations` pertence a `FEAT-SIM-002`.

## Security
- Público por `SecurityConfig`.
- Sem dados de usuário; sem ownership.
- Entrada validada no backend; sem execução de código.

## Tests
`SimulatorServiceTest` 3/3:
- aportes sem juros;
- composição na taxa mensal equivalente;
- redução do valor real com inflação.

## Dependencies
`FEAT-SIM-002` reutiliza este cálculo. Sem dependência de auth para calcular.

## Evidence / limitations
- **VERIFIED** para a matemática no domínio testado.
- Não verificado: UI E2E, formatação/gráfico, limites extremos, arredondamento em centavos,
  comparação com calculadora externa.

## Change impact
Alterar fórmula/arredondamento afeta cenários salvos, ranking educativo e testes unitários.
