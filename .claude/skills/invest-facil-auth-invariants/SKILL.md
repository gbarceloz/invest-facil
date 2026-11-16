# Skill: invest-facil-auth-invariants

## Invariantess de Autenticação e Autorização — Invest Fácil

> **Decisões aprovadas (T1/T2):** O que está definido e não deve ser alterado sem autorização do arquiteto (GLM).
> **Propostas pendentes:** O que está em discussão ou planejado para T2+.

---

## 1. Access Token (JWT)

| Atributo | Valor | Status |
|---|---|---|
| Tipo | JWT (RS256 ou HS256 — a definir) | Aprovado |
| Expiração | 15 minutos | Aprovado |
| Claims obrigatórios | `sub` (user ID), `role` (USER/ADMIN), `iat`, `exp` | Aprovado |
| Armazenamento no cliente | **Memória** (não localStorage/cookie) | Aprovado |
| Assinatura | Segredo ≥ 32 bytes via `JWT_SECRET` (env) | Aprovado |

**Regra:** O papel (USER/ADMIN) **sempre** vem do banco na validação do token, nunca do claim do JWT.

---

## 2. Refresh Token (Opaco)

| Atributo | Valor | Status |
|---|---|---|
| Formato | Opaco, 32 bytes aleatórios | Aprovado |
| Armazenamento no banco | **Apenas hash SHA-256** (nunca o token cru) | Aprovado |
| Expiração | 30 dias (configurável via env) | Aprovado |
| Rotação | A cada uso (`replaced_by` aponta para novo token) | Aprovado |
| Revogação | Por usuário (toda família) e por reutilização detectada | Aprovado |
| Detecção de reuso | Token já rotacionado usado novamente → família revogada + evento `REFRESH_REUSE_DETECTED` | Aprovado |
| Armazenamento no cliente | Cookie `HttpOnly; Secure; SameSite=Strict; Path=/api/v1/auth` | Aprovado |

**Tabela:** `refresh_tokens` (ver `V1__init.sql`)

---

## 3. Verificação de E-mail e Reset de Senha (T2)

| Token | Uso | Expiração | Armazenamento |
|---|---|---|---|
| `EMAIL_VERIFY` | Verificação de e-mail no cadastro | 24h | Hash SHA-256 em `email_tokens` |
| `PASSWORD_RESET` | Reset de senha | 1h | Hash SHA-256 em `email_tokens` |

- Uso único (`used_at` preenchido no consumo)
- Hash SHA-256 armazenado (nunca token cru)
- Rate limiting por IP e por conta

---

## 4. Auditoria de Eventos de Autenticação

**Tabela:** `auth_event` (append-only)

| Evento | Quando |
|---|---|
| `LOGIN_OK` | Login bem-sucedido |
| `LOGIN_FAIL` | Falha de credenciais |
| `REGISTER` | Cadastro |
| `EMAIL_VERIFIED` | E-mail verificado |
| `PASSWORD_RESET` | Senha redefinida |
| `REFRESH_ROTATED` | Refresh token rotacionado |
| `REFRESH_REUSE_DETECTED` | Reutilização detectada → família revogada |
| `LOGOUT` | Logout explícito |

Campos: `user_id` (FK opcional), `event_type`, `ip`, `user_agent`, `detail`, `occurred_at`.

---

## 5. Proteção Contra Enumeração

- Respostas de tempo constante em endpoints de login/registro/reset
- Mensagens genéricas ("Se o e-mail existir, enviaremos instruções")
- Rate limiting por IP e por conta em endpoints sensíveis

---

## 6. Papéis e Autorização (USER/ADMIN)

- Papel **sempre lido do banco** na validação do access token (nunca do claim JWT)
- `role` em `users` com `CHECK (role IN ('USER', 'ADMIN'))`
- Autorização de negócio no Spring Security (T2), **não no banco** (RLS é deny-by-default para dados, não para roles de negócio)

---

## 7. Senhas

- BCrypt, custo 10 (configurável via `BCRYPT_COST` env)
- Nunca logadas, nunca em migrations, nunca em código

---

## 8. CSRF

- Desabilitado na T1 (autenticação por header Authorization)
- Na T2, quando refresh token passar a cookie HttpOnly: proteção via `SameSite=Strict` + header customizado obrigatório na rota de refresh (documentado em `SECURITY.md`)

---

## 9. Testes de Concorrência Obrigatórios (T2)

| Cenário | Expectativa |
|---|---|
| Dois refresh simultâneos com mesmo token | Apenas um succeeds; outro recebe erro de reutilização |
| Refresh token reutilizado após rotação | Família inteira revogada + evento `REFRESH_REUSE_DETECTED` |
| Login concorrente mesmo usuário | Ambos succeeds; refresh tokens independentes |
| Reset de senha concorrente | Apenas um token válido; outros invalidados |

---

## 9. Decisões NÃO Tomadas (Pendentes)

| Item | Status |
|---|---|
| Algoritmo de assinatura JWT (RS256 vs HS256) | Pendente — aguarda definição de rotação de chaves |
| Tempo de vida do refresh token (30 dias default) | Configurável via env, não hardcoded |
| Invalidação de access tokens ativos no logout | Pendente — requer blocklist ou versão curta (15min) |
| Device fingerprinting no refresh token | Em avaliação |

---

## Referências

- `backend/src/main/java/com/investfacil/api/auth/` (T2)
- `backend/src/main/resources/db/migration/V1__init.sql` (tabelas `refresh_tokens`, `email_tokens`, `auth_event`)
- `backend/src/main/resources/db/migration/V2__postgres_security.sql` (papéis, RLS)
- `docs/security/SECURITY.md` (políticas CORS/CSRF, princípios)
- `docs/security/PUBLIC_REPOSITORY_AUDIT.md` (auditoria de publicação)