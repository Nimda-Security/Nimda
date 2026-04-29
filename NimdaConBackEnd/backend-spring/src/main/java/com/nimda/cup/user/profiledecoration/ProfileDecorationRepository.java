package com.nimda.cup.user.profiledecoration;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ProfileDecorationRepository extends JpaRepository<ProfileDecoration, Long> {
    Optional<ProfileDecoration> findByKey(String key);

    boolean existsByKey(String key);

    List<ProfileDecoration> findByActiveTrueOrderByIdAsc();

    List<ProfileDecoration> findAllByOrderByIdAsc();
}
