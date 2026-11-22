# SIZE GUARD — DOCUMENTAÇÃO

**Data:** 21/11/2026
**Arquivo:** `scripts/check-large-files.ps1`
**Hook opcional:** `.githooks/pre-commit`
**Allowlist:** `scripts/large-file-allowlist.txt`

---

## 1. O que faz

- Lê **staged additions** (`git diff --cached --diff-filter=A`).
- Bloqueia arquivo novo acima de **5 MiB** (padrão), salvo exceção explícita.
- Avisa, mas permite, modificação de arquivo já tracked acima do limite.
- Não remove, move ou altera arquivos.
- Não instala nada.

## 2. Execução

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/check-large-files.ps1
```

Com threshold diferente:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/check-large-files.ps1 -ThresholdMB 10
```

Com exceção explícita:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/check-large-files.ps1 -Allow "content/source/master.wav"
```

Allowlist persistente:

```text
scripts/large-file-allowlist.txt
```

Uma linha por path relativo ao repo; `#` inicia comentário.

## 3. Hook opcional

Instalar:

```powershell
git config core.hooksPath .githooks
```

Remover:

```powershell
git config --unset core.hooksPath
```

O hook chama o guard. **Não foi instalado automaticamente.**

## 4. Testes executados

Fixtures isoladas em `%TEMP%\p01-guard-test-*`, removidas ao final.

| Caso | Resultado |
|---|---|
| Arquivo pequeno (texto) | **PASS** — permitido |
| Arquivo grande não-mídia 6 MiB | **PASS** — bloqueado (exit 1) |
| Arquivo grande com `-Allow` | **PASS** — permitido |
| Arquivo grande já tracked, modificado | **PASS** — warning, permitido |
| Arquivo de mídia 6 MiB | **PASS** — bloqueado |
| Arquivo pequeno não-mídia | **PASS** — permitido |
| Hook shell syntax (`sh -n`) | **PASS** |
| Execução do hook via Git sh | **PASS** — `OK: no newly staged file above 5 MiB` |

## 5. Exit codes

- `0` — nenhum bloqueio.
- `1` — arquivo novo acima do threshold sem exceção.
- erro — fora de repositório Git ou falha ao ler o índice.

## 6. Limitações

- Só examina staged; não impede arquivo grande fora do Git.
- Não substitui `.gitignore`.
- Não bloqueia arquivo já tracked (por design).
- Depende de PowerShell no Windows; CI Linux precisaria de adaptação.
- Em Unix, o hook precisa de `chmod +x .githooks/pre-commit`.
- O hook só roda se `core.hooksPath` estiver configurado.
