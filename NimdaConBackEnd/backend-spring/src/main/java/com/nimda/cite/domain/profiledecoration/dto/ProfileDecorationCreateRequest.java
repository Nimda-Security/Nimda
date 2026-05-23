package com.nimda.cite.domain.profiledecoration.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ProfileDecorationCreateRequest {
    private String key;
    private String label;
    private String filePath;
    private String requiredRole;
    private Boolean purchaseRequired;
}
