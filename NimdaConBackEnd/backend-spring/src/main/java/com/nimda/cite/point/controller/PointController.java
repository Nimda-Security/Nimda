package com.nimda.cite.point.controller;

import com.nimda.cite.point.service.PointService;
import com.nimda.cup.common.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.nimda.cite.point.enums.PointTypes;

@RestController
@RequestMapping("/api/cite/point")
@RequiredArgsConstructor
public class PointController {
    private final JwtUtil jwtUtil;
    private final PointService pointService;

    @GetMapping("/test")
    public void test(@RequestHeader("Authorization") String authHeader) {
        Long userId = jwtUtil.extractUserId(resolveToken(authHeader));
        pointService.updateBalance(userId, PointTypes.ATTENDANCE);
    }


    protected String resolveToken(String authHeader) {
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            return authHeader.substring(7);
        }
        throw new IllegalArgumentException("유효하지 않은 인증 헤더입니다.");
    }
}
