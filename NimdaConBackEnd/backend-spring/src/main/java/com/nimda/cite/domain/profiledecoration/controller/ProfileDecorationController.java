package com.nimda.cite.domain.profiledecoration.controller;

import com.nimda.cite.common.response.ApiResponse;
import com.nimda.cite.common.s3.S3Service;
import com.nimda.cite.domain.profiledecoration.dto.ProfileDecorationCreateRequest;
import com.nimda.cite.domain.profiledecoration.entity.ProfileDecoration;
import com.nimda.cite.domain.profiledecoration.service.ProfileDecorationService;
import com.nimda.cite.user.security.CustomUserDetails;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
public class ProfileDecorationController {

    private final ProfileDecorationService service;

    @Autowired(required = false)
    private S3Service s3Service;

    @GetMapping("/api/profile-decorations")
    public ResponseEntity<?> getAvailableDecorations(@AuthenticationPrincipal CustomUserDetails userDetails) {
        return ApiResponse.ok(
                service.getAvailableDecorations(userDetails == null ? null : userDetails.getUser())
        ).toResponse();
    }

    @GetMapping("/api/profile-decorations/{key}/image")
    public ResponseEntity<?> getDecorationImage(@PathVariable String key) {
        ProfileDecoration decoration = service.getByKey(key);
        String filePath = decoration.getFilePath();

        if (filePath.startsWith("/") || filePath.startsWith("http://") || filePath.startsWith("https://")) {
            return ResponseEntity.status(HttpStatus.FOUND)
                    .header(HttpHeaders.LOCATION, filePath)
                    .build();
        }

        if (s3Service == null) {
            return ApiResponse.fail("배지 이미지 서비스를 사용할 수 없습니다.").toResponse(HttpStatus.SERVICE_UNAVAILABLE);
        }

        String url = s3Service.createPresignedGetUrl(filePath, 60, "inline");
        return ResponseEntity.status(HttpStatus.FOUND)
                .header(HttpHeaders.LOCATION, url)
                .build();
    }

    @GetMapping("/api/admin/profile-decorations")
    public ResponseEntity<?> getAdminDecorations() {
        return ApiResponse.ok(service.getAllDecorations()).toResponse();
    }

    @PostMapping("/api/admin/profile-decorations")
    public ResponseEntity<?> createDecoration(@RequestBody ProfileDecorationCreateRequest request) {
        try {
            return ApiResponse.ok("프로필 배지가 등록되었습니다.", service.create(request)).toResponse();
        } catch (IllegalArgumentException e) {
            return ApiResponse.fail(e.getMessage()).toResponse(HttpStatus.BAD_REQUEST);
        }
    }
}
