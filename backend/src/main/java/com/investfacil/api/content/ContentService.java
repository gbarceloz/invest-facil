package com.investfacil.api.content;

import com.investfacil.api.common.error.BusinessException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class ContentService implements ContentCatalog {

    private final CategoryRepository categories;
    private final CourseModuleRepository modules;
    private final LessonRepository lessons;
    private final ArticleRepository articles;

    public ContentService(CategoryRepository categories, CourseModuleRepository modules,
                          LessonRepository lessons, ArticleRepository articles) {
        this.categories = categories;
        this.modules = modules;
        this.lessons = lessons;
        this.articles = articles;
    }

    @Transactional(readOnly = true)
    public List<ContentDtos.CategoryView> catalog() {
        List<Category> allCategories = categories.findAllByOrderByDisplayOrderAsc();
        List<CourseModule> allModules = modules.findAllByOrderByDisplayOrderAsc();
        Map<UUID, Long> lessonCounts = lessons.findByPublishedTrueOrderByDisplayOrderAsc().stream()
                .collect(Collectors.groupingBy(Lesson::getModuleId, Collectors.counting()));
        Map<UUID, List<CourseModule>> byCategory = allModules.stream()
                .collect(Collectors.groupingBy(CourseModule::getCategoryId));

        return allCategories.stream().map(category -> new ContentDtos.CategoryView(
                category.getId(), category.getSlug(), category.getName(), category.getDescription(),
                category.getDisplayOrder(),
                byCategory.getOrDefault(category.getId(), List.of()).stream()
                        .sorted(Comparator.comparingInt(CourseModule::getDisplayOrder))
                        .map(module -> new ContentDtos.ModuleSummary(
                                module.getId(), module.getSlug(), module.getTitle(),
                                module.getDescription(), module.getDisplayOrder(),
                                lessonCounts.getOrDefault(module.getId(), 0L)))
                        .toList())).toList();
    }

    @Transactional(readOnly = true)
    public ContentDtos.ModuleDetail module(String slug) {
        CourseModule module = modules.findBySlug(slug)
                .orElseThrow(() -> BusinessException.notFound("Módulo não encontrado."));
        Category category = categories.findById(module.getCategoryId()).orElse(null);
        List<ContentDtos.LessonSummary> lessonViews = lessons
                .findByModuleIdAndPublishedTrueOrderByDisplayOrderAsc(module.getId())
                .stream().map(this::lessonSummary).toList();
        return new ContentDtos.ModuleDetail(module.getId(), module.getSlug(), module.getTitle(),
                module.getDescription(),
                category != null ? category.getSlug() : null,
                category != null ? category.getName() : null,
                lessonViews);
    }

    @Transactional(readOnly = true)
    public ContentDtos.LessonDetail lesson(String slug) {
        Lesson lesson = lessons.findBySlugAndPublishedTrue(slug)
                .orElseThrow(() -> BusinessException.notFound("Aula não encontrada."));
        CourseModule module = modules.findById(lesson.getModuleId()).orElse(null);
        Category category = module == null ? null
                : categories.findById(module.getCategoryId()).orElse(null);
        List<ContentDtos.ArticleSummary> related = category == null ? List.of()
                : articleSummaries(articles.findByCategoryIdAndPublishedTrueOrderByPublishedAtDesc(
                category.getId()));
        return new ContentDtos.LessonDetail(
                lesson.getId(), lesson.getSlug(), lesson.getTitle(), lesson.getContentMd(),
                lesson.getEstimatedMin() == null ? 3 : lesson.getEstimatedMin(),
                lesson.getDisplayOrder(),
                lesson.getModuleId(),
                module != null ? module.getSlug() : null,
                module != null ? module.getTitle() : null,
                category != null ? category.getSlug() : null,
                category != null ? category.getName() : null,
                related);
    }

    @Transactional(readOnly = true)
    public List<ContentDtos.ArticleSummary> articleList() {
        return articleSummaries(articles.findByPublishedTrueOrderByPublishedAtDesc());
    }

    @Transactional(readOnly = true)
    public ContentDtos.ArticleDetail article(String slug) {
        Article article = articles.findBySlugAndPublishedTrue(slug)
                .orElseThrow(() -> BusinessException.notFound("Artigo não encontrado."));
        Category category = article.getCategoryId() == null ? null
                : categories.findById(article.getCategoryId()).orElse(null);
        return new ContentDtos.ArticleDetail(article.getId(), article.getSlug(), article.getTitle(),
                article.getSubtitle(), article.getContentMd(), article.getSourceName(),
                article.getSourceUrl(), article.getReadingMinutes(), article.getPublishedAt(),
                category != null ? category.getSlug() : null,
                category != null ? category.getName() : null);
    }

    @Transactional(readOnly = true)
    public ContentDtos.SearchResults search(String query) {
        String normalized = query == null ? "" : query.trim();
        if (normalized.length() < 2) {
            return new ContentDtos.SearchResults(List.of(), List.of());
        }
        return new ContentDtos.SearchResults(
                lessons.searchPublished(normalized).stream().map(this::lessonSummary).toList(),
                articleSummaries(articles.searchPublished(normalized)));
    }

    // ------------------------------------------------------------------
    // ContentCatalog
    // ------------------------------------------------------------------

    @Override
    @Transactional(readOnly = true)
    public Optional<LessonRef> findLesson(UUID id) {
        return lessons.findById(id).map(this::toRef);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<LessonRef> findLessonBySlug(String slug) {
        return lessons.findBySlugAndPublishedTrue(slug).map(this::toRef);
    }

    @Override
    @Transactional(readOnly = true)
    public List<LessonRef> publishedLessons() {
        return lessons.findOrderedPublished().stream()
                .map(this::toRef).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<ModuleRef> allModules() {
        return modules.findAllByOrderByDisplayOrderAsc().stream()
                .map(module -> new ModuleRef(module.getId(), module.getCategoryId(),
                        module.getSlug(), module.getTitle()))
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<CategoryRef> allCategories() {
        return categories.findAllByOrderByDisplayOrderAsc().stream()
                .map(category -> new CategoryRef(category.getId(), category.getSlug(),
                        category.getName()))
                .toList();
    }

    // ------------------------------------------------------------------
    // Mapping
    // ------------------------------------------------------------------

    private LessonRef toRef(Lesson lesson) {
        CourseModule module = modules.findById(lesson.getModuleId()).orElse(null);
        return new LessonRef(lesson.getId(), lesson.getModuleId(),
                module != null ? module.getCategoryId() : null,
                lesson.getSlug(), lesson.getTitle(),
                lesson.getEstimatedMin() == null ? 3 : lesson.getEstimatedMin(),
                lesson.isPublished());
    }

    private ContentDtos.LessonSummary lessonSummary(Lesson lesson) {
        return new ContentDtos.LessonSummary(lesson.getId(), lesson.getSlug(), lesson.getTitle(),
                lesson.getEstimatedMin() == null ? 3 : lesson.getEstimatedMin(),
                lesson.getDisplayOrder(), lesson.getModuleId());
    }

    private List<ContentDtos.ArticleSummary> articleSummaries(List<Article> source) {
        Map<UUID, Category> categoryCache = new HashMap<>();
        List<ContentDtos.ArticleSummary> result = new ArrayList<>();
        for (Article article : source) {
            Category category = null;
            if (article.getCategoryId() != null) {
                category = categoryCache.computeIfAbsent(article.getCategoryId(),
                        id -> categories.findById(id).orElse(null));
            }
            result.add(new ContentDtos.ArticleSummary(article.getId(), article.getSlug(),
                    article.getTitle(), article.getSubtitle(), article.getReadingMinutes(),
                    article.getPublishedAt(),
                    category != null ? category.getSlug() : null,
                    category != null ? category.getName() : null));
        }
        return result;
    }
}
