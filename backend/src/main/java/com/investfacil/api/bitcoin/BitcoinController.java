package com.investfacil.api.bitcoin;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/bitcoin")
public class BitcoinController {

    private final BitcoinMarketService market;

    public BitcoinController(BitcoinMarketService market) {
        this.market = market;
    }

    @GetMapping("/market")
    public BitcoinMarketDtos.BitcoinMarketResponse market() {
        return market.market();
    }
}
