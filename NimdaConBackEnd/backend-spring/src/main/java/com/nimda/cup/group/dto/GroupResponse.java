package com.nimda.cup.group.dto;

import java.time.LocalDateTime;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class GroupResponse {

    private Long groupId;
    private String groupName;
    private Integer maxMembers;
    private Boolean isPublic;
    private String participationCode;
    private Long creatorUserId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
