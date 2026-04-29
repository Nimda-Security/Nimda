package com.nimda.cite.domain.profiledecoration.repository;

import com.nimda.cite.domain.profiledecoration.entity.ProfileDecoration;
import com.nimda.cite.domain.profiledecoration.entity.UserProfileDecoration;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserProfileDecorationRepository extends JpaRepository<UserProfileDecoration, Long> {
    boolean existsByUserIdAndDecoration(Long userId, ProfileDecoration decoration);
}
