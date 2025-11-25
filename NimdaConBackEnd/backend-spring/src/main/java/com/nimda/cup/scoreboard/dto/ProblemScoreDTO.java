package com.nimda.cup.scoreboard.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * 문제별 점수 정보 DTO
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProblemScoreDTO {
    
    private Long problemId;
    private String problemTitle;
    private Integer score;              // 획득한 점수 (ACCEPTED면 문제 점수, 아니면 0)
    private String status;              // "ACCEPTED", "WRONG_ANSWER", "NOT_SUBMITTED", "JUDGING"
    private Integer attemptCount;       // 시도 횟수 (정답: ACCEPTED까지의 총 제출, 오답: 틀린 제출 횟수)
    private LocalDateTime firstAcceptedAt;  // 최초 ACCEPTED 시간 (null 가능)
    private Long timeFromStart;         // 시작 시간으로부터의 경과 시간 (초 단위, null 가능)
    
    // 정답인 경우
    public ProblemScoreDTO(Long problemId, String problemTitle, Integer score, 
                          Integer attemptCount, LocalDateTime firstAcceptedAt, Long timeFromStart) {
        this.problemId = problemId;
        this.problemTitle = problemTitle;
        this.score = score;
        this.status = "ACCEPTED";
        this.attemptCount = attemptCount;
        this.firstAcceptedAt = firstAcceptedAt;
        this.timeFromStart = timeFromStart;
    }
    
    // 오답인 경우
    public ProblemScoreDTO(Long problemId, String problemTitle, Integer wrongAttemptCount) {
        this.problemId = problemId;
        this.problemTitle = problemTitle;
        this.score = 0;
        this.status = "WRONG_ANSWER";
        this.attemptCount = wrongAttemptCount;
        this.firstAcceptedAt = null;
        this.timeFromStart = null;
    }
    
    // 미제출인 경우
    public static ProblemScoreDTO notSubmitted(Long problemId, String problemTitle) {
        ProblemScoreDTO dto = new ProblemScoreDTO();
        dto.problemId = problemId;
        dto.problemTitle = problemTitle;
        dto.score = 0;
        dto.status = "NOT_SUBMITTED";
        dto.attemptCount = 0;
        dto.firstAcceptedAt = null;
        dto.timeFromStart = null;
        return dto;
    }
    
    // 채점 중인 경우
    public static ProblemScoreDTO judging(Long problemId, String problemTitle) {
        ProblemScoreDTO dto = new ProblemScoreDTO();
        dto.problemId = problemId;
        dto.problemTitle = problemTitle;
        dto.score = 0;
        dto.status = "JUDGING";
        dto.attemptCount = 0;
        dto.firstAcceptedAt = null;
        dto.timeFromStart = null;
        return dto;
    }
}

