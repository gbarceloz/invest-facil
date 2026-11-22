"""Generate Gate 3 creative planning documents for the 10 Invest Fácil variants.

This script creates concepts, scripts, storyboards, editing timelines, sound plans,
retention maps and quality checklists. It does not render any video.
"""

import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
REPORTS = os.path.join(ROOT, "reports")
EVAL = os.path.join(ROOT, "evaluation")

CONCEPTS = [
    {
        "id": "V01",
        "title": "O ticker não para",
        "style": "The Scroll Stopper",
        "duration": "34 s",
        "audience": "Público amplo de Reels/TikTok, 18–40 anos, que sente os preços subirem.",
        "promise": "Mostrar, em ritmo de terminal financeiro, por que o número R$ 100 não conta a história toda.",
        "hook": "Se R$ 100 parece pouco, não é impressão.",
        "psych": "Pattern interrupt + prova visual imediata: um mural de preços em movimento com R$ 100 fixo no centro.",
        "structure": "Ticker de preços → R$ 100 imóvel → três perdas concretas → nome do fenômeno → simulação → payoff.",
        "metaphor": "Um painel de cotações que sobe ao redor de uma nota parada.",
        "editing": "Montagem de terminal: cortes de 1–2 s, punch-ins, whip pans, split-screen e micro-cortes sincronizados ao ticker.",
        "cut_freq": "1,2–1,8 s",
        "kinetic": "Números grandes, ticker, palavras ‘PREÇO’ e ‘PODER DE COMPRA’ com highlight amarelo.",
        "sound": "Pulso tech 110 BPM, clicks de ticker, impacts secos, risers curtos; sem melodia densa.",
        "transitions": "Whip pan, zoom punch, máscara horizontal; nenhuma transição decorativa.",
        "emotion": "Urgência e alerta.",
        "demo": "Três cards de produto sobem de preço enquanto a nota de R$ 100 fica parada; uma barra de poder de compra encolhe.",
        "ending": "O número é o mesmo. O poder de compra, não.",
        "cta": "Siga para entender a inflação no próximo vídeo.",
        "differentiation": "Único conceito de ticker/mural de preços; o protagonista é o contraste entre números em movimento e a nota fixa.",
        "risks": "Pode parecer excesso de estímulo se todos os cortes tiverem o mesmo peso; precisa de pausas curtas nos números-chave.",
        "narration": [
            ("0,0–0,8", "Se R$ 100 parece pouco...", "R$ 100", "R$ 100", "Punch-in no número", "impact"),
            ("0,8–2,4", "não é impressão.", "NÃO É IMPRESSÃO", "NÃO", "Whip pan para o ticker", "whoosh"),
            ("2,4–5,0", "Os preços não sobem todos de uma vez. Eles se movem o tempo todo.", "OS PREÇOS SE MOVEM", "preços", "Montagem de 3 preços", "ticks"),
            ("5,0–8,0", "Enquanto isso, o seu R$ 100 continua com o mesmo número.", "R$ 100", "mesmo número", "Split-screen nota x preços", "click"),
            ("8,0–12,0", "Mas ele compra menos café, menos pão, menos transporte.", "MENOS CAFÉ · MENOS PÃO · MENOS TRANSPORTE", "menos", "Três cortes rápidos", "whoosh x3"),
            ("12,0–15,0", "Isso tem nome: inflação.", "INFLAÇÃO", "INFLAÇÃO", "Corte seco + bass hit", "impact"),
            ("15,0–19,0", "É a alta generalizada dos preços. E ela corrói o poder de compra.", "PODER DE COMPRA", "poder de compra", "Barra encolhendo", "sub drop"),
            ("19,0–23,0", "Em uma simulação de 5% ao ano, R$ 100 valem cerca de R$ 61 em 10 anos.", "SIMULAÇÃO · 5% AO ANO", "R$ 61", "Contador 100 → 61", "ticks"),
            ("23,0–26,0", "O número é o mesmo. O poder de compra, não.", "MESMO NÚMERO / MENOS PODER", "poder de compra", "Split-screen", "impact"),
            ("26,0–29,0", "Entender isso é o primeiro passo.", "ENTENDER É O PRIMEIRO PASSO", "primeiro passo", "Logo hint", "riser"),
            ("29,0–34,0", "Siga para ver o próximo aumento antes que ele chegue.", "SIGA", "SIGA", "End card", "brand sting"),
        ],
        "shots": [
            ("0,0–2,4", "Parede de preços em movimento; R$ 100 entra no centro e congela.", "Push-in rápido; números deslizam em parallax.", "R$ 100 / NÃO É IMPRESSÃO", "Impact + whoosh"),
            ("2,4–5,0", "Cinco etiquetas de preço hipotéticas sobem em ritmo de ticker.", "Câmera lateral; corte a cada 0,6 s.", "PREÇOS", "Ticks"),
            ("5,0–8,0", "Nota abstrata de R$ 100 em uma metade; preços na outra.", "Split-screen; leve pan.", "MESMO NÚMERO", "Click"),
            ("8,0–12,0", "Café, pão e transporte aparecem e saem de cena.", "Macro cuts; whip pan entre objetos.", "MENOS CAFÉ / PÃO / TRANSPORTE", "Whooshes"),
            ("12,0–15,0", "A palavra INFLAÇÃO ocupa a tela.", "Zoom punch; fundo escurece.", "INFLAÇÃO", "Bass impact"),
            ("15,0–19,0", "Barra de poder de compra encolhe de 100% a 61%.", "Câmera fixa; foco na barra.", "PODER DE COMPRA", "Sub drop"),
            ("19,0–23,0", "Contador de R$ 100 para R$ 61,39.", "Push-in no número.", "SIMULAÇÃO · 5% AO ANO", "Ticks"),
            ("23,0–26,0", "Nota e cesta lado a lado; cesta perde itens.", "Split-screen; corte seco.", "MESMO NÚMERO / MENOS PODER", "Impact"),
            ("26,0–29,0", "Linha amarela vira assinatura Invest Fácil.", "Pull-out; logo entra.", "ENTENDER É O PRIMEIRO PASSO", "Riser"),
            ("29,0–34,0", "End card preto/amarelo com CTA.", "Fade curto.", "SIGA", "Brand sting"),
        ],
        "retention": [
            ("0–3 s", "Interromper a rolagem", "Parede de preços + R$ 100 congelado", "Hook visual pode parecer só mais um vídeo de números", "Abrir com a frase e o impacto no primeiro frame; sem logo"),
            ("3–8 s", "Criar curiosidade", "Ticker em movimento + pergunta implícita", "Explicação lenta", "Cortes de 1,2 s e três exemplos concretos"),
            ("8–15 s", "Demonstrar", "Café, pão e transporte", "Excesso de informação", "Um item por corte; sem texto extra"),
            ("15–23 s", "Explicar", "Barra e contador", "Número abstrato", "Ligar 61,39 a uma barra visual e ao rótulo simulação"),
            ("23–29 s", "Payoff", "Split-screen + frase", "Repetição", "Fechar com a mesma frase do hook, invertida"),
            ("29–34 s", "CTA", "End card", "CTA longo", "Uma frase e um botão visual; parar"),
        ],
        "quality": ["Garantir que o número 61,39 apareça como simulação.", "Não usar preços reais sem fonte.", "Não deixar o ticker cobrir o texto principal.", "Inspecionar frame 0."],
    },
    {
        "id": "V02",
        "title": "O café de sempre",
        "style": "Cinematic Storytelling",
        "duration": "45 s",
        "audience": "Público 25–45, que valoriza narrativa e se identifica com pequenos rituais.",
        "promise": "Contar a inflação através de um ritual cotidiano: o mesmo café, o mesmo orçamento, menos troco.",
        "hook": "Até o dia em que o dinheiro não deu.",
        "psych": "Transporte narrativo: o cold open entrega a quebra e o espectador quer saber como o ritual chegou ali.",
        "structure": "Cold open com a quebra → flashback do ritual → repetição → troco menor → retorno à quebra → explicação → resolução silenciosa.",
        "metaphor": "A xícara e a nota sobre o balcão; o tempo passa pela luz e pelo troco.",
        "editing": "Planos de 2–4 s, match cuts na xícara/nota, slow push e cortes motivados pela luz.",
        "cut_freq": "2,0–3,0 s",
        "kinetic": "Tipografia esparsa: R$ 100, MESMO CAFÉ, MENOS TROCO; uma palavra por plano.",
        "sound": "Ambiência de café, piano/pad contido, sub suave; silêncio na realização.",
        "transitions": "Match cut, light sweep, fade curto; sem whip pan.",
        "emotion": "Reconhecimento e melancolia.",
        "demo": "O mesmo pedido, o mesmo R$ 100, e um troco que encolhe até não dar.",
        "ending": "A inflação não faz barulho. Ela aparece no troco.",
        "cta": "Salve para lembrar quando o preço parecer ‘do nada’.",
        "differentiation": "Único com personagem/ritual e arco emocional; o produto é o café, não um gráfico.",
        "risks": "Pode ficar lento se os planos não tiverem variação de luz e enquadramento.",
        "narration": [
            ("0,0–2,0", "Todo dia, ele comprava o mesmo café.", "TODO DIA, O MESMO CAFÉ", "mesmo café", "Close na xícara", "ambience"),
            ("2,0–4,5", "O mesmo pedido. O mesmo R$ 100 no bolso.", "R$ 100", "R$ 100", "Nota no balcão", "coin"),
            ("4,5–8,0", "No começo, sobrava troco.", "SOBRAVA TROCO", "troco", "Recibo sobre a mesa", "paper"),
            ("8,0–12,0", "Depois, o troco foi ficando menor.", "O TROCO DIMINUIU", "menor", "Time-lapse de xícaras", "clock"),
            ("12,0–16,0", "Até o dia em que o dinheiro não deu.", "NÃO DEU", "não deu", "Pausa; mão segura a nota", "silence"),
            ("16,0–20,0", "Não foi o café que ficou mais caro de repente.", "NÃO FOI O CAFÉ", "café", "Close na xícara", "piano"),
            ("20,0–25,0", "Foi a inflação: os preços sobem, e o dinheiro compra menos.", "INFLAÇÃO", "inflação", "Linha sobe sobre o balcão", "sub"),
            ("25,0–31,0", "Em 10 anos, com 5% ao ano, R$ 100 viram cerca de R$ 61.", "SIMULAÇÃO · 5% AO ANO", "R$ 61", "Gráfico minimalista", "ticks"),
            ("31,0–36,0", "O café continua o mesmo. O poder de compra, não.", "MESMO CAFÉ / MENOS PODER", "poder de compra", "Match cut xícara/nota", "impact"),
            ("36,0–40,0", "A inflação não faz barulho. Ela aparece no troco.", "ELA APARECE NO TROCO", "troco", "Slow push no troco", "piano"),
            ("40,0–45,0", "Salve para lembrar quando o preço parecer ‘do nada’."  , "SALVE", "SALVE", "End card", "brand"),
        ],
        "shots": [
            ("0,0–2,0", "Xícara vazia; a nota ao lado.", "Close; luz fria.", "ATÉ O DIA EM QUE NÃO DEU", "Silêncio"),
            ("2,0–4,5", "Flashback: xícara cheia, luz quente.", "Slow push; parallax.", "O MESMO CAFÉ, TODO DIA", "Ambiência"),
            ("4,5–8,0", "Recibo e troco sobre o balcão.", "Macro; foco no troco.", "SOBRAVA TROCO", "Papel"),
            ("8,0–12,0", "Série de xícaras iguais em time-lapse.", "Cortes/match cuts; luz muda.", "O TROCO DIMINUIU", "Relógio"),
            ("12,0–16,0", "Mão pousa a nota; xícara vazia.", "Plano fixo; silêncio.", "NÃO DEU", "Silêncio"),
            ("16,0–20,0", "Close na xícara; o troco ao lado parece menor.", "Push-in lento.", "NÃO FOI O CAFÉ", "Piano"),
            ("20,0–25,0", "Linha de preço sobe atrás da xícara.", "Parallax; linha amarela.", "INFLAÇÃO", "Sub"),
            ("25,0–31,0", "Gráfico minimalista 100 → 61.", "Câmera fixa; linha se desenha.", "SIMULAÇÃO · 5% AO ANO", "Ticks"),
            ("31,0–36,0", "Xícara e nota em split-screen.", "Match cut; contraste.", "MESMO CAFÉ / TROCO MENOR", "Impact"),
            ("36,0–45,0", "Troco pequeno; logo entra.", "Slow push; fade.", "ELA APARECE NO TROCO / SALVE", "Piano + brand"),
        ],
        "retention": [
            ("0–3 s", "Criar tensão", "Xícara vazia + frase de quebra", "Parecer devagar", "Cold open: ‘até o dia em que não deu’"),
            ("3–8 s", "Curiosidade", "Repetição do ritual e troco", "Explicação antecipada", "Mostrar o troco sem explicar"),
            ("8–15 s", "Tensão", "Troco menor e pausa", "Visual repetitivo", "Variar luz/enquadramento a cada 2–3 s"),
            ("15–23 s", "Revelação", "Nomear inflação", "Didatismo", "Explicar em uma frase e voltar ao café"),
            ("23–31 s", "Prova", "Gráfico 100 → 61", "Número frio", "Ligar o gráfico ao troco"),
            ("31–45 s", "Payoff/CTA", "Frase e marca", "Encerramento longo", "Fechar o payoff e deixar 3 s de CTA"),
        ],
        "quality": ["Não usar rosto real sem autorização; mãos/objetos bastam.", "Garantir que a simulação de 5% esteja visível.", "Evitar trilha que cubra a narração.", "Não romantizar a perda de poder de compra."],
    },
    {
        "id": "V03",
        "title": "A máquina de encolher dinheiro",
        "style": "Visual Experiment",
        "duration": "35 s",
        "audience": "Público visual, 18–35, que responde a objetos, transformações e curiosidade.",
        "promise": "Fazer o espectador ver a inflação como uma transformação física, sem depender de explicação longa.",
        "hook": "O dinheiro entra inteiro. Sai menor.",
        "psych": "Puzzle visual: o cérebro quer entender como a compra encolhe.",
        "structure": "Máquina → transformação → nome → demonstração → consequência.",
        "metaphor": "Uma máquina/conveyor que comprime o poder de compra; a nota passa intacta e a cesta encolhe.",
        "editing": "Match cuts, morphing, macro, object transitions; 1,5–2,5 s.",
        "cut_freq": "1,5–2,5 s",
        "kinetic": "Verbos de transformação: ENTRA, SAI, ENCOLHE; números só no fim.",
        "sound": "Mecânica, engrenagens, material, impactos industriais; textura tech.",
        "transitions": "Shape morph, match cut, mask; a cesta encolhe.",
        "emotion": "Curiosidade e assombro.",
        "demo": "A nota passa intacta pela máquina; a cesta e o que ela compra saem menores.",
        "ending": "A inflação não rasga o dinheiro. Ela diminui o que ele compra.",
        "cta": "Compartilhe com quem acha que dinheiro parado não muda.",
        "differentiation": "Único objeto-driven, com máquina e transformação física; sem narrador em cena.",
        "risks": "Pode ficar abstrato demais; precisa de uma frase-ponte clara no meio.",
        "narration": [
            ("0,0–2,0", "O dinheiro entra inteiro.", "ENTRA INTEIRO", "inteiro", "Nota entra na máquina", "mechanical"),
            ("2,0–4,0", "Sai menor.", "SAI MENOR", "menor", "Nota menor sai", "clunk"),
            ("4,0–7,0", "Não é mágica. É inflação.", "INFLAÇÃO", "inflação", "Engrenagens", "impact"),
            ("7,0–11,0", "Os preços sobem. A mesma quantia compra menos.", "A MESMA QUANTIA", "menos", "Itens da cesta somem", "whoosh"),
            ("11,0–15,0", "O número na nota não muda.", "O NÚMERO NÃO MUDA", "número", "Macro na nota", "click"),
            ("15,0–19,0", "Mas o que ele compra, sim.", "O QUE ELE COMPRA MUDA", "compra", "Split nota/cesta", "sub"),
            ("19,0–23,0", "Em uma simulação de 5% ao ano, R$ 100 valem cerca de R$ 61 em 10 anos.", "SIMULAÇÃO · 5% AO ANO", "R$ 61", "Contador", "ticks"),
            ("23,0–27,0", "A inflação não rasga o dinheiro.", "NÃO RASGA", "não rasga", "Nota intacta", "paper"),
            ("27,0–31,0", "Ela diminui o que ele compra.", "DIMINUI O QUE ELE COMPRA", "diminui", "Cesta 4/5", "impact"),
            ("31,0–35,0", "Compartilhe com quem acha que dinheiro parado não muda.", "COMPARTILHE", "COMPARTILHE", "End card", "brand"),
        ],
        "shots": [
            ("0,0–2,0", "Nota abstrata entra em uma máquina de rolos.", "Macro; luz lateral.", "ENTRA INTEIRO", "Mecânica"),
            ("2,0–4,0", "Cesta menor sai na esteira; a nota segue intacta.", "Top-down; movimento contínuo.", "O QUE ELA COMPRA SAI MENOR", "Clunk"),
            ("4,0–7,0", "Engrenagens e linha amarela; palavra INFLAÇÃO.", "Push-in; parallax.", "INFLAÇÃO", "Impact"),
            ("7,0–11,0", "Cesta com 5 itens; itens somem um a um.", "Câmera fixa; cortes secos.", "A MESMA QUANTIA", "Whoosh"),
            ("11,0–15,0", "Macro na nota; número 100 intacto.", "Macro; foco raso.", "O NÚMERO NÃO MUDA", "Click"),
            ("15,0–19,0", "Split nota/cesta; cesta menor.", "Split-screen; linha amarela.", "O QUE ELE COMPRA MUDA", "Sub"),
            ("19,0–23,0", "Contador 100 → 61,39.", "Push-in; números tabulares.", "SIMULAÇÃO · 5% AO ANO", "Ticks"),
            ("23,0–27,0", "Nota intacta sobre mesa; nada rasgado.", "Plano fixo; textura.", "NÃO RASGA", "Papel"),
            ("27,0–31,0", "Cesta com 3 de 5 itens; selo 3/5.", "Corte seco; zoom.", "DIMINUI O QUE ELE COMPRA", "Impact"),
            ("31,0–35,0", "Máquina desliga; logo/CTA.", "Pull-out; fade.", "COMPARTILHE", "Brand"),
        ],
        "retention": [
            ("0–3 s", "Puzzle visual", "Nota entra intacta; cesta sai menor", "Metáfora não compreendida", "Frase ‘a nota entra inteira; o que ela compra, não’ ancora"),
            ("3–7 s", "Nomear", "INFLAÇÃO", "Explicação longa", "Uma frase e volta ao objeto"),
            ("7–15 s", "Demonstrar", "Cesta perdendo itens", "Abstração", "Itens concretos e contagem"),
            ("15–23 s", "Prova", "Contador 61,39", "Número sem contexto", "Ligar ao número da nota"),
            ("23–31 s", "Consequência", "Nota intacta + cesta menor", "Repetição", "Contraste visual forte"),
            ("31–35 s", "CTA", "Compartilhe", "CTA genérico", "Pedir compartilhamento com motivo"),
        ],
        "quality": ["Garantir que a máquina não pareça lavagem de dinheiro.", "Não usar nota real; forma abstrata.", "Simulação de 5% visível.", "Transições de morphing precisam de teste."],
    },
    {
        "id": "V04",
        "title": "R$ 100 em 30 segundos",
        "style": "Fast Paced Edit",
        "duration": "30 s",
        "audience": "TikTok/Shorts, 16–30, consumo rápido e quizzes.",
        "promise": "Responder em 30 segundos quanto R$ 100 compra — e por que a resposta muda com o tempo.",
        "hook": "R$ 100. Quanto isso compra? Depende do ano.",
        "psych": "Pergunta direta + resposta rápida: o espectador quer a resposta antes dos 30 s.",
        "structure": "Pergunta → três comparações rápidas → resposta → consequência → CTA.",
        "metaphor": "Cards de preço em split-screen e um cronômetro de 30 s.",
        "editing": "0,8–1,8 s por corte; speed ramps; punch-ins; match cuts; glitch controlado.",
        "cut_freq": "0,8–1,8 s",
        "kinetic": "Números grandes, ANTES/DEPOIS/HOJE, contagem regressiva.",
        "sound": "120 BPM, clicks, whooshes, impacts, glitch; energia máxima.",
        "transitions": "Zoom, whip, glitch, hard cuts.",
        "emotion": "Adrenalina e clareza.",
        "demo": "Cesta de 5 itens; +25% → 4 de 5; 5% ao ano → R$ 61.",
        "ending": "O número é o mesmo. O poder de compra, não.",
        "cta": "Comente: o que ficou mais caro para você?",
        "differentiation": "Único em formato de resposta cronometrada; a estrutura é pergunta-resposta, não história.",
        "risks": "Ritmo pode atropelar a compreensão; precisa de dois momentos de respiro.",
        "narration": [
            ("0,0–1,5", "R$ 100. Quanto isso compra?", "R$ 100", "R$ 100", "Punch-in", "impact"),
            ("1,5–3,0", "Depende do ano.", "DEPENDE DO ANO", "ano", "Whip pan", "whoosh"),
            ("3,0–5,0", "Hoje: uma cesta.", "HOJE", "hoje", "Cesta entra", "click"),
            ("5,0–7,0", "Com os preços 25% maiores: quatro de cinco itens.", "SIMULAÇÃO · PREÇOS +25% · 4 DE 5", "4 de 5", "Itens somem", "whoosh"),
            ("7,0–9,0", "Em 10 anos, a 5% ao ano: cerca de R$ 61.", "SIMULAÇÃO · R$ 61", "R$ 61", "Contador", "ticks"),
            ("9,0–12,0", "O número é o mesmo. O poder de compra, não.", "MESMO NÚMERO", "poder de compra", "Split", "impact"),
            ("12,0–15,0", "Não é sobre quanto você tem.", "NÃO É O QUANTO VOCÊ TEM", "quanto", "Texto grande", "sub"),
            ("15,0–18,0", "É sobre o que esse dinheiro compra.", "É SOBRE O QUE COMPRA", "compra", "Cesta", "click"),
            ("18,0–21,0", "Entender inflação muda a forma como você olha o preço.", "OLHE O PREÇO", "preço", "Recibo", "riser"),
            ("21,0–24,0", "O número é o mesmo. O poder de compra, não.", "MESMO NÚMERO / MENOS PODER", "poder de compra", "Split", "impact"),
            ("24,0–27,0", "Comente: quanto você acha que R$ 100 compra em 10 anos?", "COMENTE", "COMENTE", "End card", "brand"),
            ("27,0–30,0", "Siga para mais explicações rápidas.", "SIGA", "SIGA", "Logo", "sting"),
        ],
        "shots": [
            ("0,0–1,5", "Número R$ 100 ocupa a tela; cronômetro começa.", "Punch-in; blur curto.", "R$ 100", "Impact"),
            ("1,5–3,0", "Três cards de ano (hoje, 5a, 10a).", "Whip pan; split.", "DEPENDE DO ANO", "Whoosh"),
            ("3,0–5,0", "Cesta com 5 itens.", "Top-down; cards entram.", "HOJE", "Click"),
            ("5,0–7,0", "Preços +25%; um item sai; restam quatro de cinco.", "Cortes secos; zoom.", "SIMULAÇÃO · PREÇOS +25% · 4 DE 5", "Whoosh"),
            ("7,0–9,0", "Contador 100 → 61,39.", "Push-in; ticks.", "SIMULAÇÃO · R$ 61", "Ticks"),
            ("9,0–12,0", "Split nota/cesta.", "Corte seco.", "MESMO NÚMERO", "Impact"),
            ("12,0–15,0", "Pergunta ‘quanto você tem?’ em tipografia.", "Zoom; text reveal.", "NÃO É O QUANTO VOCÊ TEM", "Sub"),
            ("15,0–18,0", "Cesta com 3 itens; recibo.", "Match cut.", "É SOBRE O QUE COMPRA", "Click"),
            ("18,0–21,0", "Recibo com linha de inflação.", "Macro; push.", "OLHE O PREÇO", "Riser"),
            ("21,0–30,0", "Frase final + CTA de comentário.", "Hard cuts; logo.", "COMENTE", "Impact + brand"),
        ],
        "retention": [
            ("0–3 s", "Parar a rolagem", "Pergunta + cronômetro", "Parecer mais um quiz genérico", "Prometer resposta concreta em 30 s"),
            ("3–7 s", "Prender", "Cesta e preços +25%", "Informação demais", "Uma pergunta por corte"),
            ("7–12 s", "Responder", "61,39 e split", "Número abstrato", "Ligar ao preço da cesta"),
            ("12–18 s", "Reenquadrar", "Pergunta ‘quanto você tem’", "Repetição", "Mudar o eixo para poder de compra"),
            ("18–24 s", "Payoff", "Recibo e frase", "Cansaço", "Acelerar e fechar"),
            ("24–30 s", "CTA", "Comente", "CTA genérico", "Uma pergunta pessoal"),
        ],
        "quality": ["Não exceder 30 s.", "Não usar 25% como dado real; é simulação.", "Garantir leitura do 61,39.", "Testar em tela pequena."],
    },
    {
        "id": "V05",
        "title": "Uma nota sobre a mesa",
        "style": "Minimalist Premium",
        "duration": "40 s",
        "audience": "Público 25–50, que valoriza sofisticação, clareza e baixa poluição.",
        "promise": "Explicar a inflação com uma única nota, uma mesa e uma linha que cai.",
        "hook": "R$ 100 não é só um número.",
        "psych": "Restrição visual e silêncio criam expectativa; o espectador presta atenção ao essencial.",
        "structure": "Objeto → poder de compra → linha → explicação → marca.",
        "metaphor": "Uma nota sobre a mesa; uma linha fina representa o poder de compra.",
        "editing": "Planos de 2,5–4 s, slow push, cortes precisos; muito espaço negativo.",
        "cut_freq": "2,5–4,0 s",
        "kinetic": "Poucas palavras, tipografia grande e elegante; uma ideia por plano.",
        "sound": "Room tone, piano mínimo, sub; silêncio antes do número.",
        "transitions": "Cortes secos, light sweep, fade.",
        "emotion": "Confiança e sofisticação.",
        "demo": "Linha de 100 cai para 61; nota intacta.",
        "ending": "O valor está impresso. O que ele compra ficou menor.",
        "cta": "Salve para consultar quando o preço mudar.",
        "differentiation": "Único quase silencioso, com um objeto e uma linha; o luxo está na restrição.",
        "risks": "Pode ser lento demais para TikTok; precisa de micro-movimentos e cortes precisos.",
        "narration": [
            ("0,0–2,5", "R$ 100 não é só um número.", "R$ 100", "R$ 100", "Slow push na nota", "room tone"),
            ("2,5–5,0", "É uma promessa de compra.", "UMA PROMESSA DE COMPRA", "promessa", "Nota na mesa", "piano"),
            ("5,0–9,0", "Mas essa promessa não tem o mesmo tamanho para sempre.", "NÃO TEM O MESMO TAMANHO", "tamanho", "Linha fina surge", "sub"),
            ("9,0–13,0", "Quando os preços sobem, o dinheiro perde poder de compra.", "PODER DE COMPRA", "poder de compra", "Linha desce", "tick"),
            ("13,0–18,0", "O valor impresso continua igual.", "VALOR IMPRESSO", "impresso", "Macro na nota", "click"),
            ("18,0–23,0", "O que ele compra, não.", "O QUE ELE COMPRA", "compra", "Espaço negativo", "silence"),
            ("23,0–30,0", "Em 10 anos, com 5% ao ano, R$ 100 valem cerca de R$ 61.", "SIMULAÇÃO · 5% AO ANO", "R$ 61", "Número 61", "sub"),
            ("30,0–35,0", "O valor está impresso. O poder de compra, não.", "IMPRESSO / NÃO", "poder de compra", "Split minimalista", "impact"),
            ("35,0–40,0", "Salve para consultar.", "SALVE", "plataforma", "Logo", "brand"),
        ],
        "shots": [
            ("0,0–2,5", "Nota abstrata sobre mesa preta; luz única.", "Slow push; sombra longa.", "R$ 100", "Room tone"),
            ("2,5–5,0", "Frase ‘uma promessa de compra’ ao lado da nota.", "Plano fixo; tipografia entra.", "UMA PROMESSA DE COMPRA", "Piano"),
            ("5,0–9,0", "Linha amarela fina atravessa a mesa.", "Parallax leve.", "NÃO TEM O MESMO TAMANHO", "Sub"),
            ("9,0–13,0", "Linha desce; nota permanece.", "Câmera fixa; foco na linha.", "PODER DE COMPRA", "Tick"),
            ("13,0–18,0", "Macro no número 100 impresso.", "Macro; textura.", "VALOR IMPRESSO", "Click"),
            ("18,0–23,0", "Vazio ao redor da nota; só a mesa e a luz.", "Plano amplo; silêncio.", "O QUE ELE COMPRA", "Silêncio"),
            ("23,0–30,0", "Número 61,39 surge no fim da linha.", "Push-in lento.", "SIMULAÇÃO · 5% AO ANO", "Sub"),
            ("30,0–35,0", "Split nota/61; frase final.", "Corte seco.", "IMPRESSO / NÃO", "Impact"),
            ("35,0–40,0", "Logo e CTA.", "Fade.", "SALVE", "Brand"),
        ],
        "retention": [
            ("0–3 s", "Prender pelo silêncio", "Nota + luz", "Parecer estático", "Slow push e som mínimo"),
            ("3–9 s", "Curiosidade", "Linha surge", "Explicação abstrata", "Uma frase por plano"),
            ("9–18 s", "Demonstrar", "Linha desce / nota intacta", "Tédio", "Micro-movimentos e cortes precisos"),
            ("18–23 s", "Pausa", "Vazio e silêncio", "Queda de estímulo", "Silêncio curto, não prolongado"),
            ("23–30 s", "Prova", "61,39", "Número frio", "Ligar ao valor impresso"),
            ("30–40 s", "Payoff/CTA", "Frase e logo", "CTA longo", "Fechar o payoff e deixar 3 s de CTA"),
        ],
        "quality": ["Não deixar a nota parecer real; forma abstrata.", "Garantir que o silêncio não pareça falha de áudio.", "Manter contraste alto.", "Testar em tela pequena."],
    },
    {
        "id": "V06",
        "title": "Não é impressão",
        "style": "Psychological Hook",
        "duration": "38 s",
        "audience": "Adultos 25–45 que sentem o salário render menos e querem validação.",
        "promise": "Validar uma sensação comum e explicar por que ela acontece.",
        "hook": "Você não está imaginando. Seu dinheiro compra menos.",
        "psych": "Validação + quebra de crença: o espectador se reconhece e quer entender.",
        "structure": "Pergunta salarial → validação → split salário/preços → nome → prova → payoff.",
        "metaphor": "Espelho/dualidade: o salário nominal sobe; o que ele compra diminui.",
        "editing": "Jump cuts, split-screen, punch-ins, text overlays; 1,5–2,5 s.",
        "cut_freq": "1,8–2,5 s",
        "kinetic": "SALÁRIO / CESTA / NÃO É IMPRESSÃO; palavras em conflito visual.",
        "sound": "Pulso inquieto, reversed impacts, sub drops; música low.",
        "transitions": "Split-screen, mask, jump cut.",
        "emotion": "Validação e surpresa.",
        "demo": "Salário nominal vs cesta real; 5% ao ano.",
        "ending": "Não é impressão. É inflação.",
        "cta": "Salve para entender quando o salário não acompanha.",
        "differentiation": "Único com eixo psicológico/salarial e split-screen de crença.",
        "risks": "Pode parecer reclamação política; manter foco em educação e dados.",
        "narration": [
            ("0,0–2,0", "Você não está imaginando.", "NÃO É IMPRESSÃO", "NÃO", "Close text", "sub"),
            ("2,0–5,0", "Seu dinheiro compra menos.", "COMPRA MENOS", "menos", "Cesta encolhe", "whoosh"),
            ("5,0–8,0", "O salário pode até subir.", "SALÁRIO", "salário", "Split salário", "click"),
            ("8,0–11,0", "Mas a cesta também sobe.", "CESTA", "cesta", "Split cesta", "impact"),
            ("11,0–15,0", "É a inflação: alta generalizada dos preços.", "INFLAÇÃO", "inflação", "Bass", "impact"),
            ("15,0–19,0", "Ela corrói o poder de compra sem fazer barulho.", "PODER DE COMPRA", "poder de compra", "Linha cai", "sub"),
            ("19,0–24,0", "Em 10 anos, com 5% ao ano, R$ 100 valem cerca de R$ 61.", "SIMULAÇÃO · R$ 61", "R$ 61", "Contador", "ticks"),
            ("24,0–28,0", "Não é impressão.", "NÃO É IMPRESSÃO", "NÃO", "Espelho", "impact"),
            ("28,0–32,0", "É inflação.", "É INFLAÇÃO", "inflação", "Frase final", "sub"),
            ("32,0–38,0", "Salve para entender quando o salário não acompanha.", "SALVE", "SALVE", "End card", "brand"),
        ],
        "shots": [
            ("0,0–1,3", "Close no contracheque; o número do salário sobe.", "Push-in; texto.", "SALÁRIO", "Click"),
            ("1,4–4,1", "Split salário/cesta; a pergunta ocupa a tela.", "Split; zoom.", "POR QUÊ?", "Sub"),
            ("4,3–8,0", "Texto ‘VOCÊ NÃO ESTÁ IMAGINANDO’ em close.", "Push-in; blur.", "NÃO É IMPRESSÃO", "Sub"),
            ("8,1–11,6", "Salário e cesta lado a lado.", "Split; parallax.", "SALÁRIO x CESTA", "Click"),
            ("11,7–15,1", "Salário sobe; preços sobem mais.", "Split salário/preços; gráfico.", "SALÁRIO x PREÇOS", "Click"),
            ("15,2–19,5", "Cesta mais cara; itens saem.", "Split cesta; zoom.", "CESTA", "Impact"),
            ("19,6–22,9", "Palavra INFLAÇÃO no encontro dos dois lados.", "Zoom; bass.", "INFLAÇÃO", "Bass"),
            ("23,1–26,5", "Linha de poder de compra cai.", "Parallax.", "PODER DE COMPRA", "Sub"),
            ("26,6–33,2", "Contador 100 → 61.", "Push-in.", "SIMULAÇÃO · R$ 61", "Ticks"),
            ("33,4–35,4", "Espelho: número vs cesta; frase.", "Split; reflexo.", "É INFLAÇÃO", "Impact"),
            ("35,6–39,2", "End card com CTA.", "Fade.", "SALVE", "Brand"),
        ],
        "retention": [
            ("0–3 s", "Perguntar", "Pergunta salarial + split", "Parecer desabafo", "Prometer explicação, não lamentação"),
            ("3–8 s", "Curiosidade", "Salário vs cesta", "Polarização", "Foco em poder de compra, não política"),
            ("8–15 s", "Nomear", "INFLAÇÃO", "Didatismo", "Uma frase clara"),
            ("15–24 s", "Prova", "61,39", "Número frio", "Ligar ao salário/cesta"),
            ("24–32 s", "Payoff", "Espelho + frase", "Repetição", "Fechar o payoff e deixar 3 s de CTA"),
            ("32–38 s", "CTA", "Salve", "CTA longo", "Uma frase"),
        ],
        "quality": ["Não politizar.", "Não prometer aumento de salário.", "Simulação 5% visível.", "Cuidar do split-screen em celular."],
    },
    {
        "id": "V07",
        "title": "A linha que explica seu bolso",
        "style": "Data Visualization",
        "duration": "42 s",
        "audience": "Público 25–50, analítico, que gosta de gráficos e quer clareza.",
        "promise": "Explicar a inflação com uma linha simples e uma simulação transparente.",
        "hook": "Essa linha explica por que seu dinheiro vale menos.",
        "psych": "Clareza visual + curiosidade pelo número final.",
        "structure": "Linha começa em 100 → cai → 5 anos → 10 anos → consequência → CTA.",
        "metaphor": "Uma linha descendente que vira o gráfico do poder de compra.",
        "editing": "Chart draw contínuo, data transitions, punch-ins; 2–3 s.",
        "cut_freq": "2,0–3,0 s",
        "kinetic": "Números tabulares, eixos, labels; tipografia técnica.",
        "sound": "Ticks, risers, UI digital, minimal tech; música discreta.",
        "transitions": "Chart wipes, zoom, cut.",
        "emotion": "Clareza e confiança.",
        "demo": "100 → 78 (5 anos) → 61 (10 anos) com 5% ao ano.",
        "ending": "Simulação com 5% ao ano. Salve para consultar.",
        "cta": "Salve para consultar quando falarem de inflação.",
        "differentiation": "Único data-first; o gráfico é o protagonista e a narrativa segue os números.",
        "risks": "Pode ser frio; precisa de analogia curta e som humano.",
        "narration": [
            ("0,0–2,0", "Essa linha explica por que seu dinheiro vale menos.", "PODER DE COMPRA", "linha", "Linha começa", "tick"),
            ("2,0–6,0", "Ela começa em R$ 100.", "R$ 100", "R$ 100", "Ponto 0", "click"),
            ("6,0–11,0", "Com 5% de inflação ao ano, ela cai.", "5% AO ANO", "5%", "Linha desce", "riser"),
            ("11,0–16,0", "Em 5 anos, cerca de R$ 78.", "R$ 78", "R$ 78", "Ponto 5a", "tick"),
            ("16,0–22,0", "Em 10 anos, cerca de R$ 61.", "R$ 61", "R$ 61", "Ponto 10a", "impact"),
            ("22,0–27,0", "O número na conta não mudou.", "O NÚMERO NÃO MUDOU", "número", "Split", "sub"),
            ("27,0–32,0", "O que ele compra, sim.", "O QUE ELE COMPRA", "compra", "Cesta", "whoosh"),
            ("32,0–37,0", "Isso é inflação. E é por isso que entender importa.", "INFLAÇÃO", "inflação", "Highlight", "impact"),
            ("37,0–42,0", "Simulação com 5% ao ano. Salve para consultar.", "SIMULAÇÃO · SALVE", "SIMULAÇÃO", "End card", "brand"),
        ],
        "shots": [
            ("0,0–2,0", "Fundo preto; linha amarela começa a se desenhar.", "Câmera fixa; grid surge.", "PODER DE COMPRA", "Tick"),
            ("2,0–6,0", "Ponto 0 com R$ 100.", "Push-in no ponto.", "R$ 100", "Click"),
            ("6,0–11,0", "Linha desce; eixo 5% ao ano.", "Pan horizontal.", "SIMULAÇÃO · 5% AO ANO", "Riser"),
            ("11,0–16,0", "Ponto 5 anos com R$ 78.", "Zoom no ponto.", "SIMULAÇÃO · R$ 78", "Tick"),
            ("16,0–22,0", "Ponto 10 anos com R$ 61; área preenche.", "Push-in.", "SIMULAÇÃO · R$ 61", "Impact"),
            ("22,0–27,0", "Split nota/gráfico.", "Corte seco.", "O NÚMERO NÃO MUDOU", "Sub"),
            ("27,0–32,0", "Cesta perde itens ao lado da linha.", "Parallax.", "O QUE ELE COMPRA", "Whoosh"),
            ("32,0–37,0", "Palavra INFLAÇÃO + resumo.", "Zoom; texto.", "INFLAÇÃO", "Impact"),
            ("37,0–42,0", "Selos SIMULAÇÃO e CTA.", "End card.", "SIMULAÇÃO · SALVE", "Brand"),
        ],
        "retention": [
            ("0–3 s", "Curiosidade", "Linha se desenhando", "Parecer aula", "Cold open: ‘uma linha pode explicar…’"),
            ("3–11 s", "Prender", "100 e 5%", "Número abstrato", "Ligar a linha ao dinheiro"),
            ("11–22 s", "Prova", "78 e 61", "Frieza", "Uma recompensa por ponto"),
            ("22–32 s", "Consequência", "Split e cesta", "Repetição", "Mudar estímulo visual"),
            ("32–37 s", "Payoff", "INFLAÇÃO", "Didatismo", "Frase curta"),
            ("37–42 s", "CTA", "Salve", "CTA longo", "Um CTA"),
        ],
        "quality": ["Não usar dados históricos como se fossem reais.", "Deixar 5% e simulação visíveis.", "Checar legibilidade dos eixos.", "Evitar excesso de labels."],
    },
    {
        "id": "V08",
        "title": "Papo de mercado",
        "style": "Social Native",
        "duration": "34 s",
        "audience": "TikTok/Reels, 18–35, linguagem de conversa e compartilhamento.",
        "promise": "Corrigir, em tom de conversa, a crença de que dinheiro parado não perde valor.",
        "hook": "Aquele amigo que diz ‘dinheiro parado não perde valor’…",
        "psych": "Relatabilidade e humor leve; o espectador reconhece alguém (ou a si mesmo).",
        "structure": "Chat/citação → correção → prova na cesta → número → CTA de compartilhar.",
        "metaphor": "Conversa de chat + recibo + cesta.",
        "editing": "Jump cuts, zooms, UI pops, texto como mensagem; 1,5–2,5 s.",
        "cut_freq": "1,8–2,5 s",
        "kinetic": "Balões de mensagem, ‘NÃO PERDE VALOR?’, ‘PERDE SIM’, ‘4 DE 5’.",
        "sound": "Keyboard, UI pops, música leve; tom de conversa.",
        "transitions": "UI wipes, jump cuts, zoom.",
        "emotion": "Relatabilidade e humor leve.",
        "demo": "Recibo e cesta: R$ 100 compram 4 de 5 com +25%.",
        "ending": "Dinheiro parado não fica igual. Ele perde poder de compra.",
        "cta": "Manda esse vídeo para ele.",
        "differentiation": "Único com formato de conversa/chat e CTA de compartilhamento direto.",
        "risks": "Pode parecer meme e perder autoridade; precisa de um momento sério com o número.",
        "narration": [
            ("0,0–2,0", "Aquele amigo que diz: ‘dinheiro parado não perde valor’…", "DINHEIRO PARADO NÃO PERDE VALOR?", "NÃO PERDE", "Balão de chat", "pop"),
            ("2,0–5,0", "…precisa ver isso.", "PRECISA VER ISSO", "isso", "Recibo", "click"),
            ("5,0–9,0", "Com os preços 25% maiores, R$ 100 compram 4 de 5 itens.", "SIMULAÇÃO · PREÇOS +25% · 4 DE 5", "4 de 5", "Cesta", "whoosh"),
            ("9,0–13,0", "Não é porque o dinheiro sumiu.", "O DINHEIRO NÃO SUMIU", "não sumiu", "Nota", "sub"),
            ("13,0–17,0", "É porque ele compra menos.", "COMPRA MENOS", "menos", "Itens somem", "click"),
            ("17,0–22,0", "Em 10 anos, a 5% ao ano, R$ 100 valem cerca de R$ 61.", "SIMULAÇÃO · R$ 61", "R$ 61", "Contador", "ticks"),
            ("22,0–26,0", "Dinheiro parado não fica igual.", "NÃO FICA IGUAL", "não fica igual", "Split", "impact"),
            ("26,0–30,0", "Ele perde poder de compra.", "PERDE PODER DE COMPRA", "poder de compra", "Linha", "sub"),
            ("30,0–34,0", "Manda esse vídeo para ele.", "MANDA PRA ELE", "MANDA", "End card", "brand"),
        ],
        "shots": [
            ("0,0–2,0", "Balão de chat com a frase do amigo.", "UI zoom; fundo escuro.", "DINHEIRO PARADO NÃO PERDE VALOR?", "Pop"),
            ("2,0–5,0", "Resposta ‘precisa ver isso’ e recibo.", "Corte seco; UI.", "PRECISA VER ISSO", "Click"),
            ("5,0–9,0", "Cesta com 5 itens; 4 ficam.", "Top-down; cards.", "4 DE 5", "Whoosh"),
            ("9,0–13,0", "Nota intacta ao lado da cesta.", "Split; parallax.", "O DINHEIRO NÃO SUMIU", "Sub"),
            ("13,0–17,0", "Itens saem da cesta.", "Cortes secos.", "COMPRA MENOS", "Click"),
            ("17,0–22,0", "Contador 100 → 61.", "Push-in.", "SIMULAÇÃO · R$ 61", "Ticks"),
            ("22,0–26,0", "Split nota/cesta; frase.", "Corte seco.", "NÃO FICA IGUAL", "Impact"),
            ("26,0–30,0", "Linha de poder de compra cai.", "Parallax.", "PERDE PODER DE COMPRA", "Sub"),
            ("30,0–34,0", "Chat ‘manda pra ele’ + logo.", "UI wipe.", "MANDA PRA ELE", "Brand"),
        ],
        "retention": [
            ("0–3 s", "Reconhecimento", "Frase do amigo", "Parecer meme", "Tom de conversa, mas visual premium"),
            ("3–9 s", "Curiosidade", "Recibo e cesta", "Piada sem conteúdo", "Entregar o número 4 de 5"),
            ("9–17 s", "Explicar", "Nota não sumiu / compra menos", "Didatismo", "Frases curtas"),
            ("17–26 s", "Prova", "61,39 + split", "Número frio", "Ligar ao amigo"),
            ("26–30 s", "Payoff", "Frase séria", "Humor excessivo", "Baixar o tom"),
            ("30–34 s", "CTA", "Manda pra ele", "CTA genérico", "Motivo claro para compartilhar"),
        ],
        "quality": ["Não ridicularizar o amigo.", "Não parecer anúncio disfarçado.", "Simulação visível.", "Manter autoridade no número."],
    },
    {
        "id": "V09",
        "title": "O imposto invisível",
        "style": "High Impact Ad",
        "duration": "40 s",
        "audience": "Público 25–45, marca e conteúdo editorial; campanha de posicionamento.",
        "promise": "Posicionar a inflação como um custo invisível que a educação financeira ajuda a enxergar.",
        "hook": "Existe um imposto que ninguém votou. E você paga todos os dias.",
        "psych": "Gravitas + curiosidade: um imposto escondido na nota.",
        "structure": "Manifesto → qualificador → recibo → montagem de preços → revelação → marca.",
        "metaphor": "Um carimbo/linha amarela invisível sobre a nota e o recibo.",
        "editing": "Cortes cinematográficos, speed ramps, light sweeps, logo reveal; 1,5–3 s.",
        "cut_freq": "1,8–2,8 s",
        "kinetic": "Tipografia de campanha: IMPOSTO INVISÍVEL, INFLAÇÃO, INVEST FÁCIL.",
        "sound": "Cinematic impacts, sub drops, brand sting; épico controlado.",
        "transitions": "Light sweep, match cut, logo reveal.",
        "emotion": "Gravitas e empowerment.",
        "demo": "Recibo com linha ‘inflação’ crescendo; preços sobem.",
        "ending": "Invest Fácil. Entenda o dinheiro. Depois, o mercado.",
        "cta": "Siga o Invest Fácil para entender o dinheiro.",
        "differentiation": "Único manifesto de marca com estética de campanha; o produto é a marca.",
        "risks": "Pode parecer anúncio institucional; o hook precisa ser forte e o CTA discreto.",
        "narration": [
            ("0,0–2,5", "Existe um imposto que ninguém votou.", "UM IMPOSTO QUE NINGUÉM VOTOU", "imposto", "Dark; texto", "impact"),
            ("2,5–6,0", "E você paga todos os dias.", "TODOS OS DIAS", "todos os dias", "Recibo", "sub"),
            ("6,0–10,0", "Ele não aparece na nota.", "NÃO APARECE NA NOTA", "não aparece", "Recibo line", "paper"),
            ("10,0–14,0", "Mas aparece no preço.", "APARECE NO PREÇO", "preço", "Price tags", "whoosh"),
            ("14,0–19,0", "É a inflação: os preços sobem, o dinheiro compra menos.", "INFLAÇÃO", "inflação", "Bass", "impact"),
            ("19,0–24,0", "Em 10 anos, com 5% ao ano, R$ 100 valem cerca de R$ 61.", "SIMULAÇÃO · R$ 61", "R$ 61", "Contador", "ticks"),
            ("24,0–29,0", "Não é sobre prever o futuro.", "NÃO É PREVER O FUTURO", "prever", "Line", "sub"),
            ("29,0–34,0", "É sobre entender o que está acontecendo com o seu dinheiro.", "ENTENDER O DINHEIRO", "entender", "Brand build", "riser"),
            ("34,0–40,0", "Invest Fácil. Entenda o dinheiro. Depois, o mercado.", "INVEST FÁCIL · SIGA", "INVEST FÁCIL", "Logo", "brand sting"),
        ],
        "shots": [
            ("0,0–2,5", "Palavra IMPOSTO INVISÍVEL em tela preta; linha amarela.", "Push-in; light sweep.", "UM IMPOSTO QUE NINGUÉM VOTOU", "Impact"),
            ("2,5–6,0", "Recibo sobre mesa; linha ‘inflação’ invisível.", "Macro; foco.", "TODOS OS DIAS", "Sub"),
            ("6,0–10,0", "A linha do recibo começa a brilhar.", "Parallax; zoom.", "NÃO É IMPOSTO LITERAL · É INFLAÇÃO", "Paper"),
            ("10,0–14,0", "Preços de objetos sobem em montagem.", "Whip pans; speed ramp.", "APARECE NO PREÇO", "Whoosh"),
            ("14,0–19,0", "Palavra INFLAÇÃO ocupa a tela.", "Zoom; bass.", "INFLAÇÃO", "Impact"),
            ("19,0–24,0", "Contador 100 → 61.", "Push-in.", "SIMULAÇÃO · R$ 61", "Ticks"),
            ("24,0–29,0", "Linha do tempo; frase ‘não é prever’.", "Slow pan.", "NÃO É PREVER O FUTURO", "Sub"),
            ("29,0–34,0", "Ambiente escuro; luz amarela cresce.", "Pull-out.", "ENTENDER O DINHEIRO", "Riser"),
            ("34,0–40,0", "Logo Invest Fácil e assinatura.", "Logo reveal; light sweep.", "INVEST FÁCIL · SIGA", "Brand sting"),
        ],
        "retention": [
            ("0–3 s", "Gravitas + qualificador", "Frase de imposto + ‘não é literal’", "Parecer anúncio", "Hook forte antes da marca"),
            ("3–10 s", "Curiosidade", "Recibo com linha escondida", "Explicação lenta", "Uma descoberta por corte"),
            ("10–19 s", "Revelação", "INFLAÇÃO", "Didatismo", "Uma frase clara"),
            ("19–29 s", "Prova", "61,39", "Número frio", "Ligar ao recibo"),
            ("29–34 s", "Payoff", "Entender o dinheiro", "Discurso", "Frase curta"),
            ("34–40 s", "Marca", "Logo/CTA", "CTA longo", "Uma assinatura"),
        ],
        "quality": ["Não parecer propaganda de banco.", "Não prometer retorno.", "Simulação visível.", "CTA discreto."],
    },
    {
        "id": "V10",
        "title": "O espelho do dinheiro",
        "style": "Experimental Masterpiece",
        "duration": "45 s",
        "audience": "Público 20–40, aberto a experimental, estética e poesia visual.",
        "promise": "Uma experiência poética sobre o dinheiro que não some, mas muda de tamanho no que compra.",
        "hook": "Se o seu dinheiro pudesse falar, ele diria: eu não desapareci. Você só compra menos.",
        "psych": "Curiosidade poética + estranhamento visual; o espectador quer decifrar a metáfora.",
        "structure": "Poema visual → metamorfose → nome → número → fecho filosófico.",
        "metaphor": "Espelho/corredor de notas; o reflexo do que ela compra encolhe; a nota vira linha/gráfico.",
        "editing": "Match cuts, morphs, parallax, split-screen, speed ramps; 1,5–3 s.",
        "cut_freq": "1,8–3,0 s",
        "kinetic": "Versos curtos, tipografia com profundidade e reflexo; palavras ‘NÃO SUMIU’, ‘ENCÓGHEU’.",
        "sound": "Drone ambiental, reversed impacts, piano motif, sub; silêncio antes do número.",
        "transitions": "Mirror/mask/morph, light sweep.",
        "emotion": "Assombro e reflexão.",
        "demo": "O reflexo do que ela compra encolhe; a nota permanece; gráfico 100 → 61.",
        "ending": "O dinheiro não some. Ele muda de tamanho.",
        "cta": "Salve para rever depois.",
        "differentiation": "Único poético/surreal, com metamorfose e espelho; o mais experimental da coleção.",
        "risks": "Pode ficar hermético; precisa de uma frase-âncora e do número concreto.",
        "narration": [
            ("0,0–2,5", "Se o seu dinheiro pudesse falar…", "SE O DINHEIRO FALASSE", "dinheiro", "Espelho", "ambient"),
            ("2,5–6,0", "…ele diria: eu não desapareci.", "EU NÃO DESAPARECI", "não desapareci", "Reflexo", "sub"),
            ("6,0–10,0", "Você só compra menos.", "VOCÊ SÓ COMPRA MENOS", "menos", "Cesta", "whoosh"),
            ("10,0–14,0", "O número continua o mesmo.", "O NÚMERO CONTINUA", "mesmo", "Nota", "click"),
            ("14,0–18,0", "Mas o poder de compra muda.", "O PODER DE COMPRA MUDA", "poder de compra", "Linha", "piano"),
            ("18,0–23,0", "É a inflação. Ela não some com o dinheiro.", "INFLAÇÃO", "inflação", "Morph", "impact"),
            ("23,0–28,0", "Ela diminui o que ele pode comprar.", "DIMINUI O QUE PODE COMPRAR", "diminui", "Cesta 4/5", "sub"),
            ("28,0–33,0", "Em 10 anos, com 5% ao ano, R$ 100 valem cerca de R$ 61.", "SIMULAÇÃO · R$ 61", "R$ 61", "Gráfico", "ticks"),
            ("33,0–38,0", "O dinheiro não some.", "NÃO SOME", "não some", "Espelho", "piano"),
            ("38,0–42,0", "Ele muda de tamanho no que você pode comprar.", "MUDA DE TAMANHO", "tamanho", "Fecho", "impact"),
            ("42,0–45,0", "Salve para rever depois.", "SALVE", "SALVE", "End card", "brand"),
        ],
        "shots": [
            ("0,0–2,5", "Nota abstrata refletida em espelho; texto poético.", "Slow push; parallax.", "SE O DINHEIRO FALASSE", "Ambient"),
            ("2,5–6,0", "O reflexo da cesta encolhe; a nota permanece inteira.", "Match cut; morph.", "EU NÃO DESAPARECI", "Sub"),
            ("6,0–10,0", "Cesta refletida perde itens.", "Split/mirror.", "VOCÊ SÓ COMPRA MENOS", "Whoosh"),
            ("10,0–14,0", "Macro no número 100; espelho distorce.", "Macro; light sweep.", "O NÚMERO CONTINUA", "Click"),
            ("14,0–18,0", "Linha de poder de compra cai no reflexo.", "Parallax.", "O PODER DE COMPRA MUDA", "Piano"),
            ("18,0–23,0", "Nota vira linha; palavra INFLAÇÃO.", "Morph; zoom.", "INFLAÇÃO", "Impact"),
            ("23,0–28,0", "Cesta 3/5 no espelho.", "Corte seco; reflexo.", "DIMINUI O QUE PODE COMPRAR", "Sub"),
            ("28,0–33,0", "Gráfico 100 → 61 no centro.", "Push-in; ticks.", "SIMULAÇÃO · R$ 61", "Ticks"),
            ("33,0–38,0", "Nota intacta; espelho vazio.", "Slow pull.", "NÃO SOME", "Piano"),
            ("38,0–45,0", "Frase final; logo/CTA.", "Fade; reflexo.", "MUDA DE TAMANHO / SALVE", "Impact + brand"),
        ],
        "retention": [
            ("0–3 s", "Estranhamento", "Espelho + frase", "Hermetismo", "Frase-âncora clara"),
            ("3–10 s", "Curiosidade", "Reflexo encolhe", "Abstração", "Mostrar a cesta concreta"),
            ("10–18 s", "Nomear", "Número 100 e linha", "Poesia sem dado", "Ligar 100 ao que ele compra"),
            ("18–28 s", "Demonstrar", "Cesta 3/5", "Repetição", "Mudar estímulo visual"),
            ("28–38 s", "Payoff", "Gráfico + frase", "Didatismo", "Fechar poético"),
            ("38–45 s", "CTA", "Salve", "CTA longo", "Curto"),
        ],
        "quality": ["Não deixar a poesia esconder o dado.", "Simulação 5% visível.", "Testar morphs/espelhos.", "Evitar aparência de template de IA."],
    },
]


def table(headers, rows):
    lines = ["| " + " | ".join(headers) + " |", "|" + "|".join(["---"] * len(headers)) + "|"]
    for row in rows:
        lines.append("| " + " | ".join(str(cell) for cell in row) + " |")
    return "\n".join(lines)


def write(path, content):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w", encoding="utf-8") as handle:
        handle.write(content.strip() + "\n")


def concept_doc(c):
    return f"""# {c['id']} — {c['title']}

**Estilo:** {c['style']}
**Duração-alvo:** {c['duration']}
**Público:** {c['audience']}
**Promessa:** {c['promise']}
**Status:** PLANEJADO — NÃO PRODUZIDO

## Hook

> {c['hook']}

## Estratégia psicológica

{c['psych']}

## Estrutura narrativa

{c['structure']}

## Metáfora visual

{c['metaphor']}

## Linguagem de edição

{c['editing']}

**Frequência de cortes:** {c['cut_freq']}

## Tipografia cinética

{c['kinetic']}

## Identidade sonora

{c['sound']}

## Transições

{c['transitions']}

## Emoção pretendida

{c['emotion']}

## Como a inflação é demonstrada

{c['demo']}

## Encerramento

{c['ending']}

## CTA

{c['cta']}

## Diferenciação

{c['differentiation']}

## Riscos criativos

{c['risks']}

## Viabilidade

- Formato: 1080×1920, 30 fps, 30–45 s.
- Voz: Thalita.
- Produção: Remotion; assets vetoriais/CSS; sem imagem externa paga.
- Simulações identificadas como simulação.
"""


def script_doc(c):
    rows = [(n[0], n[1], n[2], n[3], n[4], n[5]) for n in c['narration']]
    return f"""# SCRIPT — {c['id']} {c['title']}

**Duração-alvo:** {c['duration']}
**Voz:** Thalita — narração contínua, energia média-alta.
**Status:** PLANEJADO — NÃO PRODUZIDO

## Narração completa

{table(["Tempo", "Narração", "Texto na tela", "Destaque", "Corte/enquadramento", "Som"], rows)}

## Direção de narração

- Frases curtas, naturais, em português brasileiro.
- Pausas entre frases: 100–180 ms; pausas dramáticas só quando marcadas.
- Não cortar sílabas, consoantes ou finais.
- Não acelerar a voz para caber no tempo; cortar texto se necessário.
- Thalita é a única voz.

## Pausas e ênfases

- Pausas entre frases: **100–180 ms**.
- Antes da palavra “inflação” ou da revelação principal: **200–300 ms**.
- Depois do número 61,39: **120–180 ms**.
- Antes do CTA: **200–250 ms**.
- Não usar pausas acima de 300 ms sem intenção dramática.
- Ênfases: as palavras marcadas em “Destaque” na tabela; não enfatizar cada palavra.

## Notas de tela

- Uma ideia por tela.
- Amarelo `#FACC15` apenas no destaque indicado.
- Não sobrepor legenda convencional à tipografia.
- Simulação/hipótese sempre visível quando houver número.

## CTA

{c['cta']}
"""


def storyboard_doc(c):
    rows = [(f"S{i+1:02d}", s[0], s[1], s[2], s[3], s[4]) for i, s in enumerate(c['shots'])]
    return f"""# STORYBOARD — {c['id']} {c['title']}

**Duração-alvo:** {c['duration']}
**Formato:** 1080×1920 · 30 fps
**Status:** PLANEJADO — NÃO PRODUZIDO

{table(["Shot", "Tempo", "Visual", "Câmera/movimento", "Texto", "Som"], rows)}

## Direção de arte

- Fundo preto `#050505`; amarelo `#FACC15`; branco para apoio.
- Plus Jakarta Sans; hierarquia forte.
- Sem imagens genéricas; tudo com função narrativa.
- Safe zone lateral de 78 px; CTA acima de 190–210 px do rodapé.
"""


def editing_doc(c):
    rows = [(n[0], n[1], n[4], n[2], n[5], n[3]) for n in c['narration']]
    return f"""# EDITING TIMELINE — {c['id']} {c['title']}

**Duração-alvo:** {c['duration']}
**Ritmo:** {c['cut_freq']}
**Status:** PLANEJADO — NÃO PRODUZIDO

{table(["Tempo", "Ação/narração", "Corte/transição", "Texto", "Áudio", "Função"], rows)}

## Decisões de edição

- Cortes motivados por fala, música ou mudança visual.
- Punch-ins apenas em palavras/números importantes.
- Nenhuma composição estática por mais de 3 s sem intenção.
- Transições: {c['transitions']}
- Se o vídeo ficar longo, cortar primeiro as repetições, não a clareza.
"""


def sound_doc(c):
    events = {}
    for n in c['narration']:
        sound = n[5]
        if sound not in events:
            events[sound] = []
        events[sound].append(n[0])
    rows = [(sound, ", ".join(times)) for sound, times in events.items()]
    return f"""# SOUND DESIGN — {c['id']} {c['title']}

**Voz:** Thalita (`pt-BR-ThalitaMultilingualNeural`), taxa -12% na referência High Impact 01.
**Status:** PLANEJADO — NÃO PRODUZIDO.

## Narração

- Voz única: Thalita.
- Contínua, natural, energia média-alta.
- Pausas de 100–180 ms entre frases.
- Pausas >250–300 ms só com intenção dramática.
- Não cortar finais de palavras.

## Música

{c['sound']}

## Mapa de SFX

{table(["Som", "Momentos"], rows)}

## Silêncios intencionais

- Usar silêncio curto antes do número ou da revelação.
- Não deixar silêncio longo sem função.
- O silêncio deve realçar a frase, não parecer falha.

## Mixagem

- Voz: camada 1, intelligibilidade absoluta.
- Música: camada 2, ducking sob a voz.
- SFX: camada 3, sincronizados com corte/revelação.
- Ambiência: camada 4, discreta.
- Loudness alvo: -14 LUFS; true peak ≤ -1,0 dBTP.
- Sem clipping/distorção.
"""


def retention_doc(c):
    rows = [(r[0], r[1], r[2], r[3], r[4]) for r in c['retention']]
    return f"""# RETENTION MAP — {c['id']} {c['title']}

**Tipo:** mapa hipotético, não medição real.
**Duração-alvo:** {c['duration']}
**Status:** PLANEJADO — NÃO PRODUZIDO.

{table(["Intervalo", "Objetivo", "Estímulo", "Risco de queda", "Correção"], rows)}

## Leitura editorial

- O hook precisa ser compreensível sem áudio.
- Cada bloco deve abrir/fechar um loop.
- O payoff deve responder ao hook.
- O CTA não pode chegar antes do payoff.
- Métricas reais só existem depois da publicação.
"""


def quality_doc(c):
    risks = "\n".join(f"- {risk}" for risk in c['quality'])
    return f"""# QUALITY CHECKLIST — {c['id']} {c['title']}

**Status:** PLANEJADO — NÃO PRODUZIDO.
**Duração-alvo:** {c['duration']}

## Pré-produção

- [ ] Conceito claramente diferente das outras 9 variantes.
- [ ] Roteiro cabe na duração com Thalita.
- [ ] Nenhuma promessa financeira falsa.
- [ ] Números hipotéticos marcados como simulação.
- [ ] CTA definido.

## Produção

- [ ] 1080×1920, 30 fps.
- [ ] Tipografia legível em celular.
- [ ] Sem colisão de textos.
- [ ] Safe zone respeitada.
- [ ] Transições motivadas.
- [ ] Sound design sincronizado.
- [ ] Thalita é a única voz.

## Pós-produção

- [ ] MP4 reproduzível.
- [ ] ffprobe: H.264/AAC, 1080×1920, 30 fps.
- [ ] Loudness/true peak medidos.
- [ ] Contact sheet inspecionado.
- [ ] Frame 0 legível.
- [ ] Nenhuma aprovação humana declarada.

## Riscos específicos

{risks}
"""


def matrix_doc():
    core_rows = [(c['id'], c['title'], c['style'], c['hook'], c['psych'], c['structure'], c['metaphor'], c['emotion']) for c in CONCEPTS]
    craft_rows = [(c['id'], c['editing'], c['cut_freq'], c['kinetic'], c['sound'], c['transitions'], c['demo'], c['ending']) for c in CONCEPTS]
    diff_rows = [(c['id'], c['differentiation'], c['risks']) for c in CONCEPTS]
    return f"""# MATRIZ DE CONCEITOS — 10 VARIANTES

**Tema:** “Por que R$ 100 hoje não compram a mesma coisa amanhã?”
**Status:** Gate 3 — planejamento; nenhum vídeo produzido.

## 1. Núcleo narrativo

{table(["ID", "Título", "Estilo", "Hook", "Estratégia psicológica", "Estrutura", "Metáfora", "Emoção"], core_rows)}

## 2. Linguagem audiovisual

{table(["ID", "Edição", "Frequência de cortes", "Tipografia", "Som", "Transições", "Demonstração", "Encerramento"], craft_rows)}

## 3. Diferenciação e riscos

{table(["ID", "Assinatura única", "Risco principal"], diff_rows)}

## 4. Auditoria de diferenciação

- Nenhum par usa a mesma estrutura narrativa.
- V01 é ticker/montagem; V02 é ritual/cinema; V03 é objeto/máquina; V04 é quiz cronometrado; V05 é minimalismo/silêncio; V06 é psicologia/salário; V07 é dados/gráfico; V08 é conversa/chat; V09 é manifesto de marca; V10 é poesia/espelho.
- As diferenças não são apenas cor, música ou primeira frase.
- Thalita é a voz de todas as variantes; a variação está no ritmo e no texto.
"""


def main():
    for c in CONCEPTS:
        folder = os.path.join(ROOT, c['id'])
        write(os.path.join(folder, "CONCEPT.md"), concept_doc(c))
        write(os.path.join(folder, "SCRIPT.md"), script_doc(c))
        write(os.path.join(folder, "STORYBOARD.md"), storyboard_doc(c))
        write(os.path.join(folder, "EDITING_TIMELINE.md"), editing_doc(c))
        write(os.path.join(folder, "SOUND_DESIGN.md"), sound_doc(c))
        write(os.path.join(folder, "RETENTION_MAP.md"), retention_doc(c))
        write(os.path.join(folder, "QUALITY_CHECKLIST.md"), quality_doc(c))
    write(os.path.join(REPORTS, "CREATIVE_CONCEPTS_MATRIX.md"), matrix_doc())
    print("generated", len(CONCEPTS), "concepts")


if __name__ == "__main__":
    main()
