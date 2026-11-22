# GATE 3 — AVALIAÇÃO PRELIMINAR DE RETENÇÃO (V01–V10)

**Agente:** if-retention-specialist
**Data:** 21/11/2026
**Escopo:** leitura editorial da matriz de conceitos, dos 10 `CONCEPT.md`, dos 10 `RETENTION_MAP.md`, dos `SCRIPT.md` e `STORYBOARD.md` correspondentes.
**Status do gate:** avaliação preliminar. Nenhum vídeo produzido, renderizado ou exportado.

> **Aviso de método.** Este documento é **hipótese editorial**, não medição de audiência.
> Não há retenção real, curva, CTR, watch time ou dado de plataforma. As notas são
> autoavaliação por critérios declarados e servem para comparar e corrigir roteiros antes
> da produção. Onde há número, ele vem de contagem manual do roteiro — é observação
> técnica, não comportamento de público.
>
> **Nenhuma aprovação humana está sendo declarada.** A escolha de finalistas e de
> vencedor pertence ao usuário.

> **Documento em duas rodadas.** As seções 1–10 registram a leitura da v1, mantida como
> histórico. A **seção 11** é a revisão após as correções de timing (v2) e **substitui**
> o placar e o top 3 anteriores.

---

## 1. Sumário executivo

1. O conjunto tem **boa variedade estrutural** (10 arquétipos realmente distintos), mas **baixa variedade de carga semântica**: 7 de 10 contêm, no fechamento, a mesma formulação ("o número não mudou; o poder de compra, sim") e todos usam o mesmo 61,39.
2. O **pico de densidade de narração coincide com o pico de expectativa** em 8 de 10 roteiros: a frase de simulação tem 18–21 palavras e cai entre 47% e 75% do runtime.
3. Em média, **38% do vídeo acontece depois do número que justifica o hook** (mediana 33%; V04: 70%; V07: 48%). É a maior fonte estrutural de abandono tardio.
4. O **CTA ocupa 13,1% do runtime em média**, com um caso de CTA duplo e pergunta já respondida (V04).
5. Os `RETENTION_MAP.md` atuais são **genéricos e, em 5 variantes, estão dessincronizados do roteiro**. Eles listam risco, mas a correção raramente nomeia o evento visual/sonoro — o que os torna pouco acionáveis em produção.
6. Melhores potenciais de retenção: **V01, V06 e V08**. Melhor hook isolado: **V09**. Melhor payoff isolado: **V02**.

---

## 2. Placar preliminar

Escala: retenção 0–20; hook 0–10; payoff 0–10. Notas em incrementos de 0,5.

| # | ID | Título | Retenção /20 | Hook /10 | Payoff /10 | Ranking retenção | Veredito editorial |
|---:|---|---|---:|---:|---:|---:|---|
| 1 | V01 | O ticker não para | **15,5** | 8,0 | 7,5 | 1º | Apta com cortes |
| 2 | V06 | Não é impressão | **15,0** | 9,0 | 7,5 | 2º | Apta com corte de repetição |
| 3 | V08 | Papo de mercado | **14,5** | 8,0 | 7,0 | 3º | Apta com reescrita de payoff |
| 4 | V02 | O café de sempre | **14,0** | 6,5 | **8,5** | 4º | Apta com reposicionamento do hook |
| 5 | V09 | O imposto invisível | **14,0** | **9,5** | 5,5 | 5º | Em risco: payoff virou assinatura |
| 6 | V03 | A máquina de encolher dinheiro | **13,5** | 7,5 | 7,5 | 6º | Apta com reordenação |
| 7 | V10 | O espelho do dinheiro | **13,0** | 8,5 | 8,0 | 7º | Apta com poda de 8 s |
| 8 | V04 | R$ 100 em 30 segundos | **12,5** | 7,0 | 6,0 | 8º | Apta com supressão de repetição |
| 9 | V07 | A linha que explica seu bolso | **11,5** | 6,5 | 5,5 | 9º | Requer novo hook e novo payoff |
| 10 | V05 | Uma nota sobre a mesa | **11,0** | 5,0 | 7,0 | 10º | Requer novo hook e 1 interrupt |

**Regra de desempate usada:** maior hook; persistindo, maior payoff.
V02 e V09 empatam em 14,0 → V02 fica à frente pelo payoff (8,5 × 5,5).

**Como usar no `SCORING_TEMPLATE.md`:** a coluna "Retenção" (peso 20) recebe a nota /20; "Hook" (peso 15) recebe a nota /10. Payoff não tem peso próprio — entra como justificativa e como critério de desempate.

---

## 3. Base técnica observada (o que é fato do roteiro)

Contagem manual da coluna de narração, com números falados expandidos
("R$ 100" = "cem reais"; "5%" = "cinco por cento"). Margem estimada: ±3 palavras.
Não é medição de áudio; o TTS ainda não foi gerado.

| ID | Duração-alvo | Palavras faladas (aprox.) | Densidade (palavras/s) | Corte médio | Frase de simulação | Fim do número | Cauda pós-número | CTA |
|---|---:|---:|---:|---:|---|---:|---:|---:|
| V01 | 34 s | 106 | 3,12 | 1,2–1,8 s | 21 palavras (19–23 s) | 23 s | 11 s (32%) | 5 s (14,7%) |
| V02 | 45 s | 102 | 2,27 | 2,0–3,0 s | 18 palavras (25–31 s) | 31 s | 14 s (31%) | 5 s (11,1%) |
| V03 | 35 s | 71 | 2,03 | 1,5–2,5 s | 21 palavras (19–23 s) | 23 s | 12 s (34%) | 4 s (11,4%) |
| V04 | 30 s | 94 | **3,13** | **0,8–1,8 s** | 13 palavras (7–9 s) | 9 s | **21 s (70%)** | **6 s (20%)** |
| V05 | 40 s | 71 | **1,78** | **2,5–4,0 s** | 18 palavras (23–30 s) | 30 s | 10 s (25%) | 5 s (12,5%) |
| V06 | 38 s | 66 | 1,74 | 1,8–2,5 s | 18 palavras (19–24 s) | 24 s | 14 s (37%) | 6 s (15,8%) |
| V07 | 42 s | 69 | 1,64 | 2,0–3,0 s | 10 palavras (16–22 s) | 22 s | **20 s (48%)** | 5 s (11,9%) |
| V08 | 34 s | 74 | 2,18 | 1,8–2,5 s | 18 palavras (17–22 s) | 22 s | 12 s (35%) | 4 s (11,8%) |
| V09 | 40 s | 74 | 1,85 | 1,8–2,8 s | 18 palavras (19–24 s) | 24 s | 16 s (40%) | 6 s (15,0%) |
| V10 | 45 s | 77 | 1,71 | 1,8–3,0 s | 18 palavras (28–33 s) | 33 s | 12 s (27%) | 3 s (6,7%) |

**Referência interna:** o High Impact 01 narrou 49 palavras em 18,69 s = **2,62 palavras/s**
(`docs/EDITORIAL_REVIEW_PACKAGE.md`). V01 e V04 estão ~19% acima dessa referência; V07 (1,64)
e V10 (1,71) ficam 35–37% abaixo.

Observações que sustentam a nota:

- **V04 é o extremo de compressão:** maior densidade + menor intervalo de corte + nenhuma pausa.
  Compreensão e ritmo entram em conflito.
- **V05, V07 e V10 são o extremo oposto:** 1,64–1,78 palavras/s com planos de 2,0–4,0 s.
  Em feed frio, isso é lido como lentidão antes de ser lido como sofisticação.
- **A frase de simulação é o maior gargalo de locução do conjunto.** Em 8 de 10 ela tem
  18–21 palavras e concentra três informações abstratas (taxa, prazo, resultado) no
  exato segundo em que o espectador espera a recompensa.
- **V04 introduz um cronômetro em 0–1,5 s que nunca é resolvido.** Abre um loop visual
  e o abandona — pior que não prometer.
- **V02 promete, na matriz, "até o dia em que o dinheiro não deu", mas essa frase só é
  falada em 12,0 s** (27% do vídeo). O hook anunciado não é o hook executado.

---

## 4. Auditoria dos 10 `RETENTION_MAP.md` existentes

Os mapas atuais são um bom esqueleto, mas ainda não são ferramenta de produção. Defeitos sistêmicos:

| Defeito | Evidência | Consequência |
|---|---|---|
| **Correções genéricas** | "Mudar estímulo visual", "Uma frase", "Acelerar e fechar", "Frase curta" aparecem em quase todos | O editor não sabe o que fazer naquele segundo |
| **Blocos colapsados** | V02 trata 31–45 s (14 s) como uma linha; V05 trata 30–40 s (10 s) como uma linha | Metade do vídeo sem análise de risco |
| **Mapa x roteiro dessincronizados** | V04 prevê pergunta em 12–18 s que o roteiro não tem; V10 marca "nomear" em 10–18 s enquanto o roteiro nomeia em 18 s; V06 propõe fechar em 30 s com roteiro de 38 s; V02 e V09 divergem na função do último bloco | O mapa deixa de descrever o vídeo que será animado |
| **Risco sem dono** | Nenhum mapa indica qual agente resolve o risco (roteiro, edição, som, motion) | Correção não entra no fluxo |
| **Boilerplate repetido** | As 5 linhas de "Leitura editorial" são idênticas nos 10 arquivos | Não há leitura específica da variante |
| **Sem critério de aceite** | Nenhuma correção tem métrica verificável (ex.: "≤12 palavras", "≤3 s", "1 interrupt entre 9 e 18 s") | Não dá para saber se foi corrigido |

**Recomendação:** substituir o rodapé boilerplate por 4 campos por variante —
`loop aberto`, `recompensa`, `respiro`, `critério de aceite` — e alinhar cada linha do
mapa ao timecode do `SCRIPT.md` antes de qualquer animação. As tabelas da seção 5 já
estão nesse formato e podem substituir os mapas atuais.

---

## 5. Avaliação por variante

Para cada vídeo: mapa hipotético de retenção (intervalos do roteiro real), leitura dos
primeiros segundos, loops, interrupts, micro-recompensas, respiro, payoff e replay.
**Toda a coluna "risco" é hipótese; a coluna "estímulo" descreve o que está escrito no
roteiro/storyboard.** Correções marcadas como "(proposta)" são sugestão editorial, não
decisão.

---

### V01 — O ticker não para
**34 s · cortes 1,2–1,8 s · 3,12 palavras/s · 5 sistemas visuais**

| Intervalo | Objetivo | Estímulo visual/sonoro | Risco de queda | Correção proposta |
|---|---|---|---|---|
| 0–3 s | Interromper | Parede de preços + R$ 100 congelado; punch-in; impact | Três informações competindo no frame 0 (nota, ticker, "NÃO É IMPRESSÃO") | Deixar só R$ 100 + 3 palavras no frame 0; ticker entra em 0,8 s |
| 3–8 s | Criar gap | Ticker, 3 preços, ticks | Ticker pode virar ruído sem hierarquia; 14 palavras em 5 s | 1 preço por batida, 3 batidas, 2 frames de pausa entre elas |
| 8–15 s | Demonstrar | Café, pão, transporte; whoosh ×3 | Mesma intensidade nos três cortes — não há escalada | Ordem café → pão → transporte com preço em degraus; 3 cortes, não 6 |
| 15–23 s | Provar | Barra 100→61 + contador + frase de 21 palavras | Saturação: a barra e a frase disputam o mesmo eixo | Barra resolve em 2,5 s; respiro de 0,8 s; frase dividida em duas |
| 23–29 s | Payoff | Split nota/cesta; impact | Payoff + ponte de marca sem informação nova | Cortar 26–29 (ganho 3 s); payoff em 23–26 |
| 29–34 s | CTA | End card; brand sting | 5 s = 14,7% do vídeo | 3 s, uma frase |

**Primeiros segundos.** 0–1 s: "Se cem reais parece pouco…" + R$ 100 legível. 1–3 s: "não é
impressão" fecha a proposição em 2,4 s. 5 s: já há ticker e "OS PREÇOS SE MOVEM". É o hook
mais bem cronometrado do conjunto depois de V09.
**Gap:** "então o que é?" → respondido em 12 s (nome) e 19 s (número). Gap de 9 s, bem dosado.
**Interrupts:** 5 trocas de sistema (ticker → split → objetos → tipografia → barra). O melhor
inventário do conjunto.
**Micro-recompensas:** 3 produtos perdidos, barra, contador. Boa cadência até 23 s; zero depois.
**Respiro:** **inexistente.** 34 s com cortes de 1,2 s não têm uma pausa real.
**Payoff:** "O número é o mesmo. O poder de compra, não." Responde ao hook com precisão e é citável.
**Replay:** médio-alto (frase curta + número).
**Nota 15,5.** Perde por: ponte genérica em 26–29, CTA de 5 s e ausência de respiro.
**Must-fix:** cortar 26–29; dividir a frase de 19–23; respiro em 15–16.

---

### V02 — O café de sempre
**45 s · cortes 2,0–3,0 s · 2,27 palavras/s · melhor payoff do conjunto**

| Intervalo | Objetivo | Estímulo visual/sonoro | Risco de queda | Correção proposta |
|---|---|---|---|---|
| 0–3 s | Criar conexão | Xícara em close, vapor, slow push; ambiência | **O stake anunciado ("até o dia em que não deu") só chega em 12 s**; 0–3 s é setup puro | Abrir com "NÃO DEU" como texto/objeto (flashforward de 1 s) e voltar ao ritual |
| 3–8 s | Instalar rotina | Nota ao lado da xícara; troco; moeda/papel | Ritual sem conflito por 8 s | Manter, mas mostrar o primeiro troco em 4,5 s e não explicar nada |
| 8–15 s | Tensão | Time-lapse de xícaras; troco menor; relógio | Repetição de xícaras pode parecer o mesmo plano 4 vezes | 3 xícaras, não 5; 1 mudança de luz por corte |
| 15–23 s | Revelação | Pausa, silêncio, mão com a nota; piano | A definição didática entra logo após a quebra e esfria o momento | Separar: 12–16 só a quebra; 16–20 "não foi o café"; nomear inflação em 21 s |
| 23–31 s | Prova | Gráfico 100→61 atrás da xícara; frase de 18 palavras | Troca de linguagem (cinema → gráfico) no meio do arco | Gráfico atrás da xícara, sem tela cheia; dividir a frase |
| 31–45 s | Fechar | Split xícara/nota; frase; logo; CTA | **Dois fechamentos + 5 s de CTA em 14 s** | Fundir 31–40 em um só fechamento (31–38); CTA 38–41 (alvo 41 s) |

**Primeiros segundos.** 0–1 s: xícara e "TODO DIA, O MESMO CAFÉ". 1–3 s: "O mesmo pedido."
5 s: "O mesmo cem reais no bolso" — ainda instalação, sem ameaça. O espectador precisa
acreditar que algo vai quebrar; o roteiro só diz isso 12 s depois.
**Gap:** causal e forte ("o que aconteceu?"), mas aberto tarde.
**Interrupts:** match cuts de xícara/nota, mudança de luz, silêncio em 12–16. Bem motivados,
porém todos no mesmo registro (contido).
**Micro-recompensas:** troco encolhendo (visual e progressivo), número. Duas, bem espaçadas.
**Respiro:** **o melhor do conjunto** — 12–16 s, com função narrativa, a 27% do runtime.
**Payoff:** "A inflação não faz barulho. Ela aparece no troco." Concreto, ligado ao objeto,
não genérico. **Nota 8,5 — o melhor.**
**Replay:** alto (fechamento emocional).
**Nota 14,0.** O hook de 6,5 é o que mais derruba a nota: a linha mais forte do conceito está
no lugar errado. Com o flashforward em 0–1 s, a variante sobe para a faixa de 15.
**Must-fix:** reposicionar a tensão para 0–3 s; fundir os dois fechamentos.

---

### V03 — A máquina de encolher dinheiro
**35 s · cortes 1,5–2,5 s · 2,03 palavras/s · metáfora física mais forte**

| Intervalo | Objetivo | Estímulo visual/sonoro | Risco de queda | Correção proposta |
|---|---|---|---|---|
| 0–3 s | Puzzle | Nota entra na máquina; mechanical; clunk | Se o objeto não estiver legível no frame 0, a frase fica sem referente | Nota já visível no frame 0 + "ENTRA INTEIRO" |
| 3–7 s | Nomear | Engrenagens; impact; "É inflação" | **Nomeia em 4 s e fecha o puzzle antes da demonstração** | Segurar o nome até 8–9 s; em 4–7 s mostrar a máquina cobrando 5% ao ano |
| 7–15 s | Demonstrar | Itens da cesta somem; whoosh | Itens somem sem contagem — abstração | 5 itens numerados, remoção 5→4→3 com contador |
| 15–23 s | Provar | Macro na nota; split; frase de 21 palavras | 8 s com duas frases abstratas e nenhum objeto novo | Nota e cesta no mesmo plano; respiro em 15–16; dividir a frase |
| 23–31 s | Consequência | Nota intacta; cesta 4/5; impact | Payoff correto, mas sem twist | Acrescentar "a nota não encolheu. a cesta, sim." |
| 31–35 s | CTA | End card; brand | Compartilhamento genérico | 3 s com motivo explícito |

**Primeiros segundos.** 0–1 s: "O dinheiro entra inteiro" + nota. 1–3 s: máquina em movimento.
5 s: "Não é mágica. É inflação." — o vídeo entrega o nome do truque 4 s depois de propor o truque.
É o erro estrutural mais claro do conjunto: o puzzle morre cedo.
**Gap:** 4 s apenas. Curto demais para um conceito visual que depende de mistério.
**Interrupts:** morph, match cut, macro — bons, mas todos a serviço de um objeto que já foi explicado.
**Micro-recompensas:** itens sumindo + contador. Duas.
**Respiro:** nenhum especificado.
**Payoff:** "A inflação não rasga o dinheiro. Ela diminui o que ele compra." Claro e correto,
porém é explicação, não reversão. Sem gatilho de replay.
**Nota 13,5.** Sobe facilmente para 15 se o nome for adiado e a máquina ganhar uma regra causal.
**Must-fix:** adiar "inflação" para 8–9 s; dar à máquina uma regra (5% ao ano) para o 61 ser consequência, não decoração.

---

### V04 — R$ 100 em 30 segundos
**30 s · cortes 0,8–1,8 s · 3,13 palavras/s · maior risco de sobrecarga**

| Intervalo | Objetivo | Estímulo visual/sonoro | Risco de queda | Correção proposta |
|---|---|---|---|---|
| 0–3 s | Parar | R$ 100 + cronômetro começa; impact; whip | Quiz genérico; **cronômetro prometido e nunca resolvido** | Ou o cronômetro fecha em 27 s, ou sai; prometer "3 comparações, 1 resposta" |
| 3–7 s | Prender | Cesta de 5 itens; +25%; whoosh | **+25% e 5% ao ano no mesmo vídeo sem ponte**; 13 palavras em 4 s | Rotular: "+25% = exemplo de alta" e "5% ao ano = simulação de 10 anos" |
| 7–12 s | Responder | Contador 100→61,39; split; impact | **Número começa a ser entregue em 7 s (23%) e fecha em 9 s (30%)**; 21 s sem pergunta aberta | Segurar o R$ 61 até 18–21 s; em 7–9 s entregar só "4 de 5" |
| 12–18 s | Reenquadrar | Texto grande; recibo; sub | Tese abstrata sem estímulo novo; o mapa prevê pergunta que o roteiro não tem | Reabrir com pergunta concreta ("e o seu salário?") ou cortar o bloco |
| 18–24 s | Payoff | Split; impact | **Repetição verbatim** do payoff de 9–12 s | Cortar 21–24; usar 3 s para a ponte das premissas |
| 24–30 s | CTA | Logo; brand; 3 cortes | **6 s (20%) de CTA duplo**; pergunta cuja resposta já foi dada | 1 CTA, 3 s; "comente se você acertou" em vez de "quanto você acha" |

**Primeiros segundos.** 0–1 s: R$ 100 + cronômetro. 1–3 s: "Quanto isso compra? Depende do ano."
5 s: "Hoje: uma cesta." O hook é claro e completo em 3 s — mas é o formato mais comum do feed.
**Gap:** fecha em 7 s (23% do vídeo). Os 23 s seguintes não têm pergunta aberta. Maior "deriva
pós-payoff" do conjunto.
**Interrupts:** muitos, mas com o mesmo peso. Sem hierarquia, o efeito cancela.
**Micro-recompensas:** "4 de 5" e "R$ 61" — ambas antes de 9 s. Depois, nenhuma.
**Respiro:** **zero**, apesar de o próprio conceito exigir "dois momentos de respiro".
**Payoff:** a frase é boa, mas dita duas vezes e seguida de um CTA que pergunta o que o vídeo
acabou de responder. Isso quebra a autoridade do fechamento.
**Nota 12,5.** Não é problema de energia; é problema de distribuição de informação.
**Must-fix:** cortar 21–24; uma premissa por bloco; CTA único de 3 s; 1 respiro em 12 s.

---

### V05 — Uma nota sobre a mesa
**40 s · cortes 2,5–4,0 s · 1,78 palavras/s · menor densidade do conjunto**

| Intervalo | Objetivo | Estímulo visual/sonoro | Risco de queda | Correção proposta |
|---|---|---|---|---|
| 0–3 s | Prender | Nota sobre mesa preta; slow push; room tone | **Hook sem tensão**: "não é só um número" é tese, não convite | Abrir com a contradição que hoje é o payoff: "O valor está impresso. O que ele compra, não." |
| 3–9 s | Curiosidade | Tipografia entra; linha fina; piano | 6 s para instalar um conceito abstrato | Encurtar para 3 s; linha entra em 3 s |
| 9–18 s | Demonstrar | Linha desce; macro no 100; tick | 9 s com um único sistema visual, dentro de um trecho de 14 s sem troca (9–23 s) | 1 interrupt em 13–14 s: macro no 100 + silêncio de 0,6 s |
| 18–23 s | Pausa | Vazio, mesa, silêncio | **Pausa no pior lugar (45–57%)** com 5 palavras | Mover o silêncio para 13–14 s; encurtar 18–23 para 2 s |
| 23–30 s | Provar | Número 61,39; sub; frase de 18 palavras | Número frio no pico de densidade | Dividir; o 61,39 resolve em 2 s com a linha chegando nele |
| 30–40 s | Fechar | Split minimalista; logo; CTA | Payoff quase idêntico ao de V01; CTA vago ("conheça a plataforma") | Reescrever payoff para o objeto; CTA com motivo |

**Primeiros segundos.** 0–1 s: nota e luz. 1–3 s: "R$ 100 não é só um número." 5 s: "É uma
promessa de compra." Não há ameaça, perda ou contradição — só uma promessa de tom.
**Gap:** fraco. "Não é só um número" não gera pergunta específica; "promessa de compra" é
conceito, não loop.
**Interrupts:** slow push, tipografia, linha, fade. Entre 9 e 23 s não há troca de sistema visual
— 14 s, o maior intervalo sem interrupt do conjunto.
**Micro-recompensas:** linha descendo e 61,39. Duas, muito distantes.
**Respiro:** existe, mas mal posicionado (45–57% do runtime). Silêncio cedo sustenta; silêncio
no meio derruba.
**Payoff:** "O valor está impresso. O poder de compra, não." Limpo, mas é a mesma frase de V01
com outra roupa.
**Nota 11,0.** É o vídeo em que "premium" e "parado" ficam mais próximos. A restrição é uma
escolha válida; a falta de tensão inicial, não.
**Must-fix:** novo hook; 1 interrupt entre 9 e 18 s; mover o respiro; CTAs com motivo.

---

### V06 — Não é impressão
**38 s · cortes 1,8–2,5 s · 1,74 palavras/s · melhor hook de identificação**

| Intervalo | Objetivo | Estímulo visual/sonoro | Risco de queda | Correção proposta |
|---|---|---|---|---|
| 0–3 s | Validar | Close text; sub; "NÃO É IMPRESSÃO" | Colide com o eixo de V01 ("não é impressão") | Manter; decidir qual das duas fica com a expressão |
| 3–8 s | Curiosidade | Cesta encolhe; split salário; click | Se o split for metafórico, perde força | Números literais na tela: salário nominal × itens comprados |
| 8–15 s | Nomear | Bass; linha cai | Definição genérica ("alta generalizada") igual à de V01/V03/V09 | 1 frase e retorno ao split em 12 s |
| 15–24 s | Provar | Contador; 18 palavras | Pico de densidade no pico de expectativa | Dividir; contador 100→61 em 3 s |
| 24–32 s | Payoff | Espelho; impact; sub | **8 s repetindo o hook sem informação nova** | Cortar 24–28 **ou** 28–32; manter 4 s de callback |
| 32–38 s | CTA | End card; brand | 6 s = 15,8% | 3 s |

**Primeiros segundos.** 0–1 s: "Você não está imaginando." 1–3 s: "Seu dinheiro compra menos."
5 s: split salário/cesta. É o hook mais forte de retenção do conjunto: segunda pessoa,
validação e causa oculta em 5 s. Entendível sem áudio se a tipografia for legível.
**Gap:** "por quê?" → respondido em 11 s. Gap de 8 s, bem calibrado.
**Interrupts:** jump cuts, split, punch-ins, text overlays — o split salário/cesta é o eixo
visual mais original do conjunto.
**Micro-recompensas:** split, número, callback. Duas recompensas reais.
**Respiro:** nenhum.
**Payoff:** "Não é impressão. É inflação." Fecha o loop com nome — satisfatório, mas é
restatement, não revelação. E vem depois do número, o que transforma a tese em epílogo.
**Replay:** médio.
**Nota 15,0.** Perde 5 pontos por 8 s de repetição e ausência de respiro.
**Must-fix:** cortar um dos dois beats finais; respiro em 17–18 s.

---

### V07 — A linha que explica seu bolso
**42 s · cortes 2,0–3,0 s · 1,64 palavras/s · mais frio do conjunto**

| Intervalo | Objetivo | Estímulo visual/sonoro | Risco de queda | Correção proposta |
|---|---|---|---|---|
| 0–3 s | Curiosidade | Grid surge, linha começa; tick | **"Essa linha" aponta para um objeto ainda incompleto no frame 0** | Inverter: "Seu dinheiro vale menos. Esta linha mostra quanto." com a linha já visível |
| 3–11 s | Prender | Ponto 0, R$ 100, eixo 5%; click | 8 s de eixo e regra, sem âncora humana ou objeto | Nota de R$ 100 sobre o gráfico em 6–8 s |
| 11–22 s | Provar | R$ 78, R$ 61, área preenche; ticks/impact | **11 s de gráfico contínuo**, mesmo estímulo | Punch-in no 61 em 16 s; cesta entrando em 19 s |
| 22–32 s | Consequência | Split nota/gráfico; cesta; whoosh | 10 s de split repetido | Reduzir para 6 s; cortar 27–32 |
| 32–37 s | Payoff | "INFLAÇÃO"; zoom | **Payoff é tese + platitude** ("entender importa") | Reescrever: "A linha não é o preço. É o que o dinheiro compra." |
| 37–42 s | CTA | Selos simulação/salve; brand | 5 s, dois selos | 3 s, um selo |

**Primeiros segundos.** 0–1 s: linha começando + "PODER DE COMPRA". 1–3 s: "Essa linha explica
por que seu dinheiro vale menos." O demonstrativo chega antes de o objeto estar formado — no
melhor caso é promessa, no pior é referência vazia.
**Gap:** "quanto?" → 78 em 11 s e 61 em 16 s. Boa cadência de recompensas, baixo risco.
**Interrupts:** chart draw, punch-ins, chart wipes. Entre 2 e 22 s, 20 s no mesmo sistema visual.
**Micro-recompensas:** 78, 61, área preenchendo. **Três — a melhor cadência de dados do conjunto.**
**Respiro:** nenhum; o gráfico contínuo não permite.
**Payoff:** "Isso é inflação. E é por isso que entender importa." Não responde ao hook com
imagem nem com número; é a frase mais fraca de fechamento do conjunto.
**Replay:** baixo.
**Nota 11,5.** O miolo é competente; abertura e fechamento são o problema. É a variante que
mais depende de roteiro novo, não de edição.
**Must-fix:** novo hook com antecedente resolvido; novo payoff; 1 interrupt humano em 8 s.

---

### V08 — Papo de mercado
**34 s · cortes 1,8–2,5 s · 2,18 palavras/s · melhor formato nativo**

| Intervalo | Objetivo | Estímulo visual/sonoro | Risco de queda | Correção proposta |
|---|---|---|---|---|
| 0–3 s | Reconhecer | Balão de chat; pop; quote do amigo | Pode ser lido como meme antes de ser lido como conteúdo | Garantir 3 palavras legíveis no frame 0; sem logo |
| 3–9 s | Provar | Recibo, cesta, +25%; whoosh | **16 palavras em 4 s com premissa diferente do 5%/ano** | Rotular +25% como exemplo separado; 4 de 5 resolve em 2 s |
| 9–17 s | Explicar | Nota, itens somem; sub/click | 8 s com duas frases abstratas e nenhum objeto novo | 1 interrupt em 12 s (recibo em tela cheia); cortar 1 frase |
| 17–26 s | Provar | Contador 100→61,39; split; linha | 18 palavras + número frio | Dividir; 61,39 com o recibo ao lado |
| 26–30 s | Payoff | Split; impact; linha | Dois fechamentos dizendo a mesma coisa | Fundir em 1 payoff |
| 30–34 s | CTA | "MANDA PRA ELE"; brand | CTA genérico | 3 s com motivo |

**Primeiros segundos.** 0–1 s: balão de chat com "DINHEIRO PARADO NÃO PERDE VALOR?". 1–3 s:
"Aquele amigo que diz…". 5 s: "…precisa ver isso." O reconhecimento é imediato; a promessa de
prova chega em 2 s. Funciona bem sem áudio.
**Gap:** "quem está certo?" → respondido em 5–9 s. Gap curto, mas suficiente para um formato de
resposta.
**Interrupts:** chat UI, zooms, UI pops, item removal. O chat é o interrupt mais nativo do conjunto.
**Micro-recompensas:** 4 de 5, 61,39. Duas.
**Respiro:** nenhum explícito; "precisa ver isso" (2–5 s) é um beat, não um respiro.
**Payoff:** "Dinheiro parado não fica igual. Ele perde poder de compra." Correto e claro, mas
literal — é a conclusão mais previsível do conjunto.
**Replay:** médio; potencial de compartilhamento maior que o de replay.
**Nota 14,5.** Formato, duração e mecânica de share são os melhores da coleção. O payoff é o
único item que impede nota maior.
**Must-fix:** ponte +25% ↔ 5%/ano; payoff com veredito (não com definição).

---

### V09 — O imposto invisível
**40 s · cortes 1,8–2,8 s · 1,85 palavras/s · melhor hook, pior encaixe de payoff**

| Intervalo | Objetivo | Estímulo visual/sonoro | Risco de queda | Correção proposta |
|---|---|---|---|---|
| 0–3 s | Chocar | "IMPOSTO INVISÍVEL" em tela preta; impact; light sweep | Pode ser lido como político ou clickbait | Manter; frame 0 sem logo; assumir a metáfora em 6–8 s |
| 3–10 s | Curiosidade | Recibo, linha brilhando; paper | **Metáfora do imposto nunca é assumida como metáfora** | "Não é um imposto de verdade. Mas cobra todo mês." |
| 10–19 s | Revelar | Preços sobem; whip pans; speed ramp; INFLAÇÃO | Montagem de preços pode ficar genérica | 3 preços do mesmo produto (cesta) para dar continuidade |
| 19–29 s | Provar | Contador; 18 palavras; slow pan | Pico de densidade + 5 s de frase abstrata em seguida | Dividir; cortar uma das frases 24–29 / 29–34 |
| 29–34 s | Payoff | Luz amarela cresce; riser | **Payoff substituído por build de marca** | Payoff antes da marca: "Você não vota nesse imposto. Mas pode aprender a enxergá-lo." |
| 34–40 s | Marca | Logo reveal; brand sting | **6 s (15%) de assinatura, sem CTA executável** | 3 s de logo depois do payoff |

**Primeiros segundos.** 0–1 s: "Existe um imposto que ninguém votou." 1–3 s: "E você paga todos
os dias." 5 s: recibo na mesa. É o hook com maior tensão moral do conjunto e o único que cria
injustiça + especificidade + segunda pessoa em 2,5 s.
**Gap:** "que imposto?" → nomeado em 14 s (35% do runtime). **O gap mais longo e mais bem
sustentado do conjunto.**
**Interrupts:** light sweep, macro no recibo, montagem de preços, zoom, logo reveal. Bem
distribuídos, com escalada.
**Micro-recompensas:** linha do recibo, preços, 61,39. Três.
**Respiro:** 24–29 s é um respiro de gravitas — bem posicionado (60–72%), mas paga com
abstração.
**Payoff:** o vídeo termina em "Invest Fácil. Entenda o dinheiro. Depois, o mercado." Isso é
assinatura, não payoff. O hook promete um imposto oculto; o fechamento entrega um slogan.
**O loop fica aberto.** É a falha mais séria de hook→payoff do conjunto.
**Replay:** médio-baixo.
**Nota 14,0.** Hook 9,5 puxa a retenção; payoff 5,5 puxa para baixo.
**Must-fix:** assumir a metáfora; criar payoff antes da marca. Sem isso, V09 não deve competir
como finalista, apesar do melhor hook.

---

### V10 — O espelho do dinheiro
**45 s · cortes 1,8–3,0 s · 1,71 palavras/s · maior potencial de replay**

| Intervalo | Objetivo | Estímulo visual/sonoro | Risco de queda | Correção proposta |
|---|---|---|---|---|
| 0–3 s | Estranhar | Espelho, nota refletida; ambient; slow push | Frase longa: em 3 s ainda não há proposição completa | Abrir com "Eu não desapareci." e deixar "se o dinheiro falasse" como texto |
| 3–10 s | Curiosidade | Reflexo encolhe; morph; sub | **O hook se responde em 6 s** ("você só compra menos") | Segurar essa frase até 24 s |
| 10–18 s | Nomear | Macro no 100, espelho distorce; linha cai | **8 s repetindo a mesma tese** com outro vocabulário | Cortar 10–14; usar o tempo para a cesta concreta |
| 18–28 s | Demonstrar | Nota vira linha; INFLAÇÃO; cesta 4/5 | Nome e número tardios (número só em 28 s = 62%) | Antecipar o número para 22–26 s |
| 28–38 s | Payoff | Gráfico 100→61; espelho; piano | Dois fechamentos poéticos seguidos | Fundir 33–38 e 38–42 |
| 38–45 s | CTA | Fade; reflexo; brand | CTA curto (bom), mas após dois fechos | 1 fecho + 3 s |

**Primeiros segundos.** 0–1 s: "Se o seu dinheiro pudesse falar…" 1–3 s: "…ele diria: eu não
desapareci." 5 s: "Você só compra menos." A imagem é a mais distinta do conjunto; a estrutura,
porém, entrega a resposta antes de criar a pergunta.
**Gap:** fecha em 6 s e reabre só em 18 s (nome). São 12 s de confirmação, não de curiosidade.
**Interrupts:** mirror, morph, parallax, light sweep. Ricos e motivados.
**Micro-recompensas:** reflexo encolhendo, cesta, 61,39 — três, mas concentradas na segunda metade.
**Respiro:** 33–38 s ("não some") — bem colocado (73–84%), mas tarde.
**Payoff:** "O dinheiro não some. Ele muda de tamanho no que você pode comprar." Memorável,
responde ao hook e tem twist filosófico. Perde força por já ter sido dito em 6 s.
**Replay:** **o maior do conjunto** — a frase e a imagem convidam a rever.
**Nota 13,0.** Conceito mais autoral; execução narrativa mais redundante.
**Must-fix:** mover "você só compra menos" para depois do número; cortar 10–14.

---

## 6. O que é hipótese e o que é observação técnica

| Afirmação | Natureza | Base |
|---|---|---|
| Durações, contagens de palavra, densidade, posição do número, tamanho de CTA | **Observação técnica** | Leitura dos `SCRIPT.md`/`STORYBOARD.md`; contagem manual |
| Mapas x roteiros dessincronizados (V02, V04, V06, V09, V10) | **Observação técnica** | Comparação linha a linha |
| Cronômetro de V04 não resolvido; hook de V02 falado em 12 s | **Observação técnica** | Roteiro e storyboard |
| "O espectador sai em X segundo" | **Não afirmado** | Não há medição |
| "Este hook para a rolagem" | **Hipótese editorial** | Critérios da skill, não dados |
| Ordem do ranking e diferenças de 0,5 ponto | **Hipótese editorial** | Comparação por critérios declarados |
| "V05 é lento para feed frio" | **Hipótese editorial** | Densidade + duração de plano; sem teste |
| "V09 pode ser lido como político" | **Hipótese editorial** | Leitura do texto; sem comentários reais |
| "V02 tem o melhor payoff" | **Julgamento editorial** | Critério: responde ao hook, é concreto, é memorável |
| Métricas de retenção, watch time, CTR | **Inexistentes** | Nada foi publicado |

---

## 7. Top 3 (retenção potencial)

Critério: consistência entre hook, progressão, recompensas e payoff, com risco de produção
administrável. **Não é o ranking final** — os outros critérios somam 65 dos 100 pontos.

### 1º — V01 · O ticker não para · 15,5
**Por quê:** é o único que combina hook cronometrado, cinco sistemas visuais distintos, três
micro-recompensas e um payoff que responde exatamente à pergunta inicial. A progressão nunca
repete informação.
**O que impede nota maior:** ponte genérica em 26–29 s, CTA de 5 s, zero respiro.
**Correção que destrava:** cortar 26–29 (−3 s) e dividir a frase de 19–23 s. Alvo: 31 s.

### 2º — V06 · Não é impressão · 15,0
**Por quê:** melhor hook de identificação (9,0) e o eixo visual mais original (salário nominal
× cesta real). O gap "por quê?" sustenta 8 s sem esforço.
**O que impede nota maior:** 8 s repetindo o próprio hook no fim e definição de inflação igual
à de outras três variantes.
**Correção que destrava:** cortar um dos dois beats finais e usar o tempo para um sinal concreto
("e o salário não acompanha"). Alvo: 34 s.

### 3º — V08 · Papo de mercado · 14,5
**Por quê:** formato nativo com o menor atrito de produção e a melhor mecânica de
compartilhamento. 34 s, 2,18 palavras/s, chat UI como interrupt real. O espectador entende a
premissa em 2 s.
**O que impede nota maior:** payoff literal e mistura de premissas (+25% e 5% ao ano).
**Correção que destrava:** payoff com veredito sobre a frase do amigo + ponte entre as duas
premissas. Mantém 34 s.

**Suplentes diretos:** V02 (melhor payoff, 8,5; entra se o hook for reposicionado) e V09
(melhor hook, 9,5; entra se o payoff deixar de ser assinatura de marca).

---

## 8. Maior risco de abandono

### Risco primário — o bloco de simulação no pico de expectativa (47%–75% do runtime)

Em **8 de 10 roteiros** (V01, V02, V03, V05, V06, V08, V09, V10), a frase mais longa do vídeo
— 18 a 21 palavras — é exatamente a que entrega o número prometido pelo hook. Ela acumula
quatro elementos abstratos em sequência: "simulação", taxa, prazo e resultado. Imediatamente
depois vêm o payoff (3–6 s) e o CTA (4–6 s).

O espectador chega ali com máxima expectativa e encontra máxima densidade. É o ponto em que
três falhas se somam: carga cognitiva alta, locução rápida e ausência de recompensa visual
intermediária. **Hipótese:** é a janela de maior queda do conjunto, e a que mais desperdiça
a atenção já conquistada.

**Correção sistêmica:** quebrar a frase em duas (≤12 palavras faladas), mover "simulação ·
5% ao ano · 10 anos" para um lower third persistente e resolver o número em 2–3 s de contador.
Critério de aceite: nenhuma frase acima de 14 palavras entre 45% e 80% do runtime.

### Risco secundário — a cauda pós-número

Em média, **38% do vídeo acontece depois do número que justifica o hook** (mediana 33%).
V04: 70%. V07: 48%. V09: 40%. Nessa cauda, o vídeo precisa provar que ainda tem algo a
dizer. Hoje ele costuma repetir a tese ou fazer ponte de marca.

**Correção:** cada segundo após o número precisa conter uma das três coisas — consequência
concreta, imagem de contraste ou chamada. Se não contiver, cortar.

### Risco terciário — repetição intra-coleção

7 de 10 fechamentos usam a mesma carga semântica ("o número é o mesmo; o poder de compra,
não") e todos usam 61,39. Dois hooks disputam "não é impressão" (V01 e V06). Se as variantes
forem publicadas em sequência na mesma conta, **a segunda perde o efeito de novidade da
primeira** — e a novidade é o principal ativo deste conjunto.

**Correção:** manter a frase canônica em uma única variante e reescrever as outras para o
próprio objeto (café, nota, máquina, espelho). Critério de aceite: no máximo 2 payoffs com a
mesma estrutura semântica no conjunto.

---

## 9. Must-fix

### 9.1 Bloqueantes (corrigir antes de animar)

| ID | Aplica-se a | Correção | Critério de aceite |
|---|---|---|---|
| MF-01 | V04, V06, V08, V10 | Remover repetição verbatim ou quasi-verbatim do payoff | Nenhuma frase de fechamento repetida palavra por palavra |
| MF-02 | V01, V02, V03, V04, V05, V06, V07, V08, V09 | CTA único, ≤3 s | CTA ≤ 8% do runtime; 1 pedido |
| MF-03 | V01, V02, V03, V05, V06, V08, V09, V10 | Dividir a frase de simulação | ≤12 palavras faladas + "simulação" em lower third |
| MF-04 | V02 | Mover a tensão do hook para 0–3 s | "não deu" ou equivalente visível/audível até 3 s |
| MF-05 | V07 | Hook com antecedente resolvido + payoff que responda ao hook | "linha" visível no frame 0; payoff com número ou imagem |
| MF-06 | V09 | Assumir a metáfora do imposto e criar payoff antes da marca | 1 frase de ponte em 6–8 s; payoff antes do logo |
| MF-07 | V05 | Novo hook com tensão + 1 interrupt entre 9 e 18 s | Nenhum intervalo >6 s sem troca de sistema visual |
| MF-08 | V04, V08 | Separar +25% de 5% ao ano | Rótulo na tela para cada premissa; nenhuma mistura sem ponte |
| MF-09 | V02, V04, V06, V09, V10 | Reconciliar `RETENTION_MAP.md` com `SCRIPT.md` | Timecodes idênticos; nenhuma linha descrevendo cena inexistente |
| MF-10 | Todas | Padronizar o número | Tela: "61,39" quando o contador resolve; narração: "cerca de R$ 61"; nunca "menos de" |

### 9.2 Recomendados (qualidade de retenção)

| ID | Aplica-se a | Correção |
|---|---|---|
| MF-11 | V01, V03, V04, V06, V07 | Inserir 1 respiro real (0,6–1,2 s) entre 35% e 50% do runtime |
| MF-12 | V03 | Adiar o nome "inflação" para 8–9 s e dar regra causal à máquina |
| MF-13 | V10 | Mover "você só compra menos" para depois do número; cortar 10–14 s |
| MF-14 | V04 | Resolver ou remover o cronômetro plantado em 0–1,5 s |
| MF-15 | V05 | Reposicionar o silêncio de 18–23 s para 13–14 s |
| MF-16 | V04, V05 | Reescrever payoffs que hoje repetem a estrutura canônica (mantê-la só em V01) |

### 9.3 Cortes concretos propostos

| ID | Cortar | Ganho | Efeito |
|---|---|---:|---|
| V01 | 26,0–29,0 s (ponte "entender é o primeiro passo") | −3 s | Payoff mais próximo do CTA |
| V02 | fundir 31,0–40,0 s em um fechamento | −4 s | Elimina payoff duplo; alvo 41 s |
| V04 | 21,0–24,0 s (repetição do payoff) | −3 s | Abre espaço para a ponte das premissas |
| V05 | 5,0–9,0 s ou 2,5–5,0 s (um dos dois) | −3 a −4 s | Reduz instalação conceitual |
| V06 | 24,0–28,0 s **ou** 28,0–32,0 s | −4 s | Mantém 1 callback, remove eco |
| V09 | 24,0–29,0 s **ou** 29,0–34,0 s | −5 s | Elimina manifesto duplicado; alvo 35 s |
| V10 | 10,0–14,0 s | −4 s | Remove repetição da tese |

Nenhum desses cortes remove informação nova. Todos removem repetição ou ponte sem função.

---

## 10. Encerramento

- **10 variantes avaliadas** em retenção potencial, hook e payoff, com justificativa.
- **Top 3 de retenção:** V01 (15,5), V06 (15,0), V08 (14,5).
- **Maior risco de abandono:** bloco de simulação entre 47% e 75% do runtime, seguido de
  payoff curto e CTA longo.
- **Must-fix bloqueantes:** 10 itens, com critério de aceite verificável.
- **Nenhum vídeo foi produzido, renderizado ou exportado.**
- **Nenhuma aprovação humana foi declarada.** Estas notas são insumo editorial para o Gate 3;
  a escolha dos finalistas e do vencedor cabe ao usuário.

**Limite explícito deste documento:** não há curva de retenção, não há teste A/B, não há
publicação. Qualquer afirmação sobre onde o público *de fato* sai só existirá depois de medir.

---

# RODADA 2 — REVISÃO APÓS CORREÇÕES

**Data:** 21/11/2026
**Base:** `reports/GATE3_V2_CHANGELOG.md`, os 10 `RETENTION_MAP.md` finais e os 10 `SCRIPT.md` finais.
**Status:** revisão preliminar. Nenhum vídeo renderizado. Nenhuma retenção real observada.

> **Mesma regra da rodada 1.** Isto é hipótese editorial, não medição.
> Caracteres/s vêm do orçamento de roteiro declarado no changelog (14,0 c/s de referência,
> não TTS real). Posição do payoff e duração de CTA são aritmética sobre os timecodes do
> roteiro. Pico de densidade é estimativa por bloco, com margem de ±1 c/s.
> **Nenhuma aprovação humana está sendo declarada.**

---

## 11.1 O que mudou de fato

**Ganhos verificáveis nos artefatos:**

1. **A compressão acabou.** O caso mais claro é V01: a frase de simulação passou de
   21 palavras em 4 s (rodada 1) para 14 palavras em 5,5 s — cerca de metade da taxa local.
   O tempo agora comporta o texto.
2. **CTA encolheu.** A média caiu de 13,1% para 9,2% do runtime. Três variantes (V05, V08, V10)
   cumprem ≤3 s; outras duas (V01, V02) ficam em 3,4–3,7 s.
3. **V02 ganhou o cold open.** A tensão prometida na matriz finalmente está em 0,0–2,6 s. Era
   a maior falha de hook do conjunto na rodada 1.
4. **As premissas de +25% e 5% ao ano passaram a ser rotuladas** como "SIMULAÇÃO" em V04 e V08.
5. **V05 ganhou um hook-pergunta** ("Quanto essa nota ainda compra?") e **V07 perdeu o
   demonstrativo vazio** ("uma linha", em vez de "essa linha").
6. **V09 assumiu a metáfora** em 4,7 s ("Não é imposto literal. É inflação.").

**Regressões ou riscos novos:**

1. **O payoff ficou mais tarde.** A posição média subiu de 64,5% para 71,4% do runtime.
   Em 7 de 10 o payoff começa entre 70% e 79%.
2. **V08 cresceu de 34 s para 41 s** (+21%) e ganhou dois beats depois do payoff.
3. **Vários mapas continuam descrevendo o modelo antigo**, apesar do timing novo.

---

## 11.2 Timing final

| ID | Duração | Caracteres/s (orçamento) | Pico de densidade (bloco; estimativa) | Posição do payoff | CTA falado |
|---|---:|---:|---|---:|---:|
| V01 | 33 s | 13,1 | 8,0–11,7 s; ≈14,1 c/s | 70,0% (23,1 s) | 3,4 s (10,3%) |
| V02 | 42 s | 13,1 | 2,9–5,7 s; ≈15,0 c/s | 73,6% (30,9 s) | 3,7 s (8,8%) |
| V03 | 33 s | 13,1 | 9,9–12,8 s; ≈15,2 c/s | 71,8% (23,7 s) | 3,9 s (11,8%) |
| V04 | 30 s | 12,4 | 14,3–17,0 s; ≈15,6 c/s | 47,7% (14,3 s) | 4,0 s (13,3%) — duplo |
| V05 | 36 s | 12,9 | 0,0–2,1 s; ≈14,8 c/s | 78,3% (28,2 s) | 3,0 s (8,3%) |
| V06 | 37 s | 13,1 | 7,5–10,8 s; ≈14,2 c/s | 78,6% (29,1 s) | 3,7 s (10,0%) |
| V07 | 40 s | 13,3 | 0,0–4,0 s; ≈15,0 c/s | 78,0% (31,2 s) | 4,2 s (10,5%)* |
| V08 | 41 s | 13,1 | 7,0–13,8 s; ≈14,7 c/s | 65,1% (26,7 s) | 1,8 s (4,4%) |
| V09 | 37 s | 13,1 | 4,7–7,1 s; ≈15,4 c/s | 74,1% (27,4 s)** | 3,8 s (10,3%) |
| V10 | 39 s | 12,9 | 4,8–8,2 s; ≈15,3 c/s | 76,7% (29,9 s) | 1,7 s (4,4%) |

\* V07 inclui "Simulação com 5% ao ano" dentro do bloco de 4,2 s.
\** V09 não tem payoff nomeado: 27,4 s é a última tese; a marca entra em 32,3 s (87,3%).

**Leitura da tabela:**

- **Duração:** 30–42 s. Nenhum vídeo estourou a faixa-alvo.
- **Densidade:** 12,4–13,3 c/s, dentro do orçamento de 14,0. O pico estimado fica em 14–16 c/s,
  ou seja, **1–3 c/s acima da média**. A curva ficou plana — não há mais picos de compressão.
  Isso resolve o risco primário da rodada 1, mas cria um novo: sem contraste de ritmo, a
  locução pode soar uniforme.
- **Payoff:** média de **71,4%** contra 64,5% na rodada 1 (+6,9 pontos). Só V04 fica abaixo de
  60%. V05, V06 e V07 chegam a 78% ou mais.
- **CTA:** média de **9,2%** contra 13,1% (−3,9 pontos). Melhora real, mas V04 ainda tem dois
  pedidos e 7 de 10 ficam entre 3,4 e 4,2 s (um deles duplo).
- **Cauda pós-número:** média de **32,0%** contra 37,9%. Melhor, porém V04 (53%), V07 (40,3%),
  V09 (37,8%) e V08 (35,4%) ainda gastam mais de um terço do vídeo depois do número.

---

## 11.3 Placar revisado

Só mudei a nota onde a correção muda o julgamento. Onde o artefato não mudou, a nota fica.

| # | ID | Retenção R1 | Retenção R2 | Δ | Hook R1 | Hook R2 | Δ | Payoff R1 | Payoff R2 | Δ |
|---:|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | V01 | 15,5 | **16,0** | +0,5 | 8,0 | 8,0 | 0 | 7,5 | 7,5 | 0 |
| 2 | V06 | 15,0 | **15,0** | 0 | 9,0 | 9,0 | 0 | 7,5 | 7,0 | −0,5 |
| 3 | V02 | 14,0 | **15,0** | +1,0 | 6,5 | 8,0 | +1,5 | 8,5 | 8,0 | −0,5 |
| 4 | V09 | 14,0 | **14,5** | +0,5 | 9,5 | 9,5 | 0 | 5,5 | 6,0 | +0,5 |
| 5 | V03 | 13,5 | **14,0** | +0,5 | 7,5 | 7,5 | 0 | 7,5 | 7,5 | 0 |
| 6 | V10 | 13,0 | **13,5** | +0,5 | 8,5 | 8,5 | 0 | 8,0 | 7,5 | −0,5 |
| 7 | V08 | 14,5 | **13,5** | −1,0 | 8,0 | 7,5 | −0,5 | 7,0 | 7,0 | 0 |
| 8 | V04 | 12,5 | **13,5** | +1,0 | 7,0 | 7,0 | 0 | 6,0 | 6,5 | +0,5 |
| 9 | V05 | 11,0 | **12,5** | +1,5 | 5,0 | 7,0 | +2,0 | 7,0 | 7,0 | 0 |
| 10 | V07 | 11,5 | **12,0** | +0,5 | 6,5 | 7,5 | +1,0 | 5,5 | 5,5 | 0 |

**Justificativas das mudanças:**

- **V01 +0,5 em retenção.** A frase de simulação deixou de ser o gargalo e o CTA caiu para
  3,4 s. Não subiu mais porque a ponte "Entender isso é o primeiro passo" (26,4–28,8) continua
  sem informação nova e o payoff foi para 70%.
- **V06 estável, payoff −0,5.** A lógica salário × preços foi corrigida e há pausa intencional de
  250 ms no bloco de 15,4–18,6 s. Mas o payoff começou em 78,6% e "É um fenômeno econômico" é
  menos satisfatório que "É inflação". O ganho de clareza compensa a perda de posição; a nota
  de retenção fica igual.
- **V02 +1,0 / hook +1,5.** O cold open resolve o problema mais grave do conjunto. O payoff
  caiu 0,5 porque agora existem **dois** fechamentos (30,9 s e 33,8 s) e o novo é mais fraco
  que "A inflação não faz barulho. Ela aparece no troco."
- **V09 +0,5 / payoff +0,5.** A metáfora assumida em 4,7 s repara parte da promessa. O
  fechamento continua sendo assinatura de marca em 87,3%, então o payoff não sobe mais.
- **V03 +0,5.** O modelo correto (nota intacta, cesta encolhe) e a regra causal em 14,9 s
  melhoraram a coerência. O nome "inflação" ainda entra em 4,5 s.
- **V10 +0,5 / payoff −0,5.** Modelo corrigido e −6 s de duração. Mas "Você só compra menos"
  continua em 4,8 s: o hook entrega a própria resposta, e o payoff confirma em vez de revelar.
- **V08 −1,0 / hook −0,5.** Clareza e rotulagem melhoraram, mas o vídeo cresceu 7 s, o hook
  leva 4,1 s para virar e há dois beats depois do payoff. Em formato nativo, 41 s é outro
  compromisso de atenção.
- **V04 +1,0 / payoff +0,5.** A repetição verbatim saiu e as premissas foram rotuladas. Mas o
  CTA continua duplo (13,3%) e 53% do vídeo acontece depois do número.
- **V05 +1,5 / hook +2,0.** O hook-pergunta é uma mudança real de qualidade. O resto não mudou:
  silêncio ainda em 16,2–20,7 e payoff ainda canônico em 78,3%.
- **V07 +0,5 / hook +1,0.** "Uma linha" resolve o antecedente. O payoff segue platitude
  ("entender importa") em 78%.

**Ranking revisado (desempate: hook, depois payoff):**

1. V01 — 16,0
2. V06 — 15,0 (hook 9,0)
3. V02 — 15,0 (hook 8,0)
4. V09 — 14,5
5. V03 — 14,0
6. V10 — 13,5 (hook 8,5)
7. V08 — 13,5 (hook 7,5)
8. V04 — 13,5 (hook 7,0)
9. V05 — 12,5
10. V07 — 12,0

---

## 11.4 Must-fixes: o que foi resolvido, o que ficou

| ID | Item | Status | Evidência na v2 |
|---|---|---|---|
| MF-04 | V02: tensão em 0–3 s | **Resolvido** | Cold open "Até o dia em que o dinheiro não deu" em 0,0–2,6 s |
| MF-08 | Separar +25% de 5% ao ano | **Resolvido** | "SIMULAÇÃO" nas duas linhas (V04 5,1/10,1 s; V08 7,0/21,1 s) |
| MF-10 | Padronizar o número | **Resolvido** | "cerca de 61" em 10/10; nenhum "menos de" |
| MF-16 | Payoff de V04 | **Resolvido** | "A pergunta é a mesma. A resposta, não." |
| MF-01 | Repetição do payoff | **Parcial** | V04 e V08 sem repetição verbatim; V06 e V10 mantêm eco do hook |
| MF-02 | CTA ≤3 s e único | **Parcial** | 3/10 ≤3 s; média 9,2%; V04 ainda duplo (4,0 s) |
| MF-03 | Frase de simulação ≤12 palavras | **Parcial** | V01/V04/V09/V10 ok; V02/V03/V05/V06/V08 com 14–21 palavras, mas agora com tempo orçado |
| MF-11 | Respiro entre 35% e 50% | **Parcial** | V01 com pausa após 11,8 s; V06 no limite (após 15,4 s); V03/V04/V07 sem pausa na faixa |
| MF-05 | V07: hook + payoff | **Parcial** | Hook resolvido; payoff ainda é platitude em 78% |
| MF-06 | V09: metáfora + payoff antes da marca | **Parcial** | Metáfora resolvida em 4,7 s; payoff ainda é marca em 87,3% |
| MF-07 | V05: hook + interrupt | **Parcial** | Hook-pergunta resolvido; pausa ainda em 16,2–20,7 s |
| MF-09 | Mapa x roteiro | **Parcial** | Timecodes alinhados; pelo menos 4 mapas mantêm texto do modelo v1 |
| MF-12 | V03: adiar o nome "inflação" | **Aberto** | "Não é mágica. É inflação." em 4,5 s |
| MF-13 | V10: resposta depois do número | **Aberto** | "Você só compra menos" em 4,8 s |
| MF-14 | V04: cronômetro | **Aberto/verificar** | Changelog declara resolvido; o mapa não mostra onde ele fecha |
| MF-15 | V05: mover o silêncio | **Aberto** | Pausa permanece em 16,2–20,7 s (45–57%) |

### Novos must-fix

| ID | Item | Gravidade | Correção | Critério de aceite |
|---|---|---|---|---|
| MF-17 | **V06: hook divergente** entre changelog e artefatos | Bloqueante | O changelog diz "Seu salário subiu. Então por que o mês continua apertado?"; SCRIPT e MAPA dizem "Você não está imaginando. Seu dinheiro compra menos." Decidir uma versão e atualizar os três arquivos | SCRIPT, STORYBOARD e RETENTION_MAP com o mesmo texto de abertura |
| MF-18 | **Mapas com o modelo antigo** (V03, V04, V06, V09) | Bloqueante | V03 ainda diz "Nota entrando/saindo menor"; V04 ainda prevê pergunta "quanto você tem"; V06 mantém título e hook antigos; V09 chama "Entender o dinheiro" de payoff | Coluna "Estímulo" descreve o que o `SCRIPT.md` v2 realmente mostra |
| MF-19 | **V04: CTA duplo** | Bloqueante | O changelog declara "CTA único"; o script mantém "Comente…" + "Siga para mais." | Um único pedido, ≤3 s |
| MF-20 | **Payoff em 70–79% em 7 de 10** | Alta | Antecipar o payoff ou cortar um beat anterior (V05 78,3%; V06 78,6%; V07 78,0%) | Payoff ≤65% do runtime ou justificativa registrada |
| MF-21 | **V08 cresceu para 41 s** e ganhou 2 beats pós-payoff | Alta | Decidir se o ganho de clareza vale 7 s; cortar 1 dos beats (31,0–33,1 ou 33,3–37,8) | ≤38 s ou justificativa registrada |
| MF-22 | **V02 com dois payoffs** (30,9 s e 33,8 s) | Média | Manter o mais forte ("A inflação não faz barulho…") e converter o outro em ponte curta | Um único fechamento |
| MF-23 | **V01 mantém a ponte sem informação** em 26,4–28,8 s | Média | Cortar ou substituir por consequência concreta | Nenhum bloco >1,5 s sem informação nova |

---

## 11.5 Divergências entre changelog, script e mapa

Estas não são hipóteses: são comparações diretas de texto entre arquivos.

| Item | Changelog afirma | Artefato mostra | Impacto |
|---|---|---|---|
| V06 hook | "Seu salário subiu. Então por que o mês continua apertado?" | SCRIPT: "Você não está imaginando. Seu dinheiro compra menos." | O vídeo pode ser animado com um hook que não é o aprovado no changelog |
| V03 modelo | "A nota entra e permanece; o que encolhe é a cesta" | MAPA: "Nota entrando/saindo menor" | O storyboard pode reintroduzir a metáfora errada |
| V04 CTA | "CTA único e pessoal" | SCRIPT: "Comente…" + "Siga para mais." | Dois pedidos em 13,3% do runtime |
| V09 payoff | "CTA 'Siga o Invest Fácil'" | MAPA: linha "Payoff \| Entender o dinheiro" | Um build de marca está rotulado como payoff |
| V02 payoff | "payoff 'O café continua o mesmo. O preço, não.'" | SCRIPT mantém também "A inflação não faz barulho…" | Dois fechamentos concorrentes |

A auditoria "217 verificações, 0 falhas" cobriu presença de seções, frases obsoletas e
checklists técnicos. **Não cobriu a correspondência semântica entre changelog, `SCRIPT.md` e
`RETENTION_MAP.md`.** É o gap mais caro desta rodada: o timing foi recalibrado, mas a camada
de risco/correção continua parcialmente na v1.

---

## 11.6 Novo top 3

Substitui a seção 7 da rodada 1.

### 1º — V01 · O ticker não para · 16,0
**Por quê:** melhor equilíbrio entre hook, progressão e fechamento. Densidade sob controle,
CTA de 3,4 s, payoff que responde ao hook. É a variante com menos risco estrutural.
**Limite:** ponte sem informação em 26,4–28,8 e payoff em 70%.
**Correção que destrava:** cortar a ponte e antecipar o payoff em 2 s.

### 2º — V06 · Não é impressão · 15,0
**Por quê:** melhor hook do conjunto (9,0) e o eixo salário × cesta, que nenhuma outra variante
explora. A lógica foi corrigida e há pausa intencional no miolo.
**Limite:** payoff em 78,6% e dois fechamentos que repetem o hook; além da divergência de
texto do hook entre arquivos.
**Correção que destrava:** resolver MF-17, cortar um dos beats finais e levar o payoff para ~70%.

### 3º — V02 · O café de sempre · 15,0
**Por quê:** o cold open transformou o hook mais fraco em um dos mais fortes. O arco emocional
continua sendo o melhor do conjunto e o payoff tem imagem concreta.
**Limite:** 42 s, dois fechamentos e bloco de simulação de 6,7 s.
**Correção que destrava:** manter um único payoff e cortar ~3 s.

**Suplentes:** V09 (14,5 — melhor hook, fechamento ainda é marca) e V03 (14,0 — modelo correto,
nome ainda em 4,5 s).

---

## 11.7 Novo maior risco de abandono

### Primário — payoff tardio (70–79% em 7 de 10)

A recalibração resolveu a compressão, mas empurrou a recompensa para o fim. A posição média do
payoff subiu de 64,5% para **71,4%** do runtime. Em V05 (78,3%), V06 (78,6%) e V07 (78,0%), o
espectador precisa esperar quase quatro quintos do vídeo pela frase que fecha o hook.

**Hipótese:** com o miolo agora mais legível, o risco deixou de ser "não entender" e passou a
ser "entender e ainda não receber". É um problema de ordem, não de conteúdo.

**Correção:** payoff ≤65% do runtime, ou corte de um beat anterior. Critério de aceite:
nenhuma variante com payoff acima de 70% sem justificativa registrada.

### Secundário — cauda pós-número ainda longa

Média de **32,0%** do vídeo depois do número (era 37,9%). V04: 53%. V07: 40,3%. V09: 37,8%.
V08: 35,4%. Nesses casos, o vídeo continua por 14–16 s depois de já ter entregado o dado.

**Correção:** cada segundo pós-número precisa conter consequência concreta, contraste ou
chamada. Caso contrário, cortar.

### Terciário — divergência documental

Não é risco de audiência; é risco de produção. V06 pode ser animado com o hook errado, V03 com
a metáfora antiga, V04 com dois CTAs. **Correção:** reconciliar os três arquivos antes do
primeiro frame.

### O que deixou de ser o maior risco

A densidade. Na rodada 1, a frase de simulação de 18–21 palavras em 4–6 s era o gargalo
principal. Agora todas as variantes estão entre 12,4 e 13,3 c/s, com pico estimado de 14–16 c/s.
O texto cabe. **O problema mudou de lugar: saiu da boca e foi para a ordem dos blocos.**

---

## 11.8 Nota de método e limites

- **Hipótese editorial, não medição.** Nenhuma retenção real foi observada. Não há curva,
  watch time, CTR, teste A/B ou publicação.
- **Caracteres/s** são orçamento de roteiro declarado no changelog (14,0 c/s de referência),
  não locução medida. O TTS não foi gerado.
- **Pico de densidade** é estimativa por bloco a partir do texto falado, com margem de ±1 c/s.
- **Posição do payoff** e **duração do CTA** são aritmética sobre timecodes de roteiro.
- **Nenhuma aprovação humana está sendo declarada.** A escolha de finalistas e de vencedor
  continua sendo do usuário.
- **O que ainda não existe:** TTS real, escuta humana, render, MP4, draft CapCut, licença
  comercial do edge-tts resolvida, enquadramento do Remotion confirmado.

**Conclusão da rodada 2:** o conjunto melhorou de forma mensurável em densidade e CTA, e V02
resolveu sua maior falha. A nova fragilidade é estrutural e mais fácil de corrigir do que a
anterior: **o payoff chega tarde e a documentação ainda não acompanhou o roteiro.**
