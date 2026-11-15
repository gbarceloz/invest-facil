# Banco de dados — Invest Fácil

**Status: DECISÃO APROVADA | Fonte única do schema: Flyway**

## 1. Decisão Flyway (fonte única de verdade)

Todo o schema do Invest Fácil nasce de migrations Flyway versionadas em
`backend/src/main/resources/db/migration/`:

- `V1__init.sql` — 17 tabelas do domínio (schema `investfacil`).
- `V2__postgres_security.sql` — papéis, privilégios e RLS.

O Hibernate roda com `spring.jpa.hibernate.ddl-auto=validate`: **valida, nunca
cria ou altera**. Não existe e não deve existir um caminho alternativo de DDL.

## 2. Decisão sobre Supabase (documentada, não executada)

O banco de produção será o PostgreSQL do **Supabase**, mas:

- **Flyway permanece a única fonte de verdade.** Nenhuma migration duplicada
  será mantida em `supabase/migrations` sem aprovação expressa do
  proprietário — dois caminhos de DDL são risco de divergência de schema.
- O schema lógico (`investfacil`) é próprio da aplicação e **não** depende de
  recursos exclusivos do Supabase; ele roda igual em PostgreSQL local
  (Testcontainers) e no Supabase.
- Nesta fase **não** há projeto Supabase criado, credenciais configuradas nem
  migrations aplicadas remotamente. Provisionamento e conexão são etapas do
  proprietário, executadas com as credenciais dele, fora deste repositório.

### Relação Spring Boot ↔ PostgreSQL ↔ Supabase

- **Spring Boot** acessa o banco exclusivamente por JDBC (Hikari) com
  Hibernate em `validate` — o DDL vem **só** do Flyway.
- **PostgreSQL** é o banco de fato: schema `investfacil`, migrations e modelo
  de papéis/RLS são PostgreSQL puro, sem recursos proprietários.
- **Supabase** é a hospedagem gerenciada desse PostgreSQL (mesmo protocolo,
  connection string comum) e, além disso, fornece o **Storage** para vídeos.
  O **Supabase Auth não é usado** — a autenticação é do próprio backend
  (T2) — e o PostgREST do Supabase **não expõe** o schema do app
  (revogado em V2).

### Procedimento de aplicação das migrations (quando o Supabase existir)

1. Provisionar no Supabase, via painel/SQL editor (com senha forte, fora de
   arquivos versionados):
   - papéis de grupo (já criados por V2, se aplicável);
   - um LOGIN de runtime membro de `investfacil_app` (DML) e, opcionalmente,
     um LOGIN de migração membro de `investfacil_migrate` (DDL).
2. Configurar as variáveis de conexão apenas no ambiente de execução
   (`.env` local / painel do provedor de deploy) — ver seção 4.
3. Executar a aplicação (ou `mvn flyway:migrate`): o Flyway aplica V1+V2
   automaticamente em banco limpo e registra o histórico em
   `investfacil.flyway_schema_history`.
4. Validar: tabela `flyway_schema_history` com `success = true` e teste de
   papel guest vendo 0 linhas (RLS deny-by-default).

## 3. Modelo de papéis e privilégios (V2)

| Papel | Tipo | Escopo | Senha |
|---|---|---|---|
| `investfacil_app` | grupo NOLOGIN | DML (SELECT/INSERT/UPDATE/DELETE) em todas as tabelas do schema | — |
| `investfacil_migrate` | grupo NOLOGIN | DDL (USAGE, CREATE no schema) — usado pelo Flyway quando configurado | — |
| `investfacil_test_guest` | grupo NOLOGIN | GRANT SELECT de propósito — existência apenas para **provar** que a negação vem da RLS | — |
| `investfacil_runtime` | LOGIN (provisionamento) | membro de `investfacil_app` | **fora do repositório** |

Camadas de proteção separadas e explícitas:

1. **PostgREST**: `REVOKE ALL ON SCHEMA investfacil FROM PUBLIC/anon/authenticated`.
   O acesso total do `investfacil_app` **não** protege contra vazamento das
   credenciais desse papel — o que impede exfiltração via PostgREST é a
   revogação do schema; o que limita o papel de runtime é a RLS.
2. **Privilégio mínimo**: app = DML; migrate = DDL; histórico do Flyway
   (`flyway_schema_history`) não recebe privilégio de nenhum papel de runtime.
3. **RLS deny-by-default**: habilitada em todas as tabelas de aplicação; única
   policy é `app_rw ... TO investfacil_app`. Papéis sem policy veem 0 linhas
   mesmo com `GRANT SELECT` — **validado por teste** com papel distinto
   (`FlywaySecurityIntegrationTest`, PostgreSQL real via Testcontainers).
4. **Autorização de negócio** (USER/ADMIN): Spring Security, não o banco.

## 4. Variáveis de conexão

| Variável | Uso | Preenchida em |
|---|---|---|
| `SPRING_DATASOURCE_URL` | JDBC do PostgreSQL runtime (`investfacil_app`) | `.env` local / painel do provedor |
| `SPRING_DATASOURCE_USERNAME` / `SPRING_DATASOURCE_PASSWORD` | login de runtime | idem |
| `SPRING_FLYWAY_URL/USER/PASSWORD` | opcional: separar conexão DDL do Flyway | idem |

Nenhuma dessas variáveis é versionada com valores reais (proibido). Exemplo
estrutural: `backend/.env.example`.

## 5. Diagrama ER

Ver `backend/T1_RELATORIO.md` (seção 3) — 17 tabelas: usuários e segurança
(users, refresh_tokens, email_tokens, auth_event), conteúdo (categories,
modules, lessons, video_assets, articles, lesson_articles) e progresso/
gamificação (user_progress, quiz_questions, quiz_attempts,
quiz_attempt_answers, xp_ledger, achievements, user_achievements).

## 6. Regras de evolução do schema

- Toda mudança é uma nova migration (V3, V4, ...): sem edição de V1/V2 após
  irem a qualquer ambiente compartilhado.
- Tabelas novas de aplicação herdam privilégios via `ALTER DEFAULT PRIVILEGES`
  e devem receber RLS + policy (a função `apply_table_security()` é a
  referência; novas migrations devem repetir o padrão, excluindo tabelas
  internas do Flyway).
- Índices e constraints fazem parte da migration que cria a tabela.
