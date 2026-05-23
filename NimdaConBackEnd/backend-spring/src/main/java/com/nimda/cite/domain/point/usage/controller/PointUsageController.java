package com.nimda.cite.domain.point.usage.controller;

import com.nimda.cite.common.response.ApiResponse;
import com.nimda.cite.domain.point.usage.dto.PointUsageResponse;
import com.nimda.cite.domain.point.usage.service.PointUsageService;
import com.nimda.cite.user.security.CustomUserDetails;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/cite/board")
@RequiredArgsConstructor
public class PointUsageController {

    private final PointUsageService pointUsageService;

    @PostMapping("/{id}/purchase")
    public ResponseEntity<?> purchase(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable("id") Long id) {
        if (userDetails == null) {
            return ApiResponse.fail("로그인이 필요합니다.").toResponse(HttpStatus.UNAUTHORIZED);
        }

        try {
            PointUsageResponse response = pointUsageService.purchaseBoardItem(userDetails.getUser().getId(), id);
            return ApiResponse.ok("구매가 완료되었습니다.", response).toResponse();
        } catch (ResponseStatusException e) {
            HttpStatus status = HttpStatus.valueOf(e.getStatusCode().value());
            return ApiResponse.fail(e.getReason() != null ? e.getReason() : "구매에 실패했습니다.").toResponse(status);
        }
    }
}
