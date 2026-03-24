package com.nimda.cup.user.controller;

import com.nimda.cite.common.response.ApiResponse;
import com.nimda.cup.user.dto.LoginDTO;
import com.nimda.cup.user.dto.LoginResponseDTO;
import com.nimda.cup.user.dto.MyPageResponseDTO;
import com.nimda.cup.user.dto.RegisterDTO;
import com.nimda.cup.user.dto.UpdateProfileDTO;
import com.nimda.cup.user.entity.User;
import com.nimda.cup.user.exception.UserNotApprovedException;
import com.nimda.cup.user.security.CustomUserDetails;
import com.nimda.cup.user.service.AuthService;
import com.nimda.cite.common.s3.S3Service;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    @Autowired(required = false)
    private S3Service s3Service;

    /**
     * 로그인
     *
     * @param loginRequest 로그인 요청 데이터
     * @return JWT 토큰과 사용자 정보
     */
    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginDTO loginRequest) {
        try {
            // 사용자 인증
            Optional<User> userOpt = authService.validateUser(
                    loginRequest.getUserId(),
                    loginRequest.getPassword());

            if (userOpt.isPresent()) {
                // 로그인 성공
                LoginResponseDTO response = authService.login(userOpt.get());
                return ResponseEntity.ok(response);
            } else {
                // 인증 실패 (비밀번호 오류 또는 사용자 없음)
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("message", "Invalid user ID or password"));
            }
        } catch (UserNotApprovedException e) {
            // 승인되지 않은 계정
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Login failed: " + e.getMessage()));
        }
    }

    /**
     * 회원가입
     * Request Data : Register DTO (userId, name, nickname, password, studentNum,
     * email, major, universityName, grade)
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
                    registerRequest.getUniversityName(),
                    registerRequest.getGrade(),
                    registerRequest.getBojId(),
                    registerRequest.getBirth());

            return ResponseEntity.status(HttpStatus.CREATED).body(user);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Registration failed: " + e.getMessage());
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
                    .id(user.getId())
                    .userId(user.getUserId())
                    .name(user.getName())
                    .nickname(user.getNickname())
                    .email(user.getEmail())
                    .universityName(user.getUniversityName())
                    .major(user.getMajor())
                    .grade(user.getGrade())
                    .bojId(user.getBojId())
                    .birth(user.getBirth())
                    .studentNum(user.getStudentNum())
                    .profileImage(profileImageUrl)
                    .createdAt(user.getCreatedAt())
                    .updatedAt(user.getUpdatedAt())
                    .emailHide(user.isEmailHide())
                    .build();

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "사용자 정보 조회 실패: " + e.getMessage());
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
                    request.getMajor(),
                    request.getStudentNum()
            );

            MyPageResponseDTO response = MyPageResponseDTO.builder()
                    .id(updated.getId())
                    .userId(updated.getUserId())
                    .name(updated.getName())
                    .nickname(updated.getNickname())
                    .email(updated.getEmail())
                    .universityName(updated.getUniversityName())
                    .major(updated.getMajor())
                    .grade(updated.getGrade())
                    .bojId(updated.getBojId())
                    .birth(updated.getBirth())
                    .studentNum(updated.getStudentNum())
                    .profileImage(updated.getProfileImage())
                    .createdAt(updated.getCreatedAt())
                    .updatedAt(updated.getUpdatedAt())
                    .emailHide(updated.isEmailHide())
                    .build();

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "프로필이 성공적으로 수정되었습니다.",
                    "data", response));

        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("success", false, "message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "프로필 수정 실패: " + e.getMessage()));
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

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("success", false, "message", "프로필 이미지 변경 실패: " + e.getMessage()));
        }
    }

    @PostMapping("/email-hide")
    public ResponseEntity<?> emailHide(@AuthenticationPrincipal CustomUserDetails customUserDetails) {
        try {

            // 인증되지 않은 경우
            if (customUserDetails == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("message", "인증이 필요합니다."));
            }

            // CustomUserDetails에서 User 엔터티 추출
            User user = customUserDetails.getUser();
            boolean dto = authService.toggleEmailHide(user.getId());

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "emailHide", dto,
                    "message", "이메일 숨김 설정이 변경되었습니다."));

        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "사용자 정보 조회 실패: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
}
