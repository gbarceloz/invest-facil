package com.investfacil.api.bitcoin;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.investfacil.api.config.AppProperties;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.util.UriComponentsBuilder;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

/**
 * Mercado Bitcoin via CoinGecko. O endpoint é público e não usa API key.
 * O backend faz cache e devolve UNAVAILABLE/STALE sem inventar números.
 */
@Service
public class BitcoinMarketService {

    private static final Logger log = LoggerFactory.getLogger(BitcoinMarketService.class);
    private static final String SOURCE = "CoinGecko";
    private static final String DISCLAIMER =
            "Dados de mercado apenas informativos e educativos. Não constituem recomendação "
                    + "de investimento. A plataforma não executa ordens nem custodia valores.";

    private record SimplePrice(
            BigDecimal usd,
            BigDecimal brl,
            @JsonProperty("usd_24h_change") BigDecimal usd24hChange,
            @JsonProperty("brl_24h_change") BigDecimal brl24hChange,
            @JsonProperty("usd_market_cap") BigDecimal usdMarketCap,
            @JsonProperty("brl_market_cap") BigDecimal brlMarketCap,
            @JsonProperty("usd_24h_vol") BigDecimal usd24hVol,
            @JsonProperty("brl_24h_vol") BigDecimal brl24hVol,
            @JsonProperty("last_updated_at") Long lastUpdatedAt) {
    }

    private record SimplePriceResponse(SimplePrice bitcoin) {
    }

    private record Chart(List<List<BigDecimal>> prices) {
    }

    private record Cache(BitcoinMarketDtos.BitcoinMarketResponse response, Instant expiresAt) {
    }

    private final AppProperties properties;
    private final RestClient client;
    private volatile Cache cache;
    private volatile BitcoinMarketDtos.BitcoinMarketResponse lastSuccess;

    public BitcoinMarketService(AppProperties properties) {
        this.properties = properties;
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(3000);
        factory.setReadTimeout(8000);
        this.client = RestClient.builder()
                .requestFactory(factory)
                .defaultHeader("Accept", "application/json")
                .defaultHeader("User-Agent", "InvestFacil/1.0 (educational)")
                .build();
    }

    public BitcoinMarketDtos.BitcoinMarketResponse market() {
        Cache current = cache;
        Instant now = Instant.now();
        if (current != null && current.expiresAt().isAfter(now)) {
            return current.response();
        }

        BitcoinMarketDtos.BitcoinMarketResponse response = fetch();
        long ttl = "FRESH".equals(response.status())
                ? Math.max(30, properties.getBitcoin().getCacheSeconds())
                : 30;
        cache = new Cache(response, now.plusSeconds(ttl));
        if ("FRESH".equals(response.status())) {
            lastSuccess = response;
        }
        return response;
    }

    private BitcoinMarketDtos.BitcoinMarketResponse fetch() {
        if (!properties.getBitcoin().isEnabled()) {
            return unavailable();
        }
        try {
            SimplePriceResponse simple = client.get()
                    .uri(simplePriceUri())
                    .retrieve()
                    .body(SimplePriceResponse.class);
            if (simple == null || simple.bitcoin() == null) {
                return staleOrUnavailable();
            }

            List<BitcoinMarketDtos.Point> chart24h = chart(1);
            List<BitcoinMarketDtos.Point> chart7d = chart(7);
            SimplePrice price = simple.bitcoin();
            Instant updatedAt = price.lastUpdatedAt() != null
                    ? Instant.ofEpochSecond(price.lastUpdatedAt())
                    : Instant.now();

            return new BitcoinMarketDtos.BitcoinMarketResponse(
                    "Bitcoin", SOURCE, "FRESH", updatedAt,
                    price.usd(), price.brl(), price.usd24hChange(),
                    price.usdMarketCap(), price.brlMarketCap(),
                    price.usd24hVol(), price.brl24hVol(),
                    chart24h, chart7d, DISCLAIMER);
        } catch (RuntimeException ex) {
            log.warn("Mercado Bitcoin indisponível: {}", ex.getMessage());
            return staleOrUnavailable();
        }
    }

    private String simplePriceUri() {
        return UriComponentsBuilder.fromUriString(properties.getBitcoin().getBaseUrl())
                .path("/simple/price")
                .queryParam("ids", "bitcoin")
                .queryParam("vs_currencies", "usd,brl")
                .queryParam("include_24hr_change", "true")
                .queryParam("include_market_cap", "true")
                .queryParam("include_24hr_vol", "true")
                .queryParam("include_last_updated_at", "true")
                .build()
                .encode()
                .toUriString();
    }

    private List<BitcoinMarketDtos.Point> chart(int days) {
        String uri = UriComponentsBuilder.fromUriString(properties.getBitcoin().getBaseUrl())
                .path("/coins/bitcoin/market_chart")
                .queryParam("vs_currency", "usd")
                .queryParam("days", days)
                .build()
                .encode()
                .toUriString();
        Chart response = client.get().uri(uri).retrieve().body(Chart.class);
        if (response == null || response.prices() == null) {
            return List.of();
        }
        List<BitcoinMarketDtos.Point> points = new ArrayList<>();
        for (List<BigDecimal> row : response.prices()) {
            if (row != null && row.size() >= 2 && row.get(0) != null && row.get(1) != null) {
                points.add(new BitcoinMarketDtos.Point(row.get(0).longValue(), row.get(1)));
            }
        }
        return points;
    }

    private BitcoinMarketDtos.BitcoinMarketResponse staleOrUnavailable() {
        BitcoinMarketDtos.BitcoinMarketResponse previous = lastSuccess;
        if (previous != null) {
            return new BitcoinMarketDtos.BitcoinMarketResponse(
                    previous.asset(), previous.source(), "STALE", previous.updatedAt(),
                    previous.priceUsd(), previous.priceBrl(), previous.change24hPercent(),
                    previous.marketCapUsd(), previous.marketCapBrl(),
                    previous.volume24hUsd(), previous.volume24hBrl(),
                    previous.chart24h(), previous.chart7d(), previous.disclaimer());
        }
        return unavailable();
    }

    private BitcoinMarketDtos.BitcoinMarketResponse unavailable() {
        return new BitcoinMarketDtos.BitcoinMarketResponse(
                "Bitcoin", SOURCE, "UNAVAILABLE", null,
                null, null, null, null, null, null, null,
                List.of(), List.of(), DISCLAIMER);
    }
}
