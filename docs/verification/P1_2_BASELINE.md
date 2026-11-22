# P1.2 — Baseline e estado operacional

**Missão:** API Contracts, Ownership Security & End-to-End Verification
**Projeto:** Invest Fácil
**Raiz:** `<repo>`
**Data de referência:** 2026-11-22 (início da P1.2, aproximadamente 00:50 -03:00)

---

## 1. Estado Git no início

| Item | Valor |
|---|---|
| Branch | `feat/mvp-completo` |
| HEAD | `100d3fe` — `docs: relatorio consolidado da missao complementar` |
| Staged | 0 |
| Working tree | 79 entradas |
| Modificadas | 39 |
| Não rastreadas | 40 |
| Commits durante a missão | 0 |
| Upstream | não configurado |
| Push / PR / merge / deploy | não executados |

O working tree já continha trabalho legítimo anterior à P1.2 (P0.x, P1.1, correções de produto, conteúdo e audiovisual). Nada disso foi tratado como descartável.

## 2. Artefatos P1.1 existentes

- 10 mapas transversais em `docs/architecture/`
- 18 feature maps em `docs/architecture/features/`
- `docs/engineering/P1_1_VERIFICATION.md`
- `scripts/docs/check_docs.py` estendido
- 42 endpoints, 18 features, 19 rotas, 18 tabelas, 7 caminhos críticos

## 3. Stack e ferramentas disponíveis

| Ferramenta | Versão / estado |
|---|---|
| Frontend | Next.js 16.4.6, React 19.1, TypeScript 5.7 |
| Backend | Java 21, Spring Boot 3.5.6 |
| Banco | PostgreSQL 17 (container local) |
| Docker | 29.8.2 |
| Node | 26.13.0 |
| npm | 11.20.0 |
| Java | 21 (JDK local) |
| Playwright / Cypress | **não instalados no início** |
| Navegador | Microsoft Edge 157 disponível; Chromium do Playwright não instalado |
| OpenAPI | springdoc em `/v3/api-docs`, público |

## 4. Testes existentes no início

| Camada | Quantidade |
|---|---|
| Backend | 28 testes em 9 classes |
| Frontend | 6 testes em 2 arquivos |
| E2E | 0 |
| Contract tests | 0 |
| Cobertura | não configurada |

## 5. Hashes dos documentos canônicos no início

| Arquivo | SHA-256 |
|---|---|
| `docs/engineering/SOURCE_OF_TRUTH.md` | `C8860E181D21ED8D9D4A65C4A9C379CDDAF52AF361A5C6BF13757F8A41A7EB85` |
| `docs/engineering/CONTEXT_INDEX.md` | `50EB9D4064D3155ECD0D336B89DE2210A542892B751606FE88BE4B43C0584708` |
| `docs/engineering/SOURCE_REGISTRY.md` | `3A7A373BAAEE394B8B40F1CBF10C3B9986EBA67232B9568AF902D72B86FF40A4` |
| `docs/engineering/P1_1_VERIFICATION.md` | `CD360CB04C0344316468DF6FD38A6835D10A68D89286AB8CA0C023F86B5161D4` |
| `scripts/docs/check_docs.py` | `28C7113C5AED31A8F5884D9FB557EF6DF7F38038D4AA5980E574A6306CD47643` |
| `.github/workflows/ci.yml` | `3302EAE702FC1059BAFF7A41944802F14152F46B1F7E35A081AF5CA1F3DFE6DD` |
| `backend/pom.xml` | `A976A5753C0E54B1EC0997D131304AF0747A27C986902908042A70493ADBB094` |
| `frontend/package.json` | `07677C18AC86AB700F5E193585191095723AB71A770C47471EBCEB1A27DD7A71` |

## 6. Limitações declaradas desde o início

- Não havia credenciais de produção nem autorização para usá-las.
- Não havia Testcontainers/PostgreSQL remoto validado; apenas Docker local.
- Não havia browser E2E instalado.
- CI remoto e branch protection não tinham evidência de execução.
- A RLS `app_rw USING (true)` já era conhecida como não per-user.
- Integrações Supabase, Resend, Binance e CoinGecko não tinham teste live.

## 7. Nota de reconstrução

Este arquivo foi produzido durante a P1.2 para registrar o baseline operacional reconstruído a partir dos comandos e hashes executados no início da missão. Ele não altera o estado do produto nem substitui os relatórios P0.x/P1.1.
