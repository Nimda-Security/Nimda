package com.nimda.cite.like.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class BoardLikeResponse {
    private String message;     // "좋아요 완료" 또는 "좋아요 취소 완료"
    private long likeCount;     // 변경된 후의 총 좋아요 수
    private boolean isLiked;    // 현재 로그인한 유저의 좋아요 상태 (True/False)

    // 정적 팩토리 메서드
    public static BoardLikeResponse of(String message, long likeCount, boolean isLiked) {
        return BoardLikeResponse.builder()
                .message(message)
                .likeCount(likeCount)
                .isLiked(isLiked)
                .build();
    }
}
