package com.nimda.con.judge.repository;

import com.nimda.con.judge.entity.Submission;
import com.nimda.con.judge.enums.JudgeStatus;
import com.nimda.con.judge.enums.Language;
import com.nimda.con.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface SubmissionRepository extends JpaRepository<Submission, Long> {
    
    /**
     * 사용자별 제출 기록 조회 (최신순)
     */
    List<Submission> findByUserOrderBySubmittedAtDesc(User user);
    
    /**
     * 문제별 제출 기록 조회 (최신순)
     */
    List<Submission> findByProblemIdOrderBySubmittedAtDesc(Long problemId);
    
    /**
     * 채점 상태별 제출 조회
     */
    List<Submission> findByStatus(JudgeStatus status);
    
    /**
     * 언어별 제출 조회
     */
    List<Submission> findByLanguage(Language language);
    
    /**
     * 특정 기간 내 제출 조회
     */
    List<Submission> findBySubmittedAtBetween(LocalDateTime start, LocalDateTime end);
    
    /**
     * 최근 제출 기록 조회 (전체)
     */
    List<Submission> findTop20ByOrderBySubmittedAtDesc();
    
    /**
     * 사용자의 특정 문제에 대한 제출 기록
     */
    List<Submission> findByUserAndProblemIdOrderBySubmittedAtDesc(User user, Long problemId);
    
    /**
     * 정답 제출만 조회
     */
    @Query("SELECT s FROM Submission s WHERE s.status = 'ACCEPTED' ORDER BY s.submittedAt DESC")
    List<Submission> findAcceptedSubmissions();
    
    /**
     * 사용자별 정답 수 카운트
     */
    @Query("SELECT COUNT(s) FROM Submission s WHERE s.user = :user AND s.status = 'ACCEPTED'")
    Long countAcceptedSubmissionsByUser(@Param("user") User user);
}
