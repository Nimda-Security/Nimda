package com.nimda.cup.user.controller;

import com.nimda.cite.common.s3.S3Service;
import com.nimda.cup.user.entity.User;
import com.nimda.cup.user.service.AdminUserService;
import com.nimda.cup.user.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/users")
public class UsersController {

    @Autowired
    private UserService userService;

    @Autowired
    private AdminUserService adminUserService;

    @Autowired(required = false)
    private S3Service s3Service;

    // Note. getAllUsers() - 모든 사용자 목록 조회
    @GetMapping
    public ResponseEntity<?> getAllUsers() {
        try {
            List<User> users = adminUserService.findAll();
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("users", users);
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            e.printStackTrace();
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "사용자 목록 조회 중 오류가 발생했습니다: " + e.getMessage());
            return ResponseEntity.status(500).body(error);
        }
    }

    // Note. getUserById() - id로 사용자 정보를 조회한다.
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
     * user_id로 사용자 조회
     * 
     * @param userId 로그인 아이디
     * @return 사용자 정보
     */
    @GetMapping("/user-id/{userId}")
    public ResponseEntity<?> getUserByUserId(@PathVariable String userId) {
        try {
            Optional<User> userOpt = userService.findByUserId(userId);

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
     * 닉네임으로 사용자 조회 (공개 프로필)
     *
     * @param nickname 닉네임
     * @return 공개 가능한 사용자 정보
     */
    @GetMapping("/nickname/{nickname}")
    public ResponseEntity<?> getUserByNickname(@PathVariable String nickname) {
        try {
            Optional<User> userOpt = userService.findByNickname(nickname);

            if (userOpt.isEmpty()) {
                Map<String, String> error = new HashMap<>();
                error.put("message", "User not found");
                return ResponseEntity.status(404).body(error);
            }

            User user = userOpt.get();

            // 프로필 이미지 S3 키 → Presigned URL 변환
            String profileImage = user.getProfileImage();
            if (profileImage != null && !profileImage.isBlank() && !profileImage.startsWith("http") && s3Service != null) {
                profileImage = s3Service.createPresignedGetUrl(profileImage, 60);
            }

            Map<String, Object> profile = new LinkedHashMap<>();
            profile.put("nickname", user.getNickname());
            profile.put("profileImage", profileImage);
            profile.put("bojId", user.getBojId());
            profile.put("universityName", user.getUniversityName());
            profile.put("major", user.getMajor());
            profile.put("grade", user.getGrade());
            profile.put("createdAt", user.getCreatedAt());
            // 이메일 공개 여부에 따라 포함
            if (!user.isEmailHide()) {
                profile.put("email", user.getEmail());
            }

            return ResponseEntity.ok(profile);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Failed to get user: " + e.getMessage());
            return ResponseEntity.status(500).body(error);
        }
    }

}
