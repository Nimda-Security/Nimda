package com.nimda.cite.notification.dto;

import com.nimda.cite.notification.entity.Notification;
import com.nimda.cup.user.entity.User;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class NotificationResponse {
    private Long id;
    private Long unReadCount;
    private String senderNickName;
    private String message;
    private String url;
    private Boolean hasUnRead;
    private LocalDateTime createdAt;
    private Boolean isRead;

    public static NotificationResponse from(Notification n) {
        return NotificationResponse.builder().
                id(n.getId())
                .senderNickName(n.getSender().getName())
                .message(n.getMessage())
                .url(n.getRelatedUrl())
                .createdAt(n.getCreatedAt())
                .isRead(n.getIsRead())
                .build();
    }
}
