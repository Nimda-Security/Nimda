package com.nimda.cup.user.controller;

import com.nimda.cup.user.dto.LoginDTO;
import com.nimda.cup.user.dto.LoginResponseDTO;
import com.nimda.cup.user.dto.RegisterDTO;
import com.nimda.cup.user.entity.User;
import com.nimda.cup.user.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
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
            } else {
                // 인증 실패
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("message", "Invalid user ID or password"));
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Login failed: " + e.getMessage()));
        }
    }

    /**
     * 회원가입
     * Request Data : Register DTO (userId, nickname, password, email,
     * universityName, department, grade)
     */
    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterDTO registerRequest) {

        try {

            User user = authService.register(
                    registerRequest.getUserId(),
                    registerRequest.getNickname(),
                    registerRequest.getPassword(),
                    registerRequest.getEmail(),
                    registerRequest.getUniversityName(),
                    registerRequest.getDepartment(),
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

}
