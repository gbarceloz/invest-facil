# Login e cadastro com Google

O Invest Fácil usa Google Identity Services (ID token) no frontend e valida o
token no backend com o JWKS público do Google. Não é necessário client secret
para este fluxo; basta um **OAuth Client ID** do tipo **Web application**.

## 1. Criar o Client ID (gratuito)

1. Abra `https://console.cloud.google.com/` e crie/selecione um projeto.
2. Em **APIs e serviços → Tela de consentimento OAuth**, configure:
   - tipo **Externo**;
   - nome do app: `Invest Fácil`;
   - e-mail de suporte;
   - escopos básicos `openid`, `email`, `profile`.
3. Em **Credenciais → Criar credenciais → ID do cliente OAuth**:
   - tipo **Aplicativo da Web**;
   - **Origens JavaScript autorizadas**:
     - `https://invest-facil-beige.vercel.app`
     - `http://localhost:3000` (desenvolvimento)
4. Copie o Client ID (`...apps.googleusercontent.com`).

Não é preciso configurar URI de redirecionamento para o botão GIS; o fluxo
retorna o ID token diretamente ao navegador.

O Client ID público configurado neste projeto é:

```text
13778080906-ijof2kbic70817sngcs783ga24b7pgqf.apps.googleusercontent.com
```

Ele está como fallback em `frontend/components/google-signin.tsx` e
`backend/src/main/resources/application.yml`. As variáveis de ambiente
`NEXT_PUBLIC_GOOGLE_CLIENT_ID` e `GOOGLE_CLIENT_ID` continuam tendo prioridade
e podem ser usadas para trocar de projeto sem alterar o código.

## 2. Configurar os deploys

**Vercel** (Production e Preview):

```text
NEXT_PUBLIC_GOOGLE_CLIENT_ID=<client-id>.apps.googleusercontent.com
```

**Render** (serviço da API):

```text
GOOGLE_CLIENT_ID=<o-mesmo-client-id>.apps.googleusercontent.com
```

Depois de salvar, redeploye os dois serviços. O botão “Continuar com Google”
aparece automaticamente em `/entrar` e `/cadastro` quando o Client ID do
frontend está presente; o backend valida `aud` contra o Client ID configurado.

## 3. Comportamento

- O e-mail do ID token precisa vir com `email_verified=true` do Google.
- Se já existir uma conta local com o mesmo e-mail, ela é vinculada ao `sub`
  do Google; se não existir, a conta é criada já verificada.
- A conta Google não recebe senha local utilizável; um reset posterior pode
  definir uma senha se o usuário quiser entrar também por e-mail.
- Sem `GOOGLE_CLIENT_ID`, o endpoint responde `503 GOOGLE_NOT_CONFIGURED` e o
  botão não é renderizado. O login por e-mail continua funcionando.

## 4. Cadastro por e-mail

O cadastro por e-mail não envia mensagem e não exige confirmação. A conta já
nasce `verified=true`; o usuário entra imediatamente com e-mail e senha. O
Resend deixa de ser necessário para o fluxo principal.
