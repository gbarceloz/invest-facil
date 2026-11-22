# S0 — Preservação do frontend

**Projeto:** Invest Fácil
**Escopo:** inspeção de leitura; nenhum arquivo do frontend foi alterado
**Data:** 2026-11-22

---

## 1. Stack encontrada

| Item | Versão |
|---|---|
| Next.js | 16.4.6 (App Router) |
| React | 19.1 |
| TypeScript | 5.7 |
| Tailwind CSS | 3.4.17 |
| Recharts | 3.2.1 |
| React Markdown / remark-gfm | 10.1 / 4.0 |
| Testes | Vitest 3.0 + Testing Library; Playwright 1.56 (E2E) |

O frontend é uma aplicação Next.js; não há Angular, Supabase SDK, cliente de banco ou credencial de banco no navegador.

---

## 2. Estrutura

### 2.1 Rotas de página — 19

- `/` — landing
- `/cadastro`
- `/entrar`
- `/recuperar-senha`
- `/redefinir-senha`
- `/verificar-email`
- `/app` — dashboard
- `/app/aprender`
- `/app/aprender/modulo/[slug]`
- `/app/aprender/aula/[slug]`
- `/app/aprender/quiz/[slug]`
- `/app/biblioteca`
- `/app/biblioteca/[slug]`
- `/app/mercado-financeiro`
- `/app/mercado` — redirect legado para `/app/bitcoin`
- `/app/bitcoin`
- `/app/progresso`
- `/app/simulador`
- `/app/perfil`

### 2.2 Componentes compartilhados

`AppShell`, `AuthLayout`, `LearningTrackList`/`LevelCards`, `Logo`, `Markdown`, `PageHeader`/`Stat`/`Badge`, `ProgressBar`/`LevelRing`, `Alert`/`EmptyState`/`Spinner`/`Skeleton`/`Disclaimer`.

### 2.3 Biblioteca de cliente

- `lib/api.ts` — fetch, bearer em memória, refresh em 401, `ApiError`, `auth:expired`.
- `lib/auth.tsx` — `AuthProvider`, login, MFA, restore, logout.
- `lib/app-data.tsx` — progresso, gamificação e recarregamento.
- `lib/types.ts` — DTOs manuais alinhados ao OpenAPI.
- `lib/format.ts` — datas, moeda, percentuais.

---

## 3. Integração com o backend

- O frontend chama **`/api` no próprio domínio**; o `next.config.ts` faz rewrite para `API_PROXY_TARGET` (default local `http://localhost:8081`).
- Não há chamada direta a Supabase, PostgreSQL ou service key.
- O cookie de refresh é `HttpOnly` e first-party; o access token fica em memória.
- Há 23 ocorrências de chamadas `/api/v1` no código do frontend.
- Contrato verificado na P1.2: 37 paths e 35 DTOs mapeados; `npm run typecheck`, `npm test` e `npm run build` passaram.
- E2E P1.2: 5/5 jornadas passaram com backend local e PostgreSQL descartável.

---

## 4. Preservação

Nenhum arquivo do frontend foi criado, alterado, removido ou reformatado nesta S0.

Hashes de preservação no início da S0:

| Medida | Valor |
|---|---|
| `git status --porcelain -- frontend` (hash) | `55b3268e6e534120f6c30d66833513cc2af2e527` |
| `git diff -- frontend` (hash) | `d794ae16034d304eb1cd42e32f77122428f4af69` |

Esses valores devem ser reutilizados no relatório final para comprovar que o frontend permaneceu intacto.

---

## 5. Impacto esperado da integração com o Supabase

Se o Supabase for conectado sem mudar contratos da API:

- **Nenhuma mudança visual é necessária.**
- O frontend continua falando apenas com `/api/v1`.
- Estados de erro/fallback já existentes continuam válidos:
  - vídeo indisponível → “Vídeo em preparação”;
  - market/bitcoin indisponível → estado `UNAVAILABLE`;
  - sessão expirada → refresh/401 e retorno ao login;
  - API fora → mensagens de erro já tratadas.

Riscos que poderiam exigir ajuste **não visual**:

1. Cookie de refresh em domínio cruzado se o rewrite deixar de ser same-origin.
2. CORS se o frontend chamar o backend diretamente.
3. Aumento de latência do backend → banco (Supabase em outra região) e timeouts de UI.
4. Contrato de DTO divergente após qualquer mudança de migration/API.
5. `EXPOSE_DEV_TOKENS` ou e-mail não configurado em produção.

Nenhum desses pontos justifica redesign, refatoração visual ou troca de componentes nesta missão.

---

## 6. Conclusão

O frontend está preservado e desacoplado do banco. A futura conexão com o Supabase deve ser transparente para a UI, desde que a API mantenha os contratos atuais e o proxy `/api` continue same-origin. Qualquer alteração visual está fora do escopo e não foi proposta.
