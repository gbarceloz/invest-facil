# Deploy — Invest Fácil

Este runbook descreve o caminho recomendado para publicar o produto sem expor
credenciais e sem quebrar o modelo de segurança do banco.

## 1. Topologia

```
Vercel (Next.js)  --/api rewrite-->  Render (Spring Boot)  -->  Supabase PostgreSQL
                                              |
                                              +--> Supabase Storage (bucket privado "videos")
```

- O frontend chama `/api` no próprio domínio. O rewrite do Next encaminha para
  o Render, então o cookie de refresh continua **first-party** e
  `SameSite=Strict` funciona.
- O backend é a única porta de acesso ao schema `investfacil`.
- PostgREST não expõe o schema (V2 revoga `anon`/`authenticated`).

## 2. Supabase

1. Crie o projeto PostgreSQL (região próxima dos usuários).
2. Anote a conexão **direta** (porta 5432), não apenas o pooler.
3. Execute `docs/supabase/PROVISION_RUNTIME_ROLE.sql` no SQL Editor para criar
   `investfacil_runtime` (membro de `investfacil_app`). A senha fica só no
   provedor.
4. Execute `docs/supabase/STORAGE_SETUP.sql` para criar o bucket privado
   `videos`.
5. Configure no Render:
   - `SPRING_DATASOURCE_URL` / `USERNAME` / `PASSWORD` do runtime (DML).
   - `SPRING_FLYWAY_URL` / `USER` / `PASSWORD` do owner ou de um LOGIN membro de
     `investfacil_migrate` (DDL). Sem isso, o Flyway tenta usar o runtime e
     falha — comportamento correto de privilégio mínimo.
6. Rode a aplicação uma vez para o Flyway aplicar V1–V5 e o seed de conteúdo.

> **Nunca** use `ddl-auto=update`. O schema é exclusivamente Flyway
> (`ddl-auto=validate`).

## 3. Render (backend)

1. Crie um Web Service a partir do repositório, runtime Docker,
   `backend/Dockerfile`, health check `/actuator/health`.
2. Preencha as variáveis do `render.yaml` (as marcadas `sync: false`).
3. Gere `JWT_SECRET` (48 bytes Base64) e `APP_MFA_KEY` (32 bytes Base64) no
   painel. Não reutilize valores locais.
4. `EXPOSE_DEV_TOKENS=false`, `MAIL_ENABLED=true` e `RESEND_API_KEY` em
   produção. Sem isso, links de verificação não são enviados.
5. `CORS_ALLOWED_ORIGINS` pode ficar com o domínio do Vercel; o proxy torna o
   tráfego same-origin, mas a configuração explícita evita liberar `*`.
6. Valide:
   - `GET /actuator/health` → `UP`.
   - `GET /v3/api-docs` → 200.
   - `GET /api/v1/progress/summary` sem token → 401 (fail-closed).
   - `GET /api/v1/content/categories` → 200 com 8 trilhas.
   - Swagger UI abre sem erros de CSP.
7. **Proxy e rate limit:** `TRUST_PROXY=false` é o padrão seguro. Se o Render
   encaminhar `X-Forwarded-For`, configure `TRUST_PROXY=true` e
   `TRUSTED_PROXIES` apenas com os IPs do proxy (não use `*`). Sem isso, o bucket
   de rate limit é compartilhado pelo IP do proxy; o lockout por conta continua
   protegendo login, mas monitore 429 e ajuste. Não confie em header enviado
   diretamente pelo cliente.

## 4. Vercel (frontend)

1. Importe o repositório, root `frontend/`.
2. Configure `API_PROXY_TARGET=https://<seu-servico>.onrender.com`.
3. Build `npm run build`; output Next.js padrão.
4. O rewrite `/api/:path*` mantém cookies e evita CORS no navegador.
5. Teste o fluxo completo: cadastro → verificação (e-mail) → login → aula →
   quiz → simulador → logout.

## 5. Vídeos

1. Crie o bucket privado `videos` (script acima).
2. Faça login como ADMIN. Crie/verifique o usuário pelo fluxo normal e promova-o
   no banco como owner (a promoção não é exposta pela API):

```sql
UPDATE investfacil.users
SET role = 'ADMIN'
WHERE lower(email) = lower('admin@seudominio.com');
```

   Depois use:

```http
POST /api/v1/admin/videos/{lessonId}
Content-Type: multipart/form-data
Authorization: Bearer <access token>

file=<mp4/webm/mov até 50 MB>
```

3. O backend valida MIME, assinatura do container, tamanho e envia ao Storage
   usando a service role key (somente no servidor). O objeto nunca passa pelo
   filesystem efêmero do Render.
4. A reprodução usa `GET /api/v1/content/lessons/{slug}/video`, que devolve uma
   URL assinada de curta duração.

Sem credenciais do Supabase, o player exibe “vídeo em preparação”. Isso é
intencional: nenhum vídeo fictício é apresentado como publicado.

## 6. Rollback

- O deploy do Render mantém o build anterior; use “Rollback” no painel.
- Migrations são forward-only. Antes de uma migration destrutiva, faça backup
  no Supabase (Point-in-Time Recovery ou dump).
- Nunca execute `DROP`/`TRUNCATE` em produção sem backup e janela combinada.

## 7. Checklist de release

- [ ] `mvn -B clean verify` verde (28 testes, incluindo Testcontainers).
- [ ] `npm test` verde (6 testes) e `npm run build` verde.
- [ ] Health check `UP` no ambiente publicado.
- [ ] Swagger e `/v3/api-docs` públicos.
- [ ] Rota protegida sem token → 401.
- [ ] Cadastro/login/refresh/logout testados no domínio publicado.
- [ ] Cookie `HttpOnly`, `Secure`, `SameSite=Strict` conferido no DevTools.
- [ ] Nenhum segredo em `git grep`/histórico.
- [ ] Conta demo desabilitada ou com senha rotacionada após a apresentação.
