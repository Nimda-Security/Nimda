package judgeServer.domain.groupJoinRequest.dto;

import judgeServer.domain.groupJoinRequest.entity.GroupJoinRequest;
import judgeServer.domain.groupJoinRequest.enums.JoinRequestStatus;
import judgeServer.domain.groupJoinRequest.enums.JoinType;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class GroupJoinRequestResponse {

    private Long id;

    private Long groupId;

    private String groupName;

    private Long userId;

    private String nickname;

    private JoinType joinType;

    private JoinRequestStatus status;

    public static GroupJoinRequestResponse from(GroupJoinRequest request) {
        return GroupJoinRequestResponse.builder()
                .id(request.getId())
                .groupId(request.getGroup().getId())
                .groupName(request.getGroup().getName())
                .userId(request.getUser().getId())
                .nickname(request.getUser().getNickname())
                .joinType(request.getJoinType())
                .status(request.getStatus())
                .build();
    }

}
