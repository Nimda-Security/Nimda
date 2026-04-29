package com.nimda.cite.domain.board.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 카테고리 순서 일괄 업데이트 요청 DTO
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CategorySortOrderDTO {
    private Long id;
    private Integer sortOrder;
}
