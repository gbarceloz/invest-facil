# S0 — Auditoria de segurança do banco

**Projeto:** Invest Fácil
**Escopo:** backend, PostgreSQL local, RLS, roles e testes existentes
**Modo:** auditoria; nenhuma policy, role ou migration alterada

> A existência de RLS não prova isolamento. As camadas abaixo são separadas de propósito.

---

## 1. Quatro camadas de proteção

### 1.1 Proteção implementada no backend

| Controle | Evidência | Estado |
|---|---|---|
| Rotas fail-closed | `SecurityConfig`: `/api/v1/**` autenticado; apenas conteúdo, market, bitcoin, cálculo, health e Swagger públicos | Implementado |
| Identidade por principal | Controllers usam `@AuthenticationPrincipal CurrentUser` e passam `userId` aos services | Implementado |
| Ownership em progresso/quiz | Repositories filtram `user_id`; testes A×B | Implementado e testado |
| Ownership em simulações | `SimulatorService.delete` verifica `simulation.getUserId().equals(userId)`; lista por usuário | Implementado e testado |
| Sessões por usuário | `revokeOne(userId, id)` inclui `userId` no UPDATE | Implementado e testado |
| Perfil | `PATCH /users/me` usa apenas o principal | Implementado e testado |
| ADMIN | `/api/v1/admin/**` exige `ROLE_ADMIN`; upload/list testados | Implementado e testado |
| JWT | HS256, issuer/purpose, papel recarregado do banco | Implementado |
| Refresh | hash SHA-256, rotação, detecção de reuso e revogação da família | Implementado e testado |
| MFA | TOTP, AES-GCM, replay por contador, setup com senha | Implementado e testado |
| Lockout | tentativas falhas por conta | Implementado; teste indireto |
| Rate limit | memória por IP+bucket | Implementado; limitação de escala |
| Cookies | HttpOnly, Secure em prod, SameSite=Strict | Implementado; produção não testada |
| CORS | origens explícitas; sem `*` com credenciais | Implementado |
| Upload | MIME, assinatura de container e limite | Implementado; storage live não testado |

### 1.2 Proteção implementada no PostgreSQL

| Controle | Evidência | Estado |
|---|---|---|
| Schema separado | `investfacil`; `public` não é usado pela aplicação | Implementado |
| PostgREST bloqueado | `REVOKE ALL ON SCHEMA investfacil FROM PUBLIC`; `anon`/`authenticated` revogados se existirem | Implementado |
| Roles separadas | `investfacil_app` DML; `investfacil_migrate` DDL; `test_guest` SELECT | Implementado |
| `investfacil_app` sem DDL | teste com `SET ROLE` e `CREATE TABLE` falhando | Testado |
| RLS habilitada | 18 tabelas de aplicação | Testado |
| Policy `app_rw` | ALL para `investfacil_app`, `USING (true)` e `WITH CHECK (true)` | Testado |
| Guest sem policy | `investfacil_test_guest` vê 0 linhas | Testado |
| Append-only | V5 revoga UPDATE/DELETE de `auth_event`, `xp_ledger`, `user_achievements` para o app | Testado |
| Flyway history | sem privilégios para app/test_guest | Implementado |

### 1.3 Proteção efetivamente testada

| Evidência | Resultado |
|---|---|
| `OwnershipSecurityIntegrationTest` | 7/7 PASS — A×B, anônimo, USER×ADMIN, perfil |
| `VideoAdminIntegrationTest` | 3/3 PASS — autorização e persistência com storage simulado |
| `ExtendedIntegrationTest` | 8/8 PASS — MFA, sessões, senha, JWT, artigos, fallback, gamificação |
| `FlywaySecurityIntegrationTest` | 5/5 PASS — DDL negado, DML permitido, ledgers append-only, guest 0 linhas |
| E2E A–E | 5/5 PASS — jornadas reais no navegador |
| `assert-surefire.py` | 47 testes, 0 skipped |

### 1.4 Proteção ainda não comprovada

- Isolamento per-user **no banco**.
- Comportamento do role `investfacil_runtime` em produção/Supabase.
- Comportamento quando o datasource usa `postgres`/owner.
- RLS com connection pooling (contexto de sessão/transação).
- Migrations e roles em Supabase real.
- Integrações live Supabase Storage/Resend/Binance/CoinGecko.
- Rate limit distribuído e revogação de access token.

---

## 2. Evidência da RLS

Consultas somente leitura no PostgreSQL 17.12 local:

```text
18 policies no schema investfacil
todas: app_rw | roles={investfacil_app} | cmd=ALL | qual=true | with_check=true
18 tabelas com relrowsecurity=true
0 tabelas com relforcerowsecurity=true
owner das tabelas = postgres
investfacil_app: rolsuper=false, rolbypassrls=false, rolcanlogin=false, rolinherit=true
investfacil_migrate: rolsuper=false, rolbypassrls=false, rolcanlogin=false
investfacil_test_guest: rolsuper=false, rolbypassrls=false, rolcanlogin=false
```

### 2.1 Respostas às perguntas da missão

1. **Qual role executa as queries?** O datasource configurado por `SPRING_DATASOURCE_USERNAME`. Em testes locais é o superuser do container; em produção o briefing não confirma o role efetivo.
2. **Possui `BYPASSRLS`?** `investfacil_app` não. Owner/superuser bypassa por padrão.
3. **Existe `FORCE ROW LEVEL SECURITY`?** Não.
4. **A aplicação usa um único usuário de banco?** Sim, um datasource Hikari; não há `SET ROLE` por usuário no código principal.
5. **Como o `user_id` é aplicado?** Na aplicação, por principal e filtros de repository/service.
6. **Existem queries sem filtro de proprietário?** Sim, por desenho: conteúdo público, busca, market, lookup de refresh por hash e listagem ADMIN. Não foi encontrado vazamento A×B nos endpoints testados.
7. **Há SQL direto ignorando repositories?** Não há `JdbcTemplate` no código principal. Há uma native query em `XpLedgerRepository` que filtra `userId`. `JdbcTemplate` aparece apenas em testes.
8. **O desenho depende exclusivamente da aplicação?** Sim, para isolamento por usuário. A RLS atual só nega roles sem policy.
9. **É possível demonstrar isolamento no banco?** Não. A policy do app permite todas as linhas; não há `current_setting('app.current_user_id')`, `SET LOCAL` nem policy por proprietário.

### 2.2 Tabelas com `user_id` que exigiriam policy por usuário

`users`, `refresh_tokens`, `email_tokens`, `auth_event`, `user_progress`, `quiz_attempts`, `xp_ledger`, `user_achievements`, `simulations`.

Casos indiretos:

- `quiz_attempt_answers` não tem `user_id`; precisaria de `EXISTS` contra `quiz_attempts`.
- `video_assets`, `articles`, `categories`, `modules`, `lessons`, `quiz_questions`, `achievements` são conteúdo; leitura pública e escrita administrativa.

---

## 3. Roles e privilégios

| Role | Login | Herança | DML | DDL | RLS | Uso |
|---|---|---|---|---|---|---|
| `investfacil_app` | não | sim | sim | não | policy permissiva | runtime por membership |
| `investfacil_migrate` | não | sim | não explicitamente | USAGE/CREATE no schema | não é policy role | Flyway |
| `investfacil_test_guest` | não | sim | não | não | sem policy → 0 linhas | teste |
| `investfacil_runtime` | sim (script manual) | **NOINHERIT** | via membership, mas sem herança efetiva | não | não verificado | runtime |
| `postgres` | sim | — | owner | owner | bypass | provisionamento/migrations |

**Achado crítico:** o script `PROVISION_RUNTIME_ROLE.sql` cria o runtime com `NOINHERIT`. A aplicação não executa `SET ROLE`. Portanto, o runtime não herda os privilégios de `investfacil_app`; as queries podem falhar por falta de acesso ao schema/tabelas. O mesmo vale para a orientação da V2. Não foi executado teste local porque isso exigiria criar role/alterar o banco; a semântica do PostgreSQL é determinística.

Além disso, o script usa `:'runtime_password'`, sintaxe de variável do `psql`. O runbook manda executá-lo no SQL Editor do Supabase, que não interpreta meta-variáveis do `psql`; o script não roda como está.

---

## 4. Append-only

A V5 revoga `UPDATE`/`DELETE` de `investfacil_app` em `auth_event`, `xp_ledger` e `user_achievements`. O teste prova a negação com `SET ROLE investfacil_app`.

Limitações:

- Se o runtime usar `postgres`/owner, o append-only não vale.
- Se o runtime tiver `NOINHERIT`, ele não consegue nem INSERT; se for alterado para `INHERIT`, herda a restrição.
- Não há trigger de proteção; a garantia é de grants, não de invariante de banco.
- A função `apply_table_security()` não revoga EXECUTE de `investfacil_app`; chamadas falham por falta de ownership, mas o privilégio poderia ser mais restrito.

---

## 5. Riscos de segurança

| ID | Severidade | Achado |
|---|---|---|
| S0-SEC-01 | HIGH | RLS permissiva, sem isolamento per-user |
| S0-SEC-02 | HIGH | Sem `FORCE RLS`; owner/superuser bypassa |
| S0-SEC-03 | CRITICAL (deploy) | Runtime `NOINHERIT` + `SET ROLE` ausente |
| S0-SEC-04 | HIGH | Flyway pode usar credencial de runtime se `SPRING_FLYWAY_*` não for definido |
| S0-SEC-05 | MEDIUM | Access token válido por até 15 min após logout |
| S0-SEC-06 | MEDIUM | Rate limit em memória |
| S0-SEC-07 | MEDIUM | Append-only não é trigger; owner pode alterar |
| S0-SEC-08 | MEDIUM | Documentação chama a RLS de “deny-by-default” sem explicar a policy permissiva |
| S0-SEC-09 | LOW | `lesson_articles` sem uso |
| S0-SEC-10 | LOW | Storage permite 150 MB no SQL, backend limita 50 MB |

---

## 6. Conclusão

Os endpoints cobertos resistiram a A×B e USER×ADMIN, com persistência verificada. Isso prova a proteção **da aplicação** nos caminhos testados, não a proteção do banco.

A RLS atual é uma barreira contra roles sem policy, não um isolamento entre usuários. O runtime de produção, do jeito que o script está escrito, tende a não funcionar ou a exigir mudança de herança. A segurança do banco permanece **não comprovada** até que o role de runtime, o owner e uma policy por usuário sejam definidos e testados em ambiente controlado.

**Nenhuma correção foi implementada nesta missão.**
