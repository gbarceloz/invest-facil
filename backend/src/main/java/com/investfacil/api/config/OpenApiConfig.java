package com.investfacil.api.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * OpenAPI/Swagger — /swagger-ui.html e /v3/api-docs.
 * Esquema bearer JWT já declarado: os endpoints de T2 o utilizarão.
 */
@Configuration
public class OpenApiConfig {

    private static final String BEARER = "bearerAuth";

    @Bean
    public OpenAPI investFacilOpenApi() {
        return new OpenAPI()
                .info(new Info()
                        .title("Invest Fácil API")
                        .description("API do backend principal do Invest Fácil — plataforma de educação financeira.")
                        .version("v1")
                        .contact(new Contact().name("Invest Fácil")))
                .addSecurityItem(new SecurityRequirement().addList(BEARER))
                .components(new Components().addSecuritySchemes(BEARER,
                        new SecurityScheme()
                                .name(BEARER)
                                .type(SecurityScheme.Type.HTTP)
                                .scheme("bearer")
                                .bearerFormat("JWT")));
    }
}
