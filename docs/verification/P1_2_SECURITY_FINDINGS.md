# P1.2 — Achados de segurança, ownership e RLS

**Projeto:** Invest Fácil
**Data:** 2026-11-22
**Escopo:** testes locais com PostgreSQL 17 (Testcontainers e container local), backend Spring Boot, frontend Next.js e navegador Edge.
**Fora do escopo:** banco remoto, produção, credenciais reais, Supabase/Resend/Binance/CoinGecko live.

> Nenhuma migration, policy, role ou permissão foi alterada nesta missão. As propostas abaixo aguardam aprovação humana.

---

## 1. Resumo

| ID | Severidade | Achado | Estado |
|---|---|---|---|
| P1.2-SEC-001 | **HIGH** | RLS não isola por usuário: policy `app_rw USING (true)` | Confirmado no banco local |
| P1.2-SEC-002 | **HIGH** | `FORCE ROW LEVEL SECURITY` ausente; owner/superuser bypassa RLS | Confirmado no banco local |
| P1.2-SEC-003 | **MEDIUM** | Access token JWT não é revogável antes do TTL de 15 min | Confirmado por código; não explorado |
| P1.2-SEC-004 | **MEDIUM** | Rate limit em memória por instância | Confirmado por código |
| P1.2-SEC-005 | **MEDIUM** | Provisionamento do role de runtime (`NOINHERIT` + `GRANT`) não verificado | Não verificável sem ambiente remoto |
| P1.2-SEC-006 | **MEDIUM** | Integrações externas sem teste live/contrato | Implementado, não live-testado |
| P1.2-SEC-007 | **LOW** | `lesson_articles` órfã e sem uso | Confirmado |
| P1.2-SEC-008 | **LOW** | CORS de E2E exige origem explícita; default é `localhost:3000` | Confirmado em teste |
| P1.2-SEC-009 | **LOW** | 5 endpoints sem consumidor frontend, incluindo admin upload/list | Confirmado |

**Ownership testado:** nenhum vazamento A×B foi observado nos endpoints cobertos. Isso **não** prova que toda query futura esteja correta, porque a defesa de banco é permissiva.

---

## 2. P1.2-SEC-001 / 002 — RLS permissiva e sem FORCE

### Evidência local

Consulta em PostgreSQL 17 (`investfacil-p12-db`):

```text
investfacil_app        | rolsuper=f | rolbypassrls=f | rolcanlogin=f | rolinherit=t
investfacil_migrate    | rolsuper=f | rolbypassrls=f | rolcanlogin=f
investfacil_test_guest | rolsuper=f | rolbypassrls=f | rolcanlogin=f
```

- 19 tabelas no schema `investfacil`; 18 com RLS habilitada (a exceção é `flyway_schema_history`).
- Todas as 18 tabelas de aplicação têm a policy `app_rw`, role `investfacil_app`, `cmd=ALL`, `qual=true`, `with_check=true`.
- Todas as tabelas têm `relforcerowsecurity = false`.
- O owner das tabelas é `postgres`.
- `investfacil_app` não tem `BYPASSRLS`, mas o owner/superuser bypassa RLS por padrão.

### Respostas às perguntas da missão

1. **Qual role executa as queries?** Definido por `SPRING_DATASOURCE_USERNAME`. Em testes locais, o datasource usa o usuário administrativo do container (`postgres`). Em produção, o role de runtime não foi verificado.
2. **Possui `BYPASSRLS`?** `investfacil_app` não. Owner/superuser efetivamente bypassa.
3. **Existe `FORCE ROW LEVEL SECURITY`?** Não em nenhuma tabela.
4. **A aplicação usa um único usuário de banco?** Sim, um datasource único; não há `SET ROLE` por usuário.
5. **Como o `user_id` é aplicado?** Na aplicação, por `@AuthenticationPrincipal` e queries/filtros `userId` nos repositories/services.
6. **Existem queries sem filtro de proprietário?** Sim, por desenho: conteúdo público, busca, catálogo, market/bitcoin, lookup de refresh por hash e listagem ADMIN de vídeos. Não foi encontrado vazamento A×B nos endpoints testados.
7. **Há SQL direto ignorando repositories?** Não há `JdbcTemplate` no código principal. Há uma native query em `XpLedgerRepository` que filtra `userId`. Testes usam JDBC apenas para validar RLS/Flyway.
8. **O desenho depende exclusivamente da aplicação?** Sim, para isolamento por usuário. A RLS atual só impede roles sem policy (deny-by-default); não separa usuários.
9. **É possível demonstrar isolamento no nível do banco?** Não. A policy permite todas as linhas para `investfacil_app`; não há `current_user_id` de sessão nem policy por proprietário.

### Cenário de exploração

Qualquer query que esqueça `user_id`, qualquer novo repository, SQL injection em uma query futura, ou um bug de autorização passa a ler/escrever dados de todos os usuários. Em produção, se o datasource usar o owner/superuser, a RLS é irrelevante; se usar `investfacil_app`, a policy `USING (true)` também permite tudo.

### Impacto

- Progresso, quiz, XP, sessões, simulações e perfil podem ser expostos se uma query falhar.
- A defesa em profundidade inexiste: a aplicação é a única barreira.
- Não foi observado vazamento nos endpoints testados, mas o risco é estrutural.

### Proposta técnica (não executada)

1. Criar role de runtime sem ownership e sem `BYPASSRLS`, com `INHERIT` ou `SET ROLE` explícito.
2. Criar uma migration nova (V6) que:
   - adicione `FORCE ROW LEVEL SECURITY` nas tabelas de aplicação;
   - substitua `app_rw USING (true)` por policies por proprietário;
   - use `current_setting('app.current_user_id', true)::uuid` para tabelas com `user_id`;
   - use `id = current_setting(...)` para `users`;
   - mantenha policies de leitura pública para conteúdo/market, se necessário;
   - separe escrita administrativa por role/policy.
3. No backend, abrir transação e executar `SET LOCAL app.current_user_id = :id` antes das queries autenticadas; limpar no fim.
4. Jobs/seeders devem usar role administrativo próprio, nunca o role de runtime.
5. Testes obrigatórios:
   - dois usuários A/B e ADMIN;
   - A não lê/atualiza/deleta B em todas as tabelas com `user_id`;
   - query sem `SET LOCAL` retorna zero/erro, não todas as linhas;
   - `FORCE RLS` confirmado por catálogo;
   - regressão dos 47 testes atuais e E2E.
6. Riscos: complexidade de transação, conexões de pool com contexto vazado, queries públicas, migração de dados e rollback. Rollback deve ser uma migration compensatória, não `DROP` destrutivo.

**Status:** `HUMAN_REVIEW_REQUIRED`.

---

## 3. P1.2-SEC-003 — Access token não revogável

`JwtAuthenticationFilter` valida assinatura/expiração e recarrega o usuário do banco, mas não consulta lista de revogação. Logout e troca de senha revogam refresh tokens; o access token continua válido até o TTL de 15 minutos (`JWT_ACCESS_MINUTES`).

**Evidência:** código do filtro e `AuthService.logout/changePassword`; teste de troca de senha confirma revogação de refresh, não do access.

**Risco:** MEDIUM. Após logout/troca de senha, um access token roubado continua aceito por até 15 min.

**Opções:** reduzir TTL; `token_version`/`jti` com blacklist; sessão opaca; revogação por `password_changed_at`. Não implementado.

---

## 4. P1.2-SEC-004 — Rate limit em memória

`RateLimitFilter` usa `ConcurrentHashMap` por instância. Em múltiplas réplicas, o limite é por instância e reinícios zeram contadores. Para o MVP de uma instância é aceitável; para escala, usar Redis ou gateway.

**Status:** implementado; risco MEDIUM documentado.

---

## 5. P1.2-SEC-005 — Provisionamento do role de runtime

A migration V2 documenta:

```sql
CREATE ROLE investfacil_runtime LOGIN PASSWORD '<env>' NOINHERIT;
GRANT investfacil_app TO investfacil_runtime;
```

Com `NOINHERIT`, o runtime não herda automaticamente os privilégios de `investfacil_app`; a aplicação não executa `SET ROLE`. Isso pode causar falha de DML ou exigir ajuste no provisionamento. Não foi possível validar o role real de produção/Supabase nesta missão.

**Status:** `HUMAN_REVIEW_REQUIRED`; não alterar roles sem acesso ao ambiente.

---

## 6. P1.2-SEC-006 — Integrações externas

| Integração | Implementação | Teste |
|---|---|---|
| Supabase Storage | upload/signed URL | boundary simulado em `VideoAdminIntegrationTest`; sem live |
| Resend | e-mail transacional | desabilitado; link de dev usado |
| Binance | tickers | fallback `UNAVAILABLE`; sem live |
| CoinGecko | Bitcoin | fallback `UNAVAILABLE`; sem live |

Nenhum teste live foi executado; nenhuma credencial real foi usada. Testes com mock/simulação estão identificados como tal.

---

## 7. P1.2-SEC-007 — `lesson_articles` órfã

Tabela existe com RLS habilitada e policy permissiva, mas não há entidade, repository ou consulta. Não foi usada para autorização. Baixo risco; remover ou documentar em migration futura.

---

## 8. P1.2-SEC-008 — CORS no E2E

O backend rejeitou a origem `http://127.0.0.1:3100` com `403 Invalid CORS request` até o ambiente de teste definir `CORS_ALLOWED_ORIGINS`. Isso é configuração de teste, não vulnerabilidade de produto; em produção, a origem do frontend deve ser explicitamente configurada. O default `http://localhost:3000` é restritivo e adequado para dev.

---

## 9. P1.2-SEC-009 — Endpoints sem consumidor frontend

- `GET /api/v1/auth/me`
- `GET /api/v1/gamification/achievements`
- `GET /api/v1/market/assets`
- `POST /api/v1/admin/videos/{lessonId}`
- `GET /api/v1/admin/videos`

A ausência de UI não é falha de segurança; o upload ADMIN foi testado via API. A decisão de expor ou remover esses endpoints é humana.

---

## 10. Evidências de testes de segurança

| Evidência | Resultado |
|---|---|
| `OwnershipSecurityIntegrationTest` | 7/7 PASS |
| `VideoAdminIntegrationTest` | 3/3 PASS |
| `ExtendedIntegrationTest` | 8/8 PASS |
| `FlywaySecurityIntegrationTest` | 5/5 PASS |
| `assert-surefire.py` | PASS 47 testes, 0 skipped |
| RLS catalog query | 18 policies `USING (true)`, 0 `FORCE RLS` |
| E2E A–E | 5/5 PASS |

**Conclusão:** os endpoints cobertos resistiram a tentativas A×B e USER×ADMIN, com persistência verificada. A segurança de banco, porém, não está provada: a RLS é permissiva e o owner bypassa. A correção exige decisão humana e migration específica.
