# Visão geral da arquitetura

**Status do documento: DECISÃO APROVADA** (Missão 02, delta D1–D12)

## 1. Decisão central: monólito modular

O Invest Fácil é um **monólito modular**: um único deploy Spring Boot, com
domínios separados como pacotes Java de fronteira rígida.

Por que não microserviços:

- Equipe pequena e prazo curto (Hack Brasil, 12/12/2026).
- Domínios fortemente acoplados ao ciclo de usuário (progresso → gamificação).
- Um único banco PostgreSQL já resolve consistência e elimina custo de
  infraestrutura distribuída.

A fronteira de módulo é pacote + convenção: comunicação entre módulos
somente por interfaces de serviço, nunca pelo repository de outro domínio.

```
com.investfacil.api
├── common         # envelope de erros, utilitários
├── auth           # cadastro, login, tokens, verificação, reset
├── users          # perfil, papéis USER/ADMIN
├── content        # categorias, módulos, aulas, artigos
├── videos         # metadados + Supabase Storage (URL assinada)
├── progress       # conclusão de aulas, quizzes
├── gamification   # XP (append-only), níveis, conquistas
└── market         # cotações BTC/ETH — informativo, sem execução
```

## 2. Requisições e streaming

Spring MVC (servlet) síncrono em todo o backend. O antigo módulo de market
data baseado em WebFlux/WebSocket/SSE **não** foi portado: a entrega de
cotações no MVP é **REST + cache em memória (TTL 30s)**, com degradação
controlada (estados FRESH/STALE/UNAVAILABLE) — decisão do proprietário
(RestClient síncrono + Spring MVC).

## 3. Erros e observabilidade

- **Envelope único** `ApiError` (`timestamp, status, code, message, traceId,
  details`) produzido por `GlobalExceptionHandler` — nunca stack trace, SQL
  ou caminhos internos ao cliente.
- **Actuator** com apenas `health` e `info` expostos; probes de
  liveness/readiness habilitadas.
- `server.error.include-stacktrace: never`.

## 4. Banco de dados

PostgreSQL em schema dedicado `investfacil`, fonte única do schema = Flyway
(`ddl-auto: validate` — o Hibernate só valida, nunca cria). Detalhes de
papéis, privilégios e RLS em [database.md](database.md).

## 5. Autenticação (desenho aprovado, implementação em T2)

- Access token JWT de 15 minutos + refresh token opaco de 32 bytes.
- Banco guarda **apenas** o hash SHA-256 do refresh (nunca o token cru).
- Rotação de refresh a cada uso, revogação e detecção de reuso.
- Verificação de e-mail e reset de senha por token de uso único.
- Papel (USER/ADMIN) sempre lido do banco — nunca de claim do JWT.
- Navegador: access token em memória + refresh em cookie HttpOnly/Secure/
  SameSite=Strict; CSRF desabilitado por decisão (tokens via header), com
  proteção adicional na rota de refresh documentada em
  [../security/SECURITY.md](../security/SECURITY.md).
- **Sem Supabase Auth** — autenticação única, do próprio backend.

## 6. Segurança do PostgreSQL (resumo)

- Schema não exposto via PostgREST.
- Papéis NOLOGIN de grupo (`investfacil_app` DML, `investfacil_migrate` DDL);
  senhas provisionadas fora do repositório.
- RLS habilitada e **negada por padrão**; policy exclusiva do papel de app.
- Autorização de negócio (USER/ADMIN) no Spring Security, não no banco.
- Detalhes e validação: [database.md](database.md) e
  [../security/SECURITY.md](../security/SECURITY.md).

## 7. Vídeos (desenho aprovado; implementação em T3+)

Objetos no Supabase Storage (bucket privado); upload e leitura por URL
assinada — nunca streaming pela heap do servidor. Metadados e status
(PENDING/READY/PUBLISHED/EXPIRED) em PostgreSQL. **Tabela criada em V1;
integração de Storage não implementada.**

## 8. Market data (desenho aprovado; P1 — prazo 04/12, não implementado)

P1, prazo 04/12/2026: apenas BTC e ETH, via Binance REST, cache TTL 30s,
connect timeout 2s / response timeout 5s. Sem SSE/WS no MVP. A plataforma
não executa ordens, não custodia valores e não recomenda ativos — conteúdo
exclusivamente educacional.

## 9. Decisões registradas nesta arquitetura

- GeoIP **removido** do desenho (era da referência RBS): nenhuma identificação
  por geolocalização; auditoria de eventos de autenticação (`auth_event`)
  com IP/UA apenas como sinal de auditoria.
- CSRF desabilitado (autenticação por header, não por cookie de sessão).
- Testes de integração sempre contra PostgreSQL real (Testcontainers);
  H2 proibido — migrations usam recursos específicos de PostgreSQL.

## 10. Integrações pendentes na apresentação

- **Frontend** (Next.js + TypeScript): não iniciado. Será apresentado quando
  existir; nenhuma parte desta documentação afirma integração já existente.
- **Figma**: link de referência visual ainda **não fornecido** pelo
  proprietário; será incorporado à apresentação e à documentação quando
  fornecido. Nenhuma tela, fluxo ou identidade visual é descrita como
  implementada.
