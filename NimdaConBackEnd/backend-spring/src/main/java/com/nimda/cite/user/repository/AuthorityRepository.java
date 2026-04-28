package com.nimda.cup.user.repository;

import com.nimda.cup.user.entity.Authority;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AuthorityRepository extends JpaRepository<Authority, Long> {

    /**
     * 권한 이름으로 권한 찾기
     */
    Optional<Authority> findByAuthorityName(String authorityName);
}
