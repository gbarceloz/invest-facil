package com.investfacil.api.content;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface CourseModuleRepository extends JpaRepository<CourseModule, UUID> {

    List<CourseModule> findByCategoryIdOrderByDisplayOrderAsc(UUID categoryId);

    Optional<CourseModule> findBySlug(String slug);

    List<CourseModule> findAllByOrderByDisplayOrderAsc();
}
