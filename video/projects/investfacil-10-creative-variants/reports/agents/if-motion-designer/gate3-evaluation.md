# GATE 3 — AVALIAÇÃO PRELIMINAR DE MOTION & TIPOGRAFIA

**Agente:** if-motion-designer
**Data:** 21/11/2026
**Projeto:** `investfacil-10-creative-variants`
**Escopo:** V01–V10 — potencial visual, tipografia cinética e viabilidade Remotion
**Status:** AVALIAÇÃO PRELIMINAR. Nenhum vídeo foi produzido ou renderizado. Nenhum arquivo fora desta pasta foi alterado. **Nenhuma aprovação humana foi concedida ou declarada.**

---

## 1. Sumário executivo

| Item | Resultado |
|---|---|
| Melhor variante no eixo motion | **V01 — O ticker não para** (27/30) |
| Top 3 | **V01, V04, V09** |
| Mais fraco neste eixo | **V02 — O café de sempre** (19/30 na Rodada 1; 20/30 na Rodada 2) — não é veto criativo; é custo de execução |
| Maior risco sistêmico | Textos de 15–17 px do HI01 são ~5–6 px CSS no celular; não são legíveis |
| Segundo maior risco | Colisão entre ticker/espelho/textura e o texto-herói |
| Terceiro maior risco | `KineticText` em modo `mask` corta descendentes (ç, g, p, q, j) |
| Contradição semântica | Resolvida na Rodada 2: V03 e V10 mantêm a nota e encolhem a cesta/reflexo (ver seção final) |
| Bloqueio técnico | Constantes e frames absolutos do HI01 impedem reuso nos 10 vídeos |

**Leitura curta:** o conjunto tem três caminhos de motion realmente fortes — ticker (V01), quiz rítmico (V04) e campanha/manifesto (V09). V06 é o primeiro suplente. V02 é a melhor história e o pior encaixe no stack atual. V03 e V10 tiveram a correção semântica resolvida na Rodada 2 (a nota não encolhe; a cesta/reflexo encolhe), mas ainda têm resíduos numéricos a reconciliar (3/5 vs 4/5; 4/5 vs 61).

---

## 2. O que foi lido

- `video/MEMORY.md`
- `docs/GATE1_AUDIT.md`
- `docs/GATE2_VALIDATION.md` (consulta pontual)
- `reports/CREATIVE_CONCEPTS_MATRIX.md`
- `evaluation/SCORING_TEMPLATE.md`
- `V01/CONCEPT.md` … `V10/CONCEPT.md`
- `V01/STORYBOARD.md` … `V10/STORYBOARD.md`
- `V01/EDITING_TIMELINE.md` … `V10/EDITING_TIMELINE.md`
- `V01/SCRIPT.md`, `V02/SCRIPT.md`, `V10/SCRIPT.md` (amostra de densidade de texto)
- Componentes de `video/src/high-impact/`: `constants.ts`, `KineticText.tsx`, `AnimatedNumber.tsx`, `CameraMovement.tsx`, `SceneShell.tsx`, `BackgroundEffects.tsx`, `FinancialChart.tsx`, `ProductBasket.tsx`, `LogoReveal.tsx`, `InvestFacilHighImpact01.tsx`, `scenes/HookScene.tsx`, `scenes/ImpactScene.tsx`, `scenes/OutroScene.tsx`
- `video/src/Root.tsx`, `video/package.json`

**Não foi feito:** render, still, alteração de componentes, criação de assets, alteração de MEMORY, draft CapCut, aprovação de qualquer variante.

---

## 3. Rubrica usada

As notas são autoavaliação editorial no eixo motion, não o score final da matriz ponderada. Não substituem avaliação humana.

| Dimensão | O que mede | 9–10 | 7–8 | 5–6 | 0–4 |
|---|---|---|---|---|---|
| **Potencial visual** | Força e distintividade da imagem, **considerando o que é alcançável com vetores/CSS/SVG, sem fotografia ou 3D** | Imagem própria, memorável, executável com craft | Boa imagem, mas com tropo ou risco de acabamento | Imagem dependente de asset/luz que o stack não entrega | Imagem genérica ou inviável |
| **Tipografia cinética** | Amplitude de hierarquia, legibilidade e capacidade de o movimento tipográfico carregar significado | Tipo é parte do argumento; múltiplos registros sem poluir | Tipo funcional e claro, com pouca ousadia | Tipo coadjuvante ou limitado pelo layout | Tipo ilegível ou decorativo |
| **Viabilidade Remotion** | Probabilidade de entregar a intenção no prazo, de forma determinística e performática, com o stack atual | Componentes existentes resolvem; baixo risco | Funciona com adaptações claras | Exige invenção de componente/asset ou correção conceitual | Não entregável no escopo |

**Média /30** é apenas a soma dos três eixos. O peso oficial de motion na matriz final é 10/100; este relatório não reordena os outros critérios.

---

## 4. Tabela principal

| # | Variante | Potencial visual | Tipografia cinética | Viabilidade Remotion | Média /30 | Rank | Assinatura de movimento | Risco dominante |
|---|---|---:|---:|---:|---:|---:|---|---|
| V01 | O ticker não para | 9 | 9 | 9 | **27** | 1 | Ticker em parallax ao redor de uma nota imóvel | Excesso de estímulo; ticker atrás do herói |
| V02 | O café de sempre | 7 | 7 | 5 | **19** | 10 | Ritual em match cuts, luz e troco que encolhe | Dead time; “cinema” com vetores |
| V03 | A máquina de encolher dinheiro | 8 | 7 | 6 | **21** | 9 | Esteira mecânica com compressão | Nota encolhendo contradiz a mensagem |
| V04 | R$ 100 em 30 segundos | 8 | 9 | 9 | **26** | 2 | Quiz cronometrado, cortes secos, números grandes | Atropelo de leitura; timer competindo |
| V05 | Uma nota sobre a mesa | 8 | 7 | 8 | **23** | 6 | Minimalismo com deriva lenta e linha única | Dead time; cara de slide |
| V06 | Não é impressão | 8 | 8 | 9 | **25** | 4 | Split salário/cesta com espelho | Colisão no seam; texto espelhado |
| V07 | A linha que explica seu bolso | 8 | 7 | 8 | **23** | 7 | Gráfico que desce a tela | Labels de 15–16 px; gráfico 16:9 no vertical |
| V08 | Papo de mercado | 7 | 8 | 9 | **24** | 5 | Conversa em bolhas de chat | Texto pequeno; cara de meme |
| V09 | O imposto invisível | 9 | 9 | 8 | **26** | 3 | Campanha: recibo, linha invisível, carimbo | Anúncio institucional; excesso de luz |
| V10 | O espelho do dinheiro | 9 | 8 | 6 | **23** | 8 | Espelho/corredor com reflexo que encolhe | Hermetismo; texto refletido; morph frágil |

**Ranking por média:** V01 (27) → V04 (26) → V09 (26) → V06 (25) → V08 (24) → V05 (23) → V07 (23) → V10 (23) → V03 (21) → V02 (19).

**Desempates:** V04 antes de V09 por maior certeza de execução (9 vs 8 em Remotion); V05, V07 e V10 empatados em 23, ordenados por viabilidade (8, 8, 6). Empates não alteram o top 3.

---

## 5. Justificativas por variante

### V01 — O ticker não para · 9/9/9 · 27/30

- **Potencial visual:** é o único conceito em que o movimento **é** o argumento: preços em movimento ao redor de uma nota imóvel. A imagem funciona sem áudio e sem explicação. O risco não é falta de ideia, é excesso — ticker, número, headline e labels podem virar quatro camadas de leitura.
- **Tipografia cinética:** números tabulares, ticker e labels dão vocabulário de sobra. A hierarquia é natural: um número-herói, uma palavra de tensão, o resto é textura.
- **Remotion:** tudo é `transform`/`opacity`; `AnimatedNumber` e `KineticText` resolvem. O cuidado é determinismo do ticker (seed) e máscara de lane.
- **Risco dominante:** colisão ticker × herói e amarelo em excesso. Regra: ticker nunca amarelo, nunca atrás do número, pausa de 4 frames em cada número-chave.

### V02 — O café de sempre · 7/7/5 · 19/30

- **Potencial visual:** o ritual é a ideia mais emocional da coleção, mas “cinema” depende de fotografia, luz e matéria que o stack atual (vetores/CSS) não entrega de graça. Sem rosto/mão, o POV de objeto pode funcionar — mas é ilustração editorial, não filme.
- **Tipografia cinética:** uma linha por plano é elegante e controlada; o potencial cinético é deliberadamente baixo. O risco é ficar “slide com café”.
- **Remotion:** exequível, porém a ambição “cinematic” eleva o custo de arte. Vapor com blur, papel, luz e sombra exigem craft; 9 s de outro agravam o dead time.
- **Risco dominante:** planos de 2–4 s sem micro-movimento e um encerramento longo. É a variante com maior distância entre intenção e entrega no stack atual.

### V03 — A máquina de encolher dinheiro · 8/7/6 · 21/30

- **Potencial visual:** a máquina é um objeto gráfico forte; engrenagens, esteira e compressão dão movimento com causa e efeito. É o conceito mais “puzzle” da coleção.
- **Tipografia cinética:** verbos industriais (ENTRA / SAI / ENCOLHE) são bons, mas o texto é coadjuvante; os números só chegam no fim.
- **Remotion:** rotação de engrenagem e esteira são triviais; morph contínuo nota→linha não é, e a nota encolhendo contradiz “o número não muda”.
- **Risco dominante:** contradição semântica do encolhimento e um meio abstrato sem âncora numérica. Corrigir antes de animar.

### V04 — R$ 100 em 30 segundos · 8/9/9 · 26/30

- **Potencial visual:** é o mais cinético e o mais próximo do vocabulário nativo de Remotion: cards, números, corte seco, punch-in. A linguagem “fast edit” é menos própria da marca do que V01/V09, mas é altamente executável.
- **Tipografia cinética:** números grandes, ANTES/DEPOIS/HOJE e contagem oferecem muita amplitude. É o segundo melhor laboratório de tipo da coleção.
- **Remotion:** praticamente todos os componentes existentes servem. O risco é de edição, não de engine.
- **Risco dominante:** 0,8–1,8 s por corte + 5 cards + timer + headline = atropelo. O timer precisa ser rail, não número; e o vídeo precisa de dois respiros reais.

### V05 — Uma nota sobre a mesa · 8/7/8 · 23/30

- **Potencial visual:** é o contraponto necessário da coleção e pode ser o mais “premium” se a arte for impecável: nota, mesa, luz e linha. A restrição é a assinatura.
- **Tipografia cinética:** poucas palavras, grandes e elegantes; pouco espaço para cinética, muito para hierarquia. O tipo precisa ser tratado como objeto, não como legenda.
- **Remotion:** simples de renderizar; difícil de fazer parecer caro. O premium vem de textura, sombra e micro-movimento, não de efeito.
- **Risco dominante:** dead time e cara de slide. Sem deriva contínua de 0,4–0,8%/s, a variante morre.

### V06 — Não é impressão · 8/8/9 · 25/30

- **Potencial visual:** o split salário/cesta é claro e valida a sensação; o espelho dá um segundo nível. Mas split-screen é tropo comum e a metade de 462 px limita o texto.
- **Tipografia cinética:** palavras em conflito (SALÁRIO / CESTA / NÃO É IMPRESSÃO) são boas; frases longas não cabem na metade.
- **Remotion:** painéis, contadores e `KineticText` resolvem. É o suplente mais seguro do top 3.
- **Risco dominante:** colisão no seam e texto espelhado. O seam precisa sumir antes de a palavra-herói entrar.

### V07 — A linha que explica seu bolso · 8/7/8 · 23/30

- **Potencial visual:** data viz é o único data-first e o gráfico pode ser o herói **se for recomposto para 9:16**. O componente atual é 16:9 e tem labels de 15–16 px.
- **Tipografia cinética:** técnica, tabular, precisa; menos expressiva, mais confiável. O tipo aqui é prova, não performance.
- **Remotion:** o chart existente acelera, mas o `pathLength` hardcoded e o tamanho dos labels precisam de correção.
- **Risco dominante:** gráfico pequeno/flutuante e labels ilegíveis. 42 s com um único gráfico pode esfriar; precisa de três estados (100, 78, 61) com câmera.

### V08 — Papo de mercado · 7/8/9 · 24/30

- **Potencial visual:** chat é nativo e relatable, mas é o mais próximo de meme e o menos premium; a autoridade precisa vir do número, não da UI.
- **Tipografia cinética:** balões são recipientes de tipo e permitem ritmo de conversa; o risco é texto pequeno e bolha longa.
- **Remotion:** bolhas, typing dots e UI wipes são triviais. É a variante de menor risco técnico.
- **Risco dominante:** bolha com 7+ palavras em 30 px e dois CTAs (chat + marca). Não usar chrome falso de iOS.

### V09 — O imposto invisível · 9/9/8 · 26/30

- **Potencial visual:** é a variante de campanha: recibo, linha amarela invisível, carimbo, logo. Tem o maior teto de craft e a imagem mais “assinatura” depois de V01.
- **Tipografia cinética:** manchete de manifesto, label e logo; hierarquia natural, tipo com gravitas.
- **Remotion:** light sweep, stamp e logo são viáveis; blur/glow em full-screen é o custo. O `LogoReveal` existente é um bom ponto de partida.
- **Risco dominante:** parecer anúncio institucional e excesso de luz. O CTA precisa existir e ser discreto; hoje a timeline não o explicita.

### V10 — O espelho do dinheiro · 9/8/6 · 23/30

- **Potencial visual:** o espelho/corredor é a imagem mais distinta da coleção e a mais difícil de executar; o teto é altíssimo, o piso também.
- **Tipografia cinética:** versos curtos com profundidade e reflexo são bons, mas reflexo de texto legível é ruído.
- **Remotion:** duplicar camadas, mascarar, morph e parallax é possível; “experimental masterpiece” com vetores/CSS é caro e frágil. 45 s aumentam a exposição.
- **Risco dominante:** hermetismo, texto refletido e a contradição do reflexo que encolhe. Precisa de âncora numérica cedo e de um morph que não distorça o “100”.

---

## 6. Top 3

| Posição | Variante | Por que entra | O que a derruba | Condição de produção |
|---:|---|---|---|---|
| 1 | **V01 — O ticker não para** | O movimento é o argumento; contraste nota imóvel × preços em movimento; alto potencial visual e tipográfico; execução nativa em Remotion | Ticker dominar o herói; amarelo em todo lugar; 4 camadas de leitura | Ticker como textura (≤35%, nunca amarelo, nunca atrás do número); 1 número-herói; pausa de 4 f nos números-chave |
| 2 | **V04 — R$ 100 em 30 segundos** | Maior energia cinética; melhor encaixe nos componentes existentes; tipo grande e ritmo de quiz | Texto ilegível entre cortes; timer competindo; 5 cards + número na mesma tela | Timer em rail de 4 px; ≤4 palavras por card; ≥18 f de hold; dois respiros de 2,4 s; remover o split duplicado de 21–24 s |
| 3 | **V09 — O imposto invisível** | Maior teto de craft e melhor adequação à marca; tipografia de campanha; logo reveal existente | Virar anúncio institucional; duas fontes de luz; CTA ausente | Uma única fonte de luz por cena; recibo abstrato; CTA explícito em 37–40 s; headline em 3 linhas |

**Primeiro suplente:** V06 (25/30). Se qualquer um dos três falhar em um P0, V06 entra: o split-screen é robusto, o tipo é forte e a execução é a mais previsível depois de V04.

**Observação:** o top 3 é do eixo motion. Não é o ranking final e não declara vencedor. A matriz ponderada ainda depende de hook, retenção, edição, som, clareza, distribuição, marca e técnica.

---

## 7. Mais fraco neste eixo — V02

**Não é a pior história.** É a maior distância entre intenção e entrega no stack atual.

| Fator | Diagnóstico |
|---|---|
| Potencial visual 7 | O ritual é forte, mas “cinematic” com vetores/CSS tende a ilustração editorial. Sem fotografia, a mesa/café precisa de um tratamento de arte muito acima da média. |
| Tipografia 7 | Uma linha por plano é elegante, mas limita o potencial cinético; o risco é o texto parecer legenda de slide. |
| Remotion 5 | Vapor com blur, papel, luz, sombra, troco e 9 s de outro: tudo é possível, mas o custo de craft e o risco de dead time são os mais altos da coleção. |
| Cadência | 2–4 s por plano, com vários planos sem evento visual interno. O olho cansa antes do payoff. |
| Âncora | O “R$ 100” só aparece aos 2 s; o hook é emocional, não numérico. |

**O que elevaria V02 a 23–24:** POV de objeto (sem mão/rosto), quatro micro-beats (vapor, luz, recibo, troco), baseline fixa de tipo, gráfico em portrait, outro comprimido de 9 s para 6 s, e um “R$ 100” visível até 1,2 s. Mesmo assim, a viabilidade Remotion fica em 7; não entra no top 3 neste eixo.

**Não é veto.** Se a prioridade do usuário for emoção/narrativa, V02 pode ser produzido — mas com custo de arte maior e expectativa visual recalibrada.

---

## 8. Must-fix

### 8.1 P0 — bloqueiam a próxima etapa

| ID | Achado | Evidência | Correção obrigatória | Afeta |
|---|---|---|---|---|
| **P0-01** | Constantes e frames absolutos do HI01 impedem reuso | `constants.ts` (`SCENES`, `DURATION=1200`), `ProductBasket.tsx` (`START=282`, `frame >= START+74`), `BackgroundEffects.tsx` (`interpolate(frame,[0,1200])`), `ImpactScene` com `Sequence` absolutos | Extrair `video/src/shared/` com tokens e props (`start`, `duration`); cada cena usa `useCurrentFrame()` local dentro de `Sequence`; nenhum frame absoluto de HI01 | Todos |
| **P0-02** | Piso tipográfico insuficiente | `FinancialChart` labels 15/16 px; `ProductBasket` 15/16/17 px; `HookScene` rodapé 16 px; `OutroScene` rodapé 15 px | Texto informativo ≥34 px; corpo ≥44 px; legal ≥30 px; labels ≥30 px; **<30 px só decorativo**. Chart labels 28–32 px | Todos, sobretudo V07 |
| **P0-03** | `KineticText` em `mask` corta descendentes | `overflow:hidden` por linha; `ImpactScene` usa `lineHeight: 0.98`; Plus Jakarta tem ç, g, p, q, j | `lineHeight` ≥1,04 dentro da máscara + `paddingBottom: 0.14em` e `marginBottom: -0.14em` no contêiner; testar “ÇÃO gpqj” | V01, V06, V09, V10 |
| **P0-04** | `tracking` causa reflow e `word` atrasa a leitura | `KineticText` anima `letterSpacing` 0,28em→0,015em no bloco; `word` usa 3 f por palavra | `tracking` só para ≤14 caracteres; para frases, usar `mask` ou `scaleX` do wrapper; `stagger` 1–2 f ou grupos de frase; revelação total ≤18 f | Todas as manchetes |
| **P0-05** | Texto sobre textura/movimento sem scrim | V01 S01 tem ticker + número + eyebrow; V10 reflete texto; V09 usa recibo texturizado | Prato opaco `#050505` ou gradiente ≥85% atrás do herói; ticker ≤0,35; no máximo 2 blocos de texto por beat | V01, V02, V05, V08, V09, V10 |
| **P0-06** | Orçamento de amarelo estourado | Storyboards marcam 2–3 palavras amarelas por cena; ticker pode virar amarelo inteiro | Máximo **1 texto amarelo + 1 grafismo amarelo** por frame; labels em branco/muted; ticker nunca amarelo; número final pode virar amarelo só depois do settle | Todos, especialmente V01, V04, V06 |
| **P0-07** | Frame 0 pode ser capa lavada | V06 S01 “push-in; blur”; V04 S01 punch-in; V01 flash | Frame 0 com herói em opacidade cheia; pré-roll ≥6 f; blur de entrada ≤4 px no f0; flash ≤5% e ≤2 f | Todos, especialmente V04, V06 |
| **P0-08** | Determinismo do ticker/partículas | Ticker e fundos ainda serão implementados; `Math.random`/`Date.now` quebrariam a repetição | PRNG com seed fixa; tabela fixa de partículas; renderizar o mesmo frame duas vezes e comparar hash | V01, V09, V10 |
| **P0-09** | Safe zone tratada só na lateral | MEMORY: 78 px lateral, CTA 190–210, legal 120; `OutroScene` tem rodapé em `bottom:90` e 15 px | Aplicar a tabela da seção 13; CTA baseline ≤1710; legal ≤1800; margem direita 140 px abaixo de y=900; topo ≥150 | Todos |
| **P0-10** | Movimento contradiz a mensagem | V03 encolhe a nota mas diz “o número não muda”; V10 encolhe o reflexo da nota mas diz “o dinheiro não some” | Manter a nota em 100%; encolher a cesta, o halo de compra ou a linha de poder. Se a nota encolher, contra-escalar o “100” para ele não diminuir | V03, V10 |
| **P0-11** | Reflexo de texto legível | V06 S08 “espelho”; V10 S01–S10 | Refletir **objetos**, não texto; se refletir tipo, opacidade ≤0,12 e blur ≥3 px (não legível); máx. 2 camadas refletidas | V06, V10 |
| **P0-12** | Orçamento de performance | `BackgroundEffects` tem grain full-screen com `mixBlendMode` e posição animada; `ImpactScene` aplica `blur(2px)` em placa 980×780 | ≤2 camadas com blur animado por frame; sweeps pré-renderizados; sem `filter: blur` full-screen; sem `feGaussianBlur`; grain estático; meta ≤7 min por 40 s | V01, V09, V10 |

### 8.2 Must-fix específico por variante

| Variante | Must-fix | Critério de aceite |
|---|---|---|
| V01 | Ticker em lanes mascaradas, nunca atrás do herói; pausa de 4 f nos números-chave; máx. 3 labels de ticker visíveis | Nenhum pixel de número de ticker dentro do bbox do herói; ticker ≤0,35; 1 amarelo |
| V02 | POV de objeto, sem mão/rosto; 4 micro-beats; baseline fixa; gráfico portrait; outro ≤6 s | Nenhum plano >1,2 s sem variação de luz/escala; “R$ 100” até 1,2 s |
| V03 | Não encolher a nota; encolher a cesta/poder; trocar morph contínuo por match cut; âncora “R$ 100” até 0,5 s | “100” impresso com tamanho constante; corte na borda da nota |
| V04 | Timer em rail de 4 px; ≤4 palavras/card; ≥18 f de hold; dois respiros; remover split duplicado 21–24 s | Nenhum card com 2 linhas >4 palavras; leitura possível a 25% |
| V05 | Piso de movimento contínuo (deriva 0,4–0,8%/s); linha nunca cruza texto; dividir o beat de 7 s do número | Nenhum frame estático >1,2 s; linha atrás do texto |
| V06 | Painéis colapsam antes de INFLAÇÃO; nada de texto espelhado; frases longas só em largura total | Seam livre de texto; “NÃO É IMPRESSÃO” em largura total |
| V07 | Chart portrait; labels ≥28 px; `pathLength={1}`; três estados (100/78/61) | Nenhum label <28 px; chart ocupa y 420–1420 |
| V08 | Bolhas ≥30 px; máx. 2 bolhas; UI com identidade da marca; um CTA | Nenhuma bolha com >2 linhas de 30 px; sem chrome falso de iOS |
| V09 | Uma fonte de luz por cena; recibo abstrato; CTA explícito em 37–40 s | Nenhum frame com sweep + glow + partículas simultâneos; CTA visível 3 s |
| V10 | Reflexo só de objeto; âncora numérica até 6 s; máx. 2 camadas refletidas; chart só na camada real | Nenhum texto legível no reflexo; “R$ 100” até 6 s |

### 8.3 P1 — corrigir antes do polimento

| ID | Achado | Correção |
|---|---|---|
| P1-01 | `KineticText` usa `marginRight: 0.22em` em todas as palavras, inclusive a última | Trocar por `columnGap: "0.22em"` no contêiner flex; corrige centralização óptica |
| P1-02 | `CameraMovement` usa `Math.sin(progress*PI)` para pan, então o pan volta ao zero | Adicionar `panMode: "sine" | "linear"`; usar linear para pans direcionais |
| P1-03 | `SceneShell` sempre faz fade-out de 12 f | Adicionar `exitFrames` (default 12; 0 para cortes secos de V04) |
| P1-04 | `BackgroundEffects` usa `interpolate(frame,[0,1200])` e `frame % 330` | Usar `useVideoConfig().durationInFrames` e frame local |
| P1-05 | `OutroScene` tem rodapé em `bottom:90` e 15 px | Subir para 120 px e ≥28 px, ou remover o rodapé técnico |
| P1-06 | `ImpactScene` aplica `blur(2px)` em placa 980×780 | Substituir por gradiente pré-renderizado; blur só em elemento pequeno |
| P1-07 | `ProductBasket` usa 5 cards de 440 px e 4 linhas de texto | Criar variante `compact` (rows de 84 px) para V04/V06/V08 |
| P1-08 | `LogoReveal` não tem controle de hold/exit | Adicionar `delay`, `hold`, `exit`; CTA entra depois do logo, nunca junto |
| P1-09 | `accentWords` depende da grafia exata (“É” ≠ “E”) | Documentar no componente; normalizar acentos ou exigir a palavra acentuada |
| P1-10 | Falta overlay de auditoria | Adicionar `SafeFrame` e `DebugBounds` atrás de prop de debug |
| P1-11 | Falta medição de texto | Opcional: `@remotion/layout-utils` (`fitText`) para títulos longos; requer aprovação de dependência |
| P1-12 | Uppercase + tracking varia entre cenas | Tokens fixos: label 0,16–0,18em; headline -0,055em; número -0,06em |

---

## 9. Riscos de legibilidade e colisão

| Variante | Tempo | Risco | Gravidade | Mitigação |
|---|---|---|---|---|
| V01 | 0,0–2,4 | Ticker atrás do “R$ 100”; 3 camadas de texto | Alta | Ticker só y<420 e y>1500; scrim 100%; eyebrow entra em 1,5 s |
| V01 | 8,0–12,0 | Whip pan + “MENOS CAFÉ / PÃO / TRANSPORTE” em movimento | Alta | Texto pousa 6 f depois do pan; sem blur no texto |
| V01 | 23,0–26,0 | “MESMO NÚMERO / MENOS PODER” sobre o seam do split | Média | Texto em cada painel ou abaixo do seam; seam 2 px |
| V02 | 0,0–2,0 | Tipo sobre vapor/luz | Média | Scrim inferior; tipo em lower third; vapor atrás |
| V02 | 20,0–25,0 | Linha sobe atrás da xícara e cruza o texto | Média | Linha atrás do objeto; texto em área limpa |
| V02 | 36,0–45,0 | 9 s de outro sem evento | Alta | Comprimir para 6 s; CTA em 40–45 |
| V03 | 0,0–4,0 | Nota encolhe e o “100” encolhe junto | Crítica | Não encolher a nota; encolher a cesta/poder |
| V03 | 4,0–7,0 | Engrenagens + “INFLAÇÃO” no mesmo frame | Média | Fundo escurece 40%; palavra em scrim |
| V04 | 0,0–1,5 | Timer + número + pergunta em 45 f | Alta | Timer rail; pergunta em f=18; ≤5 palavras |
| V04 | 5,0–7,0 | “4 DE 5” sobre 5 cards | Alta | Cards a 25% + blur 2 px; número em scrim |
| V04 | 21,0–24,0 | Repetição do split “MESMO NÚMERO” de 9–12 s | Média | Callback de 1,5 s, não repetição de 3 s |
| V05 | 5,0–9,0 | Linha amarela cruza “NÃO TEM O MESMO TAMANHO” | Média | Linha atrás do texto ou desvio; texto em scrim |
| V05 | 13,0–18,0 | 5 s de macro estático | Alta | Push 2%; rack de foco; grão 2% |
| V06 | 0,0–2,0 | Blur de entrada no frame 0 | Alta | f0 nítido; blur a partir de f1; pré-roll 6 f |
| V06 | 11,0–15,0 | “INFLAÇÃO” no seam dos painéis | Alta | Painéis colapsam para 8% antes da palavra |
| V06 | 24,0–28,0 | Texto espelhado | Alta | Refletir só objeto; tipo nunca legível no reflexo |
| V07 | 0,0–42,0 | Labels de 15–16 px | Crítica | 28–32 px; chart portrait; menos labels |
| V07 | 22,0–27,0 | Chart em meia largura no split | Alta | Chart full-width; nota como inset 320×200 |
| V08 | 0,0–2,0 | Bolha com 7 palavras em <30 px | Alta | Bolha 700×260, 34 px; quebrar em 3 linhas |
| V08 | 5,0–9,0 | “4 DE 5” sobre cards | Alta | Cards a 60%; número em scrim |
| V09 | 0,0–2,5 | Sweep sobre headline de 3 linhas | Média | Sweep atrás; 6% máx.; texto acima |
| V09 | 29,0–34,0 | Sweep + glow + partículas ao mesmo tempo | Média | Uma fonte de luz; desligar partículas |
| V09 | 34,0–40,0 | Logo sem CTA explícito | Média | CTA em 37–40; logo 34–37 |
| V10 | 0,0–2,5 | Reflexo de texto poético | Alta | Refletir só objeto; texto acima do espelho |
| V10 | 2,5–6,0 | Nota/reflexo encolhe e “100” encolhe | Crítica | Encolher linha de poder, não a nota |
| V10 | 28,0–33,0 | Chart dentro do reflexo | Alta | Chart só na camada real |
| V10 | 38,0–45,0 | 7 s de fecho poético | Alta | Fecho 38–42; CTA 42–45 |

**Regra de ouro:** se em um still de 25% (270×480) o espectador não identifica **uma** informação principal, há colisão de hierarquia — mesmo que os elementos não se toquem.

---

## 10. Sistema de movimento reutilizável

### 10.1 Tokens

```ts
export const SPRING = {
  enter:  { damping: 22, stiffness: 130, mass: 0.8 }, // settle ~13 f
  soft:   { damping: 26, stiffness: 60,  mass: 1.0 }, // settle ~24 f
  impact: { damping: 13, stiffness: 190, mass: 0.7 }, // settle ~8 f, overshoot ≤3%
  mech:   { damping: 30, stiffness: 120, mass: 0.9 }, // sem overshoot
  bubble: { damping: 15, stiffness: 200, mass: 0.6 }, // snappy
} as const;

export const EASE = {
  pan:   Easing.bezier(0.22, 1, 0.36, 1),
  drift: Easing.inOut(Easing.sin),
};
```

**Regra do único movimento:** em qualquer janela de 12 frames, só uma camada pode estar em amplitude máxima — câmera, tipo-herói ou fundo. As outras ficam ≤30% ou paradas. Isso evita o “tudo anima ao mesmo tempo” que caracteriza vídeo amador.

### 10.2 Componentes compartilhados

| Componente | Estado | Uso | Ajuste necessário |
|---|---|---|---|
| `tokens.ts` | Novo | Cores, fonte, escala, safe zones, springs | Consolidar HI01 + variantes |
| `KineticText` | Existe | Palavra, máscara, tracking, blur | Fit, maxLines, máscara com descendentes, `columnGap`, stagger por grupo |
| `AnimatedNumber` | Existe | Contadores 100→61,39 | `format`, `tabular-nums`, troca de cor pós-settle |
| `CameraMovement` | Existe | Push/pull/pan | `panMode`, easing, sem `Math.sin` em pan direcional |
| `SceneShell` | Existe | Entrada/saída de cena | `exitFrames`, corte seco |
| `LogoReveal` | Existe | Assinatura | `delay`, `hold`, `exit` |
| `BackgroundEffects` | Existe | Grid, grão, sweep, partículas | Renomear para `BackgroundFX`; `variant`, `intensity`, frame local, grain estático |
| `FinancialChart` | Existe | Linha 100→61 | Portrait, labels ≥28, `pathLength={1}` |
| `ProductBasket` | Existe | Cesta 5 itens | Refatorar para `BasketGrid`; `start`, `removeIndex`, modo compacto/rows |
| `TickerLane` | Novo | V01 | `direction`, `speed`, `seed`, `pauseAt`, `opacity` |
| `PowerBar` | Novo | V01/V06/V07 | 100→61, label, sem bounce |
| `SplitPanel` | Novo | V06/V08 | `left`, `right`, `seam`, `collapseAt` |
| `ChatThread` | Novo | V08 | `bubbles`, `typing`, `maxVisible=2` |
| `ReceiptCard` | Novo | V09/V08 | Linhas abstratas, `highlightLine` |
| `StampText` | Novo | V09 | Scale/impact, rotação -6°, sem blur |
| `MirrorLayer` | Novo | V10 | `reflect`, `mask`, `opacity`, máx. 2 camadas |
| `LineDraw` | Novo | V07/V10 | SVG path, `pathLength={1}`, draw em frames |
| `ProgressRail` | Novo | V04 | 4 px, linear, sem número |
| `Banknote` | Novo | V01/V03/V05/V10 | SVG abstrato, `value`, `serial`, `variant` |
| `MachineRig` | Novo | V03 | Rolos, engrenagens, esteira |
| `Scrim` | Novo | Todas | Prato opaco/gradiente para legibilidade |
| `SafeFrame` | Novo | QC | Overlay de safe zone (debug) |
| `DebugBounds` | Novo | QC | Bounding boxes de texto (debug) |

**Nota de arquitetura:** não importar `high-impact/constants.ts` nas variantes. Criar `video/src/shared/` e manter o HI01 como composição legada. Caso contrário, os 10 vídeos herdam `SCENES`, `START=282` e `DURATION=1200`.

### 10.3 Gramática por variante

| Variante | Ideia | Movimento que carrega a ideia | Movimento proibido |
|---|---|---|---|
| V01 | Instabilidade ao redor de uma âncora | Ticker em lanes, números subindo, nota imóvel | Zoom em tudo; ticker amarelo |
| V02 | Repetição até a ruptura | Match cuts, luz que muda, desaceleração no “NÃO DEU” | Whip pan; zoom rápido |
| V03 | Causa e efeito mecânico | Esteira, engrenagens, compressão da cesta | Morph contínuo; nota encolhendo |
| V04 | Pressão de tempo | Cortes secos, punch-ins, timer rail | Fade lento; texto em 0,8 s |
| V05 | Restrição e silêncio | Deriva subperceptual, linha que desce | Bounce; partículas; flash |
| V06 | Divergência | Painéis em direções opostas, números em conflito | Texto espelhado; dois amarelos |
| V07 | Queda | Linha que desce a tela, câmera que acompanha | Gráfico 16:9 flutuante |
| V08 | Conversa | Bolhas, typing, UI pop | Chrome falso de iOS; texto pequeno |
| V09 | Custo escondido | Linha que já estava lá e passa a brilhar | Duas fontes de luz; glow em tudo |
| V10 | Reflexo | Espelho, parallax, nota que vira linha | Texto refletido; chart no reflexo |

---

## 11. Contrato de frames por variante

| Variante | Duração | Entrada | Hold | Saída | Proibido |
|---|---:|---|---|---|---|
| V01 | 1020 f | 8–12 f, `SPRING.enter`, scale 0,94→1 | Ticker 2,4 px/f; deriva 0,2%/s; pausa 4 f nos números | 6 f fade + 10 px up | Blur full-screen; >2 lanes; ticker amarelo |
| V02 | 1350 f | 18–24 f, `SPRING.soft`, sem bounce | Push 1,0→1,05 em 90 f; vapor 180 f; luz 4%/60 f | 10 f fade; match cut na xícara | Whip pan; zoom rápido; texto sem scrim |
| V03 | 1050 f | 8 f, `SPRING.mech`, slide 80 px | Esteira 1,6 px/f; engrenagem 0,5°/f; cesta encolhe | 4 f cut; match cut na borda | Morph contínuo; shake; nota encolhendo |
| V04 | 900 f | 6 f, `SPRING.impact`, scale 1,08→1 | 18–24 f mínimo; timer linear; punch 4 f | 3 f hard cut | Texto em whip; >4 palavras; 2 CTAs |
| V05 | 1200 f | 24 f, `SPRING.soft`, sem translate >12 px | Deriva 0,4%/s; linha 60 f; sweep 3%/4 s | 12 f fade | Bounce; zoom rápido; partículas |
| V06 | 1140 f | 10 f, slide ±60 px + opacity | 24–36 f; contadores 30 f; seam 2 px | 4 f cut; painéis colapsam 6 f antes | Texto no seam; texto espelhado |
| V07 | 1260 f | 60–75 f line draw, `SPRING.soft` | Ponto 8 f; push 1,0→1,03/60 f; label 8 f | 6 f fade; chart wipe 8 f | Chart 16:9; label <28 px; linha sobre valor |
| V08 | 1020 f | 8 f, `SPRING.bubble`, scale 0,9→1 | Typing 8 f; máx. 2 bolhas | 4 f UI wipe | Chrome de iOS; >2 bolhas; texto <30 px |
| V09 | 1200 f | 12 f mask; sweep 18 f a 6%; stamp 3 f | 24 f; recibo 30 f; push 1,0→1,03 | 8 f fade; logo é o único mover | Duas luzes; blur full-screen; CTA antes de 37 s |
| V10 | 1350 f | 20–28 f, `SPRING.soft`; máscara 40 f | Push 120 f; reflexo 0,25–0,35; linha 60 f | 12 f fade; sem corte no morph | Texto refletido; >2 camadas; chart no reflexo |

---

## 12. Especificação das cenas-herói (top 3)

As demais cenas seguem o contrato da seção 11 e os tokens da seção 10. A especificação campo a campo de todas as ~90 cenas é entregável do Gate 4, quando roteiro e narração estiverem fechados; aqui ficam as cenas que decidem o padrão de motion de cada finalista.

### V01 · S01 — 00:00–00:02,4 (0–72 f)

- **Texto principal:** “R$ 100”; eyebrow “NÃO É IMPRESSÃO” a partir de 1,5 s.
- **Hierarquia:** número 240/900 > eyebrow 30/800 > ticker 26/700 (textura).
- **Animação:** número scale 0,92→1 + opacity em 8 f; duas lanes de ticker a 2,4 px/f; eyebrow em máscara de 8 f no f=45.
- **Easing/spring:** `SPRING.enter` (d22, s130, m0,8); ticker linear; eyebrow `SPRING.soft` (d24, s100).
- **Tamanho e peso:** número 240 px / 900 / -0,06em; eyebrow 30 px / 800 / 0,16em; ticker 26 px / 700 / 0,04em.
- **Cor/destaque:** “R$” `#FACC15`; “100” `#FFFFFF`; eyebrow branco; ticker `#737373` a 30%.
- **Camadas/parallax:** grid 4%; ticker far 25%; ticker near 35%; scrim 100% atrás do herói (feather 80 px); herói; eyebrow.
- **Câmera simulada:** push-in 1,0→1,035 em 72 f, origem 50% 42%.
- **Transição de entrada/saída:** hard cut com flash branco 5% em 2 f; saída 6 f fade + 10 px up.
- **Safe zone:** herói x 150–930, y 620–980; eyebrow y 1080; ticker só y<420 e y>1500.
- **Risco de legibilidade:** ticker atrás do herói; 4 camadas; baseline de “R$” 94 px + “100” 240 px. Mitigação: scrim 100%, pausa do ticker, flex baseline.

### V01 · S07 — 00:19,0–00:23,0 (570–690 f)

- **Texto principal:** “R$ 100” → “R$ 61,39”; label “SIMULAÇÃO · 5% AO ANO”; sub “10 ANOS”.
- **Hierarquia:** número 210/900 > sub 34/700 > label 28/800.
- **Animação:** contador 100→61,39 em 54 f; label em f=24; “61,39” vira amarelo por crossfade de 8 f após f=60; sem flicker.
- **Easing/spring:** `SPRING.soft` (d26, s60), `durationInFrames: 54`; label linear 8 f.
- **Tamanho e peso:** 210 px / 900 / -0,06em; sub 34 px / 700; label 28 px / 800 / 0,14em.
- **Cor/destaque:** número branco durante a contagem; “61,39” amarelo após settle; label `#A3A3A3`; “5% AO ANO” branco.
- **Camadas/parallax:** ticker 20%; grid 3%; prato; número; label.
- **Câmera simulada:** push-in 1,0→1,04 em 120 f, origem 50% 55%.
- **Transição de entrada/saída:** cut in; saída 6 f fade para o split.
- **Safe zone:** número y 760–1040; label y 1120; sem CTA.
- **Risco de legibilidade:** 6 glifos a 210 px (~900 px); decimal instável; ticker atrás. Mitigação: 210 px, `tabular-nums`, scrim, ticker off.

### V04 · S01 — 00:00–00:01,5 (0–45 f)

- **Texto principal:** “R$ 100”; “QUANTO ISSO COMPRA?” em f=18.
- **Hierarquia:** número 260/900 > pergunta 54/800 > timer 4 px.
- **Animação:** número punch 1,12→1 em 5 f; pergunta em máscara de 8 f; timer rail preenche linear em 900 f.
- **Easing/spring:** `SPRING.impact` (d13, s190); pergunta `SPRING.soft` (d24, s110); timer linear.
- **Tamanho e peso:** 260 px / 900 / -0,06em; pergunta 54 px / 800 / -0,02em; timer 4 px.
- **Cor/destaque:** “R$” amarelo, “100” branco; pergunta branca; trilho do timer branco 12%, fill amarelo.
- **Camadas/parallax:** glow 6%; número; pergunta; rail no topo.
- **Câmera simulada:** 1,0→1,05 em 45 f.
- **Transição de entrada/saída:** hard cut; sem fade.
- **Safe zone:** número y 640–980; pergunta y 1080; rail y 150.
- **Risco de legibilidade:** 3 elementos em 45 f; timer como número. Mitigação: rail; pergunta em f=18; ≤5 palavras.

### V04 · S04 — 00:05,0–00:07,0 (150–210 f)

- **Texto principal:** “4 DE 5”; “MESMA NOTA”; 5 rows compactas.
- **Hierarquia:** número 200/900 > rows 32/700 > label 30/800.
- **Animação:** rows entram em stagger de 3 f; preços +25% em 24 f; row 5 sai com blur 6 px + opacity 0 em 12 f; número em f=42 com impact.
- **Easing/spring:** rows `SPRING.enter` (d20, s140); número `SPRING.impact` (d14, s180); remoção linear.
- **Tamanho e peso:** 200 px / 900; rows 32 px / 700; label 30 px / 800.
- **Cor/destaque:** número amarelo; rows branco/muted; row removida 20%.
- **Camadas/parallax:** rows a 55%; scrim; número.
- **Câmera simulada:** estática.
- **Transição de entrada/saída:** cut in; cut out 4 f.
- **Safe zone:** número y 520–760; rows y 820–1300; label y 1360.
- **Risco de legibilidade:** 5 rows + número. Mitigação: rows a 25% + blur 2 px; número em scrim.

### V09 · S01 — 00:00–00:02,5 (0–75 f)

- **Texto principal:** “UM IMPOSTO / QUE NINGUÉM / VOTOU”; eyebrow “O CUSTO INVISÍVEL”.
- **Hierarquia:** headline 96/900 > eyebrow 30/800 > rule 6 px.
- **Animação:** máscara por linha, 8 f, stagger 6 f; underline de “VOTOU” em 12 f no f=36; light sweep 18 f no f=12, 6%.
- **Easing/spring:** máscara `SPRING.soft` (d24, s90); underline `SPRING.mech` (d30, s70); sweep linear.
- **Tamanho e peso:** 96 px / 900 / -0,055em / 0,98; eyebrow 30 px / 800 / 0,18em.
- **Cor/destaque:** headline branca; underline amarela; eyebrow `#A3A3A3`; rule amarela.
- **Camadas/parallax:** receipt ghost 4%; grain 3%; sweep 6%; texto.
- **Câmera simulada:** push-in 1,0→1,03 em 75 f.
- **Transição de entrada/saída:** fade-in 4 f do preto; fade-out 8 f para o recibo.
- **Safe zone:** headline x 90–990, y 620–1180; eyebrow y 520; rule y 560.
- **Risco de legibilidade:** sweep sobre texto; 3 linhas longas. Mitigação: sweep atrás; 96 px; medir “NINGUÉM”.

### V09 · S09 — 00:34,0–00:40,0 (1020–1200 f)

- **Texto principal:** logo “Invest Fácil”; tagline “Entenda o dinheiro. Depois, o mercado.”; CTA “Conheça a plataforma”.
- **Hierarquia:** logo 62/900 > CTA 34/800 > tagline 24/500.
- **Animação:** mark 0,55→1 e rotação -8°→0 em 18 f; linha 0→130 px em 14 f; tagline em 12 f; CTA em f=1120 com rise de 10 f; hold 30 f; fade final 10 f.
- **Easing/spring:** logo `SPRING.enter` (d16, s95); linha `SPRING.mech`; CTA `SPRING.soft`.
- **Tamanho e peso:** logo 62 px / 900; CTA 34 px / 800; tagline 24 px / 500.
- **Cor/destaque:** logo branco + “Fácil” amarelo; tagline `#A3A3A3`; CTA amarelo em pill.
- **Camadas/parallax:** fundo preto; grid off; apenas logo/CTA.
- **Câmera simulada:** pull-out 1,02→1,0 em 180 f; sem shake.
- **Transição de entrada/saída:** logo reveal; fade final.
- **Safe zone:** logo y 760–980; tagline y 1020; CTA baseline ≤1710 (bottom 210); legal ≤1800.
- **Risco de legibilidade:** CTA e logo competindo; 6 s longo. Mitigação: logo primeiro, CTA depois; um único movimento por vez.

---

## 13. Comportamento em 1080×1920 e em telas menores

O master é 1080×1920. Na reprodução vertical típica, a largura de exibição fica próxima de 360–430 CSS px — fator de redução de ~1/2,5 a 1/3. Projetar para 1/3, não para 1080.

### 13.1 Escala tipográfica

> **Rodada 2:** os pisos desta tabela foram substituídos por **34 px labels / 44 px corpo** (ver seção final). A coluna “~1/3” continua válida como referência de leitura.

| Token | Design px | Peso | Uso | ~1/3 no celular | Piso? |
|---|---:|---:|---|---:|---|
| HERO | 200–260 | 900 | número-herói | 67–87 px | Sim |
| H1 | 96–140 | 900 | manchete | 32–47 px | Sim |
| H2 | 64–88 | 800 | frase de apoio | 21–29 px | Sim |
| BODY | 44–56 | 600–700 | explicação | 15–19 px | Sim |
| LABEL | 30–34 | 800 | eyebrow/label | 10–11 px | Sim |
| LEGAL | 30–32 | 500 | disclaimer | 10–11 px | Mínimo absoluto |
| DECOR | 15–24 | 500–700 | rodapé técnico/textura | 5–8 px | Não informativo |

**Correção importante:** o antigo piso de “15 px” é piso **técnico**, não piso de leitura. Em 1080×1920, 15 px vira ~5 px CSS no celular. Para texto que o espectador precisa ler, o piso é **34 px**; para corpo, **44 px**. Os 15–17 px do HI01 só podem sobreviver como elemento decorativo.

### 13.2 Safe zones

> **Rodada 2:** os valores desta tabela foram substituídos por **78 px lateral / 120 px à direita (TikTok) / 220 px no rodapé**; CTA e legal com baseline ≤1700.

| Zona | Coordenada | Regra |
|---|---|---|
| Lateral | x 78–1002 | 924 px de conteúdo |
| Abaixo de y=900 | x 78–940 | margem direita 140 px para o rail de UI |
| Topo | y ≥150 | status/back |
| CTA | baseline ≤1710 | 210 px do rodapé |
| Legal | baseline ≤1800 | 120 px do rodapé |
| Leitura | y 260–1500 | narrativa |
| Rodapé técnico | y 1800–1860 | apenas decorativo |

**Nunca** colocar texto informativo em x<78, x>1002, y<150 ou y>1800. Abaixo de y=900, usar 940 como limite direito.

### 13.3 Contraste

- Amarelo `#FACC15` sobre `#050505`: contraste alto; usar para 1 destaque.
- `#A3A3A3` sobre `#050505`: ok para corpo/label.
- `#525252` sobre `#050505`: ~2,4:1; **só decorativo**, nunca informativo.
- Amarelo sobre branco: proibido.
- Texto sobre flash: flash ≤5% e ≤2 f; nunca segurar texto durante o flash.

---

## 14. O que não animar

1. **Disclaimer e selo de simulação:** estáticos; no máximo fade de 6 f.
2. **Grade/eixos do gráfico:** entram uma vez; sem deriva contínua.
3. **Wordmark/logo:** sem bounce, rotação ou overshoot >4%; só máscara, opacidade e linha.
4. **Corpo de texto:** sem stagger por palavra; uma revelação por bloco.
5. **CTA:** uma entrada; sem loop de pulse.
6. **Números após o settle:** parar em 18–24 f; sem contagem perpétua.
7. **Elemento amarelo:** sem pulse; o amarelo é destaque, não decoração.
8. **Grão de fundo:** sem zoom; posição estática ou passo de 1 px.
9. **Chrome de plataforma:** sem status bar, bateria ou “9:41” falsos.
10. **A nota encolhendo:** proibido enquanto a mensagem for “o número não muda” (V03/V10).
11. **Texto refletido legível:** proibido.
12. **Mais de um movimento em amplitude máxima:** proibido pela regra do único movimento.

---

## 15. Testes de still e contact sheet

### 15.1 Stills obrigatórios

| Teste | O que verifica | Critério |
|---|---|---|
| Frame 0 | Capa | Herói legível, opacidade cheia, sem blur de entrada |
| Frame de cada virada | Colisão | 1 informação principal; 2 blocos de texto no máx. |
| Frame de saída | Ghosting | Sem dupla exposição de 12 f do `SceneShell` |
| String “ÇÃO gpqj ÀÉÎÕÜ” em `mask` | Descendentes | Nenhum corte visível |
| 25% (270×480) | Legibilidade mobile | Herói identificável; labels não viram ruído |
| 50% (540×960) | Leitura intermediária | Corpo legível |
| Yellow count | Disciplina de cor | ≤1 texto + 1 grafismo amarelo |
| Bounding boxes | Sobreposição | Nenhum overlap entre texto e texto/imagem informativa |
| Hash duplicado | Determinismo | Mesmo frame, mesmo PNG |
| Strip de 1 f na transição | Smear | Nenhum texto meio-borrado em frame de leitura |

### 15.2 Amostragem mínima por variante

| Variante | Frames para still/contact sheet |
|---|---|
| V01 | 0, 72, 150, 240, 360, 450, 570, 690, 780, 870, 1019 |
| V02 | 0, 60, 135, 240, 360, 480, 600, 750, 930, 1080, 1349 |
| V03 | 0, 60, 120, 210, 330, 450, 570, 690, 810, 930, 1049 |
| V04 | 0, 45, 90, 150, 210, 270, 360, 450, 540, 630, 720, 810, 899 |
| V05 | 0, 75, 150, 270, 390, 540, 690, 900, 1050, 1199 |
| V06 | 0, 60, 150, 240, 330, 450, 570, 720, 840, 960, 1139 |
| V07 | 0, 60, 180, 330, 480, 660, 810, 960, 1110, 1259 |
| V08 | 0, 60, 150, 270, 390, 510, 660, 780, 900, 1019 |
| V09 | 0, 75, 180, 300, 420, 570, 720, 870, 1020, 1199 |
| V10 | 0, 75, 180, 300, 420, 540, 690, 840, 990, 1140, 1349 |

### 15.3 Comandos de referência

```bash
# still de frame específico (quando as composições existirem)
npx remotion still src/index.ts V01 out/stills/v01-f0000.png --frame=0

# contact sheet de 1 fps, 5 colunas
ffmpeg -i out/v01.mp4 -vf "fps=1,scale=270:-1,tile=5x6" -frames:v 1 out/v01-contact.png
```

**Não executar agora.** Gate 3 é planejamento; render é Gate 4.

---

## 16. Conclusão

1. **Top 3 no eixo motion:** V01 (27/30), V04 (26/30), V09 (26/30). V06 (25/30) é o primeiro suplente.
2. **Mais fraco neste eixo:** V02 (19/30). A história é forte; a execução “cinematic” com vetores/CSS é o custo. Não é veto.
3. **O conjunto é viável**, mas não com o código atual sem extração: `SCENES`, `START=282`, `DURATION=1200` e frames absolutos são dívida técnica que contamina os 10 vídeos.
4. **A tipografia é o risco mais subestimado.** 15–17 px do HI01 não são legíveis no celular. O piso de leitura é 34 px; corpo 44 px.
5. **O motion precisa ser disciplinado:** um movimento dominante por janela de 12 f, um amarelo por frame, nenhum texto sobre textura sem scrim.
6. **V03 e V10 precisavam de correção semântica antes de animar:** não encolher a nota se a mensagem é “o número não muda”. **Resolvido na Rodada 2; ver seção final.**
7. **Nenhuma aprovação humana foi concedida ou declarada.** As notas são autoavaliação editorial e não substituem a decisão do usuário.

### Candidatos a MEMORY (não gravados neste gate)

- **Piso tipográfico em 1080×1920:** 15 px é piso técnico; leitura exige ≥34 px e corpo ≥44 px (fator ~1/3 no celular).
- **`KineticText` mask:** `line-height` <1,04 + `overflow:hidden` corta descendentes; usar padding/margin de 0,14em.
- **`tracking`:** animar `letterSpacing` em frases causa reflow; restringir a ≤14 caracteres.
- **Motion semântico:** não encolher o objeto cujo valor deve permanecer constante; encolher o que ele compra.
- **Cortes secos:** `SceneShell` com fade de 12 f suaviza todo corte; usar `exitFrames: 0` quando o corte é intencional.

**Fim da Rodada 1.**

---

## Rodada 2 — revisão após correções

**Fonte:** `reports/GATE3_V2_CHANGELOG.md` (21/11/2026)
**Status:** revisão documental; nenhum vídeo renderizado; nenhum código alterado; **nenhuma aprovação humana declarada**.

### 1. Confirmação das mudanças em V03 e V10

| Variante | Correção prometida | Evidência nos documentos regenerados | Veredito |
|---|---|---|---|
| **V03** | A nota não encolhe; a cesta/o que ela compra encolhe. | `V03/CONCEPT.md`: “a nota passa intacta e a cesta encolhe”; `V03/STORYBOARD.md` S02: “Cesta menor sai na esteira; a nota segue intacta”; S05: “número 100 intacto”; S08: “Nota intacta sobre mesa; nada rasgado”. | **Confirmado no conceito e no storyboard.** A metáfora agora está alinhada ao encerramento “A inflação não rasga o dinheiro. Ela diminui o que ele compra.” |
| **V10** | A nota não encolhe; o reflexo da cesta encolhe. | `V10/CONCEPT.md`: “o reflexo do que ela compra encolhe; a nota permanece”; `V10/STORYBOARD.md` S02: “O reflexo da cesta encolhe; a nota permanece inteira”; S09: “Nota intacta; espelho vazio”. | **Confirmado no conceito e no storyboard.** O reflexo passou a representar poder de compra, não o dinheiro. |

**Resíduos que impedem declarar a correção encerrada:**

1. **V03 — 3/5 vs 4/5.** O `STORYBOARD.md` S09 diz “Cesta com 3 de 5 itens; selo 3/5”, coerente com ~61. A `EDITING_TIMELINE.md`, no bloco 26,2–28,3, ainda diz “Cesta 4/5”. É uma inconsistência factual entre documentos; o implementador não sabe qual desenhar. **Corrigir para 3/5** ou rotular explicitamente que 4/5 é o cenário de +25% e 3/5 é o de 5% ao ano.
2. **V10 — 4/5 vs 61.** O `STORYBOARD.md` S07 mostra “Cesta 4/5 no espelho” e S08 mostra “Gráfico 100 → 61”. 4/5 corresponde a preços +25%; 61 corresponde a 5% ao ano por 10 anos. São duas simulações diferentes no mesmo arco. **Rotular cada uma** (“+25% → 4/5”; “5% ao ano → 61”) ou escolher uma única.
3. **V10 S06 — “Nota vira linha”.** A correção da nota está confirmada, mas o morph “nota vira linha” pode dissolver o “100” e reabrir a leitura de que o dinheiro sumiu. Usar **match cut na borda da nota → linha amarela**, não morph contínuo; manter o “100” legível até o corte.
4. **V03 — “a nota vira linha” nas transições.** Mesmo cuidado: se a nota se transformar em linha, o “100” distorce. Preferir match cut; a linha representa poder de compra, não a nota.

### 2. Revisão das notas

Só foram alteradas as notas em que o changelog muda o julgamento. As demais permanecem como na Rodada 1.

| Variante | Visual | Tipografia | Remotion | Total | Delta | Justificativa (1 linha) |
|---|---:|---:|---:|---:|---:|---|
| **V03** | 8 → 8 | 7 → 7 | **6 → 7** | **21 → 22** | +1 | A contradição semântica foi resolvida (nota intacta, cesta encolhe; 3/5 coerente com 61), mas a inconsistência 3/5 vs 4/5 e o craft da máquina mantêm o teto. |
| **V10** | 9 → 9 | 8 → 8 | **6 → 7** | **23 → 24** | +1 | A nota não encolhe e o reflexo da cesta encolhe; 39 s reduzem a exposição, mas espelho/morph e o 4/5 vs 61 continuam abertos. |
| **V02** | 7 → 7 | 7 → 7 | **5 → 6** | **19 → 20** | +1 | O cold open e os 42 s reduzem o dead time; o custo “cinematic com vetores/CSS” permanece e ainda é o maior da coleção. |

**Sem alteração:** V01 (27), V04 (26), V05 (23), V06 (25), V07 (23), V08 (24), V09 (26). O changelog muda duração, CTA e clareza, mas não muda o julgamento de potencial visual, tipografia cinética ou viabilidade Remotion dessas variantes.

**Ranking revisado:**

| Rank | Variante | Total | Duração | Frames |
|---:|---|---:|---:|---:|
| 1 | V01 — O ticker não para | 27 | 33 s | 990 f |
| 2 | V04 — R$ 100 em 30 segundos | 26 | 30 s | 900 f |
| 3 | V09 — O imposto invisível | 26 | 37 s | 1110 f |
| 4 | V06 — Não é impressão | 25 | 37 s | 1110 f |
| 5 | V08 — Papo de mercado | 24 | 41 s | 1230 f |
| 6 | V10 — O espelho do dinheiro | 24 | 39 s | 1170 f |
| 7 | V05 — Uma nota sobre a mesa | 23 | 36 s | 1080 f |
| 8 | V07 — A linha que explica seu bolso | 23 | 40 s | 1200 f |
| 9 | V03 — A máquina de encolher dinheiro | 22 | 33 s | 990 f |
| 10 | V02 — O café de sempre | 20 | 42 s | 1260 f |

**Desempates:** V04 antes de V09 por viabilidade (9 vs 8); V08 antes de V10 por viabilidade (9 vs 7); V05 antes de V07 por viabilidade e clareza de composição (8 vs 8; tipo 7 vs 7; V05 tem menos risco de colisão).

### 3. Confirmação das regras globais

As quatro regras pedidas estão confirmadas nos 10 storyboards e passam a substituir as recomendações da Rodada 1.

| Regra | Status | Implicação prática |
|---|---|---|
| **34 px labels / 44 px corpo** | **Confirmado** em V01–V10 | Substitui o piso antigo de 15–17 px e a minha faixa de 30–34 px para labels. Label = 34 px; corpo = 44 px; disclaimer entra como label (34 px, no máximo 2 linhas). Nada informativo abaixo de 34 px. |
| **`line-height` ≥ 1,08** | **Confirmado** em V01–V10 | Substitui minha recomendação anterior de 1,04. Em `mask`, usar 1,08 + `paddingBottom: 0.14em` / `marginBottom: -0.14em`; testar “ÇÃO gpqj ÀÉÎÕÜ”. |
| **No máximo 2 elementos concorrentes por frame** | **Confirmado** em V01–V10 | Não é “2 blocos de texto”: é número + label, por exemplo. O terceiro elemento entra depois. Em split, cada painel tem no máximo 1 elemento textual; o outro painel é visual. Ticker/gráfico só conta como textura se ficar fora do bbox do herói; se entrar no bbox, vira terceiro elemento. |
| **Sem texto no seam nem no reflexo** | **Confirmado** em V01–V10 | Revoga minha exceção anterior de texto refletido a 0,12 de opacidade com blur. **Nenhum texto** — legível ou não — no reflexo. O seam do split vertical fica em y≈960; manter 120 px de respiro acima e abaixo; nenhum texto sobre a linha. |

**Regras adicionais que afetam motion:**

| Regra | Status | Implicação |
|---|---|---|
| Safe zone 78 px lateral / 120 px à direita (TikTok) / 220 px no rodapé | Confirmado | Substitui 140 px à direita e 210 px no rodapé da Rodada 1. CTA e disclaimer com baseline ≤1700; 120 px é mínimo, 140 px continua preferível quando o layout permitir. |
| Split vertical: topo/base, não lado a lado em 9:16 | Confirmado | Afeta V01 S03/S08, V05 S08, V06 S02–S05/S08, V07 S06, V08 S04/S07 e V10 S03. O seam passa a ser horizontal; a comparação é vertical, com 120 px de respiro. |
| Nenhum CTA para plataforma/link inexistente | Confirmado | V05 (“Salve para consultar…”) e V09 (“Siga o Invest Fácil…”) corrigidos. V04 ainda tem dois CTAs; V01/V09 ainda aparecem abreviados como “SIGA” no storyboard/timeline. |
| Simulações sempre rotuladas | Confirmado | V03, V04, V07, V08, V10 na tela; V01 na narração (“Simulação: 5% ao ano”). Manter o selo visível enquanto o número estiver em cena. |

### 4. Must-fixes: resolvidos e pendentes

#### 4.1 Resolvidos no documento

| ID | Status | Evidência |
|---|---|---|
| **P0-10** — movimento contradiz a mensagem (V03/V10) | **Resolvido no conceito/storyboard** | V03: nota intacta, cesta encolhe; V10: nota intacta, reflexo da cesta encolhe. |
| **P0-02** — piso tipográfico | **Resolvido nos 10 storyboards** | “34 px labels / 44 px corpo” em todos. |
| **P0-03** — descendentes em `mask` | **Resolvido na regra documental** | `line-height` ≥1,08; “não usar overflow:hidden que corte descendentes”. |
| **P0-11** — texto em reflexo | **Resolvido na regra documental** | “Não colocar texto no seam de split-screen nem em reflexo.” |
| **P0-09** — safe zone | **Resolvido nos 10 storyboards** | 78/120/220 px; CTA e legal ≤1700. |
| **V02** — contradição “não foi o café” | **Resolvido** | Payoff: “O café continua o mesmo. O preço, não.” |
| **V05** — CTA para plataforma inexistente | **Resolvido** | “Salve para consultar quando o preço mudar.” |
| **V09** — “imposto” literal | **Resolvido** | “Não é imposto literal. É inflação.” entra aos 5 s. |
| **V04** — payoff duplicado | **Resolvido** | O split repetido de 21–24 s saiu; ficou “A pergunta é a mesma” uma vez. |

#### 4.2 Parciais / a reconciliar antes do Gate 4

| Item | Problema | Ação |
|---|---|---|
| **V03 — 3/5 vs 4/5** | Storyboard S09: 3/5; timeline 26,2–28,3: 4/5. | Escolher 3/5 (coerente com 61) ou rotular 4/5 como cenário +25%. |
| **V10 — 4/5 vs 61** | S07: 4/5; S08: 61. São cenários diferentes. | Rotular “+25% → 4/5” e “5% ao ano → 61”, ou escolher um. |
| **V04 — dois CTAs** | Conceito: só “Comente…”; storyboard S10: “COMENTE / SIGA”; timeline 26,8–27,9: “SIGA”. | Remover o segundo CTA ou rebaixá-lo a linha secundária de 34 px; um CTA primário. |
| **V01 — CTA abreviado** | Conceito: “Siga para entender a inflação no próximo vídeo”; storyboard/timeline: “SIGA”. | Garantir a frase completa no end card, com “SIGA” como palavra-herói e o restante em 44 px. |
| **V09 — CTA fundido ao logo** | Timeline 32,3–36,1: “INVEST FÁCIL · SIGA”; conceito pede “Siga o Invest Fácil para entender o dinheiro.” | Separar logo (31,5–34,0) e CTA (34,0–36,3); não deixar o CTA só como “SIGA”. |
| **V04 — timing** | Storyboard S04 5,0–7,0 / S05 7,0–9,0; timeline 5,1–9,9 / 10,1–14,1. | Usar a timeline como fonte de timing e atualizar o storyboard; não implementar as duas. |
| **V03/V10 — timing** | Storyboard e timeline divergem em 1–3 s em vários blocos (ex.: V10 S06 15,6–19,9 vs timeline 18,4–21,4). | Congelar a timeline como fonte de verdade; o storyboard é composição, não frame-lock. |
| **V06 — INFLAÇÃO no seam** | Storyboard S05: “no encontro dos dois lados”; com split vertical, o encontro é o seam horizontal. | Colocar a palavra acima ou abaixo do seam, nunca sobre ele; painéis colapsam antes. |
| **V01 — ticker como terceiro elemento** | S01 tem número + eyebrow + ticker. | Ticker só fora do bbox do herói e ≤0,35; se entrar no bbox, desligar durante a leitura. |
| **V07 — chart labels/portrait** | Regra global 34 px; chart ainda sem spec portrait. | Chart vertical, labels ≥34 px, `pathLength={1}`, três estados. |
| **V04 — timer** | Changelog diz que o cronômetro não é mais promessa abandonada, mas não especifica rail. | Timer em rail de 4 px; nunca número competindo com “R$ 100”. |
| **V04 — frame 0** | Storyboard S01 mantém “Punch-in; blur curto”. | f0 nítido; blur a partir de f1; pré-roll 6 f. |

#### 4.3 Continuam no código (nenhum changelog de documento resolve)

| ID | Status | Evidência | Correção |
|---|---|---|---|
| **P0-01** — dívida do HI01 | **Aberto** | `constants.ts`: `SCENES`, `DURATION=1200`; `ProductBasket.tsx`: `START=282`, `frame >= START+74`; `BackgroundEffects.tsx`: `interpolate(frame,[0,1200])`; `ImpactScene` com `Sequence` absolutos. | Extrair `video/src/shared/` com props `start`/`duration`; frame local dentro de `Sequence`; nenhum frame absoluto de HI01. **É o bloqueio técnico número 1.** |
| **P0-04** — `KineticText` tracking/word | **Aberto** | `letterSpacing` 0,28em→0,015em no bloco; 3 f por palavra. | `tracking` só ≤14 caracteres; `stagger` 1–2 f ou grupos; revelação total ≤18 f. |
| **P0-05** — scrim | **Aberto** | Nenhum componente `Scrim`; regra documental existe, código não. | Prato opaco/gradiente ≥85% atrás do herói; ticker ≤0,35. |
| **P0-06** — orçamento de amarelo | **Aberto** | Changelog não fixa 1 amarelo por frame. | Máx. 1 texto amarelo + 1 grafismo; ticker nunca amarelo. |
| **P0-07** — frame 0 | **Aberto** | V04/V06 ainda descrevem blur/punch-in na abertura. | f0 nítido; pré-roll 6 f; flash ≤5% e ≤2 f. |
| **P0-08** — determinismo | **Aberto** | Ticker/partículas ainda não implementados. | PRNG com seed; mesmo frame → mesmo hash. |
| **P0-12** — performance | **Aberto** | `BackgroundEffects` full-screen grain/blend; `ImpactScene` blur 980×780. | ≤2 blurs animados/frame; sweeps pré-renderizados; sem blur full-screen. |
| **P0-13** — chart portrait/path | **Aberto** | `FinancialChart` 16:9, `pathLength=1200`, labels 15/16. | Portrait, `pathLength={1}`, labels ≥34, três estados. |
| **P1-01…P1-12** | **Aberto** | `marginRight` no `KineticText`, `Math.sin` no `CameraMovement`, fade de 12 f no `SceneShell`, rodapé 90/15 no `OutroScene`, etc. | Aplicar a lista P1 da Rodada 1; nenhum item foi alterado. |
| **Código vs docs** | **Aberto** | Docs dizem 34/44 e 220 px; `OutroScene` ainda tem 15 px e `bottom:90`. | Atualizar o código para a regra documental, não o contrário. |

### 5. Top 3 revisado

| Rank | Variante | Total | Duração | Frames | Situação | Condição para produzir |
|---:|---|---:|---:|---:|---|---|
| 1 | **V01 — O ticker não para** | 27 | 33 s | 990 f | **Mantido** | Ticker fora do bbox do herói; máx. 2 elementos; CTA completo no end card; 4 f de pausa nos números-chave. |
| 2 | **V04 — R$ 100 em 30 segundos** | 26 | 30 s | 900 f | **Mantido** | Remover o segundo CTA; timer em rail; reconciliar S04/S05 com a timeline; f0 nítido. |
| 3 | **V09 — O imposto invisível** | 26 | 37 s | 1110 f | **Mantido** | CTA explícito em 34–36 s; uma fonte de luz; headline em 3 linhas; recibo abstrato. |
| 4 | V06 — Não é impressão | 25 | 37 s | 1110 f | Primeiro suplente | Split vertical topo/base; INFLAÇÃO fora do seam; nada de texto espelhado. |
| 5 | V08 — Papo de mercado | 24 | 41 s | 1230 f | — | Bolhas ≥34 px; máx. 2 bolhas; um CTA. |
| 6 | V10 — O espelho do dinheiro | 24 | 39 s | 1170 f | Subiu 1 ponto | Reflexo só de objeto; 4/5 vs 61 rotulado; morph por match cut. |
| 7 | V05 — Uma nota sobre a mesa | 23 | 36 s | 1080 f | — | Deriva contínua; linha nunca cruza texto. |
| 8 | V07 — A linha que explica seu bolso | 23 | 40 s | 1200 f | — | Chart portrait; labels ≥34; `pathLength={1}`. |
| 9 | V03 — A máquina de encolher dinheiro | 22 | 33 s | 990 f | Subiu 1 ponto | 3/5 vs 4/5 resolvido; match cut no lugar do morph. |
| 10 | V02 — O café de sempre | 20 | 42 s | 1260 f | Subiu 1 ponto | POV de objeto; micro-beats; gráfico portrait. |

**Top 3 permanece V01, V04, V09.** As correções da Rodada 2 melhoraram V03, V10 e V02, mas não o suficiente para entrar no top 3. V06 continua como primeiro suplente; V10 é o “dark horse” se o espelho for simplificado para uma única camada refletida e o 4/5 vs 61 for resolvido.

**Nenhuma aprovação humana foi concedida ou declarada.** As notas continuam sendo autoavaliação editorial no eixo motion; não são ranking final, não substituem a matriz ponderada e não autorizam produção.

**Fim da Rodada 2.**
