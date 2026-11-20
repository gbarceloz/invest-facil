package com.investfacil.api.content;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ArticleRepository extends JpaRepository<Article, UUID> {

    List<Article> findByPublishedTrueOrderByPublishedAtDesc();

    Optional<Article> findBySlugAndPublishedTrue(String slug);

    List<Article> findByCategoryIdAndPublishedTrueOrderByPublishedAtDesc(UUID categoryId);

    @Query("select a from Article a where a.published = true and "
            + "(lower(a.title) like lower(concat('%', :q, '%')) "
            + "or lower(coalesce(a.subtitle, '')) like lower(concat('%', :q, '%')))")
    List<Article> searchPublished(@Param("q") String query);
}
