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
    private String context;
    private Integer replyCount;
    private STATUS status;
    private LocalDateTime createdAt;

    private Long authorId;
    private String authorName;

    private Long parentId;

    public static CommentResponse from(Comment comment) {
        return CommentResponse.builder()
                .id(comment.getId())
                .context(comment.getContext())
                .replyCount(comment.getReplyCount())
                .status(comment.getStatus())
                .createdAt(comment.getCreatedAt())
                .authorId(comment.getAuthor().getId())
                .authorName(comment.getAuthor().getNickname())
                .parentId(comment.getParent() != null ? comment.getParent().getId() : null)
                .build();
    }

}
