"""Audit Gate 3 documents for stale text, missing sections and differentiation."""

import os
import re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
IDS = [f"V{i:02d}" for i in range(1, 11)]
FILES = ["CONCEPT.md", "SCRIPT.md", "STORYBOARD.md", "MOTION_DESIGN.md", "EDITING_TIMELINE.md", "SOUND_DESIGN.md", "RETENTION_MAP.md", "QUALITY_CHECKLIST.md"]

BANNED = [
    "energia média-alta",
    "Conheça a plataforma",
    "Fechar em 40 s",
    "Fechar em 35 s",
    "Fechar em 30 s",
    "uma cadeira",
    "agora com preço maior",
    "dois itens saem",
    "números verificáveis",
    "O ponto não é quanto você tem",
    "consommation",
]

results = []
fail = 0


def check(name, condition, detail=""):
    global fail
    status = "PASS" if condition else "FAIL"
    if not condition:
        fail += 1
    results.append(f"{status} | {name}" + (f" | {detail}" if detail else ""))


for vid in IDS:
    folder = os.path.join(ROOT, vid)
    existing = [f for f in FILES if os.path.exists(os.path.join(folder, f))]
    check(f"{vid} 8 docs", len(existing) == 8, ",".join(existing))

for vid in IDS:
    folder = os.path.join(ROOT, vid)
    texts = {}
    for name in FILES:
        path = os.path.join(folder, name)
        if os.path.exists(path):
            with open(path, encoding="utf-8") as handle:
                texts[name] = handle.read()

    all_text = "\n".join(texts.values())
    for phrase in BANNED:
        check(f"{vid} no stale '{phrase[:32]}'", phrase not in all_text)

    concept = texts.get("CONCEPT.md", "")
    script = texts.get("SCRIPT.md", "")
    story = texts.get("STORYBOARD.md", "")
    editing = texts.get("EDITING_TIMELINE.md", "")
    sound = texts.get("SOUND_DESIGN.md", "")

    check(f"{vid} concepto tem duração calculada", "Duração calculada" in concept)
    check(f"{vid} script tem direção de voz", "## Direção de voz" in script)
    motion = texts.get("MOTION_DESIGN.md", "")
    check(f"{vid} motion tem princípios", "## Princípios" in motion)
    check(f"{vid} motion tem mapa", "## Mapa de motion por bloco" in motion)
    check(f"{vid} motion tem componentes", "Componentes Remotion" in motion)
    check(f"{vid} script tem pausas", "## Pausas e ênfases" in script)
    check(f"{vid} editing tem cortes internos", "Cortes internos planejados" in editing)
    check(f"{vid} storyboard tem disclaimer", "Conteúdo educacional. Não é recomendação de investimento." in story)
    check(f"{vid} storyboard rotula simulação", "SIMULAÇÃO" in story.upper())
    check(f"{vid} storyboard tem safe zone TikTok", "120 px à direita" in story)
    check(f"{vid} sound tem ducking", "attack 150 ms" in sound)
    check(f"{vid} sound tem limite de SFX", "no máximo 1 acento a cada 2 s" in sound)

check("V03 hook corrigido", "A nota entra inteira. O que ela compra, não." in open(os.path.join(ROOT, "V03", "CONCEPT.md"), encoding="utf-8").read())
check("V06 hook corrigido", "Seu salário subiu. Então por que o mês continua apertado?" in open(os.path.join(ROOT, "V06", "CONCEPT.md"), encoding="utf-8").read())
check("V04 shot 4/5 corrigido", "um item sai; restam quatro de cinco" in open(os.path.join(ROOT, "V04", "STORYBOARD.md"), encoding="utf-8").read())
check("V02 shot sem preço maior", "agora com preço maior" not in open(os.path.join(ROOT, "V02", "STORYBOARD.md"), encoding="utf-8").read())
check("V09 qualifica imposto", "Não é imposto literal" in open(os.path.join(ROOT, "V09", "SCRIPT.md"), encoding="utf-8").read())

for vid in ["V03", "V10"]:
    text = "\n".join(open(os.path.join(ROOT, vid, name), encoding="utf-8").read() for name in FILES)
    check(f"{vid} sem 4/5 no cenário de 5%", "4/5" not in text and "4 de 5" not in text)

for vid in ["V04", "V08"]:
    text = "\n".join(open(os.path.join(ROOT, vid, name), encoding="utf-8").read() for name in FILES)
    check(f"{vid} mantém 4/5 no cenário de +25%", "4 de 5" in text or "4/5" in text)

matrix_path = os.path.join(ROOT, "reports", "CREATIVE_CONCEPTS_MATRIX.md")
matrix = open(matrix_path, encoding="utf-8").read()
check("matriz 10 IDs", all(f"| {vid} |" in matrix for vid in IDS))
for vid in IDS:
    check(f"matriz {vid} 1 ocorrência no núcleo", matrix.count(f"| {vid} |") >= 3, str(matrix.count(f"| {vid} |")))

# duplicate narration lines across concepts
lines = {}
for vid in IDS:
    script = open(os.path.join(ROOT, vid, "SCRIPT.md"), encoding="utf-8").read()
    for line in script.splitlines():
        if line.startswith("| ") and "–" in line and line.count("|") >= 7:
            cells = [c.strip() for c in line.strip("|").split("|")]
            if len(cells) >= 2 and cells[1] and not cells[1].startswith("Narração"):
                lines.setdefault(cells[1], []).append(vid)
duplicates = {text: vids for text, vids in lines.items() if len(vids) >= 3}
check("Nenhuma fala idêntica em 3+ vídeos", not duplicates, str(duplicates))

# simulation labeling in scripts
for vid in IDS:
    script = open(os.path.join(ROOT, vid, "SCRIPT.md"), encoding="utf-8").read()
    rows = [l for l in script.splitlines() if l.startswith("| ") and "–" in l]
    unlabeled = []
    for row in rows:
        cells = [c.strip() for c in row.strip("|").split("|")]
        if len(cells) >= 3 and re.search(r"5%|25%|R\$ 61|cerca de 61", cells[1]):
            if "SIMULA" not in cells[2].upper():
                unlabeled.append(cells[0])
    check(f"{vid} simulações rotuladas", not unlabeled, ",".join(unlabeled))

print("\n".join(results))
print(f"\nTOTAL {len(results)} checks, {fail} failures")
