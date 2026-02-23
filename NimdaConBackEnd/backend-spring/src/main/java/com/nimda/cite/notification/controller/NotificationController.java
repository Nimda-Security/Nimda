package com.nimda.cite.notification.controller;

import com.nimda.cite.notification.dto.NotificationResponse;
import com.nimda.cite.notification.entity.Notification;
import com.nimda.cite.notification.repositroy.NotificationRepositroy;
import com.nimda.cite.notification.service.NotificationService;
import com.nimda.cup.common.util.JwtUtil;
import com.nimda.cup.user.entity.User;
import com.nimda.cup.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.apache.coyote.Response;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationRepositroy notificationRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;
    private final JwtUtil jwtUtil;

    // 도착한 알림 최신순으로 조회
    @GetMapping
    public ResponseEntity<List<NotificationResponse>> getNotifications(@RequestHeader("Authorization") String authHeader) {
        User user = getUserFromToken(authHeader);
        List<Notification> notifications = notificationRepository.findAllByRecipientOrderByCreatedAtDesc(user);
        List<NotificationResponse> dto = notifications.stream().map(NotificationResponse::from).toList();
        return ResponseEntity.ok(dto);
    }

    // 읽지 않은 알림만 조회
    @GetMapping("/unRead")
    public ResponseEntity<List<NotificationResponse>> getUnReadNotifications(
            @RequestHeader("Authorization") String authHeader
    ) {
        User user = getUserFromToken(authHeader);
        List<Notification> notifications = notificationRepository.findAllByRecipientAndIsReadFalse(user);
        List<NotificationResponse> dto = notifications.stream().map(NotificationResponse::from).toList();
        return ResponseEntity.ok(dto);
    }

    // 알림 읽기 처리
    @PatchMapping("/{notificationId}/read")
    public ResponseEntity<Void> markAsRead(@PathVariable Long notificationId) {
        notificationService.markAsRead(notificationId);
        return ResponseEntity.ok().build();
    }

    // 읽지 않은 알람 모두 읽기 처리
    @PatchMapping("/readAll")
    public ResponseEntity<Void> markAllAsRead(@RequestHeader("Authorization") String authHeader) {
        User user = getUserFromToken(authHeader);
        List<Notification> unreadNotifications = notificationRepository.findAllByRecipientAndIsReadFalse(user);

        unreadNotifications.forEach(n -> n.setIsRead(true));
        notificationRepository.saveAll(unreadNotifications);

        return ResponseEntity.ok().build();
    }

    // 읽지 않은 알림 개수와 여부 확인
    @GetMapping("/hasUnread")
    public ResponseEntity<NotificationResponse> hasUnread(@RequestHeader("Authorization") String authHeader)
    {
        User user = getUserFromToken(authHeader);
        Boolean hasUnread = notificationService.hasUnRead(user.getId());
        Long unReadCount = notificationService.unReadCount(user.getId());
        NotificationResponse dto = NotificationResponse.builder().hasUnRead(hasUnread).unReadCount(unReadCount).build();
        return ResponseEntity.ok(dto);
    }

    // 알림 삭제
    @DeleteMapping("/{notificationId}")
    public ResponseEntity<Void> deleteNotification(@PathVariable Long notificationId) {
        // 본인 확인 로직 포함 권장
        notificationService.deleteNotification(notificationId);
        return ResponseEntity.noContent().build();
    }

    // JWT에서 유저 정보를 가져오는 공통 메서드
    private User getUserFromToken(String authHeader) {
        String token = authHeader.substring(7);
        Long userId = jwtUtil.extractUserId(token);
        return userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));
    }
}