package com.investfacil.api.bitcoin;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

public final class BitcoinMarketDtos {

    private BitcoinMarketDtos() {
    }

    public record Point(long timestamp, BigDecimal price) {
    }

    public record BitcoinMarketResponse(
            String asset,
            String source,
            String status,
            Instant updatedAt,
            BigDecimal priceUsd,
            BigDecimal priceBrl,
            BigDecimal change24hPercent,
            BigDecimal marketCapUsd,
            BigDecimal marketCapBrl,
            BigDecimal volume24hUsd,
            BigDecimal volume24hBrl,
            List<Point> chart24h,
            List<Point> chart7d,
            String disclaimer) {
    }
}
