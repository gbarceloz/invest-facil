# S2.0 — Relatório final de preflight

## S2.0 — SUPABASE REMOTE PREFLIGHT & DISPOSABLE ENVIRONMENT SELECTION

**Status:** **PASS WITH LIMITATIONS — REMOTE TARGET NOT DESIGNATED**
**Data:** 2026-11-22
**Projeto:** Invest Fácil
**Raiz:** `<repo>`
**Autorização de escrita remota:** **NÃO CONCEDIDA**
**S2.1:** **NÃO INICIADA**

---

## 1. Status geral

O preflight local foi concluído. A documentação oficial do Supabase foi consultada, o estado S1 foi revalidado estaticamente e o frontend foi preservado.

Não foi identificado nenhum projeto Supabase descartável designado para testes. O projeto principal `fvsofuwgdurrzipqfwyg` não foi utilizado. A parte remota está bloqueada por ausência de alvo e de autorização específica.

---

## 2. Baseline Git antes/depois

| Item | Antes | Depois |
|---|---|---|
| Branch | `feat/mvp-completo` | `feat/mvp-completo` |
| HEAD | `100d3fe` | `100d3fe` |
| Staged | 0 | 0 |
| Modificados | 45 | 45 |
| Deletados | 0 | 0 |
| Não rastreados | 50 | 50 |
| Total | 95 | 95 |
| Commits/push/PR/merge/deploy | 0 | 0 |

Os documentos S2 ficam dentro de `docs/verification/`, que já era uma entrada não rastreada; por isso a contagem não mudou.

---

## 3. Arquivos criados

Somente em `docs/verification/S2/`:

1. `S2_PREFLIGHT_BASELINE.md`
2. `S2_LOCAL_S1_REVALIDATION.md`
3. `S2_ENVIRONMENT_SELECTION.md`
4. `S2_CONNECTIVITY_MATRIX.md`
5. `S2_SECURITY_PRECHECK.md`
6. `S2_EXECUTION_PLAN.md`
7. `S2_PREFLIGHT_FINAL_REPORT.md`

Nenhum arquivo de backend, frontend, migration, configuração, script SQL ou documentação canônica foi alterado.

---

## 4. Revalidação do S1

Hashes atuais conferem com o S1:

- `application-prod.yml`: `743395BB...AB646B`
- `PROVISION_RUNTIME_ROLE.sql`: `A121165C...33D2F7`
- `PROVISION_MIGRATION_ROLE.sql`: `CFD409AF...0D314`
- V1–V5: hashes inalterados.

O modelo `INHERIT`, a separação bootstrap/migration/runtime e a exigência de `SPRING_FLYWAY_*` em `prod` permanecem. Nenhuma divergência entre arquivos e relatório S1 foi encontrada.

A S2.0 não reexecutou o banco descartável do S1; a revalidação é estática e baseada em hashes, conteúdo e relatórios.

---

## 5. Ambiente remoto candidato

**Nenhum.**

| Critério | Estado |
|---|---|
| Project ref descartável | ausente |
| Diferente do principal | não aplicável |
| Confirmado como descartável | ausente |
| Autorização de escrita | ausente |
| Região/PG/status/plano | ausentes |

Variáveis `S2_TARGET_PROJECT_REF`, `S2_TARGET_PROJECT_REGION`, `S2_DISPOSABLE_PROJECT_CONFIRMED` e `S2_REMOTE_WRITE_APPROVED`: **ausentes** em Process, User e Machine.

Nenhum `.env` real, projeto linkado ou `project-ref` local foi encontrado. O CLI Supabase 3.2.0 está instalado, mas `projects list`, `link`, `db` remoto e qualquer comando de escrita **não foram executados**.

---

## 6. Projeto principal protegido

`fvsofuwgdurrzipqfwyg`:

- não foi conectado;
- não recebeu SQL;
- não recebeu roles, migrations, seed, grants ou policies;
- não foi consultado via Management API ou CLI;
- não foi alterado em configuração/rede.

O identificador aparece apenas em relatórios S0 existentes. Nenhum comando remoto foi emitido para ele.

---

## 7. Matriz de conectividade

Fonte: documentação oficial consultada em 2026-11-22.

| Modo | IP | Porta | Uso | Estado |
|---|---|---|---|---|
| Direct | IPv6 (ou IPv4 com add-on Pro) | 5432 | migration/backend IPv6 | NOT TESTED; Render IPv4-only sem add-on não alcança |
| Shared session pooler | IPv4 | 5432 | Render IPv4-only; sessão/prepared statements | NOT TESTED |
| Shared transaction pooler | IPv4 | 6543 | serverless; sem prepared statements/estado | NOT TESTED; não usar para Flyway |
| Dedicated pooler | IPv6/add-on | 6543 | Pro+ | não aplicável |

Pontos confirmados:

- Render é listado pela Supabase como IPv4-only.
- O shared session pooler é IPv4 em todos os planos.
- O host do pooler deve vir do Dashboard; não pode ser montado pela região.
- Custom roles usam `[ROLE].[PROJECT-REF]` no shared pooler.
- Migrations são recomendadas via conexão direta; a viabilidade do Flyway via session pooler precisa ser comprovada em S2.1.
- Transaction pooler não suporta prepared statements/estado de sessão; JDBC exigiria `prepareThreshold=0`.

Nenhum teste de DNS, IPv4/IPv6, TLS, timeout, pooler ou egress Render foi executado.

---

## 8. SSL

- Supabase exige TLS.
- `sslmode=require` é o mínimo; `verify-full` + CA raiz é necessário para verificação do servidor.
- As URLs de exemplo do projeto não incluem SSL e precisam ser ajustadas na execução futura.
- O driver JDBC suporta `sslmode`, mas não foi testado contra o Supabase.
- Nenhum certificado, senha ou connection string foi registrado.

Classificação: `NOT TESTED`.

---

## 9. Riscos técnicos

| Risco | Severidade |
|---|---|
| Alvo descartável não designado | BLOCKER para S2.1 |
| Projeto principal ser tocado por engano | CRITICAL (mitigado: nenhum alvo/conexão) |
| RLS permissiva `USING (true)` no remoto | HIGH |
| Owner/superuser como runtime | HIGH |
| Flyway com credencial DML | HIGH |
| SQL Editor não executar bootstrap/GUC | HIGH (não testado) |
| Render IPv4-only + direct IPv6 | HIGH/MEDIUM |
| Flyway via session pooler não comprovado | MEDIUM/HIGH |
| SSL `prefer`/sem verificação | MEDIUM |
| Network restrictions/egress | MEDIUM |
| Região Oregon × São Paulo | MEDIUM |
| Backups/PITR | MEDIUM |
| RLS per-user não implementada | HIGH (fora do escopo S2.0) |

---

## 10. Pendências para S2.1

1. Ref do projeto descartável, diferente do principal.
2. Confirmação humana de descartabilidade.
3. Autorização específica de escrita remota.
4. Região, PG, status e plano.
5. Credenciais separadas de migration/runtime por canal seguro.
6. Método de conexão e SSL.
7. Janela e rollback/descarte.
8. Teste de egress do Render separado, sem deploy de produção.

---

## 11. Confirmações

- **Nenhum SQL** foi executado.
- **Nenhum provisionamento** remoto.
- **Nenhuma migration** remota.
- **Nenhum seed** remoto.
- **Nenhuma role/grant/policy** remota.
- **Nenhuma conexão** com o Supabase.
- **Nenhuma alteração** de rede, região, plano, senha ou configuração.
- **Nenhum commit, push, PR, merge ou deploy.**
- **Nenhum secret** lido, impresso ou gravado.

---

## 12. Frontend

Preservado. Hashes idênticos antes/depois:

- `git status -- frontend`: `55b3268e6e534120f6c30d66833513cc2af2e527`
- `git diff -- frontend`: `d794ae16034d304eb1cd42e32f77122428f4af69`

Nenhum arquivo de frontend foi tocado.

---

## 13. Rollback dos documentos locais

Como a S2.0 criou somente `docs/verification/S2/`, o rollback é remover essa pasta. Nenhum outro arquivo foi alterado.

Não usar `git reset`, `git clean`, `git checkout .` ou `git restore .`. O rollback não foi executado.

---

## 14. Recomendação objetiva

**Não iniciar S2.1.** Primeiro, o proprietário humano deve designar explicitamente um projeto Supabase descartável e autorizar escrita remota para ele, com os oito itens da seção 10.

Depois, executar o plano de `S2_EXECUTION_PLAN.md`, começando por identidade, SSL e método de conexão, sem tocar no projeto principal.

**Decisão final:** `PASS WITH LIMITATIONS — REMOTE TARGET NOT DESIGNATED`.
