# Roteiro de Demonstração — Invest Fácil

**Duração alvo:** 8 a 10 minutos · **Ambiente:** local validado (com plano B offline)
**Conta:** `marina@investfacil.local` · senha definida em `DEMO_PASSWORD` (nunca versionada)

---

## 1. Pré-voo (15 min antes)

### 1.1 Banco

```powershell
docker start investfacil-db
docker exec investfacil-db pg_isready -U postgres
```

### 1.2 Backend (porta 8081 no host)

```powershell
cd C:\Users\gabri\InvestFacil\backend
$env:JAVA_HOME="C:\Users\gabri\.jdks\ms-21.0.12.1"
$env:JWT_SECRET=(Get-Content ..\_audit\dev-jwt-secret.txt -Raw).Trim()
$env:SPRING_PROFILES_ACTIVE="dev"
$env:PORT="8081"
$env:SPRING_DATASOURCE_URL="jdbc:postgresql://localhost:5433/investfacil"
$env:SPRING_DATASOURCE_USERNAME="postgres"
$env:SPRING_DATASOURCE_PASSWORD="local"
$env:APP_DEMO_ENABLED="true"
$env:DEMO_EMAIL="marina@investfacil.local"
$env:DEMO_PASSWORD="<defina-uma-senha-forte-local>"
$env:DEMO_NAME="Marina Lima"
$env:MAIL_ENABLED="false"
$env:MARKET_ENABLED="true"
$env:FRONTEND_BASE_URL="http://localhost:3000"
java -jar target\investfacil-api-0.1.0-SNAPSHOT.jar
```

Validar: `http://localhost:8081/actuator/health` → `UP`.

### 1.3 Frontend

```powershell
cd C:\Users\gabri\InvestFacil\frontend
$env:API_PROXY_TARGET="http://localhost:8081"
npm run dev
```

Abrir `http://localhost:3000` e deixar duas abas: landing e `/entrar`.

### 1.4 Checklist

- [ ] Health `UP` e Swagger `200`.
- [ ] Login demo funciona (faça um ensaio antes).
- [ ] Dashboard mostra próxima aula e XP.
- [ ] Simulador calcula e salva.
- [ ] Mercado carrega (ou mostra “referência estática”).
- [ ] Volume do sistema e notificações desligados.
- [ ] Zoom do navegador em 100%; janela 1440×900.
- [ ] Plano B aberto: `docs/DEMO_SCRIPT.md` e uma segunda aba com o backend local.

> **Nunca** apresente credenciais reais de produção. A conta demo é local e deve ser
> desabilitada/rotacionada após a final.

---

## 2. Roteiro cronometrado

### 0:00–0:40 — Abertura e problema

**Tela:** landing.

**Fala:**
> “A maioria dos brasileiros começa a investir sem entender o básico. O conteúdo
> disponível está fragmentado, em inglês ou misturado a promessas de ganho rápido.
> O Invest Fácil existe para resolver isso: um caminho claro, em português, para
> quem está começando — sem executar ordens e sem prometer retorno.”

Destacar: “Sem dinheiro real. Sem promessas. Conteúdo em português.”

### 0:40–1:20 — Entrar e dashboard

**Ação:** clicar em **Entrar**, usar a conta demo.

**Fala:**
> “A jornada é personalizada. O dashboard mostra a próxima missão, o XP, a sequência
> de estudos e o progresso por trilha.”

Mostrar: nível, XP, “próxima missão”, mercado informativo e o aviso de simulação.

### 1:20–3:20 — Aula e quiz

**Ação:** clicar em **Continuar missão** (ou em uma aula da trilha de Renda Fixa).

**Fala:**
> “As aulas são curtas, com texto claro e quiz. O vídeo é um complemento; quando
> não há vídeo publicado, a interface diz isso com honestidade.”

Rolar o conteúdo, mostrar o quiz. Responder corretamente (as respostas corretas
aparecem após o envio, não antes). Mostrar “Bom trabalho! 100%” e o XP.

**Ação:** clicar em **Marcar como concluída**. Mostrar o toast e o XP atualizado.

### 3:20–5:00 — Simulador

**Ação:** abrir **Simular**.

**Fala:**
> “Aqui o aprendizado vira prática, mas com dinheiro fictício. Capital inicial,
> aporte mensal, prazo, taxa hipotética e inflação. O gráfico mostra patrimônio,
> total investido e poder de compra.”

Usar: `R$ 1.000`, `R$ 200/mês`, `120 meses`, `8% a.a.`, inflação `4%`.
Mostrar: patrimônio final, juros, poder de compra, comparação 6/8/12% e o aviso.
Salvar o cenário e mostrar que ele aparece na lista.

### 5:00–6:00 — Progresso e gamificação

**Ação:** abrir **Progresso**.

**Fala:**
> “O XP é concedido por aprender: aula concluída e quiz aprovado. Não há recompensa
> por clicar ou por transacionar. As conquistas são marcos reais de estudo.”

Mostrar: média dos quizzes, aulas concluídas, sequência, domínio por tema,
histórico de XP e conquistas.

### 6:00–6:40 — Mercado com contexto

**Ação:** abrir **Mercado**.

**Fala:**
> “Cotações são contexto, não recomendação. Quando o provedor falha, a tela assume
> o fallback e diz que é referência estática. A plataforma não executa ordens nem
> custodia valores.”

### 6:40–7:40 — Segurança e arquitetura (para banca técnica)

**Ação:** abrir `http://localhost:8081/swagger-ui.html` e `http://localhost:8081/actuator/health`.

**Fala:**
> “Backend Spring Boot com PostgreSQL e Flyway. A API é fail-closed: sem token,
> retorna 401. O access token dura 15 minutos e fica em memória; o refresh é opaco,
> com hash no banco, rotação e detecção de reuso. MFA TOTP, verificação de e-mail,
> rate limit e RLS deny-by-default completam a defesa. O frontend passa por um proxy
> same-origin para o cookie ser first-party.”

Mostrar rapidamente o Swagger e o health. Não abrir telas de credenciais.

### 7:40–8:30 — Fechamento

**Fala:**
> “O produto está funcional localmente. O que falta para a final é deploy validado,
> vídeos reais no Supabase e ensaio. A arquitetura já está preparada para evoluir
> com IA educacional, sem tornar a IA uma dependência da entrega.”

Convidar para uma pergunta.

---

## 3. Plano B (falhas durante a demo)

| Falha | Ação imediata | Fala |
|---|---|---|
| Mercado sem internet | Continuar; a UI mostra “referência estática” | “O fallback é explícito — não fingimos dado ao vivo.” |
| Vídeo 404 | Continuar no texto | “Vídeo é complemento; o conteúdo está no texto.” |
| Backend caiu | Reiniciar o jar; se não voltar, usar a segunda aba já carregada | “Vou reiniciar o serviço local.” |
| Login falha | Verificar se o backend está de pé e se `DEMO_PASSWORD` é o mesmo do processo | “A conta demo é local; vou reiniciar e entrar.” |
| Frontend não compila | Usar a build de produção (`npm run build && npm start`) | — |
| Projetor pequeno | Aumentar zoom para 110% e usar a sidebar recolhida | — |

**Nunca** improvise dados de produção, usuários ou métricas. Se algo não estiver
funcionando, diga e mostre o fallback.

---

## 4. Perguntas prováveis da banca

**“Isso é só um curso?”**
> Não. É uma jornada com progresso, quizzes, simulador, gamificação e integração
> real com API. O diferencial é o caminho estruturado e a honestidade sobre risco.

**“Como vocês ganham dinheiro?”**
> O MVP não tem receita. As opções são assinatura para trilhas avançadas, parceria
> com instituições de educação e conteúdo patrocinado com transparência — nunca
> recomendação de ativo. A prioridade agora é validar aprendizado.

**“Como garantem que o conteúdo não é recomendação?”**
> Disclaimer em todas as telas de mercado/simulador, conteúdo sem ativo específico
> como “compre”, e a plataforma não executa ordens. Revisão editorial é obrigatória.

**“E a IA?”**
> A arquitetura está preparada para um tutor comportamental, mas a entrega principal
> não depende dela. Preferimos um produto estável e auditável a uma demo frágil.

**“Qual foi o maior desafio técnico?”**
> Segurança de sessão: refresh com rotação/reuso, cookie first-party via proxy,
> MFA e RLS. Foram implementados e cobertos por testes, não apenas desenhados.

**“O que falta?”**
> Deploy validado, credenciais Supabase/Resend, vídeos reais e ensaio. O código e o
> runbook estão prontos; os bloqueios são externos e estão documentados.

---

## 5. Pós-demo

- [ ] Encerrar backend/frontend.
- [ ] Rotacionar a senha demo ou desabilitar a conta.
- [ ] Registrar horário, falhas e impressões do ensaio.
- [ ] Atualizar `docs/PROGRESSO_GERAL.md`.
