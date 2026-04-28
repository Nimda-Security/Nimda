package com.nimda.cup.user.profiledecoration;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ProfileDecorationCreateRequest {
    private String key;
    private String label;
    private String filePath;
    private String requiredRole;
}
