package judgeServer.domain.groupMember.dto;

import judgeServer.domain.groupMember.entity.GroupMember;
import judgeServer.domain.groupMember.enums.MemberRole;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class GroupMemberResponse {

    private Long id;

    private Long userId;

    private String nickname;

    private MemberRole role;

    public static GroupMemberResponse from(GroupMember groupMember) {

        return GroupMemberResponse.builder()
                .id(groupMember.getId())
                .userId(groupMember.getUser().getId())
                .nickname(groupMember.getUser().getNickname())
                .role(groupMember.getRole())
                .build();
    }

}
