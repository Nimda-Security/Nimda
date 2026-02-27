package com.nimda.cup.user.service;

import com.nimda.cup.user.entity.User;
import com.nimda.cup.user.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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
            String universityName, String grade) {
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
        user.setUniversityName(universityName);
        user.setGrade(grade);

        // 승인 전까지 권한 없이 생성 (기본값: status = PENDING)
        // 승인 시 AdminUserController에서 ROLE_USER 권한 부여

        return userRepository.save(user);
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
