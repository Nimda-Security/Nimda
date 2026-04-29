package com.nimda.cite.domain.profiledecoration.entity;

import com.nimda.cite.common.entity.BaseTimeEntity;
import com.nimda.cite.user.entity.User;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "user_profile_decorations",
        uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "decoration_id"})
)
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class UserProfileDecoration extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "decoration_id", nullable = false)
    private ProfileDecoration decoration;

    @Column(name = "acquired_at", nullable = false, updatable = false)
    private LocalDateTime acquiredAt;

    public UserProfileDecoration(User user, ProfileDecoration decoration) {
        this.user = user;
        this.decoration = decoration;
    }

    @PrePersist
    void prePersist() {
        if (acquiredAt == null) {
            acquiredAt = LocalDateTime.now();
        }
    }
}
