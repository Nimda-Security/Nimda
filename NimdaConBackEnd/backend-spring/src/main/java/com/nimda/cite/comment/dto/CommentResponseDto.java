package com.nimda.cite.comment.dto;

import com.nimda.cite.comment.entity.Comment;
import com.nimda.cite.comment.enums.STATUS;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;

@Getter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class CommentResponseDto {

    private String userName;
    private String context;
    private Integer replyCount;
    private STATUS status;
    private LocalDateTime createdAt;

    public static CommentResponseDto from(Comment comment) {
        return CommentResponseDto.builder()
                .userName(comment.getUserName())
                // 삭제된 상태일 때의 분기 처리를 DTO 레이어에서 할 수도 있습니다.
                .context(comment.getStatus() == STATUS.DELETE ? "삭제된 댓글입니다." : comment.getContext())
                .replyCount(comment.getReplyCount())
                .status(comment.getStatus())
                .createdAt(comment.getCreatedAt())
                .build();
    }
}
