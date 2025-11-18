package com.nimda.cup.contest.entity;

/**
 * [관계]
 * - Contest (N:1): contest_id → Contest.contest_id
 * - Problem (N:1): problem_id → Problem.id
 * ========================================
 */

import com.nimda.cup.judge.entity.Problem;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "contest_problem", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"contest_id", "problem_id"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ContestProblem {

    // [기본 필드]
    /**
     * 대회-문제 매핑 고유 ID (PK)
     * - 데이터베이스 컬럼명: contest_problem_id
     * - AUTO_INCREMENT
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "contest_problem_id")
    private Long id;

    // [관계 필드]
    /**
     * 대회 (N:1 관계)
     * - 데이터베이스 컬럼명: contest_id
     * - FK → Contest.contest_id
     * - 하나의 Contest에 여러 ContestProblem 연결 가능
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "contest_id", nullable = false)
    private Contest contest;

    /**
     * 문제 (N:1 관계)
     * - 데이터베이스 컬럼명: problem_id
     * - FK → Problem.id (judge 패키지의 Problem 엔티티)
     * - 하나의 Problem이 여러 Contest에 사용될 수 있음
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "problem_id", nullable = false)
    private Problem problem;

    // [대회별 문제 정보]
    /**
     * 대회 내 문제 점수 (선택 사항)
     * - 데이터베이스 컬럼명: score
     * - 대회별로 문제 점수 다르게 설정 가능
     * - null 허용 (대회별 점수 설정 안 할 경우)
     * 
     * - 대회별로 문제 점수 다르게 설정 시 사용
     * - null이면 Problem의 기본 점수 사용
     */
    @Column(name = "score")
    private Integer score;

    // 대회 내 문제 별칭
    @Column(name = "problem_alias", length = 50)
    private String problemAlias;

    // 생성용 생성자
    public ContestProblem(Contest contest, Problem problem, Integer score, String problemAlias) {
        this.contest = contest;
        this.problem = problem;
        this.score = score;
        this.problemAlias = problemAlias;
    }

    // [비즈니스 로직 메서드] 
    /**
     * 대회 내 문제 점수 반환
     */
    public Integer getContestProblemScore() {
        return score != null ? score : problem.getPoints();
    }

    /**
     * 대회 내 문제 별칭 반환
     * - problemAlias가 null이면 Problem의 기본 제목 반환
     */
    public String getContestProblemTitle() {
        return problemAlias != null ? problemAlias : problem.getTitle();
    }
}

