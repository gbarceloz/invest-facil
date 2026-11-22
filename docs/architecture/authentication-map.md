# AUTHENTICATION MAP — INVEST FÁCIL

**Escopo:** autenticação, autorização, sessão, MFA, recuperação e isolamento de dados.
**Evidência:** `backend/src/main/java/com/investfacil/api/auth/**`,
`common/security/**`, `config/SecurityConfig.java`, `users/**`, migrations, testes.

---

## 1. Fluxos

### 1.1 Cadastro e verificação

```text
/cadastro
  → POST /api/v1/auth/register
  → AuthController.register
  → AuthService.register
  → UserService.create (BCrypt)
  → EmailToken (hash SHA-256, 24 h)
  → EmailService.sendVerification
  → POST /api/v1/auth/verify-email
  → UserService.markVerified
  → POST /api/v1/auth/login (agora permitido)
```

Regras: e-mail normalizado e único; duplicata retorna 409 genérico; login antes da
verificação retorna `403 EMAIL_NOT_VERIFIED`; token de verificação é de uso único.

### 1.2 Login e sessão

```text
POST /api/v1/auth/login
  → AuthService.login
  → lockout? (users.locked_until)
  → BCrypt.matches
  → verified?
  → MFA enabled? → challenge JWT (5 min) → /mfa/verify
  → issueTokens: access JWT HS256 (15 min) + refresh opaco (30 dias)
  → refresh em cookie HttpOnly/SameSite=Strict/Path=/api/v1/auth
```

`JwtAuthenticationFilter` valida o Bearer, carrega o `User` do banco e cria `ROLE_USER`/
`ROLE_ADMIN`; o claim `role` do JWT não é autoridade. Usuário bloqueado não autentica.

### 1.3 Refresh, rotação e reuso

- O refresh é opaco; o banco guarda apenas SHA-256.
- `POST /auth/refresh` exige cookie (ou `X-Refresh-Token`) e `X-Requested-With`.
- Busca com lock pessimista; token revogado/reusado revoga a família inteira e retorna 401.
- Token expirado é revogado; usuário bloqueado revoga a família.
- `logout` revoga a família e limpa o cookie.

### 1.4 MFA

- `POST /auth/mfa/setup` exige a senha atual, gera segredo e `otpauthUri`;
  segredo é criptografado com AES-GCM (`SecretCipher`).
- `POST /auth/mfa/enable` valida TOTP e ativa.
- Login com MFA retorna `mfaRequired=true` + challenge; `POST /auth/mfa/verify` valida
  TOTP e consome o counter atomicamente (anti-replay).
- `POST /auth/mfa/disable` exige senha + código e consome counter.
- A chave AES vem de `APP_MFA_KEY`; sem ela, deriva do `JWT_SECRET`.

### 1.5 Recuperação e troca de senha

- `forgot-password`: token de reset (1 h, hash, uso único); sempre resposta genérica.
- `reset-password`: consome token, troca hash, revoga **todas** as sessões e invalida
  tokens de reset não usados.
- `change-password`: exige senha atual; revoga todas as sessões e limpa cookie.

### 1.6 Sessões

- `GET /auth/sessions`: lista refresh tokens ativos do usuário, marcando o atual.
- `DELETE /auth/sessions/{id}`: revoga uma sessão do próprio usuário.
- `DELETE /auth/sessions`: revoga todas e limpa cookie.

---

## 2. Autorização por path

`SecurityConfig`:

| Escopo | Regra | Evidência |
|---|---|---|
| Health/Swagger/error | público | `/actuator/health`, `/swagger-ui/**`, `/v3/api-docs/**` |
| Auth pública | `POST` register/login/refresh/logout/verify/resend/forgot/reset/mfa-verify | `SecurityConfig` linhas 62–71 |
| Conteúdo/mercado/bitcoin | público | `/api/v1/content/**`, `/api/v1/market/**`, `/api/v1/bitcoin/**` |
| Cálculo do simulador | público | `POST /api/v1/simulator/calculate` |
| Admin | `ROLE_ADMIN` | `/api/v1/admin/**` |
| Demais API | autenticado | `/api/v1/**` |

Não há `@PreAuthorize`/permissions granulares; a autorização é por path + ownership nos
services/repositories. O frontend não é autoridade: `AppShell` é apenas guard de UX.

---

## 3. Matriz de acesso (roles reais)

Roles existentes: `USER`, `ADMIN` (`users.role`, check constraint).

| Role | Recurso | Read | Create | Update | Delete | Evidência |
|---|---|---|---|---|---|---|
| `USER` | conteúdo/mercado/bitcoin | sim | não | não | não | path público |
| `USER` | próprio perfil | sim | — | sim | não | `UserController` + principal |
| `USER` | próprio progresso/quiz/XP | sim | sim | sim (idempotente) | não | principal + repositórios |
| `USER` | próprios cenários | sim | sim | não | sim (próprio) | `SimulatorService.delete` |
| `USER` | próprias sessões | sim | — | — | sim (própria) | `AuthService.sessions/revoke` |
| `USER` | admin videos | não | não | não | não | `/api/v1/admin/**` |
| `ADMIN` | admin videos | sim | sim (upload) | — | não | `VideoController` + role |
| `ADMIN` | demais próprios dados | sim | sim | sim | conforme acima | mesmas regras de USER |

**Não há** roles de instrutor, moderador, suporte ou permissões por recurso além de
`ADMIN`. Não inventar matriz granular.

---

## 4. Ownership e isolamento

| Recurso | Filtro de ownership | Evidência |
|---|---|---|
| Perfil | `principal.id()` | `UserController` |
| Progresso/conclusão | `userId` do principal | `ProgressService` |
| Quiz | `userId` do principal | `ProgressService` |
| Gamificação | `userId` do principal | `GamificationService` |
| Sessões | `userId` do principal | `AuthService.revokeSession` |
| Cenários | `userId` + checagem no delete | `SimulatorService` |
| Vídeo admin | role ADMIN | `SecurityConfig` |
| Conteúdo/mercado | público, sem ownership | `SecurityConfig` |

**RLS:** as 18 tabelas usam RLS + FORCE e 68 policies `s24_*`; o runtime herda `investfacil_app` e o contexto transacional (``set_config``) define o usuário. A V6 foi validada no Lab; a V7 endurece `search_path`/EXECUTE e ainda não foi aplicada remotamente.

---

## 5. Testes existentes

| Cenário | Teste | Cobertura |
|---|---|---|
| Cadastro válido/inválido | `RegisterValidationTest` (3) | validação de DTO |
| Login/verificação/bloqueio | `MvpFlowIntegrationTest` | jornada |
| Refresh rotação/reuso | `MvpFlowIntegrationTest` | 401 + família revogada |
| Reset de senha | `MvpFlowIntegrationTest` | token único + login nova senha |
| JWT/MFA challenge | `JwtServiceTest` (4) | assinatura, propósito, expiração, segredo fraco |
| TOTP | `TotpServiceTest` (3) | RFC 6238, janela, replay base |
| RLS/DDL/append-only | `FlywaySecurityIntegrationTest` (5) | banco |
| IP/proxy | `ClientIpResolverTest` (3) | XFF |
| Segredos | `SecretsScanTest` (2) | subtree backend |

**Lacunas:** MFA integrado (setup→login→verify→replay) ainda não é teste automatizado; sessões/change-password/PATCH perfil não têm teste; cookie real em HTTPS/browser não foi testado. A autorização ADMIN e o A×B são cobertos por `VideoAdminIntegrationTest` e `RlsIsolationIntegrationTest`.

---

## 6. Achados e riscos

1. **RLS per-user (V6)** - policies `s24_*` e FORCE RLS; a V7 endurece funções e ainda não foi aplicada no Lab.
2. **Sem revogação de access token** — access JWT vale até 15 min após logout/troca de senha.
3. **MFA key derivada do JWT_SECRET** se `APP_MFA_KEY` ausente; separação de chaves é
   recomendada.
4. **Rate limit em memória** — por instância; não distribuído.
5. **Sem CSRF token** — mitigado por SameSite=Strict + `X-Requested-With` no refresh;
   demais mutações usam Bearer, não cookie.
6. **Frontend guard é client-side** — não é controle de segurança; backend é a autoridade.
7. **Cookie real não testado** em HTTPS/proxy; `TRUST_PROXY` default false.
8. **ADMIN/ownership cobertos** por `VideoAdminIntegrationTest` e `RlsIsolationIntegrationTest` (S2.6/S2.7); MFA integrado ainda é lacuna.
