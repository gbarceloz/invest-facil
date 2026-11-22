package com.investfacil.api.config;

import com.investfacil.api.common.context.UserContext;
import com.investfacil.api.common.context.UserContextTransactionManager;
import jakarta.persistence.EntityManagerFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.transaction.PlatformTransactionManager;

/**
 * Único {@link PlatformTransactionManager} da aplicação. Substitui o
 * JpaTransactionManager autoconfigurado para aplicar o contexto de identidade
 * antes da primeira query de cada transação.
 */
@Configuration
public class TransactionConfig {

    @Bean
    @Primary
    public PlatformTransactionManager transactionManager(EntityManagerFactory entityManagerFactory,
                                                         UserContext context) {
        return new UserContextTransactionManager(entityManagerFactory, context);
    }
}
