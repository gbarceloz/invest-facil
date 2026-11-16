# PUBLIC_REPOSITORY_AUDIT — Auditoria para publicação pública

**Status: APROVADA COM RESSALVAS — Pós-publicação**
**Data: 2026-11-15 | Commit: 827e54a | Branch: main | Repositório: https://github.com/gbarceloz/invest-facil**

---

## 1. Estado da Publicação

O repositório **já é público** em `https://github.com/gbarceloz/invest-facil`.
Branch `main` publicada com commit inicial **827e54a** ("chore: initial public import - backend T1 (build verified, 10/10 tests)").

A auditoria pós-publicação foi concluída (Missão 02.8/02.9).
**Resultado: APROVADA COM RESSALVAS** — ver seção 6.

---

## 2. Escopo Auditado (Conteúdo Publicado)

| Caminho | Descrição |
|---|---|
| `README.md` | Documentação principal (licença NONE declarada) |
| `backend/` | Código fonte, pom, migrations, testes, docs de evidência |
| `docs/` | Arquitetura, segurança, API |

**Não publicados (excluídos via `.gitignore`):**
- `_staging/`, `_quarantine/`, `_audit/` (diretórios internos)
- `backend/target/`, `*.log` (artefatos de build)
- `.env*` (exceto `.env.example`)
- `git-publication-plan.md` (planejamento interno, untracked)

---

## 3. Verificações Executadas (Pré e Pós-Publicação)

| # | Verificação | Método | Resultado |
|---|---|---|---|
| 1 | `.env` / `.env.local` / `.env.production` | Busca por nome | ✅ Nenhum; apenas `.env.example` sem valores |
| 2 | Credenciais/tokens/chaves por padrão | Varredura regex | ✅ Nenhum em código, migrations, pom, docs |
| 3 | Configurações com valores reais | Revisão de `application*.yml`, `pom.xml` | ✅ Tudo via placeholder `${ENV:}` |
| 4 | `target/`, `node_modules/` | Inventário | ✅ Excluídos via `.gitignore` |
| 5 | Logs | Varredura por segredos/dados pessoais | ✅ Excluídos (não publicados) |
| 6 | Histórico Git | Procura de `.git` aninhado | ✅ Commit inicial limpo (827e54a) |
| 7 | Dados pessoais | Busca por caminhos absolutos | ✅ Sanitizados (`<workspace>`, `<usuário>`) |
| 8 | URLs privadas | Revisão | ✅ Nenhuma |
| 9 | Projeto RBS | Contorno | ✅ Fora do escopo |

---

## 4. Hits Analisados e Disposição

| O que | Onde | Classificação | Disposição |
|---|---|---|---|
| `Using generated security password: <uuid>` | `*.log`, `target/surefire-reports/*.xml` | Senha efêmera de runtime | Não publicado (excluído via `.gitignore`) |
| `C:\Users\<usuário>\...` | Logs locais | Dado pessoal leve | Não publicado |
| `C:\Users\<usuário>\...` | `T1_RELATORIO.md`, `promotion-report.md` | Dado pessoal leve | **Sanitizado** → `<workspace>` |
| `tcp_info.txt` | `backend/` (local) | Debug transitório | Não publicado |

Nenhum valor é segredo reutilizável. As senhas geradas só existiram durante cada execução da JVM.

---

## 5. Histórico Git

- Commit inicial: **827e54a** ("chore: initial public import - backend T1 (build verified, 10/10 tests)")
- Sem histórico anterior — repositório nasceu limpo via `git init`.
- Branch `main` publicada e sincronizada com `origin/main`.
- Hash local = remoto confirmado: `827e54ad8c8dfc52a8af83b77acb9d4be2d486f5`.

---

## 6. Exclusões Obrigatórias (Confirmadas no Commit 827e54a)

Cobertas por `.gitignore` (raiz e `backend/`):

- `backend/target/` (inclui `surefire-reports/`)
- `*.log` (`build_t1.log`, `build_promotion.log`, `t_*.log`, `swagger_boot*.log`)
- `.env*` (exceto `.env.example`)
- `_staging/`, `_quarantine/`, `_audit/`
- `git-publication-plan.md` (untracked)

---

## 7. Veredicto Pós-Publicação

**APROVADA COM RESSALVAS**

### Ressalvas (ações recomendadas para o proprietário):

1. **Substituir `SECURITY_CONTACT_EMAIL_PENDING`** em `docs/security/SECURITY.md` pelo e-mail real.
2. **Atualizar descrição do GitHub** para:
   `"Invest Fácil — plataforma de educação financeira e investimentos em desenvolvimento."`
3. **Remover referências a arquivos não publicados** nos documentos públicos:
   - `backend/promotion-report.md` → remover menção a `build_promotion.log` e `git-publication-plan.md`
   - `backend/T1_RELATORIO.md` → remover menção a `build_t1.log` e `target/investfacil-api-0.1.0-SNAPSHOT.jar`
   - `docs/RELEASE_READINESS.md` → remover menção a `build_promotion.log` e `git-publication-plan.md`
   - `docs/security/PUBLIC_REPOSITORY_AUDIT.md` (este arquivo) → remover referências a logs e `git-publication-plan.md`
4. **Reexecutar verificações** imediatamente antes de qualquer push futuro.

---

## 8. Evidências de Verificação (Comandos Reproduzíveis)

```bash
# Verificar commit publicado
git ls-remote origin refs/heads/main
# 827e54ad8c8dfc52a8af83b77acb9d4be2d486f5

# Verificar arquivos publicados
git ls-tree -r main --name-only

# Verificar ausência de segredos
cd backend && mvn -B clean verify -DskipTests  # SecretsScanTest falha se houver segredos

# Verificar exclusões
git check-ignore backend/target/ backend/*.log _staging/ _quarantine/ _audit/ .env
```

---

*O scanner automatizado (`SecretsScanTest`) cobre o código Java no build; ele **não** substitui esta auditoria de escopo completo.*