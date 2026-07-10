package com.nimda.cite.user.controller;

import com.nimda.cite.common.util.MailService;
import com.nimda.cite.common.response.ApiResponse;
import com.nimda.cite.common.util.JwtUtil;
import com.nimda.cite.common.util.TokenProvider;
import com.nimda.cite.user.dto.ChangePassword.ChangePasswordRequest;
import com.nimda.cite.user.dto.ChangePassword.CheckAuthCodeRequest;
import com.nimda.cite.user.dto.ChangePassword.CheckUserValidateRequest;
import com.nimda.cite.user.dto.ChangePassword.CheckUserValidateResponse;
import com.nimda.cite.user.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("api/cite/passwordChange")
public class UserRecoveryController {
    @Autowired
    private AuthService authService;
    @Autowired
    private TokenProvider tokenProvider;
    @Autowired
    private MailService mailService;
    @Autowired
    private JwtUtil jwtUtil;

    // 비밀번호 변경 시 유저 정보 확인 API
    @PostMapping("/info-check")
    public ResponseEntity<?> checkUserInfo(@RequestBody CheckUserValidateRequest req) {
        String passwordToken = tokenProvider.createTokenForPasswordChange(
                req.getUserId(), req.getStudentNum(), req.getEmail(), false);
        ResponseCookie cookie = createPasswordChangeCookie(passwordToken, 5 * 60);
        CheckUserValidateResponse dto = new CheckUserValidateResponse(true, true, true);

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, cookie.toString())
                .body(ApiResponse.ok(dto));
    }

    // 메일 전송 버튼과 연결됨
    // body와 쿠키를 받기 위해 Post로 해야함
    @PostMapping("/send-authMail")
    public ResponseEntity<?> sendMail(@RequestBody CheckUserValidateRequest req,
                                      @CookieValue(name = "password_change_token", required = false) String token) {
        if (token == null || token.isBlank()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("인증 세션이 필요합니다.");
        }
        if (!hasValidRecoveryToken(token)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("인증 세션이 만료되었습니다.");
        }

        String challengeId;
        try {
            challengeId = jwtUtil.extractClaim(token, claims -> claims.getId());
        } catch (RuntimeException exception) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("인증 세션이 만료되었습니다.");
        }

        boolean matchesToken = jwtUtil.validateToken(
                token, req.getUserId(), req.getStudentNum(), req.getEmail());
        boolean identityMatches = matchesToken && authService.hasExactRecoveryIdentity(
                req.getUserId(), req.getStudentNum(), req.getEmail());
        mailService.dispatchRecoveryCode(req.getEmail(), challengeId, identityMatches);
        return ResponseEntity.ok().build();
    }

    // 인증 버튼과 연결
    @PostMapping("/check-authcode")
    public ResponseEntity<?> checkAuthCode(@RequestBody CheckAuthCodeRequest req,
                                           @CookieValue(name = "password_change_token", required = false) String token) {
        if (token == null || token.isBlank()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("인증 세션이 필요합니다.");
        }
        if (!hasValidRecoveryToken(token)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("인증 세션이 만료되었습니다.");
        }

        String userId;
        String studentNum;
        String email;
        String challengeId;
        try {
            userId = jwtUtil.extractClaimByKey(token, "userId");
            studentNum = jwtUtil.extractClaimByKey(token, "studentNum");
            email = jwtUtil.extractClaimByKey(token, "email");
            challengeId = jwtUtil.extractClaim(token, claims -> claims.getId());
        } catch (RuntimeException exception) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("인증 세션이 만료되었습니다.");
        }

        boolean identityMatches = authService.hasExactRecoveryIdentity(userId, studentNum, email);
        boolean codeMatches = mailService.verifyCode(challengeId, req.getAuthCode());
        if (!identityMatches || !codeMatches) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("인증에 실패했습니다.");
        }

        String verifiedToken = tokenProvider.createTokenForPasswordChange(
                userId, studentNum, email, true);
        String verifiedChallengeId =
                jwtUtil.extractClaim(verifiedToken, claims -> claims.getId());
        authService.activatePasswordReset(
                userId, studentNum, email, verifiedChallengeId);
        ResponseCookie cookie = createPasswordChangeCookie(verifiedToken, 5 * 60);

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, cookie.toString())
                .body("인증이 완료되었습니다.");
    }

    @PostMapping("/change-password")
    public ResponseEntity<?> changePassword(@CookieValue(name = "password_change_token", required = false) String token,
                                            @Valid @RequestBody ChangePasswordRequest req) {
        if (token == null || token.isBlank()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("인증 세션이 필요합니다.");
        }
        if (!hasValidRecoveryToken(token)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("인증 세션이 만료되었습니다.");
        }

        Boolean isEmailVerified;
        String userId;
        String passwordResetTokenId;
        String studentNum;
        String email;
        try {
            isEmailVerified =
                    jwtUtil.extractClaim(token, claims -> claims.get("isEmailVerified", Boolean.class));
            userId = jwtUtil.extractClaimByKey(token, "userId");
            studentNum = jwtUtil.extractClaimByKey(token, "studentNum");
            email = jwtUtil.extractClaimByKey(token, "email");
            passwordResetTokenId = jwtUtil.extractClaim(token, claims -> claims.getId());
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("인증 세션이 만료되었습니다.");
        }

        if (isEmailVerified == null || !isEmailVerified) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("이메일 인증이 완료되지 않은 요청입니다.");
        }

        authService.changePassword(
                userId, studentNum, email, req.getPassword(), passwordResetTokenId);
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, createPasswordChangeCookie("", 0).toString())
                .body("비밀번호가 재설정되었습니다.");
    }

    private boolean hasValidRecoveryToken(String token) {
        try {
            return tokenProvider.validateToken(token)
                    && "PASSWORD_RESET".equals(jwtUtil.extractSubject(token))
                    && !jwtUtil.extractClaimByKey(token, "userId").isBlank()
                    && !jwtUtil.extractClaimByKey(token, "studentNum").isBlank()
                    && !jwtUtil.extractClaimByKey(token, "email").isBlank()
                    && !jwtUtil.extractClaim(token, claims -> claims.getId()).isBlank();
        } catch (RuntimeException e) {
            return false;
        }
    }
    private ResponseCookie createPasswordChangeCookie(String value, long maxAgeSeconds) {
        return ResponseCookie.from("password_change_token", value)
                .httpOnly(true)
                .secure(true)
                .path("/api/cite/passwordChange")
                .maxAge(maxAgeSeconds)
                .sameSite("Strict")
                .build();
    }
}