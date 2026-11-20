package com.investfacil.api.simulator;

import com.investfacil.api.common.security.CurrentUser;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/simulator")
public class SimulatorController {

    private final SimulatorService simulator;

    public SimulatorController(SimulatorService simulator) {
        this.simulator = simulator;
    }

    @PostMapping("/calculate")
    public SimulatorDtos.ScenarioResult calculate(
            @Valid @RequestBody SimulatorDtos.ScenarioRequest request) {
        return simulator.calculate(request);
    }

    @PostMapping("/scenarios")
    public ResponseEntity<SimulatorDtos.SavedScenario> save(
            @AuthenticationPrincipal CurrentUser principal,
            @Valid @RequestBody SimulatorDtos.SaveScenarioRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(simulator.save(principal.id(), request));
    }

    @GetMapping("/scenarios")
    public List<SimulatorDtos.SavedScenario> list(@AuthenticationPrincipal CurrentUser principal) {
        return simulator.list(principal.id());
    }

    @DeleteMapping("/scenarios/{id}")
    public ResponseEntity<Void> delete(@AuthenticationPrincipal CurrentUser principal,
                                       @PathVariable UUID id) {
        simulator.delete(principal.id(), id);
        return ResponseEntity.noContent().build();
    }
}
