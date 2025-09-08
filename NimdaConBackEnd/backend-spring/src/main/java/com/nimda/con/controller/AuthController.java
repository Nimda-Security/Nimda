package com.nimda.con.controller;

import com.nimda.con.dto.LoginRequest;
import com.nimda.con.dto.RegisterRequest;
import com.nimda.con.entity.User;
import com.nimda.con.service.AuthService;
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
     * @param loginRequest 로그인 요청 데이터
     * @return JWT 토큰과 사용자 정보
     */
    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest loginRequest) {
        try {
            // 사용자 인증
            Optional<User> userOpt = authService.validateUser(
                loginRequest.getUsername(), 
                loginRequest.getPassword()
            );
            
            if (userOpt.isPresent()) {
                // 로그인 성공
                Map<String, Object> response = authService.login(userOpt.get());
                return ResponseEntity.ok(response);
            } else {
                // 인증 실패
                Map<String, String> error = new HashMap<>();
                error.put("message", "Invalid username or password");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
            }
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Login failed: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
    
    /**
     * 회원가입
     * @param registerRequest 회원가입 요청 데이터
     * @return 생성된 사용자 정보
     */
    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest registerRequest) {
        try {
            User user = authService.register(
                registerRequest.getUsername(),
                registerRequest.getPassword(),
                registerRequest.getEmail()
            );
            
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
}
