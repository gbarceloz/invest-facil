package com.investfacil.api.content;

import jakarta.validation.constraints.Size;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/content")
@Validated
public class ContentController {

    private final ContentService content;

    public ContentController(ContentService content) {
        this.content = content;
    }

    @GetMapping("/categories")
    public List<ContentDtos.CategoryView> categories() {
        return content.catalog();
    }

    @GetMapping("/modules/{slug}")
    public ContentDtos.ModuleDetail module(@PathVariable String slug) {
        return content.module(slug);
    }

    @GetMapping("/lessons/{slug}")
    public ContentDtos.LessonDetail lesson(@PathVariable String slug) {
        return content.lesson(slug);
    }

    @GetMapping("/articles")
    public List<ContentDtos.ArticleSummary> articles() {
        return content.articleList();
    }

    @GetMapping("/articles/{slug}")
    public ContentDtos.ArticleDetail article(@PathVariable String slug) {
        return content.article(slug);
    }

    @GetMapping("/search")
    public ContentDtos.SearchResults search(
            @RequestParam("q") @Size(min = 2, max = 80, message = "Busque por ao menos 2 caracteres.")
            String query) {
        return content.search(query);
    }
}
