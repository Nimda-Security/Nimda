package com.nimda.con.user.service;

import com.nimda.con.user.entity.User;
import com.nimda.con.user.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class UserService {
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder; // Spring Security 비밀번호 암호화 도구
    
    
    // UserService 고유 기능 (비즈니스 로직) - 새 사용자 생성 
    public User createUser(String username, String password, String email) {

        // 비즈니스 로직 1: 중복 확인
        validateUserUniqueness(username, email);
        
        // 비즈니스 로직 2: 비밀번호 암호화
        String encodedPassword = passwordEncoder.encode(password);
        
        // 사용자 생성
        User user = new User(username, encodedPassword, email);
        return userRepository.save(user);
    }
    
    //  UserService 고유 기능 (비즈니스 로직) - 사용자 중복 확인
    private void validateUserUniqueness(String username, String email) {

        if (existsByUsername(username)) {
            throw new RuntimeException("Username already exists");
        }

        if (existsByEmail(email)) {
            throw new RuntimeException("Email already exists");
        }

    }
    

    // Respository 위임 메서드 

    // ID로 사용자 찾기
    public Optional<User> findById(Long id) {
        return userRepository.findById(id);
    }

    // 조회 메서드 
    public Optional<User> findByUsername(String username) {
        return userRepository.findByUsername(username);
    }

    // 사용자명 중복 확인
    public boolean existsByUsername(String username) {
        return userRepository.existsByUsername(username);
    }
    
    /// 이메일 중복 확인
    public boolean existsByEmail(String email) {
        return userRepository.existsByEmail(email);
    }
    
    // 사용자 정보 업데이트 
    public User updateUser(User user) {
        return userRepository.save(user);
    }
}
