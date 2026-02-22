package com.nimda.cite.board.entity;

/**
 * ========================================
 * Board.java (게시판 엔티티)
 * ========================================
 * 
 * [기존 게시판 코드 기준]
 * - 기본 구조: 유지 (title, content, filename, filepath)
 * - ID 타입: Integer → Long으로 변경
 * - 패키지: com.Board.Board.entity → com.nimda.cite.board.entity
 * - 어노테이션: @Data → @Getter, @Setter, @EntityListeners로 변경
 * 
 * [현재 프로젝트 통합 사항]
 * 1. User 엔티티 관계 추가 (작성자 정보) - com.nimda.cup.user.entity.User 사용
 * 2. BoardType enum 추가 (게시판 타입 필터링) - NEWS, ACADEMIC, COMMUNITY, QNA, FREE
 * 3. JPA Auditing 추가 (생성일시, 수정일시 자동 관리)
 * 4. ID 타입: Long으로 통일 (현재 프로젝트 스타일)
 * 5. 파일 업로드 기능: 유지 (filename, filepath)
 * 
 * [주요 변경점]
 * - 기존: @Data 사용
 * - 현재: @Getter, @Setter, @EntityListeners 사용 (JPA Auditing 지원)
 * - 기존: Integer id
 * - 현재: Long id
 * - 기존: 작성자 정보 없음
 * - 현재: User author 관계 추가 (LAZY 로딩)
 * - 기존: 게시판 타입 없음
 * - 현재: BoardType boardType 추가 (필터링용)
 * ========================================
 */

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.nimda.cite.board.entity.Category;
import com.nimda.cup.common.entity.BaseTimeEntity;
import com.nimda.cup.user.entity.User;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "board")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Board extends BaseTimeEntity {

    // ========== [통합 포인트 #1] ==========
    // [기존] @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Integer
    // id;
    // [수정] 현재 프로젝트는 Long 타입 사용 (User 엔티티와 일관성 유지)
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // ========== [기존 코드 유지] ==========
    // [기존] 게시글 제목 - 변경 없음
    @Column(nullable = false, length = 200)
    private String title;

    // ========== [기존 코드 유지] ==========
    // [기존] 게시글 내용 - 변경 없음
    @Column(columnDefinition = "TEXT", nullable = false)
    private String content;

    // ========== [통합 포인트 #2] ==========
    // [기존] 없음
    // [신규] User 작성자 관계 추가 (현재 프로젝트 User 엔티티 사용)
    // [이유] 게시글 작성자 정보 관리, JWT 토큰에서 사용자 정보 추출하여 설정
    @ManyToOne(fetch = FetchType.LAZY) // LAZY 로딩 (현재 프로젝트 스타일)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnoreProperties({ "hibernateLazyInitializer", "handler" }) // LAZY 로딩 프록시 객체 직렬화 문제 해결
    private User author; // 작성자

    // ========== [ERD 구조 반영] ==========
    // [변경] BoardType enum → Category 관계로 변경
    // [이유] ERD 구조에 따른 계층형 카테고리 시스템
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", nullable = false)
    @JsonIgnoreProperties({ "hibernateLazyInitializer", "handler" })
    private Category category;

    // ========== [ERD 구조 반영] ==========
    // [신규] 조회수 필드 추가 (ERD의 post_view)
    // [이유] 메인 페이지 인기글 섹션, 게시글 조회수 기능
    // [참고] 좋아요는 별도 테이블로 관리하므로 Board 엔터티에 포함하지 않음
    // 좋아요를 별도 테아블로 관리하면 게시글 리스트에서 좋아요 수를 참조할 때
    @Column(name = "post_view", nullable = false)
    private Integer postView = 0;

    // ========== [메인 페이지 API 필요] ==========
    // [신규] 고정글 여부 필드 추가
    // [이유] 메인 페이지 공지사항 섹션 (고정글 우선 표시)
    @Column(name = "pinned", nullable = false)
    private Boolean pinned = false;

    // ========== [기존 코드 유지] ==========
    // [기존] 파일명 - 변경 없음 (파일 업로드 기능 유지)
    @Column(length = 255)
    private String filename;

    // ========== [기존 코드 유지] ==========
    // [기존] 파일 경로 - 변경 없음 (파일 업로드 기능 유지)
    @Column(length = 500)
    private String filepath;
}