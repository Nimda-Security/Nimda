package com.nimda.con.user.service;

import com.nimda.con.user.entity.User;
import com.nimda.con.common.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@Service
public class AuthService {
    
    @Autowired private UserService userService;  
    @Autowired private PasswordEncoder passwordEncoder; 
    @Autowired private JwtUtil jwtUtil;
    
    
    /**
     * 사용자 인증
     */
    @Transactional(readOnly = true)
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
                return Optional.of(userWithoutPassword);
            }
        }
        
        return Optional.empty();
    }
    
    /* 로그인 처리 */

    public Map<String, Object> login(User user) {

        Map<String, Object> response = new HashMap<>();

        String token = jwtUtil.generateToken(user.getUsername(), user.getId()); // JWT 토큰 생성
        
        response.put("access_token", token);
        response.put("user", user);
        
        return response;
    }
    
    /**
     * 회원가입 처리 (UserService에 위임)
     */
    @Transactional
    public User register(String username, String password, String email) {
        // UserService에 사용자 생성 위임 (중복 확인 포함)
        User user = userService.createUser(username, password, email);
        
        // 비밀번호를 제외한 사용자 정보 반환
        User userWithoutPassword = new User();
        userWithoutPassword.setId(user.getId());
        userWithoutPassword.setUsername(user.getUsername());
        userWithoutPassword.setEmail(user.getEmail());
        
        return userWithoutPassword;
    }
}
