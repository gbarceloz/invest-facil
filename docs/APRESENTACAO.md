# Apresentação — Invest Fácil

**Hack Brasil 2026 · Final em 12/12/2026**

---

## 1. Pitch de 3 minutos

### 0:00–0:30 — O problema

> “Quem está começando a investir no Brasil precisa escolher entre conteúdo técnico
> em inglês, dicas soltas em redes sociais e plataformas cujo negócio é incentivar
> transações. Falta um caminho claro, em português, que ensine o risco antes do
> primeiro real.”

### 0:30–1:10 — A solução

> “O Invest Fácil é uma plataforma de educação financeira para jovens de 18 a 25
> anos. Trilhas curtas, quizzes, simulador com dinheiro fictício e gamificação
> honesta. A plataforma não executa ordens, não custodia valores e não promete
> rentabilidade.”

### 1:10–2:10 — A demo

Mostrar em sequência:

1. Dashboard com próxima missão, XP e sequência.
2. Aula + quiz + XP.
3. Simulador com capital, aportes, prazo, taxa e comparação de cenários.
4. Progresso e conquistas.
5. Mercado com aviso e fallback explícito.

### 2:10–2:40 — A arquitetura

> “Backend Spring Boot com PostgreSQL e Flyway, autenticação JWT + refresh opaco
> com rotação e detecção de reuso, MFA TOTP, rate limit e RLS deny-by-default.
> Frontend Next.js integrado por um proxy same-origin. Tudo testado contra
> PostgreSQL real.”

### 2:40–3:00 — O pedido

> “O produto está funcional localmente. Para a final, precisamos validar o deploy,
> subir os vídeos no Supabase e ensaiar. Queremos ser a ponte entre curiosidade e
> decisão consciente — não mais um canal de promessas.”

---

## 2. Estrutura de 10 minutos

| Tempo | Bloco | Conteúdo |
|---|---|---|
| 0:00–1:00 | Problema | Fragmentação, promessas, público 18–25 |
| 1:00–2:00 | Insight | Aprender antes de arriscar; gamificação por aprendizado |
| 2:00–3:00 | Produto | Trilhas, aulas, quizzes, simulador, progresso |
| 3:00–6:00 | Demo | Fluxo completo no navegador |
| 6:00–7:30 | Arquitetura | Modular, segurança, banco, Storage, deploy |
| 7:30–8:30 | Diferenciais | Honestidade, contexto, sem execução de ordens |
| 8:30–9:30 | Roadmap | IA educacional, vídeos, validação com usuários |
| 9:30–10:00 | Fechamento | Estado real, aprendizados, convite |

---

## 3. Narrativa central

**Promessa:** “Aprenda a investir antes de colocar seu dinheiro em risco.”

**Tensão:** o iniciante não sabe o que não sabe; o mercado vende certeza.

**Virada:** educação estruturada + prática segura + linguagem honesta.

**Prova:** produto funcionando, testes, arquitetura de segurança, conteúdo em
português e simulador transparente.

**Convite:** experimentar a jornada e cobrar de nós a clareza que falta no mercado.

---

## 4. Matriz de critérios (Hack Brasil)

| Critério | Como a entrega responde | Evidência |
|---|---|---|
| Problema e público | Jovens 18–25 iniciantes, sem jargão | README, conteúdo, landing |
| Inovação | Gamificação por aprendizado + simulador educativo + contexto de risco | XP, quizzes, simulador, disclaimers |
| Execução | Backend, frontend, banco, auth, testes e docs | 28 testes backend + 6 frontend + build |
| Viabilidade | Stack gratuita/gerenciada (Supabase, Render, Vercel) | `render.yaml`, `docs/DEPLOY.md` |
| Segurança | JWT/refresh/MFA/rate limit/RLS | testes e docs de segurança |
| Impacto | Educação antes do risco; sem promessa de retorno | conteúdo e avisos |
| Apresentação | Demo cronometrada com plano B | `docs/DEMO_SCRIPT.md` |
| Honestidade | Implementado vs planejado separados | README, auditoria, progresso |

---

## 5. Diferenciais

1. **Não é uma corretora disfarçada.** Não executa ordens, não custodia, não
   recomenda ativo.
2. **Gamificação que não incentiva aposta.** XP por aula e quiz, não por transação.
3. **Simulador com poder de compra.** Mostra inflação e cenários, não só um número
   grande.
4. **Segurança de produto real.** Refresh com rotação/reuso, MFA, RLS e rate limit.
5. **Conteúdo em português, com fontes e sem promessas.**
6. **Arquitetura preparada para IA**, mas sem depender dela para a demo.

---

## 6. Roadmap pós-hackathon

### 0–3 meses
- Deploy validado e vídeos no Supabase.
- Testes com 20–30 usuários do público-alvo.
- Ajustes de acessibilidade e onboarding.
- Métricas de conclusão de trilha e retenção.

### 3–6 meses
- Tutor de IA com base no conteúdo revisado (não em alucinação livre).
- Trilhas avançadas e certificados.
- Parcerias com escolas/instituições.
- Painel de conteúdo para administradores.

### 6–12 meses
- Personalização por objetivo e perfil de risco.
- Conteúdo regional e acessibilidade ampliada.
- Modelo de receita sustentável sem conflito de interesse.

---

## 7. Perguntas e respostas rápidas

**“Vocês usam IA?”**
> A arquitetura está preparada, mas a entrega principal não depende de IA. Preferimos
> um produto estável e auditável; o tutor é evolução, não muleta.

**“Como evitam recomendações?”**
> Conteúdo educacional, sem “compre X”; mercado apenas informativo; simulador com
> taxa hipotética e disclaimer; nenhuma execução de ordem.

**“Qual a maior limitação hoje?”**
> O deploy remoto e os vídeos reais ainda dependem de credenciais. O código e o
> runbook estão prontos; não declaramos produção antes de testar.

**“Por que não microserviços?”**
> Equipe pequena, prazo curto e domínios acoplados. Monólito modular reduz custo
> operacional e mantém fronteiras claras.

**“Como medem sucesso?”**
> Conclusão de trilha, acerto em quizzes, retenção semanal e compreensão demonstrada
> — não volume de transações, que nem existe.

---

## 8. Fechamento (30 s)

> “O Invest Fácil não promete enriquecer ninguém. Ele promete algo mais útil:
> **um próximo passo claro**. Se a pessoa terminar a primeira trilha sabendo por que
> está investindo — e por que não deveria investir em algo que não entende — nós
> cumprimos a missão.”
