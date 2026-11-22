# SCRIPT — V02 O café de sempre

**Duração calculada:** 42 s
**Voz:** Thalita — direção específica abaixo.
**Status:** PLANEJADO — NÃO PRODUZIDO

## Narração completa

| Tempo | Narração | Texto na tela | Destaque | Corte/enquadramento | Som |
|---|---|---|---|---|---|
| 0,0–2,6 | Até o dia em que o dinheiro não deu. | ATÉ O DIA EM QUE NÃO DEU | não deu | Close na xícara vazia | silence |
| 2,9–5,7 | Ele comprava o mesmo café todos os dias. | O MESMO CAFÉ, TODO DIA | mesmo café | Flashback; luz quente | ambience |
| 5,9–9,4 | O mesmo pedido. Os mesmos R$ 100 para a semana. | R$ 100 / A SEMANA | R$ 100 | Nota no balcão | coin |
| 9,6–11,3 | No começo, sobrava troco. | SOBRAVA TROCO | troco | Recibo sobre a mesa | paper |
| 11,5–13,9 | Depois, o troco foi ficando menor. | O TROCO DIMINUIU | menor | Time-lapse de xícaras | clock |
| 14,1–15,3 | Até não dar mais. | NÃO DEU MAIS | não deu | Pausa; mão segura a nota | silence |
| 15,6–19,9 | O café não ficou caro do nada. O dinheiro é que compra menos. | NÃO FOI O CAFÉ | dinheiro | Close na xícara | piano |
| 20,0–24,0 | É a inflação. Os preços sobem, e o poder de compra cai. | INFLAÇÃO | inflação | Linha sobe sobre o balcão | sub |
| 24,1–30,7 | Numa simulação de 5% ao ano, o poder de compra cai para cerca de 61. | SIMULAÇÃO · 5% AO ANO | R$ 61 | Gráfico minimalista | ticks |
| 30,8–33,8 | O café é o mesmo. O troco é que encolheu. | MESMO CAFÉ / TROCO MENOR | troco | Match cut xícara/nota | impact |
| 33,9–37,4 | A inflação não faz barulho. Ela aparece no troco. | ELA APARECE NO TROCO | troco | Slow push no troco | piano |
| 37,7–41,4 | Salve para lembrar quando o preço parecer ‘do nada’. | SALVE | SALVE | End card | brand |

## Direção de voz

- Contida e próxima, como quem conta um caso. Sem tom de locutor.
- Voz única: Thalita (`pt-BR-ThalitaMultilingualNeural`).
- Não acelerar a locução para caber; cortar texto se necessário.

## Pausas e ênfases

- Pausas padrão entre frases: **120–140 ms**.
- Pausas intencionais: 200–300 ms, listadas abaixo.
- Não usar pausa acima de 300 ms.
- Ênfases: apenas as palavras marcadas em “Destaque”.
- Não cortar sílabas, consoantes ou finais de palavra.
- Se a locução real não couber, cortar texto — não acelerar a voz.

- Pausa de **300 ms** após o trecho em 0,0 s.
- Pausa de **300 ms** após o trecho em 14,1 s.
- Pausa de **300 ms** após o trecho em 33,9 s.

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

Salve para lembrar quando o preço parecer ‘do nada’.
