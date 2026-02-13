package com.nimda.cup.user.service;

import com.nimda.cup.user.entity.Authority;
import com.nimda.cup.user.entity.User;
import com.nimda.cup.user.repository.AuthorityRepository;
import com.nimda.cup.user.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AuthorityRepository authorityRepository;

    @Autowired
    private PasswordEncoder passwordEncoder; // Spring Security 비밀번호 암호화 도구

    /*
     * CreateUser : 회원 가입
     */
    @Transactional
    public User createUser(String userId, String name, String nickname, String password,
            String studentNum, String phoneNum, String email, String major,
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
        user.setPhoneNum(phoneNum);
        user.setEmail(email);
        user.setMajor(major);
        user.setUniversityName(universityName);
        user.setGrade(grade);

        // ROLE_USER 권한 찾기 또는 생성
        Authority userRole = authorityRepository.findByAuthorityName("ROLE_USER")
                .orElseGet(() -> {
                    Authority newRole = new Authority();
                    newRole.setAuthorityName("ROLE_USER");
                    return authorityRepository.save(newRole);
                });

        // 사용자에 권한 연결
        user.getAuthorities().add(userRole);

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

    // 모든 사용자 조회
    @Transactional(readOnly = true)
    public List<User> findAll() {
        return userRepository.findAll();
    }
}
