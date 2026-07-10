package com.nimda.cite.user.repository;

import com.nimda.cite.user.entity.User;
import com.nimda.cite.user.enums.ApprovalStatus;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    /**
     * 닉네임으로 사용자 찾기 (권한 정보 포함)
     */
    @EntityGraph(attributePaths = { "authorities" })
    Optional<User> findByNickname(String nickname);

    // 학번으로 유저 정보 조회
    Optional<User> findByStudentNum(String studentNum);
    /**
     * user_id로 사용자 찾기
     */
    @EntityGraph(attributePaths = { "authorities" })
    Optional<User> findByUserId(String userId);
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select u from User u where u.userId = :userId")
    Optional<User> findByUserIdForPasswordReset(@Param("userId") String userId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @EntityGraph(attributePaths = { "authorities" })
    @Query("select u from User u where u.id = :userId")
    Optional<User> findByIdForAuthMutation(@Param("userId") Long userId);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("""
            update User u
            set u.authVersion = u.authVersion + 1,
                u.passwordResetTokenId = null
            where u.id = :userId
            """)
    int incrementAuthVersion(@Param("userId") Long userId);

    /**
     * 이메일로 사용자 찾기
     */
    Optional<User> findByEmail(String email);

    /**
     * ID로 사용자 찾기 (권한 정보 포함)
     */
    @EntityGraph(attributePaths = { "authorities" })
    @Override
    Optional<User> findById(@NonNull Long id);

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
    boolean existsByProfileImage(String profileImage);

    /**
     * 여러 user_id 목록으로 사용자 조회
     */
    List<User> findByUserIdIn(Collection<String> userIds);

    /**
     * 승인 상태에 따른 사용자 목록 조회
     * ex) findByStatus(ApprovalStatus.PENDING) - SELECT * FROM users WHERE status =
     * 'PENDING'
     * ex) findByStatus(ApprovalStatus.APPROVED) - SELECT * FROM users WHERE status
     * = 'APPROVED'
     */
    List<User> findByStatus(ApprovalStatus status);
    boolean existsByUserIdAndStudentNumAndEmail(String userId, String studentNum, String email);
}
