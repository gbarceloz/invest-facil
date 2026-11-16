# Skill: invest-facil-db-rules

## Regras de Banco de Dados — Invest Fácil

> **Decisões aprovadas (T1):** O que está definido e não deve ser alterado sem autorização do arquiteto (GLM).
> **Propostas pendentes:** O que está em discussão ou planejado para T2+.

---

## 1. Princípios Fundamentais

| Regra | Descrição |
|---|---|
| **Flyway = única fonte de verdade** | Todo schema nasce de migrations versionadas em `backend/src/main/resources/db/migration/`. `spring.jpa.hibernate.ddl-auto=validate` — Hibernate **apenas valida**, nunca cria ou altera. |
| **Migrations imutáveis** | `V1__init.sql`, `V2__postgres_security.sql` já aplicadas em ambientes compartilhados **não devem ser editadas**. Novas mudanças = nova migration (`V3`, `V4`, ...). |
| **Schema dedicado** | `investfacil` (isolado do `public`). |
| **PostgreSQL puro** | Migrations usam **apenas recursos padrão do PostgreSQL 17** — sem extensões proprietárias do Supabase. O schema roda igual em local (Testcontainers) e no Supabase. |

---

## 2. Modelo de Papéis e Privilégios (V2)

| Papel | Tipo | Escopo | Senha |
|---|---|---|---|
| `investfacil_app` | `NOLOGIN` | DML (SELECT/INSERT/UPDATE/DELETE) em todas as tabelas do schema | ❌ |
| `investfacil_migrate` | `NOLOGIN` | DDL (USAGE, CREATE no schema) — usado pelo Flyway quando configurado | ❌ |
| `investfacil_test_guest` | `NOLOGIN` | `GRANT SELECT` de propósito — **existe apenas para provar que a negação vem da RLS** (0 linhas mesmo com GRANT SELECT) | ❌ |
| `investfacil_runtime` | `LOGIN` (provisionamento) | Membro de `investfacil_app` (DML) | **Fora do repositório** (provisionamento manual/automatizado fora do código) |

**Senhas NUNCA em migrations.** O papel de runtime é provisionado fora do repositório (`GRANT investfacil_app TO investfacil_runtime;` documentado em `.env.example`).

---

## 3. Camadas de Proteção (Defesa em Profundidade)

### 3.1 PostgREST — Schema Não Exposto
```sql
REVOKE ALL ON SCHEMA investfacil FROM PUBLIC;
REVOKE ALL ON SCHEMA investfacil FROM anon, authenticated; -- se existirem
```
O acesso total do `investfacil_app` **não** protege contra vazamento via PostgREST — o que impede exfiltração via PostgREST é a **revogação do schema**; o que limita o papel de runtime é a **RLS**.

### 3.2 Privilégio Mínimo
- `investfacil_app` = DML apenas (sem DDL)
- `investfacil_migrate` = DDL apenas (Flyway)
- `flyway_schema_history` **não recebe privilégio** de nenhum papel de runtime

### 3.3 RLS Deny-by-Default
- Habilitada em **todas as tabelas de aplicação** (`ENABLE ROW LEVEL SECURITY`)
- **Única policy**: `app_rw ... TO investfacil_app USING (true) WITH CHECK (true)`
- Papéis sem policy veem **0 linhas** mesmo com `GRANT SELECT` — **validado por teste** com papel `investfacil_test_guest` (`FlywaySecurityIntegrationTest`)

### 3.4 Autorização de Negócio (USER/ADMIN)
- Responsabilidade do **Spring Security** (T2), **não do banco**
- RLS protege dados; Spring Security protege endpoints e regras de negócio (USER/ADMIN)

---

## 4. Auditoria e Dados Sensíveis

- **Senhas NUNCA em migrations** — provisionamento de `investfacil_runtime` fora do repositório
- `password_hash` em `users` = BCrypt (custo 10)
- Tokens: apenas **hash SHA-256** armazenado (`refresh_tokens.token_hash`, `email_tokens.token_hash`)
- Auditoria append-only em `auth_event` (IP/UA como sinais, nunca mecanismo único de identificação)
- **GeoIP removido** — nenhuma identificação por geolocalização

---

## 5. Migrations Aplicadas (T1)

| Arquivo | Descrição |
|---|---|
| `V1__init.sql` | 17 tabelas: identidade (`users`, `refresh_tokens`, `email_tokens`, `auth_event`), conteúdo (`categories`, `modules`, `lessons`, `video_assets`, `articles`, `lesson_articles`), progresso/gamificação (`user_progress`, `quiz_questions`, `quiz_attempts`, `quiz_attempt_answers`, `xp_ledger`, `achievements`, `user_achievements`) |
| `V2__postgres_security.sql` | Papéis, grants, RLS, `flyway_schema_history` revogado |

**Regra de evolução:** Toda mudança = nova migration (`V3`, `V4`...). Índices e constraints fazem parte da migration que cria a tabela. Função `apply_table_security()` é referência; novas migrations devem repetir o padrão (excluindo `flyway_schema_history`).

---

## 6. Variáveis de Conexão (Nenhuma com Valor Real Versionado)

| Variável | Uso | Preenchida Em |
|---|---|---|
| `SPRING_DATASOURCE_URL` | JDBC do PostgreSQL runtime (`investfacil_app`) | `.env` local / painel do provedor |
| `SPRING_DATASOURCE_USERNAME` / `PASSWORD` | Login de runtime | idem |
| `SPRING_FLYWAY_URL/USER/PASSWORD` | Opcional: separar conexão DDL do Flyway | idem |

Exemplo estrutural: `backend/.env.example` (sem valores reais).

---

## 7. Relacionamento Spring Boot ↔ PostgreSQL ↔ Supabase

| Componente | Papel |
|---|---|
| **Spring Boot** | Acessa banco exclusivamente por JDBC (Hikari) com Hibernate em `validate` — DDL **só** do Flyway |
| **PostgreSQL** | Banco de fato: schema `investfacil`, migrations, modelo de papéis/RLS — PostgreSQL puro, sem recursos proprietários |
| **Supabase** | Hospedagem gerenciada desse PostgreSQL (mesmo protocolo, connection string comum) + **Storage** para vídeos. **Supabase Auth NÃO é usado** (autenticação é do próprio backend). **PostgREST NÃO expõe** o schema do app (revogado em V2). |

### Procedimento de Aplicação de Migrations (Quando Supabase Existir)

1. Provisionar no Supabase (painel/SQL editor, senha forte, fora de arquivos versionados):
   - Papéis de grupo (já criados por V2, se aplicável)
   - Um LOGIN de runtime membro de `investfacil_app` (DML) e, opcionalmente, um LOGIN de migração membro de `investfacil_migrate` (DDL)
2. Configurar variáveis de conexão apenas no ambiente de execução (`.env` local / painel do provedor)
3. Executar a aplicação (ou `mvn flyway:migrate`): Flyway aplica V1+V2 automaticamente em banco limpo e registra histórico em `investfacil.flyway_schema_history`
4. Validar: tabela `flyway_schema_history` com `success = true` e teste de papel guest vendo 0 linhas (RLS deny-by-default)

---

## 8. Decisões NÃO Tomadas (Pendentes)

| Item | Status |
|---|---|
| Projeto Supabase criado | Não — provisionamento é etapa do proprietário |
| Credenciais Supabase configuradas | Não — credenciais do proprietário, fora do repositório |
| Migrations aplicadas remotamente | Não — etapa do proprietário |
| Pool de conexões Supabase (PgBouncer) | A definir — compatibilidade com Hikari |
| Backup/Point-in-time recovery | A definir — responsabilidade do proprietário |

---

## 9. Referências

- `backend/src/main/resources/db/migration/V1__init.sql`
- `backend/src/main/resources/db/migration/V2__postgres_security.sql`
- `backend/src/main/resources/application.yml` (configuração `spring.datasource`, `spring.flyway`)
- `backend/.env.example` (estrutura de variáveis)
- `docs/architecture/database.md` (decisões detalhadas)
- `docs/security/SECURITY.md` (modelo de segurança)
- `docs/security/PUBLIC_REPOSITORY_AUDIT.md` (auditoria)
- `backend/src/test/java/com/investfacil/api/FlywaySecurityIntegrationTest.java` (validação real)