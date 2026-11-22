# S1 — Conectividade e topologia de rede

**Projeto:** Invest Fácil
**Supabase remoto:** não conectado
**Status externo:** `NOT TESTED — EXTERNAL CONNECTIVITY`

---

## 1. Modos de conexão

| Modo | Uso recomendado | Observações |
|---|---|---|
| Conexão direta (5432) | Flyway/DDL e administração | costuma ser IPv6 no Supabase; validar egress do Render |
| Session pooler | runtime e, se necessário, Flyway | mantém sessão; mais compatível com JDBC/prepared statements |
| Transaction pooler (6543) | runtime de aplicação | **não recomendado para Flyway/DDL**; prepared statements podem exigir `prepareThreshold=0` |

O projeto usa Spring Boot + HikariCP + JDBC. O pool pode reciclar conexões; por isso o runtime usa membership `INHERIT`, não `SET ROLE` de sessão.

---

## 2. Separação de conexões

| Finalidade | Variáveis Spring | Identidade esperada |
|---|---|---|
| Datasource da aplicação | `SPRING_DATASOURCE_URL/USERNAME/PASSWORD` | `investfacil_runtime` |
| Flyway | `SPRING_FLYWAY_URL/USER/PASSWORD` | `investfacil_migrate` |
| Administração/bootstrap | SQL Editor/painel | `postgres`/owner |

O perfil `prod` exige as três variáveis de Flyway; sem elas o startup falha com `Could not resolve placeholder 'SPRING_FLYWAY_URL'`.

---

## 3. SSL

- O Supabase exige TLS.
- As URLs de exemplo do projeto não incluem `sslmode`; isso foi apontado na S0.
- Recomendação para o futuro: usar `?sslmode=require` (ou `verify-full` com CA apropriada) nas URLs JDBC.
- **Não testado** localmente contra Supabase; o PostgreSQL de teste local não usa TLS.

---

## 4. IPv4/IPv6 e pooler

- A conexão direta do Supabase pode ser IPv6-only; o Render pode não ter egress IPv6.
- O pooler Supabase oferece IPv4; a escolha entre direct/session/transaction precisa ser validada no ambiente real.
- Flyway não deve usar transaction pooler para DDL.
- Para o runtime, se o pooler for transaction mode, testar `prepareThreshold=0` no driver JDBC.
- Hikari `maximum-pool-size=5` é conservador; o pooler pode multiplicar conexões por instância. Ajustar após medição.

**Nenhum teste de DNS, IPv4/IPv6, TLS, timeout ou pooler remoto foi executado.**

---

## 5. Região

| Componente | Região |
|---|---|
| Supabase (briefing) | `sa-east-1` |
| Render (`render.yaml`) | `oregon` |

Impacto provável: latência adicional por query e maior risco de timeouts em operações com muitas consultas (seed, dashboard, quiz). Não foi medida latência real.

Recomendação: medir antes de decidir; considerar região do Render mais próxima ou projeto Supabase em região próxima, sem alterar nada nesta missão.

---

## 6. Testes locais executados

| Teste | Resultado |
|---|---|
| App + PostgreSQL local via `127.0.0.1:55434` | OK |
| Flyway como `investfacil_migrate` | OK |
| App como `investfacil_runtime` | OK |
| Senha runtime via scram (IP de bridge) | OK; senha errada rejeitada |
| Senha migration via scram | não testada; o loopback local usa trust |
| SSL | não testado |
| Pooler | não testado |
| IPv6 | não testado |
| Egress Render | não testado; nenhum deploy |

---

## 7. Conclusão

A conectividade local está comprovada. A conectividade externa com Supabase permanece **NÃO TESTADA** e não deve ser declarada operacional. O modelo de conexão recomendado é:

- Flyway: conexão direta ou session pooler, com identidade de migration;
- runtime: pooler compatível com JDBC/Hikari, com identidade runtime;
- TLS explícito;
- região definida após medição.

Nenhuma conexão remota foi tentada.
