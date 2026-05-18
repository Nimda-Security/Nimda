package com.nimda.cite.user.service;

import com.nimda.cite.user.entity.User;
import com.nimda.cite.user.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.Optional;

/**
 * 일반 사용자용 서비스
 * 
 * [역할]
 * - 회원가입
 * - 사용자 정보 조회/수정
 * - 중복 확인
 * 
 * [책임 분리]
 * - 일반 사용자 기능: UserService
 * - 관리자 기능: AdminUserService
 */
@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder; // Spring Security 비밀번호 암호화 도구

    /*
     * CreateUser : 회원 가입
     */
    @Transactional
    public User createUser(String userId, String name, String nickname, String password,
            String studentNum, String email, String major,
            String bojId, String birth) {
        validateUserUniqueness(userId, nickname, email);
        String encodedPassword = passwordEncoder.encode(password);

        // ERD 기반 필수 필드로 사용자 생성
        User user = new User();
        user.setUserId(userId);
        user.setName(name);
        user.setNickname(nickname);
        user.setPassword(encodedPassword);
        user.setStudentNum(studentNum);
        user.setEmail(email);
        user.setMajor(major);
        user.setBojId(bojId);
        user.setBirth(birth);

        // 승인 전까지 권한 없이 생성 (기본값: status = PENDING)
        // 승인 시 AdminUserController에서 ROLE_USER 권한 부여

        return userRepository.save(user);
    }

    @Transactional
    public void changePassword(String userId, String password) {
        User user = userRepository.findByUserId(userId).orElseThrow(
                () -> new ResponseStatusException(HttpStatus.NOT_FOUND)
        );

        String encodedPassword = passwordEncoder.encode(password);
        user.setPassword(encodedPassword);
    }

    // 사용자 중복 확인
    private void validateUserUniqueness(String userId, String nickname, String email) {

        if (existsByUserId(userId)) {
            throw new RuntimeException("User ID already exists");
        }

        if (existsByNickname(nickname)) {
            throw new RuntimeException("Nickname already exists");
        }

        if (existsByEmail(email)) {
            throw new RuntimeException("Email already exists");
        }

    }

    // ID로 사용자 찾기
    @Transactional(readOnly = true)
    public Optional<User> findById(Long id) {
        return userRepository.findById(id);
    }

    // user_id로 사용자 찾기
    @Transactional(readOnly = true)
    public Optional<User> findByUserId(String userId) {
        return userRepository.findByUserId(userId);
    }

    // 닉네임으로 사용자 찾기
    @Transactional(readOnly = true)
    public Optional<User> findByNickname(String nickname) {
        return userRepository.findByNickname(nickname);
    }

    // user_id 중복 확인
    @Transactional(readOnly = true)
    public boolean existsByUserId(String userId) {
        return userRepository.existsByUserId(userId);
    }

    // 닉네임 중복 확인
    @Transactional(readOnly = true)
    public boolean existsByNickname(String nickname) {
        return userRepository.existsByNickname(nickname);
    }

    /// 이메일 중복 확인
    @Transactional(readOnly = true)
    public boolean existsByEmail(String email) {
        return userRepository.existsByEmail(email);
    }

    // 사용자 정보 업데이트
    @Transactional
    public User updateUser(User user) {
        return userRepository.save(user);
    }
}
