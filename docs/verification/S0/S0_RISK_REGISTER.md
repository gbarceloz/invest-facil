# S0 — Registro de riscos e incompatibilidades

**Projeto:** Invest Fácil
**Data:** 2026-11-22
**Escopo:** auditoria local + preparação Supabase
**Nenhum risco abaixo foi corrigido nesta missão.**

---

## 1. Resumo por severidade

| Severidade | Quantidade |
|---|---|
| CRITICAL | 1 |
| HIGH | 6 |
| MEDIUM | 7 |
| LOW | 3 |
| INFORMATIONAL | 2 |

---

## 2. Registro

### S0-R-01 — Runtime `NOINHERIT` sem `SET ROLE`

- **Severidade:** CRITICAL
- **Evidência:** `docs/supabase/PROVISION_RUNTIME_ROLE.sql` cria `investfacil_runtime LOGIN NOINHERIT` e concede `investfacil_app`; busca no backend principal não encontrou `SET ROLE`.
- **Impacto:** o runtime não herda os privilégios de `investfacil_app`; leitura/escrita podem falhar e a aplicação não sobe ou não opera.
- **Arquivos:** `docs/supabase/PROVISION_RUNTIME_ROLE.sql`, `V2__postgres_security.sql`, `docs/DEPLOY.md`.
- **Recomendação:** decidir entre `INHERIT` ou `SET ROLE` explícito; testar com um LOGIN real antes de conectar o Render. Não implementar sem aprovação.

### S0-R-02 — RLS sem isolamento por usuário

- **Severidade:** HIGH
- **Evidência:** 18 policies `app_rw` com `USING (true)` e `WITH CHECK (true)`; nenhuma policy usa `user_id` ou `current_setting`.
- **Impacto:** qualquer query futura sem filtro de proprietário pode ler/escrever dados de todos os usuários. A proteção é apenas aplicacional.
- **Arquivos:** `V2__postgres_security.sql`, repositories/services, `docs/architecture/database.md`.
- **Recomendação:** projeto de policy por usuário + contexto transacional + testes A×B no banco; decisão humana antes de produção.

### S0-R-03 — Ausência de `FORCE ROW LEVEL SECURITY` e bypass pelo owner

- **Severidade:** HIGH
- **Evidência:** `relforcerowsecurity=false` em todas as tabelas; owner `postgres`; o datasource de teste usa superuser.
- **Impacto:** se o Supabase usar `postgres`/owner como runtime, a RLS é ignorada. Mesmo com role não-owner, a policy permissiva não separa usuários.
- **Arquivos:** `V2__postgres_security.sql`, `application.yml`, `.env.example`.
- **Recomendação:** runtime não-owner, `FORCE RLS` e policies por usuário; validar em banco descartável.

### S0-R-04 — Credencial de Flyway pode cair no runtime DML

- **Severidade:** HIGH
- **Evidência:** `spring.flyway.url/user/password` usam o datasource como fallback; `render.yaml` marca `SPRING_FLYWAY_*` como `sync: false`.
- **Impacto:** se as variáveis não forem preenchidas, o Flyway tenta DDL com o runtime, falha e o deploy não inicia.
- **Arquivos:** `application.yml`, `render.yaml`, `docs/DEPLOY.md`.
- **Recomendação:** exigir e validar `SPRING_FLYWAY_*` no Render; nunca usar o runtime para migrations.

### S0-R-05 — Privilégios insuficientes do role de migração

- **Severidade:** HIGH
- **Evidência:** V2 faz `CREATE ROLE`, `REVOKE ON SCHEMA` e `CREATE POLICY`; `investfacil_migrate` recebe apenas `USAGE, CREATE` no schema, sem ownership/CREATEROLE.
- **Impacto:** o caminho documentado “LOGIN membro de investfacil_migrate” pode falhar; o Flyway provavelmente precisa do owner/superuser.
- **Arquivos:** `V2__postgres_security.sql`, `PROVISION_RUNTIME_ROLE.sql`, `docs/DEPLOY.md`.
- **Recomendação:** documentar explicitamente que o Flyway deve rodar como owner (ou conceder os privilégios mínimos comprovados) e testar em banco descartável.

### S0-R-06 — Script de runtime usa placeholder `psql`

- **Severidade:** HIGH
- **Evidência:** `ALTER ROLE ... PASSWORD :'runtime_password'`; `DEPLOY.md` manda executar no SQL Editor do Supabase.
- **Impacto:** o script não roda como está no SQL Editor; o provisionamento fica bloqueado ou exige edição manual arriscada.
- **Arquivos:** `docs/supabase/PROVISION_RUNTIME_ROLE.sql`, `docs/DEPLOY.md`.
- **Recomendação:** fornecer script SQL executável no painel, com a senha definida por variável de ambiente/secret fora do repositório.

### S0-R-07 — Conectividade direta/IPv6/pooler não verificada

- **Severidade:** HIGH
- **Evidência:** nenhuma conexão ao Supabase foi feita; `render.yaml` usa Render; o projeto Supabase está em `sa-east-1`.
- **Impacto:** a conexão direta do Supabase pode ser IPv6-only; o Render pode não ter egress IPv6. Flyway via transaction pooler pode não funcionar para DDL.
- **Arquivos:** `application.yml`, `.env.example`, `render.yaml`, `docs/DEPLOY.md`.
- **Recomendação:** testar conexão direta e session pooler a partir do Render; definir `sslmode=require` e, se necessário, IPv4 add-on/pooler.

### S0-R-08 — SSL não explícito nas URLs de exemplo

- **Severidade:** MEDIUM
- **Evidência:** `.env.example` e `DEPLOY.md` mostram `jdbc:postgresql://db...:5432/postgres` sem `sslmode`.
- **Impacto:** o driver pode tentar `prefer`; a conexão pode falhar ou não validar TLS conforme a política do Supabase.
- **Arquivos:** `.env.example`, `docs/DEPLOY.md`.
- **Recomendação:** documentar `?sslmode=require` e validar o certificado.

### S0-R-09 — Região Render `oregon` × Supabase `sa-east-1`

- **Severidade:** MEDIUM
- **Evidência:** `render.yaml` `region: oregon`; briefing Supabase `sa-east-1`.
- **Impacto:** latência adicional em cada query; risco de timeouts e UX pior.
- **Arquivos:** `render.yaml`.
- **Recomendação:** escolher região próxima ou recriar o projeto Supabase; medir latência antes do go-live.

### S0-R-10 — Pooler e prepared statements não validados

- **Severidade:** MEDIUM
- **Evidência:** Hikari/JDBC sem configuração de pooler; docs só citam conexão direta.
- **Impacto:** transaction pooler pode não suportar DDL/Flyway e pode exigir `prepareThreshold=0` para o runtime.
- **Arquivos:** `application.yml`, `docs/DEPLOY.md`.
- **Recomendação:** testar o modo escolhido; usar direct/session para Flyway e validar o runtime no pooler.

### S0-R-11 — Append-only depende de grants, não de trigger

- **Severidade:** MEDIUM
- **Evidência:** V5 revoga UPDATE/DELETE de `investfacil_app`; não há trigger; owner/superuser pode alterar.
- **Impacto:** se o runtime for owner ou receber grants amplos, a promessa “append-only” não vale.
- **Arquivos:** `V5__append_only_ledgers.sql`, `OwnershipSecurityIntegrationTest`/`FlywaySecurityIntegrationTest`.
- **Recomendação:** garantir runtime não-owner e considerar trigger/constraint para invariantes críticas.

### S0-R-12 — Documentação superestima a RLS

- **Severidade:** MEDIUM
- **Evidência:** `database.md`/`SECURITY.md` usam “deny-by-default”; a policy do app é `USING (true)`.
- **Impacto:** leitor pode concluir que há isolamento por usuário quando não há.
- **Arquivos:** `docs/architecture/database.md`, `docs/security/SECURITY.md`.
- **Recomendação:** corrigir a redação em missão documental futura; não alterar agora.

### S0-R-13 — Access token não revogável por 15 min

- **Severidade:** MEDIUM
- **Evidência:** `JwtAuthenticationFilter` valida assinatura/expiração e recarrega o usuário, sem blacklist/versionamento.
- **Impacto:** token roubado continua válido após logout/troca de senha até expirar.
- **Arquivos:** `JwtAuthenticationFilter`, `AuthService`, `JwtService`.
- **Recomendação:** decidir entre TTL menor, `token_version` ou blacklist; não implementar nesta missão.

### S0-R-14 — Rate limit em memória

- **Severidade:** MEDIUM
- **Evidência:** `RateLimitFilter` usa `ConcurrentHashMap` por instância.
- **Impacto:** múltiplas réplicas/restart zeram ou multiplicam limites.
- **Arquivos:** `RateLimitFilter`, `application.yml`.
- **Recomendação:** Redis/gateway para escala; documentar limitação no MVP.

### S0-R-15 — `lesson_articles` órfã

- **Severidade:** LOW
- **Evidência:** tabela e FKs existem; não há entidade/repository/consulta.
- **Impacto:** complexidade e superfície sem uso; pode confundir futuras policies.
- **Arquivos:** `V1__init.sql`, `docs/architecture/database.md`.
- **Recomendação:** remover em migration futura ou documentar como legado; não agora.

### S0-R-16 — Limite de storage inconsistente

- **Severidade:** LOW
- **Evidência:** `STORAGE_SETUP.sql` permite 150 MB; backend limita 50 MB; multipart 55/60 MB.
- **Impacto:** confusão operacional; uploads entre 50 e 150 MB falham no backend.
- **Arquivos:** `docs/supabase/STORAGE_SETUP.sql`, `application.yml`, `.env.example`.
- **Recomendação:** alinhar limites por ambiente; documentar.

### S0-R-17 — Contagens de teste/documentação desatualizadas

- **Severidade:** LOW
- **Evidência:** `DEPLOY.md` cita 28/6 testes; estado atual 47/12. `application.yml` cita V1..V3.
- **Impacto:** checklist de release pode subestimar cobertura.
- **Arquivos:** `docs/DEPLOY.md`, `application.yml`.
- **Recomendação:** atualizar documentação em missão própria; não alterar nesta S0.

### S0-R-18 — Supabase Free: pausa/limites/backup

- **Severidade:** INFORMATIONAL
- **Evidência:** docs citam Free com pausa após inatividade e limites; backup/PITR não documentado.
- **Impacto:** indisponibilidade/recuperação em produção.
- **Arquivos:** `docs/DEPLOY.md`, `docs/FIREBASE_EVALUATION.md`.
- **Recomendação:** definir plano, backup/PITR e alertas antes do go-live.

### S0-R-19 — Frontend desacoplado do banco

- **Severidade:** INFORMATIONAL
- **Evidência:** frontend chama apenas `/api`; nenhum SDK/credencial Supabase; hashes de preservação registrados.
- **Impacto:** positivo; integração de banco não exige mudança visual.
- **Arquivos:** `frontend/lib/api.ts`, `frontend/next.config.ts`.
- **Recomendação:** manter o contrato `/api` e o proxy same-origin.
