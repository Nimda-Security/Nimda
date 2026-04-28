package com.nimda.cite.domain.point.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class ManualBalanceUpdateRequest {
    private String studentNum;
    private String description;
    private Long amount;
}
