import { mkdirSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";

// Fonte editável do conteúdo educativo. Gera o JSON consumido pelo backend.
// Execute: node scripts/generate-seed.mjs

const q = (question, options, correctIndex) => ({ question, options, correctIndex });
const lesson = (slug, title, estimatedMin, order, content, quiz = []) => ({
  slug, title, estimatedMin, order, content, quiz,
});
const module = (slug, title, description, order, lessons) => ({
  slug, title, description, order, lessons,
});
const category = (slug, name, description, order, modules) => ({
  slug, name, description, order, modules,
});
const article = (slug, title, subtitle, categorySlug, readingMinutes, content, sourceName, sourceUrl) => ({
  slug, title, subtitle, categorySlug, readingMinutes, content, sourceName, sourceUrl,
});

const categories = [
  category("fundamentos", "Fundamentos financeiros",
    "Organize o presente, entenda o dinheiro e construa uma base segura antes de investir.", 1, [
      module("primeiros-passos", "Primeiros passos",
        "Orçamento, reserva de emergência e as decisões que vêm antes de qualquer investimento.", 1, [
          lesson("por-que-educacao-financeira", "Por que educação financeira importa", 4, 1,
            `## Dinheiro é uma ferramenta, não um placar

Educação financeira não é sobre ficar rico rápido. É sobre entender as consequências das suas decisões e escolher com intenção. Quem sabe quanto ganha, quanto gasta e quanto pode perder toma decisões melhores — inclusive a decisão de não investir em algo.

## O custo de decidir no escuro

No Brasil, crédito fácil, parcelamento longo e promessas de ganho rápido convivem com informação de qualidade. Sem base, é difícil separar **educação** de **publicidade**. O resultado costuma aparecer em juros de cartão, empréstimos caros e investimentos que a pessoa não entende.

## Três hábitos que mudam o jogo

1. **Gastar menos do que ganha** — parece óbvio, mas é a base de tudo.
2. **Planejar antes de comprar** — uma meta com prazo muda a comparação entre opções.
3. **Investir com propósito** — cada real deve ter uma função: reserva, aposentadoria, estudo ou sonho.

> Educação financeira não elimina o risco. Ela melhora a qualidade das decisões diante dele.`,
            [
              q("Qual é o objetivo principal da educação financeira?",
                ["Garantir retorno alto em pouco tempo",
                 "Tomar decisões conscientes sobre dinheiro e risco",
                 "Evitar qualquer tipo de investimento",
                 "Aumentar o limite do cartão de crédito"], 1),
              q("Qual hábito é a base de uma vida financeira saudável?",
                ["Gastar menos do que ganha",
                 "Parcelar tudo em 24 vezes",
                 "Investir todo o salário em cripto",
                 "Comparar apenas o preço da parcela"], 0),
            ]),
          lesson("orcamento-pessoal", "Orçamento pessoal sem planilha complicada", 4, 2,
            `## O orçamento é um mapa, não uma prisão

Orçamento serve para mostrar **para onde o dinheiro vai**. Não precisa ser perfeito nem detalhado. Comece com três blocos: renda, gastos essenciais e tudo o mais.

## A referência 50/30/20

Uma regra simples para começar:

- **50%** para necessidades: moradia, alimentação, transporte, contas básicas.
- **30%** para desejos: lazer, assinaturas, roupas.
- **20%** para poupança e dívidas.

Ela é um ponto de partida, não uma lei. Quem mora sozinho ou sustenta a família pode precisar de outra proporção. O importante é saber o número real.

## Como fazer em 20 minutos

1. Liste a renda líquida dos últimos três meses.
2. Classifique os gastos em fixos e variáveis.
3. Encontre os três maiores vazamentos.
4. Defina um valor automático para poupar no dia do salário.
5. Revise uma vez por mês, sem culpa.

> O melhor orçamento é o que você consegue manter.`,
            [
              q("Na referência 50/30/20, o querepresenta os 20%?",
                ["Lazer e assinaturas", "Poupança e dívidas", "Moradia", "Impostos"], 1),
              q("Qual é uma boa forma de começar um orçamento?",
                ["Anotar todos os gastos por três meses e comparar com a renda",
                 "Cortar tudo o que dá prazer",
                 "Pedir um empréstimo para organizar as contas",
                 "Ignorar gastos pequenos"], 0),
            ]),
          lesson("reserva-de-emergencia", "Reserva de emergência: seu colchão de segurança", 4, 3,
            `## Por que a reserva vem antes do investimento

Imprevistos acontecem: desemprego, doença, conserto do carro. Sem reserva, a pessoa recorre ao cartão ou a um empréstimo caro — e o problema financeiro cresce.

A reserva de emergência é dinheiro **separado**, de fácil acesso e baixo risco. Ela não serve para multiplicar patrimônio; serve para evitar que um imprevisto vire dívida.

## Quanto guardar

A referência é de **3 a 6 meses** de gastos essenciais. Quem tem renda variável, dependentes ou pouca estabilidade pode precisar de mais. Calcule o valor mensal necessário para viver com dignidade, não o salário inteiro.

## Onde deixar

Opções com liquidez e segurança costumam ser preferíveis: Tesouro Selic, CDB com liquidez diária de banco sólido ou fundo DI de baixo custo. Criptomoedas e ações não são reserva de emergência: podem cair justamente quando você precisa do dinheiro.

> Reserva não é investimento para enriquecer. É seguro para não empobrecer.`,
            [
              q("Qual é a principal função da reserva de emergência?",
                ["Maximizar a rentabilidade",
                 "Evitar que imprevistos virem dívidas",
                 "Comprar ações na baixa",
                 "Pagar menos imposto"], 1),
              q("Qual característica é mais importante em uma reserva de emergência?",
                ["Alta volatilidade", "Liquidez e baixo risco", "Prazo de 10 anos", "Garantia de retorno alto"], 1),
            ]),
        ]),
    ]),
  category("investimentos", "Investimentos",
    "Entenda o que é investir, como os juros compostos funcionam e como avaliar o risco.", 2, [
      module("investir-com-consciencia", "Como investir com consciência",
        "A diferença entre investir, especular e apostar — e o papel do tempo.", 2, [
          lesson("o-que-e-investir", "O que é investir (e o que não é)", 4, 1,
            `## Investir é alocar capital com expectativa de retorno

Investir significa colocar dinheiro em algo que pode gerar retorno no futuro — uma empresa, um título público, um fundo. Em troca, você aceita algum risco. Não existe retorno sem risco; existe risco que você entende e risco que você não entende.

## Investir não é apostar

Apostar depende de um evento incerto e de curto prazo. Investir é um processo: você avalia o ativo, o prazo, a liquidez e o risco, e acompanha o resultado. A frase “vai subir” não é uma tese de investimento.

## Retorno real importa

Se um investimento rende 8% ao ano e a inflação é 5%, o ganho real é de aproximadamente 3%. Olhar só para o número nominal pode esconder uma perda de poder de compra.

## O tripé de qualquer decisão

- **Risco:** o que pode dar errado e qual é o tamanho da perda?
- **Retorno:** qual é a expectativa e de onde ela vem?
- **Liquidez:** quando o dinheiro volta para a sua mão?

> Se você não consegue explicar como o investimento ganha dinheiro, provavelmente ainda não o entende.`,
            [
              q("O que caracteriza um investimento?",
                ["Retorno garantido sem risco",
                 "Alocação de capital com expectativa de retorno e algum risco",
                 "Comprar qualquer ativo que subiu ontem",
                 "Guardar dinheiro sem objetivo"], 1),
              q("Se a inflação é 5% e o investimento rende 8%, o ganho real aproximado é:",
                ["13%", "8%", "3%", "5%"], 2),
            ]),
          lesson("juros-compostos", "Juros compostos: o tempo trabalhando por você", 5, 2,
            `## A bola de neve

Juros compostos são juros que rendem sobre juros. No primeiro mês, o rendimento é pequeno. Com o tempo, a curva acelera. É por isso que começar cedo costuma valer mais do que começar grande.

## Um exemplo com números

Considere R$ 300 por mês, durante 10 anos, a uma taxa hipotética de 8% ao ano. O total aportado seria R$ 36 mil. Com juros compostos, o montante poderia chegar a aproximadamente R$ 55 mil — sem garantir que essa taxa se repita.

A diferença entre 36 mil e 55 mil não veio de um mês excepcional. Veio de **tempo** e **constância**.

## O que atrapalha

- Começar tarde demais.
- Resgatar a cada oscilação.
- Pagar taxas altas que consomem o rendimento.
- Trocar de estratégia sem motivo.

## O que ajuda

Automatizar o aporte, revisar uma vez por ano e manter o objetivo claro. Juros compostos funcionam melhor quando você não interrompe o processo.

> Simulações são educativas. Rentabilidade futura não é garantida.`,
            [
              q("O que são juros compostos?",
                ["Juros cobrados apenas no primeiro mês",
                 "Juros que incidem também sobre os juros acumulados",
                 "Uma taxa fixa garantida por lei",
                 "Um tipo de imposto"], 1),
              q("Qual fator costuma ter mais impacto no longo prazo?",
                ["Começar cedo e manter aportes",
                 "Acertar o melhor dia do mês",
                 "Trocar de ativo toda semana",
                 "Investir apenas quando a bolsa sobe"], 0),
            ]),
        ]),
    ]),
  category("renda-fixa", "Renda fixa",
    "Títulos públicos e privados, juros, prazos, liquidez e os riscos que aparecem na letra miúda.", 3, [
      module("renda-fixa-na-pratica", "Renda fixa na prática",
        "Tesouro Direto, CDB, LCI, LCA e o que comparar antes de escolher.", 3, [
          lesson("tesouro-direto", "Tesouro Direto sem complicação", 5, 1,
            `## Emprestar para o governo

No Tesouro Direto, você compra títulos públicos federais. Em termos simples, empresta dinheiro ao governo em troca de uma remuneração. É considerado um dos investimentos de menor risco de crédito do país.

## Os principais tipos

- **Tesouro Selic:** acompanha a taxa Selic e tem alta liquidez. Costuma ser usado como reserva.
- **Tesouro Prefixado:** taxa definida no momento da compra. Se os juros caírem, o título tende a valorizar; se subirem, pode desvalorizar antes do vencimento.
- **Tesouro IPCA+:** paga uma taxa fixa mais a inflação. Protege o poder de compra, mas oscila.

## Custos e impostos

Existe a taxa de custódia da B3 e, dependendo da corretora, taxas próprias. O Imposto de Renda segue a tabela regressiva: quanto mais tempo, menor a alíquota. Resgatar antes do vencimento pode significar vender no mercado secundário, com preço diferente.

## Antes de comprar

Pergunte: qual é o meu objetivo? Quando vou precisar do dinheiro? Entendo que o preço pode oscilar antes do vencimento?

> Título público tem baixo risco de crédito, mas não é sinônimo de liquidez imediata em qualquer condição.`,
            [
              q("O Tesouro Selic é mais indicado para qual objetivo?",
                ["Aposentadoria em 30 anos",
                 "Reserva com necessidade de liquidez",
                 "Especulação com cripto",
                 "Comprar imóveis"], 1),
              q("O que o Tesouro IPCA+ paga?",
                ["Somente uma taxa fixa",
                 "Apenas a inflação",
                 "Uma taxa fixa mais a inflação",
                 "Dividendos de empresas"], 2),
            ]),
          lesson("cdb-lci-lca", "CDB, LCI e LCA: o que comparar", 5, 2,
            `## Renda fixa bancária

CDB, LCI e LCA são títulos emitidos por bancos. Você empresta dinheiro à instituição e recebe juros. O risco principal é o de crédito: a capacidade de o banco pagar.

## FGC não é rede de segurança infinita

O Fundo Garantidor de Créditos cobre até R$ 250 mil por CPF e por instituição, com limite global de R$ 1 milhão a cada quatro anos, em regras que podem mudar. A cobertura é relevante, mas não transforma qualquer emissor em investimento seguro.

## A armadilha da comparação bruta

LCI e LCA são isentas de Imposto de Renda para pessoa física. Um CDB de 100% do CDI e uma LCI de 90% do CDI podem ter resultados parecidos depois do imposto — depende do prazo e da alíquota. Compare sempre o **retorno líquido**, não só a porcentagem anunciada.

## Liquidez também é preço

Um título com resgate imediato costuma pagar menos. Um título com vencimento longo pode pagar mais, mas prende seu dinheiro. Não existe melhor produto em abstrato: existe adequação ao objetivo.

> Rentabilidade passada não garante rentabilidade futura. Leia o prospecto e verifique o emissor.`,
            [
              q("Qual é o principal risco de um CDB?",
                ["Risco de crédito do banco emissor", "Risco de câmbio", "Risco de custódia em blockchain", "Nenhum risco"], 0),
              q("Por que não se deve comparar apenas a taxa bruta de LCI e CDB?",
                ["Porque a LCI sempre rende mais",
                 "Porque a tributação e a liquidez mudam o resultado líquido",
                 "Porque o CDB não tem risco",
                 "Porque o FGC paga qualquer valor"], 1),
            ]),
          lesson("risco-de-credito-e-liquidez", "Risco de crédito, liquidez e mercado", 4, 3,
            `## Três riscos que todo investidor encontra

**Crédito:** o emissor não paga. Aparece em títulos privados, debêntures e até em contrapartes de produtos estruturados.

**Liquidez:** você precisa do dinheiro, mas não consegue vender no preço justo ou no prazo desejado.

**Mercado:** o preço do ativo oscila antes do vencimento. Em renda fixa, isso acontece quando você vende um título antes do prazo e os juros mudaram.

## Risco não é sinônimo de perigo

Risco é incerteza sobre o resultado. Ele pode ser medido, precificado e diversificado. O problema é assumir um risco que você não entende ou que não cabe no seu prazo.

## A pergunta certa

Antes de buscar a maior taxa, pergunte: **o que preciso abrir mão para receber essa taxa?** Prazo maior, emissor menor, garantia menor ou liquidez menor costumam explicar o retorno extra.

> Desconfie de retorno alto, garantido e líquido ao mesmo tempo. Essa combinação raramente existe.`,
            [
              q("O que é risco de liquidez?",
                ["A chance de o emissor não pagar",
                 "A dificuldade de vender o ativo no preço e prazo desejados",
                 "A variação do dólar",
                 "O imposto sobre o rendimento"], 1),
              q("Retorno alto, garantido e com liquidez imediata é:",
                ["Comum em renda fixa", "Um sinal de alerta", "Sempre seguro", "Garantido pelo FGC"], 1),
            ]),
        ]),
    ]),
  category("renda-variavel", "Renda variável",
    "Ações, dividendos e a leitura mínima de um ativo antes de assumir risco.", 4, [
      module("acoes-sem-misterio", "Ações sem mistério",
        "O que é uma ação, de onde vem o retorno e como evitar decisões por impulso.", 4, [
          lesson("o-que-e-uma-acao", "O que é uma ação", 4, 1,
            `## Uma fração de uma empresa

Uma ação é a menor parte do capital social de uma empresa. Quem compra se torna sócio: participa dos resultados e dos riscos. Não é um empréstimo; não há promessa de devolução do valor investido.

## De onde vem o retorno

- **Valorização:** o preço da ação sobe ao longo do tempo.
- **Dividendos/JCP:** parte do lucro distribuída aos acionistas.
- **Eventos societários:** bonificações, desdobramentos, recompras.

O retorno total combina esses componentes. Olhar só para o preço pode esconder ou superestimar o resultado.

## Preço não é valor

No curto prazo, o preço reage a notícias, humor e liquidez. No longo prazo, tende a acompanhar os fundamentos da empresa. Isso não garante nada, mas explica por que prazo e qualidade da tese importam.

## O que uma ação não é

Não é renda fixa. Não é garantia de dividendos. Não é aposta de curto prazo. E não deve ser comprada só porque alguém indicou em um vídeo.

> Ação é participação em um negócio. Se você não entende o negócio, não entende o risco.`,
            [
              q("O que uma ação representa?",
                ["Um empréstimo à empresa",
                 "Uma fração do capital social da empresa",
                 "Um título público",
                 "Uma garantia de dividendos"], 1),
              q("Quais são componentes do retorno de uma ação?",
                ["Apenas valorização",
                 "Apenas dividendos",
                 "Valorização, dividendos e eventos societários",
                 "Somente a inflação"], 2),
            ]),
          lesson("dividendos-e-valorizacao", "Dividendos e valorização", 4, 2,
            `## Dividendos não são dinheiro grátis

Quando uma empresa distribui lucro, o valor sai do caixa dela. Em teoria, o preço da ação se ajusta. O investidor ganha em caixa, mas pode ver o valor da participação cair na mesma proporção.

Isso não torna dividendos ruins. Mostra que o retorno total é o que importa: **dividendos + valorização**.

## Empresas que distribuem vs. empresas que reinvestem

Empresas maduras costumam distribuir mais. Empresas em crescimento podem reinvestir para expandir. Nenhum modelo é melhor em todos os casos; depende do setor, do momento e da execução.

## Cuidado com a armadilha do yield

Um dividend yield muito alto pode indicar:
- distribuição extraordinária que não se repete;
- preço caindo por problemas estruturais;
- pagamento acima do lucro, insustentável no tempo.

Olhe o histórico, o lucro e a capacidade de gerar caixa.

> Regras tributárias mudam. Considere o efeito dos impostos no seu resultado líquido.`,
            [
              q("O que o dividend yield alto pode indicar?",
                ["Sempre uma empresa excelente",
                 "Possível distribuição insustentável ou queda do preço",
                 "Garantia de retorno futuro",
                 "Isenção total de riscos"], 1),
              q("Qual é a métrica mais completa para o investidor?",
                ["Preço da ação no dia",
                 "Dividendos isolados",
                 "Retorno total: dividendos mais valorização",
                 "Número de seguidores da empresa"], 2),
            ]),
          lesson("como-ler-um-ativo", "Como ler um ativo antes de investir", 5, 3,
            `## Um roteiro mínimo

1. **O que é?** Ação, fundo, título, cripto? Quem emite?
2. **Como ganha dinheiro?** Qual é a fonte de retorno?
3. **Quais são os riscos?** Crédito, mercado, liquidez, câmbio, regulatório.
4. **Quanto custa?** Taxas, impostos, spread.
5. **Quando vou precisar?** O prazo combina com o ativo?
6. **O que pode dar errado?** Qual é a perda máxima plausível?

## Onde encontrar informação

Prospectos, relatórios gerenciais, lâminas de fundos, sites de bolsa e órgãos reguladores. Redes sociais podem ser ponto de partida, nunca a única fonte.

## O teste final

Explique a tese em uma frase, sem jargão. Se não conseguir, estude mais ou não invista. Não existe vergonha em dizer “ainda não entendo”.

> A melhor proteção contra golpes é entender o que você está comprando.`,
            [
              q("Qual pergunta NÃO faz parte da leitura mínima de um ativo?",
                ["Como o ativo gera retorno?",
                 "Quais são os riscos?",
                 "Qual é a cor do logotipo da empresa?",
                 "Quando vou precisar do dinheiro?"], 2),
              q("Se você não consegue explicar a tese sem jargão, o mais prudente é:",
                ["Investir mesmo assim", "Estudar mais ou não investir", "Pedir dica em grupo", "Usar alavancagem"], 1),
            ]),
        ]),
    ]),
  category("fundos-etfs", "Fundos e ETFs",
    "Investimento coletivo, diversificação e custos que fazem diferença no longo prazo.", 5, [
      module("fundos-e-etfs", "Fundos e ETFs",
        "Como funcionam, quais custos observar e quando fazem sentido.", 5, [
          lesson("o-que-sao-fundos", "O que são fundos de investimento", 5, 1,
            `## Um condomínio de investidores

Em um fundo, vários investidores colocam dinheiro em uma carteira administrada por um gestor. Cada um recebe cotas proporcionais. O patrimônio é separado do patrimônio do gestor, o que é uma proteção importante.

## Tipos comuns

- **Renda fixa:** títulos públicos e privados.
- **Multimercado:** várias estratégias e classes.
- **Ações:** carteira de empresas.
- **Indexados:** buscam acompanhar um índice.

## O que olhar na lâmina

Taxa de administração, taxa de performance, liquidez, prazo de resgate, público-alvo, política de investimento e histórico. Taxa baixa não garante resultado, mas custo alto corrói retorno.

## Fundo não é poupança

O valor da cota oscila. Não há garantia de rentabilidade. Fundos com garantia do FGC são exceções específicas, não a regra.

> Leia a lâmina e o regulamento. Se a estratégia não estiver clara, procure outra opção.`,
            [
              q("O que é uma cota de fundo?",
                ["Um empréstimo do investidor ao gestor",
                 "Uma fração do patrimônio do fundo",
                 "Uma ação de empresa",
                 "Um título do Tesouro"], 1),
              q("Qual custo deve ser observado em um fundo?",
                ["Apenas a taxa de administração",
                 "Taxa de administração, performance e custos indiretos",
                 "Somente o imposto de renda",
                 "Nenhum, fundos são gratuitos"], 1),
            ]),
          lesson("etfs-na-pratica", "ETFs na prática", 4, 2,
            `## Um fundo que negocia como ação

ETF é um fundo negociado em bolsa. Você compra e vende durante o pregão, como uma ação. Muitos buscam acompanhar um índice, como o Ibovespa ou o S&P 500.

## Vantagens

- Diversificação em uma única compra.
- Custos geralmente baixos.
- Transparência da carteira.
- Liquidez de bolsa.

## Atenção

- **Spread:** diferença entre compra e venda.
- **Liquidez:** ETFs menores podem ter spread maior.
- **Exposição cambial:** ETFs internacionais oscilam com o dólar.
- **Impostos:** regras específicas para ETFs no Brasil; verifique a legislação vigente.

## ETF não elimina risco

Se o índice cai, o ETF cai. Diversificação reduz risco específico, não o risco de mercado. E acompanhar um índice não é garantia de retorno futuro.

> ETF é ferramenta, não atalho. Entenda o índice e os custos antes de comprar.`,
            [
              q("O que um ETF faz?",
                ["Garante renda fixa",
                 "Negocia em bolsa e geralmente busca acompanhar um índice",
                 "Elimina o risco de mercado",
                 "Paga dividendos garantidos"], 1),
              q("Qual risco é relevante em ETF internacional?",
                ["Exposição cambial", "Garantia do FGC", "Isenção total de imposto", "Ausência de volatilidade"], 0),
            ]),
        ]),
    ]),
  category("cripto", "Criptomoedas",
    "Blockchain, volatilidade, custódia e golpes — sem promessas e sem atalhos.", 6, [
      module("cripto-com-cautela", "Cripto com cautela",
        "O básico para entender a tecnologia e os riscos antes de qualquer decisão.", 6, [
          lesson("o-que-e-blockchain", "O que é blockchain", 4, 1,
            `## Um registro compartilhado

Blockchain é um registro distribuído: várias cópias de um histórico de transações são mantidas por participantes da rede. Blocos são encadeados por hashes criptográficos, o que torna a alteração retroativa muito difícil.

## Consenso

A rede precisa concordar sobre a ordem das transações. Diferentes blockchains usam mecanismos distintos, como prova de trabalho ou prova de participação. Cada um tem trade-offs de custo, velocidade e segurança.

## Blockchain não é sinônimo de criptomoeda

A tecnologia pode ser usada para rastreabilidade, registros e contratos. Criptomoedas são um uso possível. Nem todo projeto “blockchain” é útil ou seguro.

## Riscos que a tecnologia não resolve

- Volatilidade extrema.
- Perda de chaves e custódia.
- Contratos mal auditados.
- Regulação em evolução.
- Golpes que usam o vocabulário da tecnologia.

> Entender blockchain não significa que você deve comprar cripto. São decisões diferentes.`,
            [
              q("O que é blockchain?",
                ["Um banco central digital",
                 "Um registro distribuído de transações encadeadas",
                 "Uma ação de tecnologia",
                 "Um tipo de imposto"], 1),
              q("Blockchain e criptomoeda são:",
                ["Exatamente a mesma coisa",
                 "Conceitos relacionados, mas não sinônimos",
                 "Sempre seguros",
                 "Regulados de forma idêntica em todo o mundo"], 1),
            ]),
          lesson("volatilidade-e-golpes", "Volatilidade e golpes", 5, 2,
            `## Preço que oscila muito

Criptoativos podem variar dezenas de por cento em pouco tempo. Isso não é necessariamente defeito ou virtude: é uma característica de mercado com alta incerteza. Quem não tolera oscilação deve evitar.

## Golpes comuns

- **Pirâmides e “rendimento garantido”:** retorno fixo alto não existe sem risco correspondente.
- **Falsos influenciadores:** pedem transferência para “multiplicar” seu saldo.
- **Phishing:** sites e aplicativos que imitam corretoras.
- **Contratos e tokens sem auditoria:** prometem retorno e podem drenar sua carteira.
- **Suporte falso:** nunca pede sua senha ou chave privada.

## Custódia

“Not your keys, not your coins” é um alerta: em exchange, você confia na plataforma. Em autocustódia, você assume a responsabilidade total. Nenhuma opção é isenta de risco.

## Regra de ouro

Invista apenas o que você pode perder. Não use dinheiro de emergência, aluguel ou dívida. Desconfie de urgência, garantia e segredo.

> Se alguém promete retorno garantido, o produto não é investimento: é alerta.`,
            [
              q("Qual é um sinal clássico de golpe financeiro?",
                ["Explicar riscos e custos",
                 "Prometer retorno garantido e alto",
                 "Oferecer conteúdo educativo",
                 "Informar o CNPJ da empresa"], 1),
              q("O que significa autocustódia?",
                ["Deixar os ativos na exchange",
                 "Você mesmo controla as chaves e assume a responsabilidade",
                 "Um seguro contra queda de preço",
                 "Uma garantia do governo"], 1),
            ]),
        ]),
    ]),
  category("risco", "Gestão de risco",
    "Diversificação, perfil de investidor e decisões que sobrevivem a cenários ruins.", 7, [
      module("risco-e-diversificacao", "Risco e diversificação",
        "Como reduzir riscos sem abrir mão de entender o que está fazendo.", 7, [
          lesson("diversificacao", "Diversificação não é comprar tudo", 4, 1,
            `## Não colocar todos os ovos na mesma cesta

Diversificar é distribuir o dinheiro entre ativos, setores e classes que não se movem exatamente juntos. O objetivo não é eliminar o risco, mas reduzir a dependência de um único evento.

## Diversificação de verdade

Comprar dez ações de bancos não é diversificação ampla: todas reagem a riscos parecidos. Comprar dez criptomoedas também não. Olhe para a **correlação** e para a exposição econômica.

## Camadas

- **Classe:** renda fixa, variável, fundos, cripto.
- **Setor:** tecnologia, saúde, energia.
- **Geografia:** Brasil, exterior.
- **Emissor:** não concentrar em um único banco ou empresa.

## Excesso também é problema

Carteiras com dezenas de ativos podem ficar impossíveis de acompanhar e gerar custos desnecessários. Diversificação é equilíbrio, não coleção.

> Diversificação reduz risco específico. Ela não impede perdas em crises amplas de mercado.`,
            [
              q("O que a diversificação busca reduzir?",
                ["Todo e qualquer risco",
                 "A dependência de um único ativo ou evento",
                 "Os impostos",
                 "A necessidade de estudar"], 1),
              q("Comprar dez ações do mesmo setor é:",
                ["Diversificação ampla", "Concentração em um risco comum", "Renda fixa", "Garantia de retorno"], 1),
            ]),
          lesson("perfil-de-investidor", "Perfil de investidor", 4, 2,
            `## Três perguntas antes da carteira

1. **Objetivo:** para que você está investindo?
2. **Prazo:** quando vai precisar do dinheiro?
3. **Tolerância:** como você reage a uma queda de 20%?

O perfil não é um rótulo eterno. Muda com o conhecimento, a renda, os objetivos e o momento de vida.

## Capacidade vs. vontade

Capacidade de assumir risco é objetiva: renda estável, reserva, prazo. Vontade é subjetiva: conforto psicológico. Um investidor pode ter capacidade e não ter vontade — e vice-versa.

## Questionário não é destino

Questionários são ponto de partida. A decisão final deve considerar o contexto. Não existe perfil “certo”; existe adequação ao objetivo.

> O melhor investimento é o que você consegue manter nos dias ruins.`,
            [
              q("Qual pergunta ajuda a definir o perfil de investidor?",
                ["Qual é a cor da corretora?",
                 "Quando vou precisar do dinheiro?",
                 "Quantos seguidores tem o influenciador?",
                 "Qual ativo subiu mais ontem?"], 1),
              q("Perfil de investidor é:",
                ["Um rótulo imutável", "Uma adequação que pode mudar com o tempo", "Uma garantia de retorno", "Uma regra do banco central"], 1),
            ]),
        ]),
    ]),
  category("planejamento", "Planejamento financeiro",
    "Metas, prioridades e o primeiro investimento com método.", 8, [
      module("planejamento-que-funciona", "Planejamento que funciona",
        "Transforme intenção em plano com prazo e valor.", 8, [
          lesson("metas-financeiras", "Metas financeiras com prazo e valor", 4, 1,
            `## “Quero investir” não é meta

Meta precisa de valor, prazo e prioridade. “Guardar R$ 5.000 para uma viagem em 12 meses” é acionável. “Ficar rico” não é.

## Curto, médio e longo prazo

- **Curto:** até 1 ano — liquidez e segurança.
- **Médio:** 1 a 5 anos — equilíbrio entre risco e retorno.
- **Longo:** acima de 5 anos — mais espaço para volatilidade.

## O método SMART

Específica, mensurável, alcançável, relevante e temporal. Aplique à meta e divida pelo prazo: quanto por mês? Automatize o aporte.

## Prioridades

1. Sair de dívidas caras.
2. Construir reserva.
3. Investir para objetivos.
4. Aumentar conhecimento.

> Plano bom é plano que cabe no seu orçamento e sobrevive a um mês difícil.`,
            [
              q("O que torna uma meta acionável?",
                ["Ser apenas um desejo",
                 "Ter valor, prazo e prioridade",
                 "Depender de sorte",
                 "Ser igual à meta de outra pessoa"], 1),
              q("Qual deve ser uma prioridade antes de investir em ativos de risco?",
                ["Quitar dívidas caras e construir reserva",
                 "Comprar o ativo da moda",
                 "Aumentar o limite do cartão",
                 "Parcelar mais compras"], 0),
            ]),
          lesson("primeiro-investimento", "Seu primeiro investimento", 5, 2,
            `## Antes de escolher o produto

Verifique dívidas caras, reserva de emergência e objetivo. Investir sem essa base costuma terminar em resgate no pior momento.

## Abra a conta em uma instituição sólida

Compare taxas, liquidez, atendimento e segurança. Desconfie de promessas de retorno alto e de pressão para decidir rápido. Confira se a instituição é autorizada pelos órgãos reguladores.

## Comece simples

Um título de baixo risco ou um fundo indexado de baixo custo pode ser suficiente para entender o processo. O primeiro investimento não precisa ser o mais rentável; precisa ser compreensível.

## Rotina de acompanhamento

- Aporte automático.
- Revisão trimestral ou semestral.
- Rebalanceamento quando necessário.
- Atualização do conhecimento.

> O objetivo do primeiro investimento é criar consistência, não acertar a melhor tacada.`,
            [
              q("O que verificar antes do primeiro investimento?",
                ["Dívidas caras, reserva e objetivo",
                 "Apenas a rentabilidade de ontem",
                 "A dica de um influenciador",
                 "O número de curtidas"], 0),
              q("Qual é um bom objetivo para o primeiro investimento?",
                ["Acertar a maior rentabilidade possível",
                 "Criar consistência e entender o processo",
                 "Investir dinheiro de emergência",
                 "Usar alavancagem"], 1),
            ]),
        ]),
    ]),
];

const articles = [
  article("juros-compostos-tempo", "Juros compostos: o tempo a seu favor",
    "Por que constância importa mais do que acertar o momento perfeito.", "fundamentos", 4,
    `Juros compostos são frequentemente chamados de “juros sobre juros”. A ideia é simples: o rendimento de um período passa a fazer parte da base de cálculo do período seguinte. No começo, o efeito é pequeno; com o tempo, ele se torna dominante.

## Um exemplo conservador

Considere alguém que guarda R$ 300 por mês durante 10 anos, a uma taxa hipotética de 8% ao ano. O total aportado é R$ 36 mil. O montante final pode chegar a cerca de R$ 55 mil. A diferença vem do tempo e da constância, não de uma tacada.

Se a mesma pessoa esperasse cinco anos para começar, o montante seria bem menor, mesmo aportando o mesmo valor mensal por mais tempo. O tempo é o ingrediente que não se compra.

## O que corrói o efeito

Taxas altas, resgates frequentes e troca de estratégia sem motivo. Também corrói a inflação quando o retorno nominal é baixo: ganhar 5% com inflação de 6% é perder poder de compra.

## O que ajuda

Automatizar o aporte, manter uma reserva separada para não precisar resgatar e revisar o plano uma vez por ano. Juros compostos não prometem retorno; eles recompensam quem consegue permanecer.

> Simulações são educativas. Rentabilidade futura não é garantida.`,
    "Banco Central do Brasil — Calculadora do Cidadão", "https://www.bcb.gov.br/"),
  article("tesouro-direto-sem-complicacao", "Tesouro Direto sem complicação",
    "Selic, Prefixado e IPCA+: qual faz sentido para cada objetivo.", "renda-fixa", 5,
    `O Tesouro Direto permite comprar títulos públicos federais. Na prática, o investidor empresta dinheiro ao governo e recebe uma remuneração. É um dos investimentos de menor risco de crédito do país, mas não é isento de oscilações.

## Tesouro Selic

Acompanha a taxa Selic e costuma ter boa liquidez. É bastante usado como reserva de emergência, desde que o investidor entenda que o resgate pode ocorrer no mercado secundário.

## Tesouro Prefixado

A taxa é definida no momento da compra. Se os juros de mercado caírem, o título tende a valorizar; se subirem, pode desvalorizar antes do vencimento. É indicado para quem pode esperar até o prazo.

## Tesouro IPCA+

Paga uma taxa fixa mais a inflação. Protege o poder de compra no longo prazo, mas também oscila. Faz sentido para objetivos distantes, como aposentadoria.

## Custos e imposto

Há taxa de custódia da B3 e possíveis taxas da corretora. O Imposto de Renda segue a tabela regressiva. Antes de comprar, simule o retorno líquido e leia as condições.

> Título público tem baixo risco de crédito, mas preço pode oscilar.`,
    "Tesouro Nacional", "https://www.tesourodireto.com.br/"),
  article("etfs-o-que-sao", "ETFs: diversificação em uma compra",
    "Como funcionam, quais custos observar e o que o ETF não resolve.", "fundos-etfs", 4,
    `ETF é um fundo negociado em bolsa. Ele permite comprar uma cesta de ativos em uma única operação, com a liquidez de uma ação. Muitos ETFs buscam acompanhar um índice, como o Ibovespa ou o S&P 500.

## Por que são populares

Custos geralmente baixos, transparência da carteira e diversificação imediata. Para quem está começando, podem simplificar a construção de uma carteira diversificada.

## O que observar

- **Taxa de administração:** parece pequena, mas importa no longo prazo.
- **Spread:** diferença entre compra e venda; afeta o custo real.
- **Liquidez:** ETFs menores podem ter spread maior.
- **Índice:** entenda o que está sendo acompanhado.
- **Câmbio:** ETFs internacionais oscilam com o dólar.

## O que o ETF não faz

Não elimina o risco de mercado. Se o índice cai, o ETF cai. Também não garante retorno nem protege contra uma crise ampla. Diversificação reduz riscos específicos, não todos os riscos.

> ETF é ferramenta. Entenda o índice, os custos e o seu objetivo.`,
    "B3 — ETFs", "https://www.b3.com.br/"),
  article("cripto-risco", "Criptomoedas: entre a inovação e o risco",
    "O que a tecnologia resolve, o que ela não resolve e como evitar golpes.", "cripto", 5,
    `Criptomoedas são ativos digitais que usam criptografia e registros distribuídos. A tecnologia por trás pode ter usos legítimos, mas isso não torna qualquer projeto seguro nem qualquer promessa verdadeira.

## Volatilidade extrema

O preço pode variar dezenas de por cento em pouco tempo. Quem não tolera oscilações fortes não deve usar cripto como parte relevante da carteira. Dinheiro de emergência e recursos de curto prazo não combinam com esse risco.

## Custódia

Em uma exchange, você confia na plataforma. Em autocustódia, você controla as chaves e assume a responsabilidade total. Perder a chave pode significar perder o ativo. Não existe suporte central que recupere tudo.

## Golpes comuns

Promessas de rendimento garantido, pirâmides, falsos influenciadores, phishing e contratos sem auditoria. A regra é simples: se alguém pede urgência, segredo ou transferência para “multiplicar” seu saldo, desconfie.

## Regulação

O ambiente regulatório evolui. Verifique as regras vigentes, a reputação da instituição e o seu próprio entendimento antes de decidir.

> Invista apenas o que você pode perder. Cripto não é poupança.`,
    "Banco Central do Brasil — Criptoativos", "https://www.bcb.gov.br/"),
  article("reserva-de-emergencia-como-montar", "Como montar uma reserva de emergência",
    "Quanto guardar, onde deixar e por que ela vem antes do investimento.", "fundamentos", 4,
    `A reserva de emergência é o dinheiro separado para imprevistos. Sem ela, qualquer susto vira dívida. Por isso, costuma ser a primeira prioridade financeira, antes de investimentos de risco.

## Quanto guardar

A referência é de 3 a 6 meses de gastos essenciais. Quem tem renda variável, dependentes ou pouca estabilidade pode precisar de mais. O cálculo deve usar o custo de vida, não o salário.

## Onde deixar

Opções com liquidez e baixo risco: Tesouro Selic, CDB com liquidez diária de banco sólido ou fundo DI de baixo custo. O objetivo não é maximizar retorno, mas preservar o valor e permitir acesso rápido.

## O que evitar

Ações, criptomoedas, fundos com prazo de resgate longo e qualquer ativo que possa cair justamente quando você precisa do dinheiro. Reserva não é aposta.

## Como começar

Defina o valor mensal possível, automatize a transferência e acompanhe o progresso. Se a reserva ainda não existe, comece pequeno: o hábito importa mais do que o valor inicial.

> Reserva não enriquece. Ela evita que um imprevisto empobreça.`,
    "Banco Central do Brasil — Educação Financeira", "https://www.bcb.gov.br/"),
  article("diversificacao-nao-e-colecao", "Diversificação não é sair comprando tudo",
    "Como distribuir risco de verdade, sem virar colecionador de ativos.", "risco", 4,
    `Diversificar é reduzir a dependência de um único ativo, setor ou evento. Não é comprar dezenas de produtos aleatórios. Uma carteira com dez ações do mesmo setor pode parecer diversificada, mas concentra o mesmo risco.

## Camadas de diversificação

- **Classe:** renda fixa, renda variável, fundos, cripto.
- **Setor:** tecnologia, saúde, energia, financeiro.
- **Geografia:** Brasil e exterior.
- **Emissor:** não concentrar em um único banco ou empresa.

## Correlação importa

Ativos que se movem juntos oferecem pouca diversificação. Durante crises, correlações podem aumentar. Por isso, diversificar é uma proteção parcial, não uma garantia.

## Excesso também custa

Muitos ativos podem gerar custos, impostos e dificuldade de acompanhamento. O equilíbrio é ter o suficiente para reduzir risco específico, sem perder controle.

> Diversificação reduz risco específico. Não elimina o risco de mercado.`,
    "Comissão de Valores Mobiliários — Educar", "https://www.gov.br/cvm/"),
];

const data = { categories, articles };
const target = "backend/src/main/resources/seed/content.json";
mkdirSync(dirname(target), { recursive: true });
writeFileSync(target, JSON.stringify(data, null, 2) + "\n", "utf8");
console.log(`Seed gerado: ${target} (${categories.length} categorias, ${articles.length} artigos)`);
