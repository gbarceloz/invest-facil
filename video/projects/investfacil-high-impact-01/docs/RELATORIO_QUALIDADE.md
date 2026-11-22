# RELATÓRIO DE QUALIDADE AUDIOVISUAL — HIGH IMPACT 01

**Data:** 21/11/2026
**Duração:** 40,0 s
**Formato:** 1080 × 1920 · 30 fps
**Status:** autoavaliação técnica; **publicação pendente de avaliação humana**.

## 1. Notas por critério

| Critério | Nota | Mínimo | Evidência / observação |
|---|---:|---:|---|
| Hook inicial | **9** | 9 | Frame 0 já mostra “R$ 100” em tela cheia, sem logo ou saudação. “HOJE” entra em 0,8 s. |
| Tipografia cinética | **8** | 8 | Mask, word stagger, tracking, split, card, gráfico e logo. Sem colisões; alguns textos grandes chegam perto das margens, mas dentro da área segura. |
| Animações | **8** | 8 | Springs, contador, line draw, price flip, remoção de item, logo reveal. |
| Transições | **8** | 8 | Wipe, zoom, rise, fade, flash e reverse impact. A transição impact→outro é um fade simples, funcional. |
| Sound design | **8** | 8 | Música original + 10 SFX + narração; níveis e sync medidos. Escuta humana pendente. |
| Ritmo | **9** | 9 | Seis cenas em 40 s; mudanças em 3,4 / 9,4 / 13,5 / 20,8 / 30,4 s; sem momentos mortos. |
| Clareza educacional | **9** | 9 | Explica valor nominal, poder de compra, exemplo hipotético e a conta 100 → 61,39; simulação sinalizada. |
| Identidade visual | **9** | 9 | Preto `#050505`, amarelo `#FACC15`, Plus Jakarta Sans, logo e assinatura. |
| Narração | **8** | 8 | Thalita, escolhida pelo usuário; -12%; 35,136 s; pronúncia precisa ser confirmada em escuta humana. |
| Acabamento | **9** | 9 | 1080×1920, 30 fps, H.264/AAC, -14,5 LUFS, -1,1 dBTP, sem clipping, sem textos sobrepostos. |

**Média:** 8,5 / 10.
**Critérios essenciais:** todos no mínimo ou acima.

## 2. O que funciona bem

- **Primeiro segundo:** “R$ 100” aparece grande, com contraste e movimento; o vídeo não começa com vinheta.
- **Clareza:** a cesta de exemplo mostra 5 itens a R$ 100; com +25%, a mesma cesta vai a R$ 125 e R$ 100 compram 4 de 5. A matemática é exata.
- **Explicação:** o gráfico desenha 100 → 61,39 em 10 anos, com 5% ao ano, e o disclaimer “não é projeção” fica visível.
- **Impacto:** “DEIXAR DE ENTENDER TAMBÉM TEM UM CUSTO.” é a frase mais forte, com flash, glitch e bass hit.
- **Fechamento:** a marca aparece depois do conteúdo, com CTA discreto.
- **Áudio:** música e SFX originais, sem licença de terceiros; voz e música com níveis controlados.

## 3. O que pode melhorar em uma próxima versão

1. **Escuta humana da Thalita:** confirmar pronúncia de “R$”, “5%”, “sessenta e um” e naturalidade no contexto.
2. **Trilha:** a música original é funcional, mas uma biblioteca premium licenciada poderia elevar o acabamento.
3. **Cena da cesta:** o intervalo de 4,1 s é denso; uma versão de 5 s daria mais respiro à leitura dos cinco produtos.
4. **Impacto:** o wordmark “INFLAÇÃO” ao fundo é sutil; se a marca quiser mais agressividade, aumentar levemente o contraste.
5. **Legenda fechada:** se a plataforma exigir CC, criar uma transcrição alinhada em faixa segura, sem duplicar a tipografia aberta.
6. **3D/Higgsfield:** um elemento 3D ou uma cena gerada poderia enriquecer o impacto, mas exigiria autorização/créditos e validação de licença.

## 4. Verificação de riscos

- **Promessa financeira:** não há promessa de retorno, enriquecimento ou “investimento garantido”.
- **Dados:** a taxa de 5% e os preços da cesta são hipotéticos e estão rotulados como simulação.
- **Matemática:** 100 / 1,05^10 = 61,39; a narração diz “cerca de sessenta e um”.
- **Texto x narração:** não há SRT concorrente; a tipografia aberta é a camada de leitura.
- **Segurança:** nenhum upload, push, deploy ou crédito pago.

## 5. Revisão por bloco

### Primeiros 3 segundos

- Frame 0 já mostra “R$ 100” grande, sem logo ou saudação.
- O flash inicial foi reduzido para 5% e o número recebeu pré-roll de 6 frames
  para o primeiro frame não parecer lavado.
- “HOJE” entra em ~0,8 s; “Podem valer muito menos…” entra em ~1,5 s.
- O hook é compreensível sem áudio.

### Desenvolvimento

- A quebra de expectativa separa valor nominal e poder de compra.
- A cesta mostra 5 itens, preço +25%, total R$ 125 e 4 de 5 itens.
- O gráfico desenha 100 → 61,39 e o contador acompanha.
- Não há momentos mortos; as transições têm whoosh/riser/impact.

### Encerramento

- A frase “ENTENDER O DINHEIRO…” fecha o conceito.
- O logo entra depois do conteúdo, com tagline e CTA discreto.
- O CTA foi movido para 210 px do rodapé para não ficar sob a interface do TikTok/Reels.

## 6. Correções feitas após inspeção

| Problema encontrado | Correção |
|---|---|
| Primeiro frame lavado pelo flash | Flash 0,55 → 0,05; pré-roll de 6 frames no “R$ 100” |
| Todos os cards da cesta borravam na remoção | Apenas o card de Ovos recebe blur/scale; os outros 4 ficam nítidos |
| Cesta entrava devagar e preço subia no fim da cena | Entrada acelerada; preço em 10,5 s; remoção em 11,5 s |
| Texto do impacto encostava no “INFLAÇÃO” ao fundo | Scrim escuro + opacidade do fundo reduzida para 3,2% |
| Grupos do impacto se sobrepunham | Duração do grupo “ENTENDER A INFLAÇÃO” reduzida para 88 frames |
| CTA/rodapé poderiam ficar sob a UI da rede social | Margens inferiores movidas para 120–210 px |
| Export CapCut iniciava em 4K | Resolução alterada manualmente para 1080P |

## 7. Classificação

- **APROVADO TECNICAMENTE**
- **APROVADO VISUALMENTE** (inspeção frame a frame)
- **APROVADO EM ÁUDIO** (métricas; escuta humana pendente)
- **PENDENTE DE AVALIAÇÃO HUMANA** para publicação

As notas acima são uma autoavaliação técnica. Não substituem a avaliação humana de gosto, tom, naturalidade da voz e adequação editorial.
