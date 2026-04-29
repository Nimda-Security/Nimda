package com.nimda.cite.domain.profiledecoration.repository;

import com.nimda.cite.domain.profiledecoration.entity.ProfileDecoration;
import com.nimda.cite.domain.profiledecoration.entity.ProfileDecorationRole;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Collection;
import java.util.List;

public interface ProfileDecorationRoleRepository extends JpaRepository<ProfileDecorationRole, Long> {
    List<ProfileDecorationRole> findByDecorationIn(Collection<ProfileDecoration> decorations);

    boolean existsByDecoration(ProfileDecoration decoration);

    boolean existsByDecorationAndAuthorityNameIn(ProfileDecoration decoration, Collection<String> authorityNames);
}
