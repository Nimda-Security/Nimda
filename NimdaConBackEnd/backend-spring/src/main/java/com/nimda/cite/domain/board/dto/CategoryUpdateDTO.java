package com.nimda.cite.domain.board.dto;

import com.nimda.cite.domain.board.entity.Category;
import com.nimda.cite.domain.tag.entity.Tag;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * 카테고리 수정 요청 DTO
 * - 열든 필드는 null이면 기존 값 유지
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
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

    /**
     * 카테고리별 사용 가능한 태그 목록
     * - 선택적 (null이면 기존 값 유지)
     * - 예: ["필독", "공지", "가입인사"]
     */
    private List<Tag> availableTags;

    /**
     * 바로가기 URL (외부 링크)
     * - 선택적 (null이면 기존 값 유지, 빈 문자열 ""이면 URL 제거)
     * - 값이 있으면 클릭 시 해당 URL로 새 탭 이동
     */
    @Size(max = 500, message = "URL은 500자를 초과할 수 없습니다")
    private String redirectUrl;

    /**
     * 마일리지 상점 카테고리 여부
     * - null이면 기존 값 유지
     */
    private Boolean shopEnabled;

    public static CategoryUpdateDTO from (Category category) {
        return CategoryUpdateDTO.builder()
                .name(category.getName())
                .slug(category.getSlug())
                .parentId(category.getParentId())
                .shopEnabled(category.getShopEnabled())
                .sortOrder(category.getSortOrder())
                .build();
    }
}
