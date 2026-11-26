package com.investfacil.api.common.security;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;
import org.springframework.core.env.Environment;
import org.springframework.core.env.Profiles;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import javax.sql.DataSource;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Fail-fast local para configuração insegura do banco.
 *
 * <p>Executa somente SELECTs de catálogo/consultas de privilégio. Não altera
 * schema, policies, grants ou dados. Em produção (profile {@code prod}) uma
 * violação impede o startup. Em desenvolvimento/teste, o comportamento é
 * apenas warn, para permitir os testes legados que usam o superuser do
 * Testcontainers; a exceção de teste é explícita e não vale para produção.</p>
 *
 * <p>Não registra connection string, usuário/senha, token ou credencial. O
 * papel atual pode aparecer no log apenas para diagnóstico.</p>
 */
@Component
@Order(0)
public class DatabaseSecurityGuard implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(DatabaseSecurityGuard.class);

    private static final List<String> ALL_APP_TABLES = List.of(
            "users", "refresh_tokens", "email_tokens", "auth_event",
            "categories", "modules", "lessons", "video_assets", "articles",
            "lesson_articles", "user_progress", "quiz_questions", "quiz_attempts",
            "quiz_attempt_answers", "xp_ledger", "achievements",
            "user_achievements", "simulations",
            // V8 — Módulo 01
            "user_streak_days", "user_quiz_lives", "quiz_lives_ledger",
            "lesson_video_progress", "quiz_submissions",
            // V11 — onboarding
            "onboarding_profiles");

    /**
     * Funções endurecidas pela V7. A presença de search_path fixo em todas é o
     * marcador local de que a V7 foi instalada, sem exigir SELECT no histórico
     * do Flyway (o runtime não tem esse privilégio).
     */
    private static final List<String> V7_FUNCTIONS = List.of(
            "investfacil.current_user_id()",
            "investfacil.current_role_name()",
            "investfacil.auth_email()",
            "investfacil.auth_refresh_hash()",
            "investfacil.auth_email_token_hash()",
            "investfacil.is_seed()",
            "investfacil.is_admin()",
            "investfacil.is_trusted_db_role()",
            "investfacil.s24_users_guard()");

    private static final String LEGACY_FUNCTION =
            "investfacil.apply_table_security()";

    private static final String EXPECTED_VERSION_PROPERTY =
            "app.security.guard.expected-version";
    private static final int DEFAULT_EXPECTED_VERSION = 6;

    private static final List<String> REQUIRED_POLICIES = List.of(
            "s24_users_self_select", "s24_users_register_insert", "s24_users_self_update",
            "s24_refresh_owner_select", "s24_refresh_hash_select", "s24_refresh_hash_update",
            "s24_email_owner_select", "s24_email_hash_select", "s24_email_hash_update",
            "s24_auth_event_insert", "s24_progress_select", "s24_progress_insert",
            "s24_quiz_answers_select", "s24_quiz_answers_insert",
            "s24_simulations_select", "s24_simulations_insert", "s24_simulations_delete",
            "s24_video_select", "s24_video_admin_insert", "s24_video_admin_update",
            "s24_migration_all",
            "v8_streak_select", "v8_lives_select", "v8_lives_ledger_select",
            "v8_video_select", "v8_submissions_select",
            "onb_profile_select", "onb_profile_insert", "onb_profile_update",
            "onb_profile_migration_all");

    private static final Map<String, Integer> EXPECTED_APP_POLICY_COUNTS = Map.ofEntries(
            Map.entry("users", 5),
            Map.entry("refresh_tokens", 5),
            Map.entry("email_tokens", 5),
            Map.entry("auth_event", 1),
            Map.entry("categories", 3),
            Map.entry("modules", 3),
            Map.entry("lessons", 3),
            Map.entry("video_assets", 3),
            Map.entry("articles", 3),
            Map.entry("lesson_articles", 0),
            Map.entry("user_progress", 2),
            Map.entry("quiz_questions", 3),
            Map.entry("quiz_attempts", 2),
            Map.entry("quiz_attempt_answers", 2),
            Map.entry("xp_ledger", 2),
            Map.entry("achievements", 3),
            Map.entry("user_achievements", 2),
            Map.entry("simulations", 3),
            // V8 — policies de aplicação (migration policy é contada à parte)
            Map.entry("user_streak_days", 2),
            Map.entry("user_quiz_lives", 3),
            Map.entry("quiz_lives_ledger", 2),
            Map.entry("lesson_video_progress", 3),
            Map.entry("quiz_submissions", 3),
            Map.entry("onboarding_profiles", 3));

    private final JdbcTemplate jdbc;
    private final Environment environment;

    public DatabaseSecurityGuard(DataSource dataSource, Environment environment) {
        this.jdbc = new JdbcTemplate(dataSource);
        this.environment = environment;
    }

    @Override
    public void run(ApplicationArguments args) {
        verify();
    }

    /**
     * Executa a verificação. É público para permitir um teste negativo com um
     * DataSource administrativo e um Environment de produção, sem subir uma
     * segunda aplicação.
     */
    public void verify() {
        List<String> violations = new ArrayList<>();
        String role;
        try {
            role = jdbc.queryForObject("select current_user", String.class);
            checks(violations, expectedVersion());
        } catch (RuntimeException ex) {
            role = "unknown";
            violations.add("metadata query failed (" + ex.getClass().getSimpleName() + ")");
        }

        if (violations.isEmpty()) {
            log.info("Database security guard passed for role {}", role);
            return;
        }

        boolean strict = environment.acceptsProfiles(Profiles.of("prod"))
                || Boolean.TRUE.equals(environment.getProperty(
                "app.security.guard.strict", Boolean.class, true));
        String summary = String.join("; ", violations);
        if (strict) {
            throw new IllegalStateException(
                    "Database security guard failed for role " + role + ": " + summary);
        }
        log.warn("Database security guard found {} issue(s) for role {} in non-strict "
                + "environment: {}", violations.size(), role, summary);
    }

    private void checks(List<String> violations, int expectedVersion) {
        roleAttributes(violations);
        memberships(violations);
        schemaAndTables(violations);
        rowLevelSecurity(violations);
        policies(violations);
        privileges(violations);
        v6Artifacts(violations);
        v7State(violations, expectedVersion);
    }

    private int expectedVersion() {
        Integer configured = environment.getProperty(
                EXPECTED_VERSION_PROPERTY, Integer.class, DEFAULT_EXPECTED_VERSION);
        return configured == null ? DEFAULT_EXPECTED_VERSION : configured;
    }

    private void roleAttributes(List<String> violations) {
        Integer privileged = jdbc.queryForObject("""
                select count(*)
                  from pg_roles r
                 where (r.rolname = current_user
                        or pg_has_role(current_user, r.oid, 'MEMBER')
                        or pg_has_role(current_user, r.oid, 'SET'))
                   and (r.rolsuper or r.rolbypassrls or r.rolcreatedb or r.rolcreaterole)
                """, Integer.class);
        if (privileged == null || privileged > 0) {
            violations.add("runtime role belongs to a superuser/bypassrls/createdb/createrole role");
        }

        Integer adminMemberships = jdbc.queryForObject("""
                select count(*)
                  from pg_auth_members m
                  join pg_roles r on r.oid = m.member
                 where r.rolname = current_user
                   and m.admin_option
                """, Integer.class);
        if (adminMemberships == null || adminMemberships > 0) {
            violations.add("runtime role has ADMIN OPTION on a role membership");
        }

        Integer ownerTables = jdbc.queryForObject("""
                select count(*)
                  from pg_tables
                 where schemaname = 'investfacil'
                   and tablename <> 'flyway_schema_history'
                   and tableowner = current_user
                """, Integer.class);
        if (ownerTables == null || ownerTables > 0) {
            violations.add("runtime role owns protected tables");
        }
    }

    private void memberships(List<String> violations) {
        if (!Boolean.TRUE.equals(jdbc.queryForObject(
                "select pg_has_role(current_user, 'investfacil_app', 'MEMBER')",
                Boolean.class))) {
            violations.add("runtime role is not a member of investfacil_app");
        }
        if (Boolean.TRUE.equals(jdbc.queryForObject(
                "select pg_has_role(current_user, 'investfacil_migrate', 'MEMBER')",
                Boolean.class))
                || Boolean.TRUE.equals(jdbc.queryForObject(
                "select pg_has_role(current_user, 'investfacil_migrate', 'SET')",
                Boolean.class))) {
            violations.add("runtime role is a member of investfacil_migrate");
        }
    }

    private void schemaAndTables(List<String> violations) {
        Integer schemas = jdbc.queryForObject(
                "select count(*) from pg_namespace where nspname = 'investfacil'",
                Integer.class);
        if (schemas == null || schemas != 1) {
            violations.add("schema investfacil missing or duplicated");
        }

        Integer tables = jdbc.queryForObject("""
                select count(*)
                  from pg_tables
                 where schemaname = 'investfacil'
                   and tablename <> 'flyway_schema_history'
                """, Integer.class);
        if (tables == null || tables != ALL_APP_TABLES.size()) {
            violations.add("unexpected application table count: " + tables);
        }

        Integer ownedByMigrate = jdbc.queryForObject("""
                select count(*)
                  from pg_tables
                 where schemaname = 'investfacil'
                   and tablename <> 'flyway_schema_history'
                   and tableowner = 'investfacil_migrate'
                """, Integer.class);
        if (ownedByMigrate == null || ownedByMigrate != ALL_APP_TABLES.size()) {
            violations.add("application tables are not owned by investfacil_migrate");
        }
    }

    private void rowLevelSecurity(List<String> violations) {
        Integer rls = jdbc.queryForObject("""
                select count(*)
                  from pg_class c
                  join pg_namespace n on n.oid = c.relnamespace
                 where n.nspname = 'investfacil'
                   and c.relkind = 'r'
                   and c.relname <> 'flyway_schema_history'
                   and c.relrowsecurity
                   and c.relforcerowsecurity
                """, Integer.class);
        if (rls == null || rls != ALL_APP_TABLES.size()) {
            violations.add("RLS/FORCE RLS missing on one or more application tables");
        }
    }

    private void policies(List<String> violations) {
        Integer appRw = jdbc.queryForObject("""
                select count(*) from pg_policies
                 where schemaname = 'investfacil' and policyname = 'app_rw'
                """, Integer.class);
        if (appRw == null || appRw != 0) {
            violations.add("permissive app_rw policy still exists");
        }

        Integer tablesWithPolicies = jdbc.queryForObject("""
                select count(distinct tablename) from pg_policies
                 where schemaname = 'investfacil'
                   and (policyname like 's24_%' or policyname like 'v8_%'
                        or policyname like 'onb_%')
                """, Integer.class);
        if (tablesWithPolicies == null || tablesWithPolicies != ALL_APP_TABLES.size()) {
            violations.add("V6/V8/V11 policies missing on one or more application tables");
        }

        Integer migrationPolicies = jdbc.queryForObject("""
                select count(*) from pg_policies
                 where schemaname = 'investfacil'
                   and (policyname = 's24_migration_all'
                        or policyname like 'v8_%_migration_all'
                        or policyname like 'onb_%_migration_all')
                """, Integer.class);
        if (migrationPolicies == null || migrationPolicies != ALL_APP_TABLES.size()) {
            violations.add("V6/V8/V11 migration policy missing on one or more application tables");
        }

        Map<String, Integer> actualPolicyCounts = new HashMap<>();
        for (Map<String, Object> row : jdbc.queryForList("""
                select tablename, count(*) as total
                  from pg_policies
                 where schemaname = 'investfacil'
                   and (policyname like 's24_%' or policyname like 'v8_%'
                        or policyname like 'onb_%')
                   and policyname <> 's24_migration_all'
                   and policyname not like 'v8_%_migration_all'
                   and policyname not like 'onb_%_migration_all'
                 group by tablename
                """)) {
            actualPolicyCounts.put((String) row.get("tablename"),
                    ((Number) row.get("total")).intValue());
        }
        for (Map.Entry<String, Integer> expected : EXPECTED_APP_POLICY_COUNTS.entrySet()) {
            int actual = actualPolicyCounts.getOrDefault(expected.getKey(), 0);
            if (actual != expected.getValue()) {
                violations.add("unexpected V6 policy count on " + expected.getKey()
                        + " (expected " + expected.getValue() + ", got " + actual + ")");
            }
        }

        for (String policy : REQUIRED_POLICIES) {
            Integer count = jdbc.queryForObject("""
                    select count(*) from pg_policies
                     where schemaname = 'investfacil' and policyname = ?
                    """, Integer.class, policy);
            if (count == null || count == 0) {
                violations.add("required policy missing: " + policy);
            }
        }

        Integer permissivePrivate = jdbc.queryForObject("""
                select count(*) from pg_policies
                 where schemaname = 'investfacil'
                   and tablename in ('users','refresh_tokens','email_tokens','auth_event',
                                     'user_progress','quiz_attempts','quiz_attempt_answers',
                                     'xp_ledger','user_achievements','simulations',
                                     'user_streak_days','user_quiz_lives','quiz_lives_ledger',
                                     'lesson_video_progress','quiz_submissions',
                                     'onboarding_profiles')
                   and policyname not like '%_migration_all'
                   and (coalesce(qual, '') = 'true' or coalesce(with_check, '') = 'true')
                """, Integer.class);
        if (permissivePrivate == null || permissivePrivate != 0) {
            violations.add("permissive USING/WITH CHECK on a private table");
        }
    }

    private void privileges(List<String> violations) {
        expectSchema(violations, "USAGE", true);
        expectSchema(violations, "CREATE", false);
        expectFunction(violations, "investfacil.apply_table_security()", false);

        expectTable(violations, "users", "SELECT", true);
        expectTable(violations, "users", "INSERT", true);
        expectTable(violations, "users", "UPDATE", true);
        expectTable(violations, "users", "DELETE", false);
        expectTable(violations, "refresh_tokens", "SELECT", true);
        expectTable(violations, "refresh_tokens", "INSERT", true);
        expectTable(violations, "refresh_tokens", "UPDATE", true);
        expectTable(violations, "refresh_tokens", "DELETE", false);
        expectTable(violations, "email_tokens", "SELECT", true);
        expectTable(violations, "email_tokens", "INSERT", true);
        expectTable(violations, "email_tokens", "UPDATE", true);
        expectTable(violations, "email_tokens", "DELETE", false);
        expectTable(violations, "auth_event", "INSERT", true);
        expectTable(violations, "auth_event", "SELECT", false);
        expectTable(violations, "auth_event", "UPDATE", false);
        expectTable(violations, "auth_event", "DELETE", false);

        for (String table : List.of("categories", "modules", "lessons", "articles",
                "quiz_questions", "achievements")) {
            expectTable(violations, table, "SELECT", true);
            expectTable(violations, table, "INSERT", true);
            expectTable(violations, table, "UPDATE", true);
            expectTable(violations, table, "DELETE", false);
        }
        expectTable(violations, "video_assets", "SELECT", true);
        expectTable(violations, "video_assets", "INSERT", true);
        expectTable(violations, "video_assets", "UPDATE", true);
        expectTable(violations, "video_assets", "DELETE", false);
        for (String table : List.of("user_progress", "quiz_attempts",
                "quiz_attempt_answers", "xp_ledger", "user_achievements")) {
            expectTable(violations, table, "SELECT", true);
            expectTable(violations, table, "INSERT", true);
            expectTable(violations, table, "UPDATE", false);
            expectTable(violations, table, "DELETE", false);
        }
        expectTable(violations, "simulations", "SELECT", true);
        expectTable(violations, "simulations", "INSERT", true);
        expectTable(violations, "simulations", "DELETE", true);
        expectTable(violations, "simulations", "UPDATE", false);

        // V8 — Módulo 01
        expectTable(violations, "user_streak_days", "SELECT", true);
        expectTable(violations, "user_streak_days", "INSERT", true);
        expectTable(violations, "user_streak_days", "UPDATE", false);
        expectTable(violations, "user_streak_days", "DELETE", false);

        expectTable(violations, "user_quiz_lives", "SELECT", true);
        expectTable(violations, "user_quiz_lives", "INSERT", true);
        expectTable(violations, "user_quiz_lives", "UPDATE", true);
        expectTable(violations, "user_quiz_lives", "DELETE", false);

        expectTable(violations, "quiz_lives_ledger", "SELECT", true);
        expectTable(violations, "quiz_lives_ledger", "INSERT", true);
        expectTable(violations, "quiz_lives_ledger", "UPDATE", false);
        expectTable(violations, "quiz_lives_ledger", "DELETE", false);

        expectTable(violations, "lesson_video_progress", "SELECT", true);
        expectTable(violations, "lesson_video_progress", "INSERT", true);
        expectTable(violations, "lesson_video_progress", "UPDATE", true);
        expectTable(violations, "lesson_video_progress", "DELETE", false);

        expectTable(violations, "quiz_submissions", "SELECT", true);
        expectTable(violations, "quiz_submissions", "INSERT", true);
        expectTable(violations, "quiz_submissions", "UPDATE", true);
        expectTable(violations, "quiz_submissions", "DELETE", false);

        expectTable(violations, "onboarding_profiles", "SELECT", true);
        expectTable(violations, "onboarding_profiles", "INSERT", true);
        expectTable(violations, "onboarding_profiles", "UPDATE", true);
        expectTable(violations, "onboarding_profiles", "DELETE", false);

        expectTable(violations, "lesson_articles", "SELECT", false);
        expectTable(violations, "lesson_articles", "INSERT", false);
        expectTable(violations, "lesson_articles", "UPDATE", false);
        expectTable(violations, "lesson_articles", "DELETE", false);
        expectTable(violations, "flyway_schema_history", "SELECT", false);
        expectTable(violations, "flyway_schema_history", "INSERT", false);
        expectTable(violations, "flyway_schema_history", "UPDATE", false);
        expectTable(violations, "flyway_schema_history", "DELETE", false);
    }

    private void v6Artifacts(List<String> violations) {
        for (String function : V7_FUNCTIONS) {
            Integer count = jdbc.queryForObject("""
                    select count(*) from pg_proc p
                    join pg_namespace n on n.oid = p.pronamespace
                    where n.nspname = 'investfacil'
                      and p.proname = ?
                    """, Integer.class, function.substring(function.indexOf('.') + 1,
                    function.indexOf('(')));
            if (count == null || count == 0) {
                violations.add("V6 function missing: " + function);
            }
        }

        Integer trigger = jdbc.queryForObject("""
                select count(*) from pg_trigger t
                join pg_class c on c.oid = t.tgrelid
                join pg_namespace n on n.oid = c.relnamespace
                where n.nspname = 'investfacil'
                  and c.relname = 'users'
                  and t.tgname = 's24_users_guard'
                  and not t.tgisinternal
                """, Integer.class);
        if (trigger == null || trigger != 1) {
            violations.add("V6 users guard trigger missing");
        }
    }

    /**
     * A V7 é detectada pelos próprios artefatos: search_path fixo nas nove
     * funções remanescentes e ausência da função legada
     * apply_table_security(). Não lê flyway_schema_history — o runtime não tem
     * SELECT nessa tabela. Um banco ainda em V6 é válido quando a versão
     * esperada é 6; quando a implantação declara expected-version >= 7, a
     * ausência da V7 vira violação.
     */
    private void v7State(List<String> violations, int expectedVersion) {
        if (expectedVersion > 8) {
            violations.add("expected schema version " + expectedVersion
                    + " is newer than the V8 supported by this guard");
        }

        int present = 0;
        int hardened = 0;
        for (String function : V7_FUNCTIONS) {
            if (functionExists(function)) {
                present++;
                if (hasFixedSearchPath(function)) {
                    hardened++;
                }
            }
        }
        boolean legacyPresent = functionExists(LEGACY_FUNCTION);

        if (present != V7_FUNCTIONS.size()) {
            violations.add("V7 function count mismatch: expected "
                    + V7_FUNCTIONS.size() + ", found " + present);
        }
        if (hardened > 0 && hardened < V7_FUNCTIONS.size()) {
            violations.add("V7 search_path hardening partially applied: "
                    + hardened + "/" + V7_FUNCTIONS.size());
        }
        if (legacyPresent && hardened > 0) {
            violations.add("legacy apply_table_security() still exists after "
                    + "V7 function hardening");
        }

        boolean installed = present == V7_FUNCTIONS.size()
                && hardened == V7_FUNCTIONS.size()
                && !legacyPresent;
        if (!installed) {
            if (expectedVersion >= 7) {
                violations.add("V7 is required (expected schema version "
                        + expectedVersion + ") but is not installed");
            } else if (!legacyPresent && hardened == 0) {
                violations.add("V6 baseline is missing apply_table_security()");
            } else {
                log.info("Database security guard: V7 not installed; "
                        + "validating V6 baseline (expected version {})", expectedVersion);
            }
            return;
        }

        v7Privileges(violations);
    }

    private boolean functionExists(String function) {
        Integer count = jdbc.queryForObject("""
                select count(*) from pg_proc p
                 where p.oid = to_regprocedure(?)::regprocedure
                """, Integer.class, function);
        return count != null && count > 0;
    }

    private boolean hasFixedSearchPath(String function) {
        Integer count = jdbc.queryForObject("""
                select count(*)
                  from pg_proc p
                 where p.oid = to_regprocedure(?)::regprocedure
                   and exists (
                       select 1
                         from unnest(coalesce(p.proconfig, '{}'::text[])) cfg
                        where cfg in ('search_path=', 'search_path=""',
                                      'search_path=pg_catalog')
                   )
                """, Integer.class, function);
        return count != null && count > 0;
    }

    private void v7Privileges(List<String> violations) {
        for (String function : V7_FUNCTIONS) {
            expectNoPublicExecute(violations, function);
            expectFunctionRole(violations, function, "investfacil_app", true);
            expectFunctionRole(violations, function, "investfacil_migrate", true);
            expectFunctionRole(violations, function, "investfacil_runtime", true);

            for (String role : List.of("anon", "authenticated",
                    "investfacil_test_guest")) {
                if (roleExists(role)) {
                    expectFunctionRole(violations, function, role, false);
                }
            }
        }

        if (functionExists(LEGACY_FUNCTION)) {
            violations.add("legacy apply_table_security() still exists");
        }
    }

    private void expectNoPublicExecute(List<String> violations, String function) {
        Integer grants = jdbc.queryForObject("""
                select count(*)
                  from pg_proc p
                  cross join lateral aclexplode(
                      coalesce(p.proacl, acldefault('f', p.proowner))) a
                 where p.oid = to_regprocedure(?)::regprocedure
                   and a.grantee = 0
                   and a.privilege_type = 'EXECUTE'
                """, Integer.class, function);
        if (grants == null || grants != 0) {
            violations.add("PUBLIC EXECUTE still granted on " + function);
        }
    }

    private void expectFunctionRole(List<String> violations, String function,
                                    String role, boolean expected) {
        if (!roleExists(role)) {
            violations.add("required role missing: " + role);
            return;
        }
        Boolean actual = jdbc.queryForObject(
                "select has_function_privilege(?, ?, 'EXECUTE')",
                Boolean.class, role, function);
        if (!Boolean.valueOf(expected).equals(actual)) {
            violations.add("unexpected EXECUTE for " + role + " on " + function
                    + " (expected " + expected + ")");
        }
    }

    private boolean roleExists(String role) {
        Integer count = jdbc.queryForObject(
                "select count(*) from pg_roles where rolname = ?",
                Integer.class, role);
        return count != null && count > 0;
    }

    private void expectTable(List<String> violations, String table, String privilege,
                             boolean expected) {
        Boolean actual = jdbc.queryForObject(
                "select has_table_privilege(current_user, ?, ?)",
                Boolean.class, "investfacil." + table, privilege);
        if (!Boolean.valueOf(expected).equals(actual)) {
            violations.add("unexpected " + privilege + " on " + table
                    + " (expected " + expected + ")");
        }
    }

    private void expectSchema(List<String> violations, String privilege, boolean expected) {
        Boolean actual = jdbc.queryForObject(
                "select has_schema_privilege(current_user, 'investfacil', ?)",
                Boolean.class, privilege);
        if (!Boolean.valueOf(expected).equals(actual)) {
            violations.add("unexpected schema " + privilege + " privilege");
        }
    }

    private void expectFunction(List<String> violations, String function, boolean expected) {
        if (!functionExists(function)) {
            if (expected) {
                violations.add("required function missing: " + function);
            }
            return;
        }
        Boolean actual = jdbc.queryForObject(
                "select has_function_privilege(current_user, ?, 'EXECUTE')",
                Boolean.class, function);
        if (!Boolean.valueOf(expected).equals(actual)) {
            violations.add("unexpected EXECUTE privilege on " + function);
        }
    }
}
