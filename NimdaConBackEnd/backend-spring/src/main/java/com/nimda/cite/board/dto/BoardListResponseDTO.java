package com.nimda.cite.board.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

/**
 * 게시글 목록 응답 DTO
 * - 게시글 목록 조회 API 응답용
 * - 페이지네이션 정보 포함
 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BoardListResponseDTO {

    private List<BoardResponseDTO> posts;
    private Long totalElements;
    private Integer totalPages;
    private Integer currentPage;
    private CategoryResponseDTO category;
}
