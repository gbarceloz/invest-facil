# Conteúdo educativo — Invest Fácil

Este diretório é a fonte de verdade dos roteiros, storyboards, assets e metadados
de vídeo. O conteúdo publicado no produto continua sendo o JSON de seed do backend
(`backend/src/main/resources/seed/content.json`), gerado por
`scripts/generate-seed.mjs`.

## Estrutura

```
content/
├── brand/video-brand.json        # tokens de identidade para vídeo
├── templates/                    # roteiro, storyboard, SRT, metadata, checklist
├── pilots/01-volatilidade/       # piloto 01 — draft validado
└── pilots/02-diversificacao/     # piloto 02 — draft validado e conferido no CapCut
```

## Regra editorial

- Nenhuma promessa de rentabilidade.
- Nenhuma recomendação individual de compra/venda.
- Risco e possibilidade de perda explícitos.
- Fonte registrada para toda afirmação factual.
- Aviso educativo em todo vídeo que cite mercado/simulação.

## Fluxo

Ver [`docs/CONTENT_PIPELINE.md`](../docs/CONTENT_PIPELINE.md) e
[`docs/CAPCUT_MCP_SETUP.md`](../docs/CAPCUT_MCP_SETUP.md).

## Publicação

1. Exportar MP4 9:16, ≤ 3 min, ≤ 50 MB.
2. Revisar checklist em `templates/checklist-revisao.md`.
3. Autenticar como ADMIN e enviar via `POST /api/v1/admin/videos/{lessonId}`.
4. Validar a reprodução no frontend e atualizar o metadata da aula.
