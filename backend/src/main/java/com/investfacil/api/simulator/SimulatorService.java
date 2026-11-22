package com.investfacil.api.simulator;

import com.investfacil.api.common.error.BusinessException;
import com.investfacil.api.gamification.GamificationService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
public class SimulatorService {

    public static final String DISCLAIMER =
            "Simulação educativa com taxa hipotética. Não representa garantia, promessa ou "
                    + "projeção de retorno. Rentabilidade passada não garante resultados futuros.";

    private final SimulationRepository repository;
    private final GamificationService gamification;

    public SimulatorService(SimulationRepository repository, GamificationService gamification) {
        this.repository = repository;
        this.gamification = gamification;
    }

    public SimulatorDtos.ScenarioResult calculate(SimulatorDtos.ScenarioRequest request) {
        BigDecimal initial = request.initialAmount();
        BigDecimal contribution = request.monthlyContribution() == null
                ? BigDecimal.ZERO : request.monthlyContribution();
        BigDecimal annualRate = request.annualRate();
        BigDecimal inflation = request.inflationRate() == null
                ? BigDecimal.ZERO : request.inflationRate();
        int months = request.months();

        double monthlyRate = Math.pow(1 + annualRate.doubleValue() / 100.0, 1.0 / 12.0) - 1;
        double monthlyInflation = Math.pow(1 + inflation.doubleValue() / 100.0, 1.0 / 12.0) - 1;

        double balance = initial.doubleValue();
        double contributed = initial.doubleValue();
        List<SimulatorDtos.ScenarioPoint> series = new ArrayList<>();
        series.add(point(0, contributed, balance, monthlyInflation));

        for (int month = 1; month <= months; month++) {
            balance = balance * (1 + monthlyRate) + contribution.doubleValue();
            contributed += contribution.doubleValue();
            // Série mensal (máximo 600 pontos) para o gráfico de evolução.
            series.add(point(month, contributed, balance, monthlyInflation));
        }

        BigDecimal invested = money(contributed);
        BigDecimal finalAmount = money(balance);
        BigDecimal interest = money(balance - contributed);
        BigDecimal realFinal = money(balance / Math.pow(1 + monthlyInflation, months));
        return new SimulatorDtos.ScenarioResult(finalAmount, invested, interest, realFinal,
                BigDecimal.valueOf(monthlyRate * 100).setScale(4, RoundingMode.HALF_UP),
                series, DISCLAIMER);
    }

    @Transactional
    public SimulatorDtos.SavedScenario save(UUID userId, SimulatorDtos.SaveScenarioRequest request) {
        SimulatorDtos.ScenarioResult result = calculate(request.scenario());
        Simulation entity = new Simulation();
        entity.setUserId(userId);
        entity.setName(request.name().trim());
        entity.setInitialAmount(request.scenario().initialAmount());
        entity.setMonthlyContribution(request.scenario().monthlyContribution() == null
                ? BigDecimal.ZERO : request.scenario().monthlyContribution());
        entity.setMonths(request.scenario().months());
        entity.setAnnualRate(request.scenario().annualRate());
        entity.setInflationRate(request.scenario().inflationRate() == null
                ? BigDecimal.ZERO : request.scenario().inflationRate());
        entity.setFinalAmount(result.finalAmount());
        entity.setInvestedAmount(result.investedAmount());
        repository.save(entity);
        gamification.unlockByCode(userId, "FIRST_SIMULATION");
        return view(entity);
    }

    @Transactional(readOnly = true)
    public List<SimulatorDtos.SavedScenario> list(UUID userId) {
        return repository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(this::view)
                .toList();
    }

    @Transactional
    public void delete(UUID userId, UUID id) {
        Simulation entity = repository.findById(id)
                .filter(simulation -> simulation.getUserId().equals(userId))
                .orElseThrow(() -> BusinessException.notFound("Simulação não encontrada."));
        repository.delete(entity);
    }

    private SimulatorDtos.SavedScenario view(Simulation entity) {
        return new SimulatorDtos.SavedScenario(entity.getId(), entity.getName(),
                new SimulatorDtos.ScenarioRequest(entity.getInitialAmount(),
                        entity.getMonthlyContribution(), entity.getMonths(),
                        entity.getAnnualRate(), entity.getInflationRate()),
                entity.getFinalAmount(), entity.getInvestedAmount(), entity.getCreatedAt());
    }

    private static SimulatorDtos.ScenarioPoint point(int month, double contributed,
                                                     double balance, double monthlyInflation) {
        double real = balance / Math.pow(1 + monthlyInflation, month);
        return new SimulatorDtos.ScenarioPoint(month, money(contributed), money(balance),
                money(real));
    }

    private static BigDecimal money(double value) {
        return BigDecimal.valueOf(value).setScale(2, RoundingMode.HALF_UP);
    }
}
