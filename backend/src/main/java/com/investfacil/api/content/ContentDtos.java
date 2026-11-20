package com.investfacil.api.content;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public final class ContentDtos {

    private ContentDtos() {
    }

    public record ModuleSummary(UUID id, String slug, String title, String description,
                                int order, long lessonCount) {
    }

    public record CategoryView(UUID id, String slug, String name, String description,
                               int order, List<ModuleSummary> modules) {
    }

    public record LessonSummary(UUID id, String slug, String title, int estimatedMin,
                                int order, UUID moduleId) {
    }

    public record ModuleDetail(UUID id, String slug, String title, String description,
                               String categorySlug, String categoryName,
                               List<LessonSummary> lessons) {
    }

    public record ArticleSummary(UUID id, String slug, String title, String subtitle,
                                 Integer readingMinutes, Instant publishedAt,
                                 String categorySlug, String categoryName) {
    }

    public record ArticleDetail(UUID id, String slug, String title, String subtitle,
                                String contentMd, String sourceName, String sourceUrl,
                                Integer readingMinutes, Instant publishedAt,
                                String categorySlug, String categoryName) {
    }

    public record LessonDetail(UUID id, String slug, String title, String contentMd,
                               int estimatedMin, int order, UUID moduleId, String moduleSlug,
                               String moduleTitle, String categorySlug, String categoryName,
                               List<ArticleSummary> relatedArticles) {
    }

    public record SearchResults(List<LessonSummary> lessons, List<ArticleSummary> articles) {
    }
}
