package com.investfacil.api.market;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

public final class MarketDtos {

    private MarketDtos() {
    }

    public record AssetView(String symbol, String name, BigDecimal priceBrl,
                            BigDecimal change24hPercent, BigDecimal volume24hBrl) {
    }

    public record MarketResponse(List<AssetView> assets, String status, Instant updatedAt,
                                 String disclaimer) {
    }
}
