package com.nimda.cup.word.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;


// -- WordCountResponse: 단어 개수 조회 응답용 DTO -- //
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class WordCountResponse {
    private int count;
}

