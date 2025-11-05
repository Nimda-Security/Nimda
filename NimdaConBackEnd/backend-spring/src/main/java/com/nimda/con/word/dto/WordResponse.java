package com.nimda.con.word.dto;

import com.nimda.con.word.entity.Word;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WordResponse {

    private Long id;
    private String word;
    private String translation;
    private String pronunciation;
    private String example;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // 정적 팩토리 메서드 : Entity to Response DTO
    // 정적 팩토리 메서드 네이밍 규칙
    // from : 하나의 매개변수를 받아 객체를 생성한다.
    public static WordResponse from(Word word) {
        return WordResponse.builder()
                .id(word.getId())
                .word(word.getWord())
                .translation(word.getTranslation())
                .pronunciation(word.getPronunciation())
                .example(word.getExample())
                .createdAt(word.getCreatedAt())
                .updatedAt(word.getUpdatedAt())
                .build();
    }
}
