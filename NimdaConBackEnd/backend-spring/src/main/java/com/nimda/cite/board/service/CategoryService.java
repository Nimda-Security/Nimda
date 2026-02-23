package com.nimda.cite.board.service;

import com.nimda.cite.board.dto.CategoryCreateDTO;
import com.nimda.cite.board.dto.CategoryUpdateDTO;
import com.nimda.cite.board.entity.Category;
import com.nimda.cite.board.repository.BoardRepository;
import com.nimda.cite.board.repository.CategoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

/**
 * 카테고리 서비스
 * - 카테고리 CRUD 작업
 * - 비즈니스 로직 처리 (검증, 순환 참조 체크 등)
 */
@Service
public class CategoryService {

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private BoardRepository boardRepository;

    /**
     * 활성화된 모든 카테고리 조회
     * - 정렬 순서대로 반환
     */
    @Transactional(readOnly = true)
    public List<Category> getAllActiveCategories() {
        return categoryRepository.findByIsActiveTrueOrderBySortOrderAsc();
    }

    /**
     * Slug로 활성화된 카테고리 조회
     * 
     * @param slug 카테고리 slug
     * @return Category (활성화된 카테고리)
     * @throws RuntimeException 카테고리를 찾을 수 없는 경우
     */
    @Transactional(readOnly = true)
    public Category getCategoryBySlug(String slug) {
        return categoryRepository.findBySlugAndIsActiveTrue(slug)
                .orElseThrow(() -> new RuntimeException("카테고리를 찾을 수 없습니다: " + slug));
    }

    /**
     * Note. createCategory 카테고리 생성
     * CategoryCreateDTO
     */
    @Transactional
    public Category createCategory(CategoryCreateDTO createDTO) {

        // 1. Slug 중복 체크
        validateSlugUnique(createDTO.getSlug(), null);

        // 2. 부모 카테고리 검증 (parentId가 있는 경우)
        if (createDTO.getParentId() != null) {
            validateParent(createDTO.getParentId());
            // 생성 시에는 순환 참조 체크 불필요 (아직 존재하지 않는 카테고리)
        }

        // 3. Category 생성
        Category category = Category.builder()
                .name(createDTO.getName())
                .slug(createDTO.getSlug())
                .parentId(createDTO.getParentId())
                .sortOrder(createDTO.getSortOrder() != null ? createDTO.getSortOrder() : 0)
                .isActive(createDTO.getIsActive() != null ? createDTO.getIsActive() : true)
                .postCount(0)
                .build();

        // 4. 저장 및 반환
        return categoryRepository.save(category);
    }

    /**
     * Note. updateCategory 카테고리 수정
     * CategoryUpdateDTO
     */
    @Transactional
    public Category updateCategory(Long id, CategoryUpdateDTO updateDTO) {

        // #1. 업데이트할 카테고리 탐색
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("카테고리를 찾을 수 없습니다: " + id));

        // 2. Slug 중복 체크
        if (updateDTO.getSlug() != null && !updateDTO.getSlug().equals(category.getSlug())) {
            validateSlugUnique(updateDTO.getSlug(), id);
            category.setSlug(updateDTO.getSlug());
        }

        // 3. 부모 카테고리 변경 검증
        if (updateDTO.getParentId() != null) {
            Long newParentId = updateDTO.getParentId();

            // 자기 자신을 부모로 설정하는 것 방지
            if (newParentId.equals(id)) {
                throw new RuntimeException("자기 자신을 부모로 설정할 수 없습니다.");
            }

            // 부모 존재 및 활성화 확인
            validateParent(newParentId);

            // 순환 참조 방지 체크
            if (hasCircularReference(id, newParentId)) {
                throw new RuntimeException("순환 참조가 발생합니다. 해당 카테고리를 부모로 설정할 수 없습니다.");
            }

            category.setParentId(newParentId);
        } else if (updateDTO.getParentId() != null && updateDTO.getParentId() == -1) {
            // -1을 보내면 최상위로 변경 (parentId = null)
            category.setParentId(null);
        }

        // 4. 나머지 필드 업데이트 (null이면 기존 값 유지)
        if (updateDTO.getName() != null) {
            category.setName(updateDTO.getName());
        }
        if (updateDTO.getSortOrder() != null) {
            category.setSortOrder(updateDTO.getSortOrder());
        }
        if (updateDTO.getIsActive() != null) {
            category.setIsActive(updateDTO.getIsActive());
        }

        // 5. 저장 및 반환
        return categoryRepository.save(category);
    }

    /**
     * 카테고리 삭제 (소프트 삭제)
     */
    @Transactional
    public void deleteCategory(Long id) {
        // 1. 카테고리 존재 확인
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("카테고리를 찾을 수 없습니다: " + id));

        // 2. 자식 카테고리 존재 확인
        List<Category> children = categoryRepository.findByParentIdAndIsActiveTrueOrderBySortOrderAsc(id);
        if (!children.isEmpty()) {
            throw new RuntimeException("하위 카테고리가 존재하여 삭제할 수 없습니다. 먼저 하위 카테고리를 삭제하거나 비활성화하세요.");
        }

        // 3. 게시글 존재 확인 (간단 체크: postCount 필드 활용)
        if (category.getPostCount() != null && category.getPostCount() > 0) {
            throw new RuntimeException("해당 카테고리에 게시글이 존재하여 삭제할 수 없습니다. (" + category.getPostCount() + "개)");
        }

        // 4. 소프트 삭제 (isActive = false)
        category.setIsActive(false);
        categoryRepository.save(category);
    }

    /**
     * Validation Method. Slug 중복 체크
     * 
     * @param slug      확인할 slug
     * @param excludeId 제외할 카테고리 ID (수정 시 자기 자신 제외용)
     * @throws RuntimeException 중복된 경우
     */
    private void validateSlugUnique(String slug, Long excludeId) {

        // #1 cateGgoryRepository에서 실제로 존재하는 slug인지 확인
        // TODO: 활성화 여부에 관계없이 slug 존재 여부를 확인한다.
        // 활성화 여부에 관계없이 slug의 존재 여부를 확인한다??
        // 비활성화된 카테고리를 수정할 때 자기 자신의 slug를 사용해도 중복으로 판단
        // existsBySlug가 문제라는소린가
        boolean exists = categoryRepository.existsBySlug(slug);

        if (exists) {
            if (excludeId != null) {
                // 해당 Slug를 가진 활성화된 카테고리를 조회한다.
                Category existing = categoryRepository.findBySlugAndIsActiveTrue(slug).orElse(null);
                if (existing != null && existing.getId().equals(excludeId)) {
                    return;
                }
            }
            throw new RuntimeException("이미 사용 중인 슬러그입니다: " + slug);
        }
    }

    /**
     * 부모 카테고리 검증
     * - 부모 카테고리가 유효한지 (isActive) 체크한다.
     * parentId : 부모 아이디
     * RuntimeException - 부모 카테고리를 찾을 수 없는 경우
     */
    private void validateParent(Long parentId) {

        Category parent = categoryRepository.findById(parentId)
                .orElseThrow(() -> new RuntimeException("부모 카테고리를 찾을 수 없습니다: " + parentId));

        if (!parent.getIsActive()) {
            throw new RuntimeException("비활성화된 카테고리는 부모로 설정할 수 없습니다.");
        }
    }

    /**
     * 순환 참조 체크
     * 
     * @param categoryId        현재 카테고리 ID
     * @param candidateParentId 부모로 설정하려는 카테고리 ID
     * @return 순환 참조가 발생하면 true
     */
    private boolean hasCircularReference(Long categoryId, Long candidateParentId) {
        Set<Long> visited = new HashSet<>();
        Long currentParentId = candidateParentId;

        // 부모로 설정하려는 카테고리의 모든 조상을 확인
        while (currentParentId != null) {
            // 자기 자신이 조상 중에 있으면 순환 참조
            if (currentParentId.equals(categoryId)) {
                return true;
            }

            // 이미 확인한 경로면 중단 (무한 루프 방지)
            if (visited.contains(currentParentId)) {
                break;
            }

            visited.add(currentParentId);

            // 다음 부모 확인
            Category parent = categoryRepository.findById(currentParentId).orElse(null);
            currentParentId = (parent != null) ? parent.getParentId() : null;
        }

        return false;
    }
}
