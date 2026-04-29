package com.nimda.cite.domain.profiledecoration.dto;

import com.nimda.cite.domain.profiledecoration.entity.ProfileDecoration;
import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
public class ProfileDecorationDto {
    private Long id;
    private String key;
    private String label;
    private String src;
    private List<String> requiredRoles;
    private boolean active;

    public static ProfileDecorationDto from(ProfileDecoration decoration, List<String> requiredRoles) {
        return ProfileDecorationDto.builder()
                .id(decoration.getId())
                .key(decoration.getKey())
                .label(decoration.getLabel())
                .src("/api/profile-decorations/" + decoration.getKey() + "/image")
                .requiredRoles(requiredRoles)
                .active(decoration.isActive())
                .build();
    }
}
