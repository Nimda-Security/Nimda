package com.nimda.cite.user.service;

import com.nimda.cite.common.util.JwtUtil;
import com.nimda.cite.domain.point.repositroy.UserBalanceRepository;
import com.nimda.cite.user.entity.Authority;
import com.nimda.cite.user.entity.User;
import com.nimda.cite.user.enums.ApprovalStatus;
import com.nimda.cite.user.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.server.ResponseStatusException;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserService userService;
    @Mock
    private PasswordEncoder passwordEncoder;
    @Mock
    private JwtUtil jwtUtil;
    @Mock
    private ApplicationEventPublisher eventPublisher;
    @Mock
    private UserBalanceRepository userBalanceRepository;
    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private AuthService authService;

    @Test
    void unknownLoginStillPerformsBcryptWork() {
        when(userRepository.findByUserId("missing-user")).thenReturn(Optional.empty());

        assertTrue(authService.authenticate("missing-user", "wrong-password").isEmpty());

        verify(passwordEncoder).matches(eq("wrong-password"), anyString());
    }

    @Test
    void passwordChangeRotatesExistingSessions() {
        User user = approvedUser();
        user.setAuthVersion(3);
        user.setPasswordResetTokenId("reset-token-1");
        when(userRepository.findByUserIdForPasswordReset("audit-user")).thenReturn(Optional.of(user));
        when(passwordEncoder.encode("new-password")).thenReturn("encoded-password");

        authService.changePassword(
                "audit-user", "123456789", "audit@example.com",
                "new-password", "reset-token-1");

        assertEquals("encoded-password", user.getPassword());
        assertEquals(4, user.getAuthVersion());
        assertEquals(null, user.getPasswordResetTokenId());
    }

    @Test
    void onlyTheLatestActivatedPasswordResetTokenCanBeUsedOnce() {
        User user = approvedUser();
        when(userRepository.findByUserIdForPasswordReset("audit-user"))
                .thenReturn(Optional.of(user));
        when(passwordEncoder.encode("second-password")).thenReturn("second-encoded");

        authService.activatePasswordReset(
                "audit-user", "123456789", "audit@example.com", "token-a");
        authService.activatePasswordReset(
                "audit-user", "123456789", "audit@example.com", "token-b");

        assertThrows(
                ResponseStatusException.class,
                () -> authService.changePassword(
                        "audit-user", "123456789", "audit@example.com",
                        "first-password", "token-a"));

        authService.changePassword(
                "audit-user", "123456789", "audit@example.com",
                "second-password", "token-b");

        assertThrows(
                ResponseStatusException.class,
                () -> authService.changePassword(
                        "audit-user", "123456789", "audit@example.com",
                        "third-password", "token-b"));
        assertEquals("second-encoded", user.getPassword());
        assertEquals(null, user.getPasswordResetTokenId());
        assertEquals(1, user.getAuthVersion());
        verify(passwordEncoder, times(1)).encode(anyString());
    }

    @Test
    void loginTokenCarriesTheCurrentAuthVersion() {
        User user = approvedUser();
        user.setAuthVersion(9);
        user.getAuthorities().add(new Authority(1L, "ROLE_USER"));
        when(userRepository.findByUserId("audit-user")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("correct-password", "old-password")).thenReturn(true);
        when(jwtUtil.generateToken("auditor", 12L, 9, java.util.List.of("ROLE_USER")))
                .thenReturn("token");

        var response = authService.authenticate(
                "audit-user", "correct-password").orElseThrow();

        assertEquals("token", response.getAccessToken());
        verify(jwtUtil).generateToken("auditor", 12L, 9, java.util.List.of("ROLE_USER"));
    }

    private User approvedUser() {
        User user = new User();
        user.setId(12L);
        user.setUserId("audit-user");
        user.setName("Audit");
        user.setNickname("auditor");
        user.setPassword("old-password");
        user.setStudentNum("123456789");
        user.setEmail("audit@example.com");
        user.setMajor("security");
        user.setStatus(ApprovalStatus.APPROVED);
        return user;
    }
}
