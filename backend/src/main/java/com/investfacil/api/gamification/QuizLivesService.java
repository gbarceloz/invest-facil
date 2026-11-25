package com.investfacil.api.gamification;

import com.investfacil.api.common.error.BusinessException;
import com.investfacil.api.config.AppProperties;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;

/**
 * Fichas de quiz com autoridade de servidor.
 *
 * <ul>
 *   <li>saldo inicial configurável ({@code app.quiz.lives-initial});</li>
 *   <li>sem regeneração por tempo;</li>
 *   <li>consumo atômico via UPDATE condicional ({@code balance > 0});</li>
 *   <li>ledger idempotente por (user_id, idempotency_key).</li>
 * </ul>
 * Nenhum endpoint aceita saldo do cliente.
 */
@Service
public class QuizLivesService {

    public static final String REASON_INITIAL_GRANT = "INITIAL_GRANT";
    public static final String REASON_QUIZ_FAILED = "QUIZ_FAILED";

    private final QuizLivesRepository lives;
    private final QuizLivesLedgerRepository ledger;
    private final AppProperties properties;

    public QuizLivesService(QuizLivesRepository lives, QuizLivesLedgerRepository ledger,
                            AppProperties properties) {
        this.lives = lives;
        this.ledger = ledger;
        this.properties = properties;
    }

    public int max() {
        return Math.max(0, properties.getQuiz().getLivesInitial());
    }

    public int passThresholdPercent() {
        int configured = properties.getQuiz().getPassThresholdPercent();
        return Math.min(100, Math.max(0, configured));
    }

    /** Cria a conta de fichas na primeira interação; idempotente. */
    @Transactional
    public int ensureAccount(UUID userId) {
        return ensureAccountInternal(userId);
    }

    @Transactional(readOnly = true)
    public int balance(UUID userId) {
        return lives.findBalance(userId).orElseGet(this::max);
    }

    /**
     * Consome 1 ficha por tentativa reprovada.
     *
     * <p>Se a mesma {@code idempotencyKey} já foi cobrada, não consome de novo
     * e devolve o saldo atual. O UPDATE condicional impede saldo negativo em
     * concorrência; nesse caso a transação inteira (tentativa + consumo) sofre
     * rollback e o cliente recebe 409 NO_FICHAS.</p>
     */
    @Transactional
    public int consumeForFailedAttempt(UUID userId, UUID lessonId, UUID attemptId,
                                       String idempotencyKey) {
        ensureAccountInternal(userId);
        int marked = idempotencyKey == null
                ? ledger.insertConsumption(userId, -1, lessonId, attemptId)
                : ledger.insertConsumptionWithKey(userId, -1, lessonId, attemptId, idempotencyKey);
        if (marked == 0) {
            return balance(userId);
        }
        int changed = lives.consumeOne(userId, Instant.now());
        if (changed == 0) {
            throw new BusinessException(HttpStatus.CONFLICT, "NO_FICHAS",
                    "Você não tem fichas para uma nova tentativa. Revise a aula e tente novamente quando tiver fichas.",
                    Map.<String, Object>of("fichas", 0, "fichasMax", max()));
        }
        return balance(userId);
    }

    private int ensureAccountInternal(UUID userId) {
        int initial = max();
        int inserted = lives.insertIfAbsent(userId, initial);
        if (inserted > 0 && initial > 0) {
            ledger.insertInitialGrant(userId, initial);
        }
        return lives.findBalance(userId).orElse(initial);
    }
}
