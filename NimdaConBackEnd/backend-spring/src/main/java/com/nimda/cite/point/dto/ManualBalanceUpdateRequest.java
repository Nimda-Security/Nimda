package com.nimda.cite.point.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class ManualBalanceUpdateRequest {
    private Long userId;
    private String description;
    private Long amount;
}
