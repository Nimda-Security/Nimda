package com.nimda.cite.comment.dto;

import com.nimda.cite.comment.entity.Comment;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.format.DateTimeFormatter;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MyCommentResponse {
    private Long id;
    private String context;
    private int likeCount;
    private String createdAt;

    private Long boardId;

    public static MyCommentResponse from(Comment comment) {
        return MyCommentResponse.builder()
                .id(comment.getId())
                .context(comment.getContext())
                .likeCount(comment.getLikeCount())
                .createdAt(comment.getCreatedAt().format(DateTimeFormatter.ofPattern("MM.dd")))
                .boardId(comment.getBoard().getId())
                .build();
    }
}
