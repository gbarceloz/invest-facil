# Onboarding conversacional

O cadastro tradicional foi substituído por um onboarding curto com a Fina, a
raposa do Invest Fácil. O fluxo coleta o mínimo necessário para montar um plano
pessoal, calcula um índice educativo no backend e só então pede autenticação
para persistir o perfil e revelar o dashboard.

## Fluxo

São **7 perguntas + perfil pronto + vínculo de conta**:

1. Nome
2. Objetivos (multi-escolha)
3. Situações financeiras (multi-escolha)
4. Quanto sobra para guardar por mês (opcional)
5. Reserva de emergência e dívidas com juros altos (inclui “Não tenho dívidas”)
6. Preferência de aprendizado e nível de conhecimento
7. Dias e horário de estudo

Depois da pergunta 7: cálculo no servidor e tela **“Seu perfil está pronto”**,
com o índice e uma revisão opcional das respostas. A **etapa 8** é o vínculo
obrigatório de conta: o usuário vê Google e e-mail; se já estiver logado, pode
continuar com a conta atual ou usar outra conta. Só depois da confirmação de
persistência o dashboard é revelado.

### Verificação de persistência

O cliente não confia apenas no `PUT`. Depois de salvar, chama
`GET /api/v1/onboarding/me` e só navega para o dashboard quando:

- `completed = true`;
- `health` existe;
- o score confirmado é igual ao score calculado exibido antes do vínculo.

Se a confirmação falhar, a etapa 8 mostra erro e o dashboard não abre. O
`OnboardingIntegrationTest` cobre o mesmo caminho no backend (PUT → GET →
score/answers persistidos).

Os gatilhos de gasto permanecem no modelo (default `["NONE"]`), mas deixaram de
ser uma pergunta para encurtar o fluxo.

- Entrada: `/comecar`
- CTA da home: **Começar agora** (`/comecar`)
- Login existente: `/entrar`
- `/cadastro` redireciona para `/comecar` para não quebrar links antigos.
- O rascunho fica em `localStorage` (`investfacil:onboarding:draft:v1`) e
  sobrevive a recarregamentos. `?reset=1` limpa o rascunho.

## API

| Método | Rota | Autenticação | Descrição |
| --- | --- | --- | --- |
| `POST` | `/api/v1/onboarding/estimate` | pública | Valida as respostas e devolve o índice sem persistir. |
| `GET` | `/api/v1/onboarding/me` | JWT | Perfil do usuário; `completed: false` quando ainda não existe. |
| `PUT` | `/api/v1/onboarding/me` | JWT | Cria/atualiza o perfil, recalcula o índice e atualiza o nome. |

`goals` e `financialSituations` são listas multi-escolha; `goal` e
`financialSituation` continuam no contrato como a primeira escolha (coluna
singular de compatibilidade). O cliente nunca envia nota, faixa, oportunidade ou
valores derivados. O backend recalcula tudo a partir das respostas e grava
apenas o necessário.

## Modelo de dados

Migrations `V11__onboarding_profiles.sql` e
`V12__onboarding_multi_choice.sql`, tabela
`investfacil.onboarding_profiles`:

- `user_id` é a chave primária e referencia `users` com `ON DELETE CASCADE`.
- Respostas obrigatórias: objetivo(s), situação(ões), reserva, dívidas,
  aprendizado, conhecimento, dias e horário. `spending_triggers` permanece no
  contrato com default `["NONE"]` (o fluxo curto não pergunta mais os gatilhos).
- Valores monetários em centavos (`bigint`), nulos quando a pessoa escolhe não
  informar. O fluxo curto pergunta apenas a sobra mensal; renda e despesas
  ficam nulas e não são usadas no cálculo.
- `goals`, `financial_situations`, `spending_triggers` e `study_days` são
  `jsonb` (arrays de strings). As colunas singulares guardam a primeira escolha
  para compatibilidade.
- Indicadores persistidos para auditoria: `health_score`, `health_band`,
  `opportunity`, `recommendation`, `monthly_savings_goal_cents`,
  `emergency_fund_goal_cents`.

RLS:

- `ENABLE` + `FORCE ROW LEVEL SECURITY`.
- `SELECT`, `INSERT` e `UPDATE` apenas quando
  `user_id = investfacil.current_user_id()`.
- `DELETE` não é concedido ao runtime.
- `investfacil_migrate` tem policy própria de migração.
- O `DatabaseSecurityGuard` passou a exigir a tabela, as três policies de
  aplicação, a policy de migração e a contagem de policies.

## Índice educativo de saúde financeira

Determinístico, documentado e testado em
`FinancialHealthCalculatorTest`. Não é nota de crédito, recomendação de
investimento nem promessa de retorno.

Quatro pilares, com pesos fixos:

| Pilar | Peso | Regra |
| --- | --- | --- |
| Reserva de emergência | 30 | sem reserva 0; <1 mês 6; 1–3 meses 15; 3–6 meses 24; >6 meses 30 |
| Dívidas caras | 25 | nenhuma 25; empréstimos 12; cartão 6; cheque especial 4; várias 0 |
| Capacidade de poupar | 25 | com renda: ≥20% 25; ≥10% 20; ≥5% 14; >0% 8; 0% 0. Sem renda: separa valor >0 → 12; zero → 0 |
| Despesas essenciais | 20 | ≤50% da renda 20; ≤70% 15; ≤85% 8; ≤100% 4; >100% 0 |

- “Prefiro não informar” não vira zero: o pilar sai do denominador.
- A nota é `round(pontos × 100 / peso dos pilares respondidos)`.
- Sem nenhum pilar respondido, a nota é `null` e a faixa é `SEM_DADOS`.
- Faixas: 0–39 `ATENCAO`, 40–59 `CONSTRUINDO`, 60–79 `ORGANIZANDO`,
  80–100 `CONSOLIDADO`.
- O fluxo curto pergunta apenas a sobra mensal. Sem renda, a capacidade de
  poupar entra com 12/25 e o detalhe explica que falta a renda para medir a
  proporção; despesas essenciais ficam sem resposta e saem do denominador.
- Na interface, o pilar de dívidas aparece como **“Sem dívidas”** em verde
  quando a resposta é `NONE`; os demais estados mostram o tipo de dívida. A
  recomendação de reserva reconhece explicitamente quem não tem dívidas.
- Economia mensal: usa a capacidade de poupança informada; se ausente, deriva
  de `renda - despesas essenciais` quando esses dados existirem.
- Meta de reserva: `6 × despesas essenciais` quando as despesas existem; no
  fluxo curto pode ficar `null`.

Prioridade da oportunidade (determinística):

1. Cartão, cheque especial ou várias dívidas → `QUITAR_DIVIDA`
2. Sem reserva ou menos de 1 mês → `MONTAR_RESERVA`
3. Poupança abaixo de 10% da renda, quando a renda é conhecida →
   `AUMENTAR_POUPANCA`
4. Conhecimento zero/básico → `APRENDER_BASE`
5. Caso contrário → `INVESTIR_COM_CRITERIO`

## Dashboard

`/app` usa dados reais do backend:

- `GET /api/v1/onboarding/me` para economia mensal, meta de reserva, índice,
  fatores e recomendação.
- `GET /api/v1/gamification/summary` para XP, streak e fichas.
- `GET /api/v1/progress/summary` para próxima aula e timeline por categoria.
- `GET /api/v1/bitcoin/market` para o cartão de mercado (quando habilitado).

`?revelar=1` ativa a entrada animada depois do onboarding; o parâmetro é
removido do histórico após a animação. `prefers-reduced-motion` desliga
typewriter, contagem e animações de entrada.

## Autenticação e verificação de e-mail

- Google usa o Google Identity Services e a validação JWKS já existente
  (`/api/v1/auth/google`).
- E-mail usa `/api/v1/auth/register` + `/api/v1/auth/login`; quando o backend
  devolve `devVerificationToken` (apenas em ambiente de desenvolvimento), o
  onboarding chama `/api/v1/auth/verify-email` antes do login.
- Não existe um segundo sistema de autenticação: o onboarding reutiliza JWT,
  refresh cookie e MFA existentes.

O cadastro por e-mail cria a conta com `verified=false`, emite o token oficial
de confirmação (24 h) e chama `EmailService.sendVerification`
(`/auth/verify-email`). O onboarding confirma automaticamente quando o backend
devolve `devVerificationToken` (apenas em desenvolvimento). Em produção, o
link depende de `MAIL_ENABLED`/`RESEND_API_KEY`; enquanto o provedor não estiver
configurado, o login continua liberado (decisão da V9) e a conta permanece
`verified=false`. Nenhum token cru é registrado em logs de produção.

## Testes

```bash
# Backend: unidade + integração com PostgreSQL real
cd backend
mvn test

# Frontend: unidade, typecheck e build
cd frontend
npm test
npm run typecheck
npm run build

# E2E (Docker + backend + frontend)
npm run e2e
```

Cobertura específica:

- `FinancialHealthCalculatorTest`: faixas, pesos, normalização, derivação de
  economia e meta, prioridade de oportunidade.
- `OnboardingIntegrationTest`: estimativa pública, persistência, atualização,
  validação e isolamento entre dois usuários.
- `RlsIsolationIntegrationTest`: policies de onboarding com o role runtime.
- `e2e/onboarding.spec.ts`: fluxo completo até o dashboard, persistência,
  logout e novo login.
