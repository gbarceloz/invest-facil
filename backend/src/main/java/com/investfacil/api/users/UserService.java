package com.investfacil.api.users;

import com.investfacil.api.common.error.BusinessException;
import com.investfacil.api.config.AppProperties;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Locale;
import java.util.Optional;
import java.util.UUID;

@Service
public class UserService {

    private final UserRepository repository;
    private final PasswordEncoder passwordEncoder;
    private final AppProperties properties;

    public UserService(UserRepository repository, PasswordEncoder passwordEncoder,
                       AppProperties properties) {
        this.repository = repository;
        this.passwordEncoder = passwordEncoder;
        this.properties = properties;
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
        return repository.save(user);
    }

    @Transactional
    public User updateProfile(UUID id, String name, String avatarUrl) {
        User user = require(id);
        if (name != null && !name.isBlank()) {
            user.setName(name.trim());
        }
        if (avatarUrl != null) {
            user.setAvatarUrl(avatarUrl.isBlank() ? null : avatarUrl.trim());
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
}
