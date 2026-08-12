package com.nimda.cite.common.util;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

class JwtUtilTest {

    private JwtUtil jwtUtil;

    @BeforeEach
    void setUp() {
        jwtUtil = new JwtUtil();
        ReflectionTestUtils.setField(
                jwtUtil,
                "secret",
                "c2lsdmVybmluZGEyMDI2bmltZGFjb25wcm9qZWN0c2VjcmV0a2V5Z2VuZXJhdG9yc2FmZWJhc2U2NA==");
        ReflectionTestUtils.setField(jwtUtil, "expiration", 60_000L);
        jwtUtil.init();
    }

    @Test
    void generatedApplicationTokenCarriesIdentityAndAuthVersion() {
        String token = jwtUtil.generateToken("auditor", 42L, 7, List.of("ROLE_USER"));
        JwtUtil.AuthenticationClaims claims = jwtUtil.extractAuthenticationClaims(token);

        assertEquals(42L, claims.userId());
        assertEquals(7, claims.authVersion());
        assertEquals(42L, jwtUtil.extractUserId(token));
        assertEquals(7, jwtUtil.extractAuthVersion(token));
        assertEquals("auditor", jwtUtil.extractNickname(token));
        assertTrue(jwtUtil.validateToken(token, "auditor"));
    }
}
