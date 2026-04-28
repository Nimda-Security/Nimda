package com.nimda.cite.EventListener;

import com.nimda.cite.domain.alarm.service.AlarmService;
import com.nimda.cite.domain.attendance.service.AttendanceService;
import com.nimda.cite.domain.point.enums.PointTypes;
import com.nimda.cite.domain.point.service.PointService;
import com.nimda.cite.user.security.CustomUserDetails;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.security.authentication.event.AuthenticationSuccessEvent;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class LoginEventListener {

    private final AttendanceService attendanceService;
    private final AlarmService alarmService;
    private final PointService pointService;

    @Async
    @EventListener
    public void onLoginSuccess(AuthenticationSuccessEvent event) {
        Object principal = event.getAuthentication().getPrincipal();

        if (principal instanceof CustomUserDetails userDetails) {
            Long userId = userDetails.getUser().getId();

            // 1. 자동 출석 체크
            boolean isAttendance = handleAutoAttendance(userId);

            // 2. 알림 구독/초기화 로직
            handleNotificationSubscription(userId);

            if(isAttendance) {
                // 출석 마일리지 지급
                handleAddAttendancePoint(userId);
            }
        }
    }

    private boolean handleAutoAttendance(Long userId) {
        try {
            attendanceService.markAttendance(userId);
            log.info("사용자 {} - 자동 출석 완료", userId);
            return true;
        } catch (Exception e) {
            log.info("사용자 {} - 자동 출석 건너뜀: {}", userId, e.getMessage());
        }
        return false;
    }

    private void handleNotificationSubscription(Long userId) {
        try {
            // 로그인 시점에 사용자의 알림 채널을 활성화하거나
            // 미확인 알림 개수를 체크하는 등의 로직을 수행합니다.
            alarmService.subscribe(userId);
            log.info("사용자 {} - 알림 구독 활성화 완료", userId);
        } catch (Exception e) {
            log.error("사용자 {} - 알림 구독 처리 중 오류: {}", userId, e.getMessage());
        }
    }

    private void handleAddAttendancePoint(Long userId) {
        pointService.updateBalanceAuto(userId, PointTypes.ATTENDANCE);
    }
}