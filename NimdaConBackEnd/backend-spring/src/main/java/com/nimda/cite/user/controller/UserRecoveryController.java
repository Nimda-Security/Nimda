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
import redis.util.RedisUtil;
import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/cite/passwordChange")
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
    @Autowired
    private RedisUtil redisUtil;

    private static final Logger log = LoggerFactory.getLogger(UserRecoveryController.class);

    // 계정 열거(enumeration) 방어: IP 당 10분에 10회
    private static final String INFO_CHECK_LIMIT_PREFIX = "PWRESET_INFO_LIMIT:";
    private static final long INFO_CHECK_WINDOW_SECONDS = 600L;
    private static final int INFO_CHECK_MAX_ATTEMPTS = 10;

    // 인증코드 무차별 대입 방어: 토큰 1건(이메일) 당 5회
    private static final String AUTHCODE_LIMIT_PREFIX = "PWRESET_CODE_LIMIT:";
    private static final long AUTHCODE_WINDOW_SECONDS = 600L;
    private static final int AUTHCODE_MAX_ATTEMPTS = 5;


    /**
     * 비밀번호 변경 시 유저 정보 확인 API.
     *
     * 보안: 이 엔드포인트는 userId/학번/이메일의 존재 여부를 필드별로 알려주는
     * 열거 오라클이다. 응답 형태는 mcp-server 호환을 위해 유지하되,
     * IP 단위 시도 횟수를 제한해 대량 열거를 막는다.
     */
    @PostMapping("/info-check")
    public ResponseEntity<?> checkUserInfo(@RequestBody CheckUserValidateRequest req,
                                          HttpServletRequest request) {
        String clientIp = resolveClientIp(request);
        long attempts = redisUtil.incrementWithWindow(
                INFO_CHECK_LIMIT_PREFIX + clientIp, INFO_CHECK_WINDOW_SECONDS);

        if (attempts > INFO_CHECK_MAX_ATTEMPTS) {
            log.warn("비밀번호 재설정 정보확인 시도 제한 초과 (IP 해시: {})", Integer.toHexString(clientIp.hashCode()));
            return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
                    .body("잠시 후 다시 시도해주세요.");
        }
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
                                           @CookieValue(name = "password_change_token") String token,
                                           HttpServletRequest request) {

        // 1. 토큰이 유효한지 먼저 체크한다. (위조 토큰은 파싱 예외로 500이 되지 않도록 선검증)
        if (!tokenProvider.validateToken(token)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("인증 세션이 만료되었습니다.");
        }

        String emailFromToken = jwtUtil.extractClaimByKey(token, "email");

        // 2. 인증코드 무차별 대입 방어: 이메일 기준 시도 횟수 제한
        if (emailFromToken != null) {
            long codeAttempts = redisUtil.incrementWithWindow(
                    AUTHCODE_LIMIT_PREFIX + emailFromToken, AUTHCODE_WINDOW_SECONDS);
            if (codeAttempts > AUTHCODE_MAX_ATTEMPTS) {
                log.warn("인증코드 확인 시도 제한 초과");
                return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
                        .body("인증 시도 횟수를 초과했습니다. 처음부터 다시 시도해주세요.");
            }
        }

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
    /**
     * 레이트리밋 키로 쓸 클라이언트 IP.
     *
     * 주의: X-Forwarded-For 는 클라이언트가 위조할 수 있다. nginx 의
     * proxy_add_x_forwarded_for 는 실제 peer 주소를 헤더 "마지막"에 덧붙이므로,
     * 마지막 항목을 사용해야 위조에 강하다.
     */
    private String resolveClientIp(HttpServletRequest request) {
        String forwarded = request.getHeader("X-Forwarded-For");

        if (forwarded != null && !forwarded.isBlank()) {
            String[] parts = forwarded.split(",");
            for (int i = parts.length - 1; i >= 0; i--) {
                String candidate = parts[i].trim();
                if (!candidate.isEmpty()) {
                    return candidate;
                }
            }
        }

        String remote = request.getRemoteAddr();
        return remote != null ? remote : "unknown";
    }
}