# Piloto 01 — Volatilidade não é risco

**Status:** draft validado no CapCut; abertura visual da timeline parcialmente
verificada; exportação final e upload pendentes.

## Arquivos

| Arquivo | Descrição |
|---|---|
| `roteiro.md` | roteiro, fontes e aviso |
| `storyboard.md` | cenas, assets e safe zones |
| `legendas.srt` | legendas base (revisar sincronia após narração final) |
| `metadata.json` | metadados de publicação |
| `assets/slide-01.png` | cena 1 (1080×1920) |
| `assets/slide-02.png` | cena 2 |
| `assets/slide-03.png` | cena 3 |
| `assets/narracao.wav` | narração TTS local (32,55 s) |
| `scripts/generate-pilot-assets.ps1` | gera slides e narração de forma reproduzível |

## Draft no CapCut

- Nome: `investfacil_piloto`
- Canvas: 1080×1920 (9:16)
- Duração: 33 s
- Timeline: 3 imagens de 11 s + faixa de narração
- Validação do MCP: `ok: true` (sem issues/warnings)
- Backup: `draft_content.json.mcpbak` + backup geral em `_audit`
- Reconhecimento: `root_meta_info.json` do CapCut inclui o draft; ele aparece em
  **Projetos** na tela inicial.
- **Limitação registrada:** a abertura visual da timeline não foi confirmada de
  forma inequívoca; a captura foi prejudicada por modal/foco de janela. O draft
  não foi declarado “pronto para exportar” sem essa verificação.

## Como reproduzir

```powershell
cd C:\Users\gabri\InvestFacil
powershell -ExecutionPolicy Bypass -File scripts\generate-pilot-assets.ps1
# Fechar o CapCut e rodar o MCP/core (ver docs/CAPCUT_MCP_SETUP.md)
```

## Próximos passos

1. Abrir `investfacil_piloto` no CapCut em primeiro plano e conferir a timeline.
2. Substituir o TTS por voz humana revisada.
3. Revisar SRT e queimar legendas.
4. Exportar MP4 ≤ 50 MB e revisar no celular.
5. Subir via `POST /api/v1/admin/videos/{lessonId}` e validar no frontend.
