package com.nimda.con.service;

import com.nimda.con.entity.User;
import com.nimda.con.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@Service
public class AuthService {
    
    @Autowired
    private UserService userService;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    @Autowired
    private JwtUtil jwtUtil;
    
    /**
     * 사용자 인증
     * @param username 사용자명
     * @param password 비밀번호
     * @return 인증된 사용자 정보 (비밀번호 제외)
     */
    public Optional<User> validateUser(String username, String password) {
        Optional<User> userOpt = userService.findByUsername(username);
        
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            if (passwordEncoder.matches(password, user.getPassword())) {
                // 비밀번호를 제외한 사용자 정보 반환
                User userWithoutPassword = new User();
                userWithoutPassword.setId(user.getId());
                userWithoutPassword.setUsername(user.getUsername());
                userWithoutPassword.setEmail(user.getEmail());
                userWithoutPassword.setCreatedAt(user.getCreatedAt());
                userWithoutPassword.setUpdatedAt(user.getUpdatedAt());
                return Optional.of(userWithoutPassword);
            }
        }
        
        return Optional.empty();
    }
    
    /**
     * 로그인 처리
     * @param user 인증된 사용자 정보
     * @return JWT 토큰이 포함된 응답
     */
    public Map<String, Object> login(User user) {
        Map<String, Object> response = new HashMap<>();
        
        // JWT 토큰 생성
        String token = jwtUtil.generateToken(user.getUsername(), user.getId());
        
        response.put("access_token", token);
        response.put("user", user);
        
        return response;
    }
    
    /**
     * 회원가입 처리
     * @param username 사용자명
     * @param password 비밀번호
     * @param email 이메일
     * @return 생성된 사용자 정보 (비밀번호 제외)
     */
    public User register(String username, String password, String email) {
        // 중복 사용자명 확인
        if (userService.existsByUsername(username)) {
            throw new RuntimeException("Username already exists");
        }
        
        // 중복 이메일 확인
        if (userService.existsByEmail(email)) {
            throw new RuntimeException("Email already exists");
        }
        
        // 새 사용자 생성
        User user = userService.createUser(username, password, email);
        
        // 비밀번호를 제외한 사용자 정보 반환
        User userWithoutPassword = new User();
        userWithoutPassword.setId(user.getId());
        userWithoutPassword.setUsername(user.getUsername());
        userWithoutPassword.setEmail(user.getEmail());
        userWithoutPassword.setCreatedAt(user.getCreatedAt());
        userWithoutPassword.setUpdatedAt(user.getUpdatedAt());
        
        return userWithoutPassword;
    }
}
