package com.nimda.cite.notification.entity;

import com.nimda.cite.notification.enums.NotificationType;
import com.nimda.cup.user.entity.User;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

import com.nimda.cup.common.entity.BaseTimeEntity; // 생성시간 관리를 위해 권장
import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter // 필드 조회를 위해 필수
@Setter // 필요 시 추가
@Builder
@NoArgsConstructor(access = AccessLevel.PROTECTED) // JPA 기본 생성자 보안
@AllArgsConstructor
public class Notification extends BaseTimeEntity {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY) // 지연 로딩 권장
    @JoinColumn(name = "recipient_id", nullable = false)
    private User recipient; // 알림을 받는 사람

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sender_id") // 시스템 알림일 경우 null일 수 있음
    private User sender; // 알림을 유발한 사람

    @Enumerated(EnumType.STRING) // Enum은 문자열 저장이 안전함
    @Column(nullable = false)
    private NotificationType notificationType;

    @Column(nullable = false)
    private String message;

    @Column(nullable = false)
    private Boolean isRead = false; // 기본값 false

    @Column(name = "created_at", nullable = false) @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "related_entity_id")
    private Long relatedEntityId;

    @Column(name = "related_url", length = 500)
    private String relatedUrl;

}