# FIREBASE — AVALIAÇÃO PARA O INVEST FÁCIL

**Data:** 20/11/2026
**Escopo:** avaliar Firebase Spark/Blaze como complemento — sem migrar PostgreSQL,
sem substituir o auth próprio e sem reescrever a aplicação.
**Veredito curto:** **não integrar Firebase no MVP**. O ganho não compensa o custo
de complexidade, e o Firebase Storage exige o plano Blaze (cartão). A arquitetura
atual (Supabase PostgreSQL + Storage, Spring Boot e Next.js/Vercel) continua sendo
a melhor relação custo/risco para a final.

---

## 1. Fatos verificados (fontes oficiais, 20/11/2026)

| Serviço | Spark (grátis, sem cartão) | Blaze (pagamento por uso) | Observação |
|---|---|---|---|
| **Hosting** | 10 GB armazenados; **360 MB/dia** de transferência; domínio/SSL; múltiplos sites | 10 GB + US$ 0,026/GB; transferência US$ 0,15/GB | Spark serve **estático**; Next.js com SSR/rotas dinâmicas precisa de Functions/App Hosting (Blaze) ou export estático |
| **Authentication** | Até **50 mil MAU** (Identity Platform); Phone Auth não incluso no Spark | 50 mil MAU inclusos; depois preço do Identity Platform | Duplicaria o auth atual (JWT/refresh/MFA/Postgres) |
| **Cloud Storage** | **Não disponível** — o guia oficial exige Blaze | 5 GB-mês sem custo (somente `us-central1`, `us-west1`, `us-east1`); 100 GB/mês de download; 5 mil uploads/mês; 50 mil downloads/mês | Exige cartão; risco de billing |
| **Analytics** | Sem custo | Sem custo | Exige consentimento/LGPD e projeto Firebase |
| **App Check** | Sem custo, sujeito a quotas do provedor | Sem custo, sujeito a quotas | Útil para proteger SDKs Firebase; nossa API é Spring e já tem rate limit/auth |
| **Crashlytics** | Sem custo **apenas apps mobile** | Sem custo para mobile | **Não existe para web**; para Next.js usar Sentry/Cloud Logging |
| **Firestore** | 1 GiB, 50 mil leituras/dia, 20 mil writes/dia | Pagamento por uso | Não usar: PostgreSQL é a fonte de verdade |
| **Cloud Functions** | Não disponível | 2 milhões de invocações/mês | Necessário para SSR no Firebase Hosting tradicional |

Fontes:

- Firebase Pricing: <https://firebase.google.com/pricing> (acessado em 20/11/2026)
- Cloud Storage for Firebase — “Before you begin” (exige Blaze):
  <https://firebase.google.com/docs/storage/web/start#before-you-begin>
- Supabase Pricing: <https://supabase.com/pricing> (acessado em 20/11/2026)
- Crashlytics (mobile): <https://firebase.google.com/docs/crashlytics>

---

## 2. Comparação: Firebase Storage × Supabase Storage

| Critério | Firebase Storage | Supabase Storage | Impacto no Invest Fácil |
|---|---|---|---|
| Plano gratuito real | **Não há** no Spark; exige Blaze e cartão | 1 GB armazenado; 5 GB egress + 5 GB cached egress; sem cartão | Supabase vence no custo zero |
| Limite por arquivo | Depende do bucket/regras; no Blaze, sem limite rígido | **50 MB por arquivo no Free**; 500 GB no Pro | Ajustamos o upload para **50 MB** (configurável) |
| Armazenamento incluso | 5 GB-mês no Blaze (3 regiões dos EUA) | 1 GB no Free; 100 GB no Pro | 31 aulas em vídeos curtos cabem em 1 GB se comprimidos |
| Download/egress | 100 GB/mês no Blaze (3 regiões) | 5 GB + 5 GB cached no Free | Para audiência pequena, 5 GB basta; para escala, avaliar |
| Segurança | Rules + App Check; service account | Bucket privado + RLS/policies + URL assinada | Já implementamos bucket privado + URL assinada |
| Integração com o backend | Admin SDK/Google Cloud credentials | REST + service role key (já implementado) | Supabase já está codificado e testável |
| Custo de migração | Novo SDK, novas regras, nova configuração | zero | Evita retrabalho |
| Risco de billing | **Alto** (Blaze cobra excedente; cartão obrigatório) | Baixo no Free; Pro tem spend cap | Sem cartão no MVP |
| Bloqueio/limitação | Projeto pode exigir cartão para Storage | Projetos Free pausam após 1 semana sem uso | Aquecer antes da demo; documentado |

**Conclusão:** para o MVP, **Supabase Storage**. Firebase Storage só faria sentido
se o egress gratuito do Supabase fosse insuficiente e houvesse orçamento/cartão
aprovado para Blaze. Não é o caso agora.

> Correção de integração: o backend validava 150 MB, acima do limite de 50 MB do
> Supabase Free. O limite padrão foi ajustado para **50 MB** (`VIDEO_MAX_UPLOAD_BYTES`)
> e o multipart para 55 MB; em Supabase Pro pode ser elevado por env.

---

## 3. Comparação: hospedagem

| Opção | Prós | Contras | Decisão |
|---|---|---|---|
| **Vercel (já planejado)** | Suporte nativo a Next.js 16, previews, rewrite `/api`, HTTPS, plano hobby | Limites de uso; dependência de fornecedor | **Manter** |
| Firebase Hosting Spark | Grátis, CDN, domínio/SSL, 10 GB | 360 MB/dia; só estático; SSR exige Functions/Blaze | Não usar |
| Firebase App Hosting | Integra Next.js, CDN, escala | Exige billing/Blaze; configuração extra | Não usar no MVP |
| Render estático | Já usado para API; simples | Não é o melhor host para Next SSR; custo/limites | Não usar |

O frontend tem rotas dinâmicas de aula/artigo e rewrite `/api` para manter o cookie
first-party. Um `next export` estático exigiria pré-gerar todas as rotas e perderia
o proxy; qualquer conteúdo novo exigiria rebuild. **Vercel é a opção correta.**

---

## 4. Serviço por serviço

### 4.1 Firebase Authentication — **não migrar**

- O Invest Fácil já tem cadastro, verificação de e-mail, login, JWT 15 min,
  refresh rotativo com detecção de reuso, MFA TOTP, reset, sessões e RBAC.
- Migrar para Firebase Auth exigiria:
  - mover usuários e hashes (ou forçar reset de senha);
  - reimplementar vínculo com `users`/PostgreSQL;
  - substituir refresh/MFA/revogação por SDK Firebase;
  - reescrever testes e fluxos de segurança.
- Ganho: login social e telefone (pago). **Não é prioridade** para a final.
- Decisão: manter auth própria; avaliar login social como evolução isolada, com
  vínculo de identidade e migração planejada.

### 4.2 Firebase Analytics — **opcional, não agora**

- Sem custo, mas exige projeto Firebase, SDK/gtag e **consentimento** (LGPD).
- Métricas úteis: conclusão de aula, início de quiz, uso do simulador, retenção.
- Risco: adicionar SDK no frontend aumenta JS, cookies/consentimento e superfície
  de privacidade sem tempo de validar.
- Decisão: manter instrumentação mínima atual (logs/actuator) e planejar eventos
  com consentimento para depois da final.

### 4.3 Firebase App Check — **não necessário no MVP**

- Protege SDKs Firebase contra abuso; nossa API é Spring Boot e já tem JWT,
  rate limit e CORS.
- Para usar no backend, seria preciso validar tokens do App Check com Firebase
  Admin SDK e configurar provedores (reCAPTCHA), adicionando falhas e latência.
- Não há chamadas diretas do frontend ao Storage (o backend faz upload/URL assinada).
- Decisão: não integrar.

### 4.4 Crashlytics — **não aplicável**

- Crashlytics é para **Android/iOS**, não para web/Next.js. A documentação de
  preços lista “Web apps: not applicable”.
- Para o frontend, usar Sentry (free tier) ou logs do Vercel/Render; para o
  backend, Actuator/logs e, futuramente, OpenTelemetry.
- Decisão: não integrar; registrar como alternativa para um app mobile futuro.

### 4.5 Firestore — **não usar**

- PostgreSQL é a fonte de verdade; Firestore duplicaria dados e criaria dois
  modelos de consistência. A missão proíbe migrar PostgreSQL para Firestore.

---

## 5. Custos e riscos de billing

| Cenário | Custo | Risco |
|---|---|---|
| Firebase Spark (Hosting/Analytics/App Check) | R$ 0 | Storage indisponível; Hosting 360 MB/dia; sem SSR |
| Firebase Blaze (Storage + Functions) | Pode ser R$ 0 dentro das quotas, mas **exige cartão** | Excedente cobra automaticamente; egress/storage podem surpreender |
| Supabase Free (atual) | R$ 0 | 1 GB storage, 5 GB egress, 50 MB/arquivo, pausa após 1 semana |
| Supabase Pro | US$ 25/mês + uso | Sem pausa, 100 GB storage/250 GB egress; spend cap |

**Não habilitamos Blaze, não associamos cartão e não criamos projeto Firebase.**
Qualquer mudança futura exige autorização explícita do proprietário.

---

## 6. Recomendação final

1. **Manter** PostgreSQL/Supabase como banco e Storage.
2. **Manter** Spring Boot como única API e auth própria.
3. **Manter** Vercel para o Next.js; Render para a API.
4. **Não adicionar** Firebase Auth, Firestore, Storage, App Check ou Crashlytics
   nesta fase.
5. **Opcional pós-final:** Analytics com consentimento e Sentry para erros web;
   Firebase Storage apenas se o egress do Supabase for comprovadamente o gargalo
   e houver orçamento/cartão aprovado.
6. **Documentar** no pitch que a arquitetura é deliberadamente enxuta: um banco,
   um backend, um frontend — sem duplicar identidade ou dados.

---

## 7. O que foi testado nesta missão

- Consulta às páginas oficiais de preços e ao guia de Storage (fonte citada).
- Confirmação de que **Firebase Storage não está disponível no Spark**.
- Confirmação de que **Crashlytics não cobre web**.
- Comparação com os limites atuais do Supabase Free e ajuste do limite de upload
  do backend para 50 MB.
- Nenhum projeto Firebase foi criado; nenhum cartão foi associado; nenhum SDK
  Firebase foi instalado.

## 8. Próximos passos (se o proprietário quiser Firebase depois)

1. Criar projeto Firebase e definir região `southamerica-east1` (se disponível)
   ou `us-central1` para as quotas de Storage.
2. Avaliar custo de egress com uma estimativa real de aulas/vídeos.
3. Se aprovado, habilitar Blaze com **budget alerts** e spend cap.
4. Implementar um `VideoStorage` alternativo no backend (interface), sem alterar
   o domínio de vídeos.
5. Migrar objetos existentes e manter URLs assinadas.
6. Testar upload/download e rollback antes de trocar o provedor.
