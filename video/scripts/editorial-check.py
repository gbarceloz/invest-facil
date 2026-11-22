"""Automated editorial checks for the Invest Fácil lab.

This is not a human review. It flags objective issues for the editor:
long sentences, repeated words, numeric consistency and narration/on-screen
divergences.
"""

import json
import os
import re
from collections import Counter

NARRATION = (
    "Você acha que cem reais estão parados? Não estão. A inflação corrói o seu "
    "poder de compra. Em dez anos, a cinco por cento ao ano, cem reais valem "
    "menos de sessenta e um. O problema não é o número. É a ilusão de que o "
    "dinheiro está parado."
)

ONSCREEN = [
    "Você acha que R$ 100 estão parados?",
    "R$ 100",
    "não valem o mesmo amanhã.",
    "exemplo: 5% de inflação ao ano",
    "O dinheiro não some.",
    "Ele perde poder de compra.",
    "poder de compra de R$ 100",
    "-39%",
    "R$ 100",
    "10 anos depois",
    "VALEM APROXIMADAMENTE R$ 61",
    "A conta não é sobre o preço. É sobre poder de compra.",
    "Exemplo hipotético com 5% ao ano. Não é projeção.",
    "O problema não é o número.",
    "É a ilusão de que ele está parado.",
    "inflação é silenciosa. educação não.",
    "Invest Fácil",
    "Entenda o dinheiro. Depois, o mercado.",
    "educação financeira sem promessas",
]

SCENES = [
    {"name": "Hook", "start": 0.0, "end": 4.5, "purpose": "Pergunta e choque visual"},
    {"name": "Inflação", "start": 4.33, "end": 10.17, "purpose": "Explicar perda de poder de compra"},
    {"name": "Dez anos", "start": 10.0, "end": 14.5, "purpose": "Exemplo numérico e gráfico"},
    {"name": "Ilusão", "start": 14.33, "end": 17.17, "purpose": "Fechamento conceitual"},
    {"name": "Assinatura", "start": 16.83, "end": 19.0, "purpose": "Marca e chamada final"},
]

STOPWORDS = {
    "a", "o", "e", "é", "que", "de", "do", "da", "em", "um", "uma", "para", "se",
    "não", "no", "na", "os", "as", "seu", "sua", "com", "por", "mais", "como",
    "dos", "das", "ao", "à", "ou", "já", "está", "estão", "ela", "ele", "isso",
}


def sentences(text):
    return [part.strip() for part in re.split(r"(?<=[.!?])\s+", text) if part.strip()]


def words(text):
    return re.findall(r"[\wÀ-ÿ]+", text.lower())


def main():
    sentence_list = sentences(NARRATION)
    word_list = words(NARRATION)
    content_words = [word for word in word_list if word not in STOPWORDS and not word.isdigit()]
    counts = Counter(content_words)
    repeated = [
        {"word": word, "count": count}
        for word, count in counts.most_common()
        if count > 1
    ]

    long_sentences = []
    for sentence in sentence_list:
        count = len(words(sentence))
        if count > 18:
            long_sentences.append({"sentence": sentence, "words": count})

    future_value = 100 / (1.05 ** 10)
    numeric_flags = []
    if "menos de sessenta e um" in NARRATION:
        numeric_flags.append(
            {
                "severity": "high",
                "issue": "Narração diz 'menos de sessenta e um', mas 100/(1,05^10) = 61,39.",
                "evidence": f"valor calculado: R$ {future_value:.2f}",
                "recommendation": "Trocar por 'cerca de sessenta e um reais' ou 'sessenta e um reais'.",
            }
        )

    narration_has_srt_line_5 = "Entenda o dinheiro" in NARRATION
    if not narration_has_srt_line_5:
        numeric_flags.append(
            {
                "severity": "medium",
                "issue": "A linha 'Entenda o dinheiro. Depois, o mercado.' existe na tela/SRT antigo, mas não na narração.",
                "evidence": "NARRATION termina em '...dinheiro está parado.'",
                "recommendation": "Tratar como assinatura visual, não como legenda de fala; não recriar SRT com essa linha.",
            }
        )

    not_narrated = [
        text
        for text in [
            "A conta não é sobre o preço. É sobre poder de compra.",
            "O dinheiro não some. Ele perde poder de compra.",
            "Entenda o dinheiro. Depois, o mercado.",
        ]
        if text.lower() not in NARRATION.lower()
    ]

    financial_terms = [
        "garantido",
        "garantia",
        "lucro",
        "retorno",
        "rende",
        "render",
        "ganho",
        "sem risco",
        "enriquecer",
        "ficar rico",
    ]
    found_financial_terms = [
        term
        for term in financial_terms
        if term in NARRATION.lower() or any(term in text.lower() for text in ONSCREEN)
    ]
    disclaimer_present = any("Exemplo hipotético" in text and "Não é projeção" in text for text in ONSCREEN)
    narration_duration = 18.69
    words_per_second = len(word_list) / narration_duration
    rhythm_note = (
        "Ritmo rápido para conteúdo educativo (>2,8 palavras/s); revisar respiração e pausas."
        if words_per_second > 2.8
        else "Ritmo dentro de faixa aceitável; confirmar com escuta."
    )

    report = {
        "narration_words": len(word_list),
        "narration_sentences": len(sentence_list),
        "average_words_per_sentence": round(len(word_list) / len(sentence_list), 2),
        "long_sentences": long_sentences,
        "repeated_content_words": repeated,
        "numeric_flags": numeric_flags,
        "on_screen_texts_not_verbatim_in_narration": not_narrated,
        "financial_risk_terms_found": found_financial_terms,
        "financial_disclaimer_present": disclaimer_present,
        "rhythm": {
            "narration_duration_s": narration_duration,
            "words_per_second": round(words_per_second, 2),
            "note": rhythm_note,
        },
        "scenes": SCENES,
        "note": "Checagem automática. Não substitui revisão humana de português, ritmo e adequação financeira.",
    }
    print(json.dumps(report, ensure_ascii=False, indent=2))
    with open(
        os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "_audit", "editorial-check.json"),
        "w",
        encoding="utf-8",
    ) as handle:
        json.dump(report, handle, ensure_ascii=False, indent=2)


if __name__ == "__main__":
    main()
