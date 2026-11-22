# MEMORY — SISTEMA AUDIOVISUAL INVEST FÁCIL

**Criado:** 21/11/2026
**Escopo:** produção audiovisual do Invest Fácil (Mercado Financeiro e Bitcoin).
**Status:** memória operacional viva. Não é documentação estática.

---

## 1. Como usar esta memória

1. Leia antes de planejar qualquer vídeo.
2. Registre apenas o que tiver contexto, evidência e resultado observado.
3. Separe **fato observado**, **decisão do usuário** e **hipótese**.
4. Quando um aprendizado virar regra reutilizável, proponha atualização da skill correspondente.
5. Nunca apague uma correção anterior; registre a atualização e a razão.
6. Feedback do usuário tem prioridade sobre preferência de agente.

### Níveis de confiança

- **Alta:** evidência técnica/visual repetida ou decisão explícita do usuário.
- **Média:** observação única com evidência parcial.
- **Baixa:** hipótese ainda não testada.

---

## 2. Decisões do usuário (diretivas)

### 2026-11-21 — Voz padrão

- **Decisão:** Thalita (`pt-BR-ThalitaMultilingualNeural`) é a voz padrão de todas as produções.
- **Não usar:** Maria, outra voz neural ou voz alternativa sem autorização.
- **Parâmetros:** reutilizar a configuração aprovada; taxa -12% na produção High Impact 01.
- **Licença:** edge-tts é serviço não oficial; documentar pendência. Não substituir a voz por causa da licença sem autorização.
- **Evidência:** mensagem do usuário; `video/auditions/VOICE_OPTIONS.md`; `metadata-v2.json`.
- **Confiança:** alta.

### 2026-11-21 — Direção de narração

- Mais dinâmica, natural, contínua e energética.
- Pausas entre frases: ~100–180 ms.
- Pausas sem intenção acima de 250–300 ms: revisar/reduzir.
- Pausas dramáticas: preservar só quando houver revelação.
- Não cortar sílabas, consoantes ou finais.
- Não acelerar a voz antes de remover silêncios e reorganizar cortes.
- Soar como narração profissional, não leitura.
- **Confiança:** alta (diretiva).

### 2026-11-21 — Edição

- Mais cortes e menos tempo morto.
- Mudanças de plano/enquadramento/composição a cada 1–3 s quando a narrativa permitir.
- Punch-ins em palavras importantes.
- Jump cuts, match cuts, whip pans, speed ramps, zoom/mask transitions, cutaways, parallax, text reveals, split-screen, before/after.
- Não aplicar todas as técnicas em todos os vídeos.
- Cada corte precisa de motivo narrativo, musical ou visual.
- **Confiança:** alta (diretiva).

### 2026-11-21 — Sound design

- SFX mais presentes e sincronizados.
- Whooshes, impacts, risers, downlifters, clicks, glitches, sub drops, text sounds, cinematic impacts, ambiências.
- Não usar efeitos aleatórios.
- Música não pode competir com Thalita.
- Preservar inteligibilidade.
- **Confiança:** alta (diretiva).

### 2026-11-21 — Escopo dos 10 vídeos

- 10 vídeos individuais em Remotion.
- Todos com MP4 reproduzível, validação técnica e draft/estrutura verificados pelo CapCut MCP.
- Todos avaliados individualmente pelos agentes.
- Acabamento e export final CapCut nos **3 finalistas**.
- Os outros 7 permanecem completos para comparação.
- **Confiança:** alta (diretiva).

### 2026-11-21 — Local do sistema

- `.opencode/agents/`, `.opencode/skills/` e `video/MEMORY.md` project-local.
- Sessão movida para `<repo>`.
- Não modificar agentes globais existentes.
- **Confiança:** alta (diretiva).

### 2026-11-21 — Ferramentas

- Instalar HyperFrames, FFmpeg, Whisper e yt-dlp.
- Higgsfield fora do escopo padrão.
- Blender apenas em instância isolada (porta 9877), nunca o Pokémon TCG.
- Remotion: usar modalidade gratuita somente após verificar enquadramento na licença.
- **Confiança:** alta (diretiva).

---

## 3. Aprendizados comprovados

### 2026-11-21 — SRT sobre tipografia cinética

**Agente:** Professional Video Editor
**Contexto:** legendas convencionais em vídeo com tipografia cinética inferior.
**Problema:** colisão visual entre SRT e texto de design.
**Técnica:** remover SRT e usar legendas abertas integradas; testar faixa segura `y ≥ 1680`.
**Resultado:** V2 sem SRT não colidiu; V2CC com legenda integrada duplicou/encobriu texto.
**Evidência:** `_audit/subtitle-decision-comparison.png`; `_audit/capcut-v2-10-15-contact.png`.
**Aprendizado:** não adicionar legenda convencional sobre tipografia cinética sem auditar a região.
**Regra futura:** toda composição passa por auditoria de sobreposição antes do export.
**Confiança:** alta.

### 2026-11-21 — VectCutAPI e extensão de áudio

**Agente:** Sound Designer / engenharia de pipeline
**Contexto:** áudio WAV enviado ao VectCutAPI.
**Problema:** ferramenta renomeava qualquer áudio para `.mp3`.
**Técnica:** preservar extensão real e validar arquivo local ausente.
**Resultado:** draft com `.wav` RIFF/WAVE, 48 kHz, 2 canais, caminho local.
**Evidência:** `_audit/vectcut-audio-unit-test.log`; `_audit/vectcut-lab-v2-summary.json`.
**Aprendizado:** extensão de mídia precisa refletir o container real.
**Regra futura:** nunca renomear áudio sem converter; validar com ffprobe.
**Confiança:** alta.

### 2026-11-21 — CapCut MCP exige CapCut fechado

**Agente:** Professional Video Editor
**Contexto:** save de draft via CapCut MCP.
**Problema:** save recusado com CapCut aberto; `.locked` também bloqueia.
**Técnica:** fechar CapCut, remover `.locked`, rodar validate/save.
**Resultado:** save concluído e draft reaberto.
**Evidência:** `capcut-delivery-interop-3.log`.
**Aprendizado:** o MCP não substitui o controle de janela do CapCut.
**Regra futura:** fechar CapCut antes de save; nunca usar `force` sem necessidade.
**Confiança:** alta.

### 2026-11-21 — Blender isolado

**Agente:** Quality Control
**Contexto:** teste Blender MCP.
**Problema:** addon auto-iniciava na porta 9876, ocupada pelo Pokémon TCG.
**Técnica:** instância `--factory-startup`, porta 9877, gate que aborta se encontrar `MCHX_*`.
**Resultado:** cena limpa, esfera, material, render 800×800, GLB reaberto; Pokémon intocado.
**Evidência:** `_audit/blender-isolated2.log`; `_audit/blender-isolated-mcp.log`; `_audit/blender-glb-verify.log`.
**Aprendizado:** porta padrão do addon é perigosa quando outra instância está aberta.
**Regra futura:** Blender só em instância isolada na 9877, com gate de objetos.
**Confiança:** alta.

### 2026-11-21 — Thalita aprovada

**Agente:** Creative Director
**Contexto:** comparação de 7 vozes.
**Decisão:** usuário escolheu a terceira voz (Thalita).
**Resultado:** usada no High Impact 01; narração de 35,136 s.
**Evidência:** mensagem do usuário; `video/auditions/VOICE_OPTIONS.md`.
**Aprendizado:** a voz padrão é Thalita; não reabrir a escolha sem pedido.
**Regra futura:** usar Thalita; variar apenas ritmo/pausas.
**Confiança:** alta.

### 2026-11-21 — Primeiro frame lavado

**Agente:** Professional Video Editor
**Contexto:** hook do High Impact 01.
**Problema:** flash inicial deixava o primeiro frame cinza/lavado.
**Técnica:** reduzir flash para 5% e dar pré-roll de 6 frames ao “R$ 100”.
**Resultado:** frame 0 forte e legível.
**Evidência:** `safe-0.png` / `fix2-0.png`.
**Aprendizado:** o primeiro frame é capa; não pode parecer erro de render.
**Regra futura:** inspecionar frame 0 antes de aprovar.
**Confiança:** alta.

### 2026-11-21 — Remoção de item na cesta

**Agente:** Motion Designer
**Contexto:** cena de cesta com 5 produtos.
**Problema:** blur de remoção era aplicado a todos os cards.
**Técnica:** aplicar blur/scale só ao item removido; manter os demais nítidos.
**Resultado:** leitura clara de “4 de 5”.
**Evidência:** `fix2-350.png`; `fix2-380.png`.
**Aprendizado:** efeito de remoção deve isolar o objeto removido.
**Regra futura:** testar o frame de remoção, não só o frame final.
**Confiança:** alta.

### 2026-11-21 — Safe zone social

**Agente:** Professional Video Editor
**Contexto:** CTA/rodapé no vertical.
**Problema:** risco de UI de TikTok/Reels cobrir textos.
**Técnica:** margens inferiores de 120–210 px para CTA/rodapé.
**Resultado:** CTA acima da área de UI.
**Evidência:** `delivery-outro-39.png`.
**Aprendizado:** safe zone não é só lateral; base também conta.
**Regra futura:** CTA ≥ 190–210 px do rodapé; disclaimer ≥ 120 px.
**Confiança:** alta.

### 2026-11-21 — Diálogo de export CapCut

**Agente:** Quality Control
**Contexto:** export de draft com end card.
**Problema:** diálogo mostrava “19 s”, mas o arquivo final tinha 21,014 s.
**Técnica:** validar sempre o MP4 com ffprobe, não o rótulo do diálogo.
**Resultado:** arquivo correto.
**Evidência:** `lab-capcut-ffprobe.json`; `lab-capcut-verify.txt`.
**Aprendizado:** a UI do CapCut pode exibir duração enganosa.
**Regra futura:** confiar no arquivo, não no diálogo.
**Confiança:** alta.

### 2026-11-21 — Licença Remotion

**Agente:** Produção
**Contexto:** uso do Remotion.
**Fato:** licença gratuita para indivíduo/equipe até 3 pessoas; acima disso, comercial.
**Ação:** confirmar enquadramento antes de publicar em escala.
**Confiança:** alta (documentação oficial).

### 2026-11-21 — Licença edge-tts

**Agente:** Sound Designer
**Contexto:** voz Thalita via edge-tts.
**Fato:** serviço read-aloud não oficial; uso comercial não garantido.
**Ação:** manter testes internos; não declarar liberação jurídica sem comprovação.
**Confiança:** alta (documentação/termos).

### 2026-11-21 — HyperFrames

**Agente:** Tooling
**Contexto:** instalação solicitada.
**Teste:** `hyperframes 0.9.77`; projeto blank 1080×1920; render 3 s H.264; `check` passou.
**Evidência:** `_audit/hyperframes-smoke/smoke/smoke-3s.mp4`.
**Aprendizado:** funciona como ferramenta HTML-to-MP4 complementar; não substitui Remotion na pipeline principal.
**Regra futura:** usar apenas em experimentos; nunca `publish`/`share` sem autorização.
**Confiança:** alta.

### 2026-11-21 — Whisper

**Agente:** Tooling
**Contexto:** instalação solicitada.
**Teste:** `whisper-ctranslate2 0.5.9` com modelo `tiny` transcreveu amostra Thalita/Antonio em pt-BR.
**Limitação:** `tiny` errou palavras (“sem reais” em vez de “cem reais”); `--help` tem bug de argparse.
**Aprendizado:** usar modelo maior (`small`/`medium`) para alinhamento de produção; validar texto.
**Confiança:** alta para o teste, média para qualidade.

### 2026-11-21 — FFmpeg / yt-dlp

**Agente:** Tooling
**Contexto:** instalação solicitada.
**Teste:** FFmpeg 9.1-full (winget) e yt-dlp 2026.10.26 instalados.
**Aprendizado:** FFmpeg standalone disponível; yt-dlp só deve ser usado com conteúdo autorizado/CC.
**Confiança:** alta.

### 2026-11-21 — Permissões de leitura de agentes project-local

**Agente:** Quality Control
**Contexto:** validação dos 8 agentes em `.opencode/agents`.
**Problema:** o `read` nativo foi negado com apenas o padrão absoluto `<home>/.../video/**`; o MCP auron-vault funcionava.
**Técnica:** adicionar padrões relativos (`video/**`, `docs/**`), `<repo>/...`, caminho com backslashes e `external_directory` allow para a raiz do projeto.
**Resultado:** o `read` nativo passou a funcionar; a escrita no relatório do QC também foi validada. Para shell, padrões específicos (`ffprobe *`) foram negados; `shell: "*"` funcionou nos agentes de produção/QC.
**Evidência:** `docs/GATE2_VALIDATION.md`; `reports/agents/if-quality-control/load-test.md`; `docs/GATE2_INTEGRITY.json`.
**Aprendizado:** validar leitura, escrita, skill e shell nativos de cada agente após criar permissões; não confiar só no MCP.
**Regra futura:** todo agente novo passa por smoke test de `read` + `skill` + `edit`; shell só para produção/QC e com escopo de projeto.
**Confiança:** alta.

### 2026-11-21 — Gate 3: timing por caractere, não por slot

**Agente:** Editor / Sound / QC
**Contexto:** 10 roteiros gerados com timecodes fixos.
**Problema:** blocos de 18–21 palavras em 4 s (4–5 palavras/s), impossíveis para Thalita a -12%; V01 e V04 ficaram ~20% acima da capacidade.
**Técnica:** calcular a fala por caracteres falados (números expandidos) a 14,0 caracteres/s; pausas de 120–140 ms; 200–300 ms só intencionais; derivar timecodes e duração do texto.
**Resultado:** 10 roteiros entre 30 e 42 s; 12,4–13,3 caracteres/s; nenhum overflow.
**Evidência:** `video/projects/investfacil-10-creative-variants/reports/GATE3_V2_CHANGELOG.md`; `scripts/generate_gate3_v2.py`; `scripts/audit_gate3_docs.py`.
**Aprendizado:** não distribuir texto em slots fixos; medir a fala antes de fechar a timeline.
**Regra:** nenhum bloco acima de ~3,2 palavras/s; simulações rotuladas na fala ou na tela.
**Confiança:** alta no cálculo; média no TTS real (ainda não gerado).

### 2026-11-21 — Gate 3: o modelo visual não pode contradizer a tese

**Agente:** Creative Director / Motion / QC
**Contexto:** V03 (máquina) e V10 (espelho).
**Problema:** a nota encolhia visualmente enquanto a narração dizia “o número não muda”.
**Técnica:** a nota permanece intacta; a cesta e o reflexo do que ela compra encolhem. Em V03, 4/5 trocado por 3/5 para ser coerente com ~61.
**Evidência:** `V03/STORYBOARD.md`; `V10/STORYBOARD.md`.
**Aprendizado:** a metáfora visual precisa provar a mesma tese da narração; não pode criar um modelo falso.
**Regra:** revisar o frame de transformação contra a frase.
**Confiança:** alta.

### 2026-11-21 — Gate 3: cold open e CTA

**Agente:** Retention / Storyteller
**Contexto:** V02 abria com o ritual e só revelava a quebra aos 12 s; V01 prometia antecipar o próximo aumento; V04 perguntava o que já havia respondido.
**Técnica:** V02 abre com “Até o dia em que o dinheiro não deu”; V01 CTA “Siga para entender a inflação no próximo vídeo”; V04 CTA pessoal “o que ficou mais caro para você?”.
**Aprendizado:** o hook tem de estar nos primeiros 3 s; o CTA não pode prometer o que o vídeo não entrega.
**Regra:** cold open quando a história tiver uma quebra; CTA ligado ao que o vídeo provou.
**Confiança:** alta.

### 2026-11-21 — Gate 3: storyboard alinhado à narração

**Agente:** Editor / QC
**Contexto:** 10 storyboards com tempos escalados da versão antiga.
**Problema:** o QC encontrou deriva de 1,4–5,5 s entre storyboard e roteiro; V06 mostrava R$ 61 antes da fala e V04 mostrava “COMENTE” antes do payoff.
**Técnica:** gerar os tempos do storyboard a partir das linhas de narração, agrupando linhas quando o número de planos é menor; o último plano vai até o fim da duração.
**Resultado:** storyboards e editing timelines usam a mesma base; 144 checagens de timeline, 0 falhas.
**Evidência:** `V01..V10/STORYBOARD.md`; `scripts/audit_timelines.py`.
**Aprendizado:** não escalar tempos de storyboard por proporção quando a narração mudou; derivar das linhas reais.
**Regra:** storyboard e EDL compartilham a mesma tabela de tempos.
**Confiança:** alta.

### 2026-11-21 — Gate 3: subagentes com limite de passos

**Agente:** Orquestrador
**Contexto:** 8 avaliações em paralelo.
**Problema:** 5 de 8 atingiram o limite de passos antes de escrever o relatório; a análise existia, o arquivo não.
**Técnica:** instruir “escreva o relatório primeiro, refine depois”; leitura estreita; changelog compacto em vez de 70 documentos.
**Aprendizado:** avaliação paralela precisa de orçamento de passos e entregável de arquivo como primeira ação.
**Regra:** todo subagente de auditoria escreve o arquivo antes de qualquer refinamento.
**Confiança:** alta.

### 2026-11-21 — Gate 4: frame 0 e cortes secos

**Agente:** Video Editor / QC
**Contexto:** primeiros renders das 10 variantes.
**Problema:** o `KineticText` começa com spring em 0, então o frame 0 ficava vazio; o `SceneShell` com crossfade criava ghosting entre cenas.
**Técnica:** `delay={-30}` no texto do hook, wrapper com opacidade 1, motivo visível a 55%; `CutScene` com `from`/`to` em vez de crossfade; whip streaks só nos cortes motivados.
**Resultado:** frame 0 com título e motivo; cortes limpos, sem sobreposição.
**Evidência:** `video/out/v01-final-frame0.png`; `v03-frame0.png`; `V01/render/QC_REPORT.md`.
**Aprendizado:** frame 0 precisa ser tratado como capa estática, não como primeiro frame de uma animação de entrada.
**Regra:** todo hook tem título e motivo legíveis no frame 0.
**Confiança:** alta.

### 2026-11-21 — Gate 4: loudness em dois passes

**Agente:** Sound Designer / QC
**Contexto:** render Remotion com narração, música e SFX.
**Problema:** o mix bruto ficou em ~-19,8 LUFS e true peak -1,7; a primeira normalização para TP -1,0 gerou -0,6 dBTP por overshoot do AAC.
**Técnica:** `loudnorm` em dois passes, alvo -14 LUFS, TP -1,8, `linear=true`; medir o arquivo final com ebur128.
**Resultado:** V01 -14,3 LUFS / -1,3 dBTP; V03 -14,1 LUFS / -1,1 dBTP.
**Aprendizado:** medir o MP4 final, não o filtro; AAC pode ultrapassar o TP alvo.
**Regra:** normalizar para TP -1,8 e validar o arquivo entregue.

### 2026-11-21 — Gate 4: ticker com módulo menor que o span

**Agente:** QC / Motion / Editor
**Contexto:** V01, cena “MESMO NÚMERO”, coluna de preços.
**Problema:** 16 cartões com espaçamento de 118 px (span 1888 px) usavam módulo de 1400 px. No retorno do ciclo, dois índices caíam no mesmo `top` e rótulos/preços se sobrepunham por ~2,6 s (5,6–8,2 s).
**Técnica:** 20 cartões, ciclo = `count * spacing` (2360 px), `top` normalizado pelo ciclo; re-render, loudnorm, re-auditoria em 9 frames de 5–9 s.
**Resultado:** zero sobreposição; V01 PASS, técnica 9, risco 8; draft CapCut com asset/WAV substituídos.
**Evidência:** `reports/GATE4_CORRECTIONS.md`; `V01/render/QC_REPORT.md`; `V01/render/reaudit-frames/`.
**Aprendizado:** em lista infinita, o módulo precisa ser o span real dos itens, não um número arbitrário; validar o meio do ciclo, não só o frame 0.
**Regra futura:** todo ticker/loop tem teste de 5–9 s com frames a cada 0,5 s.
**Confiança:** alta.

### 2026-11-21 — Gate 4: still não prova contradição

**Agente:** Editor / Traffic / QC
**Contexto:** avaliação por contact sheet e frames estáticos.
**Falso positivo 1:** “8/10” em V01 foi lido como contradição ao payoff de 61; na verdade é um contador que chega a 6/10 em 18 s.
**Falso positivo 2:** “INFLACÃO” foi lido como erro de grafia; a cedilha de **INFLAÇÃO** fica sob o “A” e o til sobrepõe o glifo, parecendo um “C”.
**Técnica:** extrair frames em dois instantes e ampliar o texto antes de aceitar a acusação.
**Aprendizado:** contact sheet de 2 s não distingue animação de contradição; frame único não é prova de erro de texto.
**Regra futura:** toda acusação visual precisa de dois frames ou de leitura do código.
**Confiança:** alta.

### 2026-11-21 — Gate 4: avaliação em paralelo e limite de passos

**Agente:** Orquestrador
**Contexto:** 8 agentes avaliando 10 MP4.
**Problema:** novamente 4 de 8 atingiram o limite de passos antes de escrever o arquivo; o Video Editor precisou de uma segunda rodada só para gravar.
**Técnica:** pedir “escreva o arquivo primeiro”, limitar a 100–120 linhas e mandar uma segunda execução apenas para gravar quando a análise já existe.
**Resultado:** 8/8 relatórios entregues; ranking e finalistas calculados.
**Aprendizado:** o limite de passos é recorrente; o orçamento precisa reservar a escrita como primeira ação, não como última.
**Regra futura:** subagente de auditoria recebe “arquivo primeiro, análise depois” e um teto de linhas.
**Confiança:** alta.

### 2026-11-21 — V01 venceu, mas “vencer” não é “publicar”

**Agente:** Orquestrador / QC
**Contexto:** fechamento da primeira coleção audiovisual.
**Fato:** V01 — O ticker não para terminou em 1º no ranking interno com **77,9/100**.
**Decisão do usuário:** V01 escolhido como vencedor da coleção e referência inicial de qualidade.
**Aprovação técnica:** PASS condicional, sem escuta humana.
**Aprovação de publicação:** **não concedida**.
**Regra:** separar quatro estados — (1) vitória no ranking, (2) aprovação técnica, (3) escolha do usuário, (4) autorização de publicação. Nenhum implica o seguinte.
**Confiança:** alta.

### 2026-11-21 — O que faz V01 funcionar (sem virar molde)

**Agente:** Creative / Retention / Editor
**Contexto:** acabamento final do vencedor.
**Características observadas:** metáfora física clara (nota parada × preços em movimento), frame 0 legível, ticker como prova e não decoração, cortes secos nos limites da fala, payoff de 61,39 com hold, Thalita contínua, CTA de marca.
**Acabamento aplicado:** topo 156 px, disclaimer 320 px, 24 itens únicos no ticker, contador 5→4→3, CTA antecipado, pulso em 61,39, menos SFX e mix de música mais baixo.
**Aprendizado:** V01 é **referência de padrão**, não template obrigatório. Cada novo vídeo deve provar sua própria tese com o motivo que escolher.
**Evidência:** `reports/V01_FINAL_POLISH.md`; `V01/render/SAFE_ZONE_CHECK.md`; `V01/render/EDITORIAL_CHECKLIST.md`.
**Confiança:** alta na execução; média na retenção real (não medida).

---

## 4. Regras operacionais recorrentes

1. Thalita é a voz padrão.
2. Cortes a cada 1–3 s quando a narrativa permitir.
3. Pausas de 100–180 ms; revisar >250–300 ms.
4. Não cortar sílabas/finais.
5. Cada SFX precisa acompanhar um evento visual.
6. Não usar SRT sobre tipografia cinética.
7. CTA ≥ 190–210 px do rodapé; disclaimer ≥ 120 px.
8. Frame 0 é capa; inspecionar.
9. Validar MP4 com ffprobe/verify; não confiar no diálogo do CapCut.
10. CapCut fechado antes de MCP save.
11. Blender só isolado na 9877 com gate `MCHX_*`.
12. Nenhum upload/push/deploy/publicação sem autorização.
13. Nenhum crédito pago sem autorização.
14. Não inventar métricas de retenção/distribuição.
15. Licença Remotion/edge-tts: documentar, não declarar aprovada.
16. Timing por caracteres/s, não por slot; máximo ~3,2 palavras/s.
17. Metáfora visual deve provar a mesma tese da narração.
18. Simulação rotulada na fala ou na tela.
19. CTA não promete o que o vídeo não entrega.
20. Todo subagente de auditoria escreve o arquivo primeiro.
21. Disclaimer educacional e assinatura da marca em todo end card.
22. Safe zone TikTok: 120 px à direita; tipografia mínima 34/44 px.

---

## 5. Índice de aprendizados recorrentes

| Categoria | Aprendizado | Confiança |
|---|---|---|
| Legendas | Não sobrepor SRT à tipografia | Alta |
| Áudio | Preservar extensão real do container | Alta |
| CapCut | Fechar app antes de save MCP | Alta |
| Blender | Porta 9877 + gate `MCHX_*` | Alta |
| Voz | Thalita é padrão | Alta |
| Hook | Frame 0 não pode ser flash lavado | Alta |
| Motion | Remover item borrando só o item | Alta |
| Safe zone | CTA/disclaimer acima da UI | Alta |
| Export | Validar arquivo, não diálogo | Alta |
| Licença | Remotion/edge-tts pendentes | Alta |
| Tooling | HyperFrames/Whisper/yt-dlp instalados | Alta |
| Agentes | Permissão nativa exige padrões relativo/tilde/backslash; testar read+skill+edit | Alta |
| Timing | Medir caracteres/s antes de fechar timecodes | Alta |
| Metáfora | O visual precisa provar a mesma tese da narração | Alta |
| CTA | Não prometer o que o vídeo não entrega | Alta |
| Avaliação | Subagente escreve o relatório antes de refinar | Alta |
| Compliance | Disclaimer educacional e assinatura em todo end card | Alta |
| Safe zone | TikTok 120 px à direita; tipografia 34/44 px | Alta |
| Storyboard | Tempos derivam das linhas de narração, não de escala | Alta |
| Frame 0 | Título e motivo visíveis no primeiro frame | Alta |
| Loudness | Dois passes; TP -1,8; medir o MP4 final | Alta |
| Cortes | CutScene seco; sem crossfade entre cenas | Alta |

---

## 6. Template de novo registro

```md
### AAAA-MM-DD — Título curto

**Agente:** ...
**Contexto:** ...
**Problema/descoberta:** ...
**Técnica utilizada:** ...
**Resultado observado:** ...
**Evidência:** ...
**Aprendizado:** ...
**Regra prática:** ...
**Confiança:** alta/média/baixa
```

---

## 7. Histórico de atualizações

| Data | Mudança | Origem |
|---|---|---|
| 2026-11-21 | Criação da memória; decisões Thalita, cortes, pausas, 10 vídeos, project-local | Gate 1/2 do usuário |
| 2026-11-21 | Registros de SRT, VectCutAPI, CapCut, Blender, safe zone, licenças | Produções anteriores |
| 2026-11-21 | Registros de HyperFrames, Whisper, FFmpeg, yt-dlp | Gate 2 / instalação |
| 2026-11-21 | 8 agentes, 5 skills, Memória e pasta das 10 variantes criados; leitura/escrita/skill validados | Gate 2 |
| 2026-11-21 | Gate 3: 10 conceitos, 70 documentos, timing recalibrado, 217 checagens | Gate 3 |
| 2026-11-21 | Gate 3: cold open V02, modelo V03/V10, CTAs, disclaimer, safe zone TikTok | Avaliações dos agentes |
| 2026-11-21 | Gate 3 concluído documentalmente: 415 checagens, 0 falhas; pré-finalistas V01/V08/V06 | Gate 3 |
| 2026-11-21 | Gate 4: 10 MP4 finais, 10 QC/técnicos, 10 drafts, 8 avaliações, ranking e finalistas V01/V08/V04 | Gate 4 |
| 2026-11-21 | Gate 4: ticker de V01 corrigido (módulo 1400→2360), falsos positivos refutados com frame, V01 re-auditado PASS | QC / correção |
| 2026-11-21 | V01 escolhido vencedor (77,9); acabamento final com safe zones, contador, CTA e mix; draft preparado, sem deploy/export | Decisão do usuário |
