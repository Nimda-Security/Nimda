package com.nimda.cite.point.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class ManualBalanceUpdateRequest {
    private String studentNum;
    private String description;
    private Long amount;
}
