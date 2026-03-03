package com.nimda.cite.comment.dto;

import com.nimda.cite.comment.entity.Comment;
import com.nimda.cite.comment.enums.STATUS;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.experimental.SuperBuilder;

@Getter
@SuperBuilder
@AllArgsConstructor
public class CommentUserResponse extends CommentResponse {

    private Boolean editable;
    private Boolean deletable;


    public static CommentUserResponse from(Comment comment, Long currentUserId) {
        boolean isDeleted = comment.getStatus() == STATUS.DELETED;
        boolean isHidden = comment.getStatus() == STATUS.HIDDEN;
        boolean isAuthor = comment.getAuthor().getId().equals(currentUserId);

        String displayContext = isDeleted ? "삭제된 댓글입니다." : (isHidden ? "숨겨진 댓글입니다." : comment.getContext());
        String displayName = isDeleted ? "(삭제됨)" : comment.getAuthor().getNickname();

        return CommentUserResponse.builder()
                .id(comment.getId())
                .parentId(comment.getParent() != null ? comment.getParent().getId() : null)
                .authorName(displayName)
                .authorProfileImage(isDeleted ? null : comment.getAuthor().getProfileImage())
                .context(displayContext)
                .createdAt(formatDateTime(comment.getCreatedAt()))
                .updatedAt(formatDateTime(comment.getUpdatedAt()))
                .likeCount(comment.getLikeCount())
                .isDeleted(isDeleted)
                .editable(!isDeleted && isAuthor)
                .deletable(!isDeleted && isAuthor)
                .build();
    }

}
