package com.nimda.cup.contest.dto;

import com.nimda.cup.contest.enums.ContestRole;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

/**
 * 대회 응답 DTO
 * - 대회 정보를 클라이언트에 전달할 때 사용
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ContestResponseDTO {

    private Long contestId;
    private String title;
    private String description;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private ContestRole status;
    private Long createdBy; // 생성자 ID
    private String createdByName; // 생성자 이름
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

