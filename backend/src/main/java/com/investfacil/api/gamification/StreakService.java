package com.investfacil.api.gamification;

import com.investfacil.api.config.AppProperties;
import com.investfacil.api.users.UserService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DateTimeException;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.List;
import java.util.UUID;

/**
 * Fonte de verdade do streak: tabela user_streak_days (nunca xp_ledger).
 * A data é calculada no servidor com o timezone IANA armazenado no usuário.
 */
@Service
public class StreakService {

    private static final Logger log = LoggerFactory.getLogger(StreakService.class);

    public record StreakView(int current, int best, LocalDate lastActivityDate,
                             String timezone) {
    }

    private final StreakDayRepository days;
    private final UserService users;
    private final AppProperties properties;

    public StreakService(StreakDayRepository days, UserService users,
                         AppProperties properties) {
        this.days = days;
        this.users = users;
        this.properties = properties;
    }

    /**
     * Registra no máximo um dia válido. Idempotente por (user, data local).
     *
     * @return true se um novo dia foi criado
     */
    @Transactional
    public boolean recordActivity(UUID userId, UUID lessonId) {
        ZoneId zone = zoneOf(userId);
        LocalDate today = LocalDate.now(zone);
        int inserted = lessonId == null
                ? days.insertIfAbsentWithoutLesson(userId, today, zone.getId())
                : days.insertIfAbsent(userId, today, lessonId, zone.getId());
        return inserted > 0;
    }

    /** Registra o dia local do usuário sem associar a uma aula (uso interno). */
    @Transactional
    public boolean recordToday(UUID userId) {
        return recordActivity(userId, null);
    }

    @Transactional(readOnly = true)
    public StreakView view(UUID userId) {
        String timezone = zoneOf(userId).getId();
        List<LocalDate> dates = days.findDatesDesc(userId);
        LocalDate today = LocalDate.now(ZoneId.of(timezone));
        return new StreakView(StreakCalculator.current(dates, today),
                StreakCalculator.best(dates),
                StreakCalculator.lastActivityDate(dates), timezone);
    }

    @Transactional(readOnly = true)
    public int current(UUID userId) {
        return view(userId).current();
    }

    /** Timezone IANA do usuário; configuração padrão se o valor persistido for inválido. */
    public ZoneId zoneOf(UUID userId) {
        String configured = properties.getQuiz().getDefaultTimezone();
        String timezone;
        try {
            timezone = users.require(userId).getTimezone();
        } catch (RuntimeException ex) {
            timezone = null;
        }
        if (timezone != null && !timezone.isBlank()) {
            try {
                return ZoneId.of(timezone);
            } catch (DateTimeException ex) {
                log.warn("Timezone IANA inválido no usuário {}; usando o padrão configurado", userId);
            }
        }
        try {
            return ZoneId.of(configured);
        } catch (DateTimeException ex) {
            return ZoneId.of("America/Sao_Paulo");
        }
    }
}
