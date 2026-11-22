# S0 — Relatório final

**Projeto:** Invest Fácil
**Missão:** auditoria local e preparação do Supabase
**Data:** 2026-11-22
**Diretório:** `<repo>`
**Status da auditoria:** `CONCLUÍDA — PASS WITH LIMITATIONS`
**Status de go-live no Supabase:** `BLOCKED` até resolver os bloqueadores CRITICAL/HIGH

---

## 1. Baseline inicial e final

| Item | Início da S0 | Fim da S0 |
|---|---|---|
| Branch | `feat/mvp-completo` | `feat/mvp-completo` |
| HEAD | `100d3fea056ceb9ef37725850992435ea30453de` | idêntico |
| Staged | 0 | 0 |
| Modificados | 42 | 42 |
| Deletados | 0 | 0 |
| Não rastreados | 49 | 49 |
| Total de entradas | 91 | 91 |
| Commits/push/PR/merge/deploy | 0 | 0 |

O total de entradas do Git não mudou porque `docs/verification/` já era uma entrada não rastreada; os sete arquivos da S0 foram criados dentro dela. Nenhum arquivo preexistente foi alterado.

**Preservação do frontend:** hashes idênticos antes/depois:
- `git status -- frontend`: `55b3268e6e534120f6c30d66833513cc2af2e527`
- `git diff -- frontend`: `d794ae16034d304eb1cd42e32f77122428f4af69`

---

## 2. Arquivos criados

Somente dentro de `docs/verification/S0/`:

1. `S0_BASELINE.md`
2. `S0_DATABASE_AUDIT.md`
3. `S0_SECURITY_AUDIT.md`
4. `S0_SUPABASE_COMPATIBILITY.md`
5. `S0_FRONTEND_PRESERVATION.md`
6. `S0_RISK_REGISTER.md`
7. `S0_FINAL_REPORT.md`

Nenhum arquivo de backend, frontend, migration, configuração, lockfile ou documentação preexistente foi modificado.

---

## 3. Stack efetivamente encontrada

| Camada | Versão / estado |
|---|---|
| Java | OpenJDK 21.0.12.1 LTS |
| Spring Boot | 3.5.6 |
| Maven | 3.9.16 |
| Banco local | PostgreSQL 17.12 |
| Migrations | Flyway V1–V5 |
| Driver | PostgreSQL JDBC |
| Pool | HikariCP, máximo 5 |
| Frontend | Next.js 16.4.6, React 19.1, TypeScript 5.7 |
| Testes existentes | 13 classes backend / 47 testes; 3 arquivos frontend / 12 testes; 5 specs E2E |
| Schema | `investfacil` |
| Autenticação | própria (JWT/refresh/MFA); Supabase Auth não usado |

---

## 4. Migrations encontradas

| Migration | Conteúdo |
|---|---|
| `V1__init.sql` | schema + 17 tabelas, FKs, constraints e índices |
| `V2__postgres_security.sql` | roles, grants, revogação de PostgREST, função RLS e 18 policies permissivas |
| `V3__auth_mfa_simulator.sql` | MFA/lockout, família de refresh, `simulations`, `external_url`, índice anti-farm |
| `V4__simulation_inflation.sql` | coluna `inflation_rate` + check |
| `V5__append_only_ledgers.sql` | revoga UPDATE/DELETE dos ledgers para `investfacil_app` |

Evidência local: 5 migrations aplicadas com sucesso, PostgreSQL 17.12, 18 tabelas de aplicação, 49 índices, 22 FKs, 18 policies, 0 triggers, 1 função. Nenhuma extensão além de `plpgsql`.

---

## 5. Problemas de compatibilidade

1. **CRITICAL — runtime `NOINHERIT`:** o script cria `investfacil_runtime` sem herança e a aplicação não executa `SET ROLE`. O runtime tende a não acessar as tabelas.
2. **HIGH — placeholder `psql`:** `:'runtime_password'` não funciona no SQL Editor do Supabase como o runbook orienta.
3. **HIGH — Flyway sem credencial DDL garantida:** se `SPRING_FLYWAY_*` não for preenchido, o Flyway usa o runtime DML e falha.
4. **HIGH — role de migração insuficiente:** `investfacil_migrate` tem apenas USAGE/CREATE; V2 exige `CREATE ROLE`, `REVOKE ON SCHEMA` e `CREATE POLICY`, que dependem de owner/CREATEROLE.
5. **HIGH — conectividade não verificada:** IPv6 direto, pooler, SSL e egress do Render não foram testados.
6. **MEDIUM — região:** Render `oregon` × Supabase `sa-east-1` adiciona latência.
7. **MEDIUM — SSL:** URLs de exemplo não incluem `sslmode=require`.
8. **MEDIUM — pooler:** Flyway não deve usar transaction pooler; prepared statements do runtime precisam de validação.
9. **LOW — docs desatualizadas:** contagens 28/6, comentário V1..V3 e “Supabase não provisionado” divergem do estado atual.

---

## 6. Riscos de segurança

| Risco | Severidade |
|---|---|
| RLS `USING (true)` sem isolamento por usuário | HIGH |
| Sem `FORCE RLS`; owner/superuser bypassa | HIGH |
| Runtime `NOINHERIT` / provisionamento | CRITICAL (deploy) |
| Flyway com credencial errada | HIGH |
| Access token válido por 15 min após logout | MEDIUM |
| Rate limit em memória | MEDIUM |
| Append-only depende de grants, não de trigger | MEDIUM |
| Documentação superestima a RLS | MEDIUM |
| `lesson_articles` órfã | LOW |
| Limite de storage 150 MB × backend 50 MB | LOW |

Os testes A×B e USER×ADMIN da P1.2 passaram (7/7 ownership, 3/3 ADMIN, 8/8 integrações, 5/5 E2E), mas isso prova a camada aplicacional nos caminhos cobertos, **não** isolamento no PostgreSQL.

---

## 7. Estado de compatibilidade com Supabase

- O projeto informado (`fvsofuwgdurrzipqfwyg`, `sa-east-1`, PG17, `ACTIVE_HEALTHY`) **não foi conectado nem consultado** nesta missão.
- `public` vazio é compatível: a aplicação usa `investfacil`.
- As migrations são compatíveis em sintaxe com PG17 e não exigem extensões.
- O schema, as roles e o runtime ainda não foram provisionados/testados.
- O storage é configurado por script separado (`storage.buckets`), não por Flyway.
- O Supabase Auth não é usado; não há conflito com `auth.users`.
- O estado remoto precisa ser revalidado no painel/CLI antes de qualquer migration.

**Go-live:** bloqueado até resolver o runtime, as credenciais de Flyway, a conectividade/SSL/pooler e a decisão sobre RLS.

---

## 8. Preservação do frontend

- Nenhum arquivo do frontend foi alterado.
- 19 rotas de página, 8 componentes compartilhados e 5 módulos de lib permanecem iguais.
- O frontend chama somente `/api`; não há SDK/credencial Supabase no navegador.
- A futura integração de banco não exige mudança visual se os contratos da API forem mantidos.

---

## 9. Próxima missão recomendada

**S1 — Provisionamento controlado e dry-run do Supabase**, sem tocar em produção:

1. Redesenhar o script de runtime (herança/`SET ROLE`, sem placeholder psql).
2. Definir e validar credenciais separadas de Flyway (owner/DDL) e runtime (DML).
3. Testar conectividade direct/session pooler, SSL e IPv6/IPv4 a partir do Render.
4. Rodar V1–V5 em projeto/branch descartável e validar `ddl-auto=validate` + seed.
5. Só depois decidir a correção de RLS per-user (missão separada).

Não implementar RLS nem aplicar migrations nesta missão.

---

## 10. Confirmações finais

- **Nenhuma migration executada.**
- **Nenhuma conexão ou escrita no Supabase.**
- **Nenhum arquivo de produto/frontend/migration/configuração alterado.**
- **Nenhum commit, push, PR, merge ou deploy.**
- **Nenhuma credencial, token ou senha registrada.**
- A única escrita foi a documentação em `docs/verification/S0/`.

Aguardando revisão humana.
