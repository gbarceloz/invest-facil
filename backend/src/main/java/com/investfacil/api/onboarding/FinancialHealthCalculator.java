package com.investfacil.api.onboarding;

import com.investfacil.api.onboarding.OnboardingDtos.AnswersRequest;
import com.investfacil.api.onboarding.OnboardingDtos.FinancialHealthView;
import com.investfacil.api.onboarding.OnboardingDtos.ScoreFactorView;
import com.investfacil.api.onboarding.OnboardingTypes.EmergencyReserve;
import com.investfacil.api.onboarding.OnboardingTypes.HealthBand;
import com.investfacil.api.onboarding.OnboardingTypes.HighInterestDebt;
import com.investfacil.api.onboarding.OnboardingTypes.KnowledgeLevel;
import com.investfacil.api.onboarding.OnboardingTypes.Opportunity;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

/**
 * Índice educativo de saúde financeira, determinístico e sem promessa de
 * retorno. O cálculo usa quatro pilares e normaliza apenas os pilares
 * respondidos, para não punir quem escolheu não informar um dado.
 *
 * <p>Pesos: reserva de emergência 30, dívidas caras 25, capacidade de poupança
 * 25 e comprometimento das despesas essenciais 20. A nota é
 * {@code round(pontos * 100 / pesoRespondido)}. Sem nenhum pilar respondido, a
 * nota é {@code null} e a faixa é {@code SEM_DADOS}.</p>
 *
 * <p>Faixas: 0–39 ATENCAO, 40–59 CONSTRUINDO, 60–79 ORGANIZANDO,
 * 80–100 CONSOLIDADO.</p>
 */
@Component
public class FinancialHealthCalculator {

    private static final int RESERVE_WEIGHT = 30;
    private static final int DEBT_WEIGHT = 25;
    private static final int SAVINGS_WEIGHT = 25;
    private static final int EXPENSES_WEIGHT = 20;

    public FinancialHealthView calculate(AnswersRequest answers) {
        Long monthlySavings = monthlySavingsCents(answers);
        Long emergencyGoal = answers.essentialExpensesCents() == null
                ? null
                : Math.multiplyExact(answers.essentialExpensesCents(), 6L);

        List<ScoreFactorView> factors = new ArrayList<>(4);
        factors.add(reserveFactor(answers.emergencyReserve()));
        factors.add(debtFactor(answers.highInterestDebt()));
        factors.add(savingsFactor(answers.incomeCents(), monthlySavings));
        factors.add(expenseFactor(answers.incomeCents(), answers.essentialExpensesCents()));

        int points = factors.stream()
                .filter(ScoreFactorView::answered)
                .mapToInt(ScoreFactorView::points)
                .sum();
        int availableWeight = factors.stream()
                .filter(ScoreFactorView::answered)
                .mapToInt(ScoreFactorView::maxPoints)
                .sum();
        Integer score = availableWeight == 0
                ? null
                : (int) Math.round(points * 100.0 / availableWeight);

        HealthBand band = band(score);
        Opportunity opportunity = opportunity(answers, monthlySavings);

        return new FinancialHealthView(
                score,
                band.name(),
                bandLabel(band),
                opportunity.name(),
                opportunityLabel(opportunity),
                recommendation(opportunity),
                monthlySavings,
                emergencyGoal,
                List.copyOf(factors));
    }

    /**
     * Economia mensal: usa a capacidade de poupança informada; se ela não foi
     * informada, deriva de renda menos despesas essenciais. Nunca inventa um
     * valor quando os dois dados não existem.
     */
    public static Long monthlySavingsCents(AnswersRequest answers) {
        if (answers.savingsCapacityCents() != null) {
            return answers.savingsCapacityCents();
        }
        if (answers.incomeCents() != null && answers.essentialExpensesCents() != null) {
            return Math.max(0L, answers.incomeCents() - answers.essentialExpensesCents());
        }
        return null;
    }

    private ScoreFactorView reserveFactor(EmergencyReserve reserve) {
        if (reserve == null || reserve == EmergencyReserve.PREFER_NOT) {
            return unanswered("reserve", "Reserva de emergência", RESERVE_WEIGHT,
                    "Não informado — este fator não entra na conta.");
        }
        int points = switch (reserve) {
            case NONE -> 0;
            case LESS_THAN_1 -> 6;
            case ONE_TO_3 -> 15;
            case THREE_TO_6 -> 24;
            case MORE_THAN_6 -> 30;
            case PREFER_NOT -> 0;
        };
        String detail = switch (reserve) {
            case NONE -> "Sem reserva de emergência hoje.";
            case LESS_THAN_1 -> "Reserva de menos de 1 mês.";
            case ONE_TO_3 -> "Reserva de 1 a 3 meses.";
            case THREE_TO_6 -> "Reserva de 3 a 6 meses.";
            case MORE_THAN_6 -> "Reserva acima de 6 meses.";
            case PREFER_NOT -> "";
        };
        return new ScoreFactorView("reserve", "Reserva de emergência", true,
                points, RESERVE_WEIGHT, detail);
    }

    private ScoreFactorView debtFactor(HighInterestDebt debt) {
        if (debt == null || debt == HighInterestDebt.PREFER_NOT) {
            return unanswered("debt", "Dívidas caras", DEBT_WEIGHT,
                    "Não informado — este fator não entra na conta.");
        }
        int points = switch (debt) {
            case NONE -> 25;
            case LOANS -> 12;
            case CREDIT_CARD -> 6;
            case OVERDRAFT -> 4;
            case MULTIPLE -> 0;
            case PREFER_NOT -> 0;
        };
        String detail = switch (debt) {
            case NONE -> "Sem dívidas de juros altos.";
            case LOANS -> "Empréstimos com juros altos.";
            case CREDIT_CARD -> "Dívida de cartão de crédito.";
            case OVERDRAFT -> "Cheque especial em uso.";
            case MULTIPLE -> "Várias dívidas de juros altos.";
            case PREFER_NOT -> "";
        };
        return new ScoreFactorView("debt", "Dívidas caras", true,
                points, DEBT_WEIGHT, detail);
    }

    private ScoreFactorView savingsFactor(Long incomeCents, Long monthlySavingsCents) {
        if (incomeCents == null || incomeCents <= 0 || monthlySavingsCents == null) {
            return unanswered("savingsRate", "Capacidade de poupar", SAVINGS_WEIGHT,
                    "Informe renda e capacidade de poupança para calcular.");
        }
        double rate = monthlySavingsCents * 100.0 / incomeCents;
        int points = rate >= 20 ? 25 : rate >= 10 ? 20 : rate >= 5 ? 14 : rate > 0 ? 8 : 0;
        String detail = String.format(Locale.ROOT,
                "Você poupa cerca de %d%% da renda.", Math.round(rate));
        return new ScoreFactorView("savingsRate", "Capacidade de poupar", true,
                points, SAVINGS_WEIGHT, detail);
    }

    private ScoreFactorView expenseFactor(Long incomeCents, Long essentialExpensesCents) {
        if (incomeCents == null || incomeCents <= 0 || essentialExpensesCents == null) {
            return unanswered("expenseRatio", "Despesas essenciais", EXPENSES_WEIGHT,
                    "Informe renda e despesas essenciais para calcular.");
        }
        double ratio = essentialExpensesCents * 100.0 / incomeCents;
        int points = ratio <= 50 ? 20 : ratio <= 70 ? 15 : ratio <= 85 ? 8 : ratio <= 100 ? 4 : 0;
        String detail = String.format(Locale.ROOT,
                "As despesas essenciais consomem cerca de %d%% da renda.", Math.round(ratio));
        return new ScoreFactorView("expenseRatio", "Despesas essenciais", true,
                points, EXPENSES_WEIGHT, detail);
    }

    private ScoreFactorView unanswered(String key, String label, int weight, String detail) {
        return new ScoreFactorView(key, label, false, 0, weight, detail);
    }

    private HealthBand band(Integer score) {
        if (score == null) {
            return HealthBand.SEM_DADOS;
        }
        if (score <= 39) {
            return HealthBand.ATENCAO;
        }
        if (score <= 59) {
            return HealthBand.CONSTRUINDO;
        }
        if (score <= 79) {
            return HealthBand.ORGANIZANDO;
        }
        return HealthBand.CONSOLIDADO;
    }

    private Opportunity opportunity(AnswersRequest answers, Long monthlySavingsCents) {
        HighInterestDebt debt = answers.highInterestDebt();
        if (debt == HighInterestDebt.CREDIT_CARD
                || debt == HighInterestDebt.OVERDRAFT
                || debt == HighInterestDebt.MULTIPLE) {
            return Opportunity.QUITAR_DIVIDA;
        }
        EmergencyReserve reserve = answers.emergencyReserve();
        if (reserve == EmergencyReserve.NONE || reserve == EmergencyReserve.LESS_THAN_1) {
            return Opportunity.MONTAR_RESERVA;
        }
        boolean lowSavings = answers.incomeCents() != null
                && answers.incomeCents() > 0
                && monthlySavingsCents != null
                && monthlySavingsCents * 100.0 / answers.incomeCents() < 10;
        if (lowSavings) {
            return Opportunity.AUMENTAR_POUPANCA;
        }
        KnowledgeLevel knowledge = answers.knowledgeLevel();
        if (knowledge == KnowledgeLevel.ZERO || knowledge == KnowledgeLevel.BASIC) {
            return Opportunity.APRENDER_BASE;
        }
        return Opportunity.INVESTIR_COM_CRITERIO;
    }

    private String bandLabel(HealthBand band) {
        return switch (band) {
            case SEM_DADOS -> "Sem dados suficientes";
            case ATENCAO -> "Atenção";
            case CONSTRUINDO -> "Construindo";
            case ORGANIZANDO -> "Organizando";
            case CONSOLIDADO -> "Consolidado";
        };
    }

    private String opportunityLabel(Opportunity opportunity) {
        return switch (opportunity) {
            case QUITAR_DIVIDA -> "Quitar dívidas caras";
            case MONTAR_RESERVA -> "Montar sua reserva";
            case AUMENTAR_POUPANCA -> "Aumentar a poupança mensal";
            case APRENDER_BASE -> "Firmar a base";
            case INVESTIR_COM_CRITERIO -> "Investir com critério";
        };
    }

    private String recommendation(Opportunity opportunity) {
        return switch (opportunity) {
            case QUITAR_DIVIDA ->
                    "Priorize quitar dívidas de cartão de crédito, cheque especial ou "
                            + "empréstimos com juros altos antes de investir. Comparar o custo "
                            + "da dívida com o retorno esperado de um investimento é o primeiro passo.";
            case MONTAR_RESERVA ->
                    "Comece pela reserva de emergência. Ela evita que imprevistos virem "
                            + "dívidas e dá tempo para decidir com calma. Uma referência comum é "
                            + "acumular de 3 a 6 meses de despesas essenciais.";
            case AUMENTAR_POUPANCA ->
                    "Sua reserva já tem alguma base. O próximo passo é aumentar a diferença "
                            + "entre o que entra e o que sai todo mês, antes de assumir mais risco.";
            case APRENDER_BASE ->
                    "Antes de escolher produtos, entenda o básico: juros compostos, inflação, "
                            + "risco e liquidez. A aula 01 da trilha é um bom ponto de partida.";
            case INVESTIR_COM_CRITERIO ->
                    "Você já organizou a base. Agora o foco é consistência: aportes regulares, "
                            + "diversificação e decisões alinhadas aos seus objetivos — sem "
                            + "promessas de rentabilidade.";
        };
    }
}
