package judgeServer.domain.submission.repository;

import judgeServer.domain.submission.entity.Submission;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SubmissionRepository extends JpaRepository<Submission, Long> {
    Page<Submission> findByUserId(Long userId, Pageable pageable);

    Page<Submission> findByUserIdAndProblemId(Long userId, Long problemId, Pageable pageable);

    // 맞춘 문제 번호 가지고 오기
    @Query("SELECT DISTINCT s.problemId FROM Submission s " +
            "WHERE s.userId = :userId AND s.status = 'ACCEPTED'")
    List<Long> findSolvedProblemIdsByUserId(@Param("userId") Long userId);

    // 틀린 문제 번호 가지고 오기
    @Query("SELECT DISTINCT s.problemId FROM Submission s " +
            "WHERE s.userId = :userId " +
            "AND s.problemId NOT IN (" +
            "    SELECT sub.problemId FROM Submission sub " +
            "    WHERE sub.userId = :userId AND sub.status = 'ACCEPTED'" +
            ")")
    List<Long> findIncorrectProblemIdsByUserId(@Param("userId") Long userId);
}