package com.investfacil.api.auth;

import com.investfacil.api.config.AppProperties;
import com.investfacil.api.users.User;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.env.Environment;
import org.springframework.core.env.Profiles;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.List;
import java.util.Map;

/**
 * Envio de e-mail transacional.
 * - Com RESEND_API_KEY: envia via API Resend.
 * - Sem chave (dev/demo): registra o link no log, sem falhar o cadastro.
 * Nenhum token é versionado ou exposto em produção.
 */
@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    private final AppProperties properties;
    private final Environment environment;
    private final RestClient restClient;

    public EmailService(AppProperties properties, Environment environment) {
        this.properties = properties;
        this.environment = environment;
        this.restClient = RestClient.builder().build();
    }

    public void sendVerification(User user, String rawToken) {
        String link = properties.getAuth().getFrontendBaseUrl()
                + "/verificar-email?token=" + rawToken;
        send(user.getEmail(), "Confirme seu e-mail — Invest Fácil",
                "<h2>Bem-vindo ao Invest Fácil</h2>"
                        + "<p>Olá, " + escape(user.getName()) + ". Confirme seu e-mail para ativar sua conta.</p>"
                        + "<p><a href=\"" + link + "\">Confirmar e-mail</a></p>"
                        + "<p>O link expira em 24 horas. Se você não criou a conta, ignore esta mensagem.</p>",
                link);
    }

    public void sendPasswordReset(User user, String rawToken) {
        String link = properties.getAuth().getFrontendBaseUrl()
                + "/redefinir-senha?token=" + rawToken;
        send(user.getEmail(), "Redefinição de senha — Invest Fácil",
                "<h2>Redefinir senha</h2>"
                        + "<p>Olá, " + escape(user.getName()) + ". Recebemos um pedido de redefinição de senha.</p>"
                        + "<p><a href=\"" + link + "\">Criar nova senha</a></p>"
                        + "<p>O link expira em 1 hora. Se não foi você, ignore esta mensagem.</p>",
                link);
    }

    private void send(String to, String subject, String html, String link) {
        String apiKey = properties.getMail().getResendApiKey();
        if (!properties.getMail().isEnabled() || apiKey == null || apiKey.isBlank()) {
            if (environment.acceptsProfiles(Profiles.of("dev"))) {
                log.info("E-mail não enviado (modo desenvolvimento). Destinatário={} link={}", to, link);
            } else {
                // Nunca registrar token cru fora de dev: logs de produção podem ser
                // acessados por mais pessoas do que o e-mail do usuário.
                log.error("E-mail não configurado (MAIL_ENABLED/RESEND_API_KEY). "
                        + "Link de verificação/reset NÃO registrado. Destinatário={}", to);
            }
            return;
        }
        try {
            restClient.post()
                    .uri("https://api.resend.com/emails")
                    .header("Authorization", "Bearer " + apiKey)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(Map.of(
                            "from", properties.getMail().getFrom(),
                            "to", List.of(to),
                            "subject", subject,
                            "html", html))
                    .retrieve()
                    .toBodilessEntity();
        } catch (RuntimeException ex) {
            // Não derruba o cadastro/reset: o usuário pode solicitar reenvio.
            log.error("Falha ao enviar e-mail transacional para {}: {}", to, ex.getMessage());
        }
    }

    private static String escape(String value) {
        return value == null ? "" : value
                .replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
                .replace("\"", "&quot;");
    }
}
