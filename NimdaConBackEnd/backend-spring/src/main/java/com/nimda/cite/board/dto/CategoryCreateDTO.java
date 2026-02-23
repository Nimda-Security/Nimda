package com.nimda.cite.board.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 카테고리 생성 요청 DTO
 * - 카테고리 생성 시 클라이언트에서 전달하는 데이터
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CategoryCreateDTO {

    /**
     * 카테고리 이름
     * - 필수 입력
     * - 최대 50자
     */
    @NotBlank(message = "카테고리 이름을 입력해주세요")
    @Size(max = 50, message = "카테고리 이름은 50자를 초과할 수 없습니다")
    private String name;

    /**
     * SEO용 URL 슬러그
     * - 필수 입력
     * - 최대 50자
     * - 고유해야 함 (Service에서 검증)
     */
    @NotBlank(message = "슬러그를 입력해주세요")
    @Size(max = 50, message = "슬러그는 50자를 초과할 수 없습니다")
    private String slug;

    /**
     * 부모 카테고리 ID
     * - 선택적 (null이면 최상위 카테고리)
     */
    private Long parentId;

    /**
     * 정렬 순서
     * - 선택적 (null이면 0으로 설정)
     */
    private Integer sortOrder;

    /**
     * 활성화 여부
     * - 선택적 (null이면 true로 설정)
     */
    private Boolean isActive;
}
