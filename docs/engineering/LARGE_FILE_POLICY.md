# LARGE FILE POLICY — INVEST FÁCIL

**Data:** 21/11/2026

---

## 1. Limite

- **Threshold operacional:** 5 MiB por arquivo novo staged.
- **Motivo:** os maiores source assets legítimos atuais estão abaixo disso; renders e músicas estão acima.
- **Exceções:** `scripts/large-file-allowlist.txt` ou `-Allow` no guard.
- **Arquivos já tracked:** não são bloqueados por modificação; recebem warning.

## 2. Estado atual

| Item | Tamanho | Decisão |
|---|---:|---|
| `content/pilots/01-volatilidade/assets/narracao.wav` | 1,37 MB | tracked; preservar |
| `content/pilots/02-diversificacao/assets/narracao.wav` | 2,15 MB | source; abaixo do limite |
| `video/public/.../music.wav` | 8,42 MB | generated; ignorar |
| `video/projects/.../V01-ticker-nao-para.mp4` | 6,85 MB | generated; ignorar |
| `video/projects/.../capcut-export...mp4` | 43,6 MB | generated; ignorar |
| `video/auditions/piper-voices/*.onnx` | 60,29 MB | já ignorado |

**Total não ignorado antes da correção:** ~0,81 GB (24 MP4, 430 WAV fora de `video/out`).

## 3. Git LFS

**Status:** `git-lfs 3.5.1` instalado, mas **não configurado, não inicializado e não usado**. Nenhum histórico foi migrado.

### Quando faria sentido

- masters de source que precisam ser versionados e são binários >5 MiB;
- arquivos que mudam pouco e precisam de histórico;
- equipe/remote com suporte a LFS e quota definida.

### Vantagens

- evita blobs gigantes no histórico principal;
- mantém checkout seletivo;
- funciona com Git normal.

### Desvantagens/riscos

- exige remote compatível e quota (custo pode surpreender);
- clones podem falhar sem LFS instalado;
- não resolve assets gerados que podem ser reproduzidos;
- adiciona complexidade para agentes;
- migração de histórico é operação de risco.

### Decisão

**Não usar LFS nesta fase.** Para assets gerados, a política é ignorar e reproduzir. Para sources grandes futuros, avaliar LFS ou storage externo com decisão registrada.

## 4. Alternativas

| Estratégia | Uso |
|---|---|
| Ignorar + regenerar | renders, TTS, música, SFX, frames |
| Armazenamento externo | masters, bibliotecas grandes, assets de produção |
| LFS | source binário pequeno/médio que precisa de histórico |
| Git normal | texto, JSON, SRT, manifests, fontes pequenas |

## 5. Regras

1. Não forçar mídia gerada no Git.
2. Não migrar histórico sem autorização e backup.
3. Não instalar LFS automaticamente.
4. Não remover tracked sem estratégia.
5. Documentar toda exceção.
