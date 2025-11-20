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
    private Long totalTime;                  // 총 시간 (초 단위)
    private Long totalTimeMinutes;           // 총 시간 (분 단위)
    private List<ProblemScoreDTO> problemScores;  // 문제별 점수 정보
    
    public ScoreboardEntryDTO(Long userId, String nickname, Integer totalScore, 
                            Integer solvedCount, Long totalTime, List<ProblemScoreDTO> problemScores) {
        this.userId = userId;
        this.nickname = nickname;
        this.totalScore = totalScore;
        this.solvedCount = solvedCount;
        this.totalTime = totalTime;
        this.totalTimeMinutes = totalTime != null ? totalTime / 60 : 0L;
        this.problemScores = problemScores;
    }
}

