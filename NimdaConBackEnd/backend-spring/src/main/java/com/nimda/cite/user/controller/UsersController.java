package com.nimda.cup.user.controller;

import com.nimda.cite.common.s3.S3Service;
import com.nimda.cup.user.entity.User;
import com.nimda.cup.user.service.AdminUserService;
import com.nimda.cup.user.service.UserService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/users")
public class UsersController {

    private static final Logger log = LoggerFactory.getLogger(UsersController.class);

    @Autowired
    private UserService userService;

    @Autowired
    private AdminUserService adminUserService;

    @Autowired(required = false)
    private S3Service s3Service;

    // Note. getAllUsers() - 모든 사용자 목록 조회 (관리자 전용)
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getAllUsers() {
        try {
            List<User> users = adminUserService.findAll();
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("users", users);
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("사용자 목록 조회 중 오류 발생", e);
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "사용자 목록 조회 중 오류가 발생했습니다.");
            return ResponseEntity.status(500).body(error);
        }
    }

    // Note. getUserById() - id로 사용자 정보를 조회한다.
    @GetMapping("/{id}")
    public ResponseEntity<?> getUserById(@PathVariable Long id) {
        try {
            Optional<User> userOpt = userService.findById(id);

            if (userOpt.isEmpty()) {
                Map<String, String> error = new HashMap<>();
                error.put("message", "User not found");
                return ResponseEntity.status(404).body(error);
            }

            User user = userOpt.get();

            // profileImage S3 키 → Presigned URL 변환
            String profileImage = user.getProfileImage();
            if (profileImage != null && !profileImage.isBlank() && !profileImage.startsWith("http") && s3Service != null) {
                profileImage = s3Service.createPresignedGetUrl(profileImage, 60);
            }

            Map<String, Object> userMap = new LinkedHashMap<>();
            userMap.put("id", user.getId());
            userMap.put("userId", user.getUserId());
            userMap.put("name", user.getName());
            userMap.put("nickname", user.getNickname());
            userMap.put("email", user.getEmail());
            userMap.put("studentNum", user.getStudentNum());
            userMap.put("major", user.getMajor());
            userMap.put("status", user.getStatus());
            userMap.put("birth", user.getBirth());
            userMap.put("bojId", user.getBojId());
            userMap.put("emailHide", user.isEmailHide());
            userMap.put("profileImage", profileImage);
            userMap.put("createdAt", user.getCreatedAt());
            userMap.put("updatedAt", user.getUpdatedAt());

            return ResponseEntity.ok(userMap);
        } catch (Exception e) {
            log.error("사용자 조회 중 오류 발생", e);
            Map<String, String> error = new HashMap<>();
            error.put("message", "사용자 조회 중 오류가 발생했습니다.");
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
            log.error("사용자 조회 중 오류 발생", e);
            Map<String, String> error = new HashMap<>();
            error.put("message", "사용자 조회 중 오류가 발생했습니다.");
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
            profile.put("major", user.getMajor());
            profile.put("createdAt", user.getCreatedAt());
            // 이메일 공개 여부에 따라 포함
            if (!user.isEmailHide()) {
                profile.put("email", user.getEmail());
            }

            return ResponseEntity.ok(profile);
        } catch (Exception e) {
            log.error("사용자 조회 중 오류 발생", e);
            Map<String, String> error = new HashMap<>();
            error.put("message", "사용자 조회 중 오류가 발생했습니다.");
            return ResponseEntity.status(500).body(error);
        }
    }

}
