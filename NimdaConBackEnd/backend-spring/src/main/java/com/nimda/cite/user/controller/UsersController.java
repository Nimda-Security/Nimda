package com.nimda.cite.user.controller;

import com.nimda.cite.common.s3.S3Service;
import com.nimda.cite.user.entity.User;
import com.nimda.cite.user.service.AdminUserService;
import com.nimda.cite.user.service.UserService;
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
            profile.put("profileDecoration", user.getProfileDecoration());
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
