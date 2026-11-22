package com.investfacil.api.progress;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/** Elemento da coluna jsonb {@code quiz_questions.options}. */
@Getter
@Setter
@NoArgsConstructor
public class QuizOption {

    private String text;

    public QuizOption(String text) {
        this.text = text;
    }
}
