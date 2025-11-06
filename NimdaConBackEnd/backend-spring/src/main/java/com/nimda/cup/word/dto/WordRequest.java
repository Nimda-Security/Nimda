package com.nimda.cup.word.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WordRequest {

    private String userId; // OAuth 미구현 고려 nullable 허용

    @NotBlank(message = "단어는 필수 입력 항목입니다.")
    private String word;
    @NotBlank(message = "번역은 필수 입력 항목입니다.")
    private String translation;

    private String pronunciation;
    private String example;

}
