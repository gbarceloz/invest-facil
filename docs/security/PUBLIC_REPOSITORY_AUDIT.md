# PUBLIC_REPOSITORY_AUDIT — Auditoria para publicação pública

**Status: APROVADA — com exclusões obrigatórias listadas na seção 5**
**Data: 2026-11-15 | Revisado pós-promoção (missão 03) | Escopo: todo o conteúdo a ser publicado**

Estado da T1 nesta revisão: **promovida para `backend/` e revalidada no
destino** (`mvn -B clean verify -Pdocker-desktop-newapi`, 10/10 testes —
`backend/build_promotion.log`); hashes staging↔destino idênticos
(`backend/promotion-manifest.sha256`).

## 1. Escopo auditado

Conteúdo candidato à publicação (raiz do futuro repositório):

- `README.md`
- `backend/` (fonte Java, pom, migrations, testes, docs de evidência)
- `docs/` (architecture, security, api)

`_staging/`, `_quarantine/`, `_audit/` são diretórios internos de trabalho e
**não** entram na publicação (ver `git-publication-plan.md`).

## 2. Verificações executadas

| # | Verificação | Método | Resultado |
|---|---|---|---|
| 1 | `.env` / `.env.local` / `.env.production` | busca por nome em todo o escopo | ✅ nenhum; existe apenas `.env.example` sem valores |
| 2 | Credenciais/tokens/chaves por padrão | varredura regex (env-with-password, JWT literal, AWS, Stripe/OpenAI, Supabase service key, atribuições literais password/secret/token) | ✅ nenhum em código-fonte, migrations, pom ou docs |
| 3 | Configurações com valores reais | revisão de `application*.yml` e `pom.xml` | ✅ tudo via placeholder `${ENV:}` |
| 4 | `target/`, `node_modules/` e equivalentes | inventário | `target/` existe (build local) e **não** será publicado (`.gitignore`); `node_modules` inexistente (sem frontend) |
| 5 | Logs | varredura por segredos e dados pessoais | ⚠️ logs contêm senhas efêmeras geradas pelo Spring Boot em runtime e caminhos locais — **excluir da publicação** |
| 6 | Histórico Git | procura de `.git` aninhado e na raiz | ✅ **na data desta auditoria** não existe nenhum repositório Git no escopo → não há histórico a vazar; a publicação nascerá de `git init` limpo. **Esta auditoria não cobre o histórico pós-publicação** — ver seção 4 |
| 7 | Dados pessoais | busca por nome de usuário local e caminhos absolutos | ⚠️ presente em logs; relatórios de evidência **sanitizados** nesta auditoria |
| 8 | URLs privadas | revisão | ✅ nenhuma (URLs de serviço apenas exemplares/estáticas da Binance planejadas) |
| 9 | Projeto RBS | contorno | ✅ fora do escopo de publicação; jamais incluído |

## 3. Hits analisados e disposição

| O que | Onde | Classificação | Disposição |
|---|---|---|---|
| `Using generated security password: <uuid>` | `*.log`, `target/surefire-reports/*.xml` | senha efêmera de runtime (uma sessão, valor morto) | não publicar (arquivos não entram no commit) |
| `C:\Users\<usuário>\...` | logs | dado pessoal leve | não publicar |
| `C:\Users\<usuário>\...` | `T1_RELATORIO.md`, `promotion-report.md` | dado pessoal leve | **sanitizado** → `<workspace>` |
| `tcp_info.txt` | `backend/` | saída de debug transitória | **removido** nesta auditoria |

Nenhum valor é segredo reutilizável. As senhas geradas só existiram durante
cada execução da JVM e já não valem nada — mas logs não devem ser publicados
por higiene e por conterem caminhos pessoais.

## 4. Histórico Git

- Não existe repositório Git no escopo (`git init` ainda não executado).
- Portanto **não há histórico** com segredos removidos a analisar — a
  primeira publicação nasce limpa.
- **Esta verificação é datada**: vale para o estado atual. A publicação
  ainda não aconteceu e, portanto, **nenhum histórico foi auditado depois
  de uma publicação** — não há o que auditar nesse sentido. O proprietário
  deve repetir as verificações 1–5 desta auditoria **imediatamente antes do
  push** e após qualquer alteração no repositório.
- Recomendação: **não** reaproveitar histórico de outros projetos (inclui o
  repo da referência RBS, que fica fora do novo repositório).

## 5. Exclusões obrigatórias no primeiro commit

Já cobertas por `backend/.gitignore`:

- `target/` — **inclui** `surefire-reports/` (com as senhas efêmeras de logs)
- `*.log` — `build_t1.log`, `build_promotion.log`, `t_*.log`, `swagger_boot*.log`
- `.env*` (exceto `.env.example`)
- `logs/`, IDEs

O `.gitignore` deve ser ajustado no nível da **raiz do repositório** (novo
arquivo raiz) — ver `git-publication-plan.md` seção 4.

## 6. Veredicto

**APROVADA para publicação pública**, condicionada a:

1. publicar apenas: `README.md`, `backend/{pom.xml, src/**, .env.example, .gitignore,
   T1_RELATORIO.md, promotion-report.md, promotion-manifest.sha256}`, `docs/**`;
2. **não** publicar: `target/`, qualquer `*.log`, `_staging/`, `_quarantine/`,
   `_audit/`;
3. respeitar `git-publication-plan.md` (o push em si é executado pelo
   proprietário, não pelos agentes).

**Dependências da revisão do proprietário (registradas nesta revisão):**

- Substituir `SECURITY_CONTACT_EMAIL_PENDING` (em `SECURITY.md`) pelo e-mail
  real de contato antes do push.
- Reexecutar as verificações desta auditoria imediatamente antes do push.
- Nenhum segredo foi incluído neste relatório.

O scanner automatizado (`SecretsScanTest`) cobre o código Java no build; ele
**não** substitui esta auditoria de escopo completo — por isso foi refeita
aqui a varredura incluindo docs, logs e artefatos.
