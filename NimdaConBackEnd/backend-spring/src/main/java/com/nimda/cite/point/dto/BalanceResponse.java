package com.nimda.cite.point.dto;

import com.nimda.cite.point.entity.UserBalance;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class BalanceResponse {
    // 총액
    private Long totalAmount;
    // 최근 수정일
    private LocalDateTime updatedAt;

    public static BalanceResponse from(UserBalance entity) {
        return BalanceResponse.builder()
                .totalAmount(entity.getTotalAmount())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }
}
