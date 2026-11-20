package com.investfacil.api.market;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.investfacil.api.config.AppProperties;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.util.UriComponentsBuilder;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.util.List;

/**
 * Cotações informativas BTC/ETH/SOL via Binance + câmbio USD/BRL.
 * Cache em memória de 30 s; em falha, devolve snapshot de referência com
 * status UNAVAILABLE — a UI deve deixar claro que o dado está indisponível.
 * A plataforma NÃO executa ordens e NÃO recomenda ativos.
 */
@Service
public class MarketService {

    private static final Logger log = LoggerFactory.getLogger(MarketService.class);
    private static final String DISCLAIMER =
            "Dados apenas informativos e educativos. Não constituem recomendação de investimento. "
                    + "A plataforma não executa ordens nem custodia valores.";

    private record Cache(MarketDtos.MarketResponse response, Instant expiresAt) {
    }

    private record BinanceTicker(String symbol,
                                 @JsonProperty("lastPrice") String lastPrice,
                                 @JsonProperty("priceChangePercent") String priceChangePercent,
                                 @JsonProperty("quoteVolume") String quoteVolume) {
    }

    private record FxResponse(java.util.Map<String, BigDecimal> rates) {
    }

    private final AppProperties properties;
    private final RestClient client;
    private volatile Cache cache;

    public MarketService(AppProperties properties) {
        this.properties = properties;
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(2000);
        factory.setReadTimeout(5000);
        this.client = RestClient.builder().requestFactory(factory).build();
    }

    public MarketDtos.MarketResponse assets() {
        Cache current = cache;
        if (current != null && current.expiresAt().isAfter(Instant.now())) {
            return current.response();
        }
        MarketDtos.MarketResponse response = fetch();
        cache = new Cache(response, Instant.now().plusSeconds(properties.getMarket().getCacheSeconds()));
        return response;
    }

    private MarketDtos.MarketResponse fetch() {
        if (!properties.getMarket().isEnabled()) {
            return fallback();
        }
        try {
            String symbols = "[\"BTCUSDT\",\"ETHUSDT\",\"SOLUSDT\"]";
            var uri = UriComponentsBuilder.fromUriString(properties.getMarket().getBaseUrl())
                    .path("/api/v3/ticker/24hr")
                    .queryParam("symbols", symbols)
                    .build()
                    .encode()
                    .toUri();
            BinanceTicker[] tickers = client.get().uri(uri).retrieve().body(BinanceTicker[].class);
            BigDecimal fx = fetchFx();
            if (tickers == null || tickers.length == 0) {
                return fallback();
            }
            List<MarketDtos.AssetView> assets = java.util.Arrays.stream(tickers)
                    .map(ticker -> toView(ticker, fx))
                    .toList();
            return new MarketDtos.MarketResponse(assets, "FRESH", Instant.now(), DISCLAIMER);
        } catch (RuntimeException ex) {
            log.warn("Cotações indisponíveis: {}", ex.getMessage());
            return fallback();
        }
    }

    private BigDecimal fetchFx() {
        try {
            FxResponse response = client.get()
                    .uri(properties.getMarket().getFxUrl())
                    .retrieve()
                    .body(FxResponse.class);
            if (response != null && response.rates() != null
                    && response.rates().get("BRL") != null) {
                return response.rates().get("BRL");
            }
        } catch (RuntimeException ex) {
            log.warn("Câmbio USD/BRL indisponível: {}", ex.getMessage());
        }
        return new BigDecimal("5.00");
    }

    private MarketDtos.AssetView toView(BinanceTicker ticker, BigDecimal fx) {
        BigDecimal usd = new BigDecimal(ticker.lastPrice());
        BigDecimal priceBrl = usd.multiply(fx).setScale(2, RoundingMode.HALF_UP);
        BigDecimal change = new BigDecimal(ticker.priceChangePercent()).setScale(2, RoundingMode.HALF_UP);
        BigDecimal volume = new BigDecimal(ticker.quoteVolume()).multiply(fx)
                .setScale(2, RoundingMode.HALF_UP);
        return new MarketDtos.AssetView(ticker.symbol().replace("USDT", ""),
                displayName(ticker.symbol()), priceBrl, change, volume);
    }

    private static String displayName(String symbol) {
        return switch (symbol) {
            case "BTCUSDT" -> "Bitcoin";
            case "ETHUSDT" -> "Ethereum";
            case "SOLUSDT" -> "Solana";
            default -> symbol;
        };
    }

    private MarketDtos.MarketResponse fallback() {
        return new MarketDtos.MarketResponse(List.of(
                new MarketDtos.AssetView("BTC", "Bitcoin", new BigDecimal("342180.40"),
                        new BigDecimal("2.40"), new BigDecimal("0")),
                new MarketDtos.AssetView("ETH", "Ethereum", new BigDecimal("18420.10"),
                        new BigDecimal("1.80"), new BigDecimal("0")),
                new MarketDtos.AssetView("SOL", "Solana", new BigDecimal("742.30"),
                        new BigDecimal("-0.60"), new BigDecimal("0"))),
                "UNAVAILABLE", Instant.now(), DISCLAIMER);
    }
}
