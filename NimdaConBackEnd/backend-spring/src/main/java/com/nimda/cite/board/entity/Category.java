package com.nimda.cite.board.entity;

import com.nimda.cup.common.entity.BaseTimeEntity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * 카테고리 엔터티
 * ERD 구조에 따른 계층형 카테고리 시스템
 * 
 * [설계 이유]
 * - BoardType enum 대신 동적 카테고리 관리 가능
 * - 계층 구조 지원 (부모-자식 관계)
 * - 관리자 페이지에서 카테고리 추가/수정/삭제 가능
 * - SEO 친화적 URL (slug)
 */
@Entity
@Table(name = "category")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Category extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * 부모 카테고리 ID (계층 구조)
     * null이면 최상위 카테고리
     */
    @Column(name = "parent_id", nullable = true)
    private Long parentId;

    /**
     * 카테고리 이름
     */
    @Column(nullable = false, length = 50)
    private String name;

    /**
     * 활성화 여부
     */
    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    /**
     * SEO용 URL 슬러그 (예: "news", "academic")
     */
    @Column(nullable = false, length = 50, unique = true)
    private String slug;

    /**
     * 정렬 순서
     */
    @Column(name = "sort_order", nullable = false)
    private Integer sortOrder = 0;

    /**
     * 해당 카테고리 게시글 수 (성능 최적화용)
     */
    @Column(name = "post_count", nullable = false)
    private Integer postCount = 0;
}
