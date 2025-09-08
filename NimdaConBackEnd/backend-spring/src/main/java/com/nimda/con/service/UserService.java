package com.nimda.con.service;

import com.nimda.con.entity.User;
import com.nimda.con.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class UserService {
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    /**
     * 사용자명으로 사용자 찾기
     * @param username 사용자명
     * @return 사용자 정보 (Optional)
     */
    public Optional<User> findByUsername(String username) {
        return userRepository.findByUsername(username);
    }
    
    /**
     * ID로 사용자 찾기
     * @param id 사용자 ID
     * @return 사용자 정보 (Optional)
     */
    public Optional<User> findById(Long id) {
        return userRepository.findById(id);
    }
    
    /**
     * 새 사용자 생성
     * @param username 사용자명
     * @param password 비밀번호
     * @param email 이메일
     * @return 생성된 사용자 정보
     */
    public User createUser(String username, String password, String email) {
        // 비밀번호 암호화
        String encodedPassword = passwordEncoder.encode(password);
        
        User user = new User(username, encodedPassword, email);
        return userRepository.save(user);
    }
    
    /**
     * 사용자명 중복 확인
     * @param username 사용자명
     * @return 중복 여부
     */
    public boolean existsByUsername(String username) {
        return userRepository.existsByUsername(username);
    }
    
    /**
     * 이메일 중복 확인
     * @param email 이메일
     * @return 중복 여부
     */
    public boolean existsByEmail(String email) {
        return userRepository.existsByEmail(email);
    }
    
    /**
     * 사용자 정보 업데이트
     * @param user 업데이트할 사용자 정보
     * @return 업데이트된 사용자 정보
     */
    public User updateUser(User user) {
        return userRepository.save(user);
    }
}
