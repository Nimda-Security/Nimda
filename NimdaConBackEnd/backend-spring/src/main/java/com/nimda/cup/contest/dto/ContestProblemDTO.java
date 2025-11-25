package com.nimda.cup.contest.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * 대회 문제 DTO
 * - 대회에 포함된 문제 정보
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ContestProblemDTO {

    private Long contestProblemId;
    private Long problemId;
    private String problemTitle; // Problem의 기본 제목
    private String problemAlias; // 대회 내 문제 별칭 (예: "A번", "1번")
    private Integer score; // 대회 내 문제 점수
}

