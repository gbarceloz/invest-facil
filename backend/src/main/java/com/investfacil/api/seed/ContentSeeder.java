package com.investfacil.api.seed;

import com.investfacil.api.config.AppProperties;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

@Component
@Order(1)
public class ContentSeeder implements ApplicationRunner {

    private final ContentSeedService service;
    private final AppProperties properties;

    public ContentSeeder(ContentSeedService service, AppProperties properties) {
        this.service = service;
        this.properties = properties;
    }

    @Override
    public void run(ApplicationArguments args) {
        if (properties.getSeed().isContent()) {
            service.seed();
        }
    }
}
