# S2.0 — Plano de execução futura S2.1

**Projeto:** Invest Fácil
**Status:** planejamento apenas; **nada executado**
**Pré-requisito:** alvo descartável designado e autorização de escrita remota

---

## 1. Gate de entrada

S2.1 só pode começar se todos os itens forem verdadeiros:

- [ ] `S2_TARGET_PROJECT_REF` definido e diferente de `fvsofuwgdurrzipqfwyg`.
- [ ] `S2_DISPOSABLE_PROJECT_CONFIRMED=true` por decisão humana explícita.
- [ ] `S2_REMOTE_WRITE_APPROVED=true` para aquele project ref.
- [ ] Região, versão PostgreSQL, status e plano documentados.
- [ ] Credenciais separadas de migration e runtime disponíveis por canal seguro.
- [ ] Método de conexão e SSL aprovados.
- [ ] Janela de execução e rollback/descarte acordados.

Sem o gate, não executar nem “testar rapidamente”.

---

## 2. Sequência proposta

1. **Confirmar identidade** do projeto descartável no Dashboard; registrar ref, região, PG, status e plano. Não usar o principal.
2. **Validar acesso e SSL** com uma conexão de leitura administrativa; `sslmode=require` no mínimo; `verify-full` se o certificado raiz estiver disponível.
3. **Definir o método de conexão**:
   - migration: direct ou shared session pooler;
   - runtime: shared session pooler no Render IPv4-only;
   - transaction pooler apenas para runtime serverless, nunca para Flyway.
4. **Validar o bootstrap administrativo** em banco/schema vazio: executar `PROVISION_MIGRATION_ROLE.sql` com GUC de senha.
5. **Provisionar `investfacil_migrate`** e confirmar `LOGIN INHERIT`, ownership do schema, `CREATE` no database, ausência de SUPERUSER/CREATEROLE/BYPASSRLS.
6. **Provisionar `investfacil_runtime`** e confirmar `LOGIN INHERIT`, membership em `investfacil_app`, ausência de ownership/DDL/CREATEROLE/BYPASSRLS.
7. **Confirmar ownership/grants**: schema, tabelas, `flyway_schema_history` sem acesso ao runtime, policies, função.
8. **Aplicar V1–V5** com `SPRING_FLYWAY_URL/USER/PASSWORD` apontando para `investfacil_migrate`; nunca usar runtime.
9. **Subir a aplicação** com `SPRING_DATASOURCE_*` apontando para runtime; `ddl-auto=validate`; health UP.
10. **Executar seed** no banco descartável; comparar 8 categorias, 12 módulos, 31 aulas, 62 questões, 6 artigos e 7 conquistas.
11. **Validar endpoints** públicos e autenticados; cadastro → verificação → login → perfil; conteúdo; progresso; simulador.
12. **Reiniciar** e confirmar ausência de duplicação de seed/migrations; repetir health.
13. **Testes negativos**: runtime CREATE TABLE/ALTER/CREATE ROLE; runtime `flyway_schema_history`; schema privado; UPDATE/DELETE ledgers; `SET ROLE`; Flyway com runtime; `test_guest` 0 linhas; `anon` negado.
14. **Registrar evidências e rollback**: IDs/hashes, contagens, logs sem segredos, decisão de manter ou descartar o ambiente.

---

## 3. Duas conexões separadas

| Teste | Identidade | Método | Critério |
|---|---|---|---|
| Migration/DDL | `investfacil_migrate` | direct ou session pooler | V1–V5, ownership, sem runtime |
| Runtime/DML | `investfacil_runtime` | session pooler (Render) | health, seed, API, RLS policy |
| Administração | `postgres`/owner | dashboard/SQL Editor | bootstrap apenas |
| Render egress | runtime/migration | fora do deploy de produção | teste separado, autorizado |

O teste local no computador não prova conectividade a partir do Render.

---

## 4. Matriz de testes de S2.1

| Teste | Esperado |
|---|---|
| Flyway como migration | V1–V5 success |
| Flyway como runtime | falha explícita |
| Runtime SELECT/INSERT | permitido conforme policy |
| Runtime DDL | negado |
| Runtime CREATE ROLE | negado |
| Runtime `flyway_schema_history` | negado |
| Runtime schema privado | negado |
| Runtime SET ROLE migração | negado |
| Runtime UPDATE/DELETE ledgers | negado |
| `test_guest` | 0 linhas |
| `anon` | schema negado |
| Seed | contagens canônicas, sem duplicação |
| `ddl-auto=validate` | passa |
| Restart | sem duplicação |
| SSL | `require`/`verify-full` conforme decisão |
| Pooler | prepared statements/sessão conforme modo |

---

## 5. Rollback / descarte

Como o ambiente é descartável:

- preferir descartar o projeto/branch ao final;
- se for manter, remover schema/roles somente com autorização explícita;
- não executar `DROP`/`TRUNCATE` em projeto principal;
- não reutilizar o projeto descartável como produção;
- registrar ref, região, recursos e data de descarte;
- não remover recursos preexistentes.

Nenhum rollback remoto foi executado ou testado.

---

## 6. Riscos e decisões pendentes

- Escolha entre direct e shared session pooler para Flyway; a doc recomenda direct, mas Render é IPv4-only e o add-on é pago.
- Compatibilidade real do Flyway via session pooler precisa ser comprovada.
- `sslmode=require` vs `verify-full` e distribuição do certificado raiz.
- Network restrictions/egress do Render.
- Região/latência.
- RLS per-user continua fora do escopo; não declarar segurança de produção.

---

## 7. Proibições mantidas

- Não usar o projeto `fvsofuwgdurrzipqfwyg`.
- Não criar projeto automaticamente.
- Não ativar IPv4 add-on pago.
- Não resetar senha.
- Não usar `postgres` no runtime.
- Não usar runtime no Flyway.
- Não fazer deploy ou alterar Render.
- Não fazer commit/push/PR/merge.

**S2.1 não foi iniciada.**
