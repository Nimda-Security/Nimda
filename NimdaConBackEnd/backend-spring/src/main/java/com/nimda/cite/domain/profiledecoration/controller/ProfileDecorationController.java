package com.nimda.cite.domain.profiledecoration.controller;

import com.nimda.cite.common.response.ApiResponse;
import com.nimda.cite.common.s3.S3Service;
import com.nimda.cite.domain.profiledecoration.dto.ProfileDecorationCreateRequest;
import com.nimda.cite.domain.profiledecoration.dto.ProfileDecorationDto;
import com.nimda.cite.domain.profiledecoration.entity.ProfileDecoration;
import com.nimda.cite.domain.profiledecoration.ownership.ProfileDecorationOwnershipService;
import com.nimda.cite.domain.profiledecoration.service.ProfileDecorationService;
import com.nimda.cite.user.security.CustomUserDetails;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/cite")
public class ProfileDecorationController {

    private final ProfileDecorationService service;
    private final ProfileDecorationOwnershipService ownershipService;

    @Autowired(required = false)
    private S3Service s3Service;

    public ProfileDecorationController(
            ProfileDecorationService profileDecorationService,
            ProfileDecorationOwnershipService ownershipService) {
        this.service = profileDecorationService;
        this.ownershipService = ownershipService;
    }

    @GetMapping("/profile-decorations")
    public ResponseEntity<?> getActiveDecorations() {
        return ApiResponse.ok(
                service.getActiveDecorations().stream()
                        .map(ProfileDecorationDto::from)
                        .toList()
        ).toResponse();
    }

    @GetMapping("/profile-decorations/{key}/image")
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

    @GetMapping("/profile-decorations/me")
    public ResponseEntity<?> getMyDecorations(@AuthenticationPrincipal CustomUserDetails userDetails) {
        if (userDetails == null) {
            return ApiResponse.fail("로그인이 필요합니다.").toResponse(HttpStatus.UNAUTHORIZED);
        }

        return ApiResponse.ok(
                ownershipService.getOwnedDecorations(userDetails.getUser().getId()).stream()
                        .map(ProfileDecorationDto::from)
                        .toList()
        ).toResponse();
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/admin/profile-decorations")
    public ResponseEntity<?> getAdminDecorations() {
        return ApiResponse.ok(
                service.getAllDecorations().stream()
                        .map(ProfileDecorationDto::from)
                        .toList()
        ).toResponse();
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/admin/profile-decorations")
    public ResponseEntity<?> createDecoration(@RequestBody ProfileDecorationCreateRequest request) {
        try {
            ProfileDecoration decoration = service.create(request);
            return ApiResponse.ok("프로필 배지가 등록되었습니다.", ProfileDecorationDto.from(decoration)).toResponse();
        } catch (IllegalArgumentException e) {
            return ApiResponse.fail(e.getMessage()).toResponse(HttpStatus.BAD_REQUEST);
        }
    }
}
