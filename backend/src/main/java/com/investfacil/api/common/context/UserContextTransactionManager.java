package com.investfacil.api.common.context;

import jakarta.persistence.EntityManagerFactory;
import org.springframework.orm.jpa.JpaTransactionManager;
import org.springframework.transaction.TransactionDefinition;

/**
 * Transporta o contexto de segurança para a conexão JDBC no início de cada
 * transação JPA. O {@code set_config(..., true)} é aplicado depois que o
 * {@link JpaTransactionManager} abriu a transação e vinculou o EntityManager,
 * portanto antes de qualquer query de Repository/Service.
 *
 * <p>Transações {@code REQUIRES_NEW} recebem uma nova aplicação; transações
 * aninhadas reutilizam o contexto da transação externa. Quando o contexto muda
 * dentro de uma transação já aberta, o fluxo chama
 * {@link UserContext#applyToCurrentTransaction()}.</p>
 */
public class UserContextTransactionManager extends JpaTransactionManager {

    private final UserContext context;

    public UserContextTransactionManager(EntityManagerFactory entityManagerFactory,
                                         UserContext context) {
        super(entityManagerFactory);
        this.context = context;
    }

    @Override
    protected void doBegin(Object transaction, TransactionDefinition definition) {
        super.doBegin(transaction, definition);
        context.applyToCurrentTransaction();
    }
}
