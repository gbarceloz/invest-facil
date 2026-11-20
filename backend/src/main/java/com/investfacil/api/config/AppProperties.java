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
    private Market market = new Market();
    private RateLimit rateLimit = new RateLimit();

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
    public static class Market {
        private boolean enabled = true;
        private String baseUrl = "https://api.binance.com";
        private String fxUrl = "https://api.frankfurter.app/latest?from=USD&to=BRL";
        private long cacheSeconds = 30;
    }

    @Getter
    @Setter
    public static class RateLimit {
        private boolean enabled = true;
    }
}
