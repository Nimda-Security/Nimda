package com.nimda.cup.group.dto;

import com.nimda.cup.group.enums.GroupRole;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class GroupMemberAddRequest {

    @NotNull(message = "사용자 ID는 필수입니다.")
    private Long userId;

    private GroupRole role = GroupRole.MEMBER;

    private String participationCode;
}
