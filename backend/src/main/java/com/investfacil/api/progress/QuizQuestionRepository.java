package com.investfacil.api.progress;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface QuizQuestionRepository extends JpaRepository<QuizQuestion, UUID> {

    List<QuizQuestion> findByLessonIdOrderByPositionAsc(UUID lessonId);

    long countByLessonId(UUID lessonId);
}
