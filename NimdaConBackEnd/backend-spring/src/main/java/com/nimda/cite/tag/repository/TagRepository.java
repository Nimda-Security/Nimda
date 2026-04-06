package com.nimda.cite.tag.repository;

import com.nimda.cite.board.entity.Category;
import com.nimda.cite.tag.entity.Tag;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TagRepository extends JpaRepository<Tag,Long> {
    // 1. 모든 태그 조회 (정렬 값 기준)
    List<Tag> findAllByOrderBySortValueAsc();

    // 2. 특정 카테고리 ID로 태그 조회 (정렬 값 기준)
    // 매핑된 객체의 ID 필드(category.id)를 참조하여 조회합니다.
    List<Tag> findAllByCategoryIdOrderBySortValueAsc(Long categoryId);

    // 3. 특정 카테고리 객체로 태그 조회 (정렬 값 기준)
    // 서비스단에서 Category 객체를 이미 가지고 있을 때 유용합니다.
    List<Tag> findAllByCategoryOrderBySortValueAsc(Category category);

}
