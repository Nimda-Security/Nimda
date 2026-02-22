package com.nimda.cite.like.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class LikeStatusResponseDto {
    private long likeCount;     // 전체 좋아요 수
    private boolean isLiked;    // 현재 유저의 좋아요 여부
}