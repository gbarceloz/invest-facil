# Motion Design — Invest Fácil

Documento interno da linguagem de movimento do produto. A referência de estudo
foi o site da Nattos Capital (nattoscapital.com.br), inspecionado com navegador
real (Playwright/Chromium) em desktop (1440×900) e mobile (390×844), em
27/11/2026.

## 1. O que foi observado na referência

Método: carregamento completo da página, rolagem em passos de 360 px com
espera, captura de screenshots e leitura de `animation-name`,
`animation-duration`, `animation-timing-function`, `animation-delay`,
`transform` e `opacity` dos elementos em movimento. Também foram inspecionados
`data-settings` do Elementor e elementos `sticky`/`fixed`.

### Efeitos confirmados

| Efeito | Configuração observada |
| --- | --- |
| `fadeIn` de seção inteira | 2 s, `ease`, delay 0–200 ms |
| `fadeInUp` de blocos e cards | 1,25 s a 2 s, `ease`, deslocamento vertical proporcional ao bloco (≈40–90 px nos cards; centenas de px em blocos altos) |
| `zoomIn` de imagens | 2 s, `ease`, com 600 ms de delay no hero |
| Stagger | delays explícitos de 200 ms, 300 ms e 600 ms entre elementos |
| Header | fixo no topo, sobrepondo o conteúdo, sem esconder ao rolar |
| Cards de soluções | entram em sequência, um após o outro, com fade + subida |
| Transição entre seções | blocos claros escurecem/aparecem com fade longo; não há wipe, máscara ou pin |
| Mobile | os mesmos fades, com cards empilhados e mais espaço em branco |

### O que NÃO foi observado

- Parallax ou jarallax: todos os containers estavam com `wpr-parallax-no` e
  `wpr-jarallax-no`. Não há camadas se movendo em velocidades diferentes.
- Scroll-jacking, pin de seção ou animação dirigida por scroll (scroll-linked).
- Contadores animados, texto palavra por palavra, máscaras de imagem, tilt 3D
  ou cursores customizados.
- Bibliotecas de animação no HTML servido (GSAP, Lottie, Framer Motion). O
  movimento vem de CSS do Elementor.
- Hover elaborado nos cards: a referência é conservadora nesse ponto.

### Leitura de intenção

A referência troca quantidade por duração: fades longos (1,25–2 s), curva
`ease`, deslocamentos suaves e intervalos generosos. O resultado é uma leitura
calma e sofisticada, não um show de efeitos. Essa é a lição transportada para o
Invest Fácil — com a diferença de que o produto precisa de mais energia visual
no topo e de mais contenção dentro do app.

## 2. Tradução para o Invest Fácil

Identidade preservada: fundo `#090909`, amarelo `accent`, branco para leitura,
verde para indicadores positivos, tipografia geométrica e composições limpas.

### Presets

| Token | Valor | Uso |
| --- | --- | --- |
| Easing principal | `cubic-bezier(0.16, 1, 0.3, 1)` | entradas de texto, imagens e hero |
| Easing de apoio | `cubic-bezier(0.22, 1, 0.36, 1)` | reveals, cards e stagger |
| Reveal de seção | 1,1 s, 36 px | landing |
| Reveal no app | 0,7 s, 36 px | dashboard, aulas, biblioteca |
| Título palavra a palavra | 1,1–1,15 s, 30–55 ms entre palavras | hero e títulos de seção |
| Stagger de cards | 0,85 s, 80 ms entre itens | landing |
| Stagger no app | 0,55 s, 55 ms entre itens | listas e grids |
| Imagem do hero | 1,8 s, escala 1,035 → 1, opacidade 0 → 0,6 | primeiro paint |
| Hover de card | 300–500 ms, elevação de 4 px + borda | landing |

### Componentes reutilizáveis

- `Reveal` — entrada por viewport na landing.
- `SplitText` — título palavra por palavra quando entra na viewport.
- `SplitIntro` — título do hero animado via CSS no primeiro paint, sem esperar
  hidratação (protege o LCP).
- `Stagger` — sequência de filhos na landing.
- `Counter` — número que conta ao entrar na viewport; SSR entrega o valor final.
- `JourneyTimeline` — linha preenchida pelo scroll, com marcos acendendo em
  sequência.
- `AutoReveal` — observador global das páginas internas; ativa
  `data-reveal-auto` e `data-stagger-auto` sem transformar cada card em
  componente cliente.
- `SiteHeader` — header sticky que ganha blur/fundo após 20 px de rolagem.

### Onde foi aplicado

- **Home**: hero com foto em `next/image` (preload + `fetchPriority`), título
  imediato, manifesto, contadores, linha do tempo, nova seção
  “Plataforma” (benefícios + gamificação), módulos e CTA.
- **Dashboard**: header, hero, saúde financeira, progresso, próxima missão,
  mercado e timeline com reveal curto e stagger.
- **Mapa de aprendizado**: PageHeader, resumo e cards de trilha com stagger;
  destaque do módulo e lista de aulas.
- **Módulo**: lista de aulas em stagger; cabeçalho e resumo com reveal.
- **Aula**: header, vídeo (zoom suave), painel de continuar e resumo.
- **Biblioteca**: grid de artigos em stagger; artigo com fade de leitura.
- **Progresso**: stats, nível, domínio, atividade, XP e conquistas.
- **Simulador**: painel de resultados revelado; formulário fica estável.
- **Perfil**: cartões de identidade e segurança.
- **Mercado/Bitcoin**: cabeçalhos, gráfico e trilhas.

## 3. Performance

- Apenas `transform` e `opacity` são animados. O blur do reveal foi removido.
- Cada elemento é observado uma única vez e o observer é desconectado.
- `AutoReveal` usa um único `IntersectionObserver` + um `MutationObserver`
  para conteúdo assíncrono; não há listener de scroll por componente.
- `ScrollProgress` e o parallax escrevem direto no DOM com `requestAnimationFrame`.
- Parallax existe somente na foto do hero; a referência não usa parallax e o
  restante do site permanece com rolagem nativa.
- O hero usa `next/image` com `preload`, `sizes` e dimensões reservadas.
- Vídeos do Módulo 01 usam `preload="metadata"`, poster e só carregam no player.
- `prefers-reduced-motion` desliga animações e mostra todo o conteúdo.
- Sem JavaScript, o CSS de fallback mantém textos, cards e valores visíveis.

## 4. Medições

Comparação entre a produção anterior (a06745d) e o build novo rodando localmente
(`next start`), 3 execuções, mediana, viewport 1440×900. A produção está em outra
rede/host, então os números são indicativos, não um benchmark controlado.

| Métrica | Antes (produção) | Depois (produção) |
| --- | --- | --- |
| LCP | 720 ms | 936 ms |
| CLS | 0,004 | 0,004 |
| Requisições | 17 | 19 |
| Transferência total | 288 KB | 250 KB |
| JavaScript | 177 KB | 184 KB |

Leitura: o JS cresceu 7 KB (sistema de motion + `next/image`), a transferência
total caiu 13% e o CLS ficou igual. O LCP subiu de 720 ms para 936 ms porque a
foto do hero passou a ser o maior elemento pintado (antes o texto era), mas
segue abaixo de 1 s. No build local o LCP medido foi 796 ms; a diferença entre
os ambientes é esperada.

Os gráficos de Bitcoin e do simulador (Recharts) foram extraídos para chunks
carregados sob demanda (`next/dynamic`): o chunk da página do simulador caiu
para ~20 KB e não contém mais a biblioteca de gráficos (o chunk separado do
Recharts só é baixado quando o gráfico aparece).

## 5. Limitações

- A referência não expõe o código-fonte das animações; os valores acima vêm do
  CSS computado e podem variar por elemento.
- O deslocamento do `fadeInUp` do Elementor é proporcional à altura do bloco;
  no Invest Fácil foi fixado em 36 px para consistência entre seções.
- A linha do tempo com preenchimento por scroll é uma interpretação nossa, não
  uma reprodução da referência (que não possui scroll-linked animation).
- Não foi possível medir dispositivos Android físicos; a validação mobile foi
  feita por viewport e emulação de toque no Chromium.
