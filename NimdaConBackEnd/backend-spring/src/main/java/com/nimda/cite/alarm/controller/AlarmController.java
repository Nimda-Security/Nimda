package com.nimda.cite.alarm.controller;

import com.nimda.cite.alarm.service.AlarmService;
import com.nimda.cup.common.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/alarm")
public class AlarmController {
    private final AlarmService alarmService;
    private final JwtUtil jwtUtil;

    @GetMapping("/subscribe")
    public SseEmitter subscribe(@RequestHeader("Authorization") String authHeader) {
        Long userId = jwtUtil.extractUserId(authHeader.substring(7));
        return alarmService.subscribe(userId);
    }
}
