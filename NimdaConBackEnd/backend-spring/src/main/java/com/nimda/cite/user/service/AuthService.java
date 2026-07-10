package com.nimda.cite.user.service;

import com.nimda.cite.domain.attachment.service.AttachmentService;
import com.nimda.cite.domain.point.entity.UserBalance;
import com.nimda.cite.domain.point.repositroy.UserBalanceRepository;
import com.nimda.cite.user.dto.LoginResponseDTO;
import com.nimda.cite.user.entity.User;
import com.nimda.cite.user.enums.ApprovalStatus;
import com.nimda.cite.user.exception.UserNotApprovedException;
import com.nimda.cite.domain.profiledecoration.entity.ProfileDecoration;
import com.nimda.cite.domain.profiledecoration.repository.ProfileDecorationRepository;
import com.nimda.cite.domain.profiledecoration.ownership.ProfileDecorationOwnershipService;
import com.nimda.cite.common.util.JwtUtil;
import com.nimda.cite.user.repository.UserRepository;
import com.nimda.cite.user.security.CustomUserDetails;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.authentication.event.AuthenticationSuccessEvent;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
public class AuthService {
    private static final String DUMMY_PASSWORD_HASH =
            "$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy";

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
    private ProfileDecorationRepository profileDecorationRepository;

    @Autowired
    private ProfileDecorationOwnershipService profileDecorationOwnershipService;
    @Autowired
    private AttachmentService attachmentService;

    /**
     * Validates credentials and issues a token from the same database snapshot.
     * A concurrent password/status/role change rotates authVersion, so a token built
     * from this snapshot is rejected rather than upgraded to the newer version.
     */
    @Transactional(readOnly = true)
    public Optional<LoginResponseDTO> authenticate(String userId, String password) {
        Optional<User> userOpt = userRepository.findByUserId(userId);
        if (userOpt.isEmpty()) {
            passwordEncoder.matches(password, DUMMY_PASSWORD_HASH);
            return Optional.empty();
        }

        User user = userOpt.get();
        if (!passwordEncoder.matches(password, user.getPassword())) {
            return Optional.empty();
        }
        if (user.getStatus() == null || user.getStatus() != ApprovalStatus.APPROVED) {
            throw new UserNotApprovedException("승인되지 않은 계정입니다.");
        }

        CustomUserDetails userDetails = new CustomUserDetails(user);
        Authentication authentication = new UsernamePasswordAuthenticationToken(
                userDetails, null, userDetails.getAuthorities());
        eventPublisher.publishEvent(new AuthenticationSuccessEvent(authentication));

        java.util.List<String> authorities = user.getAuthorities().stream()
                .map(authority -> authority.getAuthorityName())
                .collect(java.util.stream.Collectors.toList());
        String token = jwtUtil.generateToken(
                user.getNickname(),
                user.getId(),
                user.getAuthVersion(),
                authorities);

        LoginResponseDTO.UserInfo userInfo = LoginResponseDTO.UserInfo.builder()
                .id(user.getId())
                .userId(user.getUserId())
                .nickname(user.getNickname())
                .email(user.getEmail())
                .profileImage(user.getProfileImage())
                .profileDecoration(user.getProfileDecoration())
                .roles(authorities)
                .build();

        return Optional.of(LoginResponseDTO.builder()
                .accessToken(token)
                .user(userInfo)
                .build());
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
    public boolean setEmailHide(Long userId, boolean emailHide) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 사용자입니다."));
        user.setEmailHide(emailHide);
        return user.isEmailHide();
    }

    /**
     * 프로필 이미지 변경 (S3 키 저장)
     */
    @Transactional
    public User updateProfileImage(Long userId, String profileImageKey) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 사용자입니다."));
        String finalizedKey = attachmentService.finalizeProfileImage(profileImageKey, userId);
        String previousKey = user.getProfileImage();
        user.setProfileImage(finalizedKey);

        if (previousKey != null && !previousKey.equals(finalizedKey)) {
            attachmentService.enqueueOwnedProfileImageDeletion(previousKey, userId);
        }
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
        ProfileDecoration decoration = profileDecorationRepository.findByKey(decorationKey)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 프로필 장식입니다."));
        if (!decoration.isActive()) {
            throw new IllegalArgumentException("사용할 수 없는 프로필 장식입니다.");
        }

        if (!profileDecorationOwnershipService.owns(userId, decoration.getId())) {
            throw new SecurityException("보유한 프로필 장식만 사용할 수 있습니다.");
        }

        user.setProfileDecoration(
                decorationKey);
        return user;
    }

    /**
     * 프로필 정보 수정 (닉네임, 백준 ID, 생년월일, 학과)
     * null인 필드는 수정하지 않음 (부분 업데이트)
     */
    @Transactional
    public User updateProfile(Long userId, String nickname, String bojId, String birth, String major) {
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

        // Dirty Checking에 의해 자동 UPDATE
        return user;
    }

    @Transactional
    public void activatePasswordReset(
            String userId,
            String studentNum,
            String email,
            String passwordResetTokenId) {
        User user = lockedRecoveryUser(userId);
        requireMatchingRecoveryIdentity(user, studentNum, email);
        user.setPasswordResetTokenId(passwordResetTokenId);
    }

    @Transactional
    public void changePassword(
            String userId,
            String studentNum,
            String email,
            String password,
            String passwordResetTokenId) {
        User user = lockedRecoveryUser(userId);
        requireMatchingRecoveryIdentity(user, studentNum, email);

        if (user.getPasswordResetTokenId() == null
                || !user.getPasswordResetTokenId().equals(passwordResetTokenId)) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN, "유효하지 않거나 이미 사용한 비밀번호 재설정 요청입니다.");
        }

        user.setPassword(passwordEncoder.encode(password));
        user.setPasswordResetTokenId(null);
        user.rotateAuthVersion();
    }

    private User lockedRecoveryUser(String userId) {
        return userRepository.findByUserIdForPasswordReset(userId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "사용자를 찾을 수 없습니다."));
    }

    private void requireMatchingRecoveryIdentity(
            User user, String studentNum, String email) {
        if (!user.getStudentNum().equals(studentNum) || !user.getEmail().equals(email)) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN, "비밀번호 재설정 정보가 일치하지 않습니다.");
        }
    }

    @Transactional(readOnly = true)
    public boolean hasExactRecoveryIdentity(String userId, String studentNum, String email) {
        return userRepository.existsByUserIdAndStudentNumAndEmail(userId, studentNum, email);
    }

    @Transactional
    public void rotateAuthVersion(Long userId) {
        if (userRepository.incrementAuthVersion(userId) != 1) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND);
        }
    }
}
