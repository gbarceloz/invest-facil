# SCRIPT — V01 O ticker não para

**Duração calculada:** 33 s
**Voz:** Thalita — direção específica abaixo.
**Status:** PLANEJADO — NÃO PRODUZIDO

## Narração completa

| Tempo | Narração | Texto na tela | Destaque | Corte/enquadramento | Som |
|---|---|---|---|---|---|
| 0,0–2,9 | R$ 100 parece pouco? Não é impressão. | R$ 100 / NÃO É IMPRESSÃO | R$ 100 | Punch-in no número | impact |
| 3,0–5,3 | Os preços se movem o tempo todo. | OS PREÇOS SE MOVEM | preços | Whip pan para o ticker | whoosh |
| 5,4–7,9 | A nota continua com o mesmo número. | MESMO NÚMERO | mesmo número | Split-screen nota x preços | click |
| 8,0–11,7 | Mas compra menos café, menos pão, menos transporte. | MENOS CAFÉ · PÃO · TRANSPORTE | menos | Três cortes rápidos | whoosh x3 |
| 11,8–13,0 | Isso é inflação. | INFLAÇÃO | INFLAÇÃO | Corte seco + bass hit | impact |
| 13,2–17,4 | A alta generalizada dos preços corrói seu poder de compra. | PODER DE COMPRA | poder de compra | Barra encolhendo | sub drop |
| 17,5–23,0 | Simulação: 5% ao ano. Em dez anos, cerca de R$ 61. | SIMULAÇÃO · 5% AO ANO | R$ 61 | Contador 100 → 61 | ticks |
| 23,1–26,2 | O número é o mesmo. O poder de compra, não. | MESMO NÚMERO / MENOS PODER | poder de compra | Split-screen | impact |
| 26,4–28,8 | Entender isso é o primeiro passo. | ENTENDER É O PRIMEIRO PASSO | primeiro passo | Logo hint | riser |
| 28,9–32,3 | Siga para entender a inflação no próximo vídeo. | SIGA | SIGA | End card | brand sting |

## Direção de voz

- Urgente e seca. Frases curtas; a pressa vem do corte, não do volume.
- Voz única: Thalita (`pt-BR-ThalitaMultilingualNeural`).
- Não acelerar a locução para caber; cortar texto se necessário.

## Pausas e ênfases

- Pausas padrão entre frases: **120–140 ms**.
- Pausas intencionais: 200–300 ms, listadas abaixo.
- Não usar pausa acima de 300 ms.
- Ênfases: apenas as palavras marcadas em “Destaque”.
- Não cortar sílabas, consoantes ou finais de palavra.
- Se a locução real não couber, cortar texto — não acelerar a voz.

- Pausa de **250 ms** após o trecho em 11,8 s.
- Pausa de **240 ms** após o trecho em 23,1 s.

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

Siga para entender a inflação no próximo vídeo.
