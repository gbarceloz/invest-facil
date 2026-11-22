# S0 — Compatibilidade com Supabase

**Projeto Supabase informado no briefing:**
- Project ref: `fvsofuwgdurrzipqfwyg`
- Região: `sa-east-1`
- PostgreSQL: 17
- Estado: `ACTIVE_HEALTHY`
- Schema `public`: sem tabelas na última inspeção
- Migrations remotas: nenhuma na última inspeção

**Importante:** nesta missão **não houve conexão, consulta ou escrita no Supabase**. Os dados acima são do briefing; o estado remoto não foi revalidado por este agente.

---

## 1. O que a aplicação espera

| Item | Expectativa local |
|---|---|
| Schema | `investfacil` |
| Tabelas | 18 (V1–V5) |
| Roles | `investfacil_app`, `investfacil_migrate`, `investfacil_test_guest`; runtime manual |
| Extensões | nenhuma obrigatória; `gen_random_uuid()` é nativo no PG 17 |
| DDL | Flyway V1–V5 |
| Validação JPA | `ddl-auto=validate` |
| Autenticação | própria, em `investfacil.users`; Supabase Auth não é usado |
| Storage | bucket privado `videos`, via service role no backend |
| PostgREST | schema `investfacil` não exposto |

O schema `public` vazio é compatível com a aplicação: ela não usa `public`. A criação do schema `investfacil` fica a cargo do Flyway/V1.

---

## 2. Matriz de compatibilidade

| Área | Avaliação | Evidência / observação |
|---|---|---|
| PostgreSQL 17 | **Compatível em princípio** | `uuid`, `jsonb`, `timestamptz`, `numeric`, índices parciais, RLS e PL/pgSQL são nativos; execução local em 17.12 passou |
| Extensões | **Sem dependência** | banco local só tem `plpgsql`; `gen_random_uuid()` é nativo |
| Schema `investfacil` | **Compatível** | V1 cria schema; JPA usa `default_schema` e `@Table(schema=...)` |
| `public` vazio | **Compatível** | não há dependência de `public`; PostgREST não é usado |
| Flyway V1–V5 | **Compatível em sintaxe** | DDL padrão; sem `CONCURRENTLY`, sem extensão exótica |
| Roles | **Requer validação** | `CREATE ROLE`, `CREATEROLE`, ownership do schema e `REVOKE` dependem do role executor |
| Runtime role | **BLOQUEADOR provável** | script usa `NOINHERIT`; app não executa `SET ROLE`; ver §3.1 |
| Flyway credentials | **Requer separação** | se `SPRING_FLYWAY_*` não for definido, usa o datasource de runtime e falha em DDL |
| SSL | **Requer configuração explícita** | URLs de exemplo não incluem `sslmode`; Supabase exige TLS |
| Direct connection | **Requer validação de IPv6** | conexão direta do Supabase costuma ser IPv6; Render pode não ter egress IPv6 |
| Pooler | **Requer validação** | Flyway não deve usar transaction pooler; session pooler/direct é necessário para DDL |
| Região | **Risco de latência** | Supabase `sa-east-1` × Render `oregon` |
| Storage | **Compatível** | `storage.buckets` é Supabase-specific; script separado, sem migration |
| Supabase Auth | **Não usado** | não há conflito com `auth.users` |
| Backups/PITR | **Não documentado** | decidir antes de produção |

---

## 3. Bloqueios e pontos de atenção

### 3.1 Runtime `NOINHERIT`

`docs/supabase/PROVISION_RUNTIME_ROLE.sql`:

```sql
CREATE ROLE investfacil_runtime LOGIN NOINHERIT;
GRANT investfacil_app TO investfacil_runtime;
```

Com `NOINHERIT`, o runtime não usa automaticamente os privilégios de `investfacil_app`. A aplicação não executa `SET ROLE` (busca no código principal não encontrou nenhuma ocorrência). Consequência provável: o runtime não consegue ler/escrever o schema e a aplicação falha.

O script também usa `ALTER ROLE ... PASSWORD :'runtime_password'`, sintaxe de variável do `psql`. O `DEPLOY.md` orienta executar no SQL Editor do Supabase, que não suporta meta-variáveis do `psql`. O script não é executável como está no SQL Editor.

**Recomendação:** definir o modelo de runtime antes de conectar (role com `INHERIT` ou `SET ROLE` explícito) e fornecer um script executável no painel, sem placeholder psql. Não implementar nesta missão.

### 3.2 Flyway e credencial de DDL

A configuração:

```yaml
spring.flyway.url: ${SPRING_FLYWAY_URL:${spring.datasource.url}}
spring.flyway.user: ${SPRING_FLYWAY_USER:${spring.datasource.username}}
```

Se as variáveis `SPRING_FLYWAY_*` não forem definidas, o Flyway usa o runtime. Como o runtime deve ser DML-only, a inicialização falha. O `render.yaml` já prevê as variáveis separadas, mas elas estão `sync: false` e precisam ser preenchidas.

Além disso, a V2 executa:

- `CREATE ROLE` (requer `CREATEROLE` ou superuser);
- `REVOKE ALL ON SCHEMA` (requer ownership do schema);
- `CREATE POLICY` (requer ownership das tabelas).

O papel `investfacil_migrate` recebe apenas `USAGE, CREATE` no schema; isso **não** é suficiente para `REVOKE ON SCHEMA`, `CREATE ROLE` e `CREATE POLICY` em objetos que ele não possui. O caminho realista é Flyway rodar como `postgres`/owner, ou receber ownership explícito. O runbook diz “owner ou LOGIN membro de investfacil_migrate”; a segunda opção, como está, é insuficiente.

### 3.3 SSL

As URLs de exemplo em `.env.example` e `DEPLOY.md` não incluem `sslmode`. O driver JDBC padrão é `prefer`; o Supabase exige TLS. Recomenda-se URL explícita com `sslmode=require` (e validação de certificado, se disponível). Não foi testado.

### 3.4 IPv6, pooler e Render

- A conexão **direta** do Supabase é normalmente IPv6; o Render pode não ter egress IPv6. Confirmar antes de escolher a URL do Flyway.
- O **pooler** do Supabase oferece IPv4; o modo `transaction` (6543) não é adequado para DDL/Flyway. Usar conexão direta ou session pooler para migrations.
- Para o runtime via transaction pooler, prepared statements do JDBC podem exigir `prepareThreshold=0`; validar com a versão do driver e o modo do pooler.
- Hikari `maximum-pool-size=5` é conservador e compatível com limites do Free, mas o pooler pode multiplicar conexões por instância.

### 3.5 Região

`render.yaml` define `region: oregon`; o Supabase está em `sa-east-1`. Isso adiciona latência entre backend e banco. Não é incompatibilidade funcional, mas é risco de performance. Alternativas: mover o backend para região mais próxima ou recriar o projeto Supabase em região próxima do Render.

### 3.6 Storage

- `STORAGE_SETUP.sql` cria bucket privado `videos` com limite de 150 MB.
- O backend limita upload a 50 MB (`VIDEO_MAX_UPLOAD_BYTES`) e multipart a 55/60 MB.
- Não há policy pública; o backend usa service role. Compatível, mas os limites estão inconsistentes.
- O script usa `storage.buckets`, disponível no Supabase; não é uma migration Flyway.

### 3.7 Autenticação

A aplicação não usa Supabase Auth. Usuários ficam em `investfacil.users`, com BCrypt/JWT próprios. Não há conflito com `auth.users`, mas também não há SSO/RLS baseada em `auth.uid()`. Qualquer policy futura deve usar o `user_id` da aplicação, não `auth.uid()`.

---

## 4. Checklist de pré-conexão (não executado)

1. Confirmar role/owner que executará o Flyway e se ele pode `CREATE ROLE`, `REVOKE ON SCHEMA` e `CREATE POLICY`.
2. Corrigir o provisionamento do runtime (`INHERIT` ou `SET ROLE`) e remover o placeholder `psql` do caminho SQL Editor.
3. Definir `SPRING_FLYWAY_URL/USER/PASSWORD` separados do runtime.
4. Testar conectividade direta/session pooler, IPv6/IPv4 e `sslmode=require` a partir do Render.
5. Testar Flyway em banco descartável, não em produção.
6. Decidir a política de RLS por usuário antes de considerar o banco “seguro”.
7. Confirmar região/latência e limites de conexão.
8. Definir backup/PITR e janela de migração.
9. Só então aplicar V1–V5 e provisionar storage.

Nenhum desses passos foi executado nesta missão.
