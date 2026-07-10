package com.nimda.cite.user.controller;

import com.nimda.cite.common.util.JwtUtil;
import com.nimda.cite.common.util.MailService;
import com.nimda.cite.common.util.TokenProvider;
import com.nimda.cite.user.dto.ChangePassword.ChangePasswordRequest;
import com.nimda.cite.user.dto.ChangePassword.CheckAuthCodeRequest;
import com.nimda.cite.user.dto.ChangePassword.CheckUserValidateRequest;
import com.nimda.cite.user.service.AuthService;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;

import java.util.function.Function;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class UserRecoveryControllerTest {

    @Mock
    private AuthService authService;
    @Mock
    private TokenProvider tokenProvider;
    @Mock
    private MailService mailService;
    @Mock
    private JwtUtil jwtUtil;
    @InjectMocks
    private UserRecoveryController controller;

    @Test
    void infoCheckAlwaysStartsTheSameOpaqueFlow() {
        CheckUserValidateRequest request = new CheckUserValidateRequest(
                "unknown-user", "123456789", "unknown@example.com");
        when(tokenProvider.createTokenForPasswordChange(
                "unknown-user", "123456789", "unknown@example.com", false))
                .thenReturn("opaque-token");

        var response = controller.checkUserInfo(request);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        String setCookie = response.getHeaders().getFirst(HttpHeaders.SET_COOKIE);
        assertNotNull(setCookie);
        assertTrue(setCookie.contains("password_change_token=opaque-token"));
        verify(authService, never()).hasExactRecoveryIdentity(any(), any(), any());
    }

    @Test
    void sendMailQueuesTheSameDispatchShapeForAnUnknownTuple() {
        CheckUserValidateRequest request = new CheckUserValidateRequest(
                "unknown-user", "123456789", "unknown@example.com");
        stubValidToken("opaque-token");
        when(jwtUtil.extractClaim(eq("opaque-token"), any())).thenReturn("reset-jti");
        when(jwtUtil.validateToken(
                "opaque-token", "unknown-user", "123456789", "unknown@example.com"))
                .thenReturn(true);
        when(authService.hasExactRecoveryIdentity(
                "unknown-user", "123456789", "unknown@example.com"))
                .thenReturn(false);

        var response = controller.sendMail(request, "opaque-token");

        assertEquals(HttpStatus.OK, response.getStatusCode());
        verify(mailService).dispatchRecoveryCode(
                "unknown@example.com", "reset-jti", false);
        verify(mailService, never()).sendAuthCode(any(), any());
    }

    @Test
    void matchingIdentityQueuesMailWithoutChangingThePublicResponse() {
        CheckUserValidateRequest request = new CheckUserValidateRequest(
                "audit-user", "123456789", "audit@example.com");
        stubValidToken("mail-token");
        when(jwtUtil.extractClaim(eq("mail-token"), any()))
                .thenReturn("mail-challenge");
        when(jwtUtil.validateToken(
                "mail-token", "audit-user", "123456789", "audit@example.com"))
                .thenReturn(true);
        when(authService.hasExactRecoveryIdentity(
                "audit-user", "123456789", "audit@example.com"))
                .thenReturn(true);

        var response = controller.sendMail(request, "mail-token");

        assertEquals(HttpStatus.OK, response.getStatusCode());
        verify(mailService).dispatchRecoveryCode(
                "audit@example.com", "mail-challenge", true);
    }


    @Test
    void authCodeCannotBeAppliedToAMismatchedRecoveryIdentity() {
        stubValidToken("mismatched-token");
        when(jwtUtil.extractClaim(eq("mismatched-token"), any()))
                .thenReturn("mismatched-challenge");
        when(authService.hasExactRecoveryIdentity(
                "audit-user", "123456789", "audit@example.com"))
                .thenReturn(false);

        var response = controller.checkAuthCode(
                new CheckAuthCodeRequest("attacker-code"), "mismatched-token");

        assertEquals(HttpStatus.UNAUTHORIZED, response.getStatusCode());
        verify(mailService).verifyCode("mismatched-challenge", "attacker-code");
        verify(authService, never()).activatePasswordReset(any(), any(), any(), any());
    }
    @Test
    void successfulResetUsesNamedClaimsAndExpiresTheCookie() {
        stubValidToken("verified-token");
        Claims claims = Jwts.claims();
        claims.setId("reset-jti");
        claims.put("isEmailVerified", true);
        when(jwtUtil.extractClaim(eq("verified-token"), any())).thenAnswer(invocation -> {
            @SuppressWarnings("unchecked")
            Function<Claims, Object> resolver = invocation.getArgument(1);
            return resolver.apply(claims);
        });

        var response = controller.changePassword(
                "verified-token", new ChangePasswordRequest("new-password"));

        assertEquals(HttpStatus.OK, response.getStatusCode());
        String setCookie = response.getHeaders().getFirst(HttpHeaders.SET_COOKIE);
        assertNotNull(setCookie);
        assertTrue(setCookie.contains("Max-Age=0"));
        verify(authService).changePassword(
                "audit-user", "123456789", "audit@example.com",
                "new-password", "reset-jti");
    }

    private void stubValidToken(String token) {
        when(tokenProvider.validateToken(token)).thenReturn(true);
        when(jwtUtil.extractSubject(token)).thenReturn("PASSWORD_RESET");
        when(jwtUtil.extractClaimByKey(token, "userId")).thenReturn("audit-user");
        when(jwtUtil.extractClaimByKey(token, "studentNum")).thenReturn("123456789");
        when(jwtUtil.extractClaimByKey(token, "email")).thenReturn("audit@example.com");
    }
}
