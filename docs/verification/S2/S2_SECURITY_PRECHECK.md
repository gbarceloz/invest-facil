# S2.0 — Precheck de segurança remota

**Projeto:** Invest Fácil
**Data:** 2026-11-22
**Status:** `REMOTE TARGET NOT DESIGNATED`
**Consultas SQL realizadas:** nenhuma
**Alterações remotas:** nenhuma

---

## 1. Projeto principal

`fvsofuwgdurrzipqfwyg` está protegido.

- Nenhuma conexão de banco.
- Nenhuma consulta a `pg_roles`, `pg_policies`, `pg_class` ou tabelas.
- Nenhuma chamada de Management API para esse projeto.
- Nenhum `supabase projects list`/`link`/`db` remoto.
- Nenhuma role, schema, grant, policy, migration ou seed.

O identificador aparece apenas em relatórios S0 já existentes.

---

## 2. Estado de credenciais

Apenas presença/ausência foi verificada; nenhum valor foi lido ou impresso.

| Credencial/variável | Estado |
|---|---|
| `S2_TARGET_PROJECT_REF` | ABSENT |
| `S2_TARGET_PROJECT_REGION` | ABSENT |
| `S2_DISPOSABLE_PROJECT_CONFIRMED` | ABSENT |
| `S2_REMOTE_WRITE_APPROVED` | ABSENT |
| `SUPABASE_URL` | ABSENT |
| `SUPABASE_ACCESS_TOKEN` | ABSENT |
| `SUPABASE_DB_PASSWORD` | ABSENT |
| `DATABASE_URL` | ABSENT |
| `SPRING_DATASOURCE_URL` | ABSENT |

Nenhum `.env` real foi encontrado; apenas `.env.example`.

---

## 3. O que não pode ser afirmado

Sem um alvo designado, não é possível validar:

- roles existentes no Supabase (`postgres`, `anon`, `authenticated`, custom roles);
- ownership do schema `investfacil`;
- existência/ausência de tabelas;
- grants e policies;
- funções e `SECURITY DEFINER`;
- schema exposto pela Data API;
- permissões de `anon`/`authenticated`;
- network restrictions/allowlists;
- backups/PITR;
- SSL/pooler/IPv4/IPv6;
- privilégios efetivos do runtime e da migration identity no ambiente remoto.

**Não inferir que o projeto está limpo porque o Dashboard mostra `public` vazio.** O schema `investfacil`, roles e grants precisam ser verificados em S2.1.

---

## 4. Estado de segurança conhecido (local/S1)

| Item | Estado |
|---|---|
| Runtime/migration separados | Validado em PostgreSQL 17 local |
| `NOINHERIT` | Corrigido para `INHERIT` nos scripts |
| Runtime sem DDL/create role | Validado localmente |
| Runtime sem acesso a `flyway_schema_history` | Validado localmente |
| Append-only | V5 + grants; owner não testado como runtime |
| RLS per-user | **NÃO IMPLEMENTADO**; `USING (true)` |
| `FORCE RLS` | Não habilitado |
| Access token após logout | Até 15 min; pendente |
| Rate limit | Em memória; pendente |
| Storage | Bucket/limites não validados remotamente |

A validação local não prova o estado remoto.

---

## 5. Riscos do ambiente remoto

| Risco | Severidade | Observação |
|---|---|---|
| Projeto principal tocado por engano | CRITICAL | Mitigado: nenhum alvo, nenhuma conexão |
| Alvo descartável não identificado | BLOCKER | S2.1 não deve começar |
| RLS permissiva no remoto | HIGH | `USING (true)` se V1–V5 forem aplicadas sem mudança |
| Owner/superuser como runtime | HIGH | Invalidaria RLS e append-only |
| Flyway com credencial DML | HIGH | `prod` falha sem vars; remoto não testado |
| SQL Editor não executar o bootstrap | HIGH | scripts usam GUC; execução remota não testada |
| Render IPv4-only | MEDIUM/HIGH | shared session pooler é o caminho provável |
| SSL `prefer` | MEDIUM | usar `require`/`verify-full` |
| Network restrictions | MEDIUM | egress do Render precisa ser allowlisted |
| Região Oregon × São Paulo | MEDIUM | latência não medida |
| Backups/PITR ausentes | MEDIUM | decidir antes de go-live |

---

## 6. Condições de parada

A parte remota deve permanecer parada se:

- o único projeto conhecido for o principal;
- não houver ref de projeto descartável confirmado;
- não houver autorização explícita e específica;
- a ferramenta pedir `--yes`/confirmação automática;
- houver cobrança, IPv4 add-on, branch paga ou upgrade;
- for necessário resetar senha;
- houver dúvida de ownership ou de dados reais.

Nenhuma dessas condições foi contornada.

---

## 7. Pré-requisitos para S2.1

1. Ref do projeto descartável, diferente do principal.
2. Confirmação humana de que é descartável.
3. Autorização específica para escrita remota.
4. Região/PG/status/plano documentados.
5. Credenciais separadas de migration e runtime, fornecidas por canal seguro.
6. Método de conexão e SSL definidos.
7. Janela e rollback/descarte acordados.
8. Nenhum uso de `postgres` no runtime.

---

## 8. Conclusão

O precheck de segurança remota está **bloqueado por ausência de alvo designado**. Nenhuma operação de banco foi executada e o projeto principal não foi tocado. RLS per-user continua fora do escopo e não deve ser declarada segura.
