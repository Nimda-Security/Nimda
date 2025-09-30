package com.nimda.con.user.service;

import com.nimda.con.user.entity.User;
import com.nimda.con.user.repository.UserRepository;
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
    public User createUser(String username, String password, String email) {
        validateUserUniqueness(username, email);
        String encodedPassword = passwordEncoder.encode(password);
        User user = new User(username, encodedPassword, email);
        return userRepository.save(user);
    }
    
    //  사용자 중복 확인
    private void validateUserUniqueness(String username, String email) {

        if (existsByUsername(username)) {
            throw new RuntimeException("Username already exists");
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

    // 조회 메서드 
    @Transactional(readOnly = true)
    public Optional<User> findByUsername(String username) {
        return userRepository.findByUsername(username);
    }

    // 사용자명 중복 확인
    @Transactional(readOnly = true)
    public boolean existsByUsername(String username) {
        return userRepository.existsByUsername(username);
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
