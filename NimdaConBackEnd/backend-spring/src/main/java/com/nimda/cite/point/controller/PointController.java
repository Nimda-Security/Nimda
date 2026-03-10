package com.nimda.cite.point.controller;

import com.nimda.cite.common.response.ApiResponse;
import com.nimda.cite.point.dto.BalanceResponse;
import com.nimda.cite.point.dto.PointDetailResponse;
import com.nimda.cite.point.entity.UserBalance;
import com.nimda.cite.point.service.PointService;
import com.nimda.cup.common.util.JwtUtil;
import com.nimda.cup.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/cite/point")
@RequiredArgsConstructor
public class PointController {
    private final JwtUtil jwtUtil;
    private final PointService pointService;
    private final UserRepository userRepository;

    // 계좌 조회
    @GetMapping
    public ResponseEntity<?> getBalance(@RequestHeader("Authorization") String authHeader) {
        Long userId = jwtUtil.extractUserId(resolveToken(authHeader));
        UserBalance balance = pointService.findUserBalance(userId);
        BalanceResponse dto = BalanceResponse.builder()
                .totalAmount(balance.getTotalAmount())
                .updatedAt(balance.getUpdatedAt())
                .build();
        return ApiResponse.ok("계좌 조회에 성공했습니다.",dto).toResponse();
    }

    // 계좌 전체 조회
    @GetMapping("/allBalance")
    public ResponseEntity<?> totalBalance(@RequestHeader("Authorization") String authHeader) {
        Long userId = jwtUtil.extractUserId(resolveToken(authHeader));
        List<BalanceResponse> dto = pointService.findAllUserBalance().stream().map(BalanceResponse::from)
                .toList();
        return ApiResponse.ok("계좌 전체 조회에 성공했습니다.",dto).toResponse();
    }

    // 특정 계좌 디테일 조회
    @GetMapping("/pointDetails")
    public ResponseEntity<?> viewPointDetail(@RequestHeader("Authorization") String authHeader) {
        Long userId = jwtUtil.extractUserId(resolveToken(authHeader));

        List<PointDetailResponse> dto = pointService.findPointDetail(userId).stream().map(
                PointDetailResponse::from).toList();

        return ApiResponse.ok("포인트 내역 조회에 성공했습니다.",dto).toResponse();
    }

    protected String resolveToken(String authHeader) {
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            return authHeader.substring(7);
        }
        throw new IllegalArgumentException("유효하지 않은 인증 헤더입니다.");
    }
}
