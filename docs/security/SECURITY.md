# SECURITY.md — Invest Fácil

**Status: autenticação e segurança do MVP implementadas e testadas localmente
(20/11/2026). Deploy remoto e provedores externos ainda não validados.**

> **Atualização S2.8 (22/11/2026):** V6 validada no Lab; V7 de hardening local (search_path, EXECUTE mínimo) ainda não aplicada remotamente. 63 testes locais. Ver `docs/verification/S2.8/S2.8_DATABASE_FUNCTION_HARDENING_REPORT.md`.

> **P0.4:** este documento cobre a segurança do **produto**. Segurança de agentes está em
> `docs/engineering/AGENT_SECURITY_POLICY.md`, `AGENT_PERMISSION_MATRIX.md` e
> `P0_3_VERIFICATION.md`; os riscos globais de MCP/shell/browser continuam abertos e não
> são resolvidos por esta política. Fonte de estado: `SOURCE_REGISTRY.md`.

## 1. Princípios

1. **Fail-closed**: qualquer rota exige autenticação por padrão; a superfície
   pública é mínima (health, Swagger, `/error`, catálogo, mercado, auth pública
   e cálculo do simulador).
2. **Falhar rápido, não expor**: sem credenciais em código; a aplicação não sobe
   sem datasource e `JWT_SECRET`.
3. **Erro nunca vaza interno**: envelope `ApiError`; `include-stacktrace: never`;
   detalhes completos apenas no log com traceId.
4. **Privilégio mínimo**: banco com papéis separados; runtime sem DDL; service key
   do Supabase apenas no servidor.
5. **Nenhum segredo versionado** — `SecretsScanTest` falha o build.

## 2. Implementado e verificado

| Medida | Evidência |
|---|---|
| Sessões stateless; API fail-closed (401 sem token) | `SecurityConfig`, `MvpFlowIntegrationTest` |
| JWT HS256 15 min; emissor e propósito validados | `JwtService`, `JwtServiceTest` |
| Refresh opaco 32 bytes; hash SHA-256 no banco; rotação | `RefreshToken`, `AuthService`, migration V3 |
| Detecção de reuso revoga a família inteira | `MvpFlowIntegrationTest` (401 no token antigo e no novo) |
| Papel lido do banco a cada request (não do claim) | `JwtAuthenticationFilter` |
| MFA TOTP (SHA1/6 dígitos/30 s), segredo AES-GCM em repouso, replay rejeitado | `TotpService`, `SecretCipher`, `TotpServiceTest` |
| Setup de MFA exige a senha atual (token roubado sozinho não basta) | `AuthService.setupMfa` + UI |
| Bloqueio temporário após tentativas inválidas, com lock pessimista | `UserService.registerFailedLogin` |
| Login bloqueado enquanto o e-mail não for verificado | `AuthService.login` + teste integrado (403 `EMAIL_NOT_VERIFIED`) |
| Verificação de e-mail e reset com hash, uso único, expiração e lock | `EmailToken`, `EmailTokenRepository`, `EmailService` |
| `auth_event`, `xp_ledger` e `user_achievements` append-only para o runtime | migration V5 + teste de integração |
| Sessões listáveis/revogáveis pelo próprio usuário | `/api/v1/auth/sessions` |
| Senhas BCrypt (custo configurável) | `SecurityConfig`, `BCRYPT_COST` |
| Cookies `HttpOnly`, `Secure` em produção, `SameSite=Strict` | `RefreshCookieService` |
| Refresh por cookie exige `X-Requested-With` | `AuthController` |
| Rate limit por IP+bucket, com `Retry-After` | `RateLimitFilter` |
| `X-Forwarded-For` só é aceito de proxy explicitamente confiável | `ClientIpResolver` + testes |
| CORS com origens explícitas; nunca `*` com credenciais | `SecurityConfig` |
| Headers: frame deny, nosniff, referrer no-referrer, CSP | `SecurityConfig` |
| RLS per-user, FORCE RLS, 68 policies `s24_*`; funções V7 com search_path fixo | V6/V7 + `RlsIsolationIntegrationTest` |
| Upload de vídeo valida MIME, assinatura de container e 50 MB | `VideoService` |
| Bucket privado; URLs assinadas de curta duração | `SupabaseStorageClient`, `docs/supabase/STORAGE_SETUP.sql` |
| Auditoria `auth_event` append-only | `AuthAuditService`, V1 |
| Sem GeoIP | ausência de dependência/código |

## 3. Modelo de tokens

| Token | Formato | Armazenamento | Expiração |
|---|---|---|---|
| Access | JWT HS256 | memória do frontend (nunca localStorage) | 15 min |
| Refresh | opaco 32 bytes | cookie HttpOnly/Secure/SameSite=Strict; hash SHA-256 no banco | 30 dias, rotativo |
| Verificação de e-mail | opaco | hash SHA-256 em `email_tokens` | 24 h, uso único |
| Reset de senha | opaco | hash SHA-256 em `email_tokens` | 1 h, uso único |
| Desafio MFA | JWT propósito `mfa` | resposta do login | 5 min, uso único por código |

- O access token não é revogado no logout; a janela máxima é de 15 minutos. O
  refresh é revogado imediatamente. Para o MVP, é um trade-off aceito.
- O código TOTP é de uso único: o contador é consumido com lock pessimista e um
  código repetido (inclusive concorrente) é rejeitado.
- Setup/enable de MFA exige a senha atual; sem isso, um access token roubado
  poderia cadastrar um autenticador do atacante.
- Não há códigos de recuperação de MFA no MVP; perda do autenticador exige
  intervenção administrativa. Evolução prioritária.

## 4. CSRF, CORS e proxy

- A API usa `Authorization: Bearer` para recursos; o refresh usa cookie.
- `SameSite=Strict` + `X-Requested-With` na rota de refresh reduzem CSRF.
- O frontend chama `/api` no próprio domínio (rewrite do Next), então o cookie é
  first-party. Em produção, `API_PROXY_TARGET` aponta para o Render.
- CORS é uma lista explícita de origens; `allowCredentials=true`; `*` é filtrado.
- `TRUST_PROXY=false` por padrão. Só habilite com `TRUSTED_PROXIES` contendo o IP
  real do proxy; caso contrário, um cliente poderia forjar `X-Forwarded-For`.

## 5. Banco de dados

Detalhes em [../architecture/database.md](../architecture/database.md).

- `investfacil_app` é NOLOGIN (DML); `investfacil_migrate` é LOGIN INHERIT (DDL, owner do schema).
- `investfacil_runtime` é LOGIN INHERIT, membro de `investfacil_app`; senha fora do
  repositório.
- RLS + FORCE nas 18 tabelas; 68 policies `s24_*`; zero `app_rw`; contexto via `set_config(..., true)`.
- Funções V7: search_path vazio e EXECUTE mínimo; PUBLIC/anon/authenticated não executam; apply_table_security foi removida na V7.
- DatabaseSecurityGuard valida V6/V7 e exige a versão declarada em APP_SECURITY_GUARD_EXPECTED_VERSION.
- `flyway_schema_history` sem privilégio de runtime.
- `auth_event`, `xp_ledger` e `user_achievements`: runtime sem `UPDATE`/`DELETE`
  (V5), portanto append-only de fato.
- Papel de teste com `GRANT SELECT` vê 0 linhas — prova da RLS.
- Flyway roda com owner/migrate; runtime não pode executar DDL.

## 6. Upload e vídeos

- Bucket `videos` privado; nenhuma policy pública.
- Upload autenticado como ADMIN, multipart, máximo 50 MB.
- MIME permitido: MP4, WebM, MOV; assinatura do container é verificada.
- Caminho gerado pelo servidor (`videos/{lessonId}/{uuid}.{ext}`), sem nome do
  cliente — evita path traversal.
- Metadados em PostgreSQL; playback por URL assinada de 1 h.
- O arquivo não é gravado no filesystem efêmero do Render.

## 7. Riscos residuais e decisões

| Risco | Nível | Situação |
|---|---|---|
| Rate limit em memória (por instância) | Médio | MVP de 1 instância; limites menos agressivos + lockout por conta; Redis se escalar |
| IP real atrás do proxy do Render | Alto (operacional) | `TRUST_PROXY=false` por padrão; configurar proxy confiável e validar. Sem IP real, o bucket é compartilhado |
| Sem backup codes de MFA | Médio | Suporte manual; evoluir |
| Tokens de verificação/reset em log de dev | Baixo | Só no perfil `dev`; em outros perfis o link não é registrado (erro sem token) |
| Access token ativo por até 15 min após logout | Baixo | Expiração curta; refresh revogado |
| Provedor de e-mail não configurado | Alto (produção) | Configurar Resend + domínio; testar entrega |
| Credenciais Supabase ausentes | Bloqueio | Provisionar e testar upload real |
| Sem antivírus/transcodificação | Médio | Validar assinatura e bucket privado; evoluir |
| CSP pode exigir ajuste no Swagger em produção | Baixo | Validar no deploy |
| Sem teste de carga | Médio | Executar antes da final |
| Auditoria WCAG formal pendente | Médio | Revisão dedicada + axe/Lighthouse |
| Conta demo local | Baixo | Senha via env; desabilitar após a demo |

## 8. Segredos

- `backend/.env.example` documenta variáveis **sem valores**.
- `.env` é proibido no repositório (`.gitignore` + teste).
- `JWT_SECRET`, `APP_MFA_KEY`, `SUPABASE_SERVICE_KEY`, `RESEND_API_KEY` e
  `DEMO_PASSWORD` nunca são versionados.
- Logs de build/teste não são publicados (`*.log` no `.gitignore`).

## 9. Divulgação de vulnerabilidades

Projeto acadêmico (Hack Brasil 2026). Canal de contato:
**`SECURITY_CONTACT_EMAIL_PENDING`** — placeholder explícito, mantido até que o
proprietário forneça o endereço real. Não abra issue pública com detalhes de
exploração antes do contato.
