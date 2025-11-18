package com.nimda.cup.user.service;

import com.nimda.cup.user.dto.LoginResponseDTO;
import com.nimda.cup.user.entity.User;
import com.nimda.cup.common.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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
     */
    @Transactional(readOnly = true)
    public Optional<User> validateUser(String userId, String password) {
        Optional<User> userOpt = userService.findByUserId(userId);

        if (userOpt.isPresent()) {
            User user = userOpt.get();
            if (passwordEncoder.matches(password, user.getPassword())) {
                // 비밀번호를 제외한 사용자 정보 반환
                User userWithoutPassword = new User();
                userWithoutPassword.setId(user.getId());
                userWithoutPassword.setUserId(user.getUserId());
                userWithoutPassword.setNickname(user.getNickname());
                userWithoutPassword.setEmail(user.getEmail());
                return Optional.of(userWithoutPassword);
            }
        }

        return Optional.empty();
    }

    /* 로그인 처리 */

    public LoginResponseDTO login(User user) {
        String token = jwtUtil.generateToken(user.getNickname(), user.getId()); // JWT 토큰 생성

        LoginResponseDTO.UserInfo userInfo = LoginResponseDTO.UserInfo.builder()
                .id(user.getId())
                .userId(user.getUserId())
                .nickname(user.getNickname())
                .email(user.getEmail())
                .build();

        return LoginResponseDTO.builder()
                .accessToken(token)
                .user(userInfo)
                .build();
    }

    /**
     * 회원가입 처리 (UserService에 위임)
     */
    @Transactional
    public User register(String userId, String nickname, String password, String email,
            String universityName, String department, String grade) {

        // UserService에 사용자 생성 위임 (중복 확인 포함)
        User user = userService.createUser(userId, nickname, password, email,
                universityName, department, grade);

        // 비밀번호를 제외한 사용자 정보 반환
        User userWithoutPassword = new User();
        userWithoutPassword.setId(user.getId());
        userWithoutPassword.setUserId(user.getUserId());
        userWithoutPassword.setNickname(user.getNickname());
        userWithoutPassword.setEmail(user.getEmail());

        return userWithoutPassword;
    }
}
