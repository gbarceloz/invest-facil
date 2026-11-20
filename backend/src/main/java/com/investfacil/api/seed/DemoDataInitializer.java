package com.investfacil.api.seed;

import com.investfacil.api.config.AppProperties;
import com.investfacil.api.content.ContentCatalog;
import com.investfacil.api.progress.ProgressService;
import com.investfacil.api.users.Role;
import com.investfacil.api.users.User;
import com.investfacil.api.users.UserService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * Conta de demonstração opcional. Só é criada com APP_DEMO_ENABLED=true e
 * DEMO_PASSWORD definido no ambiente — nunca há senha versionada.
 */
@Component
@Order(2)
public class DemoDataInitializer implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(DemoDataInitializer.class);

    private final AppProperties properties;
    private final UserService users;
    private final ContentCatalog catalog;
    private final ProgressService progress;

    public DemoDataInitializer(AppProperties properties, UserService users,
                               ContentCatalog catalog, ProgressService progress) {
        this.properties = properties;
        this.users = users;
        this.catalog = catalog;
        this.progress = progress;
    }

    @Override
    public void run(ApplicationArguments args) {
        AppProperties.Demo demo = properties.getDemo();
        if (!demo.isEnabled() || demo.getEmail().isBlank() || demo.getPassword().isBlank()) {
            return;
        }
        User user = users.findByEmail(demo.getEmail()).orElseGet(() -> {
            User created = users.create(demo.getName(), demo.getEmail(), demo.getPassword(),
                    Role.USER, true);
            log.info("Conta de demonstração criada: {}", created.getEmail());
            return created;
        });
        if (progress.summary(user.getId()).completedLessons() == 0) {
            List<ContentCatalog.LessonRef> lessons = catalog.publishedLessons();
            int limit = Math.min(4, lessons.size());
            for (int i = 0; i < limit; i++) {
                progress.completeLesson(user.getId(), lessons.get(i).id());
            }
            log.info("Progresso de demonstração inicializado para {}", user.getEmail());
        }
    }
}
