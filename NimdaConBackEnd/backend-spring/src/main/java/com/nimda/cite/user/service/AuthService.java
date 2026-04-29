package com.nimda.cite.user.service;

import com.nimda.cite.domain.point.entity.UserBalance;
import com.nimda.cite.domain.point.repositroy.UserBalanceRepository;
import com.nimda.cite.domain.profiledecoration.service.ProfileDecorationService;
import com.nimda.cite.user.dto.LoginResponseDTO;
import com.nimda.cite.user.entity.User;
import com.nimda.cite.user.enums.ApprovalStatus;
import com.nimda.cite.user.exception.UserNotApprovedException;
import com.nimda.cite.common.util.JwtUtil;
import com.nimda.cite.user.repository.UserRepository;
import com.nimda.cite.user.security.CustomUserDetails;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.authentication.event.AuthenticationSuccessEvent;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
public class AuthService {

    @Autowired
    private UserService userService;
    @Autowired
    private PasswordEncoder passwordEncoder;
    @Autowired
    private JwtUtil jwtUtil;
    @Autowired
    private ApplicationEventPublisher eventPublisher;
    @Autowired
    private UserBalanceRepository userBalanceRepository;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private ProfileDecorationService profileDecorationService;

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

        CustomUserDetails userDetails = new CustomUserDetails(fullUser);
        Authentication authentication = new UsernamePasswordAuthenticationToken(
                userDetails, null, userDetails.getAuthorities());

        eventPublisher.publishEvent(new AuthenticationSuccessEvent(authentication));

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
                .profileImage(fullUser.getProfileImage())
                .profileDecoration(fullUser.getProfileDecoration())
                .roles(authorities)
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
            String bojId, String birth) {

        // UserService에 사용자 생성 위임 (중복 확인 포함)
        User user = userService.createUser(userId, name, nickname, password,
                studentNum, email, major, bojId, birth);

        // 비밀번호를 제외한 사용자 정보 반환
        User userWithoutPassword = new User();
        userWithoutPassword.setId(user.getId());
        userWithoutPassword.setUserId(user.getUserId());
        userWithoutPassword.setNickname(user.getNickname());
        userWithoutPassword.setEmail(user.getEmail());

        // 유저 계좌 생성
        UserBalance userBalance = UserBalance.builder()
                .user(user)
                .totalAmount(0L)
                .updatedAt(LocalDateTime.now())
                .build();
        userBalanceRepository.save(userBalance);

        return userWithoutPassword;
    }

    @Transactional
    public boolean toggleEmailHide(Long userId) {
        // 1. 유저 조회 (없으면 예외 발생)
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 사용자입니다."));

        // 2. 상태 반전 (Dirty Checking에 의해 메서드 종료 시 자동 UPDATE)
        boolean newStatus = !user.isEmailHide();
        user.setEmailHide(newStatus);

        return newStatus;
    }

    /**
     * 프로필 이미지 변경 (S3 키 저장)
     */
    @Transactional
    public User updateProfileImage(Long userId, String profileImageKey) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 사용자입니다."));
        user.setProfileImage(profileImageKey);
        return user;
    }

    /**
     * 프로필 장식 변경
     */
    @Transactional
    public User updateProfileDecoration(Long userId, String profileDecorationKey) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 사용자입니다."));
        if (profileDecorationKey == null || profileDecorationKey.isBlank()) {
            user.setProfileDecoration(null);
            return user;
        }

        String decorationKey = profileDecorationKey.trim();
        profileDecorationService.validateUsableDecoration(user, decorationKey);

        user.setProfileDecoration(decorationKey);
        return user;
    }

    /**
     * 프로필 정보 수정 (닉네임, 백준 ID, 생년월일, 학과, 학번)
     * null인 필드는 수정하지 않음 (부분 업데이트)
     */
    @Transactional
    public User updateProfile(Long userId, String nickname, String bojId, String birth, String major, String studentNum) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 사용자입니다."));

        // 닉네임 변경 시 중복 체크
        if (nickname != null && !nickname.isBlank() && !nickname.equals(user.getNickname())) {
            if (userRepository.existsByNickname(nickname)) {
                throw new RuntimeException("이미 사용 중인 닉네임입니다.");
            }
            user.setNickname(nickname);
        }

        if (bojId != null) {
            user.setBojId(bojId.isBlank() ? null : bojId);
        }

        if (birth != null && !birth.isBlank()) {
            user.setBirth(birth);
        }

        if (major != null && !major.isBlank()) {
            user.setMajor(major);
        }

        if (studentNum != null && !studentNum.isBlank()) {
            user.setStudentNum(studentNum);
        }

        // Dirty Checking에 의해 자동 UPDATE
        return user;
    }
}
