package com.nimda.cite.board.dto;

import com.nimda.cite.board.entity.Category;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

/**
 * 카테고리 응답 DTO
 * - 카테고리 정보를 클라이언트에 전달할 때 사용
 * - Entity와 분리하여 필요한 필드만 노출
 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CategoryResponseDTO {

    private Long id;
    private Long parentId;
    private String name;
    private String slug;
    private Boolean isActive;
    private Integer sortOrder;
    private Integer postCount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    /**
     * 정적 팩토리 메서드: Category Entity를 CategoryResponseDTO로 변환
     * 
     * @param category 변환할 Category 엔티티
     * @return CategoryResponseDTO
     */
    public static CategoryResponseDTO from(Category category) {

        if (category == null) {
            return null;
        }

        return CategoryResponseDTO.builder()
                .id(category.getId())
                .parentId(category.getParentId())
                .name(category.getName())
                .slug(category.getSlug())
                .isActive(category.getIsActive())
                .sortOrder(category.getSortOrder())
                .postCount(category.getPostCount())
                .createdAt(category.getCreatedAt())
                .updatedAt(category.getUpdatedAt())
                .build();
    }
}
