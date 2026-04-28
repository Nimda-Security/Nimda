package com.nimda.cite.alarm.controller;

import com.nimda.cite.alarm.service.AlarmService;
import com.nimda.cite.user.security.CustomUserDetails;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/alarm")
public class AlarmController {
    private final AlarmService alarmService;

    @GetMapping("/subscribe")
    public SseEmitter subscribe(@AuthenticationPrincipal CustomUserDetails userDetails) {
        Long userId = userDetails.getUser().getId();
        return alarmService.subscribe(userId);
    }
}
