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
import com.nimda.cite.board.enums.BoardType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface BoardRepository extends JpaRepository<Board, Long> {  // [수정] Integer → Long

    // ========== [통합 포인트 #1] ==========
    // [기존] 없음
    // [신규] BoardType으로 게시판 타입별 조회 (현재 프로젝트 핵심 기능)
    // [이유] 게시판 타입별 필터링 (NEWS, ACADEMIC, COMMUNITY, QNA, FREE)
    // [사용] GET /api/cite/board?boardType=NEWS
    Page<Board> findByBoardType(BoardType boardType, Pageable pageable);

    // ========== [기존 코드 유지] ==========
    // [기존] 제목 검색 메서드 - 변경 없음
    // [사용] GET /api/cite/board?searchKeyword=검색어
    Page<Board> findByTitleContaining(String searchKeyword, Pageable pageable);

    // ========== [통합 포인트 #2] ==========
    // [기존] 없음
    // [신규] BoardType + 제목 검색 조합 메서드
    // [이유] 게시판 타입별 검색 기능 지원
    // [사용] GET /api/cite/board?boardType=NEWS&searchKeyword=검색어
    Page<Board> findByBoardTypeAndTitleContaining(BoardType boardType, String searchKeyword, Pageable pageable);
}

