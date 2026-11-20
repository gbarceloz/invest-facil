package com.investfacil.api.common.web;

import com.investfacil.api.config.AppProperties;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;

import static org.junit.jupiter.api.Assertions.assertEquals;

class ClientIpResolverTest {

    @Test
    void shouldIgnoreForwardedHeaderWhenProxyIsNotTrusted() {
        AppProperties properties = new AppProperties();
        properties.getSecurity().setTrustProxy(false);
        ClientIpResolver resolver = new ClientIpResolver(properties);
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.setRemoteAddr("10.0.0.10");
        request.addHeader("X-Forwarded-For", "203.0.113.9");
        assertEquals("10.0.0.10", resolver.resolve(request));
    }

    @Test
    void shouldUseRightmostUntrustedAddressBehindTrustedProxy() {
        AppProperties properties = new AppProperties();
        properties.getSecurity().setTrustProxy(true);
        properties.getSecurity().setTrustedProxies("10.0.0.10,10.0.0.11");
        ClientIpResolver resolver = new ClientIpResolver(properties);
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.setRemoteAddr("10.0.0.10");
        request.addHeader("X-Forwarded-For", "198.51.100.7, 10.0.0.11");
        assertEquals("198.51.100.7", resolver.resolve(request));
    }

    @Test
    void shouldNotTrustForwardedHeaderFromUnknownPeer() {
        AppProperties properties = new AppProperties();
        properties.getSecurity().setTrustProxy(true);
        properties.getSecurity().setTrustedProxies("10.0.0.10");
        ClientIpResolver resolver = new ClientIpResolver(properties);
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.setRemoteAddr("198.51.100.7");
        request.addHeader("X-Forwarded-For", "203.0.113.50");
        assertEquals("198.51.100.7", resolver.resolve(request));
    }
}
