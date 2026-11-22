# Exército de 70 Agentes — Invest Fácil

**Versão:** 1.0 · **Data:** 20/11/2026 · **Deadline:** 12/12/2026

Este documento registra os 70 papéis especializados, com escopo, missão, entregáveis
e critérios de aceitação próprios. A execução é organizada em ondas para limitar
concorrência e conflitos de arquivo. **Status `DEFINED` significa que o papel foi
criado e está no backlog; nenhum papel é declarado `VERIFIED` sem evidência real.**

| Onda | Foco | Papéis |
|---|---|---|
| 1 | Fundação, auditoria e arquitetura | 01–05 |
| 2 | Backend, segurança, banco e infraestrutura | 06–35 |
| 3 | Frontend, conteúdo, gamificação e engajamento | 36–55 |
| 4 | Qualidade, demo e apresentação | 56–70 |

**Regra de conflito:** um arquivo tem um único dono por onda. Mudanças transversais
passam pelo Chief Architect/Technical PM. O agente principal integra e revisa.

## Cobertura real desta sessão

A implementação do MVP foi conduzida pelo agente principal (Project Commander),
que acumulou os papéis técnicos necessários, com revisões independentes por
subagentes quando disponíveis. A lista abaixo separa o que foi executado do que
permanece como backlog — sem inflar status.

| Workstream | Papéis cobertos | Evidência |
|---|---|---|
| Auditoria e arquitetura | 01–05 | `docs/AUDITORIA_GERAL.md`, `docs/architecture/` |
| Backend e segurança | 06–25 | `backend/src/main/java/com/investfacil/api/**`, 28 testes |
| Banco e infraestrutura | 26–35 | `V1`–`V3`, `Dockerfile`, `render.yaml` |
| Frontend e experiência | 36–45 | `frontend/app/**`, build Next.js, 6 testes |
| Conteúdo e produto | 46–55 | `seed/content.json`, simulador, gamificação |
| Qualidade e demo | 56–70 (parcial) | `MvpFlowIntegrationTest`, docs de demo/qualidade |
| Revisão independente | 25 (Security Auditor), 43/58 (Frontend/A11y), 03/65 (Docs) | 3 subagentes somente leitura; achados incorporados e documentados |

Papéis de pesquisa com usuários, performance de campo, auditoria WCAG completa e
validação em produção permanecem explicitamente pendentes.

## 01 — Chief Architect

**Área:** Diretoria e Arquitetura · **Onda:** 1 · **Status:** DEFINED

**Missão:** Definir a arquitetura modular, fronteiras de domínio e decisões técnicas do MVP.

**Entregáveis:** docs/architecture/overview.md; mapa de pacotes; ADRs

**Critérios de aceitação:** Build verde e nenhuma dependência circular entre módulos.

## 02 — Technical Project Manager

**Área:** Diretoria e Arquitetura · **Onda:** 1 · **Status:** DEFINED

**Missão:** Planejar ondas, prioridades e dependências até 12/12/2026.

**Entregáveis:** docs/PROGRESSO_GERAL.md; backlog priorizado

**Critérios de aceitação:** Toda tarefa com ID, status, responsável e evidência.

## 03 — Repository Auditor

**Área:** Diretoria e Arquitetura · **Onda:** 1 · **Status:** DEFINED

**Missão:** Auditar GitHub, branches, commits, staging e quarentena.

**Entregáveis:** docs/AUDITORIA_GERAL.md; inventário de divergências

**Critérios de aceitação:** Nenhuma conclusão sem comando ou hash verificável.

## 04 — Code Quality Auditor

**Área:** Diretoria e Arquitetura · **Onda:** 1 · **Status:** DEFINED

**Missão:** Revisar legibilidade, consistência, duplicação e riscos de manutenção.

**Entregáveis:** relatório de qualidade; checklist de revisão

**Critérios de aceitação:** Sem segredos, código morto crítico ou padrões conflitantes.

## 05 — System Integration Architect

**Área:** Diretoria e Arquitetura · **Onda:** 1 · **Status:** DEFINED

**Missão:** Garantir contrato frontend↔backend, proxy, cookies e CORS.

**Entregáveis:** contrato OpenAPI; configuração de rewrite

**Critérios de aceitação:** Fluxo completo funcionando em ambiente local.

## 06 — Java Backend Architect

**Área:** Backend Java/Spring · **Onda:** 2 · **Status:** DEFINED

**Missão:** Organizar o monólito modular por domínio e preservar fronteiras.

**Entregáveis:** estrutura com.investfacil.api.*; interfaces de serviço

**Critérios de aceitação:** Nenhum módulo acessa repository de outro domínio.

## 07 — Spring Boot Specialist

**Área:** Backend Java/Spring · **Onda:** 2 · **Status:** DEFINED

**Missão:** Configurar Boot 3.5, perfis, beans e ciclo de vida.

**Entregáveis:** application.yml/dev/prod; configuração tipada

**Critérios de aceitação:** Aplicação sobe em dev e prod sem segredos versionados.

## 08 — REST API Engineer

**Área:** Backend Java/Spring · **Onda:** 2 · **Status:** DEFINED

**Missão:** Projetar endpoints REST consistentes e códigos HTTP corretos.

**Entregáveis:** controllers; coleção de requests

**Critérios de aceitação:** Contratos documentados no Swagger e testados.

## 09 — Domain Modeling Engineer

**Área:** Backend Java/Spring · **Onda:** 2 · **Status:** DEFINED

**Missão:** Modelar usuário, conteúdo, progresso, gamificação e simulação.

**Entregáveis:** entidades JPA; relacionamentos

**Critérios de aceitação:** Schema validado por Hibernate (ddl-auto=validate).

## 10 — Repository and Persistence Engineer

**Área:** Backend Java/Spring · **Onda:** 2 · **Status:** DEFINED

**Missão:** Implementar repositories e consultas eficientes.

**Entregáveis:** interfaces Spring Data; queries JPQL/nativas

**Critérios de aceitação:** Consultas críticas cobertas por testes de integração.

## 11 — DTO and Mapping Engineer

**Área:** Backend Java/Spring · **Onda:** 2 · **Status:** DEFINED

**Missão:** Separar DTOs de entidades e evitar vazamento de dados internos.

**Entregáveis:** records de request/response

**Critérios de aceitação:** Nenhum hash/token/segredo exposto em JSON.

## 12 — Validation Engineer

**Área:** Backend Java/Spring · **Onda:** 2 · **Status:** DEFINED

**Missão:** Validar entradas de cadastro, quiz, simulador e perfil.

**Entregáveis:** anotações Jakarta Validation; mensagens pt-BR

**Critérios de aceitação:** 400 com envelope ApiError e detalhes por campo.

## 13 — Exception Handling Engineer

**Área:** Backend Java/Spring · **Onda:** 2 · **Status:** DEFINED

**Missão:** Padronizar erros de negócio e infraestrutura.

**Entregáveis:** GlobalExceptionHandler; BusinessException

**Critérios de aceitação:** Nenhum stack trace/SQL vaza ao cliente.

## 14 — API Documentation Engineer

**Área:** Backend Java/Spring · **Onda:** 2 · **Status:** DEFINED

**Missão:** Manter Swagger/OpenAPI útil e fiel ao código.

**Entregáveis:** OpenApiConfig; docs/api/README.md

**Critérios de aceitação:** /v3/api-docs e /swagger-ui.html acessíveis.

## 15 — Backend Testing Engineer

**Área:** Backend Java/Spring · **Onda:** 2 · **Status:** DEFINED

**Missão:** Cobrir domínio, segurança e fluxos integrados.

**Entregáveis:** testes JUnit 5 + Testcontainers

**Critérios de aceitação:** Suíte verde; integração contra PostgreSQL real.

## 16 — Spring Security Specialist

**Área:** Autenticação e Segurança · **Onda:** 2 · **Status:** DEFINED

**Missão:** Configurar cadeia stateless, autorização e headers.

**Entregáveis:** SecurityConfig; entry point/denied handler

**Critérios de aceitação:** API fail-closed; públicos mínimos; Swagger funcional.

## 17 — JWT Authentication Engineer

**Área:** Autenticação e Segurança · **Onda:** 2 · **Status:** DEFINED

**Missão:** Implementar access token HS256 de 15 minutos.

**Entregáveis:** JwtService; JwtAuthenticationFilter

**Critérios de aceitação:** Token inválido/expirado rejeitado; papel lido do banco.

## 18 — Refresh Token Engineer

**Área:** Autenticação e Segurança · **Onda:** 2 · **Status:** DEFINED

**Missão:** Implementar refresh opaco com hash, rotação e revogação.

**Entregáveis:** RefreshToken; AuthService.refresh

**Critérios de aceitação:** Reuso revoga a família; concorrência coberta por lock.

## 19 — Multi-Factor Authentication Engineer

**Área:** Autenticação e Segurança · **Onda:** 2 · **Status:** DEFINED

**Missão:** Implementar TOTP e desafio de login.

**Entregáveis:** TotpService; SecretCipher; endpoints MFA

**Critérios de aceitação:** Código válido autentica; replay rejeitado.

## 20 — Email Verification Engineer

**Área:** Autenticação e Segurança · **Onda:** 2 · **Status:** DEFINED

**Missão:** Implementar verificação de e-mail com token de uso único.

**Entregáveis:** EmailToken; EmailService

**Critérios de aceitação:** Token expira, é único e não vaza em produção.

## 21 — Password Recovery Engineer

**Área:** Autenticação e Segurança · **Onda:** 2 · **Status:** DEFINED

**Missão:** Implementar recuperação de senha com invalidação de sessões.

**Entregáveis:** fluxo forgot/reset; auditoria

**Critérios de aceitação:** Token de 1h, uso único e revogação de refresh tokens.

## 22 — Session Management Engineer

**Área:** Autenticação e Segurança · **Onda:** 2 · **Status:** DEFINED

**Missão:** Listar e revogar sessões ativas com segurança.

**Entregáveis:** endpoints /auth/sessions

**Critérios de aceitação:** Usuário só revoga as próprias sessões.

## 23 — Authorization and RBAC Engineer

**Área:** Autenticação e Segurança · **Onda:** 2 · **Status:** DEFINED

**Missão:** Aplicar USER/ADMIN a partir do banco, não do claim.

**Entregáveis:** regras de autorização; endpoint admin

**Critérios de aceitação:** ADMIN exigido em /api/v1/admin/**; USER não acessa.

## 24 — Rate Limiting Engineer

**Área:** Autenticação e Segurança · **Onda:** 2 · **Status:** DEFINED

**Missão:** Proteger login, cadastro, reset e APIs gerais.

**Entregáveis:** RateLimitFilter; regras por rota

**Critérios de aceitação:** 429 com Retry-After; IP não confia em XFF sem proxy.

## 25 — Security Auditor

**Área:** Autenticação e Segurança · **Onda:** 2 · **Status:** DEFINED

**Missão:** Auditar cookies, CSRF, enumeração, força bruta e segredos.

**Entregáveis:** relatório de segurança; checklist

**Critérios de aceitação:** Nenhum achado crítico aberto sem mitigação documentada.

## 26 — PostgreSQL Architect

**Área:** Banco e Infraestrutura · **Onda:** 2 · **Status:** DEFINED

**Missão:** Modelar schema, índices, constraints e integridade.

**Entregáveis:** migrations V1–V5; docs/architecture/database.md

**Critérios de aceitação:** Schema aplicado em banco limpo e validado.

## 27 — Supabase Specialist

**Área:** Banco e Infraestrutura · **Onda:** 2 · **Status:** DEFINED

**Missão:** Configurar PostgreSQL gerenciado e Storage sem expor o schema.

**Entregáveis:** runbook Supabase; REVOKE/RLS

**Critérios de aceitação:** PostgREST sem acesso; runtime com DML apenas.

## 28 — Flyway Migration Engineer

**Área:** Banco e Infraestrutura · **Onda:** 2 · **Status:** DEFINED

**Missão:** Versionar todo o schema e evitar ddl-auto=update.

**Entregáveis:** migrations imutáveis; checksums

**Critérios de aceitação:** Flyway aplica V1–V5; Hibernate apenas valida.

## 29 — Database Optimization Engineer

**Área:** Banco e Infraestrutura · **Onda:** 2 · **Status:** DEFINED

**Missão:** Criar índices para catálogo, progresso e tokens.

**Entregáveis:** índices únicos e compostos

**Critérios de aceitação:** Consultas críticas sem full scan evidente.

## 30 — Database Testing Engineer

**Área:** Banco e Infraestrutura · **Onda:** 2 · **Status:** DEFINED

**Missão:** Provar RLS, privilégios e migrations com PostgreSQL real.

**Entregáveis:** FlywaySecurityIntegrationTest

**Critérios de aceitação:** App não faz DDL; guest vê 0 linhas por RLS.

## 31 — Supabase Storage Engineer

**Área:** Banco e Infraestrutura · **Onda:** 2 · **Status:** DEFINED

**Missão:** Integrar bucket privado e URLs assinadas.

**Entregáveis:** SupabaseStorageClient; configuração

**Critérios de aceitação:** Upload autenticado e playback por URL temporária.

## 32 — Video Upload Engineer

**Área:** Banco e Infraestrutura · **Onda:** 2 · **Status:** DEFINED

**Missão:** Implementar upload multipart com validação.

**Entregáveis:** VideoService.upload; endpoint admin

**Critérios de aceitação:** MP4/WebM/MOV até 50 MB; assinatura validada.

## 33 — Media Processing Engineer

**Área:** Banco e Infraestrutura · **Onda:** 2 · **Status:** DEFINED

**Missão:** Registrar metadados e preparar evolução para transcodificação.

**Entregáveis:** VideoAsset; campos de duração/mime

**Critérios de aceitação:** Metadados consistentes; sem arquivo no filesystem efêmero.

## 34 — File Security Engineer

**Área:** Banco e Infraestrutura · **Onda:** 2 · **Status:** DEFINED

**Missão:** Impedir path traversal, arquivos disfarçados e acesso público.

**Entregáveis:** validação de MIME/assinatura; bucket privado

**Critérios de aceitação:** Arquivo inválido rejeitado; service key só no servidor.

## 35 — Infrastructure and Deployment Engineer

**Área:** Banco e Infraestrutura · **Onda:** 2 · **Status:** DEFINED

**Missão:** Preparar Docker, Render, Vercel e health checks.

**Entregáveis:** Dockerfile; render.yaml; docs/DEPLOY.md

**Critérios de aceitação:** Health UP; variáveis sem segredos versionados.

## 36 — Frontend Architect

**Área:** Frontend e Experiência · **Onda:** 3 · **Status:** DEFINED

**Missão:** Definir App Router, camadas, estado e rotas.

**Entregáveis:** estrutura app/; providers; lib/api

**Critérios de aceitação:** Build Next.js sem erros de tipo.

## 37 — React/TypeScript Engineer

**Área:** Frontend e Experiência · **Onda:** 3 · **Status:** DEFINED

**Missão:** Implementar telas, formulários e estados com tipagem estrita.

**Entregáveis:** páginas e componentes; tsconfig strict

**Critérios de aceitação:** npm run build verde.

## 38 — Figma Integration Specialist

**Área:** Frontend e Experiência · **Onda:** 3 · **Status:** DEFINED

**Missão:** Traduzir identidade e fluxos do protótipo para o produto.

**Entregáveis:** tokens visuais; mapa de telas

**Critérios de aceitação:** Dark/yellow, Plus Jakarta Sans e navegação coerentes.

## 39 — Design System Engineer

**Área:** Frontend e Experiência · **Onda:** 3 · **Status:** DEFINED

**Missão:** Criar componentes reutilizáveis e consistentes.

**Entregáveis:** Button, Card, Badge, Progress, Alert

**Critérios de aceitação:** Componentes usados nas telas; sem estilos duplicados críticos.

## 40 — Dashboard Engineer

**Área:** Frontend e Experiência · **Onda:** 3 · **Status:** DEFINED

**Missão:** Construir dashboard com próxima missão, XP e mercado.

**Entregáveis:** app/app/page.tsx

**Critérios de aceitação:** Dados reais da API; estados de carregamento/erro.

## 41 — Authentication UI Engineer

**Área:** Frontend e Experiência · **Onda:** 3 · **Status:** DEFINED

**Missão:** Construir login, cadastro, verificação, reset e MFA.

**Entregáveis:** rotas de autenticação

**Critérios de aceitação:** Fluxos completos com mensagens claras.

## 42 — Responsive Design Engineer

**Área:** Frontend e Experiência · **Onda:** 3 · **Status:** DEFINED

**Missão:** Garantir uso em desktop e mobile.

**Entregáveis:** sidebar + bottom nav; breakpoints

**Critérios de aceitação:** Nenhum overflow crítico em 360px e 1440px.

## 43 — Accessibility Engineer

**Área:** Frontend e Experiência · **Onda:** 3 · **Status:** DEFINED

**Missão:** Melhorar semântica, foco, contraste e labels.

**Entregáveis:** aria-labels; foco visível; formulários

**Critérios de aceitação:** Navegação por teclado nos fluxos principais.

## 44 — Frontend API Integration Engineer

**Área:** Frontend e Experiência · **Onda:** 3 · **Status:** DEFINED

**Missão:** Integrar API, refresh automático e tratamento de erros.

**Entregáveis:** lib/api.ts; rewrite /api

**Critérios de aceitação:** 401 renova a sessão; erros viram mensagens úteis.

## 45 — Frontend Testing Engineer

**Área:** Frontend e Experiência · **Onda:** 3 · **Status:** DEFINED

**Missão:** Cobrir formatadores e componentes críticos.

**Entregáveis:** Vitest + Testing Library

**Critérios de aceitação:** npm test verde.

## 46 — Financial Education Architect

**Área:** Educação Financeira · **Onda:** 3 · **Status:** DEFINED

**Missão:** Definir progressão didática e público 18–25.

**Entregáveis:** 8 trilhas; ordem de conceitos

**Critérios de aceitação:** Conteúdo sem promessa de rentabilidade.

## 47 — Educational Content Engineer

**Área:** Educação Financeira · **Onda:** 3 · **Status:** DEFINED

**Missão:** Produzir aulas e artigos em português claro.

**Entregáveis:** seed/content.json; 19 aulas; 6 artigos

**Critérios de aceitação:** Conteúdo verificável, com fontes quando externo.

## 48 — Video Learning Engineer

**Área:** Educação Financeira · **Onda:** 3 · **Status:** DEFINED

**Missão:** Planejar vídeos de até 3 minutos por aula.

**Entregáveis:** metadados de vídeo; player

**Critérios de aceitação:** Aula sem vídeo exibe estado honesto.

## 49 — Financial Articles Engineer

**Área:** Educação Financeira · **Onda:** 3 · **Status:** DEFINED

**Missão:** Escrever artigos de aprofundamento com fonte.

**Entregáveis:** artigos e campos source

**Critérios de aceitação:** Nenhum artigo sem atribuição quando derivado.

## 50 — Investment Fundamentals Specialist

**Área:** Educação Financeira · **Onda:** 3 · **Status:** DEFINED

**Missão:** Explicar renda fixa, variável, fundos e ETFs.

**Entregáveis:** aulas das trilhas 2–5

**Critérios de aceitação:** Conceitos corretos e sem recomendação individual.

## 51 — Cryptocurrency Education Specialist

**Área:** Educação Financeira · **Onda:** 3 · **Status:** DEFINED

**Missão:** Explicar blockchain, volatilidade e golpes.

**Entregáveis:** trilha cripto; artigos

**Critérios de aceitação:** Riscos explícitos; sem promessa de retorno.

## 52 — Financial Simulator Engineer

**Área:** Educação Financeira · **Onda:** 3 · **Status:** DEFINED

**Missão:** Implementar juros compostos, aportes e cenários.

**Entregáveis:** SimulatorService; gráfico

**Critérios de aceitação:** Cálculo determinístico; aviso obrigatório.

## 53 — Learning Progress Engineer

**Área:** Educação Financeira · **Onda:** 3 · **Status:** DEFINED

**Missão:** Registrar conclusão, quizzes e progresso idempotente.

**Entregáveis:** ProgressService; user_progress

**Critérios de aceitação:** Conclusão repetida não duplica XP.

## 54 — Gamification Engineer

**Área:** Educação Financeira · **Onda:** 3 · **Status:** DEFINED

**Missão:** Implementar XP, níveis, conquistas e sequência.

**Entregáveis:** GamificationService; xp_ledger

**Critérios de aceitação:** XP append-only; conquistas por aprendizado.

## 55 — User Engagement Engineer

**Área:** Educação Financeira · **Onda:** 3 · **Status:** DEFINED

**Missão:** Melhorar retorno ao estudo sem dark patterns.

**Entregáveis:** dashboard; sequência; próximos passos

**Critérios de aceitação:** Nenhuma notificação falsa ou urgência artificial.

## 56 — End-to-End Testing Engineer

**Área:** Qualidade e Demonstração · **Onda:** 4 · **Status:** DEFINED

**Missão:** Cobrir jornada completa em ambiente real.

**Entregáveis:** roteiro E2E; evidências

**Critérios de aceitação:** Cadastro→aula→quiz→simulador→logout sem erro.

## 57 — Performance Engineer

**Área:** Qualidade e Demonstração · **Onda:** 4 · **Status:** DEFINED

**Missão:** Medir build, primeira carga e consultas críticas.

**Entregáveis:** relatório de performance

**Critérios de aceitação:** Sem regressão grosseira; imagens/JS controlados.

## 58 — UX Researcher

**Área:** Qualidade e Demonstração · **Onda:** 4 · **Status:** DEFINED

**Missão:** Avaliar clareza para iniciantes e riscos de interpretação.

**Entregáveis:** achados de UX

**Critérios de aceitação:** Nenhuma tela sugere garantia de retorno.

## 59 — Product Analyst

**Área:** Qualidade e Demonstração · **Onda:** 4 · **Status:** DEFINED

**Missão:** Verificar aderência ao problema e ao público.

**Entregáveis:** análise de proposta de valor

**Critérios de aceitação:** Funcionalidades conectadas à dor real.

## 60 — Error Monitoring Engineer

**Área:** Qualidade e Demonstração · **Onda:** 4 · **Status:** DEFINED

**Missão:** Preparar logs, traceId e monitoramento.

**Entregáveis:** configuração de logs/Actuator

**Critérios de aceitação:** Erros rastreáveis sem vazar dados sensíveis.

## 61 — Deployment Validation Engineer

**Área:** Qualidade e Demonstração · **Onda:** 4 · **Status:** DEFINED

**Missão:** Validar ambiente publicado e rollback.

**Entregáveis:** checklist de release

**Critérios de aceitação:** Health, auth, conteúdo e swagger verificados.

## 62 — Demo Environment Engineer

**Área:** Qualidade e Demonstração · **Onda:** 4 · **Status:** DEFINED

**Missão:** Preparar dados, conta demo e resiliência.

**Entregáveis:** seed; demo initializer; runbook

**Critérios de aceitação:** Demo funciona offline de provedores externos.

## 63 — Presentation Architect

**Área:** Qualidade e Demonstração · **Onda:** 4 · **Status:** DEFINED

**Missão:** Estruturar narrativa e sequência de telas.

**Entregáveis:** docs/APRESENTACAO.md

**Critérios de aceitação:** Apresentação cobre problema, solução, demo e arquitetura.

## 64 — Pitch Storytelling Specialist

**Área:** Qualidade e Demonstração · **Onda:** 4 · **Status:** DEFINED

**Missão:** Criar pitch com tensão, prova e chamada final.

**Entregáveis:** roteiro de pitch

**Critérios de aceitação:** Mensagem clara em 3 minutos.

## 65 — Product Documentation Engineer

**Área:** Qualidade e Demonstração · **Onda:** 4 · **Status:** DEFINED

**Missão:** Manter README e docs fiéis ao código.

**Entregáveis:** README; docs técnicos

**Critérios de aceitação:** Nenhuma funcionalidade futura apresentada como pronta.

## 66 — Integration Testing Engineer

**Área:** Qualidade e Demonstração · **Onda:** 4 · **Status:** DEFINED

**Missão:** Validar contrato entre módulos e ambientes.

**Entregáveis:** MvpFlowIntegrationTest

**Critérios de aceitação:** Fluxo integrado verde em PostgreSQL real.

## 67 — Regression Testing Engineer

**Área:** Qualidade e Demonstração · **Onda:** 4 · **Status:** DEFINED

**Missão:** Reexecutar suítes após mudanças.

**Entregáveis:** registro de regressão

**Critérios de aceitação:** Falhas corrigidas com evidência antes/depois.

## 68 — Accessibility and Compatibility Auditor

**Área:** Qualidade e Demonstração · **Onda:** 4 · **Status:** DEFINED

**Missão:** Auditar contraste, teclado, leitores e navegadores.

**Entregáveis:** checklist WCAG/AA

**Critérios de aceitação:** Achados críticos corrigidos ou documentados.

## 69 — Final Quality Assurance Lead

**Área:** Qualidade e Demonstração · **Onda:** 4 · **Status:** DEFINED

**Missão:** Consolidar evidências e emitir veredito go/no-go.

**Entregáveis:** docs/QUALIDADE_FINAL.md

**Critérios de aceitação:** Nenhum teste é declarado sem execução real.

## 70 — Hackathon Strategy Specialist

**Área:** Qualidade e Demonstração · **Onda:** 4 · **Status:** DEFINED

**Missão:** Alinhar entrega aos critérios de avaliação do Hack Brasil.

**Entregáveis:** matriz critério→evidência

**Critérios de aceitação:** Demo destaca diferencial, segurança e impacto.

## Como operar os agentes

1. O Technical Project Manager mantém `docs/PROGRESSO_GERAL.md` como fonte de verdade.
2. Cada tarefa recebe ID, papel responsável, arquivos, dependências e critério de aceitação.
3. Agentes que alteram o mesmo arquivo não rodam na mesma onda.
4. O Chief Architect revisa contratos; o QA Lead revisa evidências antes de `VERIFIED`.
5. Bloqueios externos (credenciais, permissões, provedores) são registrados como `BLOCKED`.
