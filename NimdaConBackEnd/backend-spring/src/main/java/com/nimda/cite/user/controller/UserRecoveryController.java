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
import com.nimda.cite.user.service.UserRecoveryService;
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
    private UserRecoveryService userRecoveryService;
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
        CheckUserValidateResponse dto =
                userRecoveryService.checkValidate(req.getUserId(),req.getStudentNum(),req.getEmail());

        if(dto.isValidateEmail() && dto.isValidateUserId() && dto.isValidateStudentNum()) {
            String passwordToken =
                tokenProvider.createTokenForPasswordChange(req.getUserId(), req.getStudentNum(), req.getEmail(),false);

            ResponseCookie cookie = ResponseCookie.from("password_change_token", passwordToken)
                .httpOnly(true)
                .secure(true)
                .path("/api/cite/passwordChange")
                .maxAge(5 * 60) // 5분
                .sameSite("Strict")
                .build();

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, cookie.toString())
                .body(ApiResponse.ok(dto));
        }
        // 프론트에서 어떤 정보가 잘못되었는지 표기
        return ResponseEntity.ok(ApiResponse.ok(dto));
    }

    // 메일 전송 버튼과 연결됨
    // body와 쿠키를 받기 위해 Post로 해야함
    @PostMapping("/send-authMail")
    public ResponseEntity<?> sendMail(@RequestBody CheckUserValidateRequest req,
                                      @CookieValue(name = "password_change_token") String token) {

        boolean isVerified = jwtUtil.validateToken(
                token, req.getUserId(),req.getStudentNum(),req.getEmail()
        );

        if(isVerified) {
            mailService.sendAuthCode(req.getEmail());
            // 인증 화면으로 이동
            return ResponseEntity.ok(HttpStatus.OK);
        }
        return ResponseEntity.ok(HttpStatus.UNAUTHORIZED);
    }

    // 인증 버튼과 연결
    @PostMapping("/check-authcode")
    public ResponseEntity<?> checkAuthCode(@RequestBody CheckAuthCodeRequest req,
                                           @CookieValue(name = "password_change_token") String token) {

        // 1. 토큰이 유효한지 먼저 체크하고, 토큰 내부에 저장된 이메일을 꺼냅니다.
        if (!tokenProvider.validateToken(token)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("인증 세션이 만료되었습니다.");
        }

        String emailFromToken = jwtUtil.extractClaimByKey(token, "email");
        boolean isCodeValid = mailService.verifyCode(emailFromToken, req.getAuthCode());

        if (isCodeValid) {
            String userId = jwtUtil.extractClaimByKey(token, "userId");
            String studentNum = jwtUtil.extractClaimByKey(token, "studentNum");
            String emailVerifiedToken = tokenProvider.createTokenForPasswordChange(userId, studentNum, emailFromToken, true);

            // 인증 완료 토큰 재발급
            ResponseCookie cookie = ResponseCookie.from("password_change_token", emailVerifiedToken)
                    .httpOnly(true)
                    .secure(true)
                    .path("/api/cite/passwordChange")
                    .maxAge(5 * 60)
                    .sameSite("Strict")
                    .build();

            return ResponseEntity.ok()
                    .header(HttpHeaders.SET_COOKIE, cookie.toString())
                    .body("인증이 완료되었습니다.");
        }

        // 3. 인증 실패 시
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("인증에 실패했습니다.");
    }

    @PostMapping("/change-password")
    public ResponseEntity<?> changePassword(@CookieValue(name = "password_change_token") String token,
                                            @RequestBody ChangePasswordRequest req) {
        if (!tokenProvider.validateToken(token)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("인증 세션이 만료되었습니다.");
        }

        Boolean isEmailVerified =
                jwtUtil.extractClaim(token, claims -> claims.get("isEmailVerified", Boolean.class));

        if (isEmailVerified == null || !isEmailVerified) {
            // 인증하지 않고 우회한 경우
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("이메일 인증이 완료되지 않은 요청입니다.");
        }
        
        String userId = jwtUtil.extractId(token);
        authService.changePassword(userId, req.getPassword());
        return ResponseEntity.ok("비밀번호가 재설정되었습니다.");
    }
}