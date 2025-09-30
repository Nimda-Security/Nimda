package com.nimda.con.user.controller;

import com.nimda.con.user.entity.User;
import com.nimda.con.user.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*")
public class UsersController {
    
    @Autowired
    private UserService userService;
    
    /**
     * 모든 사용자 조회
     * @return 사용자 목록
     */
    @GetMapping
    public ResponseEntity<?> getAllUsers() {
        System.out.println("=== getAllUsers() 메서드 호출됨 ===");
        try {
            System.out.println("=== UserService.findAll() 호출 중 ===");
            List<User> users = userService.findAll();
            System.out.println("=== 사용자 수: " + users.size() + " ===");
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("users", users);
            
            System.out.println("=== 응답 생성 완료 ===");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.out.println("=== 오류 발생: " + e.getMessage() + " ===");
            e.printStackTrace();
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "사용자 목록 조회 중 오류가 발생했습니다: " + e.getMessage());
            return ResponseEntity.status(500).body(error);
        }
    }
    
    /**
     * 사용자 정보 조회
     * @param id 사용자 ID
     * @return 사용자 정보
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> getUserById(@PathVariable Long id) {
        try {
            Optional<User> userOpt = userService.findById(id);
            
            if (userOpt.isPresent()) {
                return ResponseEntity.ok(userOpt.get());
            } else {
                Map<String, String> error = new HashMap<>();
                error.put("message", "User not found");
                return ResponseEntity.status(404).body(error);
            }
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Failed to get user: " + e.getMessage());
            return ResponseEntity.status(500).body(error);
        }
    }
    
    /**
     * 사용자명으로 사용자 조회
     * @param username 사용자명
     * @return 사용자 정보
     */
    @GetMapping("/username/{username}")
    public ResponseEntity<?> getUserByUsername(@PathVariable String username) {
        try {
            Optional<User> userOpt = userService.findByUsername(username);
            
            if (userOpt.isPresent()) {
                return ResponseEntity.ok(userOpt.get());
            } else {
                Map<String, String> error = new HashMap<>();
                error.put("message", "User not found");
                return ResponseEntity.status(404).body(error);
            }
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Failed to get user: " + e.getMessage());
            return ResponseEntity.status(500).body(error);
        }
    }
}
