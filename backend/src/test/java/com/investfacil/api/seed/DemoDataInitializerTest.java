package com.investfacil.api.seed;

import com.investfacil.api.config.AppProperties;
import org.junit.jupiter.api.Test;
import org.springframework.boot.DefaultApplicationArguments;
import org.springframework.mock.env.MockEnvironment;

import static org.junit.jupiter.api.Assertions.assertThrows;

/**
 * O initializer de demonstração não pode ser ativado acidentalmente com o
 * profile de produção. O teste não usa banco nem serviços: o fail-fast ocorre
 * antes de qualquer acesso a dados.
 */
class DemoDataInitializerTest {

    @Test
    void recusaExecucaoComProfileDeProducao() {
        AppProperties properties = new AppProperties();
        properties.getDemo().setEnabled(true);
        properties.getDemo().setEmail("demo@example.com");
        properties.getDemo().setPassword("Demo@1234");

        MockEnvironment production = new MockEnvironment();
        production.setActiveProfiles("prod");
        DemoDataInitializer initializer = new DemoDataInitializer(
                properties, null, null, null, null, production);

        assertThrows(IllegalStateException.class,
                () -> initializer.run(new DefaultApplicationArguments(new String[0])));
    }
}
