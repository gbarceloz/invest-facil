# GATE 4 — RELATÓRIO DE PRODUÇÃO AUDIOVISUAL

**Data:** 21/11/2026
**Status:** produção interna dos 10 vídeos; **nenhuma publicação e nenhuma aprovação humana**.
**Voz:** Thalita (`pt-BR-ThalitaMultilingualNeural`) — áudio classificado como **preview interno**.
**Licença Remotion:** Free License, com base na declaração de uso individual do usuário; sem validação jurídica independente.
**Licenças comerciais:** edge-tts pendente; Remotion não verificada juridicamente.

---

## 1. Escopo entregue

- 10 MP4 Remotion, 1080×1920, 30 fps, H.264/AAC.
- 10 relatórios técnicos (`V01/render/TECHNICAL_REPORT.md` … `V10/render/TECHNICAL_REPORT.md`).
- 10 relatórios de QC (`V01/render/QC_REPORT.md` … `V10/render/QC_REPORT.md`).
- 10 estruturas de draft CapCut (VectCutAPI).
- 8 avaliações de agentes sobre os vídeos reais.
- Ranking final e 3 finalistas.
- Relatório de pendências (`reports/GATE4_PENDENCIAS.md`).
- MEMORY atualizado.

---

## 2. V01 — teste de padrão

**Arquivo:** `V01/render/V01-ticker-nao-para.mp4`

| Métrica | Resultado |
|---|---|
| Duração | 34,10 s |
| Resolução | 1080 × 1920 |
| FPS | 30 |
| Vídeo/áudio | H.264 / AAC 48 kHz estéreo |
| Loudness | -14,1 LUFS (pós-acabamento) |
| True peak | -1,4 dBTP (pós-acabamento) |
| Frame 0 | nota R$ 100 + “R$ 100” legíveis |
| Whisper `small` | transcrição integral inteligível |
| QC | PASS pós-correção e pós-acabamento |

**Correções aplicadas no teste:** frame 0 com nota e “R$ 100”; `CutScene` seco no lugar de crossfade; scrim no ticker; palavra ativa de V02/V04 corrigida; ícones distintos; TP ajustado para -1,8 no `loudnorm`.

**Correção pós-QC (21/11):** o ticker de V01 usava ciclo de 1400 px para 16 cartões com span de 1888 px, gerando sobreposição em 5,6–8,2 s. Foi refeito com 20 cartões, espaçamento de 118 px e ciclo de 2360 px. Re-render, loudnorm e re-auditoria: **PASS**, técnica 9, risco 8. Detalhes em `reports/GATE4_CORRECTIONS.md`.

**V01 validou:** pipeline de TTS por linha, medição real, timeline, render, mix, loudness, contato e QC.

---

## 3. V02–V10 — produção

| ID | Arquivo | Duração | Loudness | True peak | QC |
|---|---|---:|---:|---:|---|
| V01 | `V01-ticker-nao-para.mp4` | 34,10 s | -14,1 LUFS | -1,4 dBTP | PASS (corrigido + acabado) |
| V02 | `V02-cafe-de-sempre.mp4` | 41,80 s | -14,0 LUFS | -1,4 dBTP | PASS condicional |
| V03 | `V03-maquina-de-encolher.mp4` | 33,30 s | -14,1 LUFS | -1,1 dBTP | PASS condicional |
| V04 | `V04-100-em-30-segundos.mp4` | 30,10 s | -14,1 LUFS | -1,4 dBTP | PASS condicional |
| V05 | `V05-nota-sobre-a-mesa.mp4` | 35,00 s | -14,1 LUFS | -1,4 dBTP | PASS condicional |
| V06 | `V06-nao-e-impressao.mp4` | 40,10 s | -14,0 LUFS | -1,5 dBTP | PASS condicional |
| V07 | `V07-linha-do-bolso.mp4` | 40,20 s | -14,1 LUFS | -1,6 dBTP | PASS condicional |
| V08 | `V08-papo-de-mercado.mp4` | 41,30 s | -14,0 LUFS | -1,3 dBTP | PASS condicional |
| V09 | `V09-imposto-invisivel.mp4` | 39,10 s | -14,0 LUFS | -1,3 dBTP | PASS condicional |
| V10 | `V10-espelho-do-dinheiro.mp4` | 40,20 s | -14,0 LUFS | -1,5 dBTP | PASS condicional |

**Diferenciação preservada:** V02 café/ritual; V03 máquina; V04 resposta cronometrada; V05 minimalismo; V06 salário/preços; V07 gráfico; V08 chat; V09 recibo/manifesto; V10 espelho. O motor compartilhado muda o motivo visual, o ritmo e a trilha por variante.

---

## 4. Validação técnica

Cada MP4 passa por:

- ffprobe: 1080×1920, 30 fps, H.264/AAC, duração, áudio.
- ebur128: loudness integrado e true peak.
- frame 0: inspeção visual.
- contact sheet: 17 amostras a cada 2 s.
- Whisper `small`: proxy de inteligibilidade; **não é escuta humana**.
- Reprodução integral: pendente de revisão humana.
- Safe zone: margem de design; teste com overlay real pendente.

**0 falhas de ffprobe/loudness não significam aprovação perceptual.** A escuta humana continua pendente.

---

## 5. CapCut

- **10 estruturas de draft criadas** no VectCutAPI (`capcut-draft-summary.json` por variante).
- **10/10 validadas estruturalmente**: 1 vídeo, 1 áudio, 2 segmentos, caminhos existentes; 0 falhas (`reports/CAPCUT_DRAFTS_VALIDATION.json`).
- **V01 atualizado:** o asset de vídeo e o WAV do draft foram substituídos pelo render corrigido; hash confere com `v01-final.mp4`. A duração do scaffold foi corrigida de 60 s para **34,1 s** e o material de vídeo foi ajustado para **1080×1920**.
- Deploy à pasta do CapCut e export dos 3 finalistas dependem de fechamento do app e ação manual; não foram executados.
- High Impact 01 preservado.

---

## 6. Avaliações dos agentes

Os 8 agentes avaliaram os 10 MP4 reais, contact sheets, frame 0, QC, loudness e transcrições. Nenhum ouviu o áudio em escuta humana; nenhum assistiu em reprodução integral.

| Agente | Top 3 | Mais fraco | Achado principal |
|---|---|---|---|
| Creative Director | V09 (8,3), V03 (8,0), V06 (7,4) | V07 (5,9) | Conceitos distintos; V09 tem o frame 0 mais forte, V03 a melhor metáfora. |
| Video Editor | V04, V01, V08 | V07 | V07 fica 18,7 s na mesma composição; V05 tem o pior ritmo. |
| Motion Designer | V01 (23/30), V04 (23/30), V10 (19/30) | V07 (13/30) | Holds de 8–10 s, labels pequenos e split de V06 em 9:16. |
| Sound Designer | V02 (8,33), V05 (8,33), V08 (8,00) | V04 (6,00) | Loudness/TP corretos nos 10; mix de V04 é o mais frágil; sem escuta humana. |
| Storyteller | V02 (27,0), V08 (27,0), V05 (25,5) | V03 (20,5) | V03 tem falhas de fala (“continua sem”, “compra? Sim”); V09 tem recibo ambíguo. |
| Traffic Strategist | V08 (7,8), V03 (7,5), V04 (7,5) | V10 (5,0) | 9/10 entregam a tese no frame 0; série se canibaliza no mesmo fecho de R$ 61. |
| Retention Specialist | V01 (15,5), V02 (12,5), V04 (12,5) | V05 (10,0) | Média 11,8/20, abaixo do plano; 8/10 têm holds ≥6 s. |
| Quality Control | V01, V03, V04, V05, V06, V08, V10 PASS | V09 FAIL editorial | V01 teve veto visual por ticker; corrigido e re-auditado PASS. |

**Falsos positivos refutados com frame:** o “8/10” de V01 é um contador que chega a 6/10; “INFLACÃO” é a grafia correta **INFLAÇÃO** com cedilha. Ver `reports/GATE4_CORRECTIONS.md`.

---

## 7. Ranking final

| Rank | ID | Título | Hook | Retenção /20 | Edição | Motion | Som | Clareza | Distribuição | Marca | Técnica | Total /100 | QC |
|---:|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---|
| 1 | V01 | O ticker não para | 7,7 | 15,5 | 8,0 | 7,7 | 7,3 | 8,3 | 6,8 | 8,5 | 9,0 | **77,9** | PASS corrigido |
| 2 | V08 | Papo de mercado | 7,5 | 11,5 | 7,8 | 6,0 | 8,0 | 9,0 | 7,8 | 7,2 | 9,0 | **73,3** | PASS |
| 3 | V04 | R$ 100 em 30 segundos | 7,2 | 12,5 | 8,0 | 7,7 | 6,0 | 7,7 | 7,5 | 8,0 | 9,0 | **72,6** | PASS |
| 4 | V06 | Não é impressão | 8,5 | 12,0 | 6,8 | 5,3 | 7,3 | 8,3 | 7,3 | 8,2 | 9,0 | **71,8** | PASS |
| 5 | V02 | O café de sempre | 7,8 | 12,5 | 6,5 | 6,0 | 8,3 | 9,0 | 6,0 | 8,0 | 8,0 | **71,3** | PASS com ressalva |
| 6 | V03 | A máquina de encolher dinheiro | 8,0 | 11,5 | 7,0 | 6,0 | 7,3 | 6,8 | 7,5 | 8,5 | 9,0 | **70,4** | PASS |
| 7 | V10 | O espelho do dinheiro | 6,8 | 12,0 | 7,0 | 6,3 | 8,0 | 8,0 | 5,0 | 8,5 | 9,0 | **68,8** | PASS |
| 8 | V09 | O imposto invisível | 8,7 | 10,0 | 6,8 | 5,7 | 7,3 | 7,0 | 6,0 | 7,8 | 8,0 | **67,0** | PASS técnico / FAIL editorial |
| 9 | V05 | Uma nota sobre a mesa | 6,5 | 10,0 | 6,0 | 5,7 | 8,3 | 8,5 | 5,3 | 9,0 | 9,0 | **65,5** | PASS |
| 10 | V07 | A linha que explica seu bolso | 6,2 | 10,5 | 6,0 | 4,3 | 7,0 | 8,3 | 6,3 | 8,0 | 8,0 | **62,7** | PASS com ressalva |

Arquivo completo: `evaluation/GATE4_FINAL_RANKING.md`. Método: pesos do `evaluation/GATE4_SCORING_TEMPLATE.md`; notas dos 8 agentes; nenhuma métrica de audiência.

---

## 8. Três finalistas

### 1º — V01 · O ticker não para · 77,9/100

**Por que está aqui:** melhor retenção potencial (15,5/20), melhor ritmo (8,0) e o frame 0 mais direto do lote. O ticker foi corrigido e re-auditado PASS. É o vídeo que melhor transforma a tese em movimento.

**Antes de publicar:** escuta humana, subir o disclaimer (~130 px do rodapé) e revisar “PRÓXIMO VÍDEO: A INFLAÇÃO” num vídeo que já é sobre inflação.

### 2º — V08 · Papo de mercado · 73,3/100

**Por que está aqui:** melhor potencial de distribuição (7,8), melhor clareza (9,0) e o loop nativo mais forte (chat + “manda pra ele”). É o mais adequado a TikTok/Reels sem depender de explicação prévia.

**Antes de publicar:** quebrar o chat estático dos primeiros 4 s; confirmar a fala e as pausas em escuta humana.

### 3º — V04 · R$ 100 em 30 segundos · 72,6/100

**Por que está aqui:** o mais limpo tecnicamente, o mais curto (30,1 s) e o payoff mais cedo (56,5%). Edição e motion estão entre os melhores. É a aposta de menor risco de execução.

**Antes de publicar:** o mix de voz é o mais fraco (6,0); o timer “30” é decorativo; revisar “preços” e a entonação final.

### Por que V06 e V02 ficaram fora

V06 (71,8) tem o melhor hook verbal, mas o split “SALÁRIO x PREÇOS” fica ~8 s imóvel em 9:16. V02 (71,3) tem o melhor arco, mas o cartão “O MESMO PEDIDO” fica ~5,2 s parado no bloco mais importante. Ambos são finalistas naturais para uma segunda rodada de re-cut, não para o pódio desta rodada.

**O vencedor não foi escolhido.** A decisão é do usuário entre V01, V08 e V04.

**Arquivos dos finalistas:**

- `V01/render/V01-ticker-nao-para.mp4` (34,10 s)
- `V08/render/V08-papo-de-mercado.mp4` (41,30 s)
- `V04/render/V04-100-em-30-segundos.mp4` (30,10 s)

---

## 8.1 Acabamento final do vencedor — V01

O usuário escolheu V01 como vencedor. O acabamento preservou conceito, ticker, hook, estrutura, Thalita e o hold de R$ 61,39. Foram aplicados: topo 156 px, disclaimer 320 px, tipografia secundária ampliada, ticker com 24 itens únicos e máscara, contador 5→4→3, CTA antecipado e com novo texto, pulso em 61,39, música mais baixa e SFX sincronizados.

**Final:** 34,10 s, -14,1 LUFS, -1,4 dBTP, SHA-256 `0C7FC6EE1D242E56…`.
**Comparação:** `V01/render/POLISH_COMPARISON.md`.
**Relatório:** `reports/V01_FINAL_POLISH.md`.
**Draft CapCut:** preparado e validado; **não deployado/exportado**.

**Publicação:** não autorizada. A escolha do usuário não é aprovação de publicação.

---

## 9. Pendências

Ver `reports/GATE4_PENDENCIAS.md`.

Resumo: licença edge-tts, validação jurídica Remotion, escuta humana, aprovação humana, deploy/export CapCut, safe zone real e métricas.

---

## 10. Declarações

- Nenhum upload, publicação, monetização, push, merge ou deploy.
- Nenhuma compra de crédito ou contrato de serviço.
- Nenhuma alteração no Pokémon TCG ou no Blender Pokémon.
- Nenhuma aprovação humana declarada.
- Nenhum direito comercial declarado como resolvido.
- O vencedor final será escolhido pelo usuário entre os 3 finalistas.
