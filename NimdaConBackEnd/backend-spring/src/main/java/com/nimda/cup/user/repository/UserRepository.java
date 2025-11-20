package com.nimda.cup.user.repository;

import com.nimda.cup.user.entity.User;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    /**
     * 닉네임으로 사용자 찾기
     */
    Optional<User> findByNickname(String nickname);

    /**
     * user_id로 사용자 찾기
     */
    Optional<User> findByUserId(String userId);

    /**
     * 이메일로 사용자 찾기
     */
    Optional<User> findByEmail(String email);

    /**
     * ID로 사용자 찾기 (권한 정보 포함)
     */
    @EntityGraph(attributePaths = { "authorities" })
    @Override
    Optional<User> findById(Long id);

    /**
     * 닉네임이 존재하는지 확인
     */
    boolean existsByNickname(String nickname);

    /**
     * user_id가 존재하는지 확인
     */
    boolean existsByUserId(String userId);

    /**
     * 이메일이 존재하는지 확인
     */
    boolean existsByEmail(String email);

    /**
     * 여러 user_id 목록으로 사용자 조회
     */
    List<User> findByUserIdIn(Collection<String> userIds);

}
