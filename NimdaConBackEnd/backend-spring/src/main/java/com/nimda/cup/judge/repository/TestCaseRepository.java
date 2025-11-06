package com.nimda.cup.judge.repository;

import com.nimda.cup.judge.entity.Problem;
import com.nimda.cup.judge.entity.TestCase;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TestCaseRepository extends JpaRepository<TestCase, Long> {
    
    /**
     * 특정 문제의 모든 테스트케이스 조회
     */
    List<TestCase> findByProblemOrderById(Problem problem);
    
    /**
     * 문제 ID로 테스트케이스 조회
     */
    @Query("SELECT tc FROM TestCase tc WHERE tc.problem.id = :problemId ORDER BY tc.id")
    List<TestCase> findByProblemId(@Param("problemId") Long problemId);
    
    /**
     * 특정 문제의 테스트케이스 개수 조회
     */
    long countByProblem(Problem problem);
}
