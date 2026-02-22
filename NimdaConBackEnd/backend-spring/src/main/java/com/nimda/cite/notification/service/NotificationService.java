package com.nimda.cite.notification.service;

import com.nimda.cite.alarm.service.AlarmService;
import com.nimda.cite.notification.entity.Notification;
import com.nimda.cite.notification.repositroy.NotificationRepositroy;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class NotificationService {
    private final NotificationRepositroy notificationRepository;
    private final AlarmService sseEmitterService; // 이미 구현하신 Emitter 서비스

    @Transactional
    public void send(Notification notification) {
        // 1. DB에 알림 저장
        Notification savedNotification = notificationRepository.save(notification);

        // 2. 실시간 알림 전송 (SSE)
        String recipientId = String.valueOf(notification.getRecipient().getId());
        sseEmitterService.sendToClient(recipientId, savedNotification);
    }

    @Transactional
    public void markAsRead(Long notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new IllegalArgumentException("알림이 존재하지 않습니다."));
        notification.setIsRead(true);
    }
}