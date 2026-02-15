package com.nimda.cite.board.repository;

/**
 * ========================================
 * BoardRepository.java
 * ========================================
 * 
 * [기존 게시판 코드 기준]
 * - 기본 구조: JpaRepository<Board, Integer> → JpaRepository<Board, Long>
 * - 검색 메서드: findByTitleContaining 유지
 * - 패키지: com.Board.Board.repository → com.nimda.cite.board.repository
 * 
 * [현재 프로젝트 통합 사항]
 * 1. BoardType 필터링 메서드 추가 (findByBoardType)
 * 2. BoardType + 검색 조합 메서드 추가 (findByBoardTypeAndTitleContaining)
 * 3. 페이지네이션 지원 (Pageable) - 기존과 동일
 * 4. ID 타입: Long으로 변경
 * 
 * [주요 추가 메서드]
 * - findByBoardType: 게시판 타입별 조회 (NEWS, ACADEMIC, COMMUNITY 등)
 * - findByBoardTypeAndTitleContaining: 타입 + 검색 조합
 * ========================================
 */

import com.nimda.cite.board.entity.Board;
import com.nimda.cite.board.entity.Category;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface BoardRepository extends JpaRepository<Board, Long> { // [수정] Integer → Long

    // ========== [ERD 구조 반영] ==========
    // [변경] BoardType → Category로 변경
    // [사용] GET /api/cite/board?categoryId=1
    // [개선] @EntityGraph로 author, category를 함께 로드하여 N+1 쿼리 문제 해결
    @EntityGraph(attributePaths = { "author", "category" })
    Page<Board> findByCategory(Category category, Pageable pageable);

    // ========== [기존 코드 유지] ==========
    // [기존] 제목 검색 메서드
    // [사용] GET /api/cite/board?searchKeyword=검색어
    @EntityGraph(attributePaths = { "author", "category" })
    Page<Board> findByTitleContaining(String searchKeyword, Pageable pageable);

    // ========== [ERD 구조 반영] ==========
    // [변경] BoardType → Category로 변경
    // [사용] GET /api/cite/board?categoryId=1&searchKeyword=검색어
    @EntityGraph(attributePaths = { "author", "category" })
    Page<Board> findByCategoryAndTitleContaining(Category category, String searchKeyword, Pageable pageable);

    // ========== [메인 페이지 API] ==========
    // [신규] 고정글 우선 조회 (고정글 먼저, 그 다음 최신순)
    // [사용] GET /api/cite/board?categoryId=1&pinned=true
    @EntityGraph(attributePaths = { "author", "category" })
    @Query("SELECT b FROM Board b WHERE b.category = :category ORDER BY b.pinned DESC, b.createdAt DESC")
    Page<Board> findByCategoryOrderByPinnedDescCreatedAtDesc(@Param("category") Category category, Pageable pageable);

    // ========== [메인 페이지 API] ==========
    // [신규] 인기글 조회 (조회수 기준, 최신순)
    // [사용] GET /api/cite/board/popular
    @EntityGraph(attributePaths = { "author", "category" })
    @Query("SELECT b FROM Board b ORDER BY b.postView DESC, b.createdAt DESC")
    Page<Board> findAllOrderByViewsDescCreatedAtDesc(Pageable pageable);

    // ========== [메인 페이지 API] ==========
    // [신규] 카테고리별 인기글 조회
    // [사용] GET /api/cite/board/popular?categoryId=1
    @EntityGraph(attributePaths = { "author", "category" })
    @Query("SELECT b FROM Board b WHERE b.category = :category ORDER BY b.postView DESC, b.createdAt DESC")
    Page<Board> findByCategoryOrderByViewsDescCreatedAtDesc(@Param("category") Category category, Pageable pageable);
}
