package com.nimda.cite.point.entity;

import com.nimda.cite.user.entity.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Table(name = "user_balance")
@Entity
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserBalance {
    @Id
    private Long id;

    @MapsId
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, updatable = false)
    private User user;

    @Setter
    @Column(name = "total_amount", nullable = false)
    private Long totalAmount;

    @Setter
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
}