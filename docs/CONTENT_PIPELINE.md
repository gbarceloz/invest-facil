# Pipeline de Conteúdo Educativo — Invest Fácil

**Objetivo:** produzir vídeos curtos (30–90 s, no máximo 3 min), didáticos e
visualmente consistentes para o público de 18–25 anos, sem promessas de retorno.
**Formato principal:** 1080×1920 (9:16), 30 fps, H.264/AAC, legenda embutida.
**Idioma:** português brasileiro, tom direto e acolhedor.

---

## 1. Fluxo em 10 etapas

```
Pesquisa financeira
  → Roteiro
  → Storyboard
  → Assets (imagens, ícones, trilha, narração)
  → Narração
  → Montagem
  → Legendas
  → Revisão editorial e factual
  → Exportação
  → Upload para o Invest Fácil
```

Cada etapa tem um **gate**. Nenhum vídeo avança sem o gate anterior.

### 1.1 Pesquisa financeira

- Usar fontes primárias: Banco Central, CVM, Tesouro Nacional, B3, IBGE,
  órgãos reguladores e materiais acadêmicos.
- Separar **fato**, **consenso** e **opinião**. Não transformar opinião em regra.
- Registrar fonte, data de acesso e trecho de apoio em `fontes.md`.
- Não usar promessa de rentabilidade, “investimento garantido”, “ficar rico”,
  “todo mundo está ganhando” ou urgência artificial.

**Gate:** toda afirmação factual tem fonte verificável; nenhuma recomendação
individual de compra/venda.

### 1.2 Roteiro

- Um conceito por vídeo; 120–180 palavras para 60–90 s.
- Estrutura: gancho → problema → explicação → exemplo → ressalva → ação.
- Linguagem sem jargão; se usar um termo, explique na mesma frase.
- Incluir o aviso educativo quando houver mercado/simulação.

**Gate:** leitura em voz alta ≤ 90 s; nenhuma frase promete retorno.

### 1.3 Storyboard

- 6–10 cenas; cada cena com 1 ideia.
- Definir texto na tela, duração, asset e transição.
- Safe zones: 120 px de margem; evitar texto nos 220 px inferiores (UI do app).
- Usar template `content/templates/storyboard.md`.

**Gate:** cada cena cabe em 3–8 s e tem um objetivo claro.

### 1.4 Assets

- Paleta: `#050505`, `#FAFAFA`, `#FACC15`, `#A3A3A3`.
- Tipografia: Plus Jakarta Sans (preferencial) ou Segoe UI Semibold como fallback.
- Ícones lineares, sem clip-art; imagens com direitos verificados.
- Trilha: royalty-free com atribuição registrada; volume baixo sob a narração.
- Evitar imagens de pessoas reais sem consentimento; preferir ilustração/abstração.

**Gate:** todos os assets têm origem/licença; nada de marca de terceiro sem
autorização.

### 1.5 Narração

- Voz humana revisada é o padrão final; TTS é permitido para protótipo.
- Ritmo ~140–160 palavras/min; pausas de 0,3–0,5 s entre blocos.
- Revisar pronúncia de termos (CDB, ETF, IPCA, Selic, blockchain).
- Exportar WAV 48 kHz/24-bit ou 22,05 kHz/16-bit para o rascunho.

**Gate:** escuta integral; nenhuma frase cortada ou robótica em trecho crítico.

### 1.6 Montagem

- 9:16, 1080×1920, 30 fps; duração alvo 30–90 s.
- Uma ideia por tela; contraste alto; texto grande (≥ 48 px no arquivo final).
- Transições discretas; evitar zoom/giro excessivo.
- Legendas queimadas e, se possível, faixa inferior reservada.

**Gate:** assistir no celular em 360p e no desktop; nada essencial fora de quadro.

### 1.7 Legendas

- SRT com no máximo 2 linhas e ~42 caracteres/linha.
- Sincronizar por frase, não por palavra.
- Revisar acentuação e termos técnicos.
- Incluir versão `.srt` no repositório e legenda queimada no MP4.

**Gate:** legenda legível sem áudio; sem atraso > 200 ms.

### 1.8 Revisão editorial e factual

Checklist obrigatório:

- [ ] Não promete rentabilidade nem “ganho garantido”.
- [ ] Não recomenda ativo específico como “compre agora”.
- [ ] Explica o risco e a possibilidade de perda.
- [ ] Diferencia fato, exemplo hipotético e opinião.
- [ ] Aviso de conteúdo educativo presente.
- [ ] Fontes e data registradas.
- [ ] Português revisado; sem jargão não explicado.
- [ ] Direitos de imagem/áudio/trilha registrados.

**Gate:** duas pessoas revisam (uma técnica, uma editorial) quando possível.

### 1.9 Exportação

- MP4 H.264, AAC, 1080×1920, 30 fps, ~4–8 Mbps; alvo ≤ 50 MB (limite do
  Supabase Free).
- Nome: `if-aula-<slug>-v<versao>.mp4`.
- Preservar projeto editável (CapCut draft) + MP4 + SRT + roteiro + fontes.
- Verificar duração, áudio, legendas e tamanho antes do upload.

**Gate:** arquivo abre em player comum; tamanho ≤ 50 MB; duração ≤ 3 min.

### 1.10 Upload para o Invest Fácil

1. Promover um usuário a ADMIN (SQL no runbook) e autenticar.
2. `POST /api/v1/admin/videos/{lessonId}` multipart (`file`).
3. O backend valida MIME/assinatura/tamanho e envia ao Supabase Storage.
4. `GET /api/v1/content/lessons/{slug}/video` retorna URL assinada.
5. Conferir no frontend `/app/aprender/aula/{slug}`.
6. Registrar no metadado da aula: duração, créditos, data, versão.

**Gate:** vídeo toca no frontend em desktop e mobile; URL não é pública permanente.

---

## 2. Padrões técnicos

| Item | Padrão |
|---|---|
| Aspect ratio | 9:16 (1080×1920) |
| Duração | 30–90 s (máx. 3 min) |
| Codec | H.264 + AAC |
| Bitrate | 4–8 Mbps |
| Áudio | −16 LUFS (voz), trilha −24 LUFS |
| Legendas | SRT + queimadas |
| Tamanho | ≤ 50 MB (Supabase Free) |
| Nome | `if-aula-<slug>-v<versao>.mp4` |
| Capa | 1080×1920 PNG/JPG, rosto/texto legível |

## 3. Identidade visual

- Fundo preto `#050505`; cartões `#111111`/`#181818`.
- Acento amarelo `#FACC15`; texto principal `#FAFAFA`; secundário `#A3A3A3`.
- Título em caixa alta ou sentence case, peso 700/800.
- Um destaque amarelo por cena; não usar mais de duas cores de destaque.
- Marca “Invest Fácil” discreta no topo ou rodapé.
- Evitar estética de “trade”/“lucro fácil”; priorizar clareza.

Tokens em `content/brand/video-brand.json`.

## 4. Templates

| Arquivo | Uso |
|---|---|
| `content/templates/roteiro.md` | roteiro com fontes e aviso |
| `content/templates/storyboard.md` | cenas, tempos, assets |
| `content/templates/legendas.srt` | legenda base |
| `content/templates/metadata.json` | metadados de publicação |
| `content/templates/checklist-revisao.md` | gates editoriais |

## 5. Ferramentas

- **CapCut** para montagem/exportação manual e drafts.
- **MCP CapCut** (endurecido) para criar/editar drafts de forma programática,
  sempre com backup e validação; ver `docs/CAPCUT_MCP_SETUP.md`.
- **FFmpeg** (quando disponível) para probe/transcodificação; o ffmpeg embutido
  no CapCut é uma biblioteca e não serve como CLI completa.
- **TTS local** apenas para protótipo; voz humana na versão final.
- **Supabase Storage** para hospedagem privada com URL assinada.

## 6. Métricas e privacidade

- Medir conclusão de vídeo, início/fim de quiz e uso do simulador apenas com
  consentimento e finalidade declarada.
- Não coletar dados financeiros reais; não pedir CPF, saldo ou senha.
- Analytics (Firebase/GA) só após avaliação de LGPD e consentimento; ver
  `docs/FIREBASE_EVALUATION.md`.

## 7. Definition of Done

- [ ] Roteiro, storyboard, fontes e SRT versionados.
- [ ] Vídeo ≤ 3 min, ≤ 50 MB, 9:16, legível sem áudio.
- [ ] Revisão editorial/factual registrada.
- [ ] Draft editável preservado + MP4 exportado.
- [ ] Upload no Supabase via backend e reprodução no frontend.
- [ ] Metadados e créditos atualizados.
- [ ] Nenhuma promessa de retorno ou recomendação individual.
