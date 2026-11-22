# S2.0 — Matriz de conectividade e SSL

**Projeto:** Invest Fácil
**Data:** 2026-11-22
**Status remoto:** `NOT TESTED — EXTERNAL CONNECTIVITY`

---

## 1. Documentação oficial consultada

Acessada em 2026-11-22:

- https://supabase.com/docs/guides/database/connecting-to-postgres
- https://supabase.com/docs/guides/database/connecting-to-postgres/pooling-and-limits
- https://supabase.com/docs/guides/platform/ipv4-address
- https://supabase.com/docs/guides/platform/network-restrictions
- https://supabase.com/changelog

Fatos relevantes confirmados na documentação atual:

1. A conexão **direta** usa `db.[PROJECT-REF].supabase.co:5432` e é **IPv6 por padrão**; fica IPv4 somente com o add-on IPv4 (Pro+).
2. O **shared pooler session mode** é **IPv4 em todos os planos**, porta **5432**, host `aws-[INDEX]-[REGION].pooler.supabase.com`. O host/índice deve vir do Dashboard, não ser montado pela região.
3. O **shared pooler transaction mode** usa porta **6543**, é IPv4, não suporta prepared statements e perde estado de sessão; não é adequado para Flyway/DDL.
4. O **dedicated pooler** é Pro+, transaction mode, IPv6 ou IPv4 com add-on; não é o caminho padrão deste MVP.
5. Usuário no pooler compartilhado: `postgres.[PROJECT-REF]` para o role `postgres`; para custom role, `[ROLE].[PROJECT-REF]`.
6. Migrations/`pg_dump`/backup são recomendados via conexão direta; em rede IPv4-only, a alternativa sem add-on pago é o shared session pooler, mas a compatibilidade do Flyway precisa ser comprovada.
7. SSL: `sslmode=require` é o mínimo; `verify-full` + certificado raiz é necessário para verificar o servidor. O default de muitos drivers é `prefer`, que pode cair para texto.
8. Network restrictions aplicam-se a Postgres e ao pooler; exigem CIDRs IPv4/IPv6 e podem bloquear o Render se o egress não estiver allowlisted.
9. A documentação lista **Render** entre as plataformas IPv4-only.
10. Changelog: o CLI v3 é local por padrão e confirma mudanças hospedadas; a sessão do pooler usa 5432 (a antiga sessão em 6543 foi descontinuada). O CLI instalado é 3.2.0 e não foi usado para acesso remoto.

---

## 2. Matriz por modo

| Modo | Host/porta | IP | Uso no Invest Fácil | Flyway | Runtime | Estado |
|---|---|---|---|---|---|---|
| Direct | `db.[ref].supabase.co:5432` | IPv6 (ou IPv4 com add-on) | backend persistente | Recomendado pela doc | Sim | **NOT TESTED**; Render IPv4-only sem add-on não alcança |
| Shared session pooler | `aws-[index]-[region].pooler.supabase.com:5432` | IPv4 | Render IPv4-only | **A testar**; session state/prepared statements suportados | Sim | **NOT TESTED** |
| Shared transaction pooler | `aws-[index]-[region].pooler.supabase.com:6543` | IPv4 | serverless | **Não recomendado** | Sim, com `prepareThreshold=0` | **NOT TESTED** |
| Dedicated pooler | `db.[ref].supabase.co:6543` | IPv6/add-on | Pro+ | Não recomendado para DDL | Sim | Não aplicável ao plano atual |

Para custom roles no shared pooler, o username seria `investfacil_runtime.[ref]` / `investfacil_migrate.[ref]`; o valor exato deve vir do Dashboard. Nenhum host foi montado manualmente.

---

## 3. Render

A documentação oficial lista Render como IPv4-only. Portanto:

- conexão direta sem IPv4 add-on **não é compatível** com Render;
- shared session pooler (IPv4) é o caminho sem custo adicional;
- transaction pooler não deve ser usado para Flyway;
- não foi feito deploy nem teste de egress a partir do Render;
- não foi habilitado IPv4 add-on pago.

**Conclusão Render:** `NOT TESTED — EXTERNAL CONNECTIVITY`.

---

## 4. SSL

| Item | Situação |
|---|---|
| TLS obrigatório no Supabase | Sim, conforme documentação |
| `sslmode=require` | recomendado como mínimo; não configurado no projeto |
| `verify-full` + CA raiz | recomendado para verificação; certificado deve ser obtido no Dashboard |
| Driver JDBC | suporta `sslmode`; configuração não foi testada contra Supabase |
| URLs de exemplo do projeto | não incluem SSL; precisam ser ajustadas na execução futura |

Nenhuma URL completa ou senha foi registrada.

---

## 5. Network restrictions

- A allowlist do Supabase aplica-se ao Postgres e ao pooler.
- O Render precisaria de egress IPv4 estável/allowlisted; a documentação do Render deve ser consultada antes.
- Nenhuma restrição de rede foi criada ou alterada.
- Não foi assumido que o IP local representa o IP do Render.

---

## 6. Pooler e prepared statements

- Shared transaction pooler: prepared statements não suportados; JDBC `prepareThreshold=0`.
- Shared session pooler: suporta estado de sessão e prepared statements; é o candidato para runtime no Render IPv4-only.
- Flyway usa transações e advisory locks; a compatibilidade com session pooler precisa ser testada em ambiente descartável. Não foi testada.
- Hikari `maximum-pool-size=5` é conservador, mas o pooler pode multiplicar conexões; medir no ambiente real.

---

## 7. Região

| Componente | Região |
|---|---|
| Supabase (briefing) | `sa-east-1` |
| Render (`render.yaml`) | `oregon` |

Latência não medida. A diferença de região pode afetar dashboard, seed e quiz; não é bloqueador de compatibilidade, mas é risco de performance.

---

## 8. Classificação final

**`NOT TESTED — EXTERNAL CONNECTIVITY`**

Nenhuma conexão de banco, DNS, TLS, pooler ou IPv6 foi executada. A matriz é baseada em documentação oficial, não em teste empírico. O caminho provável para o Render é o shared session pooler; o Flyway via session pooler precisa de validação em S2.1.
