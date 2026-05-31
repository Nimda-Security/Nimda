package com.nimda.cite.user.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 마일리지 일괄지급 데이터리스트 목록 api
 */
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserSuggestionResponseDTO {
    private String studentNum;
    private String name;
}
