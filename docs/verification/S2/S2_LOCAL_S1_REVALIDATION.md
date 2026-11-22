# S2.0 — Revalidação local do S1

**Projeto:** Invest Fácil
**Data:** 2026-11-22
**Modo:** verificação estática; nenhuma migration ou script executado

---

## 1. Arquivos S1 presentes

`docs/verification/S1/` contém 7 documentos:

- `S1_BASELINE.md`
- `S1_ROLE_MODEL.md`
- `S1_PROVISIONING.md`
- `S1_MIGRATION_RESULTS.md`
- `S1_CONNECTIVITY.md`
- `S1_SECURITY_GAPS.md`
- `S1_FINAL_REPORT.md`

O status declarado é `PASS WITH LIMITATIONS`, com go-live `BLOCKED`.

---

## 2. Hashes conferidos

| Arquivo | Hash atual | Confere com S1 |
|---|---|---|
| `backend/src/main/resources/application-prod.yml` | `743395BB295A3FA6C1464AB86C4D288EBAFF9CD717282F0C5666476B72AB646B` | Sim |
| `docs/DEPLOY.md` | `F96266F1DB0FEAEE1CD508F6E3802EBA8A73ACD448D59C9A4FABFCB394D216DD` | Sim |
| `docs/supabase/PROVISION_RUNTIME_ROLE.sql` | `A121165C5ACA5FBF731C3EF962B0A19A995004CE81E5F6F74ADA02634033D2F7` | Sim |
| `docs/supabase/PROVISION_MIGRATION_ROLE.sql` | `CFD409AF7336B78E3FC5A4B0334701B15DC07A6D2C30027F1625076D8DF0D314` | Sim |

A migration identity e o runtime estão documentados como `INHERIT`; o script de runtime usa GUC (`app.runtime_password`), não `:'runtime_password'`.

---

## 3. Migrations

Hashes atuais conferem com o S1:

| Migration | SHA-256 |
|---|---|
| V1 | `A1CCC67BBB16B9246A3BA2FB3B5F0BA392014BDB51EA7404248FDE3F99EC2A09` |
| V2 | `1AEB16457D3DDE58F46AF65D9A1F2DD61291CDC47B19C07E3121FFE262AE6C4F` |
| V3 | `68420169D7E06F1022544983FB91499E1D1BC9C941AD9CDCB99B8D5969D6D6DA` |
| V4 | `24F8D92CDC029A21C085563C14EF484C10319F59A51196B229BB9A72A30CF13E` |
| V5 | `113CA7407F506B0B02F8DFC2B73CB74C38D74D9B601EF3D3DF785ED99E7E7C2F` |

Nenhuma migration foi alterada.

---

## 4. Configuração da aplicação

`backend/src/main/resources/application-prod.yml` exige:

- `SPRING_FLYWAY_URL`
- `SPRING_FLYWAY_USER`
- `SPRING_FLYWAY_PASSWORD`

Sem essas variáveis, o startup `prod` falha com `Could not resolve placeholder 'SPRING_FLYWAY_URL'`. A configuração base mantém `ddl-auto=validate`, Hikari máximo 5 e schema `investfacil`.

A separação de credenciais está coerente com o S1:

- aplicação: `SPRING_DATASOURCE_*` → runtime;
- Flyway: `SPRING_FLYWAY_*` → migration;
- bootstrap: SQL Editor/painel → owner/admin.

---

## 5. Evidência S1 não reexecutada

A S2.0 **não** recriou o PostgreSQL descartável nem reexecutou V1–V5, o seed ou os testes de privilégios. A revalidação é estática, baseada em:

- hashes dos arquivos;
- conteúdo dos scripts;
- relatórios S1;
- migrations inalteradas;
- estado Git sem alterações nesses arquivos.

O container `investfacil-s1-db` foi removido ao final do S1; não há banco local ativo associado ao S1.

---

## 6. Divergências encontradas

Nenhuma divergência entre os arquivos atuais e o relatório S1.

Observações:

- A exibição de alguns acentos no console do Windows aparece como mojibake; os arquivos são UTF-8 e o validador de docs lê corretamente.
- O S1 declara explicitamente que Supabase, SSL, pooler, IPv6 e região não foram testados; isso continua válido.
- O S1 não implementou RLS per-user; `USING (true)` permanece.

---

## 7. Conclusão

O estado local do S1 está preservado e coerente com seus relatórios. A S2.0 não alterou scripts, configuração, migrations ou frontend.

A validação remota continua pendente de um projeto descartável explicitamente designado.
