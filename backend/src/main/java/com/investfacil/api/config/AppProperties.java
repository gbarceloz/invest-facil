package com.investfacil.api.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

/**
 * Configuração da aplicação agrupada em um único bean tipado.
 * Todos os valores sensíveis vêm de variáveis de ambiente (nunca do repositório).
 */
@Component
@ConfigurationProperties(prefix = "app")
@Getter
@Setter
public class AppProperties {

    private Cors cors = new Cors();
    private Jwt jwt = new Jwt();
    private Auth auth = new Auth();
    private Mail mail = new Mail();
    private Supabase supabase = new Supabase();
    private Videos videos = new Videos();
    private Demo demo = new Demo();
    private Security security = new Security();
    private Seed seed = new Seed();
    private Google google = new Google();
    private Market market = new Market();
    private Bitcoin bitcoin = new Bitcoin();
    private RateLimit rateLimit = new RateLimit();
    private Quiz quiz = new Quiz();

    @Getter
    @Setter
    public static class Cors {
        private String allowedOrigins = "";
    }

    @Getter
    @Setter
    public static class Jwt {
        private String secret = "";
        private String issuer = "investfacil-api";
        private long accessMinutes = 15;
        private long refreshDays = 30;
        private long mfaChallengeMinutes = 5;
    }

    @Getter
    @Setter
    public static class Auth {
        private String frontendBaseUrl = "http://localhost:3000";
        private String refreshCookieName = "if_refresh";
        private boolean cookieSecure = true;
        private String cookieSameSite = "Strict";
        private boolean exposeDevTokens = false;
        private int maxFailedAttempts = 5;
        private int lockMinutes = 15;
        private int bcryptCost = 10;
        /** Cooldown mínimo entre reenvios de verificação de e-mail. */
        private int verificationResendSeconds = 60;
    }

    @Getter
    @Setter
    public static class Mail {
        private boolean enabled = false;
        private String from = "Invest Fácil <nao-responda@investfacil.local>";
        private String resendApiKey = "";
    }

    @Getter
    @Setter
    public static class Supabase {
        private String url = "";
        private String serviceKey = "";
        private String bucket = "videos";
        private long signedUrlSeconds = 3600;
    }

    @Getter
    @Setter
    public static class Videos {
        private String demoUrl = "";
        /** Limite alinhado ao plano gratuito do Supabase Storage (50 MB). */
        private long maxUploadBytes = 52_428_800L;
    }

    @Getter
    @Setter
    public static class Demo {
        private boolean enabled = false;
        private String email = "";
        private String password = "";
        private String name = "Marina Lima";
    }

    @Getter
    @Setter
    public static class Security {
        private boolean trustProxy = false;
        private String trustedProxies = "";
        private String mfaKey = "";
    }

    @Getter
    @Setter
    public static class Seed {
        private boolean content = true;
    }

    @Getter
    @Setter
    public static class Google {
        /** Client ID público do Google Identity Services; vazio desabilita o botão. */
        private String clientId = "";
    }

    @Getter
    @Setter
    public static class Market {
        private boolean enabled = true;
        private String baseUrl = "https://api.binance.com";
        private String fxUrl = "https://api.frankfurter.app/latest?from=USD&to=BRL";
        private long cacheSeconds = 30;
    }

    @Getter
    @Setter
    public static class Bitcoin {
        private boolean enabled = true;
        private String baseUrl = "https://api.coingecko.com/api/v3";
        private long cacheSeconds = 120;
    }

    @Getter
    @Setter
    public static class RateLimit {
        private boolean enabled = true;
    }

    /**
     * Regras de quiz/gamificação aplicadas no servidor. Nenhum destes valores
     * é aceito do cliente.
     */
    @Getter
    @Setter
    public static class Quiz {
        /** Saldo inicial de fichas por usuário. */
        private int livesInitial = 3;
        /** Limiar de aprovação em percentual (default 67 = 2 de 3). */
        private int passThresholdPercent = 67;
        /** Timezone IANA padrão para cálculo de streak. */
        private String defaultTimezone = "America/Sao_Paulo";
    }
}
