package com.nimda.cite.user.service;

import com.nimda.cite.user.entity.Authority;
import com.nimda.cite.user.entity.User;
import com.nimda.cite.user.enums.ApprovalStatus;
import com.nimda.cite.user.repository.AuthorityRepository;
import com.nimda.cite.user.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

/**
 * 관리자용 사용자 관리 서비스
 * 
 * [역할]
 * - 사용자 승인/거부
 * - 승인 대기 사용자 목록 조회
 * - 모든 사용자 조회
 * 
 * [책임 분리]
 * - 일반 사용자 기능: UserService
 * - 관리자 기능: AdminUserService
 */
@Service
public class AdminUserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AuthorityRepository authorityRepository;

    /**
     * 모든 사용자 조회
     */
    @Transactional(readOnly = true)
    public List<User> findAll() {
        return userRepository.findAll();
    }

    /**
     * ID로 사용자 조회
     */
    @Transactional(readOnly = true)
    public User findById(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다: " + userId));
    }

    /**
     * 승인 상태로 사용자 목록 조회
     */
    @Transactional(readOnly = true)
    public List<User> findByStatus(ApprovalStatus status) {
        return userRepository.findByStatus(status);
    }

    /**
     * 사용자 승인
     * - status를 APPROVED로 변경
     * - ROLE_USER 권한 부여
     */
    @Transactional
    public User approveUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다: " + userId));

        // status를 APPROVED로 변경
        user.setStatus(ApprovalStatus.APPROVED);

        // ROLE_USER 권한 부여 (이미 권한이 있으면 추가하지 않음)
        Authority userRole = authorityRepository.findByAuthorityName("ROLE_USER")
                .orElseThrow(() -> new RuntimeException("ROLE_USER 권한을 찾을 수 없습니다."));

        if (!user.getAuthorities().contains(userRole)) {
            user.getAuthorities().add(userRole);
        }

        return userRepository.save(user);
    }

    /**
     * 사용자 거부
     * - status를 REJECTED로 변경
     */
    @Transactional
    public User rejectUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다: " + userId));

        // status를 REJECTED로 변경
        user.setStatus(ApprovalStatus.REJECTED);

        return userRepository.save(user);
    }

    /**
     * 서버에 등록된 권한 목록 조회
     */
    @Transactional(readOnly = true)
    public List<String> findAllRoleNames() {
        return authorityRepository.findAll().stream()
                .map(Authority::getAuthorityName)
                .sorted(Comparator.naturalOrder())
                .collect(Collectors.toList());
    }

  /**
     * 사용자에게 권한 1개를 추가 부여한다. (기존 권한은 유지)
     */
    @Transactional
    public User grantRole(Long userId, String roleName) {
        if (roleName == null || roleName.isBlank()) {
            throw new RuntimeException("부여할 권한이 비어 있습니다.");
        }

        // 1. 권한 이름 정규화 (ROLE_ 접두사 처리)
        String normalized = roleName.trim().toUpperCase();
        if (!normalized.startsWith("ROLE_")) {
            normalized = "ROLE_" + normalized;
        }
        final String normalizedRole = normalized;

        // 2. 사용자 및 권한 존재 여부 확인
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다. ID: " + userId));

        // final 변수로 선언하여 람다식 내부에서 안전하게 사용
        final String finalRoleName = normalizedRole; 
        Authority authority = authorityRepository.findByAuthorityName(finalRoleName)
                .orElseThrow(() -> new RuntimeException("서버에 존재하지 않는 권한입니다: " + finalRoleName));

        // 3. 중복 체크 및 권한 추가
        // 주의: user.getAuthorities()가 Security 메서드라면 엔티티의 실제 컬렉션 필드(예: user.getRoles())를 사용하는 것이 좋습니다.
        boolean alreadyHasRole = user.getAuthorities().stream()
                .anyMatch(a -> finalRoleName.equals(a.getAuthorityName()));

        if (!alreadyHasRole) {
            user.getAuthorities().add(authority);
            // JPA의 변경 감지(Dirty Checking) 기능 덕분에 @Transactional이 있으면 save를 명시하지 않아도 되지만, 
            // 명시적 가독성을 위해 남겨둘 수 있습니다.
            return userRepository.save(user);
        }

        return user;
    }

    /**
     * 사용자에게서 권한 1개를 제거한다.
     */
    @Transactional
    public User revokeRole(Long userId, String roleName) {
        if (roleName == null || roleName.isBlank()) {
            throw new RuntimeException("제거할 권한이 비어 있습니다.");
        }

        String normalized = roleName.trim().toUpperCase();
        if (!normalized.startsWith("ROLE_")) {
            normalized = "ROLE_" + normalized;
        }
        final String normalizedRole = normalized;

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다. ID: " + userId));

        boolean removed = user.getAuthorities().removeIf(a -> normalizedRole.equals(a.getAuthorityName()));
        if (!removed) {
            throw new RuntimeException("사용자에게 해당 권한이 없습니다: " + normalizedRole);
        }

        return userRepository.save(user);
    }
}
