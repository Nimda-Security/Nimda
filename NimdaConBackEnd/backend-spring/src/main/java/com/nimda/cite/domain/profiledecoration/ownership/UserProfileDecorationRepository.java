package com.nimda.cite.domain.profiledecoration.ownership;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import com.nimda.cite.domain.profiledecoration.entity.ProfileDecoration;
import java.util.List;

public interface UserProfileDecorationRepository extends JpaRepository<UserProfileDecoration, Long> {
    boolean existsByUserIdAndProfileDecorationId(Long userId, Long profileDecorationId);

    List<UserProfileDecoration> findByUserIdOrderByAcquiredAtDesc(Long userId);

    @Query("""
            select upd.profileDecoration
            from UserProfileDecoration upd
            where upd.user.id = :userId
            order by upd.acquiredAt desc
            """)
    List<ProfileDecoration> findDecorationsByUserId(@Param("userId") Long userId);
}
