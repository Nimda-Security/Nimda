package judgeServer.domain.group.dto;

import judgeServer.domain.group.entity.Group;
import judgeServer.domain.groupMember.dto.GroupMemberResponse;
import lombok.*;

import java.util.List;

@Getter
@Builder
public class GroupDetailResponse {

    private Long id;

    private String name;

    private Integer capacity;

    private Integer currentMemberCount;

    private String description;

    private List<GroupMemberResponse> members;

    public static GroupDetailResponse from(Group group) {
        return GroupDetailResponse.builder()
                .id(group.getId())
                .name(group.getName())
                .capacity(group.getCapacity())
                .currentMemberCount(group.getMembers().size())
                .description(group.getDescription())
                .members(
                        group.getMembers()
                                .stream()
                                .map(GroupMemberResponse::from)
                                .toList()
                )
                .build();
    }

}
