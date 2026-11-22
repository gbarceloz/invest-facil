# GATE 3 — AVALIAÇÃO PRELIMINAR DO QUALITY CONTROL (RODADA 2)

**Data:** 21/11/2026 · **Projeto:** `investfacil-10-creative-variants`
**Escopo:** auditoria documental e de viabilidade. **Nenhum vídeo foi produzido, renderizado ou editado.**
**Evidência:** `reports/GATE3_V2_CHANGELOG.md`; `scripts/audit_gate3_docs.py` reexecutado de forma independente em Node, porque Python não está no PATH (`gate3-audit-v2.out.txt`); leitura dos 10 `SCRIPT.md` e dos 10 `STORYBOARD.md`; modelo de densidade (`gate3_density_v2.js`, `gate3-density-v2.json`); `video/MEMORY.md`; `docs/GATE1_AUDIT.md`; relatório técnico do High Impact 01.
**Limite:** sem MP4, sem TTS, sem draft CapCut, sem contact sheet, sem loudness. Técnica = **NOT TESTED** em todas as variantes.

## 1. Tabela por vídeo

| ID | Técnica (0–10) | Marca (0–10) | Risco (0–10; 10 = baixo) | Viabilidade (0–10) | Editorial |
|---|---:|---:|---:|---:|---|
| V01 | 0* | 9 | 6 | 8 | PASS |
| V02 | 0* | 9 | 4 | 4 | FAIL |
| V03 | 0* | 6 | 4 | 5 | FAIL |
| V04 | 0* | 7 | 3 | 8 | FAIL |
| V05 | 0* | 9 | 7 | 9 | PASS |
| V06 | 0* | 8 | 7 | 8 | PASS |
| V07 | 0* | 8 | 3 | 7 | FAIL |
| V08 | 0* | 7 | 5 | 8 | FAIL |
| V09 | 0* | 6 | 5 | 5 | FAIL |
| V10 | 0* | 8 | 5 | 4 | FAIL |

`*` Técnica 0 = **sem evidência** (NOT TESTED), não reprovação medida. Marca mede aderência ao sistema preto/amarelo/Plus Jakarta, logo, disclaimer e tom; risco mede exposição editorial/compliance; viabilidade mede o custo real em Remotion com os assets disponíveis (`assets/` vazio).

## 2. Veredito por vídeo

- **V01 — técnica NOT TESTED; editorial PASS.** 33 s/432 caracteres; simulação falada e rotulada; payoff e CTA na ordem certa. Ressalvas: S06 do storyboard desce a barra de 100% a 61% em 14,6–18,4 s, mas o selo só entra em 18,4 s (a fala “Simulação” começa em 17,5 s); as cenas derivam até 1,4 s do roteiro. Corrigir no EDL, não no conceito.
- **V02 — técnica NOT TESTED; editorial FAIL.** O storyboard S01 abre com “TODO DIA, O MESMO CAFÉ”, mas o roteiro abre com “ATÉ O DIA EM QUE O DINHEIRO NÃO DEU”: o cold open não chegou ao storyboard. S10 mostra “SALVE” desde 33,6 s, mas o CTA falado começa em 37,6 s. S06 diz que “a nota parece menor”, o que contradiz a tese de que a nota não encolhe. 42 s com margem negativa de 0,17 s no modelo do changelog.
- **V03 — técnica NOT TESTED; editorial FAIL.** O roteiro (26,2–28,3) ainda diz “Cesta 4/5”; o storyboard S09 diz “3 de 5”. 3/5 é o número coerente com 61%; o roteiro é o documento errado. 33 s com margem negativa de 0,36 s no modelo do changelog. A metáfora da máquina continua com risco de leitura de “lavagem de dinheiro”; manter o gate editorial.
- **V04 — técnica NOT TESTED; editorial FAIL.** O changelog afirma “CTA único”, mas o roteiro tem “Comente” (23,8–26,7) e “Siga para mais” (26,8–27,9). O storyboard S10 exibe “COMENTE / SIGA” desde 21,0 s — 2,8 s antes do CTA e antes do payoff terminar. S04 perde o selo “SIMULAÇÃO” do bloco +25%. S05 mostra R$ 61 em 7,0 s, mas a fala começa em 10,1 s. O timing de 30 s é o único com folga real (1,6 s).
- **V05 — técnica NOT TESTED; editorial PASS.** 36 s, 466 caracteres, CTA de salvar, artefato “uma cadeira” removido, hook em pergunta. “Promessa de compra” deve virar “capacidade de compra” para não sugerir garantia. S06 (16,2–20,7) segue marcado “Silêncio” por 4,5 s; declarar que é silêncio de música/SFX, não de voz.
- **V06 — técnica NOT TESTED; editorial PASS.** Lógica salarial corrigida (“Os preços sobem mais”), direção de voz específica, simulação rotulada no roteiro. S07 do storyboard (18,5–23,4) antecipa R$ 61 em 3,8 s e termina 5,5 s antes da fala (22,3–28,9); S10 antecipa “SALVE” em 1,0 s. O payoff “fenômeno econômico” é mais fraco que “É inflação”; considerar restaurar.
- **V07 — técnica NOT TESTED; editorial FAIL.** O defeito da rodada 1 persiste no **storyboard**: S03 “5% AO ANO”, S04 “R$ 78” e S05 “R$ 61” sem “SIMULAÇÃO”. O roteiro foi corrigido; o plano visual não. A auditoria de 217 checagens só testa o selo no SCRIPT, por isso passa. 533 caracteres em 40 s = 13,3 c/s; margem de 0,14 s no modelo. É a variante mais apertada.
- **V08 — técnica NOT TESTED; editorial FAIL.** O storyboard S03 mostra “4 DE 5” sem “SIMULAÇÃO · PREÇOS +25%”; o selo existe só no roteiro. O caso +25% → 4/5 só fecha com 5 itens de preço igual; a cesta compartilhada do H.I.01 tem preços desiguais. Declarar “5 itens de preço igual” ou “até 4 de 5”. S09 antecipa “MANDA” em 1,8 s.
- **V09 — técnica NOT TESTED; editorial FAIL.** “Existe um imposto que ninguém votou” ocupa 0–2,6 s e a correção “Não é imposto literal” só entra em 4,7 s; o storyboard nem inclui a correção. São 4,7 s (13% do vídeo) afirmando uma equivalência falsa na janela de maior audiência. O CTA do documento (“Siga o Invest Fácil...”) não é falado: a fala 32,3–36,1 é a assinatura de marca, e o storyboard S09 não mostra “SIGA”.
- **V10 — técnica NOT TESTED; editorial FAIL.** Roteiro e storyboard dizem “Cesta 4/5”, mas a simulação é 61% (3/5). São dois cenários diferentes no mesmo vídeo, sem rótulo. Trocar para 3/5 ou rotular um exemplo +25% separado. S10 mostra “SALVE” desde 32,9 s, mas o CTA falado começa em 36,1 s. Espelho/morph é a maior complexidade de produção da série.

## 3. Must-fixes resolvidos na rodada 2 (verificados)

- Densidade: todas as variantes entre 30 e 42 s; V04 agora tem 30 s reais e 372 caracteres (12,4 c/s), sem o estouro de 36 s da rodada 1.
- V01: texto reduzido, simulação dita (“Simulação: 5% ao ano”), CTA sem promessa de antecipação.
- V02: cold open com a quebra, orçamento semanal explícito, contradição “não foi o café” removida do roteiro, CTA de 3,7 s.
- V03: a nota não encolhe; o que encolhe é a cesta; hook corrigido; 3/5 no storyboard.
- V04: payoff duplicado removido; 30 s reais.
- V05: hook em pergunta; CTA “Conheça a plataforma” substituído; artefato removido; 36 s.
- V06: lógica salário vs. preços corrigida; direção de voz específica.
- V07: selo “SIMULAÇÃO” no roteiro para 5%, 78 e 61; “números verificáveis” → “simulação transparente”.
- V08: +25% e 5% rotulados no roteiro; “Guardar é importante...” evita a leitura “não guarde”.
- V09: qualificador “Não é imposto literal” e CTA sem link inexistente.
- V10: hook dividido em duas linhas; a nota não encolhe; o reflexo da cesta encolhe.
- Transversal: direção de voz por variante, mapa de cortes internos, disclaimer fixo, safe zone 120 px à direita/220 px no rodapé, tipografia mínima 34/44 px, no máximo 2 elementos concorrentes, sem texto no seam/reflexo, SFX ≤1 a cada 2 s, ducking −10 dB.
- Auditoria: reexecutei as 217 checagens; **217, 0 falhas** confirmadas (`gate3-audit-v2.out.txt`).

## 4. Must-fixes que continuam (prioridade)

**P0 — bloqueiam render:**
1. V02: trocar o frame 0 do storyboard para o cold open (“ATÉ O DIA EM QUE NÃO DEU”) e separar “SALVE” do payoff (33,6 → 37,6).
2. V03: corrigir o roteiro de “Cesta 4/5” para “3 de 5” e alinhar o selo.
3. V04: escolher **um** CTA; remover “Siga para mais” e o “SIGA” do S10; iniciar “COMENTE” em 23,8; repor “SIMULAÇÃO” no S04; mover R$ 61 para 10,1.
4. V07: repor “SIMULAÇÃO” em S03/S04/S05 e alinhar os números às falas (8,1/13,1/17,7).
5. V08: repor “SIMULAÇÃO · PREÇOS +25%” no S03; declarar a hipótese de 5 itens de preço igual.
6. V09: colocar “não é imposto literal” na tela desde 0 s ou trocar o hook; incluir “SIGA” no S09 e alinhar o CTA à fala.
7. V10: trocar “4/5” por “3/5” (ou rotular +25%) e mover “SALVE” para 36,1.
8. V01: alinhar S06/S07 (barra não pode mostrar 61% antes do selo) e corrigir a deriva de 1,4 s.
9. V06: mover S07 para 22,3–28,9 (hoje 18,5–23,4) e “SALVE” para 32,2.

**P1 — bloqueiam o gate de qualidade, não o planejamento:**
10. Regenerar os tempos de cena de todos os storyboards a partir da tabela do roteiro (deriva atual: V06 5,5 s; V04 3,1 s; V07 2,6 s; V01 1,4 s).
11. Densidade: com os próprios números do changelog, V01 (33,07 s), V02 (42,17 s) e V03 (33,36 s) **estouram** o orçamento ao somar pausas e cauda; V07 fica com 0,14 s; V06/V09/V10 com <0,5 s. Estender V01/V03 para 34 s, V02 para 43 s, V07 para 41–42 s; ou cortar 3–5% do texto. Declarar se os 14,0 c/s incluem pausas.
12. Ampliar `audit_gate3_docs.py`: checar selo de simulação no STORYBOARD, timing do texto de CTA, delta de tempo entre SCRIPT/STORYBOARD/EDITING e orçamento de pausa. Hoje ele não vê nenhum desses defeitos.
13. V05: “promessa de compra” → “capacidade de compra”; esclarecer o “silêncio” de S06; colocar “QUANTO AINDA COMPRA?” no frame 0.
14. Safe zone: 120 px à direita pode não cobrir o rail do TikTok na metade inferior (referência 160–180 px); falta safe zone de topo (≥220 px).

## 5. Riscos transversais

- **TTS real:** não gerado. O modelo de 14,0 c/s é orçamento de roteiro; o H.I.01 mede 13,49 c/s incluindo pausas, o que torna o modelo plausível, mas não prova estas 10 locuções. Números expandidos (“sessenta e um”, “cinco por cento”) podem acrescentar 10–15 caracteres por bloco.
- **Escuta humana:** não realizada. Pronúncia de “R$”, “5%”, “61” e naturalidade da Thalita não foram ouvidas.
- **Licença edge-tts:** pendente; não há liberação comercial. Não publicar em escala nem declarar voz aprovada.
- **Licença Remotion:** gratuita só até 3 pessoas; enquadramento não confirmado.
- **CapCut:** nenhum draft de V01–V10 existe; os drafts do H.I.01 estão `.locked`. Fechar o CapCut antes de qualquer save MCP.
- **Disclaimer:** está nos storyboards, mas nunca foi renderizado. Verificar 34 px, contraste, 220 px do rodapé e 120 px da direita no primeiro frame do end card.
- **Safe zone TikTok:** 78 px laterais é margem de design, não safe area de plataforma. O rail direito e a barra superior não foram testados com overlay real.
- **Densidade:** 9 de 10 variantes têm menos de 1,1 s de folga no modelo; qualquer pausa acima de 140 ms ou desvio de TTS estoura. O changelog afirma “nenhum bloco estoura”, mas isso só vale contra o modelo, não contra a locução real.
- **Auditoria:** as 217 checagens são string-matching documental. Não testam MP4, áudio, loudness, legibilidade, pixels de safe zone, sincronia, frames pretos nem retenção. **0 falhas ≠ vídeo aprovado.**

## 6. Declarações

- **Nenhum vídeo foi renderizado** nesta rodada; não há MP4, draft, contact sheet ou relatório de loudness.
- **Nenhuma aprovação humana** é declarada por este relatório.
- **Nenhuma licença de voz** (edge-tts) ou de Remotion é declarada aprovada.
- **Nenhum vídeo pode avançar para avaliação** antes dos P0 acima; os PASS editoriais ainda dependem de TTS, render e QC técnico.
- As 217 checagens documentais **não são teste de vídeo** e não substituem ffprobe, escuta humana ou inspeção frame a frame.

---

## Rodada 3 — verificação final

**Data:** 21/11/2026 · **Escopo:** spot-check de V02, V04, V06, V07 e V09, estendido aos storyboards de V06, V08 e V10; leitura dos dois audits (`audit_gate3_docs.py`, `audit_timelines.py`). **Nenhum vídeo produzido.**
**Auditoria:** 231 checagens documentais + 134 de timeline = 365. A conta fecha com a estrutura atual (104 linhas de narração → 94 gaps + 40 checagens de encaixe; 231 no audit documental). Não reexecutei o Python (indisponível); a contagem foi reconstruída e os itens novos passaram no spot-check. As 0 falhas são reportadas, não vídeo-testadas.

### 1. Resolvido / continua

**Resolvido:**
- V02: S01 “ATÉ O DIA EM QUE NÃO DEU” e S02 “O MESMO CAFÉ, TODO DIA”. O cold open chegou ao storyboard.
- V04: “Siga para mais” removido; CTA único de comentário; S04 com “SIMULAÇÃO · PREÇOS +25% · 4 DE 5”.
- V03 e V10: nenhum “4/5” ou “4 de 5” restante; “Cesta 3/5” no storyboard de V10.
- V06: o SCRIPT abre com “Seu salário subiu.” + “Então por que o mês continua apertado?”; 40 s.
- V07: S03/S04/S05 com “SIMULAÇÃO · 5% AO ANO / R$ 78 / R$ 61”.
- V09: S03 com “NÃO É IMPOSTO LITERAL · É INFLAÇÃO”; CTA falado em 32,3–37,6.
- Todos os 10 SCRIPT têm “## Entrada para TTS” (10/10 verificado).
- Durações: V05 37 s, V09 39 s, V10 40 s (verificado).

**Continua:**
- **V06 — o storyboard ficou para trás.** S01 (0,0–2,1) ainda abre com “NÃO É IMPRESSÃO”, não com o novo hook; S07 mostra R$ 61 em 20,0–25,3, mas a fala da simulação começa em 26,6. O audit de timeline só verifica encaixe, não alinhamento de beat. É o mesmo defeito de V02 na rodada 2, agora em V06.
- **V02 — S06 ainda diz “a nota ao lado parece menor”**, contra a tese de que a nota não encolhe; S10 coloca “SALVE” em 33,6, mas o CTA falado começa em 37,7.
- **V04 — S10 exibe “COMENTE” desde 21,0**, antes do payoff (21,7–25,0) e 4,1 s antes do CTA falado (25,1); S05 mostra R$ 61 em 7,0, mas a fala começa em 10,1.
- **V08 — S03 ainda mostra “4 DE 5” sem “SIMULAÇÃO · PREÇOS +25%”**; o caso +25% → 4/5 continua sem a hipótese “5 itens de preço igual”.
- **V09 — o qualificador chega em 5,8 s**, não em 0; o hook literal ocupa 15% do vídeo. S09 mostra “INVEST FÁCIL”, mas não “SIGA”.
- **V10 — S10 coloca “SALVE” em 33,8**, mas o CTA falado começa em 36,1; separar os dois na mesma cena.
- **V01/V07 — timing:** a barra de V01 desce antes do selo e as cenas derivam 1,4 s; os números de V07 aparecem 2,4–2,6 s antes da fala. O selo existe; é ajuste de EDL.
- **Densidade:** V07 ~13,3 c/s, V02 ~13,1, V06 ~13,1–13,3 após o novo hook; margem <1 s no modelo. O audit de timeline não mede fala.
- **Auditoria:** 365 checagens são documentais/aritméticas; não abrem MP4, não medem loudness e não veem pixels.

### 2. Veredito editorial por vídeo

| ID | Rodada 2 | Rodada 3 | Motivo |
|---|---|---|---|
| V01 | PASS | **PASS** | Conteúdo correto; resta ajuste de EDL. |
| V02 | FAIL | **FAIL** | Nota “parece menor” + “SALVE” antes do payoff. |
| V03 | FAIL | **PASS** | 3/5 corrigido; metáfora da máquina fica como risco de marca. |
| V04 | FAIL | **FAIL** | CTA visual antes do payoff; R$ 61 adiantado. |
| V05 | PASS | **PASS** | Conteúdo e CTA corretos. |
| V06 | PASS | **FAIL** | Hook novo no SCRIPT, mas o storyboard ainda abre com “NÃO É IMPRESSÃO” e adianta R$ 61. |
| V07 | FAIL | **PASS** | Selos de simulação no storyboard; resta timing. |
| V08 | FAIL | **FAIL** | Selo +25% ausente no S03; hipótese de preço igual não declarada. |
| V09 | FAIL | **FAIL** | Qualificador em 5,8 s; “SIGA” ausente no S09. |
| V10 | FAIL | **PASS** | 3/5 corrigido; separar “SALVE” do payoff. |

### 3. Técnica

**Técnica = NOT TESTED em todos os 10.** Não há MP4, TTS, draft CapCut, contact sheet, loudness, hash ou inspeção de frame. Nenhuma nota técnica pode ser dada; o `0*` da tabela anterior continua sendo ausência de evidência.

### 4. O que só o TTS, o render e a escuta humana podem provar

Só o TTS real, o render e a escuta humana podem provar se a locução cabe nos 30–42 s, se a Thalita pronuncia “R$”, “5%” e “61” com naturalidade, se loudness/true peak estão corretos, se o disclaimer é legível na safe zone e se o frame 0 funciona como capa — nada disso é demonstrável por 365 checagens documentais.

**Nenhuma aprovação humana é declarada.**
