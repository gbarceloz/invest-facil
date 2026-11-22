# INVEST FÁCIL — 10 VARIANTES CRIATIVAS

**Tema:** “Por que R$ 100 hoje não compram a mesma coisa amanhã?”
**Formato:** 1080 × 1920 · 30 fps · 30–42 s · H.264/AAC (previsto)
**Voz:** Thalita (`pt-BR-ThalitaMultilingualNeural`) — decisão do usuário
**Status:** Gate 4 concluído; **10 MP4 finais + 1 pré-polish**; V01 vencedor; **publicação não autorizada**.

## O que existe

- 10 conceitos, 10 roteiros, 10 storyboards, 10 motion designs, 10 editing timelines, 10 sound designs, 10 retention maps e 10 quality checklists.
- 80 documentos nas pastas `V01`–`V10`.
- 10 MP4 finais em `V*/render/`, 10 QC, 10 relatórios técnicos, 10 avaliações e 8 relatórios de agentes.
- 10 drafts/estruturas no VectCutAPI; 1 MP4 pré-polish de V01.
- Matriz de conceitos, changelog, relatório do Gate 3, ranking final e 8 relatórios de agentes.
- **415 verificações documentais e de timeline, 0 falhas** — isso não é teste de vídeo.

O estado de produção, QC e pendências está em
`reports/GATE4_PRODUCTION_INDEX.md` e `reports/GATE4_PENDENCIAS.md`. A aprovação humana,
licenças e publicação continuam pendentes.

## Durações finais

| ID | Título | Duração |
|---|---|---:|
| V01 | O ticker não para | 34,10 s |
| V02 | O café de sempre | 41,80 s |
| V03 | A máquina de encolher dinheiro | 33,30 s |
| V04 | R$ 100 em 30 segundos | 30,10 s |
| V05 | Uma nota sobre a mesa | 35,00 s |
| V06 | Não é impressão | 40,10 s |
| V07 | A linha que explica seu bolso | 40,20 s |
| V08 | Papo de mercado | 41,30 s |
| V09 | O imposto invisível | 39,10 s |
| V10 | O espelho do dinheiro | 40,20 s |

## Finalistas

**Gate 3 (histórico):** V01 · V08 · V06; suplente V02.
**Gate 4 (final):** V01 · V08 · V04; **V01 vencedor escolhido pelo usuário**.

O ranking não é aprovação de publicação. A seleção final depende de escuta humana,
licenças e autorização explícita.

## Estrutura

```text
investfacil-10-creative-variants/
├─ V01/ … V10/          # 8 documentos + render (MP4, QC, técnico)
├─ assets/              # áudio/música/SFX compartilhados
├─ scripts/             # geração, auditoria, áudio, ranking e finalização
├─ storyboards/         # imagens de storyboard
├─ reports/
│  ├─ agents/           # 8 relatórios independentes
│  ├─ CREATIVE_CONCEPTS_MATRIX.md
│  ├─ GATE3_CREATIVE_REPORT.md
│  ├─ GATE3_V2_CHANGELOG.md
│  ├─ GATE4_PRODUCTION_INDEX.md
│  ├─ GATE4_PRODUCTION_REPORT.md
│  ├─ GATE4_PENDENCIAS.md
│  └─ GATE4_DELIVERABLES.md
└─ evaluation/
   ├─ SCORING_TEMPLATE.md
   ├─ PRELIMINARY_RANKING.md
   ├─ GATE4_FINAL_RANKING.md
   └─ AGENT_SCORES.json
```

## Scripts canônicos

- `scripts/generate_gate3_v2.py` — gera os 80 documentos e a matriz.
- `scripts/audit_gate3_docs.py` — 271 checagens documentais.
- `scripts/audit_timelines.py` — 144 checagens de timeline.
- `scripts/compute_ranking.py` — pré-ranking ponderado a partir de `evaluation/AGENT_SCORES.json`.
- `scripts/summarize_gate3.py` — resumo de duração/densidade/cortes.

## Regras

- Thalita é a única voz; não acelerar a locução para caber.
- Timing por caracteres/s (14,0 de referência), não por slot.
- Pausas padrão de 120–140 ms; 200–300 ms só intencionais.
- Cortes frequentes, mas com motivo narrativo; storyboard de cena ≠ EDL.
- Sound design sincronizado; voz > música > SFX > ambiência.
- Safe zones; sem SRT sobre tipografia cinética.
- Simulações identificadas na fala ou na tela.
- Sem promessa de retorno; sem upload/push/deploy/publicação.
- Sem custos não autorizados.
- Nenhuma aprovação humana automática.
- Licenças Remotion e edge-tts pendentes.

## Documentos de referência

- `../../MEMORY.md`
- `../../../docs/GATE1_AUDIT.md`
- `../../../docs/GATE2_VALIDATION.md`
- `../../../docs/AUDIOVISUAL_PIPELINE_VALIDATION.md`
- `evaluation/SCORING_TEMPLATE.md`
- `reports/GATE3_CREATIVE_REPORT.md`
- `evaluation/PRELIMINARY_RANKING.md`
