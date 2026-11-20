package com.investfacil.api.content;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Fronteira pública do módulo de conteúdo para os demais módulos.
 * Nenhum outro domínio acessa os repositories de conteúdo diretamente.
 */
public interface ContentCatalog {

    record LessonRef(UUID id, UUID moduleId, UUID categoryId, String slug, String title,
                     int estimatedMin, boolean published) {
    }

    record ModuleRef(UUID id, UUID categoryId, String slug, String title) {
    }

    record CategoryRef(UUID id, String slug, String name) {
    }

    Optional<LessonRef> findLesson(UUID id);

    Optional<LessonRef> findLessonBySlug(String slug);

    List<LessonRef> publishedLessons();

    List<ModuleRef> allModules();

    List<CategoryRef> allCategories();
}
