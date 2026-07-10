package com.nimda.cite.domain.board.repository;

/**
 * ========================================
 * BoardRepository.java
 * ========================================
 * 
 * [기존 게시판 코드 기준]
 * - 기본 구조: JpaRepository<Board, Integer> → JpaRepository<Board, Long>
 * - 검색 메서드: findByTitleContaining 유지
 * - 패키지: com.Board.Board.repository → com.nimda.cite.domain.board.repository
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

import com.nimda.cite.domain.board.entity.Board;
import com.nimda.cite.domain.board.entity.Category;
import com.nimda.cite.domain.board.enums.BoardStatus;
import com.nimda.cite.user.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BoardRepository extends JpaRepository<Board, Long> { // [수정] Integer → Long

    // ========== [전체 게시글 조회 (상태 필터)] ==========
    Page<Board> findByStatus(BoardStatus status, Pageable pageable);

    // ========== [ERD 구조 반영] ==========
    // [변경] BoardType → Category로 변경
    // [사용] GET /api/cite/board?categoryId=1
    // [개선] @EntityGraph로 author, category를 함께 로드하여 N+1 쿼리 문제 해결
    @EntityGraph(attributePaths = { "author", "category" })
    Page<Board> findByCategoryAndStatus(Category category, BoardStatus status, Pageable pageable);

    // ========== [기존 코드 유지] ==========
    // [기존] 제목 검색 메서드
    // [사용] GET /api/cite/board?searchKeyword=검색어
    @EntityGraph(attributePaths = { "author", "category" })
    Page<Board> findByTitleContainingAndStatus(String searchKeyword, BoardStatus status, Pageable pageable);

    // ========== [ERD 구조 반영] ==========
    // [변경] BoardType → Category로 변경
    // [사용] GET /api/cite/board?categoryId=1&searchKeyword=검색어
    @EntityGraph(attributePaths = { "author", "category" })
    Page<Board> findByCategoryAndTitleContainingAndStatus(Category category, String searchKeyword, BoardStatus status, Pageable pageable);

    // ========== [메인 페이지 API] ==========
    // [신규] 고정글 우선 조회 (고정글 먼저, 그 다음 최신순)
    // [사용] GET /api/cite/board?categoryId=1&pinned=true
    @EntityGraph(attributePaths = { "author", "category" })
    @Query("SELECT b FROM Board b WHERE b.category = :category AND b.status = :status ORDER BY b.pinned DESC, b.createdAt DESC")
    Page<Board> findByCategoryAndStatusOrderByPinnedDescCreatedAtDesc(@Param("category") Category category, @Param("status") BoardStatus status, Pageable pageable);

    // ========== [메인 페이지 API] ==========
    // [신규] 인기글 조회 (좋아요 수 > 조회수 > 좋아요+조회수 합계 순으로 정렬)
    // [사용] GET /api/cite/board/popular
    @Query("SELECT DISTINCT b FROM Board b " +
           "LEFT JOIN FETCH b.author " +
           "LEFT JOIN FETCH b.category " +
           "LEFT JOIN BoardLike bl ON bl.board.id = b.id " +
           "WHERE b.status = :status " +
           "GROUP BY b.id, b.author.id, b.category.id " +
           "ORDER BY COUNT(bl.id) DESC, b.postView DESC, (COUNT(bl.id) + b.postView) DESC, b.createdAt DESC")
    Page<Board> findAllByStatusOrderByViewsDescCreatedAtDesc(@Param("status") BoardStatus status, Pageable pageable);
    @Query(value = "SELECT DISTINCT b FROM Board b " +
            "LEFT JOIN FETCH b.author " +
            "LEFT JOIN FETCH b.category " +
            "LEFT JOIN BoardLike bl ON bl.board.id = b.id " +
            "WHERE b.status = :status AND b.category.id NOT IN :excludedCategoryIds " +
            "GROUP BY b.id, b.author.id, b.category.id " +
            "ORDER BY COUNT(bl.id) DESC, b.postView DESC, (COUNT(bl.id) + b.postView) DESC, b.createdAt DESC",
            countQuery = "SELECT COUNT(b) FROM Board b " +
                    "WHERE b.status = :status AND b.category.id NOT IN :excludedCategoryIds")
    Page<Board> findAllVisibleByStatusOrderByViewsDescCreatedAtDesc(
            @Param("status") BoardStatus status,
            @Param("excludedCategoryIds") List<Long> excludedCategoryIds,
            Pageable pageable);

    // ========== [메인 페이지 API] ==========
    // [신규] 카테고리별 인기글 조회 (좋아요 수 > 조회수 > 좋아요+조회수 합계 순으로 정렬)
    // [사용] GET /api/cite/board/popular?categoryId=1
    @Query("SELECT DISTINCT b FROM Board b " +
           "LEFT JOIN FETCH b.author " +
           "LEFT JOIN FETCH b.category " +
           "LEFT JOIN BoardLike bl ON bl.board.id = b.id " +
           "WHERE b.category = :category AND b.status = :status " +
           "GROUP BY b.id, b.author.id, b.category.id " +
           "ORDER BY COUNT(bl.id) DESC, b.postView DESC, (COUNT(bl.id) + b.postView) DESC, b.createdAt DESC")
    Page<Board> findByCategoryAndStatusOrderByViewsDescCreatedAtDesc(@Param("category") Category category, @Param("status") BoardStatus status, Pageable pageable);

    // ========== [하위 카테고리 포함 조회] ==========
    // [신규] 여러 카테고리의 게시글을 한번에 조회 (부모+자식 카테고리 포함)
    // [사용] GET /api/cite/board?slug=xxx&includeChildren=true
    @EntityGraph(attributePaths = { "author", "category" })
    Page<Board> findByCategoryInAndStatus(List<Category> categories, BoardStatus status, Pageable pageable);

    // [신규] 여러 카테고리 + 검색어
    @EntityGraph(attributePaths = { "author", "category" })
    Page<Board> findByCategoryInAndTitleContainingAndStatus(List<Category> categories, String searchKeyword, BoardStatus status, Pageable pageable);

    long countByAuthorAndStatus(User author, BoardStatus status);

    // 내가 작성한 게시글 목록 (최신순, 활성 상태만)
    @EntityGraph(attributePaths = { "author", "category" })
    List<Board> findByAuthorAndStatusOrderByCreatedAtDesc(User author, BoardStatus status);

    // 최신 활성글 조회
    List<Board> findTop10ByStatusOrderByCreatedAtDesc(BoardStatus status);
    Optional<Board> findFirstByFilepathIn(List<String> filepaths);

    @Modifying(clearAutomatically = true)
    @Query("UPDATE Board b SET b.postView = COALESCE(b.postView, 0) + 1 " +
            "WHERE b.id = :id AND b.status = :status")
    int incrementPostView(@Param("id") Long id, @Param("status") BoardStatus status);

    @Modifying(clearAutomatically = true)
    @Query("UPDATE Board b SET b.status = :status " +
            "WHERE b.category.id = :categoryId AND b.tag.id = :tagId AND b.status != :status")
    int updateStatusByTagId(@Param("categoryId") Long categoryId,
                            @Param("tagId") Long tagId,
                            @Param("status") BoardStatus status);

    @Modifying(clearAutomatically = true)
    @Query("UPDATE Board b SET b.status = :newStatus " +
            "WHERE b.category.id = :categoryId AND b.tag.id = :tagId AND b.status = :oldStatus")
    int updateStatusByTagIdAndCurrentStatus(@Param("categoryId") Long categoryId,
                                            @Param("tagId") Long tagId,
                                            @Param("oldStatus") BoardStatus oldStatus,
                                            @Param("newStatus") BoardStatus newStatus);

    @Query("SELECT COUNT(b) FROM Board b WHERE b.category.id = :categoryId AND b.tag.id = :tagId AND b.status = :status")
    long countByCategoryIdAndTagIdAndStatus(@Param("categoryId") Long categoryId,
                                            @Param("tagId") Long tagId,
                                            @Param("status") BoardStatus status);
}
