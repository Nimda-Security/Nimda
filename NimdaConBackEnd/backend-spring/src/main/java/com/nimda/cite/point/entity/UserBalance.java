package com.nimda.cite.point.entity;

import com.nimda.cup.user.entity.User;
import jakarta.persistence.*;

import java.time.LocalDateTime;

@Table(name = "user_balance")
@Entity
public class UserBalance {
    @Id
    private Long id;

    @MapsId
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @Column(name = "total_amount")
    private Long totalAmount;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
