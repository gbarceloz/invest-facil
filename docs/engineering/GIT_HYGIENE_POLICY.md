# GIT HYGIENE POLICY — INVEST FÁCIL

**Data:** 21/11/2026
**Objetivo:** impedir commits acidentais de mídia, artefatos e arquivos grandes sem alterar o histórico.

---

## 1. Baseline desta missão

```text
Raiz: <repo>
Branch: feat/mvp-completo
Staged: 0 arquivos
Working tree: 55 entradas (31 modificadas, 24 não rastreadas)
Tracked >1 MB: content/pilots/01-volatilidade/assets/narracao.wav (1,37 MB)
LFS: instalado (3.5.1), não configurado, não usado
.gitattributes: ausente
core.hooksPath: vazio
```

## 2. Regras

1. Nunca usar `git add .` ou `git add -A` no repositório inteiro.
2. Adicionar caminhos explícitos: `git add -- <path>`.
3. Antes de adicionar mídia, rodar `git check-ignore -v --no-index <path>`.
4. Antes de commitar, revisar:
   ```powershell
   git status --short
   git diff --cached --stat
   git diff --cached --name-status
   ```
5. Não usar `git add -f` para mídia; se realmente necessário, documentar e usar o allowlist do guard.
6. Não commitar `video/out`, `video/node_modules`, renders, WAVs de narração, música, SFX, frames, caches ou logs.
7. Preservar arquivos tracked existentes; não executar `git rm --cached` em massa.
8. Não reescrever histórico, não fazer rebase/force push, não migrar LFS nesta fase.
9. Não commitar/push/merge sem autorização do proprietário.

## 3. Fluxo seguro

```powershell
git status --short
git check-ignore -v --no-index "caminho/do/asset"
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/check-large-files.ps1
git add -- caminho/arquivo-menor
git diff --cached --stat
```

Para mídia legítima que precise ser versionada, decidir antes entre:

- manter no filesystem local;
- LFS (fase futura, com custo/remote);
- armazenamento externo (Supabase Storage, S3 etc.);
- exceção explícita no size guard.

## 4. Hook opcional

Instalar:

```powershell
git config core.hooksPath .githooks
```

Executar manualmente:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/check-large-files.ps1
```

Remover:

```powershell
git config --unset core.hooksPath
```

O hook não é instalado automaticamente nesta missão.

## 5. Rollback

- Reverter `.gitignore`: `git restore -- .gitignore`.
- Remover hook local: `git config --unset core.hooksPath`.
- Remover guard/allowlist: apagar os arquivos criados **somente após revisão**.
- Nenhum arquivo de mídia foi movido ou removido.

## 6. Limitações

- `.gitignore` não remove arquivos já tracked.
- O guard só vê staged additions.
- O hook depende de PowerShell e de configuração local.
- A política não substitui revisão do diff.
