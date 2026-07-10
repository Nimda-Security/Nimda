package com.nimda.cite.user.controller;

import com.nimda.cite.common.s3.S3Service;
import com.nimda.cite.common.util.MailService;
import com.nimda.cite.common.util.TokenProvider;
import com.nimda.cite.user.dto.LoginDTO;
import com.nimda.cite.user.dto.MyPageResponseDTO;
import com.nimda.cite.user.dto.UpdateProfileDTO;
import com.nimda.cite.user.entity.Authority;
import com.nimda.cite.user.entity.User;
import com.nimda.cite.user.exception.UserNotApprovedException;
import com.nimda.cite.user.security.CustomUserDetails;
import com.nimda.cite.user.service.AuthService;
import jakarta.servlet.http.HttpServletResponse;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;

import java.util.Map;
import java.util.Optional;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertInstanceOf;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuthControllerTest {

    private static final String GENERIC_LOGIN_FAILURE_MESSAGE = "아이디 또는 비밀번호가 올바르지 않습니다.";

    @Mock
    private AuthService authService;
    @Mock
    private MailService mailService;
    @Mock
    private S3Service s3Service;
    @Mock
    private TokenProvider tokenProvider;
    @Mock
    private HttpServletResponse servletResponse;

    @InjectMocks
    private AuthController authController;

    @Test
    void missingUserLoginReturnsGenericUnauthorizedResponse() {
        when(authService.authenticate("missing-user", "password")).thenReturn(Optional.empty());

        ResponseEntity<?> response = authController.login(loginRequest("missing-user", "password"), servletResponse);

        assertGenericUnauthorized(response);
        verify(authService).authenticate("missing-user", "password");
    }

    @Test
    void wrongPasswordLoginReturnsGenericUnauthorizedResponse() {
        when(authService.authenticate("known-user", "wrong-password")).thenReturn(Optional.empty());

        ResponseEntity<?> response = authController.login(loginRequest("known-user", "wrong-password"), servletResponse);

        assertGenericUnauthorized(response);
        verify(authService).authenticate("known-user", "wrong-password");
    }

    @Test
    void unapprovedUserLoginReturnsGenericUnauthorizedResponse() {
        when(authService.authenticate("pending-user", "password"))
                .thenThrow(new UserNotApprovedException("승인되지 않은 계정입니다."));

        ResponseEntity<?> response = authController.login(loginRequest("pending-user", "password"), servletResponse);

        assertGenericUnauthorized(response);
        verify(authService).authenticate("pending-user", "password");
    }

    @Test
    void currentUserRolesComeFromTheServerSideUser() {
        User user = userWithAuthorities("ROLE_USER", "ROLE_ADMIN");

        ResponseEntity<?> response = authController.getCurrentUser(new CustomUserDetails(user));

        assertEquals(HttpStatus.OK, response.getStatusCode());
        MyPageResponseDTO body = assertInstanceOf(MyPageResponseDTO.class, response.getBody());
        assertEquals(Set.of("ROLE_USER", "ROLE_ADMIN"), Set.copyOf(body.getRoles()));
        verifyNoInteractions(authService);
    }

    @Test
    void profileUpdateKeepsServerDerivedRolesInTheWrappedResponse() {
        User user = userWithAuthorities("ROLE_USER", "ROLE_CARTEL");
        user.setId(42L);
        UpdateProfileDTO request = new UpdateProfileDTO();
        when(authService.updateProfile(42L, null, null, null, null))
                .thenReturn(user);

        ResponseEntity<?> response = authController.updateProfile(
                new CustomUserDetails(user), request);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        Map<?, ?> body = assertInstanceOf(Map.class, response.getBody());
        MyPageResponseDTO data = assertInstanceOf(MyPageResponseDTO.class, body.get("data"));
        assertEquals(Set.of("ROLE_USER", "ROLE_CARTEL"), Set.copyOf(data.getRoles()));
    }

    @Test
    void logoutInvalidatesTheServerSessionAndBothCapabilityCookies() {
        User user = userWithAuthorities("ROLE_USER");
        user.setId(42L);

        ResponseEntity<?> response = authController.logout(new CustomUserDetails(user));

        assertEquals(HttpStatus.OK, response.getStatusCode());
        var cookies = response.getHeaders().get(HttpHeaders.SET_COOKIE);
        assertEquals(2, cookies.size());
        assertTrue(cookies.stream().anyMatch(value ->
                value.contains("Authorization=") && value.contains("Max-Age=0")));
        assertTrue(cookies.stream().anyMatch(value ->
                value.contains("password_change_token=") && value.contains("Max-Age=0")));
        verify(authService).rotateAuthVersion(42L);
    }

    private LoginDTO loginRequest(String userId, String password) {
        return new LoginDTO(userId, password);
    }

    private void assertGenericUnauthorized(ResponseEntity<?> response) {
        assertEquals(HttpStatus.UNAUTHORIZED, response.getStatusCode());
        Map<?, ?> body = assertInstanceOf(Map.class, response.getBody());
        assertEquals(GENERIC_LOGIN_FAILURE_MESSAGE, body.get("message"));
    }

    private User userWithAuthorities(String... roles) {
        User user = new User();
        user.setUserId("server-user");
        user.setName("Server");
        user.setNickname("server-user");
        user.setEmail("server@example.com");
        user.setMajor("security");
        for (int index = 0; index < roles.length; index++) {
            user.getAuthorities().add(new Authority((long) index, roles[index]));
        }
        return user;
    }
}
