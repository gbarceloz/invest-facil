# S1 — Lacunas de segurança e requisitos para RLS por usuário

**Projeto:** Invest Fácil
**Escopo:** pendências para missão futura; **nada foi implementado**
**Modelo atual:** policies `app_rw USING (true)` — não é isolamento por usuário

---

## 1. Separação de estados

| Dimensão | Estado S1 |
|---|---|
| Compatibility (PG17/Supabase syntax) | **PASS local**; remoto NOT TESTED |
| Privilege model (runtime × migration) | **PASS local** |
| RLS security (per-user) | **NÃO IMPLEMENTADO** |
| Data integrity | **PASS local** (constraints/FKs/seed) |
| Connectivity | **NOT TESTED — EXTERNAL** |
| Production readiness | **BLOCKED** |

Compatibilidade e privilégios corretos **não** autorizam go-live.

---

## 2. Problema atual

- 18 policies `app_rw` para `investfacil_app`: `USING (true)` e `WITH CHECK (true)`.
- Runtime herda `investfacil_app`; portanto a policy permite todas as linhas.
- O isolamento A×B depende de queries da aplicação (`user_id`), testadas na P1.2.
- Não há `FORCE ROW LEVEL SECURITY`; owner/superuser bypassa.
- `quiz_attempt_answers` não tem `user_id` direto; exige policy com `EXISTS` em `quiz_attempts`.
- `auth_event` tem `user_id` nullable; eventos de sistema exigem tratamento separado.
- `lesson_articles` está órfã e não deve entrar em policy sem decisão de uso.

---

## 3. Requisitos para a missão de RLS

### 3.1 Identidade e contexto

1. Definir como o `user_id` chega ao banco:
   - `SET LOCAL app.current_user_id = :id` por transação; ou
   - claims/`auth.uid()` se Supabase Auth for adotado.
2. Garantir que o contexto seja limpo ao devolver a conexão ao Hikari.
3. Não usar `SET ROLE` como identidade de usuário.
4. Não usar `SECURITY DEFINER` para contornar policy.
5. Definir comportamento para jobs, seed e admin.

### 3.2 Policies por tabela

| Tabela | Policy mínima |
|---|---|
| `users` | `id = current_user_id` para SELECT/UPDATE; INSERT público no cadastro; admin separado |
| `refresh_tokens`, `email_tokens` | `user_id = current_user_id` |
| `auth_event` | `user_id = current_user_id` ou role de auditoria |
| `user_progress`, `quiz_attempts`, `xp_ledger`, `user_achievements`, `simulations` | `user_id = current_user_id` |
| `quiz_attempt_answers` | `EXISTS (attempt_id → quiz_attempts.user_id = current_user_id)` |
| `categories`, `modules`, `lessons`, `articles`, `quiz_questions`, `achievements` | leitura pública; escrita somente migration/admin |
| `video_assets` | leitura pública de PUBLISHED; escrita admin |
| `lesson_articles` | decidir uso antes de policy |

Separar policies por operação (`SELECT`, `INSERT`, `UPDATE`, `DELETE`) e usar `USING` + `WITH CHECK` corretos. `FORCE ROW LEVEL SECURITY` deve ser avaliado em todas as tabelas.

### 3.3 Roles privilegiadas

- Owner/migration não deve ser usado em runtime.
- Admin da aplicação não deve ser owner do banco.
- Role de auditoria/seed deve ser explícita.
- `BYPASSRLS` proibido para runtime.
- `SET ROLE` entre roles de usuário não deve existir.

### 3.4 Views e funções

- Views herdam/mascaram RLS de forma diferente; validar `security_invoker`.
- Funções `SECURITY DEFINER` exigem `search_path` fixo e revisão.
- A função `apply_table_security()` deve ser revogada de runtime após migrations.
- Nenhuma view/função nova nesta missão.

### 3.5 Aplicação

- Testes de IDOR/BOLA em todos os endpoints com IDs de recurso.
- Testes A×B diretamente no PostgreSQL, não apenas HTTP.
- Testes USER×ADMIN no banco.
- Testes de persistência após tentativa negada.
- Testes de transação e pool (contexto não vaza entre requisições).

### 3.6 Tokens e sessão

- Access token válido por 15 min após logout: decidir TTL/blacklist/token version.
- Refresh rotation/reuse já testado; manter.
- Cookies `HttpOnly/Secure/SameSite` em produção ainda não validados.
- MFA recovery codes ausentes.

### 3.7 Rate limit e abuso

- Rate limit em memória é por instância; definir Redis/gateway se escalar.
- Testar lockout por conta e por IP sem bloquear usuários legítimos.

### 3.8 Append-only

- V5 depende de grants; se runtime for owner, não vale.
- Considerar trigger/constraint para `auth_event`, `xp_ledger`, `user_achievements`.
- Testar INSERT permitido e UPDATE/DELETE negados no banco.

---

## 4. Testes mínimos da futura missão

| Teste | Esperado |
|---|---|
| A lê B em `user_progress` | 0 linhas |
| A atualiza B em `simulations` | 0 linhas / erro |
| A exclui B em `refresh_tokens` | 0 linhas / erro |
| A lê respostas de quiz de B | 0 linhas via `EXISTS` |
| Admin lê dados administrativos | conforme policy explícita |
| Runtime sem `SET LOCAL` | 0 linhas, nunca todas |
| Runtime com `SET LOCAL` correto | apenas dados do usuário |
| Duas conexões do pool | contexto não vaza |
| Owner/migration | não usado em runtime |
| `FORCE RLS` | confirmado no catálogo |
| UPDATE/DELETE em ledgers | negado para runtime |

---

## 5. O que não foi feito

- Nenhuma policy foi alterada.
- Nenhum `FORCE RLS` foi habilitado.
- Nenhum `SET LOCAL` foi implementado.
- Nenhum teste A×B no banco foi adicionado.
- Nenhuma view/função de segurança foi criada.
- Nenhum token/rate limit foi alterado.

**RLS por usuário permanece fora do escopo da S1 e é pré-requisito para considerar o banco seguro.**
