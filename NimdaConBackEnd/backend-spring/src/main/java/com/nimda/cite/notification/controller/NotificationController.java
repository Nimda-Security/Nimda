package com.nimda.cite.notification.controller;

import com.nimda.cite.notification.entity.Notification;
import com.nimda.cite.notification.repositroy.NotificationRepositroy;
import com.nimda.cup.common.util.JwtUtil;
import com.nimda.cup.user.entity.User;
import com.nimda.cup.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationRepositroy notificationRepository;
    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;

    // 도착한 알림 최신순으로 조회
    @GetMapping
    public ResponseEntity<List<Notification>> getNotifications(@RequestHeader("Authorization") String authHeader) {
        User user = getUserFromToken(authHeader);
        List<Notification> notifications = notificationRepository.findAllByRecipientOrderByCreatedAtDesc(user);
        return ResponseEntity.ok(notifications);
    }

    // 읽지 않은 알람 가지고 오기, 알림 아이콘에 표시
    @GetMapping("/unread-count")
    public ResponseEntity<Map<String, Long>> getUnreadCount(@RequestHeader("Authorization") String authHeader) {
        User user = getUserFromToken(authHeader);
        Long count = notificationRepository.countByRecipientAndIsReadFalse(user);
        return ResponseEntity.ok(Map.of("unreadCount", count));
    }

    // 알림 읽기 처리
    @PatchMapping("/{id}/read")
    public ResponseEntity<Void> markAsRead(@PathVariable Long id) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("알림을 찾을 수 없습니다."));

        notification.setIsRead(true);
        notificationRepository.save(notification);

        return ResponseEntity.ok().build();
    }

    // 읽지 않은 알람 모두 읽기 처리
    @PatchMapping("/read-all")
    public ResponseEntity<Void> markAllAsRead(@RequestHeader("Authorization") String authHeader) {
        User user = getUserFromToken(authHeader);
        List<Notification> unreadNotifications = notificationRepository.findAllByRecipientAndIsReadFalse(user);

        unreadNotifications.forEach(n -> n.setIsRead(true));
        notificationRepository.saveAll(unreadNotifications);

        return ResponseEntity.ok().build();
    }

    // JWT에서 유저 정보를 가져오는 공통 메서드
    private User getUserFromToken(String authHeader) {
        String token = authHeader.substring(7);
        Long userId = jwtUtil.extractUserId(token);
        return userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));
    }
}