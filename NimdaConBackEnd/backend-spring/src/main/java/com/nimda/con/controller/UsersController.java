package com.nimda.con.controller;

import com.nimda.con.entity.User;
import com.nimda.con.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*")
public class UsersController {
    
    @Autowired
    private UserService userService;
    
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
