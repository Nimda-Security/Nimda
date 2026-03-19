package com.nimda.cite.like.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class CommentLikeResponse {
        private String message;     // "좋아요 완료" 또는 "좋아요 취소 완료"
        private Long likeCount;     // 변경된 후의 총 좋아요 수
        private Boolean isLiked;    // 현재 로그인한 유저의 좋아요 상태 (True/False)

    public static CommentLikeResponse of(String message, long likeCount, boolean isLiked) {
        return CommentLikeResponse.builder()
                .message(message)
                .likeCount(likeCount)
                .isLiked(isLiked)
                .build();
    }
}
