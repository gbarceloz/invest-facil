"""Gate 3 v2 generator.

Rebuilds all Gate 3 documents with narration-calibrated timecodes.

Speech model calibrated against the approved High Impact 01 Thalita track:
~14.0 characters per second (numbers expanded to their spoken form),
inter-sentence pause 120 ms, explicit dramatic pauses only where marked.
No video is rendered here.
"""

import importlib.util
import math
import os
import re

BASE_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "generate_gate3_docs.py")
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

spec = importlib.util.spec_from_file_location("gate3_base", BASE_PATH)
base = importlib.util.module_from_spec(spec)
spec.loader.exec_module(base)

CPS = 14.0
DEFAULT_PAUSE = 0.12
TAIL = 0.55

# (text, screen, highlight, cut, sound, pause after)
NEW_NARRATION = {
    "V01": [
        ("R$ 100 parece pouco? Não é impressão.", "R$ 100 / NÃO É IMPRESSÃO", "R$ 100", "Punch-in no número", "impact", 0.15),
        ("Os preços se movem o tempo todo.", "OS PREÇOS SE MOVEM", "preços", "Whip pan para o ticker", "whoosh", 0.12),
        ("A nota continua com o mesmo número.", "MESMO NÚMERO", "mesmo número", "Split-screen nota x preços", "click", 0.12),
        ("Mas compra menos café, menos pão, menos transporte.", "MENOS CAFÉ · PÃO · TRANSPORTE", "menos", "Três cortes rápidos", "whoosh x3", 0.14),
        ("Isso é inflação.", "INFLAÇÃO", "INFLAÇÃO", "Corte seco + bass hit", "impact", 0.25),
        ("A alta generalizada dos preços corrói seu poder de compra.", "PODER DE COMPRA", "poder de compra", "Barra encolhendo", "sub drop", 0.12),
        ("Simulação: 5% ao ano. Em dez anos, cerca de R$ 61.", "SIMULAÇÃO · 5% AO ANO", "R$ 61", "Contador 100 → 61", "ticks", 0.16),
        ("O número é o mesmo. O poder de compra, não.", "MESMO NÚMERO / MENOS PODER", "poder de compra", "Split-screen", "impact", 0.24),
        ("Entender isso é o primeiro passo.", "ENTENDER É O PRIMEIRO PASSO", "primeiro passo", "Logo hint", "riser", 0.12),
        ("Siga para entender a inflação no próximo vídeo.", "SIGA", "SIGA", "End card", "brand sting", 0.00),
    ],
    "V02": [
        ("Até o dia em que o dinheiro não deu.", "ATÉ O DIA EM QUE NÃO DEU", "não deu", "Close na xícara vazia", "silence", 0.30),
        ("Ele comprava o mesmo café todos os dias.", "O MESMO CAFÉ, TODO DIA", "mesmo café", "Flashback; luz quente", "ambience", 0.14),
        ("O mesmo pedido. Os mesmos R$ 100 para a semana.", "R$ 100 / A SEMANA", "R$ 100", "Nota no balcão", "coin", 0.12),
        ("No começo, sobrava troco.", "SOBRAVA TROCO", "troco", "Recibo sobre a mesa", "paper", 0.14),
        ("Depois, o troco foi ficando menor.", "O TROCO DIMINUIU", "menor", "Time-lapse de xícaras", "clock", 0.14),
        ("Até não dar mais.", "NÃO DEU MAIS", "não deu", "Pausa; mão segura a nota", "silence", 0.30),
        ("O café não ficou caro do nada. O dinheiro é que compra menos.", "NÃO FOI O CAFÉ", "dinheiro", "Close na xícara", "piano", 0.12),
        ("É a inflação. Os preços sobem, e o poder de compra cai.", "INFLAÇÃO", "inflação", "Linha sobe sobre o balcão", "sub", 0.14),
        ("Numa simulação de 5% ao ano, o poder de compra cai para cerca de 61.", "SIMULAÇÃO · 5% AO ANO", "R$ 61", "Gráfico minimalista", "ticks", 0.16),
        ("O café é o mesmo. O troco é que encolheu.", "MESMO CAFÉ / TROCO MENOR", "troco", "Match cut xícara/nota", "impact", 0.16),
        ("A inflação não faz barulho. Ela aparece no troco.", "ELA APARECE NO TROCO", "troco", "Slow push no troco", "piano", 0.30),
        ("Salve para lembrar quando o preço parecer ‘do nada’.", "SALVE", "SALVE", "End card", "brand", 0.00),
    ],
    "V03": [
        ("A nota entra inteira na máquina.", "ENTRA INTEIRA", "inteira", "Nota entra na máquina", "mechanical", 0.12),
        ("O que ela compra sai menor.", "O QUE ELA COMPRA SAI MENOR", "menor", "Cesta menor sai", "clunk", 0.14),
        ("Não é mágica. É inflação.", "INFLAÇÃO", "inflação", "Engrenagens", "impact", 0.25),
        ("Os preços sobem. A mesma quantia compra menos.", "A MESMA QUANTIA", "menos", "Itens da cesta somem", "whoosh", 0.12),
        ("O número na nota não muda. Continua 100.", "O NÚMERO NÃO MUDA", "número", "Macro na nota", "click", 0.12),
        ("Mas o que ele compra, sim.", "O QUE ELE COMPRA MUDA", "compra", "Split nota/cesta", "sub", 0.14),
        ("A cada ano, a máquina leva um pouco.", "A MÁQUINA LEVA UM POUCO", "leva", "Engrenagens lentas", "mechanical", 0.12),
        ("Em dez anos, a 5% ao ano, o poder de compra cai para 61.", "SIMULAÇÃO · 5% AO ANO", "R$ 61", "Contador", "ticks", 0.16),
        ("A inflação não rasga o dinheiro.", "NÃO RASGA", "não rasga", "Nota intacta", "paper", 0.20),
        ("Ela diminui o que ele compra.", "DIMINUI O QUE ELE COMPRA", "diminui", "Cesta 3/5", "impact", 0.20),
        ("Compartilhe com quem acha que dinheiro parado não muda.", "COMPARTILHE", "COMPARTILHE", "End card", "brand", 0.00),
    ],
    "V04": [
        ("R$ 100. Quanto isso compra?", "R$ 100", "R$ 100", "Punch-in", "impact", 0.12),
        ("Depende do ano.", "DEPENDE DO ANO", "ano", "Whip pan", "whoosh", 0.12),
        ("Hoje: uma cesta cheia.", "HOJE", "hoje", "Cesta entra", "click", 0.12),
        ("Simulação: preços 25% maiores, quatro de cinco.", "SIMULAÇÃO · PREÇOS +25% · 4 DE 5", "4 de 5", "Itens somem", "whoosh", 0.14),
        ("Simulação: dez anos a 5%, cerca de R$ 61.", "SIMULAÇÃO · R$ 61", "R$ 61", "Contador", "ticks", 0.14),
        ("A resposta mudou. A pergunta continua a mesma.", "A RESPOSTA MUDOU", "resposta", "Split", "impact", 0.18),
        ("Não é quanto você tem.", "NÃO É O QUANTO VOCÊ TEM", "quanto", "Texto grande", "sub", 0.12),
        ("É o que ele compra.", "É O QUE ELE COMPRA", "compra", "Cesta", "click", 0.12),
        ("Entender inflação muda como você olha o preço.", "OLHE O PREÇO", "preço", "Recibo", "riser", 0.14),
        ("Comente: o que ficou mais caro para você?", "COMENTE", "COMENTE", "End card", "brand", 0.00),
    ],
    "V05": [
        ("Quanto essa nota ainda compra?", "QUANTO ESSA NOTA AINDA COMPRA?", "compra", "Slow push na nota", "room tone", 0.16),
        ("R$ 100 não é só um número impresso. É poder de compra no seu bolso.", "PODER DE COMPRA NO BOLSO", "poder de compra", "Nota na mesa", "piano", 0.14),
        ("Mas esse poder não tem o mesmo tamanho para sempre.", "NÃO TEM O MESMO TAMANHO", "tamanho", "Linha fina surge", "sub", 0.14),
        ("Quando os preços sobem, o dinheiro perde poder de compra.", "PODER DE COMPRA", "poder de compra", "Linha desce", "tick", 0.12),
        ("O valor impresso continua igual. A nota não encolhe.", "VALOR IMPRESSO", "impresso", "Macro na nota", "click", 0.12),
        ("O que ele compra, não. E é isso que muda o seu dia.", "O QUE ELE COMPRA", "compra", "Espaço negativo", "silence", 0.24),
        ("A conta simulada: 5% ao ano, cerca de 61 em dez anos.", "SIMULAÇÃO · 5% AO ANO", "R$ 61", "Número 61", "sub", 0.18),
        ("O valor está impresso. O que ele compra ficou menor.", "IMPRESSO / MENOR", "compra", "Split minimalista", "impact", 0.18),
        ("Salve para consultar quando o preço mudar.", "SALVE", "SALVE", "Logo", "brand", 0.00),
    ],
    "V06": [
        ("Seu salário subiu.", "SALÁRIO", "salário", "Close no contracheque", "click", 0.14),
        ("Então por que o mês continua apertado?", "POR QUÊ?", "apertado", "Split salário/cesta", "sub", 0.14),
        ("Você não está imaginando. Seu dinheiro compra menos.", "NÃO É IMPRESSÃO", "NÃO", "Close text", "sub", 0.12),
        ("A sensação de que o salário não acompanha é real.", "SALÁRIO x CESTA", "real", "Split salário/cesta", "click", 0.12),
        ("O salário pode até subir. Os preços sobem mais.", "SALÁRIO x PREÇOS", "preços", "Split salário/preços", "click", 0.12),
        ("A cesta fica mais cara. E o que sobra no fim do mês diminui.", "CESTA", "cesta", "Split cesta", "impact", 0.14),
        ("É a inflação: a alta generalizada dos preços.", "INFLAÇÃO", "inflação", "Bass", "impact", 0.25),
        ("Ela corrói o poder de compra sem fazer barulho.", "PODER DE COMPRA", "poder de compra", "Linha cai", "sub", 0.12),
        ("Numa simulação de 5% ao ano, R$ 100 valem cerca de 61 em dez anos.", "SIMULAÇÃO · R$ 61", "R$ 61", "Contador", "ticks", 0.16),
        ("Não é impressão. É inflação.", "NÃO É IMPRESSÃO", "inflação", "Espelho", "impact", 0.20),
        ("Salve para entender quando o salário não acompanha.", "SALVE", "SALVE", "End card", "brand", 0.00),
    ],
    "V07": [
        ("Uma linha pode explicar por que seu dinheiro vale menos.", "PODER DE COMPRA", "linha", "Linha começa", "tick", 0.12),
        ("Ela começa em R$ 100. É o seu poder de compra hoje.", "R$ 100", "R$ 100", "Ponto 0", "click", 0.12),
        ("Numa simulação de 5% ao ano, ela cai devagar.", "SIMULAÇÃO · 5% AO ANO", "5%", "Linha desce", "riser", 0.14),
        ("Em cinco anos, cerca de R$ 78. A queda já aparece.", "SIMULAÇÃO · R$ 78", "R$ 78", "Ponto 5a", "tick", 0.14),
        ("Em dez anos, cerca de R$ 61. É uma perda de quase 39%.", "SIMULAÇÃO · R$ 61", "R$ 61", "Ponto 10a", "impact", 0.18),
        ("O número na conta não mudou. A nota continua a mesma.", "O NÚMERO NÃO MUDOU", "número", "Split", "sub", 0.12),
        ("O que ele compra, sim. A cesta fica menor.", "O QUE ELE COMPRA", "compra", "Cesta", "whoosh", 0.14),
        ("Isso é inflação. E é por isso que entender importa.", "INFLAÇÃO", "inflação", "Highlight", "impact", 0.20),
        ("Simulação com 5% ao ano. Salve para consultar.", "SIMULAÇÃO · SALVE", "SIMULAÇÃO", "End card", "brand", 0.00),
    ],
    "V08": [
        ("Aquele amigo que diz: ‘dinheiro parado não perde valor’...", "DINHEIRO PARADO NÃO PERDE VALOR?", "NÃO PERDE", "Balão de chat", "pop", 0.14),
        ("Precisa ver isso. A conta não fecha.", "PRECISA VER ISSO", "isso", "Recibo", "click", 0.12),
        ("Numa simulação, preços 25% maiores: R$ 100 compram quatro de cinco itens.", "SIMULAÇÃO · PREÇOS +25% · 4 DE 5", "4 de 5", "Cesta", "whoosh", 0.16),
        ("Não é porque o dinheiro sumiu. Ele continua na conta.", "O DINHEIRO NÃO SUMIU", "não sumiu", "Nota", "sub", 0.12),
        ("É porque ele compra menos. O troco encolhe.", "COMPRA MENOS", "menos", "Itens somem", "click", 0.12),
        ("Numa simulação, 5% ao ano. Em dez anos, cerca de 61.", "SIMULAÇÃO · R$ 61", "R$ 61", "Contador", "ticks", 0.16),
        ("Dinheiro parado não fica igual. Ele perde poder de compra.", "NÃO FICA IGUAL", "não fica igual", "Split", "impact", 0.18),
        ("É inflação. E ela age devagar.", "É INFLAÇÃO", "inflação", "Linha", "sub", 0.20),
        ("Guardar é importante. Entender o que acontece com ele, também.", "GUARDAR É IMPORTANTE", "entender", "Nota e cesta", "sub", 0.18),
        ("Manda esse vídeo para ele.", "MANDA PRA ELE", "MANDA", "End card", "brand", 0.00),
    ],
    "V09": [
        ("Existe um imposto que ninguém votou.", "UM IMPOSTO QUE NINGUÉM VOTOU", "imposto", "Dark; texto", "impact", 0.14),
        ("E você paga todos os dias.", "TODOS OS DIAS", "todos os dias", "Recibo", "sub", 0.14),
        ("Não é imposto literal. É inflação.", "NÃO É IMPOSTO LITERAL · É INFLAÇÃO", "inflação", "Recibo line", "paper", 0.16),
        ("Ela não aparece na nota. Mas está embutida no preço.", "NÃO APARECE NA NOTA", "preço", "Price tags", "whoosh", 0.14),
        ("Quando você compra pão, café ou transporte, ela está lá.", "ELA ESTÁ NO PREÇO", "está lá", "Montagem de preços", "whoosh", 0.14),
        ("Os preços sobem e o dinheiro compra menos.", "OS PREÇOS SOBEM", "menos", "Bass", "impact", 0.18),
        ("Simulação de 5% ao ano: 61 em dez anos.", "SIMULAÇÃO · 5% AO ANO", "R$ 61", "Contador", "ticks", 0.18),
        ("Não é sobre prever o futuro. É sobre entender o presente.", "NÃO É PREVER O FUTURO", "presente", "Line", "sub", 0.14),
        ("É sobre olhar para o seu dinheiro e ver o que ele realmente compra.", "ENTENDER O DINHEIRO", "entender", "Brand build", "riser", 0.20),
        ("Invest Fácil. Entenda o dinheiro. Depois, o mercado. Siga o Invest Fácil.", "INVEST FÁCIL · SIGA", "INVEST FÁCIL", "Logo", "brand sting", 0.00),
    ],
    "V10": [
        ("Se o seu dinheiro pudesse falar...", "SE O DINHEIRO FALASSE", "dinheiro", "Espelho", "ambient", 0.14),
        ("Ele diria: eu não desapareci.", "EU NÃO DESAPARECI", "não desapareci", "Reflexo", "sub", 0.12),
        ("Você só compra menos. O número continua na nota.", "VOCÊ SÓ COMPRA MENOS", "menos", "Cesta", "whoosh", 0.12),
        ("O que muda é o tamanho do que ele pode comprar.", "O TAMANHO MUDA", "tamanho", "Cesta", "whoosh", 0.14),
        ("O número continua o mesmo. A nota não encolhe.", "O NÚMERO CONTINUA", "mesmo", "Nota", "click", 0.12),
        ("Mas o poder de compra muda. E muda devagar.", "O PODER DE COMPRA MUDA", "poder de compra", "Linha", "piano", 0.14),
        ("É a inflação. Ela não some com o dinheiro.", "INFLAÇÃO", "inflação", "Morph", "impact", 0.25),
        ("Ela diminui o que ele pode comprar. Item por item.", "DIMINUI O QUE PODE COMPRAR", "diminui", "Cesta 3/5", "sub", 0.14),
        ("Simulação de 5% ao ano. Em dez anos, 61.", "SIMULAÇÃO · R$ 61", "R$ 61", "Gráfico", "ticks", 0.18),
        ("O dinheiro não some. Ele muda de tamanho.", "NÃO SOME", "não some", "Espelho", "piano", 0.16),
        ("No que você pode comprar, ele fica menor.", "MUDA DE TAMANHO", "tamanho", "Fecho", "impact", 0.22),
        ("Salve para rever quando o preço subir.", "SALVE", "SALVE", "End card", "brand", 0.00),
    ],
}

ENDING_OVERRIDE = {
    "V04": "A resposta muda. O poder de compra também.",
}

HOOK_OVERRIDE = {
    "V03": "A nota entra inteira. O que ela compra, não.",
    "V05": "Quanto essa nota ainda compra?",
    "V06": "Seu salário subiu. Então por que o mês continua apertado?",
    "V07": "Uma linha pode explicar por que seu dinheiro vale menos.",
}

VOICE = {
    "V01": "Urgente e seca. Frases curtas; a pressa vem do corte, não do volume.",
    "V02": "Contida e próxima, como quem conta um caso. Sem tom de locutor.",
    "V03": "Curiosa, com pausas de engrenagem. Baixa no início, firme na revelação.",
    "V04": "Quiz: pergunta rápida, resposta seca. Energia alta, sem atropelar os números.",
    "V05": "Baixa, lenta e segura. Premium não é sussurro; é controle.",
    "V06": "Segunda pessoa, tom de validação. Empática, não conspiradora; firme no “é inflação”.",
    "V07": "Didática e calma, como quem explica um gráfico. Precisão nos números.",
    "V08": "Conversa de amigo, humor leve no início; séria no número e no fecho.",
    "V09": "Gravitas de manifesto. Frases cheias, ritmo controlado; sem tom publicitário.",
    "V10": "Poética e contida. Deixar o texto respirar; nunca melosa.",
}

CUT_FREQ_OVERRIDE = {
    "V01": "1,0–1,8 s",
    "V02": "2,0–3,0 s",
    "V03": "1,4–2,4 s",
    "V04": "0,8–1,6 s",
    "V05": "2,2–3,4 s",
    "V06": "1,6–2,4 s",
    "V07": "1,8–2,8 s",
    "V08": "1,4–2,4 s",
    "V09": "1,6–2,6 s",
    "V10": "1,5–2,8 s",
}


def spoken_chars(text):
    t = text
    t = t.replace("R$ 100", "cem reais")
    t = t.replace("R$ 61", "sessenta e um reais")
    t = t.replace("25%", "vinte e cinco por cento")
    t = t.replace("39%", "trinta e nove por cento")
    t = t.replace("5%", "cinco por cento")
    t = re.sub(r"\b100\b", "cem", t)
    t = re.sub(r"\b78\b", "setenta e oito", t)
    t = re.sub(r"\b61\b", "sessenta e um", t)
    t = re.sub(r"\b10\b", "dez", t)
    t = re.sub(r"\b5\b", "cinco", t)
    return len(t)


def build_timeline(concept):
    rows = []
    cursor = 0.0
    for text, screen, highlight, cut, sound, pause in concept["narration"]:
        speech = max(0.85, spoken_chars(text) / CPS)
        start = cursor
        end = start + speech
        rows.append({
            "text": text,
            "screen": screen,
            "highlight": highlight,
            "cut": cut,
            "sound": sound,
            "pause": pause,
            "start": start,
            "end": end,
            "speech": speech,
            "chars": spoken_chars(text),
        })
        cursor = end + pause
    total = rows[-1]["end"] + TAIL
    return rows, total


def fmt(value):
    return f"{value:.1f}".replace(".", ",")


def span(start, end):
    return f"{fmt(start)}–{fmt(end)}"


def average_cut(cut_freq):
    low, high = cut_freq.replace(" s", "").split("–")
    return (float(low.replace(",", ".")) + float(high.replace(",", "."))) / 2


def micro_cuts(concept, row):
    return max(1, round((row["end"] - row["start"]) / average_cut(concept["cut_freq"])))


def table(headers, rows):
    lines = ["| " + " | ".join(headers) + " |", "|" + "|".join(["---"] * len(headers)) + "|"]
    for row in rows:
        lines.append("| " + " | ".join(str(cell) for cell in row) + " |")
    return "\n".join(lines)


def write(path, content):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w", encoding="utf-8") as handle:
        handle.write(content.strip() + "\n")


def parse_span(value):
    value = value.replace(" s", "").strip()
    start, end = value.split("–")
    return float(start.replace(",", ".")), float(end.replace(",", "."))


def prepare():
    prepared = []
    for source in base.CONCEPTS:
        concept = dict(source)
        concept["narration"] = NEW_NARRATION[concept["id"]]
        concept["old_duration"] = float(concept["duration"].split()[0].replace(",", "."))
        concept["cut_freq"] = CUT_FREQ_OVERRIDE.get(concept["id"], concept["cut_freq"])
        concept["ending"] = ENDING_OVERRIDE.get(concept["id"], concept["ending"])
        concept["hook"] = HOOK_OVERRIDE.get(concept["id"], concept["hook"])
        concept["voice"] = VOICE[concept["id"]]
        rows, total = build_timeline(concept)
        if concept["id"] == "V04":
            duration = 30.0
        else:
            duration = float(max(30, min(45, math.ceil(total))))
        concept["rows"] = rows
        concept["computed_total"] = total
        concept["duration_seconds"] = duration
        concept["duration"] = f"{int(duration)} s"
        prepared.append(concept)
    return prepared


def concept_doc(c):
    chars = sum(r["chars"] for r in c["rows"])
    speech = sum(r["speech"] for r in c["rows"])
    cps = chars / c["duration_seconds"]
    return f"""# {c['id']} — {c['title']}

**Estilo:** {c['style']}
**Duração calculada:** {c['duration']} (fala + pausas + end card)
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

> {c['ending']}

## CTA

{c['cta']}

## Diferenciação

{c['differentiation']}

## Riscos criativos

{c['risks']}

## Viabilidade

- Formato: 1080×1920, 30 fps.
- Voz: Thalita (`pt-BR-ThalitaMultilingualNeural`).
- Produção: Remotion; assets vetoriais/CSS; sem imagem externa paga.
- Simulações identificadas como simulação.
- Densidade: {chars} caracteres falados; {fmt(cps)} caracteres/s; fala estimada em {fmt(speech)} s.
- Nenhum vídeo foi renderizado neste gate.
"""


def script_doc(c):
    rows = []
    for r in c["rows"]:
        rows.append((span(r["start"], r["end"]), r["text"], r["screen"], r["highlight"], r["cut"], r["sound"]))
    long_pauses = [(r["start"], r["pause"]) for r in c["rows"] if r["pause"] >= 0.2]
    pause_text = "\n".join(f"- Pausa de **{int(p*1000)} ms** após o trecho em {fmt(t)} s." for t, p in long_pauses)
    if not pause_text:
        pause_text = "- Nenhuma pausa acima de 200 ms além das pausas naturais."
    return f"""# SCRIPT — {c['id']} {c['title']}

**Duração calculada:** {c['duration']}
**Voz:** Thalita — direção específica abaixo.
**Status:** PLANEJADO — NÃO PRODUZIDO

## Narração completa

{table(["Tempo", "Narração", "Texto na tela", "Destaque", "Corte/enquadramento", "Som"], rows)}

## Direção de voz

- {c['voice']}
- Voz única: Thalita (`pt-BR-ThalitaMultilingualNeural`).
- Não acelerar a locução para caber; cortar texto se necessário.

## Pausas e ênfases

- Pausas padrão entre frases: **120–140 ms**.
- Pausas intencionais: 200–300 ms, listadas abaixo.
- Não usar pausa acima de 300 ms.
- Ênfases: apenas as palavras marcadas em “Destaque”.
- Não cortar sílabas, consoantes ou finais de palavra.
- Se a locução real não couber, cortar texto — não acelerar a voz.

{pause_text}

## Entrada para TTS

- Expandir os números antes de gerar o áudio: `R$ 100` → “cem reais”; `R$ 61` → “sessenta e um reais”; `5%` → “cinco por cento”; `25%` → “vinte e cinco por cento”; `39%` → “trinta e nove por cento”; `78` → “setenta e oito”; `61` → “sessenta e um”; `10` → “dez”.
- Não alimentar o TTS com símbolos ou algarismos isolados.
- O texto da coluna “Narração” é a referência editorial; a entrada do TTS é a versão expandida.

## Notas de tela

- Uma ideia por tela.
- Amarelo `#FACC15` apenas no destaque indicado.
- Não sobrepor legenda convencional à tipografia.
- Simulação/hipótese sempre visível quando houver número.

## CTA

{c['cta']}
"""


def storyboard_doc(c):
    narration = c["rows"]
    shots = c["shots"]
    n_rows = len(narration)
    n_shots = len(shots)
    rows = []
    for index, shot in enumerate(shots, start=1):
        first = round((index - 1) * n_rows / n_shots)
        last = max(first, round(index * n_rows / n_shots) - 1)
        start = narration[first]["start"]
        end = narration[last]["end"]
        if index == n_shots:
            end = c["duration_seconds"]
        rows.append((f"S{index:02d}", span(start, end), shot[1], shot[2], shot[3], shot[4]))
    return f"""# STORYBOARD — {c['id']} {c['title']}

**Duração calculada:** {c['duration']}
**Formato:** 1080×1920 · 30 fps
**Status:** PLANEJADO — NÃO PRODUZIDO

{table(["Shot", "Tempo", "Visual", "Câmera/movimento", "Texto", "Som"], rows)}

## Direção de arte

- Fundo preto `#050505`; amarelo `#FACC15`; branco para apoio.
- Plus Jakarta Sans; hierarquia forte.
- Sem imagens genéricas; tudo com função narrativa.
- Safe zone: 78 px nas laterais para Reels/Shorts; 120 px à direita para TikTok; 220 px no rodapé.
- Em split vertical, usar topo/base com 120 px de respiro; não usar lado a lado em 9:16.
- Todos os end cards exibem a assinatura Invest Fácil.
- Disclaimer fixo no end card: “Conteúdo educacional. Não é recomendação de investimento.”
- Tempos derivados da narração; ajustar apenas se o TTS real divergir.
- Este documento é um storyboard de cenas; o mapa de cortes internos está na EDITING_TIMELINE.

## Regras de composição

- Tipografia mínima: 34 px para labels e 44 px para corpo em 1080×1920.
- `line-height` ≥ 1,08 em textos com ç, g, p, q, j; não usar `overflow: hidden` que corte descendentes.
- No máximo dois elementos concorrentes por frame (número + label); o terceiro entra depois.
- Não colocar texto no seam de split-screen nem em reflexo.
- Ticker/gráfico atrás ou depois do herói, nunca sobre o número principal.
"""


def editing_doc(c):
    rows = []
    total_cuts = 0
    for index, r in enumerate(c["rows"]):
        cuts = 1 if index == len(c["rows"]) - 1 else micro_cuts(c, r)
        total_cuts += cuts
        rows.append((span(r["start"], r["end"]), r["text"], r["cut"], r["screen"], r["sound"], r["highlight"], cuts))
    return f"""# EDITING TIMELINE — {c['id']} {c['title']}

**Duração calculada:** {c['duration']}
**Ritmo:** {c['cut_freq']}
**Cortes internos planejados:** {total_cuts}
**Status:** PLANEJADO — NÃO PRODUZIDO

{table(["Tempo", "Narração", "Corte/transição", "Texto", "Áudio", "Ênfase", "Cortes internos"], rows)}

## Decisões de edição

- Cortes motivados por fala, música ou mudança visual.
- Punch-ins apenas em palavras/números importantes.
- Nenhuma composição estática por mais de 3 s sem intenção.
- Transições: {c['transitions']}
- Se o vídeo ficar longo, cortar repetições — não a clareza.
- Se o TTS real divergir mais de 0,4 s em um bloco, re-timar o bloco, não a voz.
- Frequência de corte planejada: {c['cut_freq']}.
- A coluna “Cortes internos” conta as batidas dentro de cada bloco; o storyboard mostra a cena, não cada corte.
"""


def sound_doc(c):
    events = {}
    for r in c["rows"]:
        events.setdefault(r["sound"], []).append(fmt(r["start"]))
    rows = [(sound, ", ".join(times) + " s") for sound, times in events.items()]
    return f"""# SOUND DESIGN — {c['id']} {c['title']}

**Voz:** Thalita (`pt-BR-ThalitaMultilingualNeural`).
**Status:** PLANEJADO — NÃO PRODUZIDO.

## Narração

- Voz única: Thalita.
- Direção: {c['voice']}
- Contínua e natural; a energia vem da interpretação, não de acelerar.
- Pausas padrão de 120–140 ms.
- Pausas intencionais de 200–300 ms apenas nos pontos marcados.
- Não cortar finais de palavras.

## Música

{c['sound']}

## Mapa de SFX

{table(["Som", "Momentos"], rows)}

## Silêncios intencionais

- O silêncio só existe antes de uma revelação ou depois de uma frase de impacto.
- Não deixar silêncio longo sem função.
- O silêncio deve realçar a frase, não parecer falha.

## Mixagem

- Voz: camada 1, intelligibilidade absoluta.
- Música: camada 2, ducking sob a voz (-10 dB, attack 150 ms, release 400 ms).
- SFX: camada 3, sincronizados com corte/revelação; no máximo 1 acento a cada 2 s.
- Ambiência: camada 4, discreta.
- Loudness alvo: -14 LUFS; true peak ≤ -1,0 dBTP.
- Sem clipping/distorção.
"""


MOTION = {
    "V01": ("Máscara horizontal + punch-in", "Corte seco", "Ticker atrás do herói; nunca sobre o número principal."),
    "V02": ("Fade curto + match cut", "Light sweep", "Luz quente limitada a um acento; preto/amarelo dominam."),
    "V03": ("Shape morph + mask", "Corte seco", "Engrenagens em preto/amarelo; não parecer outra marca."),
    "V04": ("Wipe + punch-in", "Glitch controlado", "Máximo 2 elementos: timer, número ou pergunta."),
    "V05": ("Fade + slow push", "Light sweep", "Micro-movimento constante; não parecer still."),
    "V06": ("Split reveal + jump cut", "Mask", "Split topo/base; não lado a lado em 9:16."),
    "V07": ("Chart draw + label pop", "Wipe", "Labels ≥34 px; máximo 3 por frame."),
    "V08": ("UI pop + chat bubble", "Jump cut", "UI premium; não parecer meme de creator."),
    "V09": ("Light sweep + logo reveal", "Match cut", "Logo reveal sem estética de anúncio de banco."),
    "V10": ("Morph + mirror + parallax", "Fade", "Não refletir texto; testar morph em tela pequena."),
}


def motion_doc(c):
    entry, exit_, risk = MOTION[c["id"]]
    rows = []
    for r in c["rows"]:
        rows.append((span(r["start"], r["end"]), r["screen"], r["cut"], entry, exit_))
    return f"""# MOTION DESIGN — {c['id']} {c['title']}

**Duração calculada:** {c['duration']}
**Formato:** 1080×1920 · 30 fps
**Linguagem:** {c['editing']}
**Tipografia:** {c['kinetic']}
**Transições:** {c['transitions']}
**Status:** PLANEJADO — NÃO PRODUZIDO.

## Princípios

- Cada animação tem entrada, hold e saída; nada fica animando sem função.
- Tipografia mínima: 34 px para labels e 44 px para corpo.
- `line-height` ≥ 1,08 em textos com ç, g, p, q, j; não usar `overflow: hidden` que corte descendentes.
- No máximo dois elementos concorrentes por frame (número + label); o terceiro entra depois.
- Texto na tela é palavra-chave, não legenda da narração.
- Movimento motivado por fala, corte ou música; nenhuma transição decorativa.

## Contrato de frames

- Entrada: 8–12 frames.
- Hold: até a sílaba tônica ou 12–18 frames.
- Saída: 6–8 frames.
- Números: spring com damping alto; texto: `Easing.out(Easing.cubic)`.
- Contadores: 1 incremento a cada 2–3 frames, sem blur.

## Mapa de motion por bloco

{table(["Tempo", "Texto", "Movimento", "Entrada", "Saída"], rows)}

## Componentes Remotion sugeridos

- `KineticText` — revelação por máscara, sem cortar descendentes.
- `Counter` — 100 → 61, com hold final.
- `SplitScreen` — topo/base em 9:16.
- `ChartLine` — desenho progressivo com labels.
- `Basket` — remoção item a item, blur só no item removido.
- `Ticker` — movimento periférico, atrás do herói.
- `ChatBubble` — UI premium, sem estética de meme.
- `Mirror` — reflexo sem texto.

## Risco específico

- {risk}

## Regras de segurança visual

- Safe zone: 78 px laterais para Reels/Shorts; 120 px à direita para TikTok; 220 px no rodapé.
- CTA e disclaimer dentro da área segura.
- Frame 0 legível, sem flash lavado.
- Nenhum texto no seam de split ou em reflexo.
"""


def retention_doc(c):
    scale = c["duration_seconds"] / c["old_duration"]
    rows = []
    for block in c["retention"]:
        start, end = parse_span(block[0])
        rows.append((span(start * scale, end * scale), block[1], block[2], block[3], block[4]))
    return f"""# RETENTION MAP — {c['id']} {c['title']}

**Tipo:** mapa hipotético, não medição real.
**Duração calculada:** {c['duration']}
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
    risks = "\n".join(f"- {risk}" for risk in c["quality"])
    max_cps = max(r["chars"] / r["speech"] for r in c["rows"])
    longest = max(r["speech"] for r in c["rows"])
    return f"""# QUALITY CHECKLIST — {c['id']} {c['title']}

**Status:** PLANEJADO — NÃO PRODUZIDO.
**Duração calculada:** {c['duration']}

## Pré-produção

- [x] Conceito distinto das outras 9 variantes.
- [x] Roteiro calibrado para a voz Thalita.
- [x] Nenhuma promessa financeira falsa.
- [x] Números hipotéticos marcados como simulação na fala ou na tela.
- [x] CTA definido.
- [ ] Locução real gerada e medida.

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

## Densidade da narração

- Caracteres falados: {sum(r['chars'] for r in c['rows'])}.
- Maior densidade em um bloco: {fmt(max_cps)} caracteres/s de fala.
- Bloco mais longo: {fmt(longest)} s.
- Referência aprovada (Thalita, High Impact 01): ~14,1 caracteres/s de fala.
- Nenhum bloco acima de 3,2 palavras/s equivalentes.

## Riscos específicos

{risks}
"""


def matrix_doc(concepts):
    core_rows = [(c["id"], c["title"], c["style"], c["duration"], c["hook"], c["psych"], c["structure"], c["metaphor"], c["emotion"]) for c in concepts]
    craft_rows = [(c["id"], c["editing"], c["cut_freq"], c["kinetic"], c["sound"], c["transitions"], c["demo"], c["ending"]) for c in concepts]
    diff_rows = [(c["id"], c["differentiation"], c["risks"]) for c in concepts]
    density_rows = []
    for c in concepts:
        chars = sum(r["chars"] for r in c["rows"])
        speech = sum(r["speech"] for r in c["rows"])
        density_rows.append((c["id"], c["duration"], chars, fmt(chars / c["duration_seconds"]), fmt(speech)))
    return f"""# MATRIZ DE CONCEITOS — 10 VARIANTES

**Tema:** “Por que R$ 100 hoje não compram a mesma coisa amanhã?”
**Status:** Gate 3 — planejamento; nenhum vídeo produzido.
**Timing:** calculado a partir da narração, com 14,0 caracteres/s de fala e pausas de 120–300 ms. Não é medição de TTS real.

## 1. Núcleo narrativo

{table(["ID", "Título", "Estilo", "Duração", "Hook", "Estratégia psicológica", "Estrutura", "Metáfora", "Emoção"], core_rows)}

## 2. Linguagem audiovisual

{table(["ID", "Edição", "Frequência de cortes", "Tipografia", "Som", "Transições", "Demonstração", "Encerramento"], craft_rows)}

## 3. Diferenciação e riscos

{table(["ID", "Assinatura única", "Risco principal"], diff_rows)}

## 4. Densidade e viabilidade

{table(["ID", "Duração", "Caracteres falados", "Caracteres/s", "Fala estimada (s)"], density_rows)}

## 5. Auditoria de diferenciação

- Nenhum par usa a mesma estrutura narrativa.
- V01 é ticker/montagem; V02 é ritual/cinema; V03 é objeto/máquina; V04 é quiz cronometrado; V05 é minimalismo/silêncio; V06 é psicologia/salário; V07 é dados/gráfico; V08 é conversa/chat; V09 é manifesto de marca; V10 é poesia/espelho.
- As diferenças não são apenas cor, música ou primeira frase.
- A frase de simulação muda de forma e de função em cada vídeo.
- Thalita é a voz de todas as variantes; a variação está no ritmo e no texto.
"""


def main():
    concepts = prepare()
    problems = []
    for c in concepts:
        if c["computed_total"] > c["duration_seconds"]:
            problems.append(f"{c['id']} estoura: {fmt(c['computed_total'])} s > {fmt(c['duration_seconds'])} s")
        folder = os.path.join(ROOT, c["id"])
        write(os.path.join(folder, "CONCEPT.md"), concept_doc(c))
        write(os.path.join(folder, "SCRIPT.md"), script_doc(c))
        write(os.path.join(folder, "STORYBOARD.md"), storyboard_doc(c))
        write(os.path.join(folder, "MOTION_DESIGN.md"), motion_doc(c))
        write(os.path.join(folder, "EDITING_TIMELINE.md"), editing_doc(c))
        write(os.path.join(folder, "SOUND_DESIGN.md"), sound_doc(c))
        write(os.path.join(folder, "RETENTION_MAP.md"), retention_doc(c))
        write(os.path.join(folder, "QUALITY_CHECKLIST.md"), quality_doc(c))
    write(os.path.join(ROOT, "reports", "CREATIVE_CONCEPTS_MATRIX.md"), matrix_doc(concepts))
    print("generated", len(concepts), "concepts")
    for c in concepts:
        chars = sum(r["chars"] for r in c["rows"])
        print(
            f"{c['id']} dur={fmt(c['duration_seconds'])}s total={fmt(c['computed_total'])}s "
            f"chars={chars} cps={fmt(chars / c['duration_seconds'])} rows={len(c['rows'])}"
        )
    if problems:
        print("PROBLEMS:")
        for p in problems:
            print(" -", p)
    else:
        print("no overflow")


if __name__ == "__main__":
    main()
