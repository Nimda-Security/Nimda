package com.nimda.cite.notification.dto;

import com.nimda.cite.notification.entity.Notification;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class NotificationResponse {
    private Long id;
    private Long unReadCount;
    private String senderNickName;
    private String senderProfileImage;
    private String message;
    private String url;
    private Boolean hasUnRead;
    private LocalDateTime createdAt;
    private Boolean isRead;

    public static NotificationResponse from(Notification n) {
        return NotificationResponse.builder()
                .id(n.getId())
                // Sender가 null인 경우를 대비한 방어
                .senderNickName(n.getSender() != null ? n.getSender().getNickname() : "시스템")
                .senderProfileImage(n.getSender() != null ? n.getSender().getProfileImage() : null)
                .message(n.getMessage())
                .url(n.getRelatedUrl())
                .createdAt(n.getCreatedAt())
                .isRead(n.getIsRead())
                .build();
    }
}
