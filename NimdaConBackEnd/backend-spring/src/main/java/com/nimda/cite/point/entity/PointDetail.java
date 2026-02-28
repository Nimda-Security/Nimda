package com.nimda.cite.point.entity;

import com.nimda.cup.user.entity.User;
import jakarta.persistence.*;

import java.time.LocalDateTime;

@Table(name = "point_details")
@Entity
public class PointDetail {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    private Long amount;
    @Column(name = "remaining_amount")
    private Long remainingAmount;
    @Column(name = "expired_at")
    private LocalDateTime expiredAt;
    @Column(name = "created_at")
    private LocalDateTime createdAt;
}
