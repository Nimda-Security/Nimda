package com.nimda.cite.point.dto;

import com.nimda.cite.point.entity.PointDetail;
import com.nimda.cite.point.entity.UserBalance;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class PointDetailResponse {
    // 생성일
    private LocalDateTime createdAt;
    // 포인트 변동
    private Long amount;
    // 만료 일시
    private LocalDateTime expiredAt;
    // 이후 포인트
    private Long remainingAmount;
    // 설명
    private String description;


    public static PointDetailResponse from(PointDetail e) {
        return PointDetailResponse.builder()
                .createdAt(e.getCreatedAt())
                .amount(e.getAmount())
                .expiredAt(e.getExpiredAt())
                .description(e.getDescription())
                .remainingAmount(e.getRemainingAmount())
                .build();
    }
}
