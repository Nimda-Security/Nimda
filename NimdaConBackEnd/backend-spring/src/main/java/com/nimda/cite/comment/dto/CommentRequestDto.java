package com.nimda.cite.comment.dto;

import com.nimda.cite.comment.entity.Comment;
import com.nimda.cite.comment.enums.STATUS;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class CommentRequestDto {

    private String userName;
    private String context;
    private Long parentId; // 대댓글일 경우에만 전달

    public Comment toEntity() {
        return Comment.builder()
                .userName(userName)
                .context(context)
                .replyCount(0)
                .status(STATUS.PUBLIC)
                .build();
    }
}
