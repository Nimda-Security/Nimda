package com.nimda.cite.comment.dto;

import com.nimda.cite.comment.entity.Comment;
import com.nimda.cite.comment.enums.STATUS;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.experimental.SuperBuilder;

@Getter
@SuperBuilder
@AllArgsConstructor
public class CommentAdminResponse extends CommentResponse<CommentAdminResponse> {

    private Long authorId;
    private STATUS status;
    private Boolean hideable;

    public static CommentAdminResponse from(Comment comment) {
        boolean isDeleted = comment.getStatus() == STATUS.DELETED;

        return CommentAdminResponse.builder()
                .id(comment.getId())
                .parentId(comment.getParent() != null ? comment.getParent().getId() : null)
                .authorId(comment.getAuthor().getId())
                .authorName(comment.getAuthor().getNickname())
                .authorProfileImage(comment.getAuthor().getProfileImage())
                .context(comment.getContext()) // 관리자는 삭제/숨김 상관없이 원문 확인
                .createdAt(formatDateTime(comment.getCreatedAt()))
                .updatedAt(formatDateTime(comment.getUpdatedAt()))
                .likeCount(comment.getLikeCount())
                .status(comment.getStatus())
                .isDeleted(isDeleted)
                .hideable(!isDeleted)
                .build();
    }

}
