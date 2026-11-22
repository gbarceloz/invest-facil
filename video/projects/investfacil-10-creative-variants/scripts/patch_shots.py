import io
import os

path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "generate_gate3_docs.py")
with open(path, encoding="utf-8") as handle:
    text = handle.read()

patches = [
    ("Cinco etiquetas de preço sobem em ritmo de ticker.", "Cinco etiquetas de preço hipotéticas sobem em ritmo de ticker."),
    ("Xícara de café em close, vapor subindo.", "Xícara vazia; a nota ao lado."),
    ("Slow push; luz lateral quente.", "Close; luz fria."),
    ("\"TODO DIA, O MESMO CAFÉ\", \"Ambiência\"", "\"ATÉ O DIA EM QUE NÃO DEU\", \"Silêncio\""),
    ("Nota de R$ 100 ao lado da xícara.", "Flashback: xícara cheia, luz quente."),
    ("Top-down; leve parallax.", "Slow push; parallax."),
    ("\"R$ 100\", \"Moeda\"", "\"O MESMO CAFÉ, TODO DIA\", \"Ambiência\""),
    ("\"5% AO ANO\", \"Riser\"", "\"SIMULAÇÃO · 5% AO ANO\", \"Riser\""),
    ("\"R$ 78\", \"Tick\"", "\"SIMULAÇÃO · R$ 78\", \"Tick\""),
    ("\"R$ 61\", \"Impact\"", "\"SIMULAÇÃO · R$ 61\", \"Impact\""),
    ("\"NÃO APARECE NA NOTA\", \"Paper\"", "\"NÃO É IMPOSTO LITERAL · É INFLAÇÃO\", \"Paper\""),
]

for old, new in patches:
    count = text.count(old)
    print(f"{count:2d} | {old[:70]}")
    if count == 1:
        text = text.replace(old, new)
    elif count > 1:
        # Only replace the first occurrence, used for repeated screen labels.
        text = text.replace(old, new, 1)

with open(path, "w", encoding="utf-8", newline="\n") as handle:
    handle.write(text)
print("patched")
