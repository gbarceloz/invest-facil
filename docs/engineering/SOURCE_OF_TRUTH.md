# SOURCE OF TRUTH — INVEST FÁCIL

**Data:** 22/11/2026
**Escopo:** autoridade documental, evidência, status, conflitos e manutenção do conhecimento.
**Complementos:** `CONTEXT_INDEX.md` (entrada operacional) e `SOURCE_REGISTRY.md` (matriz por domínio).

---

## 1. Princípio

Documentação **não** compete com código, testes e evidências reais. Ela aponta para eles e
explica seu significado.

Uma afirmação só é tratada como estado atual quando existe evidência verificável:

- código/configuração efetivamente presente;
- teste/comando executado com resultado registrado;
- arquivo/hash/artefato observado;
- decisão humana registrada;
- execução remota comprovada.

Documento, nome de arquivo, intenção ou instrução em Markdown **não** são prova de
comportamento. Quando não há evidência, o estado é `UNKNOWN`, `NOT VERIFIED` ou
`EVIDENCE MISSING`.

---

## 2. Hierarquia de autoridade

A hierarquia varia por domínio. Não existe uma fonte universal.

### 2.1 Evidência técnica

Para comportamento implementado e validado:

1. **Código/configuração em execução** — o que o runtime realmente carrega.
2. **Teste/comando executado** — saída, data, ambiente e resultado.
3. **Artefato observado** — arquivo, hash, MP4, migration aplicada, resposta de API.
4. **Configuração declarada** — workflow, `pom.xml`, `package.json`, migrations.
5. **Documento canônico** — índice/registro que aponta para a evidência.
6. **Documento operacional** — guia/procedimento.
7. **Referência** — explicação.
8. **Histórico/gerado/arquivado** — contexto, nunca estado atual.

Conflito: **evidência executada vence configuração declarada**, que vence documento. Se o
comportamento observado divergir do código, o código naquela revisão é a fonte do
comportamento, e a divergência é um achado.

### 2.2 Decisões humanas

Para aprovação, licença, publicação, gasto, deploy e mudança de escopo:

1. **Registro de decisão humana explícita** (data, operação, alvo, ambiente, impacto,
   escopo e reversibilidade).
2. **Documento que reproduz a decisão**, com link para a evidência.
3. **Silêncio não é aprovação.**

Aprovação técnica, PASS de teste, ranking ou recomendação de agente **não** são aprovação
humana. `HUMAN APPROVED` exige registro; `APPROVED` genérico não é aceito.

### 2.3 Configuração declarada × comportamento real

| Pergunta | Fonte |
|---|---|
| O que o workflow declara? | `.github/workflows/ci.yml` |
| O workflow já rodou no GitHub? | evidência de execução remota (run/log) |
| O que o agente pode fazer? | `opencode debug agents` + teste de enforcement |
| O que o documento diz que o agente pode? | documento operacional, não prova |
| O banco tem qual schema? | migrations + banco limpo/Testcontainers |
| O produto está publicado? | URL/health/deploy log do ambiente, não README |

---

## 3. Classificação de documentos

| Classe | Uso | Regra |
|---|---|---|
| **SOURCE OF TRUTH** | estado oficial de um domínio | deve apontar para código/teste/evidência; não copiar implementação |
| **OPERATIONAL** | executar tarefas | deve indicar a fonte oficial e a data de validade |
| **REFERENCE** | explicar/consultar | não prevalece sobre evidência |
| **HISTORICAL** | estado anterior | obrigatório banner `HISTÓRICO` + data + substituto |
| **GENERATED** | produzido por ferramenta | não editar à mão; regenerar |
| **ARCHIVED** | obsoleto preservado | não carregar como contexto operacional |

Arquivos em `_audit/`, `_quarantine/` e relatórios datados de produção são, por padrão,
**HISTORICAL/ARCHIVED**. `docs/transformation/PHASE0_BASELINE.md` é um retrato de 21/11,
não o estado atual.

---

## 4. Semântica de status

### 4.1 Vocabulário canônico

| Estado | Significado objetivo |
|---|---|
| `PLANNED` | planejado; nenhuma implementação |
| `DISCOVERED` | encontrado na auditoria; ainda não mapeado |
| `MAPPED` | mapeado documentalmente; sem prova de execução |
| `IMPLEMENTED` | alteração presente no código/config |
| `TESTED` | teste/comando executado com resultado registrado |
| `VERIFIED` | critério de verificação comprovado por evidência |
| `PARTIAL` | parte dos critérios satisfeita |
| `BLOCKED` | impedido por dependência/credencial/decisão |
| `NOT VERIFIED` | evidência insuficiente |
| `HUMAN REVIEW REQUIRED` | depende de decisão humana |
| `HUMAN APPROVED` | aprovação humana registrada |
| `READY FOR RELEASE` | critérios técnicos **e** humanos satisfeitos |
| `DEPLOYED` | implantado em ambiente identificado |
| `PUBLISHED` | publicado em destino identificado |
| `DEPRECATED` | não usar em trabalho novo |
| `ARCHIVED` | preservado apenas para histórico |

### 4.2 Regras de separação

- `IMPLEMENTED` ≠ `TESTED`; `TESTED` ≠ `VERIFIED`.
- `VERIFIED` ≠ `HUMAN APPROVED`; `HUMAN APPROVED` ≠ `DEPLOYED`; `DEPLOYED` ≠ `PUBLISHED`.
- `PLANNED` ≠ `IN PROGRESS`; existência de arquivo ≠ funcionalidade concluída.
- `PASS`/`FAIL` são resultados de gate, não ciclo de vida.
- `GO`/`NO-GO` são decisões de release, não status de implementação.

Quando necessário, registre dimensões separadas:

```text
implementation_status: IMPLEMENTED
test_status: TESTED
verification_status: PARTIAL
human_review_status: HUMAN REVIEW REQUIRED
release_status: NOT VERIFIED
deployment_status: NOT DEPLOYED
publication_status: NOT PUBLISHED
```

### 4.3 Aliases legados

Documentos antigos usam outros termos. A conversão é:

| Legado | Canônico |
|---|---|
| `DEFINED` | `PLANNED` |
| `NOT_STARTED` | `PLANNED` |
| `IN_PROGRESS` | `PARTIAL` (trabalho iniciado, não concluído) |
| `DONE`/`CONCLUÍDO` | `VERIFIED` somente com evidência; senão `NOT VERIFIED` |
| `CONCLUÍDO COM RESSALVAS` | `PARTIAL` |
| `APROVADO TECNICAMENTE` | `TESTED`/`VERIFIED` técnico; **não** `HUMAN APPROVED` |
| `GO`/`NO-GO` | decisão de release (separada) |

Os valores legados podem permanecer em documentos históricos, com o alias indicado.

---

## 5. Resolução de conflitos

Procedimento obrigatório:

1. Identifique as afirmações incompatíveis e suas fontes.
2. Consulte a implementação, o teste ou o artefato.
3. Determine qual afirmação ainda é válida.
4. Registre a confiança (`HIGH`, `MEDIUM`, `LOW`).
5. Classifique a resolução: `RESOLVED`, `PARTIALLY RESOLVED`, `UNRESOLVED`, `UNKNOWN`.
6. Atualize o documento operacional ou aplique banner histórico.
7. Se não houver evidência, não escolha o documento mais recente por conveniência.

### 5.1 Tratamento de incerteza

Use `UNKNOWN`, `NOT VERIFIED`, `EVIDENCE MISSING` ou `HUMAN CONFIRMATION REQUIRED`.
Ausência de evidência **não** é confirmação. Um documento mais novo também pode estar
errado.

---

## 6. Evidência

Uma evidência útil registra:

- comando/ação executada;
- data e ambiente;
- resultado observado;
- artefato/caminho/hash;
- limitações.

Saída de teste sem relatório, print sem contexto ou afirmação de agente sem log são
evidências fracas. Relatórios gerados por agente são opinião até serem confrontados com
código/teste.

### 6.1 Artefatos gerados

`backend/target/surefire-reports/`, `.next/`, `out/`, logs, manifests e relatórios de
ferramenta são **GENERATED**. Não editar à mão; regenerar. Um relatório pode ser preservado
como evidência datada, mas não vira fonte de estado sem o artefato correspondente.

---

## 7. Freshness e manutenção

A validade é por evento, não por prazo arbitrário.

| Informação | Evento que exige revisão | Owner funcional |
|---|---|---|
| Stack/versões | mudança de dependência/runtime | agente principal |
| Arquitetura | mudança estrutural | agente principal |
| Endpoints/API | mudança de controller/DTO/OpenAPI | agente principal |
| Banco | nova migration/schema | agente principal |
| Testes | novo teste/suite/resultado | agente principal |
| CI | mudança em workflow/runner | agente principal |
| Agentes | mudança de agente/permissão | agente principal |
| Skills | mudança de skill | agente principal |
| Design System | token/componente | nenhum owner ativo (funcional: agente principal) |
| Vídeo | novo render/QC/aprovação | agente principal + agentes de vídeo |
| Media assets | novo asset/política | agente principal |
| Git | branch/remote/staged relevante | agente principal |
| Aprovações | nova decisão humana | proprietário |
| Roadmap | mudança de fase/gate | agente principal |

Regra: a atualização acontece **na mesma tarefa** que mudou código/config. Se não for
possível, registre `STALE` e abra pendência.

Owners funcionais são papéis, não nomes inventados. O único owner humano é o
**proprietário do projeto**, para decisões que exigem autorização.

---

## 8. Duplicação e índice

- Um fato tem **uma** fonte canônica; os demais documentos apontam para ela.
- `CONTEXT_INDEX.md` é a entrada operacional; não substitui a fonte.
- `SOURCE_REGISTRY.md` é a matriz por domínio; não copia implementação.
- Relatórios históricos não são reescritos: recebem banner e substituto.
- Novos documentos só entram se cobrirem um domínio sem fonte ou uma lacuna comprovada.
- Validação local: `python scripts/docs/check_docs.py` (links, D01–D20, placeholders).

---

## 9. Contexto mínimo de tarefa

Antes de executar, um agente deve obter:

1. objetivo;
2. domínio;
3. fontes oficiais;
4. evidência atual;
5. estado atual (dimensões separadas);
6. dependências;
7. limitações/riscos;
8. restrições e arquivos protegidos;
9. critérios de aceitação;
10. data/referência temporal.

Não é necessário ler o repositório inteiro. O `CONTEXT_INDEX.md` encaminha para o domínio.

---

## 10. Limites e riscos permanentes

Este documento **não** resolve os riscos abertos do P0.3. Permanecem abertos:

- agentes globais com shell amplo;
- MCP global com acesso ao projeto;
- root divergente do MCP;
- `npx -y` sem versão fixa;
- `ffmpeg` fora do escopo de edição;
- ausência de sandbox/taint;
- ausência de aprovação técnica (`ask`);
- browser não verificado;
- CLI 2.2.5 × servidor 2.3.2.

Documentar um risco não o mitiga. Consulte `docs/engineering/P0_3_VERIFICATION.md` e
`AGENT_SECURITY_POLICY.md`; o status continua `OPEN` até decisão humana ou evidência de
mitigação real.
