import { mkdirSync, writeFileSync } from "node:fs";

// Registro dos 70 papéis especializados do Invest Fácil.
// Cada papel tem missão, entregáveis e critérios de aceitação próprios.
// A execução é organizada em ondas; nenhum papel é declarado VERIFIED sem evidência.

const agents = [
  ["Chief Architect", "Diretoria e Arquitetura", "Definir a arquitetura modular, fronteiras de domínio e decisões técnicas do MVP.", "docs/architecture/overview.md; mapa de pacotes; ADRs", "Build verde e nenhuma dependência circular entre módulos."],
  ["Technical Project Manager", "Diretoria e Arquitetura", "Planejar ondas, prioridades e dependências até 12/12/2026.", "docs/PROGRESSO_GERAL.md; backlog priorizado", "Toda tarefa com ID, status, responsável e evidência."],
  ["Repository Auditor", "Diretoria e Arquitetura", "Auditar GitHub, branches, commits, staging e quarentena.", "docs/AUDITORIA_GERAL.md; inventário de divergências", "Nenhuma conclusão sem comando ou hash verificável."],
  ["Code Quality Auditor", "Diretoria e Arquitetura", "Revisar legibilidade, consistência, duplicação e riscos de manutenção.", "relatório de qualidade; checklist de revisão", "Sem segredos, código morto crítico ou padrões conflitantes."],
  ["System Integration Architect", "Diretoria e Arquitetura", "Garantir contrato frontend↔backend, proxy, cookies e CORS.", "contrato OpenAPI; configuração de rewrite", "Fluxo completo funcionando em ambiente local."],
  ["Java Backend Architect", "Backend Java/Spring", "Organizar o monólito modular por domínio e preservar fronteiras.", "estrutura com.investfacil.api.*; interfaces de serviço", "Nenhum módulo acessa repository de outro domínio."],
  ["Spring Boot Specialist", "Backend Java/Spring", "Configurar Boot 3.5, perfis, beans e ciclo de vida.", "application.yml/dev/prod; configuração tipada", "Aplicação sobe em dev e prod sem segredos versionados."],
  ["REST API Engineer", "Backend Java/Spring", "Projetar endpoints REST consistentes e códigos HTTP corretos.", "controllers; coleção de requests", "Contratos documentados no Swagger e testados."],
  ["Domain Modeling Engineer", "Backend Java/Spring", "Modelar usuário, conteúdo, progresso, gamificação e simulação.", "entidades JPA; relacionamentos", "Schema validado por Hibernate (ddl-auto=validate)."],
  ["Repository and Persistence Engineer", "Backend Java/Spring", "Implementar repositories e consultas eficientes.", "interfaces Spring Data; queries JPQL/nativas", "Consultas críticas cobertas por testes de integração."],
  ["DTO and Mapping Engineer", "Backend Java/Spring", "Separar DTOs de entidades e evitar vazamento de dados internos.", "records de request/response", "Nenhum hash/token/segredo exposto em JSON."],
  ["Validation Engineer", "Backend Java/Spring", "Validar entradas de cadastro, quiz, simulador e perfil.", "anotações Jakarta Validation; mensagens pt-BR", "400 com envelope ApiError e detalhes por campo."],
  ["Exception Handling Engineer", "Backend Java/Spring", "Padronizar erros de negócio e infraestrutura.", "GlobalExceptionHandler; BusinessException", "Nenhum stack trace/SQL vaza ao cliente."],
  ["API Documentation Engineer", "Backend Java/Spring", "Manter Swagger/OpenAPI útil e fiel ao código.", "OpenApiConfig; docs/api/README.md", "/v3/api-docs e /swagger-ui.html acessíveis."],
  ["Backend Testing Engineer", "Backend Java/Spring", "Cobrir domínio, segurança e fluxos integrados.", "testes JUnit 5 + Testcontainers", "Suíte verde; integração contra PostgreSQL real."],
  ["Spring Security Specialist", "Autenticação e Segurança", "Configurar cadeia stateless, autorização e headers.", "SecurityConfig; entry point/denied handler", "API fail-closed; públicos mínimos; Swagger funcional."],
  ["JWT Authentication Engineer", "Autenticação e Segurança", "Implementar access token HS256 de 15 minutos.", "JwtService; JwtAuthenticationFilter", "Token inválido/expirado rejeitado; papel lido do banco."],
  ["Refresh Token Engineer", "Autenticação e Segurança", "Implementar refresh opaco com hash, rotação e revogação.", "RefreshToken; AuthService.refresh", "Reuso revoga a família; concorrência coberta por lock."],
  ["Multi-Factor Authentication Engineer", "Autenticação e Segurança", "Implementar TOTP e desafio de login.", "TotpService; SecretCipher; endpoints MFA", "Código válido autentica; replay rejeitado."],
  ["Email Verification Engineer", "Autenticação e Segurança", "Implementar verificação de e-mail com token de uso único.", "EmailToken; EmailService", "Token expira, é único e não vaza em produção."],
  ["Password Recovery Engineer", "Autenticação e Segurança", "Implementar recuperação de senha com invalidação de sessões.", "fluxo forgot/reset; auditoria", "Token de 1h, uso único e revogação de refresh tokens."],
  ["Session Management Engineer", "Autenticação e Segurança", "Listar e revogar sessões ativas com segurança.", "endpoints /auth/sessions", "Usuário só revoga as próprias sessões."],
  ["Authorization and RBAC Engineer", "Autenticação e Segurança", "Aplicar USER/ADMIN a partir do banco, não do claim.", "regras de autorização; endpoint admin", "ADMIN exigido em /api/v1/admin/**; USER não acessa."],
  ["Rate Limiting Engineer", "Autenticação e Segurança", "Proteger login, cadastro, reset e APIs gerais.", "RateLimitFilter; regras por rota", "429 com Retry-After; IP não confia em XFF sem proxy."],
  ["Security Auditor", "Autenticação e Segurança", "Auditar cookies, CSRF, enumeração, força bruta e segredos.", "relatório de segurança; checklist", "Nenhum achado crítico aberto sem mitigação documentada."],
  ["PostgreSQL Architect", "Banco e Infraestrutura", "Modelar schema, índices, constraints e integridade.", "migrations V1–V5; docs/architecture/database.md", "Schema aplicado em banco limpo e validado."],
  ["Supabase Specialist", "Banco e Infraestrutura", "Configurar PostgreSQL gerenciado e Storage sem expor o schema.", "runbook Supabase; REVOKE/RLS", "PostgREST sem acesso; runtime com DML apenas."],
  ["Flyway Migration Engineer", "Banco e Infraestrutura", "Versionar todo o schema e evitar ddl-auto=update.", "migrations imutáveis; checksums", "Flyway aplica V1–V5; Hibernate apenas valida."],
  ["Database Optimization Engineer", "Banco e Infraestrutura", "Criar índices para catálogo, progresso e tokens.", "índices únicos e compostos", "Consultas críticas sem full scan evidente."],
  ["Database Testing Engineer", "Banco e Infraestrutura", "Provar RLS, privilégios e migrations com PostgreSQL real.", "FlywaySecurityIntegrationTest", "App não faz DDL; guest vê 0 linhas por RLS."],
  ["Supabase Storage Engineer", "Banco e Infraestrutura", "Integrar bucket privado e URLs assinadas.", "SupabaseStorageClient; configuração", "Upload autenticado e playback por URL temporária."],
  ["Video Upload Engineer", "Banco e Infraestrutura", "Implementar upload multipart com validação.", "VideoService.upload; endpoint admin", "MP4/WebM/MOV até 50 MB; assinatura validada."],
  ["Media Processing Engineer", "Banco e Infraestrutura", "Registrar metadados e preparar evolução para transcodificação.", "VideoAsset; campos de duração/mime", "Metadados consistentes; sem arquivo no filesystem efêmero."],
  ["File Security Engineer", "Banco e Infraestrutura", "Impedir path traversal, arquivos disfarçados e acesso público.", "validação de MIME/assinatura; bucket privado", "Arquivo inválido rejeitado; service key só no servidor."],
  ["Infrastructure and Deployment Engineer", "Banco e Infraestrutura", "Preparar Docker, Render, Vercel e health checks.", "Dockerfile; render.yaml; docs/DEPLOY.md", "Health UP; variáveis sem segredos versionados."],
  ["Frontend Architect", "Frontend e Experiência", "Definir App Router, camadas, estado e rotas.", "estrutura app/; providers; lib/api", "Build Next.js sem erros de tipo."],
  ["React/TypeScript Engineer", "Frontend e Experiência", "Implementar telas, formulários e estados com tipagem estrita.", "páginas e componentes; tsconfig strict", "npm run build verde."],
  ["Figma Integration Specialist", "Frontend e Experiência", "Traduzir identidade e fluxos do protótipo para o produto.", "tokens visuais; mapa de telas", "Dark/yellow, Plus Jakarta Sans e navegação coerentes."],
  ["Design System Engineer", "Frontend e Experiência", "Criar componentes reutilizáveis e consistentes.", "Button, Card, Badge, Progress, Alert", "Componentes usados nas telas; sem estilos duplicados críticos."],
  ["Dashboard Engineer", "Frontend e Experiência", "Construir dashboard com próxima missão, XP e mercado.", "app/app/page.tsx", "Dados reais da API; estados de carregamento/erro."],
  ["Authentication UI Engineer", "Frontend e Experiência", "Construir login, cadastro, verificação, reset e MFA.", "rotas de autenticação", "Fluxos completos com mensagens claras."],
  ["Responsive Design Engineer", "Frontend e Experiência", "Garantir uso em desktop e mobile.", "sidebar + bottom nav; breakpoints", "Nenhum overflow crítico em 360px e 1440px."],
  ["Accessibility Engineer", "Frontend e Experiência", "Melhorar semântica, foco, contraste e labels.", "aria-labels; foco visível; formulários", "Navegação por teclado nos fluxos principais."],
  ["Frontend API Integration Engineer", "Frontend e Experiência", "Integrar API, refresh automático e tratamento de erros.", "lib/api.ts; rewrite /api", "401 renova a sessão; erros viram mensagens úteis."],
  ["Frontend Testing Engineer", "Frontend e Experiência", "Cobrir formatadores e componentes críticos.", "Vitest + Testing Library", "npm test verde."],
  ["Financial Education Architect", "Educação Financeira", "Definir progressão didática e público 18–25.", "8 trilhas; ordem de conceitos", "Conteúdo sem promessa de rentabilidade."],
  ["Educational Content Engineer", "Educação Financeira", "Produzir aulas e artigos em português claro.", "seed/content.json; 19 aulas; 6 artigos", "Conteúdo verificável, com fontes quando externo."],
  ["Video Learning Engineer", "Educação Financeira", "Planejar vídeos de até 3 minutos por aula.", "metadados de vídeo; player", "Aula sem vídeo exibe estado honesto."],
  ["Financial Articles Engineer", "Educação Financeira", "Escrever artigos de aprofundamento com fonte.", "artigos e campos source", "Nenhum artigo sem atribuição quando derivado."],
  ["Investment Fundamentals Specialist", "Educação Financeira", "Explicar renda fixa, variável, fundos e ETFs.", "aulas das trilhas 2–5", "Conceitos corretos e sem recomendação individual."],
  ["Cryptocurrency Education Specialist", "Educação Financeira", "Explicar blockchain, volatilidade e golpes.", "trilha cripto; artigos", "Riscos explícitos; sem promessa de retorno."],
  ["Financial Simulator Engineer", "Educação Financeira", "Implementar juros compostos, aportes e cenários.", "SimulatorService; gráfico", "Cálculo determinístico; aviso obrigatório."],
  ["Learning Progress Engineer", "Educação Financeira", "Registrar conclusão, quizzes e progresso idempotente.", "ProgressService; user_progress", "Conclusão repetida não duplica XP."],
  ["Gamification Engineer", "Educação Financeira", "Implementar XP, níveis, conquistas e sequência.", "GamificationService; xp_ledger", "XP append-only; conquistas por aprendizado."],
  ["User Engagement Engineer", "Educação Financeira", "Melhorar retorno ao estudo sem dark patterns.", "dashboard; sequência; próximos passos", "Nenhuma notificação falsa ou urgência artificial."],
  ["End-to-End Testing Engineer", "Qualidade e Demonstração", "Cobrir jornada completa em ambiente real.", "roteiro E2E; evidências", "Cadastro→aula→quiz→simulador→logout sem erro."],
  ["Performance Engineer", "Qualidade e Demonstração", "Medir build, primeira carga e consultas críticas.", "relatório de performance", "Sem regressão grosseira; imagens/JS controlados."],
  ["UX Researcher", "Qualidade e Demonstração", "Avaliar clareza para iniciantes e riscos de interpretação.", "achados de UX", "Nenhuma tela sugere garantia de retorno."],
  ["Product Analyst", "Qualidade e Demonstração", "Verificar aderência ao problema e ao público.", "análise de proposta de valor", "Funcionalidades conectadas à dor real."],
  ["Error Monitoring Engineer", "Qualidade e Demonstração", "Preparar logs, traceId e monitoramento.", "configuração de logs/Actuator", "Erros rastreáveis sem vazar dados sensíveis."],
  ["Deployment Validation Engineer", "Qualidade e Demonstração", "Validar ambiente publicado e rollback.", "checklist de release", "Health, auth, conteúdo e swagger verificados."],
  ["Demo Environment Engineer", "Qualidade e Demonstração", "Preparar dados, conta demo e resiliência.", "seed; demo initializer; runbook", "Demo funciona offline de provedores externos."],
  ["Presentation Architect", "Qualidade e Demonstração", "Estruturar narrativa e sequência de telas.", "docs/APRESENTACAO.md", "Apresentação cobre problema, solução, demo e arquitetura."],
  ["Pitch Storytelling Specialist", "Qualidade e Demonstração", "Criar pitch com tensão, prova e chamada final.", "roteiro de pitch", "Mensagem clara em 3 minutos."],
  ["Product Documentation Engineer", "Qualidade e Demonstração", "Manter README e docs fiéis ao código.", "README; docs técnicos", "Nenhuma funcionalidade futura apresentada como pronta."],
  ["Integration Testing Engineer", "Qualidade e Demonstração", "Validar contrato entre módulos e ambientes.", "MvpFlowIntegrationTest", "Fluxo integrado verde em PostgreSQL real."],
  ["Regression Testing Engineer", "Qualidade e Demonstração", "Reexecutar suítes após mudanças.", "registro de regressão", "Falhas corrigidas com evidência antes/depois."],
  ["Accessibility and Compatibility Auditor", "Qualidade e Demonstração", "Auditar contraste, teclado, leitores e navegadores.", "checklist WCAG/AA", "Achados críticos corrigidos ou documentados."],
  ["Final Quality Assurance Lead", "Qualidade e Demonstração", "Consolidar evidências e emitir veredito go/no-go.", "docs/QUALIDADE_FINAL.md", "Nenhum teste é declarado sem execução real."],
  ["Hackathon Strategy Specialist", "Qualidade e Demonstração", "Alinhar entrega aos critérios de avaliação do Hack Brasil.", "matriz critério→evidência", "Demo destaca diferencial, segurança e impacto."],
];

const waveFor = (index) => {
  if (index <= 5) return 1;
  if (index <= 35) return 2;
  if (index <= 45) return 3;
  if (index <= 55) return 3;
  return 4;
};

const statusFor = () => "DEFINED";

const lines = [
  "# Exército de 70 Agentes — Invest Fácil",
  "",
  "**Versão:** 1.0 · **Data:** 20/11/2026 · **Deadline:** 12/12/2026",
  "",
  "Este documento registra os 70 papéis especializados, com escopo, missão, entregáveis",
  "e critérios de aceitação próprios. A execução é organizada em ondas para limitar",
  "concorrência e conflitos de arquivo. **Status `DEFINED` significa que o papel foi",
  "criado e está no backlog; nenhum papel é declarado `VERIFIED` sem evidência real.**",
  "",
  "| Onda | Foco | Papéis |",
  "|---|---|---|",
  "| 1 | Fundação, auditoria e arquitetura | 01–05 |",
  "| 2 | Backend, segurança, banco e infraestrutura | 06–35 |",
  "| 3 | Frontend, conteúdo, gamificação e engajamento | 36–55 |",
  "| 4 | Qualidade, demo e apresentação | 56–70 |",
  "",
  "**Regra de conflito:** um arquivo tem um único dono por onda. Mudanças transversais",
  "passam pelo Chief Architect/Technical PM. O agente principal integra e revisa.",
  "",
  "## Cobertura real desta sessão",
  "",
  "A implementação do MVP foi conduzida pelo agente principal (Project Commander),",
  "que acumulou os papéis técnicos necessários, com revisões independentes por",
  "subagentes quando disponíveis. A lista abaixo separa o que foi executado do que",
  "permanece como backlog — sem inflar status.",
  "",
  "| Workstream | Papéis cobertos | Evidência |",
  "|---|---|---|",
  "| Auditoria e arquitetura | 01–05 | `docs/AUDITORIA_GERAL.md`, `docs/architecture/` |",
  "| Backend e segurança | 06–25 | `backend/src/main/java/com/investfacil/api/**`, 28 testes |",
  "| Banco e infraestrutura | 26–35 | `V1`–`V3`, `Dockerfile`, `render.yaml` |",
  "| Frontend e experiência | 36–45 | `frontend/app/**`, build Next.js, 6 testes |",
  "| Conteúdo e produto | 46–55 | `seed/content.json`, simulador, gamificação |",
  "| Qualidade e demo | 56–70 (parcial) | `MvpFlowIntegrationTest`, docs de demo/qualidade |",
  "| Revisão independente | 25 (Security Auditor), 43/58 (Frontend/A11y), 03/65 (Docs) | 3 subagentes somente leitura; achados incorporados e documentados |",
  "",
  "Papéis de pesquisa com usuários, performance de campo, auditoria WCAG completa e",
  "validação em produção permanecem explicitamente pendentes.",
  "",
];

agents.forEach(([name, area, mission, deliverables, acceptance], index) => {
  const id = String(index + 1).padStart(2, "0");
  lines.push(`## ${id} — ${name}`);
  lines.push("");
  lines.push(`**Área:** ${area} · **Onda:** ${waveFor(index + 1)} · **Status:** ${statusFor()}`);
  lines.push("");
  lines.push(`**Missão:** ${mission}`);
  lines.push("");
  lines.push(`**Entregáveis:** ${deliverables}`);
  lines.push("");
  lines.push(`**Critérios de aceitação:** ${acceptance}`);
  lines.push("");
});

lines.push("## Como operar os agentes");
lines.push("");
lines.push("1. O Technical Project Manager mantém `docs/PROGRESSO_GERAL.md` como fonte de verdade.");
lines.push("2. Cada tarefa recebe ID, papel responsável, arquivos, dependências e critério de aceitação.");
lines.push("3. Agentes que alteram o mesmo arquivo não rodam na mesma onda.");
lines.push("4. O Chief Architect revisa contratos; o QA Lead revisa evidências antes de `VERIFIED`.");
lines.push("5. Bloqueios externos (credenciais, permissões, provedores) são registrados como `BLOCKED`.");
lines.push("");

mkdirSync("docs/agentes", { recursive: true });
writeFileSync("docs/AGENTES_70.md", lines.join("\n"), "utf8");
writeFileSync(
  "docs/agentes/registry.json",
  JSON.stringify(
    agents.map(([name, area, mission, deliverables, acceptance], index) => ({
      id: String(index + 1).padStart(2, "0"),
      name,
      area,
      wave: waveFor(index + 1),
      status: statusFor(),
      mission,
      deliverables: deliverables.split(";").map((item) => item.trim()),
      acceptance: acceptance.split(";").map((item) => item.trim()),
    })),
    null,
    2,
  ) + "\n",
  "utf8",
);
console.log(`Gerados ${agents.length} papéis em docs/AGENTES_70.md e docs/agentes/registry.json`);
