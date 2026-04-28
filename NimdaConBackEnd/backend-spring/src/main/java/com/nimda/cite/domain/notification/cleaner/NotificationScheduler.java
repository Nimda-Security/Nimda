package com.nimda.cite.notification.cleaner;

import com.nimda.cite.notification.repositroy.NotificationRepositroy;
import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
@RequiredArgsConstructor
@Slf4j
public class NotificationScheduler {

    private final NotificationRepositroy notificationRepository;

    @Scheduled(cron = "0 0 0 * * *")
    @Transactional
    public void deleteExpiredNotifications() {
        log.info("만료된 알림 삭제 스케줄러 가동 중...");

        LocalDateTime now = LocalDateTime.now();
        // expiredAt이 현재 시간보다 이전인 데이터를 한꺼번에 삭제
        int deletedCount = notificationRepository.deleteByExpiredAtBefore(now);

        log.info("만료된 알림 {}건이 정리되었습니다.", deletedCount);
    }
}