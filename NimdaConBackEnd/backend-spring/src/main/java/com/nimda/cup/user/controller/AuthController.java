package com.nimda.cup.user.controller;

import com.nimda.cup.user.dto.LoginDTO;
import com.nimda.cup.user.dto.LoginResponseDTO;
import com.nimda.cup.user.dto.MyPageResponseDTO;
import com.nimda.cup.user.dto.RegisterDTO;
import com.nimda.cup.user.entity.User;
import com.nimda.cup.user.exception.UserNotApprovedException;
import com.nimda.cup.user.security.CustomUserDetails;
import com.nimda.cup.user.service.AuthService;
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
            }

            else {
                // 인증 실패 (비밀번호 오류 또는 사용자 없음)
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("message", "Invalid user ID or password"));
            }
        }

        catch (UserNotApprovedException e) {
            // 승인되지 않은 계정
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", e.getMessage()));
        }

        catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Login failed: " + e.getMessage()));
        }
    }

    /**
     * 회원가입
     * Request Data : Register DTO (userId, name, nickname, password, studentNum,
     * phoneNum, email, major, universityName, grade)
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
                    registerRequest.getPhoneNum(),
                    registerRequest.getEmail(),
                    registerRequest.getMajor(),
                    registerRequest.getUniversityName(),
                    registerRequest.getGrade());

            return ResponseEntity.status(HttpStatus.CREATED).body(user);
        }

        catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }

        catch (Exception e) {
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
                    .profileImage(user.getProfileImage())
                    .createdAt(user.getCreatedAt())
                    .updatedAt(user.getUpdatedAt())
                    .build();

            return ResponseEntity.ok(response);

        }

        catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "사용자 정보 조회 실패: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

}
