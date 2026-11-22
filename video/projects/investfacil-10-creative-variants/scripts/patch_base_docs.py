import os
import re

path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "generate_gate3_docs.py")
with open(path, encoding="utf-8") as handle:
    text = handle.read()

patches = [
    (r'\("16,0[–-]20,0", "Close na xícara, agora com preço maior\."',
     '("16,0–20,0", "Close na xícara; a nota ao lado parece menor."'),
    (r'"Fechar em 40 s e deixar 4 s de CTA"', '"Fechar o payoff e deixar 3 s de CTA"'),
    (r'\("5,0[–-]7,0", "Preços \+25%; dois itens saem\."',
     '("5,0–7,0", "Preços +25%; um item sai; restam quatro de cinco."'),
    (r'"cta": "Conheça a plataforma\.",\s*\n\s*"differentiation": "Único quase silencioso',
     '"cta": "Salve para consultar quando o preço mudar.",\n        "differentiation": "Único quase silencioso'),
    (r'\("35,0[–-]40,0", "Conheça a plataforma\.", "CONHEÇA A PLATAFORMA"',
     '("35,0–40,0", "Salve para consultar.", "SALVE"'),
    (r'"Vazio ao redor da nota; uma cadeira\? Não; só mesa\."',
     '"Vazio ao redor da nota; só a mesa e a luz."'),
    (r'\("35,0[–-]40,0", "Logo e CTA\.", "Fade\.", "CONHEÇA A PLATAFORMA"',
     '("35,0–40,0", "Logo e CTA.", "Fade.", "SALVE"'),
    (r'"Fechar em 35 s"', '"Fechar o payoff e deixar 3 s de CTA"'),
    (r'"Fechar em 30 s"', '"Fechar o payoff e deixar 3 s de CTA"'),
    (r'"promise": "Explicar a inflação com uma linha simples e números verificáveis\.",',
     '"promise": "Explicar a inflação com uma linha simples e uma simulação transparente.",'),
    (r'"cta": "Conheça a plataforma\.",\s*\n\s*"differentiation": "Único manifesto de marca',
     '"cta": "Siga o Invest Fácil para entender o dinheiro.",\n        "differentiation": "Único manifesto de marca'),
    (r'"Invest Fácil\. Entenda o dinheiro\. Depois, o mercado\.", "INVEST FÁCIL", "INVEST FÁCIL"',
     '"Invest Fácil. Entenda o dinheiro. Depois, o mercado.", "INVEST FÁCIL · SIGA", "INVEST FÁCIL"'),
]

for pattern, replacement in patches:
    new_text, count = re.subn(pattern, replacement, text)
    if count != 1:
        print(f"WARN count={count} for {pattern[:60]}")
    text = new_text

with open(path, "w", encoding="utf-8", newline="\n") as handle:
    handle.write(text)

print("patched")
