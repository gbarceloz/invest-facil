# INTEGRATION MAP — INVEST FÁCIL

**Regra:** integração configurada ≠ integração operacionalmente verificada.
**Evidência:** `AppProperties`, `application.yml`, clients e testes; nenhum valor secreto
foi copiado.

---

## 1. Integrações

| ID | Integração | Direção | Configuração | Uso no código | Autenticação | Falha/fallback | Status |
|---|---|---|---|---|---|---|---|
| INT-01 | PostgreSQL 17 | API → DB | `SPRING_DATASOURCE_URL/_USERNAME/_PASSWORD`; Flyway URL | JPA + Flyway | credenciais de runtime | aplicação não sobe sem datasource | **TESTED** (Testcontainers); remoto NOT VERIFIED |
| INT-02 | Next.js rewrite | Browser → API | `API_PROXY_TARGET` (default `http://localhost:8081`) | `next.config.ts` | cookie same-origin | erro de rede exibido pela UI | **TESTED** local (build), sem E2E |
| INT-03 | Supabase Storage | API → Supabase | `SUPABASE_URL`, `SUPABASE_SERVICE_KEY`, bucket, `SUPABASE_SIGNED_URL_SECONDS` | `SupabaseStorageClient` upload/signedUrl | service role key no servidor | `BusinessException.unavailable`; fallback `external_url`/demo | **IMPLEMENTED**, NOT VERIFIED (sem credenciais) |
| INT-04 | Resend | API → Resend | `MAIL_ENABLED`, `RESEND_API_KEY`, `MAIL_FROM` | `EmailService.sendVerification/sendPasswordReset` | Bearer API key | log de fallback; não derruba cadastro/reset | **IMPLEMENTED**, NOT VERIFIED (sem chave) |
| INT-05 | Binance | API → Binance | `MARKET_ENABLED`, `MARKET_BASE_URL` | `MarketService.fetch` (BTC/ETH/SOL) | pública, sem key | `UNAVAILABLE` (lista vazia), cache 30 s | **IMPLEMENTED**, NOT VERIFIED live |
| INT-06 | Frankfurter FX | API → Frankfurter | `MARKET_FX_URL` | `MarketService.fetchFx` | pública | fallback `5.00` BRL/USD | **IMPLEMENTED**, NOT VERIFIED live |
| INT-07 | CoinGecko | API → CoinGecko | `BITCOIN_MARKET_ENABLED`, `BITCOIN_MARKET_BASE_URL` | `BitcoinMarketService` (simple price + charts) | pública, sem key | `STALE` se há último sucesso; senão `UNAVAILABLE`; cache 120 s | **IMPLEMENTED**, NOT VERIFIED live |
| INT-08 | Render | deploy backend | `render.yaml`, `docs/DEPLOY.md` | runbook | credenciais do proprietário | — | **NOT DEPLOYED** |
| INT-09 | Vercel | deploy frontend | `API_PROXY_TARGET`, runbook | runbook | credenciais do proprietário | — | **NOT DEPLOYED** |

---

## 2. Fluxo de falha

- **Market:** exceção → `fallback()` → `MarketResponse(assets=[], status=UNAVAILABLE)`;
  a UI não inventa cotação.
- **Bitcoin:** exceção → último sucesso (`STALE`) ou `UNAVAILABLE`; gráficos vazios.
- **Supabase:** se `isConfigured()=false`, playback tenta `external_url` e depois
  `VIDEO_DEMO_URL`; upload retorna erro `unavailable`.
- **Resend:** se desabilitado/sem chave, não envia; em dev registra link, fora de dev não
  registra token cru; cadastro/reset continuam.
- **DB:** falha de conexão impede startup; Flyway falha o boot.

---

## 3. Configuração por ambiente (sem valores)

| Variável | Efeito | Default |
|---|---|---|
| `SPRING_DATASOURCE_URL` | conexão JPA | vazio (obrigatório) |
| `JWT_SECRET` | assinatura HS256 | vazio (obrigatório) |
| `APP_MFA_KEY` | chave AES-GCM do TOTP | derivada do JWT |
| `COOKIE_SECURE` | cookie Secure | `true` |
| `TRUST_PROXY` / `TRUSTED_PROXIES` | X-Forwarded-For | `false` / vazio |
| `MAIL_ENABLED` / `RESEND_API_KEY` | e-mail real | `false` / vazio |
| `SUPABASE_URL` / `SUPABASE_SERVICE_KEY` | Storage | vazio |
| `VIDEO_DEMO_URL` | fallback de vídeo | vazio |
| `MARKET_ENABLED` / `BITCOIN_MARKET_ENABLED` | cotações | `true` |
| `RATE_LIMIT_ENABLED` | rate limit | `true` |

Nenhum segredo real foi lido, copiado ou documentado.

---

## 4. Status e limites

- **Verificado localmente:** PostgreSQL via Testcontainers; rewrite/build Next; health do
  backend em execução histórica; Docker build histórico.
- **Não verificado:** Supabase, Resend, Binance, Frankfurter, CoinGecko, Render, Vercel,
  cookie Secure em HTTPS, CORS real, rate limit atrás de proxy real.
- **Acoplamentos:** `MarketService`/`BitcoinMarketService` são síncronos no request;
  cache em memória por instância; sem circuit breaker persistente.
- **Segurança:** service role key do Supabase só no servidor; nunca no frontend.
