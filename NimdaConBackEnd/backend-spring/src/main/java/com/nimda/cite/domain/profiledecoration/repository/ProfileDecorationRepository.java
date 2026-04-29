package com.nimda.cite.domain.profiledecoration.repository;

import com.nimda.cite.domain.profiledecoration.entity.ProfileDecoration;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface ProfileDecorationRepository extends JpaRepository<ProfileDecoration, Long> {
    Optional<ProfileDecoration> findByKey(String key);

    boolean existsByKey(String key);

    List<ProfileDecoration> findAllByOrderByIdAsc();

    @Query("""
            select distinct decoration
            from ProfileDecoration decoration
            where decoration.active = true
              and not exists (
                select role.id
                from ProfileDecorationRole role
                where role.decoration = decoration
              )
            order by decoration.id asc
            """)
    List<ProfileDecoration> findPublicActiveDecorations();

    @Query("""
            select distinct decoration
            from ProfileDecoration decoration
            where decoration.active = true
              and (
                not exists (
                  select role.id
                  from ProfileDecorationRole role
                  where role.decoration = decoration
                )
                or exists (
                  select role.id
                  from ProfileDecorationRole role
                  where role.decoration = decoration
                    and role.authorityName in :authorityNames
                )
                or exists (
                  select owned.id
                  from UserProfileDecoration owned
                  where owned.decoration = decoration
                    and owned.user.id = :userId
                )
              )
            order by decoration.id asc
            """)
    List<ProfileDecoration> findAvailableDecorations(
            @Param("userId") Long userId,
            @Param("authorityNames") Collection<String> authorityNames
    );
}
