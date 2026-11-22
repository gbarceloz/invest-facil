"""Final Gate 3 generator: applies narration-density patches to the base data."""

import importlib.util
import os

BASE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "generate_gate3_docs.py")
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

spec = importlib.util.spec_from_file_location("gate3_base", BASE)
base = importlib.util.module_from_spec(spec)
spec.loader.exec_module(base)

PATCHES = {
    "V02": {
        1: "O mesmo pedido. O mesmo R$ 100 no bolso. O mesmo café.",
        5: "Não foi o café que ficou mais caro de repente. Foi o dinheiro que ficou menor.",
    },
    "V03": {
        0: "O dinheiro entra inteiro na máquina.",
        1: "E sai menor do que entrou.",
        4: "O número na nota não muda. Ele continua 100.",
        5: "Mas o que ele compra, sim. E isso muda o seu dia.",
        7: "A inflação não rasga o dinheiro. Ela não tira o número da nota.",
        8: "Ela diminui o que ele compra. É por isso que o troco encolhe.",
    },
    "V05": {
        0: "R$ 100 não é só um número impresso.",
        1: "É uma promessa de compra que você carrega no bolso.",
        4: "O valor impresso continua igual. A nota não muda.",
        5: "O que ele compra, não. E é isso que pesa no dia a dia.",
    },
    "V06": {
        0: "Você não está imaginando. Seu dinheiro compra menos.",
        1: "A sensação de que o salário não acompanha é real.",
        2: "O salário pode até subir. O número na conta aumenta.",
        3: "Mas a cesta também sobe. E o que sobra no fim do mês diminui.",
        7: "Não é impressão. É um fenômeno econômico.",
    },
    "V07": {
        1: "Ela começa em R$ 100. Esse é o seu poder de compra hoje.",
        2: "Com 5% de inflação ao ano, ela cai de forma silenciosa.",
        3: "Em 5 anos, cerca de R$ 78. A queda já aparece.",
        4: "Em 10 anos, cerca de R$ 61. É uma perda de quase 39%.",
        5: "O número na conta não mudou. A nota continua a mesma.",
        6: "O que ele compra, sim. A cesta fica menor.",
    },
    "V08": {
        1: "…precisa ver isso. A conta não fecha.",
        3: "Não é porque o dinheiro sumiu. Ele continua na conta.",
        4: "É porque ele compra menos. O troco encolhe.",
        6: "Dinheiro parado não fica igual. Ele perde poder de compra.",
        7: "É inflação. E ela age devagar.",
    },
    "V09": {
        0: "Existe um imposto que ninguém votou. E você paga todos os dias.",
        1: "Ele não aparece na nota. Mas está embutido no preço.",
        2: "Quando você compra pão, café ou transporte, ele está lá.",
        3: "É a inflação: os preços sobem e o dinheiro compra menos.",
        6: "Não é sobre prever o futuro. É sobre entender o presente.",
        7: "É sobre olhar para o seu dinheiro e ver o que ele realmente compra.",
        8: "Entender o dinheiro é o primeiro passo.",
    },
    "V10": {
        0: "Se o seu dinheiro pudesse falar, ele diria: eu não desapareci.",
        1: "Você só compra menos. O número continua na nota.",
        2: "O que muda é o tamanho do que ele pode comprar.",
        3: "O número continua o mesmo. A nota não encolhe.",
        4: "Mas o poder de compra muda. E muda devagar.",
        5: "É a inflação. Ela não some com o dinheiro.",
        6: "Ela diminui o que ele pode comprar. Item por item.",
        8: "O dinheiro não some. Ele muda de tamanho.",
        9: "No que você pode comprar, ele fica menor.",
    },
}

for concept in base.CONCEPTS:
    patches = PATCHES.get(concept["id"], {})
    for index, text in patches.items():
        row = list(concept["narration"][index])
        row[1] = text
        concept["narration"][index] = tuple(row)

for concept in base.CONCEPTS:
    folder = os.path.join(ROOT, concept["id"])
    base.write(os.path.join(folder, "CONCEPT.md"), base.concept_doc(concept))
    base.write(os.path.join(folder, "SCRIPT.md"), base.script_doc(concept))
    base.write(os.path.join(folder, "STORYBOARD.md"), base.storyboard_doc(concept))
    base.write(os.path.join(folder, "EDITING_TIMELINE.md"), base.editing_doc(concept))
    base.write(os.path.join(folder, "SOUND_DESIGN.md"), base.sound_doc(concept))
    base.write(os.path.join(folder, "RETENTION_MAP.md"), base.retention_doc(concept))
    base.write(os.path.join(folder, "QUALITY_CHECKLIST.md"), base.quality_doc(concept))
base.write(os.path.join(ROOT, "reports", "CREATIVE_CONCEPTS_MATRIX.md"), base.matrix_doc())
print("regenerated with density patches")
