# VOZ — OPÇÕES PARA AVALIAÇÃO HUMANA

**Data:** 21/11/2026
**Status:** **Thalita aprovada pelo usuário em 21/11/2026** e usada no High Impact 01. As demais vozes continuam não aprovadas.

## Como ouvir

1. Abra `video/auditions/voice-samples/v2-normalized/comparison.m4a`.
2. As amostras estão separadas por 1 s de silêncio, nesta ordem:
   `01-francisca-edge`, `02-antonio-edge`, `03-thalita-edge`, `04-daniel-onecore`,
   `05-faber-piper`, `06-faber-piper-slow`, `07-maria-sapi`.
3. Para comparar trechos isolados, use os WAVs individuais na mesma pasta.
4. As amostras foram normalizadas para -16 LUFS / -1,5 dBTP apenas para comparação.
   Os arquivos originais foram preservados em `v2-edge/`, `v2-piper/` e na raiz de
   `voice-samples/`.

Texto usado em todas as amostras (49 palavras):

> Você acha que cem reais estão parados? Não estão. A inflação corrói o seu poder de compra. Em dez anos, a cinco por cento ao ano, cem reais valem menos de sessenta e um. O problema não é o número. É a ilusão de que o dinheiro está parado.

## Tabela de opções

| Ferramenta | Voz disponível | pt-BR | Naturalidade observada | Limitações | API key | Custos | Licença / uso comercial |
|---|---|---|---|---|---|---|---|
| **Microsoft SAPI 5** (local) | Microsoft Maria Desktop | Sim | **Reprovada** na avaliação anterior: voz robótica. Proxy objetivo: 2,62 palavras/s; F0 std 24,4 Hz. | Só 2 vozes SAPI instaladas (Maria pt-BR, Zira en-US); prosódia limitada; sem SSML avançado. | Não | Incluída no Windows | Componente do Windows; verificar termos da Microsoft para uso comercial do áudio. |
| **Microsoft OneCore / WinRT** (local) | Microsoft Daniel | Sim | **Não aprovada ainda.** Amostra real gerada; proxy: 2,22 palavras/s; F0 std 35,6 Hz (mais lenta e mais variada que Maria). Escuta humana pendente. | Acesso via WinRT; voz masculina única em pt-BR; qualidade de voz de sistema, não neural de nuvem. | Não | Incluída no Windows | Componente do Windows; verificar termos da Microsoft para uso comercial. |
| **edge-tts** (serviço read-aloud do Edge, não oficial) | Francisca, Antonio, Thalita Multilingual | Sim | **Thalita aprovada pelo usuário** em 21/11/2026 e usada no High Impact 01. Francisca/Antonio não aprovadas. Proxies: 3,14 / 2,58 / 3,02 palavras/s; F0 std 53,4 / 56,9 / 50,0 Hz. | Não é API oficial; depende de rede e do endpoint do Edge; pode mudar/quebrar; limites de uso não documentados. O texto da narração é enviado ao serviço da Microsoft; nenhum vídeo/imagem do projeto foi enviado. | Não | Gratuito no teste | **Não é API licenciada para produção.** Termos do serviço read-aloud do Edge podem restringir uso comercial/automatizado; validar antes de usar. |
| **Piper** (local, ONNX) | pt_BR-faber-medium | Sim | **Não aprovada ainda.** Amostras locais reais; proxies: 3,35 palavras/s (14,6 s) e 3,15 palavras/s com `length-scale=1.12` (15,5 s); F0 std 29,4 / 30,8 Hz. Escuta humana pendente. | Modelo de 63 MB; qualidade média, pode soar plana; uma voz pt-BR testada; CPU. | Não | Gratuito | Código Piper: MIT. Dataset do modelo: CC0. O repositório de vozes não declara licença explícita do modelo; revisar antes de produção. |
| **ElevenLabs** | Voz ainda não escolhida | Sim (multilíngue) | **Não testada.** Nenhuma chamada feita. | Requer chave e créditos; seleção de voz e autorização de custo pendentes. | Sim | Plano gratuito limitado + planos pagos; não contratado | Licença comercial conforme plano; **BLOQUEADO POR AUTORIZAÇÃO**. |
| **Azure Speech** (oficial, referência) | Vozes neurais pt-BR (ex.: Francisca, Antonio, Thalita) | Sim | **Não testada.** | Requer recurso Azure e chave; latência/rede. | Sim | Camada gratuita limitada + cobrança por caractere | Licença comercial conforme Azure; alternativa oficial recomendada se o Edge TTS for inviável. |

## Leitura dos proxies

Taxa de palavras e variação de F0 são **medidas objetivas**, não uma avaliação perceptual.
Elas não substituem escuta humana. O F0 foi estimado por autocorrelação em janelas de
40 ms; valores podem conter erros de oitava. O objetivo é apenas indicar ritmo e
variabilidade antes da escuta.

## Arquivos

| Arquivo | Conteúdo |
|---|---|
| `v2-normalized/comparison.m4a` | Comparação completa, 128,8 s, AAC 192 kbps |
| `v2-normalized/comparison.wav` | Mesma comparação em WAV PCM 48 kHz |
| `v2-normalized/01-francisca-edge.wav` | edge-tts, Francisca |
| `v2-normalized/02-antonio-edge.wav` | edge-tts, Antonio |
| `v2-normalized/03-thalita-edge.wav` | edge-tts, Thalita |
| `v2-normalized/04-daniel-onecore.wav` | Windows OneCore, Daniel |
| `v2-normalized/05-faber-piper.wav` | Piper, Faber medium |
| `v2-normalized/06-faber-piper-slow.wav` | Piper, Faber medium, `length-scale=1.12` |
| `v2-normalized/07-maria-sapi.wav` | Windows SAPI, Maria (baseline reprovada) |
| `v2-normalized/waveforms-contact.png` | Formas de onda das 7 amostras |
| `v2-normalized/objective-analysis.json` | Duração, taxa e F0 estimado |

## Decisão pendente do usuário

- Escolher a voz e o provedor após escuta.
- Autorizar ou recusar custo de ElevenLabs/Azure.
- Confirmar se o uso comercial do edge-tts/Piper é aceitável para o projeto.
- A voz **Thalita** foi aprovada explicitamente pelo usuário e usada no High Impact 01. As demais permanecem pendentes.
