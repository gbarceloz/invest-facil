# SCRIPT — V07 A linha que explica seu bolso

**Duração calculada:** 40 s
**Voz:** Thalita — direção específica abaixo.
**Status:** PLANEJADO — NÃO PRODUZIDO

## Narração completa

| Tempo | Narração | Texto na tela | Destaque | Corte/enquadramento | Som |
|---|---|---|---|---|---|
| 0,0–4,0 | Uma linha pode explicar por que seu dinheiro vale menos. | PODER DE COMPRA | linha | Linha começa | tick |
| 4,1–8,0 | Ela começa em R$ 100. É o seu poder de compra hoje. | R$ 100 | R$ 100 | Ponto 0 | click |
| 8,1–12,2 | Numa simulação de 5% ao ano, ela cai devagar. | SIMULAÇÃO · 5% AO ANO | 5% | Linha desce | riser |
| 12,4–16,8 | Em cinco anos, cerca de R$ 78. A queda já aparece. | SIMULAÇÃO · R$ 78 | R$ 78 | Ponto 5a | tick |
| 16,9–23,2 | Em dez anos, cerca de R$ 61. É uma perda de quase 39%. | SIMULAÇÃO · R$ 61 | R$ 61 | Ponto 10a | impact |
| 23,4–27,2 | O número na conta não mudou. A nota continua a mesma. | O NÚMERO NÃO MUDOU | número | Split | sub |
| 27,3–30,3 | O que ele compra, sim. A cesta fica menor. | O QUE ELE COMPRA | compra | Cesta | whoosh |
| 30,5–34,1 | Isso é inflação. E é por isso que entender importa. | INFLAÇÃO | inflação | Highlight | impact |
| 34,3–38,5 | Simulação com 5% ao ano. Salve para consultar. | SIMULAÇÃO · SALVE | SIMULAÇÃO | End card | brand |

## Direção de voz

- Didática e calma, como quem explica um gráfico. Precisão nos números.
- Voz única: Thalita (`pt-BR-ThalitaMultilingualNeural`).
- Não acelerar a locução para caber; cortar texto se necessário.

## Pausas e ênfases

- Pausas padrão entre frases: **120–140 ms**.
- Pausas intencionais: 200–300 ms, listadas abaixo.
- Não usar pausa acima de 300 ms.
- Ênfases: apenas as palavras marcadas em “Destaque”.
- Não cortar sílabas, consoantes ou finais de palavra.
- Se a locução real não couber, cortar texto — não acelerar a voz.

- Pausa de **200 ms** após o trecho em 30,5 s.

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

Salve para consultar quando falarem de inflação.
