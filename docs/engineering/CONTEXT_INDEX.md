# CONTEXT INDEX — INVEST FÁCIL

**Data:** 22/11/2026
**Para:** agentes, desenvolvedores e revisores.
**Regra:** este índice **encaminha** para a fonte; não a substitui.
**Detalhes de autoridade:** `SOURCE_OF_TRUTH.md`.
**Matriz completa:** `SOURCE_REGISTRY.md`.

---

## 1. Comece por aqui

| Se você precisa… | Vá para | Fonte técnica |
|---|---|---|
| Entender o produto e o não-escopo | `README.md` | código + testes |
| Saber o que está implementado/testado | `SOURCE_REGISTRY.md` + `docs/PROGRESSO_GERAL.md` | código + relatórios de teste |
| Entender arquitetura e rastrear uma feature | `docs/architecture/README.md` + `docs/architecture/features/README.md` | código, endpoints, migrations e testes |
| Alterar frontend | `frontend/app/**` | `frontend/package.json`, build |
| Alterar backend | `backend/src/main/java/**` | `backend/pom.xml`, testes |
| Alterar banco | `backend/src/main/resources/db/migration/**` | Testcontainers |
| Alterar auth/segurança | `docs/security/SECURITY.md` + código `auth/**` | testes JUnit |
| Alterar API | `docs/api/README.md` + controllers | OpenAPI em runtime |
| Rodar/entender CI | `docs/engineering/CI_POLICY.md` | `.github/workflows/ci.yml` |
| Auditar agentes/permissões | `docs/engineering/AGENT_PERMISSION_MATRIX.md` | `opencode debug agents` + P0.3 |
| Entender skills | `docs/transformation/SKILL_REGISTRY.md` | `.opencode/skills/**` |
| Estado de vídeos | `video/projects/investfacil-10-creative-variants/reports/GATE4_PRODUCTION_INDEX.md` + `GATE4_PENDENCIAS.md` | MP4 + QC + `video/MEMORY.md` |
| Licenças/aprovações | `docs/GATE4_LICENSES.md` + `GATE4_PENDENCIAS.md` | decisão humana registrada |
| Deploy | `docs/DEPLOY.md` + `docs/RELEASE_READINESS.md` | nenhuma execução remota comprovada |
| Roadmap/transformação | `docs/transformation/TRANSFORMATION_ROADMAP.md` | `CHANGELOG.md` + verificações |
| Resolver conflito documental | `SOURCE_OF_TRUTH.md` §5 | evidência técnica |
| Validar docs e mapas | `scripts/docs/check_docs.py` | links, IDs, status, endpoints e paths |

---

## 2. Mapa por domínio

| # | Domínio | Documento principal | Fonte técnica/evidência | Status | Atenção |
|---:|---|---|---|---|---|
| 1 | Product Scope | `README.md` | código + testes | `VERIFIED` | deploy/vídeo/e-mail pendentes |
| 2 | Product Features | `README.md` + seed | `backend/src/main/resources/seed/content.json` | `PARTIAL` | upload de vídeo bloqueado; contagens corrigidas |
| 3 | Frontend | `docs/architecture/frontend-map.md` | build Next + Vitest | `PARTIAL` | sem E2E automatizado |
| 4 | Backend | `docs/architecture/backend-map.md` | `mvn test` 28/28 | `VERIFIED` | sem SAST/cobertura |
| 5 | Database | `docs/architecture/database-map.md` | migrations V1-V7 + Testcontainers 63/63 | `VERIFIED` | V7 local, não aplicada no Lab |
| 6 | Authentication | `docs/architecture/authentication-map.md` | testes JWT/TOTP/refresh + fluxo | `PARTIAL` | e-mail real/MFA UI/ownership tests pendentes |
| 7 | API Contracts | `docs/architecture/api-map.md` | 42 mappings + OpenAPI runtime | `PARTIAL` | sem snapshot/contract test; 5 endpoints sem UI |
| 8 | Testing | `docs/engineering/P0_2_VERIFICATION.md` | surefire 28 + Vitest 6 | `PARTIAL` | sem cobertura/E2E |
| 9 | CI/CD | `docs/engineering/CI_POLICY.md` | workflow 5 jobs | `PARTIAL` | execução remota não verificada |
| 10 | Security | `docs/security/SECURITY.md` + P0.3 | testes + policy/matrix | `PARTIAL` | riscos globais do P0.3 abertos |
| 11 | Agents | `docs/engineering/AGENT_SECURITY_POLICY.md` | 43 agentes resolvidos | `PARTIAL` | 28 globais/`build` fora do escopo local |
| 12 | Skills | `docs/transformation/SKILL_REGISTRY.md` | 5 locais + 4 Claude | `PARTIAL` | testing skill desatualizada |
| 13 | Design System | `frontend/app/globals.css` + components | inspeção visual | `UNKNOWN` | sem mapa de tokens |
| 14 | Video Production | `GATE4_PRODUCTION_INDEX.md` | 10 MP4 + QC + loudness | `PARTIAL` | aprovação humana/publicação não concedidas |
| 15 | Media Assets | `docs/engineering/MEDIA_ASSET_POLICY.md` | `.gitignore` + size guard | `VERIFIED` (local) | mídia não rastreada; hook opcional |
| 16 | Git & Repository | estado real do Git | `git status`, `.gitignore` | `VERIFIED` (local) | branch sem upstream/push |
| 17 | Infrastructure | `render.yaml`, Dockerfile, compose | build Docker histórico | `PARTIAL` | não reproduzido nesta missão |
| 18 | Deployment | `docs/DEPLOY.md` | nenhuma evidência remota | `NOT VERIFIED` | **não deployado** |
| 19 | Human Approvals | `GATE4_PENDENCIAS.md` + `video/MEMORY.md` | decisões datadas | `HUMAN REVIEW REQUIRED` | não há ledger formal de aprovações |
| 20 | Transformation Roadmap | `TRANSFORMATION_ROADMAP.md` | P0.1–P0.4 + P1.1 + CHANGELOG | `VERIFIED` (docs) | P1.2 não iniciado |

---

## 2.1 Feature maps e rastreabilidade (P1.1)

| Recurso | Onde | Uso |
|---|---|---|
| Índice de features | `docs/architecture/features/README.md` | 18 features por ID/domínio/rota/endpoint/tabela |
| Feature maps | `docs/architecture/features/FEAT-*.md` | UI → API → service → repository → tabela → teste |
| Mapa de rotas/componentes | `docs/architecture/frontend-map.md` | 19 rotas + `_not-found` |
| Mapa de endpoints | `docs/architecture/api-map.md` | 42 endpoints e consumidores |
| Mapa de banco/RLS | `docs/architecture/database-map.md` | 18 tabelas, migrations, policies |
| Autenticação | `docs/architecture/authentication-map.md` | login, refresh, MFA, roles, ownership |
| Dependências | `docs/architecture/dependency-map.md` | grafo entre features |
| Caminhos críticos | `docs/architecture/critical-paths.md` | 7 jornadas |
| Validador | `scripts/docs/check_docs.py` | links, IDs, status, paths, endpoints, testes |

**Limite:** o mapa é representação; código/teste continua sendo a fonte. O validador não
prova comportamento, deploy, aprovação ou isolamento de dados.

---

## 3. Contexto mínimo por tarefa

Copie/responda antes de executar:

```text
Objetivo:
Domínio:
Fonte oficial:
Evidência atual (comando/data/resultado):
Estado: implementation / test / verification / human_review / release
Dependências:
Limitações e riscos:
Arquivos permitidos:
Arquivos protegidos:
Critérios de aceitação:
Data/referência temporal:
```

Se algum campo não puder ser preenchido, registre `UNKNOWN`/`NOT VERIFIED` e não invente.
Não leia o repositório inteiro: consulte o domínio e as fontes indicadas.

---

## 4. Fluxo de descoberta

1. Identifique o domínio da tarefa.
2. Consulte este índice.
3. Abra o documento principal e a fonte técnica.
4. Confirme o estado atual na evidência (código/teste/artefato).
5. Leia riscos/dependências no `SOURCE_REGISTRY.md`.
6. Verifique se o documento é atual ou histórico.
7. Registre contradições/`STALE` encontradas.
8. Só execute depois de entender o estado real.

---

## 5. O que NÃO usar como estado atual

| Documento | Por quê | Substituto |
|---|---|---|
| `docs/transformation/PHASE0_BASELINE.md` | retrato de 21/11, antes de P0.1–P0.4 | `SOURCE_REGISTRY.md` |
| `docs/AUDITORIA_GERAL.md` | auditoria de 20/11 | README + registry |
| `docs/QUALIDADE_FINAL.md` | veredito de 21/11; não cobre Gate 4 | GATE4 + P0.4 |
| `_audit/**` | histórico/evidência datada | fontes atuais |
| `git-publication-plan.md` | plano de 15/11, dizia “sem Git” | estado real do Git |
| `.claude/CLAUDE.md` (corpo) | instruções históricas; banner no topo é o aviso | README/registry |
| `.claude/skills/invest-facil-testing` | diz 10 testes/80%; há 28 e sem JaCoCo | P0.2 + surefire |
| `video/projects/investfacil-10-creative-variants/README.md` | dizia “nenhum vídeo produzido” | GATE4 index (atualizado em P0.4) |
| Relatórios de agentes em `reports/agents/**` | opinião/evidência de etapa | MP4 + QC + GATE4 |

Documentos históricos preservados não foram apagados; receberam banner ou constam nesta
tabela.

---

## 6. Lacunas conhecidas

- Não há feature maps completos de frontend/backend/API; `FEATURE_MAP_INDEX.md` lista o que
  falta.
- Não há ledger formal de aprovações humanas; decisões estão em `video/MEMORY.md` e
  `GATE4_PENDENCIAS.md`.
- Não há snapshot OpenAPI nem contract test.
- Não há E2E automatizado de browser.
- Não há cobertura JaCoCo/Vitest.
- O `CONTEXT_INDEX` não substitui os mapas de feature ainda ausentes.

Classificação: `MAPPED` para o índice; `VERIFIED` apenas para a existência e os links
testados; `PARTIAL` para a cobertura de contexto.
