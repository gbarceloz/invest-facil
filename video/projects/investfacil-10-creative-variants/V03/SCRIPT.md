# SCRIPT — V03 A máquina de encolher dinheiro

**Duração calculada:** 33 s
**Voz:** Thalita — direção específica abaixo.
**Status:** PLANEJADO — NÃO PRODUZIDO

## Narração completa

| Tempo | Narração | Texto na tela | Destaque | Corte/enquadramento | Som |
|---|---|---|---|---|---|
| 0,0–2,3 | A nota entra inteira na máquina. | ENTRA INTEIRA | inteira | Nota entra na máquina | mechanical |
| 2,4–4,3 | O que ela compra sai menor. | O QUE ELA COMPRA SAI MENOR | menor | Cesta menor sai | clunk |
| 4,5–6,3 | Não é mágica. É inflação. | INFLAÇÃO | inflação | Engrenagens | impact |
| 6,5–9,8 | Os preços sobem. A mesma quantia compra menos. | A MESMA QUANTIA | menos | Itens da cesta somem | whoosh |
| 9,9–12,8 | O número na nota não muda. Continua 100. | O NÚMERO NÃO MUDA | número | Macro na nota | click |
| 12,9–14,8 | Mas o que ele compra, sim. | O QUE ELE COMPRA MUDA | compra | Split nota/cesta | sub |
| 14,9–17,5 | A cada ano, a máquina leva um pouco. | A MÁQUINA LEVA UM POUCO | leva | Engrenagens lentas | mechanical |
| 17,6–23,3 | Em dez anos, a 5% ao ano, o poder de compra cai para 61. | SIMULAÇÃO · 5% AO ANO | R$ 61 | Contador | ticks |
| 23,5–25,7 | A inflação não rasga o dinheiro. | NÃO RASGA | não rasga | Nota intacta | paper |
| 25,9–28,0 | Ela diminui o que ele compra. | DIMINUI O QUE ELE COMPRA | diminui | Cesta 3/5 | impact |
| 28,2–32,1 | Compartilhe com quem acha que dinheiro parado não muda. | COMPARTILHE | COMPARTILHE | End card | brand |

## Direção de voz

- Curiosa, com pausas de engrenagem. Baixa no início, firme na revelação.
- Voz única: Thalita (`pt-BR-ThalitaMultilingualNeural`).
- Não acelerar a locução para caber; cortar texto se necessário.

## Pausas e ênfases

- Pausas padrão entre frases: **120–140 ms**.
- Pausas intencionais: 200–300 ms, listadas abaixo.
- Não usar pausa acima de 300 ms.
- Ênfases: apenas as palavras marcadas em “Destaque”.
- Não cortar sílabas, consoantes ou finais de palavra.
- Se a locução real não couber, cortar texto — não acelerar a voz.

- Pausa de **250 ms** após o trecho em 4,5 s.
- Pausa de **200 ms** após o trecho em 23,5 s.
- Pausa de **200 ms** após o trecho em 25,9 s.

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

Compartilhe com quem acha que dinheiro parado não muda.
