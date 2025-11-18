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

    @Transactional(readOnly = true)
    public LoginResponseDTO login(User user) {
        // 권한 정보를 포함한 전체 User 객체 조회 (@EntityGraph로 권한 정보 함께 로드)
        User fullUser = userService.findById(user.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        // 사용자의 권한 목록 추출 (@EntityGraph로 이미 로드됨)
        java.util.List<String> authorities = fullUser.getAuthorities().stream()
                .map(authority -> authority.getAuthorityName())
                .collect(java.util.stream.Collectors.toList());

        // 디버깅용 로그
        System.out.println("[AuthService] User: " + fullUser.getNickname() + " (ID: " + fullUser.getId() + ")");
        System.out.println("[AuthService] Authority count: " + authorities.size());
        System.out.println("[AuthService] Authorities: " + authorities);

        String token = jwtUtil.generateToken(fullUser.getNickname(), fullUser.getId(), authorities); // JWT 토큰 생성

        LoginResponseDTO.UserInfo userInfo = LoginResponseDTO.UserInfo.builder()
                .id(fullUser.getId())
                .userId(fullUser.getUserId())
                .nickname(fullUser.getNickname())
                .email(fullUser.getEmail())
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
