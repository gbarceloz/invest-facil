# PROMOTION REPORT — T1 → backend/

**Status: CONCLUÍDA | Data: 2026-11-15**

## Pré-condição

- Relatório de reconciliação da missão 01.1: `_audit/mission-01-reconciliation.md`
  (obs.: não existe arquivo com o nome `mission-01-2-report.md`; o conteúdo
  equivalente está neste relatório — integridade, quarentena e liberação comprovadas).
- Verificação direta (não presumida): `backend/` continha **0 entradas** antes da cópia;
  duplicação preservada em `_quarantine/backend-market-data-duplicate-20261114` (46 arquivos).

## Operação

- Origem: `<workspace>\_staging\backend-skeleton`
- Destino: `<workspace>\backend`
- Método: `robocopy /E` — cópia pura, **nenhum arquivo reconstruído ou reescrito**.

## Comparação SHA-256

| Métrica | Resultado |
|---|---|
| Arquivos no staging | 65 |
| Arquivos no destino | 65 |
| Somente no staging | 0 |
| Somente no destino | 0 |
| Hashes divergentes | **0** |

**Resultado: 100% idêntico.** Manifesto completo: `promotion-manifest.sha256`
(formato `<sha256>  <caminho relativo>`).

## Build no destino

Comando: `mvn -B clean verify -Pdocker-desktop-newapi` (envs: JAVA_HOME JDK 21,
DOCKER_HOST tcp://127.0.0.1:2375 — workaround documentado no pom e no T1_RELATORIO.md).

Resultado: **BUILD SUCCESS** — `Tests run: 10, Failures: 0, Errors: 0, Skipped: 0`
- GlobalExceptionHandlerTest 4/4
- FlywaySecurityIntegrationTest 4/4 (PostgreSQL real; V1+V2 aplicadas em banco limpo)
- SecretsScanTest 2/2

Log completo: `build_promotion.log`.

## Conteúdo transitório copiado (observação para o primeiro commit)

A cópia pura incluiu logs de execução da T1 (`build_t1.log`, `t_single.log`,
`t_probe.log`, `tcp_info.txt`, `swagger_boot*.log`) e `target/`. **Não devem entrar
no repositório público** — ver `../git-publication-plan.md` e `.gitignore`.

## Mudanças em relação à T1: nenhuma.