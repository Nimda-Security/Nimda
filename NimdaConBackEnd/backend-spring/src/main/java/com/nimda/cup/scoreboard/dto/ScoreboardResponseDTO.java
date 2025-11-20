package com.nimda.cup.scoreboard.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * 스코어보드 전체 응답 DTO
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ScoreboardResponseDTO {
    
    private Boolean success;
    private String message;
    private List<ScoreboardEntryDTO> scoreboard;  // 사용자별 스코어보드 항목
    private List<ProblemInfoDTO> problems;         // 문제 목록 정보
    
    /**
     * 문제 정보 DTO (문제 목록용)
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ProblemInfoDTO {
        private Long problemId;
        private String problemTitle;
        private Integer points;  // 문제 점수
    }
}

