package com.nimda.cite.board.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.nimda.cite.attachment.dto.AttachmentResponseDto;
import com.nimda.cite.board.entity.Board;
import com.nimda.cup.user.entity.User;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;

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
    private Long commentCount;
    private Boolean pinned;
    private String tag; // 게시글 태그 (예: "필독", "공지", "가입인사")
    private String filename;
    private String filepath;

    /** 상세 조회 시에만 채움 — 게시글에 연결된 첨부(S3+Attachment) */
    private List<AttachmentResponseDto> attachments;

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
        return from(board, likeCount, null);
    }

    /**
     * @param attachments 상세 응답용. 목록 API에서는 null 전달(필드 생략).
     */
    public static BoardResponseDTO from(Board board, long likeCount, List<AttachmentResponseDto> attachments) {
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
                .commentCount(0L)
                .pinned(board.getPinned())
                .tag(board.getTag()) // 태그 필드 추가
                .filename(board.getFilename())
                .filepath(board.getFilepath())
                .attachments(attachments)
                .createdAt(board.getCreatedAt())
                .updatedAt(board.getUpdatedAt())
                .build();
    }

    public static BoardResponseDTO from(Board board, long likeCount, long commentCount) {
        BoardResponseDTO dto = from(board, likeCount);
        if (dto != null) dto.setCommentCount(commentCount);
        return dto;
    }
}
