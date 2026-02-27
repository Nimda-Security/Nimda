package com.nimda.cup.user.service;

import com.nimda.cup.user.dto.LoginResponseDTO;
import com.nimda.cup.user.entity.User;
import com.nimda.cup.user.enums.ApprovalStatus;
import com.nimda.cup.user.exception.UserNotApprovedException;
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
     * 
     * @param userId   사용자 ID
     * @param password 비밀번호
     * @return 인증된 사용자 정보 (Optional)
     * @throws UserNotApprovedException 승인되지 않은 사용자인 경우
     */
    @Transactional(readOnly = true)
    public Optional<User> validateUser(String userId, String password) {
        Optional<User> userOpt = userService.findByUserId(userId);

        if (userOpt.isPresent()) {
            User user = userOpt.get();

            // 1. 비밀번호 확인
            if (!passwordEncoder.matches(password, user.getPassword())) {
                return Optional.empty(); // 비밀번호 오류
            }

            // 2. 승인 상태 확인
            // Note. 유저의 현재 상태에 따른 커스텀 예회를 반환한다.
            if (user.getStatus() == null || user.getStatus() != ApprovalStatus.APPROVED) {
                if (user.getStatus() == ApprovalStatus.PENDING) {
                    throw new UserNotApprovedException("승인 대기 중인 계정입니다. 관리자 승인 후 로그인할 수 있습니다.");
                } else if (user.getStatus() == ApprovalStatus.REJECTED) {
                    throw new UserNotApprovedException("승인이 거부된 계정입니다.");
                } else {
                    throw new UserNotApprovedException("승인되지 않은 계정입니다.");
                }
            }

            // 3. 인증 성공 - 비밀번호를 제외한 사용자 정보 반환
            User userWithoutPassword = new User();
            userWithoutPassword.setId(user.getId());
            userWithoutPassword.setUserId(user.getUserId());
            userWithoutPassword.setNickname(user.getNickname());
            userWithoutPassword.setEmail(user.getEmail());
            return Optional.of(userWithoutPassword);
        }

        return Optional.empty(); // 사용자를 찾을 수 없음
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
    public User register(String userId, String name, String nickname, String password,
            String studentNum, String email, String major,
            String universityName, String grade) {

        // UserService에 사용자 생성 위임 (중복 확인 포함)
        User user = userService.createUser(userId, name, nickname, password,
                studentNum, email, major, universityName, grade);

        // 비밀번호를 제외한 사용자 정보 반환
        User userWithoutPassword = new User();
        userWithoutPassword.setId(user.getId());
        userWithoutPassword.setUserId(user.getUserId());
        userWithoutPassword.setNickname(user.getNickname());
        userWithoutPassword.setEmail(user.getEmail());

        return userWithoutPassword;
    }
}
