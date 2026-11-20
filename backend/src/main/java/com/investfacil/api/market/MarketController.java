package com.investfacil.api.market;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/market")
public class MarketController {

    private final MarketService market;

    public MarketController(MarketService market) {
        this.market = market;
    }

    @GetMapping("/assets")
    public MarketDtos.MarketResponse assets() {
        return market.assets();
    }
}
