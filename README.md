# Invest Fácil

Plataforma web de **educação financeira** para o Brasil: conteúdo em português,
estruturado em trilhas curtas, com vídeos, artigos, quizzes e progresso gamificado
(XP, níveis e conquistas).

> Projeto desenvolvido para o **Hack Brasil 2026** (entrega em 12/12/2026).

## O problema

A maioria dos brasileiros toma decisões financeiras sem educação básica sobre o
tema. As fontes disponíveis hoje dividem-se em:

- conteúdo técnico em inglês, fragmentado e sem sequência didática;
- redes sociais, onde promessas de ganho rápido se misturam a informação real;
- plataformas de investimento, cujo objetivo comercial é incentivar transações —
  não ensinar.

Quem está começando não tem um caminho claro, confiável e em português para
aprender o básico antes de arriscar dinheiro.

## Público-alvo

Pessoas no Brasil começando do zero em finanças pessoais e investimentos,
especialmente quem não tem familiaridade com termos do mercado e nunca investiu.

## Proposta de valor

- **Trilha estruturada**: categorias → módulos → aulas curtas, em ordem
  didática, com artigos de aprofundamento.
- **Aprendizado ativo**: quizzes por aula e progresso acompanhado.
- **Gamificação honesta**: XP por estudo concluído, níveis e conquistas — o
  objetivo é recompensar *aprender*, nunca transacionar.
- **Contexto de mercado, não execução**: cotações de BTC e ETH apenas
  informativas (dados públicos da Binance). A plataforma **não** executa
  ordens, não mantém carteira e não dá recomendação de investimento.

## Funcionalidades

### Implementadas (backend T1)

- Base do backend principal: Java 21 + Spring Boot 3.5.6, Maven, monólito modular.
- Schema PostgreSQL completo via Flyway (V1: 17 tabelas) com RLS deny-by-default
  e papéis separados (V2).
- Envelope de erros global (`ApiError`) sem vazamento de detalhes internos.
- Spring Security baseline: API fail-closed (403 por padrão), CORS por variável
  de ambiente, BCrypt, sessões stateless.
- Swagger/OpenAPI (`/swagger-ui.html`) e Actuator (`/actuator/health`).
- 10 testes automatizados, incluindo integração real com PostgreSQL
  (Testcontainers) validando migrations e a segurança de papéis/RLS.
- Verificação automatizada de ausência de credenciais versionadas.

### Planejadas (não implementadas ainda — não use como prontas)

- Autenticação completa: cadastro, login (JWT de curta duração), refresh com
  rotação/revogação, verificação de e-mail e reset de senha, rate limiting.
- Perfis de usuário e papéis USER/ADMIN.
- Catálogo de conteúdo (categorias, módulos, aulas, artigos) e gestão admin.
- Vídeos com upload por URL assinada no Supabase Storage.
- Progresso, quizzes e gamificação (XP ledger append-only).
- Cotações de mercado (BTC/ETH, Binance REST, cache TTL 30s, estado
  FRESH/STALE/UNAVAILABLE) — apenas informativo.
- Frontend web (Next.js + TypeScript, referência visual pendente).

## Arquitetura

Monólito modular em Java, com um único deploy: cada domínio é um pacote Java
com fronteira documentada (`com.investfacil.api.*`); a comunicação entre
módulos se dá por interfaces de serviço. Detalhes em
[docs/architecture/overview.md](docs/architecture/overview.md).

```
backend/          API principal (Spring Boot)
docs/             arquitetura, banco de dados e segurança
```

## Stack

| Camada | Tecnologia |
|---|---|
| Linguagem | Java 21 |
| Framework | Spring Boot 3.5.6 (Web MVC, Security, Data JPA, Validation, Actuator) |
| Build | Maven |
| Banco | PostgreSQL 17 (schema dedicado `investfacil`) |
| Schema | Flyway (única fonte de verdade) |
| Docs de API | springdoc-openapi (Swagger UI) |
| Testes | JUnit 5, Testcontainers (PostgreSQL real — nunca H2) |
| Infra planejada | Supabase (PostgreSQL + Storage), deploy via variáveis de ambiente |

## Como executar localmente

Pré-requisitos: JDK 21, Maven, Docker (para o PostgreSQL de teste) — `mvn` e
`java` podem não estar no PATH; use os caminhos completos da sua instalação.

```powershell
cd backend
mvn -B clean verify
```

Sem Docker, os testes de integração são pulados e registrados como pulados
(nunca substituídos por falso sucesso).

Para subir a API com um banco local:

```powershell
# exemplo com Docker
docker run -d --name investfacil-db -e POSTGRES_PASSWORD=local -e POSTGRES_DB=investfacil -p 5432:5432 postgres:17-alpine

cd backend
$env:SPRING_DATASOURCE_URL = "jdbc:postgresql://localhost:5432/investfacil"
$env:SPRING_DATASOURCE_USERNAME = "postgres"
$env:SPRING_DATASOURCE_PASSWORD = "local"
$env:SPRING_PROFILES_ACTIVE = "dev"
mvn spring-boot:run
```

Depois acesse:

- Swagger UI: <http://localhost:8080/swagger-ui.html>
- Health (público): <http://localhost:8080/actuator/health>

> As rotas da API exigem autenticação por padrão (fail-closed). Endpoints
> públicos atuais: `/actuator/health/**` e documentação Swagger.

## Variáveis de ambiente

Copie `backend/.env.example` para `backend/.env` (o arquivo `.env` **não** é
versionado) e preencha. Nenhuma credencial real é commitada; a aplicação
recusa iniciar sem o datasource configurado.

## Como executar os testes

```powershell
cd backend
mvn -B clean verify
```

- `GlobalExceptionHandlerTest` — envelope de erros (404/400/500).
- `FlywaySecurityIntegrationTest` — migrations + segurança de papéis/RLS em
  PostgreSQL real (requer Docker; pulado e registrado se indisponível).
- `SecretsScanTest` — falha o build se houver padrão de segredo versionado.

> **Observação de ambiente:** nesta máquina de desenvolvimento, o Docker
> Desktop 29.x exige o perfil opcional `-Pdocker-desktop-newapi` (documentado
> no `pom.xml`). Em CI e outras máquinas, use `mvn -B clean verify` simples.

## Estado atual

- **T1 concluída, promovida e verificada**: skeleton, migrations e segurança de
  banco em `backend/`, com build e 10 testes aprovados **no destino**
  (`mvn -B clean verify -Pdocker-desktop-newapi`; evidências em
  `backend/T1_RELATORIO.md` e `backend/promotion-report.md`).
- **Próxima etapa (T2)**: módulo de autenticação — **não iniciada**.
- **Frontend**: não iniciado. A frente visual (Next.js + TypeScript) e a
  referência do Figma serão integradas à apresentação quando o link e as
  informações correspondentes forem fornecidos.

## Equipe

Backend e arquitetura implementados com apoio de agentes de IA (implementação
do skeleton T1, migrações e documentação técnica), sob direção do proprietário
do projeto. Créditos de nomes pessoais: a definir pelo proprietário — nada foi
inventado aqui.

## Licença

Decisão do proprietário: **NONE** (sem licença). O repositório será
publicamente visível apenas para avaliação no Hack Brasil; **nenhuma licença
de reutilização foi concedida** e nenhum arquivo LICENSE será criado. O fato
de o repositório ser público **não** significa que o código seja open source.
