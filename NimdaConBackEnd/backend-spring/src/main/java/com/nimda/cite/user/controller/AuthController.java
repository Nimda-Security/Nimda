package com.nimda.cite.user.controller;

import com.nimda.cite.common.util.MailService;
import com.nimda.cite.common.util.TokenProvider;
import com.nimda.cite.user.dto.LoginDTO;
import com.nimda.cite.user.dto.LoginResponseDTO;
import com.nimda.cite.user.dto.MyPageResponseDTO;
import com.nimda.cite.user.dto.RegisterDTO;
import com.nimda.cite.user.dto.UpdateProfileDTO;
import com.nimda.cite.user.entity.User;
import com.nimda.cite.user.exception.UserNotApprovedException;
import com.nimda.cite.user.security.CustomUserDetails;
import com.nimda.cite.user.service.AuthService;
import com.nimda.cite.common.s3.S3Service;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private static final Logger log = LoggerFactory.getLogger(AuthController.class);

    @Autowired
    private AuthService authService;
    @Autowired
    private MailService mailService;

    @Autowired(required = false)
    private S3Service s3Service;

    @Autowired
    private TokenProvider tokenProvider;

    @Value("${auth.cookie.secure:true}")
    private boolean secureAuthCookie;

    /**
     * 로그인
     *
     * @param loginRequest 로그인 요청 데이터
     * @return JWT 토큰과 사용자 정보
     */
    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginDTO loginRequest, HttpServletResponse response) { // HttpServletResponse 추가
        try {
            Optional<LoginResponseDTO> loginResult = authService.authenticate(
                    loginRequest.getUserId(),
                    loginRequest.getPassword());

            if (loginResult.isPresent()) {
                LoginResponseDTO loginData = loginResult.get();
                String token = loginData.getAccessToken(); // DTO에서 토큰 추출

                ResponseCookie cookie = createAuthCookie(token, 60 * 60 * 24);

                // 2. 응답 헤더에 쿠키 추가 및 바디 응답
                // 이제 프론트엔드에 토큰을 바디로 줄 필요가 없으므로 DTO에서 토큰을 제외하거나 유지해도 됨
                return ResponseEntity.ok()
                        .header(HttpHeaders.SET_COOKIE, cookie.toString())
                        .body(Map.of("success", true, "message", "로그인 성공", "user", loginData.getUser()));
            } else {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("message", "아이디 또는 비밀번호가 올바르지 않습니다."));
            }
        } catch (UserNotApprovedException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "아이디 또는 비밀번호가 올바르지 않습니다."));
        } catch (Exception e) {
            log.error("로그인 처리 중 오류 발생", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "로그인 처리 중 오류가 발생했습니다."));
        }
    }

    /**
     * 로그아웃
     * 브라우저에 저장된 Authorization 쿠키를 만료시킨다.
     */
    @PostMapping("/logout")
    public ResponseEntity<?> logout(
            @AuthenticationPrincipal CustomUserDetails customUserDetails) {
        ResponseCookie cookie = createAuthCookie("", 0);
        ResponseCookie recoveryCookie = createExpiredRecoveryCookie();
        try {
            if (customUserDetails != null) {
                authService.rotateAuthVersion(customUserDetails.getUser().getId());
            }
            return ResponseEntity.ok()
                    .header(HttpHeaders.SET_COOKIE, cookie.toString(), recoveryCookie.toString())
                    .body(Map.of("success", true, "message", "로그아웃 성공"));
        } catch (RuntimeException exception) {
            log.error("로그아웃 세션 폐기 중 오류 발생", exception);
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                    .header(HttpHeaders.SET_COOKIE, cookie.toString(), recoveryCookie.toString())
                    .body(Map.of(
                            "success", false,
                            "message", "현재 브라우저의 로그인 정보는 삭제했지만 서버 세션 폐기를 확인하지 못했습니다."));
        }
    }

    private ResponseCookie createAuthCookie(String value, long maxAgeSeconds) {
        return ResponseCookie.from("Authorization", value)
                .httpOnly(true)
                .secure(secureAuthCookie)
                .path("/")
                .maxAge(maxAgeSeconds)
                .sameSite("Lax")
                .build();
    }

    private ResponseCookie createExpiredRecoveryCookie() {
        return ResponseCookie.from("password_change_token", "")
                .httpOnly(true)
                .secure(true)
                .path("/api/cite/passwordChange")
                .maxAge(0)
                .sameSite("Strict")
                .build();
    }

    /**
     * 회원가입
     * Request Data : Register DTO (userId, name, nickname, password, studentNum,
     * email, major)
     */
    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterDTO registerRequest) {

        try {

            User user = authService.register(
                    registerRequest.getUserId(),
                    registerRequest.getName(),
                    registerRequest.getNickname(),
                    registerRequest.getPassword(),
                    registerRequest.getStudentNum(),
                    registerRequest.getEmail(),
                    registerRequest.getMajor(),
                    registerRequest.getBojId(),
                    registerRequest.getBirth());

            return ResponseEntity.status(HttpStatus.CREATED).body(user);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        } catch (Exception e) {
            log.error("회원가입 처리 중 오류 발생", e);
            Map<String, String> error = new HashMap<>();
            error.put("message", "회원가입 처리 중 오류가 발생했습니다.");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }

    }

    // Note. MyPageAPI - 현재 로그인한 사용자 정보를 JWT에서 추출한다.
    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(@AuthenticationPrincipal CustomUserDetails customUserDetails) {
        try {

            // 인증되지 않은 경우
            if (customUserDetails == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("message", "인증이 필요합니다."));
            }

            // CustomUserDetails에서 User 엔터티 추출
            User user = customUserDetails.getUser();

            // profileImage가 S3 키라면 Presigned GET URL로 변환
            String profileImageUrl = user.getProfileImage();
            if (s3Service != null && profileImageUrl != null && !profileImageUrl.isBlank()
                    && !profileImageUrl.startsWith("http")) {
                profileImageUrl = s3Service.createPresignedGetUrl(profileImageUrl, 60);
            }

            // DTO로 변환 (민감 정보 제외)
            MyPageResponseDTO response = MyPageResponseDTO.builder()
                    .userId(user.getUserId())
                    .name(user.getName())
                    .nickname(user.getNickname())
                    .email(user.getEmail())
                    .major(user.getMajor())
                    .bojId(user.getBojId())
                    .birth(user.getBirth())
                    .studentNum(user.getStudentNum())
                    .profileImage(profileImageUrl)
                    .profileDecoration(user.getProfileDecoration())
                    .emailHide(user.isEmailHide())
                    .roles(user.getAuthorities().stream()
                            .map(authority -> authority.getAuthorityName())
                            .toList())
                    .build();

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("사용자 정보 조회 중 오류 발생", e);
            Map<String, String> error = new HashMap<>();
            error.put("message", "사용자 정보 조회 중 오류가 발생했습니다.");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    @PutMapping("/me")
    public ResponseEntity<?> updateProfile(
            @AuthenticationPrincipal CustomUserDetails customUserDetails,
            @Valid @RequestBody UpdateProfileDTO request) {
        try {
            if (customUserDetails == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("message", "인증이 필요합니다."));
            }

            User user = customUserDetails.getUser();
            User updated = authService.updateProfile(
                    user.getId(),
                    request.getNickname(),
                    request.getBojId(),
                    request.getBirth(),
                    request.getMajor()
            );

            MyPageResponseDTO response = MyPageResponseDTO.builder()
                    .userId(updated.getUserId())
                    .name(updated.getName())
                    .nickname(updated.getNickname())
                    .email(updated.getEmail())
                    .major(updated.getMajor())
                    .bojId(updated.getBojId())
                    .birth(updated.getBirth())
                    .studentNum(updated.getStudentNum())
                    .profileImage(updated.getProfileImage())
                    .profileDecoration(updated.getProfileDecoration())
                    .emailHide(updated.isEmailHide())
                    .roles(updated.getAuthorities().stream()
                            .map(authority -> authority.getAuthorityName())
                            .toList())
                    .build();

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "프로필이 성공적으로 수정되었습니다.",
                    "data", response));

        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("success", false, "message", e.getMessage()));
        } catch (Exception e) {
            log.error("프로필 수정 중 오류 발생", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "프로필 수정 중 오류가 발생했습니다."));
        }
    }

    /**
     * 프로필 이미지 변경
     * 클라이언트가 S3에 업로드 완료 후 S3 키를 전달하면 User.profileImage에 저장
     */
    @PutMapping("/profile-image")
    public ResponseEntity<?> updateProfileImage(
            @AuthenticationPrincipal CustomUserDetails customUserDetails,
            @RequestBody Map<String, String> request) {
        try {
            if (customUserDetails == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("message", "인증이 필요합니다."));
            }

            String s3Key = request.get("profileImageKey");
            if (s3Key == null || s3Key.isBlank()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("success", false, "message", "프로필 이미지 키가 필요합니다."));
            }

            User user = customUserDetails.getUser();
            User updated = authService.updateProfileImage(user.getId(), s3Key);

            // Presigned GET URL 생성 (60분 유효)
            String imageUrl = null;
            if (s3Service != null && updated.getProfileImage() != null) {
                imageUrl = s3Service.createPresignedGetUrl(updated.getProfileImage(), 60);
            }

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "프로필 이미지가 변경되었습니다.",
                    "profileImageUrl", imageUrl != null ? imageUrl : "",
                    "profileImageKey", updated.getProfileImage()));

        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("success", false, "message", e.getMessage()));
        } catch (Exception e) {
            log.error("프로필 이미지 변경 중 오류 발생", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("success", false, "message", "프로필 이미지 변경 중 오류가 발생했습니다."));
        }
    }

    /**
     * 프로필 장식 변경
     */
    @PutMapping("/profile-decoration")
    public ResponseEntity<?> updateProfileDecoration(
            @AuthenticationPrincipal CustomUserDetails customUserDetails,
            @RequestBody Map<String, String> request) {
        try {
            if (customUserDetails == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("message", "인증이 필요합니다."));
            }

            String decorationKey = request.get("profileDecorationKey");
            User user = customUserDetails.getUser();
            User updated = authService.updateProfileDecoration(user.getId(), decorationKey);

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "프로필 장식이 변경되었습니다.",
                    "profileDecoration", updated.getProfileDecoration() == null ? "" : updated.getProfileDecoration()));

        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("success", false, "message", e.getMessage()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("success", false, "message", e.getMessage()));
        } catch (Exception e) {
            log.error("프로필 장식 변경 중 오류 발생", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("success", false, "message", "프로필 장식 변경 중 오류가 발생했습니다."));
        }
    }

    @PutMapping("/email-hide")
    public ResponseEntity<?> emailHide(
            @AuthenticationPrincipal CustomUserDetails customUserDetails,
            @RequestBody Map<String, Boolean> request) {
        try {

            // 인증되지 않은 경우
            if (customUserDetails == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("message", "인증이 필요합니다."));
            }
            if (request.get("emailHide") == null) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("message", "이메일 숨김 여부를 선택해주세요."));
            }

            // CustomUserDetails에서 User 엔터티 추출
            User user = customUserDetails.getUser();
            boolean dto = authService.setEmailHide(user.getId(), request.get("emailHide"));

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "emailHide", dto,
                    "message", "이메일 숨김 설정이 변경되었습니다."));

        } catch (Exception e) {
            log.error("이메일 숨김 설정 중 오류 발생", e);
            Map<String, String> error = new HashMap<>();
            error.put("message", "설정 변경 중 오류가 발생했습니다.");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
}
