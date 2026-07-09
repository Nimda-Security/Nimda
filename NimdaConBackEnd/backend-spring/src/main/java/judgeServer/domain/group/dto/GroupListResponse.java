package judgeServer.domain.group.dto;

import judgeServer.domain.group.entity.Group;
import lombok.*;

@Getter
@Builder
public class GroupListResponse {

    private Long id;

    private String name;

    private Integer capacity;

    private Integer currentMemberCount;

    private String description;

    public static GroupListResponse from(Group group) {
        return GroupListResponse.builder()
                .id(group.getId())
                .name(group.getName())
                .capacity(group.getCapacity())
                .currentMemberCount(group.getMembers().size())
                .description(group.getDescription())
                .build();
    }

}
