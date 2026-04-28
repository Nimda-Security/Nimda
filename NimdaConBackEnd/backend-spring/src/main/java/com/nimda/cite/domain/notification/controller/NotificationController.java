package com.nimda.cite.notification.controller;

import com.nimda.cite.common.response.ApiResponse;
import com.nimda.cite.common.s3.S3Service;
import com.nimda.cite.notification.dto.NotificationResponse;
import com.nimda.cite.notification.entity.Notification;
import com.nimda.cite.notification.repositroy.NotificationRepositroy;
import com.nimda.cite.notification.service.NotificationService;
import com.nimda.cite.user.entity.User;
import com.nimda.cite.user.security.CustomUserDetails;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationRepositroy notificationRepository;
    private final NotificationService notificationService;

    @Autowired(required = false)
    private S3Service s3Service;

    // 도착한 알림 최신순으로 조회
    @GetMapping
    public ResponseEntity<?> getNotifications(@AuthenticationPrincipal CustomUserDetails userDetails) {
        User user = userDetails.getUser();
        List<Notification> notifications = notificationRepository.findAllByRecipient(user);
        List<NotificationResponse> dto = notifications.stream().map(n -> toResponse(n)).toList();
        return ApiResponse.ok(dto).toResponse();
    }

    // 읽지 않은 알림만 조회
    @GetMapping("/unRead")
    public ResponseEntity<?> getUnReadNotifications(
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        User user = userDetails.getUser();
        List<Notification> notifications = notificationRepository.findAllByRecipientAndIsReadFalse(user);
        List<NotificationResponse> dto = notifications.stream().map(n -> toResponse(n)).toList();
        return ApiResponse.ok(dto).toResponse();
    }

    private NotificationResponse toResponse(Notification n) {
        NotificationResponse base = NotificationResponse.from(n);
        String profileImage = base.getSenderProfileImage();
        if (s3Service != null && profileImage != null && !profileImage.isBlank() && !profileImage.startsWith("http")) {
            profileImage = s3Service.createPresignedGetUrl(profileImage, 60);
        }
        return NotificationResponse.builder()
                .id(base.getId())
                .senderNickName(base.getSenderNickName())
                .senderProfileImage(profileImage)
                .message(base.getMessage())
                .url(base.getUrl())
                .createdAt(base.getCreatedAt())
                .isRead(base.getIsRead())
                .build();
    }

    // 알림 읽기 처리
    @PatchMapping("/{notificationId}/read")
    public ResponseEntity<?> markAsRead(@PathVariable Long notificationId) {
        notificationService.markAsRead(notificationId);
        return ApiResponse.ok().toResponse();
    }

    // 읽지 않은 알람 모두 읽기 처리
    @PatchMapping("/readAll")
    public ResponseEntity<?> markAllAsRead(@AuthenticationPrincipal CustomUserDetails userDetails) {
        User user = userDetails.getUser();
        List<Notification> unreadNotifications = notificationRepository.findAllByRecipientAndIsReadFalse(user);

        unreadNotifications.forEach(n -> n.setIsRead(true));
        notificationRepository.saveAll(unreadNotifications);

        return ApiResponse.ok().toResponse();
    }

    // 읽지 않은 알림 개수와 여부 확인
    @GetMapping("/hasUnread")
    public ResponseEntity<?> hasUnread(@AuthenticationPrincipal CustomUserDetails userDetails) {
        User user = userDetails.getUser();
        Boolean hasUnread = notificationService.hasUnRead(user.getId());
        Long unReadCount = notificationService.unReadCount(user.getId());
        NotificationResponse dto = NotificationResponse.builder().hasUnRead(hasUnread).unReadCount(unReadCount).build();
        return ApiResponse.ok(dto).toResponse();
    }

    // 알림 삭제
    @DeleteMapping("/{notificationId}")
    public ResponseEntity<?> deleteNotification(@PathVariable Long notificationId) {
        notificationService.deleteNotification(notificationId);
        return ApiResponse.ok("알림이 삭제되었습니다.").toResponse();
    }
}
