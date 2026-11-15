# SECURITY.md — Invest Fácil

**Status: baseline implementada na T1 | Seções T2 marcadas como planejadas**

## 1. Princípios

1. **Fail-closed**: qualquer rota da API exige autenticação por padrão;
   superfície pública mínima (`/actuator/health/**`, Swagger).
2. **Falhar rápido, não expor**: sem credenciais em código ou repositório;
   a aplicação não sobe sem datasource configurado.
3. **Erro nunca vaza interno**: envelope único `ApiError` com mensagem genérica;
   `include-stacktrace: never`; detalhes completos apenas no log (com traceId).
4. **Nenhum segredo em arquivo versionado** — verificado por teste automatizado
   (`SecretsScanTest` falha o build em caso de padrão de credencial).

## 2. Implementado na T1 (verificado por build e testes)

| Medida | Evidência |
|---|---|
| Sessões stateless (sem cookies de sessão) | `SecurityConfig` |
| API fechada por padrão (403 sem token) | teste de runtime, 403 em `/api/v1/users/me` |
| Senhas: BCrypt (custo 10) | `SecurityConfig` |
| CORS: origens explícitas por env, nunca `*` com credenciais | `SecurityConfig` + `CORS_ALLOWED_ORIGINS` |
| Form login / HTTP Basic desabilitados | `SecurityConfig` |
| Papéis de banco NOLOGIN, RLS deny-by-default, validada com papel de teste distinto | `FlywaySecurityIntegrationTest` (PostgreSQL real) |
| Schema do app não exposto via PostgREST | `V2__postgres_security.sql` |
| App não pode executar DDL no banco (papel app) | teste `investfacilAppNaoPodeExecutarDDL` |
| Sem identificação por geolocalização (GeoIP removido) | ausência em dependências e migrations |
| Auditoria de eventos de autenticação (`auth_event`), append-only | `V1__init.sql` |

## 3. Autenticação (T2 — planejada, não implementada)

- **Access token**: JWT, expiração 15 min, assinado com segredo ≥ 32 bytes
  (gerado fora do repositório, via env `JWT_SECRET`).
- **Refresh token**: opaco, 32 bytes aleatórios; banco guarda **apenas**
  SHA-256; rotação a cada uso (`replaced_by`), revogação por usuário e
  **detecção de reuso** (token já rotacionado usado de novo → família revogada
  + evento em `auth_event`).
- **Papel do usuário**: sempre lido do banco — nunca de claim do JWT, nunca de
  input do cliente.
- **Rate limiting**: login/refresh/reset com limite por IP e por conta (T2).
- **Verificação de e-mail e reset de senha**: tokens de uso único com hash
  SHA-256 em banco e expiração (tabela `email_tokens` já criada).

## 4. Armazenamento de tokens no navegador (T2)

| Token | Onde | Por quê |
|---|---|---|
| Access (JWT 15 min) | memória do app (não localStorage) | reduz janela de XSS |
| Refresh (opaco) | cookie `HttpOnly; Secure; SameSite=Strict; Path=/api/v1/auth` | inacessível a JS; SameSite bloqueia envio cross-site |

- **CSRF**: desabilitado como mecanismo de cookie de sessão — a API usa
  `Authorization: Bearer` (header). Como o refresh trafegará em cookie, a
  rota de refresh exigirá header customizado (`X-Requested-With`) +
  `SameSite=Strict`, e será documentada como exceção controlada.
- **CORS**: lista explícita de origens por env. Nunca `*` junto a
  `allowCredentials`. Origens de produção separadas das de desenvolvimento.

## 5. Segurança do PostgreSQL

Detalhada em [../architecture/database.md](../architecture/database.md)
(papéis, privilégios, RLS, Procedimento de provisionamento). Resumo:

- schema `investfacil` não exposto via PostgREST;
- separação migrate (DDL) / app (DML); senhas fora do repositório;
- RLS negada por padrão, validada com papéis de teste distintos;
- nenhuma dependência de credencial superuser em runtime;
- autorização USER/ADMIN é responsabilidade do Spring Security.

## 6. Upload e leitura de vídeos (T3+)

Bucket privado no Supabase Storage; acesso **somente** por URL assinada com
TTL curto; upload pelo cliente via URL de assinatura (o servidor nunca recebe
o arquivo pela heap). Validação de tipo/tamanho na criação do asset.

## 7. Gestão de segredos e auditoria

- `backend/.env.example` documenta variáveis estruturais **sem valores**.
- `.env` é proibido no repositório (`.gitignore` + teste).
- Auditoria para publicação pública:
  [PUBLIC_REPOSITORY_AUDIT.md](PUBLIC_REPOSITORY_AUDIT.md).

## 8. Divulgação de vulnerabilidades

Projeto acadêmico (Hack Brasil 2026). Canal de contato:
**`SECURITY_CONTACT_EMAIL_PENDING`** — placeholder explícito, mantido até que
o proprietário forneça o endereço real (decisão do proprietário: usar um
e-mail real; o endereço ainda não foi fornecido e não será inferido ou
copiado de nenhum arquivo). Substituir este marcador antes da publicação.
Não abrir issue pública com detalhes de exploração.
