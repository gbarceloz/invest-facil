package com.investfacil.api.users;

import com.investfacil.api.common.error.BusinessException;
import com.investfacil.api.common.security.TokenHasher;
import com.investfacil.api.config.AppProperties;
import com.investfacil.api.gamification.StreakDayRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.ZoneId;
import java.time.temporal.ChronoUnit;
import java.util.Locale;
import java.util.Optional;
import java.util.UUID;

@Service
public class UserService {

    private final UserRepository repository;
    private final PasswordEncoder passwordEncoder;
    private final AppProperties properties;
    private final StreakDayRepository streakDays;

    public UserService(UserRepository repository, PasswordEncoder passwordEncoder,
                       AppProperties properties, StreakDayRepository streakDays) {
        this.repository = repository;
        this.passwordEncoder = passwordEncoder;
        this.properties = properties;
        this.streakDays = streakDays;
    }

    @Transactional(readOnly = true)
    public Optional<User> findById(UUID id) {
        return repository.findById(id);
    }

    @Transactional(readOnly = true)
    public Optional<User> findByEmail(String email) {
        return repository.findByEmailIgnoreCase(normalize(email));
    }

    @Transactional(readOnly = true)
    public boolean existsByEmail(String email) {
        return repository.existsByEmailIgnoreCase(normalize(email));
    }

    @Transactional(readOnly = true)
    public User require(UUID id) {
        return repository.findById(id)
                .orElseThrow(() -> BusinessException.notFound("Usuário não encontrado."));
    }

    @Transactional
    public User create(String name, String email, String rawPassword, Role role, boolean verified) {
        String normalized = normalize(email);
        if (repository.existsByEmailIgnoreCase(normalized)) {
            throw BusinessException.conflict("Não foi possível concluir o cadastro com estes dados.");
        }
        User user = new User();
        user.setName(name.trim());
        user.setEmail(normalized);
        user.setPasswordHash(passwordEncoder.encode(rawPassword));
        user.setRole(role);
        user.setVerified(verified);
        user.setTimezone(defaultTimezone());
        return repository.save(user);
    }

    /**
     * Cria uma conta originada do Google. A senha aleatória nunca é exposta:
     * o acesso acontece pelo ID token do Google; um reset posterior pode
     * definir uma senha local se o usuário quiser.
     */
    @Transactional
    public User createGoogle(String name, String email, String avatarUrl, String googleSub) {
        String normalized = normalize(email);
        if (repository.existsByEmailIgnoreCase(normalized)) {
            throw BusinessException.conflict("Não foi possível concluir o cadastro com estes dados.");
        }
        String displayName = name == null || name.isBlank()
                ? normalized.substring(0, normalized.indexOf('@') > 0 ? normalized.indexOf('@') : normalized.length())
                : name.trim();
        if (displayName.length() > 120) {
            displayName = displayName.substring(0, 120);
        }
        User user = new User();
        user.setName(displayName);
        user.setEmail(normalized);
        user.setPasswordHash(passwordEncoder.encode(TokenHasher.randomToken()));
        user.setRole(Role.USER);
        user.setVerified(true);
        user.setGoogleSub(googleSub);
        user.setAvatarUrl(avatarUrl == null || avatarUrl.isBlank() ? null : avatarUrl.trim());
        user.setTimezone(defaultTimezone());
        return repository.save(user);
    }

    /** Vincula o sub do Google a uma conta local já existente, sem trocar o dono. */
    @Transactional
    public void linkGoogle(UUID id, String googleSub, String avatarUrl) {
        User user = require(id);
        if (user.getGoogleSub() != null && !user.getGoogleSub().equals(googleSub)) {
            throw BusinessException.conflict(
                    "Esta conta já está vinculada a outra identidade Google.");
        }
        user.setGoogleSub(googleSub);
        if (avatarUrl != null && !avatarUrl.isBlank()) {
            user.setAvatarUrl(avatarUrl.trim());
        }
        user.setVerified(true);
        repository.save(user);
    }

    @Transactional
    public User updateProfile(UUID id, String name, String avatarUrl, String timezone) {
        User user = require(id);
        if (name != null && !name.isBlank()) {
            user.setName(name.trim());
        }
        if (avatarUrl != null) {
            user.setAvatarUrl(avatarUrl.isBlank() ? null : avatarUrl.trim());
        }
        if (timezone != null) {
            String validated = validateTimezone(timezone);
            String current = user.getTimezone();
            // F-05: depois do primeiro dia válido, mudar o fuso mudaria a data
            // local e permitiria farmar streak. Bloqueia até nova regra de negócio.
            if (current != null && !current.equals(validated)
                    && streakDays.existsByUserId(id)) {
                throw new BusinessException(HttpStatus.CONFLICT, "TIMEZONE_LOCKED",
                        "O fuso horário não pode ser alterado após o primeiro dia de estudo, "
                                + "para preservar a sequência.");
            }
            user.setTimezone(validated);
        }
        return repository.save(user);
    }

    @Transactional
    public void markVerified(UUID id) {
        User user = require(id);
        user.setVerified(true);
        repository.save(user);
    }

    @Transactional
    public void changePassword(UUID id, String rawPassword) {
        User user = require(id);
        user.setPasswordHash(passwordEncoder.encode(rawPassword));
        repository.save(user);
    }

    @Transactional
    public void registerSuccessfulLogin(UUID id) {
        User user = require(id);
        user.setLastLoginAt(Instant.now());
        user.setFailedLoginAttempts(0);
        user.setLockedUntil(null);
        repository.save(user);
    }

    @Transactional
    public void registerFailedLogin(UUID id) {
        User user = repository.findByIdForUpdate(id)
                .orElseThrow(() -> BusinessException.notFound("Usuário não encontrado."));
        int attempts = user.getFailedLoginAttempts() + 1;
        user.setFailedLoginAttempts(attempts);
        if (attempts >= properties.getAuth().getMaxFailedAttempts()) {
            user.setLockedUntil(Instant.now().plus(
                    properties.getAuth().getLockMinutes(), ChronoUnit.MINUTES));
            user.setFailedLoginAttempts(0);
        }
        repository.save(user);
    }

    @Transactional
    public void setMfaSecret(UUID id, String encryptedSecret) {
        User user = require(id);
        user.setMfaSecret(encryptedSecret);
        user.setMfaEnabled(false);
        user.setMfaLastCounter(null);
        repository.save(user);
    }

    @Transactional
    public void enableMfa(UUID id, long counter) {
        User user = require(id);
        user.setMfaEnabled(true);
        user.setMfaLastCounter(counter);
        repository.save(user);
    }

    @Transactional
    public void disableMfa(UUID id) {
        User user = require(id);
        user.setMfaEnabled(false);
        user.setMfaSecret(null);
        user.setMfaLastCounter(null);
        repository.save(user);
    }

    /**
     * Consome um contador TOTP de forma atômica (lock pessimista). Retorna false
     * se o código já foi usado, impedindo replay concorrente.
     */
    @Transactional
    public boolean consumeMfaCounter(UUID id, long counter) {
        User user = repository.findByIdForUpdate(id)
                .orElseThrow(() -> BusinessException.notFound("Usuário não encontrado."));
        if (user.getMfaLastCounter() != null && counter <= user.getMfaLastCounter()) {
            return false;
        }
        user.setMfaLastCounter(counter);
        repository.save(user);
        return true;
    }

    public boolean matches(String rawPassword, String hash) {
        return passwordEncoder.matches(rawPassword, hash);
    }

    public String encode(String rawPassword) {
        return passwordEncoder.encode(rawPassword);
    }

    public static String normalize(String email) {
        return email == null ? "" : email.trim().toLowerCase(Locale.ROOT);
    }

    /** Valida um ID IANA da base tzdb; rejeita offsets e strings arbitrárias. */
    public static String validateTimezone(String value) {
        String candidate = value == null ? "" : value.trim();
        if (candidate.isEmpty() || !ZoneId.getAvailableZoneIds().contains(candidate)) {
            throw BusinessException.badRequest("INVALID_TIMEZONE",
                    "Timezone inválido. Use um identificador IANA, como America/Sao_Paulo.");
        }
        return candidate;
    }

    private String defaultTimezone() {
        String configured = properties.getQuiz().getDefaultTimezone();
        try {
            return validateTimezone(configured);
        } catch (BusinessException ex) {
            return "America/Sao_Paulo";
        }
    }
}
