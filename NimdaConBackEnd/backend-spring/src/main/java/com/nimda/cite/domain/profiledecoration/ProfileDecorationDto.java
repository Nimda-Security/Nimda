package com.nimda.cite.domain.profiledecoration;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class ProfileDecorationDto {
    private Long id;
    private String key;
    private String label;
    private String src;
    private String requiredRole;
    private boolean purchaseRequired;
    private boolean active;

    public static ProfileDecorationDto from(ProfileDecoration decoration) {
        return ProfileDecorationDto.builder()
                .id(decoration.getId())
                .key(decoration.getKey())
                .label(decoration.getLabel())
                .src("/api/cite/profile-decorations/" + decoration.getKey() + "/image")
                .requiredRole(decoration.getRequiredRole())
                .purchaseRequired(decoration.isPurchaseRequired())
                .active(decoration.isActive())
                .build();
    }
}
