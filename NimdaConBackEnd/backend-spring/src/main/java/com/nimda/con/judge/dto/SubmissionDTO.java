package com.nimda.con.judge.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class SubmissionDTO {
    
    @NotBlank(message = "문제 제목은 필수입니다")
    private String title;
    
    @NotBlank(message = "소스코드는 필수입니다")
    private String code;
    
    @NotBlank(message = "언어 선택은 필수입니다")
    private String language;
    
    private Long problemId;        // 문제 ID
    private String description;
    private Integer points;
    
    // 기본 생성자 명시적 추가
    public SubmissionDTO() {}
}
