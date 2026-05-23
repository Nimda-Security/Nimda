package com.nimda.cite.domain.profiledecoration.ownership;

import com.nimda.cite.domain.profiledecoration.ProfileDecoration;
import com.nimda.cite.user.entity.User;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "user_profile_decorations",
        uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "profile_decoration_id"})
)
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class UserProfileDecoration {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "profile_decoration_id", nullable = false)
    private ProfileDecoration profileDecoration;

    private LocalDateTime acquiredAt;

    public UserProfileDecoration(User user, ProfileDecoration profileDecoration) {
        this.user = user;
        this.profileDecoration = profileDecoration;
        this.acquiredAt = LocalDateTime.now();
    }
}
