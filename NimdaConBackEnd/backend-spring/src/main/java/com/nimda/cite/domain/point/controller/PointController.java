package com.nimda.cite.point.controller;

import com.nimda.cite.common.response.ApiResponse;
import com.nimda.cite.point.dto.BalanceResponse;
import com.nimda.cite.point.dto.ManualBalanceUpdateRequest;
import com.nimda.cite.point.dto.PointDetailResponse;
import com.nimda.cite.point.entity.UserBalance;
import com.nimda.cite.point.service.PointService;
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

    /**
     * 닉네임으로 특정 유저 마일리지 잔액 조회 (공개 프로필용, 인증 불필요)
     * GET /api/cite/point/user/{nickname}
     */
    @GetMapping("/user/{nickname}")
    public ResponseEntity<?> getBalanceByNickname(@PathVariable String nickname) {
        try {
            return userRepository.findByNickname(nickname)
                    .map(user -> {
                        UserBalance balance = pointService.findUserBalance(user.getId());
                        BalanceResponse dto = BalanceResponse.builder()
                                .totalAmount(balance.getTotalAmount())
                                .updatedAt(balance.getUpdatedAt())
                                .build();
                        return ApiResponse.ok("계좌 조회에 성공했습니다.", dto).toResponse();
                    })
                    .orElseThrow(
                        () -> new IllegalArgumentException("사용자를 찾을 수 없습니다.")
                    );
        } catch (Exception e) {
            return ApiResponse.fail("조회 중 오류가 발생했습니다.")
                    .toResponse(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * 닉네임으로 특정 유저 마일리지 내역 조회 (공개 프로필용, 인증 불필요)
     * GET /api/cite/point/user/{nickname}/details
     */
    @GetMapping("/user/{nickname}/details")
    public ResponseEntity<?> getPointDetailsByNickname(@PathVariable String nickname) {
        try {
            return userRepository.findByNickname(nickname)
                    .map(user -> {
                        List<PointDetailResponse> dto = pointService.findPointDetail(user.getId()).stream()
                                .map(PointDetailResponse::from).toList();
                        return ApiResponse.ok("포인트 내역 조회에 성공했습니다.", dto).toResponse();
                    })
                    .orElseThrow(() ->
                            new ResponseStatusException(HttpStatus.NOT_FOUND));
        } catch (Exception e) {
            return ApiResponse.fail("조회 중 오류가 발생했습니다.")
                    .toResponse(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

}
