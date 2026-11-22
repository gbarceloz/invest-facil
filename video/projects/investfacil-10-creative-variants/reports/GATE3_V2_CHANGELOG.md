# GATE 3 — CHANGELOG DA RODADA 2 (DOCUMENTOS FINAIS)

**Data:** 21/11/2026
**Status:** planejamento concluído; nenhum vídeo renderizado.
**Motivo:** a rodada 1 foi avaliada pelos agentes e expôs problemas de densidade, contradições e repetições. Os documentos foram regenerados com timing calibrado e correções de lógica.

---

## 1. Modelo de timing

- Fala: **14,0 caracteres/s**, calibrados contra a narração aprovada do High Impact 01 (Thalita, rate -12%, ~14,1 caracteres/s de fala).
- Números expandidos para a forma falada: “R$ 100” → “cem reais”; “5%” → “cinco por cento”; “61” → “sessenta e um”.
- Pausas padrão: **120–140 ms**.
- Pausas intencionais: **200–300 ms**, apenas onde marcadas.
- Cauda de end card: 0,55 s.
- Não é medição de TTS real; é orçamento de roteiro. O TTS ainda não foi gerado.

## 2. Durações e densidade finais

| ID | Duração | Caracteres falados | Caracteres/s | Linhas de narração |
|---|---:|---:|---:|---:|
| V01 | 33 s | 432 | 13,1 | 10 |
| V02 | 42 s | 552 | 13,1 | 12 |
| V03 | 33 s | 428 | 13,0 | 11 |
| V04 | 30 s | 376 | 12,5 | 10 |
| V05 | 37 s | 482 | 13,0 | 9 |
| V06 | 40 s | 528 | 13,2 | 11 |
| V07 | 40 s | 523 | 13,1 | 9 |
| V08 | 41 s | 538 | 13,1 | 10 |
| V09 | 39 s | 506 | 13,0 | 10 |
| V10 | 40 s | 523 | 13,1 | 12 |

Todas as variantes ficaram entre 30 s e 42 s. Nenhum bloco estoura a capacidade da voz.

**Passe final de compliance:** V05, V07 e V10 passaram a dizer “simulação” na própria fala; V10 usa 3/5, não 4/5, para ser coerente com ~61. V06 ganhou a abertura salarial; V04 ficou com um único CTA; V02 e V07 tiveram o storyboard alinhado ao roteiro; V09 ganhou o qualificador no storyboard e o CTA falado. As durações finais são 33/42/33/30/37/40/40/41/39/40 s.

## 3. Correções por variante

| ID | Correção aplicada |
|---|---|
| **V01** | Texto reduzido de 102 para ~80 palavras; simulação agora é dita na narração (“Simulação: 5% ao ano”); CTA sem promessa de antecipação (“Siga para entender a inflação no próximo vídeo”). |
| **V02** | Cold open com a quebra (“Até o dia em que o dinheiro não deu”); orçamento semanal explícito (“Os mesmos R$ 100 para a semana”); removida a contradição “não foi o café” vs. “preço maior”; payoff “O café é o mesmo. O troco é que encolheu.”; CTA de 3,7 s; storyboard S01/S02 alinhado ao cold open. |
| **V03** | Modelo corrigido: a nota entra e permanece; o que encolhe é a cesta/o que ela compra. Hook “A nota entra inteira. O que ela compra, não.”; 4/5 substituído por 3/5 no script e no storyboard, coerente com ~61. |
| **V04** | 30 s de verdade; texto cortado para ~70 palavras; payoff duplicado removido; “Siga para mais” removido; CTA único de comentário (“o que ficou mais caro para você?”); storyboard S04 com selo “SIMULAÇÃO · PREÇOS +25% · 4 DE 5”; cronômetro não é mais promessa abandonada; typo “consommation” corrigido. |
| **V05** | Hook virou pergunta (“Quanto essa nota ainda compra?”); CTA “Salve para consultar quando o preço mudar” substitui “Conheça a plataforma”; artefato “uma cadeira? Não” removido; payoff “O que ele compra ficou menor”; duração 37 s. |
| **V06** | Abre com “Seu salário subiu.” + “Então por que o mês continua apertado?”; lógica salário vs. preços corrigida (“Os preços sobem mais”); payoff “Não é impressão. É inflação.”; duração 40 s. |
| **V07** | Hook “Uma linha pode explicar por que seu dinheiro vale menos”; labels “SIMULAÇÃO” no script e no storyboard em 5%, R$ 78 e R$ 61; promessa “números verificáveis” trocada por “simulação transparente”. |
| **V08** | Simulação de +25% e de 5% rotulada na fala e na tela; linha “Guardar é importante. Entender o que acontece com ele, também.” evita leitura de “não guarde dinheiro”; duração 41 s. |
| **V09** | “Não é imposto literal. É inflação.” entra aos 5 s e aparece no storyboard S03; CTA “Siga o Invest Fácil” é falado no fim; “Conheça a plataforma” removido; hook dividido em duas linhas; duração 39 s. |
| **V10** | Hook dividido em “Se o seu dinheiro pudesse falar...” + “Ele diria: eu não desapareci.”; a nota não encolhe — o reflexo da cesta encolhe; 3/5 no cenário de 5%; CTA “Salve para rever quando o preço subir”; duração 40 s. |

## 4. Correções transversais

- Direção de voz específica por variante; não há mais “energia média-alta” copiada.
- Mapa de cortes internos por bloco na `EDITING_TIMELINE.md`; o storyboard é de cena, não de batida.
- Disclaimer fixo no end card: “Conteúdo educacional. Não é recomendação de investimento.”
- Assinatura Invest Fácil em todos os end cards.
- Safe zone: 78 px laterais para Reels/Shorts; 120 px à direita para TikTok; 220 px no rodapé.
- Tipografia mínima: 34 px labels / 44 px corpo; `line-height` ≥ 1,08; sem `overflow: hidden` que corte descendentes.
- No máximo dois elementos concorrentes por frame.
- Não colocar texto no seam de split nem em reflexo.
- SFX: no máximo 1 acento a cada 2 s; ducking -10 dB, attack 150 ms, release 400 ms.
- Simulações sempre rotuladas na fala ou na tela.
- Nenhum CTA aponta para plataforma/link inexistente.

## 5. Diferenciação

- Nenhuma fala idêntica em 3 ou mais vídeos.
- A frase “O número é o mesmo. O poder de compra, não.” fica apenas em V01.
- Estruturas: ticker (V01), ritual/cold open (V02), máquina (V03), quiz (V04), minimalismo (V05), validação psicológica (V06), dados (V07), conversa (V08), manifesto (V09), poesia/espelho (V10).

## 6. Auditoria documental

- **271 verificações documentais + 144 verificações de timeline = 415, 0 falhas.**
- Checagens: 80 documentos presentes; seções obrigatórias; ausência de frases obsoletas; simulações rotuladas; disclaimer; safe zone; ducking; CTAs; matriz com 10 IDs; nenhuma fala idêntica em 3+ vídeos; 4/5 apenas no cenário de +25%; 3/5 no cenário de 5%; narrativa sem gap > 0,36 s; storyboard/retention dentro da duração; end card com 1 corte, não 2.

## 7. O que continua não comprovado

- TTS real de cada variante: **não gerado**.
- Escuta humana: **não realizada**.
- Licença comercial do edge-tts: **pendente**.
- Elegibilidade da licença gratuita do Remotion: **não confirmada**.
- Render/MP4: **não produzido**.
- Drafts CapCut: **não criados**.
- Retenção, views, CTR: **não medidos**.
- Aprovação humana: **não declarada**.
