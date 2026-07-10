package com.nimda.cite.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.http.Cookie;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;

import java.util.concurrent.atomic.AtomicInteger;

import static org.junit.jupiter.api.Assertions.assertEquals;

class UnsafeRequestOriginFilterTest {

    private final UnsafeRequestOriginFilter filter = new UnsafeRequestOriginFilter();

    @ParameterizedTest
    @ValueSource(strings = {"GET", "HEAD", "OPTIONS"})
    void permitsSafeMethodsAndOptions(String method) throws Exception {
        MockHttpServletRequest request = cookieAuthenticatedRequest(method);
        request.addHeader("Origin", "https://attacker.example");

        FilterResult result = filter(request);

        assertEquals(1, result.chainInvocations());
        assertEquals(200, result.response().getStatus());
    }

    @ParameterizedTest
    @ValueSource(strings = {"POST", "PUT", "PATCH", "DELETE"})
    void rejectsGuardedMethodsFromAnUntrustedOrigin(String method) throws Exception {
        MockHttpServletRequest request = cookieAuthenticatedRequest(method);
        request.addHeader("Origin", "https://attacker.example");

        FilterResult result = filter(request);

        assertEquals(0, result.chainInvocations());
        assertEquals(403, result.response().getStatus());
    }

    @ParameterizedTest
    @ValueSource(strings = {
            "https://nimda.kr",
            "https://www.nimda.kr",
            "http://localhost:3000",
            "http://127.0.0.1:3000"
    })
    void permitsEachTrustedOrigin(String origin) throws Exception {
        MockHttpServletRequest request = cookieAuthenticatedRequest("POST");
        request.addHeader("Origin", origin);

        FilterResult result = filter(request);

        assertEquals(1, result.chainInvocations());
        assertEquals(200, result.response().getStatus());
    }

    @Test
    void requiresAnExactTrustedOriginMatch() throws Exception {
        MockHttpServletRequest request = cookieAuthenticatedRequest("POST");
        request.addHeader("Origin", "https://nimda.kr/");

        FilterResult result = filter(request);

        assertEquals(0, result.chainInvocations());
        assertEquals(403, result.response().getStatus());
    }

    @Test
    void rejectsCrossSiteFetchWhenOriginIsAbsent() throws Exception {
        MockHttpServletRequest request = cookieAuthenticatedRequest("POST");
        request.addHeader("Sec-Fetch-Site", "cross-site");

        FilterResult result = filter(request);

        assertEquals(0, result.chainInvocations());
        assertEquals(403, result.response().getStatus());
    }

    @Test
    void permitsCookieAuthenticatedRequestWithoutBrowserOriginSignals() throws Exception {
        MockHttpServletRequest request = cookieAuthenticatedRequest("POST");

        FilterResult result = filter(request);

        assertEquals(1, result.chainInvocations());
        assertEquals(200, result.response().getStatus());
    }

    @Test
    void permitsCookieAuthenticatedSameSiteFetchWhenOriginIsAbsent() throws Exception {
        MockHttpServletRequest request = cookieAuthenticatedRequest("POST");
        request.addHeader("Sec-Fetch-Site", "same-origin");

        FilterResult result = filter(request);

        assertEquals(1, result.chainInvocations());
        assertEquals(200, result.response().getStatus());
    }

    @Test
    void rejectsUnsafeCrossSiteRequestsWithoutAnAuthenticationCookie() throws Exception {
        MockHttpServletRequest request = new MockHttpServletRequest("POST", "/api/auth/login");
        request.addHeader("Origin", "https://attacker.example");
        request.addHeader("Sec-Fetch-Site", "cross-site");

        FilterResult result = filter(request);

        assertEquals(0, result.chainInvocations());
        assertEquals(403, result.response().getStatus());
    }

    private MockHttpServletRequest cookieAuthenticatedRequest(String method) {
        MockHttpServletRequest request = new MockHttpServletRequest(method, "/api/cite/board");
        request.setCookies(new Cookie("Authorization", "token"));
        return request;
    }

    private FilterResult filter(MockHttpServletRequest request) throws Exception {
        MockHttpServletResponse response = new MockHttpServletResponse();
        AtomicInteger chainInvocations = new AtomicInteger();
        FilterChain chain = (servletRequest, servletResponse) -> chainInvocations.incrementAndGet();

        filter.doFilter(request, response, chain);

        return new FilterResult(response, chainInvocations.get());
    }

    private record FilterResult(MockHttpServletResponse response, int chainInvocations) {
    }
}
