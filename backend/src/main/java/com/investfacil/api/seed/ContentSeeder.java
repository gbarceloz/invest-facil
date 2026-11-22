package com.investfacil.api.seed;

import com.investfacil.api.config.AppProperties;
import com.investfacil.api.common.context.UserContext;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

@Component
@Order(1)
public class ContentSeeder implements ApplicationRunner {

    private final ContentSeedService service;
    private final AppProperties properties;
    private final UserContext context;

    public ContentSeeder(ContentSeedService service, AppProperties properties,
                         UserContext context) {
        this.service = service;
        this.properties = properties;
        this.context = context;
    }

    @Override
    public void run(ApplicationArguments args) {
        if (properties.getSeed().isContent()) {
            context.clear();
            context.setSeed(true);
            context.setFlow("SEED");
            try {
                service.seed();
            } finally {
                context.clear();
            }
        }
    }
}
