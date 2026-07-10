package com.nimda.cite.config;

import com.nimda.cite.common.util.JwtUtil;
import com.nimda.cite.user.entity.User;
import com.nimda.cite.user.enums.ApprovalStatus;
import com.nimda.cite.user.repository.UserRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.http.Cookie;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Optional;
import java.util.concurrent.atomic.AtomicInteger;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class JwtAuthenticationFilterTest {

    @Mock
    private JwtUtil jwtUtil;
    @Mock
    private UserRepository userRepository;

    private JwtAuthenticationFilter filter;

    @BeforeEach
    void setUp() {
        SecurityContextHolder.clearContext();
        filter = new JwtAuthenticationFilter();
        ReflectionTestUtils.setField(filter, "jwtUtil", jwtUtil);
        ReflectionTestUtils.setField(filter, "userRepository", userRepository);
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void authenticatesOnlyWhenTokenVersionMatchesCurrentApprovedUser() throws Exception {
        User user = approvedUser(12L, 4);
        prepareToken(user, 4);

        AtomicInteger chainCalls = invokeFilter();

        assertEquals(1, chainCalls.get());
        assertNotNull(SecurityContextHolder.getContext().getAuthentication());
        assertEquals("audit-user", SecurityContextHolder.getContext().getAuthentication().getName());
    }

    @Test
    void rejectsARevokedOrLegacyTokenWithoutBlockingTheChain() throws Exception {
        User user = approvedUser(12L, 5);
        prepareToken(user, 4);

        AtomicInteger chainCalls = invokeFilter();

        assertEquals(1, chainCalls.get());
        assertNull(SecurityContextHolder.getContext().getAuthentication());

        SecurityContextHolder.clearContext();
        when(jwtUtil.extractAuthenticationClaims("token"))
                .thenReturn(new JwtUtil.AuthenticationClaims(user.getId(), null));
        chainCalls = invokeFilter();

        assertEquals(1, chainCalls.get());
        assertNull(SecurityContextHolder.getContext().getAuthentication());
    }

    @Test
    void rejectsANonApprovedUserEvenWithAMatchingToken() throws Exception {
        User user = approvedUser(12L, 4);
        user.setStatus(ApprovalStatus.REJECTED);
        prepareToken(user, 4);

        AtomicInteger chainCalls = invokeFilter();

        assertEquals(1, chainCalls.get());
        assertNull(SecurityContextHolder.getContext().getAuthentication());
    }

    private void prepareToken(User user, Integer tokenVersion) {
        when(jwtUtil.extractAuthenticationClaims("token"))
                .thenReturn(new JwtUtil.AuthenticationClaims(user.getId(), tokenVersion));
        when(userRepository.findById(user.getId())).thenReturn(Optional.of(user));
    }

    private AtomicInteger invokeFilter() throws Exception {
        MockHttpServletRequest request = new MockHttpServletRequest("GET", "/api/auth/me");
        request.setCookies(new Cookie("Authorization", "token"));
        MockHttpServletResponse response = new MockHttpServletResponse();
        AtomicInteger chainCalls = new AtomicInteger();
        FilterChain chain = (servletRequest, servletResponse) -> chainCalls.incrementAndGet();

        filter.doFilter(request, response, chain);
        return chainCalls;
    }

    private User approvedUser(Long id, int authVersion) {
        User user = new User();
        user.setId(id);
        user.setUserId("audit-user");
        user.setNickname("auditor");
        user.setStatus(ApprovalStatus.APPROVED);
        user.setAuthVersion(authVersion);
        return user;
    }
}
