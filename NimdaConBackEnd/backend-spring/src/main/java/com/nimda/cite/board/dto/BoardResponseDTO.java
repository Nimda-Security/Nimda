package com.nimda.cite.board.dto;

import com.nimda.cite.board.entity.Board;
import com.nimda.cup.user.entity.User;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

/**
 * 게시글 응답 DTO
 * - 게시글 정보를 클라이언트에 전달할 때 사용
 * - Entity와 분리하여 필요한 필드만 노출
 * - 좋아요 개수 포함
 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BoardResponseDTO {

    private Long id;
    private String title;
    private String content;
    private CategoryResponseDTO category;
    private AuthorInfo author;
    private Integer views;
    private Long likeCount;
    private Boolean pinned;
    private String filename;
    private String filepath;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    /**
     * 작성자 정보 (간소화된 정보만 노출)
     */
    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AuthorInfo {
        private Long id;
        private String userId;
        private String nickname;
        private String email;
    }

    /**
     * 정적 팩토리 메서드: Board Entity를 BoardResponseDTO로 변환
     * 
     * @param board     변환할 Board 엔티티
     * @param likeCount 좋아요 개수
     * @return BoardResponseDTO
     */
    public static BoardResponseDTO from(Board board, long likeCount) {
        if (board == null) {
            return null;
        }

        User author = board.getAuthor();
        AuthorInfo authorInfo = null;
        if (author != null) {
            authorInfo = AuthorInfo.builder()
                    .id(author.getId())
                    .userId(author.getUserId())
                    .nickname(author.getNickname())
                    .email(author.getEmail())
                    .build();
        }

        return BoardResponseDTO.builder()
                .id(board.getId())
                .title(board.getTitle())
                .content(board.getContent())
                .category(CategoryResponseDTO.from(board.getCategory()))
                .author(authorInfo)
                .views(board.getPostView())
                .likeCount(likeCount)
                .pinned(board.getPinned())
                .filename(board.getFilename())
                .filepath(board.getFilepath())
                .createdAt(board.getCreatedAt())
                .updatedAt(board.getUpdatedAt())
                .build();
    }
}
