package com.nimda.cite.board.repository;

import com.nimda.cite.board.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * 카테고리 Repository
 * 
 * [설계 이유]
 * - 활성화된 카테고리만 조회 (isActive = true)
 * - 부모 카테고리로 자식 조회 (계층 구조)
 * - Slug로 조회 (URL 라우팅용)
 */
@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {

    /**
     * 활성화된 모든 카테고리 조회 (정렬 순서대로)
     * SELECT * FROM catgeory WHERE is_active = true ORDER BY sort_order ASC
     */
    List<Category> findByIsActiveTrueOrderBySortOrderAsc();

    /**
     * 부모 카테고리로 자식 카테고리 조회
     * parentId가 null이면 최상위 카테고리 조회
     */
    List<Category> findByParentIdAndIsActiveTrueOrderBySortOrderAsc(Long parentId);

    /**
     * 최상위 카테고리 조회 (parentId가 null)
     */
    List<Category> findByParentIdIsNullAndIsActiveTrueOrderBySortOrderAsc();

    /**
     * Slug로 카테고리 조회 (활성화된 것만)
     */
    Optional<Category> findBySlugAndIsActiveTrue(String slug);

    /**
     * Slug 존재 여부 확인
     */
    boolean existsBySlug(String slug);
}
