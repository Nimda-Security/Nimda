package com.nimda.cup.user.repository;

import com.nimda.cup.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

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
    Optional<User> findByUserId(Long userId);

    /**
     * 이메일로 사용자 찾기
     */
    Optional<User> findByEmail(String email);

    /**
     * 닉네임이 존재하는지 확인
     */
    boolean existsByNickname(String nickname);

    /**
     * user_id가 존재하는지 확인
     */
    boolean existsByUserId(Long userId);

    /**
     * 이메일이 존재하는지 확인
     */
    boolean existsByEmail(String email);

}
