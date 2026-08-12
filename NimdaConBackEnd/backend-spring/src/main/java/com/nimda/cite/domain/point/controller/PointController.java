package com.nimda.cite.domain.point.controller;

import com.nimda.cite.common.response.ApiResponse;
import com.nimda.cite.domain.point.dto.BalanceResponse;
import com.nimda.cite.domain.point.dto.ManualBalanceUpdateRequest;
import com.nimda.cite.domain.point.dto.PointDetailResponse;
import com.nimda.cite.domain.point.entity.UserBalance;
import com.nimda.cite.domain.point.service.PointService;
import com.nimda.cite.user.entity.User;
import com.nimda.cite.user.repository.UserRepository;
import com.nimda.cite.user.security.CustomUserDetails;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;


import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/cite/point")
@RequiredArgsConstructor
public class PointController {
    private final PointService pointService;
    private final UserRepository userRepository;

    // PointController.java 수정

    @GetMapping
    public ResponseEntity<?> getBalance(@AuthenticationPrincipal CustomUserDetails userDetails) {
        Long userId = userDetails.getUser().getId();

        UserBalance balance = pointService.findUserBalance(userId);
        BalanceResponse dto = BalanceResponse.builder()
                .totalAmount(balance.getTotalAmount())
                .updatedAt(balance.getUpdatedAt())
                .build();

        return ApiResponse.ok("계좌 조회에 성공했습니다.", dto).toResponse();
    }

    // 계좌 전체 조회 (관리자 전용)
    @GetMapping("/allBalance")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> totalBalance(@AuthenticationPrincipal CustomUserDetails userDetails) {
        Long userId = userDetails.getUser().getId();
        List<BalanceResponse> dto = pointService.findAllUserBalance().stream().map(BalanceResponse::from)
                .toList();
        return ApiResponse.ok("계좌 전체 조회에 성공했습니다.",dto).toResponse();
    }

    // 특정 계좌 디테일 조회
    @GetMapping("/pointDetails")
    public ResponseEntity<?> viewPointDetail(@AuthenticationPrincipal CustomUserDetails userDetails) {
        Long userId = userDetails.getUser().getId();

        List<PointDetailResponse> dto = pointService.findPointDetail(userId).stream().map(
                PointDetailResponse::from).toList();

        return ApiResponse.ok("포인트 내역 조회에 성공했습니다.",dto).toResponse();
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateUserBalanceManual(
            @AuthenticationPrincipal CustomUserDetails userDetails, @RequestBody ManualBalanceUpdateRequest req) {

        String studentNum = req.getStudentNum();
        BalanceResponse dto = BalanceResponse.from(
                pointService.updateBalanceManual(studentNum, req.getDescription(), req.getAmount())
                );
        return ApiResponse.ok("마일리지 지급이 완료되었습니다.",dto).toResponse();
    }


    @PostMapping("/bulk")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateUserBalanceManualBulk(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestBody List<ManualBalanceUpdateRequest> requests) {

        List<BalanceResponse> results = pointService.updateBalanceManualBulk(requests)
                .stream()
                .map(BalanceResponse::from)
                .collect(Collectors.toList());

        return ApiResponse.ok("마일리지 일괄 지급이 완료되었습니다.", results).toResponse();
    }


    /**
     * 닉네임으로 특정 유저 마일리지 잔액 조회
     * GET /api/cite/point/user/{nickname}
     */
    @GetMapping("/user/{nickname}")
    public ResponseEntity<?> getBalanceByNickname(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable String nickname) {
        Long targetUserId = resolvePrivateActivityUserId(userDetails, nickname);
        if (targetUserId == null) {
            return ApiResponse.fail("접근 권한이 없습니다.").toResponse(HttpStatus.FORBIDDEN);
        }

        UserBalance balance = pointService.findUserBalance(targetUserId);
        BalanceResponse dto = BalanceResponse.builder()
                .totalAmount(balance.getTotalAmount())
                .updatedAt(balance.getUpdatedAt())
                .build();
        return ApiResponse.ok("계좌 조회에 성공했습니다.", dto).toResponse();
    }

    /**
     * 닉네임으로 특정 유저 마일리지 내역 조회
     * GET /api/cite/point/user/{nickname}/details
     */
    @GetMapping("/user/{nickname}/details")
    public ResponseEntity<?> getPointDetailsByNickname(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable String nickname) {
        Long targetUserId = resolvePrivateActivityUserId(userDetails, nickname);
        if (targetUserId == null) {
            return ApiResponse.fail("접근 권한이 없습니다.").toResponse(HttpStatus.FORBIDDEN);
        }

        List<PointDetailResponse> dto = pointService.findPointDetail(targetUserId).stream()
                .map(PointDetailResponse::from)
                .toList();
        return ApiResponse.ok("포인트 내역 조회에 성공했습니다.", dto).toResponse();
    }

    private Long resolvePrivateActivityUserId(
            CustomUserDetails userDetails, String nickname) {
        if (userDetails == null || userDetails.getUser() == null) {
            return null;
        }
        boolean isAdministrator = userDetails.getAuthorities().stream()
                .anyMatch(authority -> "ROLE_ADMIN".equals(authority.getAuthority()));
        if (!isAdministrator) {
            return userDetails.getUser().getNickname().equals(nickname)
                    ? userDetails.getUser().getId()
                    : null;
        }
        return userRepository.findByNickname(nickname)
                .map(User::getId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
    }

}
