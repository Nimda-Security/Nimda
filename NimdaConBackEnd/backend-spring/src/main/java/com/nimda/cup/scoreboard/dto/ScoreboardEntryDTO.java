package com.nimda.cup.scoreboard.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * 스코어보드 개별 사용자 항목 DTO
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ScoreboardEntryDTO {
    
    private Integer rank;                    // 순위
    private Long userId;                     // 사용자 ID
    private String nickname;                 // 닉네임
    private Integer totalScore;              // 총점
    private Integer solvedCount;             // 정답 수
    private Long totalTime;                  // 총 시간 (초 단위) - 주석 처리됨 (나중을 위해)
    private Long totalTimeMinutes;           // 총 시간 (분 단위) - 주석 처리됨 (나중을 위해)
    private Integer totalAttemptCount;       // 총 제출 횟수 (모든 문제의 제출 횟수 합산)
    private List<ProblemScoreDTO> problemScores;  // 문제별 점수 정보
    
    public ScoreboardEntryDTO(Long userId, String nickname, Integer totalScore, 
                            Integer solvedCount, Long totalTime, List<ProblemScoreDTO> problemScores) {
        this.userId = userId;
        this.nickname = nickname;
        this.totalScore = totalScore;
        this.solvedCount = solvedCount;
        // 시간 관련 필드는 나중을 위해 보관하지만 계산하지 않음
        this.totalTime = totalTime;
        // totalTimeMinutes 계산은 주석 처리됨 (나중을 위해 보관)
        // this.totalTimeMinutes = totalTime != null ? totalTime / 60 : 0L;
        this.totalTimeMinutes = 0L; // 나중을 위해 0으로 설정
        // 총 제출 횟수 계산: 모든 문제의 제출 횟수 합산
        this.totalAttemptCount = problemScores.stream()
                .mapToInt(ps -> ps.getAttemptCount() != null ? ps.getAttemptCount() : 0)
                .sum();
        this.problemScores = problemScores;
    }
}

