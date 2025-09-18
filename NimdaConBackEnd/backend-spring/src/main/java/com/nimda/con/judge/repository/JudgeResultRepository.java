package com.nimda.con.judge.repository;

import com.nimda.con.judge.entity.JudgeResult;
import com.nimda.con.judge.entity.Submission;
import com.nimda.con.judge.enums.JudgeStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface JudgeResultRepository extends JpaRepository<JudgeResult, Long> {
    
    /**
     * 제출에 대한 채점 결과 조회
     */
    Optional<JudgeResult> findBySubmission(Submission submission);
    
    /**
     * 제출 ID로 채점 결과 조회
     */
    Optional<JudgeResult> findBySubmissionId(Long submissionId);
    
    /**
     * 상태별 채점 결과 조회
     */
    List<JudgeResult> findByStatus(JudgeStatus status);
    
    /**
     * 특정 점수 이상의 결과 조회
     */
    List<JudgeResult> findByScoreGreaterThanEqual(Integer minScore);
    
    /**
     * 실행 시간 기준으로 정렬된 결과 조회
     */
    List<JudgeResult> findByStatusOrderByExecutionTimeAsc(JudgeStatus status);
    
    /**
     * 평균 실행 시간 계산
     */
    @Query("SELECT AVG(jr.executionTime) FROM JudgeResult jr WHERE jr.status = 'ACCEPTED'")
    Double getAverageExecutionTime();
    
    /**
     * 정답률 계산
     */
    @Query("SELECT COUNT(jr) * 100.0 / (SELECT COUNT(s) FROM Submission s) FROM JudgeResult jr WHERE jr.status = 'ACCEPTED'")
    Double getAcceptanceRate();
    
    /**
     * 특정 문제의 정답률 계산
     */
    @Query("SELECT COUNT(jr) * 100.0 / COUNT(s) FROM JudgeResult jr " +
           "RIGHT JOIN jr.submission s WHERE s.problem.id = :problemId AND jr.status = 'ACCEPTED'")
    Double getAcceptanceRateByProblem(@Param("problemId") Long problemId);
}
