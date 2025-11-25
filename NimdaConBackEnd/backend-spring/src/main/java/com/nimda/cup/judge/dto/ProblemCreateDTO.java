package com.nimda.cup.judge.dto;

import com.nimda.cup.judge.enums.Difficulty;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ProblemCreateDTO {

    @NotBlank(message = "문제 제목을 입력해주세요")
    @Size(max = 200, message = "문제 제목은 200자를 초과할 수 없습니다")
    private String title;

    @NotBlank(message = "문제 설명을 입력해주세요")
    @Size(max = 10000, message = "문제 설명은 10000자를 초과할 수 없습니다")
    private String description;

    @NotNull(message = "점수를 입력해주세요")
    @Positive(message = "점수는 양수여야 합니다")
    private Integer points;

    @NotNull(message = "시간 제한을 입력해주세요")
    @Positive(message = "시간 제한은 양수여야 합니다")
    private Integer timeLimit;

    @NotNull(message = "메모리 제한을 입력해주세요")
    @Positive(message = "메모리 제한은 양수여야 합니다")
    private Integer memoryLimit;

    @NotNull(message = "난이도를 선택해주세요")
    private Difficulty difficulty;

    // @NotBlank(message = "프로그래밍 언어를 선택해주세요")
    private String language; // Optional로 허용

    private String inputFormat; // 입력 형식 (Optional)

    private String outputFormat; // 출력 형식 (Optional)

    private List<TestCaseDTO> testCases;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TestCaseDTO {
        @NotBlank(message = "테스트 케이스 입력을 입력해주세요")
        private String input;

        @NotBlank(message = "테스트 케이스 출력을 입력해주세요")
        private String output;

        private Boolean isPublic; // 프론트엔드에 공개 여부 (true: 공개, false: 백엔드 전용, null이면 기본값 false)
    }
}
