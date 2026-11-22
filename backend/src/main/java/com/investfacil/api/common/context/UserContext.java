package com.investfacil.api.common.context;

import jakarta.persistence.EntityManager;
import jakarta.persistence.EntityManagerFactory;
import org.hibernate.Session;
import org.springframework.orm.jpa.EntityManagerHolder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.support.TransactionSynchronizationManager;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.SQLException;
import java.util.Locale;
import java.util.UUID;

/**
 * Contexto de segurança da requisição/transação.
 *
 * <p>Os valores são definidos exclusivamente pelo backend (JWT validado,
 * usuário carregado do banco, tokens opacos recebidos nos fluxos de auth ou
 * seed interno). Nenhum DTO/parâmetro de endpoint define {@code userId} ou
 * {@code role} diretamente.</p>
 *
 * <p>O transporte para o PostgreSQL é feito com {@code set_config(..., true)},
 * portanto o valor é local à transação e desaparece no commit/rollback. O
 * {@link ThreadLocal} é limpo pelo filtro HTTP e pelos inicializadores de
 * background; ele nunca é usado como fonte de autorização sem passar pelo
 * banco.</p>
 */
@Component
public class UserContext {

    private static final String APPLY_SQL = """
            select set_config('app.current_user_id', ?, true),
                   set_config('app.current_role', ?, true),
                   set_config('app.auth_email', ?, true),
                   set_config('app.auth_refresh_hash', ?, true),
                   set_config('app.auth_email_token_hash', ?, true),
                   set_config('app.flow', ?, true),
                   set_config('app.seed', ?, true)
            """;

    private final EntityManagerFactory entityManagerFactory;
    private final ThreadLocal<State> current = new ThreadLocal<>();

    public UserContext(EntityManagerFactory entityManagerFactory) {
        this.entityManagerFactory = entityManagerFactory;
    }

    public void clear() {
        current.remove();
    }

    public void setUser(UUID userId, String role) {
        State state = state();
        state.userId = userId == null ? "" : userId.toString();
        state.role = normalizeRole(role);
    }

    public void setAuthEmail(String email) {
        state().authEmail = email == null ? "" : email.trim().toLowerCase(Locale.ROOT);
    }

    public void setRefreshHash(String hash) {
        state().refreshHash = hash == null ? "" : hash.trim();
    }

    public void setEmailTokenHash(String hash) {
        state().emailTokenHash = hash == null ? "" : hash.trim();
    }

    public void setFlow(String flow) {
        state().flow = flow == null ? "" : flow.trim().toUpperCase(Locale.ROOT);
    }

    public void setSeed(boolean seed) {
        state().seed = seed;
    }

    public UUID currentUserId() {
        State state = current.get();
        if (state == null || state.userId.isEmpty()) {
            return null;
        }
        return UUID.fromString(state.userId);
    }

    public Snapshot snapshot() {
        State state = state();
        return new Snapshot(state.userId, state.role, state.authEmail, state.refreshHash,
                state.emailTokenHash, state.flow, state.seed);
    }

    /**
     * Reaplica o contexto na conexão da transação corrente. Necessário quando
     * um fluxo descobre o usuário depois da primeira query (login, refresh,
     * verificação de e-mail, reset e cadastro).
     */
    public void applyToCurrentTransaction() {
        EntityManagerHolder holder =
                (EntityManagerHolder) TransactionSynchronizationManager.getResource(entityManagerFactory);
        if (holder == null) {
            return;
        }
        EntityManager entityManager = holder.getEntityManager();
        try {
            entityManager.unwrap(Session.class).doWork(this::apply);
        } catch (RuntimeException ex) {
            throw new IllegalStateException("Falha ao aplicar o contexto de segurança na transação.", ex);
        }
    }

    private void apply(Connection connection) throws SQLException {
        Snapshot snapshot = snapshot();
        try (PreparedStatement statement = connection.prepareStatement(APPLY_SQL)) {
            statement.setString(1, snapshot.userId());
            statement.setString(2, snapshot.role());
            statement.setString(3, snapshot.authEmail());
            statement.setString(4, snapshot.refreshHash());
            statement.setString(5, snapshot.emailTokenHash());
            statement.setString(6, snapshot.flow());
            statement.setString(7, Boolean.toString(snapshot.seed()));
            statement.execute();
        }
    }

    private State state() {
        State state = current.get();
        if (state == null) {
            state = new State();
            current.set(state);
        }
        return state;
    }

    private static String normalizeRole(String role) {
        return role == null ? "" : role.trim().toUpperCase(Locale.ROOT);
    }

    public record Snapshot(String userId, String role, String authEmail, String refreshHash,
                           String emailTokenHash, String flow, boolean seed) {
    }

    private static final class State {
        private String userId = "";
        private String role = "";
        private String authEmail = "";
        private String refreshHash = "";
        private String emailTokenHash = "";
        private String flow = "";
        private boolean seed;
    }
}
