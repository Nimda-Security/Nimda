package com.nimda.cite.domain.point.dto;

import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
public class BulkBalanceUpdateRequest {
    private List<ManualBalanceUpdateRequest> updates;
}
