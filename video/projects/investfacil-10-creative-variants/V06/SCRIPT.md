# SCRIPT — V06 Não é impressão

**Duração calculada:** 40 s
**Voz:** Thalita — direção específica abaixo.
**Status:** PLANEJADO — NÃO PRODUZIDO

## Narração completa

| Tempo | Narração | Texto na tela | Destaque | Corte/enquadramento | Som |
|---|---|---|---|---|---|
| 0,0–1,3 | Seu salário subiu. | SALÁRIO | salário | Close no contracheque | click |
| 1,4–4,1 | Então por que o mês continua apertado? | POR QUÊ? | apertado | Split salário/cesta | sub |
| 4,3–8,0 | Você não está imaginando. Seu dinheiro compra menos. | NÃO É IMPRESSÃO | NÃO | Close text | sub |
| 8,1–11,6 | A sensação de que o salário não acompanha é real. | SALÁRIO x CESTA | real | Split salário/cesta | click |
| 11,7–15,1 | O salário pode até subir. Os preços sobem mais. | SALÁRIO x PREÇOS | preços | Split salário/preços | click |
| 15,2–19,5 | A cesta fica mais cara. E o que sobra no fim do mês diminui. | CESTA | cesta | Split cesta | impact |
| 19,6–22,9 | É a inflação: a alta generalizada dos preços. | INFLAÇÃO | inflação | Bass | impact |
| 23,1–26,5 | Ela corrói o poder de compra sem fazer barulho. | PODER DE COMPRA | poder de compra | Linha cai | sub |
| 26,6–33,2 | Numa simulação de 5% ao ano, R$ 100 valem cerca de 61 em dez anos. | SIMULAÇÃO · R$ 61 | R$ 61 | Contador | ticks |
| 33,4–35,4 | Não é impressão. É inflação. | NÃO É IMPRESSÃO | inflação | Espelho | impact |
| 35,6–39,2 | Salve para entender quando o salário não acompanha. | SALVE | SALVE | End card | brand |

## Direção de voz

- Segunda pessoa, tom de validação. Empática, não conspiradora; firme no “é inflação”.
- Voz única: Thalita (`pt-BR-ThalitaMultilingualNeural`).
- Não acelerar a locução para caber; cortar texto se necessário.

## Pausas e ênfases

- Pausas padrão entre frases: **120–140 ms**.
- Pausas intencionais: 200–300 ms, listadas abaixo.
- Não usar pausa acima de 300 ms.
- Ênfases: apenas as palavras marcadas em “Destaque”.
- Não cortar sílabas, consoantes ou finais de palavra.
- Se a locução real não couber, cortar texto — não acelerar a voz.

- Pausa de **250 ms** após o trecho em 19,6 s.
- Pausa de **200 ms** após o trecho em 33,4 s.

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

Salve para entender quando o salário não acompanha.
