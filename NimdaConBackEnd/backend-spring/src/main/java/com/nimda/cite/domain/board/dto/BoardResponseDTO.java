package com.nimda.cite.domain.board.dto;

import com.nimda.cite.domain.attachment.dto.AttachmentResponseDto;
import com.nimda.cite.domain.board.entity.Board;
import com.nimda.cite.domain.profiledecoration.ProfileDecoration;
import com.nimda.cite.domain.tag.entity.Tag;
import com.nimda.cite.user.entity.User;
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
    private Boolean isLiked;
    private Long likeCount;
    private Long commentCount;
    private Boolean pinned;
    private TagInfo tag; // 게시글 태그 (Tag 엔티티 관계)
    private String filename;
    private String filepath;
    private Long itemPrice;
    private String itemType;
    private ProfileDecorationInfo profileDecoration;
    private Long thumbnailAttachmentId;

    /** 상세 조회 시에만 채움 — 게시글에 연결된 첨부(S3+Attachment) */
    private List<AttachmentResponseDto> attachments;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    /**
     * 태그 정보 (간소화된 Tag 엔티티)
     */
    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TagInfo {
        private Long id;
        private String tagName;
    }

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
        private String profileImage;
        private String profileDecoration;
    }

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ProfileDecorationInfo {
        private Long id;
        private String key;
        private String label;
        private String src;
    }

    /**
     * 정적 팩토리 메서드: Board Entity를 BoardResponseDTO로 변환
     *
     * @param board     변환할 Board 엔티티
     * @param likeCount 좋아요 개수
     * @return BoardResponseDTO
     */
    public static BoardResponseDTO from(Board board, long likeCount, boolean isLiked, long commentCount) {
        BoardResponseDTO dto = from(board, likeCount, isLiked, commentCount, null);
        if (dto != null) dto.setCommentCount(commentCount);
        return dto;
    }


    /**
     * @param attachments 상세 응답용. 목록 API에서는 null 전달(필드 생략).
     */
    public static BoardResponseDTO from(Board board, long likeCount, boolean isLiked,
                                        long commentCount, List<AttachmentResponseDto> attachments) {
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
                    .profileImage(author.getProfileImage())
                    .profileDecoration(author.getProfileDecoration())
                    .build();
        }

        Tag tag = board.getTag();
        TagInfo tagInfo = tag != null ? TagInfo.builder().id(tag.getId()).tagName(tag.getTagName()).build() : null;
        ProfileDecoration decoration = board.getProfileDecoration();
        ProfileDecorationInfo decorationInfo = decoration != null
                ? ProfileDecorationInfo.builder()
                        .id(decoration.getId())
                        .key(decoration.getKey())
                        .label(decoration.getLabel())
                        .src("/api/cite/profile-decorations/" + decoration.getKey() + "/image")
                        .build()
                : null;

        return BoardResponseDTO.builder()
                .id(board.getId())
                .title(board.getTitle())
                .content(board.getContent())
                .category(CategoryResponseDTO.from(board.getCategory()))
                .author(authorInfo)
                .views(board.getPostView())
                .likeCount(likeCount)
                .isLiked(isLiked)
                .commentCount(commentCount)
                .pinned(board.getPinned())
                .tag(tagInfo)
                .filename(board.getFilename())
                .filepath(board.getFilepath())
                .itemPrice(board.getItemPrice())
                .itemType(board.getItemType() != null ? board.getItemType().name() : null)
                .profileDecoration(decorationInfo)
                .thumbnailAttachmentId(board.getThumbnailAttachmentId())
                .attachments(attachments)
                .createdAt(board.getCreatedAt())
                .updatedAt(board.getUpdatedAt())
                .build();
    }
}
