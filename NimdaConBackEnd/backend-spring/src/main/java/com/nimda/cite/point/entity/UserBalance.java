package com.nimda.cite.point.entity;

import com.nimda.cup.user.entity.User;
import jakarta.persistence.*;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.List;

@Table(name = "user_balance")
@Entity
@Getter
@Builder
public class UserBalance {
    @Id
    private Long id;

    @MapsId
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "total_amount", nullable = false)
    private Long totalAmount;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
}
