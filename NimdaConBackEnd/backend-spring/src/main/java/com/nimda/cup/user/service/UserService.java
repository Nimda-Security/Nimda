package com.nimda.cup.user.service;

import com.nimda.cup.user.entity.User;
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
    private PasswordEncoder passwordEncoder; // Spring Security 비밀번호 암호화 도구

    /*
     * CreateUser : 회원 가입
     */
    @Transactional
    public User createUser(String userId, String nickname, String password, String email,
            String universityName, String department, String grade) {
        validateUserUniqueness(userId, nickname, email);
        String encodedPassword = passwordEncoder.encode(password);
        User user = new User(userId, nickname, encodedPassword, email,
                universityName, department, grade);
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
