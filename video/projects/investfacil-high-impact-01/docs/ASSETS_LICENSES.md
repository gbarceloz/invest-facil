# ASSETS E LICENÇAS — HIGH IMPACT 01

| Asset | Origem | Licença / uso | Observação |
|---|---|---|---|
| Plus Jakarta Sans | `video/public/fonts/PlusJakartaSans.ttf` | SIL Open Font License | Fonte de identidade já usada no Invest Fácil. |
| Narração Thalita | edge-tts `pt-BR-ThalitaMultilingualNeural` | Serviço read-aloud não oficial da Microsoft | Voz escolhida pelo usuário. O texto da narração foi enviado ao serviço; nenhum vídeo/imagem foi enviado. Validar termos para uso comercial em produção. |
| Música `music-bed.wav` | Sintetizada localmente por `script/build_music_sfx.py` | Original, sem samples de terceiros | 100 BPM, A menor, 40 s, 48 kHz estéreo. |
| SFX `impact`, `whoosh`, `click`, `riser`, `bass-hit`, `glitch`, `ui-pop`, `reverse-impact`, `sweep`, `tick` | Sintetizados localmente pelo mesmo script | Original, sem samples de terceiros | Podem ser reutilizados no Invest Fácil. |
| Ícones de produtos | SVG original em `ProductBasket.tsx` | Original | Arroz, leite, café, pão e ovos desenhados em linha. |
| Cartão de valor | SVG/CSS original em `ExpectationScene.tsx` | Original | Geometria abstrata; não reproduz cédula real. |
| Gráfico | SVG original em `FinancialChart.tsx` | Original | Série hipotética 100 → 61,39 com 5% ao ano. |
| Grain / scanlines | Gerados localmente com numpy/Pillow | Original | `video/public/hi01/grain.png` e `scanlines.png`. |
| Remotion | `video/node_modules/remotion` | Gratuito para indivíduo/equipe até 3 pessoas; acima disso, licença comercial | Verificar enquadramento antes de publicar. |
| VectCutAPI | `%LOCALAPPDATA%\InvestFacil\tools\VectCutAPI` | Open source (ver repositório) | Usado para montagem do draft. |
| CapCut 9.8 | Instalado | Termos do CapCut | Exportação local, sem upload. |
| Blender 5.3 + addon MCP | Instalado | Blender GPL / addon conforme repositório | Não usado nesta produção. |
| Higgsfield | Não utilizado | — | Não havia acesso/authorization/créditos confirmados; nenhuma geração foi feita. |

## O que não foi usado

- Nenhuma imagem, vídeo ou música de terceiros.
- Nenhum banco de imagens pago.
- Nenhum serviço de geração por IA paga.
- Nenhum upload para Supabase, OSS ou outro serviço.
- Nenhum asset do projeto Pokémon TCG.

## Observação sobre a voz

A voz Thalita foi escolhida explicitamente pelo usuário. Ainda assim, o edge-tts não é uma API oficial da Microsoft e os termos de uso comercial do read-aloud precisam ser validados antes de uma publicação em escala. Se o projeto exigir segurança jurídica, a alternativa oficial é Azure Speech (vozes neurais pt-BR), que não foi testada nesta missão por exigir chave/recurso e autorização de custo.
