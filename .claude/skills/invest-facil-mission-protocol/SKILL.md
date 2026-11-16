# Skill: invest-facil-mission-protocol

## Protocolo de Execução de Missões — Invest Fácil

> **Objetivo:** Padronizar a execução, documentação e auditoria de missões operacionais no projeto Invest Fácil.

---

## 1. Estrutura de uma Missão

Toda missão segue o padrão:

```markdown
# MISSÃO XX.Y — TÍTULO

**Agente:** [NVIDIA Nemotron 3.5 / GLM 5.3 Flash / Claude Code]
**Projeto:** Invest Fácil
**Workspace:** `C:\Users\gabri\InvestFacil`

## Contexto
- Estado atual do workspace/repositório
- Decisões prévias relevantes
- Restrições conhecidas

## Objetivo
- O que deve ser entregue ao final

## Restrições
- O que NÃO fazer
- Limites de escopo

## Procedimento
- Passos numerados, sequenciais, verificáveis

## Entrega
- Artefatos esperados (relatórios, diffs, logs)
- Local de salvamento (`_audit/`)
- Critério de aceite explícito
```

---

## 2. Ciclo de Vida de uma Missão

| Fase | Ação | Responsável | Evidência |
|---|---|---|---|
| **Planejamento** | Definir escopo, restrições, critérios de aceite | Arquiteto (GLM) / Proprietário | Documento de missão |
| **Execução** | Passos operacionais, verificações intermediárias | Agente operacional (Nemotron / Claude Code) | Logs, diffs, hashes |
| **Auditoria** | Verificação independente (diff, hashes, segredos, integridade) | Auditor (Nemotron / GLM) | Relatório em `_audit/` |
| **Autorização** | Revisão do relatório pelo proprietário | Proprietário | Aprovação escrita |
| **Commit/Push** | Execução autorizada | Agente operacional | Hash do commit, URL remoto |

**Regra de Ouro:** Nenhuma missão prossegue para a fase seguinte sem evidência material da fase anterior.

---

## 3. Princípios Operacionais

| Princípio | Descrição |
|---|---|
| **Evidência > Presunção** | Toda afirmação deve ter comando executado, log, hash ou diff como prova |
| **Integridade do Código** | Código fonte, migrations, configurações **não mudam** em missões documentais salvo autorização expressa |
| **Rastreabilidade** | Todo arquivo modificado tem diff rastreável; todo arquivo novo tem hash |
| **Segurança First** | Varredura de segredos em *toda* missão que toque arquivos públicos |
| **RBS Intocada** | O repositório de referência (`C:\Users\gabri\Desafio-GC-RBS`) **nunca** é modificado |
| **Origem Intocada** | O módulo original em `C:\Windows\System32\invest-facil-market-data` **nunca** é modificado ou excluído sem autorização explícita |

---

## 4. Padrões de Auditoria

### 4.1 Hashes SHA-256
- Gerados para **todos** os arquivos de origem e destino
- Manifestos salvos em `_audit/` (`source-manifest.sha256`, `staging-manifest.sha256`, `comparison.csv`)
- Critério: **100% match** para arquivos de código/config; mismatches documentados e justificados

### 4.2 Varredura de Segredos
- `git diff --cached` + varredura manual + `SecretsScanTest` no build
- Padrões: `.env*`, `password/secret/token/key` literal, JWT, AWS, Stripe, OpenAI, Supabase
- **Zero tolerância:** qualquer segredo real bloqueia a missão

### 4.3 Dados Pessoais
- Caminhos absolutos (`C:\Users\gabri\...`) → sanitizados para `<workspace>` ou `<usuário>`
- Logs de build com senhas efêmeras → excluídos via `.gitignore`

### 4.3 Integridade do Git
- `git diff --check` → zero trailing whitespace
- `git status --short` → apenas arquivos esperados modificados
- `git remote -v` → nenhum remote não autorizado
- `git log` → histórico limpo (sem force push, sem rebase em main)

---

## 5. Estrutura de Relatórios em `_audit/`

| Arquivo | Conteúdo |
|---|---|
| `mission-XX.Y-<nome>.md` | Relatório principal da missão |
| `source-manifest.sha256` | Hashes da origem |
| `staging-manifest.sha256` | Hashes do destino |
| `comparison.csv` | Comparação linha a linha |
| `excluded-files.txt` | Arquivos excluídos (target/, logs, etc.) |
| `copy-log.txt` | Log da operação de cópia |
| `hash-comparison.csv` | Comparação de hashes |
| `rbs-integrity-before/after.txt` | `git status --porcelain` da RBS antes/depois |
| `workspace-before-after.md` | Estado do workspace antes/depois |

---

## 6. Checklist de Autorização para Commit/Push

Antes de **qualquer** `git commit` ou `git push`:

- [ ] `git diff --check` limpo (zero trailing whitespace)
- [ ] `git status --short` mostra apenas arquivos esperados
- [ ] `git diff --cached` revisado linha a linha pelo proprietário
- [ ] `SecretsScanTest` passa (build limpo)
- [ ] Hashes de código/migrations/config conferidos (idênticos ao commit base)
- [ ] `SECURITY_CONTACT_EMAIL_PENDING` e licença NONE preservados
- [ ] `git-publication-plan.md` e `_audit/` fora do staging (untracked/ignored)
- [ ] Autorização **escrita** do proprietário registrada no relatório

---

## 7. Tratamento de Erros em Missão

| Situação | Ação |
|---|---|
| Divergência de hash não esperada | **Parar**, documentar, reportar — não prosseguir |
| Segredo detectado no staging | **Parar**, unstage, sanitizar, re-auditar |
| `git diff --check` falha | Corrigir whitespace, re-verificar |
| Arquivo inesperado no staging | Remover do staging, investigar origem |
| RBS modificada | **Parar imediatamente**, reportar — RBS é intocável |

---

## 8. Comunicação com o Proprietário

| Evento | Formato |
|---|---|
| Início de missão | Resumo do plano + critérios de aceite |
| Bloqueio/Desvio | Relatório imediato + opções |
| Conclusão de fase | Relatório + evidências + pedido de autorização |
| Erro crítico | Alerta imediato + impacto + plano de contenção |

**Formato padrão:** Relatório em `_audit/mission-XX.Y-<nome>.md` + resumo no chat.

---

## 9. Referências

- `CLAUDE.md` (instruções permanentes)
- `invest-facil-auth-invariants/SKILL.md`
- `invest-facil-db-rules/SKILL.md`
- `invest-facil-testing/SKILL.md`
- `docs/security/PUBLIC_REPOSITORY_AUDIT.md`
- `git-publication-plan.md` (planejamento interno, não publicado)