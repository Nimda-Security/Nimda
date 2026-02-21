package com.nimda.cite.like.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class CommentLikeResponseDto {
        private boolean success;    // 요청 성공 여부
        private String message;     // "좋아요 완료" 또는 "좋아요 취소 완료"
        private long likeCount;     // 변경된 후의 총 좋아요 수
        private boolean isLiked;    // 현재 로그인한 유저의 좋아요 상태 (True/False)

    public static CommentLikeResponseDto of(String message, long likeCount, boolean isLiked) {
        return CommentLikeResponseDto.builder().message(message).likeCount(likeCount).isLiked(isLiked).build();
    }
}
