package judgeServer.domain.groupJoinRequest.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class GroupJoinRequestIdResponse {

    private Long requestId;

    public static GroupJoinRequestIdResponse of(Long requestId) {
        return GroupJoinRequestIdResponse.builder()
                .requestId(requestId)
                .build();
    }

}
