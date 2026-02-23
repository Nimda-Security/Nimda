package com.nimda.cite.board.dto;

import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 카테고리 수정 요청 DTO
 * - 카테고리 수정 시 클라이언트에서 전달하는 데이터
 * - 모든 필드는 선택적 (null이면 기존 값 유지)
 * - null이 아닌 경우에만 validation 적용
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CategoryUpdateDTO {

    /**
     * 카테고리 이름
     * - 선택적 (null이면 기존 값 유지)
     * - null이 아닌 경우 최대 50자
     */
    @Size(max = 50, message = "카테고리 이름은 50자를 초과할 수 없습니다")
    private String name;

    /**
     * SEO용 URL 슬러그
     * - 선택적 (null이면 기존 값 유지)
     * - null이 아닌 경우 최대 50자
     * - 고유해야 함 (Service에서 검증)
     */
    @Size(max = 50, message = "슬러그는 50자를 초과할 수 없습니다")
    private String slug;

    /**
     * 부모 카테고리 ID
     * - 선택적 (null이면 기존 값 유지)
     * - -1을 보내면 최상위로 변경 (Service에서 처리)
     */
    private Long parentId;

    /**
     * 정렬 순서
     * - 선택적 (null이면 기존 값 유지)
     */
    private Integer sortOrder;

    /**
     * 활성화 여부
     * - 선택적 (null이면 기존 값 유지)
     */
    private Boolean isActive;
}
