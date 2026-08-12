package com.nimda.cite.domain.profiledecoration.repository;

import com.nimda.cite.domain.profiledecoration.entity.ProfileDecoration;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ProfileDecorationRepository extends JpaRepository<ProfileDecoration, Long> {
    Optional<ProfileDecoration> findByKey(String key);

    boolean existsByKey(String key);
    boolean existsByFilePathAndIdNot(String filePath, Long id);
    boolean existsByFilePath(String filePath);

    List<ProfileDecoration> findByActiveTrueOrderByIdAsc();

    List<ProfileDecoration> findAllByOrderByIdAsc();
}
