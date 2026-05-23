package com.nimda.cite.domain.point.usage.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class PointUsageResponse {
    private Long boardId;
    private String itemName;
    private Long price;
    private Long remainingAmount;
    private String itemType;
    private String profileDecorationKey;
}
