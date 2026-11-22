package com.investfacil.api.progress;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.UUID;

@Entity
@Table(name = "quiz_attempt_answers", schema = "investfacil")
@Getter
@Setter
@NoArgsConstructor
public class QuizAttemptAnswer {

    @Id
    private UUID id;

    @Column(name = "attempt_id", nullable = false)
    private UUID attemptId;

    @Column(name = "question_id", nullable = false)
    private UUID questionId;

    @Column(name = "selected_index", nullable = false)
    private int selectedIndex;

    @Column(nullable = false)
    private boolean correct;
}
