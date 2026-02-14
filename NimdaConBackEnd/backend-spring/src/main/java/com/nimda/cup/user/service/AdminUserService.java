package com.nimda.cup.user.service;

import com.nimda.cup.user.entity.Authority;
import com.nimda.cup.user.entity.User;
import com.nimda.cup.user.enums.ApprovalStatus;
import com.nimda.cup.user.repository.AuthorityRepository;
import com.nimda.cup.user.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

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
}
