# RELEASE READINESS — Invest Fácil

**Atualizado: 20/11/2026** · Branch local: `feat/mvp-completo`
**Veredito:** pronto para demonstração local; **não** validado em produção.

## 1. O que está implementado e verificado

| Item | Evidência |
|---|---|
| Backend Spring Boot 3.5.6 / Java 21 / Maven | build local |
| PostgreSQL 17 + Flyway V1–V5 | Testcontainers, banco limpo |
| RLS deny-by-default, app sem DDL, ledgers append-only, guest vê 0 linhas | `FlywaySecurityIntegrationTest` 5/5 |
| API fail-closed; públicos mínimos | `SecurityConfig`; 401 sem token no teste integrado |
| JWT 15 min; refresh opaco com hash/rotação/reuso | `JwtServiceTest`, `MvpFlowIntegrationTest` |
| Cadastro, verificação, login, logout, sessões | fluxo integrado; login bloqueado até verificar o e-mail |
| MFA TOTP (segredo AES-GCM, anti-replay, setup com senha) | `TotpServiceTest` + teste manual de API (setup/enable → login → verify → replay 401 → disable) |
| Reset de senha com invalidação de sessões | teste integrado: token de reset → nova senha → login |
| Rate limit + IP sem confiar em XFF | `RateLimitFilter`, `ClientIpResolverTest` |
| Conteúdo: 8 categorias, 8 módulos, 19 aulas, 38 questões, 6 artigos | seed + teste integrado |
| Progresso idempotente, quizzes, XP, níveis, conquistas | `MvpFlowIntegrationTest`; UI local |
| Simulador de juros compostos + cenários salvos | `SimulatorServiceTest`; UI local |
| Frontend Next.js 16, 16 páginas + not-found, build de produção | `npm run build` |
| Integração real frontend↔backend | login, aula, quiz, simulador e perfil no browser |
| CI, Dockerfile, Render/Vercel runbook | `.github/workflows/ci.yml`, `docs/DEPLOY.md`; imagem Docker buildada e health 200 |
| Ausência de segredos versionados | `SecretsScanTest` 2/2 |

**Testes:** 28 backend (0 falhas/0 skipped) + 6 frontend.

## 2. O que está implementado, mas NÃO verificado em ambiente real

| Item | Por que não foi verificado | O que falta |
|---|---|---|
| Upload/playback Supabase Storage | sem credenciais do projeto | provisionar bucket, testar upload e URL assinada |
| Envio de e-mail (verificação/reset) | sem Resend/domínio | configurar `MAIL_ENABLED=true`, API key e testar entrega |
| Deploy Render | sem conta/serviço | criar serviço, envs, health, cookie Secure |
| Deploy Vercel | sem conta/projeto | configurar `API_PROXY_TARGET` e testar E2E |
| MFA ponta a ponta na UI | teste unitário do TOTP; UI manual pendente | roteiro E2E com app autenticador |
| Rate limit sob carga | sem teste de carga | k6/Autocannon e ajuste de limites |
| Backup/restore | sem Supabase | PITR/dump testado |
| Acessibilidade WCAG formal | revisão visual apenas | axe/Lighthouse + correções |

## 3. O que NÃO está implementado (não apresentar como pronto)

- IA comportamental/“Professor” (placeholder “em breve”).
- Painel administrativo de conteúdo (upload de vídeo via API já existe).
- Notificações, e-mail marketing, push.
- App mobile nativo.
- Recuperação de conta por suporte, exclusão de conta e retenção legal.
- Certificados, assinatura, pagamentos.
- Market data em tempo real/streaming (decisão: REST + cache).
- Múltiplas instâncias com rate limit distribuído.

## 4. Pendências do proprietário

1. Criar/provisionar Supabase (banco + Storage) e fornecer credenciais por env.
2. Criar conta Render e Vercel; configurar domínios.
3. Criar conta Resend e verificar domínio.
4. Fornecer vídeos educativos (≤3 min) e direitos de uso.
5. Definir e-mail real de contato de segurança (substituir
   `SECURITY_CONTACT_EMAIL_PENDING`).
6. Autorizar commit/push/merge da branch `feat/mvp-completo`.
7. Autorizar deploy e executar o checklist de release.

## 5. Checklist de demonstração

- [x] Landing, login, dashboard, aula, quiz, simulador, progresso, mercado,
      biblioteca e perfil navegáveis localmente.
- [x] Conteúdo em português, sem promessa de rentabilidade.
- [x] Avisos de simulação e de mercado informativo.
- [x] Testes backend/frontend verdes.
- [x] Plano B para mercado/vídeo/backend no roteiro de demo.
- [ ] Ensaio cronometrado com a conta demo.
- [ ] Deploy validado (condicionado às credenciais).
- [ ] Rotação/desabilitação da conta demo após a final.

## 6. Riscos de release

| Risco | Mitigação |
|---|---|
| Serviço gratuito do Render hibernar | aquecer antes da demo; plano B local |
| Supabase free tier limitar conexões | Hikari pool 5; monitorar |
| Cookie Secure/SameSite no domínio errado | usar proxy `/api` same-origin; validar DevTools |
| CORS/proxy mal configurado | `API_PROXY_TARGET` explícito; testar E2E |
| E-mail cair em spam | domínio verificado, SPF/DKIM no Resend |
| Vídeo grande/formatos | limite 50 MB; MP4/WebM; validar assinatura |
| Conta demo exposta | senha via env; desabilitar após a demo |
