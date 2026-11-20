# CLAUDE.md — Instruções Permanentes para Claude Code

> **Atualização 20/11/2026:** o estado abaixo (“T1 concluída; T2 não iniciada;
> frontend não iniciado”) é **histórico**. O MVP atual inclui autenticação,
> conteúdo, progresso, gamificação, simulador, vídeos (integração pronta), mercado
> e frontend Next.js. Consulte `docs/AUDITORIA_GERAL.md` e
> `docs/PROGRESSO_GERAL.md` como fontes de verdade. A branch de trabalho é
> `feat/mvp-completo`; push/merge dependem de autorização do proprietário.

## Identidade e Objetivo do Invest Fácil

**Invest Fácil** é uma plataforma de educação financeira e investimentos para o Brasil, desenvolvida para o **Hack Brasil 2026** (entrega em 12/12/2026). O objetivo é oferecer trilhas estruturadas de educação financeira em português, com vídeos, artigos, quizzes e gamificação (XP, níveis, conquistas), **sem executar ordens, custodiar valores ou dar recomendação de investimento**.

## Stack Tecnológico

| Camada | Tecnologia |
|--------|------------|
| Linguagem | Java 21 |
| Framework | Spring Boot 3.5.6 (Web MVC, Security, Data JPA, Validation, Actuator) |
| Build | Maven |
| Banco | PostgreSQL 17 (schema dedicado `investfacil`) |
| Schema | Flyway (única fonte de verdade) |
| Docs de API | springdoc-openapi (Swagger UI) |
| Testes | JUnit 5, Testcontainers (PostgreSQL real — nunca H2) |
| Infra planejada | Supabase (PostgreSQL + Storage), deploy via variáveis de ambiente |

## Arquitetura Modular Existente

```
com.investfacil.api
├── common         # envelope de erros, utilitários
├── auth           # cadastro, login, tokens, verificação, reset (T2)
├── users          # perfil, papéis USER/ADMIN (T2)
├── content        # categorias, módulos, aulas, artigos (T3)
├── videos         # metadados + Supabase Storage (URL assinada) (T3+)
├── progress       # conclusão de aulas, quizzes (T4)
├── gamification   # XP (append-only), níveis, conquistas (T4)
└── market         # cotações BTC/ETH — informativo, sem execução (P1, prazo 04/12)
```

**Regra de fronteira:** comunicação entre módulos **somente por interfaces de serviço**, nunca pelo repository de outro domínio.

## Estado Real do Projeto (T1 Concluída)

| Item | Status |
|---|---|
| Backend principal | Java 21 + Spring Boot 3.5.6, Maven, monólito modular (8 pacotes) |
| Migrations Flyway | V1 (17 tabelas) + V2 (papéis/grants/RLS) em `backend/src/main/resources/db/migration/` |
| PostgreSQL real nos testes | Testcontainers; H2 **ausente** |
| Segurança de banco | App faz DML, não DDL; papel convidado com GRANT SELECT vê 0 linhas (RLS deny-by-default) |
| Envelope de erro único | `ApiError` sem vazamento interno (404/400/500) |
| API fail-closed | 403 sem token em rotas de negócio; públicas apenas health + Swagger |
| Segurança | CORS por env, BCrypt, sessões stateless, sem form login/HTTP Basic |
| Swagger/OpenAPI | `/swagger-ui.html`, esquema `bearerAuth` |
| Verificação de segredos | `SecretsScanTest` falha o build se houver segredo versionado |
| Ausência de GeoIP | Decisão: nenhum módulo, dependência ou migration de geolocalização |
| T1 promovida | Staging → `backend/` com hashes idênticos (65/65), build revalidado no destino |

**Próxima etapa (T2):** Módulo de autenticação — **não iniciada**.  
**Frontend (Next.js + TypeScript):** Não iniciado.  
**Figma:** Link não fornecido.

## Papéis e Governança

- **GLM 5.3 Flash** = Arquiteto principal (decisões de arquitetura, stack, contratos)
- **Nemotron 3.5** = Auditor e agente operacional (execução, verificação, documentação)
- **Você (Claude Code)** = Especialista de implementação avançada
- **Proprietário** = Autoriza commits, pushes, merges, deploys e decisões de produto

## Regras Obrigatórias

1. **Nenhum commit, push, merge ou deploy sem autorização expressa do proprietário.**
2. **Nenhuma alteração direta na branch `main` sem autorização.**
3. Trabalhe **apenas em missões delimitadas** com escopo claro.
4. **Consulte as skills relevantes** antes de tarefas especializadas (auth, DB, testes, protocolo de missão).
5. **Não modifique** código, migrations, configurações ou dependências sem autorização.
6. **Não crie** LICENSE, arquivos de licença, ou altere a decisão de licença **NONE**.
7. **Não invente** parâmetros, credenciais, ou decisões arquiteturais.
6. Mantenha `SECURITY_CONTACT_EMAIL_PENDING` como placeholder até fornecimento do e-mail real.
7. **Preserve** a distinção clara entre funcionalidades **implementadas** e **planejadas** na documentação.

## Skills Disponíveis

| Skill | Arquivo | Quando Usar |
|---|---|---|
| `invest-facil-auth-invariants` | `.claude/skills/invest-facil-auth-invariants/SKILL.md` | Tarefas de autenticação, tokens, segurança |
| `invest-facil-db-rules` | `.claude/skills/invest-facil-db-rules/SKILL.md` | Migrations, schema, RLS, Supabase |
| `invest-facil-testing` | `.claude/skills/invest-facil-testing/SKILL.md` | Testes, Testcontainers, concorrência |
| `invest-facil-mission-protocol` | `.claude/skills/invest-facil-mission-protocol/SKILL.md` | Protocolo de execução de missões |

**Obrigatório:** Antes de qualquer tarefa especializada, **leia a skill correspondente**.