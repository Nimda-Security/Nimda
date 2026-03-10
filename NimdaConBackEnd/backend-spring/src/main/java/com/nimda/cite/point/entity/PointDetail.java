package com.nimda.cite.point.entity;

import jakarta.persistence.*;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Table(name = "point_details")
@Entity
@Getter
@Builder
public class PointDetail {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_balance_id", nullable = false) // DB의 FK 컬럼명
    private UserBalance userBalance;

    @Column(name = "amount", nullable = false)
    private Long amount;
    @Column(name = "remaining_amount", nullable = false)
    private Long remainingAmount;
    @Column(name = "expired_at", nullable = false)
    private LocalDateTime expiredAt;
    @Column(name = "created_at")
    @Builder.Default
    private LocalDateTime createdAt=LocalDateTime.now();
}
