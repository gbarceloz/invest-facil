package com.investfacil.api.auth;

import jakarta.validation.Validation;
import jakarta.validation.Validator;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class RegisterValidationTest {

    private final Validator validator = Validation.buildDefaultValidatorFactory().getValidator();

    @Test
    void shouldAcceptValidRegistration() {
        var request = new AuthDtos.RegisterRequest("Marina Lima", "marina@example.com", "Senha123");
        assertTrue(validator.validate(request).isEmpty());
    }

    @Test
    void shouldRejectPasswordWithoutNumber() {
        var request = new AuthDtos.RegisterRequest("Marina Lima", "marina@example.com", "SenhaSegura");
        assertFalse(validator.validate(request).isEmpty());
    }

    @Test
    void shouldRejectInvalidEmail() {
        var request = new AuthDtos.RegisterRequest("Marina Lima", "nao-e-email", "Senha123");
        assertFalse(validator.validate(request).isEmpty());
    }
}
