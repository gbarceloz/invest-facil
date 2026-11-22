# P1.2 — Relatório de execução

**Missão:** API Contracts, Ownership Security & End-to-End Verification
**Projeto:** Invest Fácil
**Raiz:** `<repo>`
**Data:** 2026-11-22
**Status geral:** **PASS WITH LIMITATIONS**

> O status não é PASS pleno: a CI remota não foi executada, a RLS não foi corrigida, integrações externas não foram testadas live e não houve aprovação humana.

---

## 1. Baseline e estado final

### 1.1 Início da P1.2

| Item | Valor |
|---|---|
| Branch | `feat/mvp-completo` |
| HEAD | `100d3fe` |
| Staged | 0 |
| Working tree | 79 entradas (39 modificadas, 40 não rastreadas) |
| Commits/push/PR/merge/deploy | 0 |

### 1.2 Fim da P1.2

| Item | Valor |
|---|---|
| Branch | `feat/mvp-completo` |
| HEAD | `100d3fe` (inalterado) |
| Staged | 0 |
| Working tree final | 91 entradas (42 modificadas, 49 não rastreadas) |
| Commits/push/PR/merge/deploy | 0 |
| Produto (backend/frontend app) alterado | **não** |
| Configuração global/agentes/skills/MCP | **não alterada** |

O working tree continua contendo todo o trabalho anterior. A P1.2 acrescentou testes, contratos, scripts, configuração de E2E/CI e documentação.

---

## 2. Arquivos criados e alterados

### 2.1 Criados

**Backend**
- `backend/src/test/java/com/investfacil/api/contract/OpenApiSnapshotIntegrationTest.java`
- `backend/src/test/java/com/investfacil/api/security/OwnershipSecurityIntegrationTest.java`
- `backend/src/test/java/com/investfacil/api/security/ExtendedIntegrationTest.java`
- `backend/src/test/java/com/investfacil/api/security/VideoAdminIntegrationTest.java`

**Contratos e scripts**
- `docs/contracts/openapi.json`
- `scripts/contracts/check_openapi_contract.py`
- `scripts/contracts/check_frontend_contracts.cjs`

**Frontend**
- `frontend/__tests__/api.test.ts`
- `frontend/playwright.config.ts`
- `frontend/e2e/global-setup.ts`
- `frontend/e2e/global-teardown.ts`
- `frontend/e2e/start-web.mjs`
- `frontend/e2e/helpers.ts`
- `frontend/e2e/auth.spec.ts`
- `frontend/e2e/learning.spec.ts`
- `frontend/e2e/simulator.spec.ts`
- `frontend/e2e/market.spec.ts`
- `frontend/e2e/profile.spec.ts`

**Documentação**
- `docs/verification/P1_2_BASELINE.md`
- `docs/verification/P1_2_TEST_MATRIX.md`
- `docs/verification/P1_2_SECURITY_FINDINGS.md`
- `docs/verification/P1_2_VERIFICATION.md`
- `docs/recovery/INCIDENT_M12_10_WRONG_PROJECT.md` (incidente separate, não P1.2)

### 2.2 Alterados

- `.github/workflows/ci.yml` — jobs `api-contract`, `security-integration`, `e2e`; gate geral atualizado.
- `.gitignore` — artefatos de Playwright/test-results.
- `frontend/package.json` / `frontend/package-lock.json` — `@playwright/test` como devDependency e scripts `e2e`.
- `frontend/vitest.config.ts` — Vitest restrito a `__tests__/**/*.test.{ts,tsx}` para não executar specs do Playwright.

Nenhum controller, service, DTO, entidade, migration, schema, auth, seed ou página de produto foi alterado pela P1.2.

---

## 3. Contrato OpenAPI

- Documento real servido em `/v3/api-docs`.
- Snapshot versionado: `docs/contracts/openapi.json`.
- Conteúdo: **37 paths, 42 operações, 52 schemas**.
- Comparador: `scripts/contracts/check_openapi_contract.py`.
- Resultado atual: `BREAKING=0 COMPATIBLE=0`, exit 0.
- Teste negativo executado:
  - path removido → exit 1, `BREAKING`;
  - path adicionado → exit 0, `COMPATIBLE`.
- O snapshot nunca é atualizado automaticamente.

**Limitação:** o comparador verifica contrato estrutural, não comportamento, autorização ou serialização em runtime.

---

## 4. Tipos frontend/backend

- Estratégia: validação estática leve, sem introduzir cliente gerado ou dependência pesada.
- `scripts/contracts/check_frontend_contracts.cjs` verifica:
  - todos os paths `/api/v1` chamados pelo frontend existem no snapshot;
  - 35 DTOs manuais não usam campos ausentes;
  - campos obrigatórios do OpenAPI estão representados.
- Resultado: **PASS — 37 API paths, 35 DTOs mapeados**.
- `frontend/lib/api.ts` ganhou testes de refresh único em 401, concorrência, `auth:expired`, 403/404/500 e fallback não-JSON.
- Typecheck: **exit 0**.
- Testes frontend: **12/12 PASS**.
- Build de produção: **exit 0**, 20 entradas.

**Limitação:** não há geração automática de tipos nem contract test de serialização real; campos opcionais/nulos ainda dependem de revisão.

---

## 5. Ownership e autorização

### 5.1 Dois usuários independentes

`OwnershipSecurityIntegrationTest` cria A, B e ADMIN em PostgreSQL real (Testcontainers) e executa 7 testes:

| Teste | Resultado | Persistência verificada |
|---|---|---|
| A não lê/altera progresso de B | PASS | `user_progress` de B intacto |
| A não exclui cenário de B | PASS | cenário de B permanece |
| A não revoga sessão de B | PASS | sessão de B permanece |
| Anônimo em rotas protegidas | PASS (401) | — |
| USER × ADMIN em `/admin/videos` | PASS (403 × 200) | — |
| Bearer malformado | PASS (401) | — |
| PATCH de perfil só altera o principal | PASS | B inalterado |

### 5.2 ADMIN upload/list

`VideoAdminIntegrationTest` (3/3 PASS):

- anônimo → 401;
- USER → 403;
- ADMIN lista → 200;
- ADMIN upload válido → 201, asset persistido, `storage.upload` chamado;
- formato/assinatura inválidos → 400, nada persistido;
- lesson inexistente → 404, nada persistido;
- boundary Supabase **simulado**; nenhum upload real.

---

## 6. Investigação da RLS

Evidência local em PostgreSQL 17:

- 19 tabelas no schema; 18 com RLS habilitada (`flyway_schema_history` excluída).
- 18 policies `app_rw` para `investfacil_app` com `USING (true)` e `WITH CHECK (true)`.
- `FORCE ROW LEVEL SECURITY`: **ausente** em todas.
- Owner das tabelas: `postgres`.
- `investfacil_app`: `rolsuper=false`, `rolbypassrls=false`, `rolcanlogin=false`.
- O datasource local/test usa o usuário administrativo do container, que bypassa RLS.
- Em produção, o role de runtime não foi verificado; a migration sugere `investfacil_runtime` com `NOINHERIT`, mas a aplicação não executa `SET ROLE`.

**Conclusão:** a RLS não isola por usuário. O isolamento é aplicacional, via `user_id` nas queries. Não foi observado vazamento A×B nos endpoints testados, mas a defesa de banco é permissiva.

Detalhes e proposta em `docs/verification/P1_2_SECURITY_FINDINGS.md`. Nenhuma policy/migration foi alterada.

---

## 7. Testes de integração adicionados

`ExtendedIntegrationTest` — 8/8 PASS:

1. MFA: setup, enable, challenge de login, código errado, código válido, replay rejeitado.
2. Sessões: listar, rotacionar, revogar, refresh revogado.
3. Troca de senha: senha atual, revogação de sessões, senha antiga falha, nova funciona.
4. Artigos: lista, detalhe, 404 e busca com validação mínima.
5. Market/Bitcoin: fallback `UNAVAILABLE` sem rede.
6. Vídeo público sem asset: 404.
7. Gamificação: 70 XP, nível Curioso, streak 1, achievement, histórico.
8. JWT expirado e assinado com chave errada: 401.

`MvpFlowIntegrationTest` continua cobrindo cadastro → verificação → login → aula → progresso → quiz → XP → simulador → refresh/reuso → reset.

---

## 8. E2E real

**Resultado final: 5/5 PASS**, executado localmente com frontend de produção (`next start`) e backend Spring Boot isolados, PostgreSQL em container e navegador Microsoft Edge via Playwright.

| Jornada | Resultado |
|---|---|
| A — cadastro, verificação, login, dashboard, perfil, logout | PASS |
| B — catálogo, módulo, aula, conclusão, quiz, XP/progresso | PASS |
| C — simulador, cálculo, salvar, reload, persistência | PASS |
| D — Bitcoin/mercado, fallback explícito, redirect legado | PASS |
| E — perfil, atualizar nome, reload, persistência | PASS |
| F — ADMIN | Não aplicável como UI; API coberta por integração |

Evidências: `frontend/playwright-report/` e `frontend/test-results/` (screenshots/traces em falhas anteriores; execução final sem falhas).

**Limitações:** E2E usa `EXPOSE_DEV_TOKENS=true`, provedores externos desabilitados e banco descartável; não é validação de produção. A execução em CI com Chromium não foi realizada nesta missão.

---

## 9. CI

`.github/workflows/ci.yml` foi atualizado com:

- `api-contract`: captura OpenAPI e compara snapshot.
- `security-integration`: ownership, ADMIN e fluxos estendidos.
- `e2e`: Playwright + backend local + PostgreSQL.
- `frontend`: contrato frontend/backend antes dos testes.
- `overall`: exige todos os gates, inclusive os novos.

**Limitação:** o workflow não foi executado no GitHub; não houve push. A validação foi estrutural/local. Nenhum gate anterior foi removido ou enfraquecido.

---

## 10. Resultados dos comandos

| Comando | Exit | Resultado |
|---|---|---|
| `mvn -B -Pdocker-desktop-newapi test` | 0 | 47 testes, 0 falhas, 0 erros, 0 skipped |
| `python scripts/ci/assert-surefire.py` | 0 | PASS 47; database/security gates PASS |
| `python scripts/contracts/check_openapi_contract.py` | 0 | `BREAKING=0 COMPATIBLE=0` |
| `node scripts/contracts/check_frontend_contracts.cjs` | 0 | 37 paths, 35 DTOs |
| `npm test` | 0 | 3 arquivos, 12 testes |
| `npm run typecheck` | 0 | sem erros |
| `npm run build` | 0 | 20 entradas |
| `npm run e2e` | 0 | 5/5 |
| `python scripts/docs/check_docs.py` | 0 | 19 canônicos, 18 mapas, 42 endpoints, 50 refs, 23 links |
| `git diff --check` | 2 | apenas achado pré-existente: blank line no EOF de `frontend/app/app/progresso/page.tsx`; arquivo não foi tocado pela P1.2 |

Observação: uma execução inicial de `mvn test` sem `clean` encontrou um XML de teste antigo e o gate contou 48; os relatórios gerados foram limpos e a execução final, com 13 suítes, contou 47. A CI usa `mvn clean verify`, portanto não herda relatórios antigos.

---

## 11. Defeitos encontrados e corrigidos

Todos os itens abaixo são defeitos de **infraestrutura de teste/documentação**, não de produto:

1. E2E recebia `403 Invalid CORS request` para `127.0.0.1:3100`; corrigido com `CORS_ALLOWED_ORIGINS` no backend de teste.
2. Arquivos E2E ficaram com BOM/mojibake após substituição em massa; corrigidos para UTF-8 sem BOM.
3. Vitest executava specs do Playwright; corrigido com `include` restrito a `__tests__`.
4. Teste de sessão revogava uma sessão já rotacionada; corrigido para revogar a sessão ativa.
5. Teste de MFA esperava 400 para TOTP inválido; o produto retorna 401 `UNAUTHORIZED`, mantido e documentado.
6. Teste de gamificação assumia achievement na posição 0; corrigido para localizar por `code`.
7. Teste de logout esperava `/`; o produto redireciona para `/entrar?next=...`; expectativa corrigida.
8. Seletores de heading “Perfil” e navegação “Meu progresso” estavam ambíguos/frágeis; corrigidos.
9. Relatório surefire antigo inflava a contagem local; removido apenas o XML gerado.

Nenhuma validação de produto foi enfraquecida para fazer teste passar.

---

## 12. Cobertura e lacunas

Não foi configurado JaCoCo/cobertura percentual. A cobertura foi tratada por requisito/jornada:

- Regras financeiras: simulador (cálculo/salvar) e fallback de mercado.
- Auth: cadastro, verificação, login, refresh, MFA, reset, troca de senha, logout.
- Autorização: A×B, anônimo, USER×ADMIN.
- Persistência: progresso, cenário, perfil, vídeo, sessões.
- Erros: 400/401/403/404/500, JWT inválido/expirado, replay.
- Jornadas: 5 E2E.

Lacunas remanescentes:

- RLS per-user não implementada.
- Access token não revogável antes de 15 min.
- Rate limit em memória.
- Sem teste live de Supabase/Resend/Binance/CoinGecko.
- Sem teste de carga, visual regression, acessibilidade automatizada ou cobertura de branches.
- `lesson_articles` órfã.
- 5 endpoints sem UI.
- CI remoto não executado.
- MFA recovery codes, e-mail real e bloqueio distribuído não testados.

---

## 13. Rollback

Como não houve commit, o rollback é por arquivo:

- remover os arquivos novos listados na seção 2.1;
- reverter apenas as seções P1.2 em `.github/workflows/ci.yml`, `.gitignore`, `frontend/package.json`, `frontend/package-lock.json` e `frontend/vitest.config.ts`;
- preservar integralmente os 79 itens do baseline e todo o trabalho anterior.

Não usar `git reset --hard`, `git clean -fd`, `git checkout .` ou `git restore .`. Nenhum rollback foi executado.

---

## 14. Riscos e recomendação

| Risco | Severidade | Estado |
|---|---|---|
| RLS `USING (true)` sem isolamento per-user | **HIGH** | Aberto; proposta documentada |
| Owner/superuser bypassa RLS; sem FORCE | **HIGH** | Aberto |
| Provisionamento do role runtime não verificado | MEDIUM/HIGH | Aberto |
| Access token válido por 15 min após logout | MEDIUM | Aberto |
| Rate limit por instância | MEDIUM | Aberto |
| Integrações externas sem teste live | MEDIUM | Aberto |
| CI remoto não executado | MEDIUM | Limitação |
| `lesson_articles` órfã | LOW | Aberto |
| Endpoints sem UI | LOW | Decisão humana |

**Recomendação para P1.3:** priorizar a correção de isolamento no banco (policy por usuário + `FORCE RLS` + contexto transacional), teste de revogação de access token, contract test no CI remoto e decisão sobre endpoints sem UI. Não promover a produção com a RLS atual como “segura”.

---

## 15. Reprodução local

```powershell
# Backend (Docker/Testcontainers)
cd <repo>\backend
$env:JAVA_HOME="%JAVA_HOME%"
mvn -B -Pdocker-desktop-newapi test
cd ..
python scripts\ci\assert-surefire.py

# Contratos
python scripts\contracts\check_openapi_contract.py
node scripts\contracts\check_frontend_contracts.cjs

# Frontend
cd frontend
npm test
npm run typecheck
npm run build

# E2E (Docker + navegador; o script sobe backend/PostgreSQL isolados)
$env:E2E_BROWSER_CHANNEL="msedge"
npm run e2e
```

No Windows, o Playwright usa o Edge instalado por padrão; na CI ele instala Chromium com `npx playwright install --with-deps chromium`. O E2E recompila o frontend com `API_PROXY_TARGET=http://127.0.0.1:18081` e define `CORS_ALLOWED_ORIGINS` apenas no backend de teste.

---

## 16. Conclusão

A P1.2 entregou:

- contrato OpenAPI verificável;
- compatibilidade frontend/backend avaliada;
- testes de ownership A×B e USER×ADMIN com persistência;
- investigação de RLS com evidência;
- integração para MFA, sessões, senha, perfil, artigos, market, Bitcoin, vídeo e gamificação;
- 5 jornadas E2E reais;
- CI estruturalmente ampliada.

**Status final: PASS WITH LIMITATIONS.** Não é PASS pleno, não é aprovação de segurança e não é autorização de deploy.
