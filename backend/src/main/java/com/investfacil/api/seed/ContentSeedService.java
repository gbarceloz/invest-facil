package com.investfacil.api.seed;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.investfacil.api.content.Article;
import com.investfacil.api.content.ArticleRepository;
import com.investfacil.api.content.Category;
import com.investfacil.api.content.CategoryRepository;
import com.investfacil.api.content.CourseModule;
import com.investfacil.api.content.CourseModuleRepository;
import com.investfacil.api.content.Lesson;
import com.investfacil.api.content.LessonRepository;
import com.investfacil.api.gamification.Achievement;
import com.investfacil.api.gamification.AchievementRepository;
import com.investfacil.api.progress.QuizOption;
import com.investfacil.api.progress.QuizQuestion;
import com.investfacil.api.progress.QuizQuestionRepository;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.InputStream;
import java.time.Instant;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/** Carrega conteúdo educativo e conquistas uma única vez (idempotente). */
@Service
public class ContentSeedService {

    public record SeedData(List<SeedCategory> categories, List<SeedArticle> articles) {
    }

    public record SeedCategory(String slug, String name, String description, int order,
                               List<SeedModule> modules) {
    }

    public record SeedModule(String slug, String title, String description, int order,
                             List<SeedLesson> lessons) {
    }

    public record SeedLesson(String slug, String title, int estimatedMin, int order,
                             String content, List<SeedQuestion> quiz) {
    }

    public record SeedQuestion(String question, List<String> options, int correctIndex) {
    }

    public record SeedArticle(String slug, String title, String subtitle, String categorySlug,
                              int readingMinutes, String content, String sourceName,
                              String sourceUrl) {
    }

    private final CategoryRepository categories;
    private final CourseModuleRepository modules;
    private final LessonRepository lessons;
    private final ArticleRepository articles;
    private final QuizQuestionRepository questions;
    private final AchievementRepository achievements;
    private final ObjectMapper objectMapper;

    public ContentSeedService(CategoryRepository categories, CourseModuleRepository modules,
                              LessonRepository lessons, ArticleRepository articles,
                              QuizQuestionRepository questions, AchievementRepository achievements,
                              ObjectMapper objectMapper) {
        this.categories = categories;
        this.modules = modules;
        this.lessons = lessons;
        this.articles = articles;
        this.questions = questions;
        this.achievements = achievements;
        this.objectMapper = objectMapper;
    }

    @Transactional
    public void seed() {
        seedAchievements();
        SeedData data;
        try (InputStream input = new ClassPathResource("seed/content.json").getInputStream()) {
            data = objectMapper.readValue(input, SeedData.class);
        } catch (Exception ex) {
            throw new IllegalStateException("Falha ao carregar seed/content.json", ex);
        }

        // Sincroniza por slug: preserva IDs e histórico, atualiza textos por
        // posição e cria apenas o que falta. Nunca apaga conteúdo.
        Map<String, Category> categoryBySlug = new HashMap<>();
        for (SeedCategory seedCategory : data.categories()) {
            Category category = categories.findBySlug(seedCategory.slug()).orElseGet(Category::new);
            category.setSlug(seedCategory.slug());
            category.setName(seedCategory.name());
            category.setDescription(seedCategory.description());
            category.setDisplayOrder(seedCategory.order());
            categories.save(category);
            categoryBySlug.put(category.getSlug(), category);

            for (SeedModule seedModule : seedCategory.modules()) {
                CourseModule module = modules.findBySlug(seedModule.slug()).orElseGet(CourseModule::new);
                module.setCategoryId(category.getId());
                module.setSlug(seedModule.slug());
                module.setTitle(seedModule.title());
                module.setDescription(seedModule.description());
                module.setDisplayOrder(seedModule.order());
                modules.save(module);

                for (SeedLesson seedLesson : seedModule.lessons()) {
                    Lesson lesson = lessons.findBySlug(seedLesson.slug()).orElseGet(Lesson::new);
                    lesson.setModuleId(module.getId());
                    lesson.setSlug(seedLesson.slug());
                    lesson.setTitle(seedLesson.title());
                    lesson.setContentMd(seedLesson.content());
                    lesson.setEstimatedMin(seedLesson.estimatedMin());
                    lesson.setDisplayOrder(seedLesson.order());
                    lesson.setPublished(true);
                    lessons.save(lesson);

                    List<QuizQuestion> existingQuestions =
                            questions.findByLessonIdOrderByPositionAsc(lesson.getId());
                    int position = 1;
                    for (SeedQuestion seedQuestion : seedLesson.quiz()) {
                        QuizQuestion question = position <= existingQuestions.size()
                                ? existingQuestions.get(position - 1)
                                : new QuizQuestion();
                        question.setLessonId(lesson.getId());
                        question.setPosition(position++);
                        question.setQuestion(seedQuestion.question());
                        question.setOptions(seedQuestion.options().stream()
                                .map(QuizOption::new).toList());
                        question.setCorrectIndex(seedQuestion.correctIndex());
                        questions.save(question);
                    }
                }
            }
        }

        Instant now = Instant.now();
        for (SeedArticle seedArticle : data.articles()) {
            Article article = articles.findBySlug(seedArticle.slug()).orElseGet(Article::new);
            boolean isNew = article.getId() == null;
            Category category = categoryBySlug.get(seedArticle.categorySlug());
            article.setCategoryId(category != null ? category.getId() : null);
            article.setSlug(seedArticle.slug());
            article.setTitle(seedArticle.title());
            article.setSubtitle(seedArticle.subtitle());
            article.setContentMd(seedArticle.content());
            article.setSourceName(seedArticle.sourceName());
            article.setSourceUrl(seedArticle.sourceUrl());
            article.setPublished(true);
            if (isNew) {
                article.setPublishedAt(now);
            }
            article.setReadingMinutes(seedArticle.readingMinutes());
            articles.save(article);
        }
    }

    private void seedAchievements() {
        createAchievement("FIRST_LESSON", "Primeira missão",
                "Conclua sua primeira aula.", 20);
        createAchievement("FIRST_QUIZ", "Primeiro quiz",
                "Responda ao seu primeiro quiz.", 20);
        createAchievement("STREAK_7", "7 dias estudando",
                "Mantenha uma sequência de 7 dias de estudo.", 50);
        createAchievement("QUIZ_MASTER", "Mestre dos quizzes",
                "Alcance média de 80% com pelo menos 3 quizzes.", 80);
        createAchievement("MODULE_FINISHED", "Trilha concluída",
                "Conclua todas as aulas de um módulo.", 100);
        createAchievement("XP_1000", "Mil de XP",
                "Acumule 1.000 XP de aprendizado.", 0);
        createAchievement("FIRST_SIMULATION", "Primeira simulação",
                "Salve sua primeira simulação financeira.", 30);
    }

    private void createAchievement(String code, String name, String description, int xpReward) {
        if (achievements.findByCode(code).isPresent()) {
            return;
        }
        Achievement achievement = new Achievement();
        achievement.setCode(code);
        achievement.setName(name);
        achievement.setDescription(description);
        achievement.setXpReward(xpReward);
        achievements.save(achievement);
    }
}
