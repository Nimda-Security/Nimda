package com.nimda.cup.contest.repository;


import com.nimda.cup.contest.entity.Contest;
import com.nimda.cup.contest.entity.ContestProblem;
import com.nimda.cup.judge.entity.Problem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ContestProblemRepository extends JpaRepository<ContestProblem, Long> {

    /**
     * 대회별 문제 조회
     * - 특정 대회에 포함된 모든 문제 조회
     */
    List<ContestProblem> findByContest(Contest contest);

    /**
     * 문제별 대회 조회
     * - 특정 문제가 포함된 모든 대회 조회
     */
    List<ContestProblem> findByProblem(Problem problem);

    /**
     * 대회와 문제로 매핑 조회
     * - 특정 대회의 특정 문제 매핑 조회
     * - 중복 체크용
     */
    Optional<ContestProblem> findByContestAndProblem(Contest contest, Problem problem);

    /**
     * 대회에 문제가 포함되어 있는지 확인
     * - 특정 대회에 특정 문제가 포함되어 있는지 확인
     */
    boolean existsByContestAndProblem(Contest contest, Problem problem);

    /**
     * 대회의 문제 삭제
     * - 특정 대회에서 특정 문제 제거
     */
    void deleteByContestAndProblem(Contest contest, Problem problem);
}

