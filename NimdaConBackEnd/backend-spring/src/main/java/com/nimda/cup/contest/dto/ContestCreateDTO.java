package com.nimda.cup.contest.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

/*
 * 대회 생성 요청 DTO
 * - 대회 생성 시 클라이언트에서 전달하는 데이터
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ContestCreateDTO {

    @NotBlank(message = "대회 제목을 입력해주세요")
    @Size(max = 200, message = "대회 제목은 200자를 초과할 수 없습니다")
    private String title;

    @NotBlank(message = "대회 설명을 입력해주세요")
    private String description;

    @NotNull(message = "대회 시작 시간을 입력해주세요")
    private LocalDateTime startTime;

    @NotNull(message = "대회 종료 시간을 입력해주세요")
    private LocalDateTime endTime;
}

