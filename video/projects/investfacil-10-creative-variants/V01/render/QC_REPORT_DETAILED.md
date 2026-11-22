# V01 — RELATÓRIO DE QC (PRODUÇÃO)

**Vídeo:** `V01-ticker-nao-para.mp4`
**Data:** 21/11/2026
**Status:** MP4 de teste produzido; **nenhuma aprovação humana declarada**.
**Áudio:** preview interno Edge TTS/Thalita; licença comercial pendente.

---

## 1. Especificação técnica

| Item | Resultado |
|---|---|
| Resolução | 1080 × 1920 |
| FPS | 30/1 |
| Codec de vídeo | H.264 |
| Codec de áudio | AAC, 48 kHz, estéreo |
| Duração | 34,10 s |
| Tamanho | 6,73 MB |
| Bitrate | ~1,58 Mb/s |
| Frame 0 | inspecionado; nota R$ 100 + “R$ 100” legíveis |
| Contact sheet | 17 amostras a cada 2 s; sem frame preto |
| Whisper `small` | transcrição integral inteligível; voz acima da música |
| Loudness integrado | **-14,3 LUFS** |
| True peak | **-1,3 dBTP** |

## 2. Timeline real

A narração medida tem **33,535 s**. O vídeo tem 34,0 s (1.020 frames), com 0,465 s de hold no end card.

| Bloco | Início | Fim | Fala |
|---|---:|---:|---|
| Hook | 0,000 | 3,331 | “Cem reais parece pouco? Não é impressão.” |
| Preços | 3,331 | 5,664 | “Os preços se movem o tempo todo.” |
| Mesmo número | 5,664 | 8,206 | “A nota continua com o mesmo número.” |
| Menos | 8,206 | 12,331 | “Mas compra menos café, menos pão, menos transporte.” |
| Inflação | 12,331 | 13,829 | “Isso é inflação.” |
| Poder de compra | 13,829 | 18,070 | “A alta generalizada dos preços corrói seu poder de compra.” |
| Simulação | 18,070 | 24,328 | “Simulação: 5% ao ano. Em dez anos, cerca de R$ 61.” |
| Contraste | 24,328 | 27,886 | “O número é o mesmo. O poder de compra, não.” |
| Primeiro passo | 27,886 | 30,034 | “Entender isso é o primeiro passo.” |
| CTA | 30,034 | 34,000 | “Siga para entender a inflação no próximo vídeo.” |

## 3. Cortes e ritmo

- Cortes principais: ~24 mudanças visuais, média de 1,4 s.
- Taxonomia usada: **C** (corte de plano), **P** (punch-in), **T** (beat de texto), **M** (movimento de câmera).
- Hold preservado: o contador trava em **R$ 61,39** de ~23,2 s a 24,3 s, sem corte por cima.
- O ticker fica atrás do herói; não cobre o número principal.
- Transições: whip streak em 3,33 s, 8,21 s e 12,33 s; cortes secos nos demais.

## 4. Problemas encontrados e correções

| Problema | Correção aplicada |
|---|---|
| Frame 0 começava vazio | Nota e “R$ 100” visíveis desde o frame 0. |
| Ghosting entre cenas | `SceneShell` substituído por `CutScene` com corte seco; sem crossfade. |
| Ticker cobria o texto de “OS PREÇOS SE MOVEM” | Gradiente preto à esquerda + scrim superior/inferior. |
| “MENOS TRANSPORTE” acendia antes do card | Cálculo de palavra ativa passou a usar tempo local da cena. |
| Ícones repetidos no split | Ícones distintos: café, pão, ônibus, leite, ovos. |
| 5º ícone quebrava para a segunda linha | Largura/gap ajustados para uma linha. |
| True peak -0,6 dBTP | Re-normalização para TP -1,8; resultado -1,3 dBTP. |

## 5. O que ainda não está provado

- **Escuta humana:** não realizada. O Whisper é proxy de inteligibilidade, não de naturalidade.
- **Licença edge-tts:** pendente; áudio classificado como preview interno.
- **Licença Remotion:** elegibilidade individual declarada pelo usuário; não verificada juridicamente.
- **Publicação:** não autorizada.
- **Métricas:** nenhuma retenção/view/CTR medida.
- **Render final CapCut:** não feito; este é o MP4 Remotion.

## 6. Veredito

**V01 — APROVADO TECNICAMENTE PARA SEGUIR COMO REFERÊNCIA DE PRODUÇÃO**, com as ressalvas acima. Não é aprovação humana, não é liberação comercial e não é escolha de finalista.
