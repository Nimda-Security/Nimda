package com.nimda.cite.comment.dto;

import com.nimda.cite.comment.entity.Comment;
import com.nimda.cite.comment.enums.STATUS;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
@AllArgsConstructor
public class CommentResponse {

    private Long id;
    private Long parentId;
    private Long boardId;
    private String authorName;
    private String context;
    private Integer replyCount;
    private STATUS status;
    private LocalDateTime createdAt;

    public static CommentResponse from(Comment comment, boolean isAdmin) {
        String context;

        if (isAdmin) {
            context = comment.getContext();
        } else {
            context = switch (comment.getStatus()) {
                case HIDDEN -> "숨긴 댓글입니다.";
                case DELETED -> "삭제된 댓글입니다.";
                default -> comment.getContext();
            };
        }

        return CommentResponse.builder()
                .id(comment.getId())
                .parentId(comment.getParent() != null ? comment.getParent().getId() : null)
                .boardId(comment.getBoard().getId())
                .authorName(comment.getAuthor().getNickname())
                .context(context)
                .replyCount(comment.getReplyCount())
                .status(comment.getStatus())
                .createdAt(comment.getCreatedAt())
                .build();
    }

}
