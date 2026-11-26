package com.investfacil.api.onboarding;

/**
 * Vocabulário fechado do onboarding. Os nomes são persistidos e também usados
 * como contrato público da API; não renomeie valores sem migration.
 */
public final class OnboardingTypes {

    private OnboardingTypes() {
    }

    public enum Goal {
        DEBT, INVEST, MULTIPLY, ORGANIZE, WEALTH
    }

    public enum FinancialSituation {
        IN_DEBT, FROM_ZERO, CAN_SAVE, INVESTOR
    }

    public enum EmergencyReserve {
        NONE, LESS_THAN_1, ONE_TO_3, THREE_TO_6, MORE_THAN_6, PREFER_NOT
    }

    public enum HighInterestDebt {
        NONE, CREDIT_CARD, OVERDRAFT, LOANS, MULTIPLE, PREFER_NOT
    }

    public enum LearningPreference {
        VIDEOS, TEXTS, PRACTICE, MIX
    }

    public enum KnowledgeLevel {
        ZERO, BASIC, INTERMEDIATE, ADVANCED
    }

    public enum SpendingTrigger {
        DELIVERY, SHOPPING, SOCIAL, SUBSCRIPTIONS, IMPULSE, NONE
    }

    public enum StudyDay {
        MON, TUE, WED, THU, FRI, SAT, SUN
    }

    public enum HealthBand {
        SEM_DADOS, ATENCAO, CONSTRUINDO, ORGANIZANDO, CONSOLIDADO
    }

    public enum Opportunity {
        QUITAR_DIVIDA, MONTAR_RESERVA, AUMENTAR_POUPANCA, APRENDER_BASE,
        INVESTIR_COM_CRITERIO
    }
}
