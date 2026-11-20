package com.investfacil.api.content;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface LessonRepository extends JpaRepository<Lesson, UUID> {

    List<Lesson> findByModuleIdAndPublishedTrueOrderByDisplayOrderAsc(UUID moduleId);

    Optional<Lesson> findBySlugAndPublishedTrue(String slug);

    List<Lesson> findByPublishedTrueOrderByDisplayOrderAsc();

    long countByPublishedTrue();

    long countByModuleIdAndPublishedTrue(UUID moduleId);

    @Query("select l from Lesson l, CourseModule m, Category c "
            + "where l.moduleId = m.id and m.categoryId = c.id and l.published = true "
            + "order by c.displayOrder, m.displayOrder, l.displayOrder")
    List<Lesson> findOrderedPublished();

    @Query("select l from Lesson l where l.published = true and "
            + "(lower(l.title) like lower(concat('%', :q, '%')) "
            + "or lower(coalesce(l.contentMd, '')) like lower(concat('%', :q, '%')))")
    List<Lesson> searchPublished(@Param("q") String query);
}
